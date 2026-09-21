/**
 * jixoai defaults tool (registry/files/lib/defaults.svelte.ts,
 * context-defaults-economy task 1.1, 2026-09-03).
 *
 * The TOOL layer of the Defaults seam — the organization layer around
 * context reads, not a new foundation (design.md 定位). Compose's
 * CardDefaults translated to Svelte 5: each component family ships ONE
 * `defineComponentDefaults({ ...slots })` contract object; a slot is a
 * branded callable resolving `explicit ?? ambient ?? own` when the
 * consumer's `$derived` window evaluates `XxxDefaults.resolve({...})`.
 *
 * Orthogonal intents:
 *   1. brand — a module-private unique symbol (declare-const type twin
 *      + Symbol value twin, the kernel BRAND idiom): only this
 *      module's factories construct a DefaultsSlot
 *   2. dual guard — the type brand PLUS a factory-product WeakSet: a
 *      reflection copy carries the brand but misses the registration,
 *      so defineComponentDefaults rejects cast-forged and
 *      marker-copied slots at contract construction. The runtime half
 *      runs IN DEV ONLY (`import.meta.env?.DEV`, D3-B): the type
 *      brand is the production contract, and vitest runs under vite
 *      with DEV=true so the guard stays test-observed
 *   3. the ONE construction entry — defineAxisSlot(name, resolve):
 *      the axis factories (definePaintSlot/densitySlot, task 1.2) and
 *      the literal family factories below all route through it; the AST
 *      gate pins the identifier to registry/files/lib/** (this
 *      canonical tree — apps/www/src/lib is its byte mirror)
 *   4. the literal family, slot-values-first (D1) —
 *      defineLiteralSlot(values, own) / defineOpenSlot<T>(own) /
 *      absentSlot<T>() (absent IS the state; the output carries
 *      undefined). The values tuple is the TYPE SOURCE (OneOf): const
 *      generic inference replaces the explicit type argument —
 *      omitting either parameter, or a default outside the tuple, is
 *      a compile error (真·强制 by construction; the NoInfer/= never
 *      discipline is RETIRED for this factory). defineOpenSlot serves
 *      the open scalar domains (no closed union to enumerate) and
 *      keeps the absentSlot discipline: NoInfer + `= never` (TS ≥
 *      5.4) — the explicit type argument is the ONLY enforcement face.
 *
 * 惰性律: the TOOL layer (defineAxisSlot + the literal family —
 * everything above the universal-axis section at the bottom) reads
 * ZERO context and imports NOTHING — construction captures only
 * `own`; the ambient supply is the axis module's closure-held getter,
 * lazily evaluated at resolve time inside the consumer's component
 * window, never a snapshot and never a module-level read here. The
 * universal axis slots (explicit-props W1 1.4, §9.1/§11) extend the
 * same law to a seam that DOES read context: those reads happen only
 * inside the slot call, only for the axis being resolved — still
 * never at module level, still always inside the consumer's window.
 * The window is a HARD CONTRACT (D3-C): outside component
 * initialisation Svelte's own lifecycle_outside_component propagates
 * — never caught, never message-matched. The byte mirror installs
 * whole, zero burden.
 */

import {
  DENSITY_NAMED_ALIASES,
  ELEVATION_DP,
  UNIVERSAL_AXES,
  type AxisSlotResult,
  type ColorLane,
  type DensityLane,
  type ElevationLane,
  type MotionLane,
  type QueryResult,
  type RadiusLane,
  type ShapeLane,
  type SizeLane,
  type ThemeLane,
  type UniversalAxisDoc,
} from './universal-props.schema';
import { getContext, setContext } from 'svelte';

declare const jxSlot: unique symbol;
const SLOT_BRAND = Symbol('jx-defaults-slot') as typeof jxSlot;

/**
 * A Defaults slot: `(explicit) => resolved`. Constructible only by the
 * factories in this module and the axis modules — the brand field is
 * unnameable outside (the type-level half of the guard); the WeakSet
 * below is the runtime half.
 */
export interface DefaultsSlot<T> {
  (explicit: T | undefined): T;
  readonly [jxSlot]: 'defaults-slot';
}

/**
 * The runtime half of the dual guard: every defineAxisSlot product
 * registers here exactly once, at construction. Registration is
 * identity-based, not copyable — a marker-copied or cast-forged slot
 * misses the set even when the brand marker is present. The check
 * runs in dev only (D3-B); the type brand carries production.
 */
const SLOT_REGISTRY = new WeakSet<object>();

/**
 * The ONE construction entry — the cross-module construction protocol
 * (design X3-1/X4-1, signature frozen): every slot (the axis module
 * factories of task 1.2 and the literal family factories below) is
 * built, branded and WeakSet-registered here, once, at axis module
 * load.
 *
 * Resolver protocol: `ambient` is the axis module's closure-held
 * getter — lazy and getter-endorsed, so reads land in the consumer's
 * $derived dependency graph. This module itself reads no context
 * (惰性律), so the getter it hands the resolver is the permanently
 * silent one; an axis wanting real ambient supply closes its own
 * context-reading getter over the resolver. The window is a hard
 * contract (D3-C): outside component initialisation the axis getter's
 * lifecycle error propagates out of the slot call — never caught,
 * never re-entered, never normalized.
 *
 * NOT a public API — the AST gate asserts this identifier appears only
 * under registry/files/lib/**. `name` is the diagnostic identity error
 * messages and the gate report cite from one source (it rides the
 * product's function name).
 */
export function defineAxisSlot<T>(
  name: string,
  resolve: (explicit: T | undefined, ambient: () => T | undefined) => T,
): DefaultsSlot<T> {
  const silentAmbient = (): T | undefined => undefined;
  const slot = (explicit: T | undefined): T => resolve(explicit, silentAmbient);
  // the brand lands through Object.defineProperty (TS 5.9,
  // consumer-feedback-fixes P1-4): the computed unique-symbol key
  // widens inside Object.assign's inferred type (it types as a string
  // index, not the specific symbol prop), so the branded result cannot
  // be asserted back to DefaultsSlot — defineProperty stamps the same
  // field with identical runtime effect (the brand is read by type only;
  // nothing enumerates the slot)
  const branded = slot as DefaultsSlot<T>;
  Object.defineProperty(branded, SLOT_BRAND, { value: 'defaults-slot' });
  Object.defineProperty(branded, 'name', { value: name });
  SLOT_REGISTRY.add(branded);
  return branded;
}

/**
 * The element union of a values tuple — values IS the type source
 * (slot-values-first D1): `defineLiteralSlot(['tonal', 'outline'],
 * 'tonal')` declares the family union with no separate type
 * declaration. Scalar three-state domain: string / number / boolean
 * (booleans are a closed domain and take the values form —
 * `defineLiteralSlot([false, true], false)`).
 */
export type OneOf<T extends readonly (string | number | boolean)[]> = T[number];

/**
 * The literal family, closed-domain form (slot-values-first D1,
 * replacing the retired literalSlot(own) form): the values tuple is
 * the type source — const generic inference recovers the union
 * (`ReturnType<typeof slot>` for the family's one declaration
 * source), and `defaultValue: OneOf<T>` locks default ∈ values at
 * COMPILE time. NoInfer + `= never` enforcement is retired here:
 * omission of either parameter cannot compile, so no explicit type
 * argument exists to demand. `values` is the type/gate carrier ONLY
 * — the runtime ignores it (the D3-A 法 extension: no runtime
 * value-domain guard exists), so the resolver is byte-identical to
 * the retired literalSlot's `explicit ?? own`. Ambient capability is
 * pending a future axis, so the slot NEVER reads context. Output
 * carries NO undefined: defineLiteralSlot(['solid', 'auto'], 'auto')
 * resolves the element union.
 */
export function defineLiteralSlot<const T extends readonly (string | number | boolean)[]>(
  values: T,
  defaultValue: OneOf<T>,
): DefaultsSlot<OneOf<T>> {
  return defineAxisSlot('literal', (explicit) => explicit ?? defaultValue);
}

/**
 * The literal family, open-domain form ([B1]: no closed union to
 * enumerate — sheet size is a free CSS length, chart size /
 * navigation-menu inset are free numbers): same `explicit ?? own`
 * resolve and the same 'literal' axis name, but the value domain
 * cannot ride a values tuple, so the explicit type argument is the
 * ONLY enforcement face — NoInfer + `= never` true enforcement, the
 * absentSlot discipline (TS ≥ 5.4: omitting the type argument leaves
 * T at never and the call is a compile error, never a fallback; the
 * constraint rejects nullish owns — undefined is the ONLY sentinel).
 * The day an open axis closes its union it migrates back to the
 * values form.
 */
export function defineOpenSlot<T extends string | number | boolean = never>(
  own: NoInfer<T>,
): DefaultsSlot<T> {
  return defineAxisSlot('literal', (explicit) => explicit ?? own);
}

/**
 * The literal family, absent-meaningful form: absence IS the state
 * (native/unset rendering) — no own, and the resolved value may BE
 * undefined so the component renders its absent-state path. No
 * parameters → no NoInfer leverage; the explicit type argument is
 * enforced by the AST gate (typeArguments.length > 0). Output carries
 * undefined: `absentSlot<SurfaceVariant>()` resolves
 * `SurfaceVariant | undefined`.
 */
export function absentSlot<T extends {}>(): DefaultsSlot<T | undefined> {
  return defineAxisSlot('absent', (explicit) => explicit);
}

/**
 * The never-args constraint (design X-1 — no `any`): any branded slot
 * satisfies it structurally while bare functions and bare literals
 * fail the brand.
 */
type AnyBrandedSlot = ((...args: never[]) => unknown) & { readonly [jxSlot]: string };

/**
 * Build a family's Defaults contract — the family's SINGLE declared
 * ambient contract (one `*Defaults` object per family). `resolve`
 * takes a Partial over the slots' explicit parameters and returns a
 * FRESH plain object of the resolved values, never frozen (consumers
 * destructure per slot — the whole object never amplifies derived
 * recomputation); `slots` is the shallow-frozen contract surface a
 * reviewer audits (exactly the key set, split by slot kind).
 *
 * Runtime guard (dev-only, D3-B): every slot must be a factory
 * product (the WeakSet) — a miss throws the fixed message below, so
 * cast-forged and marker-copied slots die HERE, at contract
 * construction, never inside a component's resolve window. In
 * production the type brand alone carries the contract (the
 * optional chain keeps non-vite environments load-safe).
 */
export function defineComponentDefaults<S extends Record<string, AnyBrandedSlot>>(
  slots: S,
): {
  resolve(partial: { [K in keyof S]?: Parameters<S[K]>[0] }): { [K in keyof S]: ReturnType<S[K]> };
  readonly slots: S;
} {
  if (import.meta.env?.DEV) {
    for (const key of Object.keys(slots) as (keyof S & string)[]) {
      if (!SLOT_REGISTRY.has(slots[key])) {
        throw new Error('[defaults] slots accept factory products only');
      }
    }
  }
  return {
    resolve(partial) {
      const resolved = {} as { [K in keyof S]: ReturnType<S[K]> };
      for (const key of Object.keys(slots) as (keyof S & string)[]) {
        // double assertion (TS 5.9): the slot's contravariant parameter
        // fails the single-assertion overlap check — through unknown the
        // callable shape is recovered without weakening DefaultsSlot
        const slot = slots[key] as unknown as (explicit: unknown) => unknown;
        resolved[key] = slot(partial[key]) as {
          [K in keyof S]: ReturnType<S[K]>;
        }[keyof S & string];
      }
      return resolved;
    },
    slots: Object.freeze(slots),
  };
}

// ---- the universal axis slots (explicit-props W1 1.4, §9.1/§11) -------
//
// The eight-axis seam of the explicit-props contract: REAL slot
// implementations carrying the FROZEN §9.1 signatures (the schema
// module holds the verbatim type block; these are its runtime twin —
// same names, same lanes, same AxisSlotResult). Resolution is the
// fleet law verbatim: `explicit ?? ambient ?? own`, every axis
// defaulting to 'auto' (§0.1) — an `auto` resolution stamps NOTHING
// (「无意见不盖章」: the ambient carriers keep flowing through the CSS
// cascade, §10). The ambient channel is one Svelte context per axis
// under the §11 key `jx.<axis>` — STRING keys (the table's literal
// spellings); verify-context-coverage's axisContextKeys pins these
// constants by identifier, so a family bypassing the seam with a
// direct `getContext(SIZE_KEY)` is an A3 finding.
//
// Channel note (density): §11's density row says `jx.density`
// "(today's)" — today's LEGACY channel (density.svelte.ts's
// DENSITY_KEY symbol, resolveDensity, the plugin chain) keeps serving
// the ~60 migrated consumers untouched; this seam's density lane
// rides the string key because importing the legacy channel here
// would close a module CYCLE (density.svelte.ts constructs its slot
// through defineAxisSlot at module-eval time — a cycle hits
// SLOT_BRAND's TDZ and dies at load). The channels bridge as
// families migrate (W3); the LAW (explicit ?? ambient ?? own, no
// opinion no stamp) is identical on both.
//
// The 惰性律 holds here too: no module-level context reads — the
// ambient read happens inside the slot call, which lands in the
// consumer's component window (the hard window contract D3-C); the
// payload is getter-endorsed so reads land in the consumer's
// $derived dependency graph (the provideDensity/providePaintZone
// precedent — a parent flip re-derives the child in the same frame).

/** the eight §11 Svelte context keys, one per axis (literal strings). */
export const SIZE_KEY = 'jx.size';
export const SHAPE_KEY = 'jx.shape';
export const RADIUS_KEY = 'jx.radius';
export const UNIVERSAL_DENSITY_KEY = 'jx.density';
export const COLOR_KEY = 'jx.color';
export const THEME_KEY = 'jx.theme';
export const ELEVATION_KEY = 'jx.elevation';
export const MOTION_KEY = 'jx.motion';

/** §17's axis-name union, derived from the schema's doc interface. */
export type UniversalAxisName = UniversalAxisDoc['axis'];

/** the lane type of each axis — the provideAxisLane/§11 supply domain. */
export interface UniversalLaneMap {
  readonly size: SizeLane;
  readonly shape: ShapeLane;
  readonly radius: RadiusLane;
  readonly density: DensityLane;
  readonly color: ColorLane;
  readonly theme: ThemeLane;
  readonly elevation: ElevationLane;
  readonly motion: MotionLane;
}

const AXIS_CONTEXT_KEYS: Readonly<Record<UniversalAxisName, string>> = {
  size: SIZE_KEY,
  shape: SHAPE_KEY,
  radius: RADIUS_KEY,
  density: UNIVERSAL_DENSITY_KEY,
  color: COLOR_KEY,
  theme: THEME_KEY,
  elevation: ELEVATION_KEY,
  motion: MOTION_KEY,
};

/**
 * The ambient payload: getter-endorsed (reads land in the consumer's
 * $derived dependency graph — never a snapshot). `lane` undefined =
 * the provider passes NO opinion down (the DensityContext.precedent:
 * the write still shadows deeper providers; resolution treats it
 * exactly like a missing context).
 */
interface AxisLaneContext<T> {
  readonly lane: T | undefined;
}

function readAxisLane<T>(key: string): T | undefined {
  return getContext<AxisLaneContext<T> | undefined>(key)?.lane;
}

/**
 * The §11 broadcast supply: write one axis' resolved lane downward.
 * Getter-backed, so `provideAxisLane('size', () => sizeResult.explicit)`
 * keeps a parent re-resolution re-deriving every consumer in the same
 * frame. Supply the RESOLVED lane; a resolved 'auto' is a no-opinion
 * (the fleet law recommends the family simply NOT supply in that
 * case — this helper stores whatever it is given verbatim, matching
 * provideDensity's shadowing semantics).
 */
export function provideAxisLane<K extends keyof UniversalLaneMap>(
  axis: K,
  lane: () => UniversalLaneMap[K] | undefined,
): void {
  setContext(AXIS_CONTEXT_KEYS[axis], {
    get lane() {
      return lane();
    },
  });
}

/**
 * A query() carrier resolves to its unconditional `base` lane — the
 * §9 SSR-first-paint semantics (a correct-if-unresponsive first
 * paint; the responsive desugarer + shim land with W2's query()).
 * Plain lanes pass through untouched.
 */
function unwrapQueryLane<T>(lane: T | QueryResult<T> | undefined): T | undefined {
  if (typeof lane === 'object' && lane !== null && '$query' in lane) {
    return (lane as QueryResult<T>).base;
  }
  return lane as T | undefined;
}

/**
 * The shared resolver: `explicit ?? ambient ?? own` with the per-axis
 * default folded in by the caller (every axis defaults 'auto', §0.1).
 * `ambient: true` marks a value resolved from the ambient context
 * (the §9.1 field is frozen — `explicit` carries the RESOLVED lane,
 * whatever lane it came from).
 */
function resolveAxisLane<T>(
  key: string,
  explicit: T | QueryResult<T> | undefined,
  own: T,
): AxisSlotResult<T> {
  const direct = unwrapQueryLane(explicit);
  if (direct !== undefined) return { explicit: direct, ambient: false };
  const ambientLane = readAxisLane<T>(key);
  if (ambientLane !== undefined) return { explicit: ambientLane, ambient: true };
  return { explicit: own, ambient: false };
}

/**
 * The density named-alias normalization (§4 r5 B6, single source =
 * the schema's DENSITY_NAMED_ALIASES): small→sm · medium→default ·
 * large→lg; the five legacy spellings, `auto` and the coefficient
 * number lane pass through verbatim.
 */
const DENSITY_ALIAS_LOOKUP: Readonly<Partial<Record<string, DensityLane>>> = DENSITY_NAMED_ALIASES;

function normalizeDensityLane(lane: DensityLane): DensityLane {
  return typeof lane === 'string' ? (DENSITY_ALIAS_LOOKUP[lane] ?? lane) : lane;
}

/** the size axis slot (§1): root font-size; `auto` = inherit the context. */
export function sizeSlot(
  explicit: SizeLane | QueryResult<SizeLane>,
  own?: SizeLane,
): AxisSlotResult<SizeLane> {
  return resolveAxisLane(SIZE_KEY, explicit, own ?? 'auto');
}

/** the shape axis slot (§2): corner geometry; `auto` = inherit. */
export function shapeSlot(
  explicit: ShapeLane | QueryResult<ShapeLane>,
  own?: ShapeLane,
): AxisSlotResult<ShapeLane> {
  return resolveAxisLane(SHAPE_KEY, explicit, own ?? 'auto');
}

/** the radius axis slot (§3): corner size; `auto` = the concentric broadcast. */
export function radiusSlot(
  explicit: RadiusLane | QueryResult<RadiusLane>,
  own?: RadiusLane,
): AxisSlotResult<RadiusLane> {
  return resolveAxisLane(RADIUS_KEY, explicit, own ?? 'auto');
}

/**
 * The density axis slot (§4): spacing/leading over the kernel
 * channels. Named lanes normalize onto the five rungs (the legacy
 * spellings and the documented vocabulary are the same axis);
 * `auto` = exactly today's inherit law.
 */
export function densitySlot(
  explicit: DensityLane | QueryResult<DensityLane>,
  own?: DensityLane,
): AxisSlotResult<DensityLane> {
  const resolved = resolveAxisLane(UNIVERSAL_DENSITY_KEY, explicit, normalizeDensityLane(own ?? 'auto'));
  return { explicit: normalizeDensityLane(resolved.explicit), ambient: resolved.ambient };
}

/** the color axis slot (§5): semantic > palette > raw; `auto` = inherit. */
export function colorSlot(
  explicit: ColorLane | QueryResult<ColorLane>,
  own?: ColorLane,
): AxisSlotResult<ColorLane> {
  return resolveAxisLane(COLOR_KEY, explicit, own ?? 'auto');
}

/** the theme axis slot (§6): light/dark/system; `auto` = tree inheritance. */
export function themeSlot(
  explicit: ThemeLane | QueryResult<ThemeLane>,
  own?: ThemeLane,
): AxisSlotResult<ThemeLane> {
  return resolveAxisLane(THEME_KEY, explicit, own ?? 'auto');
}

/** the elevation axis slot (§7): official M3 levels over the surface ladder. */
export function elevationSlot(
  explicit: ElevationLane | QueryResult<ElevationLane>,
  own?: ElevationLane,
): AxisSlotResult<ElevationLane> {
  return resolveAxisLane(ELEVATION_KEY, explicit, own ?? 'auto');
}

/** the motion axis slot (§8): intensity, not duration; `auto` = inherit. */
export function motionSlot(
  explicit: MotionLane | QueryResult<MotionLane>,
  own?: MotionLane,
): AxisSlotResult<MotionLane> {
  return resolveAxisLane(MOTION_KEY, explicit, own ?? 'auto');
}

// ---- the §11 carrier stamp (static strings per render) ----------------
//
// The carrier law (§10): every axis value resolves to a CSS
// expression stamped on the component root as INLINE STYLE vars —
// static strings within a render (SSR-safe; a runtime context change
// re-renders and re-stamps, the reactive-density precedent). Named
// steps NEVER inline their value: they resolve through the §12
// var-indirection `var(--jx-<axis>-<alias>)` — the kernel/plugin CSS
// owns the values, a remap is a var override, zero runtime resolver.
// An `auto` (or absent) resolution stamps NOTHING for that axis — the
// ambient carriers keep flowing (no opinion no stamp; §3's concentric
// calc and §1's inherit are the CONSUMPTION compositions in family
// CSS, W3's wiring). Theme never stamps a var (§11: the existing
// `.dark` class bridge is its carrier) and density's rung scope rides
// the `data-density` attribute half (the template, W3) — this util
// emits the STYLE-string half only. ZERO class identities (§10).

/** the per-axis resolved lanes stampCarriers accepts (all optional). */
export interface UniversalCarriers {
  readonly size?: AxisSlotResult<SizeLane>;
  readonly shape?: AxisSlotResult<ShapeLane>;
  readonly radius?: AxisSlotResult<RadiusLane>;
  readonly density?: AxisSlotResult<DensityLane>;
  readonly color?: AxisSlotResult<ColorLane>;
  readonly theme?: AxisSlotResult<ThemeLane>;
  readonly elevation?: AxisSlotResult<ElevationLane>;
  readonly motion?: AxisSlotResult<MotionLane>;
}

/** namedSteps per axis, derived from the ONE schema source (§17). */
const NAMED_STEPS: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  UNIVERSAL_AXES.map((doc): [string, readonly string[]] => [doc.axis, doc.namedSteps]),
);

const isNamedStep = (axis: UniversalAxisName, lane: string | number): boolean =>
  typeof lane === 'string' && (NAMED_STEPS[axis]?.includes(lane) ?? false) === true;

/**
 * Emit the §11 carrier declarations for the resolved lanes as ONE
 * inline style string (declarations joined by '; ', deterministic
 * §0 axis order). '' when nothing stamps (all auto/absent) — the
 * family then binds no style attr for this surface.
 */
export function stampCarriers(results: UniversalCarriers): string {
  const decls: string[] = [];

  const size = results.size?.explicit;
  if (size !== undefined && size !== 'auto') {
    // §11: the carrier is --jx-size-effective (font-size + the var);
    // §1: children size via em — ONE number moves a family
    const value = typeof size === 'number' ? `${size}px` : `var(--jx-size-${size})`;
    decls.push(`--jx-size-effective: ${value}`, 'font-size: var(--jx-size-effective, 1rem)');
  }

  const shape = results.shape?.explicit;
  if (shape !== undefined && shape !== 'auto') {
    // §14's frozen consumption chain: the resolved shape picks the
    // alias AND the per-shape radius factor (the squircle ×2 law and
    // its degrade reversal ride the factor vars, never branches)
    decls.push(
      `--jx-shape-effective: var(--jx-shape-${shape})`,
      `--jx-radius-factor-effective: var(--jx-radius-factor-${shape})`,
    );
  }

  const radius = results.radius?.explicit;
  if (radius !== undefined && radius !== 'auto') {
    // §3: a resolved radius SUPPLIES --jx-radius-effective; auto is
    // the concentric CONSUMPTION calc in family CSS (max(0px,
    // calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective,
    // 0px))) — the var() fallbacks are load-bearing), never a stamp
    const value = typeof radius === 'number' ? `${radius}px` : `var(--jx-radius-${radius})`;
    decls.push(`--jx-radius-effective: ${value}`);
  }

  const density = results.density === undefined ? undefined : normalizeDensityLane(results.density.explicit);
  if (density !== undefined && density !== 'auto') {
    // §4 precedence: a NAMED lane sets the rung scope (the
    // data-density attr, the template half) AND resets the
    // coefficient to 1 (explicit rung = exact rung, never
    // double-scaled); the NUMBER lane sets the coefficient and leaves
    // the rung ambient; auto stamps neither
    decls.push(`--jx-density-coefficient: ${typeof density === 'number' ? density : 1}`);
  }

  const color = results.color?.explicit;
  if (color !== undefined && color !== 'auto') {
    // §5 resolution order: semantic > palette > raw. Named → the §12
    // indirection; a non-named string is a RAW value (passthrough
    // verbatim — plugin names close at build, W2's table); a number
    // is HUE DEGREES through the primary formula oklch(L C calc(H ±
    // drift)) — the L/C/drift vars are the theme-profile contract
    // (task 1.3 / W2's alias tables define them; the fallbacks are
    // the light profile --primary triple, load-bearing per §3's law)
    const value = isNamedStep('color', color)
      ? `var(--jx-color-${color})`
      : typeof color === 'number'
        ? `oklch(var(--jx-color-formula-l, 0.6489) var(--jx-color-formula-c, 0.237) calc(${color} + var(--jx-color-formula-drift, 0)))`
        : `${color}`;
    decls.push(`--jx-color-effective: ${value}`);
  }

  // theme: NEVER a style var — §11's carrier is the existing .dark
  // class bridge (the boot-splash head-inline precedent); results.theme
  // is consumed by the family's class logic (W3)

  const elevation = results.elevation?.explicit;
  if (elevation !== undefined && elevation !== 'auto') {
    // §0.1's explicit mapping (level-1→-1 … level5→12, exact dp) —
    // ELEVATION_DP is the frozen single source; the number lane is
    // exact dp verbatim
    const value = typeof elevation === 'number' ? elevation : ELEVATION_DP[elevation];
    decls.push(`--jx-elevation-effective: ${value}`);
  }

  const motion = results.motion?.explicit;
  if (motion !== undefined && motion !== 'auto') {
    // §8: intensity — the number lane is the coefficient verbatim;
    // named steps resolve through the §12 indirection (the motion
    // map, W2's task 2.4, owns their intensity values)
    const value = typeof motion === 'number' ? `${motion}` : `var(--jx-motion-${motion})`;
    decls.push(`--jx-motion-effective: ${value}`);
  }

  return decls.join('; ');
}
