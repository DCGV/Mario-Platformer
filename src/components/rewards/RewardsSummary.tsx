import { RewardType } from "@prisma/client";
import { DISCOUNT_TYPE_LABELS } from "@/lib/constants";

interface RewardsSummaryProps {
  totalSavings: number;
  cashbackEarned: number;
  rewardsCount: number;
}

export function RewardsSummary({
  totalSavings,
  cashbackEarned,
  rewardsCount,
}: RewardsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryCard
        label="Total savings unlocked"
        value={`$${totalSavings.toFixed(2)}`}
        subtext="Across all benefits"
        highlight
      />
      <SummaryCard
        label="Cashback earned"
        value={`$${cashbackEarned.toFixed(2)}`}
        subtext="From confirmed conversions"
      />
      <SummaryCard
        label="Benefits explored"
        value={String(rewardsCount)}
        subtext="Total interactions"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-[#0F5D58] border-[#0F5D58] text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <p
        className={`text-xs font-medium mb-1 ${
          highlight ? "text-white/70" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-3xl font-bold mb-1 ${
          highlight ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </p>
      <p className={`text-xs ${highlight ? "text-white/50" : "text-gray-400"}`}>
        {subtext}
      </p>
    </div>
  );
}
