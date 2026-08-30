<!--
  Test host for the terminal-patterns login contract (2026-08-30):
  mounts the canonical pattern-login card with every prop exposed so
  the suite can drive the echo line, the reveal and the bootstrap copy.
-->
<script lang="ts">
  import PatternLogin from '../../src/lib/ui/pattern-login/pattern-login.svelte';

  let {
    host = 'jixoai.dev',
    command = 'npx jixoai-ui init',
    onsignin,
  }: { host?: string; command?: string; onsignin?: () => void } = $props();

  let user = $state('');
  let password = $state('');
</script>

<PatternLogin {host} {command} {onsignin} bind:user bind:password />
