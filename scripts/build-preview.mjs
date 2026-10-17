import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

// The preview runner may append a SPA-only --config argument. TanStack Start
// must always build with the app's config, which supplies its virtual entries.
const require = createRequire(import.meta.url);
const viteBin = require.resolve("vite/bin/vite.js");

const result = spawnSync(
  process.execPath,
  [viteBin, "build", "--mode", "development", "--config", "vite.config.ts"],
  { stdio: "inherit", env: process.env },
);

if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
