/**
 * jixoai avatar family Defaults
 * (registry/files/ui/avatar/avatar-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03;
 * explicit-props W3 batch B / task 3.6, 2026-09-21).
 *
 * The avatar family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `AvatarDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - size: THE universal size axis (§1), ADOPTED per design §13
 *     ("avatar size: 'sm'|'md'|'lg' → the universal size axis;
 *     aliases md → medium"): the legacy spellings normalize onto
 *     the named steps pre-resolve (AVATAR_SIZE_ALIASES below —
 *     sm→small · md→medium · lg→large, the DENSITY_NAMED_ALIASES
 *     precedent) and the number lane drives the box edge verbatim
 *     (px). No own: 'auto' inherits the ambient font-size context
 *     and the component falls back to its 32px geometry baseline.
 *     The box ladder (24/32/40) stays keyed off the RESOLVED lane;
 *     the silhouette sheet (avatar.css) reads the legacy spelling
 *     via data-jx-avatar (small→sm · medium→md · large→lg · number
 *     verbatim).
 *   - variant: the LITERAL family (own 'bevel') — the silhouette
 *     triple (bevel / rounded / squircle) is corner geometry, not a
 *     paint rung; no prop-name collision with the universal shape
 *     axis (§2), which rides its own slot below (supply-side: the
 *     silhouette sheet reads the variant keys, the axis supplies
 *     the §11 chain).
 *   - density · shape · radius · color · theme · elevation · motion:
 *     the other universal axes (W3-B, all no-own) — the eight-axis
 *     surface, size included.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window (the literal
 * slots never read context at all). This file is a member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
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
  type QueryResult,
  type SizeLane,
} from '$lib/defaults.svelte';

/**
 * The §13 legacy aliases onto the universal named steps (the
 * DENSITY_NAMED_ALIASES precedent: documented vocabulary onto the
 * existing rungs, migration spellings pass verbatim). Plain-string
 * lanes only — a query() carrier's case values use the documented
 * steps (the aliases are compat, not a second vocabulary).
 */
export const AVATAR_SIZE_ALIASES: Readonly<Partial<Record<string, SizeLane>>> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

/** the size prop's input surface — the axis lanes plus the legacy spellings */
export type AvatarSizeInput = SizeLane | QueryResult<SizeLane> | 'sm' | 'md' | 'lg';

/** normalize a legacy size spelling onto the axis' named steps (the
 *  bounded input makes the cast provable: the alias table covers the
 *  three legacy spellings, every other string member of the input
 *  union already IS a SizeLane spelling) */
export function normalizeAvatarSize(
  lane: AvatarSizeInput | undefined,
): SizeLane | QueryResult<SizeLane> | undefined {
  return typeof lane === 'string' ? (AVATAR_SIZE_ALIASES[lane] ?? (lane as SizeLane)) : lane;
}

/** the silhouette triple — one geometry, three corners */
export const avatarVariantSlot = defineLiteralSlot(['bevel', 'rounded', 'squircle'], 'bevel');
export type AvatarVariant = ReturnType<typeof avatarVariantSlot>;

export const AvatarDefaults = defineComponentDefaults({
  size: sizeAxisSlot(),
  variant: avatarVariantSlot,
  density: densityAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});

