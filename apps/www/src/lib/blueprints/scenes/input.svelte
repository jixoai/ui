<!-- input blueprint: labeled field, filled value, and an error state. -->
<script lang="ts">
  import Input from '$lib/ui/input.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10">
  <Input label="Registry name" value="press-button" />
  <Input label="Hue (oklch)" placeholder="27" error="hue must be 0–360" />
</div>
