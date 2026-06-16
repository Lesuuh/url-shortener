import { type Request, type Response } from "express";
import { createLink, getOriginalUrlByCode } from "src/services/link.service";

export async function createLinkController(req: Request, res: Response) {
  try {
    const url = req.body?.url;
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }
    const userId = req.body?.user_id;
    const link = await createLink(url, userId);
    return res.json({ link });
  } catch (error) {
    res.status(500).json({ message: "Error creating short link" });
  }
}

export async function redirectToOriginalUrlController(
  req: Request,
  res: Response,
) {
  const { code } = req.params;

  const safeCode = Array.isArray(code) ? code[0] : code;

  if (!safeCode) {
    return res.status(400).json({ error: "Short code is required" });
  }
  try {
    const originalUrl = await getOriginalUrlByCode(safeCode);

    if (!originalUrl) {
      return res.status(404).json({ message: "Link not found" });
    }

    return res.redirect(302, originalUrl);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
