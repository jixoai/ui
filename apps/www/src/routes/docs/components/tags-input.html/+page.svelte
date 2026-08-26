<!--
  tags-input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  chips catalogue (suggestions, maxTags, pinned chips, error) + the
  RTL geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TagsInput, { type Tag } from '$lib/ui/tags-input/tags-input.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'tags-input')?.summary;
  if (!heroSummary) throw new Error('catalog entry "tags-input" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import tagsInputSource from '$lib/ui/tags-input/tags-input.svelte?raw';

  // ToC outline: the demo sections, in page order. The engine pairs these
  // ids with the SectionCard data-family extents + header data-region
  // leaves rendered in this page.

  const tagsUsage = `const stack = $state<Tag[]>([{ value: 'svelte' }]);
const stackSuggestions: Tag[] = [
  { value: 'svelte' }, { value: 'typescript' }, { value: 'node' },
];

<!-- Enter / comma / Tab commits a chip; Backspace on empty deletes the
     last; typing filters the suggestion popover (↑/↓ + Enter) -->
<TagsInput label="stack" bind:tags={stack} suggestions={stackSuggestions} />

<!-- maxTags hides the input at the cap ("N/N tags"); duplicates flash the
     existing chip instead of adding; removable={false} pins a chip -->
<TagsInput label="targets" bind:tags={targets} maxTags={3} />`;

  const tagsInputFiles: TreeFile[] = [
    { name: 'registry/files/ui/tags-input.svelte', content: tagsInputSource },
    { name: 'src/lib/ui/tags-input-usage.svelte', content: tagsUsage },
  ];

  // ---- demo state ---------------------------------------------------------------
  let stackTags = $state<Tag[]>([{ value: 'svelte' }, { value: 'typescript' }]);
  let targetTags = $state<Tag[]>([{ value: 'node' }, { value: 'bun' }]);
  let pinnedTags = $state<Tag[]>([
    { value: 'owner', removable: false },
    { value: 'release' },
  ]);
  let rtlTags = $state<Tag[]>([{ value: 'svelte' }]);

  const tagSuggestions: Tag[] = [
    { value: 'svelte' },
    { value: 'typescript' },
    { value: 'node' },
    { value: 'bun' },
    { value: 'deno' },
    { value: 'rust' },
    { value: 'ffi' },
    { value: 'conpty' },
    { value: 'websocket' },
  ];

  // ---- canvas playground ----------------------------------------------------------
  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces hand-written captions; the usage file tracks live state.
  const canvasInitial = {
    stack: [{ value: 'svelte' }, { value: 'node' }] as Tag[],
    maxTags: undefined as number | undefined,
  };
  let canvasStack = $state(canvasInitial.stack);
  let canvasMaxTags = $state(canvasInitial.maxTags);
  // the segmented control speaks strings; the page state stays number|undefined
  let maxTagsKey = $state('');
  $effect(() => {
    canvasMaxTags = maxTagsKey === '' ? undefined : Number(maxTagsKey);
  });

  function resetTagsCanvas(): void {
    canvasStack = canvasInitial.stack;
    canvasMaxTags = canvasInitial.maxTags;
    maxTagsKey = '';
    maxTagsKey = canvasInitial.maxTags === undefined ? '' : String(canvasInitial.maxTags);
  }

  const tagsUsageLive = $derived(`<TagsInput
  label="stack"
  suggestions={tagSuggestions}${canvasMaxTags === undefined ? '' : `\n  maxTags={${canvasMaxTags}}`}
  bind:tags
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveTagsUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? tagsUsageLive : file.content;
</script>

<svelte:head>
  <title>Tags input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tags-input component: input × multiselect — a flex-wrap chip host where Enter / comma / Tab commits a tag, Backspace on empty deletes the last chip, maxTags swaps the input for an “N/N tags” readout, duplicates flash the existing chip, and a filtered suggestion popover rides ↑/↓ + Enter."
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
      title="tags-input — input × multiselect"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">chips · press-physics removal</span>
        <span class="pill">Enter / comma / Tab / paste-split</span>
        <span class="pill">suggestion popover</span>
        <span class="pill">maxTags cap · duplicate flash</span>
        <span class="pill">$bindable Tag[]</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div data-reveal="">
    <ComponentCanvas
      title="tags-input"
      stage="center"
      description="Input × multiselect: Enter / comma / Tab commits chips, Backspace on empty deletes the last, duplicates flash the existing chip, maxTags swaps the input for an “N/N tags” readout."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tags-input.svelte"
      files={tagsInputFiles}
      onreset={resetTagsCanvas}
      output={[
        { label: 'tags', value: canvasStack.map((t) => t.value).join(', ') || '—' },
        { label: 'maxTags', value: canvasMaxTags ?? 'none' },
      ]}
      resolveFileContent={resolveTagsUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <TagsInput
          label="stack"
          bind:tags={canvasStack}
          suggestions={tagSuggestions}
          maxTags={canvasMaxTags}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="maxTags">
            <PlaySegmented
              bind:value={maxTagsKey}
              options={[
                { value: '', label: 'no cap' },
                { value: '3', label: '3' },
                { value: '5', label: '5' },
              ]}
            />
          </PlayRow>
          <PlayHelp>
            at the cap the input hides — remove a chip to type again. Suggestions pop while typing
            (↑/↓ + Enter); pasting <code>rust, ffi</code> splits into two.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- chips catalogue -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="tags-input"
      title="The high-form input — the shell becomes a chip host"
      summary="The shell becomes a flex-wrap chip host where Enter / comma / Tab commits a tag, Backspace on empty deletes the last chip, maxTags swaps the input for an “N/N tags” readout, and duplicates flash the existing chip (primary border + shake) instead of adding. The panel is the same popover=auto terminal bezel as Select — light dismiss, Escape, and top layer are the browser's; focus never leaves the text field."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Type in the first one: matching suggestions (<code class="text-accent">label</code>
          or <code class="text-accent">value</code> contains, case-insensitive) pop under the
          shell with ↑/↓ + Enter; type <code class="text-accent">svelte</code> again to see the
          duplicate flash on the existing chip. Enter / comma / Tab commits chips directly —
          pasting <code class="text-accent">rust, ffi</code> splits into two — and Backspace on
          an empty input deletes the last removable chip.
        </p>
        <CardGrid min="230px">
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <TagsInput label="stack — with suggestions" bind:tags={stackTags} suggestions={tagSuggestions} />
            <span class="text-muted-foreground text-[12.5px]">
              bound values: <code class="text-accent">{stackTags.map((t) => t.value).join(', ') || '—'}</code>
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <TagsInput label="targets (maxTags 3)" bind:tags={targetTags} suggestions={tagSuggestions} maxTags={3} />
            <span class="text-muted-foreground text-[12.5px]">
              at the cap the input hides · {targetTags.length}/3 tags
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <TagsInput label="roles — pinned chip" bind:tags={pinnedTags} suggestions={tagSuggestions} />
            <span class="text-muted-foreground text-[12.5px]">
              removable={'{false}'} hides the × · Backspace skips it
            </span>
          </div>
          <div class="demo-cell flex flex-col gap-3" data-no-subgrid>
            <TagsInput label="labels" error="at least one label is required" suggestions={tagSuggestions} />
            <span class="text-muted-foreground text-[12.5px]">
              error wiring: aria-invalid + dashed shell
            </span>
          </div>
        </CardGrid>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The component keeps the popover orchestration law of the family:
          <code class="text-accent">popover="auto"</code> panels anchored with CSS Anchor
          Positioning (<code class="text-accent">anchor-size(width)</code>, flip fallbacks,
          viewport-center when the engine lacks it), focus that never enters the panel — the
          roving highlight rides <code class="text-accent">aria-activedescendant</code> +
          <code class="text-accent">aria-owns</code> off the input itself — and geometry from
          logical properties only, so <code class="text-accent">dir="rtl"</code> mirrors the
          chip order with zero branches.
        </p>
        <CodeBlock code={tagsUsage} lang="svelte" meta="TagsInput usage" />
      </div>
    </SectionCard>
  </div>

  <!-- RTL geometry -->
  <div id="rtl" data-reveal="">
    <SectionCard
      family="rtl"
      headerRegion="rtl"
      eyebrow="geometry"
      title="RTL — geometry from logical properties"
      summary="Nothing in the component branches on direction: the chips wrap in logical flow and the suggestion panel anchors with logical offsets. The writing mode does the rest."
    >
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
          <TagsInput label="stack (rtl)" bind:tags={rtlTags} suggestions={tagSuggestions} maxTags={4} />
          <span class="text-muted-foreground text-[12px]">
            dir="rtl" — chips right-first, panel edge inline-start
          </span>
        </div>
        <div class="flex flex-col justify-center gap-2 text-muted-foreground text-[13px] leading-6">
          <p class="text-pretty">
            The chip host wraps in logical flow, the selected-row edge is
            <code class="text-accent">border-inline-start</code>, and the panel anchors with CSS
            Anchor Positioning whose offsets are logical too. The writing mode does the rest.
          </p>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="TagsInput variants"
      summary="The suggestion-backed host, the maxTags-capped field, a pinned (non-removable) chip, and the error state."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="border border-border p-4">
          <TagsInput label="with suggestions" tags={[{ value: 'svelte' }]} suggestions={tagSuggestions} />
        </div>
        <div class="border border-border p-4">
          <TagsInput label="maxTags 2 (capped)" tags={[{ value: 'node' }, { value: 'bun' }]} maxTags={2} />
        </div>
        <div class="border border-border p-4">
          <TagsInput label="pinned chip" tags={[{ value: 'owner', removable: false }, { value: 'release' }]} />
        </div>
        <div class="border border-border p-4">
          <TagsInput label="error" tags={[]} error="at least one label is required" />
        </div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Bind the Tag[] set; suggestions, the cap, and duplicate policy are plain props."
    >
      <CodeBlock code={tagsUsage} lang="svelte" meta="TagsInput usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The typing input is a combobox over a horizontal listbox of chips; the suggestion popover rides aria-activedescendant with focus never leaving the field."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus into the typing input; leaving commits the pending text' },
          { key: 'Enter', action: 'Commits the highlighted suggestion or the typed text — never submits the form' },
          { key: 'comma', action: 'Commits a chip; a pasted "a,b,c" splits into one commit per part' },
          { key: 'Backspace', action: 'On an empty input, deletes the last removable chip' },
          { key: '↑ / ↓', action: 'Roving highlight through the filtered suggestions (no wrap)' },
          { key: 'Esc', action: 'Closes the suggestion popover (native popover close)' },
        ]}
        aria={[
          { name: 'role', value: 'combobox', description: 'On the typing input, with aria-expanded synced live' },
          { name: 'aria-activedescendant', value: '{id}-sug-{index}', description: 'Roving highlight ID into the suggestion listbox' },
          { name: 'aria-autocomplete', value: '"list"', description: 'The input is backed by the suggestion list' },
          { name: 'role (shell)', value: 'listbox', description: 'The chip host is a horizontal listbox; each chip is role="option" aria-selected="true"' },
          { name: 'aria-label', value: '"remove {label}"', description: 'On every chip × button (type="button")' },
          { name: 'aria-invalid', value: "'true'", description: 'On the input when the error prop is provided' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The shell, chips, and suggestion rows share the density-scope rhythm; resize the scope and the whole field follows."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <TagsInput label="density sample" tags={[{ value: 'svelte' }, { value: 'node' }]} placeholder="Add tag..." />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' },
            { name: '--jx-row-min', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
          ]}
        />
      </div>
    </SectionCard>
  </div>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Props extend the native HTML input attributes on the typing input; chips reach FormData through the faceless jx-form-field bridge as one JSON array of values."
    >
      <PropsTable
        props={[
          { name: 'tags', type: 'Tag[]', default: '[]', description: 'The committed tag set; bind:tags is the two-way contract.', bindable: true },
          { name: 'suggestions', type: 'Tag[]', default: '[]', description: 'Filtered into the popover while typing (label-or-value contains, case-insensitive).' },
          { name: 'name', type: 'string', default: '—', description: 'Form field name — the bridge submits the tag values as one JSON array string.' },
          { name: 'placeholder', type: 'string', default: "'Add tag...'", description: 'Input placeholder while empty.' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid, wires aria-describedby, dashes the shell.' },
          { name: 'maxTags', type: 'number', default: '—', description: 'Cap on the tag count; at the cap the input hides ("N/N tags").' },
          { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Allow the same value twice; false flashes the existing chip instead.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and every chip × (entry guards back the buttons).' },
          { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface fill of the suggestion panel.' },
        ]}
      />
      <PropsTable
        title="Tag"
        props={[
          { name: 'value', type: 'string', default: '—', description: 'The committed tag identity — duplicates compare on this.', required: true },
          { name: 'label', type: 'string', default: 'value', description: 'Display text.' },
          { name: 'removable', type: 'boolean', default: 'true', description: 'Hides the × button; Backspace skips it too.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
