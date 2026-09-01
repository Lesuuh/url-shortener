// Post-build: Node ESM requires explicit file extensions on relative imports,
// but the Prisma-generated client (and any hand-written TS) emits them without
// extensions under `moduleResolution: bundler`. Rewrite compiled .js output so
// runtime `node dist/server.js` resolves correctly. Idempotent.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "..", "dist");

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(js|mjs)$/.test(full)) files.push(full);
  }
})(distDir);

const fileExists = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};

// from "./foo" / from "../foo" without an explicit JS/JSON extension
const RE = /(from\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g;
let changed = 0;

for (const file of files) {
  const dir = dirname(file);
  const src = readFileSync(file, "utf8");
  const out = src.replace(RE, (m, pre, p, post) => {
    const path = p.trim();
    if (/\.(js|mjs|cjs|json)$/.test(path)) return m;
    if (fileExists(join(dir, `${path}.js`))) {
      changed++;
      return `${pre}${path}.js${post}`;
    }
    return m;
  });
  if (out !== src) writeFileSync(file, out);
}

console.log(`fix-imports: normalized ${changed} relative import(s) in dist`);
