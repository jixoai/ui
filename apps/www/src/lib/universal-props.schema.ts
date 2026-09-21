/**
 * jixoai universal props — the ONE shared artifact
 * (registry/files/lib/universal-props.schema.ts, explicit-props W1
 * task 1.9, 2026-09-21).
 *
 * Types + frozen data ONLY — zero imports, zero runtime behavior, so
 * both trees (apps/www/src/lib + registry/files/lib, the byte-mirror
 * law) and the metadata generator (which transpiles this module to
 * read UNIVERSAL_AXES from the single source) load it whole. The
 * SLOT implementations ship from the kernel lib (defaults.svelte.ts,
 * task 1.4); the query() implementation is W2 (§9.1); the plugin
 * alias VALUES are W2's tables — this file carries the CONTRACT.
 *
 * Contract statuses (design §18): the §17 interfaces + UNIVERSAL_AXES
 * rows and the §9.1 type block are FROZEN — binding, complete,
 * placeholder-free; waves implement them verbatim. The density alias
 * table (§4, Codex r5 B6) and the elevation dp table (§0.1) are FROZEN
 * data this artifact hosts as the single source (density.svelte.ts and
 * defaults.svelte.ts derive their normalizers from them, never
 * re-declare).
 */

// ===== design §17 — the meta/IR pipeline interfaces (FROZEN) ==========
// (embedded interface text FROZEN per §18; the ir.ts type addition and
// the canvas consumers are W4's wiring)

// universal-props.schema.ts — the ONE shared artifact (www + registry mirror)
export interface UniversalAxisDoc {
  axis: 'size' | 'shape' | 'radius' | 'density' | 'color' | 'theme' | 'elevation' | 'motion';
  label: string;                       // PropsTable display
  description: string;                 // one-line docs prose
  namedSteps: readonly string[];       // the DOCUMENTED vocabulary
  numberUnit: 'px' | 'coefficient' | 'dp' | 'hue' | null;
  rawLane: boolean;                    // color only, true
}
// The shipped rows, verbatim (§0.1 is the source; labels/descriptions are
// the curated docs strings, editable ONLY here):
export const UNIVERSAL_AXES: readonly UniversalAxisDoc[] = [
  { axis: 'size',      label: 'Size',      description: 'the base scale — root font-size; parts size in em',            namedSteps: ['small', 'medium', 'large'],   numberUnit: 'px',         rawLane: false },
  { axis: 'shape',     label: 'Shape',     description: 'corner geometry (CSS corner-shape; §14 degrade table)',        namedSteps: ['round', 'scoop', 'bevel', 'notch', 'square', 'squircle'], numberUnit: null, rawLane: false },
  { axis: 'radius',    label: 'Radius',    description: 'corner size; auto = the concentric broadcast (§3)',            namedSteps: ['small', 'medium', 'large'],   numberUnit: 'px',         rawLane: false },
  { axis: 'density',   label: 'Density',   description: 'spacing/leading scale over the kernel channels (§4)',          namedSteps: ['small', 'medium', 'large'],   numberUnit: 'coefficient', rawLane: false },
  { axis: 'color',     label: 'Color',     description: 'the hue axis of the fixed oklch primary system (§5)',           namedSteps: ['primary', 'secondary', 'error', 'warn', 'success', 'info'], numberUnit: 'hue', rawLane: true },
  { axis: 'theme',     label: 'Theme',     description: 'light/dark profile; system = the JS-mutable global (§6)',       namedSteps: ['light', 'dark', 'system'],    numberUnit: null,         rawLane: false },
  { axis: 'elevation', label: 'Elevation', description: 'official M3 levels over the surface ladder (§7)',              namedSteps: ['level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5'], numberUnit: 'dp', rawLane: false },
  { axis: 'motion',    label: 'Motion',    description: 'intensity across the motion kernels (§8)',                     namedSteps: ['reduced', 'subtle', 'normal', 'expressive'], numberUnit: 'coefficient', rawLane: false },
];

// ===== design §9.1 — the query()/slot type block (FROZEN) =============
// ONE standalone-compilable FROZEN block, transcribed VERBATIM (the
// declare-function lines are the SIGNATURE contract; the real slot
// implementations ship from defaults.svelte.ts with these exact
// signatures, and query() lands with the W2 desugarer — nothing here
// is exported at runtime).

// the public API (ships from the kernel lib) — ONE standalone-compilable
// FROZEN block (Codex r8 B2; the const-object inference is VERIFIED by
// tsc: mixed named/number cases compile, invalid lanes are rejected):
type ViewportScale = 'xs' | 'sm' | 'md' | 'lg';                        // the registered default table
type ContainerScale = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // the --container-* scale
export type QueryKey = ViewportScale | `@${ContainerScale}` | `@${ContainerScale}/${string}`;
type RawCases = { readonly [K in QueryKey]?: string | number };
type QueryCase<T> = readonly [key: QueryKey, value: T];
type QueryResult<T> = { readonly $query: true; readonly cases: readonly QueryCase<T>[]; readonly base: T | undefined };
declare function query<const O extends RawCases, const B extends string | number = never>(cases: O, base?: B): QueryResult<O[keyof O] | B>;

// the eight lane types (§0.1) + the slot signatures:
type SizeLane      = 'small' | 'medium' | 'large' | 'auto' | number;
type ShapeLane     = 'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto';
type RadiusLane    = 'small' | 'medium' | 'large' | 'auto' | number;
type DensityLane   = 'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number;
type ColorLane     = 'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string; // string = raw/plugin names — closed at BUILD by the registration table
type ThemeLane     = 'light' | 'dark' | 'system' | 'auto';
type ElevationLane = 'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number;
type MotionLane    = 'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number;
interface AxisSlotResult<T> { readonly explicit: T; readonly ambient: boolean }
declare function sizeSlot(explicit: SizeLane | QueryResult<SizeLane>, own?: SizeLane): AxisSlotResult<SizeLane>;
declare function shapeSlot(explicit: ShapeLane | QueryResult<ShapeLane>, own?: ShapeLane): AxisSlotResult<ShapeLane>;
declare function radiusSlot(explicit: RadiusLane | QueryResult<RadiusLane>, own?: RadiusLane): AxisSlotResult<RadiusLane>;
declare function densitySlot(explicit: DensityLane | QueryResult<DensityLane>, own?: DensityLane): AxisSlotResult<DensityLane>;
declare function colorSlot(explicit: ColorLane | QueryResult<ColorLane>, own?: ColorLane): AxisSlotResult<ColorLane>;
declare function themeSlot(explicit: ThemeLane | QueryResult<ThemeLane>, own?: ThemeLane): AxisSlotResult<ThemeLane>;
declare function elevationSlot(explicit: ElevationLane | QueryResult<ElevationLane>, own?: ElevationLane): AxisSlotResult<ElevationLane>;
declare function motionSlot(explicit: MotionLane | QueryResult<MotionLane>, own?: MotionLane): AxisSlotResult<MotionLane>;

// the frozen block above stays verbatim; the module surface for
// consumers (the slot implementations in defaults.svelte.ts, the W2
// query()/desugarer, the W4 canvas) re-exports the declared names:
export type {
  ViewportScale,
  ContainerScale,
  RawCases,
  QueryCase,
  QueryResult,
  SizeLane,
  ShapeLane,
  RadiusLane,
  DensityLane,
  ColorLane,
  ThemeLane,
  ElevationLane,
  MotionLane,
  AxisSlotResult,
};

// ===== design §4 r5 B6 — the density named-alias table (FROZEN) ======
// The DOCUMENTED vocabulary maps VERBATIM onto three of the existing
// rungs: small → sm · medium → default · large → lg. `xs` and `2xs`
// (with sm/default/lg themselves) remain directly addressable — the
// plugin's default alias table (W2) registers all eight names; the
// five legacy spellings keep working with ZERO migration (§13). The
// rung scopes themselves are UNCHANGED (§4: the kernel channels
// --jx-gap/--jx-stack/--jx-inset/--jx-hit/… stay as they are).
export const DENSITY_NAMED_ALIASES = {
  small: 'sm',
  medium: 'default',
  large: 'lg',
} as const;

// ===== design §0.1 — the elevation level table (FROZEN) ===============
// The Owner's explicit mapping: level${-1~5} = M3's level0..level5
// with one prepended concave rung (−1dp: inset shadow + the surface
// below base, §7). level-1 → −1dp · level0 → 0dp · level1 → 1dp ·
// level2 → 3dp · level3 → 6dp · level4 → 8dp · level5 → 12dp.
export const ELEVATION_DP = {
  'level-1': -1,
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
} as const;
