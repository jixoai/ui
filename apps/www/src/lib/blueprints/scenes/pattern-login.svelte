<!-- pattern-login blueprint: the ssh login card — user/host lanes over
     the input reveal, bootstrap-command footer.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import PatternLogin from '$lib/ui/pattern-login/pattern-login.svelte';
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
</script>

<div class={cx(bpB.patternLoginStage)}>
  <PatternLogin host="edge-01.prod" command="npx jixoai-ui login" />
</div>
