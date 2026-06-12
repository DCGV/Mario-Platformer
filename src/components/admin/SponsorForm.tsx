"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PilotType } from "@prisma/client";

export function SponsorForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    pilotType: "FOUNDING" as PilotType,
    contractedValue: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        contractedValue: form.contractedValue
          ? parseFloat(form.contractedValue)
          : undefined,
        contactPhone: form.contactPhone || undefined,
        notes: form.notes || undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Save failed");
      return;
    }

    setSaved(true);
    setForm({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      pilotType: "FOUNDING",
      contractedValue: "",
      notes: "",
    });
    setTimeout(() => {
      setSaved(false);
      router.refresh();
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company name *
          </label>
          <Input
            value={form.companyName}
            onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
            required
            placeholder="Novo Nordisk"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilot type
          </label>
          <select
            value={form.pilotType}
            onChange={(e) => setForm((p) => ({ ...p, pilotType: e.target.value as PilotType }))}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            <option value="FOUNDING">Founding ($25K–$50K)</option>
            <option value="STANDARD">Standard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact name *
          </label>
          <Input
            value={form.contactName}
            onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
            required
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact email *
          </label>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
            required
            placeholder="jane@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            type="tel"
            value={form.contactPhone}
            onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contracted value ($)
          </label>
          <Input
            type="number"
            min="0"
            value={form.contractedValue}
            onChange={(e) => setForm((p) => ({ ...p, contractedValue: e.target.value }))}
            placeholder="25000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          placeholder="Context from initial conversation..."
        />
      </div>

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Adding…" : saved ? "Added ✓" : "Add prospect"}
      </Button>
    </form>
  );
}
