import { PartnerTier } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<PartnerTier, string> = {
  CLINICAL: "bg-[#0F5D58] text-white",
  SUPPORTIVE: "bg-[#5EEAD4] text-[#0F5D58]",
  FINANCIAL: "bg-blue-100 text-blue-700",
};

interface TierBadgeProps {
  tier: PartnerTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <Badge className={cn(TIER_STYLES[tier], className)}>
      {TIER_LABELS[tier]}
    </Badge>
  );
}
