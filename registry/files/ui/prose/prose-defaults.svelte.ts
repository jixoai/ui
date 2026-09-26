/**
 * jixoai prose family Defaults
 * (registry/files/ui/prose/prose-defaults.svelte.ts,
 * typography-context-and-parts Lane A, 2026-09-07).
 *
 * THE V1 VOCABULARY'S SINGLE AUDIT SOURCE (ruling A2): every one of
 * the 11 frozen knobs is an absentSlot — ABSENCE IS THE STATE. There
 * is no own, no fallback, no manufactured default anywhere in the
 * family: an unset knob resolves undefined, the provider emits
 * nothing for it, and the ambient channel (an outer prose region's
 * declarations/vars, or no opinion at all) keeps flowing.
 *
 * THE §13 RENAME (W3-D2, Owner table ruling): the type-scale knob is
 * `measure` now — never `size`; a css line-length/type scale is not
 * the base-scale axis. The rename frees the axis name, which the
 * universal size lane below now owns (the sheet width precedent,
 * batch C). The knob keeps its absentSlot discipline — only its NAME
 * moved.
 *
 * DENSITY, REVISED (W3-D2): the eight-axis surface brings the
 * universal density LANE (densityAxisSlot, no-own) — the founding
 * naming argument survives at the STAMP level: the region stamps
 * data-density only for an EXPLICIT lane (the markdown trio's
 * founding law — the root never stamps a rung for an ambient lane),
 * so ambient control chrome inside the region keeps flowing
 * un-re-scoped.
 *
 * 惰性律: construction captures nothing (absentSlot has no own);
 * resolution happens at the provider's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored; its TYPE imports from the typography lib item are the
 * registry edge Lane C declares).
 */
import {
  absentSlot,
  colorAxisSlot,
  defineComponentDefaults,
  densityAxisSlot,
  elevationAxisSlot,
  motionAxisSlot,
  radiusAxisSlot,
  shapeAxisSlot,
  sizeAxisSlot,
  themeAxisSlot,
} from '$lib/defaults.svelte';
import type {
  CssLength,
  Family,
  Gradient,
  Ink,
  InkToken,
  InitialLetterStep,
  ProseAlign,
  ProseHyphens,
  ProseWrap,
} from '$lib/typography.svelte';

export const ProseDefaults = defineComponentDefaults({
  measure: absentSlot<CssLength>(),
  leading: absentSlot<number>(),
  family: absentSlot<Family>(),
  ink: absentSlot<Ink>(),
  gradient: absentSlot<Gradient>(),
  ground: absentSlot<InkToken>(),
  align: absentSlot<ProseAlign>(),
  indent: absentSlot<CssLength>(),
  initialLetter: absentSlot<InitialLetterStep>(),
  wrap: absentSlot<ProseWrap>(),
  hyphens: absentSlot<ProseHyphens>(),
  density: densityAxisSlot(),
  size: sizeAxisSlot(),
  shape: shapeAxisSlot(),
  radius: radiusAxisSlot(),
  color: colorAxisSlot(),
  theme: themeAxisSlot(),
  elevation: elevationAxisSlot(),
  motion: motionAxisSlot(),
});
