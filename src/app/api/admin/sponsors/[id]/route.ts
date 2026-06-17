import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { z, ZodError } from "zod";
import { SponsorStatus } from "@prisma/client";

const updateSchema = z.object({
  status: z.nativeEnum(SponsorStatus).optional(),
  pilotStart: z.string().datetime().optional(),
  pilotEnd: z.string().datetime().optional(),
  contractedValue: z.number().positive().optional(),
  notes: z.string().optional(),
  analyticsAccess: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.sponsor.findUnique({ where: { id } });
    if (!existing) {
      return apiError("NOT_FOUND", "Sponsor not found", 404);
    }

    const body = await req.json();
    const input = updateSchema.parse(body);

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        ...input,
        pilotStart: input.pilotStart ? new Date(input.pilotStart) : undefined,
        pilotEnd: input.pilotEnd ? new Date(input.pilotEnd) : undefined,
      },
    });

    return apiSuccess(sponsor);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
