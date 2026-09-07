/**
 * @jixoai/ui-vite-plugin (icons library) — the named-icon face's types (A1,
 * openspec icon-component-pipeline design §1; channels: icon-channel-api
 * design §0/§1, 2026-09-07).
 *
 * The library face answers "what can `<Icon name=…>` render"; the slot
 * face (providers/serializer) answers "what image does a CSS var hold".
 * They share the safety checker and the I/O discipline — nothing else.
 * The types here are the ONLY surface the pure generator and the two
 * adapters (vite + root script) share; the type split between
 * IconSource (config, unresolved) and ResolvedLibraryIcon (generator
 * input) makes I/O smuggling through the pure core untypeable.
 */

import type { IconChannel } from './channel/types.js';

// ── sources ────────────────────────────────────────────────────────

/**
 * where one named icon's artwork comes from. the ADAPTER resolves every
 * variant to a complete `<svg>…</svg>` string before the pure generator
 * ever sees it (design §5):
 *   - a plain string is an inline SVG literal
 *   - `{ file }` is a .svg path — the plugin owns ALL file I/O (frozen
 *     principle #4: loaded through the provider-context machinery,
 *     joined to watchFile for HMR)
 *   - a prefixed ref string (`lucide:zap`, `md:home`, `rx:system:add-line`,
 *     `myco:logo`) resolves ONE icon from a CHANNEL at build time —
 *     the channel node-resolves the peer's ABSOLUTE svg path
 *     (channel/peer.ts) or rides the lucide IconNode lane, and the
 *     plugin still READS it through the provider context
 *     (icon-channel-api design §0/§1; the prefix must be ENABLED:
 *     `lucide` ∪ `library.channels`' prefixes)
 *   - `{ font, code }` / `{ font, liga }` extracts ONE glyph outline from
 *     a font file at build time into fill-nature artwork (design §2 —
 *     the runtime artifact stays pure SVG; fonts never reach the
 *     browser through this lane)
 */
export type IconSource =
  | string
  | { readonly file: string }
  | `lucide:${string}`
  | `md:${string}`
  | `ph:${string}`
  | `rx:${string}`
  | { readonly font: string; readonly code: number }
  | { readonly font: string; readonly liga: string };

// ── options ────────────────────────────────────────────────────────

/** knobs for the build-time svgo pass (design §2). the tuned preset
 *  itself is law (pinned as a no-op on lucide's canonical
 *  serialization) — only the precision is consumer-tunable. */
export interface OptimizeConfig {
  /** float precision for numeric attribute cleanup (default 3 — the
   *  PATH_DECIMALS precedent) */
  readonly floatPrecision?: number;
}

/** `jixoai({ icons: { library } })` — the named-icon face (design §1) */
export interface IconLibraryOptions {
  /** include the 38 built-in lucide manifest (default true). `false`
   *  with no `lucide:` sources never touches the lucide import at all */
  readonly includeDefaults?: boolean;
  /** register icon channels — each contributes a prefixed ref form
   *  (`md:home`, `myco:logo`) resolving ONE icon from the channel's
   *  optional peer package at build time. Channel instances come from
   *  `defineIconChannel` (…/icons/channel) or the shipped factories
   *  (…/icons/md · …/icons/ph · …/icons/rx); lucide needs NO entry
   *  (it is the default-registered channel). Enabled prefixes =
   *  `lucide` ∪ channels' prefixes; referencing a disabled or unknown
   *  prefix is a named config error listing the enabled set
   *  (channel/normalize.ts) */
  readonly channels?: readonly IconChannel[];
  /** add + override icons (same name = override; names match
   *  /^[a-z][A-Za-z0-9]*$/). custom icons pack after the built-ins in
   *  config insertion order */
  readonly icons?: Readonly<Record<string, IconSource>>;
  /** max serialized entry bytes per chunk module (default 20480, RAW
   *  non-gzip module bytes — key + payload inside the chunk) */
  readonly maxChunkBytes?: number;
  /** 'auto' (default) = budgeted chunks; 'single' = one chunk (不拆) */
  readonly chunking?: 'auto' | 'single';
  /** inline chunk 0 in the artifact (default true) so the default case
   *  is synchronously importable; false = the all-lazy escape hatch */
  readonly inlineFirstChunk?: boolean;
  /** artifact write target, project-root-relative — ONLY used when
   *  `write` is on (consumer apps). default 'src/lib/icon-set.gen.ts' */
  readonly output?: string;
  /** default false — the vite adapter serves virtual chunks and
   *  drift-warns; it never writes unless a consumer opts in. in THIS
   *  repo the root gen:icons script is the ONLY writer (the
   *  single-writer law, design §1) */
  readonly write?: boolean;
  /** run svgo over every icon after the raw safety check (default
   *  true). never runs on the slot/CSS face */
  readonly optimize?: boolean | OptimizeConfig;
}

// ── the pure core's input ──────────────────────────────────────────

/**
 * one library icon FULLY resolved by the adapter: the complete,
 * safety-checked, optimized `<svg>…</svg>` string. this — never
 * IconSource — is what the pure generator accepts; the adapter owns
 * every side effect and every I/O boundary (design §5).
 */
export interface ResolvedLibraryIcon {
  readonly name: string;
  readonly svg: string;
}

// ── extraction + packing ───────────────────────────────────────────

/**
 * the structured payload the artifact stores per icon (design §2/§6).
 * root attrs are NOT stored — the component re-owns the `<svg>` root;
 * only the viewBox (`v`), the artwork nature (`n`) and the children
 * inner-HTML (`d`, where lucide's fill-dot child overrides survive)
 * cross the boundary into `{@html}`.
 */
export interface IconData {
  /** the viewBox string, e.g. '0 0 24 24' */
  readonly v: string;
  /** stroke-based artwork paints currentColor strokes; fill-based fills */
  readonly n: 'fill' | 'stroke';
  /** the root's children, serialized to inner-HTML */
  readonly d: string;
}

/** packing knobs the pure generator accepts (a subset of
 *  IconLibraryOptions — sources/write/output are adapter concerns).
 *
 *  The prefix-compiler extensions (icon-prefix-compiler B1/B2, codex r1
 *  B3/purity): the generator receives only RESOLVED assets plus
 *  name/alias/equivalence/template METADATA — never raw scan output.
 *  All default absent, so every pre-existing caller keeps compiling
 *  and produces byte-identical output. */
export interface IconPackingOptions {
  readonly maxChunkBytes?: number;
  readonly chunking?: 'auto' | 'single';
  readonly inlineFirstChunk?: boolean;
  /**
   * alias → canonical, the `as` indirection table (resolveLibraryInputs
   * builds it from the scanned stream after the collision matrix; {}
   * / absent = no aliases). The payload packs ONCE under the canonical
   * key; lookups deref aliases — and the full `md:x as y` literal —
   * first (codex r1 B1/B4/M4).
   */
  readonly aliases?: Readonly<Record<string, string>>;
  /**
   * the manifest-collision table (icon-channel-api design §1): scanned
   * `lucide:X` whose `X` is ALREADY packed dedupes into a row
   * `lucide:X` → `X` here — ONE payload, canonical-only counts. The
   * table is COMPILER-GENERATED ONLY: keys are full prefixed names,
   * exempt from the `as`-alias grammar and the collision matrix BY
   * CONSTRUCTION (aliases cannot contain `:` — alias↔key collision is
   * impossible, no error case exists). `canonicalOf` chains ALIASES
   * then EQUIVALENCES, so an alias on a deduped ref
   * (`lucide:check as c2`) resolves c2 → `lucide:check` → `check`.
   */
  readonly equivalences?: Readonly<Record<string, string>>;
  /**
   * the ENABLED channel prefixes (`lucide` ∪ the registered channels')
   * — each contributes a `` `${prefix}:${string}` `` template-literal
   * member to the IconName union (compile-tier prefix safety;
   * prefixes not enabled contribute NO member). Fed by BOTH adapters
   * from their normalized configs.
   */
  readonly templatePrefixes?: readonly string[];
}

/** what the generator reports back (MEASURED acceptance numbers come
 *  from real output of this report — never from documentation) */
export interface LibraryReport {
  /** number of icons that survived resolution + safety */
  readonly iconCount: number;
  /** number of chunks packed */
  readonly chunkCount: number;
  /** serialized entry bytes per icon (the budget unit) */
  readonly perIconBytes: Readonly<Record<string, number>>;
  /** summed entry bytes per chunk index */
  readonly chunkBytes: ReadonlyMap<number, number>;
  /** chunk indexes the artifact imports virtually (the LAZY map) */
  readonly lazyChunks: readonly number[];
  /** oversized-own-chunk + resolution-drop warnings, in order */
  readonly warnings: readonly string[];
}
