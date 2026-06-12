import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, getOrCreateUser } from "@/lib/auth";
import { TierBadge } from "@/components/partner/TierBadge";
import { RedemptionButton } from "@/components/benefit/RedemptionButton";
import { CATEGORY_LABELS } from "@/lib/constants";
import Image from "next/image";

interface PartnerPageProps {
  params: Promise<{ partnerSlug: string }>;
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const supabaseUser = await requireAuth();
  await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

  const { partnerSlug } = await params;

  const partner = await prisma.partner.findUnique({
    where: { slug: partnerSlug, active: true },
    select: {
      id: true,
      name: true,
      tagline: true,
      description: true,
      logoUrl: true,
      heroImageUrl: true,
      websiteUrl: true,
      tier: true,
      category: true,
      isFeatured: true,
      featuredBadge: true,
      vettingStatus: true,
      benefits: {
        where: { active: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          valueDescription: true,
          ctaText: true,
          discountType: true,
          eligibilityNotes: true,
        },
      },
      conditions: {
        select: { condition: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!partner || partner.vettingStatus !== "APPROVED") notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Partner header */}
      <div className="flex items-start gap-4 mb-6">
        {partner.logoUrl ? (
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            <Image
              src={partner.logoUrl}
              alt={`${partner.name} logo`}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-[#0F5D58]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#0F5D58] font-bold text-2xl">
              {partner.name[0]}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Cambria, serif" }}
            >
              {partner.name}
            </h1>
            {partner.isFeatured && partner.featuredBadge && (
              <span className="text-xs bg-[#5EEAD4] text-[#0F5D58] px-2 py-0.5 rounded-full font-medium">
                {partner.featuredBadge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TierBadge tier={partner.tier} />
            <span className="text-xs text-gray-500">
              {CATEGORY_LABELS[partner.category]}
            </span>
          </div>
          {partner.tagline && (
            <p className="text-gray-600 text-sm mt-2">{partner.tagline}</p>
          )}
        </div>
      </div>

      <p className="text-gray-700 leading-relaxed mb-8">{partner.description}</p>

      {/* Benefits */}
      {partner.benefits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available benefits
          </h2>
          <div className="space-y-4">
            {partner.benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{benefit.title}</p>
                    <p className="text-[#0F5D58] font-medium text-sm mt-0.5">
                      {benefit.valueDescription}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>
                {benefit.eligibilityNotes && (
                  <p className="text-xs text-gray-400 mb-3">
                    * {benefit.eligibilityNotes}
                  </p>
                )}
                <RedemptionButton
                  benefitId={benefit.id}
                  partnerName={partner.name}
                  ctaText={benefit.ctaText}
                  isLoggedIn={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vetting note */}
      <div className="mt-8 p-4 bg-[#0F5D58]/5 rounded-lg">
        <p className="text-xs text-[#0F5D58]">
          ✓ This partner has been vetted by Vela Health for clinical relevance,
          patient safety, and business integrity.
        </p>
      </div>
    </div>
  );
}
