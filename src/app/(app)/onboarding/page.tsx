import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { ConditionPicker } from "@/components/onboarding/ConditionPicker";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabaseUser = await requireAuth();
  const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

  if (user.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const conditions = await prisma.condition.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      iconUrl: true,
      tagline: true,
      active: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot active />
          <StepLine />
          <StepDot />
          <StepLine />
          <StepDot />
        </div>
        <p className="text-xs text-[#0F5D58] font-semibold uppercase tracking-widest mb-2">
          Step 1 of 3
        </p>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Cambria, serif" }}
        >
          What condition are you managing?
        </h1>
        <p className="text-gray-500 text-sm">
          We&apos;ll personalize your benefits hub based on your answer.
          This is not stored as a medical diagnosis.
        </p>
      </div>

      <ConditionPicker conditions={conditions} />
    </div>
  );
}

function StepDot({ active }: { active?: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${active ? "bg-[#0F5D58]" : "bg-gray-200"}`}
    />
  );
}

function StepLine() {
  return <div className="w-12 h-0.5 bg-gray-200" />;
}
