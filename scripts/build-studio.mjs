#!/usr/bin/env node
/**
 * build-studio.mjs — the studio chrome static bundle (issue #18,
 * foundation round).
 *
 * What this produces: packages/design-tool/dist-studio (gitignored) —
 * a prebuilt, zero-host-coupled vite bundle of the studio chrome:
 *   input   packages/design-tool/src/studio/studio-static.html
 *           → ./studio-static-entry.js (mountStudio — the package
 *             default shell) + ./studio-static.css (the tailwind
 *             fan-in over registry/files/theme) + the icons CSS
 *   aliases #jixoai/* → registry/files/ui, $lib → apps/www/src/lib
 *           (the monorepo-fixed twin of the design server's vehicle
 *           alias table — probe.ts)
 *   output  index.html + hashed assets under base '/__design__/',
 *           hosted by the design server (create.ts serveStudioIndex /
 *           serveStudioAsset) + build-manifest.json (the content hash
 *           of every input tree — the CLI's staleness oracle)
 *
 * Why the plugin set resolves from the REGISTRY vehicle install: this
 * repository installs per-vehicle (registry/, apps/www/), never at the
 * root — the same moduleRoot discipline as create.ts; ESM-only
 * packages (@jixoai/ui-vite-plugin) need resolvePackageEntry, not
 * require.resolve. The svelte per-file alias table (one runtime copy
 * across the registry + www trees) is imported from the design-tool
 * package source so the dev server and this build cannot drift.
 *
 * Usage: npm run build:studio          (repo root)
 *        npm run dev:studio            (rebuild on change)
 */

import { existsSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { probeDesignHost } from "../packages/design-tool/src/server/probe.ts";
import { resolvePackageEntry } from "../packages/design-tool/src/server/resolver.ts";
import { svelteFileAliases } from "../packages/design-tool/src/server/svelte-aliases.ts";
import { writeStudioBuildManifest } from "../packages/design-tool/src/server/studio-dist.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgDir = join(repoRoot, "packages", "design-tool");
const outDir = join(pkgDir, "dist-studio");
const studioHtml = join(pkgDir, "src", "studio", "studio-static.html");

const die = (message) => {
  console.error(`[build-studio] ${message}`);
  process.exit(1);
};

// the moduleRoot discipline (create.ts): the plugin set resolves from
// the vehicle install the probe finds — registry/ OR apps/www/,
// whichever carries the complete set (file: symlinks land the plugin
// in either, depending on where the last install ran)
let moduleRoot = probeDesignHost(repoRoot).moduleRoot;
if (moduleRoot === null) {
  moduleRoot = probeDesignHost(resolve(pkgDir, "../..")).moduleRoot;
}

/** resolve + import a plugin-set member through the moduleRoot install */
async function importFromModuleRoot(spec) {
  const entry = moduleRoot === null ? null : resolvePackageEntry(moduleRoot, spec);
  const url = entry === null ? spec : pathToFileURL(entry).href;
  try {
    return await import(url);
  } catch (cause) {
    if (spec === "@jixoai/ui-vite-plugin" || spec.startsWith("@jixoai/ui-vite-plugin/")) {
      die(
        `cannot resolve ${spec} (moduleRoot: ${moduleRoot ?? "plain bare imports"}) — packages/vite-plugin has no dist ` +
          `(file: dependency, gitignored build output). Build it first: cd packages/vite-plugin && npm install && npm run build`,
      );
    }
    die(
      `cannot resolve ${spec} (moduleRoot: ${moduleRoot ?? "plain bare imports"}): ${cause.message}. ` +
        `A worktree that rebased onto new dependencies needs its install refreshed first (AGENTS: rebase → install → build).`,
    );
  }
}

/** pick a function export across module shapes (named / default-wrapped / default) */
function exportFn(mod, name, spec) {
  const record = mod;
  const candidates = [record[name], record.default?.[name], record.default];
  for (const candidate of candidates) {
    if (typeof candidate === "function") return candidate;
  }
  die(`${spec} exposes no usable "${name}" export (keys: ${Object.keys(record).join(", ")})`);
}

/* ── the plugin matrix (create.ts:370-377, same parameters) ───────────── */

const viteMod = await importFromModuleRoot("vite");
const svelteMod = await importFromModuleRoot("@sveltejs/vite-plugin-svelte");
const tailwindMod = await importFromModuleRoot("@tailwindcss/vite");
const jixoaiMod = await importFromModuleRoot("@jixoai/ui-vite-plugin");
const lucideMod = await importFromModuleRoot("@jixoai/ui-vite-plugin/icons");
const mdMod = await importFromModuleRoot("@jixoai/ui-vite-plugin/icons/md");
const phMod = await importFromModuleRoot("@jixoai/ui-vite-plugin/icons/ph");
const rxMod = await importFromModuleRoot("@jixoai/ui-vite-plugin/icons/rx");

const build = exportFn(viteMod, "build", "vite");
const svelteFactory = exportFn(svelteMod, "svelte", "@sveltejs/vite-plugin-svelte");
const tailwindFactory = exportFn(tailwindMod, "tailwindcss", "@tailwindcss/vite");
const jixoaiFactory = exportFn(jixoaiMod, "jixoai", "@jixoai/ui-vite-plugin");
const lucideFactory = exportFn(lucideMod, "lucideIconProvider", "@jixoai/ui-vite-plugin/icons");
const mdFactory = exportFn(mdMod, "md", "@jixoai/ui-vite-plugin/icons/md");
const phFactory = exportFn(phMod, "ph", "@jixoai/ui-vite-plugin/icons/ph");
const rxFactor = exportFn(rxMod, "rx", "@jixoai/ui-vite-plugin/icons/rx");

// ghostty OFF, icons channels ON — the design server's exact matrix
// (create.ts:370-377): the studio resolves no wasm at startup and
// scans only md:/ph:/rx: literals (studio sources carry none).
const jixoaiPlugins = jixoaiFactory({
  ghostty: false,
  icons: {
    provider: lucideFactory(),
    safety: { mode: "warn" },
    library: { includeDefaults: true, channels: [mdFactory(), phFactory(), rxFactor()] },
  },
});
const iconsPlugin = jixoaiPlugins.find((plugin) => plugin.name === "jixoai-icons");
if (!iconsPlugin) {
  die("jixoai({ icons }) did not register the jixoai-icons plugin — the icon pipeline is mandatory");
}

/** the icons-css bridge — copied verbatim in spirit from the www
 * production precedent (apps/www/vite.config.ts jixoaiIconsCssEntry /
 * create.ts designIconsCssEntryPlugin): the .css-suffixed virtual id
 * loads through the icons plugin's OWN load hook in BUILD mode too */
function jixoaiIconsCssEntry() {
  const SPECIFIER = "virtual:jixoai-icons.css";
  const RESOLVED_ID = "\0virtual:jixoai-icons.css";
  return {
    name: "studio-build-jixoai-icons-css-entry",
    enforce: "pre",
    resolveId(id) {
      if (id === SPECIFIER) return RESOLVED_ID;
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const load = iconsPlugin.load;
      if (typeof load !== "function") {
        die("jixoai-icons plugin exposes no load hook");
      }
      return load.call(this, "virtual:jixoai-icons");
    },
  };
}

/** write build-manifest.json after every SUCCESSFUL (re)build — watch
 * mode included; skipped when the output never landed (a failed build
 * must surface ITS error, not a manifest ENOENT). Also normalizes the
 * emitted document name: vite names the html after its INPUT
 * (studio-static.html) — the server, the CLI and the manifest all
 * address the bundle's document as index.html (POSIX rename overwrites
 * the stale copy on every watch rebuild) */
function studioManifestPlugin() {
  return {
    name: "studio-build-manifest",
    closeBundle() {
      // vite preserves the input's root-relative path: the document
      // lands at dist-studio/src/studio/studio-static.html — promote it
      // to dist-studio/index.html (the name the server, the CLI and
      // the manifest all address) and drop the emptied input tree
      const emitted = join(outDir, "src", "studio", "studio-static.html");
      const index = join(outDir, "index.html");
      if (existsSync(emitted)) {
        renameSync(emitted, index);
        rmSync(join(outDir, "src"), { recursive: true, force: true });
      }
      if (!existsSync(index)) return;
      const manifest = writeStudioBuildManifest(repoRoot, outDir, moduleRoot);
      console.log(
        `[build-studio] manifest: inputsHash ${manifest.inputsHash.slice(0, 16)}… (vite ${manifest.vite}, svelte ${manifest.svelte})`,
      );
    },
  };
}

/* ── the build ────────────────────────────────────────────────────────── */

if (!existsSync(studioHtml)) die(`missing build input: ${studioHtml}`);

const watch = process.argv.includes("--watch");

await build({
  root: pkgDir,
  configFile: false,
  base: "/__design__/",
  logLevel: "info",
  plugins: [svelteFactory(), tailwindFactory(), ...jixoaiPlugins, jixoaiIconsCssEntry(), studioManifestPlugin()],
  resolve: {
    // the monorepo-fixed twin of the design server's vehicle alias
    // table (create.ts:382-387): the prebuilt chrome compiles the
    // REAL registry sources — zero host coupling by ruling
    alias: [
      { find: /^#jixoai\//, replacement: `${join(repoRoot, "registry/files/ui").replaceAll("\\", "/")}/` },
      { find: /^\$lib\//, replacement: `${join(repoRoot, "apps/www/src/lib").replaceAll("\\", "/")}/` },
      ...svelteFileAliases(moduleRoot),
    ],
  },
  build: {
    outDir: "dist-studio",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: { input: studioHtml },
    ...(watch ? { watch: {} } : {}),
  },
});

if (!watch) {
  if (!existsSync(join(outDir, "index.html"))) {
    die(`the build did not emit ${join(outDir, "index.html")}`);
  }
  console.log(`[build-studio] ok: static studio bundle at ${outDir} (serve: jixoai-ui design → /__design__/)`);
}
