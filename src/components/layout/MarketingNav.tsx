import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-xl text-[#0F5D58]"
          style={{ fontFamily: "Cambria, serif" }}
        >
          Vela Health
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/about" className="hover:text-[#0F5D58] transition-colors">
            About
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#0F5D58] transition-colors">
            How it works
          </Link>
          <Link href="/#physicians" className="hover:text-[#0F5D58] transition-colors">
            For Physicians
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Join free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
