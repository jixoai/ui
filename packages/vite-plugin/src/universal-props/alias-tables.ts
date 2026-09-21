/**
 * @jixoai/ui-vite-plugin (universal-props) — the plugin-layer alias
 * tables (explicit-props W2 tasks 2.1 + 2.4, design §12/§15.5,
 * 2026-09-21).
 *
 * Orthogonal intents:
 *   1. the QUERY SCALE TABLES — the registered viewport/container
 *      vocabularies of §9 (key grammar frozen in §9.1's type block;
 *      the THRESHOLD VALUES are plugin alias entries per §15.5 — same
 *      remap rights as any named alias). One source for the desugarer,
 *      the shim and the css generator; the kernel engine
 *      (apps/www/src/lib/universal-props-query.svelte.ts) mirrors the
 *      same constants — the kernel lib cannot depend on this package
 *      (a registry consumer installs lib files only), so the two
 *      tables cite each other and the §9.1 block pins the KEY SETS
 *      (a missing/extra key is a test failure on both sides).
 *   2. the AXIS ALIAS VALUE TABLES — the defaults the generated
 *      universal-props.css defines as `--jx-<axis>-<alias>` vars (the
 *      §12 var-indirection law: a named step NEVER inlines its value
 *      at a use site; a plugin remap = overriding the var, zero
 *      runtime resolver). `auto` and the number lane are RESERVED
 *      LITERALS (§0/§12 Owner ruling) — validateAliasTables() rejects
 *      any table that tries to remap them, at GENERATION time.
 *   3. the §14 CAPABILITY LADDER data — the corner-shape verdict's
 *      per-shape radius factors + the shape alias degrade map (§2's
 *      frozen table), consumed by generate-css.ts and by the two
 *      absorbed component probes (press-effect-runtime, avatar).
 *   4. the MOTION MAP (task 2.4) — motion-intensity → per-kernel
 *      curve/duration presets over the EXISTING kernels
 *      (surface-motion 460ms linear, press pulse 2500ms / ripple
 *      600ms / shimmer 4000ms, the SMIL loaders' authored dur
 *      attributes). Map, don't reinvent: every `normal` row is the
 *      kernel's own default verbatim; the other rows scale it.
 *
 * Owner original demand: openspec/changes/explicit-props W2.
 */

// ── 1. the query scale tables (§9/§9.1/§15.5) ─────────────────────

/** §9.1's ViewportScale, with the §15.5 threshold values (rem). */
export const VIEWPORT_SCALE = {
  xs: 30,
  sm: 40,
  md: 48,
  lg: 64,
} as const satisfies Record<string, number>;

/**
 * §9.1's ContainerScale, with the --container-* values (rem) —
 * Tailwind v4's own default container scale, grep-verified against
 * the shipped 4.3.3 bundle (research/tailwind-container-syntax.md:
 * 3xs 16 · 2xs 18 · xs 20 · sm 24 · md 28 · lg 32 · xl 36).
 */
export const CONTAINER_SCALE = {
  '3xs': 16,
  '2xs': 18,
  xs: 20,
  sm: 24,
  md: 28,
  lg: 32,
  xl: 36,
} as const satisfies Record<string, number>;

export type ViewportScaleName = keyof typeof VIEWPORT_SCALE;
export type ContainerScaleName = keyof typeof CONTAINER_SCALE;

/** §9's key grammar, parsed: media bare / container @-prefixed,
 *  named container as `@<scale>/<name>` (size first — Tailwind v4's
 *  own order; the name segment must be NON-EMPTY, §9's `@md/` rule). */
export interface ParsedQueryKey {
  readonly kind: 'media' | 'container';
  /** the registered scale token (xs/sm/md/lg…), WITHOUT the @ */
  readonly scale: string;
  /** the threshold in rem (from the scale tables above) */
  readonly minWidthRem: number;
  /** the container name for `@sm/card`; undefined for bare keys */
  readonly containerName: string | undefined;
}

/**
 * Parse one §9 query key. Returns null for keys outside the grammar
 * (unknown scale name, malformed @-prefix) — callers turn that into
 * the `unknown-scale` diagnostic; the EMPTY container name
 * (`@md/`) is returned as a distinct fatal marker so the desugarer
 * can raise §9's parse-time build ERROR naming the key and the rule.
 */
export function parseQueryKey(key: string): ParsedQueryKey | 'empty-container-name' | null {
  if (!key.startsWith('@')) {
    const minWidthRem = (VIEWPORT_SCALE as Record<string, number | undefined>)[key];
    if (minWidthRem === undefined) return null;
    return { kind: 'media', scale: key, minWidthRem, containerName: undefined };
  }
  const body = key.slice(1);
  const slash = body.indexOf('/');
  const scale = slash === -1 ? body : body.slice(0, slash);
  const containerName = slash === -1 ? undefined : body.slice(slash + 1);
  if (containerName !== undefined && containerName === '') return 'empty-container-name';
  const minWidthRem = (CONTAINER_SCALE as Record<string, number | undefined>)[scale];
  if (minWidthRem === undefined) return null;
  return { kind: 'container', scale, minWidthRem, containerName };
}

/**
 * The REGISTERED-SCALE ORDER (§9's semantics bullet): keys sort
 * narrow → wide by threshold; at the SAME width media sorts before
 * container (later source order wins, so the container block
 * overrides where both match — the ancestor-nesting intuition; a
 * genuine tie needs a §15.5 threshold remap — the DEFAULT viewport
 * and container tables share no value). This is the single ordering
 * law shared by the desugarer's css emission and the runtime
 * engine's case evaluation.
 */
export function compareQueryKeyOrder(
  a: { kind: 'media' | 'container'; minWidthRem: number },
  b: { kind: 'media' | 'container'; minWidthRem: number },
): number {
  if (a.minWidthRem !== b.minWidthRem) return a.minWidthRem - b.minWidthRem;
  const ka = a.kind === 'container' ? 1 : 0;
  const kb = b.kind === 'container' ? 1 : 0;
  return ka - kb;
}

export function compareQueryKeys(a: string, b: string): number {
  const pa = parseQueryKey(a);
  const pb = parseQueryKey(b);
  if (pa === null || pa === 'empty-container-name') return pb === null || pb === 'empty-container-name' ? 0 : 1;
  if (pb === null || pb === 'empty-container-name') return -1;
  return compareQueryKeyOrder(pa, pb);
}

// ── 2. the axis alias value tables (§12 var-indirection) ──────────

/** the reserved literals no alias table may remap (§0/§12). */
export const RESERVED_ALIAS_KEYS: readonly string[] = ['auto'];

/** §0.1's number lanes, by spelling — a purely-numeric alias key is
 *  the number lane itself (exact-value escape), never a name. */
const isNumericAliasKey = (key: string): boolean => key !== '' && !Number.isNaN(Number(key));

/** an alias key is legal only when it is a plain name: not `auto`,
 *  not a number spelling (the reserved literals, §0). */
export function isValidAliasKey(key: string): boolean {
  return !RESERVED_ALIAS_KEYS.includes(key) && !isNumericAliasKey(key);
}

/**
 * The §12 alias-schema gate, run at GENERATION time (and from the
 * test battery): every table row must key on a legal alias name.
 * A remap of `auto` or of a number is a RESERVED-LITERAL violation —
 * the error names the axis, the key and the rule.
 */
export function validateAliasTable(axis: string, keys: readonly string[]): void {
  for (const key of keys) {
    if (RESERVED_ALIAS_KEYS.includes(key)) {
      throw new Error(
        `[universal-props] axis '${axis}': '${key}' is a RESERVED LITERAL (design §0/§12 — inherit/exact-value escape) and SHALL NOT be remapped`,
      );
    }
    if (isNumericAliasKey(key)) {
      throw new Error(
        `[universal-props] axis '${axis}': '${key}' is the NUMBER lane (design §0.1 exact-value escape) and SHALL NOT be remapped as an alias`,
      );
    }
  }
}

/**
 * The default alias VALUES the generated sheet defines. Sizes are px
 * (§0.1: root font-size); the ladder brackets the sheet base —
 * small 14 · medium 16 (the base) · large 18, each remappable by
 * overriding the var (§12 — a remap is a tiny consumer sheet).
 */
export const SIZE_ALIASES = {
  small: '14px',
  medium: '16px',
  large: '18px',
} as const;

/**
 * Radius alias values (px, §0.1). 8px is the theme's own bevel
 * baseline (jixoai.css's corner-shape upgrade pins --radius to 8px);
 * 6/8/10 is avatar's shipped sm/md/lg bevel ladder — every rung
 * anchored in-repo, none invented.
 */
export const RADIUS_ALIASES = {
  small: '6px',
  medium: '8px',
  large: '10px',
} as const;

/**
 * Color alias values — plain var() references into the theme sheet
 * (§5's resolution order semantic > palette > raw is NAME resolution;
 * the VALUE lane is always the theme token; the hue number lane and
 * raw lane never touch this table). `warn` maps the theme's
 * `--warning` spelling (the lane literal is `warn`, §0.1).
 */
export const COLOR_ALIASES = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  error: 'var(--error)',
  warn: 'var(--warning)',
  success: 'var(--success)',
  info: 'var(--info)',
} as const;

/**
 * §5's hue formula per theme profile — the oklch L/C/drift triples
 * VERBATIM from the theme's own --primary declarations (light:
 * oklch(0.6489 0.237 H); dark: oklch(0.7044 0.1872 calc(H - 4))).
 * The generated vars carry these; the runtime number-lane stamp
 * (defaults.svelte.ts) composes
 * `oklch(var(--jx-color-formula-l, 0.6489) var(--jx-color-formula-c, 0.237)
 * calc(<hue> + var(--jx-color-formula-drift, 0)))` — the inline
 * fallbacks are LOAD-BEARING (§3's law: the composition stays valid
 * computed-value time even where this sheet is absent).
 */
export const COLOR_FORMULA_PROFILES = {
  light: { l: '0.6489', c: '0.237', drift: '0' },
  dark: { l: '0.7044', c: '0.1872', drift: '-4' },
} as const;

// ── 3. the §14 capability ladder data (corner-shape verdict) ──────

/**
 * §2's frozen degrade table as ladder data: per shape, the
 * corner-shape keyword the alias resolves to when the capability is
 * SUPPORTED vs DEGRADED. round|square are themselves; squircle →
 * round; scoop|bevel|notch → square.
 */
export const SHAPE_LADDER = {
  round: { supported: 'round', degraded: 'round' },
  scoop: { supported: 'scoop', degraded: 'square' },
  bevel: { supported: 'bevel', degraded: 'square' },
  notch: { supported: 'notch', degraded: 'square' },
  square: { supported: 'square', degraded: 'square' },
  squircle: { supported: 'squircle', degraded: 'round' },
} as const;

/**
 * The per-shape radius factors (§14 — "the ladder — per-shape
 * factors, NOT one global factor"): the family border-radius
 * composes calc(var(--jx-radius-effective, 0px) *
 * var(--jx-radius-factor-effective, 1)) and the resolved shape picks
 * its factor var, so the squircle ×2 law (§2) and its degrade
 * REVERSAL are pure var composition. The degraded factors implement
 * §2's table GEOMETRY: squircle degrades to round at ×1; scoop/
 * bevel/notch degrade to square by zeroing the radius (§3: square ⇒
 * the radius lane is inert — factor 0 is that law as a number);
 * square is 0 in BOTH branches (a resolved square is square corners
 * whatever the engine knows).
 */
export const RADIUS_FACTOR_LADDER = {
  round: { supported: 1, degraded: 1 },
  scoop: { supported: 1, degraded: 0 },
  bevel: { supported: 1, degraded: 0 },
  notch: { supported: 1, degraded: 0 },
  square: { supported: 0, degraded: 0 },
  squircle: { supported: 2, degraded: 1 },
} as const;

// ── 4. the motion map (task 2.4 — intensity, not duration) ────────

/** §8's named intensities as coefficient carriers (the css vars
 *  --jx-motion-<name> stamp --jx-motion-effective; the number lane is
 *  the coefficient verbatim). reduced = 0: §8's root bridge rides
 *  prefers-reduced-motion, and a 0 coefficient reads as "no motion
 *  energy" for every kernel below. */
export const MOTION_ALIASES = {
  reduced: '0',
  subtle: '0.5',
  normal: '1',
  expressive: '1.5',
} as const;

/** the per-kernel duration presets one intensity maps onto. Every
 *  `normal` value is the kernel's own shipped default VERBATIM
 *  (surface-motion.ts DURATION_MS 460; press-effect-runtime/
 *  press-button.svelte pulse 2500 / ripple 600 / shimmer 4000) —
 *  the map scales them, it never re-invents them. `smilPeriodScale`
 *  multiplies the SMIL loaders' authored dur attributes (spin-set
 *  members carry their own 0.6s..9s periods; the map scales, never
 *  rewrites). `surfaceMotionJump` = §8's reduced law: the lifecycle
 *  jumps to its end instantly (surface-motion's own reduced path). */
export interface MotionKernelPreset {
  /** surface-motion panel timeline duration, ms (0 = jump to end) */
  readonly surfaceMotionMs: number;
  /** press ripple ink expansion, ms (0 = suppress the ink) */
  readonly rippleMs: number;
  /** press pulse sonar period, ms (0 = suppress) */
  readonly pulseMs: number;
  /** press shimmer sweep period, ms (0 = suppress) */
  readonly shimmerMs: number;
  /** SMIL loader period multiplier (0 = freeze) */
  readonly smilPeriodScale: number;
}

export const MOTION_KERNEL_PRESETS: Readonly<Record<keyof typeof MOTION_ALIASES, MotionKernelPreset>> = {
  reduced: { surfaceMotionMs: 0, rippleMs: 0, pulseMs: 0, shimmerMs: 0, smilPeriodScale: 0 },
  subtle: { surfaceMotionMs: 690, rippleMs: 900, pulseMs: 3750, shimmerMs: 6000, smilPeriodScale: 1.5 },
  normal: { surfaceMotionMs: 460, rippleMs: 600, pulseMs: 2500, shimmerMs: 4000, smilPeriodScale: 1 },
  expressive: { surfaceMotionMs: 345, rippleMs: 450, pulseMs: 1875, shimmerMs: 3000, smilPeriodScale: 0.75 },
};

/**
 * The duration/period SCALE the number lane rides — one piecewise
 * law, anchored on the named rows (calmer = longer, quieter sweeps;
 * livelier = snappier; 0 and 2 collapse to the reduced jump):
 *   c 0 · 0.5 · 1 · 1.5 · 2  →  scale 0 · 1.5 · 1 · 0.75 · 0
 * Every named preset row above IS its kernel base × this scale —
 * the battery pins the agreement, so the table and the number lane
 * can never drift apart.
 */
const MOTION_SCALE_KNOTS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.5, 1.5],
  [1, 1],
  [1.5, 0.75],
  [2, 0],
];

export function motionDurationScale(coefficient: number): number {
  const c = Math.max(0, Math.min(2, coefficient));
  for (let i = 1; i < MOTION_SCALE_KNOTS.length; i += 1) {
    const [c0, s0] = MOTION_SCALE_KNOTS[i - 1]!;
    const [c1, s1] = MOTION_SCALE_KNOTS[i]!;
    if (c <= c1) {
      const t = c1 === c0 ? 1 : (c - c0) / (c1 - c0);
      return s0 + (s1 - s0) * t;
    }
  }
  return 0;
}

/**
 * The NUMBER lane of the motion map: a coefficient maps onto kernel
 * presets by scaling each kernel's own base with the knot law above.
 * The named rows are the same law evaluated at 0/0.5/1/1.5 (the
 * table stays the single shipped truth; this function serves every
 * other coefficient — the battery pins the anchor agreement).
 */
export function motionPresetForCoefficient(coefficient: number): MotionKernelPreset {
  if (!Number.isFinite(coefficient)) {
    throw new Error('[universal-props] motion coefficient must be a finite number');
  }
  const scale = motionDurationScale(coefficient);
  return {
    surfaceMotionMs: Math.round(460 * scale),
    rippleMs: Math.round(600 * scale),
    pulseMs: Math.round(2500 * scale),
    shimmerMs: Math.round(4000 * scale),
    smilPeriodScale: Number(scale.toFixed(2)),
  };
}

// ── the aggregate validation entry (generation-time §2.1 gate) ─────

/** validate EVERY default alias table at once — generate-css.ts calls
 *  this before emitting a byte (a reserved-literal remap anywhere
 *  kills the generation, never ships). */
export function validateAliasTables(): void {
  validateAliasTable('size', Object.keys(SIZE_ALIASES));
  validateAliasTable('radius', Object.keys(RADIUS_ALIASES));
  validateAliasTable('color', Object.keys(COLOR_ALIASES));
  validateAliasTable('motion', Object.keys(MOTION_ALIASES));
  validateAliasTable('shape', Object.keys(SHAPE_LADDER));
  validateAliasTable('query.viewport', Object.keys(VIEWPORT_SCALE));
  validateAliasTable('query.container', Object.keys(CONTAINER_SCALE));
}
