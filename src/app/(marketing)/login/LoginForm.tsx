"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
      setMessage(`Check your email at ${email} for a sign-in link.`);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "Cambria, serif" }}
          >
            Sign in to Vela Health
          </h1>
          <p className="text-sm text-gray-500">
            We&apos;ll send a magic link to your email
          </p>
        </div>

        {state === "sent" ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium mb-1">Check your email</p>
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={state === "loading"}
                autoComplete="email"
              />
            </div>

            {message && state === "error" && (
              <p className="text-sm text-red-600" role="alert">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={state === "loading"}>
              {state === "loading" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#0F5D58] hover:underline">
            Join free
          </Link>
        </p>
      </div>
    </div>
  );
}
