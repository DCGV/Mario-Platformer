import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { SPONSOR_STATUS_LABELS } from "@/lib/constants";
import { SponsorStatusForm } from "@/components/admin/SponsorStatusForm";
import Link from "next/link";

interface SponsorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SponsorDetailPage({ params }: SponsorDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      pilotType: true,
      pilotStart: true,
      pilotEnd: true,
      contractedValue: true,
      analyticsAccess: true,
      status: true,
      notes: true,
      createdAt: true,
      placements: {
        select: {
          id: true,
          placementType: true,
          activeFrom: true,
          activeTo: true,
          active: true,
          partner: { select: { name: true } },
          condition: { select: { name: true } },
        },
      },
    },
  });

  if (!sponsor) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/sponsors"
        className="text-xs text-gray-400 hover:text-gray-600 mb-4 block"
      >
        ← Back to sponsors
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Cambria, serif" }}
          >
            {sponsor.companyName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {sponsor.pilotType === "FOUNDING" ? "Founding pilot" : "Standard"} •{" "}
            {sponsor.contractedValue
              ? `$${Number(sponsor.contractedValue).toLocaleString()}`
              : "Value TBD"}
          </p>
        </div>
        <Badge>{SPONSOR_STATUS_LABELS[sponsor.status]}</Badge>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Contact</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 mb-0.5">Name</p>
            <p className="text-gray-900">{sponsor.contactName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Email</p>
            <a
              href={`mailto:${sponsor.contactEmail}`}
              className="text-[#0F5D58] hover:underline"
            >
              {sponsor.contactEmail}
            </a>
          </div>
          {sponsor.contactPhone && (
            <div>
              <p className="text-gray-500 mb-0.5">Phone</p>
              <p className="text-gray-900">{sponsor.contactPhone}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 mb-0.5">Analytics access</p>
            <p className="text-gray-900">
              {sponsor.analyticsAccess ? "Yes" : "No"}
            </p>
          </div>
        </div>
        {sponsor.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Notes</p>
            <p className="text-gray-700 text-sm leading-relaxed">{sponsor.notes}</p>
          </div>
        )}
      </div>

      {/* Pilot timeline */}
      {(sponsor.pilotStart || sponsor.pilotEnd) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Pilot timeline</h2>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Start</p>
              <p className="text-gray-900">
                {sponsor.pilotStart
                  ? new Date(sponsor.pilotStart).toLocaleDateString()
                  : "TBD"}
              </p>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div>
              <p className="text-gray-500 mb-0.5">End</p>
              <p className="text-gray-900">
                {sponsor.pilotEnd
                  ? new Date(sponsor.pilotEnd).toLocaleDateString()
                  : "TBD"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placements */}
      {sponsor.placements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">
            Placements ({sponsor.placements.length})
          </h2>
          <div className="space-y-2 text-sm">
            {sponsor.placements.map((pl) => (
              <div
                key={pl.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {pl.placementType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {pl.partner?.name ?? pl.condition?.name ?? "General"}
                  </p>
                </div>
                <Badge variant={pl.active ? "success" : "gray"}>
                  {pl.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status management */}
      <SponsorStatusForm
        sponsorId={id}
        currentStatus={sponsor.status}
        currentPilotStart={sponsor.pilotStart?.toISOString().split("T")[0] ?? null}
        currentPilotEnd={sponsor.pilotEnd?.toISOString().split("T")[0] ?? null}
      />
    </div>
  );
}
