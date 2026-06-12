"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Condition {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl?: string | null;
  tagline?: string | null;
  active: boolean;
}

interface ConditionPickerProps {
  conditions: Condition[];
}

export function ConditionPicker({ conditions }: ConditionPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);

    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditionId: selected }),
    });

    router.push("/onboarding/setup");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {conditions.map((condition) => (
          <button
            key={condition.id}
            onClick={() => condition.active && setSelected(condition.id)}
            disabled={!condition.active}
            aria-pressed={selected === condition.id}
            className={cn(
              "relative text-left p-5 rounded-xl border-2 transition-all",
              condition.active
                ? selected === condition.id
                  ? "border-[#0F5D58] bg-[#0F5D58]/5 shadow-sm"
                  : "border-gray-200 hover:border-[#5EEAD4] hover:shadow-sm"
                : "border-gray-100 opacity-50 cursor-not-allowed"
            )}
          >
            {!condition.active && (
              <span className="absolute top-3 right-3 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            )}
            {condition.iconUrl && (
              <span className="text-2xl mb-3 block">{condition.iconUrl}</span>
            )}
            <p className="font-semibold text-gray-900 mb-1">{condition.name}</p>
            {condition.tagline && (
              <p className="text-sm text-gray-500">{condition.tagline}</p>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Saving…" : "Continue →"}
      </Button>
    </div>
  );
}
