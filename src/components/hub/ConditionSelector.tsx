"use client";

import { useRouter } from "next/navigation";

interface Condition {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

interface ConditionSelectorProps {
  conditions: Condition[];
  currentSlug: string;
}

export function ConditionSelector({ conditions, currentSlug }: ConditionSelectorProps) {
  const router = useRouter();

  if (conditions.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500">Switch hub:</span>
      {conditions.map((condition) => (
        <button
          key={condition.id}
          onClick={() => condition.active && router.push(`/hub/${condition.slug}`)}
          disabled={!condition.active}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            condition.slug === currentSlug
              ? "bg-[#0F5D58] text-white border-[#0F5D58]"
              : condition.active
              ? "border-gray-200 text-gray-600 hover:border-[#0F5D58]"
              : "border-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {condition.name}
          {!condition.active && " (soon)"}
        </button>
      ))}
    </div>
  );
}
