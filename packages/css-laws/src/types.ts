/**
 * @jixoai/css-laws — the type-safe CSS law model.
 *
 * A "law" is a complete styling contract for one form-control concept:
 * its base geometry, its pseudo-element builds, its state machines,
 * its degradation laws — all as typed TS objects.
 *
 * One law → two CSS artifacts:
 *   utility class (for component markup consumption)
 *   element-default rule (for the jx-pure bare-element face)
 *
 * The TS objects are the SINGLE DECLARATION SOURCE. CSS files are
 * generated at build time — never hand-edited.
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

/** a state machine rule (selector-suffix + declarations) */
export interface StateRule {
  /** the state selector (e.g., ':checked', ':hover:not(:checked):not(:disabled)') */
  readonly selector: string;
  readonly declarations: Declarations;
}

/** an @media degradation rule */
export interface MediaRule {
  readonly query: string;
  readonly rules: readonly StateRule[];
}

/** an @supports engine gate */
export interface SupportsRule {
  readonly condition: string;
  readonly declarations: Declarations;
  readonly states?: readonly StateRule[];
}

// ── the law interface ───────────────────────────────────────────────

export interface ComponentLaw {
  /** the law's identity (matches the jx-html-{name} utility) */
  readonly name: string;

  /** base declarations — always present on the element */
  readonly base: Declarations;

  /** pseudo-element builds (glyph, knob, dot, fill, etc.) */
  readonly pseudos?: Readonly<Record<string, PseudoBuild>>;

  /** state machine rules (:checked, :hover, :focus-visible, :disabled, etc.) */
  readonly states?: readonly StateRule[];

  /** custom properties this law defines (consumed by its own rules) */
  readonly customProperties?: Declarations;

  /** degradation laws (@media prefers-reduced-motion, forced-colors) */
  readonly media?: readonly MediaRule[];

  /** engine gates (@supports for Firefox/WebKit differentiation) */
  readonly supports?: readonly SupportsRule[];

  /** how the law is applied */
  readonly application: {
    /** the utility class name (e.g., 'jx-html-checkbox') */
    readonly className: string;
    /** the element selector for the face (e.g., 'input[type="checkbox"]:not([role="switch"])') */
    readonly elementSelector: string | null;
    /** whether the element selector needs the :where(.jx-pure) scope */
    readonly scoped: boolean;
  };
}

// ── the law collection interface ────────────────────────────────────

export interface LawCollection {
  readonly laws: readonly ComponentLaw[];
  /** shared custom properties (tokens, not law-specific) */
  readonly sharedProperties?: Declarations;
}

// ── serializer contract ─────────────────────────────────────────────

export interface SerializeOptions {
  /** output format: 'utility' (class-based) or 'face' (element-default) */
  readonly format: 'utility' | 'face';
  /** indent for the output CSS (default 2 spaces) */
  readonly indent?: string;
}

export interface SerializedCSS {
  readonly css: string;
  readonly lawName: string;
}
