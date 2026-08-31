<!--
  routes/docs/+layout.svelte — the print layer's layout wiring
  (print-pipeline, 2026-08-30, task 4.1).

  Every /docs page rides inside ONE PrintDoc: the content root keeps
  its normal web flow (a plain wrapper div — zero chrome, zero layout
  assumptions; each page's own container styles are untouched), and
  the print layer around it is the declared increment:

  - the medium + plugin root + pipeline the print-doc component
    provides (its inner plugin root composes over the ROOT layout's,
    same set — idempotent interventions);
  - ONE controls strip at the top, excluded from paper by the hide
    verb — the UI print entrance on EVERY existing docs page (the
    Owner acceptance surface), no per-page wiring;
  - the page grammar comes from PAGE DATA: a page may export
    `printConfig` (a structured PrintPageConfig — devalue-safe) to
    drive the exits; undefined = the pipeline's default A4.

  Pages that need their own fixture surface (the print-pipeline pilot)
  ship CONTENT only — the layer is here, once, for the whole tree.
-->
<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import { PrintDoc, PrintControls } from '$lib/print';
  import type { PrintPageConfig } from '$lib/print';

  let { children }: { children: Snippet } = $props();

  // optional per-page grammar (+page.ts load) — serializable by
  // construction (structured values, no strings-as-CSS)
  const printConfig = $derived(page.data.printConfig as PrintPageConfig | undefined);
</script>

<PrintDoc>
  <div data-jx-print="hide" class="mx-auto w-full max-w-[90rem] px-4 pt-6 sm:px-6 lg:px-8">
    <PrintControls config={printConfig} label="docs · print" />
  </div>
  {@render children()}
</PrintDoc>
