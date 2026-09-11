/**
 * @jixoai/ui-design (stamp) — the PURE usage-site stamp transform (T0).
 *
 * `(svelteSource, {bindings}) → { code, usageMap }` with ZERO vite/fs
 * imports — the vite plugin (plugin.ts) is a thin resolver around it.
 * The mechanism kernel (design-studio-r2 design.md §3, spec "the design
 * server stamps usage sites with component identity"):
 *
 *   svelte/compiler parse (MODERN AST — AST, never regex; the
 *   extract.ts bridge pattern: memoized dynamic import so
 *   svelte/compiler never enters a static graph)
 *     → walk the template fragment depth-first (document order),
 *       tracking ancestors (the {#each} flag)
 *     → every Component node whose local name binds to a jixoai item
 *       (bindings supplied by the plugin from the file's imports) is
 *       the n-th USAGE: inject
 *         data-jx-component="<item>"  data-jx-instance="<n>"
 *       AFTER the last existing attribute (statics after a {...spread}
 *       usage win — the stamp must survive the consumer's spread),
 *       riding the COMPONENT's own rest spread to its root element.
 *     → the SAME traversal produces the usage map (the §4 property
 *       panel's input): usageIndex → prop → {start,end,kind,value} in
 *       ORIGINAL-source coordinates (the panel rewrites the file on
 *       disk — the injected stamp text must never leak into spans).
 *     → emit `export const __jxUsageMap = …` as a module-script
 *       export: injected BEFORE the existing module script's closing
 *       tag, or appended as a NEW `<script module>` block at file end
 *       (two module scripts are a compile error — verified live; the
 *       end-append keeps every original line number intact).
 *
 * Honest degradation (spec's stamp requirement, last paragraph): a
 * component whose definition has no single-root rest spread simply
 * drops the stamp attributes — unselectable, invisible in the tree.
 * That is the component DEFINITION's property; this transform stamps
 * every usage site regardless and never fails on it.
 *
 * HMR stability is constructive (§3): numbering derives from the
 * source's document order alone — same source shape, same numbers.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T0).
 */

import type * as SvelteAST from 'svelte/compiler';

/** the stamp attribute names (the r2 contract — picker/tree/panel key on these) */
export const STAMP_COMPONENT_ATTR = 'data-jx-component';
export const STAMP_INSTANCE_ATTR = 'data-jx-instance';
/** the usage-map export name (the §4 panel contract — C reads this) */
export const USAGE_MAP_EXPORT = '__jxUsageMap';

/** every named error the stamp transform throws carries this prefix */
export const STAMP_ERROR_PREFIX = '[jixoai-design-stamp]';

// ── the parser bridge (extract.ts F1 pattern) ───────────────────────

type SvelteParse = typeof SvelteAST.parse;

let parsePromise: Promise<SvelteParse> | undefined;

const SVELTE_COMPILER_MODULE = 'svelte/compiler';

function loadParse(): Promise<SvelteParse> {
  parsePromise ??= import(SVELTE_COMPILER_MODULE).then(
    (mod) => mod.parse,
    () => {
      parsePromise = undefined; // allow a retry after a later install
      throw new Error(
        `${STAMP_ERROR_PREFIX} svelte is not resolvable — the stamp transform parses usage modules with ${SVELTE_COMPILER_MODULE}`,
      );
    },
  );
  return parsePromise;
}

// ── structural AST shapes (loose, the extract.ts posture) ───────────

interface AstNode {
  readonly type: string;
  readonly start: number;
  readonly end: number;
}

interface AstFragment {
  readonly type: 'Fragment';
  readonly nodes: readonly AstNode[];
}

/** a template Component usage: <PressButton variant="fill">… */
interface UsageNode extends AstNode {
  readonly name: string;
  readonly attributes: readonly AstAttribute[];
}

/** svelte Attribute shapes (modern AST) */
interface AstAttribute {
  readonly type: string;
  readonly name?: string;
  readonly start: number;
  readonly end: number;
  /**
   * true = bare attribute; an ARRAY of parts for Text-containing values
   * (`variant="fill"`, `label="a{b}c"`); a BARE ExpressionTag object
   * for pure expression values (`size={2}` — verified live, not an
   * array); undefined never occurs on Attribute nodes.
   */
  readonly value: true | readonly AstNode[] | { readonly type: string } | undefined;
}

/** an ESTree program body node of the instance/module scripts */
interface ScriptStatement {
  readonly type: string;
  readonly source?: { readonly value?: unknown };
  readonly specifiers?: readonly {
    readonly type?: string;
    readonly local?: { readonly name?: unknown };
    readonly imported?: unknown;
  }[];
}

/** the {#each …} block (iteration-sharing detection, VC1e) */
interface EachBlockNode extends AstNode {
  readonly body?: AstFragment;
}

/**
 * the child-fragment keys across the modern AST. extract.ts carries
 * fragment/consequent/alternate/body; AwaitBlock adds pending/then/catch
 * (a usage inside an {#await} branch is still a usage site).
 */
const CHILD_FRAGMENT_KEYS = ['fragment', 'consequent', 'alternate', 'body', 'pending', 'then', 'catch'] as const;

function childFragments(node: AstNode): AstFragment[] {
  const fragments: AstFragment[] = [];
  const holder = node as unknown as Record<string, unknown>;
  for (const key of CHILD_FRAGMENT_KEYS) {
    const value = holder[key];
    if (
      typeof value === 'object' &&
      value !== null &&
      (value as { type?: string }).type === 'Fragment' &&
      Array.isArray((value as { nodes?: unknown }).nodes)
    ) {
      fragments.push(value as AstFragment);
    }
  }
  return fragments;
}

// ── the usage map types (the §4 panel contract shape) ───────────────

/** how a prop is expressed at the usage site (original-source spans) */
export interface PropSpan {
  /** replacement span start (original source coords; see kind) */
  readonly start: number;
  /** replacement span end */
  readonly end: number;
  readonly kind: 'literal' | 'expression' | 'none';
  /** the literal's JS value — present iff kind === 'literal' */
  readonly value?: string | number | boolean | null;
}

/** one usage site: the panel's full addressing input */
export interface UsageEntry {
  /** registry item id ("press-button") — the stamp's component value */
  readonly component: string;
  /** the local tag as written ("PressButton", "CardBody") */
  readonly tag: string;
  /** 1-based document order, file-global (the instance-attr value) */
  readonly usageIndex: number;
  /** the whole usage tag span (original source coords) */
  readonly start: number;
  readonly end: number;
  /** present props only — an absent prop is simply unkeyed ('none' is
   * the reserved kind for absent props; insertion uses insertAt below) */
  readonly props: Readonly<Record<string, PropSpan>>;
  /** where a missing prop's ` name={value}` inserts (after the stamps) */
  readonly insertAt: number;
  /** statically inside an {#each} — N iterations share this usage */
  readonly inEachBlock: boolean;
}

/** keyed by String(usageIndex) — the exported module shape */
export type UsageMap = Readonly<Record<string, UsageEntry>>;

/** the pure transform's result (null = nothing to stamp, module untouched) */
export interface StampResult {
  readonly code: string;
  readonly usageMap: UsageMap;
  readonly stamped: number;
}

export interface StampOptions {
  /** the filename named errors carry */
  readonly filename: string;
  /** local import binding → jixoai item id ("PressButton" → "press-button") */
  readonly bindings: Readonly<Record<string, string>>;
}

// ── prop span extraction ────────────────────────────────────────────

/** an ExpressionTag value part ({…} inside an attribute value) */
interface ExpressionTagPart extends AstNode {
  readonly expression?: AstNode & { readonly type?: string; readonly value?: unknown };
}

/**
 * The panel's rewrite span per attribute shape:
 *   variant="fill"    → the Text span (quotes stay; replace `fill`)
 *   size={2}          → the Literal expression span (braces stay)
 *   variant={"fill"}  → the Literal expression span (its own quotes stay)
 *   disabled          → the whole attribute span (replace with `disabled={false}`)
 *   tone={tone}       → kind 'expression' (read-only, "edit in code")
 *   multi-part values → kind 'expression'
 */
function propSpanOf(attribute: AstAttribute): PropSpan {
  const value = attribute.value;
  if (value === true) {
    return { start: attribute.start, end: attribute.end, kind: 'literal', value: true };
  }
  if (Array.isArray(value)) {
    if (value.length === 1 && value[0]!.type === 'Text') {
      const text = value[0] as AstNode & { data?: string };
      return { start: text.start, end: text.end, kind: 'literal', value: text.data ?? '' };
    }
  } else if (typeof value === 'object' && value !== null && value.type === 'ExpressionTag') {
    // the pure-expression shape is a BARE ExpressionTag object (size={2})
    const expression = (value as ExpressionTagPart).expression;
    // estree Literal: string / number / boolean / null (regexps excluded — value is an object)
    if (
      expression !== undefined &&
      expression.type === 'Literal' &&
      ['string', 'number', 'boolean', null].includes(typeof expression.value)
    ) {
      return {
        start: expression.start,
        end: expression.end,
        kind: 'literal',
        value: expression.value as string | number | boolean | null,
      };
    }
  }
  return { start: attribute.start, end: attribute.end, kind: 'expression' };
}

// ── js string literal (the invisible-character law, extract.ts copy) ─

/**
 * JSON.stringify + the two code points that are legal in JSON strings
 * but hostile in JS source evaluated as `<script>` content. The escapes
 * are source-code escape sequences (six ASCII characters), never
 * embedded literals.
 */
export function jsStringLiteral(value: string): string {
  return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** serialize the whole map (values are JSON-safe: strings/numbers/bools) */
function usageMapLiteral(map: Record<string, UsageEntry>): string {
  return JSON.stringify(map, null, 2).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// ── the pure transform ──────────────────────────────────────────────

/**
 * Stamp every jixoai-component usage in a svelte source and emit the
 * usage map export. PURE: no fs, no vite, no mutation of inputs.
 *
 * @throws a named `[jixoai-design-stamp] …` error when the source does
 *         not parse (mid-edit syntax errors surface by name — the same
 *         posture as the canvas extractor).
 */
export async function stampSvelteSource(source: string, options: StampOptions): Promise<StampResult | null> {
  const parse = await loadParse();
  let ast: {
    readonly fragment: AstFragment;
    readonly module?: (AstNode & { readonly attributes?: readonly { readonly name?: string }[] }) | null;
  };
  try {
    ast = parse(source, { filename: options.filename, modern: true }) as unknown as typeof ast;
  } catch (cause) {
    throw new Error(
      `${STAMP_ERROR_PREFIX} ${options.filename} did not parse — the stamp transform runs svelte/compiler over the usage module (fix the file): ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }

  const bindings = options.bindings;
  const edits: { offset: number; text: string }[] = [];
  const map: Record<string, UsageEntry> = {};
  let counter = 0;

  /** depth-first document-order walk with an ancestor type stack */
  function walk(fragment: AstFragment, ancestors: readonly string[]): void {
    for (const node of fragment.nodes) {
      if (node.type === 'Component') {
        const usage = node as UsageNode;
        const item = bindings[usage.name];
        if (item !== undefined) {
          counter += 1;
          const attributes = usage.attributes;
          // insert AFTER the last attribute (statics win over a usage's
          // own {...spread}); with no attributes, right after the tag name
          const lastAttribute = attributes[attributes.length - 1];
          const insertAt =
            lastAttribute !== undefined ? lastAttribute.end : usage.start + 1 + usage.name.length;
          edits.push({
            offset: insertAt,
            text: ` ${STAMP_COMPONENT_ATTR}="${item}" ${STAMP_INSTANCE_ATTR}="${counter}"`,
          });
          const props: Record<string, PropSpan> = {};
          for (const attribute of attributes) {
            if (attribute.type !== 'Attribute' || typeof attribute.name !== 'string') continue;
            props[attribute.name] = propSpanOf(attribute);
          }
          map[String(counter)] = {
            component: item,
            tag: usage.name,
            usageIndex: counter,
            start: usage.start,
            end: usage.end,
            props,
            insertAt,
            inEachBlock: ancestors.includes('EachBlock'),
          };
        }
      }
      const childTypes = [...ancestors, node.type];
      for (const child of childFragments(node)) {
        walk(child, childTypes);
      }
    }
  }
  walk(ast.fragment, []);

  if (counter === 0) return null; // no jixoai usage — module untouched

  // the usage-map export: into the existing module script (before its
  // closing tag) or as a new module script appended at file end (line
  // numbers of the original source stay intact — the sourcemap
  // best-effort posture)
  const exportStatement = `export const ${USAGE_MAP_EXPORT} = ${usageMapLiteral(map)};`;
  if (ast.module !== null && ast.module !== undefined) {
    const moduleNode = ast.module;
    const closeAt = source.lastIndexOf('</script>', moduleNode.end);
    if (closeAt === -1) {
      // a module script without a literal closing tag cannot happen for
      // source text — refuse loudly instead of splicing blind
      throw new Error(
        `${STAMP_ERROR_PREFIX} ${options.filename}: module script closing tag not found at offset ${moduleNode.end}`,
      );
    }
    edits.push({ offset: closeAt, text: `\n${exportStatement}\n` });
  } else {
    edits.push({ offset: source.length, text: `\n<script module>\n${exportStatement}\n</script>\n` });
  }

  // splice: descending offsets so earlier spans stay valid
  edits.sort((a, b) => b.offset - a.offset);
  let code = source;
  for (const edit of edits) {
    code = code.slice(0, edit.offset) + edit.text + code.slice(edit.offset);
  }

  return { code, usageMap: map, stamped: counter };
}

// ── import binding collection (pure; resolution is the plugin's) ────

/** the shape this transform needs from an import specifier */
export interface ImportRecord {
  readonly specifier: string;
  readonly localNames: readonly string[];
}

/**
 * Collect the file's import statements' (specifier → local binding
 * names) from BOTH scripts. The caller decides which specifiers are
 * jixoai items (the plugin resolves; tests fake it). Type-only and
 * namespace imports are skipped — neither can bind a usage tag
 * (`<X.Foo>` templates are out of the static stamping scope).
 */
export async function collectImports(source: string, filename: string): Promise<readonly ImportRecord[]> {
  const parse = await loadParse();
  const ast = parse(source, { filename, modern: true }) as unknown as {
    readonly instance?: { readonly content?: { readonly body?: readonly ScriptStatement[] } } | null;
    readonly module?: { readonly content?: { readonly body?: readonly ScriptStatement[] } } | null;
  };
  const records: ImportRecord[] = [];
  for (const script of [ast.instance, ast.module]) {
    for (const statement of script?.content?.body ?? []) {
      if (statement.type !== 'ImportDeclaration') continue;
      if ((statement as { importKind?: string }).importKind === 'type') continue;
      const specifier = statement.source?.value;
      if (typeof specifier !== 'string') continue;
      const localNames: string[] = [];
      for (const specifierNode of statement.specifiers ?? []) {
        if (specifierNode.type === 'ImportNamespaceSpecifier') continue;
        const local = specifierNode.local?.name;
        if (typeof local === 'string') localNames.push(local);
      }
      if (localNames.length > 0) records.push({ specifier, localNames });
    }
  }
  return records;
}
