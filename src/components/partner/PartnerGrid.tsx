import { PartnerTier, PartnerCategory } from "@prisma/client";
import { PartnerCard } from "./PartnerCard";
import { PartnerCardFeatured } from "./PartnerCardFeatured";
import { EmptyState } from "@/components/shared/EmptyState";

interface Partner {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tier: PartnerTier;
  category: PartnerCategory;
  isFeatured: boolean;
  featuredBadge?: string | null;
  benefits: { valueDescription: string; ctaText: string }[];
}

interface PartnerGridProps {
  partners: Partner[];
  emptyMessage?: string;
}

export function PartnerGrid({ partners, emptyMessage }: PartnerGridProps) {
  if (partners.length === 0) {
    return (
      <EmptyState
        title={emptyMessage ?? "No partners found"}
        description="Try removing filters to see all available benefits."
      />
    );
  }

  const featured = partners.filter((p) => p.isFeatured);
  const standard = partners.filter((p) => !p.isFeatured);

  return (
    <div className="space-y-8">
      {featured.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Featured
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featured.map((p) => (
              <PartnerCardFeatured
                key={p.id}
                {...p}
                benefit={p.benefits[0]}
              />
            ))}
          </div>
        </div>
      )}

      {standard.length > 0 && (
        <div>
          {featured.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              All partners
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {standard.map((p) => (
              <PartnerCard key={p.id} {...p} benefit={p.benefits[0]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
