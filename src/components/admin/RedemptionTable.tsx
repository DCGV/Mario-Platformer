import { RedemptionStatus } from "@prisma/client";
import { REDEMPTION_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGE: Record<
  RedemptionStatus,
  "secondary" | "success" | "default" | "destructive"
> = {
  CLICKED: "secondary",
  CONVERTED: "success",
  COMMISSION_CONFIRMED: "default",
  REJECTED: "destructive",
};

interface RedemptionRow {
  id: string;
  referralCode: string;
  clickedAt: Date | string;
  convertedAt?: Date | string | null;
  conversionValue?: number | string | null;
  status: RedemptionStatus;
  user: { id: string };
  benefit: { id: string; title: string };
  partner: { id: string; name: string; slug: string };
}

interface RedemptionTableProps {
  redemptions: RedemptionRow[];
}

export function RedemptionTable({ redemptions }: RedemptionTableProps) {
  if (redemptions.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No redemptions found
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Partner
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Benefit
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Clicked
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              Value
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">
              User
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {redemptions.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {r.partner.name}
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                {r.benefit.title}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_BADGE[r.status]}>
                  {REDEMPTION_STATUS_LABELS[r.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(r.clickedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {r.conversionValue
                  ? `$${Number(r.conversionValue).toFixed(2)}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-gray-400 font-mono text-xs truncate max-w-[80px]">
                {r.user.id.slice(-8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
