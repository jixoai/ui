/**
 * jixoai blockquote family Defaults
 * (registry/files/ui/blockquote/blockquote-defaults.svelte.ts,
 * markdown-coverage-components §1.1).
 *
 * The blockquote family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `BlockquoteDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - variant: the paint axis slot, availability exactly per the
 *     frozen table (the alert-shaped row: outline/tonal, own
 *     outline). The ladder is frozen at TWO rungs by the quote's
 *     readability law: fill buries long-form copy under saturated
 *     ground, and ghost is interactive-chrome vocabulary
 *     (rest-transparent, hover-tonal) which a static quote misuses —
 *     neither can ever join the row. The borderless manuscript
 *     indent is a future STRUCTURAL axis, never a paint rung.
 *     `blockquoteVariantSlot`'s values tuple IS the family union's
 *     source (slot-values-first D2: the gate asserts values ≡ the
 *     frozen row bidirectionally). The ambient domain is trusted
 *     (D3-A retired the runtime values guard — no clamp, no warn;
 *     ZonePaintVariant already excludes the out-of-union rungs at
 *     the provider).
 *   - rule / ruleSize: the RULE geometry axis (2026-09-07,
 *     typography-context-and-parts §2) — the separator ink-geometry
 *     precedent: a rule is INK, its channel never joins the paint
 *     ladder's frozen table, so both slots stay defineLiteralSlot
 *     forever (literal slots never read zone — the kbd contrast test
 *     pattern). Numeric closed domains are lawful (defaults.svelte.ts
 *     booleans record [false, true]; the values tuple is the union's
 *     source — the 1/4/8 px ladder is the Owner's explicit enumeration,
 *     recorded as the ruling over a derived scale). Naming: NOT bare
 *     `size` — it would enter the detection vocabulary AND collide
 *     with the typography `size` the reading family refuses
 *     (ruleSize is the honest compound).
 *   - density: the universal §4 axis slot (W3-B — the legacy
 *     densitySlot semantics ride the bridged lane). The blockquote
 *     carries NO density own: no provider and no explicit prop
 *     resolve 'auto', stamp nothing, and the ambient css scope
 *     channel keeps flowing (fleet law).
 *   - the seven other universal axes (§0/§11, W3-B, all no-own):
 *     size · shape · radius · color · theme · elevation · motion —
 *     the eight-axis surface (ruleSize stays per §13: no collision).
 *
 * 惰性律: construction captures own/values only; context reads happen
 * at resolve time inside the consumer's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored, zero kernel imports).
 */
import {
  colorAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';
import { definePaintSlot } from '$lib/paint.svelte';

/** the quote/admonition prominence ladder — the frozen table's
 *  Blockquote row (the alert two-rung shape: a quote never shouts
 *  from a fill, never gestures with hover chrome); the values tuple
 *  is the union's one declaration */
export const blockquoteVariantSlot = definePaintSlot(['outline', 'tonal'], 'outline');
export type BlockquoteVariant = ReturnType<typeof blockquoteVariantSlot>;

/** the rule's ink channel: shadow paints over geometry (the default —
 *  the Owner's ruling), border consumes it; a LITERAL axis, never
 *  zone-ambient (ink geometry, the separator precedent) */
export const blockquoteRuleSlot = defineLiteralSlot(['shadow', 'border'], 'shadow');
export type BlockquoteRule = ReturnType<typeof blockquoteRuleSlot>;

/** the rule's literal px ladder — the Owner's explicit enumeration
 *  (1 = today's face-rule continuity, 4/8 = deliberate emphasis
 *  steps), not a derived scale; numeric tuples are lawful closed
 *  domains (the [false, true] boolean record) */
export const blockquoteRuleSizeSlot = defineLiteralSlot([1, 4, 8], 4);
export type BlockquoteRuleSize = ReturnType<typeof blockquoteRuleSizeSlot>;

export const BlockquoteDefaults = defineComponentDefaults({
  variant: blockquoteVariantSlot,
  rule: blockquoteRuleSlot,
  ruleSize: blockquoteRuleSizeSlot,
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
