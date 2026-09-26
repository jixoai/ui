/**
 * jixoai typography scope (registry/files/lib/typography.svelte.ts,
 * typography-context-and-parts Lane A, 2026-09-07).
 *
 * The Svelte channel of the prose two-channel law (the density
 * contract verbatim): the JS scope object + the plugin-chain seam here,
 * the CSS residue sheet (ui/prose/prose.css) owning every element
 * lane. This lib module is a VALUE-DOMAIN carrier (the code-card
 * `code` precedent, ruling A4-adjacent in proposals/a), not a variant
 * axis: prose ink/flow touches none of the four hue slots and never
 * versions the context-coverage vocabulary.
 *
 * THE F4 PROBE RULING (2026-09-07): the control-chrome B5 claim — a
 * .svelte.ts module's 'svelte' import binding a second runtime copy
 * whose set/getContext never see the component graph — was re-probed
 * at implementation time (design §1.1's gate): vitest, BOTH import
 * paths ($lib alias + the relative registry-style specifier), AND the
 * vite dev server SSR pipeline all PASSED (provider write, child
 * read, getter re-read). The probe passing both environments unseats
 * the inline default: THE CONTEXT PAIR LIVES HERE (the density
 * posture, empirically re-armed for this lane).
 *
 * Rulings carried by this module:
 *   - A1 escape: the COMPONENT is <Prose>, never <Typography> — the
 *     word `typography` is markdown's live user-facing vocabulary
 *     (`<Markdown typography="relaxed">`); the lib item may own the
 *     word because no markup surface ever spells it.
 *   - A2: absence IS the state — every knob resolves `explicit ??
 *     undefined` (the prose-defaults absentSlot file is the v1
 *     vocabulary's single audit source) and TYPOGRAPHY_DEF defaults
 *     to undefined (the no-opinion fleet law).
 *   - A7/F9/F12: the gradient mechanism is FILL-ONLY — it never
 *     writes `color: transparent` (currentcolor on a mark would
 *     resolve to the inherited transparent — invisible); the host
 *     emits the gradient parts as vars consumed by the residue sheet,
 *     and `--jx-ty-ink` carries ONLY color tokens so Heading's
 *     var-fallback utility never sees an invalid-at-computed-value
 *     var. The solid restore token `--jx-ty-ink-solid` ships on the
 *     host for plugin and print reads (the sheet's @media print
 *     restore — the paged.js clone never re-runs this provider).
 *   - The ink union is the hue-law's two-layer seam shape
 *     transferred: a curated 'default'|'muted'|'primary'|
 *     'destructive' word set resolving to the four foreground tokens,
 *     with the raw string escape for everything else.
 *
 * 惰性律: construction captures nothing; every context read happens
 * inside the consumer's component window (the hard window contract,
 * D3-C — outside component initialisation Svelte's own
 * lifecycle_outside_component propagates). resolveTypoStyle is PURE:
 * zero context reads, zero style writes — the provider mounts the bag.
 */

import { getContext, setContext } from 'svelte';
import { defineContextDef, getContextPlugins, type ContextDef } from './context-plugin.svelte';

// ---- the value domain (design §1.4 — the frozen v1 vocabulary) ----------

/** a free CSS length ('14px', '1.125rem', '2em' — the 中文稿纸惯例);
 *  the open-scalar seam shape: any string, literal inference kept */
export type CssLength = string & {};

/** the curated ink words → the four foreground tokens; raw is the
 *  escape (a CSS color value passes through verbatim) */
export type InkName = 'default' | 'muted' | 'primary' | 'destructive';
export type Ink = InkName | (string & {});

/** the region ground words → the background-family tokens; raw escapes */
export type GroundName = 'background' | 'card' | 'popover' | 'muted' | 'secondary' | 'accent' | 'transparent';
export type InkToken = GroundName | (string & {});

/** family words → the theme's --font-* tokens ('serif' needs the theme
 *  to define --font-serif — documented, not assumed); raw is a full
 *  font-family value */
export type FamilyWord = 'sans' | 'mono' | 'serif';
export type Family = FamilyWord | (string & {});

/** the gradient payload: structured stops (angle in degrees when
 *  numeric) or a raw CSS image value verbatim */
export interface GradientStops {
  readonly from: string;
  readonly to: string;
  readonly angle?: number | string;
}
export type Gradient = GradientStops | (string & {});

export type ProseAlign = 'start' | 'center' | 'end' | 'justify';
export type InitialLetterStep = 2 | 3 | 4 | 5;
export type ProseWrap = 'pretty' | 'balance' | 'stable';
export type ProseHyphens = 'auto' | 'none' | 'manual';

/**
 * The prose scope — the 11 frozen v1 knobs, every field optional
 * because ABSENCE IS THE STATE (ruling A2): an unset knob writes
 * nothing, stamps nothing, and lets the ambient channel flow. Plugins
 * targeting TYPOGRAPHY_DEF receive and return whole new scope bags
 * (the kernel's purity contract — e.g. a print-medium plugin strips
 * gradient/ground before CSS ever sees them).
 */
export interface TypoScope {
  /** inheritance ONLY — markdown sovereignty for free (the trio's
   *  root declaration beats inheritance by cascade) */
  readonly size?: CssLength;
  /** P-only lane (headings keep their 1.25); the sheet rule is
   *  presence-gated on the host */
  readonly leading?: number;
  /** inheritance; code/kbd stay mono (face B1 element rules) */
  readonly family?: Family;
  /** inheritance + the --jx-ty-ink var Heading consumes; links keep
   *  primary by the face B2 element rule (the recorded exception) */
  readonly ink?: Ink;
  /** fill-only element lane on P/Heading hooks (A7); suppresses
   *  nothing on the host but the gradient attr */
  readonly gradient?: Gradient;
  /** the region's ground; Mark's own highlight law untouched */
  readonly ground?: InkToken;
  /** justify pairs with hyphens (docs guidance) */
  readonly align?: ProseAlign;
  /** P-only; never on headings */
  readonly indent?: CssLength;
  /** both arms (@supports modern + float fallback); suppresses indent */
  readonly initialLetter?: InitialLetterStep;
  /** pretty for prose, balance for heading scopes (guidance) */
  readonly wrap?: ProseWrap;
  /** auto needs lang on the host or ancestor (documented) */
  readonly hyphens?: ProseHyphens;
}

// ---- the def + the context pair -----------------------------------------

/**
 * The typography def — the identity object plugins target (the kernel
 * D1 law: matching is object identity, the key string is diagnostic
 * vocabulary only). The value domain is the WHOLE scope bag or
 * undefined: with no provider and no plugins a consumer reads no
 * opinion at all.
 */
export const TYPOGRAPHY_DEF: ContextDef<'typography', TypoScope | undefined> = defineContextDef({
  key: 'typography',
  defaults: (): TypoScope | undefined => undefined,
  ssrSafe: undefined,
});

/** the context key — module-private (the PLUGIN_SCOPE_KEY idiom): the
 *  only way in is this module's pair, so scope reads ride the import
 *  graph and a forged key cannot exist */
const TYPOGRAPHY_KEY = Symbol('jx-typography');

/** the getter-endorsed payload: `{ get scope() }` keeps a provider
 *  flip re-deriving every consumer in the same frame (the density
 *  payload shape) */
export interface TypographyContext {
  readonly scope: TypoScope | undefined;
}

/**
 * The provider-side write (the promoted F4 posture — see the header).
 * Call during the provider's init; the payload stays reactive through
 * the getter. A throwing scope getter propagates (never caught here).
 */
export function provideTypography(scope: () => TypoScope | undefined): TypographyContext {
  const context: TypographyContext = {
    get scope() {
      return scope();
    },
  };
  setContext(TYPOGRAPHY_KEY, context);
  return context;
}

/**
 * The consumer-side read — the nearest provider's payload, undefined
 * outside any prose region (no opinion). The window is a hard
 * contract (D3-C).
 */
export function getTypographyScope(): TypographyContext | undefined {
  return getContext<TypographyContext | undefined>(TYPOGRAPHY_KEY);
}

/**
 * The plugin chain applied AT THE PROVIDER (design §1.1): the whole
 * knob bag passes through the nearest plugin root's chain for the
 * typography def — identity fast path when no plugin targets it. Read
 * inside the provider's $derived so medium-gated filters re-run the
 * resolution when the medium flips (the resolveDensity window law).
 */
export function applyTypoScope(scope: TypoScope): TypoScope {
  const plugins = getContextPlugins();
  if (plugins === undefined) return scope;
  return plugins.apply(TYPOGRAPHY_DEF, scope);
}

// ---- the pure resolution (knob bag → host style/attr bag) ---------------

/** the ink token resolution map — the four foreground tokens (the
 *  curated union's whole meaning; the A1-vocabulary gate is never
 *  touched: these are css tokens, not variant words) */
const INK_TOKENS: Record<InkName, string> = {
  default: 'var(--foreground)',
  muted: 'var(--muted-foreground)',
  primary: 'var(--primary)',
  destructive: 'var(--destructive)',
};

/** the ground token resolution map — the background-family tokens a
 *  region ground may lawfully ride */
const GROUND_TOKENS: Record<GroundName, string> = {
  background: 'var(--background)',
  card: 'var(--card)',
  popover: 'var(--popover)',
  muted: 'var(--muted)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  transparent: 'transparent',
};

/** the family token resolution map — 'serif' resolves to
 *  var(--font-serif): the token itself is a DOCUMENTED theme
 *  dependency (this repo's sheet defines --font-sans/--font-mono
 *  today); without it the declaration degrades to inheritance */
const FAMILY_TOKENS: Record<FamilyWord, string> = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
  serif: 'var(--font-serif)',
};

/** word → token, else raw passthrough (hasOwn closes the prototype
 *  chain: 'constructor' is a raw value, never a token lookup) */
function resolveWord<T extends string>(value: T, map: Record<string, string>): string {
  return Object.hasOwn(map, value) ? map[value] : value;
}

/** the gradient image value: structured stops compose a linear
 *  gradient (angle numeric → degrees; the CSS default direction
 *  180deg is explicit, never implicit), raw passes through verbatim */
function gradientImage(gradient: Gradient): string {
  if (typeof gradient === 'string') return gradient;
  const angle =
    gradient.angle === undefined
      ? '180deg'
      : typeof gradient.angle === 'number'
        ? `${gradient.angle}deg`
        : gradient.angle;
  return `linear-gradient(${angle}, ${gradient.from}, ${gradient.to})`;
}

/**
 * The host's style/attr bag — the two-channel law's emission face:
 *
 *   declarations  wrapper INHERITANCE-lane properties, only-set
 *                 (font-size, font-family, color, text-align,
 *                 text-wrap, hyphens, background-color — deliberately
 *                 NO line-height/text-indent: those are element lanes
 *                 the residue sheet owns, gated on the attrs below)
 *   vars          the --jx-ty-* mirrors (documented for app-side css
 *                 reads) + --jx-ty-ink-solid, the solid restore token
 *   attrs         the PRESENCE lane: data-jx-ty-leading/-indent/
 *                 -initial (presence-gated because an ungated
 *                 `var(--jx-ty-leading, inherit)` rule at (0,2,0)
 *                 would fire always and break the face's p{1.6} for
 *                 every non-prose region — F13) + data-jx-ty-ink=
 *                 'gradient' when the fill-only lane is armed
 *
 * PURE: no context reads, no style writes, no cn(). The gradient
 * NEVER emits `color: transparent` (A7/F9) — only the parts the sheet
 * assembles into background-clip: text + the solid restore token.
 */
export interface TypoStyleBag {
  readonly declarations: Record<string, string>;
  readonly vars: Record<string, string>;
  readonly attrs: Record<string, string>;
}

export function resolveTypoStyle(scope: TypoScope): TypoStyleBag {
  const declarations: Record<string, string> = {};
  const vars: Record<string, string> = {};
  const attrs: Record<string, string> = {};

  // size — inheritance only, never an element stamp (markdown
  // sovereignty is a cascade fact, not a JS mask)
  if (scope.size !== undefined) {
    declarations['font-size'] = scope.size;
    vars['--jx-ty-size'] = scope.size;
  }
  // leading — P-only lane: the var + the presence hook; the sheet
  // rule [data-jx-ty-leading] :is([data-jx-text='p']) applies it
  if (scope.leading !== undefined) {
    vars['--jx-ty-leading'] = String(scope.leading);
    attrs['data-jx-ty-leading'] = '';
  }
  // family — word → theme token, raw verbatim; code/kbd keep their
  // own mono element rules (face B1), nothing to do here
  if (scope.family !== undefined) {
    const family = resolveWord(scope.family, FAMILY_TOKENS);
    declarations['font-family'] = family;
    vars['--jx-ty-family'] = family;
  }
  // ink — the color token flows by inheritance AND as --jx-ty-ink for
  // Heading's var-fallback utility; the same value is the solid
  // restore token while it is the only ink in play
  if (scope.ink !== undefined) {
    const ink = resolveWord(scope.ink, INK_TOKENS);
    declarations['color'] = ink;
    vars['--jx-ty-ink'] = ink;
    vars['--jx-ty-ink-solid'] = ink;
  }
  // gradient — FILL-ONLY: the attr arms the sheet lane on P/Heading
  // hooks; the image rides a var. --jx-ty-ink NEVER carries the
  // gradient payload (F12). Without an explicit ink the solid restore
  // token still ships (the region's canonical solid: foreground)
  if (scope.gradient !== undefined) {
    attrs['data-jx-ty-ink'] = 'gradient';
    vars['--jx-ty-gradient'] = gradientImage(scope.gradient);
    if (scope.ink === undefined) {
      vars['--jx-ty-ink-solid'] = 'var(--foreground)';
    }
  }
  // ground — the region's ground; Mark's own highlight law untouched
  if (scope.ground !== undefined) {
    const ground = resolveWord(scope.ground, GROUND_TOKENS);
    declarations['background-color'] = ground;
    vars['--jx-ty-ground'] = ground;
  }
  // align — inheritance lane
  if (scope.align !== undefined) {
    declarations['text-align'] = scope.align;
    vars['--jx-ty-align'] = scope.align;
  }
  // indent — P-only lane: var + presence hook, NEVER a wrapper
  // declaration (headings must not inherit a first-line indent)
  if (scope.indent !== undefined) {
    vars['--jx-ty-indent'] = scope.indent;
    attrs['data-jx-ty-indent'] = '';
  }
  // initialLetter — both arms gated on one hook; suppresses indent on
  // the same P (a drop cap plus indent double-counts — the sheet's
  // compound rule)
  if (scope.initialLetter !== undefined) {
    vars['--jx-ty-initial'] = String(scope.initialLetter);
    attrs['data-jx-ty-initial'] = '';
  }
  // wrap — inheritance lane (pretty for prose, balance for headings)
  if (scope.wrap !== undefined) {
    declarations['text-wrap'] = scope.wrap;
    vars['--jx-ty-wrap'] = scope.wrap;
  }
  // hyphens — inheritance lane (auto needs lang, documented)
  if (scope.hyphens !== undefined) {
    declarations['hyphens'] = scope.hyphens;
    vars['--jx-ty-hyphens'] = scope.hyphens;
  }

  return { declarations, vars, attrs };
}
