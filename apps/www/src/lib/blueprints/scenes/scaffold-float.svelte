<!-- scaffold-float blueprint: the portal adoption diagram — float content
     is CREATED at the consumer's authoring position (full Svelte
     ownership) and ADOPTED into the scaffold's top layer, so it rides
     the immersive slide with the header by construction. The real portal
     needs the WebsiteScaffold context to exist around it, which the
    fixed stage cannot host honestly — the diagram shows the mechanism.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     muted/primary alpha channels ride color-mix stops.) -->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

<div class={cx(bpB.scaffoldFloatStage)}>
  <div class={cx(bpB.scaffoldFloatRow)}>
    <!-- authoring position: where the consumer writes it -->
    <div class={cx(bpB.scaffoldFloatSource)}>
      <span class={cx(bpB.scaffoldFloatTag)}
        >consumer DOM · authoring position</span
      >
      <div class={cx(bpB.scaffoldFloatFloat)}>
        <span class={cx(bpB.scaffoldFloatDot)}></span>
        <span class={cx(bpB.scaffoldFloatFloatLabel)}>float content — created here, owned by Svelte</span>
      </div>
      <span class={cx(bpB.scaffoldFloatAnchorNote)}>.jx-float-anchor — hidden, keeps the slot</span>
    </div>

    <div class={cx(bpB.scaffoldFloatArrow)} aria-hidden="true">
      <Icon name="arrowRight" />
    </div>

    <!-- adoption target: the top layer -->
    <div class={cx(bpB.scaffoldFloatTarget)}>
      <span class={cx(bpB.scaffoldFloatTargetTag)}
        >.jx-top-layer · adoption target</span
      >
      <div class={cx(bpB.scaffoldFloatHeader)}>
        <span class={cx(bpB.scaffoldFloatHeaderLabel)}>.jx-scaffold-header</span>
      </div>
      <div class={cx(bpB.scaffoldFloatAdoptedFrame)}>
        <div class={cx(bpB.scaffoldFloatAdopted)}>
          <span class={cx(bpB.scaffoldFloatAdoptedDot)}></span>
          adopted node — rides the immersive slide
        </div>
      </div>
    </div>
  </div>
  <p class={cx(bpB.scaffoldFloatCaption)}>
    scaffold-float — live DOM adoption, teardown returns the nodes
  </p>
</div>
