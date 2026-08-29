<!-- ghostty-term blueprint: the live wasm terminal surface frozen as its
     settled VT paint — the prompt, the add command with its output lines,
     one ANSI color row, and the fresh prompt under it. (The blueprint
     pass loads the REAL wasm from the built asset; the first onResize is
     the ready signal — auto mode reports the grid only once the wasm
     instantiated. Static snapshot: no onData wired, no interaction.) -->
<script lang="ts">
  import GhosttyTerm from '$lib/ui/ghostty-term/ghostty-term.svelte';
  import type { GhosttyTermHandle } from '$lib/ui/ghostty-term/ghostty-term.svelte';

  let term = $state<GhosttyTermHandle | undefined>(undefined);
  let booted = false;

  const SCENE =
    '\u001b[1;38;5;141mjixoai\u001b[0m:\u001b[38;5;81m~\u001b[0m$ npx jixoai-ui add ghostty-term\r\n' +
    'ghostty-term.svelte → src/lib/ui/ · ghostty-vt.ts → src/lib/\r\n' +
    '\u001b[38;5;244mcanvas grid painted by the real libghostty-vt wasm\u001b[0m\r\n' +
    '\r\n' +
    '\u001b[31m31\u001b[0m \u001b[32m32\u001b[0m \u001b[33m33\u001b[0m \u001b[34m34\u001b[0m \u001b[35m35\u001b[0m \u001b[36m36\u001b[0m \u001b[37m37\u001b[0m  \u001b[1mbold\u001b[0m \u001b[3mitalic\u001b[0m \u001b[4munderline\u001b[0m \u001b[7mreverse\u001b[0m\r\n' +
    '\r\n' +
    '\u001b[1;38;5;141mjixoai\u001b[0m:\u001b[38;5;81m~\u001b[0m$ ';

  const onResize = (): void => {
    if (booted) return;
    booted = true;
    term?.write(new TextEncoder().encode(SCENE));
  };
</script>

<div class="flex h-full w-full flex-col p-10">
  <div class="min-h-0 w-full flex-1">
    <GhosttyTerm bind:this={term} {onResize} />
  </div>
</div>
