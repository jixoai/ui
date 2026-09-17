<!-- ghostty-vt blueprint: the wasm ABI binding as a diagram (utils/
     toc-engine lib-scene precedent — the frozen surface of design.md
     D4 over the marshaling spine: every struct offset, enum value and
     cell bit is read from ghostty_type_json() at load time, zero
     hardcoded offsets). No wasm load here — the surface, not a race. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const surface = [
    'loadGhosttyVT({ url | bytes })',
    'vtWrite(bytes) ⇄ dirtyRows()',
    'keyEncode(event) · paste.isSafe / encode',
    'reset · resize · scrollViewport · snapshotEncode()',
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

<div class={cx(bpA.ghosttyVtStage)}>
  <div class={cx(bpA.ghosttyVtPanel)}>
    <div class={cx(bpA.ghosttyVtComment)}>// one manifest, zero hardcoded offsets</div>
    <div class={cx(bpA.ghosttyVtHead)}>
      ghostty_type_json()
    </div>
    <div class={cx(bpA.ghosttyVtArrow)}>→ structs · enums · cell bits @ load time</div>
    <div class={cx(bpA.ghosttyVtComment, bpA.ghosttyVtGap)}>// the frozen GhosttyVT surface</div>
    {#each surface as line (line)}
      <div class={cx(bpA.ghosttyVtLine)}>{line}</div>
    {/each}
    <div class={cx(bpA.ghosttyVtComment, bpA.ghosttyVtGap)}>
      GhosttyVTError with cause — typed failure, no message sniffing
    </div>
  </div>
</div>
