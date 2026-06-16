import { type Request, type Response } from "express";
import {
  createLink,
  deleteLink,
  getOriginalUrlByCode,
  getUserLinks,
} from "src/services/link.service";

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
    res.status(500).json({ message: "Internal Server Error" });
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

export async function deleteLinkController(req: Request, res: Response) {
  const user_id = req.body?.user_id;
  const short_code = req.body?.short_code;

  if (!user_id || !short_code) {
    return res
      .status(400)
      .json({ message: "User Id and short_code are required" });
  }

  try {
    await deleteLink(user_id, short_code);
    return res.json({ message: "Link deleted successfully" });
  } catch (error) {
    return res.status(500).json({ Error: "Internal server error" });
  }
}

export async function getUserLinksController(req: Request, res: Response) {
  const user_id = req.body?.user_id;

  if (!user_id) {
    return res.status(400).json({ message: "User Id is required" });
  }

  try {
    const allLinks = await getUserLinks(user_id);
  } catch (error) {
    return res.status(500).json({ Error: "Internal server error" });
  }
}
