import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleServerError } from "@/lib/api";

// Stripe webhook scaffold — billing features in Phase 2
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return apiError("UNAUTHORIZED", "Missing Stripe signature", 401);
    }

    const rawBody = await req.text();

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case "invoice.paid":
        // TODO Phase 2: mark sponsor pilot as active
        break;
      default:
        break;
    }

    return apiSuccess({ received: true });
  } catch (err) {
    return handleServerError(err);
  }
}
