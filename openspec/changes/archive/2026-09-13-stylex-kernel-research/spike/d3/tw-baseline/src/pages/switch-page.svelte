<script lang="ts">
  // the registry's switch IS ui/toggle (corpus-report friction #1)
  import Switch from '../ui/toggle/index.ts';

  let on1 = $state(true);
  let on2 = $state(false);
</script>

<h1 class="text-lg font-semibold mb-2">switch — the state-machine carve-out</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: :checked travel, hover inset ring, focus ring, disabled, reduced-motion.
</p>

<section data-sw-section="basic">
  <h2 class="mb-2">states</h2>
  <div class="flex flex-wrap items-center gap-4">
    <Switch bind:checked={on1} data-sw="one" />
    <Switch bind:checked={on2} data-sw="two" />
    <Switch checked={true} disabled data-sw="disabled" />
    <Switch bind:checked={on1} label="notifications" id="sw-label" />
  </div>
</section>
