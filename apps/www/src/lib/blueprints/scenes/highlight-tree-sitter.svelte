<!-- highlight-tree-sitter blueprint: the INCREMENTAL parser — source
     parses to a live syntax tree, .scm queries capture nodes into
     --tok-token-* classes (queries ride the item, MIT). The wasm
     assets come from the npm packages themselves (web-tree-sitter +
     tree-sitter-{typescript,javascript}), self-hosted through vite
     ?url imports — the supply chain is the lockfile; wasmBase
     overrides the origin. Markup output, so print survives. Terminal
     diagram idiom; no live component (the surface is lib-level). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const tree = ['(program', '  (lexical_declaration', '    (variable_declarator', '      (identifier))))'];
  const queries = ['("keyword" @tok-kw)', '(identifier @tok-var)'];
  const assets = ['web-tree-sitter.wasm', 'tree-sitter-tsx.wasm', 'npm source · vite ?url'];

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

<div class={cx(bpA.highlightTreeSitterStage)}>
  <div class={cx(bpA.highlightTreeSitterPanel)}>
    <div class={cx(bpA.highlightTreeSitterHead)}>
      <span class={cx(bpA.highlightTreeSitterTitle)}>highlight-tree-sitter</span>
      <span class={cx(bpA.highlightTreeSitterSub)}>tree + query captures</span>
    </div>
    <div class={cx(bpA.highlightTreeSitterBoard)}>
      <div class={cx(bpA.highlightTreeSitterTreeCol)}>
        <span class={cx(bpA.highlightTreeSitterColLabel)}>source -> the tree</span>
        {#each tree as line (line)}
          <span class={cx(bpA.highlightTreeSitterTreeLine)}>{line}</span>
        {/each}
      </div>
      <span class={cx(bpA.highlightTreeSitterArrow)}>-></span>
      <div class={cx(bpA.highlightTreeSitterQueryCard)}>
        <span class={cx(bpA.highlightTreeSitterColLabel)}>.scm captures</span>
        {#each queries as line (line)}
          <span class={cx(bpA.highlightTreeSitterQueryLine)}>{line}</span>
        {/each}
        <span class={cx(bpA.highlightTreeSitterCardNote)}>queries ride the item (MIT)</span>
      </div>
      <span class={cx(bpA.highlightTreeSitterArrow)}>-></span>
      <div class={cx(bpA.highlightTreeSitterPaintCol)}>
        <span class={cx(bpA.highlightTreeSitterColLabel)}>paint + wasm</span>
        {#each assets as line (line)}
          <span class={cx(bpA.highlightTreeSitterTreeLine)}>{line}</span>
        {/each}
        <span class={cx(bpA.highlightTreeSitterCardNote)}>--tok-token-* spans</span>
      </div>
    </div>
    <div class={cx(bpA.highlightTreeSitterFoot)}>
      <span>markup output · print survives · incremental reparse, not a rescan</span>
      <span>treeSitter({'{'} langs, wasmBase {'}'}) — supply chain = the lockfile (npm-hosted wasm)</span>
    </div>
  </div>
</div>
