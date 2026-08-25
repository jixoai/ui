// composition-law probe (composition-first-apis, 2026-08-25).
//
// The structural-prop ban, machine-enforced: no registry component
// may own repeated/nested UI structure through data props. Parses
// each component's <script lang="ts"> with the TypeScript compiler
// (real AST — interfaces + type literals, not regex) and fails on:
//
//   1. array-of-object props that render repeated UI under banned
//      names (items, steps, sections, crumbs, links, nodes, badges,
//      outputs, options, locales, tags, suggestions) — unless the
//      component is allowlisted;
//   2. config-tree props (object types with a recursive `children`
//      array field);
//   3. keyed render-props: `Snippet<[X, number]>` (or [X, index]).
//
// The allowlist mirrors the declared exceptions in
// openspec/changes/composition-first-apis/design.md — value-domain
// and behavior-domain payloads. Keep the two in sync.
//
// Modes:
//   node scripts/verify-composition-law.mjs           # run the probe
//   node scripts/verify-composition-law.mjs --fix-hints # print fixes
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(join(process.cwd(), 'package.json'));
const ts = require('./apps/www/node_modules/typescript/lib/typescript.js');

const REGISTRY_UI = 'registry/files/ui';

// component → banned names it is ALLOWED to carry (value/behavior domain)
const ALLOWLIST = {
  select: ['options'],
  combobox: ['options'],
  cascader: ['options'],
  'tags-input': ['tags', 'suggestions'],
  transfer: ['options'],
  'language-switcher': ['locales'],
  tour: ['steps'],
  'tree-view': ['nodes'],
  'tree-view-multiselect': ['nodes'],
  'terminal-card': ['outputs'],
  'code-card': ['code'],
  'component-canvas': ['files', 'output'],
  'scroll-virtual': [],
  toast: [],
  'toast-viewport': ['store'],
};

const BANNED_NAMES = new Set([
  'items', 'steps', 'sections', 'crumbs', 'links', 'nodes',
  'badges', 'outputs', 'options', 'locales', 'tags', 'suggestions',
]);

const failures = [];
const SELF_TEST = process.argv.includes('--self-test');
const SELF_TEST_DIR = '/tmp/jx-composition-selftest';

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.svelte')) out.push(full);
  }
  return out;
}

/** resolve a type reference (or heritage expression) to its
 *  same-file declaration (or null) */
function resolveRef(t, sf) {
  let name = null;
  if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) name = t.typeName.text;
  else if (ts.isExpressionWithTypeArguments?.(t) && ts.isIdentifier(t.expression)) name = t.expression.text;
  if (!name) return null;
  return sf.statements.find(
    (st) => (ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name.text === name,
  ) ?? null;
}

/** flatten a type into the member-bearing object shapes it is built
 *  from: literals, interfaces (WITH heritage members), aliases,
 *  intersections/unions. Cycle-safe per branch (seen is copied, not
 *  shared, so one visited name never poisons a sibling branch). */
function* literalsOf(t, sf, seen) {
  if (!t) return;
  if (ts.isTypeLiteralNode(t)) { yield t; return; }
  if (ts.isIntersectionTypeNode(t) || ts.isUnionTypeNode(t)) {
    for (const m of t.types) yield* literalsOf(m, sf, new Set(seen));
    return;
  }
  const target = resolveRef(t, sf);
  if (!target) return;
  const name = target.name.text;
  if (seen.has(name)) return;
  const next = new Set(seen).add(name);
  if (ts.isInterfaceDeclaration(target)) {
    yield { members: target.members };
    for (const h of target.heritageClauses ?? []) {
      for (const ty of h.types) yield* literalsOf(ty, sf, next);
    }
    return;
  }
  yield* literalsOf(target.type, sf, next);
}

/** extract prop names + type nodes from a .svelte script's Props */
function propsOf(sourceFile) {
  const props = [];
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'Props') {
      // direct members + heritage members (interface Props extends Base)
      const sources = [node.members];
      for (const h of node.heritageClauses ?? []) {
        for (const ty of h.types) {
          for (const lit of literalsOf(ty, sourceFile, new Set(['Props']))) sources.push(lit.members);
        }
      }
      for (const members of sources) {
        for (const m of members) {
          if (ts.isPropertySignature(m) && ts.isIdentifier(m.name)) {
            props.push({ name: m.name.text, type: m.type, file: sourceFile });
          }
        }
      }
    } else if (ts.isTypeAliasDeclaration(node) && node.name.text === 'Props') {
      for (const lit of literalsOf(node.type, sourceFile, new Set(['Props']))) {
        for (const m of lit.members) {
          if (ts.isPropertySignature(m) && ts.isIdentifier(m.name)) {
            props.push({ name: m.name.text, type: m.type, file: sourceFile });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return props;
}

/** ALL array element types found under a type: unions, readonly
 *  wrappers, AND argument-less aliases (type Items = A[] | B[]) */
function* arrayElementsOf(t, sf, seen = new Set()) {
  if (!t) return;
  if (ts.isArrayTypeNode(t)) { yield t.elementType; return; }
  if (ts.isUnionTypeNode(t) || ts.isIntersectionTypeNode(t)) {
    for (const member of t.types) yield* arrayElementsOf(member, sf, new Set(seen));
    return;
  }
  // readonly T[]
  if (t.kind === ts.SyntaxKind.TypeOperator) { yield* arrayElementsOf(t.type, sf, seen); return; }
  const target = resolveRef(t, sf);
  if (target && ts.isTypeAliasDeclaration(target)) {
    const name = target.name.text;
    if (!seen.has(name)) yield* arrayElementsOf(target.type, sf, new Set(seen).add(name));
    return;
  }
  if (ts.isTypeReferenceNode(t) && t.typeArguments?.[0]) {
    if (ts.isArrayTypeNode(t.typeArguments[0])) { yield t.typeArguments[0].elementType; return; }
    if (t.typeName.getText() === 'ReadonlyArray') { yield t.typeArguments[0]; return; }
    yield t.typeArguments[0];
  }
}

const isObjectish = (t) =>
  t && (t.kind === ts.SyntaxKind.TypeLiteral ||
    (ts.isTypeReferenceNode(t) && !['string', 'number', 'boolean', 'Snippet', 'readonly'].includes(t.typeName.getText())));

function isSnippetKeyed(t) {
  if (!t || !ts.isTypeReferenceNode(t) || t.typeName.getText() !== 'Snippet') return false;
  const [first, second] = t.typeArguments ?? [];
  if (!first || !second) return false;
  const secondText = second.getText().trim();
  return secondText === 'number' || secondText === 'index';
}

/** does this type tree carry a `children` array field anywhere?
 *  literals resolve through aliases/intersections/unions, cycle-safe */
function typeHasChildrenArray(t, sf, seen) {
  for (const lit of literalsOf(t, sf, seen ?? new Set())) {
    for (const m of lit.members) {
      if (ts.isPropertySignature(m) && ts.isIdentifier(m.name) && m.name.text === 'children') {
        for (const _el of arrayElementsOf(m.type, sf)) return true;
      }
    }
  }
  return false;
}

for (const file of walk(REGISTRY_UI)) {
  const component = file.split('/').at(-2);
  const allowed = new Set(ALLOWLIST[component] ?? []);
  const raw = readFileSync(file, 'utf8');
  const scripts = [...raw.matchAll(/<script[^>]*lang="ts"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (const body of scripts) {
  const sf = ts.createSourceFile(file + '.ts', body, ts.ScriptTarget.Latest, true);
  for (const prop of propsOf(sf)) {
    const loc = `${file}:${sf.getLineAndCharacterOfPosition(prop.type.pos).line + 1}`;
    // 3. keyed render-props — never allowlisted
    if (isSnippetKeyed(prop.type)) {
      failures.push(`${loc} — keyed render-prop \`${prop.name}: Snippet<[…, number]>\` (iteration belongs to the consumer)`);
      continue;
    }
    if (!BANNED_NAMES.has(prop.name) || allowed.has(prop.name)) continue;
    // 1. array-of-object / array-of-string under a banned structural name
    const els = [...arrayElementsOf(prop.type, sf)];
    const elIsString = els.some((el) => el.kind === ts.SyntaxKind.StringKeyword);
    const elIsObject = els.some((el) => isObjectish(el));
    if (elIsString) {
      failures.push(`${loc} — structural data prop \`${prop.name}: string[]\` renders repeated UI (compose Badge/line parts instead)`);
    } else if (elIsObject) {
      failures.push(`${loc} — structural data prop \`${prop.name}: ${prop.type.getText().replace(/\s+/g, ' ').slice(0, 60)}…\` renders repeated UI (value-domain payloads need a design.md exception entry)`);
    }
    // 2. config trees: object types (direct OR via alias, incl. array
    //    elements and unions) with a recursive children array
    if (typeHasChildrenArray(prop.type, sf, new Set()) ||
        [...arrayElementsOf(prop.type, sf)].some((el) => typeHasChildrenArray(el, sf, new Set()))) {
      failures.push(`${loc} — config-tree prop \`${prop.name}\` (nested children[] structure belongs in the consumer tree)`);
    }
  }
  }
}

if (SELF_TEST) {
  // four adversarial fixtures — each must report BOTH the structural
  // and the config-tree hit (and never throw)
  const fixtures = [
    ['heritage', `type A = { label: string };
type B = { children?: B[] };
type Base = { items: A[] | B[] };
interface Props extends Base {}
let { items }: Props = $props();`],
    ['alias-array', `type A = { label: string };
type B = { children?: B[] };
type Items = A[] | B[];
interface Props { items: Items }
let { items }: Props = $props();`],
    ['intersection-readonly', `type B = { children?: B[] };
type Base = { class?: string };
type Props = Base & { nodes: readonly B[] };
let { nodes }: Props = $props();`],
    ['alias-children', `type ChildList = Node[];
type Node = { children?: ChildList };
interface Props { items: Node[] }
let { items }: Props = $props();`],
  ];
  const { writeFileSync, mkdirSync, rmSync } = await import('node:fs');
  rmSync(SELF_TEST_DIR, { recursive: true, force: true });
  let bad = 0;
  for (const [name, script] of fixtures) {
    mkdirSync(`${SELF_TEST_DIR}/${name}`, { recursive: true });
    writeFileSync(`${SELF_TEST_DIR}/${name}/${name}.svelte`, `<script lang="ts">\n${script}\n</script>\n<div></div>`);
  }
  const walk0 = walk;
  const violations = [];
  for (const file of walk0(SELF_TEST_DIR)) {
    const raw = readFileSync(file, 'utf8');
    const scripts = [...raw.matchAll(/<script[^>]*lang="ts"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const body of scripts) {
      const sf = ts.createSourceFile(file + '.ts', body, ts.ScriptTarget.Latest, true);
      for (const prop of propsOf(sf)) {
        const loc = file;
        if (isSnippetKeyed(prop.type)) { violations.push([name = file.split('/').at(-2), 'keyed']); continue; }
        const els = [...arrayElementsOf(prop.type, sf)];
        if (els.some((el) => el.kind === ts.SyntaxKind.StringKeyword)) violations.push([file, 'structural']);
        else if (els.some((el) => isObjectish(el))) violations.push([file, 'structural']);
        if (typeHasChildrenArray(prop.type, sf, new Set()) ||
            [...arrayElementsOf(prop.type, sf)].some((el) => typeHasChildrenArray(el, sf, new Set()))) violations.push([file, 'config-tree']);
      }
    }
  }
  rmSync(SELF_TEST_DIR, { recursive: true, force: true });
  const perFixture = new Map(fixtures.map(([n]) => [n, new Set()]));
  for (const [file, kind] of violations) perFixture.get(file.split('/').at(-2))?.add(kind);
  for (const [n] of fixtures) {
    const kinds = perFixture.get(n);
    const ok = kinds?.has('structural') && kinds?.has('config-tree');
    console.log(`  ${ok ? '✓' : '✗'} ${n}: ${[...(kinds ?? [])].join('+') || 'MISS'}`);
    if (!ok) bad++;
  }
  if (bad) { console.error(`self-test: ${bad} fixture(s) failing`); process.exit(1); }
  console.log('self-test: all four adversarial fixtures double-detected');
  process.exit(0);
}

if (failures.length) {
  console.error(`composition-law: ${failures.length} violation(s)`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('composition-law: 0 violations across registry/files/ui (structural props banned, exceptions allowlisted)');
