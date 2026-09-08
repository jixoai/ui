<!-- the standard sheet footer face for the carved-band gates: the
     footer snippet renders CardFooter (children auto-join the
     cluster) — what the docs page teaches -->
<script lang="ts">
  import Sheet from '$lib/ui/sheet/sheet.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<Sheet title="t" open={true}>
  body
  {#snippet footer()}
    <CardFooter>
      <PressButton>Apply</PressButton>
    </CardFooter>
  {/snippet}
</Sheet>
