<!-- card blueprint: the structural surface — the head zone, the
     edge-riding separator, the body, and the foot's both-edge economy
     (meta text at inline-start, the action cluster at inline-end). -->
<script lang="ts">
  import Card from '$lib/ui/card/card.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="w-full max-w-[340px]">
    <Card title="Deploy hooks.">
      {#snippet foot()}
        <CardFooter label="scene actions">
          {#snippet start()}
            <span class="font-mono text-[11px] text-muted-foreground">3 hooks · passing</span>
          {/snippet}
          <PressButton>Clear</PressButton>
          <PressButton variant="fill">Ship</PressButton>
        </CardFooter>
      {/snippet}
      <ul class="flex flex-col gap-1.5 text-[12.5px] leading-5">
        <li>the body zone is the only scroll ring</li>
        <li>separators edge-ride their zone rows</li>
        <li>integer cell lines survive the subgrid</li>
      </ul>
    </Card>
  </div>
</div>
