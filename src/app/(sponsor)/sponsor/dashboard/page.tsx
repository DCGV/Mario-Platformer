import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SponsorDashboardPage() {
  const supabaseUser = await requireAuth();

  // Find sponsor by contact email
  const sponsor = await prisma.sponsor.findFirst({
    where: { contactEmail: supabaseUser.email! },
    select: {
      id: true,
      companyName: true,
      pilotStart: true,
      pilotEnd: true,
      analyticsAccess: true,
      status: true,
      placements: {
        where: { active: true },
        select: {
          partnerId: true,
          partner: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!sponsor || !sponsor.analyticsAccess) {
    redirect("/dashboard");
  }

  const now = new Date();
  const periodStart = sponsor.pilotStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = sponsor.pilotEnd ?? now;

  const partnerIds = sponsor.placements
    .map((p) => p.partnerId)
    .filter((id): id is string => id !== null);

  // Redemption data — no PII
  const [totalClicks, totalConversions, conditionClicks, topBenefits] =
    await Promise.all([
      prisma.redemption.count({
        where: {
          partnerId: { in: partnerIds },
          clickedAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      prisma.redemption.count({
        where: {
          partnerId: { in: partnerIds },
          status: "CONVERTED",
          clickedAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      prisma.redemption.groupBy({
        by: ["partnerId"],
        _count: { id: true },
        where: {
          partnerId: { in: partnerIds },
          clickedAt: { gte: periodStart, lte: periodEnd },
        },
      }),
      prisma.redemption.groupBy({
        by: ["benefitId"],
        _count: { id: true },
        where: {
          partnerId: { in: partnerIds },
          clickedAt: { gte: periodStart, lte: periodEnd },
        },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

  const benefitIds = topBenefits.map((b) => b.benefitId);
  const benefitDetails = await prisma.benefit.findMany({
    where: { id: { in: benefitIds } },
    select: { id: true, title: true },
  });
  const benefitMap = Object.fromEntries(benefitDetails.map((b) => [b.id, b.title]));

  const totalUniquePatients = await prisma.redemption
    .findMany({
      where: {
        partnerId: { in: partnerIds },
        clickedAt: { gte: periodStart, lte: periodEnd },
      },
      distinct: ["userId"],
      select: { userId: true },
    })
    .then((rows) => rows.length);

  const conversionRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-gray-900 mb-1"
          style={{ fontFamily: "Cambria, serif" }}
        >
          {sponsor.companyName} — Analytics
        </h1>
        <p className="text-sm text-gray-500">
          {periodStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })} –{" "}
          {periodEnd.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Unique patients" value={totalUniquePatients} />
        <KpiCard label="Total clicks" value={totalClicks} />
        <KpiCard label="Conversions" value={totalConversions} />
        <KpiCard label="Conversion rate" value={`${conversionRate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top benefits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top benefits</h2>
          <div className="space-y-3">
            {topBenefits.map((b) => (
              <div key={b.benefitId} className="flex items-center justify-between text-sm">
                <p className="text-gray-700 truncate flex-1 pr-2">
                  {benefitMap[b.benefitId] ?? "—"}
                </p>
                <span className="font-semibold text-[#0F5D58] flex-shrink-0">
                  {b._count.id} clicks
                </span>
              </div>
            ))}
            {topBenefits.length === 0 && (
              <p className="text-sm text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        {/* Active placements */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Active placements</h2>
          <div className="space-y-2">
            {sponsor.placements.map((pl, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#5EEAD4] flex-shrink-0" />
                <p className="text-gray-700">{pl.partner?.name ?? "General placement"}</p>
              </div>
            ))}
            {sponsor.placements.length === 0 && (
              <p className="text-sm text-gray-400">No active placements</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Data shown is aggregate and anonymized. No individual patient data is
        accessible through this portal. Last updated: {new Date().toLocaleString()}.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
