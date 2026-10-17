import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// The preview runner may append a SPA-only --config argument. TanStack Start
// must always build with the app's config, which supplies its virtual entries.
const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));

const result = spawnSync(
  process.execPath,
  [viteBin, "build", "--mode", "development", "--config", "vite.config.ts"],
  { stdio: "inherit", env: process.env },
);

if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
