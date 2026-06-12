import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, PARTNER_PUBLIC_SELECT } from "@/lib/api";
import { PartnerTier, PartnerCategory } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = req.nextUrl;

  const tier = searchParams.get("tier") as PartnerTier | null;
  const category = searchParams.get("category") as PartnerCategory | null;
  const featured = searchParams.get("featured") === "true";

  try {
    const condition = await prisma.condition.findUnique({
      where: { slug, active: true },
      select: { id: true },
    });

    if (!condition) {
      return apiError("NOT_FOUND", "Condition not found", 404);
    }

    const partners = await prisma.partner.findMany({
      where: {
        active: true,
        vettingStatus: "APPROVED",
        conditions: { some: { conditionId: condition.id } },
        ...(tier ? { tier } : {}),
        ...(category ? { category } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
      select: {
        ...PARTNER_PUBLIC_SELECT,
        benefits: {
          where: { active: true },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            valueDescription: true,
            ctaText: true,
            ctaPath: true,
            discountType: true,
            discountValue: true,
            eligibilityNotes: true,
            validFrom: true,
            validTo: true,
          },
        },
      },
    });

    return apiSuccess(partners);
  } catch (err) {
    return handleServerError(err);
  }
}
