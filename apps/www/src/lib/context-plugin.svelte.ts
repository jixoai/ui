/**
 * The ContextPlugin kernel (apps/www/src/lib/context-plugin.svelte.ts,
 * context-plugin-system, 2026-08-30) — every jixoai-ui Context object
 * (density / hue / any future def) can be intervened on by PLUGINS:
 * pure, immutable value transformers composed as Svelte reactive
 * projections. Reference shapes: vite plugins (registration order +
 * `enforce` anchors) and WebComponent paired lifecycles (outer mount /
 * inner unmount); the core technique is Svelte 5 reactivity — the
 * pipeline is composed `$derived` segments over one writable raw value,
 * so recomputation scope is a property of the dependency graph (a
 * dependency-count test asserts it; nothing here claims a perf number).
 *
 * THE MODEL (design.md r2):
 *
 *   rawValue                     the provider's ONLY writable `$state`
 *   init(defaults)               environment-free, one-time, FULL-value
 *                                reducer chain applied at instance
 *                                creation (plugin order, later covers
 *                                earlier — no shallow merge, no veto)
 *   filter(def, env)             the REVERSIBLE eligibility gate: false
 *                                excludes the plugin from this context
 *                                instance while the context stays
 *                                mounted (medium-gated plugins survive
 *                                screen→print→screen round-trips)
 *   before(value, env)           entry side, onion outer→inner
 *   after(value, env)            projection side, onion inner→outer
 *
 *   exposed = $derived( after(…( before(…( raw )))) )   — read-only
 *
 * ONION ORDER (Owner ruling): plugins resolve into layers by
 * (enforce-anchored, stable) order; `before` walks outer→inner
 * (array order), `after` walks inner→outer (reverse array order) —
 * `raw → beforeA → beforeB → value → afterB → afterA → consumer`.
 * The before side refines inward (later registrations process outer
 * results); the after side lets the FIRST registration have the final
 * word (the outer layer closes over every inner projection). Nested
 * roots compose one flat chain parent-first — the same law with the
 * parent root in the outer layer.
 *
 * REGISTRATION is root-scoped and stacks: `provideContextPlugins`
 * provides at a component root (nearest root's interventions land
 * last / innermost); there is NO module-level singleton registry. The
 * plugin chain a context consumes is whatever was visible when the
 * context INSTANCE was created (provide time); the composed chain is
 * built once per root (sorted, deduped, frozen) — resolves and gets
 * never recompose it.
 *
 * MEDIUM IS READ-ONLY: the medium context is environment truth, not an
 * opinion — `definePlugin` rejects a `'medium'` target at the type
 * level AND at runtime, and `provideContextPlugins` guards the same
 * registration path again (a cast-forged plugin cannot sneak in).
 *
 * SSR: no module-top-level window access. `env.root` is undefined and
 * `env.medium` is `'screen'` when no medium provider sits above the
 * plugin root (explicit initial values — the kernel never touches
 * window itself).
 *
 * DEPENDENCY LAW: zero npm dependencies (verification gate). The
 * density module — a byte-mirrored registry item that must keep
 * installing whole — does NOT import this file; it reads the scope
 * through the global symbol seam documented at PLUGIN_SCOPE_KEY below.
 */

import { getContext, setContext } from 'svelte';
import { getMedium, type MediumState } from './medium.svelte';

// ---- the type domain ---------------------------------------------------

/** A context's identity + default value contract. */
export interface ContextDef<K extends string, T> {
  /** stable identity: 'density' | 'hue' | … */
  readonly key: K;
  /** the value with no plugins and no provider */
  defaults(): T;
  /** the SSR / no-window value (the explicit server-side initial) */
  readonly ssrSafe: T;
}

/**
 * The reactive environment a plugin's filter/before/after read —
 * getter-endorsed so reads inside `$derived` segments land in the
 * dependency graph ("only affected segments recompute").
 */
export interface ContextEnv {
  /** the nearest medium provider's derived state; 'screen' without one */
  readonly medium: MediumState;
  /** the plugin root's host element (bind:this/action-supplied);
   *  undefined under SSR or when the root passed none */
  readonly root: HTMLElement | undefined;
}

export interface PluginHooks<K extends string, T> {
  /** environment-free one-time defaults injection — a FULL-value
   *  reducer factory applied in plugin order (string / number /
   *  object contexts alike; later plugins cover earlier ones) */
  init?(def: ContextDef<K, T>): (defaults: T) => T;
  /** the reversible eligibility gate: false excludes THIS plugin from
   *  the context instance while the context stays mounted */
  filter?(def: ContextDef<K, T>, env: ContextEnv): boolean;
  /** entry-side intervention (onion outer→inner) */
  before?(value: T, env: ContextEnv): T;
  /** projection-side intervention (onion inner→outer) */
  after?(value: T, env: ContextEnv): T;
}

/** The private brand: only `definePlugin` can construct a plugin —
 *  the unique symbol is unnameable outside this module, so object
 *  literals cannot forge the field (the type-level half of the guard;
 *  `provideContextPlugins` re-checks it at runtime). The runtime token
 *  below is the declared symbol's value twin, module-private. */
declare const defined: unique symbol;
const BRAND: typeof defined = Symbol('jx-defined-plugin') as unknown as typeof defined;

/** `definePlugin`'s product — `targets` frozen to the single context
 *  key, constructor private (brand field): the only registration
 *  currency a plugin root accepts. */
export interface DefinedPlugin<K extends string = string, T = unknown>
  extends PluginHooks<K, T> {
  readonly name: string;
  readonly targets: readonly [K];
  readonly enforce?: 'pre' | 'post';
  readonly [defined]: true;
}

/** the heterogeneous array element a root composes (structural view —
 *  runtime registration still demands the brand) */
export type UnknownPlugin = { readonly targets: readonly string[] } & Record<
  string,
  unknown
>;

/** what `definePlugin` accepts */
export interface PluginSpec<K extends string, T> extends PluginHooks<K, T> {
  readonly name: string;
  readonly targets: readonly [K];
  readonly enforce?: 'pre' | 'post';
}

/** the type-level 'medium' rejection message */
type MediumTargetRejected =
  'ERROR: the medium context is a read-only projection — plugins cannot target "medium"';

// ---- the registration entry --------------------------------------------

/**
 * The ONLY way a plugin comes to exist. `targets` is a single-key
 * tuple (K enters the generic), so a density plugin's targets type is
 * `readonly ['density']`; a `'medium'` target is rejected at compile
 * time (the error literal above arms) and again at runtime.
 */
export function definePlugin<const K extends string, T>(
  spec: PluginSpec<K, T> &
    (K extends 'medium' ? { readonly targets: MediumTargetRejected } : unknown),
): DefinedPlugin<K, T> {
  const targets = Object.freeze([...spec.targets]) as readonly [K];
  if ((targets as readonly string[]).includes('medium')) {
    throw new Error(
      '[context-plugin] the medium context is a read-only projection — plugins cannot target "medium"',
    );
  }
  const plugin: DefinedPlugin<K, T> = {
    name: spec.name,
    targets,
    ...(spec.enforce !== undefined ? { enforce: spec.enforce } : {}),
    ...(spec.init !== undefined ? { init: spec.init } : {}),
    ...(spec.filter !== undefined ? { filter: spec.filter } : {}),
    ...(spec.before !== undefined ? { before: spec.before } : {}),
    ...(spec.after !== undefined ? { after: spec.after } : {}),
    [BRAND]: true,
  };
  return Object.freeze(plugin);
}

// ---- sorting ------------------------------------------------------------

const ENFORCE_ANCHOR: Record<'pre' | 'post', number> = { pre: 0, post: 2 };

/**
 * Compose one root's plugin order: vite semantics — user array order
 * with stable 'pre'/'post' anchors (pre → unanchored → post, each
 * group keeping array order). Same-NAME plugins in one root collapse
 * to the LATER registration (warn); cross-root names never dedupe.
 * Pure: returns a new frozen array, input untouched.
 */
export function sortPlugins(plugins: readonly UnknownPlugin[]): readonly UnknownPlugin[] {
  const byName = new Map<string, UnknownPlugin>();
  for (const plugin of plugins) {
    const name = String(plugin.name);
    if (byName.has(name)) {
      console.warn(
        `[context-plugin] duplicate plugin name "${name}" in one root — the later registration wins`,
      );
    }
    // Map#set keeps the FIRST insertion slot with the LATER value: the
    // override lands where the name first stood in array order
    byName.set(name, plugin);
  }
  const anchored = [...byName.values()].map((plugin, index) => ({
    anchor:
      plugin.enforce === 'pre' || plugin.enforce === 'post'
        ? ENFORCE_ANCHOR[plugin.enforce]
        : 1,
    index,
    plugin,
  }));
  anchored.sort((a, b) => a.anchor - b.anchor || a.index - b.index);
  return Object.freeze(anchored.map((entry) => entry.plugin));
}

// ---- the scope (root-scoped registration + stacking) ---------------------

/**
 * The scope a plugin root provides: the composed chain (parent-first,
 * built once, frozen — the stable capture a context instance reads at
 * its creation) plus the shared env and the def-agnostic pure chain
 * application that brand-free context modules call through (see the
 * density seam note at PLUGIN_SCOPE_KEY).
 */
export interface PluginScope {
  /** parent-first composed plugin order (this root's sorted plugins last) */
  readonly chain: readonly UnknownPlugin[];
  readonly env: ContextEnv;
  /** pure chain application for one context def — identity when the
   *  chain holds no plugin targeting def.key */
  apply<T>(def: { readonly key: string }, value: T): T;
}

/**
 * The context key of the plugin scope. A GLOBAL symbol on purpose:
 * byte-mirrored registry modules (density) join this seam WITHOUT
 * importing this file (a registry item must keep installing whole —
 * registry zero-change, mirror byte-identity). The scope itself lives
 * in Svelte's per-root context map: root-scoped, stacking, never a
 * module-level singleton.
 */
export const PLUGIN_SCOPE_KEY = Symbol.for('jx-context-plugins');

export interface PluginRootOptions {
  /** the providing component's host element (bind:this / action
   *  supplied). Omitted or SSR → env.root stays undefined. */
  root?: HTMLElement;
}

/**
 * Provide a plugin root. Captures the nearest ancestor scope, appends
 * this root's sorted plugins (parent-first composition — the nearest
 * root's interventions land innermost/last), and freezes the result:
 * the composed chain is built ONCE here, never recomposed at resolve
 * or get time. The env captures the medium context visible above this
 * root (getter-endorsed → reactive inside derived segments) and the
 * root element.
 */
export function provideContextPlugins(
  plugins: readonly UnknownPlugin[],
  options: PluginRootOptions = {},
): PluginScope {
  // runtime registration guards (the type-level halves live in
  // definePlugin / DefinedPlugin): only branded products, never medium
  for (const plugin of plugins) {
    if (plugin === null || typeof plugin !== 'object' || !(BRAND in plugin)) {
      throw new Error(
        '[context-plugin] registration accepts definePlugin() products only — forge one with definePlugin',
      );
    }
    if (plugin.targets.includes('medium')) {
      throw new Error(
        `[context-plugin] plugin "${String(plugin.name)}" targets "medium" — the medium context is a read-only projection`,
      );
    }
  }

  const own = sortPlugins(plugins);
  const parent = getContextPlugins();
  const chain = Object.freeze(parent ? [...parent.chain, ...own] : [...own]);

  // env.medium: the medium context captured HERE (provide time). A
  // getter so every read lands in whichever derived reads it; absent
  // provider (SSR, or a root above every print-doc layer) → the
  // explicit 'screen' initial — never a window access.
  const mediumContext = getMedium();
  const env: ContextEnv = Object.freeze({
    get medium(): MediumState {
      return mediumContext ? mediumContext.medium : 'screen';
    },
    get root(): HTMLElement | undefined {
      return options.root;
    },
  });

  const scope: PluginScope = Object.freeze({
    chain,
    env,
    apply<T>(def: { readonly key: string }, value: T): T {
      return applyChain(def, value, chain, env);
    },
  });
  setContext(PLUGIN_SCOPE_KEY, scope);
  return scope;
}

/** The nearest plugin root's scope — undefined outside any root (the
 *  identity path). Safe outside component initialisation (pure unit
 *  calls: no scope, no chain, no hooks). */
export function getContextPlugins(): PluginScope | undefined {
  try {
    return getContext<PluginScope | undefined>(PLUGIN_SCOPE_KEY);
  } catch {
    // Svelte throws lifecycle_outside_component when no component
    // context exists — that is simply "no plugin root around"
    return undefined;
  }
}

// ---- the pure chain ------------------------------------------------------

type AnyHooks = PluginHooks<string, unknown>;

function hooksOf(plugin: UnknownPlugin): Partial<AnyHooks> {
  return plugin as Partial<AnyHooks>;
}

function eligible(plugin: UnknownPlugin, def: { readonly key: string }, env: ContextEnv): boolean {
  const filter = hooksOf(plugin).filter;
  return typeof filter === 'function' ? filter(def as never, env) !== false : true;
}

/**
 * The pure value pipeline for one context def — the kernel's whole
 * intervention semantics in one function (the $derived segments in
 * withPlugins and the density seam both ride it):
 *
 *   value → before chain (array order, gated) → after chain
 *           (reverse array order, gated) → result
 *
 * Zero plugins targeting the def → the IDENTITY fast path: the value
 * returns untouched and NO hook of any kind runs. Inputs are never
 * mutated, results never written back — plugins receive immutable
 * values and return new ones (their purity contract).
 */
export function applyChain<T>(
  def: { readonly key: string },
  value: T,
  chain: readonly UnknownPlugin[],
  env: ContextEnv,
): T {
  const targeting: UnknownPlugin[] = [];
  for (const plugin of chain) {
    if (plugin.targets.includes(def.key)) targeting.push(plugin);
  }
  if (targeting.length === 0) return value; // identity fast path

  let current = value;
  // before: onion outer→inner (composed order)
  for (const plugin of targeting) {
    if (!eligible(plugin, def, env)) continue;
    const before = hooksOf(plugin).before;
    if (typeof before === 'function') current = before(current, env) as T;
  }
  // after: onion inner→outer (reverse order)
  for (let i = targeting.length - 1; i >= 0; i--) {
    const plugin = targeting[i];
    if (!eligible(plugin, def, env)) continue;
    const after = hooksOf(plugin).after;
    if (typeof after === 'function') current = after(current, env) as T;
  }
  return current;
}

// ---- the stateful pipeline (contexts with a raw owner) --------------------

/** The intervention machinery around one writable raw value. */
export interface PluginPipeline<T> {
  readonly def: { readonly key: string };
  /** the plugins actually targeting this def, in composed order —
   *  EMPTY means the identity fast path armed (no chain built) */
  readonly targeting: readonly UnknownPlugin[];
  /** the ONLY writable value; chain results NEVER flow back here */
  readonly raw: T;
  setRaw(value: T): void;
  /** the read-only chained projection */
  readonly exposed: T;
}

const EMPTY_CHAIN: readonly UnknownPlugin[] = Object.freeze([]);

function applyInit<T>(def: { readonly key: string }, defaults: T, targeting: readonly UnknownPlugin[]): T {
  let value = defaults;
  for (const plugin of targeting) {
    const init = hooksOf(plugin).init;
    if (typeof init === 'function') {
      value = (init as (d: never) => (v: T) => T)(def as never)(value);
    }
  }
  return value;
}

/**
 * Build a context instance's pipeline: `init` reducers run ONCE over
 * the def's defaults (environment-free, plugin order), then the raw
 * `$state` feeds two `$derived` segments (before chain, after chain).
 * Zero targeting plugins → the identity fast path: NO derived chain
 * is built at all, exposed === raw by reference, and no hook ever
 * runs (the structural no-chain guarantee).
 *
 * The scope is the chain captured at the context instance's creation
 * (provide time) — pass `getContextPlugins()` from the providing
 * component; `undefined` arms the identity path.
 */
export function withPlugins<K extends string, T>(
  def: ContextDef<K, T>,
  scope: PluginScope | undefined,
): PluginPipeline<T> {
  const chain = scope ? scope.chain : EMPTY_CHAIN;
  const targeting = chain.filter((plugin) => plugin.targets.includes(def.key));

  // the one-time init pass (environment-free full-value reducers).
  // $state.raw: the raw value is stored as-is — no deep proxy — so
  // reference identity survives (frozen inputs stay frozen, plugins
  // can never mutate through a proxy) and updates are wholesale
  // replacements, which is exactly the value-in-new-value-out contract.
  let raw = $state.raw(applyInit(def, def.defaults(), targeting));

  if (targeting.length === 0) {
    // identity fast path — no chain is built
    const identity: PluginPipeline<T> = {
      def,
      targeting,
      get raw() {
        return raw;
      },
      setRaw(value: T) {
        raw = value;
      },
      get exposed() {
        return raw;
      },
    };
    return identity;
  }

  const env = scope!.env;
  const projected = $derived.by(() => {
    let current = raw;
    for (const plugin of targeting) {
      if (!eligible(plugin, def, env)) continue;
      const before = hooksOf(plugin).before;
      if (typeof before === 'function') current = before(current, env) as T;
    }
    return current;
  });
  const exposed = $derived.by(() => {
    let current = projected;
    for (let i = targeting.length - 1; i >= 0; i--) {
      const plugin = targeting[i];
      if (!eligible(plugin, def, env)) continue;
      const after = hooksOf(plugin).after;
      if (typeof after === 'function') current = after(current, env) as T;
    }
    return current;
  });

  const pipeline: PluginPipeline<T> = {
    def,
    targeting,
    get raw() {
      return raw;
    },
    setRaw(value: T) {
      raw = value;
    },
    get exposed() {
      return exposed;
    },
  };
  return pipeline;
}
