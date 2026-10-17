import { spawnSync } from "node:child_process";

// The preview runner may append a SPA-only --config argument. TanStack Start
// must always build with the app's config, which supplies its virtual entries.
const result = spawnSync(
  "vite",
  ["build", "--mode", "development", "--config", "vite.config.ts"],
  { stdio: "inherit", env: process.env },
);

if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);