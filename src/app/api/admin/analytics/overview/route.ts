import { apiSuccess, handleServerError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisWeek,
      totalRedemptions,
      redemptionsThisWeek,
      conditionBreakdown,
    ] = await Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.redemption.count(),
      prisma.redemption.count({ where: { clickedAt: { gte: weekAgo } } }),
      prisma.user.groupBy({
        by: ["conditionId"],
        _count: { id: true },
        where: { conditionId: { not: null } },
      }),
    ]);

    const conditionIds = conditionBreakdown
      .map((c) => c.conditionId)
      .filter((id): id is string => id !== null);

    const conditions = await prisma.condition.findMany({
      where: { id: { in: conditionIds } },
      select: { id: true, name: true },
    });

    const conditionMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

    const topPartners = await prisma.redemption.groupBy({
      by: ["partnerId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const partnerIds = topPartners.map((r) => r.partnerId);
    const partners = await prisma.partner.findMany({
      where: { id: { in: partnerIds } },
      select: { id: true, name: true, slug: true },
    });
    const partnerMap = Object.fromEntries(partners.map((p) => [p.id, p]));

    const conversions = await prisma.redemption.groupBy({
      by: ["partnerId"],
      _count: { id: true },
      where: { status: "CONVERTED", partnerId: { in: partnerIds } },
    });
    const conversionMap = Object.fromEntries(
      conversions.map((c) => [c.partnerId, c._count.id])
    );

    return apiSuccess({
      totalUsers,
      newUsersThisWeek,
      totalRedemptions,
      redemptionsThisWeek,
      topPartners: topPartners.map((r) => ({
        partner: partnerMap[r.partnerId],
        clickCount: r._count.id,
        conversionCount: conversionMap[r.partnerId] ?? 0,
      })),
      conditionBreakdown: conditionBreakdown.map((c) => ({
        condition: conditionMap[c.conditionId!] ?? "Unknown",
        userCount: c._count.id,
      })),
    });
  } catch (err) {
    return handleServerError(err);
  }
}
