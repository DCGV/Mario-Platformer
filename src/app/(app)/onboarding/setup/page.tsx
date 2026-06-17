"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GLP1_DRUG_OPTIONS } from "@/lib/constants";
import Link from "next/link";

export default function OnboardingSetupPage() {
  const [drugName, setDrugName] = useState("");
  const [treatmentStart, setTreatmentStart] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(drugName ? { drugName } : {}),
        ...(treatmentStart ? { treatmentStart: new Date(treatmentStart).toISOString() } : {}),
        ...(zipCode ? { zipCode } : {}),
      }),
    });

    router.push("/onboarding/done");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot done />
          <StepLine done />
          <StepDot active />
          <StepLine />
          <StepDot />
        </div>
        <p className="text-xs text-[#0F5D58] font-semibold uppercase tracking-widest mb-2">
          Step 2 of 3
        </p>
        <h1
          className="text-2xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Cambria, serif" }}
        >
          Tell us a bit more
        </h1>
        <p className="text-gray-500 text-sm">
          Optional — helps us personalize your hub. You can update this anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="drug" className="block text-sm font-medium text-gray-700 mb-1">
            Which medication are you on?
          </label>
          <select
            id="drug"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
          >
            <option value="">Select (optional)</option>
            {GLP1_DRUG_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
            When did you start treatment?
          </label>
          <Input
            id="start"
            type="date"
            value={treatmentStart}
            onChange={(e) => setTreatmentStart(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP code
          </label>
          <Input
            id="zip"
            type="text"
            inputMode="numeric"
            pattern="\d{5}(-\d{4})?"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="12345"
            maxLength={10}
          />
          <p className="text-xs text-gray-400 mt-1">
            Used to surface locally available services
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Saving…" : "Continue →"}
          </Button>
          <Link
            href="/onboarding/done"
            className="text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Link>
        </div>
      </form>
    </div>
  );
}

function StepDot({ active, done }: { active?: boolean; done?: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        done
          ? "bg-[#5EEAD4]"
          : active
          ? "bg-[#0F5D58]"
          : "bg-gray-200"
      }`}
    />
  );
}

function StepLine({ done }: { done?: boolean }) {
  return (
    <div className={`w-12 h-0.5 ${done ? "bg-[#5EEAD4]" : "bg-gray-200"}`} />
  );
}
