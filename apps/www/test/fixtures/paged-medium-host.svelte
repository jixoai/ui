<!--
  Medium-transition harness (test/paged-medium.spec.ts fixture).
  PagedDoc stamps data-jx-medium with the derived state — the
  observable the spec asserts against (no CSS keys off it; the §0
  no-data-medium-scope ruling holds).
-->
<script lang="ts">
  import { PagedDoc } from '$lib/paged';

  let sim = $state(false);
</script>

<button type="button" data-testid="sim-toggle" onclick={() => (sim = !sim)}>sim</button>

<PagedDoc bind:sim>
  <p data-testid="content">the immersive flow</p>
</PagedDoc>
