import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3
              className="text-white font-bold text-lg mb-3"
              style={{ fontFamily: "Cambria, serif" }}
            >
              Vela Health
            </h3>
            <p className="text-sm leading-relaxed">
              The rewards-and-perks ecosystem for GLP-1 patients. Curated,
              condition-specific, and aligned with your treatment.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hub/glp-1" className="hover:text-white transition-colors">
                  GLP-1 Hub
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-white transition-colors">
                  My Rewards
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-gray-500 space-y-2">
          <p>
            Vela Health is not a medical provider. Content is for informational
            purposes only. Benefits listed do not constitute medical advice or
            endorsement. Always consult your healthcare provider before making
            treatment decisions.
          </p>
          <p>© {new Date().getFullYear()} Vela Health. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
