"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VETTING_STATUS_LABELS } from "@/lib/constants";
import { VettingStatus } from "@prisma/client";

interface VettingScore {
  clinicalRelevance: number;
  evidenceBase: number;
  patientSafety: number;
  businessIntegrity: number;
  notes: string;
}

interface VettingPanelProps {
  partnerId: string;
  currentStatus: VettingStatus;
  currentScore: VettingScore | null;
  currentNotes: string | null | undefined;
  vettedAt: string | null;
}

const SCORE_CRITERIA = [
  { key: "clinicalRelevance" as const, label: "Clinical Relevance", description: "Does it address a known adherence barrier?" },
  { key: "evidenceBase" as const, label: "Evidence Base", description: "Published data or guideline mention?" },
  { key: "patientSafety" as const, label: "Patient Safety", description: "Risk of harm, drug interactions?" },
  { key: "businessIntegrity" as const, label: "Business Integrity", description: "Reputable, stable, compliant?" },
];

export function VettingPanel({ partnerId, currentStatus, currentScore, currentNotes, vettedAt }: VettingPanelProps) {
  const [status, setStatus] = useState<VettingStatus>(currentStatus);
  const [score, setScore] = useState<VettingScore>(
    currentScore ?? {
      clinicalRelevance: 3,
      evidenceBase: 3,
      patientSafety: 3,
      businessIntegrity: 3,
      notes: "",
    }
  );
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composite =
    (score.clinicalRelevance + score.evidenceBase + score.patientSafety + score.businessIntegrity) / 4;

  const hasLowScore = Object.values(score).some(
    (v, i) => i < 4 && typeof v === "number" && v < 3
  );

  async function handleSave() {
    if (hasLowScore && !score.notes.trim()) {
      setError("Notes are required when any score is below 3.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/partners/${partnerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vettingStatus: status, vettingScore: score, vettingNotes: notes }),
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

  const STATUS_BADGE: Record<VettingStatus, "warning" | "success" | "destructive" | "secondary" | "gray"> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
    UNDER_REVIEW: "secondary",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Vetting</h2>
        <Badge variant={STATUS_BADGE[status]}>
          {VETTING_STATUS_LABELS[status]}
        </Badge>
      </div>

      {/* Composite score */}
      <div className="mb-5 p-3 rounded-lg bg-gray-50 text-center">
        <p className="text-xs text-gray-500 mb-1">Composite score</p>
        <p
          className={`text-3xl font-bold ${
            composite >= 4 ? "text-green-600" : composite >= 3 ? "text-[#0F5D58]" : "text-red-600"
          }`}
        >
          {composite.toFixed(1)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {composite >= 4 ? "Approve normally" : composite >= 3 ? "Approve with review note" : "Requires superadmin override"}
        </p>
      </div>

      {/* Score sliders */}
      <div className="space-y-4 mb-5">
        {SCORE_CRITERIA.map(({ key, label, description }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm font-bold text-[#0F5D58]">{score[key]}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">{description}</p>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={score[key]}
              onChange={(e) =>
                setScore((prev) => ({ ...prev, [key]: parseInt(e.target.value, 10) }))
              }
              className="w-full accent-[#0F5D58]"
              aria-label={`${label} score`}
            />
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vetting notes {hasLowScore && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={score.notes}
          onChange={(e) => setScore((prev) => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Required if any score < 3"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Internal notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional admin context"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
        />
      </div>

      {/* Status */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Decision
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as VettingStatus)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
        >
          {(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as VettingStatus[]).map((s) => (
            <option key={s} value={s}>{VETTING_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>
      )}

      {vettedAt && (
        <p className="text-xs text-gray-400 mb-3">
          Last vetted: {new Date(vettedAt).toLocaleDateString()}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save vetting decision"}
      </Button>
    </div>
  );
}
