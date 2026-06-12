import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";

export default async function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-6">
        <Link
          href="/sponsor/dashboard"
          className="font-bold text-[#0F5D58]"
          style={{ fontFamily: "Cambria, serif" }}
        >
          Vela Health — Sponsor Portal
        </Link>
        <div className="ml-auto text-xs text-gray-400">Read-only view</div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
