import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/benefits", label: "Benefits" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/sponsors", label: "Sponsors" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!allowlist.includes(user.email ?? "")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-14 flex items-center px-6 gap-6">
        <Link href="/admin" className="font-bold text-[#0F5D58]" style={{ fontFamily: "Cambria, serif" }}>
          Vela Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {ADMIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-600 hover:text-[#0F5D58] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">
            ← Patient view
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
