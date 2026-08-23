<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Tour from '$lib/ui/tour.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tourSource from '$lib/ui/tour.svelte?raw';

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { finishedAt: null as number | null };
  let open = $state(false);
  let finishedAt = $state<number | null>(canvasInitial.finishedAt);
  function resetCanvas(): void {
    finishedAt = canvasInitial.finishedAt;
  }

  // ToC outline: pairs with the region ids below, in page order.

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/tour.svelte', content: tourSource },
  ];
</script>

<svelte:head>
  <title>Tour · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tour: the guided walkthrough against its recorded contract — reversible anchor-name lease, box-shadow hole via CSS anchor-size, non-modal popover=manual dialog, per-step target resolution with deterministic skips."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · 契约兑现"
      title="tour — the contract, implemented"
      summary="The guided walkthrough built exactly against the design contract recorded on the recipes page: the anchor-name on each target is a reversible lease; the highlight is a target-sized hole plus one huge box-shadow tint (CSS anchor-size, zero geometry JS); the surface is a NON-MODAL popover=manual dialog (aria-modal=false, page scrolls, scrim never blocks); targets re-resolve every step with deterministic skips; Escape/Skip finishes and restores the invoker's focus."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">anchor-name lease</span>
        <span class="pill">box-shadow hole</span>
        <span class="pill">non-modal</span>
        <span class="pill">deterministic skips</span>
      </div>
    </SectionCard>
  </div>

  <div id="tour-workbench" data-region="tour-workbench" data-reveal="" use:reveal>
    <ComponentCanvas
      title="tour"
      description="Start it: the first demo card takes the lease (inspect its style), the hole+tint frame it. Next advances (←/→ also work), the last step's button reads Finish, Escape or Skip ends with focus back on the opener."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tour.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'finished at step', value: finishedAt ?? '—' }]}
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
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the tour is non-modal: the page stays scrollable and the tint never intercepts pointers
          (a modal/guided mode would be a separate surface by contract). Missing/hidden targets are
          skipped forward deterministically; if every step is unavailable the tour ends at once.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the recorded contract, recapped -->
  <div id="tour-law" data-reveal="" use:reveal>
    <SectionCard
      family="tour-law"
      headerRegion="tour-law"
      eyebrow="law"
      title="The recorded contract"
      summary="Every walkthrough rule was recorded before the component existed, and the implementation answers it line for line: the anchor-name lease is reversible (each step's target receives it, the previous target is restored), the highlight is one huge box-shadow tint through a target-sized hole (CSS anchor-size, zero geometry JS), the surface is a non-modal popover=manual dialog — the page keeps scrolling, the tint never intercepts pointers — and every exit path restores the invoker's focus."
    >
      <p class="text-[13px] text-muted-foreground">See the recipes page for the full contract and its design rationale.</p>
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
  </div>
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
