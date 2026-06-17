import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { MedicalDisclaimer } from "@/components/shared/MedicalDisclaimer";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  return (
    <AppShell>
      <MedicalDisclaimer />
      {children}
    </AppShell>
  );
}
