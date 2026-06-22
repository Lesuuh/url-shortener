import { UserTier, type Links } from "src/generated/prisma/client.js";
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

  // 🔑 Guard: Ensure matching Enum casing (e.g., 'PRO' vs 'BASIC')
  if (user.tier === UserTier.PRO) {
    expiresAt.setMonth(expiresAt.getMonth() + 6);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  // Fallback to avoid empty strings passing through as a custom alias
  const finalAlias =
    custom_alias && custom_alias.trim() !== "" ? custom_alias : null;
  const shortCode = finalAlias || generateCode(6);

  const link = await prisma.links.create({
    data: {
      original_url: url,
      short_code: shortCode,
      // 🔑 Double check your schema.prisma! If it says 'userId', change this key to 'userId'
      user_id: user_id,
      custom_alias: finalAlias,
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

export async function deleteLink(user_id: string, link_id: string) {
  const link = await prisma.links.findFirst({
    where: { id: link_id },
  });

  if (!link) throw new Error("Link not found");

  if (link && link.user_id !== user_id) throw new Error("UNAUTHORIZED");

  return prisma.links.delete({
    where: { id: link_id },
  });
}

export async function getUserLinks(user_id: string) {
  return await prisma.links.findMany({
    where: { user_id: user_id },
    orderBy: { createdAt: "desc" },
  });
}
