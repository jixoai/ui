<!--
  The onion-order density host (test fixture, context-plugin-system).
  Two composing modes, one exact log contract:
    nested=false — ONE root with plugins [A, B] (same root)
    nested=true  — outer root [A] wrapping inner root [B] (parent/child
                   roots composing one flat chain, parent outer)
  The logging plugins append to the `log` array prop; the spec asserts
  the call order is exactly beforeA → beforeB → afterB → afterA in
  BOTH modes (the Owner onion ruling). rerender(leafSize) forces a
  fresh resolution pass for the precise single-pass log.

  `dup` renames both plugins to one name — proving CROSS-ROOT names
  never dedupe (the same-name override law is per-root only).
  `outerHolder`/`innerHolder` receive the built scopes for structural
  chain-composition assertions.
-->
<script lang="ts">
  import Root from './context-plugin-root.svelte';
  import Leaf from './density-leaf-host.svelte';
  import { definePlugin } from '../../src/lib/context-plugin.svelte';
  import { DENSITY_DEF, type Density } from '../../src/lib/density.svelte';

  let {
    log,
    nested = false,
    leafSize = 'lg',
    dup = false,
    outerHolder,
    innerHolder,
  }: {
    log: string[];
    nested?: boolean;
    leafSize?: Density;
    dup?: boolean;
    outerHolder?: { scope?: unknown };
    innerHolder?: { scope?: unknown };
  } = $props();

  // svelte-ignore state_referenced_locally — plugin identity is fixed per mount
  const A = definePlugin({
    name: dup ? 'same' : 'A',
    targets: [DENSITY_DEF],
    before: (v: Density | undefined): Density | undefined => {
      log.push('beforeA');
      return v === undefined ? v : 'sm';
    },
    after: (v: Density | undefined): Density | undefined => {
      log.push('afterA');
      return v;
    },
  });
  // svelte-ignore state_referenced_locally — plugin identity is fixed per mount
  const B = definePlugin({
    name: dup ? 'same' : 'B',
    targets: [DENSITY_DEF],
    before: (v: Density | undefined): Density | undefined => {
      log.push('beforeB');
      return v;
    },
    after: (v: Density | undefined): Density | undefined => {
      log.push('afterB');
      return v;
    },
  });
</script>

{#if nested}
  <Root plugins={[A]} holder={outerHolder}>
    <Root plugins={[B]} holder={innerHolder}>
      <Leaf size={leafSize} />
    </Root>
  </Root>
{:else}
  <Root plugins={[A, B]} holder={outerHolder}>
    <Leaf size={leafSize} />
  </Root>
{/if}
