<!--
  radio — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the radio block of the pure-CSS
  selectors section. The form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import Radio from '$lib/ui/radio/radio.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { CATALOG } from '$lib/catalog';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'radio')?.summary;
  if (!heroSummary) throw new Error('catalog entry "radio" is missing — registry.json meta drift');

  // ToC outline: the demo section. The engine pairs these ids with the
  // SectionCard data-family extents + header data-region leaves.

  const usage = `<!-- same-name radios keep native arrow-key walking -->
<Radio label="node" name="runtime" checked />
<Radio label="bun" name="runtime" />
<Radio label="deno" name="runtime" />

<!-- labelSide="left" flips the label to the inline-start -->
<Radio label="pro" name="plan" labelSide="left" />`;
</script>

<svelte:head>
  <title>Radio · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai radio component: pure-CSS selector — appearance-none + 16px circle, :checked turns the border primary and pops an 8px dot from scale(0) to scale(1). Same-name groups keep native arrow-key walking; error wiring identical to checkbox."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="radio — 16px circle, scaled dot"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS · zero icon deps</span>
        <span class="pill">:checked dot pop</span>
        <span class="pill">native arrow-key walking</span>
        <span class="pill">labelSide left / right</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <!-- the selectors, redrawn in pure CSS -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="radio"
      title="The selector, redrawn in pure CSS"
      summary="A control where the paint deserved its own drawing code: the component strips appearance off the native input and draws its glyph with a pseudo-element — a scaled dot. Zero icon fonts, zero SVG, zero dependencies; the native input underneath keeps form participation, keyboard toggling, and :checked state."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          :checked turns the border primary and pops an 8px dot from
          <code class="text-accent">scale(0)</code> to
          <code class="text-accent">scale(1)</code> (150ms ease-out). Same-name radios keep
          native arrow-key walking — tab into the group and use the arrows.
        </p>
        <CardGrid min="200px">
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="node" name="demo_rt" checked />
            <Radio label="bun" name="demo_rt" />
            <Radio label="deno" name="demo_rt" />
          </div>
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="label left" name="demo_rt2" labelSide="left" />
            <Radio label="also left" name="demo_rt2" labelSide="left" checked />
          </div>
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="disabled" name="demo_rt3" disabled />
            <Radio label="disabled + checked" name="demo_rt3" checked disabled />
          </div>
        </CardGrid>
        <CodeBlock code={usage} lang="svelte" meta="Radio usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>
