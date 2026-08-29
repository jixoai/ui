<!-- ghostty-vt blueprint: the wasm ABI binding as a diagram (utils/
     toc-engine lib-scene precedent — the frozen surface of design.md
     D4 over the marshaling spine: every struct offset, enum value and
     cell bit is read from ghostty_type_json() at load time, zero
     hardcoded offsets). No wasm load here — the surface, not a race. -->
<script lang="ts">
  const surface = [
    'loadGhosttyVT({ url | bytes })',
    'vtWrite(bytes) ⇄ dirtyRows()',
    'keyEncode(event) · paste.isSafe / encode',
    'reset · resize · scrollViewport · snapshotEncode()',
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <div class="flex flex-col items-start gap-4 font-mono text-[13px]">
    <div class="text-muted-foreground">// one manifest, zero hardcoded offsets</div>
    <div class="rounded-none border border-border bg-muted px-2 py-1 shadow-2xs">
      ghostty_type_json()
    </div>
    <div class="text-primary">→ structs · enums · cell bits @ load time</div>
    <div class="text-muted-foreground mt-2">// the frozen GhosttyVT surface</div>
    {#each surface as line (line)}
      <div class="border-border border-l-2 pl-2">{line}</div>
    {/each}
    <div class="text-muted-foreground mt-2">
      GhosttyVTError with cause — typed failure, no message sniffing
    </div>
  </div>
</div>
