import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers,
    pendingPartners,
    totalRedemptions,
    thisWeekRedemptions,
  ] = await Promise.all([
    prisma.user.count({ where: { active: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.partner.count({ where: { vettingStatus: "PENDING" } }),
    prisma.redemption.count(),
    prisma.redemption.count({ where: { clickedAt: { gte: weekAgo } } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Cambria, serif" }}>
          Admin Dashboard
        </h1>
        <Button asChild>
          <Link href="/admin/partners/new">+ Add partner</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard label="New this week" value={newUsers} />
        <StatCard label="Total redemptions" value={totalRedemptions} />
        <StatCard label="Redemptions (7d)" value={thisWeekRedemptions} />
      </div>

      {pendingPartners > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-yellow-800 text-sm font-medium">
            {pendingPartners} partner{pendingPartners !== 1 ? "s" : ""} awaiting vetting
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/partners?status=PENDING">Review queue</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/partners" className="block text-sm text-[#0F5D58] hover:underline">
              → Partner management
            </Link>
            <Link href="/admin/analytics" className="block text-sm text-[#0F5D58] hover:underline">
              → Analytics overview
            </Link>
            <Link href="/admin/sponsors" className="block text-sm text-[#0F5D58] hover:underline">
              → Sponsor CRM
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
