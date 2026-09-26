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
    drive the exits; undefined = the pipeline's default A4. The SAME
    grammar feeds PrintDoc's printOptions — the AMBIENT entry
    (beforeprint auto-init, 2026-09-01): a cold Ctrl/Cmd+P runs the
    pipeline with the document's chosen setup, never a fallback.

  Pages that need their own fixture surface (the print-pipeline pilot)
  ship CONTENT only — the layer is here, once, for the whole tree.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { rt } from '$lib/surface/routes.stylex';
  import type { Snippet } from 'svelte';
  import { PrintDoc, PrintControls } from '$lib/print';
  import type { PrintPageConfig } from '$lib/print';

  let { children }: { children: Snippet } = $props();

  // The docs-wide default grammar — the acceptance surface is EVERY
  // docs page, not just the pilot: A4, breathing margins, and the
  // documented-print conventions (Owner acceptance r5, 2026-09-01):
  // the brand icon + the page's OWN h1 title as the top-left running
  // head (string-set by the kernel; string(name, first) carries the
  // value page to page), the current h2 section as the top-right
  // running head, and the page number composed CENTERED in the
  // footer ("X / Y"). A page overrides through its own printConfig
  // page data (structured values, devalue-safe); undefined here means
  // "adopt the site default".
  const DEFAULT_PRINT_CONFIG: PrintPageConfig = {
    size: 'A4',
    margin: { top: 22, right: 16, bottom: 20, left: 16, unit: 'mm' },
    headerIcon: '/icon.svg',
    header: { 'top-left': 'string:docTitle', 'top-right': 'string:sectionTitle' },
    footer: { 'bottom-center': 'counter(page) " / " counter(pages)' },
  };
  const printConfig = $derived(
    (page.data.printConfig as PrintPageConfig | undefined) ?? DEFAULT_PRINT_CONFIG,
  );

  // the layout's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
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
</script>

<PrintDoc printOptions={{ config: printConfig }}>
  <div data-jx-print="hide" class={cx(rt.dlControls)}>
    <PrintControls config={printConfig} label="docs · print" />
  </div>
  <!-- the search palette left this subtree for the ROOT layout
       (nav-fuzzy-filter change, N2): ONE mount site-wide — keeping a
       second one here would double ⌘K listeners and stack two open
       dialogs on every docs page -->
  {@render children()}
</PrintDoc>
