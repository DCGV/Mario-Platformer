import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { partnerSchema, vettingSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { ZodError, z } from "zod";

const updateSchema = partnerSchema.partial().merge(vettingSchema.partial());

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return apiError("NOT_FOUND", "Partner not found", 404);
    }

    const body = await req.json();
    const input = updateSchema.parse(body);

    const { conditionIds, commissionRate, ...partnerData } = input as z.infer<typeof partnerSchema> & z.infer<typeof vettingSchema>;

    const vettingStatusChanged =
      input.vettingStatus && input.vettingStatus !== existing.vettingStatus;

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        ...partnerData,
        ...(commissionRate !== undefined ? { commissionRate } : {}),
        ...(input.vettingStatus
          ? {
              vettingStatus: input.vettingStatus,
              vettedBy: admin.id,
              vettedAt: new Date(),
            }
          : {}),
        ...(input.vettingScore ? { vettingScore: input.vettingScore } : {}),
        ...(input.vettingNotes !== undefined
          ? { vettingNotes: input.vettingNotes }
          : {}),
        ...(conditionIds !== undefined
          ? {
              conditions: {
                deleteMany: {},
                create: conditionIds.map((conditionId) => ({ conditionId })),
              },
            }
          : {}),
      },
    });

    if (vettingStatusChanged) {
      await createAuditLog({
        adminId: admin.id,
        action: "VETTING_STATUS_CHANGED",
        entityType: "Partner",
        entityId: id,
        metadata: {
          from: existing.vettingStatus,
          to: input.vettingStatus,
          score: input.vettingScore,
        },
      });
    } else {
      await createAuditLog({
        adminId: admin.id,
        action: "PARTNER_UPDATED",
        entityType: "Partner",
        entityId: id,
      });
    }

    return apiSuccess(partner);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return apiError("NOT_FOUND", "Partner not found", 404);
    }

    // Soft delete
    await prisma.partner.update({ where: { id }, data: { active: false } });

    await createAuditLog({
      adminId: admin.id,
      action: "PARTNER_DELETED",
      entityType: "Partner",
      entityId: id,
      metadata: { name: existing.name },
    });

    return apiSuccess({ success: true });
  } catch (err) {
    return handleServerError(err);
  }
}
