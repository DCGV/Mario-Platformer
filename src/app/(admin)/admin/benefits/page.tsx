import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISCOUNT_TYPE_LABELS } from "@/lib/constants";
import { BenefitForm } from "@/components/admin/BenefitForm";
import Link from "next/link";

interface BenefitsAdminPageProps {
  searchParams: Promise<{ partnerId?: string; page?: string }>;
}

export default async function BenefitsAdminPage({ searchParams }: BenefitsAdminPageProps) {
  await requireAdmin();

  const { partnerId, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 30;

  const where = partnerId ? { partnerId } : {};

  const [total, benefits, partners] = await Promise.all([
    prisma.benefit.count({ where }),
    prisma.benefit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        valueDescription: true,
        discountType: true,
        active: true,
        createdAt: true,
        partner: { select: { id: true, name: true } },
        _count: { select: { redemptions: true } },
      },
    }),
    prisma.partner.findMany({
      where: { vettingStatus: "APPROVED", active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Benefits</h1>
      </div>

      {/* Partner filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/benefits"
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !partnerId
              ? "bg-[#0F5D58] text-white border-[#0F5D58]"
              : "border-gray-200 text-gray-600"
          }`}
        >
          All partners
        </Link>
        {partners.map((p) => (
          <Link
            key={p.id}
            href={`/admin/benefits?partnerId=${p.id}`}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              partnerId === p.id
                ? "bg-[#0F5D58] text-white border-[#0F5D58]"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {p.name}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Benefit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Partner</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Redemptions</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {benefits.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{b.title}</p>
                  <p className="text-xs text-[#0F5D58]">{b.valueDescription}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.partner.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {b.discountType ? DISCOUNT_TYPE_LABELS[b.discountType] : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{b._count.redemptions}</td>
                <td className="px-4 py-3">
                  <Badge variant={b.active ? "success" : "gray"}>
                    {b.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {benefits.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">No benefits found</p>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-gray-500 mb-8">
          <p>{Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`?${partnerId ? `partnerId=${partnerId}&` : ""}page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page * limit < total && (
              <Button asChild variant="outline" size="sm">
                <Link href={`?${partnerId ? `partnerId=${partnerId}&` : ""}page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Add benefit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Add new benefit</h2>
        <BenefitForm partners={partners} defaultPartnerId={partnerId} />
      </div>
    </div>
  );
}
