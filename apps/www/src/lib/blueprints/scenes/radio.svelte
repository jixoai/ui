<!-- radio blueprint: one name group — the selected ring carries the
     primary dot, its siblings stay empty.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Radio from '$lib/ui/radio/radio.svelte';
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

<div class={cx(bpB.radioStage)}>
  <div class={cx(bpB.radioCol)}>
    <span class={cx(bpB.radioLabel)}>plan</span>
    <Radio label="free — public projects" name="bp-plan" />
    <Radio label="pro — private registries" name="bp-plan" checked />
    <Radio label="team — sso + audit log" name="bp-plan" />
  </div>
</div>
