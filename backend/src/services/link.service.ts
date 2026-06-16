import prisma from "../config/db.js";
import { generateCode } from "../utils/generateCode.js";

export async function createLink(url: string, user_id: string) {
  const shortCode = generateCode(6);

  const link = await prisma.links.create({
    data: {
      original_url: url,
      short_code: shortCode,
      user_id: user_id,
    },
  });

  return link;
}

export async function getOriginalUrlByCode(
  code: string,
): Promise<string | null> {
  const link = await prisma.links.findFirst({
    where: { OR: [{ short_code: code }, { custom_alias: code }] },
  });

  if (!link) return null;

  if (link.expires_at && new Date() > link.expires_at) {
    return null;
  }

  return link?.original_url;
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
