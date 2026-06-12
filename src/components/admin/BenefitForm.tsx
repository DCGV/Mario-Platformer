"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiscountType } from "@prisma/client";
import { DISCOUNT_TYPE_LABELS } from "@/lib/constants";

interface Partner {
  id: string;
  name: string;
}

interface BenefitFormProps {
  partners: Partner[];
  defaultPartnerId?: string;
}

export function BenefitForm({ partners, defaultPartnerId }: BenefitFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    partnerId: defaultPartnerId ?? partners[0]?.id ?? "",
    title: "",
    description: "",
    valueDescription: "",
    ctaText: "Get this benefit",
    discountType: "" as DiscountType | "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/benefits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountType: form.discountType || undefined,
        conditionIds: [],
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Save failed");
      return;
    }

    setForm({
      partnerId: form.partnerId,
      title: "",
      description: "",
      valueDescription: "",
      ctaText: "Get this benefit",
      discountType: "",
    });

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Partner *
        </label>
        <select
          value={form.partnerId}
          onChange={(e) => setForm((p) => ({ ...p, partnerId: e.target.value }))}
          required
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
        >
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          placeholder="Free 30-min consultation"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value description * <span className="text-gray-400 font-normal">(shown on card)</span>
        </label>
        <Input
          value={form.valueDescription}
          onChange={(e) => setForm((p) => ({ ...p, valueDescription: e.target.value }))}
          required
          placeholder="Free 30-min consultation"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          required
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CTA text</label>
          <Input
            value={form.ctaText}
            onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as DiscountType | "" }))}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            <option value="">None</option>
            {Object.entries(DISCOUNT_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Adding…" : "Add benefit"}
      </Button>
    </form>
  );
}
