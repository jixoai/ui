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
-->
<script lang="ts">
  import { provideMedium } from '../../src/lib/medium.svelte';
  import {
    definePlugin,
    provideContextPlugins,
    withPlugins,
    type PluginPipeline,
  } from '../../src/lib/context-plugin.svelte';

  interface Probe {
    tag: string;
  }

  let {
    calls,
    holder,
  }: {
    calls: { a: number; b: number };
    holder: { a?: PluginPipeline<Probe>; b?: PluginPipeline<string> };
  } = $props();

  let rootEl = $state<HTMLElement | undefined>(undefined);
  provideMedium({ root: () => rootEl });

  const scope = provideContextPlugins([
    definePlugin({
      name: 'gated-a',
      targets: ['probe-a'],
      filter: (_def, env) => env.medium !== 'screen',
      before: (v: Probe, _env): Probe => {
        calls.a++;
        return { tag: `A(${v.tag})` };
      },
    }),
    definePlugin({
      name: 'plain-b',
      targets: ['probe-b'],
      before: (v: string, _env): string => {
        calls.b++;
        return `B(${v})`;
      },
    }),
  ]);

  const pipeA = withPlugins(
    { key: 'probe-a', defaults: (): Probe => ({ tag: 'a' }), ssrSafe: { tag: 'a' } },
    scope,
  );
  const pipeB = withPlugins(
    { key: 'probe-b', defaults: () => 'b', ssrSafe: 'b' },
    scope,
  );
  // svelte-ignore state_referenced_locally — report-out holders, fixed per mount
  holder.a = pipeA;
  // svelte-ignore state_referenced_locally — report-out holders, fixed per mount
  holder.b = pipeB;
</script>

<div bind:this={rootEl} data-testid="medium-root">
  <span data-testid="exposed-a">{pipeA.exposed.tag}</span>
  <span data-testid="exposed-b">{pipeB.exposed}</span>
</div>
