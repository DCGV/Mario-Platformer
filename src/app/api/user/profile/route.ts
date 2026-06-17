import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError, handleZodError } from "@/lib/api";
import { userProfileSchema } from "@/lib/validations";
import { getServerSession, getOrCreateUser } from "@/lib/auth";
import { ZodError } from "zod";

export async function GET() {
  try {
    const supabaseUser = await getServerSession();
    if (!supabaseUser) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        zipCode: true,
        drugName: true,
        treatmentStart: true,
        subscriptionTier: true,
        onboardingCompletedAt: true,
        createdAt: true,
        condition: {
          select: { id: true, name: true, slug: true, tagline: true },
        },
      },
    });

    if (!user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    return apiSuccess(user);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabaseUser = await getServerSession();
    if (!supabaseUser) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const input = userProfileSchema.parse(body);

    const user = await getOrCreateUser(supabaseUser.id, supabaseUser.email!);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...input,
        treatmentStart: input.treatmentStart
          ? new Date(input.treatmentStart)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        zipCode: true,
        drugName: true,
        treatmentStart: true,
        subscriptionTier: true,
        onboardingCompletedAt: true,
        condition: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return apiSuccess(updated);
  } catch (err) {
    if (err instanceof ZodError) return handleZodError(err);
    return handleServerError(err);
  }
}
