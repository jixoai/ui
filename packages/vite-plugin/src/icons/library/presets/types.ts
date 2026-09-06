/**
 * @jixoai/vite-plugin (icons library presets) — the preset contract
 * (A1, openspec icon-library-presets design §1).
 *
 * A preset is ONE installed icon library reachable through a prefixed
 * reference form (`md:home`) usable wherever IconSource strings are.
 * `resolveFile` deliberately returns the peer package's ABSOLUTE svg
 * path — never resolved icon data: the post-pipeline
 * ResolvedLibraryIcon shape would contradict the shared pipeline. The
 * ADAPTER (resolve.ts) reads that path through ctx.loadSource (mime law
 * + watchFile HMR reuse, exactly like `{file}` sources) and runs the
 * shared RAW safety → svgo → structural-validation pipeline.
 */

/** the preset ids this plugin ships (the registry lives in index.ts) */
export type IconPresetId = 'material' | 'phosphor' | 'remix';

/**
 * one ENABLED preset instance — what `library.presets` normalizes into.
 * Built by the per-preset factories (material.ts / phosphor.ts /
 * remix.ts); already-normalized instances pass through normalization
 * untouched (idempotence for the double normalize the vite adapter
 * performs).
 */
export interface IconPreset {
  /** the preset id (`library.presets` entries select by it) */
  readonly id: IconPresetId;
  /** the reference namespace: `md:home` / `ph:atom` / `rx:system:add-line` */
  readonly prefix: 'md' | 'ph' | 'rx';
  /** the optional peer to install — named in every loud-fail error */
  readonly peerPackage: string;
  /**
   * the ref (text after `prefix:`) → the peer package's ABSOLUTE svg
   * path via node resolution (peer.ts). throws the named
   * install-hint / not-found errors
   */
  readonly resolveFile: (ref: string) => string;
  /** the frozen default mapping, human-readable (weight/style/fill) */
  readonly defaultsNote: string;
}

// ── config forms (IconLibraryOptions.presets entries) ──────────────

/** `presets: [{ id: 'material', … }]` — the material knobs (A2).
 *  weight/style/fill are frozen defaults (outlined / 400 / FILL 0);
 *  grade/opsz exist only in the variable FONT, not the SVG packages */
export interface MaterialPresetOptions {
  readonly id: 'material';
  /** the SVG package weight (default 400 → @material-symbols/svg-400) */
  readonly weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** the style directory (default 'outlined') */
  readonly style?: 'outlined' | 'rounded' | 'sharp';
  /** FILL 1 variant: the `-fill` filename suffix (default false = FILL 0) */
  readonly fill?: boolean;
}

/** `presets: [{ id: 'phosphor', weight }]` (A3). default regular */
export interface PhosphorPresetOptions {
  readonly id: 'phosphor';
  /** assets/<weight>/ directory (default 'regular') */
  readonly weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

/** `presets: [{ id: 'remix' }]` (A3) — remixicon carries no knobs */
export interface RemixPresetOptions {
  readonly id: 'remix';
}

/** one `library.presets` entry: the string shorthand (= frozen
 *  defaults) or the object form with the preset's knobs */
export type IconPresetOption =
  | IconPresetId
  | MaterialPresetOptions
  | PhosphorPresetOptions
  | RemixPresetOptions;
