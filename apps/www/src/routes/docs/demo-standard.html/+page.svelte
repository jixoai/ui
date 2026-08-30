<!--
  demo-standard (apps/www/src/routes/docs/demo-standard.html, the
  docs-demo-standard change task 2.1) — THE written standard every
  component demo page follows: the section skeleton, the ability-naming
  grammar, the variant suffix convention, the one-source props tables,
  and the staged lint that enforces it all.

  The page itself dogfoods the skeleton it preaches (Intro → Install →
  Usage → Examples → API → See Also); its lint markers are real.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { meta as selectMeta } from '$lib/meta/select.meta';
  import { SELECT_DOCS } from '$lib/ui/props-table/docs/select.docs';

  const usage = `<!-- every /docs/components/<name>.html page, top to bottom -->
<DocsInstall name="select" />              <!-- Install: npx + registry URL -->

<SectionCard family="usage" title="Usage">  <!-- Usage: minimal working example -->
  <CodeBlock code={usage} lang="svelte" />
</SectionCard>

<ComponentCanvas title="select" …>         <!-- Examples: ability-named demos -->
  …demos, each with collapsible code…
</ComponentCanvas>

<PropsTable meta={selectMeta} docs={SELECT_DOCS} />  <!-- API: one source -->

<DocsSeeAlso name="select" />              <!-- See Also: reading-chain data -->`;

  const skeletonUsage = `<!-- the page assembles (select is the exhibit) -->
${usage}`;

  const goodNames = `with clear button
async loading
multiple chips
with descriptions
rtl geometry`;

  const badNames = `demo 1              <!-- numbered: says nothing -->
example-two         <!-- numbered + kebab: worse */
login scene         <!-- a scene noun, not a capability -->
fancy               <!-- an opinion, not an ability -->
with clear button and async loading   <!-- TWO capabilities in one name -->`;

  const variantItem = `// registry.json — a promoted demo becomes its own item with the
// <name>-<ability> suffix (the @reui/date-picker-range precedent):
{
  "name": "date-picker-range",
  "type": "registry:ui",
  "files": [ /* the range-mode composition, standalone */ ]
}`;

  const scopeFile = `// scripts/docs-skeleton-scope.json — the staged lint's data
{
  "version": 1,
  "successor": "2026-08-30-docs-demo-standard-global-gate",
  "inScope": ["select", "popover", "checkbox", "card-grid",
              "date-picker", "toast", "combobox"],
  "backlog": [
    { "route": "press-button", "owner": "2026-08-30-canvas-floor-lab" },
    { "route": "table",        "owner": "2026-08-30-table-grid-toolbar" }
    // …every route lands here with its owning change before the flip
  ]
}`;
</script>

<svelte:head>
  <title>Demo Standard · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui demo page standard: the six-section skeleton (Intro, Install, Usage, Examples, API, See Also), the ability-naming grammar, the variant suffix convention, one-source props tables from the generated component meta, and the staged lint that hard-fails in-scope routes while the backlog burns down."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- Intro -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="docs · standard"
        title="demo-standard — one page skeleton, derived from the market leaders"
        summary="The market research (.agents/audit/2026-08-30-site-walkthrough) is unambiguous: the leading registries win on demo-page CONSISTENCY, not component count. This page is the law every component page follows — and the lint that keeps it true."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">six sections, one order</span>
          <span class="pill">ability-named demos</span>
          <span class="pill">&lt;name&gt;-&lt;ability&gt; variants</span>
          <span class="pill">props from one source</span>
          <span class="pill">staged lint, data-driven backlog</span>
        </div>
      </SectionCard>
    </div>

    <!-- Install (dogfood) -->
    <div data-reveal="">
      <DocsInstall name="select" />
    </div>

    <!-- Usage (dogfood: the skeleton itself, minimal) -->
    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="The skeleton assembles from page-owned chrome (DocsInstall, DocsSeeAlso) and the existing canvas + section components — nothing new to invent per page."
      >
        <CodeBlock code={skeletonUsage} lang="svelte" meta="the skeleton, assembled" />
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- the skeleton, section by section -->
  <div id="skeleton" data-reveal="">
    <SectionCard
      family="skeleton"
      headerRegion="skeleton"
      eyebrow="law"
      title="The skeleton is law"
      summary="Every /docs/components/<name>.html page presents six sections, in this order. Page-local sections (types, a11y, theming…) may interleave — the six keep their relative order."
    >
      <A11yTable
        keys={[
          { key: 'Intro', action: 'The one-paragraph contract — hero SectionCard, exactly one h1, pills for the capability surface' },
          { key: 'Install', action: 'Copy-ready `npx jixoai-ui add <name>` + the registry item URL (https://ui.jixoai.com/r/<name>.json) — the shadcn add path for non-CLI consumers' },
          { key: 'Usage', action: 'The minimal working example — one code block, the smallest honest mount' },
          { key: 'Examples', action: 'Ability-named demos on the component canvas, each with collapsible code (the drawer shows the exact registry copy)' },
          { key: 'API', action: 'The props table — Prop / Type / Default / Description, rendered from the generated meta (one source)' },
          { key: 'See Also', action: 'Related component links derived from the docs reading chain — data, never a hand list' },
        ]}
        aria={[
          { name: 'data-doc-install', value: 'section root', description: 'The lint\u2019s Install marker; the section text carries the command verbatim' },
          { name: 'data-doc-props-table', value: 'table element', description: 'The lint\u2019s API marker — PropsTable stamps it itself' },
          { name: 'data-doc-see-also', value: 'section root', description: 'The lint\u2019s See Also marker; must hold ≥1 link to another component page' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- ability grammar -->
  <div id="ability-grammar" data-reveal="">
    <SectionCard
      family="ability-grammar"
      headerRegion="ability-grammar"
      eyebrow="grammar"
      title="Demos are named by ability"
      summary="One phrase names one capability — what the demo LETS YOU DO, never a number, never a scene noun, never two capabilities at once."
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="flex flex-col gap-3 border border-border p-4">
          <p class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">yes — the ability</p>
          <CodeBlock code={goodNames} lang="text" meta="names that carry" />
        </div>
        <div class="flex flex-col gap-3 border border-border p-4">
          <p class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">no — anything else</p>
          <CodeBlock code={badNames} lang="text" meta="names that fail review" />
        </div>
      </div>
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        The lint enforces the mechanical subset (numbered titles fail); the semantic half — one
        phrase, one capability — is review law. When a demo needs a second capability, it needs a
        second demo.
      </p>
    </SectionCard>
  </div>

  <!-- variant suffix -->
  <div id="variant-suffix" data-reveal="">
    <SectionCard
      family="variant-suffix"
      headerRegion="variant-suffix"
      eyebrow="convention"
      title="Promoted variants take the suffix"
      summary="A demo that ships as its own registry item is <name>-<ability>: the composition, standalone, named after the ability it grants (the @reui/date-picker-range precedent)."
    >
      <CodeBlock code={variantItem} lang="ts" meta="registry item, promoted" />
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        The suffix is the demo name, kebab-cased: <code class="text-accent">with clear button</code>
        promotes to <code class="text-accent">select-with-clear-button</code>. The page-level demo
        and the registry-level variant share one ability vocabulary — there is no third naming
        scheme.
      </p>
    </SectionCard>
  </div>

  <!-- props source -->
  <div id="props-source" data-reveal="">
    <SectionCard
      family="props-source"
      headerRegion="props-source"
      eyebrow="one source"
      title="Props tables read the generated meta"
      summary="Name, type and default come from the component's GENERATED .meta.ts (component-metadata-gen, drift-gated); the page carries only the docs curation — prose, flags, and corrections where the extractor's documented ceiling bites."
    >
      <div class="flex flex-col gap-4">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The curation layer is accountable: the drift lock
          (<code class="text-accent">test/props-table-meta-drift.spec.ts</code>) pins which override
          fields each pilot uses, so a new correction can only land as a conscious edit. As the
          extractor grows (JSDoc descriptions, <code class="text-accent">$bindable()</code> flags,
          <code class="text-accent">?</code> optionality, alias-to-union merging), the curation
          shrinks — the table never silently disagrees with the interface again. The API section
          below renders from the select meta, live:
        </p>
        <PropsTable meta={selectMeta} docs={SELECT_DOCS} />
      </div>
    </SectionCard>
  </div>

  <!-- staged adoption -->
  <div id="staged" data-reveal="">
    <SectionCard
      family="staged"
      headerRegion="staged"
      eyebrow="adoption"
      title="Staged, not partial"
      summary="The skeleton lint hard-fails every in-scope route and warns on the rest while printing the backlog. The scope file is data; the successor change flips the gate global when the backlog is empty."
    >
      <CodeBlock code={scopeFile} lang="ts" meta="scripts/docs-skeleton-scope.json" />
      <p class="text-muted-foreground mt-4 text-pretty text-[13px] leading-6">
        An out-of-scope page missing sections is BACKLOG, not violation — the gate stays green
        while the migration proceeds page by page. When the successor lands, the warn list must be
        empty or the flip fails: the exit criterion is computed, never asserted.
      </p>
    </SectionCard>
  </div>

  <!-- worked example -->
  <div id="worked" data-reveal="">
    <SectionCard
      family="worked"
      headerRegion="worked"
      eyebrow="worked example"
      title="Adding a demo, end to end"
      summary="The select page's with-descriptions demo, walked through the standard: name it by ability, show it on the canvas with collapsible code, and let the props table pick up any new prop from the regenerated meta."
    >
      <A11yTable
        keys={[
          { key: '1 · name', action: '“rows with descriptions” — the ability is per-option second lines; one phrase, one prop (the options array\u2019s description field)' },
          { key: '2 · place', action: 'A demo section under the canvas — after Usage, before API; the drawer shows the exact registry copy (?raw, the same-source law)' },
          { key: '3 · props', action: 'A new interface prop regenerates the meta (component-metadata-gen) — the table row appears; only its prose lands in the docs curation' },
          { key: '4 · gate', action: 'verify:docs-structure hard-fails the page if a skeleton section goes missing; verify:meta fails if the meta forgets the regeneration' },
        ]}
        aria={[
          { name: 'lint rule', value: 'numbered titles', description: '“demo 1” / “example 2” names fail the skeleton lint on in-scope routes' },
          { name: 'lint rule', value: 'section order', description: 'intro < install < usage < examples < api < see-also, by first marker position' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- See Also (dogfood) -->
  <div data-reveal="">
    <DocsSeeAlso name="select" />
  </div>
</div>
