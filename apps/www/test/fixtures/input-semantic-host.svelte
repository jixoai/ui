<!-- The semantic glyph lane fixture (Owner 2026-09-05): the four
     per-type defaults, the two absent lanes, both pins, and the icon
     snippet override — one host so the spec walks every resolution
     branch of the axis -->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
</script>

<div>
  <Input data-testid="sem-url" type="url" placeholder="https://jixoai.dev" label="URL" />
  <Input data-testid="sem-tel" type="tel" label="Phone" />
  <Input data-testid="sem-email" type="email" label="Email" />
  <Input data-testid="sem-search" type="search" label="Search" />
  <Input data-testid="sem-text" type="text" label="Plain" />
  <Input data-testid="sem-password" type="password" label="Secret" />
  <Input data-testid="sem-optout" type="url" icon={null} label="Opted out" />
  <Input data-testid="sem-pinned-start" type="url" iconPosition="start" label="Pinned start" />
  <Input data-testid="sem-pinned-end" type="tel" iconPosition="end" label="Pinned end" />
  <Input data-testid="sem-custom" type="text" label="Custom glyph">
    {#snippet icon()}<span data-custom-glyph>custom</span>{/snippet}
  </Input>
</div>
