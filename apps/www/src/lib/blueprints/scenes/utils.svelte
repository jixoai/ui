<!-- utils blueprint: the cn() class-string hygiene law.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import { cn } from '$lib/utils';
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

<div class={cx(bpB.utilsStage)}>
  <div class={cx(bpB.utilsComment)}>// clsx joins · tailwind-merge dedupes</div>
  <div class={cx(bpB.utilsCode)}>
    cn('<span class={cx(bpB.utilsAccent)}>p-2</span>', '<span class={cx(bpB.utilsAccent)}>p-4</span>')
  </div>
  <div class={cx(bpB.utilsResult)}>→ 'p-4'</div>
  <div class={cx(bpB.utilsComment)}>// never a cascade mechanism — the layer law owns overrides</div>
</div>
