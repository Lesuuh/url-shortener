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
    const { url, custom_alias } = req.body;

    // 🔑 SECURITY FIX: Pull the ID safely from your auth middleware, NOT the body!
    const userId = (req as any).user_id;
    console.log(userId);

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        error:
          "Invalid URL format. Make sure it starts with http:// or https://",
      });
    }

    // 🔑 FIX: Await the database check properly right away
    if (custom_alias) {
      const isAliasTaken = await checkCustomAlias(custom_alias);
      if (isAliasTaken) {
        return res.status(400).json({
          error: `The custom alias '${custom_alias}' is already taken.`,
        });
      }
    }

    // 🔑 FIX: Pass all four arguments down to your corrected service function
    const link = await createLink(url, userId, custom_alias);

    const app_domain = process.env.APP_DOMAIN || "http://localhost:5000";

    const fullShortUrl = `${app_domain}/${link.short_code}`;

    return res.status(201).json({ link: { link, fullShortUrl } });
  } catch (error: any) {
    console.error("Link Creation Failure:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
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
      return res
        .status(404)
        .send("<h1>URL Not Found</h1><p>This short link does not exist.</p>");
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
  const { link_id } = (req as any).params;
  const user_id = (req as any).user_id;

  console.log(user_id);
  console.log(link_id);

  if (!user_id || !link_id) {
    return res
      .status(400)
      .json({ message: "User Id and link_id are required" });
  }

  try {
    await deleteLink(user_id, link_id);
    return res.json({ message: "Link deleted successfully" });
  } catch (error) {
    return res.status(500).json({ Error: "Internal server error" });
  }
}

export async function getUserLinksController(req: Request, res: Response) {
  const user_id = (req as any).user_id;

  if (!user_id) {
    return res.status(400).json({ message: "User Id is required" });
  }

  try {
    const allLinks = await getUserLinks(user_id);

    return res.status(200).json({ allLinks });
  } catch (error) {
    return res.status(500).json({ Error: "Internal server error" });
  }
}
