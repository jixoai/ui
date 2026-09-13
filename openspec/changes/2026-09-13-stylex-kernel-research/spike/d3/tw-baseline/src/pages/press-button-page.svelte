<script lang="ts">
  import PressButton from '../ui/press-button/index.ts';

  let loading = $state(false);
  let btn = $state<ReturnType<typeof PressButton>>();

  async function simulateDeploy(): Promise<void> {
    loading = true;
    await new Promise((r) => setTimeout(r, 1200));
    loading = false;
    btn?.flash();
  }
</script>

<h1 class="text-lg font-semibold mb-2">press-button — variant ladder × density × press physics</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: the ladder (fill/tonal/outline/ghost/link), hue injection, loading lock +
  flash, square pose. Flip density in the nav; hover/press the rungs.
</p>

<section class="mb-4" data-pb-section="ladder">
  <h2 class="mb-2">the ladder</h2>
  <div class="flex flex-wrap gap-2">
    <PressButton variant="fill" data-pb="fill">deploy</PressButton>
    <PressButton variant="tonal" data-pb="tonal">tonal</PressButton>
    <PressButton variant="outline" data-pb="outline">outline</PressButton>
    <PressButton variant="ghost" data-pb="ghost">ghost</PressButton>
    <PressButton variant="link" data-pb="link">link</PressButton>
  </div>
</section>

<section class="mb-4" data-pb-section="hue">
  <h2 class="mb-2">semantic hue injection</h2>
  <div class="flex flex-wrap gap-2">
    <PressButton variant="fill" hue="destructive" data-pb="destructive">delete</PressButton>
    <PressButton variant="tonal" hue="success" data-pb="success">copied</PressButton>
  </div>
</section>

<section class="mb-4" data-pb-section="async">
  <h2 class="mb-2">the async two-step (loading → flash)</h2>
  <div class="flex items-center gap-3">
    <PressButton variant="fill" bind:this={btn} {loading} data-pb="async" onclick={simulateDeploy}>
      {loading ? 'deploying' : 'deploy'}
    </PressButton>
    <span class="text-muted-foreground" data-pb-async-state={loading ? 'loading' : 'idle'}
      >aria-disabled locks activation; flash() paints ✓</span
    >
  </div>
</section>
