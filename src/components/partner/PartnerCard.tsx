import { PartnerTier, PartnerCategory } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "./TierBadge";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PartnerCardProps {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  tier: PartnerTier;
  category: PartnerCategory;
  isFeatured: boolean;
  featuredBadge?: string | null;
  benefit?: {
    valueDescription: string;
    ctaText: string;
  };
}

export function PartnerCard({
  slug,
  name,
  tagline,
  logoUrl,
  tier,
  isFeatured,
  featuredBadge,
  benefit,
}: PartnerCardProps) {
  return (
    <Link href={`/partners/${slug}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image
                    src={logoUrl}
                    alt={`${name} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#0F5D58]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0F5D58] font-bold text-sm">
                    {name[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#0F5D58] transition-colors">
                  {name}
                </h3>
                {tagline && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {tagline}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {isFeatured && featuredBadge && (
                <Badge variant="secondary" className="text-xs">
                  {featuredBadge}
                </Badge>
              )}
              <TierBadge tier={tier} />
            </div>
          </div>

          {benefit && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-[#0F5D58]">
                {benefit.valueDescription}
              </p>
              <p className="text-xs text-gray-500 mt-1">{benefit.ctaText}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
