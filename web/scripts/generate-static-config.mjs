import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.dirname(webDir);
const envFile = path.join(webDir, ".env.local");
const outFile = path.join(repoRoot, "supabase-config.js");

function parseEnv(content) {
  const values = new Map();

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s][^=]*)=(.*)$/);
    if (!match) continue;

    const value = match[2].trim().replace(/^["']|["']$/g, "");
    values.set(match[1].trim(), value);
  }

  return values;
}

let env;

try {
  env = parseEnv(await readFile(envFile, "utf8"));
} catch {
  console.error(`Could not read ${path.relative(repoRoot, envFile)}.`);
  console.error("Copy web/.env.example to web/.env.local first.");
  process.exit(1);
}

const url = env.get("NEXT_PUBLIC_SUPABASE_URL");
const key = env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.");
  process.exit(1);
}

if (!key.startsWith("sb_publishable_")) {
  console.error("Refusing to write a non-publishable key. Use the publishable key only.");
  process.exit(1);
}

const output = `// Public Supabase config for the static GitHub Pages site.
// This is the publishable key, which is designed for browser use.
// Row-level security in web/supabase/schema.sql protects writes.
window.SABEER_SUPABASE = {
  url: ${JSON.stringify(url.replace(/\/$/, ""))},
  key: ${JSON.stringify(key)}
};
`;

await writeFile(outFile, output, "utf8");
console.log(`Wrote ${path.relative(repoRoot, outFile)} from web/.env.local.`);
