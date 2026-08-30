<!-- pattern-pricing blueprint: the $ plan --compare section — the
     comparison matrix with one recommended column, install rows as
     code cards. -->
<script lang="ts">
  import PatternPricing from '$lib/ui/pattern-pricing/pattern-pricing.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
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
</div>
