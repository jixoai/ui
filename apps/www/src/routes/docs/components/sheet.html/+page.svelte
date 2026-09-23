<!--
  sheet page (docs-eight-axes-mdn task 31, MDN archetype; tier 2
  优化重构 — the workbench canvas, universal demos, api rows and the a11y
  table carried; the archetype gains install/overview/law/axes/see-also +
  a ToC; theming folded into axes. Family untouched — the sheet is the
  dialog positioning variant: the stamps ride the <dialog> root itself
  (self-carried across the showModal promotion).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Sheet from '$lib/ui/sheet/sheet.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import sheetSource from '$lib/ui/sheet/sheet.svelte?raw';

  const close = '</' + 'script>';

  const summary =
    'A POSITIONING/ANIMATION variant of the native dialog, not a second state machine: showModal() (focus trap, Escape, top layer native), the same generation-token close path, bind:open lifecycle. The panel docks to an edge and slides in along its axis. Backdrop click is deliberately NOT wired — sheet content is often a form; a stray click shouldn\'t destroy it.';

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { side: 'right' as 'left' | 'right' | 'top' | 'bottom' };
  let open = $state(false);
  let side = $state<'left' | 'right' | 'top' | 'bottom'>(canvasInitial.side);
  const sideOptions: { value: 'left' | 'right' | 'top' | 'bottom'; label: string }[] = [
    { value: 'right', label: 'right' },
    { value: 'left', label: 'left' },
    { value: 'top', label: 'top' },
    { value: 'bottom', label: 'bottom' },
  ];
  function resetCanvas(): void {
    side = canvasInitial.side;
  }

  const usage = `<script lang="ts">
  import Sheet from '@ui/sheet.svelte';
  import CardFooter from '@ui/card/card-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<PressButton onclick={() => (open = true)}>Filters</PressButton>
<Sheet bind:open title="Filters" side="right">
  <p>Filter controls — focus stays trapped, Escape closes.</p>
  {#snippet footer()}
    <!-- the carved action band: the cluster fills the foot band
         vertically, the rim Separator above is its top edge -->
    <CardFooter>
      <PressButton onclick={() => (open = false)}>Apply</PressButton>
    </CardFooter>
  {/snippet}
</Sheet>`;

  const canvasUsage = `<Sheet bind:open title="Filters" {side} width="24rem">
  <!-- body -->
</Sheet>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/sheet/sheet.svelte', content: sheetSource },
    { name: 'src/lib/ui/sheet-usage.svelte', content: canvasUsage },
  ];

  // the page's local join (the separator serialize law + the cx
  // predicate: the type guard zeroes the standing svelte-check
  // diagnostic — plain strings pass through whole; stylex objects
  // contribute their string members ($$css dropped)).
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

  // ---- the law table: the dialog laws, side-docked ------------------------
  const lawTable = [
    { posture: 'the promotion', input: 'showModal()', renders: 'the panel itself is the native <dialog> — top layer, inert page, UA focus trap and Escape-cancel come from the platform. The §11 carriers stamp the DIALOG ROOT (self-carried across the promotion — the resolved axes ride the panel, never the trigger\u0027s tree)', announces: 'the page behind is inert; the drawer carries its own scope' },
    { posture: 'the close path', input: '× · Escape · your footer · bind:open', renders: 'one generation token: every path lands in shut(); a reopen during the slide-out SUPERSEDES the pending close (the timer\u0027s gen check), so a fast toggle never loses the panel', announces: 'open always wins the race' },
    { posture: 'the 200ms exception', input: 'CLOSE_MS = 200', renders: 'the sheet keeps its own 200ms for entry, exit and the ::backdrop fade — a DECLARED exception to the dialog family\u0027s 120ms law (sheet.css keys --jx-surface-exit-ms: var(--motion-200)). It is also the family\u0027s r18 residue: the slide is a CSS keyframe state machine — the WAAPI kernel dialog adopted has not migrated here yet', announces: 'the last keyframe overlay — pending its kernel migration' },
    { posture: 'the backdrop', input: 'a click outside the panel', renders: 'NOTHING — backdrop click is deliberately not wired (sheet content is often a form; a stray click shouldn\u0027t destroy it). Close via ×, Escape, or your own footer action', announces: 'measured: a backdrop click leaves the sheet open' },
    { posture: 'reduced motion', input: 'prefers-reduced-motion: reduce', renders: 'the state machine double-kills it: the CSS animation: none AND shut() skips the timer — dialog.close() lands instantly, no 200ms wait', announces: 'the panel is simply there, then gone' },
    { posture: 'the interior', input: 'header / children / footer', renders: 'the card kernel\u0027s three bands carry the drawer: the head band (title face + the × on the end-action seat), the CardBody scroll cell under the sheet\u0027s 18px rhythm escape hatch, and the optional foot band — the footer snippet renders RAW, CardFooter\u0027s carved action band is the standard face', announces: 'the sheet owns the mechanism (docking, slide, × scale), never the paint' },
  ];

  // ---- the axes section: per-axis rows + the seams table -------------------
  // The sheet is the self-carried promotion: every resolved lane lands on
  // the <dialog> root itself (rootStyle = carriers + the §3/§7 consumption
  // pairs + --jx-sheet-size), and the top layer carries the scope.
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SELF-CARRIED, RUNG STAMP — the resolved lane lands on the dialog root, which stamps the §4 legacy rung (measured: density=\"small\" → data-density=\"sm\" — today's CSS keys on the rungs); the top layer carries the scope for everything the drawer renders. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SELF-CARRIED — the §11 pair (--jx-size-effective + font-size) lands on the dialog root (measured 18px computed on the size demo); the body cell's own text step is 13px and stays the cell's unless the lane overrides the root. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SELF-CARRIED, ALIAS LADDER — the lane stamps --jx-shape-effective (+ the §14 radius factor) on the root; sheet.css's silhouette rule reads corner-shape: var(--jx-shape-effective, round). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SELF-CARRIED, THE CONCENTRIC ANCHOR — an explicit lane stamps --jx-radius-effective on the top-layered root and the consumed calc paints the silhouette (measured: radius={12} → 12px computed border-radius); 'auto' consumes the broadcast against the panel's OWN ANCESTORS — the declaration site in your tree, not the trigger's. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SELF-CARRIED, SUPPLY INTO THE TOP LAYER — --jx-color-effective lands on the root; the drawer's own chrome is inked popover-foreground (the frame atom) and reads no hue directly, so the lane's work is the scope it supplies to what you render inside. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "SELF-CARRIED, THE BRIDGE — class:dark lands on the dialog root (measured), and because the whole card-dialect interior is DOM-descended from that root, the entire drawer re-voices inside the top layer — bands, separators, ink. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level4' · the family's ONE declared own`,
      description:
        "OWN, level4 — the drawer's historic z-feel (8dp, the dialog rung it docks beside), the only axis with an opinion in SheetDefaults. An explicit lane overrides it (the carried level2 demo measures the swap); the §7 consumption pair stamps the shadow recipe + the paired ladder-rung surface on the root. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLIED, NOT YET READ BY THE SLIDE — the carrier lands on the root, but the r18 keyframe state machine reads --motion-200/--motion-ease-nav directly, not the motion lane (the kernel migration is pending). The lane that DOES bite: prefers-reduced-motion kills the slide entirely (CSS + the instant-close path). Measured in pixels below. Number unit: coefficient.",
    },
  ];

  const axisTokens = [
    { name: '--jx-sheet-size', default: '24rem (width prop)', source: 'component' as const, description: 'The drawer extent along the docked axis — side panels cap at 92vw; top/bottom cap at 85dvh. The §13 rename receipt: the css width is width, never size.' },
    { name: 'the slide keyframes', default: 'sheet.css, unlayered :where', source: 'structural' as const, description: 'The [open]/.closing state machine — per-side translateX/Y ±100% at var(--motion-200); the D1-exempt carve-out that must beat the markup utilities.' },
    { name: '::backdrop', default: 'var(--scrim)', source: 'structural' as const, description: 'The scrim law: semi-transparent black (light) / white (dark), never a brand tint; the closing fade rides the same 200ms.' },
    { name: '.jx-sheet-body-cell', default: 'the rhythm escape hatch', source: 'component' as const, description: 'The sheet\u0027s 18px drawer beat + popover ink over the kernel cell (the former ! utilities, !important semantics preserved in sheet.css).' },
    { name: '.jx-sheet-x svg', default: '14px descendant scale', source: 'component' as const, description: 'The × glyph\u0027s boundary — a static rule utilities never own.' },
    { name: 'data-jx-card host', default: 'card.css imported', source: 'structural' as const, description: 'The sticker host: the interior is the card kernel\u0027s three bands — stamping the host loads the kernel\u0027s rule set (the load-bearing import).' },
  ];

  // ---- the universal props demos (explicit-props W3-D3) --------------------
  const universalUsage = `<!-- the §13 rename: a css WIDTH is 'width'; 'size' is the scale axis -->
<Sheet bind:open title="Filters" side="right" width="24rem">…</Sheet>
<!-- the §7 pair: the drawer's own level4, an explicit lane steps it -->
<Sheet bind:open title="Compact" width="18rem" elevation="level2">…</Sheet>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/sheet-universal.svelte', content: universalUsage },
  ];
  let su = $state(false);
  let su2 = $state(false);
  let su3 = $state(false);
</script>

<svelte:head>
  <title>Sheet · jixoai-ui</title>
  <meta
    name="description"
    content={summary}
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · NativeHTML"
        title="sheet — a dialog that arrives from the side"
        summary={summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">4 sides</span>
          <span class="pill">no backdrop-click close</span>
          <span class="pill">same close path as dialog</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="sheet" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="The side drawer on the dialog laws: a positioning/animation variant of the native <dialog>, not a second state machine — and the interior is the card kernel's."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            sheet takes the platform's modal contract wholesale —
            <code>showModal()</code> supplies the top layer, the inert page
            behind, the focus trap, and Escape (as the cancel event) — and
            changes only where the panel sits and how it arrives: the panel
            docks to an edge (<code>side</code>) full-length and slides in
            along that axis from off-screen. The lifecycle is
            <code>bind:open</code>, the same contract as
            <a class="pill" href="/docs/components/dialog.html">dialog</a>;
            the close path is one generation token so a reopen during the
            slide-out supersedes the pending close. What sheet does NOT do is
            re-decide semantics: backdrop click is deliberately not wired
            (sheet content is often a form), and the footer is yours —
            <code>CardFooter</code>'s carved action band is the standard face.
          </p>
          <p class={cx(rt.measurePara)}>
            The delivery shape is the fleet's self-carried promotion: the §11
            carriers stamp the <code>&lt;dialog&gt;</code> root itself, and
            the UA promotes THAT element to the top layer — the resolved
            axes ride the panel, never the trigger's tree. The interior is
            not sheet's own paint: it is the card kernel's three bands (head
            / body cell / optional foot) under the sheet's 18px rhythm escape
            hatch, with the × riding the kernel's end-action seat. The sheet
            owns the mechanism — edge docking, the slide state machine, the
            × glyph's scale — never the paint.
          </p>
          <p class={cx(rt.measurePara)}>
            Two laws before you compose: the timing is a declared exception —
            the sheet keeps 200ms for entry, exit and the backdrop fade
            (the dialog family's law reads 120ms), and it is the family's
            last CSS-keyframe overlay pending its WAAPI kernel migration;
            and the modal contract is about focus, not scroll — the page
            behind is inert to focus and pointer interaction goes to the
            top layer, but the document's own scroll is not locked for you
            (lock it in your app shell if the drawer's content demands it).
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="sheet-demo" data-reveal="">
      <ComponentCanvas
        title="sheet"
        description="Pick a side in the playground, then open: the panel slides from that edge. Escape or the × closes through the shared fade."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/sheet/sheet.svelte"
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
      >
        <div class={cx(rt.wrapRow16)}>
          <PressButton onclick={() => (open = true)}>Open sheet</PressButton>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="side">
              <PlaySegmented bind:value={side} options={sideOptions} />
            </PlayRow>
            <PlayHelp>
              width sets the panel's extent along its docked axis (CSS length; 24rem default). Footer
              and header are snippet slots; the body scrolls with overscroll containment.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <Sheet bind:open title="Filters" {side}>
      <p class={cx(rt.text13, rt.inkMuted)}>Sheet body — a form, a list, anything. Focus is trapped; Escape and the × close.</p>
      {#snippet footer()}
        <CardFooter>
          <PressButton onclick={() => (open = false)}>Apply</PressButton>
        </CardFooter>
      {/snippet}
    </Sheet>

    <!-- the axes demos render beside the workbench sheet, OUTSIDE the
         canvas: a canvas-host ancestor beats the drawer's width atoms
         (measured: an 18rem sheet stages full-bleed inside the host) —
         the top-layer panels belong to the page, like the workbench's -->
    <Sheet bind:open={su} title="Width demo" side="right"><p class={cx(rt.text13)}>width defaults to the contract own 24rem; the drawer rides its own elevation level4 (8dp).</p></Sheet>
    <Sheet bind:open={su2} title="Compact" side="right" width="18rem" elevation="level2"><p class={cx(rt.text13)}>An explicit width lane and an explicit elevation lane — the §13 rename keeps size free for the scale axis.</p></Sheet>
    <Sheet bind:open={su3} title="Stamps" side="right" density="small" theme="dark" radius={12} size={18}><p class={cx(rt.text13)}>Four lanes on one drawer: the rung (data-density), the dark bridge, the concentric anchor (12px corners), and the root voice (18px).</p></Sheet>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The dialog laws, side-docked"
        summary="The platform owns the modal contract; the sheet owns the mechanism — docking, the slide state machine, the generation-token close — and its 200ms is a declared exception, not a drift."
      >
        <div class={cx(rt.col20)}>
          <PropsTable
            props={lawTable.map((row) => ({
              name: row.posture,
              type: row.input,
              default: row.renders,
              description: `announces: ${row.announces}`,
            }))}
            title=""
          />
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Four docking sides, a width along the docked axis, and the floating-surface paint.">
      <div class={cx(rt.shGrid)}>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>side</p>
          <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>left | right (default) | top | bottom</code> — the panel docks full-length and slides in along its axis.</p>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>width</p>
          <p class={cx(rt.body13)}>CSS length along the docked axis — 24rem default drawer extent; top/bottom panels cap at 85dvh. §13: the prop is <code class={cx(rt.inkAccent)}>width</code> — a css width is never the scale axis.</p>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>variant</p>
          <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>solid | acrylic | auto</code> (default) — the floating-surface paint family, sliding on top of the surface rise.</p>
        </div>
      </div>
    </SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Backdrop click is deliberately not wired — sheet content is often a form; close via ×, Escape, or your own footer action."><CodeBlock code={usage} lang="svelte" meta="Sheet usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native dialog carries the modal contract; title is REQUIRED — it is the dialog's accessible name."><A11yTable keys={[{ key: 'Tab', action: 'Cycles the drawer\u0027s controls — the showModal() modal containment: no control behind the sheet can take focus (Chromium may visit the body for one hop between cycles, then re-enters)' }, { key: 'Escape', action: 'Cancel event, intercepted to share the 200ms animated close — focus restores to the trigger' }, { key: 'Enter / Space', action: 'Activate the focused control (× button, footer actions)' }]} aria={[{ name: 'aria-label', value: 'title (required)', description: 'On the dialog element — the title is the REQUIRED accessible name.' }, { name: 'role', value: 'dialog (native)', description: 'The platform element; focus containment, inert page and top layer are native.' }, { name: 'aria-label', value: '"Close"', description: 'On the × button.' }]} /></SectionCard></div>

    <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight props; the same bind:open lifecycle and close path as dialog.svelte."><PropsTable universal props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state — same contract as dialog.svelte.', bindable: true }, { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'The edge the panel docks to; slides along that edge’s axis.' }, { name: 'title', type: 'string', default: '—', description: 'REQUIRED a11y: the dialog’s name (aria-label target).', required: true }, { name: 'children', type: 'Snippet', default: '—', description: 'Panel body.', required: true }, { name: 'header', type: 'Snippet', default: '—', description: 'Optional header row content beyond the title + ×.' }, { name: 'footer', type: 'Snippet', default: '—', description: 'Optional sticky footer action row.' }, { name: 'width', type: 'string', default: "'24rem' · Own default, not ambient", description: 'Drawer extent along the docked axis (CSS length). §13 RENAME (W3-C): the prop was `size` — a css width is not the scale axis; the freed name belongs to the universal size lane (root font-size).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }]} /></SectionCard></div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on sheet"
        summary="The self-carried promotion: every resolved lane lands on the <dialog> root (carriers + the §3/§7 consumption pairs + --jx-sheet-size), and the top layer carries the scope — the page behind gets nothing. Seven axes are no-own; elevation is the family's ONE declared own (level4)."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="Sheet · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.wrap12)}>
                <PressButton onclick={() => (su = true)}>width 24rem · level4 default</PressButton>
                <PressButton onclick={() => (su2 = true)}>width 18rem · level2</PressButton>
                <PressButton onclick={() => (su3 = true)}>stamps: density · theme · radius · size</PressButton>
              </div>
            </ComponentCanvas>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="sheet" />
    </div>
  </div>
</div>
