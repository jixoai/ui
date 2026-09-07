<!--
  prose-plugin-host — the plugin-chain-at-the-provider probe fixture
  (Lane A spec): a plugin root whose TYPOGRAPHY_DEF plugin strips the
  gradient (the print-flattening shape, design §1.1) wraps a Prose
  with a gradient knob. The chain must land BEFORE CSS sees it — the
  host carries no data-jx-ty-ink='gradient' and no --jx-ty-gradient.
-->
<script lang="ts">
  import { provideContextPlugins, definePlugin } from '../../src/lib/context-plugin.svelte';
  import { TYPOGRAPHY_DEF, type TypoScope } from '../../src/lib/typography.svelte';
  import Prose from '../../src/lib/ui/prose/prose.svelte';
  import P from '../../src/lib/ui/text/p.svelte';

  // the flatten plugin: gradient/ground never reach the screen host
  // (the print-medium lane's shape — a pure value-in/value-out strip)
  const flatten = definePlugin({
    name: 'spec-flatten-gradient',
    targets: [TYPOGRAPHY_DEF],
    after: (scope) => {
      const { gradient: _g, ground: _gr, ...rest } = scope as TypoScope;
      return rest as TypoScope;
    },
  });
  provideContextPlugins([flatten]);
</script>

<div data-testid="plugin-wrap">
  <Prose gradient={{ from: 'red', to: 'blue' }} ink="primary">
    <P>flattened body</P>
  </Prose>
</div>
