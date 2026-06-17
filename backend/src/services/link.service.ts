import type { Links } from "src/generated/prisma/client.js";
import prisma from "../config/db.js";
import { generateCode } from "../utils/generateCode.js";

export async function createLink(
  url: string,
  user_id: string,
  custom_alias?: string,
) {
  // 1. Fetch the user to find out their tier
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  const expiresAt = new Date();

  if (user.tier === "PRO") {
    expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months for pro
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month for basic
  }

  const shortCode = custom_alias || generateCode(6);

  const link = await prisma.links.create({
    data: {
      original_url: url,
      short_code: shortCode,
      user_id: user_id,
      custom_alias: custom_alias ?? null,
      expires_at: expiresAt,
    },
  });

  return link;
}

export async function checkCustomAlias(custom_alias: string) {
  return await prisma.links.findFirst({
    where: { custom_alias: custom_alias },
  });
}

export async function getOriginalUrlByCode(
  code: string,
): Promise<Links | null> {
  return await prisma.links.findFirst({
    where: { OR: [{ short_code: code }, { custom_alias: code }] },
  });
}

export async function deleteLink(user_id: string, short_code: string) {
  const link = await prisma.links.findFirst({
    where: { short_code: short_code },
  });

  if (!link) throw new Error("Link not found");

  if (link && link.user_id !== user_id) throw new Error("UNAUTHORIZED");

  return prisma.links.delete({
    where: { short_code: short_code },
  });
}

export async function getUserLinks(user_id: string) {
  return await prisma.links.findMany({
    where: { user_id: user_id },
    orderBy: { createdAt: "desc" },
  });
}
