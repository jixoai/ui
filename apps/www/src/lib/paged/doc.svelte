<!--
  jixoai PagedDoc (apps/www/src/lib/paged/doc.svelte, paged-doc-family
  2026-08-30) — the publication document root, NATIVE engine.

  Web mode has NO pages: a continuous responsive flow (measure column
  + Tufte margin-note column when the width tier allows), no page
  chrome, no header, no footer. Pagination is the print-media
  PROJECTION of this one tree: break-* + the injected @page rule.

  Zero runtime dependencies — counters are CSS, margin notes are
  floats, the registry is plain Svelte context; no pagedjs import
  anywhere in the family (the bundle probe asserts it).

  Props map the CSS Paged Media / Paged.js vocabulary:
  - flow="web|print"        web (default) = immersive; print = the
                            page-shaped screen presentation
  - columns="auto|1|wide"   auto measures, 1 forces the narrow tier
                            (notes sink), wide forces the margin tier
  - page={{size,margin,bleed?,marks?}}
                            injected as a real @page rule under print;
                            bleed/marks are pagedjs-engine vocabulary
                            (placeholders the native engine ignores)
  - breakPolicy={{fillKeep,floatKeep,pageObject}}
                            pagedjs-handler defaults — the native
                            engine has no layout feedback and IGNORES
                            every threshold (synthesis §2: declare
                            results only, promise no fill rates)
  - orphans/widows          2/2 defaults, projected as the global
                            :where() rule (fed through custom props)
  - runningHeader           a snippet; Chromium-only fixed projection
                            (native margin boxes do not exist — the
                            comment in paged.css owns the caveat)
  - engine="native|pagedjs" native is the only implemented engine;
                            "pagedjs" is accepted vocabulary, warned
                            in dev, still rendered native
  - sim                     page-owned bindable driving the
                            data-jx-print-sim stamp (the screen print
                            preview); the medium context reads the
                            stamp back from the DOM — the DOM is the
                            source of truth, any writer may stamp
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { provideMedium, type MediumContext } from '../medium.svelte';
  import {
    createPagedDocContext,
    PAGED_KEY,
    type PagedDocContext,
  } from './registry.svelte';
  import './print-projection.css';
  import './paged.css';

  interface Props {
    flow?: 'web' | 'print';
    columns?: 'auto' | '1' | 'wide';
    page?: { size?: string; margin?: string; bleed?: string; marks?: string };
    breakPolicy?: { fillKeep?: number; floatKeep?: number; pageObject?: number };
    orphans?: number;
    widows?: number;
    runningHeader?: Snippet;
    engine?: 'native' | 'pagedjs';
    sim?: boolean;
    id?: string;
    class?: string;
    children: Snippet;
  }

  let {
    flow = 'web',
    columns = 'auto',
    page = {},
    breakPolicy,
    orphans = 2,
    widows = 2,
    runningHeader,
    engine = 'native',
    sim = $bindable(false),
    id,
    class: className = '',
    children,
  }: Props = $props();

  $effect(() => {
    if (engine === 'pagedjs' && import.meta.env.DEV) {
      console.warn(
        '[PagedDoc] engine="pagedjs" is vocabulary only — the native engine renders (paged-doc-family v1)',
      );
    }
  });

  const pageSize = $derived(page.size ?? 'A4');
  const pageMargin = $derived(page.margin ?? '18mm 16mm');
  // bleed / marks: pagedjs-engine vocabulary, intentionally not
  // serialized into the native @page rule; breakPolicy's thresholds
  // (fillKeep/floatKeep/pageObject) are likewise pagedjs-handler
  // defaults the native engine ignores by law (synthesis §2) — the
  // props stay the single vocabulary surface, consumed elsewhere.

  // CSS lengths injected into @page are page-authored strings; keep
  // them to the length grammar so a stray brace can never escape the
  // declaration it rides in
  const lengthToken = (value: string): string => value.replace(/[^A-Za-z0-9 .,()%/-]/g, '');

  // the @page projection, injected as a real stylesheet rule so print
  // media honors it (SSR-rendered through svelte:head; reactive to
  // the page prop — the toolbar's page-size select rewrites it live)
  const pageRules = $derived(
    `<style data-jx-paged-page-rules>@page{size:${lengthToken(pageSize)};margin:${lengthToken(pageMargin)}}</style>`,
  );
  // the flow="print" screen presentation maps the same size to a width
  const pageWidth = $derived(
    /^letter/i.test(pageSize) ? '8.5in' : /^\d/.test(pageSize) ? lengthToken(pageSize) : '210mm',
  );

  // ---- the contexts this root provides --------------------------------
  // numbering registry (document order; sections/figures/notes
  // register at their own init) + the width tier the asides read
  const registry = createPagedDocContext();
  setContext(PAGED_KEY, registry as PagedDocContext);

  // the print medium (three-state derived reducer; SSR-safe)
  let rootEl = $state<HTMLElement | undefined>(undefined);
  const medium: MediumContext = provideMedium({ root: () => rootEl, initialSim: sim });

  // ---- the width tier ---------------------------------------------------
  // forced by columns="1|wide"; measured when auto. Stamped as
  // data-width so the float/sink pose is observable DOM state (the
  // ResizeObserver keeps it truthful after hydration; SSR assumes
  // wide — the stamp corrects within the first frame on narrow
  // viewports, the documented progressive-enhancement seam).
  let measured = $state<'wide' | 'narrow'>('wide');
  const widthTier = $derived(
    columns === '1' ? 'narrow' : columns === 'wide' ? 'wide' : measured,
  );
  // SSR pins the initial tier synchronously (effects never run on
  // the server); the effect below keeps it reactive after hydration
  // svelte-ignore state_referenced_locally
  registry.setWidth(widthTier);
  $effect(() => {
    registry.setWidth(widthTier);
  });
  // 96ch (measure 66 + note 26 + gap 4) at 16px serif ≈ 1024px — the
  // float tier needs the full composed measure to be readable
  const WIDE_MIN_PX = 1024;
  $effect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const el = rootEl;
    if (!el) return;
    const ro = new ResizeObserver((records) => {
      // entry.contentRect is the standard read; test polyfills and
      // exotic engines may omit it — fall back to the bounding rect
      const width = records[0]?.contentRect?.width ?? el.getBoundingClientRect().width;
      measured = width >= WIDE_MIN_PX ? 'wide' : 'narrow';
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  // ---- the registry's DOM-order signal ----------------------------------
  // Keyed reorders MOVE nodes without re-running any component init
  // — the registration-order trap. One subtree observer on the doc
  // root re-sorts the registry to the live DOM order (batched per
  // microtask), keeping the Svelte numbers and the CSS counters on
  // the same single source: DOM order.
  $effect(() => {
    const el = rootEl;
    if (!el || typeof MutationObserver === 'undefined') return;
    let queued = false;
    const resync = () => {
      queued = false;
      registry.resync();
    };
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(resync);
    });
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  const docClass = $derived(`jx-paged-doc ${className}`.trim());
</script>

<svelte:head>
  {@html pageRules}
</svelte:head>

{#if runningHeader}
  <!-- Chromium-only: position:fixed repeats per printed page; real
       margin boxes belong to the pagedjs engine tier -->
  <div data-jx-paged-running aria-hidden="true">{@render runningHeader()}</div>
{/if}

<article
  bind:this={rootEl}
  id={id}
  data-jx-paged-doc
  data-jx-medium={medium.medium}
  data-jx-print-sim={sim || undefined}
  data-flow={flow}
  data-columns={columns}
  data-width={widthTier}
  data-engine={engine}
  data-running={runningHeader ? 'true' : undefined}
  class={docClass}
  style:--jx-paged-orphans={orphans}
  style:--jx-paged-widows={widows}
  style:--jx-paged-page-w={pageWidth}
  style:--jx-paged-page-margin={pageMargin}
>
  {@render children()}
</article>
