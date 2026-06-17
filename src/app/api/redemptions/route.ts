import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { redemptionSchema } from "@/lib/validations";
import { generateReferralCode, hashIp } from "@/lib/affiliate";
import { logAnalyticsEvent } from "@/lib/analytics";
import { createAuditLog } from "@/lib/audit";
import { getServerSession, getOrCreateUser } from "@/lib/auth";
import { EventType } from "@prisma/client";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const supabaseUser = await getServerSession();
    if (!supabaseUser) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const input = redemptionSchema.parse(body);

    const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

    const benefit = await prisma.benefit.findUnique({
      where: { id: input.benefitId, active: true },
      select: {
        id: true,
        validFrom: true,
        validTo: true,
        partnerId: true,
        partner: {
          select: {
            id: true,
            active: true,
            vettingStatus: true,
            conditions: {
              select: { condition: { select: { slug: true } } },
              take: 1,
            },
          },
        },
      },
    });

    if (
      !benefit ||
      !benefit.partner.active ||
      benefit.partner.vettingStatus !== "APPROVED"
    ) {
      return apiError("NOT_FOUND", "Benefit not found or unavailable", 404);
    }

    const now = new Date();
    if (benefit.validTo && benefit.validTo < now) {
      return apiError("EXPIRED", "This benefit has expired", 410);
    }

    const referralCode = generateReferralCode(user.id, input.benefitId);

    // Idempotent: return existing redemption if same user+benefit was already clicked
    const existing = await prisma.redemption.findFirst({
      where: { userId: user.id, benefitId: input.benefitId },
      select: { referralCode: true },
    });

    const finalCode = existing?.referralCode ?? referralCode;

    if (!existing) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const rawIp = forwardedFor?.split(",")[0]?.trim() ?? "";

      await prisma.redemption.create({
        data: {
          userId: user.id,
          benefitId: input.benefitId,
          partnerId: benefit.partnerId,
          referralCode,
          ipHash: rawIp ? hashIp(rawIp) : null,
          userAgent: req.headers.get("user-agent"),
        },
      });

      await createAuditLog({
        userId: user.id,
        action: "REDEMPTION_CREATED",
        entityType: "Redemption",
        entityId: referralCode,
        metadata: { benefitId: input.benefitId, partnerId: benefit.partnerId },
      });
    }

    const conditionSlug =
      benefit.partner.conditions[0]?.condition.slug ?? "general";

    void logAnalyticsEvent(EventType.BENEFIT_CLICKED, {
      userId: user.id,
      partnerId: benefit.partnerId,
      metadata: { benefitId: input.benefitId, conditionSlug },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const redirectUrl = `${appUrl}/go/${input.benefitId}?ref=${finalCode}`;

    return apiSuccess({ redirectUrl, referralCode: finalCode });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
