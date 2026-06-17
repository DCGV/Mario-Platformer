import {
  PartnerTier,
  PartnerCategory,
  VettingStatus,
  RedemptionStatus,
  SubscriptionTier,
  SponsorStatus,
  DiscountType,
} from "@prisma/client";

export const TIER_LABELS: Record<PartnerTier, string> = {
  CLINICAL: "Clinical Partner",
  SUPPORTIVE: "Supportive",
  FINANCIAL: "Financial",
};

export const TIER_DESCRIPTIONS: Record<PartnerTier, string> = {
  CLINICAL: "Directly affects treatment outcomes",
  SUPPORTIVE: "Removes barriers to staying on therapy",
  FINANCIAL: "Reduces cost around the drug",
};

export const CATEGORY_LABELS: Record<PartnerCategory, string> = {
  DIETITIAN: "Dietitian",
  TELEHEALTH: "Telehealth",
  LAB: "Lab Testing",
  CGM: "CGM",
  TRANSPORT: "Transport",
  FITNESS: "Fitness",
  MEAL_KIT: "Meal Kit",
  MENTAL_HEALTH: "Mental Health",
  SLEEP: "Sleep",
  INJECTION_SUPPORT: "Injection Support",
  SAVINGS: "Savings",
  DEVICE: "Device",
  GI_RELIEF: "GI Relief",
  CAREGIVER: "Caregiver",
  PHARMACY: "Pharmacy",
  OTHER: "Other",
};

export const VETTING_STATUS_LABELS: Record<VettingStatus, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  UNDER_REVIEW: "Under Review",
};

export const REDEMPTION_STATUS_LABELS: Record<RedemptionStatus, string> = {
  CLICKED: "Clicked",
  CONVERTED: "Converted",
  COMMISSION_CONFIRMED: "Commission Confirmed",
  REJECTED: "Rejected",
};

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  FREE: "Free",
  PREMIUM: "Premium",
};

export const SPONSOR_STATUS_LABELS: Record<SponsorStatus, string> = {
  PROSPECT: "Prospect",
  IN_NEGOTIATION: "In Negotiation",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CHURNED: "Churned",
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENTAGE: "Percentage Off",
  FIXED_AMOUNT: "Fixed Amount Off",
  FREE_TRIAL: "Free Trial",
  FREE_CONSULTATION: "Free Consultation",
  FREE_ACCESS: "Free Access",
  OTHER: "Other",
};

export const GLP1_DRUG_OPTIONS = [
  "Ozempic",
  "Wegovy",
  "Mounjaro",
  "Zepbound",
  "Rybelsus",
  "Other",
] as const;

export const MEDICAL_DISCLAIMER =
  "Vela Health is not a medical provider. Benefits are curated for informational purposes. Always consult your healthcare provider before making treatment decisions.";
