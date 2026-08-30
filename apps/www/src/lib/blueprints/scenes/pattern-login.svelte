<!-- pattern-login blueprint: the ssh login card — user/host lanes over
     the input reveal, bootstrap-command footer. -->
<script lang="ts">
  import PatternLogin from '$lib/ui/pattern-login/pattern-login.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <PatternLogin host="edge-01.prod" command="npx jixoai-ui login" />
</div>
