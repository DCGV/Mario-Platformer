import { z } from "zod";
import { PartnerTier, PartnerCategory, VettingStatus, DiscountType } from "@prisma/client";

export const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  conditionInterest: z.string().optional(),
  source: z.string().optional(),
});

export const redemptionSchema = z.object({
  benefitId: z.string().cuid("Invalid benefit ID"),
});

export const userProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code").optional(),
  drugName: z.string().max(100).optional(),
  treatmentStart: z.string().datetime().optional(),
  conditionId: z.string().cuid().optional(),
});

export const partnerSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  tagline: z.string().max(200).optional(),
  description: z.string().min(1),
  logoUrl: z.string().url().optional().or(z.literal("")),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid website URL"),
  affiliateBaseUrl: z.string().url().optional().or(z.literal("")),
  tier: z.nativeEnum(PartnerTier),
  category: z.nativeEnum(PartnerCategory),
  commissionRate: z.number().min(0).max(1).optional(),
  isFeatured: z.boolean().optional(),
  featuredBadge: z.string().max(50).optional(),
  displayOrder: z.number().int().optional(),
  conditionIds: z.array(z.string().cuid()).optional(),
});

export const vettingSchema = z.object({
  vettingStatus: z.nativeEnum(VettingStatus),
  vettingScore: z
    .object({
      clinicalRelevance: z.number().int().min(1).max(5),
      evidenceBase: z.number().int().min(1).max(5),
      patientSafety: z.number().int().min(1).max(5),
      businessIntegrity: z.number().int().min(1).max(5),
      notes: z.string(),
    })
    .optional(),
  vettingNotes: z.string().optional(),
});

export const benefitSchema = z.object({
  partnerId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  valueDescription: z.string().min(1).max(200),
  ctaText: z.string().max(50).optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.number().positive().optional(),
  eligibilityNotes: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  conditionIds: z.array(z.string().cuid()).optional(),
});

export const affiliateWebhookSchema = z.object({
  referralCode: z.string().min(1),
  orderValue: z.number().positive().optional(),
  status: z.enum(["converted", "rejected"]),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type RedemptionInput = z.infer<typeof redemptionSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type VettingInput = z.infer<typeof vettingSchema>;
export type BenefitInput = z.infer<typeof benefitSchema>;
