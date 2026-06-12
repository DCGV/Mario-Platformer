import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api";

export async function GET() {
  try {
    const conditions = await prisma.condition.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        heroImageUrl: true,
        tagline: true,
        active: true,
        displayOrder: true,
      },
    });

    return apiSuccess(conditions);
  } catch (err) {
    return handleServerError(err);
  }
}
