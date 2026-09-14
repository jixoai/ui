#!/usr/bin/env node
/**
 * r5-cn-surface.mjs — the FROZEN R5 cn()-surface census syntax (receipt
 * instrument for the migration census, tasks.md R5 second bullet).
 *
 * Orthogonal intents:
 *   (1) one frozen extraction rule for the FIRST STRING ARGUMENT of
 *       cn() calls inside Svelte class attributes;
 *   (2) the SAME frozen TW judgment regex as r0-census.mjs (copied
 *       verbatim — identical 口径, byte-comparable token rulings);
 *   (3) deterministic per-directory report (cn sites / harvested sites /
 *       tokens / TW tokens / unique / top-10 files).
 * Owner input 2026-09-13 (design §1.4 / tasks R5): the r0 literal-class
 * figure (2340) is a LOWER BOUND because class={expr} non-template
 * expressions were frozen OUT; the cn()-string surface is the named gap.
 * This instrument closes it for the class={cn('…' | `…`)} shape only.
 * Zero dependencies, node:fs only.
 *
 * ── FROZEN EXTRACTION RULE (口径, do not change without re-baselining) ──
 * Scanned files: *.svelte ONLY (class={…} is Svelte template syntax;
 * .ts/.js cannot carry it — frozen scope), walked recursively;
 * node_modules/, dist/, .svelte-kit/, .git/ and dot entries skipped
 * (same walk as r0).
 * Site rule: the attribute opener /\bclass\s*=\s*\{\s*cn\s*\(/g — every
 * occurrence is ONE cn-site (cn_attr_sites).
 * First-arg rule: immediately after the opening paren, skip whitespace
 * and newlines ONLY; if the next character is a single quote ' or a
 * backtick `, the argument is harvested:
 *   '…'  → value = [^']*  (class strings never contain single quotes)
 *   `…`  → value = [^`]*  with every ${…} interpolation replaced by a
 *          single space (r0 template rule, verbatim)
 * ANY other first token (identifier, `expr && '…'`, parenthesized
 * expression, ternary, comment) ⇒ the site is NOT harvested (counted in
 * cn_attr_sites, absent from token totals) — the FIRST string argument
 * is the frozen metric; conditional-later-args are a documented
 * exclusion, so tw tokens here are themselves a lower bound of the
 * full cn surface.
 * Tokens split on /\s+/ inside the harvested value.
 *
 * ── FROZEN TW JUDGMENT (verbatim from r0-census.mjs) ──
 * Strip stacked variant prefixes [a-z0-9-]+: (arbitrary-value variants
 * like min-[850px]: or [@media(forced-colors:active)]: NOT covered —
 * known exclusion shared with r0), then case-sensitive prefix match
 * against the family alternation below (a token counts if it EQUALS or
 * EXTENDS a family head). Custom jx-* vocab is immune (never matches a
 * family head); forced-colors:[outline-color:Highlight] style tokens DO
 * match via the forced-colors: variant strip + bracket-prefixed family
 * heads only where a head matches — arbitrary-property tokens like
 * [background:var(--jx-fill)] match NO family head and count as NON-TW
 * under this grammar (they are custom-property carrier strings; the
 * R5 census counts them separately in the report as bracket_tokens).
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

const EXTS = new Set([".svelte"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".svelte-kit", ".git"]);

import { readdirSync, readFileSync } from "node:fs";
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

/** Frozen site scan per file text:
 *  returns { sites, harvested, tokens } — tokens raw, in order. */
function scan(text) {
  const sites = [];
  const opener = /\bclass\s*=\s*\{\s*cn\s*\(/g;
  let m;
  while ((m = opener.exec(text))) {
    // first-arg rule: skip whitespace/newlines only, then ' or `
    const rest = text.slice(m.index + m[0].length);
    const lead = rest.match(/^[ \t\r\n]*/)[0];
    const q = rest[lead.length];
    if (q === "'" || q === "`") {
      const bodyRe = q === "'" ? /^([^']*)'/ : /^([^`]*)`/;
      const bm = rest.slice(lead.length + 1).match(bodyRe);
      if (bm) {
        const flattened = bm[1].replace(/\$\{[\s\S]*?\}/g, " ");
        sites.push({ harvested: true, tokens: flattened.split(/\s+/).filter(Boolean) });
        continue;
      }
    }
    sites.push({ harvested: false, tokens: [] });
  }
  return sites;
}

/** Strip stacked variant prefixes (frozen: lowercase word + colon). */
const stripVariants = (token) => token.replace(/^(?:[a-z0-9-]+:)+/, "");

function census(rootDir) {
  const files = [];
  walk(rootDir, files);
  let filesWithCn = 0;
  let cnAttrSites = 0;
  let harvestedSites = 0;
  let tokensTotal = 0;
  let twOccurrences = 0;
  let bracketTokens = 0;
  const twUnique = new Set();
  const perFile = [];
  for (const f of files) {
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    const sites = scan(text);
    if (sites.length > 0) filesWithCn++;
    cnAttrSites += sites.length;
    const tokens = sites.flatMap((s) => (s.harvested ? s.tokens : []));
    harvestedSites += sites.filter((s) => s.harvested).length;
    const tw = tokens.filter((t) => TW_UTILITY.test(stripVariants(t)));
    tokensTotal += tokens.length;
    twOccurrences += tw.length;
    bracketTokens += tokens.filter((t) => /^\[/.test(stripVariants(t)) || /^\[--/.test(t)).length;
    for (const t of tw) twUnique.add(t);
    perFile.push({ path: f, sites: sites.length, harvested: sites.filter((s) => s.harvested).length, tw: tw.length });
  }
  perFile.sort((a, b) => b.tw - b.sites - (a.tw - a.sites) || (a.path < b.path ? -1 : 1));
  return { files, filesWithCn, cnAttrSites, harvestedSites, tokensTotal, twOccurrences, twUnique, bracketTokens, perFile };
}

const targets = argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node r5-cn-surface.mjs <dir> [<dir> ...]");
  process.exit(2);
}
console.log(`# r5-cn-surface frozen-syntax run`);
console.log(`# host-cwd: ${cwd()}`);
console.log(`# node: ${process.version}`);
for (const target of targets) {
  const abs = target.startsWith("/") ? target : join(cwd(), target);
  const r = census(abs);
  console.log(`\n=== ${target} ===`);
  console.log(`svelte_files_scanned: ${r.files.length}`);
  console.log(`files_with_cn_sites: ${r.filesWithCn}`);
  console.log(`cn_attr_sites: ${r.cnAttrSites}`);
  console.log(`harvested_first_string_sites: ${r.harvestedSites}`);
  console.log(`tokens_in_first_string_args: ${r.tokensTotal}`);
  console.log(`tw_tokens_in_first_string_args: ${r.twOccurrences}`);
  console.log(`tw_unique_tokens: ${r.twUnique.size}`);
  console.log(`bracket_property_tokens (non-TW carriers, separate count): ${r.bracketTokens}`);
  console.log(`top10_files:`);
  for (const pf of r.perFile.slice(0, 10)) {
    console.log(`  tw=${String(pf.tw).padStart(4)} sites=${String(pf.sites).padStart(3)}  ${relative(cwd(), pf.path).split(sep).join("/")}`);
  }
}
