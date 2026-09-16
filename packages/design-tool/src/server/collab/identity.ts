/**
 * @jixoai/ui-design (collab) — component identity: the page ledger and
 * the ingest-side id adoption/injection kernel (collab-protocol M1;
 * protocol-spec §2, probe semantics frozen by
 * `.zcode/epic40/lab/p15-ingest-ids.mjs`).
 *
 * The identity law (§2):
 *   - every component carries a GLOBAL id on the NATIVE `id` attribute
 *     (no data-* doubles) — the protocol surface is the bare id, and it
 *     stays in the DOM (a legal HTML anchor, never stripped).
 *   - id format `<page-letter><counter>` (e.g. a13): the page letter is
 *     assigned at page adoption, bijective base-26 (a..z, aa, ab…),
 *     monotonic and never reused; the per-page decimal counter is a
 *     monotonic high-water that never releases a number — deletion only
 *     leaves tombstones upstream, so b3 deleted means the NEXT
 *     component takes b4, never b3 again.
 *   - ingest walks the whole html fragment subtree RECURSIVELY (B5,
 *     impl-review-1: §2 「每个组件」含嵌套) — every InlineComponent/
 *     Component in document order, at any nesting depth: inside plain
 *     elements (`<main><Inner /></main>`), inside component slots
 *     (`<Outer><Mid><Inner /></Mid></Outer>`) and inside block
 *     fragments (`{#if}`/`{:else}` chains, `{#each}`, `{#await}`
 *     pending/then/catch, `{#snippet}` — the legacy-AST fragment keys).
 *     NOT descended: `expression`/`parameters`/attribute values (ESTree
 *     — a component usage cannot legally appear there; frozen note).
 *     Every existing legal native id is adopted VERBATIM (a manual name
 *     is a stable identity too, never re-stamped); components without
 *     an id get the next number, injected right after the tag name via
 *     magic-string (`<Chip` → `<Chip id="a8"`). The per-page counter
 *     stays FLAT: document-order pre-order accumulation, never layered
 *     by depth (§2 组件序号 = 页内计数器单调累加).
 *   - a verbatim id matching `<letter><digits>` raises the page's
 *     high-water (manual a7 → the next generated is a8); the generator
 *     additionally skips every id value already present in the file
 *     (anti-collision with manual names).
 *   - re-ingesting an already-injected source is a no-op: every
 *     component is verbatim now, nothing is injected, the counters do
 *     not advance (P15 idempotency + concurrent-duplicate adoption).
 *
 * Legality (non-empty, no whitespace) and file-uniqueness violations
 * throw IdentityError — typed, `code`d — for the admission layer to map
 * onto `409 bad-target` (§2).
 *
 * Original need: collab-protocol M1 (2026-09-15); recursion upgraded by
 * M5b B5 (2026-09-15) — the top-level-only boundary was impl-review-1's
 * gap, §2's 「每个组件」 includes nested usages.
 */

import MagicString from 'magic-string';
import { parse as parseSvelte } from 'svelte/compiler';

/* ── the page ledger (serializable identity state) ────────────────────── */

/**
 * The identity ledger — plain data only (two Maps, structured-clone
 * safe; JSON transport needs a replacer and belongs to the resync
 * milestone, not the kernel). `ingestIds` NEVER mutates the caller's
 * instance: it derives a working copy, so concurrent ingests from one
 * snapshot cannot see each other's writes (P15 concurrent determinism).
 * `pages` grows by adoption and entries are never removed — letters
 * must never be re-derived over a shrunken ledger (letter-collision).
 */
export interface PageLedger {
  /** source file path → adopted page letter (insertion order = letter order) */
  readonly pages: Map<string, string>;
  /** page letter → counter high-water (max seen or generated number) */
  readonly counters: Map<string, number>;
}

/**
 * The page-letter alphabet: bijective base-26 (`0→a` … `25→z`,
 * `26→aa`, `27→ab`, `51→az`, `701→zz`, `702→aaa`). Callers pass the
 * adoption ordinal (`ledger.pages.size`); letters are monotonic and
 * never reused because `pages` never shrinks.
 */
export function pageLetter(index: number): string {
  let s = '';
  let n = index;
  do {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

/* ── typed errors (the admission layer maps these onto 409) ───────────── */

/** every named error the identity kernel throws carries this prefix */
export const IDENTITY_ERROR_PREFIX = '[jixoai-collab-identity]';

export type IdentityErrorCode =
  | 'illegal-id' // non-empty / no-whitespace validation failed (§2)
  | 'duplicate-id' // the same id value appears twice in one file (§2)
  | 'unreadable-id' // id exists but is not a plain text literal
  | 'letter-collision'; // ledger tampering would re-derive a held letter

export class IdentityError extends Error {
  readonly code: IdentityErrorCode;
  constructor(code: IdentityErrorCode, message: string) {
    super(`${IDENTITY_ERROR_PREFIX} ${message}`);
    this.name = 'IdentityError';
    this.code = code;
  }
}

/* ── the svelte AST shapes this kernel consumes (structural) ──────────── */

interface ValuePartNode {
  readonly type: string;
  readonly data?: string;
}

interface AttributeNode {
  readonly type: string;
  readonly name?: string;
  /** legacy Attribute value: `true` = bare, else Text/MustacheTag parts */
  readonly value?: true | readonly ValuePartNode[];
}

interface ComponentNode {
  readonly type: string; // InlineComponent (legacy AST) | Component (modern)
  readonly name: string;
  readonly start: number;
  readonly attributes?: readonly AttributeNode[];
}

/**
 * Any template node that may hold a fragment (an array of child nodes):
 * Elements, components, IfBlock/EachBlock/KeyBlock/SnippetBlock (via
 * `children`), ElseBlock (nested in IfBlock.else, itself carrying
 * `children` — elseif chains arrive as an IfBlock inside them), and
 * AwaitBlock's pending/then/catch blocks. Frozen against the svelte
 * 5.55 legacy AST (verified shapes, 2026-09-15).
 */
interface FragmentNode {
  readonly type?: unknown;
  readonly children?: unknown;
  readonly else?: unknown; // IfBlock → ElseBlock (its children hold the branch)
  readonly pending?: unknown; // AwaitBlock → PendingBlock
  readonly then?: unknown; // AwaitBlock → ThenBlock
  readonly catch?: unknown; // AwaitBlock → CatchBlock
}

function isComponentNode(node: unknown): node is ComponentNode {
  if (node === null || typeof node !== 'object') return false;
  const { type, name } = node as { type?: unknown; name?: unknown };
  return (type === 'InlineComponent' || type === 'Component') && typeof name === 'string';
}

/** §2 legality: an adoptable id is non-empty and carries no whitespace */
function htmlLegalId(id: string): boolean {
  return id.length > 0 && !/\s/.test(id);
}

/** `<letter><digits>` — a manual id that fits THIS page's own scheme */
function schemeNumberOf(letter: string, id: string): number | undefined {
  const match = new RegExp(`^${letter}(\\d+)$`).exec(id);
  return match !== null ? Number(match[1]) : undefined;
}

/**
 * The id attribute's plain text literal; `undefined` when the attribute
 * is absent. An id that EXISTS but is not a single plain Text literal
 * (bare `id`, `id={expr}`, multi-part `id="a{b}c"`) throws: such an id
 * cannot be validated for legality/uniqueness, and generating past it
 * would double the attribute (a compile error) — an honest typed error
 * instead of a corrupted write.
 */
function idLiteralOf(attribute: AttributeNode | undefined, where: string): string | undefined {
  if (attribute === undefined) return undefined;
  const value = attribute.value;
  const only = Array.isArray(value) && value.length === 1 ? value[0] : undefined;
  if (only !== undefined && only.type === 'Text' && typeof only.data === 'string') {
    return only.data;
  }
  throw new IdentityError(
    'unreadable-id',
    `the id of ${where} is not a plain text literal (bare, expression or multi-part) — it cannot be validated for verbatim adoption`,
  );
}

/* ── the adoption journal ─────────────────────────────────────────────── */

/** one adoption as journal truth: bare id, readable path (§1), tag name, provenance */
export interface AdoptionEntry {
  readonly id: string;
  readonly path: string;
  readonly component: string;
  readonly adopted: 'verbatim' | 'generated';
}

/** the ingest result: rewritten source, adoption journal, derived ledger */
export interface IngestIdsResult {
  readonly source: string;
  readonly journal: readonly AdoptionEntry[];
  readonly ledger: PageLedger;
}

/**
 * Adopt or mint EVERY component's native id in one source text — the
 * whole html fragment subtree, recursively (B5). Pure over its inputs
 * (the ledger is copied, the source never mutated in place): identical
 * `(source, ledger, path)` triples derive identical results — the P15
 * concurrent-duplicate-adoption contract.
 *
 * The skip-set is document-order seen-so-far (the frozen probe
 * semantics): a manual id LATER in the file that duplicates an
 * already-adopted value surfaces as duplicate-id when the walk reaches
 * it, never as a silent renumber.
 *
 * @throws IdentityError (illegal-id / duplicate-id / unreadable-id /
 *         letter-collision) — the admission layer's 409 surface. Svelte
 *         parse failures bubble up untyped, exactly as the probe's do.
 */
export function ingestIds(source: string, ledger: PageLedger, path: string): IngestIdsResult {
  // derive, never mutate — forks of one snapshot stay independent
  const pages = new Map(ledger.pages);
  const counters = new Map(ledger.counters);

  let letter = pages.get(path);
  if (letter === undefined) {
    const derived = pageLetter(pages.size);
    for (const [heldBy, existing] of pages) {
      if (existing === derived) {
        throw new IdentityError(
          'letter-collision',
          `page letter "${derived}" for ${path} is already held by ${heldBy} — the ledger lost pages; letters must never be re-derived over a shrunken ledger`,
        );
      }
    }
    letter = derived;
    pages.set(path, letter);
  }
  if (!counters.has(letter)) counters.set(letter, 0);
  let highWater = counters.get(letter)!;

  // default (legacy) parse; the walk then covers the WHOLE fragment
  // subtree recursively — B5: every nested usage is adoptable
  const ast = parseSvelte(source) as unknown as { html?: { children?: readonly unknown[] } };
  const magic = new MagicString(source);
  const journal: AdoptionEntry[] = [];
  const present = new Set<string>(); // id values seen so far in THIS file

  const adoptComponent = (node: ComponentNode): void => {
    const raw = idLiteralOf(
      node.attributes?.find((a) => a.type === 'Attribute' && a.name === 'id'),
      `<${node.name}> in ${path}`,
    );
    if (raw !== undefined) {
      // verbatim adoption — a legal manual name is a stable identity
      if (!htmlLegalId(raw)) {
        throw new IdentityError(
          'illegal-id',
          `existing id must be html-legal (non-empty, no whitespace): ${JSON.stringify(raw)} on <${node.name}> in ${path}`,
        );
      }
      if (present.has(raw)) {
        throw new IdentityError('duplicate-id', `duplicate id in file: ${raw} on <${node.name}> in ${path}`);
      }
      present.add(raw);
      const schemeNumber = schemeNumberOf(letter, raw);
      if (schemeNumber !== undefined && schemeNumber > highWater) {
        highWater = schemeNumber;
        counters.set(letter, highWater);
      }
      journal.push({ id: raw, path, component: node.name, adopted: 'verbatim' });
      return;
    }
    // generate: high-water + 1, skipping any id value already present
    // (defensive anti-collision — scheme-conforming manual ids have
    // already raised the high-water past themselves)
    let counter = highWater + 1;
    while (present.has(`${letter}${counter}`)) counter += 1;
    const id = `${letter}${counter}`;
    highWater = counter;
    counters.set(letter, highWater);
    present.add(id);
    // inject right after the tag name — valid for self-closing,
    // multi-line and child-carrying tags alike (the prop-edit law)
    magic.appendLeft(node.start + 1 + node.name.length, ` id="${id}"`);
    journal.push({ id, path, component: node.name, adopted: 'generated' });
  };

  /** pre-order DFS over one fragment — components yield BEFORE their subtree */
  const walkFragment = (nodes: readonly unknown[]): void => {
    for (const node of nodes) {
      if (isComponentNode(node)) adoptComponent(node);
      descend(node);
    }
  };

  /** the frozen fragment containers: children + the block-branch keys */
  const descend = (value: unknown): void => {
    if (value === null || typeof value !== 'object') return;
    const node = value as FragmentNode;
    if (Array.isArray(node.children)) walkFragment(node.children);
    // IfBlock else-branches (ElseBlock chains elseif as nested IfBlock
    // inside its own children — the generic walk covers the chain)
    if (node.type === 'IfBlock' && node.else != null && typeof node.else === 'object') descend(node.else);
    if (node.type === 'AwaitBlock') {
      descend(node.pending);
      descend(node.then);
      descend(node.catch);
    }
  };

  walkFragment(ast.html?.children ?? []);

  return { source: magic.toString(), journal, ledger: { pages, counters } };
}
