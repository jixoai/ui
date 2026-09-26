<!--
  jixoai print-controls (lib/print/print-controls.svelte, print-pipeline
  2026-08-30) — the print layer's UI exits: the SIM TOGGLE and the
  DIRECT-PRINT button, the transaction's progress, and the structured
  diagnostic rows (the sim's diagnostic carrier; direct print records
  into the artifact metadata + the console).

  Contract order: the sim toggle stamps the source root FIRST (the
  preparatory medium signal — the plugin filters open), then runs the
  transaction. Direct print needs NO pre-stamp: prepareSnapshot
  self-stamps only when the medium is screen (an existing sim stamp
  is reused, never owned) and afterprint releases only what the
  transaction created. Ctrl+P stays the browser's native degraded
  path — documented, not wired here.

  Placement: page chrome / the docs layout (data-jx-print="hide" not
  needed — the paged output is a separate tree; the controls simply
  sit outside [data-print-source] when the host wants them hidden
  from paper, or inside when the hide verb applies).
-->
<script lang="ts">
  import { getPrintPipeline } from './print-context';
  import { getMedium, PRINT_SIM_ATTR } from '../medium.svelte';
  import { siteChrome } from '$lib/surface/site-chrome.stylex';
  import type { PrintRunOptions } from './pipeline.svelte';

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  let {
    config,
    lineNumbers = true,
    label = 'print',
  }: { config?: PrintRunOptions['config']; lineNumbers?: boolean; label?: string } = $props();

  const pipeline = getPrintPipeline();
  const medium = getMedium();

  let simOpen = $state(false);
  let busy = $state(false);

  const options = $derived<PrintRunOptions>({ config, lineNumbers });

  const sourceRoot = (): HTMLElement | null =>
    document.querySelector<HTMLElement>('[data-print-source]');

  async function toggleSim(): Promise<void> {
    if (!pipeline || busy) return;
    const root = sourceRoot();
    busy = true;
    try {
      if (!simOpen) {
        // the preparatory signal FIRST — the plugin filters open
        root?.setAttribute(PRINT_SIM_ATTR, '');
        simOpen = true;
        await pipeline.runSim(options);
      } else {
        simOpen = false;
        // the toggle OWNS the sim stamp: it removes its own
        root?.removeAttribute(PRINT_SIM_ATTR);
        pipeline.closeSim();
      }
    } catch {
      // the failed transaction already cleaned up; the stamp leaves too
      simOpen = false;
      root?.removeAttribute(PRINT_SIM_ATTR);
    } finally {
      busy = false;
    }
  }

  async function directPrint(): Promise<void> {
    if (!pipeline || busy) return;
    busy = true;
    try {
      await pipeline.runPrint(options);
    } catch {
      /* status + diagnostics carry the failure */
    } finally {
      busy = false;
    }
  }

  const statusText = $derived(
    pipeline
      ? pipeline.status === 'preparing'
        ? `preparing ${pipeline.progress?.phase ?? ''} ${pipeline.progress ? `${pipeline.progress.done}/${pipeline.progress.total}` : ''}`
        : pipeline.status === 'rendering'
          ? 'rendering pages'
          : pipeline.status === 'error'
            ? `error: ${pipeline.lastError ?? ''}`
            : pipeline.status === 'ready'
              ? `${pipeline.pageCount} pages`
              : ''
      : '',
  );
</script>

<div
  data-jx-print-controls
  class={cx(siteChrome.pcBar)}
>
  <span class={cx(siteChrome.pcLabel)}>{label}</span>
  <button
    type="button"
    class="jx-press {cx(siteChrome.pcSim)}"
    aria-pressed={simOpen}
    data-jx-print-sim-toggle={simOpen ? 'on' : 'off'}
    onclick={() => void toggleSim()}
  >{simOpen ? '退出打印预览' : '打印预览（sim）'}</button>
  <button
    type="button"
    class="jx-press {cx(siteChrome.pcDirect)}"
    data-jx-print-direct
    onclick={() => void directPrint()}
  >打印 / 导出 PDF</button>
  {#if statusText}<span data-jx-print-status class={cx(siteChrome.pcStatus)}>{statusText}</span>{/if}
  {#if medium}
    <span data-jx-print-medium class={cx(siteChrome.pcMedium)}>medium: {medium.medium}</span>
  {/if}
</div>

<!-- the event protocol: the sim overlay's own bar (and probes) drive
     the same exits through document-level custom events — the overlay
     covers the live controls, so it carries its own -->
<svelte:document
  onjx-print-direct={() => void directPrint()}
  onjx-print-sim-toggle={() => void toggleSim()}
  onjx-print-cancel={() => pipeline?.cancel()}
/>

<!-- the sim's diagnostic carrier: one row per structured diagnostic —
     rendered ONLY while the sim is open (the rows are the sim
     transaction's own report surface; the closed web flow carries
     zero residue — the direct-print exit's carriers are the artifact
     metadata + the console) -->
{#if pipeline && simOpen && pipeline.diagnostics.length > 0}
  <ul data-jx-print-diagnostics class={cx(siteChrome.pcDiagList)}>
    {#each pipeline.diagnostics as row, i (row.code + row.owner + row.message + i)}
      <li data-jx-print-diagnostic data-code={row.code}>
        <b class={cx(siteChrome.pcDiagCode)}>{row.code}</b>
        <span class={cx(siteChrome.pcDiagOwner)}> {row.owner}</span>
        <span class={cx(siteChrome.pcDiagMessage)}> — {row.message}</span>
      </li>
    {/each}
  </ul>
{/if}
