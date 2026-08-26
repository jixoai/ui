<!-- alert blueprint: the variant pair plus the error-status
     injection as inline notice rows. -->
<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10">
  <Alert variant="tonal" title="Deployed">ui.jixoai.com is live — 77 registry items published.</Alert>
  <Alert title="Heads up">The preview cache rebuilds nightly.</Alert>
  <Alert variant="tonal" class="[--jx-tonal:var(--error)]" title="Build failed">entry "ghost" has no registry item.</Alert>
</div>
