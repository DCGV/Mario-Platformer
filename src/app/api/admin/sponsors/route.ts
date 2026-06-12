import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError, handleZodError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { z, ZodError } from "zod";

const sponsorSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  pilotType: z.enum(["FOUNDING", "STANDARD"]).default("FOUNDING"),
  contractedValue: z.number().positive().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(sponsors);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const input = sponsorSchema.parse(body);

    const sponsor = await prisma.sponsor.create({ data: input });

    return apiSuccess(sponsor);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
