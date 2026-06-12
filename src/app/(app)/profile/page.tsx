"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GLP1_DRUG_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  zipCode?: string | null;
  drugName?: string | null;
  treatmentStart?: string | null;
  subscriptionTier: string;
  condition?: { id: string; name: string; slug: string } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    zipCode: "",
    drugName: "",
    treatmentStart: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((json) => {
        const data: UserProfile = json.data;
        setProfile(data);
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          zipCode: data.zipCode ?? "",
          drugName: data.drugName ?? "",
          treatmentStart: data.treatmentStart
            ? new Date(data.treatmentStart).toISOString().split("T")[0]
            : "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        treatmentStart: form.treatmentStart
          ? new Date(form.treatmentStart).toISOString()
          : undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.message ?? "Save failed");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-gray-900 mb-1"
          style={{ fontFamily: "Cambria, serif" }}
        >
          Profile settings
        </h1>
        {profile?.email && (
          <p className="text-gray-500 text-sm">{profile.email}</p>
        )}
      </div>

      {/* Condition badge */}
      {profile?.condition && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-[#0F5D58]/5 rounded-xl border border-[#0F5D58]/10">
          <div className="w-8 h-8 rounded-full bg-[#0F5D58] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {profile.condition.name[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F5D58]">
              {profile.condition.name}
            </p>
            <p className="text-xs text-gray-500">Your current condition hub</p>
          </div>
          <Button asChild variant="link" size="sm" className="ml-auto">
            <a href="/onboarding">Change</a>
          </Button>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <h2 className="font-semibold text-gray-900">Personal details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <Input
              value={form.firstName}
              onChange={(e) =>
                setForm((p) => ({ ...p, firstName: e.target.value }))
              }
              placeholder="Alex"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <Input
              value={form.lastName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lastName: e.target.value }))
              }
              placeholder="Johnson"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP code
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={form.zipCode}
            onChange={(e) =>
              setForm((p) => ({ ...p, zipCode: e.target.value }))
            }
            placeholder="12345"
            maxLength={10}
          />
        </div>

        <div className="pt-2 border-t border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">
            Treatment details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication
              </label>
              <select
                value={form.drugName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, drugName: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5D58]"
              >
                <option value="">Select</option>
                {GLP1_DRUG_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment start date
              </label>
              <Input
                type="date"
                value={form.treatmentStart}
                onChange={(e) =>
                  setForm((p) => ({ ...p, treatmentStart: e.target.value }))
                }
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Treatment details are stored privately and are never shared with
            partners or sponsors.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </Button>
      </form>

      {/* Subscription */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Subscription</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {profile?.subscriptionTier ?? "FREE"}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          You&apos;re on the free plan. Premium features coming soon.
        </p>
      </div>

      {/* Data & Privacy */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Data & Privacy</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Export my data</p>
              <p className="text-xs text-gray-400">
                Download all your account data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Delete account</p>
              <p className="text-xs text-gray-400">
                Permanently delete your account and data
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Contact support
            </Button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
