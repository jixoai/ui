<!-- checkbox blueprint: the state mix on one preference list — checked,
     unchecked, indeterminate, and a disabled checked row. -->
<script lang="ts">
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center p-10">
  <div class="flex w-full max-w-[380px] flex-col gap-4">
    <Checkbox label="deploy on push" checked />
    <Checkbox label="preview deployments" />
    <Checkbox label="all environments" indeterminate />
    <Checkbox label="legacy webhooks (deprecated)" checked disabled />
  </div>
</div>
