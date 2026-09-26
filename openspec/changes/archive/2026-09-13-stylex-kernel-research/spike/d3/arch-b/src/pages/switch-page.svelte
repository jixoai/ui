<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { demo } from '../demo.stylex';
  import Switch from '../families/switch/switch.svelte';

  let on1 = $state(true);
  let on2 = $state(false);
</script>

<h1 {...stylex.attrs(demo.title)}>switch — the state-machine carve-out</h1>
<p {...stylex.attrs(demo.note)}>
  ONE input[role=switch]; ::before is the knob; :checked drives the travel + ground
  flip; density geometry flows through --jx-toggle-* vars. Fully StyleX-expressible —
  flip density in the nav and watch the track resize.
</p>

<section {...stylex.attrs(demo.section)} data-sw-section="states">
  <h2 {...stylex.attrs(demo.sectionTitle)}>checked × disabled × labeled</h2>
  <div {...stylex.attrs(demo.row)}>
    <Switch bind:checked={on1} data-sw="one" />
    <Switch bind:checked={on2} data-sw="two" />
    <Switch checked={true} disabled data-sw="disabled" />
    <Switch bind:checked={on1} label="notifications" id="sw-label" />
  </div>
</section>
