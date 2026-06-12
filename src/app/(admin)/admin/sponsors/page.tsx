import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPONSOR_STATUS_LABELS } from "@/lib/constants";
import { SponsorStatus } from "@prisma/client";
import Link from "next/link";
import { SponsorForm } from "@/components/admin/SponsorForm";

export default async function SponsorsAdminPage() {
  await requireAdmin();

  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      companyName: true,
      contactName: true,
      contactEmail: true,
      pilotType: true,
      pilotStart: true,
      pilotEnd: true,
      contractedValue: true,
      status: true,
      createdAt: true,
      _count: { select: { placements: true } },
    },
  });

  const STATUS_BADGE: Record<
    SponsorStatus,
    "default" | "success" | "secondary" | "destructive" | "warning" | "gray"
  > = {
    PROSPECT: "gray",
    IN_NEGOTIATION: "warning",
    ACTIVE: "success",
    COMPLETED: "secondary",
    CHURNED: "destructive",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Sponsor CRM</h1>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {(Object.keys(SPONSOR_STATUS_LABELS) as SponsorStatus[]).map((status) => {
          const count = sponsors.filter((s) => s.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{SPONSOR_STATUS_LABELS[status]}</p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Sponsors table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pilot type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Value</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sponsors.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{s.companyName}</p>
                  {s.pilotStart && (
                    <p className="text-xs text-gray-400">
                      {new Date(s.pilotStart).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                      {s.pilotEnd &&
                        ` – ${new Date(s.pilotEnd).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}`}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{s.contactName}</p>
                  <p className="text-xs text-gray-400">{s.contactEmail}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {s.pilotType.toLowerCase()}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {s.contractedValue
                    ? `$${Number(s.contractedValue).toLocaleString()}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE[s.status]}>
                    {SPONSOR_STATUS_LABELS[s.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/sponsors/${s.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sponsors.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">
            No sponsors yet
          </p>
        )}
      </div>

      {/* Add sponsor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Add prospect</h2>
        <SponsorForm />
      </div>
    </div>
  );
}
