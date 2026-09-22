<!--
  Docs page for the color-picker family (docs-eight-axes-mdn task 16,
  scribe 2026-09-22 — tier 2 over the docs-restructure P0 page: the
  archetype skeleton re-orders and gains Overview + the generated-props
  lane (the family has meta — the hand API table retires) + the
  per-axis table + one real query() case; the theming DensityDemo folds
  into the axes demos; the types canvas joins the same-source lane
  (static stage) while the lab/catalogue/error canvases stay hand
  mirrors — their stages carry the playground's page state (bind:value —
  the extractor's documented rejection class, the avatar play-state lab
  precedent).

  Order: hero → install → overview → usage → the catalogue demo → the
  types canvas → API → the eight axes (per-axis table + the theme
  split + one real query() case) → accessibility → see-also.

  Mechanism rows are measurement-first (probed against the served
  family, 2026-09-22): the family's anatomy is density-channel-anchored
  (the well IS the ruler: --jx-color-lane floor + --jx-text type —
  measured 34/36/46/58px · 11/12/13/15px across xs/sm/default/lg); the
  number coefficient composes at :root and re-bases nothing here
  (declaring-element law). size/color are the §11 stamps with ZERO
  family readers (grep receipt: zero carrier reads in ui/color-picker/)
  — the old page's "CONSUMES size and color" claim was falsified by
  probe and retires. STALE-COMMENT FLAG (drift #10, family-out-of-scope):
  the family's own props comments still read "CONSUMED by the family"
  for size and color (color-picker.svelte, the size/color interface
  block — registry-mirrored) — those comments are the retired claim's
  last living copy; THIS page's rows are the corrected statement. Theme
  splits measured: the raw-token voices flip
  under the island (caret --primary, swatch border --border, well
  shadow --shadow-well, focus ring --ring, panel --terminal), the
  trigger chrome atoms stay frozen (the stylex alias substitution at
  :root), and the instrument's color-space constants are theme-neutral.
-->

<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import ColorPicker from '$lib/ui/color-picker/color-picker.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { meta as colorPickerMeta } from '$lib/meta/color-picker.meta';
  import { COLOR_PICKER_DOCS } from '$lib/ui/props-table/docs/color-picker.docs';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import colorPickerSource from '$lib/ui/color-picker/color-picker.svelte?raw';

  // The canvas same-source lane: the TYPES canvas composes its usage
  // file from THIS PAGE's own stage markup via resolveRawCode (one
  // source, two surfaces — static stage, no page state). The lab and
  // the catalogue/error demos stay hand mirrors: their stages bind
  // page state (bind:value — the extractor's documented rejection
  // class, the avatar play-state lab precedent), and the query()
  // canvas embeds the responsive call for the same reason.
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/color-picker.html/+page';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'color-picker')?.summary;
  if (!heroSummary) throw new Error('catalog entry "color-picker" is missing — registry.json meta drift');

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- the types canvas joins the same-source lane (static stage) -------
  const typesUsage = usageFile(
    { ColorPicker: '@ui/color-picker/index' },
    resolveRawCode('types'),
  );
  const typesFiles: TreeFile[] = [
    { name: 'src/lib/ui/color-picker-types.svelte', content: typesUsage, kind: 'usage' },
  ];

  // the axes canvas is static too — its drawer composes from the same
  // extraction (one source, two surfaces)
  const axesUsage = usageFile(
    { ColorPicker: '@ui/color-picker/index' },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/color-picker-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // ---- the lab canvas (the standard opening: live demo + PLAYGROUND) ----
  const colorUsage = `<!-- value notation follows format; oklch is the conversion hub -->
<ColorPicker label="brand" bind:value={brandColor} />
<ColorPicker label="accent" bind:value={accentColor} format="oklch" name="accent" />

<!-- the lane: a REAL input[type=text] field (label[for], name=, native
     focus/selection) + a REAL input[type=color] swatch that opens the
     ENGINE picker on click — every input mode gets a picker -->
<ColorPicker label="swatch only" bind:value={c} showValue={false} />

<!-- paste any notation into the field — invalid drafts revert; the
     chevron opens the pro editor (Eye Dropper when present) -->
<ColorPicker label="theme hue" bind:value={c} format="hsl" />`;

  type CanvasFormat = 'hex' | 'hsl' | 'oklch';
  const canvasInitial = { value: '#007924', format: 'hex' as CanvasFormat, showSwatch: true, showValue: true };
  let canvasColor = $state(canvasInitial.value);
  let canvasFormat = $state(canvasInitial.format);
  let canvasShowSwatch = $state(canvasInitial.showSwatch);
  let canvasShowValue = $state(canvasInitial.showValue);

  function resetColorPickerCanvas(): void {
    canvasColor = canvasInitial.value;
    canvasFormat = canvasInitial.format;
    canvasShowSwatch = canvasInitial.showSwatch;
    canvasShowValue = canvasInitial.showValue;
  }

  const canvasUsage = $derived(
    [
      '<ColorPicker',
      '  label="brand"',
      '  bind:value',
      canvasFormat !== 'hex' ? `  format="${canvasFormat}"` : [],
      !canvasShowSwatch ? '  showSwatch={false}' : [],
      !canvasShowValue ? '  showValue={false}' : [],
      '/>',
    ]
      .flat()
      .join('\n'),
  );

  // stable named resolver: the usage file tracks live playground state
  const resolveColorPickerUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/color-picker/color-picker.svelte', content: colorPickerSource },
    { name: 'src/lib/ui/color-picker-usage.svelte', content: colorUsage },
  ];

  // ---- hand mirrors (bind:value page state — the rejection class) -------
  const colorPickerCatalogDemo = `<script lang="ts">
  import ColorPicker from '@ui/color-picker/index';

  let brandColor = $state('#007924');
  let accentColor = $state('oklch(0.6489 0.237 145)');
  let swatchOnly = $state('#b7d7a8');
${close}

<ColorPicker label="brand (hex)" bind:value={brandColor} />
<ColorPicker label="accent (oklch)" bind:value={accentColor} format="oklch" />
<ColorPicker label="swatch only" bind:value={swatchOnly} showValue={false} />`;

  const colorPickerErrorDemo = `<script lang="ts">
  import ColorPicker from '@ui/color-picker/index';

  let errorColor = $state('#8a5a2f');
${close}

<!-- error dashes the lane border and wires aria-invalid + describedby -->
<ColorPicker label="theme hue" error="theme hue is required" bind:value={errorColor} />`;

  // the ONE query() case: responsive density on the well — the base
  // (small: the pointer-lane well) applies below the 40rem viewport; at
  // ≥40rem the lg case wins and the well steps to the touch tier.
  // BOTH generics are the §6 typing law: with an explicit type-argument
  // list TS disables inference for the base parameter, so the single-arg
  // form pins B to undefined and ships a real svelte-check error.
  const queryUsage = `<script lang="ts">
  import ColorPicker from '@ui/color-picker/index';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<ColorPicker label="responsive well" bind:value={c} density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')} />`;

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

</script>

<svelte:head>
  <title>Color picker · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai color-picker component: a native input[type=text] value field (label, name, FormData) with a native input[type=color] swatch that opens the engine picker, plus a professional popover editor — SV pad + hue bar, hex/hsl/oklch format switching through OKLCH, direct value entry that reverts invalid drafts, and Eye Dropper support."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Entry"
        title="color-picker — native field, pro editor"
        summary={heroSummary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native input[type=text] field</span>
          <span class="pill">native input[type=color] swatch</span>
          <span class="pill">SV pad + hue bar</span>
          <span class="pill">hex / hsl / oklch</span>
          <span class="pill">Eye Dropper API</span>
          <span class="pill">invalid drafts revert</span>
          <span class="pill">zero deps · Svelte 5 runes</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="color-picker" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="One value string, four native-or-custom input paths, zero second truths: the lane rides the platform's own controls, the editor is the custom surface, and oklch is the conversion hub."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The lane is a REAL <code>input[type=text]</code> — label[for] binds it, name= submits
            through its own FormData lane, focus, selection and disabled are the platform's — and
            the swatch is a REAL <code>input[type=color]</code> styled to the generated COLOR LAW
            face, so clicking it opens the engine's picker: every input mode gets a picker. The
            chevron opens the pro editor in a terminal-bezel popover — a saturation/value pad and a
            full-spectrum hue rail, 2D picker surfaces no native element provides, the same
            legitimacy class as date-picker's calendar grid.
          </p>
          <p class={cx(rt.measurePara)}>
            OKLCH is the conversion hub — the token system's space — so every notation round-trips
            through one canonical model with zero dependencies, and every surface (field typing,
            swatch pick, editor drag, bind write) flows through the ONE value string. Invalid
            drafts revert; a format switch re-emits the same color in the new notation.
          </p>
          <p class={cx(rt.measurePara)}>
            The family's anatomy follows the density ruler's ambient channels — the well is the
            ruler's floor equation — while the eight-axis carriers it stamps have zero family
            readers: this is a color INSTRUMENT, and its chrome is deliberately hue-neutral. The
            per-axis receipts are below.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Bind a string value and choose the notation the picker emits."
      >
        <CodeBlock code={colorUsage} lang="svelte" meta="ColorPicker usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="demo" data-region="demo" data-family="demo" data-reveal="">
    <ComponentCanvas
      title="color-picker"
      description="the value field is a REAL input[type=text] (label[for], name=, native focus and selection) and the swatch is a REAL input[type=color] that opens the ENGINE picker on click; the chevron opens the pro editor — SV pad + hue bar, hex/hsl/oklch round-trips, direct value entry that reverts invalid drafts, and Eye Dropper when the platform has it."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/color-picker/color-picker.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetColorPickerCanvas}
      output={[{ label: 'value', value: canvasColor }]}
      resolveFileContent={resolveColorPickerUsage}
    >
      <div class={cx(rt.cpLane)}>
        <ColorPicker
          label="brand"
          bind:value={canvasColor}
          format={canvasFormat}
          showSwatch={canvasShowSwatch}
          showValue={canvasShowValue}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="format">
            <PlaySegmented
              bind:value={canvasFormat}
              options={[
                { value: 'hex', label: 'hex' },
                { value: 'hsl', label: 'hsl' },
                { value: 'oklch', label: 'oklch' },
              ]}
            />
          </PlayRow>
          <PlayRow label="showSwatch">
            <PlayToggle bind:value={canvasShowSwatch} />
          </PlayRow>
          <PlayRow label="showValue">
            <PlayToggle bind:value={canvasShowValue} />
          </PlayRow>
          <PlayHelp>
            the committed value's notation follows format — oklch is the conversion hub, so
            every round-trip stays exact.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-region="types" data-family="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="lane shapes"
      title="Lane shapes"
      summary="The lane can show the native swatch (input[type=color]), the native value field (input[type=text]), or both; the value model supports three notations. This canvas composes its drawer from the stage markup itself — the code shown is the code running."
    >
      <ComponentCanvas id="types" title="color-picker · types" files={typesFiles} stage="fill">
        <div class={cx(rt.cpGridSm)}>
          <div class={cx(rt.panel)}><ColorPicker label="hex" value="#007924" format="hex" /></div>
          <div class={cx(rt.panel)}><ColorPicker label="hsl" value="hsl(145 100% 24%)" format="hsl" /></div>
          <div class={cx(rt.panel)}><ColorPicker label="oklch" value="oklch(0.6489 0.237 145)" format="oklch" showValue={false} /></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="catalogue" data-region="catalogue" data-family="catalogue" data-reveal="">
    <SectionCard
      family="catalogue"
      headerRegion="catalogue"
      eyebrow="catalogue"
      title="Bindings and error wiring"
      summary="Bound values echo live; the error law dashes the lane and wires the native validation relations — the input.svelte merge, one law across every form family."
    >
      <div class={cx(rt.col20)}>
        <ComponentCanvas
          title="color-picker · catalogue"
          files={[{ name: 'color-picker-catalog-demo.svelte', content: colorPickerCatalogDemo, kind: 'usage' }]}
          stage="fill"
        >
          <div class={cx(rt.cpGrid760)}>
            <div class={cx(rt.col12)}>
              <ColorPicker label="brand (hex)" bind:value={canvasColor} />
              <span class={cx(rt.noteSmall)}>
                bound value: <code class={cx(rt.inkAccent)}>{canvasColor}</code>
              </span>
            </div>
            <div class={cx(rt.col12)}>
              <ColorPicker label="accent (oklch)" value="oklch(0.6489 0.237 145)" format="oklch" />
              <span class={cx(rt.noteSmall)}>
                notation follows format
              </span>
            </div>
            <div class={cx(rt.col12)}>
              <ColorPicker label="swatch only" value="#b7d7a8" showValue={false} />
              <span class={cx(rt.noteSmall)}>
                showSwatch / showValue shape the trigger
              </span>
            </div>
          </div>
        </ComponentCanvas>
        <p class={cx(rt.para)}>
          Type in the field: parsed text commits canonically in the active notation and invalid
          drafts revert on change — native focus and selection throughout. Click the swatch: the
          engine's own color picker opens (a real input[type=color]; the pick re-emits through
          the same one-truth value, so a hex pick never rewrites an oklch picker's notation). The
          chevron opens the editor — drag the SV pad (saturation right, value up, pinned to ltr —
          the lane, not the map, is what rtl mirrors) or the hue bar, both through Pointer Events
          with capture. The panel anchors under the lane with CSS Anchor Positioning
          (flip-block fallback; engines without it get the authored viewport-center), and focus
          restitutes to the field on every close path.
        </p>
        <div class={cx(rt.frameBorder, rt.mt4, rt.tBorderW, rt.pt20)}>
          <h3 class={cx(rt.title15)}>error wiring</h3>
          <div class={cx(rt.mt16)}>
            <ComponentCanvas
              title="color-picker · error wiring"
              files={[{ name: 'color-picker-error-demo.svelte', content: colorPickerErrorDemo, kind: 'usage' }]}
              stage="center"
            >
              <ColorPicker label="theme hue" error="theme hue is required" value="#8a5a2f" />
            </ComponentCanvas>
            <p class={cx(rt.inkMuted, rt.mt16, rt.pretty, rt.text13, rt.lead6)}>
              Same law as every family member: label[for] binds the native field,
              <code class={cx(rt.inkAccent)}>error</code> dashes the lane border and wires
              <code class={cx(rt.inkAccent)}>aria-invalid</code> +
              <code class={cx(rt.inkAccent)}>aria-describedby</code> on the input to the “! message”
              line.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="props"
      title="Props"
      summary="Props extend the native HTML input attributes — minus size and color, whose names the eight-axis surface owns (the §1 native collision rule); the entries below are color-picker-specific additions, and everything else rides the rest object through to the field."
    >
      <PropsTable meta={colorPickerMeta} docs={COLOR_PICKER_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on color-picker"
      summary="The family is the COLOR INSTRUMENT: its anatomy rides the density ruler's ambient channels (the well IS the floor equation), its chrome is deliberately hue-neutral, and the §11 carriers it stamps have zero family readers — size/color/radius/shape/elevation/motion are supply-only with grep receipts (the old page's CONSUMES claim retired under probe). Density is consumed through the ambient scope, theme splits three measured ways. Census: batch A (migration-census.md)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={[
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY for the lane anatomy — the root stamps --jx-size-effective plus an inline font-size, and the stamp reaches only unstyled flow under the root: the field's type is density-channel-anchored (--jx-text), the well floor is --jx-color-lane, and the editor's parts are rem-fixed (measured: a 14px stamp moves the root's own font-size and nothing on the lane — 13px field, 46px well). The §1 collision applies: the native input never receives a size attribute. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; zero readers (grep receipt: zero carrier reads in ui/color-picker/). The lane is a square-edged control shell (borderRadius 0 — the input-law field shell), and the swatch's roundness is the COLOR LAW's own 50% circle, not this axis. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (the same grep receipt). The lane's shell is square by the input law and the swatch rides its generated circle; nothing in the family computes the §3 concentric corner. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "CONSUMED through the ambient scope (the no-opinion slot — no provider, no explicit prop stamps nothing, and the ambient css scope channel keeps flowing): the well IS the density ruler. min-block-size rides --jx-color-lane = max(--jx-hit, --jx-icon + 2×--jx-inset + 2px), the type rides --jx-text — measured 34/36/46/58px well floors · 11/12/13/15px type across xs/sm/default/lg. The NUMBER lane is inert (the coefficient composes at the :root rung scopes; the wrapper never re-declares — measured: a 3× coefficient leaves 46/13 unmoved). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — this family IS the color instrument, and the instrument is deliberately hue-neutral: the axis stamps --jx-color-effective (named → the §12 var indirection; a number → hue degrees through the oklch formula — the chip grammar, measured verbatim on the root's style attr) and zero family css or atoms read it (grep receipt: zero --jx-color-effective readers in ui/color-picker/ — measured: a stamped carrier leaves border, ground and well shadow unmoved). The paint a caller wants hue-injected goes through the jx-hue-* utilities on the surrounding tree, exactly as on chip. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: 'ambient scope',
      description:
        "PARTIAL re-theme — measured, THREE voice classes. FLIPS (the raw token layer, substitution at the element): the field's caret (--primary), the swatch's border (--border), the well's shadow (--shadow-well — the black inset goes white), the focus ring (--ring) and the editor panel's terminal fill (--terminal). STAYS FROZEN: the trigger chrome's border/ink/ground (the stylex aliases --jx-border/--jx-foreground/--jx-background, substituted at :root — measured identical under the island). THEME-NEUTRAL: the instrument's color-space constants — the conic swatch, the pad's white/black overlays, the dots' #000 halo (they must read on EVERY hue). light and system stamp nothing — tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — the well's shadow is the input-law well tier (--shadow-well resting, --shadow-well-hover on hover — intensity, not tier), raw tokens outside this lane; the carrier stamps --jx-elevation-effective and zero family css consumes it (grep receipt). The panel's ::after shadow layer rides the terminal bezel law. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it (grep receipt). The lane's own transitions ride the site motion tokens (--motion-150 / --motion-ease-out, with the reduced-motion kill); the editor panel's enter/exit is the surface-motion kernel (the popover wiring law) — behavior, not this lane. Number unit: coefficient.",
    },
        ]} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch A row (explicit-props W3 — the
          16 native families join the eight-axis surface;
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule:
          the interface Omits 'size' | 'color', the native input never receives an axis name.
          The variant prop is the surface slot's OWN literal ('auto' — no axis yet, the
          dialog/sheet precedent), not a collision.
        </p>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="color-picker · the ruler and the island" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density default — the ruler's floor equation (46px well, 13px type)</span>
                <ColorPicker label="density default well" value="#007924" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="lg" — the touch tier steps the whole lane (58px, 15px)</span>
                <ColorPicker label="density lg well" value="#007924" density="lg" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the caret, swatch border and well shadow flip; the trigger chrome stays frozen</span>
                <ColorPicker label="dark well" value="#007924" theme="dark" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>color="error" — stamped, unread: the instrument stays hue-neutral (the lane paints nothing semantic)</span>
                <ColorPicker label="color carrier well" value="#007924" color="error" />
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The number lanes stamp and re-base nothing here — the declaring element for every
              channel the family reads is the ambient scope (:root), the wrapper never re-declares
              (the declaring-element law). Measure the well floor, not the coefficient:
              34 / 36 / 46 / 58px across xs / sm / default / lg — the ruler equation
              max(--jx-hit, --jx-icon + 2×--jx-inset + 2px).
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="color-picker · query()" files={[{ name: 'color-picker-query-demo.svelte', content: queryUsage, kind: 'usage' }]}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <ColorPicker
                label="responsive well"
                value="#007924"
                density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}
              />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the small rung, the
                pointer-lane well (36px, 12px type); at 40rem and wider the lg case wins and the
                well steps to the touch tier (58px, 15px — measured). Resize across 40rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[
            { name: '--jx-color-lane', default: 'max(--jx-hit, --jx-icon + 2×--jx-inset + 2px) — 34 / 36 / 46 / 58px across xs / sm / default / lg (measured)', source: 'component', description: 'The well floor — the ruler equation the trigger rides; re-based by the density rung scopes.' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px across xs / sm / default / lg', source: 'density', description: 'The lane’s type voice — the field’s own font-size rule (form controls inherit no font).' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px across xs / sm / default / lg', source: 'density', description: 'The lane’s leading voice; the trigger’s padding-block is its own floor equation.' },
            { name: '--jx-color-picker-hue', default: 'runtime hue angle (the committed value)', source: 'component', description: 'The SV pad’s live ground — the VALUE instrument’s channel, not the color axis.' },
          ]} />
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
      summary="The value surface is a native input[type=text] (label, focus, selection); the swatch is a native input[type=color]; the popover supplies Escape and light-dismiss behavior."
    >
      <A11yTable
        keys={[
          { key: 'Type + Enter', action: 'Edit the value in the native field; parsed text commits, invalid drafts revert' },
          { key: 'Click swatch', action: 'Open the engine color picker (native input[type=color])' },
          { key: 'Enter / Space on chevron', action: 'Open the editor popover (native popover=auto)' },
          { key: 'Escape', action: 'Close the popover and restore field focus' },
          { key: 'Tab', action: 'Move through the lane controls and picker fields' },
          { key: 'Keyboard-only picking (honest limits)', action: 'The SV pad and hue rail are pointer-only decorative aids (aria-hidden); keyboard picking rides the value field (any notation), the format select and the Swatches grid — and the engine picker only while the native swatch is mounted (showSwatch=false removes that path entirely).' },
        ]}
        aria={[
          { name: 'aria-invalid', value: 'true', description: 'Set on the field when error is present' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points the field — and the native swatch — at the “! message” line when invalid' },
          { name: 'aria-expanded', value: 'true | false', description: 'On the chevron; reflects popover visibility' },
          { name: 'aria-haspopup', value: 'true', description: 'On the chevron; the generic promise — the panel opens as role=group, not a dialog' },
          { name: 'aria-controls', value: '{id}-panel', description: 'Connects the chevron to its panel' },
        ]}
      />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="color-picker" />
  </div>
</div>
