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
 *
 * Co-location note (the AGENTS.md 5-intent alarm): these five intents
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
    html: false,
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

/** One keyed top-level block — the renderer never re-derives tail/type. */
export interface MarkdownBlock {
  /** `${index}:${type}:${digest}`; streaming tail: `${index}:${type}:tail` */
  readonly key: string;
  readonly type: string;
  readonly digest: string;
  readonly node: ParsedNode;
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

    const blocks: MarkdownBlock[] = nodes.map((node, index): MarkdownBlock => {
      // L2: while streaming, the LAST block keys on type alone (digest
      // dropped) — content may mutate in place, type transitions remount.
      // L1/L3: every other block (and all blocks in final mode) keys on
      // the semantic digest; duplicate-content siblings disambiguate by
      // the index prefix.
      const isTail = !final && index === nodes.length - 1;
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
