import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PartnerCard } from "@/components/partner/PartnerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TierBadge } from "@/components/partner/TierBadge";
import { CATEGORY_LABELS } from "@/lib/constants";
import { PartnerTier, PartnerCategory } from "@prisma/client";

interface HubPageProps {
  params: Promise<{ conditionSlug: string }>;
  searchParams: Promise<{ tier?: string; category?: string }>;
}

export default async function HubPage({ params, searchParams }: HubPageProps) {
  await requireAuth();

  const { conditionSlug } = await params;
  const { tier, category } = await searchParams;

  const condition = await prisma.condition.findUnique({
    where: { slug: conditionSlug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      tagline: true,
      heroImageUrl: true,
    },
  });

  if (!condition) notFound();

  const partners = await prisma.partner.findMany({
    where: {
      active: true,
      vettingStatus: "APPROVED",
      conditions: { some: { conditionId: condition.id } },
      ...(tier ? { tier: tier as PartnerTier } : {}),
      ...(category ? { category: category as PartnerCategory } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
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
  });

  const tierCounts = await prisma.partner.groupBy({
    by: ["tier"],
    where: {
      active: true,
      vettingStatus: "APPROVED",
      conditions: { some: { conditionId: condition.id } },
    },
    _count: { id: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Cambria, serif" }}
        >
          {condition.name} Benefits Hub
        </h1>
        {condition.tagline && (
          <p className="text-gray-500">{condition.tagline}</p>
        )}
      </div>

      {/* Tier pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["CLINICAL", "SUPPORTIVE", "FINANCIAL"] as PartnerTier[]).map((t) => {
          const count = tierCounts.find((tc) => tc.tier === t)?._count.id ?? 0;
          if (count === 0) return null;
          return (
            <a
              key={t}
              href={`?tier=${tier === t ? "" : t}`}
              className="flex items-center gap-2"
            >
              <TierBadge
                tier={t}
                className={tier === t ? "ring-2 ring-[#0F5D58] ring-offset-1" : ""}
              />
              <span className="text-xs text-gray-500">({count})</span>
            </a>
          );
        })}
        {tier && (
          <a href="?" className="text-xs text-gray-400 hover:text-gray-600 self-center">
            Clear filter
          </a>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
          const isActive = category === cat;
          const hasPartners = partners.some((p) => p.category === cat || category === cat);
          if (!hasPartners && !isActive) return null;
          return (
            <a
              key={cat}
              href={`?${tier ? `tier=${tier}&` : ""}category=${isActive ? "" : cat}`}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                isActive
                  ? "bg-[#0F5D58] text-white border-[#0F5D58]"
                  : "border-gray-200 text-gray-600 hover:border-[#0F5D58]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* Partner grid */}
      {partners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <PartnerCard key={p.id} {...p} benefit={p.benefits[0]} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No partners match this filter"
          description="Try removing filters to see all benefits."
        />
      )}
    </div>
  );
}
