"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RedemptionButtonProps {
  benefitId: string;
  partnerName: string;
  ctaText: string;
  isLoggedIn: boolean;
}

export function RedemptionButton({
  benefitId,
  partnerName,
  ctaText,
  isLoggedIn,
}: RedemptionButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/partners`);
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ benefitId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(json.error?.message ?? "Something went wrong. Please try again.");
        return;
      }

      const { redirectUrl } = json.data;

      // Track client-side (non-blocking)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ph = (window as any).posthog;
        if (ph) {
          ph.capture("benefit_cta_clicked", { benefitId, partnerName });
        }
      } catch {
        // Non-blocking
      }

      setState("success");
      setMessage(`Opening ${partnerName} in a new tab — your referral is tracked`);

      window.open(redirectUrl, "_blank", "noopener,noreferrer");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleClick}
        disabled={state === "loading"}
        size="lg"
        className="w-full"
        aria-busy={state === "loading"}
      >
        {state === "loading" ? "Opening…" : ctaText}
      </Button>

      {message && (
        <p
          className={`text-sm text-center ${
            state === "error" ? "text-red-600" : "text-green-700"
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
