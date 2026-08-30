<!--
  Docs page for tour (2026-08-25, composition-first-apis).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One ComponentCanvas: the default card (zero config) on the demo
     targets.
  3. Card section: the card(api) snippet — callers author the interior
     (index/total/step + next/prev/skip wired).
  4. Usage CodeBlock shared with the canvas drawer.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Tour from '$lib/ui/tour/index';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
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

  // Material3 usage section — the card(api) composition, verbatim.
  const usageCode = usage;
</script>

<svelte:head>
  <title>Tour · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tour: the guided walkthrough — steps stay behavior-domain data (targets, driver.js precedent), the card opens to a card(api) snippet carrying index/total/step + next/prev/skip; the default card renders when the snippet is absent."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · contract"
      title="tour — targets stay data, the card opens"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">anchor-name lease</span>
        <span class="pill">box-shadow hole</span>
        <span class="pill">non-modal</span>
        <span class="pill">card(api) snippet</span>
      </div>
    </SectionCard>
  </div>

  <div id="tour-workbench" data-region="tour-workbench" data-reveal="">
    <ComponentCanvas
      title="tour"
      description="The default card: start it — the first demo card takes the lease (inspect its style), the hole+tint frame it. Next advances (←/→ also work), the last step's button reads Finish, Escape or Skip ends with focus back on the opener. No card snippet — the default card renders the steps' title/description metadata."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour/tour.svelte"
      files={canvasFiles}
      stage="start"
      onreset={resetCanvas}
      output={[{ label: 'finished at step', value: finishedAt ?? '—' }]}
    >
      <div class="flex flex-col items-start gap-6">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (open = true)}>start the tour</PressButton>
        </div>
        <div class="jx-tour-demo-grid w-full max-w-2xl">
          <section data-tour-demo-a class="border border-border bg-card p-4">
            <p class="font-nav text-[0.75rem] uppercase tracking-[0.12em]">demo target A</p>
            <p class="text-[12.5px] text-muted-foreground">this card receives the anchor-name lease on step 1</p>
          </section>
          <section data-tour-demo-b class="border border-border bg-card p-4">
            <p class="font-nav text-[0.75rem] uppercase tracking-[0.12em]">demo target B</p>
            <p class="text-[12.5px] text-muted-foreground">…and this one on step 2; the lease moves with the tour</p>
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

  <div id="tour-card" data-reveal="">
    <SectionCard
      family="tour-card"
      headerRegion="tour-card"
      eyebrow="composition"
      title="The card(api) snippet"
      summary="steps stay data — targets are behavior domain (driver.js precedent) and title/description are metadata for the DEFAULT card. When you need the interior your way, the card snippet receives TourApi: index, total, the current step object, and next/prev/skip wired to the same lifecycle (spotlight, lease, Escape, deterministic skips). The label props died — callers author the buttons."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <PressButton onclick={() => (cardOpen = true)}>start the custom-card tour</PressButton>
          <span class="text-muted-foreground text-[12.5px]">same two demo targets above — scroll up if they left the viewport</span>
        </div>
        <pre class="text-[12px] leading-5 text-muted-foreground">TourApi = &#123; index, total, step: TourStep, next(), prev(), skip() &#125;</pre>
      </div>
    </SectionCard>
  </div>

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
      <p data-tour-card-title="" class="m-0 font-nav text-[0.8125rem] uppercase tracking-[0.1em] text-foreground">
        {api.step.title} · {api.index + 1}/{api.total}
      </p>
      <div data-tour-card-actions="" class="mt-1 flex items-center justify-between gap-3">
        <button
          type="button"
          data-tour-card-skip=""
          class="cursor-pointer appearance-none border-0 bg-transparent font-nav text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground underline decoration-dotted hover:text-foreground"
          onclick={api.skip}
        >
          skip
        </button>
        <div class="flex gap-2">
          <button
            type="button"
            data-tour-card-prev=""
            class="inline-flex cursor-pointer appearance-none border px-[0.875rem] py-1.5 font-nav text-[0.6875rem] uppercase tracking-[0.1em] shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
            disabled={api.index === 0}
            onclick={api.prev}
          >
            back
          </button>
          <button
            type="button"
            data-tour-card-next=""
            class="inline-flex cursor-pointer appearance-none border border-primary bg-background px-[0.875rem] py-1.5 font-nav text-[0.6875rem] uppercase tracking-[0.1em] text-primary shadow-2xs"
            onclick={api.next}
          >
            {api.index === api.total - 1 ? 'done' : 'next'}
          </button>
        </div>
      </div>
    {/snippet}
  </Tour>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Tour variants" summary="Two card types over the same lifecycle: the default card renders the steps' title/description metadata; the card(api) snippet authors the whole interior.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4"><PressButton onclick={() => (open = true)}>default card tour</PressButton></div>
      <div class="border border-border p-4"><PressButton onclick={() => (cardOpen = true)}>card(api) tour</PressButton></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Steps stay data (targets are behavior-domain, driver.js precedent); the card snippet receives TourApi — index, total, step, next/prev/skip."><CodeBlock code={usageCode} lang="svelte" meta="Tour usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Non-modal by contract — no focus trap, the page stays scrollable, and finishing restores the invoker's focus."><A11yTable keys={[{ key: '→', action: 'Advance to the next enterable step' }, { key: '←', action: 'Go back one step' }, { key: 'Enter', action: 'Next (the focused button’s default path)' }, { key: 'Escape', action: 'End the tour — focus returns to the opener' }]} aria={[{ name: 'role', value: 'dialog', description: 'The card panel; landing focus sits on Next (or the panel with a custom card).' }, { name: 'aria-modal', value: 'false', description: 'Non-modal: no trap, no inert, the page scrolls.' }, { name: 'popover', value: 'manual', description: 'Top-layer card + tint; the scrim is pointer-events:none.' }, { name: 'aria-label', value: 'step.title', description: 'The dialog is named by the current step.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The hole is sized by anchor-size() with zero geometry JS; the panel rides the shared surface-motion kernel."><div class="flex flex-col gap-5"><DensityDemo><PressButton onclick={() => (open = true)}>start</PressButton></DensityDemo><TokenTable tokens={[{ name: '--jx-tour-{id}', default: 'anchor-name lease', source: 'component', description: 'Per-instance lease set on the current target; restored on advance/close/unmount.' }, { name: '--jx-tour-gap', default: '12px', source: 'component', description: 'Panel offset below the leased target.' }, { name: 'tint', default: 'background 55%', source: 'color', description: 'The hole tint: color-mix(in oklab, var(--background) 55%, transparent).' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'Shared surface-motion kernel driving open/close.' }, { name: 'hole border', default: '1px solid var(--primary)', source: 'structural', description: 'The anchored hole outlines the leased target.' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Trigger target through the composed control.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="TourApi = &#123; index, total, step: TourStep, next(), prev(), skip() &#125; — the card snippet's whole surface."><div class="flex flex-col gap-8"><PropsTable props={[{ name: 'steps', type: 'TourStep[]', default: '—', description: 'Targets + title/description metadata (behavior-domain data).', required: true }, { name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state — the tour runs while true.', bindable: true }, { name: 'startAt', type: 'number', default: '0', description: 'Zero-based first step; skipped-forward past unavailable ones.' }, { name: 'onfinish', type: '(index: number) => void', default: '—', description: 'Fires when the tour finishes (end reached, skipped, or all steps unavailable).' }, { name: 'onstep', type: '(index: number) => void', default: '—', description: 'Step change notification (analytics/progress).' }, { name: 'card', type: 'Snippet<[TourApi]>', default: '—', description: 'Replaces the default card interior; receives TourApi.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface variant for the card.' }, { name: 'class', type: 'string', default: "''", description: 'Extra classes on the card panel.' }]} /><PropsTable title="TourStep" props={[{ name: 'target', type: 'string | () => HTMLElement | null', default: '—', description: 'CSS selector for the step’s target, or a resolver; invalid selectors read as unavailable.', required: true }, { name: 'title', type: 'string', default: '—', description: 'Metadata for the default card (a custom card renders or ignores it).' }, { name: 'description', type: 'string', default: '—', description: 'Metadata for the default card.' }]} /></div></SectionCard></div>
</div>

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
</style>
