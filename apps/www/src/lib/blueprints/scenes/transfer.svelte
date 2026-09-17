<!-- transfer blueprint: mid-move — dialog and toast already across to the
     release side, the → / ← movers between the checkbox fieldsets.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Transfer from '$lib/ui/transfer/transfer.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const options = [
    { value: 'press-button', label: 'press-button' },
    { value: 'input', label: 'input' },
    { value: 'select', label: 'select' },
    { value: 'dialog', label: 'dialog' },
    { value: 'toast', label: 'toast' },
    { value: 'table', label: 'table' },
    { value: 'tabs', label: 'tabs' },
  ];

  let release = $state(['dialog', 'toast']);
</script>

<div class={cx(bpB.transferStage)}>
  <div class={cx(bpB.transferFull)}>
    <Transfer {options} bind:value={release} sourceTitle="library" targetTitle="release" />
  </div>
</div>
