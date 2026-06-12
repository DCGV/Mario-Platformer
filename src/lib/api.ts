import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T>(data: T, meta?: { total?: number; page?: number }) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

export function handleZodError(error: ZodError) {
  return apiError("VALIDATION_ERROR", "Invalid request data", 400, error.flatten());
}

export function handleServerError(error: unknown) {
  console.error(error);
  return apiError("INTERNAL_ERROR", "An unexpected error occurred", 500);
}

// Strips sensitive partner fields from client-facing responses
export const PARTNER_PUBLIC_SELECT = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  description: true,
  logoUrl: true,
  heroImageUrl: true,
  websiteUrl: true,
  tier: true,
  category: true,
  vettingStatus: true,
  isFeatured: true,
  featuredBadge: true,
  displayOrder: true,
  active: true,
  createdAt: true,
  // Excluded: affiliateBaseUrl, commissionRate, vettingScore, vettingNotes, vettedBy, vettedAt
} as const;
