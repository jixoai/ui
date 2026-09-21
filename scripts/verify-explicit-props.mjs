#!/usr/bin/env node
// verify:explicit-props — the explicit-props fleet lint
// (explicit-props W5 task 5.1, design §16.1, 2026-09-21).
//
// The W3-CLOSE contract as MACHINE law. Six clauses, each citing its
// frozen source:
//
//   E1 inventory completeness (design §17.2) — every DIR under
//      apps/www/src/lib/ui is in the canonical inventory's families[]
//      and vice versa: a family in NEITHER list is a gate failure
//      (this closes the empty-on-missing-defaults hole at the DIR
//      level; the metas' side of that law is 4.6's drift gate).
//
//   E2 the single-class census vocabulary (migration-census W3 CLOSE:
//      105 surface · 4 siteOnly · 4 context-only · 1 engine-wrapper ·
//      1 rootless-lib, no double-count) — the class members are
//      PINNED here (the census receipt is the record; siteOnly also
//      cross-checks the inventory's own field), and each family's
//      MACHINERY SHAPE must match its class:
//        surface        provideUniversalLanes AND stampCarriersForLanes
//        siteOnly       machinery lives ONLY under apps/www (no
//                       registry/files/ui twin) — still adopts the axes
//        context-only   provideUniversalLanes, NEVER a carrier stamp
//                       (no own root: icon-button wraps press-button,
//                       scroll-run is the fragment dialect, the
//                       hero-set main + the DLD wrapper supply context)
//        engine-wrapper NO provideUniversalLanes, NO stamp — the
//                       resolved lanes FORWARD to the composed root
//                       (scroll-virtual → ScrollArea)
//        rootless-lib   NO <family>-defaults.svelte.ts, no component
//                       root (glass — the material lib; matches the
//                       inventory's exemption ledger)
//
//   E3 the axis surface (§16.1a) — AST over every
//      <family>-defaults.svelte.ts: the defineComponentDefaults({...})
//      members are EXACTLY the eight §0 axes minus the family's
//      census-recorded deviation, each a <axis>AxisSlot(...) call from
//      the defaults seam (or the pinned §13 number-lane substitution).
//      THE DEVIATION ALLOWLIST is the census's LANDED record —
//      an UNLISTED family missing an axis is a failure, and a listed
//      deviation whose axis reappeared is a stale-census failure.
//
//   E4 THE PROVIDER-SNAPSHOT KERNEL LAW (census D1, swept by 2b28536c):
//      any file with the reactive bridged provideDensity(() => …)
//      must NOT pass `density` in its provideUniversalLanes({...})
//      literal — the literal SNAPSHOTS the prop at init and freezes
//      the explicit lane over the bridge. Fleet-wide scan; recurrence
//      is impossible while this gate runs.
//
//   E5 the native forwarding ban (§1, batch A's 16 families) — a
//      consumed axis prop never lands on the native element: the
//      owned axes are destructured out of $props() (so {...rest}
//      cannot carry them) and no native tag (input/select/textarea)
//      carries an axis-name attribute. ONE census-recorded
//      passthrough stands: native-select's `size` (the documented
//      multiple-rows native attribute — the native rows own the name).
//
//   E6 the carrier law composition (§10/§16.1b) — axis values reach
//      the DOM as INLINE STYLE carriers only: every identifier bound
//      (directly, or through a join) to stampCarriersForLanes(...) is
//      used in the markup ONLY inside style attribute values, never a
//      class position. The zero-class-identity census itself is
//      DELEGATED to verify:tailwindless (the standing ratchet — this
//      clause asserts the style-only binding + that the delegation
//      target is wired in package.json, not a duplicate census).
//
// Usage: node scripts/verify-explicit-props.mjs   (from repo root)
// Output: per-clause receipts; exit 0 GREEN / 1 RED. The canonical
// tree only is scanned (registry/files/** — the apps/www/src/lib
// mirror is byte-identity, verify:mirror's law) EXCEPT the siteOnly
// four (no canonical twin) and the site-side ui DIR census (E1).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

// the parsers ride the REAL toolchain (the jx-inventory precedent)
const wwwRequire = createRequire(join(root, 'apps/www/package.json'));
const ts = wwwRequire('typescript');
const { parse: svelteParse } = wwwRequire('svelte/compiler');

// ── the census vocabulary (migration-census.md W3 CLOSE — pinned) ──
const INVENTORY_REL = 'registry/files/lib/universal-props.inventory.json';
const UI_CANONICAL = 'registry/files/ui';
const UI_SITE = 'apps/www/src/lib/ui';
const AXES = ['size', 'shape', 'radius', 'density', 'color', 'theme', 'elevation', 'motion'];

/** the inventory's siteOnly four (data source) */
const SITE_ONLY = ['a11y-table', 'density-demo', 'props-table', 'token-table'];
/** the census's context-only four (supply via context, no own root) */
const CONTEXT_ONLY = ['highlight-detect-default', 'icon-button', 'pattern-hero-set', 'scroll-run'];
/** the census's engine-wrapper one (forwards to a composed root) */
const ENGINE_WRAPPER = ['scroll-virtual'];
/** the census's rootless-lib one (no component root — the exemption ledger) */
const ROOTLESS_LIB = ['glass'];

/**
 * census-recorded SIBLING stampers inside context-only families: faces
 * that own their own root and stamp all eight, while the family's
 * CANONICAL main supplies through context only (pattern-hero-set's
 * ascii/marquee twins — the D2 record). Any OTHER stamping file in a
 * context-only family claims a root the census says it does not have.
 */
const SIBLING_STAMPERS = {
  'pattern-hero-set': ['pattern-hero-ascii.svelte', 'pattern-hero-marquee.svelte'],
};

/**
 * THE DEVIATION ALLOWLIST — every census-recorded axis departure, the
 * ONLY legal ones (an UNLISTED family missing an axis is a failure).
 * Three kinds, each pinning the exact tree state:
 *   absent — the member does NOT exist (the colliding name is owned
 *     outside the defaults contract entirely);
 *   local  — the member EXISTS but the family's own colliding slot
 *     owns the name (§13 no-rename; the axis is left out forwarding
 *     ambient) — pinned by the exact member initializer text;
 *   the §13 number-lane forms (icon/spin verbatim per the
 *     no-ambient-size law; chart by the same analogy, census D1) ride
 *     `local` too — their open/absent number slots ARE the axis'
 *     number lane.
 */
const DEVIATIONS = {
  // absent (census-recorded)
  'native-select': { absent: ['size'] }, // the native size rows passthrough owns the name (batch A ruling)
  'component-canvas': { absent: ['theme'], local: { density: "densitySlot('default')" } }, // the stage-preview BINDABLES own theme (absent) + the legacy density slot stands in (D5)
  // family-local colliding slots (census-recorded, W6-dossier-flagged)
  chip: { local: { shape: 'chipShapeSlot' } }, // the square|pill silhouette vocabulary (batch B)
  badge: { local: { shape: 'badgeShapeSlot' } }, // the chip twin (batch B)
  'terminal-card': { local: { theme: 'terminalCardThemeSlot' } }, // the shell-theme LITERAL (batch C)
  'terminal-header': { local: { theme: 'terminalHeaderThemeSlot' } }, // the terminal-card twin (batch C)
  'code-card': { local: { theme: 'codeCardThemeSlot' } }, // the shiki theme literal — a colliding value space (D1)
  mermaid: { local: { theme: 'mermaidThemeSlot' } }, // the engine-token literal (D2)
  'ghostty-term': { local: { theme: 'ghosttyTermThemeSlot' } }, // the shell-theme OBJECT (batch A)
  'scroll-area': { local: { radius: 'scrollThumbRadiusSlot' } }, // `radius: number | 'full'`; the NUMBER lane rides both (D2)
  // the §13 number-lane forms
  icon: { local: { size: 'iconSizeSlot' } },
  spin: { local: { size: 'spinSizeSlot' } },
  chart: { local: { size: 'chartSizeSlot' } },
};
const absentOf = (family) => DEVIATIONS[family]?.absent ?? [];
const localOf = (family) => DEVIATIONS[family]?.local ?? {};

/** batch A's 16 native-collision families (design §1) */
const NATIVE_FAMILIES = [
  'input', 'native-select', 'textarea', 'color-picker', 'range', 'checkbox',
  'radio', 'file-input', 'number-input', 'cascader', 'tags-input', 'input-otp',
  'combobox', 'input-group', 'date-picker', 'ghostty-term',
];
const NATIVE_TAGS = new Set(['input', 'select', 'textarea']);
/** the ONE census-recorded native passthrough (native-select's rows mode) */
const NATIVE_PASSTHROUGH = { 'native-select': new Set(['size']) };

// ── reporting ─────────────────────────────────────────────────────
const red = [];
const receipts = [];
const fail = (law, msg) => red.push(`[${law}] ${msg}`);
const receipt = (law, msg) => receipts.push(`✓ ${law} ${msg}`);

// ── helpers ───────────────────────────────────────────────────────
const listDir = (dir) => readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

function walkFiles(dir, prefix = '') {
  const out = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.svelte-kit' || e.name === 'dist') continue;
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walkFiles(join(dir, e.name), rel));
    else out.push(rel);
  }
  return out.sort();
}

const familyDir = (family, siteOnly) =>
  join(root, siteOnly ? UI_SITE : UI_CANONICAL, family);

const familyFiles = (family, siteOnly) =>
  walkFiles(familyDir(family, siteOnly)).map((rel) => ({ rel, full: join(familyDir(family, siteOnly), rel) }));

const fileText = (full) => readFileSync(full, 'utf8');

// ══════════════════════════════════════════════════════════════════
// E1 — inventory completeness (§17.2)
// ══════════════════════════════════════════════════════════════════
const inventoryPath = join(root, INVENTORY_REL);
if (!existsSync(inventoryPath)) {
  console.error(`[explicit-props] ✗ inventory missing: ${INVENTORY_REL}`);
  process.exit(1);
}
const inventory = JSON.parse(fileText(inventoryPath));
const families = [...inventory.families].sort();
const siteDirs = listDir(join(root, UI_SITE));
const inInventoryNotDir = families.filter((f) => !siteDirs.includes(f));
const inDirNotInventory = siteDirs.filter((f) => !families.includes(f));
for (const f of inInventoryNotDir) fail('E1', `inventory family '${f}' has no apps/www/src/lib/ui directory — the census drifted (regenerate the inventory or restore the family)`);
for (const f of inDirNotInventory) fail('E1', `apps/www/src/lib/ui/${f} is in NEITHER the inventory NOR the exemption ledger — a family in neither list is a gate failure (design §17.2)`);
receipt('E1', `inventory ${families.length} families == the ${siteDirs.length} site ui dirs (${inInventoryNotDir.length + inDirNotInventory.length} drift)`);

// ══════════════════════════════════════════════════════════════════
// E2 — the single-class census vocabulary (W3 CLOSE)
// ══════════════════════════════════════════════════════════════════
const siteOnlySet = new Set(SITE_ONLY);
const contextOnlySet = new Set(CONTEXT_ONLY);
const engineWrapperSet = new Set(ENGINE_WRAPPER);
const rootlessSet = new Set(ROOTLESS_LIB);
for (const [name, set] of [['siteOnly', siteOnlySet], ['context-only', contextOnlySet], ['engine-wrapper', engineWrapperSet], ['rootless-lib', rootlessSet]]) {
  for (const f of set) if (!families.includes(f)) fail('E2', `the census's ${name} member '${f}' is not an inventory family`);
}
// class disjointness — single-class, no double-count (the 116 lesson)
const classes = [['siteOnly', siteOnlySet], ['context-only', contextOnlySet], ['engine-wrapper', engineWrapperSet], ['rootless-lib', rootlessSet]];
for (let i = 0; i < classes.length; i += 1) {
  for (let j = i + 1; j < classes.length; j += 1) {
    const overlap = [...classes[i][1]].filter((f) => classes[j][1].has(f));
    for (const f of overlap) fail('E2', `family '${f}' is double-counted (${classes[i][0]} ∩ ${classes[j][0]}) — the census is single-class`);
  }
}
// the pinned siteOnly must equal the inventory's own field
const invSiteOnly = [...(inventory.siteOnly ?? [])].sort();
if (JSON.stringify(invSiteOnly) !== JSON.stringify([...SITE_ONLY].sort())) {
  fail('E2', `the pinned siteOnly census [${SITE_ONLY.join(', ')}] != the inventory's siteOnly [${invSiteOnly.join(', ')}] — one of the two drifted; reconcile (single source)`);
}
// the rootless-lib must equal the exemption ledger (glass, reasons recorded)
const invExempt = [...(inventory.exemptions ?? [])].map((e) => e.family).sort();
if (JSON.stringify(invExempt) !== JSON.stringify([...ROOTLESS_LIB].sort())) {
  fail('E2', `the pinned rootless-lib census [${ROOTLESS_LIB.join(', ')}] != the inventory's exemption ledger [${invExempt.join(', ')}] — reconcile (single source)`);
}

const surfaceFamilies = families.filter((f) => !siteOnlySet.has(f) && !contextOnlySet.has(f) && !engineWrapperSet.has(f) && !rootlessSet.has(f));
const classOf = (f) =>
  siteOnlySet.has(f) ? 'siteOnly'
  : contextOnlySet.has(f) ? 'context-only'
  : engineWrapperSet.has(f) ? 'engine-wrapper'
  : rootlessSet.has(f) ? 'rootless-lib'
  : 'surface';

// per-family machinery shape
const defaultsFileOf = new Map(); // family → { rel, src } (undefined for rootless)
let shapeOk = 0;
for (const family of families) {
  const cls = classOf(family);
  const files = familyFiles(family, siteOnlySet.has(family));
  const texts = files.map(({ rel, full }) => ({ rel, src: fileText(full) }));
  const joined = texts.map((t) => t.src).join('\n');
  const defaultsEntry = texts.find((t) => t.rel.endsWith('-defaults.svelte.ts'));

  if (cls === 'rootless-lib') {
    if (defaultsEntry) fail('E2', `rootless-lib '${family}' ships ${defaultsEntry.rel} — the census says no component root / no prop surface; update the census or the tree`);
    continue;
  }
  if (!defaultsEntry) {
    fail('E2', `${cls} family '${family}' ships NO <family>-defaults.svelte.ts — every non-rootless family declares the axis surface there`);
    continue;
  }
  defaultsFileOf.set(family, defaultsEntry);

  const hasSupply = texts.some((t) => t.src.includes('provideUniversalLanes('));
  const hasStamp = texts.some((t) => t.src.includes('stampCarriersForLanes('));
  if (cls === 'surface' && (!hasSupply || !hasStamp)) {
    fail('E2', `surface family '${family}' must BOTH supply (provideUniversalLanes) and stamp (stampCarriersForLanes) — supply=${hasSupply} stamp=${hasStamp} (the §11 broadcast duty)`);
  }
  if (cls === 'siteOnly' && (!hasSupply || !hasStamp)) {
    fail('E2', `siteOnly family '${family}' adopts the axes like everyone (supply=${hasSupply} stamp=${hasStamp}) — siteOnly exempts the REGISTRY item, never the axis surface`);
  }
  if (cls === 'context-only') {
    if (!hasSupply) {
      fail('E2', `context-only family '${family}' must supply through CONTEXT (provideUniversalLanes) — the §11 broadcast duty rides context here`);
    }
    const legalStampers = new Set(SIBLING_STAMPERS[family] ?? []);
    const illegalStampers = texts.filter((t) => t.src.includes('stampCarriersForLanes(') && !legalStampers.has(t.rel)).map((t) => t.rel);
    for (const rel of illegalStampers) {
      fail('E2', `context-only family '${family}': ${rel} stamps carriers — a stamp claims an own root the census says this family's canonical main does not have (the recorded sibling stampers are [${[...legalStampers].join(', ') || 'none'}])`);
    }
  }
  if (cls === 'engine-wrapper') {
    if (hasSupply || hasStamp) {
      fail('E2', `engine-wrapper family '${family}' owns no DOM root — supply=${hasSupply} stamp=${hasStamp} both belong to the COMPOSED root it forwards to`);
    } else {
      // the forwarding receipt: the composed root receives every lane
      const rootSvelte = texts.find((t) => t.rel === `${family}.svelte`);
      const missingForwards = AXES.filter((axis) => rootSvelte && !new RegExp(`^\\s*${axis}=\\{`, 'm').test(rootSvelte.src));
      if (!rootSvelte || missingForwards.length) {
        fail('E2', `engine-wrapper family '${family}': the composed root must receive every resolved lane — missing forwards [${missingForwards.join(', ')}]`);
      }
    }
  }
  shapeOk += 1;
}
// the siteOnly carve: no canonical twin
for (const family of SITE_ONLY) {
  if (existsSync(join(root, UI_CANONICAL, family))) {
    fail('E2', `siteOnly family '${family}' has a registry/files/ui twin — siteOnly means NO registry:ui item (the inventory's note)`);
  }
}
receipt('E2', `single-class census: ${surfaceFamilies.length} surface · ${SITE_ONLY.length} siteOnly · ${CONTEXT_ONLY.length} context-only · ${ENGINE_WRAPPER.length} engine-wrapper · ${ROOTLESS_LIB.length} rootless-lib of ${families.length}; ${shapeOk} machinery shapes verified`);

// ══════════════════════════════════════════════════════════════════
// E3 — the axis surface (§16.1a: AST over *-defaults.svelte.ts)
// ══════════════════════════════════════════════════════════════════
const axisSlotCallee = (axis) => `${axis}AxisSlot`;
for (const [family, entry] of defaultsFileOf) {
  const sf = ts.createSourceFile(entry.rel, entry.src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  // the defineComponentDefaults({...}) call
  let contract = null;
  const visit = (node) => {
    if (node && typeof node === 'object') {
      if (Array.isArray(node)) { node.forEach(visit); return; }
      if (node.kind === ts.SyntaxKind.CallExpression && node.expression.getText(sf) === 'defineComponentDefaults') {
        const arg = node.arguments?.[0];
        if (arg?.kind === ts.SyntaxKind.ObjectLiteralExpression && contract === null) contract = arg;
      }
      for (const k of Object.keys(node)) {
        if (['parent', 'symbols'].includes(k)) continue;
        const v = node[k];
        if (v && typeof v === 'object') visit(v);
      }
    }
  };
  visit(sf);
  if (contract === null) {
    fail('E3', `${entry.rel}: no defineComponentDefaults({...}) contract found — the axis surface declares through it`);
    continue;
  }
  const members = new Map(); // axis member name → initializer text
  for (const prop of contract.properties) {
    if (prop.kind !== ts.SyntaxKind.PropertyAssignment) continue;
    const name = prop.name.getText(sf);
    members.set(name, prop.initializer.getText(sf));
  }
  const absent = absentOf(family);
  const local = localOf(family);
  for (const axis of AXES) {
    if (absent.includes(axis)) {
      if (members.has(axis)) {
        fail('E3', `${entry.rel}: census-recorded deviation '${family}' omits '${axis}' but the member reappeared — the census is stale (update the census + this gate together)`);
      }
      continue;
    }
    const pinnedLocal = local[axis];
    if (pinnedLocal !== undefined) {
      const value = members.get(axis);
      if (value === undefined) {
        fail('E3', `${entry.rel}: census-recorded deviation '${family}' pins '${axis}' to the family-local slot '${pinnedLocal}' — the member is MISSING (a deviation is a pinned state, not a hole)`);
      } else if (value.trim() !== pinnedLocal) {
        fail('E3', `${entry.rel}: deviation '${family}.${axis}' must stay the pinned family-local slot '${pinnedLocal}' — got '${value.trim().slice(0, 60)}' (the colliding name owns the prop; drift means an unruled rename happened)`);
      }
      continue;
    }
    const value = members.get(axis);
    if (value === undefined) {
      fail('E3', `${entry.rel}: axis '${axis}' is MISSING and '${family}' is NOT in the census deviation allowlist — an unlisted family missing an axis is a failure`);
    } else if (!new RegExp(`^${axisSlotCallee(axis)}\\(`).test(value.trim())) {
      // allow own-lane arguments (sizeAxisSlot('small')) — anything
      // else is not the shared slot helper
      fail('E3', `${entry.rel}: axis '${axis}' must resolve through the shared slot helper ${axisSlotCallee(axis)} — got '${value.trim().slice(0, 60)}'`);
    }
  }
}
receipt('E3', `axis surface: ${defaultsFileOf.size} defaults contracts parsed; deviation allowlist = ${Object.keys(DEVIATIONS).length} census-recorded families (${Object.values(DEVIATIONS).reduce((a, d) => a + (d.absent?.length ?? 0) + Object.keys(d.local ?? {}).length, 0)} pinned departures) — the ONLY legal ones`);

// ══════════════════════════════════════════════════════════════════
// E4 — the provider-snapshot kernel law (census D1 / commit 2b28536c)
// ══════════════════════════════════════════════════════════════════
const BRIDGE_RE = /provideDensity\s*\(\s*\(\s*\)\s*=>/;
const UNIVERSAL_CALL_RE = /provideUniversalLanes\s*\(/g;

/** read a balanced {...} right after a provideUniversalLanes( opener */
function readLiteralObject(src, callStart) {
  const open = src.indexOf('(', callStart);
  if (open === -1) return null;
  // skip to the object literal
  let i = open + 1;
  while (i < src.length && /\s/.test(src[i])) i += 1;
  if (src[i] !== '{') return null;
  let depth = 0;
  let quote = null;
  for (let j = i; j < src.length; j += 1) {
    const ch = src[j];
    if (quote) {
      if (ch === '\\') j += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') {
      depth -= 1;
      if (depth === 0) return src.slice(i + 1, j);
    }
  }
  return null;
}

/** top-level entry keys of an object-literal body */
function topLevelKeys(body) {
  const keys = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  const parts = [];
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
    else if (ch === ',' && depth === 0) { parts.push(body.slice(start, i)); start = i + 1; }
  }
  parts.push(body.slice(start));
  for (const part of parts) {
    const m = /^\s*(?:(['"])([^'"]+)\1|([A-Za-z_$][\w$]*))\s*(?::|,|$)/.exec(part);
    if (m) keys.push(m[2] ?? m[3]);
  }
  return keys;
}

let bridgedFiles = 0;
for (const tree of ['registry/files', 'apps/www/src']) {
  for (const rel of walkFiles(join(root, tree))) {
    if (!/\.(svelte|ts|js|svelte\.ts)$/.test(rel) && !rel.endsWith('.svelte')) continue;
    const src = fileText(join(root, tree, rel));
    if (!BRIDGE_RE.test(src)) continue;
    bridgedFiles += 1;
    UNIVERSAL_CALL_RE.lastIndex = 0;
    let m;
    while ((m = UNIVERSAL_CALL_RE.exec(src))) {
      const body = readLiteralObject(src, m.index);
      if (body === null) {
        fail('E4', `${tree}/${rel}: provideUniversalLanes(...) argument is not an object literal beside a reactive provideDensity bridge — unparseable by the gate; use the literal form`);
        continue;
      }
      if (topLevelKeys(body).includes('density')) {
        fail('E4', `${tree}/${rel}: provideUniversalLanes literal passes 'density' while the file has the reactive bridged provideDensity(() => …) — the literal SNAPSHOTS the prop at init and freezes the explicit lane over the bridge (census D1, commit 2b28536c); drop 'density' from the literal`);
      }
    }
  }
}
receipt('E4', `provider-snapshot kernel law: ${bridgedFiles} reactive-bridge file(s) checked — zero density-in-literal snapshots`);

// ══════════════════════════════════════════════════════════════════
// E5 — the native forwarding ban (§1, batch A's 16)
// ══════════════════════════════════════════════════════════════════
const PROPS_RE = /let\s*\{([^}]*)\}\s*(?::[^=]+)?=\s*\$props\(/g;
for (const family of NATIVE_FAMILIES) {
  const files = familyFiles(family, false).filter(({ rel }) => rel.endsWith('.svelte'));
  const destructured = new Set();
  for (const { rel, full } of files) {
    const src = fileText(full);
    // the destructured names (so {...rest} cannot carry the owned axes)
    let m;
    PROPS_RE.lastIndex = 0;
    while ((m = PROPS_RE.exec(src))) {
      for (const entry of m[1].split(',')) {
        const name = /^\s*(?:class\s*:\s*)?([A-Za-z_$][\w$]*)/.exec(entry);
        if (name) destructured.add(name[1]);
      }
    }
    // the native-tag attribute ban (svelte AST)
    let ast;
    try { ast = svelteParse(src, { filename: rel }); } catch (e) {
      fail('E5', `${UI_CANONICAL}/${family}/${rel}: svelte parse failed — ${e.message}`);
      continue;
    }
    const walkMarkup = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walkMarkup); return; }
      // 'Element' here, 'RegularElement' in newer flavors — both accepted
      if ((node.type === 'Element' || node.type === 'RegularElement') && NATIVE_TAGS.has(node.name)) {
        for (const attr of node.attributes ?? []) {
          if (attr.type !== 'Attribute') continue;
          if (AXES.includes(attr.name) && !(NATIVE_PASSTHROUGH[family]?.has(attr.name))) {
            fail('E5', `${UI_CANONICAL}/${family}/${rel}: native <${node.name}> carries the axis attribute '${attr.name}' — a consumed axis prop NEVER lands on the native element (design §1; the family consumes it, {...rest} forwards everything it does not own)`);
          }
        }
      }
      for (const k of Object.keys(node)) {
        if (['start', 'end', 'parent', 'loc', 'range'].includes(k)) continue;
        const v = node[k];
        if (v && typeof v === 'object') walkMarkup(v);
      }
    };
    walkMarkup(ast.html ?? ast.fragment);
  }
  // owned = the axes the family CONSUMES: absent-listed ones are not
  // ours (the collision lives outside the contract); family-LOCAL
  // collisions (ghostty-term's theme object) still destructure.
  const owned = AXES.filter((axis) => !absentOf(family).includes(axis));
  const missingDestructure = owned.filter((axis) => !destructured.has(axis));
  if (missingDestructure.length) {
    fail('E5', `${UI_CANONICAL}/${family}: owned axes [${missingDestructure.join(', ')}] are not destructured out of $props() — an undestructured axis rides {...rest} onto the native element (the destructured-prop-wins law)`);
  }
}
receipt('E5', `native forwarding ban: ${NATIVE_FAMILIES.length} families × (destructure-the-owned-axes + zero axis attributes on native tags); the one census passthrough = native-select's size`);

// ══════════════════════════════════════════════════════════════════
// E6 — the carrier law composition (§10/§16.1b)
// ══════════════════════════════════════════════════════════════════
// The delegation contract first: the zero-class-identity census lives
// in verify:tailwindless (the standing ratchet) — assert the wiring.
const pkg = JSON.parse(fileText(join(root, 'package.json')));
if (!pkg.scripts?.['verify:tailwindless']) {
  fail('E6', "package.json lost the verify:tailwindless wiring — the carrier law's zero-class-identity half is DELEGATED to that gate (design §16.1b composition); restoring it is part of this gate's contract");
}

let carrierFiles = 0;
for (const family of families) {
  if (siteOnlySet.has(family)) continue; // canonical tree only (mirror law)
  const files = familyFiles(family, false).filter(({ rel }) => rel.endsWith('.svelte'));
  for (const { rel, full } of files) {
    const src = fileText(full);
    if (!src.includes('stampCarriersForLanes(')) continue;
    carrierFiles += 1;
    let ast;
    try { ast = svelteParse(src, { filename: rel }); } catch (e) {
      fail('E6', `${UI_CANONICAL}/${family}/${rel}: svelte parse failed — ${e.message}`);
      continue;
    }
    // identifiers carrying the stamp (direct + one join hop)
    const flowing = new Set();
    const program = ast.instance?.content ?? ast.module?.content;
    if (program) {
      const visit = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(visit); return; }
        if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
          const text = node.init ? src.slice(node.init.start, node.init.end) : '';
          if (/stampCarriersForLanes\s*\(/.test(text)) flowing.add(node.id.name);
        }
        for (const k of Object.keys(node)) {
          if (['parent', 'loc', 'range'].includes(k)) continue;
          const v = node[k];
          if (v && typeof v === 'object') visit(v);
        }
      };
      visit(program);
      // the join hop: `const rootStyle = [carriers, …].join(...)` feeds style
      for (let round = 0; round < 2; round += 1) {
        const visitJoin = (node) => {
          if (!node || typeof node !== 'object') return;
          if (Array.isArray(node)) { node.forEach(visitJoin); return; }
          if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && !flowing.has(node.id.name)) {
            const text = node.init ? src.slice(node.init.start, node.init.end) : '';
            if ([...flowing].some((id) => new RegExp(`\\b${id}\\b`).test(text))) flowing.add(node.id.name);
          }
          for (const k of Object.keys(node)) {
            if (['parent', 'loc', 'range'].includes(k)) continue;
            const v = node[k];
            if (v && typeof v === 'object') visitJoin(v);
          }
        };
        visitJoin(program);
      }
    }
    if (flowing.size === 0) continue;
    // markup: a flowing identifier may appear ONLY in style attribute values
    // (node names per THIS svelte flavor's parse: Attribute / Class (a
    // class: directive) / Binding / Spread; the modern RegularElement
    // spellings accepted too)
    const DIRECTIVE_KIND = new Map([
      ['Class', (n) => `class:${n.name}`],
      ['ClassDirective', (n) => `class:${n.name}`],
      ['Binding', (n) => `bind:${n.name}`],
      ['BindDirective', (n) => `bind:${n.name}`],
      ['StyleDirective', (n) => `style:${n.name}`],
      ['Transition', (n) => `transition:${n.name}`],
      ['Animation', (n) => `animate:${n.name}`],
      ['Spread', () => '{...spread}'],
      ['SpreadAttribute', () => '{...spread}'],
    ]);
    const walkMarkup = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walkMarkup); return; }
      if (node.type === 'Attribute' || DIRECTIVE_KIND.has(node.type)) {
        const kind = node.type === 'Attribute' ? node.name : DIRECTIVE_KIND.get(node.type)(node);
        const valueText = node.value === undefined ? ''
          : typeof node.value === 'string' ? node.value
          : (Array.isArray(node.value) ? node.value : [node.value])
            .map((v) => (v?.expression ? src.slice(v.expression.start ?? v.start, v.expression.end ?? v.end) : (v?.data ?? '')))
            .join(' ');
        const hit = [...flowing].find((id) => new RegExp(`\\b${id}\\b`).test(valueText));
        if (hit) {
          const isStyle = node.type === 'Attribute' && node.name === 'style';
          if (!isStyle) {
            fail('E6', `${UI_CANONICAL}/${family}/${rel}: the carrier value '${hit}' reaches a NON-STYLE position '${kind}' — axis values are §10 CSS EXPRESSIONS on inline style vars, never class identities or other attributes`);
          }
        }
      }
      for (const k of Object.keys(node)) {
        if (['start', 'end', 'parent', 'loc', 'range'].includes(k)) continue;
        const v = node[k];
        if (v && typeof v === 'object') walkMarkup(v);
      }
    };
    walkMarkup(ast.html ?? ast.fragment);
  }
}
receipt('E6', `carrier law: ${carrierFiles} stamping file(s) style-bound; zero-class-identity census delegated to verify:tailwindless (wiring asserted)`);

// ── summary ───────────────────────────────────────────────────────
for (const line of receipts) console.log(`[explicit-props] ${line}`);
if (red.length) {
  console.error(`\n[explicit-props] ✗ RED — ${red.length} violation(s):`);
  for (const line of red) console.error(`  ✗ ${line}`);
  process.exit(1);
}
console.log(`\n[explicit-props] ✓ GREEN — ${families.length} families under the explicit-props law (design §16.1: axis surface · carrier law · broadcast duty · native forwarding ban + the census vocabulary, the provider-snapshot kernel law, the deviation allowlist)`);
