<!--
  Test host for the tour non-modal + custom-indicator recipes (openspec
  2026-08-30-table-grid-toolbar).

  non-modal: the tour NEVER locks the page — no overflow clamp on body
  or documentElement, no scroll-behavior tampering, the tint is
  pointer-events:none. The host pins exactly that: a tall scrollable
  demo surface plus assertions reading the body/documentElement style
  and class state while the tour is open.

  custom indicators: the card(api) snippet renders step dots from
  index/total — the composition surface for antd's indicator prop.
-->
<script lang="ts">
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';
  import Tour from '../../src/lib/ui/tour/tour.svelte';

  let open = $state(false);
  let indicatorOpen = $state(false);
</script>

<div data-tour-host>
  <button type="button" data-tour-open onclick={() => (open = true)}>start non-modal tour</button>
  <button type="button" data-tour-indicator-open onclick={() => (indicatorOpen = true)}>
    start indicator tour
  </button>

  <div data-tour-scroll-surface class="max-h-40 overflow-y-auto">
    <section data-tour-target-a class="border border-border p-3">target A</section>
    <div class="h-96" aria-hidden="true"></div>
    <section data-tour-target-b class="border border-border p-3">target B</section>
  </div>

  <Tour
    bind:open
    steps={[
      { target: '[data-tour-target-a]', title: 'A', description: 'scroll stays free' },
      { target: '[data-tour-target-b]', title: 'B', description: 'the tint never intercepts pointers' },
    ]}
  />

  <Tour
    bind:open={indicatorOpen}
    steps={[
      { target: '[data-tour-target-a]', title: 'A' },
      { target: '[data-tour-target-b]', title: 'B' },
    ]}
  >
    {#snippet card(api)}
      <p data-tour-card-title>{api.step.title}</p>
      <div data-tour-indicators role="group" aria-label="tour progress" class="flex gap-1">
        {#each Array.from({ length: api.total }, (_, i) => i) as i (i)}
          <span data-tour-dot data-tour-dot-active={i === api.index ? '' : undefined} aria-hidden="true"></span>
        {/each}
      </div>
      <div class="flex gap-2">
        <button type="button" data-tour-card-prev onclick={api.prev} disabled={api.index === 0}>back</button>
        <button type="button" data-tour-card-next onclick={api.next}>
          {api.index === api.total - 1 ? 'done' : 'next'}
        </button>
      </div>
    {/snippet}
  </Tour>
</div>
