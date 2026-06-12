import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { PartnerCard } from "@/components/partner/PartnerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabaseUser = await requireAuth();
  const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

  if (!user.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  const condition = user.conditionId
    ? await prisma.condition.findUnique({
        where: { id: user.conditionId },
        select: { id: true, name: true, slug: true, tagline: true },
      })
    : null;

  const featuredPartners = condition
    ? await prisma.partner.findMany({
        where: {
          active: true,
          vettingStatus: "APPROVED",
          conditions: { some: { conditionId: condition.id } },
          isFeatured: true,
        },
        take: 6,
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          logoUrl: true,
          tier: true,
          category: true,
          isFeatured: true,
          featuredBadge: true,
          benefits: {
            where: { active: true },
            take: 1,
            select: { valueDescription: true, ctaText: true },
          },
        },
      })
    : [];

  const recentRedemptions = await prisma.redemption.count({
    where: { userId: user.id },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Cambria, serif" }}
        >
          {user.firstName ? `Welcome back, ${user.firstName}` : "Your Benefits Hub"}
        </h1>
        {condition && (
          <p className="text-gray-500 text-sm mt-1">{condition.tagline ?? condition.name}</p>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Benefits explored"
          value={String(recentRedemptions)}
        />
        {condition && (
          <StatCard label="Your condition" value={condition.name} />
        )}
        <StatCard label="Status" value="Active" highlight />
      </div>

      {/* Featured benefits */}
      {featuredPartners.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Featured benefits for you
            </h2>
            {condition && (
              <Button asChild variant="link" size="sm">
                <Link href={`/hub/${condition.slug}`}>View all</Link>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPartners.map((p) => (
              <PartnerCard
                key={p.id}
                {...p}
                benefit={p.benefits[0]}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="Your hub is being curated"
          description="We're adding vetted partners for your condition. Check back soon."
          action={
            condition && (
              <Button asChild>
                <Link href={`/hub/${condition.slug}`}>Browse all benefits</Link>
              </Button>
            )
          }
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "bg-[#0F5D58] border-[#0F5D58] text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${highlight ? "text-white/70" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`text-lg font-bold ${highlight ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
