import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Attachment } from "resend";

// backend/src/utils -> <repo>/frontend-app/public/logo.png
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.resolve(
  __dirname,
  "../../../frontend-app/public/logo.png",
);

let cached: Attachment[] | null = null;

/** Inline brand logo for emails — referenced from templates via
 *  <img src="cid:knot-logo.png">. Read once and reused across sends. */
export function emailLogoAttachments(): Attachment[] {
  if (!cached) {
    cached = [
      {
        filename: "knot-logo.png",
        content: fs.readFileSync(logoPath),
        contentType: "image/png",
        contentId: "knot-logo.png",
      },
    ];
  }
  return cached;
}