"use client";

import { useState } from "react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";
import { X } from "lucide-react";

export function MedicalDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="note"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2"
    >
      <div className="max-w-6xl mx-auto flex items-start gap-2">
        <p className="text-xs text-amber-800 flex-1">{MEDICAL_DISCLAIMER}</p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss disclaimer"
          className="flex-shrink-0 text-amber-600 hover:text-amber-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
