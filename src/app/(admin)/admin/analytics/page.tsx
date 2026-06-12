import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { RedemptionTable } from "@/components/admin/RedemptionTable";
import { RedemptionStatus } from "@prisma/client";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisWeek,
    totalRedemptions,
    redemptionsThisWeek,
    conditionBreakdown,
    topPartnersRaw,
    recentRedemptions,
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
    prisma.redemption.groupBy({
      by: ["partnerId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.redemption.findMany({
      orderBy: { clickedAt: "desc" },
      take: 50,
      select: {
        id: true,
        referralCode: true,
        clickedAt: true,
        convertedAt: true,
        conversionValue: true,
        status: true,
        user: { select: { id: true } },
        benefit: { select: { id: true, title: true } },
        partner: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  const conditionIds = conditionBreakdown
    .map((c) => c.conditionId)
    .filter((id): id is string => id !== null);

  const [conditionNames, partnerDetails, conversionCounts] = await Promise.all([
    prisma.condition.findMany({
      where: { id: { in: conditionIds } },
      select: { id: true, name: true },
    }),
    prisma.partner.findMany({
      where: { id: { in: topPartnersRaw.map((r) => r.partnerId) } },
      select: { id: true, name: true, tier: true },
    }),
    prisma.redemption.groupBy({
      by: ["partnerId"],
      _count: { id: true },
      where: {
        status: "CONVERTED",
        partnerId: { in: topPartnersRaw.map((r) => r.partnerId) },
      },
    }),
  ]);

  const conditionMap = Object.fromEntries(conditionNames.map((c) => [c.id, c.name]));
  const partnerMap = Object.fromEntries(partnerDetails.map((p) => [p.id, p]));
  const conversionMap = Object.fromEntries(conversionCounts.map((c) => [c.partnerId, c._count.id]));

  const topPartners = topPartnersRaw.map((r) => ({
    partner: partnerMap[r.partnerId],
    clickCount: r._count.id,
    conversionCount: conversionMap[r.partnerId] ?? 0,
  }));

  const conditionBreakdownFormatted = conditionBreakdown.map((c) => ({
    condition: conditionMap[c.conditionId!] ?? "Unknown",
    userCount: c._count.id,
  }));

  // Adapt recentRedemptions for RedemptionTable
  const tableRedemptions = recentRedemptions.map((r) => ({
    ...r,
    status: r.status as RedemptionStatus,
    conversionValue: r.conversionValue ? Number(r.conversionValue) : null,
  }));

  return (
    <div>
      <h1
        className="text-2xl font-bold text-gray-900 mb-8"
        style={{ fontFamily: "Cambria, serif" }}
      >
        Analytics Overview
      </h1>

      <AnalyticsOverview
        totalUsers={totalUsers}
        newUsersThisWeek={newUsersThisWeek}
        totalRedemptions={totalRedemptions}
        redemptionsThisWeek={redemptionsThisWeek}
        topPartners={topPartners}
        conditionBreakdown={conditionBreakdownFormatted}
      />

      <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent redemptions</h2>
          <span className="text-xs text-gray-400">Last 50</span>
        </div>
        <RedemptionTable redemptions={tableRedemptions} />
      </div>
    </div>
  );
}
