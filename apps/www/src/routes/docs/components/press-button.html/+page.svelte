<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import PressButton, { pulse, rainbow, ripple, shimmer, type PressEffect } from '$lib/ui/press-button/press-button.svelte';
  import { pressEffect } from '$lib/ui/press-button/press-effect-runtime';
  import pressButtonSource from '$lib/ui/press-button/press-button.svelte?raw';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { Density } from '$lib/density.svelte';
  import { annotations, meta } from '$lib/meta/press-button.meta';
  import { withAnnotations, type ComponentMeta } from '$lib/schema/ir';
  import { toJSONSchema } from '$lib/schema/lower';
  import { axisLaneOf, axisStepsOf } from '$lib/schema/axis-controls.svelte';
  import type {
    ColorLane,
    DensityLane,
    ElevationLane,
    MotionLane,
    RadiusLane,
    ShapeLane,
    SizeLane,
  } from '$lib/defaults.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the anchors demo + the closing law, in page order. The
  // engine pairs these ids with the SectionCard data-family extents +
  // header data-region leaves rendered below.

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import PressButton, { shimmer, pulse, rainbow, ripple } from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover grows the shadow, active presses -->`;
  const usageTail = `
<PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="ghost">dismiss</PressButton>
<!-- destructive ACTION = fill + the destructive pair (statuses use --jx-error instead) -->
<PressButton variant="fill" class="jx-pair-destructive">delete</PressButton>
<PressButton variant="link">details</PressButton>
<!-- copied is not a variant: the transient success state is tonal + injection -->
<PressButton variant="tonal" class="jx-hue-success">copied</PressButton>

<!-- one opt-in effect loop per button — the typed builders ride the
     attachment factory; the component tag reaches the managed root
     button through the host's rest spread -->
<PressButton variant="fill" {@attach pressEffect(shimmer())}>deploy</PressButton>
<PressButton variant="fill" {@attach pressEffect(pulse({ variant: 'ring' }))}>deploy</PressButton>
<PressButton variant="outline" {@attach pressEffect(rainbow())}>upgrade</PressButton>
<PressButton variant="fill" {@attach pressEffect(ripple({ duration: 800 }))}>deploy</PressButton>

<!-- href renders an anchor; ONLY an absolute http(s) URL opens a new tab -->
<PressButton variant="fill" href="/docs.html">read the docs</PressButton>`;
  const usage = `${usageHead}
<PressButton variant="fill">deploy</PressButton>${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'src/lib/ui/press-button-usage.svelte', content: usage },
  ];

  // schema pipeline (canvas-schema-pipeline, 2026-08-30): the generated
  // meta is the structure source of truth; the effect enum lives
  // PAGE-SIDE (the builders are module functions, not prop values — the
  // enum speaks names, the onvalue seam maps them) and is swapped into
  // the meta before the one lowering. The pane rows, the bound values
  // and the exported schema all come from that same lowering.
  // 4.3: variant rides the same page-side swap — the Props type became
  // the imported PressButtonVariant alias (task 1.2), which the
  // extractor's same-file ceiling honestly reports as an opaque; the
  // ladder's values are page knowledge, the ambient zone state kept
  // verbatim from the regenerated meta.
  type Variant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
  type EffectName = 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectBuilders = {
    none: undefined,
    shimmer: () => shimmer(),
    pulse: () => pulse(),
    rainbow: () => rainbow(),
    ripple: () => ripple(),
  } as const;
  const effectNames: readonly EffectName[] = ['none', 'shimmer', 'pulse', 'rainbow', 'ripple'];
  const variantLadder: readonly Variant[] = ['fill', 'tonal', 'outline', 'ghost', 'link'];
  const metaWithEffect: ComponentMeta = {
    ...meta,
    props: {
      ...meta.props,
      // default: 'fill' (W6-r3): the generated meta leaves variant
      // default-less (ambient zone), so the dock's reset seed DROPPED
      // the key and the driven button's label ({v.variant}) rendered
      // EMPTY after reset — the vision round's empty-white-box
      // blocker. The schema default is what reset restores; the page
      // owns the demo baseline ('fill', the initial bind below), so
      // the two must agree for reset ≈ baseline.
      variant: { kind: 'enum', values: [...variantLadder], default: 'fill', ambient: 'zone' },
      attach: { kind: 'enum', values: [...effectNames], default: 'none' },
    },
  };
  // W4 4.1: the axis props lower as axis-enum/axis-number/query-editor
  // rows now (meta.universal's consumption path) — the flagship dock
  // drives them. THEME is scoped OUT of this page's panel: the
  // stage-preview bindable owns re-theming on canvas demos (the same
  // §13-flavored scoping the component-canvas page applies to its
  // chrome props); the axis itself stays on the component.
  const { theme: _themeAxis, ...panelProps } = metaWithEffect.props;
  const panelMeta: ComponentMeta = { ...metaWithEffect, props: panelProps };
  const schema = toJSONSchema(withAnnotations(panelMeta, annotations));

  // the page owns the initial values (bind:values); reset falls back to
  // the schema defaults (variant 'outline', attach 'none', loading off)
  type CanvasValues = { variant: Variant; attach: EffectName; loading: boolean };
  let canvasValues = $state<Record<string, unknown>>({ variant: 'fill', attach: 'none', loading: false });
  const v = $derived(canvasValues as CanvasValues);

  // the axis lanes (W4): the dock's axis records resolve into lane
  // props on the DRIVEN instance — 'auto'/unset stamps nothing
  const aSize = $derived(axisLaneOf<SizeLane>('size', axisStepsOf(meta, 'size'), canvasValues));
  const aShape = $derived(axisLaneOf<ShapeLane>('shape', axisStepsOf(meta, 'shape'), canvasValues));
  const aRadius = $derived(axisLaneOf<RadiusLane>('radius', axisStepsOf(meta, 'radius'), canvasValues));
  const aDensity = $derived(
    axisLaneOf<DensityLane>('density', axisStepsOf(meta, 'density'), canvasValues),
  );
  const aColor = $derived(axisLaneOf<ColorLane>('color', axisStepsOf(meta, 'color'), canvasValues));
  const aElevation = $derived(
    axisLaneOf<ElevationLane>('elevation', axisStepsOf(meta, 'elevation'), canvasValues),
  );
  const aMotion = $derived(axisLaneOf<MotionLane>('motion', axisStepsOf(meta, 'motion'), canvasValues));

  // the onvalue seam: schema drives the CONTROL, the page owns the
  // VALUE semantics — effect names map to the attachment factory here
  let effectValue: PressEffect | undefined = $state(undefined);
  function onCanvasValue(key: string, value: unknown): void {
    if (key === 'attach') {
      const build = effectBuilders[value as EffectName];
      effectValue = value === 'none' || !build ? undefined : build();
    }
  }

  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`${usageHead}
<PressButton variant=${q(v.variant)}${v.attach === 'none' ? '' : ` {@attach pressEffect(${v.attach}())}`}${v.loading ? ' loading' : ''}>deploy</PressButton>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- the async two-step demo (enhance-picker-feedback, 2026-08-30) ---
  // loading prop in; flash() on settle — the documented ONE idiom
  let deployState = $state<'idle' | 'loading'>('idle');

  // ---- the floor (canvas-floor-lab): page-owned stage state ---------------
  // theme/density are BINDABLES — the page owns them, the canvas only
  // projects data-theme/data-density onto the stage element (the spec's
  // composition-first law). Density speaks the REPO-STANDARD union
  // (xs/sm/default/lg — the dock head's select); defaults = the
  // documented rest pose.
  let stageTheme = $state<'light' | 'dark'>('light');
  let stageDensity = $state<Density>('default');
  let deployEcho = $state('idle — press me');
  let deployBtn: { flash: (ms?: number) => void } | undefined;

  async function deploy(): Promise<void> {
    if (deployState === 'loading') return; // the lock itself, from the host side too
    deployState = 'loading';
    deployEcho = 'loading — presses and Enter/Space are no-ops';
    await new Promise((r) => setTimeout(r, 1400));
    deployState = 'idle';
    deployEcho = 'success flashed ✓ (one-shot, 1.2s), then rest';
    deployBtn?.flash();
  }

  // the href variant: while loading, navigation itself is blocked. The
  // task is driven by the tonal button (an anchor's onclick is not part
  // of the contract — anchors route activation to their href)
  let navLoading = $state(false);
  let navEcho = $state('idle — start the fake task, then try the anchor');
  function navTask(): void {
    if (navLoading) return;
    navLoading = true;
    navEcho = 'loading — the anchor\'s href navigation is blocked';
    setTimeout(() => {
      navLoading = false;
      navEcho = 'rest — the anchor navigates again';
    }, 2500);
  }

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  const pressButtonAsyncDemo = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';

let deployState = $state<'idle' | 'loading'>('idle');
let deployEcho = $state('idle — press me');
let deployBtn: { flash: (ms?: number) => void } | undefined;

async function deploy(): Promise<void> {
  if (deployState === 'loading') return; // the lock itself, from the host side too
  deployState = 'loading';
  deployEcho = 'loading — presses and Enter/Space are no-ops';
  await new Promise((r) => setTimeout(r, 1400));
  deployState = 'idle';
  deployEcho = 'success flashed ✓ (one-shot, 1.2s), then rest';
  deployBtn?.flash();
}

let navLoading = $state(false);
let navEcho = $state('idle — start the fake task, then try the anchor');
function navTask(): void {
  if (navLoading) return;
  navLoading = true;
  navEcho = 'loading — the anchor\\'s href navigation is blocked';
  setTimeout(() => {
    navLoading = false;
    navEcho = 'rest — the anchor navigates again';
  }, 2500);
}
${close}

<div id="async-demo" class="flex flex-wrap items-center gap-x-8 gap-y-5">
  <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
    <span>async deploy</span>
    <PressButton
      bind:this={deployBtn}
      variant="fill"
      loading={deployState === 'loading'}
      onclick={deploy}
    >
      deploy
    </PressButton>
  </div>
  <div id="async-anchor-demo" class="text-muted-foreground flex items-center gap-2.5 text-xs">
    <span>loading anchor</span>
    <PressButton variant="tonal" onclick={navTask}>start fake task</PressButton>
    <PressButton variant="outline" href="/docs/components.html" loading={navLoading}>
      read the docs
    </PressButton>
  </div>
  <span class="text-muted-foreground text-[12.5px]" data-async-echo>{deployEcho}</span>
  <span class="text-muted-foreground text-[12.5px]">{navEcho}</span>
</div>`;

  const pressButtonAsyncFiles: TreeFile[] = [
    { name: 'press-button-async-demo.svelte', content: pressButtonAsyncDemo, kind: 'usage' },
  ];

  const pressButtonTypesDemo = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
  {#each [
    ['fill', 'The one action'],
    ['tonal', 'Supporting seat'],
    ['outline', 'The rest (default)'],
    ['ghost', 'Quiet seat'],
    ['link', 'Inline navigation'],
  ] as item}
    <div class="border border-border/60 p-3">
      <PressButton variant={item[0] as 'fill' | 'tonal' | 'outline' | 'ghost' | 'link'}>{item[1]}</PressButton>
      <p class="mt-2 text-xs text-muted-foreground">{item[0]}</p>
    </div>
  {/each}
</div>
<p class="font-nav mb-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
  semantic injection recipes — hue, not a rung
</p>
<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <div class="border border-border/60 p-3">
    <PressButton
      variant="fill"
      class="jx-pair-destructive"
    >
      delete
    </PressButton>
    <p class="mt-2 text-xs text-muted-foreground">destructive ACTION<br />fill + the destructive pair</p>
  </div>
  <div class="border border-border/60 p-3">
    <PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
    <p class="mt-2 text-xs text-muted-foreground">neutral / meta<br />tonal + muted-foreground</p>
  </div>
  <div class="border border-border/60 p-3">
    <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
    <p class="mt-2 text-xs text-muted-foreground">success status<br />tonal + success</p>
  </div>
  <div class="border border-border/60 p-3">
    <PressButton variant="fill">deploy</PressButton>
    <p class="mt-2 text-xs text-muted-foreground">brand (default hue)<br />fill, no injection</p>
  </div>
</div>`;

  const pressButtonTypesFiles: TreeFile[] = [
    { name: 'press-button-types-demo.svelte', content: pressButtonTypesDemo, kind: 'usage' },
  ];

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
  // ---- the universal props demo (explicit-props W3-B) --------------------
  const universalUsage = `<!-- the eight-axis surface: named steps · auto (inherit) · exact
     numbers · query() for conditional values; auto stamps nothing -->
<PressButton size={14} density="small">px number · sm rung</PressButton>
<PressButton size="large" radius="medium">named steps</PressButton>
<PressButton shape="squircle" radius={10}>squircle ×2</PressButton>
<PressButton radius="auto">concentric auto</PressButton>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/press-button-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 33) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/press-button/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the press geometry rides the kernel channels: min-height, the square pose's width, the voice (--jx-text 13px), inline padding (--jx-inset 12px) and the composed gap. Measured ladder 2xs→lg: hit 24/28/32/40/48px, voice 10/11/12/13/15px, padding 8/8/8/12/16px. THE FLOOR: the 2xs rung puts the button at exactly 24px — the WCAG 2.5.8 target-size minimum. Ambient (attr null, measured) the channels cascade from the ancestor scope; an explicit lane stamps the rung attr and the global scope selector re-scopes in place. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "ROOT ECHO, THE VOICE FOLLOWS — the §11 stamp lands INLINE on the button root, so it outranks the --jx-text atom and the label voice moves with it (measured 18px at size=\"large\" on a large-density seat); hit/width geometry stays the density hit channel. Zero --jx-size-effective readers (grep receipt). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED TWICE — corner-shape reads --jx-shape-effective (measured superellipse(1) ambient, superellipse(2) at squircle) AND the §14 per-shape factor multiplies the radius in the same consumed calc (the ×2 squircle law measured: radius 10 + squircle → 20px). Ambient round with no supplying ancestor resolves the root 0px invariants. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED — THE CONCENTRIC WIRING: auto (the default) reads §3's max(0px, radius-effective − inset-effective) × the §14 factor against the nearest supplying ancestor (measured 6px live on the dock's driven seat: 20px radius − 14px inset); an explicit lane supplies instead AND resets the inset to 0 (measured radius medium → 8px; radius 10 + squircle → 20px with the ×2 factor); a bare button falls to the root sheet's 0px invariants (measured). Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "CONSUMED THROUGH THE SEAM — the family re-declares --jx-fill/--jx-fill-ink/--jx-tonal ON the element from --jx-color-effective (the canvas-bug law: a :root-substituted token would never see an inline carrier), so an explicit hue lane re-tints fill/tonal live; --jx-outline does NOT follow (its historic ground is --border). Call-site hue/pair utilities outrank the axis default (the state-paint law: destructive = fill + jx-pair-destructive, measured black/white). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "SPLIT WITHIN THE LADDER (measured per element under .dark) — the PAINT re-derives: the site's dark scope re-declares the four seam tokens as live chains, so fill re-tints to the drifted dark primary (measured oklch(0.6489 0.237 47) → oklch(0.7044 0.1872 43)) and outline's frame flips to the dark border (white). The outline/ghost LABEL INK stays frozen — tokens['--jx-foreground'] is a defineVars :root literal the dark scope does not re-declare (measured oklch(0 0 0) on both sides). system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED AT REST — a resolved lane's pair re-points --jx-press-shadow (the press law's GROUND); hover/active keep the family's own anchored signatures (the axis steps the ground, the press law stays the physics). Ghost's none-trio and the flat pose outrank it by css source order — quiet rungs never grow a shadow from the axis. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SHEET CONSTANTS, AXIS UNREAD — the press transitions ride the .jx-press law (150ms ease-out on translate/box-shadow/background/border/color, measured) with the prefers-reduced-motion kill; --jx-motion-effective has zero readers in ui/press-button/ (grep receipt). Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive density — a string lane takes both
  // generics; md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (small) applies; at 48rem+ the md case (large)
     wins — 32px hits become 48px, the press law unchanged -->
<PressButton density={query({ md: 'large' }, 'small')}>deploy</PressButton>`;

  const queryFiles: TreeFile[] = [
    { name: 'press-button-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Press button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai press-button component: restrained press law — hover grows the shadow only (the body never moves), active presses the body 1px into the page while the shadow layer stays anchored — in five surfaces (the fill/tonal/outline/ghost ladder plus the link exception) with semantic color injected through tokens, plus four opt-in paint-only effect loops: shimmer, pulse, rainbow, ripple."
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
        title="press-button — one physics, the ladder, four effects"
        summary="The only button in the grammar, and the animation is deliberately quiet: hover never moves the body — the hard shadow alone grows from xs to sm; active presses the body one pixel into the page while the shadow stays exactly where it was. Variants are a prominence ladder, never a color decision: fill for the one action that matters, tonal for the supporting seat, outline for the rest (the default), ghost and link for the quiet seats — link is the grammar's one interaction exception. Semantic color is hue injection through the global tokens: destructive actions fill with the destructive pair, metadata tones down through --jx-tonal, the copied transient is tonal + success. One opt-in effect loop adds attention without breaking the restraint: shimmer (a spark walks the perimeter), pulse (sonar rings breathe outward), rainbow (a gradient flows around the border), ripple (ink expands from the press point) — typed builders with options, all frozen under reduced motion."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">hover: shadow only</span>
          <span class="pill">active: anchored press</span>
          <span class="pill">raised={false}: flat — the press is an inset, the body never moves</span>
          <span class="pill">shimmer · pulse · rainbow · ripple</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (the archetype's install anchor; chrome — out of the toc) -->
    <div id="install" data-reveal="">
      <DocsInstall name="press-button" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="One physics for every surface: the press law is elevation-only, the ladder is prominence, semantic hue injects through tokens, and four opt-in effect loops ride the attachment channel."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The press law is the theme's shared <code class={cx(rt.inkPrimary)}>.jx-press</code> class,
            measured here end to end: rest carries the xs shadow, hover grows it to sm — the body
            never moves — and active translates the body 1px into the page while the shadow's
            offsets counter-shrink 1px, so the shadow paint stays anchored on screen. Ghost's
            none-trio removes all three shadows (the press vector remains, measured 1px with zero
            shadow), the flat pose (raised=false) swaps the active shadow for the engrave-tier
            inset and nulls the move entirely, and every transition is 150ms ease-out with a
            prefers-reduced-motion kill. The variant ladder is prominence, never color: fill for
            the one action, tonal supporting, outline default, ghost quiet, link the interaction
            exception — no frame, no press shadow, hover underline.
          </p>
          <p class={cx(rt.para)}>
            Semantic hue is injection, never a variant: destructive is fill +
            <code class={cx(rt.inkPrimary)}>jx-pair-destructive</code> (fill and ink in one class,
            measured black/white), the copied transient is tonal + success. The family re-declares
            the fill/tonal seams ON the element from the color-effective carrier (the canvas-bug
            law), so an explicit color lane re-tints live and the call-site utilities outrank the
            axis default. The popovertarget prop is the native popover invoker, button-only —
            declared, forwarded, and measured opening and toggling a panel with zero component
            listeners; anchors cannot invoke popovers (the platform's own exclusion).
          </p>
          <p class={cx(rt.para)}>
            The eight axes split by role (all measured in the axes table): density is the hit
            ladder landing on the WCAG 24px floor at 2xs; radius is the full concentric wiring
            (measured 6px live from a 20px-radius, 14px-inset seat); shape multiplies it (the §14
            ×2 squircle law, measured 10 → 20px); color re-tints through the seam; the theme is
            split WITHIN the ladder — paint re-derives under .dark while the outline/ghost label
            ink stays a frozen literal; elevation steps only the rest ground; size echoes on the
            root (the inline stamp outranks the atom, so the label voice follows); motion rides
            the sheet constants. Kinship:
            <code class={cx(rt.inkPrimary)}>button-group</code> (the zone and the join),
            <code class={cx(rt.inkPrimary)}>icon-button</code> (the square idiom's consumer),
            <code class={cx(rt.inkPrimary)}>toggle-group</code> (the pressed state family).
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="press-button"
        description="The press-law button: hover grows the shadow only (xs → sm, the body never moves); active presses the body +1px into the page while the shadow layer stays anchored. The playground rows render from the generated component schema (meta → toJSONSchema); reset returns the schema defaults."
        sourceUrl={registrySourceUrl('press-button')}
        install="press-button"
        {files}
        stage="center"
        bind:theme={stageTheme}
        bind:density={stageDensity}
        {schema}
        bind:values={canvasValues}
        onvalue={onCanvasValue}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(rt.col24, rt.itemsCenter)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>fill</span>
              <PressButton variant="fill">deploy</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>tonal</span>
              <PressButton variant="tonal">invite</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>outline</span>
              <PressButton variant="outline">cancel</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>ghost</span>
              <PressButton variant="ghost">dismiss</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>link</span>
              <PressButton variant="link">details</PressButton>
            </label>
          </div>
          <div class={cx(rt.tBorder, rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20, rt.pt20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>flat · outline</span>
              <PressButton variant="outline" raised={false}>cancel</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>flat · tonal</span>
              <PressButton variant="tonal" raised={false}>invite</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>flat · ghost — press me</span>
              <PressButton variant="ghost" raised={false}>dismiss</PressButton>
            </label>
          </div>
          <div class={cx(rt.tBorder, rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20, rt.pt20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>destructive action</span>
              <PressButton
                variant="fill"
                class="jx-pair-destructive"
              >
                delete
              </PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>neutral tonal</span>
              <PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>success — copied</span>
              <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
            </label>
          </div>
          <div class={cx(rt.tBorder, rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX8, rt.gapY20, rt.pt20)}>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>shimmer</span>
              <PressButton variant="fill" {@attach pressEffect(shimmer())}>deploy</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>pulse · ring</span>
              <PressButton variant="fill" {@attach pressEffect(pulse({ variant: 'ring' }))}>deploy</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>rainbow</span>
              <PressButton variant="outline" {@attach pressEffect(rainbow())}>upgrade</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>rainbow · fill</span>
              <PressButton variant="fill" {@attach pressEffect(rainbow())}>deploy</PressButton>
            </label>
            <label class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>ripple — press me</span>
              <PressButton variant="fill" {@attach pressEffect(ripple({ duration: 800 }))}>deploy</PressButton>
            </label>
          </div>
          <!-- the driven seat is a §3 CONCENTRIC ANCHOR (W6-r3, the
               vision round's squircle AXIS-NOT-VISIBLE fix): it supplies
               radius 20 + the ruler inset 14px exactly like the
               universal-props dogfood card, so the driven button's
               radius=auto computes max(0px, 20−14) = 6px at rest and
               the squircle ×2 factor has a corner to curve (12px
               superellipse) — a bare seat resolves the root 0px
               invariants and every shape flip paints nothing -->
          <div
            class={cx(rt.col10, rt.tBorder, rt.itemsCenter, rt.pt20)}
            style="--jx-radius-effective: 20px; --jx-inset-effective: 0.875rem"
          >
            <span class={cx(rt.microEyebrow, rt.inkMuted)}>
              driven by the playground
            </span>
            <PressButton
              variant={v.variant}
              {@attach effectValue ? pressEffect(effectValue) : undefined}
              loading={v.loading}
              size={aSize}
              shape={aShape}
              radius={aRadius}
              density={aDensity}
              color={aColor}
              elevation={aElevation}
              motion={aMotion}
            >
              {v.variant}
            </PressButton>
          </div>
        </div>
      </ComponentCanvas>
    </div>

    <div id="zone" data-reveal="">
      <SectionCard
        family="zone"
        headerRegion="zone"
        eyebrow="context"
        title="The ambient zone — variant by context"
        summary="A lone button defaults to outline — the frozen own. The SAME button inside a zone scope defaults to the zone's variant with no prop passed anywhere: explicit ?? ambient zone ?? own, left to right, no exceptions. Two doors set the zone: ButtonVariantScope (zero-DOM — free-floating buttons keep their placement) and ButtonGroup (zone plus the hairline join). Dialog's head and foot zones are the canonical consumers: every unprefixed button inside a dialog is ghost, while the page floor stays outline."
      >
        <div class={cx(rt.col20)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gapX8, rt.gapY20)}>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>outside — own default</span>
              <PressButton>cancel</PressButton>
            </div>
            <ButtonVariantScope variant="ghost">
              <div class={cx(rt.rowC10, rt.wrap)}>
                <span class={cx(rt.inkMuted, rt.text12)}>inside the scope</span>
                <PressButton>adopts ghost</PressButton>
                <PressButton>adopts ghost</PressButton>
                <PressButton variant="fill">keeps fill</PressButton>
              </div>
            </ButtonVariantScope>
            <ButtonGroup variant="ghost" label="zone + join">
              <PressButton>joined ghost</PressButton>
              <PressButton variant="fill">keeps fill</PressButton>
            </ButtonGroup>
          </div>
          <CodeBlock
            code={`<!-- the zone changes the DEFAULT, not the paint — link is NOT a
     zone value (the interaction exception keeps its only route
     through the explicit prop); the system story lives in
     /docs/context-defaults.html -->
<ButtonVariantScope variant="ghost">
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonVariantScope>`}
            lang="svelte"
            meta="the zone door — ButtonVariantScope"
          />
          <div class={cx(rt.wrap12)}>
            <a class="pill" href="/docs/components/button-group.html#variant-scope">button-group — the zone's family</a>
            <a class="pill" href="/docs/context-defaults.html">context &amp; defaults — the recipes</a>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="anchors" data-reveal="">
      <SectionCard
        family="anchors"
        headerRegion="anchors"
        eyebrow="demo"
        title="Button or anchor"
        summary="href switches the element from button to anchor. The external law (#5, link.svelte's codified rule): ONLY an absolute http(s) URL is external — app routes and same-document anchors navigate in place; an external href opens a new tab with noreferrer automatically. The label is a snippet, so icons compose inline with the component's own gap."
      >
        <div class={cx(rt.col20)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gapX8, rt.gapY20)}>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>internal → same tab</span>
              <PressButton variant="fill" href="/docs/components.html">overview</PressButton>
            </div>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>external → new tab</span>
              <PressButton variant="outline" href="https://github.com/jixoai/ui">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  class={cx(rt.pbDot13)}
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span>github</span>
              </PressButton>
            </div>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>button → no navigation</span>
              <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="async" data-reveal="">
      <SectionCard
        family="async"
        headerRegion="async"
        eyebrow="demo"
        title="The async two-step"
        summary="loading is an ANCHOR CONTRACT: aria-disabled='true' (the button stays focusable — tab order unchanged, opaque to why it is inert), pointer AND keyboard activation suppressed (Enter/Space no-op), and for href anchors the navigation itself is blocked. The spinner glyph takes the leading lane and the press law holds unchanged — hover grows only the shadow, active still presses +1px. On settle, the one-shot flash() swaps the leading lane to a ✓ check for 1.2s, then the button rests."
      >
        <ComponentCanvas title="press-button · async two-step" stage="fill" files={pressButtonAsyncFiles}>
          <div id="async-demo" class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gapX8, rt.gapY20)}>
            <div class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>async deploy</span>
              <PressButton
                bind:this={deployBtn}
                variant="fill"
                loading={deployState === 'loading'}
                onclick={deploy}
              >
                deploy
              </PressButton>
            </div>
            <div id="async-anchor-demo" class={cx(rt.rowC10, rt.inkMuted, rt.text12)}>
              <span>loading anchor</span>
              <PressButton variant="tonal" onclick={navTask}>start fake task</PressButton>
              <PressButton variant="outline" href="/docs/components.html" loading={navLoading}>
                read the docs
              </PressButton>
            </div>
            <span class={cx(rt.noteSmall)} data-async-echo>{deployEcho}</span>
            <span class={cx(rt.noteSmall)}>{navEcho}</span>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="Why the shadow is the affordance"
        summary="No fills-in-motion, no glows, no ripple. The one-hue grammar expresses state through elevation alone, so the button reads identically in light and dark themes and survives the hue runtime without a second rule."
      >
        <ul class={cx(rt.col8, rt.body13)}>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>variant</code> selects only the ladder rung —
              <code class={cx(rt.inkAccent)}>fill</code>,
              <code class={cx(rt.inkAccent)}>tonal</code>,
              <code class={cx(rt.inkAccent)}>outline</code>,
              <code class={cx(rt.inkAccent)}>ghost</code>, plus
              <code class={cx(rt.inkAccent)}>link</code>, the one interaction exception — the
              press law is the theme's shared <code class={cx(rt.inkAccent)}>.jx-press</code> class, one
              source for every button in the grammar</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>semantic color is hue injection, never a variant: destructive actions carry
              <code class={cx(rt.inkAccent)}>fill</code> +
              <code class={cx(rt.inkAccent)}>jx-pair-destructive</code>
              (the pair utility — fill and ink in one class), metadata softens through
              <code class={cx(rt.inkAccent)}>jx-hue-neutral</code>, and the
              copied transient is <code class={cx(rt.inkAccent)}>tonal</code> +
              <code class={cx(rt.inkAccent)}>jx-hue-success</code></span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the shadow is the body's own <code class={cx(rt.inkAccent)}>box-shadow</code>: hover
              grows it (xs → sm) and nothing else; active slides the body +1px while the shadow's
              offsets counter-shrink 1px (the theme's
              <code class={cx(rt.inkAccent)}>*-press</code> poses) — the shadow's paint never moves on
              screen, no pseudo layer involved</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>effect</code> accepts ONE typed builder exported from
              the component's module script —
              <code class={cx(rt.inkAccent)}>shimmer()</code> (a conic spark walks the perimeter),
              <code class={cx(rt.inkAccent)}>pulse()</code> (sonar rings from the body's silhouette,
              three variants), <code class={cx(rt.inkAccent)}>rainbow()</code> (a gradient flows around
              the border, optional under-glow),
              <code class={cx(rt.inkAccent)}>ripple()</code> (ink circles from the exact press point,
              center on keyboard activation) — every loop takes typed options
              (<code class={cx(rt.inkAccent)}>speed</code>, <code class={cx(rt.inkAccent)}>color</code>,
              <code class={cx(rt.inkAccent)}>distance</code>, …), modeled on the animation-svelte
              reference</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>href</code> switches the element to an anchor; the
              external law is a codified regex — ONLY an absolute http(s) URL opens a new tab (with
              <code class={cx(rt.inkAccent)}>noreferrer</code>): app routes and same-document
              anchors keep the same-tab default, so a <code class={cx(rt.inkAccent)}>#section</code>
              press-button never spawns a tab</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span><code class={cx(rt.inkAccent)}>loading</code> is the async pose with an explicit anchor
              contract: <code class={cx(rt.inkAccent)}>aria-disabled="true"</code> (focusable — tab order
              unchanged), pointer AND keyboard activation suppressed (Enter/Space no-op), and
              <code class={cx(rt.inkAccent)}>href</code> navigation blocked; the spinner glyph takes the
              leading lane and the press law holds unchanged — pair with the one-shot
              <code class={cx(rt.inkAccent)}>flash()</code> helper (bind:this) for the ✓ success flash</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the label is a snippet, so icons compose inline — spacing comes from the
              component's own <code class={cx(rt.inkAccent)}>gap-2.5</code></span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>reduced motion ships inside the <code class={cx(rt.inkAccent)}>.jx-press</code> law:
              <code class={cx(rt.inkAccent)}>prefers-reduced-motion</code> drops every press transition
              to none</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="The variant ladder" summary="Choose the prominence rung first; semantic hue is injected separately through the grammar tokens. Every rung keeps the same hit target and press physics.">
      <ComponentCanvas title="press-button · ladder" stage="fill" files={pressButtonTypesFiles}>
        <div class={cx(rt.pbGrid5)}>
          {#each [
            ['fill', 'The one action'],
            ['tonal', 'Supporting seat'],
            ['outline', 'The rest (default)'],
            ['ghost', 'Quiet seat'],
            ['link', 'Inline navigation'],
          ] as item}
            <div class={cx(rt.panel60P12)}>
              <PressButton variant={item[0] as 'fill' | 'tonal' | 'outline' | 'ghost' | 'link'}>{item[1]}</PressButton>
              <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>{item[0]}</p>
            </div>
          {/each}
        </div>
        <div class={cx(rt.mt24)}>
          <p class={cx(rt.eyebrow, rt.mb16, rt.inkMuted)}>
            semantic injection recipes — hue, not a rung
          </p>
          <div class={cx(rt.pbGrid4)}>
            <div class={cx(rt.panel60P12)}>
              <PressButton
                variant="fill"
                class="jx-pair-destructive"
              >
                delete
              </PressButton>
              <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>destructive ACTION<br />fill + the destructive pair</p>
            </div>
            <div class={cx(rt.panel60P12)}>
              <PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
              <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>neutral / meta<br />tonal + muted-foreground</p>
            </div>
            <div class={cx(rt.panel60P12)}>
              <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
              <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>success status<br />tonal + success</p>
            </div>
            <div class={cx(rt.panel60P12)}>
              <PressButton variant="fill">deploy</PressButton>
              <p class={cx(rt.mt8, rt.text12, rt.inkMuted)}>brand (default hue)<br />fill, no injection</p>
            </div>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Compose a button" summary="Use the semantic variant and add one typed effect only when the action needs extra attention — the full usage file, as the canvas above runs it."><CodeBlock code={usage} lang="svelte" meta="PressButton usage" /></SectionCard></div>
  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Density and tokens" summary="The button reads its geometry from the inherited density scale, so one scope change updates every instance together. The canvas dock's density select (xs / sm / default / lg) is the live proof — it re-scopes only the stage; the DensityDemo four-copy hack is retired by it.">
      <div class={cx(rt.col20)}>
        <p class={cx(rt.bodyMuted)}>
          flip the dock's density select above to <code class={cx(rt.inkAccent)}>sm</code> — the workbench
          canvas re-densifies its own stage (the density scope lands on the stage element only),
          never the docs chrome around it. Both theme seats work the same way. The scope ladder
          below renders the whole rung set, floor included.
        </p>
        <DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}>
          <PressButton variant="fill">deploy</PressButton>
        </DensityDemo>
        <TokenTable tokens={[
          { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Minimum interactive height and width.' },
          { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Inline button padding.' },
          { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Spacing between composed label content.' },
          { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density', description: 'Button label size.' },
          { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density', description: 'Button label line height.' },
          { name: '--jx-press-shadow', default: 'var(--shadow-xs)', source: 'component', description: 'Resting elevation for the press law.' },
          { name: '--jx-press-shadow-hover', default: 'var(--shadow-sm)', source: 'component', description: 'Hover elevation.' },
          { name: '--jx-press-shadow-active', default: 'var(--shadow-sm-press)', source: 'component', description: 'Anchored active pose.' },
        ]} />
      </div>
    </SectionCard>
  </div>



  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="The public contract is intentionally small: semantic paint, optional navigation, and the rest lane every arbitrary attribute — the component-tag attachment included — rides to the root.">
      <PropsTable universal props={[
        { name: 'density', type: "'2xs' | 'xs' | 'sm' | 'default' | 'lg'", default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' },
        { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost' | 'link'", default: "'outline' · ambient zone", description: 'Selects the ladder rung; link is the interaction exception. Omitted → the ambient paint zone (ButtonGroup / variant scope), else the frozen own. Semantic hue injects through --jx-fill/--jx-fill-ink, --jx-tonal, --jx-outline classes at the call site.' },
        { name: '{@attach …} (component tag)', type: 'Attachment<HTMLElement>', default: '—', description: 'The effect mount (r4): <PressButton {@attach pressEffect(builder())}> — shimmer, pulse, rainbow, or ripple builders ride the attachment factory; the tag lands at the stamped root through the rest spread. Leaf elements take {@attach pressEffect(fx)} directly.' },
        { name: '…rest', type: 'HTMLAttributes<HTMLElement>', default: '—', description: 'The rest lane: arbitrary attributes land verbatim on the root (button or anchor) — the same lane the component-tag attachment rides.' },
        { name: 'href', type: 'string', default: '—', description: 'Renders an anchor and navigates to the target.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'The async pose: aria-disabled=true, pointer AND keyboard activation suppressed, href navigation blocked, spinner glyph in the leading lane. Press law holds unchanged. Pair with the one-shot flash() helper (bind:this) on settle.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'The native inert pose: the disabled attribute drops the button from the tab order and suppresses activation; on the anchor form it maps to the loading pose\u2019s contract instead (aria-disabled + blocked navigation) — disabled is not an anchor attribute. The button\u2019s paint rides unchanged: no authored disabled face exists (measured).' },
        { name: 'popovertarget', type: 'string', default: '—', description: 'The native popover invoker association — declared and forwarded on the button form (verified live: click opens and toggles the target panel with zero component listeners); anchors cannot invoke popovers, so the anchor form drops it. Composers set aria-haspopup themselves — it names the panel\u2019s role, not this button\u2019s.' },
        { name: 'external', type: 'boolean', default: 'auto', description: 'Overrides the derived flag. The DEFAULT derives from the href itself (the #5 law): only an absolute http(s) URL is external — app routes and same-document anchors keep the same-tab default. External opens a new tab with noreferrer.' },
        { name: 'onclick', type: '() => void', default: '—', description: 'Runs for button activation.' },
        { name: 'type', type: "'button' | 'submit'", default: "'button'", description: 'Native button type.' },
        { name: 'ariaLabel', type: 'string', default: '—', description: 'Accessible name override for icon-only use.' },
        { name: 'square', type: 'boolean', default: 'false', description: 'Uses the square hit-target geometry.' },
        { name: 'raised', type: 'boolean', default: "'true' · ambient zone", description: 'The physics axis, orthogonal to paint: false is the FLAT texture — no rest/hover shadow, the body never moves, an engrave-tier inset alone creates the press. A zone (ButtonVariantScope, or the joined ButtonGroup — its subtree rides flat while the root carries the one cluster shadow) may scope the default to false; an explicit prop always wins. Inert on link.' },
        { name: 'children', type: 'Snippet', required: true, description: 'Button label and optional inline icon content.' },
      ]} />
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on press-button"
      summary="Density is the hit ladder down to the WCAG 24px floor at 2xs; radius is the full concentric wiring (measured 6px from a 20px/14px seat); shape multiplies it (the §14 ×2 squircle law, measured 10 → 20px); color re-tints fill/tonal live through the on-element seam; the theme splits WITHIN the ladder (paint re-derives under .dark, outline/ghost label ink stays a frozen literal); elevation steps only the rest ground; size echoes and the voice follows; motion rides the sheet constants."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the press ladder (rest xs → hover sm with the body static → active translate
          1px 1px with the offsets counter-shrunk), the ghost none-trio (shadow none at rest AND
          active, the press vector retained), the flat engrave swap (inset + translate none), the
          density ladder (24/28/32/40/48px; the 2xs stamp measured in place and restored), the
          concentric seat (radius-effective 20px − inset 14px → 6px computed), the ×2 squircle
          (radius 10 → 20px, superellipse(2)), the seam re-tint and the .dark split (fill
          oklch(0.6489 47) → oklch(0.7044 43) while the outline ink stayed oklch(0 0 0)), the
          forced-colors trio (link → LinkText; fill → ButtonFace/ButtonText) and the popovertarget
          open/toggle were measured on this page's served DOM (probe, task 33); the unread-axis and
          zero-reader rows carry grep receipts over ui/press-button/. The query() seat below rides
          the md viewport key (48rem) on the consumed density lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="press-button · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <PressButton density={responsiveDensity}>deploy</PressButton>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (small — 32px hit, 12px voice)
                applies; at 48rem and wider the md case wins (large — 48px hit, 15px voice). The
                string lane takes both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="PressButton · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
            <div class={cx(rt.panel)}><PressButton size={14} density="small">size 14 · density small</PressButton></div>
            <div class={cx(rt.panel)}><PressButton size="large" radius="medium" density="large">size large · radius medium</PressButton></div>
            <div class={cx(rt.panel)}><PressButton shape="squircle" radius={10}>shape squircle · radius 10</PressButton></div>
            <div class={cx(rt.panel)}><PressButton radius="auto" color="primary">radius auto (concentric)</PressButton></div>
            <div class={cx(rt.panel)}><PressButton square>+</PressButton></div>
            <div class={cx(rt.panel)}><PressButton raised={false} variant="outline">flat · engraved</PressButton></div>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Keyboard and semantics" summary="Native buttons and anchors keep their platform behavior; the loading pose is the aria-disabled contract (focusable, opaque to why it is inert); every rung carries a forced-colors degradation and the 2px Highlight focus ring; the hit ladder bottoms at the WCAG 24px floor.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Move focus to the button or link — loading keeps the tab stop (aria-disabled, never the disabled attribute)' }, { key: 'Enter / Space', action: 'Activate a button — native buttons synthesize click from both, so the activation lock covers pointer and keyboard at one seam' }, { key: 'Enter', action: 'Follow an href rendered as an anchor; while loading the navigation itself is blocked (preventDefault)' }]}
        aria={[{ name: 'aria-label', value: 'optional', description: 'Names icon-only or otherwise unlabeled controls (the ariaLabel prop or the plain attribute — composed, never clobbered).' }, { name: 'aria-disabled', value: 'true while loading', description: 'The anchor contract: the element stays focusable (tab order unchanged) and opaque to why it is inert, while pointer, keyboard, and href activation are suppressed.' }, { name: 'disabled', value: 'native attribute (button form)', description: 'The native inert pose — dropped from the tab order by the platform; the paint rides unchanged (measured: full fill colors at opacity 1, no authored disabled face).' }, { name: 'popovertarget', value: 'panel id (button form)', description: 'The native invoker association — opens and toggles the popover with zero listeners; anchors cannot invoke popovers. Set aria-haspopup on the composing family.' }, { name: 'forced-colors', value: 'per-rung degradation', description: 'fill → ButtonFace/ButtonText, tonal/outline/ghost → Canvas/CanvasText (link → LinkText — measured), and the focus law pins to a 2px Highlight ring at offset 2, never removed.' }, { name: 'hit target', value: 'the density hit channel', description: '40px at the default rung; the 2xs pro-tool rung lands at exactly the WCAG 2.5.8 24px minimum (measured).' }, { name: 'prefers-reduced-motion', value: 'supported', description: 'Drops the press transitions and effect loops; freezes the loading spinner on its first frame.' }]}
      />
    </SectionCard>
  </div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="press-button" />
  </div>
</div>
