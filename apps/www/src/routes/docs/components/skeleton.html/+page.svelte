<!--
  skeleton page (docs-eight-axes-mdn task 32, MDN archetype; tier 2
  优化重构 — the workbench, composition shells, types cells and the api
  rows carried; the archetype gains install/overview/law/axes/see-also +
  a ToC; theming folded into axes. Family untouched — a zero-vocabulary
  scenery block: the W3-D5 carriers JOIN the consumer style channel and
  geometry stays the consumer's.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import skeletonSource from '$lib/ui/skeleton/skeleton.svelte?raw';

  const summary =
    'A muted block with a terminal brightness pulse. Pure CSS, zero JS, aria-hidden by design: each placeholder is scenery. The loading contract — aria-busy on the container, or a visually-hidden live region — belongs to the region being loaded, never to each block.';

  const usage = `<!-- geometry is the consumer's; the block is bare -->
<Skeleton class="h-4 w-2/3" />

<!-- a loading card, the common shape -->
<div class="flex items-center gap-3" aria-busy="true">
  <Skeleton class="size-10" />
  <div class="flex flex-col gap-2">
    <Skeleton class="h-3 w-32" />
    <Skeleton class="h-3 w-20" />
  </div>
</div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/skeleton/skeleton.svelte', content: skeletonSource },
    { name: 'src/lib/ui/skeleton-usage.svelte', content: usage },
  ];

  // canvas-everywhere: the composition shells demo source
  const close = '</' + 'script>';

  const skeletonShellsDemo = `<script lang="ts">
  import Skeleton from '@ui/skeleton.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-3">
  <div class="border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">card shell</span>
    <div class="mt-3 flex flex-col gap-3" aria-busy="true">
      <Skeleton class="h-28 w-full" />
      <div class="flex items-center gap-3">
        <Skeleton class="size-8" />
        <div class="flex flex-1 flex-col gap-2">
          <Skeleton class="h-3 w-2/3" />
          <Skeleton class="h-3 w-1/3" />
        </div>
      </div>
    </div>
  </div>
  <div class="border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">list shell</span>
    <div class="mt-3 flex flex-col gap-3" aria-busy="true">
      {#each [64, 92, 78, 85] as w (w)}
        <div class="flex items-center gap-3">
          <Skeleton class="size-6" />
          <Skeleton class="h-3" style="width: {w}%" />
        </div>
      {/each}
    </div>
  </div>
  <div class="border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">table shell</span>
    <div class="mt-3 flex flex-col gap-2" aria-busy="true">
      <div class="grid grid-cols-3 gap-2">
        <Skeleton class="h-3" />
        <Skeleton class="h-3" />
        <Skeleton class="h-3" />
      </div>
      {#each [0, 1, 2] as row (row)}
        <div class="grid grid-cols-3 gap-2 border-t border-border/60 pt-2">
          <Skeleton class="h-3 w-4/5" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-2/3" />
        </div>
      {/each}
    </div>
  </div>
</div>`;

  const skeletonShellsFiles: TreeFile[] = [
    { name: 'skeleton-shells-demo.svelte', content: skeletonShellsDemo, kind: 'usage' },
  ];

  const skeletonTypesDemo = `<script lang="ts">
  import Skeleton from '@ui/skeleton.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex min-w-52 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">avatar block</span>
    <Skeleton class="size-10" />
    <span class="text-muted-foreground text-[12.5px]">class="size-10"</span>
  </div>
  <div class="flex min-w-52 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">text lanes</span>
    <div class="flex flex-col gap-2">
      <Skeleton class="h-3 w-32" />
      <Skeleton class="h-3 w-20" />
    </div>
    <span class="text-muted-foreground text-[12.5px]">class="h-3 w-32" and friends</span>
  </div>
  <div class="flex min-w-52 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">full-bleed card</span>
    <div class="flex flex-col gap-2">
      <Skeleton class="h-3 w-full" />
      <Skeleton class="h-3 w-3/4" />
    </div>
    <span class="text-muted-foreground text-[12.5px]">width/aspect from the parent layout</span>
  </div>
</div>`;

  const skeletonTypesFiles: TreeFile[] = [
    { name: 'skeleton-types-demo.svelte', content: skeletonTypesDemo, kind: 'usage' },
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

  // ---- the law table: the scenery contract --------------------------------
  const lawTable = [
    { posture: 'the scenery split', input: 'aria-hidden', renders: 'every block is decoration — aria-hidden lands AFTER the rest spread so a consumer\u0027s id/data-* pass through untouched while the block itself never announces. The loading STATE is semantics: aria-busy on your container, or one visually-hidden live region', announces: 'the block is never announced; the container carries the contract' },
    { posture: 'the geometry', input: 'class · parent layout', renders: 'the element is a bare block — no length API exists. Width, height and aspect come from your classes or the parent grid; the axis surface never manufactures a box', announces: 'geometry is yours, full stop' },
    { posture: 'the pulse', input: 'jx-skeleton-pulse', renders: 'a brightness oscillation (opacity 1 → 0.45 → 1, 1.4s ease-in-out, infinite) — not a shimmer sweep. Keyframes + the animation live in skeleton.css (D1-exempt: media-touched property), whose literals have no ladder step (reported MISSING --motion-1400/--motion-ease-in-out for serial promotion)', announces: 'measured in pixels below' },
    { posture: 'the freeze', input: 'prefers-reduced-motion: reduce', renders: 'the unlayered kill sets animation: none — the block becomes a static muted surface. The kill rides the media query, untouched by the motion lane: scenery has no choreography to dial', announces: 'reduced motion is a still frame' },
    { posture: 'the merge law', input: 'carriers · your style', renders: 'the W3-D5 carriers JOIN the consumer style attribute (one style channel, no fight): an explicit lane stamps --jx-*-effective alongside your own declarations — measured below', announces: 'the block stamps and supplies; it never repaints you' },
    { posture: 'the paint', input: 'two atoms', renders: 'a muted ground (--jx-muted) and an inset hairline ring (box-shadow inset var(--hairline) var(--border)) — the entire visual vocabulary. Mirror law: the atom table is byte-identical in registry and app trees', announces: 'the placeholder, nothing more' },
  ];

  // ---- the axes section: per-axis rows + the seams table -------------------
  // The zero-vocabulary family: all eight slots no-own (W3-D5 FIRST-TIME
  // wiring), carriers join the style channel, geometry stays the consumer's.
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, RUNG — the resolved lane stamps the §4 legacy rung on the block (measured: density=\"small\" → data-density=\"sm\"); the block itself reads no channel — the stamp is the SCOPE for what you nest inside. The declared-open channel with no family opinion. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, VOICE — the §11 pair (--jx-size-effective + font-size) lands on the root (measured 18px computed on the size demo) but NEVER manufactures width/height: the box stays exactly your classes' geometry (measured unchanged). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY — the alias + §14 radius factor land on the root for what you nest; the bare block paints no corner of its own (the hairline ring follows your radius lane if you supply one). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY — an explicit lane stamps --jx-radius-effective on the root (measured 12px on the stamps demo); the block has no border-radius declaration of its own, so the lane's work is the scope it supplies. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY — --jx-color-effective lands on the root; the placeholder's ground is --jx-muted (the typed token), hue-neutral by contract: a loading mirror takes the context's paint, not a brand voice. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "BRIDGE — class:dark lands on the root (measured) and the muted ground re-voices through the token; scenery follows the region it loads for. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY — the §7 consumption pair stamps on the root; the block owns no shadow (the hairline ring is inset, not lifted). A loading mirror sits IN the plane it stands in for. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLIED, NOT READ BY THE PULSE — the carrier lands on the root, but the pulse is a fixed 1.4s keyframe in the family css and the reduced-motion kill rides the media query untouched by the lane (both measured below). The one motion that matters is the USER's, not the prop's. Number unit: coefficient.",
    },
  ];

  const axisTokens = [
    { name: '--jx-muted', default: 'the ground', source: 'color' as const, description: 'The typed muted token — the block\u0027s entire fill.' },
    { name: 'the hairline ring', default: 'inset box-shadow', source: 'component' as const, description: 'box-shadow: inset 0 0 0 var(--hairline) var(--border) — the box law, a var-chain (no literal length fragment).' },
    { name: 'jx-skeleton-pulse', default: '1.4s ease-in-out infinite', source: 'component' as const, description: 'The brightness keyframes in skeleton.css (D1-exempt residue); motion literals reported MISSING --motion-1400/--motion-ease-in-out for serial promotion.' },
    { name: 'the reduced-motion kill', default: 'unlayered :where', source: 'structural' as const, description: 'animation: none under prefers-reduced-motion — the state-machine carve-out that must beat the animation declaration.' },
    { name: 'data-jx hooks', default: 'NONE', source: 'component' as const, description: 'The family ships no hooks — aria-hidden and your rest attributes are the whole contract surface.' },
  ];

  // ---- the universal props demos (explicit-props W3-D5) --------------------
  const universalUsage = `<Skeleton class="h-4 w-2/3" size={18} />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/universal-props-demo.svelte', content: universalUsage },
  ];
</script>

<svelte:head>
  <title>Skeleton · jixoai-ui</title>
  <meta name="description" content={summary} />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · NativeHTML"
        title="skeleton — the placeholder, nothing more"
        summary={summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">pure CSS</span>
          <span class="pill">aria-hidden scenery</span>
          <span class="pill">reduced-motion freeze</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="skeleton" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A muted block with a terminal brightness pulse — the loading mirror of your real layout. The component is deliberately nothing: no lengths, no choreography API, no announcements. Geometry is your classes, the loading state is your container's semantics, and the surface is two atoms deep."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            skeleton is the async-feedback pair's quiet half: while a
            <a class="pill" href="/docs/components/press-button.html">press-button</a>
            holds its loading pose or a promise toast says pending, the region
            under load shows a muted, pulsing mirror of the layout that is
            coming. The block itself is a bare div — pure CSS, zero JS — with
            an inset hairline ring over a muted ground and a brightness
            oscillation (opacity 1 → 0.45, 1.4s, ease-in-out). It is
            <code>aria-hidden</code> by contract: a placeholder is scenery,
            and scenery never announces.
          </p>
          <p class={cx(rt.measurePara)}>
            The eight-axis surface is wired (W3-D5, first-time on this
            family) but the family owns nothing: every slot is no-own, an
            explicit lane stamps the §10 carriers onto the block's style
            attribute — JOINED with your own style declarations, the merge
            law — and the scope flows to what you nest. Two laws hold the
            line: the axis surface never manufactures geometry (width,
            height and aspect stay your classes'), and the pulse answers to
            the user's reduced-motion preference, not to a prop. The loading
            STATE lives on your container: <code>aria-busy="true"</code>,
            or one visually-hidden live region announcing politely once.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="skeleton-demo" data-reveal="">
      <ComponentCanvas
        title="skeleton"
        stage="center"
        description="A loading card in the common shape — avatar block, two text lanes. The pulse is a brightness oscillation, not a shimmer sweep."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/skeleton/skeleton.svelte"
        files={canvasFiles}
      >
        <div class={cx(rt.col16, rt.wFull, rt.skMaxWsm)} aria-busy="true">
          <div class={cx(rt.rowC12)}>
            <Skeleton class={cx(rt.skSize10)} />
            <div class={cx(rt.col8)}>
              <Skeleton class={cx(rt.skBar, rt.skW32)} />
              <Skeleton class={cx(rt.skBar, rt.skW20)} />
            </div>
          </div>
          <Separator />
          <div class={cx(rt.col8)}>
            <Skeleton class={cx(rt.skBar, rt.wFull)} />
            <Skeleton class={cx(rt.skBar, rt.skW1112)} />
            <Skeleton class={cx(rt.skBar, rt.skW34)} />
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the stage carries <code>aria-busy="true"</code> — that is the contract's home.
              prefers-reduced-motion freezes the pulse into a static block.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="shells" data-reveal="">
      <SectionCard
        family="composition"
        headerRegion="composition"
        eyebrow="demo"
        title="Composition shells"
        summary="Card, list and table loading mirrors — each shell is your real layout composed from bare blocks, with aria-busy on the shell container. The async-feedback pair: these shells are what shows while a PressButton is in its loading pose or a promise toast says pending."
      >
        <ComponentCanvas title="skeleton · shells" stage="fill" files={skeletonShellsFiles}>
          <div class={cx(rt.gridSm3)}>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.eyebrowPrimary)}>card shell</span>
              <div class={cx(rt.mt12, rt.col12)} aria-busy="true">
                <Skeleton class={cx(rt.skH28, rt.wFull)} />
                <div class={cx(rt.rowC12)}>
                  <Skeleton class={cx(rt.skSize8)} />
                  <div class={cx(rt.flex, rt.grow, rt.col, rt.gap8)}>
                    <Skeleton class={cx(rt.skBar, rt.skW23)} />
                    <Skeleton class={cx(rt.skBar, rt.skW13)} />
                  </div>
                </div>
              </div>
            </div>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.eyebrowPrimary)}>list shell</span>
              <div class={cx(rt.mt12, rt.col12)} aria-busy="true">
                {#each [64, 92, 78, 85] as w (w)}
                  <div class={cx(rt.rowC12)}>
                    <Skeleton class={cx(rt.skSize6)} />
                    <Skeleton class={cx(rt.skBar)} style="width: {w}%" />
                  </div>
                {/each}
              </div>
            </div>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.eyebrowPrimary)}>table shell</span>
              <div class={cx(rt.mt12, rt.col8)} aria-busy="true">
                <div class={cx(rt.skGrid3)}>
                  <Skeleton class={cx(rt.skBar)} />
                  <Skeleton class={cx(rt.skBar)} />
                  <Skeleton class={cx(rt.skBar)} />
                </div>
                {#each [0, 1, 2] as row (row)}
                  <div class={cx(rt.skGrid3T)}>
                    <Skeleton class={cx(rt.skBar, rt.skW45)} />
                    <Skeleton class={cx(rt.skBar, rt.wFull)} />
                    <Skeleton class={cx(rt.skBar, rt.skW23)} />
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </ComponentCanvas>
        <p class={cx(rt.bodyMuted, rt.mt16)}>
          Geometry is always the consumer's — the blocks are bare, the shells are your layout, and the
          loading STATE lives on the shell (<code class={cx(rt.inkAccent)}>aria-busy="true"</code>), never
          per block.
        </p>
      </SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The scenery contract"
        summary="The block is decoration; the loading state is semantics. Everything the component does fits in two atoms, one keyframe, and a merge law — measured, not asserted."
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
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One bare block — every shape (avatar, lane, card) is your geometry via class or parent layout.">
      <ComponentCanvas title="skeleton · types" stage="center" files={skeletonTypesFiles}>
        <div class={cx(rt.wrapStart24)}>
          <div class={cx(rt.col12, rt.panel, rt.skMinW52)}><span class={cx(rt.eyebrowPrimary)}>avatar block</span><Skeleton class={cx(rt.skSize10)} /><span class={cx(rt.inkMuted, rt.text125)}>class={cx(rt.skSize10)}</span></div>
          <div class={cx(rt.col12, rt.panel, rt.skMinW52)}><span class={cx(rt.eyebrowPrimary)}>text lanes</span><div class={cx(rt.col8)}><Skeleton class={cx(rt.skBar, rt.skW32)} /><Skeleton class={cx(rt.skBar, rt.skW20)} /></div><span class={cx(rt.inkMuted, rt.text125)}>class={cx(rt.skBar, rt.skW32)} and friends</span></div>
          <div class={cx(rt.col12, rt.panel, rt.skMinW52)}><span class={cx(rt.eyebrowPrimary)}>full-bleed card</span><div class={cx(rt.col8)}><Skeleton class={cx(rt.skBar, rt.wFull)} /><Skeleton class={cx(rt.skBar, rt.skW34)} /></div><span class={cx(rt.inkMuted, rt.text125)}>width/aspect from the parent layout</span></div>
        </div>
      </ComponentCanvas>
    </SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose blocks into the loading mirror of your real layout; put aria-busy on the container."><CodeBlock code={usage} lang="svelte" meta="Skeleton usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Placeholder blocks are decoration; the loading STATE is semantics that belongs to the container."><A11yTable keys={[]} aria={[{ name: 'aria-hidden', value: 'true', description: 'Set on every block — placeholder scenery is never announced' }, { name: 'aria-busy', value: '"true"', description: 'The consumer puts it on the loading container — the contract home' }, { name: 'live region', value: 'optional', description: 'A visually-hidden "loading…" region announces politely once, if aria-busy is not enough' }]} /></SectionCard></div>

    <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The Props interface adds nothing — a bare block with class passthrough and full attribute spread."><PropsTable universal props={[{ name: 'class', type: 'string', default: "''", description: 'Class passthrough — width/height/aspect live here (no length API).' }, { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'data-*, id, and the rest pass through untouched; aria-hidden lands after the spread.' }]} /></SectionCard></div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on skeleton"
        summary="The zero-vocabulary family, W3-D5 first-time wiring: all eight slots no-own, an explicit lane stamps the §10 carriers onto the style attribute — JOINED with your own declarations — and the scope flows to what you nest. The surface never manufactures geometry; the pulse answers to the user, not the prop."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="skeleton · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.panel)} data-probe="sk-size"><Skeleton class={cx(rt.skBar, rt.skW32)} size={18} /><Skeleton class={cx(rt.skSize10)} size={18} /></div>
              <div class={cx(rt.panel)} data-probe="sk-named"><Skeleton class={cx(rt.skBar, rt.skW32)} size="medium" radius="large" /><Skeleton class={cx(rt.skBar, rt.skW20)} size="medium" radius="large" /></div>
              <div class={cx(rt.panel)} data-probe="sk-stamps"><Skeleton class={cx(rt.skBar, rt.skW32)} density="small" theme="dark" radius={12} style="border-radius: 3px" /></div>
            </ComponentCanvas>
            <p class={cx(rt.bodyMuted, rt.mt16)}>
              The stamps panel is the merge law made visible: radius={'{12}'} stamps
              --jx-radius-effective: 12px while the consumer's own
              style="border-radius: 3px" rides the SAME attribute — carrier and
              consumer declarations co-exist, and the visible corner is yours.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="skeleton" />
    </div>
  </div>
</div>
