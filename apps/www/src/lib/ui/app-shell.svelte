<!--
  jixoai page scaffold (registry/files/ui/app-shell.svelte).
  The site-level scaffold around TerminalHeader: a sticky, always-visible
  header band (navigation never scrolls away), the main content column,
  and an optional footer band. Slots: header (required), children (main),
  footer (optional).

  View transitions (systematized MPA navigation, 2026-08-20):
  - cross-document transitions are enabled by `@view-transition` in
    app-shell.css (`navigation: auto`);
  - the header band carries view-transition-name "site-header" so it
    persists across navigations (no flicker);
  - the main column carries "page-main" and animates horizontally
    (slide) with a blur crossfade — see the ::view-transition rules;
  - render-blocking wiring for route types (from-/to-<route>) via
    view-transitions-toolkit is the consumer's <head> concern; pair this
    component with app-shell.css and the initVT() snippet in its docs.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    header: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { header, children, footer }: Props = $props();
</script>

<div class="flex min-h-svh flex-col bg-background text-foreground">
  <a href="#main" class="jx-skip-link">Skip to content</a>
  <div class="jx-scaffold-header sticky top-0 z-40">
    {@render header()}
  </div>
  <main id="main" class="jx-page-main flex-1">
    {@render children()}
  </main>
  {#if footer}
    {@render footer()}
  {/if}
</div>
