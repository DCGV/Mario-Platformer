import { BenefitCard } from "./BenefitCard";
import { DiscountType } from "@prisma/client";

interface Benefit {
  id: string;
  title: string;
  description: string;
  valueDescription: string;
  ctaText: string;
  discountType?: DiscountType | null;
  eligibilityNotes?: string | null;
}

interface BenefitListProps {
  benefits: Benefit[];
  partnerName: string;
  isLoggedIn: boolean;
}

export function BenefitList({ benefits, partnerName, isLoggedIn }: BenefitListProps) {
  if (benefits.length === 0) return null;

  return (
    <div className="space-y-4">
      {benefits.map((benefit) => (
        <BenefitCard
          key={benefit.id}
          {...benefit}
          partnerName={partnerName}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}
