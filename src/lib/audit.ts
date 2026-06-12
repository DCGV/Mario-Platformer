import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AuditAction =
  | "USER_CREATED"
  | "PARTNER_VETTED"
  | "VETTING_STATUS_CHANGED"
  | "REDEMPTION_CREATED"
  | "ADMIN_LOGIN"
  | "PARTNER_CREATED"
  | "PARTNER_UPDATED"
  | "PARTNER_DELETED";

export async function createAuditLog(params: {
  userId?: string;
  adminId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        ...params,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Audit logging must never crash the app
  }
}
