"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SponsorStatus } from "@prisma/client";
import { SPONSOR_STATUS_LABELS } from "@/lib/constants";

interface SponsorStatusFormProps {
  sponsorId: string;
  currentStatus: SponsorStatus;
  currentPilotStart: string | null;
  currentPilotEnd: string | null;
}

export function SponsorStatusForm({
  sponsorId,
  currentStatus,
  currentPilotStart,
  currentPilotEnd,
}: SponsorStatusFormProps) {
  const [status, setStatus] = useState<SponsorStatus>(currentStatus);
  const [pilotStart, setPilotStart] = useState(currentPilotStart ?? "");
  const [pilotEnd, setPilotEnd] = useState(currentPilotEnd ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/sponsors/${sponsorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        pilotStart: pilotStart ? new Date(pilotStart).toISOString() : undefined,
        pilotEnd: pilotEnd ? new Date(pilotEnd).toISOString() : undefined,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Save failed");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Update status</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SponsorStatus)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            {(Object.keys(SPONSOR_STATUS_LABELS) as SponsorStatus[]).map((s) => (
              <option key={s} value={s}>{SPONSOR_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilot start
            </label>
            <Input
              type="date"
              value={pilotStart}
              onChange={(e) => setPilotStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilot end
            </label>
            <Input
              type="date"
              value={pilotEnd}
              onChange={(e) => setPilotEnd(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>}

      <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </Button>
    </div>
  );
}
