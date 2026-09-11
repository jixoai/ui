/**
 * @jixoai/ui-design (server) — the property-panel source editor (T8).
 *
 * Orthogonal intents (3):
 *   1. LOCATE — find the usageIndex-th usage (DOCUMENT ORDER,
 *      1-BASED — the `data-jx-instance` ordinal contract shared with
 *      the r2 stamp transform) of a jixoai component in a .svelte
 *      source, by svelte AST walk. Component identity anchors at the
 *      import site (`import X from '#jixoai/<item>'` → identifier X);
 *      when no such import exists the name itself is the identifier
 *      (host-local components).
 *   2. REWRITE — replace the prop's literal at that usage (or INSERT
 *      one when absent) via magic-string; bound / non-literal props
 *      are honestly non-representable ({ok:false}) and the panel
 *      renders them read-only with an "edit in code" hint.
 *   3. ARBITRATE (CAS) — read-time content hash, re-read before
 *      write; a mismatch means an external write raced us (agent /
 *      editor) → re-locate once on the fresh content, a second
 *      mismatch abandons with 409. Never a blind write (design.md
 *      §4, review H1).
 *
 * Indexing law: usageIndex counts the component's usages in document
 * order, 1-based (design.md §3: "第 n 个用法" — data-jx-instance="<n>"
 * for the first usage). An {#each}-enclosed usage is one usageIndex
 * shared by its iterations — `shared` reports the enclosure and the
 * edit lands on the usage site, never a single iteration.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T8; VD1/VD1e).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

import MagicString from 'magic-string';
import { parse as parseSvelte } from 'svelte/compiler';

/* ── the svelte AST shapes this locator consumes (structural) ─────────── */

interface SvelteNode {
  readonly type: string;
  readonly name?: string;
  readonly start: number;
  readonly end: number;
  readonly attributes?: readonly SvelteNode[];
  readonly value?: readonly SvelteValueNode[];
  readonly [key: string]: unknown;
}

interface SvelteValueNode {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly data?: string;
  readonly expression?: { type: string; value?: unknown; raw?: string } | null;
}

interface UsageInfo {
  readonly node: SvelteNode;
  /** the usage sits inside an {#each} block — iterations share it */
  readonly insideEach: boolean;
}

/** child containers the walk recurses into (svelte AST ceiling, v0) */
const CHILD_KEYS = ['children', 'else', 'pending', 'then', 'catch'] as const;

function walkUsages(node: unknown, identifiers: ReadonlySet<string>, insideEach: boolean, out: UsageInfo[]): void {
  if (Array.isArray(node)) {
    for (const child of node) walkUsages(child, identifiers, insideEach, out);
    return;
  }
  if (node === null || typeof node !== 'object' || typeof (node as SvelteNode).type !== 'string') return;
  const current = node as SvelteNode;
  const isUsage =
    (current.type === 'InlineComponent' || current.type === 'Component') &&
    typeof current.name === 'string' &&
    identifiers.has(current.name);
  if (isUsage) {
    out.push({ node: current, insideEach });
  }
  const nextInsideEach = insideEach || current.type === 'EachBlock';
  for (const key of CHILD_KEYS) {
    const value = current[key];
    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      walkUsages(value, identifiers, nextInsideEach, out);
    }
  }
}

/**
 * `import X from '#jixoai/<item>'` (+ `{ default as X }` and NAMED
 * specifiers — `import { PrototypeCanvas } from '#jixoai/prototype-kit'`)
 * → the local identifiers that may tag the item's usages.
 */
function importIdentifiersOf(source: string, item: string): string[] {
  const identifiers: string[] = [];
  const re = /import\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]#jixoai\/([\w-]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    if (match[3] !== item) continue;
    if (match[1] !== undefined) identifiers.push(match[1]);
    if (match[2] !== undefined) {
      for (const part of match[2].split(',')) {
        const spec = part.trim();
        if (spec.length === 0 || spec.startsWith('type ')) continue;
        // `Foo`, `default as Foo`, `Foo as Bar` — the LAST identifier
        // is the local name the template would tag with
        const local = spec.match(/([A-Za-z_$][\w$]*)\s*$/);
        if (local !== null) identifiers.push(local[1]!);
      }
    }
  }
  return identifiers;
}

/**
 * The usages of one component in document order (1-based at the
 * consumer side). `component` is the ITEM name (press-button) or a
 * bare identifier (Badge) when no #jixoai import matches.
 */
export function locateUsages(source: string, component: string): UsageInfo[] {
  let identifiers = importIdentifiersOf(source, component);
  if (identifiers.length === 0) identifiers = [component];
  const ast = parseSvelte(source) as unknown as { html: unknown };
  const out: UsageInfo[] = [];
  walkUsages(ast.html, new Set(identifiers), false, out);
  return out;
}

/* ── literal representability + rendering ─────────────────────────────── */

export type EditValue = string | number | boolean;

/** canonical source rendering: string → quoted, number/boolean → braced */
function renderValue(value: EditValue): string {
  if (typeof value === 'string') return JSON.stringify(value);
  return `{${String(value)}}`;
}

interface AttrInfo {
  readonly attribute: SvelteNode | undefined;
  readonly representable: boolean;
  readonly current: EditValue | undefined;
  readonly valueStart: number | undefined;
  readonly valueEnd: number | undefined;
  /** true = a plain quoted Text literal (span is INSIDE the quotes) */
  readonly quotedText: boolean;
}

/** the prop's literal facts at one usage (absent attribute = insertable) */
function attrInfoOf(usage: UsageInfo, prop: string): AttrInfo {
  const attributes = usage.node.attributes ?? [];
  let attribute: SvelteNode | undefined;
  for (const attr of attributes) {
    if (attr.type === 'Attribute' && attr.name === prop) {
      attribute = attr;
      break;
    }
    // bind:prop / on:prop — a directive of the same name makes the
    // row non-representable even if an attribute follows
    if ((attr.type === 'Binding' || attr.type === 'BindDirective' || attr.type === 'EventHandler') && (attr.name === prop || String(attr.name ?? '') === prop)) {
      return { attribute: attr, representable: false, current: undefined, valueStart: undefined, valueEnd: undefined, quotedText: false };
    }
  }
  if (attribute === undefined) {
    return { attribute: undefined, representable: true, current: undefined, valueStart: undefined, valueEnd: undefined, quotedText: false };
  }
  const values = attribute.value ?? [];
  if (values.length === 1) {
    const only = values[0]!;
    if (only.type === 'Text' && typeof only.data === 'string') {
      return { attribute, representable: true, current: only.data, valueStart: only.start, valueEnd: only.end, quotedText: true };
    }
    if (only.type === 'MustacheTag' && only.expression !== null && only.expression !== undefined) {
      const expression = only.expression;
      const literal = expression.value;
      if (
        expression.type === 'Literal' &&
        (typeof literal === 'string' || typeof literal === 'number' || typeof literal === 'boolean')
      ) {
        return { attribute, representable: true, current: literal, valueStart: only.start, valueEnd: only.end, quotedText: false };
      }
    }
  }
  return { attribute, representable: false, current: undefined, valueStart: undefined, valueEnd: undefined, quotedText: false };
}

/* ── the pure edit kernel ─────────────────────────────────────────────── */

export type EditOutcome =
  | { ok: true; output: string; shared: boolean }
  | { ok: false; reason: 'component-not-found' | 'usage-not-found' | 'non-representable'; message: string };

/**
 * Apply ONE prop edit to a source text. Pure: no filesystem. The
 * insert point is right after the component's tag name (`<Flex` →
 * `<Flex gap={16}`) — valid for self-closing, multi-line and
 * child-carrying tags alike.
 */
export function applyPropEdit(source: string, component: string, usageIndex: number, prop: string, value: EditValue): EditOutcome {
  const usages = locateUsages(source, component);
  if (usages.length === 0) {
    return { ok: false, reason: 'component-not-found', message: `no usage of "${component}" in the file` };
  }
  const usage = usages[usageIndex - 1];
  if (usage === undefined) {
    return { ok: false, reason: 'usage-not-found', message: `usage #${usageIndex} of "${component}" not found (${usages.length} in the file)` };
  }
  const info = attrInfoOf(usage, prop);
  if (!info.representable) {
    return { ok: false, reason: 'non-representable', message: `prop "${prop}" is bound or non-literal at this usage — edit it in code` };
  }
  const magic = new MagicString(source);
  if (info.attribute !== undefined && info.valueStart !== undefined && info.valueEnd !== undefined) {
    if (info.quotedText) {
      // the span sits INSIDE the quotes — write the raw string (a
      // non-string value rides braces inside the quotes, legal svelte)
      const raw = typeof value === 'string' ? JSON.stringify(value).slice(1, -1) : `{${String(value)}}`;
      magic.overwrite(info.valueStart, info.valueEnd, raw, { contentOnly: true });
    } else {
      // the span covers the full {…} expression — canonical rendering
      magic.overwrite(info.valueStart, info.valueEnd, renderValue(value), { contentOnly: true });
    }
  } else {
    // insert after the tag name: start + 1 (the `<`) + name length
    const insertAt = usage.node.start + 1 + usage.node.name!.length;
    magic.appendLeft(insertAt, ` ${prop}=${renderValue(value)}`);
  }
  return { ok: true, output: magic.toString(), shared: usage.insideEach };
}

/* ── dry-run: the usage's current literal facts (the panel's seed) ────── */

export interface UsageValues {
  readonly shared: boolean;
  /** per prop: representable (+ the current literal, absent = unset) or not */
  readonly values: Record<string, { representable: true; value?: EditValue } | { representable: false }>;
}

export function dryRunUsage(source: string, component: string, usageIndex: number, props?: readonly string[]): UsageValues | { error: 'component-not-found' | 'usage-not-found'; message: string } {
  const usages = locateUsages(source, component);
  if (usages.length === 0) {
    return { error: 'component-not-found', message: `no usage of "${component}" in the file` };
  }
  const usage = usages[usageIndex - 1];
  if (usage === undefined) {
    return { error: 'usage-not-found', message: `usage #${usageIndex} of "${component}" not found (${usages.length} in the file)` };
  }
  const values: UsageValues['values'] = {};
  const names = props !== undefined && props.length > 0 ? props : (usage.node.attributes ?? []).filter((a) => a.type === 'Attribute' && typeof a.name === 'string').map((a) => a.name as string);
  for (const name of names) {
    const info = attrInfoOf(usage, name);
    if (!info.representable) {
      values[name] = { representable: false };
    } else if (info.current !== undefined) {
      values[name] = { representable: true, value: info.current };
    } else {
      values[name] = { representable: true }; // unset at this usage — the schema default applies
    }
  }
  return { shared: usage.insideEach, values };
}

/* ── the server: file resolution + CAS arbitration + middleware ───────── */

export interface FileOps {
  read(path: string): string;
  write(path: string, content: string): void;
}

const realFileOps: FileOps = {
  read(path) {
    return readFileSync(path, 'utf8');
  },
  write(path, content) {
    // atomic-ish: tmp + rename, same directory
    const tmp = `${path}.jx-prop-edit-${process.pid}`;
    writeFileSync(tmp, content, 'utf8');
    renameSync(tmp, path);
  },
};

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

export interface PropEditRequest {
  readonly file: string;
  readonly component: string;
  readonly usageIndex: number;
  readonly prop?: string;
  readonly value?: EditValue;
  readonly dryRun?: boolean;
  readonly props?: readonly string[];
}

export type PropEditResponse =
  | { status: 200; body: { ok: true; file: string; shared: boolean; wrote: boolean; values?: UsageValues['values'] } }
  | { status: 200; body: { ok: false; reason: 'component-not-found' | 'usage-not-found' | 'non-representable'; message: string } }
  | { status: 409; body: { ok: false; reason: 'cas-conflict'; message: string } }
  | { status: 400; body: { ok: false; reason: 'bad-request'; message: string } }
  | { status: 404; body: { ok: false; reason: 'file-not-found'; message: string } };

/**
 * The request resolver (pure over injectable FileOps — the CAS race
 * tests stub them). File safety: the resolved path must stay inside
 * the server root and be a .svelte — the panel edits prototype
 * sources, never arbitrary files.
 */
export async function resolvePropEditRequest(root: string, body: unknown, fileOps: FileOps = realFileOps): Promise<PropEditResponse> {
  if (body === null || typeof body !== 'object') {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'body must be a JSON object' } };
  }
  const request = body as Partial<PropEditRequest>;
  if (typeof request.file !== 'string' || request.file.length === 0) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'file (string) is required' } };
  }
  if (typeof request.component !== 'string' || request.component.length === 0) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'component (string) is required' } };
  }
  if (!Number.isInteger(request.usageIndex) || (request.usageIndex ?? 0) < 1) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'usageIndex (integer >= 1, document order, 1-based) is required' } };
  }
  const dryRun = request.dryRun === true;
  if (!dryRun) {
    if (typeof request.prop !== 'string' || request.prop.length === 0) {
      return { status: 400, body: { ok: false, reason: 'bad-request', message: 'prop (string) is required (or dryRun: true)' } };
    }
    const value = request.value;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return { status: 400, body: { ok: false, reason: 'bad-request', message: 'value (string | number | boolean) is required' } };
    }
  }

  const filePath = isAbsolute(request.file) ? request.file : resolve(root, request.file);
  const rel = relative(root, filePath);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: `file escapes the server root: ${request.file}` } };
  }
  if (!filePath.endsWith('.svelte')) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'only .svelte sources are editable through the panel' } };
  }
  if (!existsSync(filePath)) {
    return { status: 404, body: { ok: false, reason: 'file-not-found', message: `no such file: ${request.file}` } };
  }

  // dry-run: current literals + shared flag, no write
  const drySource = fileOps.read(filePath);
  if (dryRun) {
    const result = dryRunUsage(drySource, request.component, request.usageIndex, request.props);
    if ('error' in result) {
      return { status: 200, body: { ok: false, reason: result.error, message: result.message } };
    }
    return { status: 200, body: { ok: true, file: rel.replaceAll('\\', '/'), shared: result.shared, wrote: false, values: result.values } };
  }

  // CAS: hash at read time, re-read before write, one re-location retry
  let source = drySource;
  let hash = sha256(source);
  let outcome = applyPropEdit(source, request.component, request.usageIndex, request.prop!, request.value!);
  if (!outcome.ok) {
    return { status: 200, body: { ok: false, reason: outcome.reason, message: outcome.message } };
  }
  let before = fileOps.read(filePath);
  if (sha256(before) !== hash) {
    // external write raced us — re-locate ONCE on the fresh content
    source = before;
    hash = sha256(source);
    outcome = applyPropEdit(source, request.component, request.usageIndex, request.prop!, request.value!);
    if (!outcome.ok) {
      return { status: 200, body: { ok: false, reason: outcome.reason, message: `re-location after an external write: ${outcome.message}` } };
    }
    before = fileOps.read(filePath);
    if (sha256(before) !== hash) {
      return { status: 409, body: { ok: false, reason: 'cas-conflict', message: 'the file changed twice during the edit — abandoned instead of overwriting; retry the edit' } };
    }
  }
  fileOps.write(filePath, outcome.output);
  return { status: 200, body: { ok: true, file: rel.replaceAll('\\', '/'), shared: outcome.shared, wrote: true } };
}

export const PROP_EDIT_PATH = '/__design__/api/prop-edit';

/** the connect middleware — registered by create.ts as ONE line */
export function propEditMiddleware(root: string): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  return (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0]!;
    if (pathname !== PROP_EDIT_PATH || req.method !== 'POST') return next();
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 64 * 1024) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      void (async () => {
        let body: unknown;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, reason: 'bad-request', message: 'invalid JSON body' }));
          return;
        }
        const response = await resolvePropEditRequest(resolve(root), body);
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(response.body));
      })().catch(next);
    });
  };
}
