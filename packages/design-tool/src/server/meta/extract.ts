/**
 * @jixoai/ui-design (server/meta) — the on-demand component-metadata
 * kernel (design-studio-r2 T7).
 *
 * Orthogonal intents (2):
 *   1. extractItemSchema(itemSourcePath) — the component-metadata-gen
 *      extraction core (TS-AST $props() type resolution → props IR →
 *      lowered jsonSchema with the x-ui passthrough) re-shaped as an
 *      ON-DEMAND function over ONE item source, anchored at the
 *      probe's itemAliasBase paths — never the gen script's
 *      apps/www hard wiring (design.md §5, review H3).
 *   2. annotation merge — the .meta.ts two-zone format's HAND zone
 *      (`export const annotations = defineAnnotations({...})`) read
 *      from the sibling <item>.meta.ts or the vehicle lane
 *      apps/www/src/lib/meta/<item>.meta.ts; absence is legal (pure
 *      generation, no error — the host-annotation boundary H6).
 *
 * Relationship law: the extraction semantics (same-file type
 * resolution ceiling, literal unions → enum, numeric unions →
 * min/max, initializer defaults, spread/rest passthrough, opaque
 * honesty) and the lowering vocabulary are PORTED from
 * scripts/component-metadata-gen.mjs + apps/www/src/lib/schema/ir.ts /
 * lower.ts — same vocabulary, deliberately NOT imported across the
 * package boundary (design-tool must run in consumer hosts with no
 * apps/www tree). Drift between the two is caught by the shared
 * fixture tests in extract.test.ts mirroring the gen --self-test
 * shapes.
 *
 * typescript posture (H4 ruling): typescript is a DIRECT devDependency
 * of @jixoai/ui-design (dev tool, server-process loading only). When
 * the install is absent the loader throws TypescriptUnavailableError
 * and the endpoint answers a named 503 — never a silent crash.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T7, Owner rulings
 * ③ and the r2 x-ui vocabulary extension icon/i18n).
 */

import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

/* ── the lowered schema vocabulary (mirror of lower.ts, see header) ───── */

/** r2 x-ui vocabulary: the ir.ts XUI keys + `icon` + `i18n` (r2 delta) */
export interface XUIPanel {
  control?: 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text' | 'none';
  label?: string;
  description?: string;
  lane?: 'end' | 'block';
  unit?: string;
  /** written by the lowering for snippet/opaque nodes only */
  sourceType?: string;
  /** r2: lucide icon name for the panel row */
  icon?: string;
  /** r2: message key for host-side i18n of the row label */
  i18n?: string;
}

export interface SchemaPropNode {
  type?: 'string' | 'boolean' | 'number';
  enum?: string[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  default?: string | number | boolean;
  'x-ui'?: XUIPanel;
}

export interface SchemaObject {
  type: 'object';
  properties: Record<string, SchemaPropNode>;
  /** exactly the props without defaults */
  required: string[];
}

export interface ItemSchemaResult {
  /** the lowered jsonSchema (+ x-ui passthrough) */
  readonly schema: SchemaObject;
  /** the item source the extraction ran over */
  readonly source: string;
  /** honest non-fatal notes (annotation keys without a matching prop…) */
  readonly warnings: string[];
}

/* ── IR (internal — the extraction's intermediate vocabulary) ─────────── */

type IRNode =
  | { kind: 'enum'; values: string[]; default?: string }
  | { kind: 'string'; default?: string }
  | { kind: 'boolean'; default?: boolean }
  | { kind: 'number'; minimum?: number; maximum?: number; default?: number }
  | { kind: 'snippet'; typeText: string }
  | { kind: 'opaque'; typeText: string };

type PropIR = IRNode & { 'x-ui'?: XUIPanel };

/* ── errors ───────────────────────────────────────────────────────────── */

/** typescript is not installed — the endpoint's 503 trigger */
export class TypescriptUnavailableError extends Error {
  constructor(cause: unknown) {
    super(`typescript is not resolvable from @jixoai/ui-design (${cause instanceof Error ? cause.message : String(cause)}) — install it (it is a declared devDependency) to enable metadata extraction`);
    this.name = 'TypescriptUnavailableError';
  }
}

/** an annotation key outside the r2 x-ui vocabulary — the 400 trigger */
export class AnnotationValidationError extends Error {
  readonly file: string;
  readonly key: string;
  constructor(file: string, key: string) {
    super(`unknown x-ui key "${key}" in ${file} — legal vocabulary: ${XUI_KEYS.join(', ')}`);
    this.name = 'AnnotationValidationError';
    this.file = file;
    this.key = key;
  }
}

/* ── typescript loading (injectable for the unavailable-path test) ────── */

type TsModule = typeof import('typescript');

export interface ExtractDeps {
  /** override the typescript module load (tests simulate the absent install) */
  readonly loadTypescript?: () => Promise<TsModule>;
}

let tsModulePromise: Promise<TsModule> | null = null;

async function loadTypescript(): Promise<TsModule> {
  tsModulePromise ??= (async () => {
    try {
      const mod = await import('typescript');
      // CJS interop: the synthetic namespace exposes named exports, but
      // the default is the guaranteed module.exports shape
      return ((mod as { default?: TsModule }).default ?? (mod as unknown as TsModule)) as TsModule;
    } catch (cause) {
      throw new TypescriptUnavailableError(cause);
    }
  })();
  return tsModulePromise;
}

/* ── the extraction core (ported from component-metadata-gen.mjs) ─────── */

/** split a .svelte source into its module + instance script texts */
function splitScripts(source: string): { module: string; instance: string } {
  const scripts = { module: '', instance: '' };
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    if (/\bmodule\b/.test(m[1]!)) scripts.module += m[2]!;
    else scripts.instance += m[2]!;
  }
  return scripts;
}

interface BindingEntry {
  key: string;
  rest?: boolean;
  typeText?: string;
  initializer?: import('typescript').Expression | undefined;
}

interface PropsDecl {
  decl: import('typescript').VariableDeclaration;
  sf: import('typescript').SourceFile;
}

interface TsHandle {
  readonly ts: TsModule;
  readonly sfs: import('typescript').SourceFile[];
}

/**
 * getText(sf) reads sf's text at the NODE's offsets — the SourceFile
 * the node was PARSED from is the only correct sf (the module and
 * instance scripts are separate parses; a same-file declaration map
 * must remember its declaring sf or printNode slices the wrong text).
 */
function printNode(handle: TsHandle, node: import('typescript').TypeNode, sf: import('typescript').SourceFile): string {
  void handle;
  return node.getText(sf);
}

function parseScripts(ts: TsModule, source: string): import('typescript').SourceFile[] {
  const { module: moduleCode, instance: instanceCode } = splitScripts(source);
  return [moduleCode, instanceCode]
    .filter((code) => code.length > 0)
    .map((code) => ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
}

interface LocalDecl {
  readonly decl: import('typescript').InterfaceDeclaration | import('typescript').TypeAliasDeclaration;
  readonly sf: import('typescript').SourceFile;
}

function collectLocals(handle: TsHandle): Map<string, LocalDecl> {
  const locals = new Map<string, LocalDecl>();
  for (const sf of handle.sfs) {
    for (const stmt of sf.statements) {
      if (handle.ts.isInterfaceDeclaration(stmt) || handle.ts.isTypeAliasDeclaration(stmt)) {
        locals.set(stmt.name.text, { decl: stmt, sf });
      }
    }
  }
  return locals;
}

function findPropsDecl(handle: TsHandle): PropsDecl | undefined {
  const { ts } = handle;
  for (const sf of handle.sfs) {
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (
          decl.initializer !== undefined &&
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

function bindingEntries(handle: TsHandle, decl: PropsDecl): BindingEntry[] {
  const { ts } = handle;
  const sf = decl.sf;
  if (decl.decl.name === undefined || !ts.isObjectBindingPattern(decl.decl.name)) return [];
  // TS AST note: the PATTERN carries the rest element's annotation
  const patternType = decl.decl.name.type ? printNode(handle, decl.decl.name.type, sf) : undefined;
  const out: BindingEntry[] = [];
  for (const el of decl.decl.name.elements) {
    if (!ts.isBindingElement(el)) continue;
    if (el.dotDotDotToken !== undefined) {
      out.push({ key: el.name.getText(sf), rest: true, typeText: patternType ?? 'unknown (spread passthrough)' });
      continue;
    }
    out.push({ key: el.propertyName ? el.propertyName.getText(sf) : el.name.getText(sf), initializer: el.initializer });
  }
  return out;
}

/** literal initializer → value; `undefined` and non-literals are absent (AST-carried .text — sf-free) */
function literalValue(ts: TsModule, node: import('typescript').Expression | undefined): { present: boolean; value?: string | number | boolean } {
  if (node === undefined) return { present: false };
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

/** same-file type resolution only — everything else degrades to an honest opaque */
function resolveTypeNode(handle: TsHandle, typeNode: import('typescript').TypeNode | undefined, usageSf: import('typescript').SourceFile, locals: Map<string, LocalDecl>): IRNode {
  const { ts } = handle;
  if (typeNode === undefined) return { kind: 'opaque', typeText: 'unknown' };
  if (ts.isUnionTypeNode(typeNode)) {
    const { types } = typeNode;
    if (types.every((t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal))) {
      return { kind: 'enum', values: types.map((t) => (t.literal as import('typescript').StringLiteral).text) };
    }
    if (types.every((t) => ts.isLiteralTypeNode(t) && ts.isNumericLiteral(t.literal))) {
      const nums = types.map((t) => Number((t.literal as import('typescript').NumericLiteral).text));
      return { kind: 'number', minimum: Math.min(...nums), maximum: Math.max(...nums) };
    }
    return { kind: 'opaque', typeText: printNode(handle, typeNode, usageSf) };
  }
  if (ts.isLiteralTypeNode(typeNode) && ts.isStringLiteral(typeNode.literal)) {
    return { kind: 'enum', values: [typeNode.literal.text] };
  }
  if (
    typeNode.kind === ts.SyntaxKind.StringKeyword ||
    typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
    typeNode.kind === ts.SyntaxKind.NumberKeyword
  ) {
    const text = printNode(handle, typeNode, usageSf);
    if (text === 'string') return { kind: 'string' };
    if (text === 'boolean') return { kind: 'boolean' };
    if (text === 'number') return { kind: 'number' };
  }
  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText(usageSf);
    if (name === 'Snippet') return { kind: 'snippet', typeText: printNode(handle, typeNode, usageSf) };
    const local = locals.get(name);
    if (local !== undefined && ts.isTypeAliasDeclaration(local.decl)) {
      // the alias's OWN type node lives in its declaring script —
      // resolve there, but report opaque text at the USAGE site
      const resolved = resolveTypeNode(handle, local.decl.type, local.sf, locals);
      if (resolved.kind !== 'opaque') return resolved;
      return { kind: 'opaque', typeText: printNode(handle, typeNode, usageSf) };
    }
    return { kind: 'opaque', typeText: printNode(handle, typeNode, usageSf) };
  }
  return { kind: 'opaque', typeText: printNode(handle, typeNode, usageSf) };
}

function inferFromInitializer(handle: TsHandle, init: import('typescript').Expression | undefined): IRNode {
  const lit = literalValue(handle.ts, init);
  if (lit.present) {
    if (typeof lit.value === 'string') return { kind: 'string', default: lit.value };
    if (typeof lit.value === 'boolean') return { kind: 'boolean', default: lit.value };
    return { kind: 'number', default: lit.value as number };
  }
  return { kind: 'opaque', typeText: 'unknown' };
}

function withDefault(handle: TsHandle, node: IRNode, init: import('typescript').Expression | undefined): IRNode {
  const lit = literalValue(handle.ts, init);
  if (!lit.present) return node;
  const value = lit.value!;
  if (node.kind === 'enum' && typeof value === 'string' && node.values.includes(value)) {
    return { ...node, default: value };
  }
  if (node.kind === 'string' && typeof value === 'string') return { ...node, default: value };
  if (node.kind === 'boolean' && typeof value === 'boolean') return { ...node, default: value };
  if (node.kind === 'number' && typeof value === 'number') return { ...node, default: value };
  return node; // kind-mismatched default: dropped (the documented ceiling)
}

/** the props IR of one component source (the gen kernel, verbatim semantics) */
function extractPropsIR(handle: TsHandle): Record<string, PropIR> {
  const propsDecl = findPropsDecl(handle);
  const props: Record<string, PropIR> = {};
  if (propsDecl === undefined) return props;
  const { ts } = handle;
  const { decl, sf } = propsDecl;
  const locals = collectLocals(handle);
  const entries = bindingEntries(handle, propsDecl);

  // the Props-shaped source: annotated local interface, inline type
  // literal, or nothing (inference fallback)
  let members: import('typescript').NodeArray<import('typescript').TypeElement> | undefined;
  if (decl.type !== undefined) {
    const t = decl.type;
    if (ts.isTypeReferenceNode(t)) {
      const local = locals.get(t.typeName.getText(sf));
      if (local !== undefined && ts.isInterfaceDeclaration(local.decl)) members = local.decl.members;
    } else if (ts.isTypeLiteralNode(t)) {
      members = t.members;
    }
  }

  if (members !== undefined) {
    for (const member of members) {
      if (!ts.isPropertySignature(member) || member.name === undefined) continue;
      const key = member.name.getText(sf).replace(/^['"]|['"]$/g, '');
      const entry = entries.find((e) => e.key === key);
      props[key] = withDefault(handle, resolveTypeNode(handle, member.type, sf, locals), entry?.initializer);
    }
    // safety net: destructured keys the interface never declared
    for (const e of entries) {
      if (e.key in props) continue;
      props[e.key] = e.rest
        ? { kind: 'opaque', typeText: e.typeText ?? 'unknown (spread passthrough)' }
        : inferFromInitializer(handle, e.initializer);
    }
  } else {
    // annotation-less $props(): kinds from initializer literals
    for (const e of entries) {
      props[e.key] = e.rest
        ? { kind: 'opaque', typeText: e.typeText ?? 'unknown (spread passthrough)' }
        : inferFromInitializer(handle, e.initializer);
    }
  }
  return props;
}

/* ── the annotations zone (two-zone law, hand zone only) ──────────────── */

/** the r2 x-ui vocabulary — ir.ts XUI + icon + i18n (design.md §5) */
export const XUI_KEYS = [
  'control', 'label', 'description', 'lane', 'unit', 'sourceType', 'icon', 'i18n',
] as const;

const CONTROL_HINTS = new Set(['segmented', 'select', 'toggle', 'stepper', 'slider', 'text', 'none']);

/** statically evaluate an annotation object literal → plain JSON-ish value */
function evaluateLiteral(ts: TsModule, node: import('typescript').Expression, sf: import('typescript').SourceFile): { ok: true; value: unknown } | { ok: false } {
  if (ts.isStringLiteralLike(node)) return { ok: true, value: node.text };
  if (node.kind === ts.SyntaxKind.TrueKeyword) return { ok: true, value: true };
  if (node.kind === ts.SyntaxKind.FalseKeyword) return { ok: true, value: false };
  if (ts.isNumericLiteral(node)) return { ok: true, value: Number(node.text) };
  if (ts.isArrayLiteralExpression(node)) {
    const out: unknown[] = [];
    for (const el of node.elements) {
      const evaluated = evaluateLiteral(ts, el, sf);
      if (!evaluated.ok) return { ok: false };
      out.push(evaluated.value);
    }
    return { ok: true, value: out };
  }
  if (ts.isObjectLiteralExpression(node)) {
    const out: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) return { ok: false };
      const name = ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name) ? prop.name.text : undefined;
      if (name === undefined) return { ok: false };
      const evaluated = evaluateLiteral(ts, prop.initializer, sf);
      if (!evaluated.ok) return { ok: false };
      out[name] = evaluated.value;
    }
    return { ok: true, value: out };
  }
  return { ok: false };
}

export interface AnnotationZone {
  /** prop name → x-ui hints (already vocabulary-validated) */
  readonly annotations: Record<string, XUIPanel>;
  /** the file the zone was read from (null when no meta.ts exists) */
  readonly file: string | null;
}

/**
 * Read + validate the hand-authored annotations zone of a .meta.ts.
 * Unknown x-ui keys raise AnnotationValidationError (the endpoint's
 * 400); annotation prop keys with no matching extracted prop are a
 * WARNING at merge time, not an error (sources evolve).
 */
async function readAnnotationZone(tsPromise: Promise<TsModule>, metaPath: string | null): Promise<AnnotationZone> {
  if (metaPath === null || !existsSync(metaPath)) {
    return { annotations: {}, file: null };
  }
  const ts = await tsPromise;
  const sf = ts.createSourceFile(metaPath, readFileSync(metaPath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let annotationsArg: import('typescript').Expression | undefined;
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'annotations') continue;
      const init = decl.initializer;
      if (init !== undefined && ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === 'defineAnnotations') {
        annotationsArg = init.arguments[0];
      }
    }
  }
  if (annotationsArg === undefined) {
    return { annotations: {}, file: metaPath };
  }
  const evaluated = evaluateLiteral(ts, annotationsArg, sf);
  if (!evaluated.ok || evaluated.value === null || typeof evaluated.value !== 'object' || Array.isArray(evaluated.value)) {
    throw new Error(`${metaPath}: the annotations zone is not a statically evaluable object literal`);
  }
  const annotations: Record<string, XUIPanel> = {};
  for (const [prop, hint] of Object.entries(evaluated.value as Record<string, unknown>)) {
    if (hint === null || typeof hint !== 'object' || !('x-ui' in (hint as Record<string, unknown>))) continue;
    const xui = (hint as { 'x-ui'?: Record<string, unknown> })['x-ui'];
    if (xui === undefined || xui === null || typeof xui !== 'object') continue;
    const validated: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(xui)) {
      if (!(XUI_KEYS as readonly string[]).includes(key)) {
        throw new AnnotationValidationError(metaPath, key);
      }
      validated[key] = value;
    }
    annotations[prop] = validated as XUIPanel;
  }
  return { annotations, file: metaPath };
}

/* ── the lowering (ported semantics of lower.ts toJSONSchema) ─────────── */

function lowerProps(props: Record<string, PropIR>): SchemaObject {
  const properties: Record<string, SchemaPropNode> = {};
  const required: string[] = [];
  for (const [key, node] of Object.entries(props)) {
    const xui = node['x-ui'];
    switch (node.kind) {
      case 'enum': {
        const out: SchemaPropNode = { enum: [...node.values] };
        if (node.default !== undefined) out.default = node.default;
        if (xui !== undefined) out['x-ui'] = { ...xui };
        properties[key] = out;
        break;
      }
      case 'string': {
        const out: SchemaPropNode = { type: 'string' };
        if (node.default !== undefined) out.default = node.default;
        if (xui !== undefined) out['x-ui'] = { ...xui };
        properties[key] = out;
        break;
      }
      case 'boolean': {
        const out: SchemaPropNode = { type: 'boolean' };
        if (node.default !== undefined) out.default = node.default;
        if (xui !== undefined) out['x-ui'] = { ...xui };
        properties[key] = out;
        break;
      }
      case 'number': {
        const out: SchemaPropNode = { type: 'number' };
        if (node.minimum !== undefined && Number.isFinite(node.minimum)) out.minimum = node.minimum;
        if (node.maximum !== undefined && Number.isFinite(node.maximum)) out.maximum = node.maximum;
        if (node.default !== undefined) out.default = node.default;
        if (xui !== undefined) out['x-ui'] = { ...xui };
        properties[key] = out;
        break;
      }
      case 'snippet':
      case 'opaque': {
        // documented + panel-excluded, never silently dropped
        properties[key] = { 'x-ui': { ...xui, control: 'none', sourceType: node.typeText } };
        break;
      }
    }
    if (node.default === undefined) required.push(key);
  }
  return { type: 'object', properties, required };
}

/* ── the on-demand extraction entry point ─────────────────────────────── */

export interface ExtractOptions {
  /** extra directories probed for <item>.meta.ts (the vehicle lane) */
  readonly annotationRoots?: readonly string[];
  readonly deps?: ExtractDeps;
}

/**
 * Extract ONE item's schema on demand. `itemSourcePath` is the
 * component's .svelte entry (from the probe's itemAliasBase anchor).
 * Annotations merge from (in order) the sibling <item>.meta.ts and any
 * annotationRoots/<item>.meta.ts — the first existing file wins; no
 * meta.ts anywhere is legal (pure generation, H6 host boundary).
 */
export async function extractItemSchema(
  itemSourcePath: string,
  options: ExtractOptions = {},
): Promise<ItemSchemaResult> {
  const load = options.deps?.loadTypescript ?? loadTypescript;
  // both the real and the injected loader surface as the named 503 error
  const tsPromise = Promise.resolve()
    .then(() => load())
    .catch((cause: unknown) => {
      if (cause instanceof TypescriptUnavailableError) throw cause;
      throw new TypescriptUnavailableError(cause);
    });
  const source = readFileSync(itemSourcePath, 'utf8');
  const ts = await tsPromise;
  const handle: TsHandle = { ts, sfs: parseScripts(ts, source) };
  const props = extractPropsIR(handle);

  const itemName = basename(itemSourcePath).replace(/\.svelte$/, '');
  const metaCandidates = [
    joinSafe(dirname(itemSourcePath), `${itemName}.meta.ts`),
    ...(options.annotationRoots ?? []).map((root) => joinSafe(root, `${itemName}.meta.ts`)),
  ];
  const metaPath = metaCandidates.find((candidate) => existsSync(candidate)) ?? null;
  const zone = await readAnnotationZone(tsPromise, metaPath);
  const warnings: string[] = [];
  if (zone.file !== null) {
    for (const [prop, hint] of Object.entries(zone.annotations)) {
      if (!(prop in props)) {
        warnings.push(`${zone.file}: annotation key "${prop}" matches no extracted prop (source evolved?) — ignored`);
        continue;
      }
      const control = hint.control;
      if (control !== undefined && !CONTROL_HINTS.has(control)) {
        warnings.push(`${zone.file}: x-ui.control "${String(control)}" is not a known hint — kept verbatim, the panel degrades to the kind default`);
      }
      props[prop] = { ...props[prop]!, 'x-ui': { ...props[prop]!['x-ui'], ...hint } };
    }
  } else {
    warnings.push('no .meta.ts annotation zone found — schema is purely generated (host annotations are a later registry change, H6)');
  }

  return { schema: lowerProps(props), source: itemSourcePath, warnings };
}

function joinSafe(dir: string, file: string): string {
  // small local join to keep the import surface minimal in this hot path
  const sep = dir.endsWith('/') ? '' : '/';
  return `${dir}${sep}${file}`;
}
