import { EventType } from "@prisma/client";

export type AnalyticsProperties = {
  conditionSlug?: string;
  partnerSlug?: string;
  benefitId?: string;
  source?: string;
};

// Client-side PostHog event (called after consent)
export function trackEvent(
  eventType: EventType,
  properties: AnalyticsProperties
): void {
  if (typeof window === "undefined") return;

  try {
    // PostHog loaded dynamically to respect consent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ph = (window as any).posthog;
    if (ph) {
      ph.capture(eventType.toLowerCase(), properties);
    }
  } catch {
    // Non-blocking — analytics must never break the app
  }
}

// Server-side DB event (fire-and-forget)
export async function logAnalyticsEvent(
  eventType: EventType,
  data: {
    sessionId?: string;
    userId?: string;
    conditionId?: string;
    partnerId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        sessionId: data.sessionId,
        userId: data.userId,
        conditionId: data.conditionId,
        partnerId: data.partnerId,
        metadata: data.metadata as import("@prisma/client").Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Non-blocking
  }
}
