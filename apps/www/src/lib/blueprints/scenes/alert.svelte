<!-- alert blueprint: the variant pair plus the error-status
     injection as inline notice rows. -->
<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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
</script>

<div class={cx(bpA.alertStage)}>
  <Alert variant="tonal" title="Deployed">ui.jixoai.com is live — 77 registry items published.</Alert>
  <Alert title="Heads up">The preview cache rebuilds nightly.</Alert>
  <Alert variant="tonal" class="jx-hue-error" title="Build failed">entry "ghost" has no registry item.</Alert>
</div>
