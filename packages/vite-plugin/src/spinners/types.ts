/**
 * @jixoai/ui-vite-plugin (spinners) — the svg-spinner face's types (P1,
 * openspec spin-ora-svg-lane design §5).
 *
 * ONE face, much simpler than the icons library: no chunks, no
 * channels, no scanner, no virtual modules, no CSS face. The types
 * here are the ONLY surface the pure generator and the two adapters
 * (vite + root script) share; the split between SpinnerSource
 * (config, unresolved) and ResolvedSpinner (generator input) makes
 * I/O smuggling through the pure core untypeable — the icons'
 * library/types.ts discipline, carried over verbatim in miniature.
 */

// ── sources ────────────────────────────────────────────────────────

/**
 * where one named svg spinner's artwork comes from. the ADAPTER
 * resolves every variant to a complete `<svg>…</svg>` string before
 * the pure generator ever sees it (design §5):
 *   - a plain string is an inline SVG literal (SMIL `<animate>`
 *     content included — the byte-faithful payload)
 *   - `{ file }` is a .svg path — the adapters own ALL file I/O
 */
export type SpinnerSource = string | { readonly file: string };

// ── options ────────────────────────────────────────────────────────

/**
 * `jixoai({ spinners })` — the svg-spinner face (design §5).
 * Default false/undefined at the UMBRELLA level = the feature is OFF.
 * A bare `{}` IS a legal configuration: includeDefaults defaults to
 * true, so it means "blocks-wave only" (spinners have ONE face — the
 * icons ≥1-of-2 matrix error deliberately does not apply).
 */
export interface SpinnersPluginOptions {
  /** include the vendored blocks-wave manifest (default true). `false`
   *  with no custom spinners packs the empty set */
  readonly includeDefaults?: boolean;
  /** add + override spinners (same name = override; names match
   *  /^[a-z][a-z0-9-]*$/, the kebab grammar of the icon channel ids).
   *  custom spinners pack after the built-ins in config insertion
   *  order */
  readonly spinners?: Readonly<Record<string, SpinnerSource>>;
  /** artifact write target, project-root-relative — ONLY used when
   *  `write` is on (consumer apps). default 'src/lib/spin-set.gen.ts' */
  readonly output?: string;
  /** default false — the vite adapter drift-warns, never writes; in
   *  THIS repo the root gen:spins script is the ONLY writer (the
   *  single-writer law, design §5) */
  readonly write?: boolean;
}

// ── the pure core's input ──────────────────────────────────────────

/**
 * one spinner FULLY resolved by the adapter: the complete,
 * safety-checked, RAW `<svg>…</svg>` string (svgo NEVER runs on this
 * lane — design §5/§8). this — never SpinnerSource — is what the pure
 * generator accepts; the adapter owns every side effect and every I/O
 * boundary.
 */
export interface ResolvedSpinner {
  readonly name: string;
  readonly svg: string;
}

// ── extraction ─────────────────────────────────────────────────────

/**
 * the structured payload the artifact stores per spinner (design §3,
 * the icons IconData shape verbatim). root attrs are NOT stored — the
 * component re-owns the `<svg>` root; only the viewBox (`v`), the
 * artwork nature (`n`) and the children inner-HTML (`d`, where the
 * SMIL `<animate>` elements ride byte-faithful) cross the boundary
 * into `{@html}`.
 */
export interface SpinData {
  /** the viewBox string, e.g. '0 0 24 24' */
  readonly v: string;
  /** fill-nature artwork fills currentColor; stroke-nature strokes */
  readonly n: 'fill' | 'stroke';
  /** the root's children, serialized to inner-HTML (byte-faithful) */
  readonly d: string;
}

// ── the report ─────────────────────────────────────────────────────

/** what the generator reports back (MEASURED acceptance numbers come
 *  from real output of this report — never from documentation) */
export interface SpinnersReport {
  /** number of spinners that survived resolution + safety */
  readonly spinnerCount: number;
  /** adapter-side resolution warnings, in order (the generator itself
   *  never warns — no packing tier exists on this lane) */
  readonly warnings: readonly string[];
}
