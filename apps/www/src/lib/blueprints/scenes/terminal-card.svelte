<!-- terminal-card blueprint: the Broadside hero terminal in its settled
     state — traffic-light title bar, the large typed command with its
     static block cursor, surfaced output lines, 6px hard offset shadow.
     (The blueprint pass runs reduced-motion, so the one-time typing
     entrance renders settled — the prerendered/no-JS paint.) -->
<script lang="ts">
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="w-full max-w-[480px]">
    <TerminalCard
      barTitle="quick-start — zsh"
      command="npx jixoai-ui add terminal-card"
      outputs={['terminal-card.svelte → src/lib/ui/', 'settled render · static cursor']}
    />
  </div>
</div>
