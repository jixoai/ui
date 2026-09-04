/**
 * jixoai avatar family Defaults
 * (registry/files/ui/avatar/avatar-defaults.svelte.ts,
 * context-defaults-economy task 3.4 / W4, 2026-09-03).
 *
 * The avatar family's SINGLE declared ambient contract (design.md
 * Defaults 定位): one `AvatarDefaults` object whose slots cover
 * every vocabulary-hit style prop —
 *   - size: the LITERAL family (own 'md'), deliberately NOT an axis
 *     slot: the sm 24 / md 32 / lg 40 geometry ladder is the family's
 *     own closed vocabulary (an icon-size scale, not a density tier —
 *     density stays a separate axis the avatar never stamped); a
 *     future size axis would first have to close the cross-family
 *     union. Resolves `explicit ?? own`, never reads context.
 *   - variant: the LITERAL family (own 'bevel') — the silhouette
 *     triple (bevel / rounded / squircle) is corner geometry, not a
 *     paint rung; the avatar is absent from the variant grammar's
 *     frozen availability table, so ambient paint pends a future
 *     table freeze (the kbd-mode upgrade path: table row →
 *     definePaintSlot).
 *
 * No density slot: the avatar carries no density prop — nothing to
 * cover, and a dead declaration slot is 为接线而接线 (sheet X2-11
 * spirit). The fallback block's type scale rides the ambient css
 * scope channel directly.
 *
 * 惰性律: construction captures own only; context reads happen at
 * resolve time inside the consumer's $derived window (these slots
 * never read context at all). This file is a member of the
 * registry:ui item (installs with the family, byte mirrored, zero
 * kernel imports).
 */
import { defineComponentDefaults, defineLiteralSlot } from '$lib/defaults.svelte';

/** the box ladder — sm 24px · md 32px (the geometry baseline) · lg 40px */
export const avatarSizeSlot = defineLiteralSlot(['sm', 'md', 'lg'], 'md');
export type AvatarSize = ReturnType<typeof avatarSizeSlot>;

/** the silhouette triple — one geometry, three corners */
export const avatarVariantSlot = defineLiteralSlot(['bevel', 'rounded', 'squircle'], 'bevel');
export type AvatarVariant = ReturnType<typeof avatarVariantSlot>;

export const AvatarDefaults = defineComponentDefaults({
  size: avatarSizeSlot,
  variant: avatarVariantSlot,
});
