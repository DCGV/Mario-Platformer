import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TIER_LABELS } from "@/lib/constants";
import { PartnerTier } from "@prisma/client";

interface AnalyticsOverviewProps {
  totalUsers: number;
  newUsersThisWeek: number;
  totalRedemptions: number;
  redemptionsThisWeek: number;
  topPartners: {
    partner: { id: string; name: string; tier: PartnerTier } | undefined;
    clickCount: number;
    conversionCount: number;
  }[];
  conditionBreakdown: { condition: string; userCount: number }[];
}

export function AnalyticsOverview({
  totalUsers,
  newUsersThisWeek,
  totalRedemptions,
  redemptionsThisWeek,
  topPartners,
  conditionBreakdown,
}: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total users" value={totalUsers} delta={`+${newUsersThisWeek} this week`} />
        <StatCard label="New users (7d)" value={newUsersThisWeek} />
        <StatCard label="Total redemptions" value={totalRedemptions} delta={`+${redemptionsThisWeek} this week`} />
        <StatCard label="Redemptions (7d)" value={redemptionsThisWeek} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top partners by clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPartners.filter((r) => r.partner).map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-4 text-xs">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-900">{r.partner!.name}</p>
                      <p className="text-xs text-gray-400">{TIER_LABELS[r.partner!.tier]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0F5D58]">{r.clickCount}</p>
                    {r.conversionCount > 0 && (
                      <p className="text-xs text-green-600">{r.conversionCount} converted</p>
                    )}
                  </div>
                </div>
              ))}
              {topPartners.length === 0 && (
                <p className="text-sm text-gray-400">No data yet</p>
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
              {conditionBreakdown.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <p className="text-gray-900">{c.condition}</p>
                  <span className="font-semibold text-[#0F5D58]">{c.userCount}</span>
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

function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {delta && <p className="text-xs text-gray-400 mt-1">{delta}</p>}
    </div>
  );
}
