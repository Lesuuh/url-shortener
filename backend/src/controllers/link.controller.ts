import { type Request, type Response } from "express";
import {
  checkCustomAlias,
  createLink,
  deleteLink,
  getOriginalUrlByCode,
  getUserLinks,
} from "src/services/link.service";

function isValidUrl(url_string: string): boolean {
  const url = new URL(url_string);
  try {
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

export async function createLinkController(req: Request, res: Response) {
  try {
    const url = req.body?.url;
    const custom_alias = req.body?.custom_alias;

    if (custom_alias) {
      const existingCustomAlias = checkCustomAlias(custom_alias);
      if (await existingCustomAlias) {
        return res.status(400).json({
          error: `The custom alias '${custom_alias}' is already taken.`,
        });
      }
    }
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        error:
          "Invalid URL format. Make sure it starts with http:// or https://",
      });
    }

    const userId = req.body?.user_id;
    const link = await createLink(url, userId, custom_alias);
    return res.status(201).json({ link });
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
    const link = await getOriginalUrlByCode(safeCode);

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (link.expires_at && new Date() > link.expires_at) {
      return res.status(410).send("<h1>This link has expired</h1>");
    }
    return res.redirect(302, link.original_url);
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
