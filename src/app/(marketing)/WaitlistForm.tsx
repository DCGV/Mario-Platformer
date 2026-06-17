"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, conditionInterest: "GLP-1", source: "landing_hero" }),
      });

      const json = await res.json();

      if (!res.ok && res.status !== 409) {
        setState("error");
        setMessage(json.error?.message ?? "Something went wrong.");
        return;
      }

      setState("success");
      setMessage("You're on the list! We'll be in touch soon.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        aria-label="Email address"
        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400"
        disabled={state === "loading" || state === "success"}
      />
      <Button
        type="submit"
        disabled={state === "loading" || state === "success"}
        className="bg-[#5EEAD4] text-[#0F5D58] hover:bg-[#4dd4be] font-semibold"
        size="lg"
      >
        {state === "loading" ? "Joining…" : "Get early access"}
      </Button>

      {message && (
        <p
          className={`sm:col-span-2 text-sm text-center w-full mt-1 ${
            state === "error" ? "text-red-300" : "text-[#5EEAD4]"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
