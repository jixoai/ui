#!/usr/bin/env node
/**
 * r0-census.mjs — the FROZEN R0 census syntax (receipt instrument).
 *
 * Orthogonal intents:
 *   (1) one frozen extraction rule for class tokens from source files;
 *   (2) one frozen Tailwind-utility judgment regex;
 *   (3) deterministic per-directory report (files / TW-bearing files /
 *       token occurrences / unique tokens / top-10 / family mini-table).
 * Owner input 2026-09-13: Codex gate-1 demanded reproducible receipts for
 * every census number quoted in the change docs — this file IS the frozen
 * syntax; re-running it must reproduce r0-census.md's tables byte-for-byte
 * on the same tree. Zero dependencies, node:fs only.
 *
 * ── FROZEN EXTRACTION RULE (口径, do not change without re-baselining) ──
 * Scanned files: *.svelte, *.ts, *.js, walked recursively; node_modules/,
 * dist/, .svelte-kit/, .git/ directories are skipped.
 * Token sources, applied to raw file text:
 *   (a) class="..."        double-quoted attribute (value = [^"]*)
 *   (b) class='...'        single-quoted attribute (value = [^']*)
 *   (c) class={`...`}      template literal: STATIC chunks only; every
 *       ${...} interpolation is replaced by a single space BEFORE
 *       splitting (the interpolation regex /\$\{[\s\S]*?\}/g is
 *       non-greedy to the first "}", so object literals inside an
 *       interpolation may survive partially — junk fragments simply fail
 *       the TW test below; known, accepted noise).
 * Attribute name is matched as \bclass\s*=\s* (whitespace tolerated).
 * NOT harvested (frozen exclusion list):
 *   - class={expr} with a non-template expression (ternaries, clsx/cn
 *     calls, plain string literals class={"..."}) — the brief froze the
 *     syntax to class="..." and class={`...`} only;
 *   - class:list={...} (different attribute name);
 *   - Svelte class:name={expr} directives;
 *   - tokens are split on /\s+/ inside the harvested value.
 *
 * ── FROZEN TW JUDGMENT (one regex, intent below) ──
 * A token is a Tailwind utility iff:
 *   1. any number of stacked variant prefixes `[a-z0-9-]+:` strip off the
 *      head (covers md:/lg:/hover:/focus:/dark:/group-hover:/print: …;
 *      arbitrary-value variants like min-[850px]: are NOT covered —
 *      known exclusion, judged rare in this repo);
 *   2. the remainder is case-sensitive-prefix-matched (anchored at ^,
 *      unanchored at $) against the family alternation below — i.e. a
 *      token counts if it EQUALS or EXTENDS one family head (so "flex"
 *      covers flex-1/flex-wrap, "border-?" covers border and border-2);
 *   3. a trailing "/opacity" modifier needs no special handling under
 *      prefix semantics (bg-red-500/50 extends "bg-").
 * No "!" important prefix handling (TW4 dropped it). False-positive risk:
 * custom classes that START with a family head (e.g. a hypothetical
 * "blockly-x") would count; the repo's custom vocab is "jx-" / "jx-html-"
 * prefixed and immune. This is a heuristic census, error documented.
 */
const TW_UTILITY = new RegExp(
  "^(?:[a-z0-9-]+:)*(?:" +
    [
      // display & visibility
      "flex", "grid", "block", "inline", "hidden", "visible", "invisible", "static",
      "relative", "absolute", "sticky", "fixed", "contents",
      // box alignment / gaps / placement
      "items-", "justify-", "gap-", "place-", "align-", "inset-", "top-", "bottom-", "left-", "right-",
      "order-", "col-", "row-", "shrink-", "grow-", "basis-",
      // spacing (physical axes only, per frozen brief syntax [pm][trblxy]?-)
      "[pm][trblxy]?-",
      // sizing
      "[wh]-", "min-", "max-", "size-", "aspect-",
      // typography & text
      "text-", "font-", "leading-", "tracking-", "underline", "italic", "uppercase",
      "truncate", "whitespace-", "list-", "hyphens-", "indent-", "break-", "decoration-",
      // color / background / borders / effects
      "bg-", "border", "rounded", "shadow", "opacity-", "ring-", "outline-",
      "divide-", "mask-", "filter-", "backdrop-", "mix-", "isolation-",
      // interaction & behavior
      "select-", "cursor-", "pointer-", "resize-", "scroll-", "snap-", "touch-",
      "overflow-", "z-", "transition", "duration-", "ease-", "animate-",
      "will-", "contain-", "sr-only", "appearance-",
      // object/media
      "object-", "fill-", "stroke-",
    ].join("|") +
    ")"
);

/** Fixed prefix-family mini-table families (frozen set from the brief).
 * Hit rule: family string is tested against the VARIANT-STRIPPED token
 * head for the utility families (startsWith), and against the RAW token
 * for the two variant markers md:/dark: (raw startsWith). */
const FAMILY_TABLE = ["flex", "grid", "px-", "py-", "text-", "bg-", "border", "rounded", "gap-", "md:", "dark:"];

const EXTS = new Set([".svelte", ".ts", ".js"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".svelte-kit", ".git"]);

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { argv, cwd } from "node:process";

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    // dot entries (.git, .svelte-kit, dotfiles) skipped entirely (frozen)
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(p, acc);
    } else if (e.isFile() && EXTS.has(e.name.slice(e.name.lastIndexOf(".")))) {
      acc.push(p);
    }
  }
}

/** Frozen token harvest per file: [tokens...] (raw, in order). */
function harvest(text) {
  const tokens = [];
  const attrDouble = /\bclass\s*=\s*"([^"]*)"/g;
  const attrSingle = /\bclass\s*=\s*'([^']*)'/g;
  const attrTemplate = /\bclass\s*=\s*\{`([^`]*)`\}/g;
  for (const re of [attrDouble, attrSingle]) {
    let m;
    while ((m = re.exec(text))) {
      for (const t of m[1].split(/\s+/)) if (t) tokens.push(t);
    }
  }
  let m;
  while ((m = attrTemplate.exec(text))) {
    // static chunks only: interpolations become a single space (frozen rule)
    const flattened = m[1].replace(/\$\{[\s\S]*?\}/g, " ");
    for (const t of flattened.split(/\s+/)) if (t) tokens.push(t);
  }
  return tokens;
}

/** Strip stacked variant prefixes (frozen: lowercase word + colon). */
const stripVariants = (token) => token.replace(/^(?:[a-z0-9-]+:)+/, "");

function census(rootDir) {
  const files = [];
  walk(rootDir, files);
  const perFile = []; // { path, nClassFiles… }
  let filesWithClass = 0;
  let filesWithTw = 0;
  let occurrences = 0;
  const unique = new Set();
  const extScanned = { ".svelte": 0, ".ts": 0, ".js": 0 };
  const extWithClass = { ".svelte": 0, ".ts": 0, ".js": 0 };
  const extWithTw = { ".svelte": 0, ".ts": 0, ".js": 0 };
  const familyCounts = Object.fromEntries(FAMILY_TABLE.map((f) => [f, 0]));

  for (const f of files) {
    const ext = f.slice(f.lastIndexOf("."));
    extScanned[ext]++;
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    const tokens = harvest(text);
    const twTokens = tokens.filter((t) => TW_UTILITY.test(stripVariants(t)));
    if (tokens.length > 0) {
      filesWithClass++;
      extWithClass[ext]++;
    }
    if (twTokens.length > 0) {
      filesWithTw++;
      extWithTw[ext]++;
    }
    occurrences += twTokens.length;
    for (const t of twTokens) unique.add(t);
    for (const t of twTokens) {
      const head = stripVariants(t);
      for (const fam of FAMILY_TABLE) {
        if (fam.endsWith(":")) {
          if (t.startsWith(fam)) familyCounts[fam]++;
        } else if (head.startsWith(fam)) {
          familyCounts[fam]++;
        }
      }
    }
    perFile.push({ path: f, tw: twTokens.length });
  }
  perFile.sort((a, b) => b.tw - a.tw || (a.path < b.path ? -1 : 1));
  return { files, filesWithClass, filesWithTw, occurrences, unique, extScanned, extWithClass, extWithTw, familyCounts, perFile };
}

const targets = argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node r0-census.mjs <dir> [<dir> ...]");
  process.exit(2);
}
console.log(`# r0-census frozen-syntax run`);
console.log(`# host-cwd: ${cwd()}`);
console.log(`# node: ${process.version}`);
for (const target of targets) {
  const abs = target.startsWith("/") ? target : join(cwd(), target);
  const r = census(abs);
  console.log(`\n=== ${target} ===`);
  console.log(`scanned_files_total: ${r.files.length} (svelte ${r.extScanned[".svelte"]} / ts ${r.extScanned[".ts"]} / js ${r.extScanned[".js"]})`);
  console.log(`files_with_class_attr: ${r.filesWithClass} (svelte ${r.extWithClass[".svelte"]} / ts ${r.extWithClass[".ts"]} / js ${r.extWithClass[".js"]})`);
  console.log(`files_with_tw_tokens: ${r.filesWithTw} (svelte ${r.extWithTw[".svelte"]} / ts ${r.extWithTw[".ts"]} / js ${r.extWithTw[".js"]})`);
  console.log(`tw_token_occurrences: ${r.occurrences}`);
  console.log(`tw_unique_tokens: ${r.unique.size}`);
  console.log(`family_table(occurrences): ${FAMILY_TABLE.map((f) => `${f}=${r.familyCounts[f]}`).join(" ")}`);
  console.log(`top10_files:`);
  for (const pf of r.perFile.slice(0, 10)) {
    console.log(`  ${String(pf.tw).padStart(5)}  ${relative(cwd(), pf.path).split(sep).join("/")}`);
  }
}
