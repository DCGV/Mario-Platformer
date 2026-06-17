"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PartnerCategory, PartnerTier } from "@prisma/client";
import { CATEGORY_LABELS, TIER_LABELS } from "@/lib/constants";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  availableCategories: PartnerCategory[];
  availableTiers: PartnerTier[];
}

export function CategoryFilter({
  availableCategories,
  availableTiers,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTier = searchParams.get("tier") as PartnerTier | null;
  const currentCategory = searchParams.get("category") as PartnerCategory | null;

  const setFilter = useCallback(
    (key: "tier" | "category", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-3">
      {/* Tier tabs */}
      {availableTiers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTiers.map((tier) => (
            <button
              key={tier}
              onClick={() =>
                setFilter("tier", currentTier === tier ? null : tier)
              }
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                currentTier === tier
                  ? "bg-[#0F5D58] text-white border-[#0F5D58]"
                  : "border-gray-200 text-gray-600 hover:border-[#0F5D58] hover:text-[#0F5D58]"
              )}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>
      )}

      {/* Category horizontal scroll */}
      {availableCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setFilter("category", null)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border flex-shrink-0 transition-colors",
              !currentCategory
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            )}
          >
            All
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setFilter("category", currentCategory === cat ? null : cat)
              }
              className={cn(
                "text-xs px-3 py-1 rounded-full border flex-shrink-0 transition-colors",
                currentCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
