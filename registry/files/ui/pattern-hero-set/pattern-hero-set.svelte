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
    /** terminal bezel: dark (default lock) | light | system */
    theme?: 'dark' | 'light' | 'system';
    /** typing pace multiplier (1 = authored rhythm; 2 = twice as fast) */
    speed?: number;
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
    class: className = '',
  }: Props = $props();
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
