#!/usr/bin/env node
/**
 * ui.jixoai.com build orchestrator (scripts/build-site.mjs).
 *
 * Pipeline (order is load-bearing — see deploy.yml):
 *  1. Build apps/www (SvelteKit + adapter-static) into apps/www/dist.
 *  2. Empty public/ (the committed registry JSON is regenerated next).
 *  3. Copy the site dist/* into public/ FIRST.
 *  4. Run `shadcn build` (root) which emits public/r/*.json — the registry
 *     paths (/r/<name>.json) keep working unchanged on the root domain.
 *  5. Assert both artifacts coexist (index.html + r/registry.json).
 *  6. Generate the AI-facing exports (llms.txt / llms-full.txt / per-page
 *     .md) from the FINAL public/ — after the registry JSON exists so the
 *     index can link it, and only here (never inside the vite build too:
 *     one generation point, the published artifact).
 *
 * Result: public/ is directly deployable (GitHub Pages) or previewable with
 * `python3 -m http.server` from the repo root.
 */

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateLlmsTxt } from "../registry/files/llms-txt/llms-txt.mjs";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wwwDir = path.join(repoRoot, "apps", "www");
const wwwDist = path.join(wwwDir, "dist");
const publicDir = path.join(repoRoot, "public");

const die = (message) => {
  console.error(`[build-site] ${message}`);
  process.exit(1);
};

/** vite's exports map hides ./bin/vite.js — resolve the package root through
 *  the exported ./package.json and join the bin path explicitly (same trick
 *  as unipty's www build script). */
function resolveViteBin() {
  const packageDir = path.dirname(require.resolve("vite/package.json", { paths: [wwwDir] }));
  const bin = path.join(packageDir, "bin", "vite.js");
  if (!existsSync(bin)) {
    die("cannot locate the vite binary; run `npm install` in apps/www first");
  }
  return bin;
}

/** 1. Static site build. adapter-static empties apps/www/dist itself. */
function buildSite() {
  if (!existsSync(path.join(wwwDir, "node_modules"))) {
    die("apps/www/node_modules missing; run `npm install` in apps/www first");
  }
  const result = spawnSync(process.execPath, [resolveViteBin(), "build"], {
    cwd: wwwDir,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    die(`vite build failed (exit ${result.status})`);
  }
  for (const page of ["index.html", "components.html", "tokens.html"]) {
    if (!existsSync(path.join(wwwDist, page))) {
      die(`site build did not emit ${page} into apps/www/dist`);
    }
  }
}

/** 2-3. Fresh public/: site pages first, registry JSON on top. */
function publishPublic() {
  rmSync(publicDir, { recursive: true, force: true });
  mkdirSync(publicDir, { recursive: true });
  cpSync(wwwDist, publicDir, { recursive: true });
}

/** 4. Registry JSON: `shadcn build` from the repo root → public/r/*.json. */
function buildRegistry() {
  if (!existsSync(path.join(repoRoot, "node_modules", "shadcn"))) {
    die("root node_modules/shadcn missing; run `npm install` at the repo root first");
  }
  const result = spawnSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
  if (result.status !== 0) {
    die(`shadcn build failed (exit ${result.status})`);
  }
}

/** 6. AI-facing exports from the FINAL public/ (llms.txt, llms-full.txt,
 * per-page .md). Config lives here — inline, next to the pipeline it owns.
 * The generator only touches its declared outputs and fails loudly on
 * hand-written .md conflicts or a llms-full.txt over the size cap. */
function generateAiExports() {
  const report = generateLlmsTxt(publicDir, {
    siteUrl: "https://ui.jixoai.com",
    title: "jixoai-ui — the terminal design language of jixoai",
    summary:
      "The jixoai design language as a shadcn registry: terminal / neo-brutalist, mono-first, one brand hue in OKLCH. Components, engines, the token law, and the website scaffold — all AI-consumable.",
    exclude: [
      "404.html",
      // the satori render farm — an internal, noindex playground
      "blueprints.html",
    ],
    sections: [
      {
        title: "Start here",
        include: ["index.html", "tokens.html", "components.html", "components/recipes.html"],
      },
      {
        title: "Docs tooling",
        include: [
          "components/component-canvas.html",
          "components/llms-txt.html",
          "components/website-scaffold.html",
        ],
      },
      { title: "Components & engines", include: ["components/**"] },
    ],
    additionalEntries: [
      {
        optional: true,
        name: "Registry index (machine-readable)",
        url: "/r/registry.json",
        description:
          "The full shadcn registry index; every item resolves as /r/{name}.json (npx jixoai-ui add {name}).",
      },
    ],
  });
  const total = report.files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(
    `[build-site] llms-txt: ${report.pages} pages → ${report.files.length} files, ${total}B total`,
  );
}

function main() {
  console.log("[build-site] 1/6 building apps/www (SvelteKit static)");
  buildSite();
  console.log("[build-site] 2/6 emptying public/");
  console.log("[build-site] 3/6 copying site dist → public/");
  publishPublic();
  console.log("[build-site] 4/6 building registry JSON → public/r/");
  buildRegistry();

  // Fail BEFORE generating the index: an index whose registry link 404s
  // must never be written.
  const index = existsSync(path.join(publicDir, "index.html"));
  const registry = existsSync(path.join(publicDir, "r", "registry.json"));
  if (!index) die("public/index.html missing after build");
  if (!registry) die("public/r/registry.json missing after shadcn build");

  console.log("[build-site] 5/6 asserted site + registry coexist");
  console.log("[build-site] 6/6 generating llms.txt / llms-full.txt / page .md mirrors");
  generateAiExports();
  if (!existsSync(path.join(publicDir, "llms.txt"))) {
    die("public/llms.txt missing after generation");
  }

  const items = readdirSync(path.join(publicDir, "r"));
  console.log(
    `[build-site] ok: site + registry + llms.txt coexist in public/ (${items.length} registry files: ${items.sort().join(", ")})`,
  );
  console.log("[build-site] preview: python3 -m http.server --directory public");
}

main();
