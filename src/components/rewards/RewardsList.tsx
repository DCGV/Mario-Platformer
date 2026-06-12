import { RewardType } from "@prisma/client";

const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  CASHBACK: "Cashback",
  SAVINGS_UNLOCKED: "Savings",
  POINTS: "Points",
  CREDIT: "Credit",
};

const REWARD_TYPE_COLORS: Record<RewardType, string> = {
  CASHBACK: "bg-green-100 text-green-700",
  SAVINGS_UNLOCKED: "bg-[#5EEAD4]/20 text-[#0F5D58]",
  POINTS: "bg-blue-100 text-blue-700",
  CREDIT: "bg-purple-100 text-purple-700",
};

interface Reward {
  id: string;
  rewardType: RewardType;
  amount: number | string;
  currency: string;
  description: string;
  earnedAt: Date | string;
  paidOutAt?: Date | string | null;
}

interface RewardsListProps {
  rewards: Reward[];
}

export function RewardsList({ rewards }: RewardsListProps) {
  if (rewards.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No rewards yet — start exploring benefits to earn savings.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {rewards.map((reward) => (
        <div key={reward.id} className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                REWARD_TYPE_COLORS[reward.rewardType]
              }`}
            >
              {REWARD_TYPE_LABELS[reward.rewardType]}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {reward.description}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(reward.earnedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#0F5D58]">
              ${Number(reward.amount).toFixed(2)}
            </p>
            {reward.paidOutAt && (
              <p className="text-xs text-gray-400">Paid out</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
