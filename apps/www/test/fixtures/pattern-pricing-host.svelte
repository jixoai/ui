<!--
  Test host for the terminal-patterns pricing contract (2026-08-30):
  authors the comparison matrix the way a consumer does (thead/tbody
  children, the recommended column opted in with data-jx-recommended
  on the th AND its td's) over the tier payload.
-->
<script lang="ts">
  import PatternPricing from '../../src/lib/ui/pattern-pricing/pattern-pricing.svelte';

  interface Tier {
    plan: string;
    command: string;
    recommended?: boolean;
    note?: string;
  }

  let {
    tiers = [
      { plan: 'solo', command: 'npx jixoai-ui add --tier solo', note: 'per seat / month' },
      { plan: 'team', command: 'npx jixoai-ui add --tier team', recommended: true, note: 'per seat / month' },
      { plan: 'self-host', command: 'npx jixoai-ui add --tier self-host', note: 'flat / year' },
    ] satisfies Tier[],
  }: { tiers?: Tier[] } = $props();
</script>

<PatternPricing {tiers}>
  <thead>
    <tr>
      <th>plan</th>
      <th>price</th>
      <th data-jx-recommended="">seats</th>
      <th>support</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>solo</td>
      <td>$0</td>
      <td data-jx-recommended="">1</td>
      <td>community</td>
    </tr>
    <tr>
      <td>team</td>
      <td>$12</td>
      <td data-jx-recommended="">unlimited</td>
      <td>priority lane</td>
    </tr>
    <tr>
      <td>self-host</td>
      <td>$99</td>
      <td data-jx-recommended="">unlimited</td>
      <td>same-day</td>
    </tr>
  </tbody>
</PatternPricing>
