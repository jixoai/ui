/**
 * @jixoai/vite-plugin (canvas) — the PURE canvas source extractor
 * (typography-context-and-parts §7, proposal C §3).
 *
 * `(pageSource) → { ids, canvases }` with ZERO vite/fs imports, so the
 * ./canvas sub-entry can serve it to tests directly and the plugin's
 * load() is a thin reader around it. The pipeline, byte-honest by
 * ruling (the honest-extraction confirmation, design §7):
 *
 *   svelte/compiler parse (MODERN ast — AST, never regex)
 *     → walk html for <ComponentCanvas> elements (any nesting depth)
 *     → the `id` attribute is the extraction key: MISSING = skip
 *       silently (opt-in per canvas — no id = no extraction = zero
 *       cost, the unmigrated posture); NON-STATIC = a named error
 *       (a dynamic id cannot key extraction — it reads as an attempted
 *       opt-in, so it fails by name instead of silently drifting);
 *       DUPLICATE = a named error (one id must name one canvas)
 *     → children source slice: the byte span of the fragment's child
 *       nodes, MINUS the byte ranges of DIRECT-CHILD {#snippet} blocks
 *       (the canvas protocol — `playground` and siblings are pane
 *       chrome, not demo content; NESTED snippets are demo content and
 *       stay, byte-identical)
 *     → dedent by the minimum common indentation of the non-blank
 *       lines, trim the outer blank lines, NOTHING else — comments
 *       stay (pedagogy + byte-honesty), layout wrappers stay, there is
 *       NO elide marker (an anti-law drift hole)
 *     → SELF-CONTAINMENT GUARD (design F4): every snippet/render
 *       reference in the slice ({@render x()} callees, sole-identifier
 *       attribute values like icon={glyph}, shorthand attributes, and
 *       sole-identifier text expressions) must resolve INSIDE the
 *       slice (a {#snippet x()} definition at any depth, or a snippet
 *       parameter) — else a named error. The usage sample must be
 *       copy-paste-runnable; a page-level identifier (markdown's
 *       source consts, a page snippet) is exactly the drift class
 *       this change kills, so it fails the build by name instead of
 *       shipping a broken sample.
 *
 * The svelte/compiler parse rides the BRIDGE pattern (design F1/F7 —
 * the svgo/optimize precedent): a memoized dynamic import, so
 * svelte/compiler NEVER enters any entry chunk's static graph and the
 * optional peer dependency is loaded exactly once.
 */

import type * as SvelteAST from 'svelte/compiler';

/** the component name the extractor keys on (the canvas protocol) */
const CANVAS_COMPONENT_NAME = 'ComponentCanvas';

/** every named error the extractor throws carries this prefix */
export const CANVAS_ERROR_PREFIX = '[jixoai-canvas]';

// ── the parser bridge (F1: svelte = optional peer, loaded lazily) ──

type SvelteParse = typeof SvelteAST.parse;

let parsePromise: Promise<SvelteParse> | undefined;

const SVELTE_COMPILER_MODULE = 'svelte/compiler';

function loadParse(): Promise<SvelteParse> {
  parsePromise ??= import(SVELTE_COMPILER_MODULE).then(
    (mod) => mod.parse,
    () => {
      // a failed import memoizes as rejected — allow a later retry
      // (e.g. the consumer installs svelte and restarts without a
      // fresh module registry); the named error still fires now.
      parsePromise = undefined;
      throw new Error(
        `${CANVAS_ERROR_PREFIX} svelte is not resolvable — the canvas ` +
          `extractor parses pages with ${SVELTE_COMPILER_MODULE} (svelte is ` +
          `an OPTIONAL peer dependency of @jixoai/vite-plugin; install it to ` +
          `use canvasPlugin)`,
      );
    },
  );
  return parsePromise;
}

// ── AST walking (loose shapes — the modern AST, structural) ───────

/**
 * The minimal structural surface the walk needs. The modern AST nodes
 * all carry { type, start, end }; fragments carry { nodes }; element /
 * component / block nodes carry a `fragment`. Kept structural (not the
 * full generated union) so compiler minor-version AST additions never
 * break the walk.
 */
interface AstNode {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly fragment?: AstFragment | null;
  readonly nodes?: readonly AstNode[];
}

interface AstFragment {
  readonly type: 'Fragment';
  readonly nodes: readonly AstNode[];
}

/** attribute value shapes the guard reads (see svelte/compiler types) */
interface AstAttributeLike {
  readonly type: string;
  readonly name: string;
  readonly value:
    | true
    | readonly AstNode[]
    | { readonly type: string; readonly expression?: AstNode };
}

/** a Component-like node (ComponentCanvas instances) */
interface CanvasNode extends AstNode {
  readonly name: string;
  readonly attributes: readonly AstAttributeLike[];
}

/** a {#snippet name(params)} block */
interface SnippetNode extends AstNode {
  readonly expression?: { readonly type: string; readonly name?: string };
  readonly parameters?: readonly { readonly type: string; readonly name?: string }[];
}

/** an {@render expr} tag */
interface RenderNode extends AstNode {
  readonly expression?: AstNode;
}

/**
 * the child-fragment keys across the modern AST: elements/components
 * carry `fragment`; IfBlock carries consequent/alternate; EachBlock and
 * SnippetBlock carry `body`. All values are {type:'Fragment', nodes}.
 */
const CHILD_FRAGMENT_KEYS = ['fragment', 'consequent', 'alternate', 'body'] as const;

/** the child fragments of a node (empty when it holds none) */
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

/** depth-first over every node + every child fragment's nodes */
function* walkAll(fragment: AstFragment): Generator<AstNode> {
  for (const node of fragment.nodes) {
    yield node;
    for (const child of childFragments(node)) {
      yield* walkAll(child);
    }
  }
}

/** visit a node and every descendant (shared by both collectors) */
function visitDeep(node: AstNode, visit: (node: AstNode) => void): void {
  visit(node);
  for (const fragment of childFragments(node)) {
    for (const child of fragment.nodes) visitDeep(child, visit);
  }
}

/** the {#snippet} definitions + parameters reachable inside a node set */
function collectSnippetBindings(nodes: readonly AstNode[]): Set<string> {
  const bound = new Set<string>();
  for (const node of nodes) {
    visitDeep(node, (current) => {
      if (current.type !== 'SnippetBlock') return;
      const snippet = current as SnippetNode;
      if (
        snippet.expression?.type === 'Identifier' &&
        typeof snippet.expression.name === 'string'
      ) {
        bound.add(snippet.expression.name);
      }
      for (const param of snippet.parameters ?? []) {
        if (param.type === 'Identifier' && typeof param.name === 'string') {
          bound.add(param.name);
        }
      }
    });
  }
  return bound;
}

/** the snippet/render references a slice makes (the F4 guard's input) */
function collectSnippetReferences(nodes: readonly AstNode[]): Set<string> {
  const refs = new Set<string>();
  const noteIdentifier = (expression: AstNode | undefined): void => {
    if (
      expression?.type === 'Identifier' &&
      typeof (expression as { name?: string }).name === 'string'
    ) {
      refs.add((expression as unknown as { name: string }).name);
    }
  };
  for (const node of nodes) {
    visitDeep(node, (current) => {
      // {@render x()} / {@render x?.()} — the callee AND sole-identifier
      // arguments are snippet references (snippets also pass THROUGH
      // render arguments; a page-level identifier in either position is
      // the broken-copy-paste class)
      if (current.type === 'RenderTag') {
        const expression = (current as RenderNode).expression;
        if (expression?.type === 'CallExpression') {
          const call = expression as unknown as {
            callee?: AstNode;
            arguments?: readonly AstNode[];
          };
          noteIdentifier(call.callee);
          for (const argument of call.arguments ?? []) {
            noteIdentifier(argument);
          }
        }
      }
      // text {expr}
      if (current.type === 'ExpressionTag') {
        noteIdentifier((current as { expression?: AstNode }).expression);
      }
      // attribute values (NOT reachable through the fragment walk —
      // attributes hang off element/component nodes directly):
      // icon={glyph} (sole identifier), the shorthand {source} form,
      // interpolated values report each ExpressionTag part
      const attributes = (current as { attributes?: unknown }).attributes;
      if (Array.isArray(attributes)) {
        for (const attribute of attributes as { type: string; value?: unknown }[]) {
          if (attribute.type !== 'Attribute') continue;
          const value = attribute.value;
          if (!Array.isArray(value) && value !== true && value !== undefined) {
            noteIdentifier((value as { expression?: AstNode }).expression);
          } else if (Array.isArray(value)) {
            for (const part of value as { type: string; expression?: AstNode }[]) {
              if (part.type === 'ExpressionTag') {
                noteIdentifier(part.expression);
              }
            }
          }
        }
      }
    });
  }
  return refs;
}

// ── the slice post-processing (dedent + trim, nothing else) ───────

/** dedent by the min common indent of non-blank lines + trim outer blanks */
export function dedentAndTrim(slice: string): string {
  const lines = slice.split('\n');
  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim().length === 0) continue; // blank lines carry no vote
    const indent = line.length - line.trimStart().length;
    if (indent < minIndent) minIndent = indent;
  }
  if (!Number.isFinite(minIndent)) return ''; // all-blank slice
  const stripped = lines.map((line) =>
    line.trim().length === 0 ? '' : line.slice(minIndent),
  );
  // trim outer blank lines ONLY (interior blank lines are content)
  let start = 0;
  let end = stripped.length;
  while (start < end && stripped[start]!.length === 0) start += 1;
  while (end > start && stripped[end - 1]!.length === 0) end -= 1;
  return stripped.slice(start, end).join('\n');
}

// ── extraction ────────────────────────────────────────────────────

/** the pure extractor's result: ids in document order + the slices */
export interface CanvasExtraction {
  readonly ids: readonly string[];
  readonly canvases: Readonly<Record<string, string>>;
}

/** where an id attribute's problems name themselves (the page, by caller) */
export interface ExtractOptions {
  /** the page path/name named errors carry (diagnostics only) */
  readonly filename?: string;
}

/**
 * Extract every id-carrying <ComponentCanvas> children slice from a
 * Svelte page source. PURE: no fs, no vite, no mutation of inputs.
 *
 * @throws a named `[jixoai-canvas] …` error on: a page that does not
 *         parse (cause attached), a non-static or duplicate id, or a
 *         slice that fails the self-containment guard (F4).
 */
export async function extractCanvases(
  source: string,
  options: ExtractOptions = {},
): Promise<CanvasExtraction> {
  const filename = options.filename ?? '<page>';
  const parse = await loadParse();
  let ast: { readonly fragment: AstFragment };
  try {
    ast = parse(source, { filename, modern: true }) as unknown as {
      fragment: AstFragment;
    };
  } catch (cause) {
    throw new Error(
      `${CANVAS_ERROR_PREFIX} ${filename} did not parse — the canvas ` +
        `extractor runs svelte/compiler over the page source, and a ` +
        `mid-edit syntax error fails the build by name (fix the page): ` +
        `${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }

  const canvases: Record<string, string> = {};
  const ids: string[] = [];
  const seen = new Map<string, number>(); // id → first canvas start (dup errors)

  for (const node of walkAll(ast.fragment)) {
    if (node.type !== 'Component' || (node as CanvasNode).name !== CANVAS_COMPONENT_NAME) {
      continue;
    }
    const canvas = node as CanvasNode;
    const idAttr = canvas.attributes.find(
      (attribute) => attribute.type === 'Attribute' && attribute.name === 'id',
    );
    // missing id: the unmigrated posture — skip silently (zero cost)
    if (idAttr === undefined) continue;

    // static id: a single Text value node. everything else (an
    // expression, a shorthand, an interpolated multi-part value) cannot
    // key extraction — named error, never a silent skip.
    const value = idAttr.value;
    const staticId =
      Array.isArray(value) && value.length === 1 && value[0]!.type === 'Text'
        ? ((value[0] as unknown as { data?: string }).data ?? '')
        : null;
    if (staticId === null || staticId.length === 0) {
      throw new Error(
        `${CANVAS_ERROR_PREFIX} ${filename}: a ${CANVAS_COMPONENT_NAME} ` +
          `carries an id that is not a static string literal — the id is ` +
          `the extraction key, so id="…" must be a plain string (found ` +
          `type "${Array.isArray(value) ? value.map((v) => v.type).join(', ') : typeof value}")`,
      );
    }
    const firstAt = seen.get(staticId);
    if (firstAt !== undefined) {
      throw new Error(
        `${CANVAS_ERROR_PREFIX} ${filename}: duplicate canvas id ` +
          `"${staticId}" — the id keys resolveRawCode(), so each ` +
          `${CANVAS_COMPONENT_NAME} id must be unique on its page ` +
          `(first defined at offset ${firstAt})`,
      );
    }
    seen.set(staticId, canvas.start);

    // children slice: the byte span of ALL children minus the
    // direct-child {#snippet} byte ranges (the canvas protocol)
    const children = canvas.fragment?.nodes ?? [];
    if (children.length === 0) {
      canvases[staticId] = '';
      ids.push(staticId);
      continue;
    }
    const spanStart = children[0]!.start;
    const spanEnd = children[children.length - 1]!.end;
    const dropped: readonly { start: number; end: number }[] = children
      .filter((child) => child.type === 'SnippetBlock')
      .map((child) => ({ start: child.start, end: child.end }));
    let slice = '';
    let cursor = spanStart;
    for (const range of dropped) {
      slice += source.slice(cursor, range.start);
      cursor = range.end;
    }
    slice += source.slice(cursor, spanEnd);
    const keptNodes = children.filter((child) => child.type !== 'SnippetBlock');

    // F4 self-containment: references must resolve within the slice
    const bound = collectSnippetBindings(keptNodes);
    const refs = collectSnippetReferences(keptNodes);
    const unbound = [...refs].filter((ref) => !bound.has(ref));
    if (unbound.length > 0) {
      throw new Error(
        `${CANVAS_ERROR_PREFIX} ${filename}: canvas "${staticId}" is not ` +
          `self-contained — the slice references identifier(s) ` +
          `[${unbound.join(', ')}] that are not defined inside the canvas ` +
          `children ({#snippet …} definitions or snippet parameters). A ` +
          `usage sample must be copy-paste-runnable: move the snippet ` +
          `into the canvas, or drop the id to keep the canvas unextracted.`,
      );
    }

    canvases[staticId] = dedentAndTrim(slice);
    ids.push(staticId);
  }

  return { ids, canvases };
}

// ── module emission (pure — the plugin's load() returns this) ─────

/**
 * JSON.stringify + the two code points that are legal in JSON strings
 * but hostile in JS source evaluated as `<script>` content (U+2028
 * LINE SEPARATOR / U+2029 PARAGRAPH SEPARATOR). The escapes are
 * written as source-code escape sequences (six ASCII characters),
 * never embedded literals — the invisible-character law.
 */
export function jsStringLiteral(value: string): string {
  return JSON.stringify(value).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/**
 * Emit the pure-data virtual module: named exports only (the
 * virtual:jixoai-ghostty surface law). `canvasIds` is document order;
 * the raw-code map stays INTERNAL; `resolveRawCode(id)` hands pages
 * their own canvas markup with the named miss-error listing the
 * page's real ids (a miss fails prerender loudly, never renders a
 * stale or empty sample).
 */
export function emitCanvasModule(extraction: CanvasExtraction): string {
  const idsLiteral = `[${extraction.ids.map((id) => jsStringLiteral(id)).join(', ')}]`;
  const mapEntries = extraction.ids.map(
    (id) => `  ${jsStringLiteral(id)}: ${jsStringLiteral(extraction.canvases[id] ?? '')},`,
  );
  return [
    `// generated by @jixoai/vite-plugin canvasPlugin — the page's`,
    `// ComponentCanvas children, extracted at build time (same-source law).`,
    `export const canvasIds = ${idsLiteral};`,
    `const rawCodeMap = {`,
    ...(mapEntries.length > 0 ? mapEntries : []),
    `};`,
    `export function resolveRawCode(id) {`,
    `  const code = rawCodeMap[id];`,
    `  if (code === undefined) {`,
    `    throw new Error(`,
    `      '[jixoai-canvas] no canvas with id "' + id + '" on this page — the page ids are: [' +`,
    `        canvasIds.join(', ') + ']',`,
    `    );`,
    `  }`,
    `  return code;`,
    `}`,
  ].join('\n');
}
