<!--
  textarea — canonical page (docs-restructure P0, 2026-08-25; rebuilt to
  the eight-axes archetype, docs-eight-axes-mdn task 68). Split out of
  the form family page: the textarea half of the slot system (toolbar
  and status rows) + the error law + the measured axes. The form.html
  route remains as the family hub.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Textarea from '$lib/ui/textarea/textarea.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlayNumber, PlayHelp } from '$lib/playground';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import textareaSource from '$lib/ui/textarea/textarea.svelte?raw';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'textarea')?.summary;
  if (!heroSummary) throw new Error('catalog entry "textarea" is missing — registry.json meta drift');

  const usage = `<Textarea label="notes" rows={5} maxlength={280} />

<!-- rows pass through (default 4); resize locks to the vertical axis;
     every other attribute rides through restProps -->
<Textarea label="bio" rows={3} placeholder="multiline, maxlength rides through…" maxlength={280} spellcheck={false} wrap="hard" />`;

  const slotUsage = `<!-- textarea · 6 slots — inner rows sit behind 1px hairlines -->
<Textarea label="notes" rows={6} maxlength={280} count bind:value={text}>
  {#snippet innerBlockStart()}<span>bold</span><span>italic</span>{/snippet}
  {#snippet innerBlockEnd()}<span>draft</span>{/snippet}
</Textarea>`;

  const errorUsage = `<Textarea label="bio" error="bio is required" rows={2}></Textarea>

<!-- error wiring, the family law:
  · aria-invalid="true" on the control
  · aria-describedby → the "! message" line (var(--destructive) ink)
  · border-style: dashed on the shell — the BORDER signal is
    monochrome on purpose (shape, not hue) -->`;

  // ---- slot system demo state (controlled textarea) -------------------------
  let notes = $state('spawn a durable shell');

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  const canvasInitial = { value: 'spawn a durable shell', rows: 4, count: true, disabled: false };
  let canvasText = $state(canvasInitial.value);
  let canvasRows = $state(canvasInitial.rows);
  let canvasCount = $state(canvasInitial.count);
  let canvasDisabled = $state(canvasInitial.disabled);

  function resetTextareaCanvas(): void {
    canvasText = canvasInitial.value;
    canvasRows = canvasInitial.rows;
    canvasCount = canvasInitial.count;
    canvasDisabled = canvasInitial.disabled;
  }

  const canvasUsage = $derived(
    [
      '<Textarea',
      '  label="notes"',
      `  rows={${canvasRows}}`,
      '  bind:value',
      canvasCount ? '  count' : [],
      canvasDisabled ? '  disabled' : [],
      '/>',
    ]
      .flat()
      .join('\n'),
  );

  // stable named resolver: the usage file tracks live playground state
  const resolveTextareaUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/textarea/textarea.svelte', content: textareaSource },
    { name: 'src/lib/ui/textarea-usage.svelte', content: usage },
  ];

  // ---- the variants grid (types section), swept through a canvas -----------
  const close = '</' + 'script>';

  const textareaTypesDemo = `<script lang="ts">
  import Textarea from '@ui/textarea.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="border border-border p-4"><Textarea label="plain" name="types-plain" rows={3} placeholder="multiline…" /></div>
  <div class="border border-border p-4"><Textarea label="count" name="types-count" rows={3} maxlength={280} count placeholder="N / maxLength readout…" /></div>
  <div class="border border-border p-4"><Textarea label="error" name="types-error" rows={2} error="bio is required"></Textarea></div>
  <div class="border border-border p-4"><Textarea label="disabled" name="types-disabled" rows={2} placeholder="not allowed" disabled /></div>
</div>`;

  const textareaTypesFiles: TreeFile[] = [
    { name: 'textarea-types-demo.svelte', content: textareaTypesDemo, kind: 'usage' },
  ];
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter((style): style is { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        Object.entries(style).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-A) --------------------
  const universalUsage = `<Textarea label="px number" size={14} density="small" rows={2} />
<Textarea label="named steps" size="large" radius="medium" rows={2} />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/textarea-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 68) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/textarea/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "NO-OPINION AND REACTIVE — the family owns no density paint (every Defaults slot is the no-opinion axis slot), so the AMBIENT scope channels flow straight through the field: --jx-text/--jx-line/--jx-inset/--jx-hit move the voice and the height (measured 10px voice / 60px height at the 2xs stamp vs 15px / 90px at lg (rows-4 projections: height = rows × voice × 1.5 — the served rows-3 sample reads 45/68, the same arithmetic)). The rung attr stamps the field root (data-density). Zero --jx-density-effective readers (grep receipt) — the channels are plain density-scope custom properties, not axis carriers. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'CONSUMED (§1) — the native element NEVER receives a size attribute from this axis (the §1 native collision rule; measured: size-stamped fields carry no size attribute); the §1 stamp scales the field root and the field voice follows (measured echo). Zero --jx-size-effective readers (grep receipt). Number unit: px.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape or factor consumer in ui/textarea/); the corner is the consumed jx-pure box law (measured 0px — square chrome). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero radius-effective readers (grep receipt); the shell radius is the consumed box law (measured 0px), and a stamped carrier moved nothing (measured). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'CONSUMED (§1) AND SUPPLY-ONLY — the hue axis never reaches the native element (the collision rule, measured); the shell paints var(--border)/var(--background) from the theme profile and the family’s one semantic color is the error line’s var(--destructive). Zero --jx-color-effective readers (grep receipt). Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'DECLARATIVE STAMP, AND THE HOST DECIDES — three strata, measured. L1 page bridge: under prefers-dark the SITE\'S THEME SYNC adds html.dark (the mechanism — not the media query alone) and --border flips oklch(0 0 0) → oklch(1 0 0) page-wide and a body-level field re-derives. L2 host island: inside a component-canvas stage a data-theme="light" island re-pins the light profile — the served demo does NOT re-derive (island beats page). L3 component stamp: theme="dark" stamps the .dark class on the field root — the closest scope wins over the island. The invalid signal stays monochrome at every stratum (a dashed border is shape, not hue). system/auto = tree inheritance. No number lane.',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the only shadow is the consumed box law’s hover lift (measured a 1px inset shadow — not a shadow tier). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero --jx-motion-effective readers (grep receipt); the shell’s color/outline transitions ride the consumed jx-pure law, and the count readout’s announcement discipline (aria-live off → polite at 90% of the cap) is a semantic channel, not a motion one. Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import Textarea from '@ui/textarea.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case (18px)
     wins — the field voice follows, the native element never sees a size
     attribute -->
<Textarea label="notes" size={query({ md: 18 }, 13)} rows={3} />`;

  const queryFiles: TreeFile[] = [
    { name: 'textarea-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Textarea · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai textarea component: the same text-shell law as input with resize locked to the vertical axis — rows pass-through (default 4), six slot seams (toolbar and status rows behind 1px hairlines), count for an N / maxLength readout, and the family label/error contract."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="textarea — the multiline text shell"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">resize: vertical</span>
        <span class="pill">toolbar + status slot rows</span>
        <span class="pill">count readout</span>
        <span class="pill">label[for] + aria wiring</span>
        <span class="pill">attribute-transparent</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (the archetype's install anchor; chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="textarea" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="The platform gives the multiline field; the family gives the text-shell law, six slot seams, a count readout with announcement discipline, and the label/error contract — all measured."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The native element carries the semantics: a real
          <code class={cx(rt.inkPrimary)}>&lt;textarea&gt;</code> — multiline text, platform
          forms, FormData and form.reset untouched. The family adds the text-shell law (the same
          one as input: a 1px var(--border) frame over var(--background), radius 0, a hover lift,
          and the site's inset 1px focus-visible outline on the ring token), locks
          <code class={cx(rt.inkPrimary)}>resize</code> to the vertical axis (never horizontal —
          it would break column rhythm), and wires the field contract:
          <code class={cx(rt.inkPrimary)}>label[for]</code> with an auto id, an error string that
          becomes <code class={cx(rt.inkPrimary)}>aria-invalid</code> +
          <code class={cx(rt.inkPrimary)}>aria-describedby</code> + a dashed shell + the "! message"
          line, and a count readout. rows defaults to 4; everything else — placeholder, maxlength,
          disabled, name, required, spellcheck, wrap — flows through restProps onto the element.
        </p>
        <p class={cx(rt.para)}>
          The shell is a slot system. Inner block rows land inside the frame behind 1px hairlines
          (a toolbar above, a status row below); outer rows replace or extend the field's
          surroundings; and <code class={cx(rt.inkPrimary)}>count</code> appends an
          N / maxLength readout with announcement discipline: code-point counting (a surrogate
          pair counts ONE — measured 🫠🫠 = 2), <code class={cx(rt.inkPrimary)}>aria-live</code>
          off everywhere except the last 10% of the cap, where it flips to polite — near the
          limit the count is worth announcing, elsewhere it never chatters per keystroke.
          <code class={cx(rt.inkPrimary)}>value</code> is bindable: bound ⇒ controlled; absent ⇒
          purely uncontrolled (Svelte skips undefined writes, so FormData and form.reset keep
          native behavior — measured). A caller-supplied
          <code class={cx(rt.inkPrimary)}>oninput</code> still fires after the family syncs.
        </p>
        <p class={cx(rt.para)}>
          The eight axes: density is no-opinion and REACTIVE — the family owns no density paint,
          and the ambient scope channels move the field (measured 10px/60px at 2xs vs 15px/90px
          at lg); size and color are CONSUMED by the §1 collision rule (the native element never
          receives them — measured); theme is a declarative stamp whose story has three measured
          strata (page bridge → canvas light-island → component stamp, closest scope wins);
          shape/radius/elevation/motion supply unread (zero carrier readers, grep receipts).
          Kinship: <code class={cx(rt.inkPrimary)}>input</code> (the single-line twin — same
          shell law), <code class={cx(rt.inkPrimary)}>combobox</code> and
          <code class={cx(rt.inkPrimary)}>select</code> (the other field contracts).
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="textarea"
      description="the multiline half of the shell family — label + count rows, locked vertical resize, and the same label/error contract as input; value is $bindable."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/textarea/textarea.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetTextareaCanvas}
      output={[{ label: 'length', value: canvasText.length }]}
      resolveFileContent={resolveTextareaUsage}
    >
      <div class={cx(rt.taLane)}>
        <Textarea
          label="notes"
          bind:value={canvasText}
          rows={canvasRows}
          count={canvasCount}
          disabled={canvasDisabled}
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="rows">
            <PlayNumber bind:value={canvasRows} />
          </PlayRow>
          <PlayRow label="count">
            <PlayToggle bind:value={canvasCount} />
          </PlayRow>
          <PlayRow label="disabled">
            <PlayToggle bind:value={canvasDisabled} />
          </PlayRow>
          <PlayHelp>
            the shell is the input's — toolbar/status rows slot behind hairlines; resize is
            locked to the vertical axis.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="textarea-base" data-reveal="">
    <SectionCard
      family="textarea-base"
      headerRegion="textarea-base"
      eyebrow="W3C foundation"
      title="What the platform gives"
      summary="The native textarea keeps platform semantics — multiline text, FormData, form.reset, the attribute set (placeholder, maxlength, spellcheck, wrap…). The shell only paints: same 1px border, radius 0, hover lift, and inset focus outline as the input shell — only taller."
    >
      <div class={cx(rt.col20)}>
        <div class={cx(rt.grid760a)}>
          <Textarea
            label="textarea (resize: vertical)"
            name="demo_notes"
            rows={5}
            placeholder="multiline, rows={5}, maxlength rides through restProps…"
            maxlength={280}
          />
          <Textarea
            label="rows 3"
            name="demo_notes3"
            rows={3}
            placeholder="rows passes through verbatim…"
          />
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="Textarea variants"
      summary="The plain shell, the toolbar + count posture, the error state, and the disabled field."
    >
      <ComponentCanvas title="textarea · variants" stage="fill" files={textareaTypesFiles}>
        <div class={cx(rt.gridSm2)}>
          <div class={cx(rt.panel)}><Textarea label="plain" name="types-plain" rows={3} placeholder="multiline…" /></div>
          <div class={cx(rt.panel)}><Textarea label="count" name="types-count" rows={3} maxlength={280} count placeholder="N / maxLength readout…" /></div>
          <div class={cx(rt.panel)}><Textarea label="error" name="types-error" rows={2} error="bio is required"></Textarea></div>
          <div class={cx(rt.panel)}><Textarea label="disabled" name="types-disabled" rows={2} placeholder="not allowed" disabled /></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <!-- slot system (textarea half) -->
  <div id="slots" data-reveal="">
    <SectionCard
      family="slots"
      headerRegion="slots"
      eyebrow="textarea"
      title="Slot system — toolbar + status rows"
      summary="textarea adds inner-block-start / inner-block-end behind 1px hairlines for toolbar and status rows, plus count for an N / maxLength readout. The shell owns border, background, hover, and the inset focus outline, so slot content never repaints the box law — and value is $bindable: a bound field turns controlled, an unbound one stays purely uncontrolled (FormData and form.reset untouched)."
    >
      <div class={cx(rt.col20)}>
        <Textarea
          label="notes (toolbar + count)"
          name="slot_notes"
          rows={6}
          maxlength={280}
          count
          bind:value={notes}
        >
          {#snippet innerBlockStart()}
            <span>bold</span>
            <span>italic</span>
            <span>code</span>
            <span>link</span>
          {/snippet}
          {#snippet innerBlockEnd()}<span>draft — autosaves on blur</span>{/snippet}
        </Textarea>
        <p class={cx(rt.para)}>
          Slot content lands muted at 0.75rem behind the hairline rows; the wrapper is scoped,
          so override it with an important utility
          (<code class={cx(rt.inkAccent)}>text-foreground!</code>) or an inline style. The count
          readout lives in the status row — <code class={cx(rt.inkAccent)}>N / maxLength</code>,
          counted in code points off the mirrored value, never a second source of truth.
        </p>
        <CodeBlock code={slotUsage} lang="svelte" meta="slots" />
      </div>
    </SectionCard>
  </div>

  <!-- label + error wiring -->
  <div id="error-wiring" data-reveal="">
    <SectionCard
      family="error-wiring"
      headerRegion="error-wiring"
      eyebrow="law"
      title="label + error wiring"
      summary="The error prop is pure semantics: it sets aria-invalid='true', wires aria-describedby to the “! message” line, and dashes the shell border — the border signal is monochrome on purpose (shape, not hue), while the message line itself rides var(--destructive)."
    >
      <div class={cx(rt.col20)}>
        <div class={cx(rt.grid760a)}>
          <Textarea label="bio" error="bio is required" rows={2}></Textarea>
          <Textarea label="notes" name="demo_err_notes" rows={2} placeholder="optional…" />
        </div>
        <CodeBlock code={errorUsage} lang="svelte" meta="error" />
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="rows and every other native attribute pass through; the component adds the label/error contract, the hairline slot rows, and the count readout."
    >
      <CodeBlock code={usage} lang="svelte" meta="Textarea usage" />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The shell, lane padding, and label/error rhythm are pure density-scope tokens — the field is density-REACTIVE (measured 10px voice / 60px height at the 2xs stamp vs 15px / 90px at lg (rows-4 projections: height = rows × voice × 1.5 — the served rows-3 sample reads 45/68, the same arithmetic)) — and resize the scope and the whole field stack follows."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}>
          <Textarea label="density sample" name="density-textarea" rows={3} placeholder="Type here..." />
        </DensityDemo>
        <div class={cx(rt.mt20)}>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' },
          ]}
        />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="The declared surface is 20 named props (label, error, count, rows, id, value, chrome, class + the four slot snippets + the eight axes) — and the component is ATTRIBUTE-TRANSPARENT, not rest-less: the native textarea attribute set rides the rest spread onto the real element, forwarded BY NAME where the family gives it a job (maxlength drives the count readout; rows defaults to 4; oninput fires after the family syncs) and verbatim everywhere else (placeholder, disabled, name, required, spellcheck, wrap, minlength, readonly…). Two withholdings: the color ATTRIBUTE is Omitted (the color AXIS is not), and a caller data-density is captured by the axis stamp."
    >
      <PropsTable
        universal
          props={[
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control; skipped when outerBlockStart takes the slot over.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid="true", wires aria-describedby to the "! message" line, dashes the shell.' },
          { name: 'count', type: 'boolean', default: 'false', description: 'Appends an "N / maxLength" readout to the inner-block-end row (code-point counting; aria-live flips to polite at 90% of the cap).' },
          { name: 'rows', type: 'number', default: '4', description: 'Native rows attribute, passed through verbatim.' },
          { name: 'id', type: 'string', default: '$props.id()', description: 'Wired into label[for] and the error aria-describedby; auto-generated when omitted.' },
          { name: 'value', type: 'string | number', default: '—', description: 'Bindable; bound ⇒ controlled, absent ⇒ purely uncontrolled (FormData and form.reset keep native behavior).', bindable: true },
          { name: 'chrome', type: "'frame' | …", default: "ambient ?? 'frame'", description: 'The control-chrome lane; the ambient value comes from the ControlChrome context.' },
          { name: 'innerBlockStart', type: 'Snippet', default: '—', description: 'Inside the shell, above the textarea (toolbar row, behind a hairline).' },
          { name: 'innerBlockEnd', type: 'Snippet', default: '—', description: 'Inside the shell, below the textarea (status row).' },
          { name: 'outerBlockStart', type: 'Snippet', default: '—', description: 'Outside the shell, above — replaces the label row when given.' },
          { name: 'outerBlockEnd', type: 'Snippet', default: '—', description: 'Outside the shell, below — renders below the error line.' },
          { name: 'density', type: "'2xs' | 'xs' | 'sm' | 'default' | 'lg'", default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on textarea"
      summary="Density is NO-OPINION AND REACTIVE — the family owns no density paint and the ambient scope channels move the field (measured 10px/60px at 2xs vs 15px/90px at lg); size and color are CONSUMED by the §1 collision rule (the native element never receives them); theme is a declarative stamp with three measured strata (page bridge → canvas light-island → component stamp, closest scope wins); shape/radius/elevation/motion supply unread (zero carrier readers)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the shell law (resize locked vertical; radius 0; hover lift measured as a 1px
          inset shadow; focus-visible the inset 1px ring outline at offset −1px; rows 4 default;
          label[for] auto-wired) and the error contract (aria-invalid="true", aria-describedby
          resolving to the "! message" line, dashed shell) were measured on this page's served DOM
          (probe, task 68); the count readout (N / maxLength; code-point counting measured 🫠🫠 = 2;
          aria-live off → polite at 90% of the cap and back) and the native forwarding
          (maxlength, spellcheck, wrap, name read back off the element) the same way; the theme
          strata (body-level border oklch(0 0 0) → oklch(1 0 0) under page-dark, the canvas
          data-theme="light" island pinning the served demo, the component .dark stamp winning
          closest) were measured across two loads; the unread rows carry grep receipts over
          ui/textarea/. The query() seat below rides the md viewport key (48rem) on the size lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="textarea · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <Textarea label="notes" size={responsiveSize} rows={3} name="query-textarea" />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the field voice follows while the native element
                never sees a size attribute. The number lane goes bare. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="textarea · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}><Textarea label="size 14 · density small" size={14} density="small" rows={2} name="univ-ta-px" placeholder="px number · sm rung" /></div>
              <div class={cx(rt.panel)}><Textarea label="size large · radius medium" size="large" density="large" radius="medium" rows={2} name="univ-ta-named" placeholder="named steps" /></div>
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
      summary="The native textarea keeps platform semantics; the component wires the label and the validation message to the control, and the count readout announces only when it matters."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the textarea' },
          { key: 'any text', action: 'Types into the field' },
          { key: 'drag', action: 'Resize handle, locked to the vertical axis' },
        ]}
        aria={[
          { name: 'label[for]', value: '{id}', description: 'The label prop names the control (auto id; skipped when outerBlockStart takes the slot over — author your own wiring then)' },
          { name: 'aria-invalid', value: "'true'", description: 'Set on the native textarea when the error prop is provided (measured)' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line — a static read on focus, no live region chatter while typing' },
          { name: 'aria-live', value: 'off → polite', description: 'The count readout stays silent until 90% of maxlength, then announces politely (aria-atomic); measured flipping both ways' },
          { name: 'aria-invalid paint', value: 'dashed border', description: 'The shell’s invalid signal is monochrome (border-style dashed) — the message line carries var(--destructive)' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="textarea" />
  </div>
</div>
