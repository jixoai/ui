<!--
  jixoai pattern-hero-set (registry/files/ui/pattern-hero-set/
  pattern-hero-set.svelte, 2026-08-30, openspec 2026-08-30-terminal-patterns).
  The terminal-window hero — the set's canonical main: HeroSection with
  the right column PREWIRED to a TerminalCard whose command derives
  from the hero's own copyCommand (one string drives the CTA label,
  the clipboard payload AND the typed demo — the whole story from one
  prop). title/badges/secondary stay snippets (hero-section's
  composition-first contract, passed through untouched).

  The set's siblings: pattern-hero-ascii.svelte (the ascii-art
  headline hero) and pattern-hero-marquee.svelte (the badge-marquee
  hero) — three picks of the same landing grammar, one folder.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented; the typing story, the copy
  CTA and the layout all belong to the atoms.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import HeroSection from '$lib/ui/hero-section/hero-section.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import {
    provideUniversalLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
  } from '$lib/defaults.svelte';
  import { PatternHeroSetDefaults } from './pattern-hero-set-defaults.svelte';
  import './pattern-hero-set.css';

  interface Props {
    /** tracked label above the title (brand hue) */
    eyebrow: string;
    /** max-62ch lead paragraph */
    summary: string;
    /** ONE string, three jobs: CTA label + clipboard payload + typed command */
    copyCommand: string;
    /** aria affordance of the default copy CTA */
    copyLabel?: string;
    /** the h1 content — <em> inside carries hero-section's accent paint */
    title?: Snippet;
    /** the badge row content — compose Badge children */
    badges?: Snippet;
    /** extra outline CTAs after the copy button */
    secondary?: Snippet;
    /** the terminal window's title-bar label */
    barTitle?: string;
    /** lines surfaced after the command types out */
    outputs?: readonly string[];
    /** terminal bezel: dark (default lock) | light | system — NOT the
     *  theme axis (W3-D2): the bezel pin forwards VERBATIM to
     *  TerminalCard's shell-theme literal (the context round-2
     *  passthrough exemption); the axis forwards ambient */
    theme?: 'dark' | 'light' | 'system';
    /** typing pace multiplier (1 = authored rhythm; 2 = twice as fast) */
    speed?: number;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (scales the HeroSection root
     *  the set composes — the set renders no root of its own) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    eyebrow,
    summary,
    copyCommand,
    copyLabel = 'copy',
    title,
    badges,
    secondary,
    barTitle = 'quick-start — zsh',
    outputs = ['theme installed', 'hue applied'],
    theme = 'dark',
    speed = 1,
    density,
    size,
    shape,
    radius,
    color,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface, the NO-ROOT composition form (W3-D2 —
  // FIRST-TIME contract, SEVEN lanes, all no-own: the set renders no
  // DOM of its own — HeroSection owns the root). The record resolves
  // through the family contract (the read point) and the SUPPLY is
  // the surface: provideUniversalLanes feeds the composed children's
  // ambient chain (HeroSection stamps the carriers on ITS root — the
  // whole point of 吃也供). No carriers and no query() anchor here —
  // there is no element to stamp or bind; the theme axis forwards
  // ambient (the bezel passthrough owns the prop name)
  const d = $derived(
    PatternHeroSetDefaults.resolve({ density, size, shape, radius, color, elevation, motion }),
  );
  // the record is the family's read point (the A3 law); no root
  // exists to stamp — the SUPPLY below is the surface, so the
  // resolved lanes are deliberately unreferenced past this line
  void d;
  provideUniversalLanes({ density, size, shape, radius, color, elevation, motion });
</script>

<HeroSection
  {eyebrow}
  {summary}
  {copyCommand}
  {copyLabel}
  {title}
  {badges}
  {secondary}
  class={className}
>
  {#snippet terminal()}
    <TerminalCard {barTitle} command={copyCommand} {outputs} {theme} {speed} />
  {/snippet}
</HeroSection>
