import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { waitlistSchema } from "@/lib/validations";
import { logAnalyticsEvent } from "@/lib/analytics";
import { EventType } from "@prisma/client";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = waitlistSchema.parse(body);

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      return apiError("ALREADY_EXISTS", "Email already on waitlist", 409);
    }

    await prisma.waitlistEntry.create({ data: input });

    void logAnalyticsEvent(EventType.WAITLIST_JOINED, {
      metadata: {
        conditionInterest: input.conditionInterest,
        source: input.source,
      },
    });

    // Send welcome email (non-blocking)
    void sendWelcomeEmail(input.email);

    return apiSuccess({ success: true });
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}

async function sendWelcomeEmail(email: string) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Vela Health <hello@velahealth.com>",
      to: email,
      subject: "Your Vela Health access is coming",
      html: `
        <h2>Welcome to Vela Health</h2>
        <p>Thank you for joining our waitlist. We're building the rewards hub for GLP-1 patients — a curated catalog of treatment-aligned services that keep you on therapy and reward you for staying on it.</p>
        <p>We'll reach out as soon as early access opens.</p>
        <p>— The Vela Health Team</p>
        <hr/>
        <p style="font-size:12px;color:#666;">
          Vela Health is not a medical provider. Content is for informational purposes only.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
        </p>
      `,
    });
  } catch (err) {
    console.error("[waitlist] email send failed:", err);
  }
}
