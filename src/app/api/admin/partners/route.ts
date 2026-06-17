import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError, handleZodError } from "@/lib/api";
import { partnerSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { VettingStatus } from "@prisma/client";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as VettingStatus | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 20;

    const where = status ? { vettingStatus: status } : {};

    const [total, partners] = await Promise.all([
      prisma.partner.count({ where }),
      prisma.partner.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          tier: true,
          category: true,
          vettingStatus: true,
          vettingScore: true,
          vettingNotes: true,
          isFeatured: true,
          active: true,
          createdAt: true,
          websiteUrl: true,
          commissionRate: true,
        },
      }),
    ]);

    return apiSuccess(partners, { total, page });
  } catch (err) {
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const input = partnerSchema.parse(body);

    const { conditionIds, commissionRate, ...partnerData } = input;

    const partner = await prisma.partner.create({
      data: {
        ...partnerData,
        commissionRate: commissionRate ?? null,
        conditions: conditionIds?.length
          ? {
              create: conditionIds.map((conditionId) => ({ conditionId })),
            }
          : undefined,
      },
    });

    await createAuditLog({
      adminId: admin.id,
      action: "PARTNER_CREATED",
      entityType: "Partner",
      entityId: partner.id,
      metadata: { name: partner.name },
    });

    return apiSuccess(partner);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
