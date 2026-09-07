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
 * declarations/vars, or no opinion at all) keeps flowing. The
 * absentSlot discipline is also what keeps the context-coverage
 * vocabulary gate cold: only `size` hits the v1 word list and an
 * absent slot covers it without a version bump (F1).
 *
 * DENSITY IS DELIBERATELY ABSENT: prose has no density opinion — the
 * word belongs to the UI control-surface ladder, and the markdown
 * trio already made the same naming argument for the prose scale
 * (`<Markdown typography=…>`, never density). A prose region stamps
 * no data-density and never re-scopes control chrome inside it.
 *
 * 惰性律: construction captures nothing (absentSlot has no own);
 * resolution happens at the provider's $derived window. This file is
 * a member of the registry:ui item (installs with the family, byte
 * mirrored; its TYPE imports from the typography lib item are the
 * registry edge Lane C declares).
 */
import { defineComponentDefaults, absentSlot } from '$lib/defaults.svelte';
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
  size: absentSlot<CssLength>(),
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
});
