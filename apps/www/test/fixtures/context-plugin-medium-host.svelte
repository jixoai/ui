<!--
  The medium round-trip host (test fixture, context-plugin-system):
  a real medium provider above a plugin root above TWO withPlugins
  pipelines —

    probe-a  an OBJECT context gated by env.medium !== 'screen'
             (the reversible filter gate; object raw so reference
             rebound is assertable)
    probe-b  an ungated context whose plugin never reads env (the
             dependency-count control: its derived must NOT recompute
             when only the medium moves)

  Rendered spans expose each pipeline's exposed projection; the spec
  drives the medium screen → sim → print → sim → screen through the
  real channels (DOM sim stamp + beforeprint/afterprint) and asserts
  values, references and hook-call counts at every step.

  Identity matching (context-plugin-v2): the defs the plugins target
  are the SAME objects the pipelines build on — file-level consts, one
  identity per key. The medium is INJECTED (captured once below, its
  derived property read by the getter — never a per-read getContext):
  without the injection env.medium would sit at 'screen' forever and
  the whole round-trip would test nothing.
-->
<script lang="ts">
  import { provideMedium } from '../../src/lib/medium.svelte';
  import {
    defineContextDef,
    definePlugin,
    provideContextPlugins,
    withPlugins,
    type PluginPipeline,
  } from '../../src/lib/context-plugin.svelte';

  interface Probe {
    tag: string;
  }

  const PROBE_A_DEF = defineContextDef({
    key: 'probe-a',
    defaults: (): Probe => ({ tag: 'a' }),
    ssrSafe: { tag: 'a' } as Probe,
  });
  const PROBE_B_DEF = defineContextDef({ key: 'probe-b', defaults: () => 'b', ssrSafe: 'b' });

  let {
    calls,
    holder,
  }: {
    calls: { a: number; b: number };
    holder: { a?: PluginPipeline<Probe>; b?: PluginPipeline<string> };
  } = $props();

  let rootEl = $state<HTMLElement | undefined>(undefined);
  const medium = provideMedium({ root: () => rootEl });

  const scope = provideContextPlugins(
    [
      definePlugin({
        name: 'gated-a',
        targets: [PROBE_A_DEF],
        filter: (_def, env) => env.medium !== 'screen',
        before: (v: Probe, _env): Probe => {
          calls.a++;
          return { tag: `A(${v.tag})` };
        },
      }),
      definePlugin({
        name: 'plain-b',
        targets: [PROBE_B_DEF],
        before: (v: string, _env): string => {
          calls.b++;
          return `B(${v})`;
        },
      }),
    ],
    { medium: () => medium?.medium },
  );

  const pipeA = withPlugins(PROBE_A_DEF, scope);
  const pipeB = withPlugins(PROBE_B_DEF, scope);
  // svelte-ignore state_referenced_locally — report-out holders, fixed per mount
  holder.a = pipeA;
  // svelte-ignore state_referenced_locally — report-out holders, fixed per mount
  holder.b = pipeB;
</script>

<div bind:this={rootEl} data-testid="medium-root">
  <span data-testid="exposed-a">{pipeA.exposed.tag}</span>
  <span data-testid="exposed-b">{pipeB.exposed}</span>
</div>
