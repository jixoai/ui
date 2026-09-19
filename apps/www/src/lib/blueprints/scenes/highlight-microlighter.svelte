<!-- highlight-microlighter blueprint: the RANGE engine — the one
     backend that writes NO markup: the element stays a single text
     node and tokens register as CSS Custom Highlight API ranges,
     painted by a data-syntax-theme scoped stylesheet. Feature-gated
     (browsers without the API reject before touching the DOM);
     whole-document rescan per paint (its registry law). Known,
     test-locked limit: ranges do not survive the print freeze — pin a
     markup backend for paper. Terminal diagram idiom; no live
     component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const node = ['<code>x = 1</code>', 'ONE text node', 'nothing written inside'];
  const ranges = ['new Range()', '.set(node, 0, 5)', "CSS.highlights['kw']"];
  const paint = ['::highlight(kw)', '(scoped css)', 'no DOM change'];

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

<div class={cx(bpA.highlightMicrolighterStage)}>
  <div class={cx(bpA.highlightMicrolighterPanel)}>
    <div class={cx(bpA.highlightMicrolighterHead)}>
      <span class={cx(bpA.highlightMicrolighterTitle)}>highlight-microlighter</span>
      <span class={cx(bpA.highlightMicrolighterSub)}>zero markup · ranges</span>
    </div>
    <Stack align="center" gap="12">
      <div class={cx(bpA.highlightMicrolighterNodeCol)}>
        <span class={cx(bpA.highlightMicrolighterColLabel)}>the element</span>
        {#each node as line (line)}
          <span class={cx(bpA.highlightMicrolighterNodeLine, line !== node[0] ? bpA.highlightMicrolighterNodeLineMuted : undefined)}>{line}</span>
        {/each}
      </div>
      <span class={cx(bpA.highlightMicrolighterArrow)}>-></span>
      <div class={cx(bpA.highlightMicrolighterRangesCard)}>
        {#each ranges as line (line)}
          <span class={cx(bpA.highlightMicrolighterRangesLine)}>{line}</span>
        {/each}
        <span class={cx(bpA.highlightMicrolighterCardNote)}>Custom Highlight API · ranges over the text</span>
      </div>
      <span class={cx(bpA.highlightMicrolighterArrow)}>-></span>
      <div class={cx(bpA.highlightMicrolighterPaintCol)}>
        <span class={cx(bpA.highlightMicrolighterColLabel)}>the paint</span>
        {#each paint as line (line)}
          <span class={cx(bpA.highlightMicrolighterNodeLine, line !== paint[0] ? bpA.highlightMicrolighterNodeLineMuted : undefined)}>{line}</span>
        {/each}
      </div>
    </Stack>
    <div class={cx(bpA.highlightMicrolighterFoot)}>
      <span>feature-gated (no API -> reject before the DOM) · whole-document rescan per paint</span>
      <span>ranges do NOT survive the print freeze — pin a markup backend for paper</span>
    </div>
  </div>
</div>
