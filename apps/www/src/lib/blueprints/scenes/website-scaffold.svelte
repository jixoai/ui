<!-- website-scaffold blueprint: the grid shell as a labeled diagram —
     the named container host, the one grid whose columns both layers
     subgrid, and the per-zone immersive law (navigation chrome leaves,
     the reading state compacts). The real shell owns the whole viewport
     scroll plane, so a nested live instance cannot fit the stage; the
     diagram documents the architecture instead (same approach as the
     component's own docs page). Grid era: Owner + Codex review,
     2026-08-23. (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
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

<div class={cx(bpB.websiteScaffoldStage)}>
  <div class={cx(bpB.websiteScaffoldFrame)}>
    <!-- .jx-shell-host: the named container -->
    <div class={cx(bpB.websiteScaffoldHostBar)}>
      <span class={cx(bpB.websiteScaffoldHostKey)}
        >.jx-shell-host · container: jx-shell · 100dvh · overflow clip</span
      >
      <span class={cx(bpB.websiteScaffoldHostForms)}
        >forms: ≥1200 rail+content+toc · 900–1199 +toc · &lt;900 tocbar row</span
      >
    </div>

    <!-- the one grid: two layers, same columns -->
    <div class={cx(bpB.websiteScaffoldGridFrame)}>
      <div class={cx(bpB.websiteScaffoldGrid)}>
        <!-- chrome plane -->
        <div class={cx(bpB.websiteScaffoldChrome)}>
          <div class={cx(bpB.websiteScaffoldChromeBar)}>
            <span class={cx(bpB.websiteScaffoldZoneKey)}
              >.jx-top-layer — column-subgrid · rows [header][tocbar][stage] · z-40 · pointer-events: none→auto</span
            >
            <span class={cx(bpB.websiteScaffoldZoneValue)}>site-header vt-name</span>
          </div>
          <div class={cx(bpB.websiteScaffoldHeaderBand)}>
            <span class={cx(bpB.websiteScaffoldBandText)}
              >.jx-scaffold-header — the nav band · scroll ↓ translateY(-101%) ↑ back</span
            >
          </div>
          <div class={cx(bpB.websiteScaffoldSubgrid)}>
            <div class={cx(bpB.websiteScaffoldAreaCell)}>
              <span class={cx(bpB.websiteScaffoldZoneKey)}
                >[data-area='tree'] — the catalog rail (wide)</span
              >
            </div>
            <div class={cx(bpB.websiteScaffoldAreaCellRight)}>
              <span class={cx(bpB.websiteScaffoldZoneKey)}
                >[data-area='toc'] — never leaves · compacts by --jx-header-h</span
              >
            </div>
          </div>
        </div>
        <!-- scroll plane -->
        <div class={cx(bpB.websiteScaffoldScrollPlane)}>
          <div class={cx(bpB.websiteScaffoldMainHead)}>
            <span class={cx(bpB.websiteScaffoldBandText)}
              >main#main <span class={cx(bpB.websiteScaffoldBandMuted)}>— column-subgrid · [content] column</span></span
            >
            <div class={cx(bpB.websiteScaffoldMainBody)}>
              <Skeleton class={cx(bpB.websiteScaffoldSkelA)}></Skeleton>
              <Skeleton class={cx(bpB.websiteScaffoldSkelB)}></Skeleton>
            </div>
          </div>
          <div class={cx(bpB.websiteScaffoldFootBand)}>
            <span class={cx(bpB.websiteScaffoldBandMuted)}>footer — in the content flow</span>
          </div>
        </div>
        <div class={cx(bpB.websiteScaffoldTocCol)}>
          <span class={cx(bpB.websiteScaffoldZoneKey)}
            >[toc] 15rem — shared column, both layers subgrid it</span
          >
        </div>
      </div>
    </div>
    <div class={cx(bpB.websiteScaffoldFoot)}>
      <span class={cx(bpB.websiteScaffoldZoneKey)}
        >.jx-shell-body — THE scroll container · column-subgrid only · padding = --jx-header-h (+tocbar) · scroll-padding = --jx-toc-line</span
      >
    </div>
  </div>
</div>
