import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { PartnerGrid } from "@/components/partner/PartnerGrid";
import { CategoryFilter } from "@/components/partner/CategoryFilter";
import { HubHero } from "@/components/hub/HubHero";
import { ConditionSelector } from "@/components/hub/ConditionSelector";
import { PartnerTier, PartnerCategory } from "@prisma/client";

interface HubPageProps {
  params: Promise<{ conditionSlug: string }>;
  searchParams: Promise<{ tier?: string; category?: string }>;
}

export default async function HubPage({ params, searchParams }: HubPageProps) {
  await requireAuth();

  const { conditionSlug } = await params;
  const { tier, category } = await searchParams;

  const [condition, allConditions] = await Promise.all([
    prisma.condition.findUnique({
      where: { slug: conditionSlug, active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        tagline: true,
        heroImageUrl: true,
      },
    }),
    prisma.condition.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true, active: true },
    }),
  ]);

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
      description: true,
      logoUrl: true,
      heroImageUrl: true,
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

  const availableTiers = [...new Set(partners.map((p) => p.tier))];
  const availableCategories = [...new Set(partners.map((p) => p.category))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <HubHero
        conditionName={condition.name}
        tagline={condition.tagline}
        heroImageUrl={condition.heroImageUrl}
        partnerCount={partners.length}
      />

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <CategoryFilter
          availableCategories={availableCategories}
          availableTiers={availableTiers}
        />
        <ConditionSelector
          conditions={allConditions}
          currentSlug={conditionSlug}
        />
      </div>

      <PartnerGrid
        partners={partners}
        emptyMessage="No partners match this filter"
      />
    </div>
  );
}
