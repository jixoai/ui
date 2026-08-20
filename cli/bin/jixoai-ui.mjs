#!/usr/bin/env node
/**
 * jixoai-ui — the official jixoai design-language CLI (bin/jixoai-ui.mjs).
 *
 * Orthogonal intents (2026-08-20): components.json extension management;
 * brand-hue application; registry add delegation.
 *
 * Config contract (Owner decision, 2026-08-20): the CLI SHARES shadcn's
 * components.json and extends it with a non-conflicting `jixoai` object:
 *
 *   {
 *     ...shadcn fields (style, aliases, registries, ...) untouched...,
 *     "registries": { "@jixoai": "https://ui.jixoai.com/r/{name}.json" },
 *     "jixoai": { "brandHue": 160 }
 *   }
 *
 * The registry URL points at the official Pages-hosted registry; hue lives
 * in ONE config field and is written into the installed jixoai.css
 * (--brand-hue) on every init/add/hue run.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const REGISTRY_URL = "https://ui.jixoai.com/r/{name}.json";
const NAMESPACE = "@jixoai";
const THEME_ITEM = "jixoai-theme";
const DEFAULT_HUE = 0;

const USAGE = `jixoai-ui — the jixoai design language CLI

Commands:
  jixoai-ui init [--hue <degrees>]   register the @jixoai namespace, add the
                                     jixoai config block, install the theme,
                                     and apply the brand hue
  jixoai-ui hue <degrees>            set the project brand hue (config + css)
  jixoai-ui add <item...>            install registry items (delegates to
                                     \`shadcn add ${NAMESPACE}/<item>\`), then
                                     re-applies the brand hue
  jixoai-ui config                   print the resolved jixoai config

The CLI extends shadcn's components.json — run \`npx shadcn init\` first in
projects that don't have one yet.`;

function fail(message) {
  console.error(`jixoai-ui: ${message}`);
  process.exit(1);
}

function readConfig(cwd) {
  const path = join(cwd, "components.json");
  if (!existsSync(path)) {
    fail(
      "components.json not found. Run `npx shadcn init` first — this CLI extends shadcn's config, it does not replace it.",
    );
  }
  return { path, config: JSON.parse(readFileSync(path, "utf8")) };
}

function writeConfig(path, config) {
  writeFileSync(path, JSON.stringify(config, null, 2) + "\n");
}

function ensureNamespace(config) {
  config.registries ??= {};
  config.registries[NAMESPACE] ??= REGISTRY_URL;
  if (config.registries[NAMESPACE] !== REGISTRY_URL) {
    console.warn(
      `jixoai-ui: keeping existing ${NAMESPACE} registry url (${config.registries[NAMESPACE]})`,
    );
  }
}

function themeCssPath(config, cwd) {
  const lib = config.aliases?.lib;
  if (typeof lib !== "string") return null;
  const candidates = [resolve(cwd, lib, "jixoai.css"), resolve(cwd, `${lib}.css`)];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function applyHue(cssPath, hue) {
  if (!cssPath) {
    console.warn(
      "jixoai-ui: jixoai.css not found yet — the hue will be applied on the next init/add.",
    );
    return;
  }
  const css = readFileSync(cssPath, "utf8");
  const next = css.replace(/--brand-hue:\s*[\d.]+/, `--brand-hue: ${hue}`);
  if (next !== css) {
    writeFileSync(cssPath, next);
    console.log(`jixoai-ui: --brand-hue: ${hue} → ${cssPath}`);
  }
}

function shadcn(args, cwd, configPath, config) {
  // shadcn 4.18 rejects unknown top-level keys (our jixoai block), so the
  // extension fields are stripped for the call and restored afterwards.
  const { jixoai, ...rest } = config;
  writeConfig(configPath, rest);
  const result = spawnSync(
    "npx",
    ["--yes", "shadcn", ...args, "--yes"],
    { stdio: "inherit", cwd, env: { ...process.env, npm_config_yes: "true" } },
  );
  if (result.status !== 0) {
    writeConfig(configPath, config); // restore even on failure
    fail(`\`shadcn ${args.join(" ")}\` exited with ${result.status}`);
  }
  const after = readConfig(cwd);
  after.config.jixoai = jixoai;
  writeConfig(after.path, after.config);
}

function hueFromArgs(args, fallback = DEFAULT_HUE) {
  // accepts --hue <n> OR a bare positional degree value
  const positional = args.find((a, i) => i > 0 && Number.isFinite(Number(a)));
  const index = args.indexOf("--hue");
  const value = index !== -1 ? Number(args[index + 1]) : (positional !== undefined ? Number(positional) : fallback);
  if (!Number.isFinite(value) || value < 0 || value >= 360) {
    fail("hue must be a number in [0, 360)");
  }
  return Math.round(value);
}

const [command, ...rest] = process.argv.slice(2);
const cwd = process.cwd();

switch (command) {
  case "init": {
    const { path, config } = readConfig(cwd);
    const hue = hueFromArgs(rest, config.jixoai?.brandHue ?? DEFAULT_HUE);
    ensureNamespace(config);
    config.jixoai = { ...(config.jixoai ?? {}), brandHue: hue };
    writeConfig(path, config);
    console.log(`jixoai-ui: ${NAMESPACE} namespace + jixoai config written → ${path}`);
    shadcn(["add", `${NAMESPACE}/${THEME_ITEM}`], cwd, path, config);
    applyHue(themeCssPath(config, cwd), hue);
    break;
  }
  case "hue": {
    const hue = hueFromArgs(["--hue", rest[0]]);
    const { path, config } = readConfig(cwd);
    config.jixoai = { ...(config.jixoai ?? {}), brandHue: hue };
    writeConfig(path, config);
    applyHue(themeCssPath(config, cwd), hue);
    break;
  }
  case "add": {
    if (rest.length === 0) fail("add needs at least one item name (e.g. `toc`)");
    const { path, config } = readConfig(cwd);
    const hue = config.jixoai?.brandHue ?? DEFAULT_HUE;
    for (const item of rest) {
      shadcn(["add", `${NAMESPACE}/${item}`], cwd, path, readConfig(cwd).config);
    }
    applyHue(themeCssPath(config, cwd), hue);
    break;
  }
  case "config": {
    const { config } = readConfig(cwd);
    console.log(JSON.stringify({ registry: REGISTRY_URL, ...config.jixoai }, null, 2));
    break;
  }
  default:
    console.log(USAGE);
    process.exit(command && command !== "help" && command !== "--help" ? 1 : 0);
}
