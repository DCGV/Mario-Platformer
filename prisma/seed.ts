import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create GLP-1 condition
  const glp1 = await prisma.condition.upsert({
    where: { slug: "glp-1" },
    update: {},
    create: {
      name: "GLP-1 Therapy",
      slug: "glp-1",
      description:
        "GLP-1 receptor agonists (Ozempic, Wegovy, Mounjaro, Zepbound) are medications used for type 2 diabetes management and weight loss.",
      tagline: "Managing your GLP-1 journey",
      iconUrl: "💉",
      active: true,
      displayOrder: 0,
    },
  });

  console.log("✓ Condition: GLP-1 Therapy");

  // Seed partners
  const partners = [
    {
      name: "NourishRx",
      slug: "nourishrx",
      tagline: "Personalized dietitian support for GLP-1 patients",
      description:
        "NourishRx connects GLP-1 patients with registered dietitians who specialize in medication-assisted weight management. Their clinicians are trained in GLP-1 side effects, protein preservation, and metabolic health.",
      websiteUrl: "https://nourishrx.com",
      affiliateBaseUrl: "https://nourishrx.com/velahealth",
      tier: "CLINICAL" as const,
      category: "DIETITIAN" as const,
      isFeatured: true,
      featuredBadge: "Clinical Partner",
      displayOrder: 0,
      commissionRate: 0.15,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 5,
        evidenceBase: 4,
        patientSafety: 5,
        businessIntegrity: 4,
        notes: "Strong evidence base for dietitian support in GLP-1 adherence.",
      },
    },
    {
      name: "Ro Weight",
      slug: "ro-weight",
      tagline: "Telehealth + GLP-1 prescriptions, delivered",
      description:
        "Ro is a telehealth platform offering GLP-1 prescriptions, ongoing clinical support, and lab monitoring for patients on weight management therapy. Board-certified physicians available 7 days a week.",
      websiteUrl: "https://ro.co",
      affiliateBaseUrl: "https://ro.co/weight?utm_partner=vela",
      tier: "CLINICAL" as const,
      category: "TELEHEALTH" as const,
      isFeatured: true,
      featuredBadge: "Staff Pick",
      displayOrder: 1,
      commissionRate: 0.2,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 5,
        evidenceBase: 5,
        patientSafety: 5,
        businessIntegrity: 5,
        notes: "Top-tier telehealth with strong GLP-1 specific protocols.",
      },
    },
    {
      name: "Calibrate",
      slug: "calibrate",
      tagline: "The metabolic health company",
      description:
        "Calibrate pairs GLP-1 medication with a year-long metabolic health program including dietitian coaching, behavioral health, and lab testing. Focused on sustainable outcomes, not just weight loss.",
      websiteUrl: "https://calibrate.com",
      affiliateBaseUrl: "https://calibrate.com/vela",
      tier: "CLINICAL" as const,
      category: "TELEHEALTH" as const,
      isFeatured: false,
      displayOrder: 2,
      commissionRate: 0.18,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 5,
        evidenceBase: 4,
        patientSafety: 5,
        businessIntegrity: 4,
        notes: "Comprehensive metabolic program, strong outcomes data.",
      },
    },
    {
      name: "Dexcom",
      slug: "dexcom",
      tagline: "Continuous glucose monitoring for smarter decisions",
      description:
        "Dexcom's G7 CGM lets GLP-1 patients track how food, activity, and their medication affects their glucose in real time. Particularly valuable for Type 2 diabetes patients on Ozempic or Mounjaro.",
      websiteUrl: "https://dexcom.com",
      affiliateBaseUrl: "https://dexcom.com/en-us/get-dexcom",
      tier: "CLINICAL" as const,
      category: "CGM" as const,
      isFeatured: true,
      featuredBadge: "Clinical Partner",
      displayOrder: 3,
      commissionRate: 0.12,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 5,
        evidenceBase: 5,
        patientSafety: 5,
        businessIntegrity: 5,
        notes: "FDA-cleared, gold standard CGM with strong clinical evidence.",
      },
    },
    {
      name: "Instacart",
      slug: "instacart",
      tagline: "Grocery delivery that supports your nutrition goals",
      description:
        "Instacart makes it easy to stock up on high-protein, low-processed foods that align with GLP-1 dietary recommendations — without the willpower tax of navigating a grocery store while managing appetite changes.",
      websiteUrl: "https://instacart.com",
      affiliateBaseUrl: "https://instacart.com/velahealth",
      tier: "SUPPORTIVE" as const,
      category: "MEAL_KIT" as const,
      isFeatured: false,
      displayOrder: 4,
      commissionRate: 0.05,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 3,
        evidenceBase: 3,
        patientSafety: 5,
        businessIntegrity: 5,
        notes: "Practical barrier removal for nutrition adherence.",
      },
    },
    {
      name: "GoodRx",
      slug: "goodrx",
      tagline: "Save on GLP-1 prescriptions",
      description:
        "GoodRx helps patients find the lowest price on GLP-1 medications at local pharmacies. With brand-name GLP-1 drugs often exceeding $1,000/month without insurance, GoodRx coupons can reduce out-of-pocket costs significantly.",
      websiteUrl: "https://goodrx.com",
      affiliateBaseUrl: "https://goodrx.com/glp1?ref=vela",
      tier: "FINANCIAL" as const,
      category: "SAVINGS" as const,
      isFeatured: true,
      featuredBadge: "Savings Partner",
      displayOrder: 5,
      commissionRate: 0.08,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 4,
        evidenceBase: 4,
        patientSafety: 5,
        businessIntegrity: 5,
        notes: "Critical for financial adherence. High patient impact.",
      },
    },
    {
      name: "Noom Med",
      slug: "noom-med",
      tagline: "Psychology-based program with GLP-1 support",
      description:
        "Noom Med combines behavioral psychology coaching with GLP-1 medication management. Their approach addresses the mental and behavioral aspects of weight management that medication alone doesn't solve.",
      websiteUrl: "https://noom.com",
      affiliateBaseUrl: "https://noom.com/med/vela",
      tier: "SUPPORTIVE" as const,
      category: "MENTAL_HEALTH" as const,
      isFeatured: false,
      displayOrder: 6,
      commissionRate: 0.15,
      vettingStatus: "APPROVED" as const,
      vettingScore: {
        clinicalRelevance: 4,
        evidenceBase: 4,
        patientSafety: 5,
        businessIntegrity: 4,
        notes: "Strong behavioral health component complements GLP-1 therapy.",
      },
    },
    {
      name: "Hims & Hers",
      slug: "hims-hers",
      tagline: "GLP-1 compounded medications at lower cost",
      description:
        "Hims & Hers offers compounded semaglutide and tirzepatide at significantly lower prices than brand-name alternatives, helping patients stay on therapy when insurance coverage gaps occur.",
      websiteUrl: "https://forhers.com",
      affiliateBaseUrl: "https://forhers.com/weight-loss?ref=vela",
      tier: "FINANCIAL" as const,
      category: "PHARMACY" as const,
      isFeatured: false,
      displayOrder: 7,
      commissionRate: 0.2,
      vettingStatus: "PENDING" as const,
      vettingScore: null,
    },
  ];

  for (const partnerData of partners) {
    const { vettingScore, ...rest } = partnerData;
    const partner = await prisma.partner.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        vettingScore: vettingScore ?? undefined,
        conditions: {
          create: [{ conditionId: glp1.id }],
        },
      },
    });

    // Create benefits for approved partners
    if (rest.vettingStatus === "APPROVED") {
      await createBenefitsForPartner(partner.id, rest.slug, glp1.id);
    }
  }

  console.log(`✓ Partners: ${partners.length} created`);
  console.log("✓ Seed complete");
}

async function createBenefitsForPartner(
  partnerId: string,
  slug: string,
  conditionId: string
) {
  const benefitData: Record<
    string,
    {
      title: string;
      description: string;
      valueDescription: string;
      ctaText: string;
      discountType: "PERCENTAGE" | "FREE_CONSULTATION" | "FIXED_AMOUNT" | "FREE_TRIAL";
      displayOrder: number;
    }[]
  > = {
    nourishrx: [
      {
        title: "Free 30-minute GLP-1 nutrition consultation",
        description:
          "Book a free 30-minute session with a registered dietitian who specializes in GLP-1 therapy side effects, protein intake optimization, and long-term metabolic health.",
        valueDescription: "Free 30-min consultation",
        ctaText: "Book free session",
        discountType: "FREE_CONSULTATION",
        displayOrder: 0,
      },
      {
        title: "20% off first month of dietitian coaching",
        description:
          "Get 20% off your first month of ongoing one-on-one dietitian coaching. Includes weekly check-ins, meal planning, and GLP-1 side effect management.",
        valueDescription: "20% off first month",
        ctaText: "Get 20% off",
        discountType: "PERCENTAGE",
        displayOrder: 1,
      },
    ],
    "ro-weight": [
      {
        title: "Free online consultation with a weight care physician",
        description:
          "Start your GLP-1 journey with a free assessment from a Ro-affiliated weight care physician. Get a personalized treatment plan if you qualify.",
        valueDescription: "Free consultation",
        ctaText: "Start free consultation",
        discountType: "FREE_CONSULTATION",
        displayOrder: 0,
      },
    ],
    calibrate: [
      {
        title: "Free metabolic health assessment",
        description:
          "Get a comprehensive metabolic health assessment from Calibrate, including lab review and a personalized program recommendation.",
        valueDescription: "Free metabolic assessment",
        ctaText: "Get free assessment",
        discountType: "FREE_CONSULTATION",
        displayOrder: 0,
      },
    ],
    dexcom: [
      {
        title: "Save $30 on Dexcom G7 Starter Kit",
        description:
          "Get $30 off your first Dexcom G7 continuous glucose monitor kit. Monitor your glucose response to GLP-1 therapy and dietary changes in real time.",
        valueDescription: "Save $30 on G7 Starter Kit",
        ctaText: "Claim $30 off",
        discountType: "FIXED_AMOUNT",
        displayOrder: 0,
      },
    ],
    instacart: [
      {
        title: "Free Instacart+ trial (3 months)",
        description:
          "Get 3 months of Instacart+ free, including unlimited free delivery on orders over $35. Use it to maintain a protein-rich, GLP-1-aligned diet without the grocery store trip.",
        valueDescription: "3-month free Instacart+ trial",
        ctaText: "Start free trial",
        discountType: "FREE_TRIAL",
        displayOrder: 0,
      },
    ],
    goodrx: [
      {
        title: "GLP-1 prescription savings coupon",
        description:
          "Access GoodRx coupons that can reduce the cost of Ozempic, Wegovy, Mounjaro, and Zepbound at participating pharmacies. Savings vary by pharmacy and location.",
        valueDescription: "Up to 80% off GLP-1 prescriptions",
        ctaText: "Get free coupon",
        discountType: "PERCENTAGE",
        displayOrder: 0,
      },
    ],
    "noom-med": [
      {
        title: "14-day free Noom Med trial",
        description:
          "Try Noom Med free for 14 days. Access the full behavioral coaching program designed to work alongside GLP-1 medication for sustainable weight management.",
        valueDescription: "14-day free trial",
        ctaText: "Start free trial",
        discountType: "FREE_TRIAL",
        displayOrder: 0,
      },
    ],
  };

  const benefits = benefitData[slug];
  if (!benefits) return;

  for (const benefit of benefits) {
    const ctaPath = `/go/${slug}-benefit`;
    const existing = await prisma.benefit.findFirst({
      where: { partnerId, title: benefit.title },
    });

    if (!existing) {
      const created = await prisma.benefit.create({
        data: {
          ...benefit,
          partnerId,
          ctaPath,
          active: true,
        },
      });

      await prisma.benefitCondition.upsert({
        where: {
          benefitId_conditionId: {
            benefitId: created.id,
            conditionId,
          },
        },
        update: {},
        create: { benefitId: created.id, conditionId },
      });
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
