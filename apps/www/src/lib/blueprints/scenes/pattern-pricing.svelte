<!-- pattern-pricing blueprint: the $ plan --compare section — the
     comparison matrix with one recommended column, install rows as
     code cards. (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import PatternPricing from '$lib/ui/pattern-pricing/pattern-pricing.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack align="center" justify="center" class={cx(bpB.patternPricingStage)}>
  <PatternPricing
    eyebrow="$ plan --compare"
    tiers={[
      { plan: 'solo', command: 'npx jixoai-ui init', note: 'one site, every atom' },
      { plan: 'team', command: 'npx jixoai-ui init --team', recommended: true, note: 'patterns + priority review' },
      { plan: 'fleet', command: 'npx jixoai-ui init --fleet', note: 'private mirror + SLO' },
    ]}
  >
    {#snippet children()}
      <table>
        <thead>
          <tr><th>plan</th><th>seats</th><th>mirror</th></tr>
        </thead>
        <tbody>
          <tr><td>solo</td><td>1</td><td>public</td></tr>
          <tr><td data-jx-recommended>team</td><td data-jx-recommended>25</td><td data-jx-recommended>private</td></tr>
          <tr><td>fleet</td><td>∞</td><td>private + SLO</td></tr>
        </tbody>
      </table>
    {/snippet}
  </PatternPricing>
</Stack>
