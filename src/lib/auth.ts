import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Demo user used when DEMO_MODE=true (no Supabase needed)
const DEMO_USER = {
  id: "demo-supabase-id-000000",
  email: "demo@velahealth.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as const;

function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export async function getServerSession() {
  if (isDemoMode()) return DEMO_USER;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function requireAuth() {
  const user = await getServerSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getServerSession();
  if (!user) redirect("/login");

  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!allowlist.includes(user.email ?? "")) {
    redirect("/dashboard");
  }

  return user;
}

export async function getOrCreateUser(supabaseId: string, email: string) {
  let user = await prisma.user.findUnique({ where: { supabaseId } });

  if (!user) {
    user = await prisma.user.create({
      data: { supabaseId, email },
    });
  }

  return user;
}
