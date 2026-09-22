<!--
  checkbox — docs page (docs-eight-axes-mdn, tier-2 refactor, 2026-09-22).
  MDN archetype order: H1 → Overview → Install → Usage (live example) →
  Examples → Props → The eight axes on THIS component → The bare
  branch → Accessibility → See also.
  The W3-era single universal demo card (whose "size 14" panel
  demonstrated a non-consumer) is replaced by the per-axis table +
  grouped runnable examples + one real query() case; the duplicated
  types/states matrices merge; the bare branch gets the census story
  it was promised: the unstamped embedded lane.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as checkboxMeta } from '$lib/meta/checkbox.meta';
  import { CHECKBOX_DOCS } from '$lib/ui/props-table/docs/checkbox.docs';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlaySegmented, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  // The canvas same-source lane (fix round 11): the states/query/bare
  // canvases carry ids and compose their drawers from THIS PAGE's own
  // stage markup via resolveRawCode — the hand-mirrored literals are
  // gone. The form canvas keeps a hand file (its stage is interactive
  // page state, not extractable), rewritten to run the stage's real
  // atoms so the sample doesn't collapse.
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/checkbox.html/+page';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import checkboxSource from '$lib/ui/checkbox/checkbox.svelte?raw';
  import checkboxCssSource from '$lib/ui/checkbox/checkbox.css?raw';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'checkbox')?.summary;
  if (!heroSummary) throw new Error('catalog entry "checkbox" is missing — registry.json meta drift');

  const close = '</' + 'script>';

  const usage = `<!-- label on inline-start (default); labelSide flips it -->
<Checkbox label="subscribe" name="subscribe" />
<Checkbox label="select all" name="all" indeterminate />
<Checkbox label="terms" name="consent" labelSide="left" required />
<Checkbox label="dark profile" theme="dark" checked />

<!-- error wiring: aria-invalid + describedby + dashed border -->
<Checkbox label="consent" error="consent is required" />`;

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  const canvasInitial = {
    checked: true,
    indeterminate: false,
    disabled: false,
    labelSide: 'right' as 'left' | 'right',
  };
  let canvasChecked = $state(canvasInitial.checked);
  let canvasIndeterminate = $state(canvasInitial.indeterminate);
  let canvasDisabled = $state(canvasInitial.disabled);
  let canvasLabelSide = $state(canvasInitial.labelSide);

  function resetCheckboxCanvas(): void {
    canvasChecked = canvasInitial.checked;
    canvasIndeterminate = canvasInitial.indeterminate;
    canvasDisabled = canvasInitial.disabled;
    canvasLabelSide = canvasInitial.labelSide;
  }

  const canvasUsage = $derived(`<Checkbox
  label="subscribe"
  bind:checked
  indeterminate={${canvasIndeterminate}}
  labelSide="${canvasLabelSide}"${canvasDisabled ? '\n  disabled' : ''}
/>`);

  // stable named resolver: the usage file tracks live playground state
  const resolveCheckboxUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/checkbox/checkbox.svelte', content: checkboxSource },
    { name: 'registry/files/ui/checkbox/checkbox.css', content: checkboxCssSource },
    { name: 'src/lib/ui/checkbox-usage.svelte', content: usage },
  ];

  // ---- the selector, redrawn (the states matrix) — same-source ----------
  const statesUsage = usageFile(
    { Checkbox: '@ui/checkbox', CardGrid: '@ui/card-grid' },
    resolveRawCode('states'),
  );
  const statesFiles: TreeFile[] = [
    { name: 'checkbox-states-demo.svelte', content: statesUsage, kind: 'usage' },
  ];

  // ---- form participation demo (from the family example form) ---------------
  // NativeHTML end to end: uncontrolled checkbox, native constraint
  // validation, FormData read once at submit. The terminal card replays
  // per submit via {#key}.
  let result = $state<{ outputs: string[] } | null>(null);

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const outputs: string[] = [];
    for (const [key, value] of data) {
      if (typeof value === 'string' && value !== '') outputs.push(`${key}: ${value}`);
    }
    outputs.push('form submitted ✓');
    result = { outputs };
  }

  const checkboxFormDemo = `<script lang="ts">
  import Checkbox from '@ui/checkbox.svelte';
  import PressButton from '@ui/press-button.svelte';
  import { rt } from '@lib/surface/routes.stylex';

  // the page-local join (the separator serialize law) — the same idiom
  // the docs stage runs; atoms over utility classes
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

  // uncontrolled fields, FormData read once at submit — the checked box
  // contributes its name/value pair, an unchecked one contributes nothing
  let result = $state<string[] | null>(null);

  function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const outputs: string[] = [];
    for (const [key, value] of data) {
      if (typeof value === 'string' && value !== '') outputs.push(key + ': ' + value);
    }
    result = outputs;
  }
${close}

<form class={cx(rt.col16)} aria-label="consent" onsubmit={onSubmit}>
  <Checkbox label="I agree to the terminal printing my answers" name="consent" value="yes" required />
  <Checkbox label="join the newsletter" name="news" value="yes" />
  <div class={cx(rt.wrapRow12, rt.pt4)}>
    <PressButton type="submit" variant="fill">sign up</PressButton>
    <span class={cx(rt.inkMuted, rt.text125)}>
      required fields use native validation — try submitting empty
    </span>
  </div>
</form>`;

  // ── the eight axes on checkbox — grouped runnable examples ──────────────
  // The drawers compose from the stage markup in the canvases below (the
  // same-source lane — the stage is THE source; the explanatory comments
  // ride inside the stage children so both surfaces carry them).
  const axesUsage = usageFile({ Checkbox: '@ui/checkbox' }, resolveRawCode('axes'));

  const axesFiles: TreeFile[] = [{ name: 'checkbox-axes-demo.svelte', content: axesUsage, kind: 'usage' }];

  // the ONE query() case: responsive density on the hit lane — the base
  // (large: the 24px box under a 48px lane, touch-generous) applies
  // below the 40rem viewport; at ≥40rem the sm case wins and the row
  // steps down to the compact pointer lane (18px box, 32px lane). The
  // stage carries the explicit-generics call INLINE (the campaign's
  // query() typing law — the one-generic form leaves B inferred
  // undefined, and 'large' fails its assignment), so the composed
  // drawer teaches the same form.
  const queryUsage = usageFile(
    {
      Checkbox: '@ui/checkbox',
      '{ query }': '@lib/universal-props-query.svelte',
      'type { DensityLane }': '@lib/defaults.svelte',
    },
    resolveRawCode('query'),
  );

  const queryFiles: TreeFile[] = [{ name: 'checkbox-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the bare branch (the unstamped embedded lane) — same-source -------
  const bareUsage = usageFile({ Checkbox: '@ui/checkbox' }, resolveRawCode('bare'));

  const bareFiles: TreeFile[] = [{ name: 'checkbox-bare-demo.svelte', content: bareUsage, kind: 'usage' }];

  // ── the per-axis table (§2.5): what each axis drives on THIS family.
  // Mechanism names are the family's real carriers (checkbox.svelte
  // stamps through stampCarriersForLanes; the paint reads
  // .jx-html-checkbox + .jx-check-lane from jixoai.css/checkbox.css);
  // named steps/units mirror universal-props.schema.ts.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-size-effective and the root font-size on the field wrapper — and nothing in this family reads either: the label declares its own font-size var(--jx-text) (a density channel, beats inheritance), and the box reads the rem-anchored var(--jx-icon), which tracks the document root, not this stamp. A documented non-consumer (grep receipt: zero --jx-size-effective readers in the checkbox chain). The §1 collision still applies: the axis owns the name — the element never receives a native size attribute.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'Stamps --jx-shape-effective and --jx-radius-factor-effective, supplied downward. The box reads var(--corner-shape, bevel) — an undeclared customization seam whose bevel fallback wins today; the shape axis never bridges it — and its border-radius is 0: the glyph is deliberately square. Supply-only on this family.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-radius-effective — the concentric anchor a nested auto part computes against. Nothing consumes it here: the control\'s corner is border-radius: 0 by design and the chain carries no radius composition. Supply-only.',
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        'The axis that repaints this control — through its NAMED lane. A named rung stamps the data-density scope on the field wrapper (small/medium/large alias sm/default/lg; xs and 2xs stay directly addressable) AND co-stamps --jx-density-coefficient: 1 on the same root — an ACTIVE pin, not a formality: every channel composes base × coefficient inside the scope, so the pin stops any OUTER coefficient at the boundary and makes explicit rung = exact rung (an outer ×3 wrapper moves a pin-less box 24 → 72px; the pin holds the rung exact) — the scope block re-declares the channels AT the wrapper, and everything the family reads moves together: the box is var(--jx-icon) (the rung\'s line scale), the row\'s hit lane is var(--jx-hit) (an absolute floor term under the scale), the rhythm reads --jx-gap/--jx-text/--jx-line. The NUMBER lane is inert here: it stamps --jx-density-coefficient on the wrapper, but custom-property substitution runs at the DECLARING element — the channels are declared at :root and the rung scopes, never at this stamp — so nothing re-declares and nothing scales (measured: coefficient 1.5 leaves the 20px box, the lane, and the label byte-unmoved; the declaring-element law). auto stamps neither half — the ambient scope keeps flowing.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'Stamps --jx-color-effective, supplied downward. The paint reads the raw token layer directly — --primary (the fill and the hover border), --primary-foreground (the glyph), --background/--border (the shell), --ring (focus) — and the checkbox chain has zero --jx-color-effective readers (grep receipt): the fill keeps the theme\'s primary inside any island. Supply-only on this family.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'A FULL re-theme on this family, measured by the declaring-selector grep (the drift ledger\'s W-next #1 lens): every voice the paint reads — --background, --border, --primary, --primary-foreground, --ring, --foreground — is declared on the raw token layer (:root,.jx-light then .dark), and the chain reads no stylex-frozen semantic ink. dark stamps the .dark class bridge on the field wrapper and all of it flips (the primary hue drifts −4°, the shell inverts). bare renders no carrier element: ambient tree .dark still flows, an explicit theme="dark" does not (the next section).',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-elevation-effective (level-1…level5 are exact dp; a number snaps down to the enclosing rung). The control is flat by design — no shadow voice exists in the chain. Supply-only.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-motion-effective; zero readers. The family\'s real motion posture is fixed: 150ms ease-out on the fill/border/glyph morph, dropped entirely under prefers-reduced-motion: reduce — the css media query keys on the platform preference, not this axis. Supply-only.',
    },
  ];

  // the page's local join (the separator serialize law): plain
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

<svelte:head>
  <title>Checkbox · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai checkbox: the native input with its paint redrawn in pure CSS — appearance-none + one clip-path pseudo-element. The native element keeps form participation, keyboard toggling, and :checked/:indeterminate state; the eight universal axes resolve on the field wrapper (density and theme repaint it), and bare renders the unstamped embedded lane for prose contexts."
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
      title="checkbox — the native selector, redrawn"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">pure CSS · zero icon deps</span>
        <span class="pill">:checked morph</span>
        <span class="pill">:indeterminate dash</span>
        <span class="pill">labelSide left / right</span>
        <span class="pill">bare — the unstamped lane</span>
      </div>
    </SectionCard>
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="A checkbox that never stopped being a checkbox: the native input keeps every behavior, the paint is redrawn around it."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The component strips <code>appearance</code> off the native input and draws the glyph with
          one <code>::before</code> — a clip-path polygon on a 45°-rotated box. No icon font, no SVG,
          no dependencies. Underneath, the real <code>&lt;input type=&quot;checkbox&quot;&gt;</code> keeps form
          participation, keyboard toggling, and the <code>:checked</code>/<code>:indeterminate</code> state
          machine: <code>:checked</code> fills primary and grows the white check out of a collapsed
          polygon; <code>:indeterminate</code> rotates the same box back to 0° and morphs it into a
          dash — six vertices in every state, so CSS interpolates the morph.
        </p>
        <p class={cx(rt.para)}>
          The default render is a field wrapper holding a check lane — the input and a
          <code>label[for]</code> on one row (<code>labelSide</code> flips the side) — plus an error line
          when <code>error</code> is set. With no label and no error the wrapper collapses to an
          inline fit-content host. Hover leans the unchecked border toward primary; error dashes
          the border and wires <code>aria-invalid</code> + <code>aria-describedby</code>.
        </p>
        <p class={cx(rt.para)}>
          Uncontrolled by design: read submitted values with <code>FormData</code>. Pass
          <code>bind:checked</code> for controlled two-way binding. <code>indeterminate</code> is an IDL
          property — the attribute never reflects, so the prop lands on the element via an effect.
        </p>
        <p class={cx(rt.para)}>
          The eight universal axes resolve on the field wrapper — on this family
          <strong>density</strong> and <strong>theme</strong> repaint the control, the other six stamp
          and supply without touching the paint (per-axis below). The <code>bare</code> prop renders
          the single input for prose contexts — the unstamped embedded lane, its own section below.
          The shared grammar lives on the
          <a class="pill" href="/docs/universal-props.html">universal props</a> page.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law; the sections between stay page-local. -->
  <div id="install" data-reveal="">
    <DocsInstall name="checkbox" />
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Keep the input native so labels, keyboard toggling, and FormData participation remain platform behavior. The playground's drawer shows the exact registry copy this page runs."
    >
      <ComponentCanvas
        title="checkbox"
        description="appearance-none square with a clip-path check — the native input keeps form participation, keyboard toggling, and :checked/:indeterminate state; the glyph is pure CSS."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/checkbox/checkbox.svelte"
        files={canvasFiles}
        stage="center"
        onreset={resetCheckboxCanvas}
        output={[{ label: 'checked', value: canvasChecked }]}
        resolveFileContent={resolveCheckboxUsage}
      >
        <div class={cx(rt.col12, rt.itemsStart, rt.wFull, rt.cbMaxWxs)}>
          <Checkbox
            label="subscribe"
            name="canvas-checkbox"
            bind:checked={canvasChecked}
            indeterminate={canvasIndeterminate}
            labelSide={canvasLabelSide}
            disabled={canvasDisabled}
          />
          <Checkbox label="dark profile" theme="dark" checked name="canvas-checkbox-dark" />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="indeterminate">
              <PlayToggle bind:value={canvasIndeterminate} />
            </PlayRow>
            <PlayRow label="disabled">
              <PlayToggle bind:value={canvasDisabled} />
            </PlayRow>
            <PlayRow label="labelSide">
              <PlaySegmented
                bind:value={canvasLabelSide}
                options={[
                  { value: 'left', label: 'left' },
                  { value: 'right', label: 'right' },
                ]}
              />
            </PlayRow>
            <PlayHelp>
              one pseudo-element, six vertices in every state — :checked grows the check,
              :indeterminate rotates the same box into a dash, so CSS interpolates the morph.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </SectionCard>
  </div>

  <!-- the selectors, redrawn in pure CSS (the states matrix) -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="examples"
      title="The selector, redrawn in pure CSS"
      summary="The state matrix: binary, tri-state, and validation states are all the native states, redrawn — one pseudo-element, six vertices in every state."
    >
      <ComponentCanvas
        id="states"
        title="checkbox · states"
        files={statesFiles}
        stage="fill"
      >
        <CardGrid min="200px">
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="unchecked" name="demo_cb" />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="checked" name="demo_cb" checked />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="indeterminate" name="demo_cb" indeterminate />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="label left" name="demo_cb" labelSide="left" />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="disabled" name="demo_cb" disabled />
          </div>
          <div class="demo-cell" data-no-subgrid>
            <Checkbox label="error" name="demo_cb" error="consent is required" />
          </div>
        </CardGrid>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <!-- in a submitted form (from the family example form) -->
  <div id="in-a-form" data-reveal="">
    <SectionCard
      family="in-a-form"
      headerRegion="in-a-form"
      eyebrow="examples"
      title="In a submitted form"
      summary="Uncontrolled field, native constraint validation (the required bubble belongs to the platform), FormData read once at submit — the checked box contributes its name/value pair, an unchecked one contributes nothing."
    >
      <ComponentCanvas
        title="checkbox · in a form"
        files={[{ name: 'checkbox-form-demo.svelte', content: checkboxFormDemo, kind: 'usage' }]}
        stage="fill"
      >
        <div class={cx(rt.cbGrid900)}>
        <form class={cx(rt.col16)} aria-label="consent" onsubmit={onSubmit}>
          <Checkbox label="I agree to the terminal printing my answers" name="consent" value="yes" required />
          <Checkbox label="join the newsletter" name="news" value="yes" />
          <div class={cx(rt.wrapRow12, rt.pt4)}>
            <PressButton type="submit" variant="fill">sign up</PressButton>
            <span class={cx(rt.inkMuted, rt.text125)}>
              required fields use native validation — try submitting empty
            </span>
          </div>
        </form>
        <div>
          {#if result}
            {#key result}
              <TerminalCard
                barTitle="form — zsh"
                command="form.submit"
                outputs={result.outputs}
              />
            {/key}
          {:else}
            <div class={cx('demo-cell', rt.cbCell)}>
              <span class={cx(rt.eyebrowPrimary)}>awaiting submit</span>
              <span>check a box and press <code class={cx(rt.inkAccent)}>sign up</code> — the FormData payload prints here</span>
            </div>
          {/if}
        </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="props" title="Props" summary="Props extend the native HTML input attributes — minus size and color, whose names the eight-axis surface owns (the §1 native collision rule); the entries below are checkbox-specific additions, and everything else rides the rest object through to the input."><PropsTable meta={checkboxMeta} docs={CHECKBOX_DOCS} /></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on checkbox"
      summary="Checkbox resolves all eight axes through its family Defaults (CheckboxDefaults) and stamps the resolved carriers on the field wrapper — bare renders no carrier element at all (the next section). What each axis drives on THIS family: density repaints the control (the named rung — the number lane is inert here), theme flips every painted voice (they all live on the raw token layer), and six axes stamp-and-supply without touching the paint. The lane grammar (named · auto · number · query()) is the universal props page's."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />

        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="checkbox · on the axes" files={axesFiles}>
            <div class={cx(rt.col16, rt.wFull)}>
              <!-- density: the NAMED lane paints on this family — the
                   rung stamps the data-density scope on the field
                   wrapper, the scope block re-declares the channels AT
                   the wrapper, and the box, the hit lane, the gap and
                   the label voice all move together. (The NUMBER lane
                   stamps only a coefficient — inert here: substitution
                   runs at the declaring element, so nothing re-declares
                   at the stamp.) -->
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}><Checkbox label="lg rung — box and lane step up" name="axes-d-lg" density="lg" /></div>
                <div class={cx(rt.panel)}><Checkbox label="2xs rung — the floor lowers to 24px" name="axes-d-2xs" density="2xs" /></div>
              </div>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="query" title="checkbox · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Checkbox
                label="responsive hit lane"
                name="axes-query"
                density={query<{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')}
              />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the large rung, the
                24px box under a 48px lane (touch); at 40rem and wider the sm case wins — the
                compact 18px box in a 32px lane (pointer). Resize the window.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <p class={cx(rt.para)}>
            The supply-only rows are documented absences, not gaps: the box is deliberately
            square (border-radius: 0 — the glyph's design), its corner-shape reads
            <code>var(--corner-shape, bevel)</code> — an undeclared customization seam whose bevel
            fallback wins today; the axis never bridges it — the fill is the
            theme's raw <code>--primary</code>, and the control ships no shadow and no motion
            kernel — so size, shape, radius, color, elevation, and motion stamp their carriers
            and feed nested consumers without repainting this control. Checkbox is a batch A
            native-collision family (explicit-props' <code>migration-census.md</code>, the §1 rule in
            action): the Props interface omits the native <code>size</code>/<code>color</code> attributes and
            re-declares the names as axis lanes — the destructured prop wins, the element never
            receives them, and everything the family does not own still rides {'{...rest}'} to
            the input (name, value, required, disabled…).
          </p>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[
            { name: '--jx-icon', default: 'the box (width/height) — the rung\'s line scale; 14 / 16 / 18 / 20 / 24px (2xs → lg, measured)', source: 'density', description: 'The glyph square — the named density lane\'s consumption point on the control itself.' },
            { name: '--jx-hit', default: 'the lane\'s min-block-size — max(floor, content); 24 / 28 / 32 / 40 / 48px (2xs → lg, measured)', source: 'density', description: 'The hit row: the floor is absolute (28px; the 2xs scope lowers it to 24px — the WCAG 2.5.8 AA pointer-dense note), the content term scales per rung.' },
            { name: '--jx-gap', default: '8 / 8 / 8 / 12 / 16px (2xs → lg)', source: 'density', description: 'Input ↔ label gap.' },
            { name: '--jx-text / --jx-line', default: '10 / 11 / 12 / 13 / 15px · 14 / 16 / 18 / 20 / 24px (2xs → lg)', source: 'density', description: 'The label voice — font-size and line-height.' },
            { name: '--jx-density-coefficient', default: '1 at :root; re-pinned to 1 by every named rung (an active pin inside the scope: it stops outer coefficients at the boundary)', source: 'density' },
            { name: 'border', default: '1px solid var(--border)', source: 'structural' },
            { name: 'glyph inset', default: '2px (the ::before)', source: 'structural' },
            { name: 'transition', default: '150ms ease-out; none under prefers-reduced-motion', source: 'structural' },
          ]} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="bare" data-reveal="">
    <SectionCard
      family="bare"
      headerRegion="bare"
      eyebrow="bare"
      title="The bare branch — the unstamped embedded lane"
      summary="bare renders the SINGLE input: the component's paint class, nothing else. No field wrapper means no data-density scope, no carrier style attr, no .dark class bridge, no query anchor — the explicit eight resolve and stamp nowhere. Ambient tree scopes still flow, because custom properties inherit; that is exactly the posture prose contexts want."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The branch exists for markdown task items (the Owner's 2026-09-08 markdown unlock
          ruling: use the real component). In a rendered task list the source text owns the
          state — the marker is presentation-only and disabled. A direct-child input keeps the
          container-level DOM-shape laws working that the wrapped <code>div &gt; span &gt; input</code>
          shape defeats: markdown's <code>[data-jx-markdown] li:has(&gt; input[type='checkbox'])</code>
          marker suppression and the list family's middle-alignment rules key on the input being
          the <code>li</code>'s direct child.
        </p>
        <p class={cx(rt.para)}>
          The stamps are the difference. In the demo below, <code>density=&quot;lg&quot;</code> on the bare
          input resolves the lane, supplies it to a context with no descendants, and paints
          nothing — the box is byte-identical to the plain bare input. The wrapped contrast cell
          passes the same <code>density=&quot;lg&quot;</code> and shows where the stamps land: its root
          carries <code>data-density=&quot;lg&quot;</code> plus the carrier style, and the box steps up to
          the lg rung. The paint law is the same either way — <code>.jx-html-checkbox</code> is one
          css-laws vocabulary, and the indeterminate effect, the <code>checked</code> binding, and the
          rest forwarding bind the same element in both branches.
        </p>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="bare"
            title="checkbox · bare"
            files={bareFiles}
            stage="fill"
          >
            <div class={cx(rt.gridSm3, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.eyebrowPrimary)}>bare — one input</span>
                <Checkbox bare checked name="bare-plain" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.eyebrowPrimary)}>bare + density lg — inert</span>
                <Checkbox bare checked density="lg" name="bare-inert" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.eyebrowPrimary)}>wrapped + density lg — the stamps live here</span>
                <Checkbox checked label="wrapped" name="wrapped-contrast" density="lg" />
              </div>
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
      summary="No ARIA synthesis: the element is a real checkbox, so the platform owns the semantics. The label rides label[for] (the id auto-generates), the error wires invalid + describedby, and the hit lane carries a 28px absolute floor under the density scale."
    >
      <div class={cx(rt.col20)}>
        <A11yTable
          keys={[
            { key: 'Space', action: 'Toggle the focused checkbox — native behavior, the element is a real input' },
            { key: 'label click', action: 'Toggles too — the label is a label[for] on the same row (the id auto-generates), so the whole lane is the target' },
          ]}
          aria={[
            { name: 'role', value: '(native)', description: 'None synthesized — the native checkbox semantics ship with the element; :indeterminate exposes as mixed to assistive tech (platform behavior)' },
            { name: 'aria-invalid', value: 'true', description: 'Set when error is present' },
            { name: 'aria-describedby', value: '{id}-error', description: 'References the validation message — a real paragraph headed by an aria-hidden ! mark' },
          ]}
        />
        <div class={cx(rt.mt20)}>
          <p class={cx(rt.para)}>
            The hit floor: the check lane's <code>min-block-size</code> is <code>var(--jx-hit)</code> — a
            max() whose floor term is absolute while the content term scales with the rung: the
            default floor is 28px (<code>--jx-hit-floor</code>), the 2xs scope deliberately LOWERS it
            to 24px (the WCAG 2.5.8 AA note for pointer-dense tool surfaces), and the rungs
            measure 24 / 28 / 32 / 40 / 48px (2xs → lg). The <code>label[for]</code> wiring widens the
            effective target across the whole lane, not just the 20px glyph. <code>disabled</code> is
            the native attribute riding the rest (opacity .5 + not-allowed), and
            <code>prefers-reduced-motion: reduce</code> drops the glyph morph transitions entirely —
            the motion posture keys on the platform preference, not the motion axis.
          </p>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="checkbox" />
  </div>
</div>
