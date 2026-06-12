import { requireAuth, getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardsSummary } from "@/components/rewards/RewardsSummary";
import { RewardsList } from "@/components/rewards/RewardsList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RewardsPage() {
  const supabaseUser = await requireAuth();
  const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

  const rewards = await prisma.reward.findMany({
    where: { userId: user.id },
    orderBy: { earnedAt: "desc" },
    select: {
      id: true,
      rewardType: true,
      amount: true,
      currency: true,
      description: true,
      earnedAt: true,
      paidOutAt: true,
    },
  });

  const totalSavings = rewards
    .filter((r) => r.rewardType === "SAVINGS_UNLOCKED")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const cashbackEarned = rewards
    .filter((r) => r.rewardType === "CASHBACK")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const redemptionCount = await prisma.redemption.count({
    where: { userId: user.id },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-gray-900 mb-1"
          style={{ fontFamily: "Cambria, serif" }}
        >
          My Rewards
        </h1>
        <p className="text-gray-500 text-sm">
          Track the savings and cashback you&apos;ve earned on your GLP-1 journey.
        </p>
      </div>

      <div className="mb-8">
        <RewardsSummary
          totalSavings={totalSavings}
          cashbackEarned={cashbackEarned}
          rewardsCount={redemptionCount}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Transaction history</h2>
          {rewards.length > 0 && (
            <span className="text-xs text-gray-400">{rewards.length} entries</span>
          )}
        </div>
        <RewardsList rewards={rewards.map((r) => ({ ...r, amount: Number(r.amount) }))} />
      </div>

      {redemptionCount === 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            You haven&apos;t explored any benefits yet.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Browse your hub</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>How rewards work:</strong> When you click through to a partner
          and complete a qualifying action (purchase, signup, etc.), Vela Health
          receives a referral fee. A portion of that is credited back to you as
          savings or cashback. Cashback payouts are processed monthly once
          confirmed by the partner.
        </p>
      </div>
    </div>
  );
}
