<!--
  Docs page for chip (docs-eight-axes-mdn round 1, quill — tier 2).
  The page follows the baseline archetype (skills/mdn-doc-style.md §2):
  hero, install, overview, usage, the primary live canvas (the
  spec-pinned play-state lab), the family demos (anchors / slots / the
  badge-twin law / hue injection), API from the GENERATED meta + docs
  curation (the hand table retired), the eight-axes section (per-axis
  table + grouped demos + one real query() case), accessibility (the
  hit-floor ruling note), see-also. The playground state object, the
  canvas children and the usage assembly stay byte-identical to the
  pre-refactor page (component-canvas-floor.spec.ts pins the chip lab's
  output rows; variant-grammar.spec.ts pins the registry drawer paths).

  Mechanism rows are measurement-first: every axis claim below was
  probed against the SERVED page (SSR carrier stamps + computed
  styles) — radius/color/elevation/motion are supply-only on this
  family (the consuming blocks are keyed to [data-jx-press-button] and
  the theme sheet's slot re-declarations, none of which the chip root
  carries), size/density/theme are consumed. The shape axis is ABSENT:
  the family-local shape prop owns the name (migration-census.md batch
  B; W6-dossier-flagged).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import type { Attachment } from 'svelte/attachments';
  import { pressEffect } from '$lib/ui/press-button';
  import { pulse, rainbow, ripple, shimmer } from '$lib/ui/press-button/press-button.svelte';
  import chipSource from '$lib/ui/chip/chip.svelte?raw';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { playOutputs, playState, PlayFields, PlayRow, PlaySelect, PlayHelp } from '$lib/playground';
  import { registrySourceUrl } from '$lib/registry-source';
  import { query } from '$lib/universal-props-query.svelte';
  import { meta as chipMeta } from '$lib/meta/chip.meta';
  import { CHIP_DOCS } from '$lib/ui/props-table/docs/chip.docs';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
  import { pressEffect } from '@ui/press-button';
  import { shimmer, ripple } from '@ui/press-button/press-button.svelte';
${close}

<!-- the grammar ladder: prominence, never semantic hue -->`;
  const usageTail = `
<Chip variant="fill">deploy</Chip>
<Chip>filters</Chip><!-- tonal default; effect-free plain host -->
<Chip variant="outline">cancel</Chip>
<Chip variant="ghost">dismiss</Chip>

<!-- hue is injected into the global slots, never named as a variant -->
<Chip variant="tonal" class="jx-hue-success">passing</Chip>
<Chip variant="fill" class="jx-pair-destructive">clear</Chip>

<!-- one opt-in effect loop per chip — the component tag (r4: the
     effect prop, its default ripple and the interim record retired;
     pressEffect() self-listens, ink on pointerdown/Enter/Space) -->
<Chip variant="fill" {@attach pressEffect(shimmer())}>upgrade</Chip>
<Chip {@attach pressEffect(ripple({ shape: 'bevel', duration: 800 }))}>filter</Chip>
<Chip>still — a plain chip carries no loop by default</Chip>

<!-- href renders an anchor; hrefs outside "/" open a new tab -->
<Chip variant="outline" href="/docs.html">read the docs</Chip>

<!-- slotStart / slotEnd lanes keep svg at the label scale -->
<Chip shape="pill">
  {#snippet slotStart()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" /></svg>
  {/snippet}
  filters
</Chip>`;
  const usage = `${usageHead}
<Chip variant="tonal">filter</Chip>${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/chip/chip.svelte', content: chipSource },
    { name: 'src/lib/ui/chip-usage.svelte', content: usage },
  ];

  // playground (canvas-floor-lab 2.1): ONE typed state object, page-owned
  // — the kit controls bind into play.current, reset() restores the
  // documented defaults in place, playOutputs() feeds the output lane.
  // The effect select speaks names (r4, 2026-09-10): 'none' leaves the
  // tag unarmed (the plain chip — the undefined arm skips), a name
  // mounts <Chip {@attach pressEffect(builder())}>
  type Variant = 'fill' | 'tonal' | 'outline' | 'ghost';
  type Shape = 'square' | 'pill';
  type EffectName = 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectBuilders = { shimmer, pulse, rainbow, ripple } as const;
  const effectFor = (name: EffectName): Attachment<HTMLElement> | undefined =>
    name === 'none' ? undefined : pressEffect(effectBuilders[name]());
  const play = playState({
    variant: 'tonal' as Variant,
    shape: 'square' as Shape,
    effect: 'none' as EffectName,
  });
  // the anchors demo's toggle chip flips its own label through onclick
  let following = $state(false);
  // kit option maps: the enum controls speak the typed unions directly
  const variantOptions: { value: Variant; label: string }[] = [
    { value: 'fill', label: 'fill' },
    { value: 'tonal', label: 'tonal' },
    { value: 'outline', label: 'outline' },
    { value: 'ghost', label: 'ghost' },
  ];
  const shapeOptions: { value: Shape; label: string }[] = [
    { value: 'square', label: 'square' },
    { value: 'pill', label: 'pill' },
  ];
  const effectOptions: { value: EffectName; label: string }[] = [
    { value: 'none', label: 'none — plain' },
    { value: 'shimmer', label: 'shimmer' },
    { value: 'pulse', label: 'pulse' },
    { value: 'rainbow', label: 'rainbow' },
    { value: 'ripple', label: 'ripple' },
  ];
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  // $derived reads the live state; deriving the expression keeps it
  // reactive instead of capturing effect's initial value
  const effectExpr = $derived(
    play.current.effect === 'none'
      ? ''
      : ` {@attach pressEffect(${play.current.effect}())}`,
  );
  const usageLive = $derived(`${usageHead}
<Chip variant=${q(play.current.variant)} shape=${q(play.current.shape)}${effectExpr}>filter</Chip>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- sweep usage mirrors (canvas-everywhere-demos, 2026-09-08) ----------
  // Hand-authored mirrors of the wrapped demo regions below; the
  // same-source resolveRawCode migration of these strings is the
  // recorded follow-up.
  const chipAnchorsDemo = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';

  let following = $state(false);
${close}

<!-- internal hrefs navigate in place; anything else opens a new tab -->
<Chip variant="outline" href="/docs/components.html">overview</Chip>

<Chip variant="outline" href="https://github.com/jixoai/ui">
  {#snippet slotEnd()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  {/snippet}
  <span>github</span>
</Chip>

<!-- no href: a real button -->
<Chip variant="tonal" onclick={() => (following = !following)}>
  {following ? 'following' : 'follow'}
</Chip>`;

  const chipSlotsDemo = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
${close}

<!-- slotStart: the leading icon lane -->
<Chip shape="pill">
  {#snippet slotStart()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
    </svg>
  {/snippet}
  filters
</Chip>

<!-- both lanes; svg pinned to the label scale -->
<Chip variant="outline" shape="pill">
  {#snippet slotStart()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m12 2 2.4 7.6H22l-6 4.4 2.2 7-6.2-4.6L5.8 21 8 14 2 9.6h7.6L12 2z" />
    </svg>
  {/snippet}
  starred
  {#snippet slotEnd()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  {/snippet}
</Chip>`;

  const chipTwinDemo = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
  import Badge from '@ui/badge/badge.svelte';
${close}

<!-- badge geometry verbatim; the ONLY difference is the activation root -->
<Chip variant="tonal">activation</Chip>
<Badge>display</Badge>`;

  const chipHueDemo = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
${close}

<!-- hue is injected into the global slots, never named as a variant -->
<Chip class="jx-hue-success">passing</Chip>
<Chip class="jx-hue-warning">degraded</Chip>
<Chip class="jx-hue-neutral">metadata</Chip>
<Chip variant="fill" class="jx-pair-destructive">clear</Chip>`;

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

  // ---- the eight-axes canvas (docs-eight-axes-mdn §2.5) -------------------
  // The consumed lanes live (size on the glyphs, the density rungs on the
  // whole box, the dark bridge), the number-lane no-op, one real query()
  // case, and the supply-only pair — the color axis stamps a carrier
  // nothing in the family reads, while the jx-hue-* class next to it
  // paints. The drawer carries the import so the file stays runnable.
  const axesUsage = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
  import { query } from '$lib/universal-props-query.svelte';
${close}

<!-- CONSUMED — size rides the glyph lane; the box stays density-anchored -->
<Chip size={14}>14px glyphs, the default 20px box</Chip>
<Chip size="large">the named step resolves var(--jx-size-large)</Chip>

<!-- CONSUMED — the named rungs re-base the channels the twin reads -->
<Chip density="small">the sm rung: inset 8px, label 11px, height 18px</Chip>
<Chip density={1.5}>a coefficient stamps no rung — nothing recomposes</Chip>

<!-- CONSUMED — dark stamps the .dark class bridge on the root -->
<Chip variant="fill" theme="dark">dark profile</Chip>

<!-- one real query() case: 14px below the 48rem viewport, 16px at md -->
<Chip size={query({ md: 16 }, 14)}>responsive label</Chip>

<!-- SUPPLY-ONLY vs the lane that paints -->
<Chip color="error">the carrier stamps — the paint stays primary</Chip>
<Chip class="jx-hue-error">jx-hue-error injects --jx-tonal — the paint moves</Chip>`;
  const axesFiles: TreeFile[] = [
    { name: 'registry/files/ui/chip/chip.svelte', content: chipSource },
    { name: 'src/lib/ui/chip-axes-usage.svelte', content: axesUsage, kind: 'usage' },
  ];

  // ---- the per-axis table (docs-eight-axes-mdn §2.5) ----------------------
  // What each universal axis drives on THIS family — the carrier/var
  // names are the family's real ones (chip.stylex.ts, chip.css,
  // stampCarriersForLanes in defaults.svelte.ts); steps and units per
  // universal-props.schema.ts; supply states are measured, not assumed:
  // the consuming blocks in press-button.css are keyed to
  // [data-jx-press-button], which the chip root never carries.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: "'auto'",
      description:
        "CONSUMED — on the GLYPHS only. The kernel stamps --jx-size-effective and font-size inline, and the inline stamp outranks the base atom's density-anchored label size (14 → 14px; large → var(--jx-size-large) = 18px). The BOX does not follow: height, insets and the slot svg stay on the density lane (the badge-twin law — measured: a 24px label in the 20px default box). Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: "'auto'",
      description:
        "CONSUMED — the named rungs. The rung stamps data-density and the kernel's scope block re-declares the channels the twin reads ON the root (--jx-inset, --jx-gap, --jx-text-secondary, --jx-line-secondary): inset 8 / 12 / 16px, label 11 / 12 / 13px, height ≈18 / 20 / 23px at sm / default / lg — the whole badge-twin geometry re-bases. small / medium / large alias sm / default / lg; the five legacy spellings stay addressable. A coefficient number stamps --jx-density-coefficient only — no rung attribute matches, nothing recomposes on the chip (the declaring-element law; measured: box unmoved at 1.5). Number unit: coefficient.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: "'auto'",
      description:
        "CONSUMED — one-way. dark stamps the .dark class bridge on the root, and the theme sheet's .dark block re-declares the four grammar slots (--jx-fill, --jx-fill-ink, --jx-tonal, --jx-outline) there — the variant paint re-resolves the dark profile. light and system stamp nothing: they ride tree inheritance, so a light chip inside a dark tree stays dark. No number lane.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: "'auto'",
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective for the concentric consumers (press-button's corner calc, card, tooltip, menubar read the same carrier). The silhouette atoms never read it: square paints the site radius var(--jx-radius), pill paints calc(infinity * 1px). Measured: a stamped 10px carrier under an 8px computed corner. Documented absence on the chip itself. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: "'auto'",
      description:
        "ABSENT — the family-local shape prop ('square' | 'pill', the silhouette corner-law vocabulary) owns the name and 'pill' is outside ShapeLane; not a §13-ruled rename family, so the axis is left out (forwarding ambient) rather than renamed — flagged for the W6 Owner dossier as an open refinement (migration-census.md batch B, LANDED). See the family shape prop in the API table.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: "'auto'",
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective (named → the §12 var indirection; a number → hue degrees through the oklch formula; raw strings pass through, closed at build). No chip css reads it: the variant atoms consume the four grammar slots, and the slot re-derivation from the carrier is keyed to [data-jx-press-button] — the chip root never carries it (measured: an error carrier leaves the primary tint). Hue that paints rides the jx-hue-* / jx-pair-* classes. Number unit: hue degrees.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: "'auto'",
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (the only consumer of elevation on the press side is --jx-elevation-shadow, stamped by the press-button component's own pair — the chip never stamps it). The chip's one shadow is the shared .jx-press rest (var(--shadow-xs)), and ghost nulls it. Measured: the rest shadow unchanged under a stamped level. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: "'auto'",
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The press law's transition chain is 150ms literals with a prefers-reduced-motion kill, and the effect loops freeze the same way — the axis has no chip-local kernel to step. Number unit: coefficient.",
    },
  ];
</script>

<svelte:head>
  <title>Chip · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai chip: the badge's activation twin — badge geometry verbatim, the button/anchor root the only structural difference — riding the four-step ladder (fill / tonal / outline / ghost) consumed as global tokens, slotStart/slotEnd lanes at the label scale, and the component-tag effect attachment."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="chip — the grammar's compact activation"
        summary="What a filter, a toggle, or an inline nav target looks like in this language: the badge's uppercase micro-label at badge scale with an activation root — button or anchor, press physics, the focus law. Paint is the frozen four-rung ladder (fill / tonal / outline / ghost) consumed as global tokens; hue is injected through classes, never named."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">badge twin · inline scale</span>
          <span class="pill">fill · tonal · outline · ghost</span>
          <span class="pill">button or anchor</span>
          <span class="pill">attachment ink</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="chip" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The badge's activation twin: one label, one ladder, two slot lanes, and a root that is a real button or a real anchor."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Chip is the grammar's compact activation — a control that filters, toggles, or
            navigates without leaving the label's size class. The scale law is an Owner ruling
            (2026-09-01, superseding the control-scale hit-lane floor): chip geometry is badge
            geometry verbatim — height from the secondary line, inline insets only, never block
            padding. The ONLY structural difference from a Badge is the activation root: a real
            <code>&lt;button&gt;</code>, or a real <code>&lt;a&gt;</code> when <code>href</code>
            is set, with the shared press physics and the focus law.
          </p>
          <p class={cx(rt.measurePara)}>
            The paint is the variant-grammar ladder consumed as global tokens —
            <code>fill</code> for the one active filter, <code>tonal</code> for the resting set
            (the frozen own default), <code>outline</code> for structure, <code>ghost</code> for
            the quiet seats. Semantic hue is INJECTED into the four grammar slots through the
            <code>jx-hue-*</code> classes, never named as a variant. Effect loops are opt-in
            through the component tag: <code>&#123;@attach pressEffect(ripple())&#125;</code> mounts
            press-point ink from the shared press-button runtime onto the stamped root — a bare
            chip is plain.
          </p>
          <p class={cx(rt.measurePara)}>
            Two snippet lanes (<code>slotStart</code> / <code>slotEnd</code>) carry leading and
            trailing glyphs at the label scale under the data-icon law. The universal axes
            resolve on the same root — three are consumed here (size, density, theme), four are
            supply-only, and the shape axis is deliberately absent: the family's own
            <code>shape</code> prop (<code>'square' | 'pill'</code>) owns the name. The axis
            grammar (named steps, auto, numbers, <code>query()</code>) is documented once on the
            <Link href="/docs/universal-props.html" title="the universal props page">universal props page</Link>.
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
        summary="Import the component, pick the ladder step, inject hue through the classes when the intent is semantic, and arm effects through the component tag."
      >
        <CodeBlock code={usage} lang="svelte" meta="Chip usage" />
      </SectionCard>
    </div>

    <div id="ladder" data-reveal="">
      <ComponentCanvas
        title="chip"
        description="The grammar ladder at badge scale. The top row is the four variants; the second row shows the plain effect-free chip, the bevel-silhouette ripple through the component tag, and the shimmer loop; the bottom instance is driven by the playground."
        sourceUrl={registrySourceUrl('chip')}
        install="chip"
        {files}
        stage="center"
        onreset={() => play.reset()}
        output={playOutputs(play.current)}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(rt.col24, rt.itemsCenter)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>fill</span>
              <Chip variant="fill">deploy</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>tonal</span>
              <Chip variant="tonal">filters</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>outline</span>
              <Chip variant="outline">cancel</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>ghost</span>
              <Chip variant="ghost">dismiss</Chip>
            </label>
          </div>
          <div class={cx(rt.tBorder, rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20, rt.pt20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>plain — zero effect knowledge</span>
              <Chip>filter</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>ripple · bevel</span>
              <Chip {@attach pressEffect(ripple({ shape: 'bevel', duration: 800 }))}>filter</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>shimmer</span>
              <Chip variant="fill" {@attach pressEffect(shimmer())}>upgrade</Chip>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>pill</span>
              <Chip shape="pill">tagged</Chip>
            </label>
          </div>
          <div class={cx(rt.col10, rt.tBorder, rt.itemsCenter, rt.pt20)}>
            <span class={cx(rt.microEyebrow, rt.inkMuted)}>
              driven by the playground
            </span>
            <Chip variant={play.current.variant} shape={play.current.shape} {@attach effectFor(play.current.effect)}>filter</Chip>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="variant">
              <PlaySelect bind:value={play.current.variant} options={variantOptions} />
            </PlayRow>
            <PlayRow label="shape">
              <PlaySelect bind:value={play.current.shape} options={shapeOptions} />
            </PlayRow>
            <PlayRow label="effect">
              <PlaySelect bind:value={play.current.effect} options={effectOptions} />
            </PlayRow>
            <PlayHelp>
              the ladder changes paint only — <code>fill</code> is the solid ground
              + same-hue border, <code>tonal</code> the 12%/45% tint recipe,
              <code>outline</code> the structural border with an 8% hover overlay,
              <code>ghost</code> transparent at rest with the tonal hover. Every
              variant rides the same <code>.jx-press</code> physics and the same
              badge-scale geometry — height from the secondary line.
              the effect select arms the component tag:
              <code>{'{@attach pressEffect(ripple())}'}</code> mounts press-point ink from
              the shared press-button runtime onto the stamped root, <code>none</code> leaves the
              chip plain (the undefined arm — no mount, no loop), and the other builders feed
              the same factory unchanged. Reduced motion freezes the ink;
              the anchored press still answers.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="anchors" data-reveal="">
      <SectionCard
        family="anchors"
        headerRegion="anchors"
        eyebrow="demo"
        title="Button or anchor"
        summary="href switches the root from button to anchor — internal hrefs navigate in place, anything else opens a new tab with noreferrer automatically. A chip without href is a real button: the onclick demo toggles its own label."
      >
        <ComponentCanvas
          title="chip · anchors"
          files={[{ name: 'chip-anchors-demo.svelte', content: chipAnchorsDemo, kind: 'usage' }]}
          stage="center"
        >
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20)}>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>internal → same tab</span>
              <Chip variant="outline" href="/docs/components.html">overview</Chip>
            </div>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>external → new tab</span>
              <Chip
                variant="outline"
                href="https://github.com/jixoai/ui"
              >
                {#snippet slotEnd()}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                {/snippet}
                <span>github</span>
              </Chip>
            </div>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>button → onclick</span>
              <Chip variant="tonal" onclick={() => (following = !following)}>{following ? 'following' : 'follow'}</Chip>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="demo"
        title="slotStart and slotEnd lanes"
        summary="Two optional snippet lanes wrap their content in data-icon spans and pin composed svg to the label scale (var(--jx-text-secondary)) — icons never outgrow the micro-label voice, and spacing comes from the root's half-gap."
      >
        <ComponentCanvas
          title="chip · slots"
          files={[{ name: 'chip-slots-demo.svelte', content: chipSlotsDemo, kind: 'usage' }]}
          stage="center"
        >
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20)}>
          <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
            <span>start lane</span>
            <Chip shape="pill">
              {#snippet slotStart()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
                </svg>
              {/snippet}
              filters
            </Chip>
          </div>
          <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
            <span>both lanes</span>
            <Chip variant="outline" shape="pill">
              {#snippet slotStart()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 2 2.4 7.6H22l-6 4.4 2.2 7-6.2-4.6L5.8 21 8 14 2 9.6h7.6L12 2z" />
                </svg>
              {/snippet}
              starred
              {#snippet slotEnd()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              {/snippet}
            </Chip>
          </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="twin" data-reveal="">
      <SectionCard
        family="twin"
        headerRegion="twin"
        eyebrow="law"
        title="The badge's activation twin"
        summary="Chips ride badge geometry verbatim (Owner ruling, 2026-09-01, superseding the control-scale hit-lane floor): height from the secondary line, inline insets only, never block padding — the ONLY structural difference from a Badge is the activation root."
      >
        <div class={cx(rt.col16)}>
          <ComponentCanvas
            title="chip · badge twin"
            files={[{ name: 'chip-twin-demo.svelte', content: chipTwinDemo, kind: 'usage' }]}
            stage="center"
          >
            <div class={cx(rt.flex, rt.wrap, rt.itemsEnd, rt.justifyCenter, rt.gapX8, rt.gapY20)}>
              <div class={cx(rt.col8, rt.inkMuted, rt.text12)}>
                <Chip variant="tonal">activation</Chip>
                <span>chip · button root + press physics</span>
              </div>
              <div class={cx(rt.col8, rt.inkMuted, rt.text12)}>
                <Badge>display</Badge>
                <span>badge · span, same geometry</span>
              </div>
            </div>
          </ComponentCanvas>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the scale law: badge geometry verbatim — height from
              <code class={cx(rt.inkAccent)}>--jx-line-secondary</code>, inline insets from
              <code class={cx(rt.inkAccent)}>--jx-inset</code>, never block padding; what makes it a
              chip is the activation root, not a bigger box. The hit lane is deliberately NOT a
              chip channel — the pseudo-element lane expansion stays rejected; the real box is
              the target</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>slotStart/slotEnd lanes replace their side's padding (the data-icon
              law): the icon lane carries the edge at half the inset — the same law badge
              practices and the input's edge glyph lanes (clear, steppers) take to zero</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the silhouette vocabulary is the family's own
              <code>shape</code> prop: <code>square</code> keeps the site radius
              (<code>var(--jx-radius)</code> — not sharp corners), <code>pill</code> rounds fully
              (<code>calc(infinity * 1px)</code>)</span></li>
          </ul>
        </div>
      </SectionCard>
    </div>

    <div id="hue" data-reveal="">
      <SectionCard
        family="hue"
        headerRegion="hue"
        eyebrow="theming"
        title="Hue injection and tokens"
        summary="Color is injected, never named: the jx-hue-* / jx-pair-* intent utilities re-point the four grammar slots above a chip and every slot consumer inside retunes. Geometry rides the density channels."
      >
        <div class={cx(rt.col20)}>
          <ComponentCanvas
            title="chip · hue injection"
            files={[{ name: 'chip-hue-demo.svelte', content: chipHueDemo, kind: 'usage' }]}
            stage="center"
          >
            <div class={cx(rt.rowC12, rt.wrap, rt.justifyCenter)}>
              <Chip class="jx-hue-success">passing</Chip>
              <Chip class="jx-hue-warning">degraded</Chip>
              <Chip class="jx-hue-neutral">metadata</Chip>
              <Chip
                variant="fill"
                class="jx-pair-destructive"
              >
                clear
              </Chip>
            </div>
          </ComponentCanvas>
          <TokenTable tokens={[
            { name: '--jx-inset', default: '8 / 12 / 16px at sm / default / lg', source: 'density', description: 'Inline chip padding — a slot lane replaces its side at half.' },
            { name: '--jx-gap', default: 'density scale', source: 'density', description: 'Spacing base — the root gap runs at half.' },
            { name: '--jx-text-secondary', default: '11 / 12 / 13px at sm / default / lg', source: 'density', description: 'Micro-label size; also the composed svg size.' },
            { name: '--jx-line-secondary', default: 'density scale', source: 'density', description: 'Micro-label line height — the badge-twin height source.' },
            { name: '--jx-radius', default: 'the site radius', source: 'structural', description: 'The square silhouette corner — the pill silhouette ignores it (full round).' },
            { name: '--jx-fill', default: 'var(--primary)', source: 'color', description: 'Fill ground + same-hue border (fill variant); re-declared under .dark.' },
            { name: '--jx-fill-ink', default: 'var(--primary-foreground)', source: 'color', description: 'Ink on fill — always injected together with --jx-fill.' },
            { name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/text hue; ghost hover derives from it — inject through the jx-hue-* intent utilities (arbitrary form only outside the closed set).' },
            { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' },
          ]} />
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="props" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="The table renders from the GENERATED meta; the seven axis props split into the shared Universal props section beneath the family rows. shape stays in the family table — it is the silhouette prop, not the axis (it rides the curation's extra lane because the shared split filters its name)."
      >
        <PropsTable meta={chipMeta} docs={CHIP_DOCS} />
      </SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on this component"
        summary="What each axis drives HERE — the carrier names are the family's real vars (chip.stylex.ts, chip.css, stampCarriersForLanes), steps and units per universal-props.schema.ts, every axis defaulting auto. Three are consumed on the chip itself (size on the glyphs, density's named rungs on the whole box, theme's dark bridge); four are supply-only (radius, color, elevation, motion — the consuming blocks are keyed to [data-jx-press-button] and the theme sheet's slot re-declarations, none of which the chip root carries); the shape axis is ABSENT — the family-local silhouette prop owns the name (migration-census.md batch B; W6-dossier-flagged)."
      >
        <div class={cx(rt.col20, rt.wFull)}>
          <PropsTable props={axisRows} title="" />
          <ComponentCanvas
            id="axes"
            title="The consumed lanes, live"
            description="size rides the glyph lane while the box stays density-anchored; the sm rung re-bases the whole twin; the coefficient number recomposes nothing; the dark bridge re-resolves the paint; one real query() case — 14px below the 48rem viewport, 16px at md and wider (resize the window); and the supply-only pair — the color carrier changes nothing while the jx-hue-error class next to it repaints."
            sourceUrl={registrySourceUrl('chip')}
            files={axesFiles}
            stage="fill"
          >
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}>
                <Chip size={14}>size 14 · glyphs 14px</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>size number · glyphs only — the box stays 20px</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip size="large">large · 18px</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>named step · var(--jx-size-large)</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip density="small">density small · the twin</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>sm rung · data-density re-bases the channels</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip density={1.5}>density 1.5 · unmoved</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>coefficient · no rung attribute, box unmoved</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip variant="fill" theme="dark">theme dark · profile</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>.dark bridge · the four grammar slots re-resolve</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip size={query({ md: 16 }, 14)}>responsive label</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>query() · 14px base, 16px at md and wider</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip color="error">color error · still primary</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>supply-only · --jx-color-effective is unread</p>
              </div>
              <div class={cx(rt.panel)}>
                <Chip class="jx-hue-error">jx-hue-error · repaints</Chip>
                <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>the lane that paints · --jx-tonal injected</p>
              </div>
            </div>
          </ComponentCanvas>
        </div>
      </SectionCard>
    </div>

    <div id="accessibility" data-reveal="">
      <SectionCard
        family="accessibility"
        headerRegion="accessibility"
        eyebrow="a11y"
        title="Accessibility"
        summary="Native buttons and anchors retain their platform behavior; the hit target is the real box at badge scale; motion degrades under both reduced-motion and forced-colors."
      >
        <A11yTable
          keys={[{ key: 'Tab', action: 'Move focus to the chip or link' }, { key: 'Enter / Space', action: 'Activate a button chip' }, { key: 'Enter', action: 'Follow an href rendered as an anchor' }]}
          aria={[{ name: 'aria-label', value: 'optional', description: 'Names icon-only or otherwise unlabeled chips.' }, { name: 'data-jx-chip', value: 'variant', description: 'Hook attribute carrying the ladder step for styling and tooling.' }, { name: 'prefers-reduced-motion', value: 'supported', description: 'Kills the press transition and freezes every effect loop; the anchored press still answers.' }, { name: 'forced-colors', value: 'supported', description: 'Explicit system-color degradation; the 2px Highlight focus ring survives.' }]}
        />
        <div class={cx(rt.col16)}>
          <p class={cx(rt.measurePara)}>
            The hit-floor note: the chip deliberately rides badge geometry BELOW the
            control-scale hit lane — roughly 20px tall at default density — by the Owner's
            2026-09-01 scale ruling (the badge twins are activation, not targets that float).
            The activation target is still the whole real box: pseudo-element lane expansion
            stays rejected, so what you see is what you press. Under forced colors the
            color-mix tints drop explicitly (design §6): fill becomes ButtonFace/ButtonText,
            tonal and outline become Canvas/CanvasText, ghost rests transparent and takes
            ButtonFace on hover — and the 2px Highlight focus ring is never removed.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="chip" />
    </div>
  </div>
</div>