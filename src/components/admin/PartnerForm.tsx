"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerTier, PartnerCategory } from "@prisma/client";
import { TIER_LABELS, CATEGORY_LABELS } from "@/lib/constants";

interface Condition {
  id: string;
  name: string;
}

interface PartnerFormProps {
  conditions: Condition[];
  initial?: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description: string;
    websiteUrl: string;
    affiliateBaseUrl?: string | null;
    logoUrl?: string | null;
    tier: PartnerTier;
    category: PartnerCategory;
    commissionRate?: number | null;
    conditionIds?: string[];
  };
}

export function PartnerForm({ conditions, initial }: PartnerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    websiteUrl: initial?.websiteUrl ?? "",
    affiliateBaseUrl: initial?.affiliateBaseUrl ?? "",
    logoUrl: initial?.logoUrl ?? "",
    tier: initial?.tier ?? "CLINICAL" as PartnerTier,
    category: initial?.category ?? "OTHER" as PartnerCategory,
    commissionRate: initial?.commissionRate ? String(initial.commissionRate) : "",
    conditionIds: initial?.conditionIds ?? [],
  });

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: initial ? prev.slug : slugify(name),
    }));
  }

  function toggleCondition(id: string) {
    setForm((prev) => ({
      ...prev,
      conditionIds: prev.conditionIds.includes(id)
        ? prev.conditionIds.filter((c) => c !== id)
        : [...prev.conditionIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : undefined,
      affiliateBaseUrl: form.affiliateBaseUrl || undefined,
      logoUrl: form.logoUrl || undefined,
      tagline: form.tagline || undefined,
    };

    const url = initial ? `/api/admin/partners/${initial.id}` : "/api/admin/partners";
    const method = initial ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Save failed");
      return;
    }

    const json = await res.json();
    router.push(`/admin/partners/${json.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <Input
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="NourishRx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            required
            placeholder="nourishrx"
            pattern="[a-z0-9-]+"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <Input
          value={form.tagline}
          onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
          placeholder="Personalized nutrition for GLP-1 patients"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          required
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          placeholder="Full description of the partner and their services..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
          <Input
            type="url"
            value={form.websiteUrl}
            onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
            required
            placeholder="https://partner.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Base URL</label>
          <Input
            type="url"
            value={form.affiliateBaseUrl}
            onChange={(e) => setForm((p) => ({ ...p, affiliateBaseUrl: e.target.value }))}
            placeholder="https://partner.com/vela?code=VELA"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
          <select
            value={form.tier}
            onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value as PartnerTier }))}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            {Object.entries(TIER_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as PartnerCategory }))}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission rate (e.g. 0.20 = 20%)
        </label>
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={form.commissionRate}
          onChange={(e) => setForm((p) => ({ ...p, commissionRate: e.target.value }))}
          placeholder="0.20"
        />
      </div>

      {conditions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCondition(c.id)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  form.conditionIds.includes(c.id)
                    ? "bg-[#0F5D58] text-white border-[#0F5D58]"
                    : "border-gray-200 text-gray-600 hover:border-[#0F5D58]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Saving…" : initial ? "Update partner" : "Create partner"}
      </Button>
    </form>
  );
}
