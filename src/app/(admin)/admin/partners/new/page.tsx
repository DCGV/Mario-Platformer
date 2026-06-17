import { requireAdmin } from "@/lib/auth";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { prisma } from "@/lib/prisma";

export default async function NewPartnerPage() {
  await requireAdmin();

  const conditions = await prisma.condition.findMany({
    select: { id: true, name: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Add new partner</h1>
      <PartnerForm conditions={conditions} />
    </div>
  );
}
