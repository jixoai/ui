<!--
  tags-input — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the workbench canvas + the
  chips catalogue (suggestions, maxTags, pinned chips, error) + the
  RTL geometry demo. The form.html route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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

  // ---- the universal props demo (explicit-props W3-A) --------------------
  const universalUsage = `<TagsInput label="px number" size={14} density="small" />
<TagsInput label="named steps" size="large" radius="medium" />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/tags-input-universal.svelte', content: universalUsage },
  ];

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

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  const close = '</' + 'script>';

  // the RTL geometry demo (rtl section): logical properties only, the
  // writing mode does the rest
  const tagsRtlDemo = `<script lang="ts">
  import TagsInput, { type Tag } from '@ui/tags-input.svelte';
${close}

<!-- nothing branches on direction: chips wrap in logical flow, the
     panel anchors with logical offsets -->
<div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
  <TagsInput label="stack (rtl)" bind:tags maxTags={4} suggestions={[
    { value: 'svelte' }, { value: 'typescript' }, { value: 'node' },
    { value: 'bun' }, { value: 'deno' }, { value: 'rust' },
  ]} />
  <span class="text-muted-foreground text-[12px]">
    dir="rtl" — chips right-first, panel edge inline-start
  </span>
</div>`;

  const tagsRtlFiles: TreeFile[] = [
    { name: 'tags-rtl-demo.svelte', content: tagsRtlDemo, kind: 'usage' },
  ];

  // the variant cells (types section): suggestions, the cap, a pinned
  // chip, and the error state
  const tagsTypesDemo = `<script lang="ts">
  import TagsInput from '@ui/tags-input.svelte';

  const tagSuggestions = [
    { value: 'svelte' }, { value: 'typescript' }, { value: 'node' },
    { value: 'bun' }, { value: 'deno' }, { value: 'rust' },
    { value: 'ffi' }, { value: 'conpty' }, { value: 'websocket' },
  ];
${close}

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
</div>`;

  const tagsTypesFiles: TreeFile[] = [
    { name: 'tags-types-demo.svelte', content: tagsTypesDemo, kind: 'usage' },
  ];
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is NonNullable<(typeof styles)[number]> => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ── the measured per-axis table (task 43) — every cell measured on
  // the served DOM (probe) or negative-grepped over ui/tags-input/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "MANAGED AND CONSUMED — the field's metrics ARE the kernel lanes: the shell min-height rides --jx-hit, chips ride --jx-row-min, text rides --jx-text, the rhythm rides --jx-gap/--jx-inset (measured: the seat shell's hit height flips 48px → 32px across the lg/sm rungs). data-density stamps on the root for the scope. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED AT THE PASSTHROUGH BOUNDARY — the native element never receives a size attribute (the §1 native collision rule); the §1 echo lands on the root and the chip/input labels stay PINNED to var(--jx-text) (the density kernel wins the visible cascade, measured). Zero size-effective readers (grep receipt). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt); the shell corner is a structural 0. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the concentric broadcast for nested parts; the shell/chips keep the family hairline square (grep receipt). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "CONSUMED AT THE PASSTHROUGH BOUNDARY (§1 — intercepted from rest, never a native attribute) and ZERO-READ as an axis: the field's inks are the pinned token set (shell --jx-background/--jx-border, chips --jx-muted/--jx-foreground, the flash border --jx-primary). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE ROOT-PINNED ALIAS (the separator/spin/tabs shape #2, measured) — every ink (shell/chip/input/rows) rides :root alias chains (--jx-background/--jx-border/--jx-muted/--jx-foreground/--jx-primary/--jx-terminal-*), so a scoped .dark island re-derives inherited values while the field's tokens HOLD the light values (measured frozen), and root-level html.dark re-derives them (measured flip). class:dark stamps for composed descendants. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the shell's well shadow is the css sheet's --shadow-well, not the axis. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE FAMILY OWNS TWO MOTIONS, AXIS UNREAD — the duplicate flash (200ms primary border + the shake keyframes) and the shell's hover/focus transitions (var(--motion-150)); reduced motion kills BOTH (transitions and the shake — measured), and the suggestion panel rides the shared WAAPI kernel. Zero motion-effective readers (grep receipt). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: the DENSITY lane's rung stamp — the one axis
  // tags-input consumes, through the kernel lanes.
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import TagsInput from '@ui/tags-input.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- the md key is the registered VIEWPORT scale (48rem): below it the
     small rung stamps, at 48rem+ large wins — data-density flips AND
     the kernel lanes rescale the whole field (the one consumed axis) -->
<TagsInput label="stack" density={query({ md: 'large' }, 'small')} />`;

  const queryFiles: TreeFile[] = [
    { name: 'tags-input-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Tags input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tags-input component: input × multiselect — a flex-wrap chip host where Enter / comma / Tab commits a tag, Backspace on empty deletes the last chip, maxTags swaps the input for an “N/N tags” readout, duplicates flash the existing chip, and a filtered suggestion popover rides ↑/↓ + Enter."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="tags-input — input × multiselect"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">chips · press-physics removal</span>
        <span class="pill">Enter / comma / Tab / paste-split</span>
        <span class="pill">suggestion popover</span>
        <span class="pill">maxTags cap · duplicate flash</span>
        <span class="pill">$bindable Tag[]</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="tags-input" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="Input × multiselect: a keyed chip list and a combobox input in one shell — commit paths on real keys, duplicates flashed not added, announcements through the combobox contract, and a faceless form bridge carrying the values into FormData."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The shell is a chip host at hit height and a typing input in the same row. Commit
          paths are real keys: Enter / comma / Tab (via blur) commit a chip — a pasted
          <code class={cx(rt.inkPrimary)}>a,b,c</code> splits into one commit per part — and
          Backspace on an empty input deletes the last removable chip. Duplicates are flashed,
          not added (200ms primary border + shake, reduced motion keeps the border flash only);
          the typed text resolving to a suggestion commits the suggestion's value; maxTags hides
          the input at the cap behind an N/N readout.
        </p>
        <p class={cx(rt.para)}>
          The two law-heaviest surfaces meet here. The KEYED LIST: chips render from a keyed
          each whose key is the composite value#index — duplicate tag VALUES cannot collide,
          the LAW #18 worst case (constant add/remove/reorder) stays hydration-safe by
          construction. The COMBOBOX: the typing input is role=combobox over the suggestion
          popover — aria-expanded live, the roving highlight riding
          aria-activedescendant + aria-owns with focus never entering the panel, committed
          suggestions flipping their rows' aria-selected. The chip host itself is a horizontal
          listbox of options; every × announces "remove (label)".
        </p>
        <p class={cx(rt.para)}>
          Values reach FormData through the faceless jx-form-field bridge — ONE JSON array
          string under the field name (lossless when a tag value contains a comma). The eight
          axes: density is the ONE consumed axis (the field's metrics ARE the kernel lanes —
          measured hit-height flip), size and color are consumed at the passthrough boundary
          (§1: the native element never receives them), theme rides the ROOT-PINNED alias inks
          (frozen under a scoped dark island, re-derived at root-level dark), and
          shape/radius/elevation/motion supply unread. Kinship:
          <code class={cx(rt.inkPrimary)}>input</code> (the single-value shell),
          <code class={cx(rt.inkPrimary)}>select</code> (the single-select popover law spin-off),
          <code class={cx(rt.inkPrimary)}>combobox</code> (the full law this popover miniaturizes).
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (audit P1-A2) -->
  <div id="live-demo" data-reveal="">
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
      <div class={cx(rt.tiLane)}>
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
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          Type in the first one: matching suggestions (<code class={cx(rt.inkAccent)}>label</code>
          or <code class={cx(rt.inkAccent)}>value</code> contains, case-insensitive) pop under the
          shell with ↑/↓ + Enter; type <code class={cx(rt.inkAccent)}>svelte</code> again to see the
          duplicate flash on the existing chip. Enter / comma / Tab commits chips directly —
          pasting <code class={cx(rt.inkAccent)}>rust, ffi</code> splits into two — and Backspace on
          an empty input deletes the last removable chip.
        </p>
        <CardGrid min="230px">
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <TagsInput label="stack — with suggestions" bind:tags={stackTags} suggestions={tagSuggestions} />
            <span class={cx(rt.noteSmall)}>
              bound values: <code class={cx(rt.inkAccent)}>{stackTags.map((t) => t.value).join(', ') || '—'}</code>
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <TagsInput label="targets (maxTags 3)" bind:tags={targetTags} suggestions={tagSuggestions} maxTags={3} />
            <span class={cx(rt.noteSmall)}>
              at the cap the input hides · {targetTags.length}/3 tags
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <TagsInput label="roles — pinned chip" bind:tags={pinnedTags} suggestions={tagSuggestions} />
            <span class={cx(rt.noteSmall)}>
              removable={'{false}'} hides the × · Backspace skips it
            </span>
          </div>
          <div class="demo-cell {cx(rt.col12)}" data-no-subgrid>
            <TagsInput label="labels" error="at least one label is required" suggestions={tagSuggestions} />
            <span class={cx(rt.noteSmall)}>
              error wiring: aria-invalid + dashed shell
            </span>
          </div>
        </CardGrid>
        <p class={cx(rt.para)}>
          The component keeps the popover orchestration law of the family:
          <code class={cx(rt.inkAccent)}>popover="auto"</code> panels anchored with CSS Anchor
          Positioning (<code class={cx(rt.inkAccent)}>anchor-size(width)</code>, flip fallbacks,
          viewport-center when the engine lacks it), focus that never enters the panel — the
          roving highlight rides <code class={cx(rt.inkAccent)}>aria-activedescendant</code> +
          <code class={cx(rt.inkAccent)}>aria-owns</code> off the input itself — and geometry from
          logical properties only, so <code class={cx(rt.inkAccent)}>dir="rtl"</code> mirrors the
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
        <ComponentCanvas title="tags-input · rtl" stage="fill" files={tagsRtlFiles}>
          <div class={cx(rt.grid760a)}>
            <div dir="rtl" class={cx(rt.tiPanel)}>
              <TagsInput label="stack (rtl)" bind:tags={rtlTags} suggestions={tagSuggestions} maxTags={4} />
              <span class={cx(rt.note12)}>
                dir="rtl" — chips right-first, panel edge inline-start
              </span>
            </div>
            <div class={cx(rt.tiHint)}>
              <p class={cx(rt.pretty)}>
                The chip host wraps in logical flow, the selected-row edge is
                <code class={cx(rt.inkAccent)}>border-inline-start</code>, and the panel anchors with CSS
                Anchor Positioning whose offsets are logical too. The writing mode does the rest.
              </p>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
  </div>
  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="TagsInput variants"
      summary="The suggestion-backed host, the maxTags-capped field, a pinned (non-removable) chip, and the error state."
    >
      <ComponentCanvas title="tags-input · variants" stage="fill" files={tagsTypesFiles}>
        <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.panel)}>
            <TagsInput label="with suggestions" tags={[{ value: 'svelte' }]} suggestions={tagSuggestions} />
          </div>
          <div class={cx(rt.panel)}>
            <TagsInput label="maxTags 2 (capped)" tags={[{ value: 'node' }, { value: 'bun' }]} maxTags={2} />
          </div>
          <div class={cx(rt.panel)}>
            <TagsInput label="pinned chip" tags={[{ value: 'owner', removable: false }, { value: 'release' }]} />
          </div>
          <div class={cx(rt.panel)}>
            <TagsInput label="error" tags={[]} error="at least one label is required" />
          </div>
        </div>
      </ComponentCanvas>
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
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The shell, chips, and suggestion rows share the density-scope rhythm; resize the scope and the whole field follows."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo>
          <TagsInput label="density sample" tags={[{ value: 'svelte' }, { value: 'node' }]} placeholder="Add tag..." />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
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
        universal
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
          { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface fill of the suggestion panel. Defaults: literal slot — own ’auto’, ambient when an axis opens.' },
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
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on tags-input"
      summary="Density is the ONE consumed axis — the field's metrics ARE the kernel lanes (--jx-hit/--jx-row-min/--jx-text/--jx-gap/--jx-inset), so rungs rescale the whole field. size and color are consumed at the passthrough boundary (§1: the native element never receives them), the inks ride the ROOT-PINNED alias chains (frozen under a scoped dark island, re-derived at root-level dark — measured), the family owns the duplicate flash + shake and the panel's WAAPI entry, and shape/radius/elevation carry the supply chain."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the KEYED-EACH double weight (the chips each keys value#index — duplicate tag
          VALUES cannot collide; mutation census on real keys: typing + Enter ADDED a chip, a
          duplicate commit left the bound set unchanged with the flash class on the existing
          chip, Backspace on empty removed the last — mounted census matching the bound set at
          every step), the combobox contract (role=combobox with aria-expanded flipping on the
          filter, aria-activedescendant riding the roving highlight into the suggestion listbox,
          committed suggestions flipping their rows' aria-selected, every chip × announcing
          "remove (label)"), the error wiring (aria-invalid + aria-describedby → the error id,
          dashed shell), the comma-split paste (a,b,c → two commits), the density seat
          (data-density lg → sm across 48rem AND the shell hit height 48px → 32px — the one
          consumed axis), the theme split (the chip ink token chain: under a scoped .dark island
          the inherited values flip while the field's --jx-* tokens HOLD the light values; at
          root-level dark they re-derive — the root-pinned alias, shape #2) and the grep
          receipts (zero --jx-*-effective readers over ui/tags-input/) were measured on this
          page's served DOM (probe, task 43). LAW #19 id landscape: duplicate ids NONE
          page-wide. The query() seat below rides the md viewport key (48rem) on the density
          lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20, rt.wFull)}>
          <TagsInput label="stack — responsive density" density={responsiveDensity} placeholder="Add tag..." />
          <p class={cx(rt.mt12, rt.note12, rt.inkMuted70)}>
            The md key is the registered VIEWPORT scale (48rem): below it the small rung stamps
            (data-density="sm"); at 48rem and wider large wins ("lg" at a 1280 viewport,
            measured) — and because density is the consumed axis, the shell hit height rescales
            with it (48px vs 32px, measured). Resize across 48rem.
          </p>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="tags-input · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
            <div class={cx(rt.panel)}><TagsInput label="size 14 · density small" size={14} density="small" name="univ-tags-px" /></div>
            <div class={cx(rt.panel)}><TagsInput label="size large · radius medium" size="large" density="large" radius="medium" name="univ-tags-named" /></div>
            </div>
          </ComponentCanvas>
        </div>
      </div>
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

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="tags-input" />
  </div>
  </div>

