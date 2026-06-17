import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { benefitSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const partnerId = searchParams.get("partnerId");
    const conditionSlug = searchParams.get("conditionSlug");

    let conditionId: string | undefined;
    if (conditionSlug) {
      const cond = await prisma.condition.findUnique({
        where: { slug: conditionSlug },
        select: { id: true },
      });
      conditionId = cond?.id;
    }

    const benefits = await prisma.benefit.findMany({
      where: {
        active: true,
        ...(partnerId ? { partnerId } : {}),
        ...(conditionId
          ? { conditions: { some: { conditionId } } }
          : {}),
      },
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
        partner: { select: { id: true, name: true, slug: true } },
      },
    });

    return apiSuccess(benefits);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const input = benefitSchema.parse(body);

    const partner = await prisma.partner.findUnique({
      where: { id: input.partnerId },
      select: { id: true },
    });

    if (!partner) {
      return apiError("NOT_FOUND", "Partner not found", 404);
    }

    const { conditionIds, discountValue, validFrom, validTo, ...benefitData } = input;

    const benefit = await prisma.benefit.create({
      data: {
        ...benefitData,
        discountValue: discountValue ?? null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        ctaPath: `/go/${input.partnerId}`,
        conditions: conditionIds?.length
          ? {
              create: conditionIds.map((conditionId) => ({ conditionId })),
            }
          : undefined,
      },
    });

    return apiSuccess(benefit);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
