import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildAffiliateUrl, hashIp } from "@/lib/affiliate";
import { logAnalyticsEvent } from "@/lib/analytics";
import { EventType } from "@prisma/client";

const FALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=benefit_unavailable`
  : "/dashboard?error=benefit_unavailable";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ benefitId: string }> }
) {
  const { benefitId } = await params;
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  try {
    const benefit = await prisma.benefit.findUnique({
      where: { id: benefitId, active: true },
      select: {
        id: true,
        active: true,
        validFrom: true,
        validTo: true,
        partner: {
          select: {
            id: true,
            affiliateBaseUrl: true,
            websiteUrl: true,
            active: true,
            conditions: {
              select: {
                condition: { select: { slug: true } },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!benefit || !benefit.active || !benefit.partner.active) {
      return NextResponse.redirect(FALLBACK_URL, { status: 302 });
    }

    // Check expiry
    const now = new Date();
    if (benefit.validTo && benefit.validTo < now) {
      return NextResponse.redirect(FALLBACK_URL, { status: 302 });
    }
    if (benefit.validFrom && benefit.validFrom > now) {
      return NextResponse.redirect(FALLBACK_URL, { status: 302 });
    }

    const affiliateUrl = benefit.partner.affiliateBaseUrl ?? benefit.partner.websiteUrl;
    const conditionSlug =
      benefit.partner.conditions[0]?.condition.slug ?? "general";

    // Track redemption click if ref provided
    let userId: string | undefined;
    if (ref) {
      const redemption = await prisma.redemption.findUnique({
        where: { referralCode: ref },
        select: { id: true, userId: true, clickedAt: true },
      });

      if (redemption) {
        userId = redemption.userId;
        // Update clickedAt only on first visit (idempotent)
        await prisma.redemption.update({
          where: { id: redemption.id },
          data: { clickedAt: redemption.clickedAt ?? now },
        });
      }
    }

    // Build final URL
    const destinationUrl = buildAffiliateUrl(affiliateUrl, {
      conditionSlug,
      benefitId,
      referralCode: ref ?? "",
    });

    // Fire analytics non-blocking
    const forwardedFor = req.headers
      ? (req.headers as Headers).get("x-forwarded-for")
      : null;
    const rawIp = forwardedFor?.split(",")[0]?.trim() ?? "";
    const ipHash = rawIp ? hashIp(rawIp) : undefined;

    void logAnalyticsEvent(EventType.BENEFIT_CLICKED, {
      userId,
      partnerId: benefit.partner.id,
      metadata: { benefitId, conditionSlug, ipHash },
    });

    return NextResponse.redirect(destinationUrl, { status: 302 });
  } catch (err) {
    console.error("[/go] redirect error:", err);
    return NextResponse.redirect(FALLBACK_URL, { status: 302 });
  }
}
