<!--
  glass — the ONE glass-effect item's canonical page (glass-effect-blur-
  liquid Lane C, 2026-09-08). Six-section skeleton (Intro → Install →
  Usage → Examples → API → See Also) per the docs-demo standard; the
  ComponentCanvas demo rides a VISUAL BAND (gradient text + 24px grid —
  the Owner-approved prototype's backdrop recipe: refraction needs
  something to refract), and the playground dock covers BOTH API layers
  through the same builder → mount path the components run.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayRange, PlaySegmented, PlayHelp } from '$lib/playground';

  // the item itself — builders + mount + the law sheet (www mirror).
  // The css import is load-bearing: the demo stamps data-jx-effect, the
  // law sheet owns that channel's paint.
  import {
    blur,
    liquid,
    glassAttrs,
    attachLiquidGlass,
    liquidGlass,
    type GlassEffect,
    type GlassSurface,
    type LiquidGlassHandle,
  } from '$lib/ui/glass';
  import '$lib/ui/glass/glass.css';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import glassBuilderSource from '$lib/ui/glass/glass.ts?raw';
  import glassLawSource from '$lib/ui/glass/glass.css?raw';
  import glassMountSource from '$lib/ui/glass/liquid-glass.svelte.ts?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { blur, liquid, glassAttrs, liquidGlass } from '@ui/glass';
  import '@ui/glass/glass.css';
${close}

<!-- the frost member — zero JS, css-only, every engine -->
<div {...glassAttrs(blur({ radius: '10px', saturate: 1.5 }))}>frosted panel</div>

<!-- the lens — the PHYSICAL layer, every knob exposed -->
const fx = liquid({ surface: 'convex-squircle', bezel: 22, scale: 55 });
<div use:liquidGlass(fx) style="border-radius: 24px">…</div>

<!-- the lens — the SEMANTIC layer, SwiftUI glassEffect compiled down -->
const fx = liquid.apple({ variant: 'tint', tint: '#8b5cf6', interactive: true });
<button use:liquidGlass(fx) style="border-radius: 999px">…</button>`;

  // ---- playground state — the dock's knobs feed the builders directly --

  const SURFACE_OPTIONS: readonly { value: GlassSurface; label: string }[] = [
    { value: 'convex-circle', label: 'convex-circle' },
    { value: 'convex-squircle', label: 'convex-squircle' },
    { value: 'concave', label: 'concave' },
    { value: 'lip', label: 'lip' },
  ];

  const PHYSICAL_INITIAL = {
    surface: 'convex-squircle' as GlassSurface,
    bezel: 22,
    thickness: 30,
    scale: 55,
    blur: 0.2,
    rimSaturate: 4,
    specular: 0.2,
  };

  let surface = $state(PHYSICAL_INITIAL.surface);
  let bezel = $state(PHYSICAL_INITIAL.bezel);
  let thickness = $state(PHYSICAL_INITIAL.thickness);
  let scale = $state(PHYSICAL_INITIAL.scale);
  let blurStd = $state(PHYSICAL_INITIAL.blur);
  let rimSaturate = $state(PHYSICAL_INITIAL.rimSaturate);
  let specular = $state(PHYSICAL_INITIAL.specular);

  // ONE effect object through ONE channel: the derived fx is exactly what
  // use:liquidGlass receives — slider moves ride handle.update(fx), the
  // same path the components run (never a second code path).
  const physicalFx = $derived(
    liquid({ surface, bezel, thickness, scale, blur: blurStd, rimSaturate, specular }),
  );

  const metaLine = $derived(
    `surface ${physicalFx.surface} · bezel ${physicalFx.bezel}px · thickness ${physicalFx.thickness}px · scale ${physicalFx.scale}px · blur ${physicalFx.blur}px · rimSaturate ${physicalFx.rimSaturate}× · specular ${physicalFx.specular}`,
  );

  // the zero-JS frost member beside the lens row
  const frostFx = $derived(blur());

  /** spread helper for the MARKUP-stamped members: the vars style and
   * the element geometry share ONE style attribute (a spread would
   * otherwise clobber whichever landed first) */
  function stampedChrome(fx: GlassEffect, geometry: string): Record<string, string> {
    const attrs = glassAttrs(fx);
    return { ...attrs, style: `${attrs.style}; ${geometry}` };
  }

  const FROST_GEOMETRY = 'border-radius: 26px';
  const CHIP_GEOMETRY = 'width: 170px; height: 44px; border-radius: 22px';

  // ---- the semantic layer — the dock's variant, compiled down -----------

  type AppleVariant = 'regular' | 'clear' | 'tint' | 'interactive' | 'identity';
  const VARIANT_OPTIONS: readonly { value: AppleVariant; label: string }[] = [
    { value: 'regular', label: 'regular' },
    { value: 'clear', label: 'clear' },
    { value: 'tint', label: 'tint' },
    { value: 'interactive', label: 'interactive' },
    { value: 'identity', label: 'identity' },
  ];
  let semanticVariant = $state<AppleVariant>('regular');

  // 'tint' and 'interactive' are OPTIONS, not Glass variants — they
  // compile onto the regular variant (tint → the fill, interactive → the flag)
  const liveAppleVariant = $derived(
    semanticVariant === 'clear' || semanticVariant === 'identity' ? semanticVariant : 'regular',
  );

  const liveAppleFx = $derived(
    liquid.apple({
      variant: liveAppleVariant,
      tint: semanticVariant === 'tint' ? '#8b5cf6' : undefined,
      interactive: semanticVariant === 'interactive',
      shape: 'capsule',
    }),
  );

  // the semantic gallery — the approved prototype's demo row, verbatim fx
  const APPLE_GALLERY: readonly { key: AppleVariant; label: string; fx: GlassEffect }[] = [
    { key: 'regular', label: 'regular', fx: liquid.apple({ variant: 'regular' }) },
    { key: 'clear', label: 'clear', fx: liquid.apple({ variant: 'clear' }) },
    { key: 'tint', label: 'tint', fx: liquid.apple({ variant: 'regular', tint: '#8b5cf6' }) },
    {
      key: 'interactive',
      label: 'interactive · press me',
      fx: liquid.apple({ variant: 'regular', interactive: true, shape: 'capsule' }),
    },
    { key: 'identity', label: 'identity (= frost)', fx: liquid.apple({ variant: 'identity' }) },
  ];

  /** one mount for both members: liquid re-points the shared handle
   * (builder → handle.update), the blur member (identity / isEnabled
   * false) stamps the frost channel in markup — zero lens cost. */
  function appleMount(node: HTMLElement, fx: GlassEffect) {
    let handle: LiquidGlassHandle | undefined;
    const apply = (next: GlassEffect): void => {
      if (next.type === 'liquid-glass') {
        if (handle) handle.update(next);
        else handle = attachLiquidGlass(node, next);
      } else {
        handle?.destroy();
        handle = undefined;
        for (const [k, v] of Object.entries(glassAttrs(next))) node.setAttribute(k, v);
      }
    };
    apply(fx);
    return {
      update: apply,
      destroy() {
        handle?.destroy();
        handle = undefined;
      },
    };
  }

  // ---- the engine probe — says which paint this browser is showing ------

  let engineLens = $state<boolean | null>(null);
  $effect(() => {
    engineLens =
      typeof CSS !== 'undefined' && CSS.supports('backdrop-filter', "url('#jx-glass-supports-probe')");
  });

  // ---- dock reset + output lane ------------------------------------------

  function resetPlayground(): void {
    surface = PHYSICAL_INITIAL.surface;
    bezel = PHYSICAL_INITIAL.bezel;
    thickness = PHYSICAL_INITIAL.thickness;
    scale = PHYSICAL_INITIAL.scale;
    blurStd = PHYSICAL_INITIAL.blur;
    rimSaturate = PHYSICAL_INITIAL.rimSaturate;
    specular = PHYSICAL_INITIAL.specular;
    semanticVariant = 'regular';
  }

  const semanticOptionsLine = $derived.by(() => {
    const parts: string[] = [`variant: '${semanticVariant === 'interactive' ? 'regular' : semanticVariant}'`];
    if (semanticVariant === 'tint') parts.push("tint: '#8b5cf6'");
    if (semanticVariant === 'interactive') parts.push('interactive: true');
    parts.push("shape: 'capsule'");
    return parts.join(', ');
  });

  const liveUsage = $derived(`<script lang="ts">
  import { liquid, liquidGlass } from '@ui/glass';
  import '@ui/glass/glass.css';
${close}

<!-- the physical layer — live values from the playground dock -->
const fx = liquid({
  surface: '${physicalFx.surface}',
  bezel: ${physicalFx.bezel},
  thickness: ${physicalFx.thickness},
  scale: ${physicalFx.scale},
  blur: ${physicalFx.blur},
  specular: ${physicalFx.specular},
  rimSaturate: ${physicalFx.rimSaturate},
});
<div use:liquidGlass(fx) style="border-radius: 28px">…</div>

<!-- the semantic layer — the dock's variant, compiled down -->
const fx = liquid.apple({ ${semanticOptionsLine} });
<button use:liquidGlass(fx) style="border-radius: 999px">…</button>`);

  // stable named resolver: the usage file tracks live playground state
  const resolveUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? liveUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/glass/glass.ts', content: glassBuilderSource },
    { name: 'registry/files/ui/glass/liquid-glass.svelte.ts', content: glassMountSource },
    { name: 'registry/files/ui/glass/glass.css', content: glassLawSource },
    { name: 'src/lib/ui/glass-usage.svelte', content: usage, kind: 'usage' },
  ];

  const chromeRecipe = `<!-- the kube recipe: the EFFECT is the item's; the CHROME is yours.
     The mount owns refraction; tint fill, shadow and border-radius
     stay consumer-owned styling. -->
<div use:liquidGlass(fx) style="border-radius: 26px">
  <div
    aria-hidden="true"
    style="position: absolute; inset: 0; border-radius: inherit;
           background: rgba(255, 255, 255, 0.05);
           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16)"
  ></div>
  <div style="position: relative">…content…</div>
</div>`;

  const migrationCode = `<script lang="ts">
  // AFTER — the stamp channel (BEFORE: <div class="jx-glass …">…</div>)
  import { blur, glassAttrs } from '@ui/glass';
  import '@ui/glass/glass.css';
${close}

<!-- blur() defaults ARE the retired .jx-glass values verbatim
     (14px · 1.35 · background 68%) — computed-equivalent by default -->
<div {...glassAttrs(blur())} class="frosted-panel">…</div>

<!-- a tuned surface names its values through the same builder -->
<div {...glassAttrs(blur({ radius: '12px', saturate: 1 }))} class="toast-ground">…</div>`;
</script>

<svelte:head>
  <title>Glass · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai glass effect: ONE item, two API layers — blur() the zero-JS frost member and liquid() the liquid-glass lens (kube.io's generator ported source-level: four dome surfaces, the ray-traced profile, the 9-primitive chain), with liquid.apple() compiling SwiftUI's glassEffect standard down. Frost-first degradation, one stamp channel, element chrome stays yours."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · effect family"
        title="glass — one effect system, two API layers, frost first"
        summary="The five retired hand-tuned glass paints (.jx-glass, tabs glass/liquid, toast glass) unify behind ONE typed effect family on the data-jx-effect stamp channel. The PHYSICAL layer is the objective fact — liquid(...) exposes every knob of kube.io's liquid-glass generator, ported line-level from their shipped bundle: four dome surfaces, the ray-traced slab profile, border-swept displacement maps and the 9-primitive SVG chain. The SEMANTIC layer is SwiftUI's glassEffect standard — liquid.apple(variant, tint, interactive, shape, isEnabled) — compiled down, no physics exposed. blur() is the zero-JS frost member: css-only, and the unconditional base paint every engine gets before the lens ever mounts."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">blur() · zero-JS frost</span>
          <span class="pill">liquid() · the lens, every knob</span>
          <span class="pill">liquid.apple() · semantic</span>
          <span class="pill">one stamp channel</span>
          <span class="pill">frost-first degradation</span>
          <span class="pill">512² raster cap</span>
          <span class="pill">print → solid</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
         ABOVE the demos — Intro → Install → Usage → Examples → API →
         See Also is the page law; the sections between stay page-local. -->
    <div data-reveal="">
      <DocsInstall name="glass" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Build the effect object, stamp it, mount it. blur() stamps in markup (zero JS); the lens mounts through use:liquidGlass(fx) — import the law sheet once per consuming surface family and keep the element chrome (tint, shadow, radius) in your own classes."
      >
        <CodeBlock code={usage} lang="svelte" meta="Glass usage" />
      </SectionCard>
    </div>

    <!-- Examples: the playground canvas over the visual band -->
    <div id="playground" data-reveal="">
      <ComponentCanvas
        title="glass"
        description="The lens over a visual band — gradient text and a 24px grid give refraction something to refract (the approved prototype's backdrop recipe). The dock covers BOTH layers: the physical sliders feed liquid() directly, the variant row compiles liquid.apple(); the source lane emits the exact builder snippet. Drag the sliders — the searchbox, card and wide pill all ride ONE effect object through handle.update."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/glass/glass.ts"
        files={canvasFiles}
        stage="fill"
        onreset={resetPlayground}
        output={[
          { label: 'surface', value: physicalFx.surface },
          { label: 'scale', value: `${physicalFx.scale}px` },
          { label: 'apple() variant', value: semanticVariant },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex w-full flex-col gap-4">
          <div
            data-glass-demo-band
            class="glass-band relative w-full overflow-hidden rounded-lg"
            aria-label="glass effect demo band"
          >
            <div class="glass-band-bg" aria-hidden="true"></div>
            <div class="glass-band-grid" aria-hidden="true"></div>
            <div class="glass-band-text" aria-hidden="true">
              <div class="glass-band-text-track">
                <span>liquid glass · refraction — the lens bends what sits behind it</span>
                <span>liquid glass · refraction — the lens bends what sits behind it</span>
              </div>
            </div>
            <div class="relative flex flex-col gap-8 px-6 pt-[11rem] pb-8 sm:px-10">
              <!-- the physical layer — driven by the dock's sliders -->
              <div class="flex flex-wrap items-start gap-7">
                <div
                  data-glass-demo-search
                  class="glass-box"
                  style="width: min(420px, 100%); height: 56px; border-radius: 28px"
                  use:liquidGlass={physicalFx}
                >
                  <div class="glass-chrome" aria-hidden="true"></div>
                  <div class="glass-content flex-row items-center gap-3 px-6">
                    <span class="text-[15px]" aria-hidden="true">⌕</span>
                    <span class="glass-ink flex-1">Search</span>
                    <span class="glass-ink text-[11px] opacity-75">⌘K</span>
                  </div>
                </div>
                <div
                  data-glass-demo-card
                  class="glass-box"
                  style="width: min(400px, 100%); border-radius: 26px"
                  use:liquidGlass={physicalFx}
                >
                  <div class="glass-chrome" aria-hidden="true"></div>
                  <div class="glass-content flex-col items-start gap-1.5 p-5">
                    <p class="glass-ink m-0 text-[12.5px] font-semibold">liquid() — kube.io's generator, ported</p>
                    <p class="glass-ink glass-meta m-0" data-glass-demo-meta>{metaLine}</p>
                  </div>
                </div>
                <div
                  data-glass-demo-pill
                  class="glass-box"
                  style="width: 260px; height: 44px; border-radius: 22px"
                  use:liquidGlass={physicalFx}
                >
                  <div class="glass-chrome" aria-hidden="true"></div>
                  <div class="glass-content flex-row items-center px-5">
                    <span class="glass-ink text-[12px]">wide pill · uniform bezel</span>
                  </div>
                </div>
                <!-- the frost member — zero JS, css-only, every engine -->
                <div
                  data-glass-demo-blur
                  class="glass-box min-w-[260px] flex-1"
                  {...stampedChrome(frostFx, FROST_GEOMETRY)}
                >
                  <div class="glass-chrome" aria-hidden="true"></div>
                  <div class="glass-content flex-col items-start gap-1.5 p-5">
                    <p class="glass-ink m-0 text-[12.5px] font-semibold">blur() — the zero-JS frost member</p>
                    <p class="glass-ink glass-meta m-0">css-only: the stamp + vars, no mount — this is also liquid's fallback paint</p>
                  </div>
                </div>
              </div>
              <!-- the semantic layer — the dock's variant, compiled down,
                   then the approved prototype's demo row -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-5">
                <button
                  type="button"
                  data-glass-demo-apple-live
                  class="glass-box glass-live cursor-pointer"
                  style="width: 210px; height: 48px; border-radius: 24px"
                  use:appleMount={liveAppleFx}
                >
                  <div class="glass-chrome" aria-hidden="true"></div>
                  <div class="glass-content flex-row items-center px-4">
                    <span class="glass-ink text-[12px] font-semibold">apple() · {semanticVariant}</span>
                  </div>
                </button>
                {#each APPLE_GALLERY as item (item.key)}
                  {#if item.key === 'interactive'}
                    <button
                      type="button"
                      data-glass-demo-apple={item.key}
                      class="glass-box glass-chip cursor-pointer"
                      style="width: 190px; height: 44px; border-radius: 22px"
                      use:appleMount={item.fx}
                    >
                      <div class="glass-chrome" aria-hidden="true"></div>
                      <div class="glass-content flex-row items-center px-4">
                        <span class="glass-ink text-[12px]">{item.label}</span>
                      </div>
                    </button>
                  {:else if item.key === 'identity'}
                    <div
                      data-glass-demo-apple={item.key}
                      class="glass-box glass-chip"
                      {...stampedChrome(item.fx, CHIP_GEOMETRY)}
                    >
                      <div class="glass-chrome" aria-hidden="true"></div>
                      <div class="glass-content flex-row items-center px-4">
                        <span class="glass-ink text-[12px]">{item.label}</span>
                      </div>
                    </div>
                  {:else}
                    <div
                      data-glass-demo-apple={item.key}
                      class="glass-box glass-chip"
                      style="width: 150px; height: 44px; border-radius: 22px"
                      use:appleMount={item.fx}
                    >
                      <div class="glass-chrome" aria-hidden="true"></div>
                      <div class="glass-content flex-row items-center px-4">
                        <span class="glass-ink text-[12px]">{item.label}</span>
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
          <p class="text-muted-foreground m-0 font-mono text-[11px]" data-glass-demo-engine>
            {engineLens === true
              ? 'engine: url() backdrop-filter supported — the lens is live (Chromium)'
              : engineLens === false
                ? 'engine: no url() backdrop-filter — the frost base stands (Safari / Firefox)'
                : 'engine probe…'}
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="surface" hint="the dome cross-section — four shipped surfaces">
              <PlaySegmented bind:value={surface} options={SURFACE_OPTIONS} />
            </PlayRow>
            <PlayRow label="bezel" hint="4–80 px · the refraction band width, border → inward">
              <PlayRange bind:value={bezel} min={4} max={80} step={1} />
            </PlayRow>
            <PlayRow label="thickness" hint="2–160 px · the ray-traced slab thickness">
              <PlayRange bind:value={thickness} min={2} max={160} step={1} />
            </PlayRow>
            <PlayRow
              label="scale"
              hint="0–160 px · absolute element px — kube pins per element (56px box → 55, 92px thumb → 22, 150px circle → 134); no universal fraction"
            >
              <PlayRange bind:value={scale} min={0} max={160} step={1} />
            </PlayRow>
            <PlayRow label="blur" hint="0–4 px · the in-chain frost (first primitive)">
              <PlayRange bind:value={blurStd} min={0} max={4} step={0.1} />
            </PlayRow>
            <PlayRow label="rimSaturate" hint="1–12 × · the ring's saturation boost">
              <PlayRange bind:value={rimSaturate} min={1} max={12} step={0.5} />
            </PlayRow>
            <PlayRow label="specular" hint="0–1 · the faded-ring opacity">
              <PlayRange bind:value={specular} min={0} max={1} step={0.05} />
            </PlayRow>
            <PlayRow label="variant" hint="the semantic layer — liquid.apple(), compiled down">
              <PlaySegmented bind:value={semanticVariant} options={VARIANT_OPTIONS} />
            </PlayRow>
            <PlayHelp>
              the sliders feed <code>liquid()</code> directly — the same builder the components run;
              every change rides the mount's <code>handle.update(fx)</code>, never a second code path.
              The variant row compiles <code>liquid.apple()</code> the same way: identity / isEnabled
              false maps to the frost member (zero lens cost), interactive stamps the press-motion var.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="two-layers" data-reveal="">
      <SectionCard
        family="two-layers"
        headerRegion="two-layers"
        eyebrow="the model"
        title="Two layers, one stamp channel"
        summary="The physical layer is the objective fact; the semantic layer is the iOS standard compiled down and exposes no physics. Both land on the same data-jx-effect stamp with the same tuning vars — the law sheet owns the paint, the mount owns the lens."
      >
        <div class="flex flex-col gap-5">
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            <code>{'liquid({...})'}</code> carries kube.io's generator: the surface profile
            <code>d(s) = T.x/T.y · (H(s)·thickness + bezel)</code> — a 1-D ray trace with the
            glass-slab path term — normalized by max displacement and swept along the border as a
            rounded-rect SDF, rastered at 2× dpr under a hard 512² area cap. The mount
            canvas-encodes lens + specular maps, appends the 9-primitive SVG chain (in-chain frost →
            displacement → rim saturate → the saturated-copy / faded-ring specular pair) and only
            THEN writes the <code>--jx-glass-filter</code> pointer: a set pointer never precedes its
            fragment. <code>{'liquid.apple({...})'}</code> compiles SwiftUI's parameter standard onto
            that — see the compile table in the API section.
          </p>
          <CodeBlock
            code={`liquid({ surface, bezel, thickness, scale, blur, specular, rimSaturate,
        radius, saturate, fill, brightness })   // the physical layer
liquid.apple({ variant, tint, interactive, shape, isEnabled })  // the semantic
blur({ radius, saturate, fill, brightness })   // the frost member, zero JS`}
            lang="ts"
            meta="the builders"
          />
        </div>
      </SectionCard>
    </div>

    <div id="degradation" data-reveal="">
      <SectionCard
        family="degradation"
        headerRegion="degradation"
        eyebrow="environments"
        title="Degradation is the design, not the fallback"
        summary="The frost base paints unconditionally — for liquid it IS the no-JS, pre-hydration and unsupported-engine paint. The lens is an enhancement, never a dependency: frost → lens on mount, never unfiltered → lens."
      >
        <div class="flex flex-col gap-5">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
              <thead>
                <tr class="border-border border-b">
                  <th class="text-muted-foreground font-nav p-2 text-[11px] uppercase tracking-[0.18em]">environment</th>
                  <th class="text-muted-foreground font-nav p-2 text-[11px] uppercase tracking-[0.18em]">paint</th>
                </tr>
              </thead>
              <tbody class="align-top">
                <tr class="border-border/60 border-b">
                  <td class="p-2">Chromium, JS on</td>
                  <td class="text-muted-foreground p-2">the lens, from the first painted frame after mount (the pointer-only @supports branch)</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">Chromium, JS off / pre-hydration</td>
                  <td class="text-muted-foreground p-2">frost — the unconditional base paint holds (disable JS on this page: the band stays frosted)</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">Safari / Firefox</td>
                  <td class="text-muted-foreground p-2">frost — the @supports branch never applies; same geometry, honest paint</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">no 2D canvas / zero-size box</td>
                  <td class="text-muted-foreground p-2">the mount stamps vars and returns — frost stands, no crash; a ResizeObserver rebuilds when the element appears</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">prefers-reduced-transparency</td>
                  <td class="text-muted-foreground p-2">solid fill (<code>--jx-glass-solid-fill</code> over the background token), no filters</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">prefers-reduced-motion</td>
                  <td class="text-muted-foreground p-2">the interactive press choreography drops (motion is an enhancement too)</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2">print</td>
                  <td class="text-muted-foreground p-2">filters off, the fill stays readable on paper</td>
                </tr>
                <tr>
                  <td class="p-2">forced-colors</td>
                  <td class="text-muted-foreground p-2">no law block by design — consumers carry their own Canvas grounds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            The lens's host svg is a zero-size, aria-hidden fragment appended to the document body —
            pure scenery, never in the accessibility tree. The element itself keeps whatever role it
            had: the effect never owns semantics.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="chrome" data-reveal="">
      <SectionCard
        family="chrome"
        headerRegion="chrome"
        eyebrow="recipe"
        title="Element chrome is consumer-owned"
        summary="kube's own component css, not law: consumers ship the tint fill, the shadow and the border-radius. The mount measures the element's border-radius (or the shape override) and builds the lens to fit — the chrome never fights the effect."
      >
        <div class="flex flex-col gap-5">
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            The tint layer rides an inset child (so the law sheet's fill paint stays untouched),
            the shadow and the radius ride the host. The semantic layer's <code>tint</code> option
            compiles to the same shape: a 30% color-mix fill written into the stamp vars — no extra
            element needed.
          </p>
          <CodeBlock code={chromeRecipe} lang="svelte" meta="the chrome recipe" />
        </div>
      </SectionCard>
    </div>

    <div id="migration" data-reveal="">
      <SectionCard
        family="migration"
        headerRegion="migration"
        eyebrow="migration"
        title="Migrating off .jx-glass"
        summary="The retired class is a stamp-channel member now: blur() defaults ARE the retired values verbatim, so an unconfigured migration is computed-equivalent by construction."
      >
        <div class="flex flex-col gap-5">
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            Replace the class with <code>{'{...glassAttrs(blur())}'}</code> and import the law sheet
            once per consuming surface family. Tuned surfaces name their values through the same
            builder — toast ships 12px / saturate 1 / popover 55%, tabs glass 10px / 1.5 / 40%,
            tabs liquid the lens itself at frost 2px / 1.6. A migration canary source-scans the
            repo for stray <code>jx-glass</code> references (normalized, comments stripped) so the
            old class cannot quietly return.
          </p>
          <CodeBlock code={migrationCode} lang="svelte" meta="the migration" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Tokens and the stamp channel"
      summary="Selectors read the data-jx-effect stamp, the --jx-glass-* vars carry the tuning — consumers override VALUES, never names. No density footprint: the effect is dimensionless paint."
    >
      <TokenTable
        tokens={[
          { name: '--jx-glass-radius', default: "'14px' (blur) · '2px' (liquid)", source: 'component', description: 'The frost blur radius. The retired .jx-glass value is blur()’s default; liquid pins its own tighter frost.' },
          { name: '--jx-glass-saturate', default: '1.35 (blur) · 1.6 (liquid)', source: 'component', description: 'The frost saturation multiplier.' },
          { name: '--jx-glass-fill', default: 'color-mix(in oklab, var(--background, Canvas) 68%, transparent)', source: 'component', description: 'The translucent frost fill. tint compiles to a 30% color-mix of the tint color here.' },
          { name: '--jx-glass-brightness', default: '1', source: 'component', description: 'The frost brightness multiplier.' },
          { name: '--jx-glass-filter', default: 'mount-written', source: 'component', description: 'The url(#id) pointer to the lens filter — written ONLY by the mount action after appending the filter node, never in markup. Hand-writing it is documented misuse.' },
          { name: '--jx-glass-interactive', default: 'flag', source: 'component', description: 'Stamped as 1 when the effect is interactive — the law sheet’s press-motion block reads it (gated off under prefers-reduced-motion).' },
          { name: '--jx-glass-solid-fill', default: 'var(--background, Canvas)', source: 'component', description: 'The reduced-transparency escape hatch over the plain background token (the jx-surface precedent) — the translucent fill cannot serve as the solid.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three builders, two helpers, one action. Numeric args clamp into range; NaN / ±Infinity / non-finite throws TypeError at construction; surface validates against the enum; builders never touch document."
    >
      <div class="flex flex-col gap-8">
        <PropsTable
          title="liquid(o) — the physical layer (LiquidGlassOptions)"
          props={[
            { name: 'surface', type: "'convex-circle' | 'convex-squircle' | 'concave' | 'lip'", default: "'convex-squircle'", description: 'The dome cross-section (Apple’s preferred profile is the default). lip is a smoothstep blend of squircle + concave; concave flips the rim pull by physics — a diverging lens samples outward at the border.' },
            { name: 'bezel', type: 'number', default: '22', description: 'Refraction band width in element px (border → inward). Clamp [4, 80].' },
            { name: 'thickness', type: 'number', default: '30', description: 'The ray-traced glass-slab thickness — the path term H(s)·thickness in the profile. Clamp [2, 160].' },
            { name: 'scale', type: 'number', default: '55', description: 'feDisplacementMap scale in element px — the displacement magnitude. ABSOLUTE px: kube pins it per element (56px searchbox → 55, 92px thumb → 22, 150px circle → 134); there is no universal fraction, tune per surface. Clamp [0, 160].' },
            { name: 'blur', type: 'number', default: '0.2', description: 'The in-chain frost (feGaussianBlur stdDeviation, the first primitive). Clamp [0, 4].' },
            { name: 'specular', type: 'number', default: '0.2', description: 'The faded-ring opacity (feFuncA slope). Clamp [0, 1].' },
            { name: 'rimSaturate', type: 'number', default: '4', description: 'The rim’s saturation boost (feColorMatrix saturate on the ring-clipped copy). Clamp [1, 12].' },
            { name: 'radius', type: 'string', default: "'2px'", description: 'The frost fallback’s blur (no-JS / engines without url() backdrop-filters) — tabs liquid’s retired values.' },
            { name: 'saturate', type: 'number', default: '1.6', description: 'The frost fallback’s saturation. Clamp [0, 3].' },
            { name: 'fill', type: 'string', default: 'color-mix(in oklab, var(--background, Canvas) 68%, transparent)', description: 'The frost fallback’s translucent fill.' },
            { name: 'brightness', type: 'number', default: '1', description: 'The frost fallback’s brightness. Clamp [0, 3].' },
          ]}
        />
        <PropsTable
          title="liquid.apple(o) — the semantic layer (AppleLiquidOptions)"
          props={[
            { name: 'variant', type: "'regular' | 'clear' | 'identity'", default: "'regular'", description: 'Glass.regular / .clear / .identity. Compiles per the table below — regular is the physical defaults verbatim; identity (or isEnabled false) returns the FROST member, Apple’s no-op mapped to the law’s own degradation at zero lens cost.' },
            { name: 'tint', type: 'string', default: '—', description: 'Glass.tint(_:) — a color; compiles to fill = color-mix(in oklab, <tint> 30%, transparent).' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Glass.interactive() — stamps --jx-glass-interactive:1; the law sheet’s motion css carries the press scale/brighten (off under prefers-reduced-motion). Composes with the consumer’s own press choreography.' },
            { name: 'shape', type: "'capsule' | number", default: 'the element’s border-radius', description: 'A Shape override for the mount’s radius: capsule = min(w,h)/2 (the full pill), number = px clamped into [0, min(w,h)/2]. Unset reads the element’s computed border-radius.' },
            { name: 'isEnabled', type: 'boolean', default: 'true', description: 'false → identity behavior (the frost member).' },
          ]}
        />
        <PropsTable
          title="blur(o) — the frost member (BlurOptions)"
          props={[
            { name: 'radius', type: 'string', default: "'14px'", description: 'The frost blur radius — the retired .jx-glass value.' },
            { name: 'saturate', type: 'number', default: '1.35', description: 'The frost saturation. Clamp [0, 3].' },
            { name: 'fill', type: 'string', default: 'color-mix(in oklab, var(--background, Canvas) 68%, transparent)', description: 'The translucent frost fill.' },
            { name: 'brightness', type: 'number', default: '1', description: 'The frost brightness. Clamp [0, 3].' },
          ]}
        />
        <div class="flex flex-col gap-3">
          <p class="text-primary font-nav m-0 text-[11px] uppercase tracking-[0.24em]">
            the semantic compile table — Apple parameter → physical compilation
          </p>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
              <tbody class="align-top">
                <tr class="border-border/60 border-b">
                  <td class="w-[220px] p-2 font-mono">variant: 'regular'</td>
                  <td class="text-muted-foreground p-2">the physical defaults verbatim (liquid() ≡ liquid.apple() — deep-equal, pinned by tests)</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2 font-mono">variant: 'clear'</td>
                  <td class="text-muted-foreground p-2">{`{ blur: 0, fill: background 22% mix, rimSaturate: 2.5, specular: 0.12 }`} — less frosting, more transparency, a quieter rim</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2 font-mono">variant: 'identity' / isEnabled: false</td>
                  <td class="text-muted-foreground p-2">the frost member — <code>blur({'{ radius: 2px, saturate: 1.6 }'})</code>; Apple’s no-op at zero lens cost</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2 font-mono">tint</td>
                  <td class="text-muted-foreground p-2">fill = color-mix(in oklab, &lt;tint&gt; 30%, transparent)</td>
                </tr>
                <tr class="border-border/60 border-b">
                  <td class="p-2 font-mono">interactive</td>
                  <td class="text-muted-foreground p-2">the effect flag → <code>--jx-glass-interactive:1</code> → the law sheet’s press motion</td>
                </tr>
                <tr>
                  <td class="p-2 font-mono">shape</td>
                  <td class="text-muted-foreground p-2">the mount’s radius override ('capsule' = min(w,h)/2; number = px, clamped); unset = the element’s border-radius</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <PropsTable
          title="the stamp helpers + the mount"
          props={[
            { name: 'glassAttrs(fx)', type: 'Record<string, string>', default: 'spread', description: 'Stamps data-jx-effect + the vars style. For liquid it carries the tuning vars ONLY — the --jx-glass-filter pointer belongs to the mount action exclusively, never to markup.' },
            { name: 'glassVars(fx)', type: 'string', default: '—', description: 'The vars string alone (the style attribute’s glass payload, semicolon-joined).' },
            { name: 'use:liquidGlass(fx)', type: 'Svelte action', default: '—', description: 'The mount: stamps vars → measures (shape override ?? border-radius) → canvas-encodes both maps → appends the host svg + the 9-primitive chain at element size → writes the pointer LAST. ResizeObserver rAF-coalesced regeneration; the no-canvas and zero-box guards leave frost standing.' },
            { name: 'attachLiquidGlass(el, fx)', type: '(HTMLElement, LiquidGlassEffect) => { update, destroy }', default: '—', description: 'The framework-agnostic form — what the action wraps (the ripple precedent: effects may own runtime JS).' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="glass" />
  </div>
</div>

<style>
  /* the visual band — the Owner-approved prototype's backdrop recipe
     (gradient text + 24px grid): refraction needs something to refract.
     The band is intrinsically dark regardless of the stage theme — it
     is the demo's own scenery, like the terminal bezel. The scenery
     MOVES (Owner 2026-09-09): three parallax layers, each seamlessly
     periodic and transform-only, so the infinite loop stays on the
     compositor and the glass always has live content to bend. */
  .glass-band {
    min-height: 460px;
    /* the canvas artboard redefines --background to its light paper —
       scope it back to the band's dark scenery so the demos' default
       68% frost fill resolves dark (the approved look), not milky white */
    --background: #101014;
    background: #101014;
  }
  /* the drifting color blobs — the trio tiles horizontally at 50%
     background-size, so one tile = one band-width and the -50%
     translate loop is seamless */
  .glass-band-bg {
    position: absolute;
    inset: 0 auto 0 0;
    width: 200%;
    background:
      radial-gradient(1200px 600px at 15% 20%, #5b2a86 0%, transparent 60%),
      radial-gradient(900px 500px at 85% 15%, #b5342f 0%, transparent 55%),
      radial-gradient(1000px 700px at 60% 85%, #14664f 0%, transparent 60%),
      repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 26px);
    background-size: 50% 100%, 50% 100%, 50% 100%, auto auto;
    background-repeat: repeat-x;
    animation: glass-band-drift 64s linear infinite;
  }
  /* the 24px grid pans one cell per cycle — periodic, so the snap
     back to 0 is invisible; faster than the blobs for parallax */
  .glass-band-grid {
    position: absolute;
    inset: 0;
    width: 200%;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
    background-size: 24px 24px;
    animation: glass-band-grid-pan 10s linear infinite;
  }
  /* the marquee text — two copies on a max-content track, -50% loop */
  .glass-band-text {
    position: absolute;
    inset: 0 0 auto 0;
    overflow: hidden;
    pointer-events: none;
  }
  .glass-band-text-track {
    display: flex;
    width: max-content;
    padding-top: 3.2rem;
    animation: glass-band-marquee 48s linear infinite;
  }
  .glass-band-text-track span {
    font-size: clamp(26px, 4vw, 54px);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.02em;
    white-space: nowrap;
    background: linear-gradient(120deg, #fff 30%, #ffb3c7 50%, #9fe8ff 70%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0.95;
    padding-right: 3.5rem;
  }
  @keyframes glass-band-drift {
    to {
      transform: translateX(-50%);
    }
  }
  @keyframes glass-band-grid-pan {
    to {
      transform: translateX(-24px);
    }
  }
  @keyframes glass-band-marquee {
    to {
      transform: translateX(-50%);
    }
  }
  /* motion is an enhancement — reduced-motion parks the scenery */
  @media (prefers-reduced-motion: reduce) {
    .glass-band-bg,
    .glass-band-grid,
    .glass-band-text-track {
      animation: none;
    }
  }
  /* the demo host + the consumer chrome recipe (kube's own component
     css): tint child + shadow + radius, border-radius: inherit so the
     chrome follows the host's shape */
  .glass-box {
    position: relative;
    flex: none;
    appearance: none;
    border: none;
    padding: 0;
    color: inherit;
    font: inherit;
  }
  .glass-chrome {
    position: absolute;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateZ(0);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
    border-radius: inherit;
  }
  .glass-content {
    position: relative;
    display: flex;
    height: 100%;
    align-items: center;
  }
  .glass-content.flex-row {
    flex-direction: row;
  }
  .glass-content.flex-col {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  .glass-ink {
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
  }
  .glass-meta {
    font-size: 11px;
    font-family: var(--font-mono);
    opacity: 0.7;
  }
  .glass-live {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 3px;
  }
  .glass-chip {
    flex: none;
  }
</style>
