<script lang="ts">
  // press-button route page — the corpus demo surface. data-pb-* hooks
  // are the computed-style probe targets.
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import PressButton from '../families/press-button/press-button.svelte';

  let loading = $state(false);
  let btn = $state<ReturnType<typeof PressButton>>();

  async function simulateDeploy(): Promise<void> {
    loading = true;
    await new Promise((r) => setTimeout(r, 1500));
    loading = false;
    btn?.flash();
  }
</script>

<h1 {...stylex.attrs(demo.title)}>press-button — variant ladder × density × press physics</h1>
<p {...stylex.attrs(demo.note)}>
  The ladder (fill/tonal/outline/ghost/link), square pose, raised/flat texture axis, hue
  injection (destructive pair, success tonal), loading lock + one-shot flash. Flip
  density in the nav; hover/press the rungs — the law: hover grows only the shadow,
  active presses +1px.
</p>

<section {...stylex.attrs(demo.section)} data-pb-section="ladder">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the ladder</h2>
  <div {...stylex.attrs(demo.row)}>
    <PressButton variant="fill" data-pb="fill">deploy</PressButton>
    <PressButton variant="tonal" data-pb="tonal">tonal</PressButton>
    <PressButton variant="outline" data-pb="outline">outline</PressButton>
    <PressButton variant="ghost" data-pb="ghost">ghost</PressButton>
    <PressButton variant="link" data-pb="link">link</PressButton>
  </div>
</section>

<section {...stylex.attrs(demo.section)} data-pb-section="hue">
  <h2 {...stylex.attrs(demo.sectionTitle)}>semantic hue injection (never a variant)</h2>
  <div {...stylex.attrs(demo.row)}>
    <PressButton variant="fill" hue="destructive" data-pb="destructive">delete</PressButton>
    <PressButton variant="tonal" hue="success" data-pb="success">copied</PressButton>
  </div>
</section>

<section {...stylex.attrs(demo.section)} data-pb-section="texture">
  <h2 {...stylex.attrs(demo.sectionTitle)}>flat texture (raised=false) + square</h2>
  <div {...stylex.attrs(demo.row)}>
    <PressButton variant="outline" raised={false} data-pb="flat">flat outline</PressButton>
    <PressButton variant="fill" raised={false} data-pb="flat-fill">flat fill</PressButton>
    <PressButton variant="outline" square data-pb-square="">▣</PressButton>
  </div>
</section>

<section {...stylex.attrs(demo.section)} data-pb-section="async">
  <h2 {...stylex.attrs(demo.sectionTitle)}>the async two-step (loading → flash)</h2>
  <div {...stylex.attrs(demo.row)}>
    <PressButton
      variant="fill"
      bind:this={btn}
      {loading}
      data-pb="async"
      onclick={simulateDeploy}
    >
      {loading ? 'deploying' : 'deploy'}
    </PressButton>
    <span {...stylex.attrs(demo.note)} data-pb-async-state={loading ? 'loading' : 'idle'}
      >aria-disabled locks activation; the spinner rides the leading lane; flash() paints ✓</span
    >
  </div>
</section>
