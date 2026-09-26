// §9.1 fixture — the NEGATIVE face (explicit-props W2 task 2.5).
// The FROZEN §9.1 type block VERBATIM from design.md §9.1 (the spec
// of record; byte-pinned by the battery's lockstep test against the
// design doc itself) followed by INVALID-LANE usages: the slot checks
// the case-value union ⊆ the lane, so an invalid lane literal in a
// slot call is a COMPILE error naming the literal. THIS FILE MUST
// FAIL under --strict (the runner asserts tsc exit ≠ 0 AND the error
// names the invalid literal).

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

// ── the invalid lanes (each must REJECT — §9.1 "invalid lanes are
// rejected") ───────────────────────────────────────────────────────

const bad1 = sizeSlot(query({ sm: 'invalid' }));
void bad1;
const bad2 = densitySlot(query({ md: 'compact' }, 'sm'));
void bad2;
