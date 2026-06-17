import { RedemptionButton } from "./RedemptionButton";
import { DiscountType } from "@prisma/client";
import { DISCOUNT_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface BenefitCardProps {
  id: string;
  title: string;
  description: string;
  valueDescription: string;
  ctaText: string;
  discountType?: DiscountType | null;
  eligibilityNotes?: string | null;
  partnerName: string;
  isLoggedIn: boolean;
}

export function BenefitCard({
  id,
  title,
  description,
  valueDescription,
  ctaText,
  discountType,
  eligibilityNotes,
  partnerName,
  isLoggedIn,
}: BenefitCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 mb-0.5">{title}</p>
          <p className="text-[#0F5D58] font-medium text-sm">{valueDescription}</p>
        </div>
        {discountType && (
          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            {DISCOUNT_TYPE_LABELS[discountType]}
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

      {eligibilityNotes && (
        <p className="text-xs text-gray-400 italic">* {eligibilityNotes}</p>
      )}

      <RedemptionButton
        benefitId={id}
        partnerName={partnerName}
        ctaText={ctaText}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
