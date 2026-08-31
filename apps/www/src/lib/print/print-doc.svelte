<!--
  jixoai print-doc (lib/print/print-doc.svelte, print-pipeline
  2026-08-30) — the print layer's SOURCE ROOT.

  Wraps the docs content (page- or layout-owned — the layout wiring
  lands with the integrator; the pilot page mounts it directly) and:

  - provides the medium context with the wrapper as the stamp root
    (the DOM is the signal source — the sim toggle and the print
    transaction both stamp THIS element);
  - provides the plugin root (the print plugins: filter = the medium
    gate, before = density→sm + hue→pin) ABOVE the content, so every
    density consumer inside resolves through the chain;
  - is itself the one density consumer whose data-density stamp the
    transaction's DOM-commit barrier asserts (no opinion → no stamp
    on the open web; the plugin's 'sm' IS an opinion under sim/print
    — the fleet law holds: nothing is manufactured when closed);
  - owns the pipeline instance the controls consume.

  The web flow of the content is UNCHANGED: one wrapper div, normal
  flow, no chrome. The controls and the output sibling are separate,
  declared additions (print-controls / the pipeline's
  [data-print-output]).
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { provideMedium, type MediumContext } from '../medium.svelte';
  import { provideContextPlugins } from '../context-plugin.svelte';
  import { printPlugins } from './context-plugin';
  import { getDensityContext, resolveDensity } from '../density.svelte';
  import { createPrintPipeline, type PrintPipeline } from './pipeline.svelte';
  import { PRINT_PIPELINE_KEY } from './print-context';
  import './sim-shell.css';

  let {
    children,
    id,
    class: className = '',
  }: { children: Snippet; id?: string; class?: string } = $props();

  let rootEl = $state<HTMLElement | undefined>(undefined);

  // the medium first (the plugin root's env reads it at provide time)
  const medium: MediumContext = provideMedium({ root: () => rootEl ?? undefined });
  void medium;
  // then the plugin root — the print interventions live ABOVE every
  // density consumer inside the content
  provideContextPlugins(printPlugins);

  // the barrier's assertion target: this root's own density stamp
  // (undefined on the open web — no manufactured opinion)
  const density = $derived(resolveDensity(undefined, getDensityContext()));

  // the pipeline instance (client-lazy: nothing touches the document
  // until a control drives it)
  const pipeline: PrintPipeline = createPrintPipeline(() => rootEl);
  setContext(PRINT_PIPELINE_KEY, pipeline);

  // unmount hygiene: a sim still open when the layer leaves the tree
  // (a mid-sim navigation) must not strand the body-level overlay —
  // dispose is the idempotent all-paths cleanup
  $effect(() => () => pipeline.dispose());
</script>

<div bind:this={rootEl} {id} data-print-source data-density={density} class={className}>
  {@render children()}
</div>
