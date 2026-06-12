import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VETTING_STATUS_LABELS, TIER_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { VettingStatus } from "@prisma/client";
import Link from "next/link";

interface PartnersAdminPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function PartnersAdminPage({ searchParams }: PartnersAdminPageProps) {
  await requireAdmin();

  const { status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 20;

  const where = status ? { vettingStatus: status as VettingStatus } : {};

  const [total, partners] = await Promise.all([
    prisma.partner.count({ where }),
    prisma.partner.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        category: true,
        vettingStatus: true,
        isFeatured: true,
        active: true,
        createdAt: true,
        _count: { select: { benefits: true } },
      },
    }),
  ]);

  const STATUS_BADGE: Record<VettingStatus, string> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
    UNDER_REVIEW: "secondary",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Partners</h1>
        <Button asChild>
          <Link href="/admin/partners/new">+ New partner</Link>
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {[null, "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `?status=${s}` : "?"}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              status === s || (!s && !status)
                ? "bg-[#0F5D58] text-white border-[#0F5D58]"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s ? VETTING_STATUS_LABELS[s as VettingStatus] : "All"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Partner</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Benefits</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partners.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{TIER_LABELS[p.tier]}</td>
                <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[p.category]}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE[p.vettingStatus] as "warning" | "success" | "destructive" | "secondary"}>
                    {VETTING_STATUS_LABELS[p.vettingStatus]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{p._count.benefits}</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/partners/${p.id}`}>Review</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {partners.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No partners found
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <p>
          {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={`?${status ? `status=${status}&` : ""}page=${page - 1}`}>
                Previous
              </Link>
            </Button>
          )}
          {page * limit < total && (
            <Button asChild variant="outline" size="sm">
              <Link href={`?${status ? `status=${status}&` : ""}page=${page + 1}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
