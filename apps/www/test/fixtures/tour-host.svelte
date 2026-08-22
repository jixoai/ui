<!--
  Test host for the tour contract: two targets (either hideable), the
  invoker button, finished-step surfaced as data.
-->
<script lang="ts">
  import Tour from '../../src/lib/ui/tour.svelte';

  let { skipFirst = false, hideSecond = false }: { skipFirst?: boolean; hideSecond?: boolean } =
    $props();

  let open = $state(false);
  let finishedAt = $state<number | null>(null);
</script>

<div data-finished={finishedAt ?? ''}>
  <button type="button" data-tour-open onclick={() => (open = true)}>start tour</button>
  <section data-tour-step1 hidden={skipFirst || undefined}>step one target</section>
  <section data-tour-step2 hidden={hideSecond || undefined}>step two target</section>

  <Tour
    bind:open
    steps={[
      { target: '[data-tour-step1]', title: 'The opener', description: 'where tours begin' },
      { target: '[data-tour-step2]', title: 'The closer', description: 'where tours end' },
    ]}
    onfinish={(i) => (finishedAt = i)}
  />
</div>
