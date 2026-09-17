<!-- highlight-prismjs blueprint: the CLASSIC markup engine as its own
     item — manual-mode core with dependency-ordered grammar chains
     (markup -> clike -> javascript -> jsx; each link is a lazy load),
     lazy stock theme stylesheets, one active theme per document
     (Prism's own model: last requested wins). Markup output survives
     the print freeze. prismjs({ langs }) slims an instance; prism 1.30
     no longer ships svelte/vue (reject with a hint). Terminal diagram
     idiom; no live component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  // the chain rows map to REGISTERED atom identities (module scope),
  // never dynamic class strings
  const chain: { grammar: string; hot: boolean }[] = [
    { grammar: 'markup', hot: false },
    { grammar: 'clike', hot: false },
    { grammar: 'javascript', hot: true },
    { grammar: 'jsx', hot: false },
  ];

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

<div class={cx(bpA.highlightPrismjsStage)}>
  <div class={cx(bpA.highlightPrismjsPanel)}>
    <div class={cx(bpA.highlightPrismjsHead)}>
      <span class={cx(bpA.highlightPrismjsTitle)}>highlight-prismjs</span>
      <span class={cx(bpA.highlightPrismjsSub)}>the classic markup engine</span>
    </div>
    <div class={cx(bpA.highlightPrismjsChain)}>
      <span class={cx(bpA.highlightPrismjsChainLabel)}
        >the grammar chain (dependency-ordered lazy loads)</span
      >
      <div class={cx(bpA.highlightPrismjsChainRow)}>
        {#each chain as link, i (link.grammar)}
          {#if i > 0}<span class={cx(bpA.highlightPrismjsChainArrow)}>-></span>{/if}
          <span class={cx(bpA.highlightPrismjsChainLink, link.hot ? bpA.highlightPrismjsChainLinkHot : undefined)}>{link.grammar}</span>
        {/each}
        <span class={cx(bpA.highlightPrismjsChainNote)}>classed spans · token classes in the DOM</span>
      </div>
    </div>
    <div class={cx(bpA.highlightPrismjsChain)}>
      <span class={cx(bpA.highlightPrismjsChainLabel)}>the theme lane</span>
      <div class={cx(bpA.highlightPrismjsThemeRow)}>
        <span class={cx(bpA.highlightPrismjsThemeChip)}
          >prism.min.css (lazy stylesheet)</span
        >
        <span class={cx(bpA.highlightPrismjsThemeNote)}>one active theme per document · last requested wins</span>
      </div>
    </div>
    <div class={cx(bpA.highlightPrismjsFoot)}>
      <span>markup output · survives print · prismjs({'{'} langs {'}'}) slims the instance</span>
      <span>prism 1.30 no longer ships svelte/vue — reject with a hint, card falls back to plain text</span>
    </div>
  </div>
</div>
