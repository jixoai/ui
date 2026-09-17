<!-- card blueprint: the structural surface — the head zone, the
     edge-riding separator, the body, and the foot's both-edge economy
     (meta text at inline-start, the action cluster at inline-end). -->
<script lang="ts">
  import Card from '$lib/ui/card/card.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
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

<div class={cx(bpA.cardStage)}>
  <div class={cx(bpA.cardFrame)}>
    <Card title="Deploy hooks.">
      {#snippet foot()}
        <CardFooter label="scene actions">
          {#snippet start()}
            <span class={cx(bpA.cardMeta)}>3 hooks · passing</span>
          {/snippet}
          <PressButton>Clear</PressButton>
          <PressButton variant="fill">Ship</PressButton>
        </CardFooter>
      {/snippet}
      <ul class={cx(bpA.cardList)}>
        <li>the body zone is the only scroll ring</li>
        <li>separators edge-ride their zone rows</li>
        <li>integer cell lines survive the subgrid</li>
      </ul>
    </Card>
  </div>
</div>
