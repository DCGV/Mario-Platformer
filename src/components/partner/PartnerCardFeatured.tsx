import { PartnerTier, PartnerCategory } from "@prisma/client";
import { TierBadge } from "./TierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface PartnerCardFeaturedProps {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tier: PartnerTier;
  category: PartnerCategory;
  featuredBadge?: string | null;
  benefit?: {
    valueDescription: string;
    ctaText: string;
  };
}

export function PartnerCardFeatured({
  slug,
  name,
  tagline,
  description,
  logoUrl,
  heroImageUrl,
  tier,
  featuredBadge,
  benefit,
}: PartnerCardFeaturedProps) {
  return (
    <div className="rounded-2xl border-2 border-[#5EEAD4]/40 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {heroImageUrl && (
        <div className="h-32 relative bg-gradient-to-br from-[#0F5D58] to-[#0a4440]">
          <Image
            src={heroImageUrl}
            alt={`${name} hero`}
            fill
            className="object-cover opacity-30"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {logoUrl ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#0F5D58]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#0F5D58] font-bold text-xl">{name[0]}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
              {featuredBadge && (
                <Badge variant="secondary" className="text-xs">
                  {featuredBadge}
                </Badge>
              )}
            </div>
            <TierBadge tier={tier} />
          </div>
        </div>

        {tagline && (
          <p className="text-sm font-medium text-gray-700 mb-2">{tagline}</p>
        )}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{description}</p>

        {benefit && (
          <div className="bg-[#0F5D58]/5 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-[#0F5D58]">
              {benefit.valueDescription}
            </p>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={`/partners/${slug}`}>
            {benefit?.ctaText ?? "See benefits"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
