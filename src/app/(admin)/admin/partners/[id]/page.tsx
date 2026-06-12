import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { VettingPanel } from "@/components/admin/VettingPanel";
import { TierBadge } from "@/components/partner/TierBadge";
import { CATEGORY_LABELS } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PartnerAdminPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartnerAdminPage({ params }: PartnerAdminPageProps) {
  await requireAdmin();
  const { id } = await params;

  const partner = await prisma.partner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      description: true,
      websiteUrl: true,
      tier: true,
      category: true,
      vettingStatus: true,
      vettingScore: true,
      vettingNotes: true,
      vettedAt: true,
      commissionRate: true,
      isFeatured: true,
      active: true,
      createdAt: true,
      conditions: {
        select: { condition: { select: { id: true, name: true } } },
      },
      benefits: {
        select: { id: true, title: true, valueDescription: true, active: true },
      },
      _count: { select: { redemptions: true } },
    },
  });

  if (!partner) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/admin/partners" className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">
            ← Back to partners
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Cambria, serif" }}>
            {partner.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <TierBadge tier={partner.tier} />
            <span className="text-sm text-gray-500">{CATEGORY_LABELS[partner.category]}</span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/partners/${id}/edit`}>Edit</Link>
        </Button>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Website</p>
            <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#0F5D58] hover:underline">
              {partner.websiteUrl}
            </a>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Commission</p>
            <p className="text-gray-900">
              {partner.commissionRate
                ? `${(Number(partner.commissionRate) * 100).toFixed(1)}%`
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Conditions</p>
            <p className="text-gray-900">
              {partner.conditions.map((c) => c.condition.name).join(", ") || "None"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Redemptions</p>
            <p className="text-gray-900">{partner._count.redemptions}</p>
          </div>
        </div>

        {partner.tagline && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Tagline</p>
            <p className="text-gray-900 text-sm">{partner.tagline}</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-1">Description</p>
          <p className="text-gray-900 text-sm leading-relaxed">{partner.description}</p>
        </div>
      </div>

      {/* Benefits */}
      {partner.benefits.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Benefits ({partner.benefits.length})</h2>
          <div className="space-y-2">
            {partner.benefits.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{b.title}</p>
                  <p className="text-[#0F5D58]">{b.valueDescription}</p>
                </div>
                <span className={`text-xs ${b.active ? "text-green-600" : "text-gray-400"}`}>
                  {b.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vetting panel */}
      <VettingPanel
        partnerId={partner.id}
        currentStatus={partner.vettingStatus}
        currentScore={partner.vettingScore as {
          clinicalRelevance: number;
          evidenceBase: number;
          patientSafety: number;
          businessIntegrity: number;
          notes: string;
        } | null}
        currentNotes={partner.vettingNotes}
        vettedAt={partner.vettedAt?.toISOString() ?? null}
      />
    </div>
  );
}
