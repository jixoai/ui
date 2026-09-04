<!--
  The hue pin host (test fixture, context-plugin-system): a real
  medium provider above a plugin root above the hue context host — the
  print story's seam. The plugin pins the hue to 210 whenever the
  medium leaves 'screen' (a reversible filter gate), so the
  documentElement stamp must follow the EXPOSED projection: wall-clock
  hue on screen, pinned hue under print.

  Identity matching (context-plugin-v2): the pin targets the CANONICAL
  HUE_DEF import — the same object hue-runtime's pipeline builds on.
  The medium is INJECTED (captured once below, its derived property
  read by the getter): without the injection env.medium would sit at
  'screen' forever and the pin would never open.
-->
<script lang="ts">
  import { provideMedium } from '../../src/lib/medium.svelte';
  import { definePlugin, provideContextPlugins } from '../../src/lib/context-plugin.svelte';
  import { HUE_DEF } from '../../src/lib/hue-runtime.svelte';
  import HueHost from './hue-context-host.svelte';

  let rootEl = $state<HTMLElement | undefined>(undefined);
  const medium = provideMedium({ root: () => rootEl });

  const pin = definePlugin({
    name: 'pin-hue',
    targets: [HUE_DEF],
    filter: (_def, env) => env.medium !== 'screen',
    before: (v: number, _env): number => (v === 210 ? v : 210),
  });
  provideContextPlugins([pin], { medium: () => medium?.medium });
</script>

<div bind:this={rootEl}>
  <HueHost />
</div>
