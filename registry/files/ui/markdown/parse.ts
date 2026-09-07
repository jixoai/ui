/**
 * jixoai markdown parse adapter (registry/files/ui/markdown/parse.ts,
 * markdown-streaming tasks 1.1–1.5, 2026-09-06).
 *
 * Original requirement (2026-09-06, user): "推出 markdown 渲染组件，
 * 支持流式渲染，AST 映射内部组件" (ship a markdown rendering
 * component with streaming support, mapping the AST onto in-house
 * components).
 *
 * Intent list (orthogonal):
 * 1. Pinned-axes markdown instance factory — the frozen option table of
 *    design.md §1.1 (html/linkify/typographer/breaks/stream/maxNesting +
 *    enableMath/enableContainers/enableFixIndentedCodeBlock, no
 *    customHtmlTags). Any axis drift fails the vocabulary fixtures.
 * 2. Ambient global-plugin trust boundary — detection-only, side-effect
 *    free: a non-zero factory-stamped plugin count warns ONCE that the
 *    vocabulary AND URL-security guarantees are simultaneously
 *    suspended. Never clearRegisteredMarkdownPlugins (process-global,
 *    shared with co-consumers).
 * 3. Adapter state machine (design §2.1) — final = !streaming derived
 *    per parse; non-append source (replace/shorten/message switch)
 *    recreates the md instance with a fresh stream cache.
 * 4. keyed-block digest-v1 (design §2.2) — stableStringify (canonical
 *    JSON, sourceMap excluded recursively) + fnv1a36 (FNV-1a 32-bit →
 *    lowercase base-36); key forms `${i}:${type}:${digest}` /
 *    streaming tail `${i}:${type}:tail`.
 * 5. Node vocabulary re-exports + NodeOf/MarkdownComponents — the type
 *    side of the renderer's override seam (design §3.3).
 * 6. GitHub-alert detection (markdown-coverage design §4) — a PURE
 *    function over the blockquote node: the marker line is stripped
 *    into CLONES, never into the parser's own nodes (the immutability
 *    law, see detectBlockquoteAlert).
 *
 * Co-location note (the AGENTS.md 5-intent alarm): these six intents
 * are ONE swap seam by design (design.md §1 — "parse.ts is the swap
 * seam" for any future parser exchange); splitting them would scatter
 * the frozen contract across files that must change together.
 */
import {
  getMarkdown,
  parseMarkdownToStructure,
  type AdmonitionNode,
  type BlockquoteNode,
  type CheckboxInputNode,
  type CheckboxNode,
  type CodeBlockNode,
  type CustomComponentNode,
  type DefinitionItemNode,
  type DefinitionListNode,
  type EmojiNode,
  type EmphasisNode,
  type FootnoteNode,
  type FootnoteReferenceNode,
  type HardBreakNode,
  type HeadingNode,
  type HighlightNode,
  type HtmlBlockNode,
  type HtmlInlineNode,
  type ImageNode,
  type InlineCodeNode,
  type InlineNode,
  type InsertNode,
  type LinkNode,
  type ListItemNode,
  type ListNode,
  type MarkdownIt,
  type MathBlockNode,
  type MathInlineNode,
  type ParagraphNode,
  type ParsedNode,
  type ReferenceNode,
  type StrikethroughNode,
  type StrongNode,
  type SubscriptNode,
  type SuperscriptNode,
  type TableCellNode,
  type TableNode,
  type TableRowNode,
  type TextNode,
  type ThematicBreakNode,
  type UnknownNode,
  type VmrContainerNode,
} from 'stream-markdown-parser';
// Type-only import (erased at emit): parse.ts keeps ZERO svelte runtime
// dependencies. The Component type lives here rather than in index.ts
// because the override seam belongs to the parse vocabulary contract —
// one home, no parse↔index type cycle.
import type { Component } from 'svelte';

// ---------------------------------------------------------------------------
// Intent 1 — the pinned-axes instance factory (design §1.1)
// ---------------------------------------------------------------------------

/**
 * The frozen factory options. Axes OUTSIDE this table are unpinned
 * (renderer-only or inert) — see design.md §1.1 "accounted-but-unpinned".
 */
const PINNED_FACTORY_OPTIONS = {
  markdownItOptions: {
    // html:true — the equivalence amendment (markdown-coverage §8.1,
    // 2026-09-07): the html_block/html_inline token rules must run for
    // the frozen tag table to see strike/details/kbd at all (under
    // html:false only the INLINE_HTML_TAG_NAMES members structure).
    // The security floor moves FULLY render-side and holds there: this
    // renderer owns every DOM node, never mounts {@html}, routes the
    // whitelisted tags onto components, and escapes every other tag's
    // content as literal text — probe-verified under html:true
    // (script/div/span arrive as structured nodes the mapper escapes).
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
    stream: true,
    // markdown-it-ts' runtime default IS 100 (not markdown-it's 20);
    // pinned explicitly (design §1.1, r5) so a library default bump can
    // never silently change deep-document semantics.
    maxNesting: 100,
  },
  enableMath: false,
  enableContainers: false,
  enableFixIndentedCodeBlock: true,
  // customHtmlTags: deliberately NOT passed — the seam stays closed in v1.
} as const;

/**
 * `streamTailLocalPostBlockRules` cannot be pinned through
 * `markdownItOptions` from here: the factory reads that key only to
 * FORCE it to `true` when unset (dist-verified:
 * `md.options.streamTailLocalPostBlockRules === true` under the options
 * above). That forced-true behavior — it shapes streaming tail
 * reuse/token processing — is locked by the cache/tail fixtures
 * (design §1.1, r4 N2), not by an option we pass.
 */

/** One md instance per adapter, one unique msgId per instance. */
let instanceCounter = 0;

// ---------------------------------------------------------------------------
// Intent 2 — ambient global-plugin trust boundary (design §1.1)
// ---------------------------------------------------------------------------

/**
 * Best-effort read of the factory stamp. NOT a contract dependency: the
 * optional chain + typeof guard keeps parse.ts working even if the
 * private field disappears from a future stream-markdown-parser.
 */
interface MarkstreamInstanceStamp {
  readonly __markstreamRegisteredPluginCount?: unknown;
}

const detectAmbientPluginCount = (md: MarkdownIt): number => {
  const stamped = (md as MarkdownIt & MarkstreamInstanceStamp).__markstreamRegisteredPluginCount;
  return typeof stamped === 'number' && stamped > 0 ? stamped : 0;
};

const ambientPluginWarning = (count: number): string =>
  `[@jixoai/markdown] ${count} ambient markstream plugin(s) (module-global registerMarkdownPlugin) ` +
  `were applied to this parser instance: the item's vocabulary AND URL-security guarantees are ` +
  `BOTH suspended simultaneously — only the renderer's own laws (escaped text, no raw HTML, ` +
  `image sanitize) still stand. Do not register markstream plugins in this process when the ` +
  `full floor is required.`;

// Dev-mode gate without a hard vite dependency: warn unless a bundler
// has explicitly stamped DEV=false (production build). Bare Node/vitest
// has no import.meta.env → warns (tests rely on this).
type ImportMetaWithEnv = ImportMeta & { readonly env?: { readonly DEV?: boolean } };
const viteEnv = (import.meta as ImportMetaWithEnv).env;
const isDevMode = (): boolean => viteEnv === undefined || viteEnv.DEV !== false;

// ---------------------------------------------------------------------------
// Intent 4 — digest-v1 primitives (design §2.2)
// ---------------------------------------------------------------------------

/** Version stamp of the digest contract; any change bumps to digest-v2. */
export const DIGEST_VERSION = 'digest-v1';

/**
 * The prose typography presets (the user-facing trio, 2026-09-07):
 * compact / standard / relaxed. This is the PROSE scale — calibrated
 * against GitHub and Tailwind Typography — deliberately not the
 * UI-density ladder (2xs…lg governs control surfaces; the `density`
 * prop name itself belongs to that axis family); markdown.css owns
 * the law.
 */
export type MarkdownTypography = 'compact' | 'standard' | 'relaxed';

const isDroppedValue = (value: unknown): boolean => {
  const kind = typeof value;
  return kind === 'undefined' || kind === 'symbol' || kind === 'function';
};

const stringifyObject = (value: object): string => {
  const record = value as Record<string, unknown>;
  // `sourceMap` is parse-local metadata, excluded RECURSIVELY at every
  // level before serialization (design §2.2) — right here is that level.
  const keys = Object.keys(record)
    .filter((key) => key !== 'sourceMap' && !isDroppedValue(record[key]))
    .sort(); // Array#sort default = UTF-16 code-unit ascending (the frozen key order)
  const parts = keys.map((key) => `${JSON.stringify(key)}:${stringifyCanonical(record[key])}`);
  return `{${parts.join(',')}}`;
};

const stringifyCanonical = (value: unknown): string => {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'number':
    case 'bigint':
      // Number#toString — NaN/Infinity stay literal (JSON.stringify
      // would null them, colliding distinct inputs).
      return String(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'string':
      return JSON.stringify(value); // standard JSON escaping, content verbatim
    case 'undefined':
    case 'symbol':
    case 'function':
      // Only reachable for array positions — object entries carrying
      // these were dropped by stringifyObject. JSON parity: null slot.
      return 'null';
    default:
      if (Array.isArray(value)) {
        return `[${value.map((element) => stringifyCanonical(element)).join(',')}]`;
      }
      return stringifyObject(value);
  }
};

/**
 * Canonical JSON for digests (design §2.2, complete definition):
 * object keys sorted ascending in code-unit order, `undefined` (and
 * symbol/function) object entries dropped, arrays in order, strings
 * verbatim, numbers via Number#toString, `sourceMap` removed
 * recursively at every level. Unknown and future node fields are
 * covered BY CONSTRUCTION — no per-type field enumeration.
 */
export const stableStringify = (value: unknown): string => stringifyCanonical(value);

const FNV1A_32_OFFSET_BASIS = 2166136261;
const FNV1A_32_PRIME = 16777619;

/**
 * FNV-1a 32-bit (offset basis 2166136261, prime 16777619) over the
 * UTF-8 byte encoding, computed modulo 2^32 with unsigned wraparound
 * (`>>> 0`), rendered as lowercase base-36 (`toString(36)`).
 * Public vector: `fnv1a36('') === 'ztntfp'` (the bare offset basis).
 */
export const fnv1a36 = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let hash = FNV1A_32_OFFSET_BASIS;
  for (const byte of bytes) {
    hash = (hash ^ byte) >>> 0;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }
  return hash.toString(36);
};

// ---------------------------------------------------------------------------
// Intent 3 — the adapter state machine (design §2.1)
// ---------------------------------------------------------------------------

/** One keyed top-level block — the renderer never re-derives tail/type.
 *  The node may be a synthetic accordion_group (the html equivalence
 *  lane's merge — design §8.3). */
export interface MarkdownBlock {
  /** `${index}:${type}:${digest}`; streaming tail: `${index}:${type}:tail` */
  readonly key: string;
  readonly type: string;
  readonly digest: string;
  readonly node: MarkdownNodeInput;
  readonly isTail: boolean;
}

export type MarkdownParseResult = {
  readonly blocks: MarkdownBlock[];
  /** `'streaming' | 'final'` — derived per parse (`final = !streaming`). */
  readonly mode: 'streaming' | 'final';
};

export type MarkdownParse = (source: string, streaming?: boolean) => MarkdownParseResult;

/**
 * Creates a self-contained streaming parser: its own md instance (fresh
 * stream cache), its own source history. `streaming` defaults to false —
 * a static document is the default face (design §2.1). The returned
 * parse function is synchronous and deterministic: same
 * `(source, streaming)` snapshot ⇒ same blocks ⇒ same keys (the SSR
 * snapshot law, design §2.3).
 */
export const createMarkdownParser = (): MarkdownParse => {
  let lastSource = '';
  let md: MarkdownIt;
  let ambientWarned = false;

  const createInstance = (): MarkdownIt => {
    const instance = getMarkdown(`jixoai-markdown-${++instanceCounter}`, PINNED_FACTORY_OPTIONS);
    // Trusted process boundary (design §1.1): detection-only, side-effect
    // free, ONE warn per parser even across instance recreations. We never
    // clearRegisteredMarkdownPlugins — the registry is process-global.
    if (!ambientWarned) {
      const ambientCount = detectAmbientPluginCount(instance);
      if (ambientCount > 0) {
        if (isDevMode()) console.warn(ambientPluginWarning(ambientCount));
        ambientWarned = true;
      }
    }
    return instance;
  };

  md = createInstance();

  return (source: string, streaming = false): MarkdownParseResult => {
    const final = !streaming;
    // Append check on every parse (design §2.1): `next.startsWith(last)`
    // (or last === ''). Non-append — replace/shorten/rollback/message
    // switch, including non-append after a final parse — recreates the
    // instance (fresh stream cache) and re-parses from scratch. A
    // final→streaming switch on a still-extending source stays on the
    // SAME instance: final parses never poison the stream env.
    const isAppend = lastSource === '' || source.startsWith(lastSource);
    if (!isAppend) {
      md = createInstance();
    }
    const nodes = parseMarkdownToStructure(source, md, {
      final,
      streamParse: 'auto',
      // Parse-cost optimization ONLY on non-final parses — its identity
      // guarantee lags one block behind, and the keyed-block laws never
      // depend on node identity (design §2.2).
      reuseStableTopLevelNodes: !final,
    });
    lastSource = source;

    // The html equivalence lane's ONE parse-side transform (design §8.3):
    // consecutive top-level <details> runs become ONE accordion group —
    // a pure rewrite of the node list BEFORE keying, so digests key on
    // the merged canonical form (a group that grows remounts once per
    // semantic event, the link-reference-definition precedent).
    const merged = groupAccordionRuns(nodes);

    const blocks: MarkdownBlock[] = merged.map((node, index): MarkdownBlock => {
      // L2: while streaming, the LAST block keys on type alone (digest
      // dropped) — content may mutate in place, type transitions remount.
      // L1/L3: every other block (and all blocks in final mode) keys on
      // the semantic digest; duplicate-content siblings disambiguate by
      // the index prefix.
      const isTail = !final && index === merged.length - 1;
      const digest = fnv1a36(stableStringify(node));
      return {
        key: isTail ? `${index}:${node.type}:tail` : `${index}:${node.type}:${digest}`,
        type: node.type,
        digest,
        node,
        isTail,
      };
    });
    return { blocks, mode: final ? 'final' : 'streaming' };
  };
};

// ---------------------------------------------------------------------------
// Intent 5 — node vocabulary + the override seam's type side (design §3.3)
// ---------------------------------------------------------------------------

export type {
  AdmonitionNode,
  BaseNode,
  BlockquoteNode,
  CheckboxInputNode,
  CheckboxNode,
  CodeBlockNode,
  CustomComponentNode,
  DefinitionItemNode,
  DefinitionListNode,
  EmojiNode,
  EmphasisNode,
  FootnoteNode,
  FootnoteReferenceNode,
  HardBreakNode,
  HeadingNode,
  HighlightNode,
  HtmlBlockNode,
  HtmlInlineNode,
  ImageNode,
  InlineCodeNode,
  InlineNode,
  InsertNode,
  LinkNode,
  ListItemNode,
  ListNode,
  MarkdownNodeSourceMap,
  MathBlockNode,
  MathInlineNode,
  ParagraphNode,
  ParsedNode,
  ReferenceNode,
  StrikethroughNode,
  StrongNode,
  SubscriptNode,
  SuperscriptNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  TextNode,
  ThematicBreakNode,
  UnknownNode,
  VmrContainerNode,
} from 'stream-markdown-parser';

/** Discriminant → node interface, for every ParsedNode member (plus the
 *  defensive `inline`), exactly as the dist types define them. */
interface NodeTypeMap {
  text: TextNode;
  heading: HeadingNode;
  paragraph: ParagraphNode;
  inline: InlineNode;
  list: ListNode;
  list_item: ListItemNode;
  code_block: CodeBlockNode;
  inline_code: InlineCodeNode;
  link: LinkNode;
  image: ImageNode;
  thematic_break: ThematicBreakNode;
  blockquote: BlockquoteNode;
  table: TableNode;
  table_row: TableRowNode;
  table_cell: TableCellNode;
  strong: StrongNode;
  emphasis: EmphasisNode;
  strikethrough: StrikethroughNode;
  highlight: HighlightNode;
  insert: InsertNode;
  subscript: SubscriptNode;
  superscript: SuperscriptNode;
  checkbox: CheckboxNode;
  checkbox_input: CheckboxInputNode;
  emoji: EmojiNode;
  definition_list: DefinitionListNode;
  definition_item: DefinitionItemNode;
  footnote: FootnoteNode;
  footnote_reference: FootnoteReferenceNode;
  admonition: AdmonitionNode;
  vmr_container: VmrContainerNode;
  hardbreak: HardBreakNode;
  math_inline: MathInlineNode;
  math_block: MathBlockNode;
  reference: ReferenceNode;
  html_block: HtmlBlockNode;
  html_inline: HtmlInlineNode;
}

/** Every node-type literal the parser vocabulary can discriminate on. */
export type ParsedNodeType = keyof NodeTypeMap;

/** Node interface for a type literal; unknown/future types fall back to
 *  UnknownNode (the renderer's safe text-only fallback shape). */
export type NodeOf<T extends string> = T extends ParsedNodeType ? NodeTypeMap[T] : UnknownNode;

/**
 * The components override seam (design §3.3): trusted application code,
 * the same trust level as any component the app renders by hand.
 * Overrides receive `{ node }` — raw fields included — and delegate
 * children through the exported MarkdownNode.
 */
export type MarkdownComponents = {
  [K in ParsedNodeType]?: Component<{ node: NodeOf<K> }>;
};

// ---------------------------------------------------------------------------
// Intent 6 — GitHub-alert detection on blockquotes (markdown-coverage
// design §4): the default map's one new behavior, a pure render-side
// read of the parsed node
// ---------------------------------------------------------------------------

/** The five GitHub alert kinds (the frozen vocabulary — anything else
 *  is plain quote text). */
export type GithubAlertKind = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/**
 * Kind → hue utility + label text. Hues are STATUSES, never
 * destructive (the variant-grammar action/status law): caution reads
 * `jx-hue-error`, not the destructive lane. The values carry the FULL
 * site-utility names (TW4 @utility classes, always available) — never
 * a `jx-hue-` prefix for concatenation: a trailing-dash token in a
 * source string would enter the hook-law static inventory (B1 bans
 * them), while full names are the css-defined class form every
 * call-site already uses. The class injects the --jx-tonal token the
 * alert face's tonal rung consumes.
 */
export const GITHUB_ALERTS: Record<GithubAlertKind, { hueClass: string; label: string }> = {
  note: { hueClass: 'jx-hue-info', label: 'Note' },
  tip: { hueClass: 'jx-hue-success', label: 'Tip' },
  important: { hueClass: 'jx-hue-primary', label: 'Important' },
  warning: { hueClass: 'jx-hue-warning', label: 'Warning' },
  caution: { hueClass: 'jx-hue-error', label: 'Caution' },
};

/** The marker on its own first line — mixed case allowed, optional
 *  trailing whitespace (GitHub's own rules: `[!NOTE]` mid-line or on a
 *  later line is body text, never an alert). */
const GITHUB_ALERT_MARKER = /^\[!(note|tip|important|warning|caution)\]\s*$/i;

/**
 * IMMUTABILITY LAW — this function NEVER mutates the parser's nodes.
 * The stream cache and the keyed-block digests share the very objects
 * it receives: a strip-in-place would corrupt re-detection on the next
 * render (the marker already gone, the quote silently demoting to
 * plain — a strip-then-no-match loop) and desync the digest the L3 key
 * transition froze. The returned children are therefore a NEW array
 * over a shallowly-structurally cloned chain (new objects for the
 * modified wrapper/paragraph/text spine only; untouched siblings keep
 * sharing references with the parse tree — nothing downstream writes
 * them).
 *
 * Detection: node.children[0] must be a paragraph; its first child
 * must be a text node — OR an `inline` wrapper whose first child is a
 * text node (both AST shapes supported; the installed parser emits the
 * direct-text shape for every probed quote, the wrapper arm is
 * defensive tolerance pinned by unit test). The text node's FIRST LINE
 * (content up to the first \n) must fully match the marker. On match:
 * the marker line is stripped from the clone (remaining lines kept; an
 * emptied text node is dropped, then an emptied wrapper, then an
 * emptied paragraph — each drop only when the strip made it empty).
 * `raw` fields stay verbatim on the clones: render reads `content`,
 * and the digest already ran over the ORIGINAL node before any
 * component saw it.
 */
export function detectBlockquoteAlert(
  node: BlockquoteNode,
): { kind: GithubAlertKind; children: ParsedNode[] } | null {
  const paragraph = node.children[0];
  if (!paragraph || paragraph.type !== 'paragraph') return null;

  // one level of wrapper tolerance: inline > text probed the same way
  const wrapper = paragraph.children[0];
  const inline =
    wrapper !== undefined && wrapper.type === 'inline' && wrapper.children[0] !== undefined
      ? wrapper
      : undefined;
  const text = inline ? inline.children[0] : wrapper;
  if (!text || text.type !== 'text') return null;

  const newlineIndex = text.content.indexOf('\n');
  const firstLine = newlineIndex === -1 ? text.content : text.content.slice(0, newlineIndex);
  const match = GITHUB_ALERT_MARKER.exec(firstLine);
  if (!match) return null;

  // strip the marker line from the CLONE; remaining lines (if any) are
  // the alert body's opening text
  const stripped = newlineIndex === -1 ? '' : text.content.slice(newlineIndex + 1);
  const kind = match[1]!.toLowerCase() as GithubAlertKind;

  // rebuild the modified spine, shallow-structural: text → (wrapper) →
  // paragraph → quote children, dropping any link the strip emptied
  let paragraphChildren: ParsedNode[];
  if (stripped === '') {
    // the marker was the text node's whole content — drop it; an
    // emptied wrapper drops with it, its surviving children stay in
    // the cloned wrapper
    if (inline) {
      const wrapperRest = inline.children.slice(1);
      paragraphChildren =
        wrapperRest.length > 0
          ? [{ ...inline, children: wrapperRest }, ...paragraph.children.slice(1)]
          : paragraph.children.slice(1);
    } else {
      paragraphChildren = paragraph.children.slice(1);
    }
  } else {
    const strippedText: ParsedNode = { ...text, content: stripped };
    paragraphChildren = inline
      ? [
          { ...inline, children: [strippedText, ...inline.children.slice(1)] },
          ...paragraph.children.slice(1),
        ]
      : [strippedText, ...paragraph.children.slice(1)];
  }

  if (paragraphChildren.length === 0) {
    return { kind, children: node.children.slice(1) };
  }
  const strippedParagraph: ParsedNode = { ...paragraph, children: paragraphChildren };
  return { kind, children: [strippedParagraph, ...node.children.slice(1)] };
}

// ---------------------------------------------------------------------------
// Intent 6 — the html equivalence vocabulary (design §8, the Owner's
// 2026-09-07 addition: "some <b>text</b>" and "some **text**" must be
// fully equivalent). The html axis rides TRUE (the §8.1 amendment):
// the structure layer delivers PARSED html nodes (html_inline/
// html_block carrying tag/attrs/children — probe-verified under the
// real nested pin), so equivalence is a RENDER-side routing decision
// through the frozen tables below; unknown tags keep the escaped-text
// security floor. The tables are spec-level vocabulary: adding a tag
// is a spec change, never a patch.
// ---------------------------------------------------------------------------

/**
 * Inline tag → the text-family mark the markdown spelling lands in
 * (`b` and `<strong>` both route to Strong, exactly as `**x**` does).
 * The value vocabulary is the text family's own (element-word) marks.
 */
export const HTML_INLINE_TAG_TO_MARK: Readonly<Record<string, string>> = {
  b: 'strong',
  strong: 'strong',
  i: 'em',
  em: 'em',
  del: 'del',
  s: 'del',
  strike: 'del',
  ins: 'ins',
  u: 'ins',
  mark: 'mark',
  sub: 'sub',
  sup: 'sup',
};

/** The block tags the map owns at BLOCK position (details rides the
 *  accordion via the group merge; hr mirrors thematic_break). */
export const HTML_BLOCK_TAG_OWNED: ReadonlySet<string> = new Set(['details', 'hr']);

/** One accordion item extracted from a top-level html details block:
 *  the summary element's children, the body blocks (everything after
 *  the summary), and the open attribute's presence. Never mutates the
 *  parser's nodes — payloads reference children arrays as-is. */
export interface AccordionItemPayload {
  summary: readonly ParsedNode[];
  children: readonly ParsedNode[];
  open: boolean;
}

/** The synthetic block a consecutive run of top-level details nodes
 *  becomes (design §8.3) — locally typed: the parser's union stays
 *  untouched, and the components-seam lookup simply finds no override
 *  for it (app-level grouping decisions ride the html-node overrides). */
export interface AccordionGroupNode {
  type: 'accordion_group';
  items: readonly AccordionItemPayload[];
}

/** What the keyed map (and MarkdownNode) accept after the merge. */
export type MarkdownNodeInput = ParsedNode | AccordionGroupNode;

/** attrs pair-array → record (the parser ships `[[name, value]]`). */
export function htmlAttrsToRecord(
  attrs: readonly (readonly [string, string])[] | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of attrs ?? []) out[pair[0]] = pair[1];
  return out;
}

/** A summary-less details renders the UA's default disclosure label. */
const DEFAULT_SUMMARY: readonly ParsedNode[] = [{ type: 'text', content: 'Details' }];

function isHtmlDetails(node: ParsedNode): boolean {
  return node.type === 'html_block' && node.tag === 'details';
}

/** details node → accordion item payload (exported: the nested-details
 *  branch of the mapper reuses it for a details at non-top-level
 *  position, where the group merge never sees it). */
export function detailsToAccordionItem(node: ParsedNode): AccordionItemPayload {
  if (!isHtmlDetails(node)) throw new Error('[jxoai markdown] accordion item expects a details node');
  const children = node.children ?? [];
  const summaryNode = children.find((child) => child.type === 'html_block' && child.tag === 'summary');
  const summary =
    summaryNode && summaryNode.children && summaryNode.children.length > 0
      ? summaryNode.children
      : DEFAULT_SUMMARY;
  const body = children.filter((child) => child !== summaryNode);
  return { summary, children: body, open: 'open' in htmlAttrsToRecord(node.attrs) };
}

function accordionItemFrom(node: ParsedNode): AccordionItemPayload {
  return detailsToAccordionItem(node);
}

/**
 * The merge: each maximal run of consecutive top-level details blocks
 * becomes ONE accordion group (a pile of framed boxes is the pile the
 * group exists to collapse). Pure — inputs are never mutated.
 */
export function groupAccordionRuns(nodes: readonly ParsedNode[]): MarkdownNodeInput[] {
  const out: MarkdownNodeInput[] = [];
  let run: ParsedNode[] = [];
  const flush = () => {
    if (run.length > 0) {
      out.push({ type: 'accordion_group', items: run.map(accordionItemFrom) });
      run = [];
    }
  };
  for (const node of nodes) {
    if (isHtmlDetails(node)) {
      run.push(node);
    } else {
      flush();
      out.push(node);
    }
  }
  flush();
  return out;
}
