import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { affiliateWebhookSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    // Validate HMAC signature
    const signature = req.headers.get("x-vela-signature");
    const secret = process.env.AFFILIATE_TRACKING_SECRET;

    if (!signature || !secret) {
      return apiError("UNAUTHORIZED", "Missing signature", 401);
    }

    const rawBody = await req.text();

    const { verifyWebhookSignature } = await import("@/lib/affiliate");
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return apiError("UNAUTHORIZED", "Invalid signature", 401);
    }

    const body = JSON.parse(rawBody);
    const input = affiliateWebhookSchema.parse(body);

    const redemption = await prisma.redemption.findUnique({
      where: { referralCode: input.referralCode },
      select: { id: true, userId: true, status: true },
    });

    if (!redemption) {
      return apiError("NOT_FOUND", "Redemption not found", 404);
    }

    if (input.status === "converted") {
      await prisma.redemption.update({
        where: { id: redemption.id },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          conversionValue: input.orderValue ?? null,
        },
      });

      if (input.orderValue) {
        await prisma.reward.create({
          data: {
            userId: redemption.userId,
            redemptionId: redemption.id,
            rewardType: "SAVINGS_UNLOCKED",
            amount: input.orderValue,
            description: "Conversion reward",
          },
        });
      }
    } else {
      await prisma.redemption.update({
        where: { id: redemption.id },
        data: { status: "REJECTED" },
      });
    }

    return apiSuccess({ success: true });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
