/**
 * Cross-platform build script:
 * 1. Install & build the product app (app/)
 * 2. Build the landing page
 * 3. Copy app/dist/* → dist/app/
 */
import { execSync } from "child_process";
import { cpSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function run(cmd, cwd = root) {
  console.log(`\n▶ ${cmd}  (in ${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

// 1. Build the product app
const appDir = resolve(root, "app");
run("npm install", appDir);
run("npx vite build", appDir);          // skip tsc for speed on CI

// 2. Build the landing page
run("npx vite build", root);

// 3. Copy app dist into landing page dist/app/
const src = resolve(appDir, "dist");
const dest = resolve(root, "dist", "app");
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log("\n✅ Combined build complete — dist/ includes landing + /app");
