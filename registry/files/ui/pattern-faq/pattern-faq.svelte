<!--
  jixoai pattern-faq (registry/files/ui/pattern-faq/pattern-faq.svelte,
  2026-08-30, openspec 2026-08-30-terminal-patterns).
  The man-page FAQ: `{command}({section})` head, a NAME row with the
  print-style dotted leader, then the questions ride the Accordion
  family (details/summary — exclusive by default, FAQ reads better
  one-open; consumer authors AccordionItem children or bare
  <details>), closing on a SEE ALSO line. Nothing here re-implements
  disclosure — the accordion owns semantics, keyboard and SSR state;
  the pattern owns only the man framing.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented; seeAlso stays a snippet so
  links compose as content.

  tailwindless one-shot W1 (2026-09-17): the framing paint rides the
  pattern's stylex atoms (pattern-faq.stylex.ts); the man LABEL voice
  (NAME / SEE ALSO) is the :where(.jx-man-label) semantic rule in
  pattern-faq.css (font-bold has no weight token — the tl-eyebrow
  composite precedent).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '$lib/ui/icon';
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { PatternFaqDefaults } from './pattern-faq-defaults.svelte';
  import { patternFaqStyles } from './pattern-faq.stylex';
  import './pattern-faq.css';

  interface Props {
    /** the man page's command name (head line) */
    command?: string;
    /** the man section number (7 = miscellany — the honest FAQ home) */
    section?: string;
    /** the NAME row's one-line description */
    summary?: string;
    /** one open at a time (default true — FAQ reads better exclusive) */
    exclusive?: boolean;
    /** the SEE ALSO footer content — compose links here */
    seeAlso?: Snippet;
    /** the questions: AccordionItem children (or bare <details>) */
    children: Snippet;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the composed Accordion rides
     *  the ambient chain — the composition law) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  let {
    command = 'jixoai-ui-faq',
    section = '7',
    summary = 'frequently asked questions, answered in the open',
    exclusive = true,
    seeAlso,
    children,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: the man framing is a composition product; the size axis
  // scales the article root, the Accordion's axis surface rides the
  // ambient chain — the whole point of 吃也供)
  const d = $derived(
    PatternFaqDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<article
  data-jx-pattern-faq=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={`${cx(patternFaqStyles.shell)} ${className}`}
  aria-label={`${command}(${section}) — frequently asked questions`}
>
  <header class={cx(patternFaqStyles.header)}>
    <p class={cx(patternFaqStyles.commandRow)}>
      <span class={cx(patternFaqStyles.commandIcon)} aria-hidden="true"><Icon name="fileText" /></span>
      <strong class={cx(patternFaqStyles.commandName)}>{command}</strong>
      <span class={cx(patternFaqStyles.commandSection)}>({section})</span>
    </p>
    <p data-jx-pattern-faq-name="" class="jx-man-row {cx(patternFaqStyles.nameRow)}">
      <span class="jx-man-label">NAME</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class={cx(patternFaqStyles.summary)}>{summary}</span>
    </p>
  </header>

  <div class={cx(patternFaqStyles.questions)}>
    <Accordion {exclusive}>
      {@render children()}
    </Accordion>
  </div>

  <footer class={cx(patternFaqStyles.footer)}>
    <p data-jx-pattern-faq-see-also="" class="jx-man-row {cx(patternFaqStyles.seeAlsoRow)}">
      <span class="jx-man-label">SEE ALSO</span>
      <span class="jx-man-leader" aria-hidden="true"></span>
      <span class={cx(patternFaqStyles.seeAlsoContent)}>
        {#if seeAlso}
          {@render seeAlso()}
        {:else}
          <span class={cx(patternFaqStyles.seeAlsoDefault)}>jixoai-ui(1), patterns(7)</span>
        {/if}
      </span>
    </p>
  </footer>
</article>
