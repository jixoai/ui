#!/usr/bin/env node
/**
 * jixoai-ui — the official jixoai design-language CLI (bin/jixoai-ui.mjs).
 *
 * Orthogonal intents (2026-08-20): components.json extension management;
 * brand-hue application; registry add delegation; locked idempotent upgrades.
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
 * (--brand-hue) on every init/add/hue/upgrade run.
 *
 * Install manifest (Owner decision, 2026-08-20): successful init/add runs
 * record every installed item in `jixoai-ui.lock` (next to components.json):
 *
 *   { "items": { "toc": { "files": { "src/lib/ui/toc.svelte": "<sha256>" } } } }
 *
 * Keys are install paths resolved through components.json aliases; hashes
 * cover CANONICAL registry content (pre-hue, pre-task). `upgrade` fetches
 * each locked item from registries["@jixoai"], writes only files whose
 * registry sha256 differs from the locked one, re-applies hue, then runs
 * the idempotent upgrade tasks (bin/upgrade-tasks.mjs) — a converged
 * second run performs zero writes.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";

import { upgradeTasks } from "./upgrade-tasks.mjs";

const REGISTRY_URL = "https://ui.jixoai.com/r/{name}.json";
const NAMESPACE = "@jixoai";
const THEME_ITEM = "jixoai-theme";
const DEFAULT_HUE = 0;
const LOCK_NAME = "jixoai-ui.lock";

const USAGE = `jixoai-ui — the jixoai design language CLI

Commands:
  jixoai-ui init [--hue <degrees>]   register the @jixoai namespace, add the
                                     jixoai config block, install the theme,
                                     and apply the brand hue
  jixoai-ui hue <degrees>            set the project brand hue (config + css)
  jixoai-ui adopt <item...>          baseline hand-installed items into the
                                     lock (first upgrade then syncs to canon)
  jixoai-ui add <item...>            install registry items (delegates to
                                     \`shadcn add ${NAMESPACE}/<item>\`), then
                                     re-applies the brand hue
  jixoai-ui upgrade                  refresh every locked item to the latest
                                     registry content, re-apply the brand
                                     hue, and run the idempotent upgrade
                                     tasks (repeat runs perform zero writes)
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

/* ── install manifest (jixoai-ui.lock) + shared install/upgrade core ── */

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function toPosix(path) {
  return path.split("\\").join("/");
}

function registryUrlFor(config) {
  const url = config.registries?.[NAMESPACE] ?? REGISTRY_URL;
  if (!url.includes("{name}")) {
    fail(`the ${NAMESPACE} registry url must contain a {name} template (got \`${url}\`)`);
  }
  return url;
}

async function fetchText(url) {
  // file:// registries are read from disk (local/offline development);
  // everything else goes through global fetch.
  if (url.startsWith("file:")) {
    return readFileSync(new URL(url), "utf8");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

async function fetchRegistryItem(registryUrl, name) {
  const url = registryUrl.replace("{name}", name);
  let raw;
  try {
    raw = await fetchText(url);
  } catch (cause) {
    throw new Error(`cannot fetch registry item \`${name}\` from ${url}: ${cause.message}`);
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`registry item \`${name}\` (${url}) is not valid JSON`);
  }
  if (!Array.isArray(json.files)) {
    throw new Error(`registry item \`${name}\` (${url}) has no files array`);
  }
  return json;
}

function assertRegistryFiles(name, files) {
  for (const file of files) {
    if (typeof file.target !== "string" || typeof file.content !== "string") {
      throw new Error(`registry item \`${name}\` has a file without string target/content`);
    }
  }
}

function resolveInstallPath(target, config, cwd) {
  // registry targets are alias-relative ("@ui/toc.svelte" → aliases.ui) or
  // plain project-relative paths; mirrors how shadcn places registry files.
  const match = /^@([\w.$-]+)(?:\/(.+))?$/.exec(target);
  if (match) {
    const base = config.aliases?.[match[1]];
    if (typeof base !== "string") {
      throw new Error(`cannot place \`${target}\`: components.json has no aliases.${match[1]}`);
    }
    return resolve(cwd, join(base, match[2] ?? ""));
  }
  return resolve(cwd, target);
}

function lockInstallKey(target, config, cwd) {
  return toPosix(relative(cwd, resolveInstallPath(target, config, cwd)));
}

function readLock(cwd, { required }) {
  const path = join(cwd, LOCK_NAME);
  if (!existsSync(path)) {
    if (required) {
      fail(
        `${LOCK_NAME} not found — nothing to upgrade. Install components first: \`npx jixoai-ui add <item>\``,
      );
    }
    return { path, lock: { items: {} }, existed: false };
  }
  let lock;
  try {
    lock = JSON.parse(readFileSync(path, "utf8"));
  } catch (cause) {
    fail(`${LOCK_NAME} is not valid JSON: ${cause.message}`);
  }
  if (
    typeof lock !== "object" || lock === null ||
    typeof lock.items !== "object" || lock.items === null
  ) {
    fail(
      `${LOCK_NAME} must contain an \`items\` map ({ items: { [name]: { files: { [path]: sha256 } } } })`,
    );
  }
  return { path, lock, existed: true };
}

function writeLock(path, lock) {
  writeFileSync(path, JSON.stringify(lock, null, 2) + "\n");
}

/**
 * Record freshly installed items in the lock. Shared by add/init; upgrade
 * reuses the same fetch/hash/place helpers. The install itself already
 * succeeded, so a recording failure warns instead of failing the command.
 */
async function recordInstalledItems(cwd, config, names) {
  const registryUrl = registryUrlFor(config);
  const { path, lock, existed } = readLock(cwd, { required: false });
  let recorded = 0;
  for (const name of names) {
    try {
      const item = await fetchRegistryItem(registryUrl, name);
      assertRegistryFiles(name, item.files);
      const files = {};
      for (const file of item.files) {
        files[lockInstallKey(file.target, config, cwd)] = sha256(file.content);
      }
      lock.items[name] = { ...(lock.items[name] ?? {}), files };
      recorded++;
      console.log(`jixoai-ui: locked ${name} (${Object.keys(files).length} file(s)) → ${path}`);
    } catch (cause) {
      console.warn(
        `jixoai-ui: ${cause.message} — ${name} not recorded in ${LOCK_NAME}; \`upgrade\` will skip it`,
      );
    }
  }
  if (recorded > 0 || existed) {
    writeLock(path, lock);
  }
}

/* ── upgrade ── */

function appCssCandidates(cwd, config, lock) {
  // site-scope files upgrade tasks may inspect: the app-level css pointed
  // at by components.json (tailwind.css) plus conventional locations,
  // minus anything already covered by the lock.
  const locked = new Set();
  for (const item of Object.values(lock.items)) {
    for (const key of Object.keys(item.files ?? {})) locked.add(key);
  }
  const candidates = new Set();
  const tailwindCss = config.tailwind?.css;
  if (typeof tailwindCss === "string" && tailwindCss) candidates.add(toPosix(tailwindCss));
  for (const fallback of ["src/app.css", "app.css", "src/app.postcss", "src/styles/globals.css"]) {
    candidates.add(fallback);
  }
  return [...candidates].filter((key) => !locked.has(key) && existsSync(resolve(cwd, key)));
}

function taskContext(cwd, item, key) {
  const filePath = resolve(cwd, key);
  return {
    cwd,
    item, // registry item name, or null for site-scope entries
    path: key,
    filePath,
    get content() {
      return readFileSync(filePath, "utf8");
    },
    read: () => readFileSync(filePath, "utf8"),
    write: (next) => writeFileSync(filePath, next),
    log: (message) => console.log(`jixoai-ui: ${message}`),
    warn: (message) => console.warn(`jixoai-ui: ${message}`),
  };
}

function runUpgradeTasks(cwd, config, lock) {
  const contexts = [];
  for (const [name, item] of Object.entries(lock.items)) {
    for (const key of Object.keys(item.files ?? {})) {
      if (existsSync(resolve(cwd, key))) contexts.push(taskContext(cwd, name, key));
    }
  }
  for (const key of appCssCandidates(cwd, config, lock)) {
    contexts.push(taskContext(cwd, null, key));
  }
  let ran = 0;
  let skipped = 0;
  for (const task of upgradeTasks) {
    let taskRan = false;
    for (const ctx of contexts) {
      if (task.item && task.item !== ctx.item) continue;
      if (!task.applies(ctx.read(), ctx)) continue;
      task.run(ctx);
      taskRan = true;
    }
    if (taskRan) ran++;
    else skipped++;
  }
  return { ran, skipped };
}

async function runUpgrade(cwd, config) {
  const registryUrl = registryUrlFor(config);
  const { path: lockPath, lock } = readLock(cwd, { required: true });
  const names = Object.keys(lock.items);
  if (names.length === 0) {
    fail(`${LOCK_NAME} records no items — install one first: \`npx jixoai-ui add <item>\``);
  }

  let updated = 0;
  let unchanged = 0;
  for (const name of names) {
    let item;
    try {
      item = await fetchRegistryItem(registryUrl, name);
    } catch (cause) {
      fail(`upgrade aborted while fetching \`${name}\`: ${cause.message}`);
    }
    assertRegistryFiles(name, item.files);
    const previous = lock.items[name]?.files ?? {};
    const files = {};
    for (const file of item.files) {
      const key = lockInstallKey(file.target, config, cwd);
      const hash = sha256(file.content);
      files[key] = hash;
      if (previous[key] === hash && existsSync(resolve(cwd, key))) {
        unchanged++; // registry content identical to the locked install
        continue;
      }
      const filePath = resolve(cwd, key);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, file.content);
      updated++;
      console.log(`jixoai-ui: updated ${name} → ${key}`);
    }
    lock.items[name] = { files };
    writeLock(lockPath, lock); // persist per item so an abort keeps progress
  }

  applyHue(themeCssPath(config, cwd), config.jixoai?.brandHue ?? DEFAULT_HUE);

  const tasks = runUpgradeTasks(cwd, config, lock);

  writeLock(lockPath, lock);
  console.log(
    `jixoai-ui: upgrade complete — updated ${updated}, unchanged ${unchanged}, ` +
      `tasks ran ${tasks.ran}, skipped ${tasks.skipped}`,
  );
  console.log(`jixoai-ui: ${LOCK_NAME} updated → ${lockPath}`);
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
    await recordInstalledItems(cwd, readConfig(cwd).config, [THEME_ITEM]);
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
    await recordInstalledItems(cwd, readConfig(cwd).config, rest);
    break;
  }
  case "adopt": {
    // Hand-installed sites (same-source copies) have no lock yet. adopt
    // baselines the CURRENT disk content of the named items into the lock:
    // the first `upgrade` afterwards diffs registry canon against this
    // baseline, applies changes + hue, and the lock flips to canonical
    // hashes — subsequent upgrades are fully idempotent.
    const names = rest.filter((a) => !a.startsWith("--"));
    if (names.length === 0) {
      fail("adopt needs item names (e.g. `adopt toc jixoai-theme`) — items whose files live at their components.json targets");
    }
    const { config } = readConfig(cwd);
    const { path, lock } = readLock(cwd, { required: false });
    let recorded = 0;
    for (const name of names) {
      const item = await fetchRegistryItem(registryUrlFor(config), name);
      assertRegistryFiles(name, item.files);
      const files = {};
      const missing = [];
      for (const file of item.files) {
        const abs = resolveInstallPath(file.target, config, cwd);
        if (!existsSync(abs)) { missing.push(file.target); continue; }
        files[lockInstallKey(file.target, config, cwd)] = sha256(readFileSync(abs, "utf8"));
      }
      if (missing.length === item.files.length) {
        console.warn(`jixoai-ui: no files of ${name} found at their targets — skipped`);
        continue;
      }
      if (missing.length > 0) {
        console.warn(`jixoai-ui: ${name} partially present (missing ${missing.join(", ")}) — locked the rest; partial files will restore on next upgrade`);
      }
      lock.items[name] = { files };
      recorded++;
      console.log(`jixoai-ui: adopted ${name} (${Object.keys(files).length} file(s)) → ${path}`);
    }
    if (recorded === 0) fail("nothing adopted");
    writeLock(path, lock);
    console.log("jixoai-ui: baseline recorded — run `jixoai-ui upgrade` to sync to registry canon");
    break;
  }
  case "upgrade": {
    const { config } = readConfig(cwd);
    await runUpgrade(cwd, config);
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
