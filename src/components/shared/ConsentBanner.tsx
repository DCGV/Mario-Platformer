"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vela_analytics_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("vela_analytics_consent", "true");
    setVisible(false);
    // Initialize PostHog after consent
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ph = (window as any).posthog;
      if (ph) ph.opt_in_capturing();
    } catch {
      // Non-blocking
    }
  }

  function decline() {
    localStorage.setItem("vela_analytics_consent", "false");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          We use analytics cookies to improve your experience. We never share
          clinical or personal health data with third parties.{" "}
          <a href="/privacy" className="underline text-[#0F5D58]">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
