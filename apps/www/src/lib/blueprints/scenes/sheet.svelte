<!-- sheet blueprint: the right drawer forced open (open={true} →
     showModal()) over muted page context — header, body, sticky footer. -->
<script lang="ts">
  import Sheet from '$lib/ui/sheet/sheet.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10 opacity-70">
  <Skeleton class="h-4 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
</div>

<Sheet title="edit workspace" side="right" size="22rem" open={true}>
  <p class="text-muted-foreground text-sm leading-6">
    Rename the workspace or hand it over — changes apply to every member on next sign-in.
  </p>
  <div class="flex flex-col gap-2">
    <p class="font-mono text-xs text-muted-foreground">name</p>
    <p class="border-border bg-background border px-3 py-2 text-sm">jixoai-labs/ui</p>
    <p class="font-mono text-xs text-muted-foreground">brand hue</p>
    <p class="border-border bg-background border px-3 py-2 text-sm">oklch(0.72 0.16 27)</p>
  </div>
  {#snippet footer()}
    <PressButton variant="outline">Cancel</PressButton>
    <PressButton variant="primary">Save changes</PressButton>
  {/snippet}
</Sheet>
