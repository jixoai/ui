<!--
  The hue pin host (test fixture, context-plugin-system): a real
  medium provider above a plugin root above the hue context host — the
  print story's seam. The plugin pins the hue to 210 whenever the
  medium leaves 'screen' (a reversible filter gate), so the
  documentElement stamp must follow the EXPOSED projection: wall-clock
  hue on screen, pinned hue under print.
-->
<script lang="ts">
  import { provideMedium } from '../../src/lib/medium.svelte';
  import { definePlugin, provideContextPlugins } from '../../src/lib/context-plugin.svelte';
  import HueHost from './hue-context-host.svelte';

  let rootEl = $state<HTMLElement | undefined>(undefined);
  provideMedium({ root: () => rootEl });

  const pin = definePlugin({
    name: 'pin-hue',
    targets: ['hue'],
    filter: (_def, env) => env.medium !== 'screen',
    before: (v: number, _env): number => (v === 210 ? v : 210),
  });
  provideContextPlugins([pin]);
</script>

<div bind:this={rootEl}>
  <HueHost />
</div>
