import { apiSuccess, apiError, handleServerError } from "@/lib/api";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabaseUser = await getServerSession();
    if (!supabaseUser) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true },
    });

    if (!user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    const rewards = await prisma.reward.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
      take: 20,
      select: {
        id: true,
        rewardType: true,
        amount: true,
        currency: true,
        description: true,
        earnedAt: true,
        expiresAt: true,
        paidOutAt: true,
      },
    });

    const totalSavings = rewards
      .filter((r) => r.rewardType === "SAVINGS_UNLOCKED")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const cashbackEarned = rewards
      .filter((r) => r.rewardType === "CASHBACK")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return apiSuccess({
      totalSavings,
      cashbackEarned,
      rewardsCount: rewards.length,
      recent: rewards,
    });
  } catch (err) {
    return handleServerError(err);
  }
}
