import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { PartnerCard } from "@/components/partner/PartnerCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OnboardingDonePage() {
  const supabaseUser = await requireAuth();
  const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

  // Mark onboarding complete
  if (!user.onboardingCompletedAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompletedAt: new Date() },
    });
  }

  const condition = user.conditionId
    ? await prisma.condition.findUnique({
        where: { id: user.conditionId },
        select: { id: true, name: true, slug: true },
      })
    : null;

  const previewPartners = condition
    ? await prisma.partner.findMany({
        where: {
          active: true,
          vettingStatus: "APPROVED",
          conditions: { some: { conditionId: condition.id } },
        },
        take: 3,
        orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          logoUrl: true,
          tier: true,
          category: true,
          isFeatured: true,
          featuredBadge: true,
          benefits: {
            where: { active: true },
            take: 1,
            select: { valueDescription: true, ctaText: true },
          },
        },
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="flex items-center justify-center gap-2 mb-8">
        <StepDot done />
        <StepLine done />
        <StepDot done />
        <StepLine done />
        <StepDot active />
      </div>

      <div className="mb-10">
        <div className="w-16 h-16 rounded-full bg-[#5EEAD4]/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Cambria, serif" }}
        >
          {condition
            ? `Your ${condition.name} support hub is ready`
            : "Your support hub is ready"}
        </h1>
        <p className="text-gray-500 text-sm">
          Here&apos;s a preview of benefits waiting for you.
        </p>
      </div>

      {previewPartners.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-10 text-left">
          {previewPartners.map((p) => (
            <PartnerCard key={p.id} {...p} benefit={p.benefits[0]} />
          ))}
        </div>
      )}

      <Button asChild size="lg" className="w-full max-w-xs">
        <Link href="/dashboard">Explore my benefits →</Link>
      </Button>
    </div>
  );
}

function StepDot({ active, done }: { active?: boolean; done?: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        done ? "bg-[#5EEAD4]" : active ? "bg-[#0F5D58]" : "bg-gray-200"
      }`}
    />
  );
}

function StepLine({ done }: { done?: boolean }) {
  return (
    <div className={`w-12 h-0.5 ${done ? "bg-[#5EEAD4]" : "bg-gray-200"}`} />
  );
}
