<!--
  docs/registry.html — the registry overview (docs-restructure,
  2026-08-25). The answer to "what can I install": the full inventory
  in one table. UI modules link to the Components listing; the non-UI
  install targets (theme sheet, lib engines, file payloads) have no
  docs chapters — their documentation lives on the pages they power,
  and this table is their discoverable surface: name · type · the host
  page that documents it · the install command.
-->
<script lang="ts">
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { flatComponents, installTargets } from '$lib/docs-route-model';
  import { icons } from '$lib/icons';
  import { CATALOG } from '$lib/catalog';

  const uiCount = flatComponents.length;
</script>

<svelte:head>
  <title>Registry · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui registry overview — every installable item: UI modules in the Components listing, plus the non-UI install targets (theme sheet, lib engines, file payloads) documented on their host pages."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex flex-col gap-10">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="docs · registry"
        title="Registry — what is installable"
        summary="One registry, two kinds of payload: UI modules (the Components listing) and non-UI install targets — the theme sheet, the lib engines and the file payloads. Install targets have no docs chapters: their documentation lives on the pages they power, and this table is their inventory."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">{CATALOG.length} registry items</span>
          <span class="pill">{uiCount} ui modules</span>
          <span class="pill">{installTargets.length} install targets</span>
        </div>
      </SectionCard>
    </div>

    <!-- UI modules: one row, routing into the Components listing -->
    <section aria-label="ui modules" data-reveal="">
      <h2 class="font-nav mb-4 flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]">
        UI modules
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>
      <a class="jx-invrow" href="/docs/components.html">
        <span class="jx-inv-name">all ui modules</span>
        <span data-jx-inv-type>registry:ui</span>
        <span class="jx-inv-docs inline-flex items-center gap-1">the Components listing <span class="[&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html icons.arrowRight}</span></span>
        <span class="jx-inv-cmd">npx jixoai-ui add &lt;name&gt;</span>
      </a>
    </section>

    <!-- the install targets: the engines' one discoverable surface -->
    <section aria-label="install targets" data-reveal="">
      <h2 class="font-nav mb-4 flex items-baseline gap-4 text-lg uppercase tracking-[0.3em]">
        Install targets
        <span class="bg-border h-px flex-1" aria-hidden="true"></span>
      </h2>
      <div class="jx-invtable" role="table" aria-label="non-UI registry items">
        <div class="jx-invhead" role="row">
          <span role="columnheader">name</span>
          <span role="columnheader">type</span>
          <span role="columnheader">documented on</span>
          <span role="columnheader">install</span>
        </div>
        {#each installTargets as item (item.name)}
          <a class="jx-invrow" role="row" href={item.href}>
            <span class="jx-inv-name" role="cell">{item.name}</span>
            <span data-jx-inv-type role="cell">{item.type.replace('registry:', '')}</span>
            <span class="jx-inv-docs" role="cell">{item.href}</span>
            <span class="jx-inv-cmd" role="cell">npx jixoai-ui add {item.name}</span>
          </a>
        {/each}
      </div>
      <p class="text-muted-foreground mt-4 flex items-start gap-1.5 font-mono text-xs leading-5">
        <span class="text-primary mt-0.5 flex-none [&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html icons.arrowRight}</span>
        <span>jx-pure additionally carries its own chapter under Sections (the componentless face)
        — it is the one install target that is also a standalone destination.</span>
      </p>
    </section>
  </div>
</div>

<style>
  .jx-invtable {
    border: 1px solid var(--border);
  }
  .jx-invhead,
  .jx-invrow {
    display: grid;
    grid-template-columns: minmax(8rem, 1.2fr) 5rem minmax(10rem, 1.4fr) minmax(12rem, 1.6fr);
    gap: 0.75rem;
    align-items: baseline;
    padding: 0.4375rem 0.75rem;
  }
  .jx-invhead {
    font-family: var(--font-nav);
    font-size: 0.625rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    border-bottom: 1px solid var(--border);
  }
  .jx-invrow {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-decoration: none;
    border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
    transition: color 100ms ease-out, background-color 100ms ease-out;
  }
  .jx-invrow:last-child {
    border-bottom: none;
  }
  .jx-invrow:hover {
    color: var(--foreground);
    background: color-mix(in oklab, var(--primary) 6%, transparent);
  }
  .jx-invrow:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-inv-name {
    color: var(--foreground);
  }
  .jx-inv-docs,
  .jx-inv-cmd {
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-inv-cmd {
    opacity: 0.65;
  }
  @media (max-width: 640px) {
    .jx-invhead,
    .jx-invrow {
      grid-template-columns: 1fr 4rem;
      grid-template-rows: auto auto;
    }
    .jx-inv-docs,
    .jx-inv-cmd {
      display: none;
    }
  }
</style>
