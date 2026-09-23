<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import ScrollArea from '$lib/ui/scroll-area/scroll-area.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { createTocEngine } from '$lib/toc-engine';
  import { deriveTocOutline } from '$lib/toc-outline';
  import { PlayFields, PlayRow, PlaySegmented, PlayNumber, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tocOutlineSource from '$lib/toc-outline.ts?raw';
  import scrollAreaSource from '$lib/ui/scroll-area/scroll-area.svelte?raw';
  import scrollAreaCssSource from '$lib/ui/scroll-area/scroll-area.css?raw';

  const close = '</' + 'script>';

  // ---- canvas playground (the standard opening) — REWORKED 2026-09-15:
  // the scrollbar variant prop retired; the chrome is always hand-drawn ---
  type ScrollOrientationOpt = 'vertical' | 'horizontal';
  const canvasInitial = {
    orientation: 'vertical' as ScrollOrientationOpt,
    pad: 0.75,
  };
  let canvasOrientation = $state(canvasInitial.orientation);
  let canvasPad = $state(canvasInitial.pad);

  function resetScrollAreaCanvas(): void {
    canvasOrientation = canvasInitial.orientation;
    canvasPad = canvasInitial.pad;
  }

  const canvasUsageText = (orientation: ScrollOrientationOpt, pad: number): string =>
    [
      '<ScrollArea',
      '  label="config demo"',
      `  orientation="${orientation}"`,
      `  pad="${pad}rem"`,
      '  class="h-40"',
      '>',
      '  …scrolling content…',
      '</ScrollArea>',
    ].join('\n');

  const canvasUsage = $derived(canvasUsageText(canvasOrientation, canvasPad));

  // stable named resolver: the usage file tracks live playground state
  const resolveScrollAreaUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-area/scroll-area.svelte', content: scrollAreaSource },
    { name: 'registry/files/ui/scroll-area/scroll-area.css', content: scrollAreaCssSource },
    // initial snapshot only — resolveScrollAreaUsage serves the live state
    { name: 'src/lib/ui/scroll-area-usage.svelte', content: canvasUsageText(canvasInitial.orientation, canvasInitial.pad) },
  ];

  // ---- toc-metadata demo: the inner scroller linkage, engine-direct ----
  let metaArea = $state<{ getViewport(): HTMLDivElement | null } | null>(null);
  let metaViewport = $state<HTMLDivElement | null>(null);
  let metaPick = $state('');
  let metaWeights = $state<ReadonlyMap<string, number>>(new Map());

  $effect(() => {
    metaViewport = metaArea?.getViewport() ?? null;
  });

  $effect(() => {
    const vp = metaViewport;
    if (!vp) return;
    const line = () => Math.round(vp.getBoundingClientRect().top) + 8;
    const stop = createTocEngine(
      ({ weights, pick }) => {
        metaWeights = weights;
        metaPick = pick ?? '';
      },
      { scrollRoot: vp, lineOffset: line, extents: () => deriveTocOutline(vp, { levels: [3] }) },
    );
    return stop;
  });

  const metaSections = [
    'deriving the outline',
    'extents, not attributes',
    'the line stays honest',
    'zero boilerplate',
  ];

  // ---- usage snippets ----
  const basicUsage = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<!-- ALWAYS hand-drawn: the capsule thumb on the scrollbar-token law -->
<ScrollArea class="h-72" label="release notes" pad="0.75rem">
  {#each notes as note (note.id)}
    <article>…</article>
  {/each}
</ScrollArea>`;

  const horizontalUsage = `<ScrollArea orientation="horizontal" class="w-full" label="filmstrip">
  <!-- both axes ride the same capsule chrome; RTL mirrors through
       logical geometry -->
</ScrollArea>`;

  const tocUsage = `import { deriveTocOutline, tocOutlineToSections } from '@lib/toc-outline';

// zero handwritten ids: sections + extents derive from the heading tree
const entries = deriveTocOutline(scrollArea.getViewport());
const sections = tocOutlineToSections(entries);

// Toc component, page-level (outline mode):
//   <Toc outline={{ root: '#content' }} scrollRoot={area.getViewport()} />
// engine-direct for arbitrary inner scrollers:
//   createTocEngine(onUpdate, { scrollRoot: viewport, extents: () => entries });`;

  const metaCanvasFiles: TreeFile[] = [
    { name: 'registry/files/lib/toc-outline.ts', content: tocOutlineSource },
  ];

  // the hand-drawn law demo (scroll-capsule section): the capsule chrome
  // over a terminal log
  const scrollCapsuleDemo = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<ScrollArea class="h-56" label="capsule demo">
  <div class="jx-log">
    {#each Array(60) as _, i (i)}
      <p class="jx-log-line">log line {i} — capsule thumb, idle fade, the four pins</p>
    {/each}
  </div>
</ScrollArea>`;

  const scrollCapsuleFiles: TreeFile[] = [
    { name: 'scroll-area-capsule-demo.svelte', content: scrollCapsuleDemo, kind: 'usage' },
  ];

  // the axes pair (types section): vertical against horizontal, the same law
  const scrollAreaTypesDemo = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
${close}

<div class="grid gap-4 min-[760px]:grid-cols-2">
  <div><span>vertical</span><ScrollArea class="h-40" label="vertical sample" pad="0.75rem"><ol>{#each Array(12) as _, i (i)}<li>item {i + 1}</li>{/each}</ol></ScrollArea></div>
  <div><span>horizontal</span><ScrollArea orientation="horizontal" class="h-40 w-full" label="horizontal sample"><ol class="flex gap-2">{#each Array(16) as _, i (i)}<li class="w-36 flex-none">card {i + 1}</li>{/each}</ol></ScrollArea></div>
</div>`;

  const scrollAreaTypesFiles: TreeFile[] = [
    { name: 'scroll-area-types-demo.svelte', content: scrollAreaTypesDemo, kind: 'usage' },
  ];

  // ---- chrome params (Owner r2): the radius × width matrix — three
  // widths (thin/auto/wide lanes) × three radius modes (default 0,
  // configured px, full capsule), every cell live on BOTH axes
  // (orientation="both") so each tier's y and x chrome mount together
  const chromeRadiusModes = [
    { key: 'default', label: '0 (default)', radius: undefined as number | 'full' | undefined },
    { key: 'px', label: '6px', radius: 6 as number | 'full' | undefined },
    { key: 'full', label: 'full (capsule)', radius: 'full' as number | 'full' | undefined },
  ];
  const chromeWidthTiers = ['thin', 'auto', 'wide'] as const;

  const chromeParamsUsage = `<ScrollArea radius={6} width="wide" orientation="both" class="h-36" label="matrix cell">
  <!-- radius: a px number | 'full' | omitted → square-cut (0, the default)
       width:  'thin' 8px | 'auto' 12px (default) | 'wide' 16px lane -->
  …content overflowing both axes…
</ScrollArea>`;

  const chromeParamsFiles: TreeFile[] = [
    { name: 'scroll-area-chrome-params-demo.svelte', content: chromeParamsUsage, kind: 'usage' },
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<ScrollArea size={18} density="small">…</ScrollArea>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/scroll-area-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 38) — the styled chrome paints
  // currentColor under the scrollbar-token law, and every axis is a
  // FORWARDER: the family manufactures no axis opinion of its own. ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "FORWARDER — the rung stamps data-density on the region root (measured data-density=lg explicit; null ambient) for descendants that read the kernel channels; the drawn chrome's width is the width prop's tier table (8/12/16px), not the density ladder. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER, ROOT ECHO — the §11 stamp scales the region root (measured 18px computed at size={18}); the drawn lane is px-tiered and does not follow it. Zero --jx-size-effective readers (grep receipt). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers in ui/scroll-area/ (grep receipt); the chrome corners are the radius prop\u2019s jurisdiction. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE OWNED NAME (the family's one collision ruling) — radius here is the THUMB's chrome param (px or the 'full' capsule via --jx-scroll-thumb-radius; measured 0px square-cut ambient, 6px at radius={6}, calc(infinity * 1px) at 'full' → the engine caps it to a capsule), NOT the region's concentric corner; the axis record deliberately omits the radius slot (W3-D2), and a px number lane double-stamps as the universal radius anchor for descendants (the §13 analogy, census-recorded). Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "FORWARDER — the chrome paints CURRENTCOLOR under the scrollbar-token law, so it follows the region's inherited text color rather than the axis carrier (zero --jx-color-effective readers, grep receipt): re-theme the stage's text color and the chrome re-themes with it (measured). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "FORWARDER WITH A PRECISE EDGE (measured) — dark rides the .dark class bridge, but a bare .dark on the region alone re-declares token VALUES without re-theming the chrome: the thumb paints inherited currentColor, which only moves when the stage actually re-themes text color (the scrollbar-token law — 'dark stages restyle for free' means stages that restyle their text). The kit's resolveThemeScope scope-walk is the NATIVE sibling's scheme observer fuel, not this family's. system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description: 'FORWARDER — carrier stamp only; zero elevation readers (grep receipt); the chrome carries no shadow tier. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED AS A FLOOR, NOT A CHANNEL — prefers-reduced-motion (checked by both the css and the kit's adapter) kills the fade transition and keeps the chrome statically visible — the adapter never even schedules the fade; --jx-motion-effective has zero readers (grep receipt). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key). Lanes
  // take query(); the chrome params (radius/width/pad) are passthroughs.
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import ScrollArea from '@ui/scroll-area.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case
     (18px) wins — the §11 stamp scales the region root -->
<ScrollArea label="sync" size={query({ md: 18 }, 13)} class="h-40">…</ScrollArea>`;

  const queryFiles: TreeFile[] = [
    { name: 'scroll-area-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Scroll area · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scroll-area family, reworked 2026-09-15: the styled component hand-draws its scrollbar ALWAYS (capsule thumb on the scrollbar-token law, idle fade with four testable pins), the native-scroll-area sibling ships the platform path, and both share the scroll-area-kit kernel."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div id="sa-content" class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · scroll-area family"
      title="scroll-area — the scrollable region, always hand-drawn"
      summary="A dedicated scrollable-region component after shadcnui, with the jixoai law: the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior — and the scrollbar is ALWAYS HAND-DRAWN (the 2026-09-15 rework retired the dual-mode scrollbar prop; no mode branch exists, breaking). Capsule thumb on the scrollbar-token law, idle fade with four testable auto-hide pins, hover growth, drag pinning, keyboard affordances on region and thumb. The platform path is its own sibling (native-scroll-area); both share the scroll-area-kit kernel. The windowed-list sibling (scroll-virtual) lives on its own page, and the ToC metadata export lets a table of contents derive itself from your content."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">nativeHTML scrollport</span>
        <span class="pill">hand-drawn capsule, always</span>
        <span class="pill">sibling: native-scroll-area</span>
        <span class="pill">shared: scroll-area-kit</span>
        <span class="pill">auto ToC outline</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="scroll-area" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="What this family adds beyond the platform: the always-hand-drawn capsule — four testable auto-hide pins, a thumb with its own scrollbar contract, and chrome params — over the shared scroll-area-kit core."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The component IS a native scroll container — wheel, touch momentum, keyboard,
          scroll-snap and overscroll chaining stay platform behavior — and the scrollbar is ALWAYS
          HAND-DRAWN: the 2026-09-15 rework retired the dual-mode scrollbar prop entirely (no mode
          branch exists; breaking). What the family ADDS beyond the platform path is the drawn
          chrome and its behavior: a capsule-or-square thumb on the scrollbar-token law
          (currentColor family — themes and dark stages restyle it without a line of JS), the
          ~700ms idle fade with FOUR separately probe-asserted pins (region focus-within, thumb
          focus, active drag, hover — measured: live at 1.1s focused, faded by 1.75s after blur),
          edge-anchored hover growth, drag pinning, a keyboard-draggable thumb, and track-click
          paging. The chrome params are geometry you own: width tiers (thin 8 / auto 12 / wide
          16px) and the radius prop (square-cut 0 by default; px; the 'full' capsule).
        </p>
        <p class={cx(rt.para)}>
          The kit-shaped sharing law applies verbatim: the scroll-area-kit lib item splits by
          concern so the siblings share the CORE (overflow verdict, thumb geometry math, the RTL
          inline-engine funnel, theme-scope resolution — zero paint, zero ARIA) and never each
          other's halves. THIS family consumes the hand-drawn INTERACTION ADAPTER (the pins, the
          fade, the thumb's a11y contract mounted on bare nodes); the native sibling consumes the
          CAPABILITY STYLES and drives its scheme observer from the kit's resolveThemeScope. The
          floors are environmental, not modes: content that fits draws nothing (the none verdict
          gates the chrome — four fitted regions visible on this very page), coarse pointers keep
          the platform's momentum bars, no-JS output shows the platform bar until hydration
          upgrades it, and prefers-reduced-motion keeps the chrome statically visible.
        </p>
        <p class={cx(rt.para)}>
          The eight axes are forwarders (all no-own — the family manufactures no axis opinion):
          the chrome paints currentColor, so color arrives through inheritance rather than a
          carrier; the radius NAME belongs to the thumb's chrome param (the one deliberate
          collision, with the px number lane double-stamping as the universal radius anchor);
          motion arrives as a floor — reduced-motion keeps the chrome statically visible. Measured
          in the axes table below. Kinship:
          <code class={cx(rt.inkPrimary)}>native-scroll-area</code> (the platform path — its own
          registry item),
          <code class={cx(rt.inkPrimary)}>scroll-virtual</code> (the windowed-list sibling),
          <code class={cx(rt.inkPrimary)}>toc-outline</code> (the metadata consumer of
          getViewport()).
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- live demo (the standard opening): live demo + PLAYGROUND -->
  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="scroll-area"
      description="the component IS a native scroll container — wheel, touch momentum, keyboard and scroll-snap stay platform behavior; the chrome is the hand-drawn capsule on the token law."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-area/scroll-area.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetScrollAreaCanvas}
      output={[
        { label: 'orientation', value: canvasOrientation },
      ]}
      resolveFileContent={resolveScrollAreaUsage}
    >
      <div class={cx(rt.col12, rt.wFull, rt.maxWMd)}>
        <ScrollArea
          label="config demo"
          orientation={canvasOrientation}
          pad={`${canvasPad}rem`}
          class={cx(rt.saStage40)}
        >
          <ol class={cx(rt.col8)}>
            {#each Array(12) as _, i (i)}
              <li class={cx(rt.frame40, rt.bgMuted40, rt.px12, rt.py6, rt.text125)}>
                item {i + 1} — scroll me: the capsule fades in, idles out
              </li>
            {/each}
          </ol>
        </ScrollArea>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="orientation">
            <PlaySegmented
              bind:value={canvasOrientation}
              options={[
                { value: 'vertical', label: 'vertical' },
                { value: 'horizontal', label: 'horizontal' },
              ]}
            />
          </PlayRow>
          <PlayRow label="pad">
            <PlayNumber bind:value={canvasPad} />
          </PlayRow>
          <PlayHelp>
            the capsule chrome is always hand-drawn — hover the lane to widen and brighten
            the thumb, drag it (it pins the active tone), Tab to the region or the thumb
            and the idle fade suspends.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="capsule" data-reveal="">
    <SectionCard
      family="scroll-capsule"
      headerRegion="scroll-capsule"
      eyebrow="the hand-drawn law"
      title="capsule — the complete style-control surface"
    >
      <p class={cx(rt.measurePara)}>
        The thumb is a full-radius capsule painted by the scrollbar-token law
        (<code class={cx(rt.inkAccent)}>currentColor</code> family) — themes and dark stages restyle
        it without a line of JS. It auto-hides after ~700ms idle, and FOUR pins suspend the
        fade, each separately probe-asserted: region focus-within, thumb focus, active drag,
        hover. While any pin holds, the thumb stays in the accessibility tree with its
        <code class={cx(rt.inkAccent)}>role="scrollbar"</code> intact and
        <code class={cx(rt.inkAccent)}>aria-valuenow</code> tracking position. Hover widens +
        brightens; drag pins the active tone; the thumb is focusable and keyboard-draggable
        (arrows step, PageUp/PageDown page, Home/End jump); track-click pages. Content that
        fits draws nothing; touch keeps the platform's own momentum bars; reduced motion
        keeps the chrome statically visible.
      </p>
      <ComponentCanvas title="scroll-area · capsule" stage="fill" class={cx(rt.mt16)} files={scrollCapsuleFiles}>
        <ScrollArea class={cx(rt.saStage56)} label="capsule demo">
          <div class="jx-log">
            {#each Array(60) as _, i (i)}
              <p class="jx-log-line">
                <span class={cx(rt.inkMuted)}>[{(i * 137) % 1000}</span> ms] capsule thumb,
                idle fade, four pins — not a single platform scrollbar pixel
              </p>
            {/each}
          </div>
        </ScrollArea>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="chrome-params" data-reveal="">
    <SectionCard
      family="chrome-params"
      headerRegion="chrome-params"
      eyebrow="chrome parameters"
      title="radius × width — the configuration matrix"
    >
      <p class={cx(rt.measurePara)}>
        The chrome's geometry is parameterized (Owner r2): the thumb is
        <strong>square-cut by default</strong> — <code class={cx(rt.inkAccent)}>radius</code> paints any
        px or the retired-to-opt-in <code class={cx(rt.inkAccent)}>'full'</code> capsule — and
        <code class={cx(rt.inkAccent)}>width</code> tiers the lane (<code class={cx(rt.inkAccent)}>thin</code>
        8px · <code class={cx(rt.inkAccent)}>auto</code> 12px · <code class={cx(rt.inkAccent)}>wide</code>
        16px, the thumb resting 6/10/14 — track − 2, the 2px living on the START side — and growing to the full track 8/12/16 under hover/drag). The track runs
        FLUSH to the region edge and the growth is EDGE-ANCHORED: the edge-side flank sits AT the region edge and never moves while
        the thumb widens strictly into the content. Every cell below scrolls on both axes —
        hover a thumb in any tier to feel the anchor.
      </p>
      <ComponentCanvas
        title="scroll-area · radius × width"
        stage="fill"
        class={cx(rt.mt16)}
        files={chromeParamsFiles}
      >
        <div class={cx(rt.col20)}>
          {#each chromeRadiusModes as mode (mode.key)}
            <div class={cx(rt.col8)}>
              <span class={cx(rt.eyebrowPrimary)}>radius {mode.label}</span>
              <div class={cx(rt.saGrid900)}>
                {#each chromeWidthTiers as tier (tier)}
                  <div class={cx(rt.panel60P12, rt.flex, rt.col, rt.gap6)}>
                    <span class={cx(rt.note11)}>width {tier}</span>
                    <ScrollArea
                      orientation="both"
                      width={tier}
                      radius={mode.radius}
                      class={cx(rt.saStage36)}
                      label={`chrome params — radius ${mode.label}, width ${tier}`}
                    >
                      <div class="jx-matrix-doc">
                        <ol class={cx(rt.flex, rt.col, rt.gap6, rt.p4)}>
                          {#each Array(24) as _, i (i)}
                            <li class={cx(rt.frame40, rt.bgMuted40, rt.px8, rt.py4, rt.text11, rt.nowrap)}>
                              {tier} lane · row {i + 1}
                            </li>
                          {/each}
                        </ol>
                      </div>
                    </ScrollArea>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="platform-sibling" data-reveal="">
    <SectionCard
      family="platform-sibling"
      headerRegion="platform-sibling"
      eyebrow="family sibling"
      title="native-scroll-area — the platform path, its own item"
    >
      <p class={cx(rt.measurePara)}>
        The 2026-09-15 rework did NOT split native vs non-native inside one component: the
        platform scrollbar ships as its own registry item under the same token law, with the
        native best practices packaged as capability styles (stable gutter, stage-scoped
        color-scheme, width tiers, overscroll containment) — and NO custom scrollbar ARIA:
        the platform bar IS the accessibility contract there. It lives on
        <a class={cx(rt.inkAccent)} href="/docs/components/native-scroll-area.html">/docs/components/native-scroll-area.html</a>.
      </p>
    </SectionCard>
  </div>

  <div id="the-kit" data-reveal="">
    <SectionCard
      family="the-kit"
      headerRegion="the-kit"
      eyebrow="registry:lib · scroll-area-kit"
      title="scroll-area-kit — one kernel, split by concern"
      summary="The family's shared lib item (the control-chrome precedent): behavior lives in the kit; paint lives in the consumer."
    >
      <p class={cx(rt.measurePara)}>
        THREE parts, so a consumer adopts exactly what it is: <strong>(a) the shared CORE</strong>
        (<code class={cx(rt.inkAccent)}>core.ts</code>) — the overflow verdict (the scroll-run
        verdict's shape, one per axis pair), thumb geometry math, the RTL inline-engine
        funnel, and theme-scope resolution; zero paint, zero ARIA.
        <strong>(b) the HAND-DRAWN INTERACTION ADAPTER</strong>
        (<code class={cx(rt.inkAccent)}>hand-drawn.svelte.ts</code>, consumed ONLY by scroll-area) —
        the idle fade, the four pins, drag pinning, keyboard scrolling, track paging, and the
        thumb's a11y contract mounted on consumer-rendered bare nodes.
        <strong>(c) the NATIVE CAPABILITY STYLES</strong>
        (<code class={cx(rt.inkAccent)}>native-capability.css</code>, consumed ONLY by
        native-scroll-area) — the packaged platform best practices. The siblings share the
        core while touching disjoint kit parts.
      </p>
    </SectionCard>
  </div>

  <div id="virtual-scrolling" data-reveal="">
    <SectionCard
      family="scroll-virtual"
      headerRegion="scroll-virtual"
      eyebrow="family sibling"
      title="scroll-virtual — moved to its own page"
    >
      <p class={cx(rt.measurePara)}>
        The TanStack-backed windowed list is a registry item of its own now — the 100,000-row demo,
        the count playground and the imperative passthroughs live on
        <a class={cx(rt.inkAccent)} href="/docs/components/scroll-virtual.html">/docs/components/scroll-virtual.html</a>.
      </p>
    </SectionCard>
  </div>

  <div id="toc-metadata" data-reveal="">
    <ComponentCanvas
      title="toc metadata export"
      stage="fill"
      description="The scrollable area exports what the ToC needs: the viewport element (scrollRoot), and the outline its content derives — heading-to-heading extents, no data-region markup. The page rail on the right already runs in outline mode; this demo pairs an inner scroller with the engine directly."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/lib/toc-outline.ts"
      files={metaCanvasFiles}
    >
      <div class={cx(rt.saGrid900Side)}>
        <ScrollArea bind:this={metaArea} class={cx(rt.saStage64)} label="toc metadata demo" pad="0.75rem">
          <div class={cx(rt.col24, rt.pe8)}>
            {#each metaSections as section, i (section)}
              <section>
                <!-- h3 keeps clean document order under the h2 section; explicit
                     ids are respected by the derivation (the readout matches).
                     data-doc-demo-heading: the heading IS the demo's data —
                     deriveTocOutline derives from it (lint opt-out) -->
                <h3
                  id="toc-metadata-demo-{i}"
                  data-doc-demo-heading=""
                  class={cx(rt.fontNav, rt.text95)}
                >{section}</h3>
                <p class={cx(rt.noteSmall, rt.mt4, rt.lead6)}>
                  {['deriveTocOutline scans the heading tree, slugs labels, stamps ids back — the ToC links are real fragments.',
                    'extents (heading → next heading) feed toc-engine directly: weights and pick without a single data attribute.',
                    'the line is the viewport\'s own top — inner scrollers have no scaffold header, so the engine gets lineOffset from geometry.',
                    'ScrollArea.getViewport() + toc-outline + toc-engine: the whole linkage, zero handwritten ids.'][i]}
                </p>
                {#each Array(6) as _, j (`${section}-${j}`)}
                  <p class={cx(rt.text12, rt.lead5, rt.inkMuted60)}>depth filler {j + 1} — every section must be able to cross the line</p>
                {/each}
              </section>
            {/each}
          </div>
        </ScrollArea>
        <aside class="jx-meta-rail">
          <p class={cx(rt.note11, rt.fontNav, rt.upper, rt.track14)}>engine readout</p>
          <ol>
            {#each metaSections as section, i (section)}
              {@const id = `toc-metadata-demo-${i}`}
              <li class="jx-meta-item" class:active={metaPick === id} style="--w: {(metaWeights.get(id) ?? 0).toFixed(3)}">
                {section}
              </li>
            {/each}
          </ol>
          <p class={cx(rt.mt8, rt.text11, rt.lead4, rt.inkMuted70)}>
            pick: <code class={cx(rt.inkAccent)}>{metaPick || '—'}</code>
          </p>
        </aside>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            this canvas is the engine dogfood: the demo document's headings are FUNCTIONAL
            DATA — deriveTocOutline derives the outline from them, so they are marked
            <code>data-doc-demo-heading</code> rather than demoted to styled text. Scroll the
            inner area: weights and the line pick update from the inner scroller's geometry.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Material3 sections: inside #sa-content so the outline-mode rail
       derives their entries from the h2 tree. -->
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One hand-drawn law over both axes; three orientation modes."><ComponentCanvas title="scroll-area · axes" stage="fill" files={scrollAreaTypesFiles}><div class={cx(rt.grid760b)}>
      <div class={cx(rt.col12, rt.panel)}><span class={cx(rt.eyebrowPrimary)}>vertical (default)</span><ScrollArea class={cx(rt.saStage40)} label="vertical sample" pad="0.75rem"><ol class={cx(rt.col8)}>{#each Array(12) as _, i (i)}<li class={cx(rt.frame40, rt.bgMuted40, rt.px12, rt.py6, rt.text125)}>item {i + 1}</li>{/each}</ol></ScrollArea></div>
      <div class={cx(rt.col12, rt.panel)}><span class={cx(rt.eyebrowPrimary)}>horizontal</span><ScrollArea orientation="horizontal" class={cx(rt.saStage40, rt.wFull)} label="horizontal sample"><ol class={cx(rt.row8)}>{#each Array(16) as _, i (i)}<li class={cx(rt.frame40, rt.bgMuted40, rt.w36, rt.flexNone, rt.px12, rt.py6, rt.text125)}>card {i + 1}</li>{/each}</ol></ScrollArea></div>
    </div></ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a height, a label, and pad for the thumb lane; the rest is a native scroll container."><div class={cx(rt.col16)}><CodeBlock code={basicUsage} lang="svelte" meta="basic" /><CodeBlock code={horizontalUsage} lang="svelte" meta="horizontal" /><CodeBlock code={tocUsage} lang="ts" meta="toc-outline" /></div></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The capsule look rides the scrollbar-token law: currentColor family, no JS."><div class={cx(rt.col24)}><DensityDemo><ScrollArea class={cx(rt.saStage36)} label="density sample" pad="0.75rem"><ol class={cx(rt.col8)}>{#each Array(10) as _, i (i)}<li class={cx(rt.frame40, rt.bgMuted40, rt.px12, rt.py6, rt.text125)}>item {i + 1}</li>{/each}</ol></ScrollArea></DensityDemo><TokenTable tokens={[{ name: '--scrollbar-thumb / -hover / -active', default: 'currentColor steps', source: 'component', description: 'The token law the capsule paints with — dark stages restyle for free' }, { name: '--jx-scroll-thumb-radius', default: '0px (square-cut)', source: 'component', description: 'The thumb\'s corner radius — set by the radius prop (px or the \'full\' capsule); 0 by default' }, { name: '--jx-scroll-track-w', default: '12px (width tiers: 8/12/16)', source: 'component', description: 'The drawn lane\'s size — the width prop\'s tier table (thumb rides at track − 2×2px resting, growing +2px inward on hover/drag)' }, { name: '--jx-scroll-pad', default: 'pad prop', source: 'component', description: 'The ring padding keeping content clear of the thumb lane' }] } /></div></SectionCard></div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ScrollArea Props interface (the scrollbar variant prop retired with the dual-mode era); getViewport()/scrollTo() are the imperative exports."><PropsTable universal props={[{ name: 'orientation', type: "'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'Which axes scroll: overflow-y/x mapping.' }, { name: 'label', type: 'string', default: "'scrollable content'", description: 'a11y name for the region.' }, { name: 'pad', type: 'string', default: '0', description: 'Ring padding (CSS length), inline-axis — keeps content clear of the thumb lane.' }, { name: 'radius', type: "number | 'full'", default: '—', description: 'Thumb corner radius: a px number or the \'full\' capsule. Omitted → 0 (square-cut, the r2 default — the hard capsule retired).' }, { name: 'width', type: "'auto' | 'thin' | 'wide'", default: "'auto'", description: 'The chrome width tier sizing the drawn lane (8/12/16px; thumb resting 6/10/14 = track − 2 with the edge side AT the region edge, hover/drag 8/12/16 = the track). \'none\' is native-only vocabulary.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }, { name: 'style', type: 'string', default: '—', description: 'Style passthrough.' }, { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'Scroll callback from the viewport.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The scrolling content.', required: true }, { name: 'getViewport()', type: '() => HTMLDivElement | null', default: 'export', description: 'The scrollport element — Toc scrollRoot / engine-direct linkage.' }]} /></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on scroll-area"
      summary="The styled sibling is a FORWARDER family: all eight axes no-own, carriers stamped for descendants, zero axis-carrier readers in the family (grep receipts). The one deliberate collision is radius — the chrome param owns the name for the THUMB (square-cut 0 default; the 'full' capsule via calc(infinity * 1px)) — and the chrome paints currentColor, so the theme story is inheritance-precise: a bare .dark class re-declares token values but only a stage that re-themes TEXT color re-themes the chrome. Motion arrives as a floor: reduced-motion keeps the chrome statically visible."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the thumb contract digit-exact (aria-valuenow 50 at mid-travel; thumb/track
          height ratio 0.333 == the kit's client/scroll fraction; position 0.50 == authored), the
          four pins' timeline (data-thumb-live on at 1.1s focused; removed by 1.75s after blur;
          track opacity 1 → 0), the width tiers (8/12/16px computed), the radius ladder (0px
          square-cut ambient; 6px; 'full' → calc(infinity * 1px), engine-capped to a capsule), the
          verdict vocabulary (data-verdict-y none/start-closed/open across this page's regions;
          fitted regions drawing no chrome at all) and the currentColor theme edge (a bare .dark
          on the region changes nothing — the chrome moves when the stage re-themes text color)
          were measured on this page's served DOM (probe, task 38); the zero-reader rows carry
          grep receipts over ui/scroll-area/ + scroll-area-kit/. The query() seat below rides the
          md viewport key (48rem) on the size lane — the chrome params (radius/width/pad) are
          passthroughs and reject query(). The concentric chain stays in the family: radius=20 on
          the region anchors descendants (the auto Card computing max(0px, 20px − 0.875rem)).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="scroll-area · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <ScrollArea label="sync" size={responsiveSize} class={cx(rt.saStage40)}>
                <ol class={cx(rt.col8)}>
                  {#each Array(12) as _, i (i)}
                    <li class={cx(rt.frame40, rt.bgMuted40, rt.px12, rt.py6, rt.text125)}>item {i + 1}</li>
                  {/each}
                </ol>
              </ScrollArea>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the §11 stamp scales the region root and the
                content inherits it. The number lane goes bare. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="ScrollArea · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.panel)}><ScrollArea label="axes" size={18} density="small" style="height: 8rem"><p>line one</p><p>line two</p><p>line three</p><p>line four</p></ScrollArea></div>
            <div class={cx(rt.panel)}><ScrollArea label="named steps" size="medium" style="height: 8rem"><p>medium via the alias ladder</p><p>the thumb-corner radius prop keeps its own name</p></ScrollArea></div>
            <div class={cx(rt.panel)}><ScrollArea label="the concentric chain" radius={20} style="height: 8rem"><Card radius="auto"><p style="padding: .5rem">radius 20 on the region; the auto card computes max(0px, 20px − 0.875rem)</p></Card></ScrollArea></div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The WAI scrollable-region pattern, PLUS the thumb's own scrollbar contract — mounted by the kit's adapter."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the scrollable area (the region, then the thumb)' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling once the region is focused' }, { key: 'arrows / PgUp / PgDn / Home / End on the thumb', action: 'Keyboard-drag the thumb itself — steps, pages, jumps (role=scrollbar contract)' }, { key: 'pointer drag / track click', action: 'The thumb drags with pointer capture; a track click pages toward the click' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "scrollable content")' }, { name: 'role', value: 'region', description: 'Plus tabindex=0 — the WAI scrollable-region pattern' }, { name: 'role (thumb)', value: 'scrollbar', description: 'The thumb\'s contract: aria-controls → the viewport, aria-valuenow tracking 0..100, aria-orientation, focusable, keyboard-draggable' }, { name: 'the four pins', value: 'focus-within / thumb focus / drag / hover', description: 'Each suspends the idle fade; while any pin holds the thumb stays in the accessibility tree ("AT-engaged" is not a detectable platform state and is deliberately not a pin)' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard family="see-also" headerRegion="see-also" eyebrow="see-also" title="See also" summary="The scroll-area family map — the styled sibling, the platform path, and the windowed list.">
      <div class={cx(rt.wrap12)}>
        <span class="pill">scroll-area — the hand-drawn path (this page)</span>
        <a class="pill" href="/docs/components/native-scroll-area.html">native-scroll-area — the platform path</a>
        <a class="pill" href="/docs/components/scroll-virtual.html">scroll-virtual — the windowed list</a>
      </div>
      <DocsSeeAlso name="scroll-area" />
    </SectionCard>
  </div>
  </div>
</div>

<style>
  .jx-log {
    font-size: 12px;
    line-height: 1.7;
    padding: 0.75rem;
  }
  .jx-log-line {
    margin: 0;
    white-space: nowrap;
  }
  /* the matrix cell's content: fixed box overflowing BOTH axes inside
     the h-36 cell — both tiers' chrome mount together */
  .jx-matrix-doc {
    block-size: 420px;
    inline-size: 400px;
  }
  .jx-meta-rail {
    align-self: start;
    border: 1px solid var(--border);
    padding: 0.6rem;
    position: sticky;
    top: 0.5rem;
  }
  .jx-meta-item {
    border-inline-start: 2px solid
      color-mix(in oklab, var(--primary) calc(var(--w, 0) * 100%), transparent);
    color: var(--muted-foreground);
    font-size: 12px;
    list-style: none;
    padding: 0.25rem 0 0.25rem 0.5rem;
  }
  .jx-meta-item.active {
    color: var(--foreground);
  }
</style>
