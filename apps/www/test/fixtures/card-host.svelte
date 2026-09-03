<!--
  card spec host — the REAL shapes the card contract covers: a bare
  card (title only), a full card (actions slot + CardFooter with the
  start seat and grouped actions), a headless chrome-less card, a
  declared non-scroller, and the CardGrid foot-mode composition.
-->
<script lang="ts">
  import Card from '$lib/ui/card/card.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<Card title="bare card" class="card-bare">
  <p>the bare card body</p>
</Card>

<Card title="full card" class="card-full">
  {#snippet actions()}
    <span data-testid="custom-action">star</span>
  {/snippet}
  {#snippet foot()}
    <CardFooter label="card actions">
      {#snippet start()}
        <span>3 items</span>
      {/snippet}
      <PressButton>Cancel</PressButton>
      <PressButton variant="fill">Save</PressButton>
      <PressButton raised={true}>Raised</PressButton>
    </CardFooter>
  {/snippet}
  <p>the full card body</p>
</Card>

<Card class="card-headless">
  <p>no title, no head snippet — no head zone at all</p>
</Card>

<Card title="fixed body" scroll={false} class="card-fixed">
  <p>a declared non-scroller</p>
</Card>

<CardGrid foot min="220px" class="grid-host">
  <Card title="grid one">
    {#snippet foot()}
      <CardFooter>
        {#snippet end()}
          <span>raw end</span>
        {/snippet}
      </CardFooter>
    {/snippet}
    <p>one</p>
  </Card>
  <Card title="grid two">
    {#snippet foot()}
      <CardFooter>
        <PressButton>ok</PressButton>
      </CardFooter>
    {/snippet}
    <p>two</p>
  </Card>
</CardGrid>
