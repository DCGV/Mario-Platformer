import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerCard } from "@/components/partner/PartnerCard";
import Link from "next/link";
import { WaitlistForm } from "./WaitlistForm";

async function getFeaturedPartners() {
  try {
    return await prisma.partner.findMany({
      where: { active: true, vettingStatus: "APPROVED", isFeatured: true },
      take: 3,
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        logoUrl: true,
        tier: true,
        category: true,
        isFeatured: true,
        featuredBadge: true,
        benefits: {
          where: { active: true },
          take: 1,
          select: { valueDescription: true, ctaText: true },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const featuredPartners = await getFeaturedPartners();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F5D58] to-[#0a4440] text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#5EEAD4] text-sm font-semibold uppercase tracking-widest mb-4">
            GLP-1 Patient Benefits Hub
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: "Cambria, serif" }}
          >
            The GLP-1 support hub that rewards your progress
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Curated, condition-specific benefits — dietitians, labs, savings, and
            more — designed to keep you on therapy and thriving.
          </p>

          <WaitlistForm />

          <p className="text-xs text-white/40 mt-4">
            Join free. No credit card required.
          </p>
        </div>
      </section>

      {/* Treatment timeline graphic */}
      <section className="bg-white py-8 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#5EEAD4]/40 -translate-y-1/2" />
            {["Start", "Month 1", "Month 3", "Month 6", "Year 1+"].map(
              (label, i) => (
                <div key={label} className="relative flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      i === 0
                        ? "bg-[#0F5D58] border-[#0F5D58]"
                        : "bg-white border-[#5EEAD4]"
                    }`}
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">
                    {label}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Featured partners */}
      {featuredPartners.length > 0 && (
        <section className="py-20 px-4 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold text-gray-900 mb-3"
                style={{ fontFamily: "Cambria, serif" }}
              >
                Curated benefits, not ads
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Every partner is vetted for clinical relevance, patient safety,
                and business integrity before appearing in your hub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  {...partner}
                  benefit={partner.benefits[0]}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Button asChild size="lg">
                <Link href="/signup">See all benefits</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "Cambria, serif" }}
            >
              How Vela Health works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Join free",
                body: "Create your account and tell us which GLP-1 therapy you're on. No clinical data required.",
              },
              {
                step: "2",
                title: "Discover curated benefits",
                body: "Browse your personalized hub — vetted dietitians, labs, CGMs, savings programs, and more.",
              },
              {
                step: "3",
                title: "Save and earn",
                body: "Unlock discounts and track your savings as you engage with your care ecosystem.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#0F5D58] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For physicians */}
      <section
        id="physicians"
        className="py-20 px-4 bg-gradient-to-br from-[#0F5D58]/5 to-[#5EEAD4]/10"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "Cambria, serif" }}
          >
            For healthcare providers
          </h2>
          <p className="text-gray-600 mb-8">
            Refer your GLP-1 patients to Vela Health. We help them find the
            resources to stay on therapy — no clinical data shared with us.
          </p>
          <PhysicianWaitlistForm />
        </div>
      </section>
    </div>
  );
}

function PhysicianWaitlistForm() {
  return (
    <form
      action="/api/waitlist"
      method="POST"
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <Input
        type="email"
        name="email"
        placeholder="your@practice.com"
        required
        aria-label="Email address"
        className="flex-1"
      />
      <input type="hidden" name="source" value="physician_landing" />
      <Button type="submit">Get early access</Button>
    </form>
  );
}
