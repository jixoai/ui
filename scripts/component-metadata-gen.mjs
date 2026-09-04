#!/usr/bin/env node
// component-metadata-gen — registry .svelte → two-zone .meta.ts
// (canvas-schema-pipeline, 2026-08-30).
//
// The structural extraction build step: AST-based, ZERO new
// dependencies — the www workspace's existing `typescript` devDep
// parses the script blocks and `svelte`'s compiler parses the template
// (the repo root has neither, so both resolve through
// apps/www/package.json).
//
// Modes:
//   node scripts/component-metadata-gen.mjs <component-path…>  # write
//       a path is a registry .svelte path (registry/files/ui/x/x.svelte)
//       or a bare component name (x). Output: apps/www/src/lib/meta/x.meta.ts
//   node scripts/component-metadata-gen.mjs --check [paths…]
//       drift gate: regenerate in memory, diff the GENERATED zone, exit 1
//       naming the stale files (the gen-mirror-manifest lock pattern).
//       NO paths → check every committed *.meta.ts (the CI gate:
//       "changed the component, forgot the meta").
//   node scripts/component-metadata-gen.mjs --self-test
//       fixture extraction assertions (four fixtures per the design)
//       + the two-zone preservation mechanics.
//
// Two-zone law: the GENERATED block is regenerated verbatim and never
// hand-edited; everything after the end marker (the hand-authored
// `annotations` export) survives regeneration byte-identically.
//
// Extraction ceiling (deliberate, design.md): same-file type
// resolution only —
//   literal string union → enum; numeric literal union → number with
//   minimum/maximum; string/boolean/number keywords → primitives;
//   Snippet<…> → snippet (documented, panel-excluded); $props()
//   destructure initializers → default (literal `undefined` is no
//   default; kind-mismatched defaults drop honestly); spread
//   ...restProps → a documented passthrough row; everything
//   imported/complex → opaque with the source type text — never
//   silently dropped. svelte2tsx is the documented upgrade path if
//   gaps accumulate (design note, not a task).
//
// Ambient column (context-defaults-economy 4.3): a sibling
// <family>/<family>-defaults.svelte.ts slot whose name matches an
// extracted prop emits `ambient: 'zone' | 'scope' | 'own'` (paint axis
// / density axis / literal family) appended to that prop's node — the
// docs table's three-state Default-column marker. Slot facts come from
// the family Defaults contract; slot owns never synthesize IR defaults.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const selfTestMode = args.includes('--self-test');
const inputs = args.filter((a) => !a.startsWith('--'));

const die = (msg) => {
  console.error(`[component-metadata-gen] ${msg}`);
  process.exit(1);
};

// ── dependency resolution (root has no typescript/svelte) ───────────
const wwwRequire = createRequire(join(root, 'apps/www/package.json'));
const ts = wwwRequire('typescript');
// svelte 5.5x stopped exporting `walk` from svelte/compiler (use
// estree-walker); we ship a tiny generic walker instead — still zero
// new dependencies. The import-conditioned ESM entry is addressed
// through the resolved package root.
const { parse: parseSvelte } = await import(
  new URL('./src/compiler/index.js', pathToFileURL(wwwRequire.resolve('svelte/package.json'))).href
);

// ── source splitting ────────────────────────────────────────────────
function splitScripts(source) {
  const scripts = { module: '', instance: '' };
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(source))) {
    if (/\bmodule\b/.test(m[1])) scripts.module += m[2];
    else scripts.instance += m[2];
  }
  return scripts;
}

// ── template pass: data-jx-* hooks ──────────────────────────────────
// generic depth walk over the Svelte AST (objects with a `type`, plus
// arrays) — enough for attribute collection without estree-walker.
function collectHooks(source) {
  const names = new Set();
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node === null || typeof node !== 'object' || typeof node.type !== 'string') return;
    if (node.type === 'Attribute' && /^data-jx-[a-z0-9-]+$/.test(node.name)) {
      names.add(node.name);
    }
    for (const key of Object.keys(node)) {
      if (key !== 'type') visit(node[key]);
    }
  };
  try {
    visit(parseSvelte(source).html);
  } catch {
    // unparsable template: props still extract; hooks stay empty
  }
  return [...names].sort();
}

// ── TS AST helpers ──────────────────────────────────────────────────
const parseTs = (code) =>
  ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function collectLocals(sfs) {
  const locals = new Map(); // name → InterfaceDeclaration | TypeAliasDeclaration
  for (const sf of sfs) {
    for (const stmt of sf.statements) {
      if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) {
        locals.set(stmt.name.text, stmt);
      }
    }
  }
  return locals;
}

function findPropsDecl(sfs) {
  for (const sf of sfs) {
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (
          decl.initializer &&
          ts.isCallExpression(decl.initializer) &&
          decl.initializer.getText(sf) === '$props()'
        ) {
          return { decl, sf };
        }
      }
    }
  }
  return undefined;
}

function bindingEntries(decl, sf) {
  if (!decl.name || !ts.isObjectBindingPattern(decl.name)) return [];
  // TS AST note: annotation properties are `.type` (not Babel's
  // `typeAnnotation`); a rest element's annotation lives on the PATTERN
  const patternType = decl.name.type ? printNode(decl.name.type, sf) : undefined;
  const out = [];
  for (const el of decl.name.elements) {
    if (!ts.isBindingElement(el)) continue;
    if (el.dotDotDotToken) {
      out.push({
        key: el.name.getText(sf),
        rest: true,
        typeText: patternType ?? 'unknown (spread passthrough)',
      });
      continue;
    }
    out.push({
      key: el.propertyName ? el.propertyName.getText(sf) : el.name.getText(sf),
      initializer: el.initializer,
    });
  }
  return out;
}

const printNode = (node, sf) => node.getText(sf);

/** literal initializer → value; `undefined` and non-literals are absent */
function literalValue(node, sf) {
  if (!node) return { present: false };
  if (ts.isStringLiteralLike(node)) return { present: true, value: node.text };
  if (node.kind === ts.SyntaxKind.TrueKeyword) return { present: true, value: true };
  if (node.kind === ts.SyntaxKind.FalseKeyword) return { present: true, value: false };
  if (ts.isNumericLiteral(node)) return { present: true, value: Number(node.text) };
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return { present: true, value: -Number(node.operand.text) };
  }
  return { present: false };
}

/**
 * Resolve a type node against SAME-FILE declarations only. Anything
 * imported or complex degrades to an honest opaque with the source
 * type text.
 */
function resolveTypeNode(typeNode, locals, sf) {
  if (!typeNode) return { kind: 'opaque', typeText: 'unknown' };
  if (ts.isUnionTypeNode(typeNode)) {
    const { types } = typeNode;
    if (types.every((t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal))) {
      return { kind: 'enum', values: types.map((t) => t.literal.text) };
    }
    if (types.every((t) => ts.isLiteralTypeNode(t) && ts.isNumericLiteral(t.literal))) {
      const nums = types.map((t) => Number(t.literal.text));
      return { kind: 'number', minimum: Math.min(...nums), maximum: Math.max(...nums) };
    }
    return { kind: 'opaque', typeText: printNode(typeNode, sf) };
  }
  if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
    return { kind: 'enum', values: [typeNode.literal.text] };
  }
  if (
    typeNode.kind === ts.SyntaxKind.StringKeyword ||
    typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
    typeNode.kind === ts.SyntaxKind.NumberKeyword
  ) {
    const text = printNode(typeNode, sf);
    if (text === 'string') return { kind: 'string' };
    if (text === 'boolean') return { kind: 'boolean' };
    if (text === 'number') return { kind: 'number' };
  }
  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText(sf);
    if (name === 'Snippet') return { kind: 'snippet', typeText: printNode(typeNode, sf) };
    const local = locals.get(name);
    if (local && ts.isTypeAliasDeclaration(local)) {
      const resolved = resolveTypeNode(local.type, locals, sf);
      if (resolved.kind !== 'opaque') return resolved;
      // alias to a complex shape: report the MEMBER's own type text
      return { kind: 'opaque', typeText: printNode(typeNode, sf) };
    }
    return { kind: 'opaque', typeText: printNode(typeNode, sf) };
  }
  return { kind: 'opaque', typeText: printNode(typeNode, sf) };
}

function inferFromInitializer(init, sf) {
  const lit = literalValue(init, sf);
  if (lit.present) {
    if (typeof lit.value === 'string') return { kind: 'string', default: lit.value };
    if (typeof lit.value === 'boolean') return { kind: 'boolean', default: lit.value };
    return { kind: 'number', default: lit.value };
  }
  return { kind: 'opaque', typeText: 'unknown' };
}

// ── ambient slots: the family Defaults contract (4.3) ────────────────
//
// The docs-facing ambient state rides the GENERATED zone, derived from
// the family's *-defaults.svelte.ts — the SINGLE declared ambient
// contract (scripts/verify-context-coverage.mjs is its legality gate;
// scripts/context-coverage.config.json the slot-factory vocabulary,
// read read-only here). Slot NAME = prop NAME; a slot whose name is not
// an extracted prop (toast's per-item variant/material, popover's
// prop-less density lane) honestly emits nothing. Slot VALUES are
// named exported constants wired by reference (slot-values-first):
// an Identifier resolves one hop to its same-file `export const <name>
// = <factory>(…)` initializer — inline calls stay legal, resolution
// never recurses. Classification per factory: definePaintSlot → the
// paint axis zone; densitySlot → the ambient density scope; every
// other registered factory (defineLiteralSlot / defineOpenSlot /
// absentSlot today) → the literal family's declared own. The slot's
// own VALUE never synthesizes an IR default (r13: owns that left the
// statically-extractable zone ride required; the marker alone carries
// the state).
const COVERAGE_CONFIG_PATH = join(root, 'scripts/context-coverage.config.json');
let SLOT_FACTORIES_CACHE;
const AMBIENT_OF_FACTORY = {
  definePaintSlot: 'zone',
  densitySlot: 'scope',
};

function slotFactories() {
  if (SLOT_FACTORIES_CACHE === undefined) {
    try {
      SLOT_FACTORIES_CACHE = new Set(
        Object.keys(JSON.parse(readFileSync(COVERAGE_CONFIG_PATH, 'utf8')).slotFactories ?? {}),
      );
    } catch {
      SLOT_FACTORIES_CACHE = new Set(); // config unreadable: no ambient emission
    }
  }
  return SLOT_FACTORIES_CACHE;
}

/** the named-slot-constant resolution (slot-values-first B2): an
 *  Identifier slot value resolves ONE hop to its same-file
 *  `export const <name> = <factory>(…)` initializer — never
 *  recursive; a wrong-shape or missing declaration resolves to
 *  undefined and the slot honestly emits no ambient */
function resolveNamedSlotCall(idName, sf) {
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== idName) continue;
      const init = decl.initializer;
      return init && ts.isCallExpression(init) && ts.isIdentifier(init.expression)
        ? init
        : undefined;
    }
  }
  return undefined;
}

/** slotName → ambient kind, from the family defaults file (may be absent) */
function ambientSlotsOf(sourcePath) {
  const dir = dirname(sourcePath);
  const family = basename(dir);
  const defaultsPath = resolve(root, join(dir, `${family}-defaults.svelte.ts`));
  const out = new Map();
  if (!existsSync(defaultsPath)) return out;
  const sf = parseTs(readFileSync(defaultsPath, 'utf8'));
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (
        !decl.initializer ||
        !ts.isCallExpression(decl.initializer) ||
        decl.initializer.expression.getText(sf) !== 'defineComponentDefaults'
      ) {
        continue;
      }
      const arg = decl.initializer.arguments[0];
      if (!arg || !ts.isObjectLiteralExpression(arg)) continue;
      for (const prop of arg.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const value = prop.initializer;
        // inline factory call, or a named exported slot constant
        // resolved one hop (slot-values-first B2)
        const call =
          ts.isCallExpression(value) && ts.isIdentifier(value.expression)
            ? value
            : ts.isIdentifier(value)
              ? resolveNamedSlotCall(value.text, sf)
              : undefined;
        if (!call) continue;
        const factory = call.expression.text;
        if (!slotFactories().has(factory)) continue;
        out.set(
          prop.name.getText(sf).replace(/^['"]|['"]$/g, ''),
          AMBIENT_OF_FACTORY[factory] ?? 'own',
        );
      }
    }
  }
  return out;
}

function withDefault(node, init, sf) {
  const lit = literalValue(init, sf);
  if (!lit.present) return node;
  const t = typeof lit.value;
  if (node.kind === 'enum' && t === 'string' && node.values.includes(lit.value)) {
    return { ...node, default: lit.value };
  }
  if (node.kind === 'string' && t === 'string') return { ...node, default: lit.value };
  if (node.kind === 'boolean' && t === 'boolean') return { ...node, default: lit.value };
  if (node.kind === 'number' && t === 'number') return { ...node, default: lit.value };
  return node; // kind-mismatched default: dropped (documented ceiling)
}

// ── the extractor ───────────────────────────────────────────────────
function extractMeta(source, sourcePath, ambientSlots = new Map()) {
  const { module: moduleCode, instance: instanceCode } = splitScripts(source);
  const sfs = [moduleCode, instanceCode].filter(Boolean).map(parseTs);
  const locals = collectLocals(sfs);
  const propsDecl = findPropsDecl(sfs);
  const hooks = collectHooks(source);
  const props = {};
  if (propsDecl) {
    const { decl, sf } = propsDecl;
    const entries = bindingEntries(decl, sf);

    // the Props-shaped source: annotated local interface, inline type
    // literal, or nothing (inference fallback)
    let members;
    if (decl.type) {
      const t = decl.type;
      if (ts.isTypeReferenceNode(t)) {
        const local = locals.get(t.typeName.getText(sf));
        if (local && ts.isInterfaceDeclaration(local)) members = local.members;
      } else if (ts.isTypeLiteralNode(t)) {
        members = t.members;
      }
    }

    if (members) {
      for (const member of members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const key = member.name.getText(sf).replace(/^['"]|['"]$/g, '');
        const entry = entries.find((e) => e.key === key);
        props[key] = withDefault(resolveTypeNode(member.type, locals, sf), entry?.initializer, sf);
      }
      // safety net: destructured keys the interface never declared
      for (const e of entries) {
        if (e.key in props) continue;
        props[e.key] = e.rest
          ? { kind: 'opaque', typeText: e.typeText }
          : inferFromInitializer(e.initializer, sf);
      }
    } else {
      // annotation-less $props(): kinds from initializer literals,
      // honest 'unknown' opaques otherwise
      for (const e of entries) {
        props[e.key] = e.rest
          ? { kind: 'opaque', typeText: e.typeText }
          : inferFromInitializer(e.initializer, sf);
      }
    }
  }
  // the ambient column facts: slot-carrying props only, appended last
  // (deterministic key order; quoted interface spellings normalize the
  // same way the extraction keys do)
  for (const [slotName, ambient] of ambientSlots) {
    if (slotName in props) props[slotName] = { ...props[slotName], ambient };
  }
  return { source: sourcePath, props, hooks };
}

// ── the two-zone emitter ────────────────────────────────────────────
const GENERATED_START = '// ===== GENERATED — do not edit (component-metadata-gen) =====';
const GENERATED_END = '// ===== end GENERATED — annotations below survive regeneration =====';
const DEFAULT_ANNOTATIONS = `
// Hand-authored x-ui hints — merged at consume time via
// withAnnotations(meta, annotations); regeneration never touches this zone.
export const annotations = defineAnnotations({});
`;

function emitGenerated(meta) {
  const json = JSON.stringify(
    { source: meta.source, props: meta.props, hooks: meta.hooks },
    null,
    2,
  );
  const indented = json
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
  return `import { defineAnnotations, defineComponentMeta } from '$lib/schema/ir';\n\n${GENERATED_START}\nexport const meta = defineComponentMeta(\n${indented}\n);\n${GENERATED_END}\n`;
}

/** the committed file's generated zone (undefined when unparseable) */
function generatedZoneOf(text) {
  const idx = text.indexOf(GENERATED_END);
  if (idx === -1) return undefined;
  return text.slice(0, idx + GENERATED_END.length + 1); // incl. trailing \n
}

const annotationsZoneOf = (text) => {
  const idx = text.indexOf(GENERATED_END);
  return idx === -1 ? undefined : text.slice(idx + GENERATED_END.length + 1);
};

const emitFile = (meta, annotationsZone = DEFAULT_ANNOTATIONS) =>
  emitGenerated(meta) + annotationsZone;

// ── CLI plumbing ────────────────────────────────────────────────────
const META_DIR = join(root, 'apps/www/src/lib/meta');

function resolveComponentInput(input) {
  if (input.endsWith('.svelte')) {
    // normalize a mirror-path hand-in to its registry twin
    const registryTwin = input.replace(/^apps\/www\/src\/lib\/ui\//, 'registry/files/ui/');
    return registryTwin === input || existsSync(join(root, registryTwin)) ? registryTwin : input;
  }
  return `registry/files/ui/${input}/${input}.svelte`; // bare component name
}

const metaTargetOf = (sourcePath) =>
  join(META_DIR, `${basename(sourcePath).replace(/\.svelte$/, '')}.meta.ts`);

function generate(sourcePath) {
  const abs = resolve(root, sourcePath);
  if (!existsSync(abs)) die(`component source not found: ${sourcePath}`);
  return extractMeta(readFileSync(abs, 'utf8'), sourcePath, ambientSlotsOf(sourcePath));
}

function writeOne(sourcePath) {
  const meta = generate(sourcePath);
  const target = metaTargetOf(sourcePath);
  const zone = existsSync(target)
    ? (annotationsZoneOf(readFileSync(target, 'utf8')) ?? DEFAULT_ANNOTATIONS)
    : DEFAULT_ANNOTATIONS;
  mkdirSync(META_DIR, { recursive: true });
  writeFileSync(target, emitFile(meta, zone));
  const ambientCount = Object.values(meta.props).filter((p) => p.ambient).length;
  console.log(
    `[component-metadata-gen] wrote ${join('apps/www/src/lib/meta', basename(target))} ` +
      `(props: ${Object.keys(meta.props).length}, hooks: ${meta.hooks.length}` +
      `${ambientCount ? `, ambient: ${ambientCount}` : ''})`,
  );
}

function checkOne(sourcePath, targetOverride) {
  const target = targetOverride ?? metaTargetOf(sourcePath);
  if (!existsSync(target)) return `${target} (missing)`;
  const committed = readFileSync(target, 'utf8');
  const zone = generatedZoneOf(committed);
  const fresh = emitGenerated(generate(sourcePath));
  return zone === fresh ? undefined : target;
}

function sourceOfMetaFile(text) {
  return text.match(/"source":\s*"([^"]+)"/)?.[1];
}

/** best-effort regen hint for a stale target path */
const sourceHint = (staleEntry) => sourceOfMetaFile(readFileSync(staleEntry.split(' (')[0], 'utf8')) ?? staleEntry;

// ── --self-test fixtures (the design's four shapes) ─────────────────
const FIXTURES = [
  {
    name: 'enum + default + hooks',
    source: `<script module lang="ts">
  export type Shape = 'sharp' | 'bevel' | 'round';
</script>

<script lang="ts">
  interface Props {
    shape?: Shape;
    label?: string;
    disabled?: boolean;
    children: Snippet;
  }
  let { shape = 'bevel', label, disabled = false, children }: Props = $props();
</script>

<button data-jx-fixture={shape} data-jx-fixture-spin>{label}</button>`,
    expected: {
      source: 'fixture-enum.svelte',
      props: {
        shape: { kind: 'enum', values: ['sharp', 'bevel', 'round'], default: 'bevel' },
        label: { kind: 'string' },
        disabled: { kind: 'boolean', default: false },
        children: { kind: 'snippet', typeText: 'Snippet' },
      },
      hooks: ['data-jx-fixture', 'data-jx-fixture-spin'],
    },
  },
  {
    name: 'numeric bounds',
    source: `<script lang="ts">
  interface Props {
    level?: 0 | 1 | 2 | 3;
    count?: number;
    opacity?: 0 | 25 | 50 | 75 | 100;
  }
  let { level, count = 1, opacity = 50 }: Props = $props();
</script>

<span data-jx-meter={level}></span>`,
    expected: {
      source: 'fixture-number.svelte',
      props: {
        level: { kind: 'number', minimum: 0, maximum: 3 },
        count: { kind: 'number', default: 1 },
        opacity: { kind: 'number', minimum: 0, maximum: 100, default: 50 },
      },
      hooks: ['data-jx-meter'],
    },
  },
  {
    name: 'snippet + opaque',
    source: `<script lang="ts">
  import type { Density } from '$lib/density.svelte';

  interface Props {
    density?: Density;
    onchange?: (value: string) => void;
    footer?: Snippet<[number]>;
    class?: string;
  }
  let { density, onchange, footer, class: className = '' }: Props = $props();
</script>

<div data-jx-panel>{String(density)}</div>`,
    expected: {
      source: 'fixture-opaque.svelte',
      props: {
        density: { kind: 'opaque', typeText: 'Density' },
        onchange: { kind: 'opaque', typeText: '(value: string) => void' },
        footer: { kind: 'snippet', typeText: 'Snippet<[number]>' },
        class: { kind: 'string', default: '' },
      },
      hooks: ['data-jx-panel'],
    },
  },
  {
    name: 'annotation-less $props (inference fallback + spread row)',
    source: `<script lang="ts">
  let { label = 'ok', count = 3, flag = true, tone, ...restProps } = $props();
</script>

<button data-jx-infer>{label}</button>`,
    expected: {
      source: 'fixture-infer.svelte',
      props: {
        label: { kind: 'string', default: 'ok' },
        count: { kind: 'number', default: 3 },
        flag: { kind: 'boolean', default: true },
        tone: { kind: 'opaque', typeText: 'unknown' },
        restProps: { kind: 'opaque', typeText: 'unknown (spread passthrough)' },
      },
      hooks: ['data-jx-infer'],
    },
  },
  {
    // 4.3: the ambient column facts — a slot map (ambientSlotsOf output)
    // attaches `ambient` to slot-carrying props only; a slot whose name
    // is not an extracted prop (toast's per-item fields) emits nothing;
    // slot-less props carry no field
    name: 'ambient slots (4.3)',
    source: `<script lang="ts">
  interface Props {
    variant?: 'fill' | 'tonal' | 'outline';
    density?: string;
    shape?: 'square' | 'pill';
    label?: string;
  }
  let { variant, density, shape = 'square', label }: Props = $props();
</script>

<div data-jx-ambient={variant}></div>`,
    slots: new Map([
      ['variant', 'zone'],
      ['density', 'scope'],
      ['shape', 'own'],
      ['material', 'own'],
    ]),
    expected: {
      source: 'fixture-ambient.svelte',
      props: {
        variant: { kind: 'enum', values: ['fill', 'tonal', 'outline'], ambient: 'zone' },
        density: { kind: 'string', ambient: 'scope' },
        shape: { kind: 'enum', values: ['square', 'pill'], default: 'square', ambient: 'own' },
        label: { kind: 'string' },
      },
      hooks: ['data-jx-ambient'],
    },
  },
];

// order-insensitive structural compare (key order feeds the emitted
// file, not extraction correctness)
const normalize = (v) =>
  Array.isArray(v)
    ? v.map(normalize)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, normalize(v[k])]))
      : v;
const structurallyEqual = (a, b) =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

function runSelfTest() {
  let failed = 0;
  for (const { name, source, expected, slots } of FIXTURES) {
    const got = extractMeta(source, expected.source, slots);
    const ok = structurallyEqual(got, expected);
    console.log(`${ok ? 'PASS' : 'FAIL'}  fixture: ${name}`);
    if (!ok) {
      failed += 1;
      console.log(`  expected: ${JSON.stringify(normalize(expected))}`);
      console.log(`  got:      ${JSON.stringify(normalize(got))}`);
    }
  }

  // two-zone mechanics: regen updates the GENERATED zone byte-exactly
  // and preserves a hand-edited annotations zone byte-identically
  const metaA = extractMeta(FIXTURES[0].source, 'fixture-enum.svelte');
  const first = emitFile(metaA);
  const handZone = `
// hand-authored zone (self-test sentinel)
export const annotations = defineAnnotations({
  shape: { 'x-ui': { control: 'segmented', label: 'shape' } },
});
`;
  const committed = emitGenerated(metaA) + handZone;
  const metaA2 = extractMeta(
    FIXTURES[0].source.replace("shape = 'bevel'", "shape = 'sharp'"),
    'fixture-enum.svelte',
  );
  const regenerated = emitFile(metaA2, annotationsZoneOf(committed));
  const zoneOk =
    annotationsZoneOf(regenerated) === handZone &&
    regenerated !== committed &&
    regenerated.includes('"default": "sharp"');
  console.log(`${zoneOk ? 'PASS' : 'FAIL'}  two-zone: regen updates GENERATED, preserves annotations`);
  if (!zoneOk) failed += 1;

  if (failed) die(`self-test: ${failed} FAILURE(S)`);
  console.log('\nself-test: OK');
}

// ── main ────────────────────────────────────────────────────────────
if (selfTestMode) {
  runSelfTest();
} else if (checkMode) {
  const stale = [];
  if (inputs.length === 0) {
    if (!existsSync(META_DIR)) {
      console.log('[component-metadata-gen] check GREEN: no meta files committed yet');
    } else {
      for (const name of readdirSync(META_DIR).filter((n) => n.endsWith('.meta.ts'))) {
        const target = join(META_DIR, name);
        const source = sourceOfMetaFile(readFileSync(target, 'utf8'));
        if (!source) {
          stale.push(`${target} (no parseable generated zone)`);
          continue;
        }
        const result = checkOne(source, target);
        if (result) stale.push(result);
      }
    }
  } else {
    for (const input of inputs) {
      const sourcePath = resolveComponentInput(input);
      const result = checkOne(sourcePath);
      if (result) stale.push(result);
    }
  }
  if (stale.length) {
    die(
      `stale meta — the generated zone drifted from the component source. Regenerate with:\n  ${stale
        .map((t) => `node scripts/component-metadata-gen.mjs ${sourceHint(t)}`)
        .join('\n  ')}\nstale files:\n  ${stale.join('\n  ')}`,
    );
  }
  console.log('[component-metadata-gen] check GREEN: generated zones in sync');
} else if (inputs.length) {
  for (const input of inputs) writeOne(resolveComponentInput(input));
} else {
  console.log(`usage:
  node scripts/component-metadata-gen.mjs <component-path…|component-name…>   write meta files
  node scripts/component-metadata-gen.mjs --check [paths…]                    drift gate (no paths = all committed meta)
  node scripts/component-metadata-gen.mjs --self-test                        fixture assertions`);
}
