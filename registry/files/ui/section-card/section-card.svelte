<!--
  jixoai section card (registry/files/ui/section-card/section-card.svelte).
  The content atom of the site grammar: bordered card, header block with
  eyebrow (brand hue, font-nav, tracked 0.24em), font-nav title, text-pretty
  summary, body snippet slot. tone="hero" is for inner-page heads.

  THE STRUCTURAL SEPARATOR (Owner, 2026-09-03 rev.2): the header zone's
  authored border-b RETIRED — the dividing line is a structural
  <Separator> instance pinned to the header row's bottom edge
  (section-card.css: grid-area 1/1 + align-self end, edge-to-edge, zones
  pad themselves — the Dialog r13/r14 economy). Integer cell placement
  resolves identically standalone and inside every card-grid subgrid
  band, so the line aligns across a row through the equalized header
  row. It ships with the component; consumers never hand-write one.

  DENSITY ADOPTION (Owner, 2026-09-03): the closed density aliases own
  the card's compactness — token-derived formulas that resolve to the
  exact legacy pixels at the default scope (padding-inline inset+1u =
  16px, header padding-block stack+1u = 12px, body stack+2u = 16px,
  eyebrow secondary−¼u = 11px, summary --jx-text/--jx-line = 13/20).
  The old sm: viewport variants RETIRE: compactness is the density
  axis's one job (the kernel's closed-set law) — a second viewport axis
  is how dual-axis drift starts. xs/sm share the spacing rungs by the
  scale's design; they differ on the TEXT step (and that difference now
  actually renders — before adoption the density demo showed four
  pixel-identical panes).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Separator from '../separator/separator.svelte';
  import './section-card.css';
  import { SectionCardDefaults, type SectionCardTone } from './section-card-defaults.svelte';

  interface Props {
    eyebrow?: string;
    title: string;
    summary?: string;
    children: Snippet;
    class?: string;
    headingLevel?: 1 | 2;
    tone?: SectionCardTone;
    /** data-family on the section root (toc-engine parent extent). */
    family?: string;
    /** data-region on the section root (toc-engine leaf). */
    region?: string;
    /** data-region on the HEADER block only — the section's own leaf when
     *  its body carries child regions (non-overlapping by construction). */
    headerRegion?: string;
    /** The line primitive this section plays in the document ontology
     *  (ontology design §2) — emitted as data-role, harvested as
     *  section.role. Default 'section' always ships: the factory default
     *  IS the declaration, no guessing left to the harvester. */
    role?: 'section' | 'entry' | 'sequence' | 'float' | 'note' | 'ref' | 'break';
    /** The ordering semantics the section's children declare (ontology
     *  design §5) — emitted as data-ordering only when passed; absent
     *  means no ordering claim (harvested as null). */
    ordering?: 'linear' | 'alpha' | 'timeline' | 'tree';
  }

  let {
    eyebrow,
    title,
    summary,
    children,
    class: className = '',
    headingLevel = 2,
    tone,
    family,
    region,
    headerRegion,
    role = 'section',
    ordering,
  }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3): one line —
  // tone resolves through the family contract (the literal slot: own
  // 'default' declared in SectionCardDefaults, auditable in one place)
  const d = $derived(SectionCardDefaults.resolve({ tone }));

  const titleClassName = $derived(
    d.tone === 'hero'
      ? 'font-nav max-w-[24ch] text-balance text-[clamp(1.58rem,2.55vw,2.7rem)] tracking-normal leading-[1.2] sm:max-w-[22ch] lg:max-w-[24ch]'
      : 'font-nav text-balance text-[1.05rem] tracking-tight leading-tight sm:text-[1.22rem]',
  );
  const summaryClassName = $derived(
    d.tone === 'hero'
      ? 'max-w-[62ch] text-pretty text-[13px] leading-6 text-foreground/78 sm:text-[14px] sm:leading-6'
      : 'max-w-[64ch] text-pretty [font-size:var(--jx-text)] [line-height:var(--jx-line)] text-muted-foreground',
  );
</script>

<section
  data-jx-section
  class={`border border-border bg-card shadow-2xs ${className}`}
  data-family={family}
  data-region={region}
  data-role={role}
  data-ordering={ordering}
>
  <div
    data-jx-section-header
    class="flex flex-col [gap:calc(var(--jx-stack)_+_var(--jx-unit))] [padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_var(--jx-unit))]"
    data-region={headerRegion}
  >
    {#if eyebrow}
      <p
        class="font-nav text-primary [font-size:calc(var(--jx-text-secondary)_-_calc(var(--jx-unit)_/_4))] uppercase tracking-[0.24em]"
      >
        {eyebrow}
      </p>
    {/if}
    <div class="flex flex-col [gap:calc(var(--jx-stack)_+_calc(var(--jx-unit)_/_2))]">
      {#if headingLevel === 1}
        <h1 class={titleClassName}>{title}</h1>
      {:else}
        <h2 class={titleClassName}>{title}</h2>
      {/if}
      {#if summary}
        <p class={summaryClassName}>{summary}</p>
      {/if}
    </div>
  </div>
  <Separator data-jx-section-sep aria-hidden="true" />
  <div
    data-jx-section-body
    class="[padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_calc(var(--jx-unit)_*_2))]"
  >
    {@render children()}
  </div>
</section>
