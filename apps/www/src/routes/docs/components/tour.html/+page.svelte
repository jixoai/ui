<!--
  Docs page for tour (openspec 2026-08-30-table-grid-toolbar, on top of
  the 2026-08-25 composition-first-apis base).

  docs-demo-standard skeleton: Intro → Install → live demo (the default
  card workbench) → Usage (the ONE h2) → Examples (ability-named
  recipes: non-modal scroll, placement matrix + the 12-placement
  reference table, custom indicators) → the card(api) section →
  Accessibility → API → Theming → See also.

  Composition law: the tour ships no placement prop and no modal mode
  (non-modal is its contract). The placement recipes override the
  card's anchor geometry from the PAGE (consumer CSS on public
  structure); the missing placement prop is recorded in the change's
  followups.md, never silently worked around.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Tour from '$lib/ui/tour/index';
  import Table from '$lib/ui/table/table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { CATALOG } from '$lib/catalog';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tourSource from '$lib/ui/tour/tour.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'tour');
  if (!entry) {
    throw new Error('catalog miss: "tour" has no registry meta — fix registry.json');
  }

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { finishedAt: null as number | null };
  let open = $state(false);
  let cardOpen = $state(false);
  let finishedAt = $state<number | null>(canvasInitial.finishedAt);
  function resetCanvas(): void {
    finishedAt = canvasInitial.finishedAt;
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Tour from '@ui/tour.svelte';
${close}

<Tour
  bind:open
  steps={[
    { target: '#deploy-card', title: 'Connect', description: 'the lease lands here' },
    { target: '#checks-card', title: 'Verify', description: '…and moves here' },
  ]}
>
  {#snippet card(api)}
    <p class="font-nav text-xs uppercase">{api.step.title}</p>
    <div class="flex gap-2">
      <button type="button" onclick={api.prev} disabled={api.index === 0}>back</button>
      <button type="button" onclick={api.next}>
        {api.index === api.total - 1 ? 'done' : 'next'}
      </button>
      <button type="button" onclick={api.skip}>skip</button>
    </div>
  {/snippet}
</Tour>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/tour/tour.svelte', content: tourSource },
    { name: 'src/lib/ui/tour-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ---- recipe: non-modal scroll ------------------------------------------
  let nonModalOpen = $state(false);

  const nonModalUsage = `<script lang="ts">
  let open = $state(false);
${close}

<!-- non-modal is the CONTRACT, not an option: no focus trap, no inert,
     no overflow clamp — the page (and any inner scrollbox) stays live,
     the tint is pointer-events:none. -->
<PressButton onclick={() => (open = true)}>start the tour</PressButton>

<div class="max-h-48 overflow-y-auto">
  <section id="deploy-card">…</section>
  <div style="height: 24rem"></div>
  <section id="checks-card">…</section>
</div>

<Tour
  bind:open
  steps={[
    { target: '#deploy-card', title: 'Deploy', description: 'scroll away — it stays free' },
    { target: '#checks-card', title: 'Checks', description: 'the tint never intercepts pointers' },
  ]}
/>`;

  // ---- recipe: placement matrix ------------------------------------------
  const placementInitial = { top: false, left: false, right: false, bottom: false };
  let placeTop = $state(placementInitial.top);
  let placeLeft = $state(placementInitial.left);
  let placeRight = $state(placementInitial.right);
  let placeBottom = $state(placementInitial.bottom);
  function resetPlacement(): void {
    placeTop = placementInitial.top;
    placeLeft = placementInitial.left;
    placeRight = placementInitial.right;
    placeBottom = placementInitial.bottom;
  }

  const placementUsage = `<!-- The card places below its target by default
     (tour.css: top: anchor(bottom)). Placement control composes as a
     page-level override of the card's anchor geometry — a placement
     PROP is the recorded followup (change followups.md). -->
<div class="tour-place-top">
  <Tour bind:open steps={[{ target: '#card', title: 'Above' }]} />
</div>

<style>
  .tour-place-top :global(.jx-tour) {
    top: auto;
    bottom: anchor(top);
    margin-bottom: var(--jx-tour-gap, 12px);
  }
  .tour-place-left :global(.jx-tour) {
    top: anchor(top);
    left: auto;
    right: anchor(left);
    margin-right: var(--jx-tour-gap, 12px);
  }
  .tour-place-right :global(.jx-tour) {
    top: anchor(top);
    left: anchor(right);
    margin-left: var(--jx-tour-gap, 12px);
  }
  /* bottom is the shipped default: top: anchor(bottom) */
</style>`;

  // the 12-placement reference table (antd's placement set, mapped to
  // the anchor() expressions the override composes)
  const placements: { placement: string; block: string; inline: string }[] = [
    { placement: 'top', block: 'bottom: anchor(top)', inline: 'left: anchor(center)' },
    { placement: 'top-start', block: 'bottom: anchor(top)', inline: 'left: anchor(left)' },
    { placement: 'top-end', block: 'bottom: anchor(top)', inline: 'right: anchor(right)' },
    { placement: 'bottom', block: 'top: anchor(bottom)', inline: 'left: anchor(center)' },
    { placement: 'bottom-start', block: 'top: anchor(bottom)', inline: 'left: anchor(left)' },
    { placement: 'bottom-end', block: 'top: anchor(bottom)', inline: 'right: anchor(right)' },
    { placement: 'left', block: 'right: anchor(left)', inline: 'top: anchor(center)' },
    { placement: 'left-start', block: 'right: anchor(left)', inline: 'top: anchor(top)' },
    { placement: 'left-end', block: 'right: anchor(left)', inline: 'top: anchor(bottom)' },
    { placement: 'right', block: 'left: anchor(right)', inline: 'top: anchor(center)' },
    { placement: 'right-start', block: 'left: anchor(right)', inline: 'top: anchor(top)' },
    { placement: 'right-end', block: 'left: anchor(right)', inline: 'top: anchor(bottom)' },
  ];

  // ---- recipe: custom indicators ------------------------------------------
  let indicatorOpen = $state(false);

  const indicatorsUsage = `<script lang="ts">
  let open = $state(false);
${close}

<Tour bind:open steps={[…]>
  {#snippet card(api)}
    <p>{api.step.title}</p>
    <!-- the indicators: one dot per step, the live index painted -->
    <div role="group" aria-label="tour progress" class="flex gap-1">
      {#each Array.from({ length: api.total }, (_, i) => i) as i (i)}
        <span aria-hidden="true" class:list={['dot', i === api.index && 'dot-on']}></span>
      {/each}
    </div>
    <div class="flex gap-2">
      <button type="button" onclick={api.prev} disabled={api.index === 0}>back</button>
      <button type="button" onclick={api.next}>
        {api.index === api.total - 1 ? 'done' : 'next'}
      </button>
    </div>
  {/snippet}
</Tour>`;

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------

  // the card-type pair (types section), swept through a canvas: the
  // default-card trigger and the card(api) trigger — the tours mount at
  // the page level (popover top layer), the stage keeps the trigger cells
  const tourTypesDemo = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
  import Tour from '@ui/tour.svelte';
${close}

let open = $state(false);
let cardOpen = $state(false);

<div class="grid w-full gap-4 sm:grid-cols-2">
  <div class="border border-border p-4"><PressButton onclick={() => (open = true)}>default card tour</PressButton></div>
  <div class="border border-border p-4"><PressButton onclick={() => (cardOpen = true)}>card(api) tour</PressButton></div>
</div>

<!-- the default card: steps metadata renders as title/description -->
<Tour
  bind:open
  steps={[
    { target: '[data-tour-demo-a]', title: 'Target A', description: 'the lease lands here' },
    { target: '[data-tour-demo-b]', title: 'Target B' },
  ]}
/>

<!-- the card(api) snippet authors the whole interior -->
<Tour bind:open={cardOpen} steps={[
  { target: '[data-tour-demo-a]', title: 'Target A' },
  { target: '[data-tour-demo-b]', title: 'Target B' },
]}>
  {#snippet card(api)}
    <p>{api.step.title} · {api.index + 1}/{api.total}</p>
    <div class="flex gap-2">
      <button type="button" onclick={api.prev} disabled={api.index === 0}>back</button>
      <button type="button" onclick={api.next}>{api.index === api.total - 1 ? 'done' : 'next'}</button>
      <button type="button" onclick={api.skip}>skip</button>
    </div>
  {/snippet}
</Tour>`;

  const tourTypesFiles: TreeFile[] = [
    { name: 'tour-types-demo.svelte', content: tourTypesDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((s): s is NonNullable<(typeof s)> => Boolean(s))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  let uniTourOpen = $state(false);
  let uniTourOpen2 = $state(false);
  let uniTourOpen3 = $state(false);
  const universalUsage = `<Tour bind:open size={18} density="small" theme="dark" elevation="level4" steps={[…]} />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/tour-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 45) — every cell measured on
  // the served DOM (probe) or negative-grepped over ui/tour/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "RUNG-STAMPED, CARD-PAINT-UNREAD — data-density lands on the CARD root (self-carried through the promotion, measured seat) and the composed controls' rhythm follows it, but the card's own voices ride STATIC steps (--jx-text-base 13px / --text-label — zero coefficient readers in the card paint, grep receipt). Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY for the family's paint — zero --jx-size-effective readers over ui/tour/ (grep receipt); the carrier's font-size lands on the card root so composed card-snippet content scales, while the default card's title/description stay pinned to their token steps. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero --jx-shape-effective readers over ui/tour/ (grep receipt). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE §3/§14 POPOVER-DIALECT STAMP — the card root composes --jx-radius-consumed per render (explicit: radius-effective × the §14 factor; auto: the concentric max(0px, R − P) calc — tour.svelte:226-230). Measured on the served DOM (probe, task 45); the visible consumption story lives with the card's surface paint. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — zero --jx-color-effective readers over ui/tour/ (grep receipt); the card's ink is the popover token set + the Next chip's brand lean (--jx-primary). Omitted from rest (the §1 interception — Props extends Omit<HTMLAttributes, 'color'>). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE SPLIT ISLAND (measured, probe): the carriers stamp the CARD root — class:dark makes the card its own .dark scope THROUGH the popover promotion, the ground re-derives there (the level table's dark side via the jx-surface fill chain), while the :root-pinned ink aliases (--jx-foreground/--jx-muted-foreground) hold the root's values, and the HOLE — the panel's SIBLING — keeps the ROOT scope entirely, so the spotlight always follows the page theme, never the card's island. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level2' · Own default, not ambient`,
      description:
        "OWN level2, CONSUMED — the anchored card's menu rung (3dp, the popover/dropdown-menu law): elevationSurfaceOf stamps --jx-elevation-shadow/--jx-elevation-surface/--jx-surface-solid-fill on the card root and the SHARED surface law reads them as the fill chain's HEAD (jixoai.css .jx-surface-body) + the WAAPI shadow child. Number lane: exact dp snapped DOWN to the table rung.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE FAMILY OWNS THE MOTION, AXIS UNREAD — open/close ride the shared WAAPI surface-motion kernel (--jx-p 0→1 at showPopover/hidePopover, the real shadow child in lockstep; step moves are pure CSS anchor repositioning, NO JS animation); reduced-motion neutralizes the kernel in one place (the jx-waapi law). Zero --jx-motion-effective readers (grep receipt). Number unit: coefficient.",
    },
  ];
</script>

<svelte:head>
  <title>Tour · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tour: the guided walkthrough — steps stay behavior-domain data, the card opens to a card(api) snippet; non-modal by contract (the page never locks), placement composed as page-level anchor geometry with the 12-placement reference, custom step indicators through the card snippet."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · contract"
      title="tour — targets stay data, the card opens"
      summary={entry.summary}
    >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install tour">
          <TerminalCard
            barTitle="install — tour"
            command="npx jixoai-ui add tour"
            outputs={['https://ui.jixoai.com/r/tour.json']}
          />
        </div>
      {/snippet}

      <div class={cx(rt.wrap12)}>
        <span class="pill">anchor-name lease</span>
        <span class="pill">box-shadow hole</span>
        <span class="pill">non-modal</span>
        <span class="pill">card(api) snippet</span>
        <span class="pill">placement + indicator recipes</span>
      </div>
    </SectionCard>
  </div>


  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="The guided walkthrough: targets stay behavior-domain data, the spotlight is pure CSS anchor geometry over a reversible anchor-name lease, and the card is a non-modal popover=manual dialog that lands its focus on Next and restores the invoker's on finish."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          A tour step is one target plus metadata; the component owns the lifecycle. The LEASE:
          each step's target takes the panel's anchor-name (its prior inline value saved), and
          on advance, close, or unmount the exact prior state is restored — a reversible lease,
          capability wiring, never style authoring. The SPOTLIGHT: the hole is a target-sized
          transparent window cut by anchor-size() with one huge box-shadow tint — zero geometry
          JS; engines without anchor positioning degrade to a full-viewport tint with no hole,
          and the panel falls back to a centered fixed card, never silently misplaced.
        </p>
        <p class={cx(rt.para)}>
          The card is NON-MODAL by contract: popover="manual" + role="dialog" +
          aria-modal="false" — no focus trap, no inert, the page (and any inner scrollbox)
          stays live, and the tint is pointer-events:none. FOCUS: open lands focus on the Next
          button and re-lands it on EVERY step change (the named dialog announces the new
          step's title as focus arrives — the per-step announcement is the focus move, the
          "1 / n" counter stays aria-hidden decoration); Escape or Skip finishes and the
          invoker's focus is restored. Targets re-resolve every step: invalid selectors are
          caught, missing or hidden targets are UNAVAILABLE and skipped deterministically in
          the travel direction, and a target merely out of view is scrolled to with
          scrollIntoView(nearest) — never a scroll clamp.
        </p>
        <p class={cx(rt.para)}>
          Delivery shape: a SELF-CARRIED PROMOTION — the card rides popover="manual" into the
          top layer, so the axis carriers stamp the CARD root itself; the hole is the panel's
          SIBLING and keeps the ROOT scope, so a theme island on the card never reaches the
          spotlight (measured). The keys: the tour renders ONE card — there is no step-list DOM
          (the LAW #18 surface is empty by construction); the recipe dots each keys the index.
          The eight axes: elevation is OWN level2 and consumed as the jx-surface fill chain's
          head, radius composes the §3/§14 popover-dialect stamp on the card root, density rung
          + theme island stamp self-carried, and size/shape/color/motion carry the supply
          chain. Kinship: <code class={cx(rt.inkPrimary)}>popover</code> (the anchored-panel
          law), <code class={cx(rt.inkPrimary)}>system-dialog</code> (the modal interruption
          the tour refuses to be), <code class={cx(rt.inkPrimary)}>steps</code> (the static
          progress analog).
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="live-demo" data-region="live-demo" data-reveal="">
    <ComponentCanvas
      title="tour"
      description="The default card: start it — the first demo card takes the lease (inspect its style), the hole+tint frame it. Next advances (←/→ also work), the last step's button reads Finish, Escape or Skip ends with focus back on the opener. No card snippet — the default card renders the steps' title/description metadata."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour/tour.svelte"
      files={canvasFiles}
      stage="start"
      onreset={resetCanvas}
      output={[{ label: 'finished at step', value: finishedAt ?? '—' }]}
    >
      <div class={cx(rt.col24, rt.itemsStart)}>
        <div class={cx(rt.rowC16, rt.wrap)}>
          <PressButton onclick={() => (open = true)}>start the tour</PressButton>
        </div>
        <div class="jx-tour-demo-grid {cx(rt.wFull, rt.maxW2xl)}">
          <section data-tour-demo-a class={cx(rt.panel, rt.bgCard)}>
            <p class={cx(rt.fontNav, rt.text12, rt.upper, rt.track12)}>demo target A</p>
            <p class={cx(rt.noteSmall)}>this card receives the anchor-name lease on step 1</p>
          </section>
          <section data-tour-demo-b class={cx(rt.panel, rt.bgCard)}>
            <p class={cx(rt.fontNav, rt.text12, rt.upper, rt.track12)}>demo target B</p>
            <p class={cx(rt.noteSmall)}>…and this one on step 2; the lease moves with the tour</p>
          </section>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the tour is non-modal: the page stays scrollable and the tint never intercepts pointers
            (a modal/guided mode would be a separate surface by contract). Missing/hidden targets
            are skipped forward deterministically; if every step is unavailable the tour ends at
            once.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Steps stay data (targets are behavior-domain, driver.js precedent); the card snippet receives TourApi — index, total, step, next/prev/skip."
    >
      <CodeBlock code={usage} lang="svelte" meta="Tour usage" />
    </SectionCard>
  </div>

  <!-- examples -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named recipes: the non-modal scroll proof, the placement matrix, and custom step indicators."
    >
      <p class={cx(rt.bodyMuted, rt.m0)}>
        Non-modal is the tour's contract, placement and indicators are compositions over the
        public card/anchor surface — the missing placement prop is recorded in the change's
        followups.md.
      </p>
    </SectionCard>
  </div>

  <!-- recipe: non-modal scroll -->
  <div id="tour-non-modal" data-region="tour-non-modal" data-family="tour-non-modal" data-reveal="">
    <ComponentCanvas
      title="with non-modal scroll"
      description="Start the tour inside a tall, scrollable log — then scroll BOTH the box and the page while it runs: nothing locks. The tint frames the leased target with pointer-events:none, aria-modal stays false, and a target that scrolls away is brought back with scrollIntoView(nearest) on step change — never a scroll clamp."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour/tour.svelte"
      files={[
        { name: 'registry/files/ui/tour/tour.svelte', content: tourSource },
        { name: 'src/lib/ui/tour-non-modal-usage.svelte', content: nonModalUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'aria-modal', value: 'false' }, { label: 'tint', value: 'pointer-events:none' }]}
    >
      <div class={cx(rt.col16, rt.wFull, rt.maxW2xl)}>
        <PressButton onclick={() => (nonModalOpen = true)}>start the non-modal tour</PressButton>
        <div class="tour-scroll-surface">
          <section data-tour-log-a class={cx(rt.frame, rt.bgCard, rt.p12)}>
            <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>log head</p>
            <p class={cx(rt.noteSmall, rt.m0)}>step 1 leases this block — scroll the box while it runs</p>
          </section>
          <div class={cx(rt.tourSpacer72)} aria-hidden="true"></div>
          <section data-tour-log-b class={cx(rt.frame, rt.bgCard, rt.p12)}>
            <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>log tail</p>
            <p class={cx(rt.noteSmall, rt.m0)}>step 2 — the page and this scrollbox never locked</p>
          </section>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The proof of non-modality is negative: no overflow:hidden lands on body or
            documentElement, the tint is pointer-events:none, the dialog carries aria-modal=false
            and popover=manual. A modal/guided tour would be its own surface by contract — never
            a mode bolted onto this one.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: placement matrix -->
  <div id="tour-placement" data-region="tour-placement" data-family="tour-placement" data-reveal="">
    <ComponentCanvas
      title="with placement control"
      description="Four quadrant targets, four tours — the card places above, beside (start/end) or below its leased target. The geometry is a page-level override of the card's anchor() expressions (the wrapper class scopes each tour); bottom is the shipped default."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour/tour.svelte"
      files={[
        { name: 'registry/files/ui/tour/tour.svelte', content: tourSource },
        { name: 'src/lib/ui/tour-placement-usage.svelte', content: placementUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetPlacement}
      output={[
        { label: 'top', value: placeTop ? 'running' : 'idle' },
        { label: 'left', value: placeLeft ? 'running' : 'idle' },
        { label: 'right', value: placeRight ? 'running' : 'idle' },
        { label: 'bottom', value: placeBottom ? 'running' : 'idle' },
      ]}
    >
      <div class="jx-tour-quadrant-grid {cx(rt.wFull, rt.maxW2xl)}">
        <section data-tour-place-top-target class={cx(rt.panel, rt.bgCard)}>
          <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>target · top quadrant</p>
          <div class="tour-place-top {cx(rt.mt8)}">
            <PressButton variant="outline" onclick={() => (placeTop = true)}>place card above</PressButton>
            <Tour
              bind:open={placeTop}
              steps={[{ target: '[data-tour-place-top-target]', title: 'Above', description: 'bottom: anchor(top) — the card rides the target’s top edge' }]}
            />
          </div>
        </section>
        <section data-tour-place-left-target class={cx(rt.panel, rt.bgCard)}>
          <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>target · start quadrant</p>
          <div class="tour-place-left {cx(rt.mt8)}">
            <PressButton variant="outline" onclick={() => (placeLeft = true)}>place card before</PressButton>
            <Tour
              bind:open={placeLeft}
              steps={[{ target: '[data-tour-place-left-target]', title: 'Before', description: 'right: anchor(left) — the card rides the inline-start edge' }]}
            />
          </div>
        </section>
        <section data-tour-place-right-target class={cx(rt.panel, rt.bgCard)}>
          <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>target · end quadrant</p>
          <div class="tour-place-right {cx(rt.mt8)}">
            <PressButton variant="outline" onclick={() => (placeRight = true)}>place card after</PressButton>
            <Tour
              bind:open={placeRight}
              steps={[{ target: '[data-tour-place-right-target]', title: 'After', description: 'left: anchor(right) — the card rides the inline-end edge' }]}
            />
          </div>
        </section>
        <section data-tour-place-bottom-target class={cx(rt.panel, rt.bgCard)}>
          <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>target · bottom quadrant</p>
          <div class={cx(rt.mt8)}>
            <PressButton variant="outline" onclick={() => (placeBottom = true)}>place card below</PressButton>
            <Tour
              bind:open={placeBottom}
              steps={[{ target: '[data-tour-place-bottom-target]', title: 'Below', description: 'top: anchor(bottom) — the shipped default geometry' }]}
            />
          </div>
        </section>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Each wrapper class overrides the card's anchor() expressions for exactly one tour —
            scoped CSS, zero JS geometry. The 12-placement table below documents the full matrix
            (block edge × inline alignment); a placement prop consuming it is the recorded
            followup.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the 12-placement reference table -->
  <div id="tour-placement-table" data-reveal="">
    <SectionCard
      family="tour-placement-table"
      headerRegion="tour-placement-table"
      eyebrow="reference"
      title="The 12 placements, as anchor expressions"
      summary="Every antd-style placement maps to one block edge plus one inline alignment over the leased target's anchor() box. The four quadrant demos above exercise one per block edge; the rest are the same law with the inline term swapped."
    >
      <Table caption="tour card placements — anchor() expressions" stack={false}>
        <thead>
          <tr>
            <th scope="col">placement</th>
            <th scope="col">block expression</th>
            <th scope="col">inline expression</th>
          </tr>
        </thead>
        <tbody>
          {#each placements as row (row.placement)}
            <tr>
              <td class={cx(rt.fontMono, rt.text12)}>{row.placement}</td>
              <td class={cx(rt.note12, rt.fontMono)}>{row.block}</td>
              <td class={cx(rt.note12, rt.fontMono)}>{row.inline}</td>
            </tr>
          {/each}
        </tbody>
      </Table>
    </SectionCard>
  </div>

  <!-- recipe: custom indicators -->
  <div id="tour-indicators" data-region="tour-indicators" data-family="tour-indicators" data-reveal="">
    <ComponentCanvas
      title="with custom indicators"
      description="The card(api) snippet renders step dots from index/total — the live dot follows every next/prev. Dots are aria-hidden decoration; the group label and the step title carry the progress to assistive tech."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour/tour.svelte"
      files={[
        { name: 'registry/files/ui/tour/tour.svelte', content: tourSource },
        { name: 'src/lib/ui/tour-indicators-usage.svelte', content: indicatorsUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'indicator', value: 'dots · card(api)' }]}
    >
      <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
        <PressButton onclick={() => (indicatorOpen = true)}>start the indicator tour</PressButton>
        <div class="jx-tour-demo-grid {cx(rt.wFull)}">
          <section data-tour-ind-a class={cx(rt.frame, rt.bgCard, rt.p12)}>
            <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>indicator target A</p>
          </section>
          <section data-tour-ind-b class={cx(rt.frame, rt.bgCard, rt.p12)}>
            <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.track12)}>indicator target B</p>
          </section>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            api.index and api.total are the whole indicator surface — dots, progress bars,
            counters all compose from them. Keep the glyphs aria-hidden and let the dialog's
            aria-label (the step title) announce position.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tour-card" data-reveal="">
    <SectionCard
      family="tour-card"
      headerRegion="tour-card"
      eyebrow="composition"
      title="The card(api) snippet"
      summary="steps stay data — targets are behavior domain (driver.js precedent) and title/description are metadata for the DEFAULT card. When you need the interior your way, the card snippet receives TourApi: index, total, the current step object, and next/prev/skip wired to the same lifecycle (spotlight, lease, Escape, deterministic skips). The label props died — callers author the buttons."
    >
      <div class={cx(rt.col20)}>
        <div class={cx(rt.rowC16, rt.wrap)}>
          <PressButton onclick={() => (cardOpen = true)}>start the custom-card tour</PressButton>
          <span class={cx(rt.noteSmall)}>targets live in the workbench above — scroll up if they left the viewport</span>
        </div>
        <pre class={cx(rt.note12, rt.lead5, rt.oxAuto)}>TourApi = &#123; index, total, step: TourStep, next(), prev(), skip() &#125;</pre>
      </div>
    </SectionCard>
  </div>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Tour variants" summary="Card types over the same lifecycle: the default card renders the steps' title/description metadata; the card(api) snippet authors the whole interior (the indicators recipe lives here).">
    <ComponentCanvas title="tour · variants" stage="fill" files={tourTypesFiles}>
      <div class={cx(rt.tourGrid)}>
        <div class={cx(rt.panel)}><PressButton onclick={() => (open = true)}>default card tour</PressButton></div>
        <div class={cx(rt.panel)}><PressButton onclick={() => (cardOpen = true)}>card(api) tour</PressButton></div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The hole is sized by anchor-size() with zero geometry JS; the panel rides the shared surface-motion kernel."><div class={cx(rt.col20)}><DensityDemo><PressButton onclick={() => (open = true)}>start</PressButton></DensityDemo><TokenTable tokens={[{ name: '--jx-tour-{id}', default: 'anchor-name lease', source: 'component', description: 'Per-instance lease set on the current target; restored on advance/close/unmount.' }, { name: '--jx-tour-gap', default: '12px', source: 'component', description: 'Panel offset from the leased target — the placement recipes reuse it as the margin term.' }, { name: 'tint', default: 'var(--scrim)', source: 'color', description: 'The hole tint: the scrim family token (dims black in light, lifts white in dark) — the anchored form re-places the fill with a transparent hole + one 100vmax box-shadow.' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'Shared surface-motion kernel driving open/close (step moves ride the live anchor axis — no JS geometry).' }, { name: 'hole border', default: '1px solid var(--primary)', source: 'structural', description: 'The anchored hole outlines the leased target.' }, { name: '--jx-radius-consumed', default: '§3/§14 composition', source: 'structural', description: 'The card root\u2019s radius stamp: explicit lane = radius-effective × the factor; auto = the concentric max(0px, R − P) calc.' }, { name: 'elevation own', default: 'level2', source: 'structural', description: 'The anchored card\u2019s menu rung — the pair feeds the jx-surface fill chain head + the WAAPI shadow child.' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Trigger target through the composed control.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="TourApi = &#123; index, total, step: TourStep, next(), prev(), skip() &#125; — the card snippet's whole surface. No placement prop (composed as page CSS — the recorded followup); no modal mode (non-modal is the contract)."><div class={cx(rt.col32)}><PropsTable universal props={[{ name: 'steps', type: 'TourStep[]', default: '—', description: 'Targets + title/description metadata (behavior-domain data).', required: true }, { name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state — the tour runs while true.', bindable: true }, { name: 'startAt', type: 'number', default: '0', description: 'Zero-based first step; skipped-forward past unavailable ones.' }, { name: 'onfinish', type: '(index: number) => void', default: '—', description: 'Fires when the tour finishes (end reached, skipped, or all steps unavailable).' }, { name: 'onstep', type: '(index: number) => void', default: '—', description: 'Step change notification (analytics/progress).' }, { name: 'card', type: 'Snippet<[TourApi]>', default: '—', description: 'Replaces the default card interior; receives TourApi — the indicators recipe composes here.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface variant for the card. Defaults: literal slot — own \'auto\', ambient when an axis opens (the dialog/sheet grammar).' }, { name: 'class', type: 'string', default: "''", description: 'Extra classes on the card panel.' }]} /><PropsTable title="TourStep" props={[{ name: 'target', type: 'string | () => HTMLElement | null', default: '—', description: 'CSS selector for the step’s target, or a resolver; invalid selectors read as unavailable.', required: true }, { name: 'title', type: 'string', default: '—', description: 'Metadata for the default card (a custom card renders or ignores it).' }, { name: 'description', type: 'string', default: '—', description: 'Metadata for the default card.' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The card rides popover='manual' (a top-layer promotion), so the carriers stamp the CARD root itself — self-carried across the promotion (the batch C portal law); elevation carries the family own level2 (the anchored card's menu rung). Open a demo card to see the lanes live."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the SELF-CARRIED PROMOTION (popover="manual" puts the card in the top layer,
          so the carriers stamp the CARD root — data-density, class:dark, the elevation pair,
          the radius composition; a trigger ancestor's CSS carriers never span the promotion),
          the focus law (open lands focus on Next and re-lands it on every step; Escape/Skip/
          Finish all restore the invoker's focus — measured on real interactions, probe task
          45), the LEASE receipts (the target's style.anchor-name carries the panel's
          per-instance lease while its step runs and the prior inline value — or none — is
          restored verbatim on advance and close), the placement receipts (the card's
          top/left track the leased target's anchor() box — bottom default = target bottom +
          the 12px gap; the four quadrant recipes ride page-level overrides of the SAME
          expressions), the scroll-into-view receipt (an out-of-view target is brought to
          view with scrollIntoView(nearest) on lease), the announcement discipline (the named
          dialog re-announces the step title through the focus move; the "1 / n" counter and
          the recipe dots are aria-hidden), the theme split (the card's island vs the hole's
          root scope — measured) and LAW #19 (duplicate ids NONE page-wide) were measured on
          this page's served DOM (probe, task 45). KEYED-EACH: the tour renders ONE card —
          there is no step-list DOM; the indicator dots each keys the index (unique by
          construction). LAW #19 id landscape: duplicate ids NONE page-wide.
        </p>
        <div class={cx(rt.mt20, rt.wFull)}>
          <ComponentCanvas title="Tour · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)} id="uni-tour-a"><p>step one's target</p></div>
<div class={cx(rt.panel)}><Tour bind:open={uniTourOpen} size={18} density="small" steps={[{ target: '#uni-tour-a', title: 'axes joined', description: 'one number moves the walkthrough card' }]} /></div>
<div class={cx(rt.panel)}><Tour bind:open={uniTourOpen2} size="medium" radius="large" steps={[{ target: '#uni-tour-a', title: 'named steps', description: 'medium/large resolve through the alias-ladder vars' }]} /></div>
<div class={cx(rt.panel)}><Tour bind:open={uniTourOpen3} theme="dark" elevation="level4" steps={[{ target: '#uni-tour-a', title: 'dark island · level4', description: 'the carriers ride the promotion; the hole stays on the page theme' }]} /></div>
<div class={cx(rt.panel)}><PressButton variant="outline" onclick={() => (uniTourOpen = true)}>open tour · size 18</PressButton> <PressButton variant="outline" onclick={() => (uniTourOpen2 = true)}>open tour · named steps</PressButton> <PressButton variant="outline" onclick={() => (uniTourOpen3 = true)}>open tour · dark island</PressButton></div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Non-modal by contract — no focus trap, the page stays scrollable, and finishing restores the invoker's focus."><A11yTable keys={[{ key: '→', action: 'Advance to the next enterable step' }, { key: '←', action: 'Go back one step' }, { key: 'Enter', action: 'Next (the focused button’s default path)' }, { key: 'Escape', action: 'End the tour — focus returns to the opener' }]} aria={[{ name: 'role', value: 'dialog', description: 'The card panel; landing focus sits on Next (or the panel with a custom card).' }, { name: 'aria-modal', value: 'false', description: 'Non-modal: no trap, no inert, the page scrolls.' }, { name: 'popover', value: 'manual', description: 'Top-layer card + tint; the scrim is pointer-events:none.' }, { name: 'aria-label', value: 'step.title', description: 'The dialog is named by the current step.' }, { name: 'aria-hidden', value: 'true (recipe)', description: 'Indicator dots stay decoration; the named dialog carries progress.' }]} /></SectionCard></div>
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="tour" />
  </div>
</div>

<!-- the workbench + card tours (bound to the targets above) -->
<Tour
  bind:open
  steps={[
    { target: '[data-tour-demo-a]', title: 'Target A', description: 'the lease lands here — inspect style.anchor-name' },
    { target: '[data-tour-demo-b]', title: 'Target B', description: 'the lease moved; A was restored' },
  ]}
  onfinish={(i) => (finishedAt = i)}
/>

<Tour
  bind:open={cardOpen}
  steps={[
    { target: '[data-tour-demo-a]', title: 'Target A' },
    { target: '[data-tour-demo-b]', title: 'Target B' },
  ]}
  onfinish={(i) => (finishedAt = i)}
>
  {#snippet card(api)}
    <p data-tour-card-title="" class={cx(rt.m0, rt.fontNav, rt.text13, rt.upper, rt.track10, rt.inkFg)}>
      {api.step.title} · {api.index + 1}/{api.total}
    </p>
    <div data-tour-card-actions="" class={cx(rt.rowC12, rt.mt4, rt.justifyBetween)}>
      <button
        type="button"
        data-tour-card-skip=""
        class={cx(rt.tourSkipGhost)}
        onclick={api.skip}
      >
        skip
      </button>
      <div class={cx(rt.row8)}>
        <button
          type="button"
          data-tour-card-prev=""
          class={cx(rt.tourCtlGhost)}
          disabled={api.index === 0}
          onclick={api.prev}
        >
          back
        </button>
        <button
          type="button"
          data-tour-card-next=""
          class={cx(rt.framePrimary, rt.inlineFlex, rt.cursorPointer, rt.appearanceNone, rt.bgBackground, rt.px14, rt.py6, rt.fontNav, rt.text11, rt.upper, rt.track10, rt.inkPrimary, rt.shadow2xs)}
          onclick={api.next}
        >
          {api.index === api.total - 1 ? 'done' : 'next'}
        </button>
      </div>
    </div>
  {/snippet}
</Tour>

<!-- the non-modal recipe tour -->
<Tour
  bind:open={nonModalOpen}
  steps={[
    { target: '[data-tour-log-a]', title: 'Log head', description: 'scroll the box and the page — nothing locks' },
    { target: '[data-tour-log-b]', title: 'Log tail', description: 'the tint never intercepted a single pointer' },
  ]}
/>

<!-- the indicators recipe tour -->
<Tour
  bind:open={indicatorOpen}
  steps={[
    { target: '[data-tour-ind-a]', title: 'Indicator A' },
    { target: '[data-tour-ind-b]', title: 'Indicator B' },
  ]}
>
  {#snippet card(api)}
    <p class={cx(rt.m0, rt.fontNav, rt.text13, rt.upper, rt.track10, rt.inkFg)}>{api.step.title}</p>
    <div class={cx(rt.flex, rt.gap6)} role="group" aria-label="tour progress">
      {#each Array.from({ length: api.total }, (_, i) => i) as i (i)}
        <span class="tour-dot" class:tour-dot-on={i === api.index} aria-hidden="true"></span>
      {/each}
    </div>
    <div class={cx(rt.rowC12, rt.justifyBetween)}>
      <button
        type="button"
        class={cx(rt.tourSkipGhost)}
        onclick={api.skip}
      >
        skip
      </button>
      <button
        type="button"
        class={cx(rt.tourCtlPrimary)}
        disabled={api.index === 0}
        onclick={api.prev}
      >
        back
      </button>
      <button
        type="button"
        class={cx(rt.framePrimary, rt.inlineFlex, rt.cursorPointer, rt.appearanceNone, rt.bgBackground, rt.px14, rt.py6, rt.fontNav, rt.text11, rt.upper, rt.track10, rt.inkPrimary, rt.shadow2xs)}
        onclick={api.next}
      >
        {api.index === api.total - 1 ? 'done' : 'next'}
      </button>
    </div>
  {/snippet}
</Tour>

<style>
  .jx-tour-demo-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 560px) {
    .jx-tour-demo-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* the non-modal recipe: a tall inner scrollbox — the tour must leave
     BOTH this scrollport and the page itself live */
  .tour-scroll-surface {
    border: 1px solid var(--border);
    max-block-size: 12rem;
    overflow-y: auto;
    padding: 0.75rem;
  }

  /* the placement matrix: 2×2 quadrants */
  .jx-tour-quadrant-grid {
    display: grid;
    gap: 1.25rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 560px) {
    .jx-tour-quadrant-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* ---- placement recipes: page-level overrides of the card's anchor
     geometry. The card's default law (tour.css, components layer) is
     top: anchor(bottom); left: anchor(left) — :where() zero-specificity
     in a layer, so these UNLAYERED page rules win without !important.
     Engines without anchor positioning already fall back to centered
     cards (position-anchor: auto !important in tour.css) — these
     expressions are inert there, never broken.
     RECORDED FOLLOWUP (change followups.md): a placement prop on the
     component consuming this exact matrix. --------------------------------*/
  .tour-place-top :global(.jx-tour) {
    top: auto;
    bottom: anchor(top);
    margin-bottom: var(--jx-tour-gap, 12px);
  }
  .tour-place-left :global(.jx-tour) {
    top: anchor(top);
    left: auto;
    right: anchor(left);
    margin-right: var(--jx-tour-gap, 12px);
  }
  .tour-place-right :global(.jx-tour) {
    top: anchor(top);
    left: anchor(right);
    margin-left: var(--jx-tour-gap, 12px);
  }
  /* bottom is the shipped default: top: anchor(bottom) — no override */

  /* the indicator dots: token-driven, the live dot leans on primary */
  .tour-dot {
    background: color-mix(in oklab, var(--muted-foreground) 35%, transparent);
    block-size: 6px;
    border: 1px solid color-mix(in oklab, var(--muted-foreground) 45%, transparent);
    display: inline-block;
    inline-size: 6px;
  }
  .tour-dot-on {
    background: var(--primary);
    border-color: var(--primary);
  }
</style>
