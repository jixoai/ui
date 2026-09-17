<!-- dialog blueprint: the modal forced open (open={true} → showModal()),
     floating over muted context content. The serializer re-anchors
     top-layer panels into the stage. -->
<script lang="ts">
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.dialogStage)}>
  <Skeleton class={cx(bpA.dialogSkeletonA)}></Skeleton>
  <Skeleton class={cx(bpA.dialogSkeletonB)}></Skeleton>
  <Skeleton class={cx(bpA.dialogSkeletonC)}></Skeleton>
</div>

<Dialog title="Delete workspace?" open={true}>
  <p class={cx(bpA.dialogBody)}>
    This removes 3 deployments and their logs. The action cannot be undone.
  </p>
  {#snippet footer()}
    <CardFooter>
      <PressButton>Cancel</PressButton>
      <PressButton variant="fill">Delete</PressButton>
    </CardFooter>
  {/snippet}
</Dialog>
