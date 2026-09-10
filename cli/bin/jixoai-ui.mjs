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
 *
 * Install integrity (consumer-feedback-fixes P0-3, 2026-09-06): "successful"
 * means VERIFIED ON DISK — an item enters the lock only when every one of
 * its files exists at its alias-resolved path (a non-interactive shadcn run
 * whose overwrite prompt hits EOF cancels its write phase; the item then
 * stays unlocked with an explicit recovery warning). After every add phase
 * the CLI also relocates files shadcn dropped into literal `src/@lib/`,
 * `src/@ui/` and `src/vite-plugins/` directories to their alias-resolved
 * destinations, and item-name parsing skips `--` tokens (flags never
 * masquerade as `@jixoai/--help`).
 *
 * Release hygiene (2026-09-13, npm issues #2/#1/#8):
 *   #2  `--css <path>` overrides the whole aliases.lib hunt for the theme
 *       sheet and is REMEMBERED as `jixoai.cssPath` in components.json
 *       (one flag fixes every later run). The $-alias resolver now reads
 *       wildcard-only tables (`$lib` via a `$lib/*` mapping) and follows
 *       `extends` chains (SvelteKit keeps the real map in
 *       .svelte-kit/tsconfig.json). A standalone `hue` that cannot locate
 *       the css FAILS with the exact way out (--css or paths) instead of
 *       promising a next-run application that would fail identically.
 *   #1  under non-interactive stdin the run forwards `--overwrite`
 *       itself (same intent as the forced `--yes`: shadcn's confirm
 *       cannot be answered at EOF — it cancels the WHOLE write phase),
 *       and install-integrity refusals now exit non-zero — a canceled
 *       install is a failed install, never a green exit.
 *   #8  `--registry <dir|url>` overrides registries["@jixoai"] for one
 *       run (a local directory of <name>.json payloads becomes a
 *       file://{name} template; http(s) mirrors pass through) — the
 *       spawned shadcn gets the same override for its own fetches, with
 *       the configured url restored afterwards. Fetch failures carry
 *       the way out: retry, local mirror, and the stale-npx trap
 *       (`npx jixoai-ui@latest`).
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

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
                                     re-applies the brand hue. Group
                                     aliases: \`add effects\` installs
                                     every ui item in the group,
                                     \`add effects/glass\` installs one
                                     member
  jixoai-ui upgrade                  refresh every locked item to the latest
                                     registry content, re-apply the brand
                                     hue, and run the idempotent upgrade
                                     tasks (repeat runs perform zero writes)
  jixoai-ui config                   print the resolved jixoai config
  jixoai-ui design [--port <n>]
                   [--agent dsh|echo|none]
                   [--no-open]      start the design studio (prototype
                                     canvas on real components, agent
                                     chat, one vite server — see
                                     \`jixoai-ui design --help\`)

Flags:
  --css <path>        (init/hue/add/upgrade) where jixoai.css lives —
                      overrides the aliases.lib resolution when the $lib
                      alias has no tsconfig paths mapping; remembered in
                      components.json as jixoai.cssPath
  --registry <dir|url>
                      (init/add/adopt/upgrade) override the @jixoai
                      registry for this run — a local directory of
                      <name>.json payloads, or a url template containing
                      {name} (file:// or an http(s) mirror); the spawned
                      shadcn fetches the same override (http(s) only —
                      shadcn cannot read file://)
  --overwrite         (init/add) forwarded to shadcn; implied when stdin
                      is non-interactive (the overwrite confirm cannot be
                      answered at EOF — it cancels the whole write phase)

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

/* ── $-alias resolution (effect-attachments Lane H, 2026-09-10;
 *    release-hygiene #2, 2026-09-13) ──
 *
 * shadcn-svelte consumers carry `$lib`-ROOTED alias values
 * (`"ui": "$lib/ui"` — the frozen table the clean-install harness
 * proves; plain-vite consumers mandate `"lib": "$lib"` outright, the
 * env-debt-cleanup alias shape). A literal `$lib` directory never
 * exists on disk, so every alias base must first resolve through the
 * project's tsconfig/jsconfig `compilerOptions.paths` (the same map
 * shadcn itself resolves aliases with) before it becomes a filesystem
 * path. Before this, `add` on such consumers installed fine but the
 * lock found ZERO files at "(no) install path" and recorded nothing —
 * `upgrade` went dead while the files sat in place.
 *
 * Release-hygiene #2 closed the two shapes the direct-table pass
 * missed, both observed on plain-vite consumers whose `hue` never
 * applied: a BARE base (`$lib`) against a wildcard-only table
 * (`{"$lib/*": ["src/lib/*"]}` — the exact-key entry is absent), and
 * `extends`-chained configs (SvelteKit's standard layout keeps the
 * real map in ./.svelte-kit/tsconfig.json). A base that maps nowhere
 * keeps its literal meaning — and `themeCssPath` treats that as the
 * actionable failure it is (see cssNotFoundMessage), never as a
 * silent "next run will fix it". */
const aliasResolverCache = new Map(); // cwd → (base → resolved base)

function tsconfigPathsFor(cwd) {
  // walk the config graph breadth-first: the DIRECT table wins; extends
  // targets (relative to their extending config, or bare package
  // specifiers through node_modules) enqueue behind jsconfig.json so a
  // sibling jsconfig still outranks an inherited table
  const queue = [join(cwd, "tsconfig.json"), join(cwd, "jsconfig.json")];
  const visited = new Set();
  for (let depth = 0; queue.length > 0 && depth < 8; depth++) {
    const path = queue.shift();
    if (!path || visited.has(path) || !existsSync(path)) continue;
    visited.add(path);
    let config;
    try {
      config = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue; // comments/trailing commas: an unparseable config is not fatal
    }
    const paths = config?.compilerOptions?.paths;
    if (paths && typeof paths === "object") return paths;
    const ext = config?.extends;
    const refs = Array.isArray(ext) ? ext : typeof ext === "string" ? [ext] : [];
    for (const ref of refs) {
      const base = ref.startsWith(".")
        ? resolve(dirname(path), ref)
        : resolve(cwd, "node_modules", ref);
      queue.push(base.endsWith(".json") ? base : `${base}.json`);
    }
  }
  return null;
}

function aliasBaseResolver(cwd) {
  if (aliasResolverCache.has(cwd)) return aliasResolverCache.get(cwd);
  const paths = tsconfigPathsFor(cwd);
  const star = (v) => String(Array.isArray(v) ? v[0] ?? "" : v ?? "").replace(/\*$/, "");
  const resolveBase = (base) => {
    if (!paths || !base.startsWith("$")) return base;
    if (paths[base] !== undefined) return star(paths[base]);
    // wildcard keys: `$lib/*` owns BOTH `$lib/ui` and the bare `$lib`
    // itself (release-hygiene #2 — the bare base used to fall through
    // to the literal `$lib` and hue never applied). The boundary is
    // exact-or-slash so `$library` never rides a `$lib` mapping.
    const wildcards = Object.keys(paths)
      .filter((k) => k.endsWith("/*"))
      .map((k) => k.slice(0, -2)) // '$lib/*' → '$lib'
      .sort((a, b) => b.length - a.length); // longest prefix wins
    for (const prefix of wildcards) {
      if (base !== prefix && !base.startsWith(`${prefix}/`)) continue;
      const target = star(paths[`${prefix}/*`]);
      return base === prefix ? target : target + base.slice(prefix.length);
    }
    return base;
  };
  aliasResolverCache.set(cwd, resolveBase);
  return resolveBase;
}

/** an alias VALUE (`"$lib/ui"` / `"src/lib/ui"`) → a cwd-relative path */
function aliasDir(aliasValue, cwd) {
  return resolve(cwd, aliasBaseResolver(cwd)(aliasValue));
}

function themeCssPath(config, cwd) {
  // an explicit --css (remembered as jixoai.cssPath) outranks the whole
  // alias hunt — the release-hygiene #2 escape hatch for consumers whose
  // $lib maps nowhere
  const configured = config.jixoai?.cssPath;
  if (typeof configured === "string" && configured) {
    const candidate = resolve(cwd, configured);
    if (existsSync(candidate)) return candidate;
  }
  const lib = config.aliases?.lib;
  if (typeof lib !== "string") return null;
  const base = aliasBaseResolver(cwd)(lib);
  const candidates = [resolve(cwd, base, "jixoai.css"), resolve(cwd, `${base}.css`)];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * The actionable form of "the theme css was not found" (release-hygiene
 * #2): names the exact dead end — a configured cssPath that vanished, a
 * `$`-alias no paths table resolves, or a plain alias whose target the
 * theme was never installed into — and the two ways out (--css, or the
 * missing paths mapping). Callers that CAN apply hue later (init/add/
 * upgrade after a successful install) warn with this; the standalone
 * `hue` command fails on it — its entire job is that one write.
 */
function cssNotFoundMessage(config, cwd) {
  const configured = config.jixoai?.cssPath;
  if (typeof configured === "string" && configured) {
    return (
      `jixoai.css not found at the configured jixoai.cssPath (\`${configured}\`) — ` +
      `install the theme first (\`npx jixoai-ui init\`), or correct it: \`jixoai-ui hue <degrees> --css <path>\``
    );
  }
  const lib = config.aliases?.lib;
  if (typeof lib !== "string") {
    return (
      "components.json has no aliases.lib — point at the theme sheet directly: " +
      "`jixoai-ui hue <degrees> --css <path>` (remembered as jixoai.cssPath)"
    );
  }
  if (lib.startsWith("$")) {
    const base = aliasBaseResolver(cwd)(lib);
    if (base.startsWith("$")) {
      return (
        `aliases.lib is \`${lib}\` and no tsconfig/jsconfig compilerOptions.paths entry resolves it ` +
        `(looked for \`${lib}\` and \`${lib}/*\`) — add the mapping ` +
        `(e.g. \`{ "compilerOptions": { "paths": { "${lib}": ["src/lib"] } } }\`), ` +
        "or point at the css directly: `--css <path>` (remembered as jixoai.cssPath)"
      );
    }
    const expected = toPosix(relative(cwd, resolve(cwd, base, "jixoai.css")));
    return (
      `jixoai.css not found at \`${expected}\` (aliases.lib \`${lib}\` resolved to ` +
      `\`${toPosix(relative(cwd, base))}\`) — install the theme first (\`npx jixoai-ui init\`), ` +
      "or pass `--css <path>` if the sheet lives elsewhere"
    );
  }
  return (
    `jixoai.css not found at \`${toPosix(join(lib, "jixoai.css"))}\` — ` +
    "install the theme first (`npx jixoai-ui init`), or pass `--css <path>` if the sheet lives elsewhere"
  );
}

function applyHue(cssPath, hue) {
  if (!cssPath) {
    throw new Error("applyHue requires a css path — callers surface cssNotFoundMessage first");
  }
  const css = readFileSync(cssPath, "utf8");
  const next = css.replace(/--brand-hue:\s*[\d.]+/, `--brand-hue: ${hue}`);
  if (next !== css) {
    writeFileSync(cssPath, next);
    console.log(`jixoai-ui: --brand-hue: ${hue} → ${cssPath}`);
  } else if (!/--brand-hue:\s*[\d.]+/.test(css)) {
    console.warn(
      `jixoai-ui: no \`--brand-hue\` token in ${cssPath} — not a jixoai theme sheet? ` +
        "pass `--css <path>` if jixoai.css lives elsewhere",
    );
  }
}

/** apply hue when the css resolves; otherwise surface the guidance
 * (warn — install/upgrade runs may have succeeded at everything else) */
function applyHueLocated(config, cwd, hue) {
  const cssPath = themeCssPath(config, cwd);
  if (cssPath) {
    applyHue(cssPath, hue);
    return true;
  }
  console.warn(`jixoai-ui: ${cssNotFoundMessage(config, cwd)}`);
  return false;
}

function shadcn(args, cwd, configPath, config, registryOverride) {
  // shadcn 4.18 rejects unknown top-level keys (our jixoai block), so the
  // extension fields are stripped for the call and restored afterwards.
  const { jixoai, ...rest } = config;
  // --registry (release-hygiene #8): the spawned shadcn fetches
  // registries["@jixoai"] ITSELF, so an override only this CLI honored
  // would still send shadcn at the dead registry — write the override
  // into the spawned config and restore the configured url afterwards.
  const originalRegistry = rest.registries?.[NAMESPACE];
  if (registryOverride && originalRegistry !== registryOverride) {
    rest.registries ??= {};
    rest.registries[NAMESPACE] = registryOverride;
  }
  writeConfig(configPath, rest);
  const result = spawnSync(
    "npx",
    ["--yes", "shadcn", ...args, "--yes"],
    { stdio: "inherit", cwd, env: { ...process.env, npm_config_yes: "true" } },
  );
  if (result.status !== 0) {
    writeConfig(configPath, config); // restore even on failure
    fail(
      `\`shadcn ${args.join(" ")}\` exited with ${result.status}` +
        (registryOverride && registryOverride.startsWith("file:")
          ? ` — the --registry override \`${registryOverride}\` is a file:// template and shadcn needs an http(s) url; serve the directory locally (e.g. \`python3 -m http.server\`) and pass its url`
          : ""),
    );
  }
  const after = readConfig(cwd);
  after.config.jixoai = jixoai;
  if (registryOverride && after.config.registries?.[NAMESPACE] === registryOverride) {
    // shadcn preserved the override in components.json — put the
    // configured url back so the override stays run-scoped
    if (originalRegistry === undefined) delete after.config.registries[NAMESPACE];
    else after.config.registries[NAMESPACE] = originalRegistry;
  }
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

/** pull `--name <value>` / `--name=<value>` out of an args list:
 * returns [value | null, remaining args] — the VALUE leaves with the
 * flag, so `add toc --css src/lib/jixoai.css` never mistakes the path
 * for an item name and never forwards either token to shadcn */
function extractFlagValue(args, name) {
  const spaced = args.indexOf(name);
  if (spaced !== -1) {
    const value = args[spaced + 1];
    if (typeof value !== "string" || value.startsWith("--")) {
      fail(`\`${name}\` needs a value (\`${name} <path>\`)`);
    }
    return [value, [...args.slice(0, spaced), ...args.slice(spaced + 2)]];
  }
  const eq = `${name}=`;
  const glued = args.findIndex((a) => a.startsWith(eq));
  if (glued !== -1) {
    const value = args[glued].slice(eq.length);
    if (!value) fail(`\`${name}=\` needs a value (\`${name}=<path>\`)`);
    return [value, [...args.slice(0, glued), ...args.slice(glued + 1)]];
  }
  return [null, args];
}

/** --registry <dir|url> (release-hygiene #8): a url template (http(s)://
 * or file://, must contain {name}) or a LOCAL DIRECTORY of <name>.json
 * payloads — a checkout's built public/r/, or the exact shape the issue
 * #8 consumer hand-rolled a ~40-line server to serve. A directory
 * normalizes to a file://{name} template so fetchText's file:// lane
 * reads payloads straight off disk: zero network, zero config edits. */
function registryOverrideTemplate(value, cwd) {
  if (value.includes("://")) return value;
  const dir = resolve(cwd, value);
  let isDirectory = false;
  try {
    isDirectory = statSync(dir).isDirectory();
  } catch {
    // missing paths fall through to the failure below
  }
  if (!isDirectory) {
    fail(
      `--registry \`${value}\` is neither a url template (expected http(s)://…/{name}.json or file://…) ` +
        `nor an existing directory of <name>.json payloads (looked at ${dir})`,
    );
  }
  return `${pathToFileURL(dir).href}/{name}.json`;
}

/** remember a --css override as jixoai.cssPath (cwd-relative when the
 * sheet lives inside the project, absolute otherwise) — one flag fixes
 * every later run; consumers whose $lib maps nowhere need it forever */
function cssPathKey(cwd, cssOverride) {
  const abs = resolve(cwd, cssOverride);
  const rel = relative(cwd, abs);
  return rel.startsWith("..") ? toPosix(abs) : toPosix(rel);
}

/** non-interactive stdin cannot answer shadcn's overwrite confirmation —
 * EOF cancels the WHOLE write phase (the #1 phantom-success report on
 * jixoai-ui@0.3.0: zero files landed, the CLI still said locked) — so
 * the run forwards --overwrite itself, the same intent as the forced
 * --yes. Interactive runs keep the prompt. */
function nonInteractiveOverwriteFlags(flags) {
  if (flags.includes("--overwrite")) return [];
  if (process.stdin.isTTY) return [];
  console.log(
    "jixoai-ui: non-interactive stdin — forwarding --overwrite " +
      "(shadcn's overwrite confirmation cannot be answered at EOF; leaving it would cancel the write phase)",
  );
  return ["--overwrite"];
}

/* ── install manifest (jixoai-ui.lock) + shared install/upgrade core ── */

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function toPosix(path) {
  return path.split("\\").join("/");
}

function registryUrlFor(config, override) {
  const url = override ?? config.registries?.[NAMESPACE] ?? REGISTRY_URL;
  if (!url.includes("{name}")) {
    fail(`the ${NAMESPACE} registry url must contain a {name} template (got \`${url}\`)`);
  }
  return url;
}

/** network errors surface as a bare "fetch failed" (undici hides the
 * errno) — unwrap cause.cause so the consumer sees ECONNREFUSED & co. */
function fetchCauseDetail(cause) {
  const code = cause?.cause?.code ?? cause?.code;
  return code ? `${cause.message} (${code})` : cause.message;
}

/** the way out when the registry cannot be reached (release-hygiene #8,
 * the 2026-09-10 outage): retry (the most common cause is transient
 * egress), a local mirror via --registry (no components.json edit), and
 * the stale-npx trap — an old cached CLI may carry an outdated registry
 * url; `npx jixoai-ui@latest` sidesteps the cache */
function unreachableRegistryHints() {
  return (
    "\n  — retry the command: transient egress/CDN failures are the most common cause" +
    "\n  — run offline against a mirror: `--registry <dir|url>` (a directory of <name>.json payloads, or a file:// / http(s) {name} template) — no components.json edit needed" +
    "\n  — a stale npx cache may be serving an outdated CLI: `npx jixoai-ui@latest`"
  );
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
    throw new Error(
      `cannot fetch registry item \`${name}\` from ${url}: ${fetchCauseDetail(cause)}` +
        unreachableRegistryHints(),
    );
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

/**
 * Fetch + parse the registry INDEX — the same `/r/registry.json` the
 * public site serves (`shadcn build` emits it from registry.json with
 * `meta.group` intact, so group membership survives the pipeline).
 * Mirrors fetchRegistryItem's URL building: the `{name}` template
 * becomes the literal `registry`, so `https://ui.jixoai.com/r/{name}.json`
 * resolves `https://ui.jixoai.com/r/registry.json` and local/file://
 * mirrors land on their own index the same way.
 */
async function fetchRegistryIndex(registryUrl) {
  const url = registryUrl.replace("{name}", "registry");
  let raw;
  try {
    raw = await fetchText(url);
  } catch (cause) {
    throw new Error(
      `cannot fetch the registry index from ${url}: ${fetchCauseDetail(cause)}` +
        unreachableRegistryHints(),
    );
  }
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`the registry index (${url}) is not valid JSON`);
  }
  const items = Array.isArray(json) ? json : json.items;
  if (!Array.isArray(items) || items.some((i) => typeof i?.name !== "string")) {
    throw new Error(`the registry index (${url}) has no usable items array`);
  }
  return items;
}

/**
 * Resolve `add` arguments to registry item names (effect-attachments
 * Lane H, the r5 Owner request #2, 2026-09-10 — `npx jixoai-ui add
 * effects` / `npx jixoai-ui add effects/glass`):
 *
 *   effects          GROUP alias — expands to EVERY registry:ui item
 *                    whose `meta.group === 'effects'`, in REGISTRY
 *                    ORDER (the index's item order). Groups with zero
 *                    registry:ui members (e.g. `engines` — lib-only)
 *                    are not add-able ids.
 *   effects/glass    SCOPED member — resolves to `glass` after proving
 *                    the item EXISTS and its `meta.group` is exactly
 *                    `effects` (a violation names both groups).
 *   glass            ITEM name — as-is, any registry type. PRECEDENCE
 *                    LAW: an exact item name ALWAYS wins over a group
 *                    id when the two collide (none collide today; the
 *                    law is fixed here so a future `effects` ITEM
 *                    simply shadows the group instead of changing the
 *                    resolution rules).
 *
 * `adopt`/`upgrade` stay ITEM-NAME-ONLY on purpose: groups are an
 * ADD-time convenience, and the lock + the upgrade loop record items,
 * never group ids.
 *
 * Degradation: a registry without an index (single-item file://
 * fixtures) keeps the standing bare-name behavior — the index is
 * fetched ONCE per call, and a failed fetch downgrades to a warning
 * when every arg is a plain name, while the scoped form hard-fails
 * (it cannot be validated without the index).
 */
export async function resolveAddNames(registryUrl, args) {
  let index = null;
  let indexError = null;
  try {
    index = await fetchRegistryIndex(registryUrl);
  } catch (cause) {
    indexError = cause.message;
  }
  if (indexError && args.some((a) => a.includes("/"))) {
    fail(indexError);
  }
  if (indexError) {
    console.warn(
      `jixoai-ui: ${indexError} — treating every argument as an item name (group aliases need the registry index)`,
    );
    return [...new Set(args)];
  }
  const byName = new Map(index.map((i) => [i.name, i]));
  const groups = new Map(); // group id → registry:ui member names, index order
  for (const item of index) {
    if (item.type !== "registry:ui") continue;
    const group = item.meta?.group;
    if (typeof group !== "string") continue;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item.name);
  }
  const knownGroups = () => [...groups.keys()].join(", ");

  const resolved = [];
  const seen = new Set(); // `add effects glass` installs glass once
  const push = (name) => {
    if (!seen.has(name)) {
      seen.add(name);
      resolved.push(name);
    }
  };

  for (const arg of args) {
    if (!arg.includes("/")) {
      // bare form: an exact ITEM name always wins (see the precedence law)
      if (byName.has(arg)) {
        push(arg);
        continue;
      }
      const members = groups.get(arg);
      if (members) {
        console.log(`jixoai-ui: ${arg} → ${members.join(", ")}`);
        for (const name of members) push(name);
        continue;
      }
      fail(
        `unknown item or group \`${arg}\` — known groups: ${knownGroups()}. ` +
          `Pick an item from the registry index or a group id above`,
      );
    }
    // scoped form: exactly one slash, both sides non-empty
    const parts = arg.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      fail(`\`${arg}\` is not a valid scoped item — expected \`group/name\` (e.g. \`effects/glass\`)`);
    }
    const [group, name] = parts;
    if (!byName.has(name)) {
      const members = groups.get(group);
      fail(
        members
          ? `\`${arg}\`: no registry item named \`${name}\` — group \`${group}\` has: ${members.join(", ")}`
          : `\`${arg}\`: no registry item named \`${name}\` and \`${group}\` is not a known group — known groups: ${knownGroups()}`,
      );
    }
    const realGroup = byName.get(name).meta?.group;
    if (realGroup !== group) {
      fail(
        `\`${arg}\`: \`${name}\` is not in group \`${group}\` — it belongs to ` +
          `\`${realGroup ?? "(no group)"}\`. Use \`npx jixoai-ui add ${name}\` instead`,
      );
    }
    push(name);
  }
  return resolved;
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
  // `$`-rooted alias values resolve through the project's tsconfig paths
  // (aliasDir) — see the $-alias resolution block above.
  const match = /^@([\w.$-]+)(?:\/(.+))?$/.exec(target);
  if (match) {
    const base = config.aliases?.[match[1]];
    if (typeof base !== "string") {
      throw new Error(`cannot place \`${target}\`: components.json has no aliases.${match[1]}`);
    }
    return resolve(aliasDir(base, cwd), match[2] ?? "");
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
 *
 * Install-integrity gate (consumer-feedback-fixes P0-3, 2026-09-06):
 * an item is locked ONLY when every one of its files exists on disk at
 * the alias-resolved install path. A non-interactive shadcn run whose
 * overwrite confirmation hits EOF cancels its whole write phase — the
 * files never land, and the pre-gate CLI locked the item anyway, so
 * `upgrade` reported it as managed while nothing was installed. A miss
 * now keeps the item OUT of the lock and prints the missing paths with
 * the recovery guidance.
 *
 * Returns the number of REFUSED items (release-hygiene #1): callers
 * exit non-zero on a positive count — a canceled install is a failed
 * install, never a green exit for scripts to trust.
 */
async function recordInstalledItems(cwd, config, names, registryUrl) {
  const { path, lock, existed } = readLock(cwd, { required: false });
  let recorded = 0;
  let refused = 0;
  for (const name of names) {
    try {
      const item = await fetchRegistryItem(registryUrl, name);
      assertRegistryFiles(name, item.files);
      const files = {};
      const missing = [];
      for (const file of item.files) {
        const key = lockInstallKey(file.target, config, cwd);
        if (!existsSync(resolve(cwd, key))) {
          missing.push(key);
          continue;
        }
        files[key] = sha256(file.content);
      }
      if (missing.length > 0) {
        refused++;
        console.warn(
          `jixoai-ui: ${name} NOT locked in ${LOCK_NAME} — ${missing.length} of ` +
            `${item.files.length} file(s) missing at their install path(s):`,
        );
        for (const key of missing) console.warn(`  - ${key}`);
        console.warn(
          "jixoai-ui: the write phase was cancelled (shadcn's overwrite confirmation " +
            "hit EOF under non-interactive stdin). Move the conflicting existing file(s) " +
            "aside and re-run the add; this CLI re-applies the brand hue afterwards.",
        );
        continue;
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
  return refused;
}

/* ── post-add relocation (consumer-feedback-fixes P0-3) ── */

/**
 * shadcn sometimes ignores the registry item's alias targets and drops
 * files into LITERAL `src/@lib/`, `src/@ui/` and `src/vite-plugins/`
 * directories (the alias prefix treated as a path segment). This pass
 * walks those literal directories, moves every dropped file to its
 * alias-resolved (or project-root) destination, reports each move, and
 * removes the emptied literal directories. Destination collisions are
 * reported, never clobbered.
 */
function relocateMisplacedFiles(cwd, config) {
  const alias = (name) => {
    const base = config.aliases?.[name];
    if (typeof base !== "string") return null;
    return aliasDir(base, cwd); // $-rooted values resolve through tsconfig paths
  };
  const sources = [
    { dir: resolve(cwd, "src/@lib"), destination: alias("lib") },
    { dir: resolve(cwd, "src/@ui"), destination: alias("ui") },
    { dir: resolve(cwd, "src/@components"), destination: alias("components") },
    // plain project-relative targets (e.g. vite-plugins/llms-txt.mjs)
    // that shadcn still anchors under src/
    { dir: resolve(cwd, "src/vite-plugins"), destination: resolve(cwd, "vite-plugins") },
  ];
  for (const { dir, destination } of sources) {
    if (!destination || !existsSync(dir)) continue;
    const entries = readdirSync(dir, { withFileTypes: true });
    if (entries.length === 0) {
      rmdirSync(dir);
      continue;
    }
    const moveTree = (fromDir, toDir) => {
      mkdirSync(toDir, { recursive: true });
      for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
        const from = join(fromDir, entry.name);
        const to = join(toDir, entry.name);
        if (entry.isDirectory()) {
          moveTree(from, to);
          rmdirSync(from);
        } else if (existsSync(to)) {
          console.warn(
            `jixoai-ui: relocation skipped — ${toPosix(relative(cwd, to))} already exists; ` +
              `${toPosix(relative(cwd, from))} left in place`,
          );
        } else {
          renameSync(from, to);
          console.log(
            `jixoai-ui: relocated ${toPosix(relative(cwd, from))} → ${toPosix(relative(cwd, to))}`,
          );
        }
      }
    };
    moveTree(dir, destination);
    if (existsSync(dir) && readdirSync(dir).length === 0) rmdirSync(dir);
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

async function runUpgrade(cwd, config, registryUrl) {
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

  applyHueLocated(config, cwd, config.jixoai?.brandHue ?? DEFAULT_HUE);

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
    const [cssOverride, initRest] = extractFlagValue(rest, "--css");
    const [registryOverride, initArgs] = extractFlagValue(initRest, "--registry");
    const { path, config } = readConfig(cwd);
    // UNfiltered args: `--hue 120` is the DOCUMENTED form and the --hue
    // branch below only sees it when the flag survives filtering (the
    // filtered call always fell back to the previous/default hue — the
    // "default 330" the #2 reporter could not move)
    const hue = hueFromArgs(initArgs, config.jixoai?.brandHue ?? DEFAULT_HUE);
    const overrideTemplate = registryOverride ? registryOverrideTemplate(registryOverride, cwd) : undefined;
    const registryUrl = registryUrlFor(config, overrideTemplate);
    ensureNamespace(config);
    config.jixoai = {
      ...(config.jixoai ?? {}),
      brandHue: hue,
      ...(cssOverride ? { cssPath: cssPathKey(cwd, cssOverride) } : {}),
    };
    writeConfig(path, config);
    console.log(`jixoai-ui: ${NAMESPACE} namespace + jixoai config written → ${path}`);
    // passthrough + non-interactive overwrite semantics (release-hygiene
    // #1): same flag discipline as add — user flags forward verbatim
    // (--hue is OURS, never shadcn's), --overwrite joins them when stdin
    // cannot answer the confirm
    const initFlags = initArgs.filter(
      (a) => a.startsWith("--") && a !== "--yes" && a !== "--help" && a !== "-h" && a !== "--hue",
    );
    const overwrite = nonInteractiveOverwriteFlags(initFlags);
    shadcn(["add", `${NAMESPACE}/${THEME_ITEM}`, ...initFlags, ...overwrite], cwd, path, config, overrideTemplate);
    relocateMisplacedFiles(cwd, readConfig(cwd).config);
    applyHueLocated(config, cwd, hue);
    const refused = await recordInstalledItems(cwd, readConfig(cwd).config, [THEME_ITEM], registryUrl);
    if (refused > 0) {
      fail(
        "init incomplete — the theme item failed the install-integrity gate " +
          "(its files are missing on disk; see the warnings above). " +
          "Resolve the conflict and re-run `npx jixoai-ui init`",
      );
    }
    break;
  }
  case "hue": {
    // --css (release-hygiene #2): an explicit sheet location beats the
    // whole aliases.lib hunt and is remembered — one flag fixes every
    // later run. A hue that cannot find the sheet FAILS honestly: the
    // next run would miss it identically (the old "will be applied on
    // the next init/add" promise was a lie under an unresolvable $lib).
    const [cssOverride, hueRest] = extractFlagValue(rest, "--css");
    const hue = hueFromArgs(["--hue", hueRest.find((a) => !a.startsWith("--"))]);
    const { path, config } = readConfig(cwd);
    if (cssOverride && !existsSync(resolve(cwd, cssOverride))) {
      fail(`--css points at \`${cssOverride}\` (${resolve(cwd, cssOverride)}) which does not exist`);
    }
    config.jixoai = {
      ...(config.jixoai ?? {}),
      brandHue: hue,
      ...(cssOverride ? { cssPath: cssPathKey(cwd, cssOverride) } : {}),
    };
    writeConfig(path, config);
    const css = themeCssPath(config, cwd);
    if (!css) {
      fail(cssNotFoundMessage(config, cwd));
    }
    applyHue(css, hue);
    break;
  }
  case "add": {
    // arg discipline (consumer-feedback-fixes P0-3): `--` tokens are
    // flags, never item names (`add --help` used to spawn
    // `shadcn add @jixoai/--help`)
    if (rest.some((a) => a === "--help" || a === "-h")) {
      console.log(USAGE);
      break;
    }
    // --css / --registry leave WITH their values (extractFlagValue), so
    // the value never masquerades as an item name and neither token is
    // forwarded to shadcn (release-hygiene #2/#8)
    const [cssOverride, addRest1] = extractFlagValue(rest, "--css");
    const [registryOverride, addRest] = extractFlagValue(addRest1, "--registry");
    const items = addRest.filter((a) => !a.startsWith("--"));
    if (items.length === 0) {
      fail("add needs at least one item name (e.g. `toc`, a group id like `effects`, or `effects/glass`)");
    }
    // passthrough flags (2026-09-14, the jixoai.com markdown install):
    // `--overwrite` used to be silently DROPPED here, so an item whose
    // closure writes one file TWICE intra-run (markdown's dep tree
    // carries jixoai.css in two items) dead-ended on shadcn's overwrite
    // confirm under non-interactive stdin — the only escape was calling
    // shadcn directly with the config stripped. Flags forward verbatim,
    // one flag list shared by every per-item spawn; under non-interactive
    // stdin --overwrite joins them automatically (release-hygiene #1).
    const flags = addRest.filter((a) => a.startsWith("--") && a !== "--yes" && a !== "--help" && a !== "-h");
    const overwrite = nonInteractiveOverwriteFlags(flags);
    const { path, config } = readConfig(cwd);
    const overrideTemplate = registryOverride ? registryOverrideTemplate(registryOverride, cwd) : undefined;
    const registryUrl = registryUrlFor(config, overrideTemplate);
    if (cssOverride) {
      // remember BEFORE the shadcn loop: every spawn strips and restores
      // the jixoai block, and the restored block must carry the cssPath
      config.jixoai = { ...(config.jixoai ?? {}), cssPath: cssPathKey(cwd, cssOverride) };
      writeConfig(path, config);
    }
    // group aliases (effect-attachments Lane H): `add effects` /
    // `add effects/glass` resolve to ITEM names BEFORE the shadcn
    // loop — the loop, the lock and the recording all speak RESOLVED
    // names (so `add effects` locks glass + press-button, never an
    // `effects` key)
    const resolved = await resolveAddNames(registryUrl, items);
    const hue = config.jixoai?.brandHue ?? DEFAULT_HUE;
    // one shadcn invocation PER ITEM, each carrying the @jixoai/ prefix
    // itself (consumer-feedback-fixes P0-3 audit: the prefix must never
    // depend on shell/shadcn multi-arg behavior — the loop re-reads the
    // config because shadcn may rewrite it between spawns)
    for (const item of resolved) {
      shadcn(
        ["add", `${NAMESPACE}/${item}`, ...flags, ...overwrite],
        cwd,
        path,
        readConfig(cwd).config,
        overrideTemplate,
      );
    }
    relocateMisplacedFiles(cwd, readConfig(cwd).config);
    applyHueLocated(readConfig(cwd).config, cwd, hue);
    const refused = await recordInstalledItems(cwd, readConfig(cwd).config, resolved, registryUrl);
    if (refused > 0) {
      fail(
        `add incomplete — ${refused} item(s) failed the install-integrity gate ` +
          "(their files are missing on disk; see the warnings above — nothing was locked for them). " +
          "Resolve the conflicts and re-run the add",
      );
    }
    break;
  }
  case "adopt": {
    // Hand-installed sites (same-source copies) have no lock yet. adopt
    // baselines the CURRENT disk content of the named items into the lock:
    // the first `upgrade` afterwards diffs registry canon against this
    // baseline, applies changes + hue, and the lock flips to canonical
    // hashes — subsequent upgrades are fully idempotent. Item names only:
    // group aliases (`effects`, `effects/glass`) are an ADD-time
    // convenience and never expand here (see resolveAddNames).
    const [registryOverride, adoptRest] = extractFlagValue(rest, "--registry");
    const names = adoptRest.filter((a) => !a.startsWith("--"));
    if (names.length === 0) {
      fail("adopt needs item names (e.g. `adopt toc jixoai-theme`) — items whose files live at their components.json targets");
    }
    const { config } = readConfig(cwd);
    const registryUrl = registryUrlFor(
      config,
      registryOverride ? registryOverrideTemplate(registryOverride, cwd) : undefined,
    );
    const { path, lock } = readLock(cwd, { required: false });
    let recorded = 0;
    for (const name of names) {
      let item;
      try {
        item = await fetchRegistryItem(registryUrl, name);
      } catch (cause) {
        // a fetch failure used to escape as an unhandled rejection with
        // a stack trace — fail with the message (and its guidance) instead
        fail(cause.message);
      }
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
    const [registryOverride] = extractFlagValue(rest, "--registry");
    const [cssOverride] = extractFlagValue(rest, "--css");
    const { path, config } = readConfig(cwd);
    if (cssOverride) {
      config.jixoai = { ...(config.jixoai ?? {}), cssPath: cssPathKey(cwd, cssOverride) };
      writeConfig(path, config);
    }
    const registryUrl = registryUrlFor(
      config,
      registryOverride ? registryOverrideTemplate(registryOverride, cwd) : undefined,
    );
    await runUpgrade(cwd, config, registryUrl);
    break;
  }
  case "config": {
    const { config } = readConfig(cwd);
    console.log(JSON.stringify({ registry: config.registries?.[NAMESPACE] ?? REGISTRY_URL, ...config.jixoai }, null, 2));
    break;
  }
  case "design": {
    // the design studio lives in its own module (single-intent law);
    // this CLI only dispatches (design-studio T7, 2026-09-11)
    const { main } = await import("./design.mjs");
    await main(rest);
    break;
  }
  default:
    console.log(USAGE);
    process.exit(command && command !== "help" && command !== "--help" ? 1 : 0);
}
