/**
 * @jixoai/css-laws — a BOUNDED serializer for the 13 native
 * form-control laws (Codex r2 positioning ruling).
 *
 * This is NOT a general typed CSS AST: declarations and selectors
 * are strings; subtrees express relative paths but not recursive
 * structure; at-rule interleaving is the numeric `order` model, not
 * an authored rule tree. What it buys — ONE declaration source per
 * law, four projections (utility class / bare-element face /
 * Tier-2 alias / component-mount) and machine-checked
 * cross-projection equality — is exactly what the jx-html closed
 * set needs. General component paint stays in Tailwind utilities;
 * do not grow this package into a CSS framework.
 *
 * A "law" is a complete styling contract for one form-control
 * concept: its base geometry, its pseudo-element builds, its state
 * machines, its subtree rules, its degradation laws — all as typed
 * TS objects.
 *
 * One law → FOUR CSS projections (single declaration source):
 *   utility — .{className} rules in @layer components (jixoai.css;
 *             registry markup consumes the class)
 *   face    — element-default rules under :where(.jx-pure)
 *             (jx-pure.css Part B; bare elements get the law)
 *   alias   — Tier-2 opt-in classes, unlayered (jx-pure.css Part A;
 *             the frozen vocabulary beats layered utilities by design)
 *   mount   — the face re-anchored on a registry component's hook
 *             (e.g. [data-jx-range]:not(.no-jx-pure, .no-jx-pure *)),
 *             generated INTO the component's own css file between
 *             marker slots (adversarial review E-1, 2026-09-02: the
 *             4th mounting surface is machine-projected, never
 *             hand-copied; build --check gates its freshness)
 *
 * Laws compose in TS (composeLaw); @apply composition is retired.
 * CSS files are generated — never hand-edited inside marker slots.
 */

// ── primitive types ─────────────────────────────────────────────────

/** a single CSS declaration block (property: value pairs) */
export interface Declarations {
  readonly [property: string]: string | number | undefined;
}

/** a pseudo-element build (e.g., ::before for checkbox glyph) */
export interface PseudoBuild {
  readonly declarations: Declarations;
  /** state-triggered overrides of this pseudo's declarations */
  readonly states?: Readonly<Record<string, Declarations>>;
}

/**
 * a selector-suffixed rule on the law's element. The selector may be
 * a state (':checked'), a compound state chain
 * (':hover:not(:checked):not(:disabled)'), or an engine pseudo
 * ('::-webkit-slider-thumb' — rides only inside @supports gates).
 *
 * ORDER (Codex r2 P0 fix): CSS source order is cascade-deciding at
 * equal specificity. The serializer emits sections by numeric order:
 * base 0 · pseudos 100 · subtrees 200 · states 300 · media 400 ·
 * supports 500 — a rule that must land AFTER another section (the
 * select listbox override must beat the @supports chevron) carries
 * an explicit order above it. Stable sort keeps authored sequence
 * inside the same number.
 */
export interface StateRule {
  readonly selector: string;
  readonly declarations: Declarations;
  /** emission order (default 300 — see the ORDER note above) */
  readonly order?: number;
}

/**
 * a subtree rule — a child/descendant of the law's element.
 * tgroup is the exemplar: the group element owns the law, the child
 * labels carry the seam geometry ('> label', '> label:last-child').
 * selector is RELATIVE (no leading combinator slash; it may start
 * with '>' for direct children).
 */
export interface SubtreeRule {
  readonly selector: string;
  readonly declarations: Declarations;
  readonly pseudos?: Readonly<Record<string, PseudoBuild>>;
  /** states on the subtree node itself */
  readonly states?: readonly StateRule[];
}

/** an @media degradation rule */
export interface MediaRule {
  readonly query: string;
  readonly rules: readonly StateRule[];
}

/**
 * an @supports engine gate. `declarations` is OPTIONAL — a gate that
 * only wraps engine pseudos omits it (no empty base rule is emitted).
 */
export interface SupportsRule {
  readonly condition: string;
  readonly declarations?: Declarations;
  readonly states?: readonly StateRule[];
}

// ── the law interface ───────────────────────────────────────────────

export interface ComponentLaw {
  /** the law's identity (matches the jx-html-{name} family) */
  readonly name: string;

  /** base declarations — always present on the element */
  readonly base: Declarations;

  /** pseudo-element builds (glyph, knob, dot, fill, etc.) */
  readonly pseudos?: Readonly<Record<string, PseudoBuild>>;

  /** state machine rules (:checked, :hover, :focus-visible, :disabled…) */
  readonly states?: readonly StateRule[];

  /** subtree rules (tgroup's '> label' seam family) */
  readonly subtrees?: readonly SubtreeRule[];

  /** custom properties this law defines (consumed by its own rules) */
  readonly customProperties?: Declarations;

  /** degradation laws (@media prefers-reduced-motion, forced-colors) */
  readonly media?: readonly MediaRule[];

  /** engine gates (@supports for Firefox/WebKit differentiation) */
  readonly supports?: readonly SupportsRule[];

  /** how the law is applied */
  readonly application: {
    /** the utility class (e.g., 'jx-html-checkbox') */
    readonly className: string;
    /**
     * the element selector(s) for the face — a string, a comma string,
     * or an array; EVERY comma part gets the scope prefix separately
     * (a bare 'input, textarea' must not let the second part escape
     * the :where(.jx-pure) scope)
     */
    readonly elementSelector: string | readonly string[] | null;
    /** whether the element selector needs the :where(.jx-pure) scope */
    readonly scoped: boolean;
    /** Tier-2 opt-in classes that apply this law (e.g., ['jx-slider']) */
    readonly aliases?: readonly string[];
  };
}

// ── composition ─────────────────────────────────────────────────────

/**
 * Law composition — the @apply chain retired into TS. The delta law's
 * declarations WIN on conflict; states/pseudos/subtrees/media/supports
 * concatenate (delta after base). name/application come from delta.
 */
export function composeLaw(base: ComponentLaw, delta: ComponentLaw): ComponentLaw {
  const mergeDecls = (a: Declarations | undefined, b: Declarations | undefined): Declarations => {
    if (!a) return b ?? {};
    if (!b) return a;
    return { ...a, ...b };
  };
  const mergePseudoStates = (
    a: Readonly<Record<string, Declarations>> | undefined,
    b: Readonly<Record<string, Declarations>> | undefined,
  ) => {
    if (!a) return b;
    if (!b) return a;
    const out: Record<string, Declarations> = {};
    for (const [k, v] of Object.entries(a)) out[k] = v;
    for (const [k, v] of Object.entries(b)) out[k] = mergeDecls(out[k], v);
    return out;
  };
  const mergePseudos = (
    a: Readonly<Record<string, PseudoBuild>> | undefined,
    b: Readonly<Record<string, PseudoBuild>> | undefined,
  ): Readonly<Record<string, PseudoBuild>> | undefined => {
    if (!a) return b;
    if (!b) return a;
    const out: Record<string, PseudoBuild> = {};
    for (const [k, v] of Object.entries(a)) out[k] = v;
    for (const [k, v] of Object.entries(b)) {
      const prior = out[k];
      if (!prior) {
        out[k] = v;
        continue;
      }
      const mergedStates = mergePseudoStates(prior.states, v.states);
      out[k] = {
        declarations: mergeDecls(prior.declarations, v.declarations),
        ...(mergedStates ? { states: mergedStates } : {}),
      };
    }
    return out;
  };

  return {
    name: delta.name,
    base: mergeDecls(base.base, delta.base),
    pseudos: mergePseudos(base.pseudos, delta.pseudos),
    states: [...(base.states ?? []), ...(delta.states ?? [])],
    subtrees: [...(base.subtrees ?? []), ...(delta.subtrees ?? [])],
    customProperties: mergeDecls(base.customProperties, delta.customProperties),
    media: [...(base.media ?? []), ...(delta.media ?? [])],
    supports: [...(base.supports ?? []), ...(delta.supports ?? [])],
    application: delta.application,
  };
}

// ── the law collection interface ────────────────────────────────────

export interface LawCollection {
  readonly laws: readonly ComponentLaw[];
  // (Codex r2: sharedProperties removed — declared but never
  // serialized; the density tokens own that role in jixoai.css)
}

// ── serializer contract ─────────────────────────────────────────────

export type SerializeFormat = 'utility' | 'face' | 'alias' | 'mount';

export interface SerializeOptions {
  /**
   * 'utility': .{className} rules (jixoai.css @layer components slot)
   * 'face':    element-default rules under :where(.jx-pure)
   * 'alias':   one rule-set per application.aliases class, unlayered
   * 'mount':   rules hanging off `mountAnchor` — the law's face
   *            re-anchored on a registry component hook (the anchor
   *            must carry the law's own opt-out so the escape hatch
   *            stays consistent across every mounting surface)
   */
  readonly format: SerializeFormat;
  /** the component hook anchor for format 'mount' (required there) */
  readonly mountAnchor?: string;
  /** indent for the output CSS (default 2 spaces) */
  readonly indent?: string;
}

export interface SerializedCSS {
  readonly css: string;
  readonly lawName: string;
}
