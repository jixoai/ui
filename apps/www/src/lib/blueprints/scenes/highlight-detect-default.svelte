<!-- highlight-detect-default blueprint: the DLD context provider as a
     ~10-line CHILDREN wrapper — form ① of the two equivalent wirings,
     whose implementation IS the hand-written form ② (one setContext at
     init). Svelte context spreads downward only: wrapped cards eat the
     DLD default for lang='auto', sibling subtrees outside stay
     untouched, nested wrappers take the nearest, and the langDetector
     prop always outranks whatever is wired here. Zero styling, zero
     behavior beyond the wiring. Terminal diagram idiom; the live
     component is one setContext line (not worth a stage — the tree is
     the story). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const inside = ['lang="auto" · filename="main.ts"', 'lang="auto" · no filename -> L4', 'lang="ts" · untouched path'];

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

<div class={cx(bpA.highlightDetectDefaultStage)}>
  <div class={cx(bpA.highlightDetectDefaultPanel)}>
    <div class={cx(bpA.highlightDetectDefaultHead)}>
      <span class={cx(bpA.highlightDetectDefaultTitle)}>highlight-detect-default</span>
      <span class={cx(bpA.highlightDetectDefaultSub)}>the children wrapper</span>
    </div>
    <Stack align="center" gap="12">
      <div class={cx(bpA.highlightDetectDefaultCard)}>
        <span class={cx(bpA.highlightDetectDefaultCardTitle)}>&lt;HighlightDetectDefault&gt;</span>
        <span class={cx(bpA.highlightDetectDefaultCardLine)}>setContext(HIGHLIGHT_DETECT_KEY,</span>
        <span class={cx(bpA.highlightDetectDefaultCardLine)}>{'  { detector: defaultLangDetector() })'}</span>
        <span class={cx(bpA.highlightDetectDefaultCardLine)}>{'{@render children()}'}</span>
      </div>
      <span class={cx(bpA.highlightDetectDefaultArrow)}>-></span>
      <div class={cx(bpA.highlightDetectDefaultSide)}>
        <span class={cx(bpA.highlightDetectDefaultSideLabel)}>the wrapped subtree</span>
        {#each inside as line (line)}
          <span class={cx(bpA.highlightDetectDefaultSideLine)}>{line}</span>
        {/each}
      </div>
    </Stack>
    <div class={cx(bpA.highlightDetectDefaultFoot)}>
      <span>context spreads downward only · siblings outside untouched · nearest wrapper wins</span>
      <span>form ② = the same one line, hand-written at any subtree root (zero components)</span>
    </div>
  </div>
</div>
