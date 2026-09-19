<!-- sheet blueprint: the right drawer forced open (open={true} →
     showModal()) over muted page context — header, body, sticky footer.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Sheet from '$lib/ui/sheet/sheet.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
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

<Stack direction="column" justify="center" gap="16" class={cx(bpB.sheetStage)} }>
  <Skeleton class={cx(bpB.sheetSkelA)}></Skeleton>
  <Skeleton class={cx(bpB.sheetSkelB)}></Skeleton>
  <Skeleton class={cx(bpB.sheetSkelC)}></Skeleton>
</Stack>

<Sheet title="edit workspace" side="right" size="22rem" open={true}>
  <p class={cx(bpB.sheetBody)}>
    Rename the workspace or hand it over — changes apply to every member on next sign-in.
  </p>
  <div class={cx(bpB.sheetForm)}>
    <p class={cx(bpB.sheetFormLabel)}>name</p>
    <p class={cx(bpB.sheetFieldValue)}>jixoai-labs/ui</p>
    <p class={cx(bpB.sheetFormLabel)}>brand hue</p>
    <p class={cx(bpB.sheetFieldValue)}>oklch(0.72 0.16 27)</p>
  </div>
  {#snippet footer()}
    <!-- the carved action band: ghost (the zone's default) + fill -->
    <CardFooter>
      <PressButton>Cancel</PressButton>
      <PressButton variant="fill">Save changes</PressButton>
    </CardFooter>
  {/snippet}
</Sheet>
