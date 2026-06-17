import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, PARTNER_PUBLIC_SELECT } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const partner = await prisma.partner.findUnique({
      where: { slug, active: true },
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
        conditions: {
          select: {
            condition: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!partner) {
      return apiError("NOT_FOUND", "Partner not found", 404);
    }

    return apiSuccess(partner);
  } catch (err) {
    return handleServerError(err);
  }
}
