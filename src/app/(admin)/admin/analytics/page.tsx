import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIER_LABELS } from "@/lib/constants";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    totalRedemptions,
    weekRedemptions,
    conditionBreakdown,
    topPartnersRaw,
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
  ]);

  const [conditionNames, partnerDetails] = await Promise.all([
    prisma.condition.findMany({
      where: {
        id: {
          in: conditionBreakdown
            .map((c) => c.conditionId)
            .filter((id): id is string => id !== null),
        },
      },
      select: { id: true, name: true },
    }),
    prisma.partner.findMany({
      where: { id: { in: topPartnersRaw.map((r) => r.partnerId) } },
      select: { id: true, name: true, tier: true },
    }),
  ]);

  const conditionMap = Object.fromEntries(conditionNames.map((c) => [c.id, c.name]));
  const partnerMap = Object.fromEntries(partnerDetails.map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "Cambria, serif" }}>
        Analytics Overview
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total users", value: totalUsers },
          { label: "New (7d)", value: newUsers },
          { label: "Total redemptions", value: totalRedemptions },
          { label: "Redemptions (7d)", value: weekRedemptions },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top partners by clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPartnersRaw.map((r, i) => {
                const partner = partnerMap[r.partnerId];
                return partner ? (
                  <div key={r.partnerId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-4">{i + 1}.</span>
                      <div>
                        <p className="font-medium text-gray-900">{partner.name}</p>
                        <p className="text-xs text-gray-400">{TIER_LABELS[partner.tier]}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#0F5D58]">{r._count.id}</span>
                  </div>
                ) : null;
              })}
              {topPartnersRaw.length === 0 && (
                <p className="text-sm text-gray-400">No redemptions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conditionBreakdown.map((c) => (
                <div key={c.conditionId} className="flex items-center justify-between text-sm">
                  <p className="text-gray-900">
                    {conditionMap[c.conditionId!] ?? "Unknown"}
                  </p>
                  <span className="font-semibold text-[#0F5D58]">{c._count.id}</span>
                </div>
              ))}
              {conditionBreakdown.length === 0 && (
                <p className="text-sm text-gray-400">No users with conditions set</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
