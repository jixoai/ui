#!/usr/bin/env node
/**
 * ui.jixoai.com build orchestrator (scripts/build-site.mjs).
 *
 * Pipeline (order is load-bearing — see deploy.yml):
 *  0. Ensure @jixoai/vite-plugin has a build output (apps/www depends on
 *     it via file: and its dist/ is gitignored — a clean checkout has
 *     none; CI builds it in an explicit earlier step, so this prelude is
 *     the local-dev fallback, not the CI path).
 *  1. Build apps/www (SvelteKit + adapter-static) into apps/www/dist.
 *  2. Empty public/ (the committed registry JSON is regenerated next).
 *  2.5. Write public/CNAME (ui.jixoai.com) — the custom domain RIDES THE
 *     ARTIFACT: every deploy re-attaches ui.jixoai.com to the Pages
 *     target, so the advertised https://ui.jixoai.com/r/{name}.json
 *     install URLs never silently fall back to the jixoai.github.io/ui/
 *     subpath (where absolute /r/... links resolve wrong).
 *  3. Copy the site dist/* into public/ FIRST.
 *  4. Run `shadcn build` (root) which emits public/r/*.json — the registry
 *     paths (/r/<name>.json) keep working unchanged on the root domain.
 *  5. Assert the artifact is complete: index.html + r/registry.json +
 *     CNAME must coexist.
 *  6. Generate the AI-facing exports (llms.txt / llms-full.txt / per-page
 *     .md) from the FINAL public/ — after the registry JSON exists so the
 *     index can link it, and only here (never inside the vite build too:
 *     one generation point, the published artifact).
 *
 * Result: public/ is directly deployable (GitHub Pages) or previewable with
 * `python3 -m http.server` from the repo root.
 */

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateLlmsTxt } from "../registry/files/llms-txt/llms-txt.mjs";
import { resolveShadcnBin, resolveViteBin } from "./lib/vite-bin.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wwwDir = path.join(repoRoot, "apps", "www");
const wwwDist = path.join(wwwDir, "dist");
const publicDir = path.join(repoRoot, "public");
const pluginDir = path.join(repoRoot, "packages", "vite-plugin");
/** The custom domain rides the artifact (2026-08-30-registry-install-integrity
 *  task 3.1): GitHub Pages reads CNAME from the deploy root, so every
 *  artifact re-attaches ui.jixoai.com — the domain binding can no longer
 *  silently detach (the 2026-08-30 incident: Pages reported cname:null and
 *  every advertised /r/... install URL 404'd). */
const CUSTOM_DOMAIN = "ui.jixoai.com";

// The four frozen build outputs of @jixoai/vite-plugin (design.md D3:
// tsdown emits dist/index.js + dist/probe.js + dist/index.d.ts +
// dist/client.d.ts). apps/www consumes the package via file: and its
// vite.config.ts imports it, so the site build cannot even start when
// dist/ is absent — exactly the state of a clean checkout (dist/ is
// gitignored; binaries and build outputs never enter git).
const PLUGIN_DIST_ARTIFACTS = ["index.js", "probe.js", "index.d.ts", "client.d.ts"];

const die = (message) => {
  console.error(`[build-site] ${message}`);
  process.exit(1);
};

/** 0. @jixoai/vite-plugin prelude: apps/www's file: dependency points at
 *  packages/vite-plugin, whose dist/ is gitignored. On a clean checkout
 *  the exports map (./dist/index.js) resolves to nothing and the vite
 *  config's `import '@jixoai/vite-plugin'` fails before any page builds.
 *  Build the package when any of the four frozen artifacts is missing;
 *  skip when dist/ is already complete (local dev keeps its warm build —
 *  no rebuild per site build). CI does not rely on this fallback: deploy
 *  and upgrade workflows build the plugin in an explicit, auditable
 *  step before invoking this script. */
function ensureVitePluginDist() {
  const missing = PLUGIN_DIST_ARTIFACTS.filter(
    (artifact) => !existsSync(path.join(pluginDir, "dist", artifact)),
  );
  if (missing.length === 0) return;
  console.log(
    `[build-site] @jixoai/vite-plugin dist incomplete (missing ${missing.join(", ")}) — building packages/vite-plugin first`,
  );
  const ci = spawnSync("npm", ["ci"], { cwd: pluginDir, stdio: "inherit" });
  if (ci.status !== 0) {
    die(`npm ci in packages/vite-plugin failed (exit ${ci.status})`);
  }
  const build = spawnSync("npm", ["run", "build"], { cwd: pluginDir, stdio: "inherit" });
  if (build.status !== 0) {
    die(`@jixoai/vite-plugin build failed (exit ${build.status})`);
  }
  const stillMissing = PLUGIN_DIST_ARTIFACTS.filter(
    (artifact) => !existsSync(path.join(pluginDir, "dist", artifact)),
  );
  if (stillMissing.length > 0) {
    die(`packages/vite-plugin/dist is still missing ${stillMissing.join(", ")} after the build`);
  }
}

/** 1. Static site build. adapter-static empties apps/www/dist itself. */
function buildSite() {
  if (!existsSync(path.join(wwwDir, "node_modules"))) {
    die("apps/www/node_modules missing; run the install there first");
  }
  // runtime transparency: whatever runs THIS script also runs vite
  const result = spawnSync(process.execPath, [resolveViteBin(wwwDir), "build"], {
    cwd: wwwDir,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    die(`vite build failed (exit ${result.status})`);
  }
  for (const page of ["index.html", "docs.html", "docs/components.html", "tokens.html"]) {
    if (!existsSync(path.join(wwwDist, page))) {
      die(`site build did not emit ${page} into apps/www/dist`);
    }
  }
}

/** 2-3. Fresh public/: CNAME first (2.5), then site pages, registry JSON
 * on top. */
function publishPublic() {
  rmSync(publicDir, { recursive: true, force: true });
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(path.join(publicDir, "CNAME"), `${CUSTOM_DOMAIN}\n`);
  cpSync(wwwDist, publicDir, { recursive: true });
}

/** 3.5 Legacy doc-route shells (docs-restructure D1, 2026-08-25): the
 * frozen map (legacy-doc-routes.json) emits meta-refresh + canonical +
 * noindex shells for every pre-/docs URL, so external links (old
 * registry meta.href, llms mirrors) keep landing. JS only preserves
 * the fragment; no-js still reaches the new page. */
function emitLegacyShells() {
  const manifest = JSON.parse(readFileSync(path.join(repoRoot, "legacy-doc-routes.json"), "utf8"));
  let emitted = 0;
  for (const route of manifest.routes) {
    const fromRel = route.from.replace(/^\//, "");
    const target = path.join(publicDir, fromRel);
    mkdirSync(path.dirname(target), { recursive: true });
    const url = route.to + (route.preserveHash ? '" + location.hash + "' : "");
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${route.to}">
<link rel="canonical" href="https://ui.jixoai.com${route.to}">
<meta name="robots" content="noindex,follow">
<title>moved — ${route.to}</title>
<script>location.replace("${url}")</script>
</head>
<body><a href="${route.to}">moved to ${route.to}</a></body>
</html>
`;
    writeFileSync(target, html);
    // self-check the D1 contract at emit time (closed loop, race-free):
    // every shell must carry all four pieces before the build continues
    for (const piece of [
      `http-equiv="refresh" content="0;url=${route.to}"`,
      `rel="canonical" href="https://ui.jixoai.com${route.to}"`,
      "noindex,follow",
      `location.replace("${route.to}"`,
    ]) {
      if (!html.includes(piece)) {
        die(`legacy shell ${route.from} lost contract piece: ${piece}`);
      }
    }
    emitted++;
  }
  console.log(`[build-site] legacy shells: ${emitted} emitted from the frozen map`);
}

/** 4. Registry JSON: the shadcn CLI from the repo root → public/r/*.json.
 * Spawned directly (no `npm run` indirection — the root `build` script
 * no longer means shadcn since the scripts overhaul 2026-08-31). */
function buildRegistry() {
  const result = spawnSync(process.execPath, [resolveShadcnBin(repoRoot), "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
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
      // legacy redirect shells (docs-restructure D1): noindex passthroughs
      // must never enter the AI index — the canonical /docs tree is it
      "components.html",
      "components/**",
    ],
    sections: [
      {
        title: "Docs — the learning path",
        include: ["index.html", "docs.html", "tokens.html", "docs/recipes.html", "docs/jx-pure.html"],
      },
      {
        title: "Docs tooling",
        include: [
          "docs/components/component-canvas.html",
          "docs/llms-txt.html",
          "docs/components/website-scaffold.html",
          "docs/registry.html",
        ],
      },
      { title: "Components", include: ["docs/components/**"] },
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
  // mirror self-check (docs-restructure r2 P1-3): every canonical UI
  // page must have its .md mirror in the SAME generation — closes the
  // loop at generation time, immune to the shared-worktree races
  const registry = JSON.parse(readFileSync(path.join(repoRoot, "registry.json"), "utf8"));
  const mdExpectations = [
    ...registry.items
      .filter((item) => item.type === "registry:ui")
      .map((item) => item.meta.href),
    // the family hub + the sections/registry pages ship md mirrors too
    "/docs/components/form.html",
    "/docs/registry.html",
    "/docs/recipes.html",
    "/docs/jx-pure.html",
    "/docs/llms-txt.html",
  ];
  for (const href of mdExpectations) {
    const md = path.join(publicDir, href.replace(/\.html$/, ".md").slice(1));
    if (!existsSync(md)) {
      die(`llms mirror missing: ${md}`);
    }
  }
  const total = report.files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(
    `[build-site] llms-txt: ${report.pages} pages → ${report.files.length} files, ${total}B total`,
  );
}

function main() {
  console.log("[build-site] 0/8 ensuring @jixoai/vite-plugin dist (file: dep, gitignored output)");
  ensureVitePluginDist();
  console.log("[build-site] 1/8 building apps/www (SvelteKit static)");
  buildSite();
  console.log("[build-site] 2/8 emptying public/ — CNAME rides the artifact (2.5)");
  console.log("[build-site] 3/8 copying site dist → public/");
  publishPublic();
  console.log("[build-site] 4/8 emitting legacy doc-route shells");
  emitLegacyShells();
  console.log("[build-site] 5/8 building registry JSON → public/r/");
  buildRegistry();

  // Fail BEFORE generating the index: an index whose registry link 404s
  // must never be written, and an artifact without its domain would
  // detach ui.jixoai.com on the next deploy.
  const index = existsSync(path.join(publicDir, "index.html"));
  const registry = existsSync(path.join(publicDir, "r", "registry.json"));
  const cname = existsSync(path.join(publicDir, "CNAME"));
  if (!index) die("public/index.html missing after build");
  if (!registry) die("public/r/registry.json missing after shadcn build");
  if (!cname) die("public/CNAME missing after the prepare phase");

  console.log("[build-site] 6/8 asserted site + registry + CNAME coexist");
  console.log("[build-site] 7/8 generating llms.txt / llms-full.txt / page .md mirrors");
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
