// §9.1 fixture — the POSITIVE face (explicit-props W2 task 2.5).
// The type block below is the FROZEN §9.1 text VERBATIM (the schema
// artifact's standalone-compilable block, universal-props.schema.ts
// lines 56–104 — re-verified byte-identical by the battery's lockstep
// pin); the usage lines assert the VERIFIED behavior the design
// records: mixed named/number cases + base compile through the
// const-object inference; unknown KEYS pass the type layer (the
// build-time key diagnostics own them — the layer split); every axis
// slot accepts its lane's QueryResult. THIS FILE MUST COMPILE under
// --strict (the runner asserts tsc exit 0).

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

// ── the verified behaviors (design §9.1 "Verified behavior") ──────

// mixed named/number cases + base compile (the design's own example)
const r1 = sizeSlot(query({ sm: 'small', '@md/card': 42 }, 'large'));
void r1;

// base-only and case-only forms
const r2 = sizeSlot(query({ lg: 'large' }));
void r2;
const r3 = radiusSlot(query({ '@sm': 'small' }));
void r3;

// every axis slot accepts its lane's QueryResult
void shapeSlot(query({ md: 'bevel' }, 'round'));
void densitySlot(query({ sm: 'sm', lg: 'lg' }, 'default'));
void colorSlot(query({ md: 'error' }, 'primary'));
void themeSlot(query({ md: 'dark' }));
void elevationSlot(query({ lg: 'level3' }, 'level0'));
void motionSlot(query({ md: 'expressive' }, 'normal'));

// number bases union into the lane
const q1 = query({ md: 16 }, 14);
void sizeSlot(q1);

// UNKNOWN KEYS pass the type layer — the build-time key diagnostics
// own them (the layer split: type=lanes, build=keys). Verified
// locally at W0 and re-verified by this fixture's runner probe.
const q2 = query({ badkey: 'small' });
void q2;
