import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const partnerId = searchParams.get("partnerId");

    const redemptions = await prisma.redemption.findMany({
      where: {
        ...(from ? { clickedAt: { gte: new Date(from) } } : {}),
        ...(to ? { clickedAt: { lte: new Date(to) } } : {}),
        ...(partnerId ? { partnerId } : {}),
      },
      orderBy: { clickedAt: "desc" },
      take: 200,
      select: {
        id: true,
        referralCode: true,
        clickedAt: true,
        convertedAt: true,
        conversionValue: true,
        status: true,
        // User: id only for privacy
        user: { select: { id: true } },
        benefit: { select: { id: true, title: true } },
        partner: { select: { id: true, name: true, slug: true } },
      },
    });

    return apiSuccess(redemptions);
  } catch (err) {
    return handleServerError(err);
  }
}
