import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly type the cache store: key is template name, value is Handlebars template function
const templateCache = new Map<string, Handlebars.TemplateDelegate>();

export async function compileEmailTemplate<T extends object>(
  templateName: string,
  data: T,
): Promise<string> {
  if (!templateCache.has(templateName)) {
    const filePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${templateName}.hbs`,
    );
    const source = await fs.readFile(filePath, "utf-8");
    const compiled = Handlebars.compile<T>(source);
    templateCache.set(templateName, compiled as Handlebars.TemplateDelegate);
  }

  const template = templateCache.get(templateName)!;
  return template(data);
}

export default compileEmailTemplate;
