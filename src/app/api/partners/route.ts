import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError, PARTNER_PUBLIC_SELECT } from "@/lib/api";
import { PartnerTier, PartnerCategory } from "@prisma/client";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const conditionSlug = searchParams.get("conditionSlug");
  const tier = searchParams.get("tier") as PartnerTier | null;
  const category = searchParams.get("category") as PartnerCategory | null;
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10)
  );

  try {
    let conditionId: string | undefined;
    if (conditionSlug) {
      const cond = await prisma.condition.findUnique({
        where: { slug: conditionSlug },
        select: { id: true },
      });
      conditionId = cond?.id;
    }

    const where = {
      active: true,
      vettingStatus: "APPROVED" as const,
      ...(conditionId
        ? { conditions: { some: { conditionId } } }
        : {}),
      ...(tier ? { tier } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { tagline: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, partners] = await Promise.all([
      prisma.partner.count({ where }),
      prisma.partner.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
        select: {
          ...PARTNER_PUBLIC_SELECT,
          benefits: {
            where: { active: true },
            select: {
              id: true,
              title: true,
              valueDescription: true,
              ctaText: true,
              ctaPath: true,
              discountType: true,
            },
          },
        },
      }),
    ]);

    return apiSuccess(partners, { total, page });
  } catch (err) {
    return handleServerError(err);
  }
}
