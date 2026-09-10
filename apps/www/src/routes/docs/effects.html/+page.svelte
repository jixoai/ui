<!--
  effects — the effect family's HOME page (effect-attachments Lane C,
  2026-09-09; un-folded r3: press-button KEEPS its component page — the
  group is a taxonomy lane, not a page). glass.html retires into this
  page (band + two-layer playground carried, syntax already
  attachment-form). Owner review 2026-09-08: the page showcases EACH
  EFFECT and ITS PARAMETERS — no hard coupling with the button
  component. The press loops get ONE GALLERY PER EFFECT (shimmer,
  pulse, rainbow, ripple): a neutral stage of plain hosts, a parameter
  dock over the builder's real params, a live sample that tracks the
  dock — the same machinery the glass dock runs. Component
  documentation (variant ladder, loading, zones) stays on the
  component's own page. Effects are ATTACHMENTS, not components: every
  demo mounts through {@attach} on plain elements. Skeleton per the
  demo-standard law:
  Intro → Install → Usage → Examples → API → migration → See Also.
-->
<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayRange, PlaySegmented, PlayHelp } from '$lib/playground';

  // the glass item — builders + mount + the law sheet (www mirror).
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

  // the press item — the builders (module exports, the param surfaces
  // the galleries' docks expose) and the attachment face (pressEffect
  // rides the item index); the sources feed the drawers (same-source
  // law). The COMPONENT itself is deliberately absent: the Owner review
  // (2026-09-08) rules the effects are the protagonists — neutral plain
  // hosts only, component documentation stays on press-button.html.
  import { pressEffect, solidFill } from '$lib/ui/press-button';
  import { pulse, rainbow, ripple, shimmer } from '$lib/ui/press-button/press-button.svelte';
  import pressButtonSource from '$lib/ui/press-button/press-button.svelte?raw';
  import pressRuntimeSource from '$lib/ui/press-button/press-effect-runtime.ts?raw';

  import { registrySourceUrl } from '$lib/registry-source';

  // Same-source law: the drawers show the exact registry copy this site
  // runs (glass builder / law sheet / mount + the press runtime).
  import glassBuilderSource from '$lib/ui/glass/glass.ts?raw';
  import glassLawSource from '$lib/ui/glass/glass.css?raw';
  import glassMountSource from '$lib/ui/glass/liquid-glass.svelte.ts?raw';

  const close = '</' + 'script>';

  // ---- Usage — the attachment guide (the family's ONE teaching) -------
  // Both mount forms + the bridge, code-first; the two laws (param flow,
  // two channels) ride the prose below the block.

  const usage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
  import Chip from '@ui/chip.svelte';
  import { pressEffect } from '@ui/press-button';
  import { liquid, liquidGlass } from '@ui/glass';
  import { fromAction } from 'svelte/attachments';
  import '@ui/glass/glass.css';
${close}

<!-- the LEAF form — your own element, the factory inline: the whole
     expression is the attachment, teardown on unmount -->
<button {@attach pressEffect(shimmer({ speed: 4000 }))}>deploy</button>
<div style="border-radius: 24px" {@attach liquidGlass(liquid({ bezel: 22 }))}>…</div>

<!-- the COMPONENT-TAG form — the same {@attach} on a host component:
     the attachment compiles to a symbol-keyed prop, the host's rest
     spread lands it on its stamped root (data-jx-attach names the
     mounting point; icon-button chains the same spread one level
     deeper; an undefined value skips — never a crash) -->
<PressButton {@attach pressEffect(ripple({ duration: 800 }))}>deploy</PressButton>
<Chip {@attach pressEffect(shimmer())}>filter</Chip>

<!-- the fromAction bridge — action-shaped helpers (third-party or the
     repo's own internals): update on reference change, destroy on out -->
<div {@attach fromAction(riseIn, () => ({ y: 12 }))}>…</div>`;

  // ---- the glass playground state — the dock's knobs feed the builders -

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
  // {@attach liquidGlass(physicalFx)} re-arms with — slider moves ride the
  // identity remount (teardown + rebuild, the maps regenerate in
  // single-digit ms), the same builder path the components run (never a
  // second code path).
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

  /** one mount for both members, the attachment FACTORY form (the
   *  effect-attachments migration): liquid re-points the shared handle
   *  (builder → handle.update inside one mount), the blur member
   *  (identity / isEnabled false) stamps the frost channel in markup —
   *  zero lens cost. There is no update channel through {@attach}: a
   *  changed fx is a fresh closure = identity remount, which routes both
   *  branches through `apply` again (destroy first — same end state). */
  function appleMount(fx: GlassEffect): Attachment<HTMLElement> {
    return (node) => {
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
      return () => {
        handle?.destroy();
        handle = undefined;
      };
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
<div style="border-radius: 28px" {@attach liquidGlass(fx)}>…</div>

<!-- the semantic layer — the dock's variant, compiled down -->
const fx = liquid.apple({ ${semanticOptionsLine} });
<button style="border-radius: 999px" {@attach liquidGlass(fx)}>…</button>`);

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
<div style="border-radius: 26px" {@attach liquidGlass(fx)}>
  <div
    aria-hidden="true"
    style="position: absolute; inset: 0; border-radius: inherit;
           background: rgba(255, 255, 255, 0.05);
           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16)"
  ></div>
  <div style="position: relative">…content…</div>
</div>`;

  // ---- the press effect galleries — one per effect (Owner review -----
  //       2026-09-08: showcase EACH EFFECT and ITS PARAMETERS — the
  //       hosts are neutral plain elements, the docks expose the
  //       builders' real params, the live sample tracks the dock. The
  //       machinery mirrors the glass physical dock above: slider rows
  //       → a $derived fx object → the hosts consume it → the drawer's
  //       usage file reflects the current values.)

  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);

  // ---- shimmer — the host-channel ring over the animated band (r11) ----

  const SHIMMER_INITIAL = {
    shine: 'var(--primary)',
    ringColor: 'currentColor',
    shineWidth: 30,
    speed: 3000,
    ringW: 1,
  };
  let shShine = $state(SHIMMER_INITIAL.shine); // 'var(--primary)' | a hex override
  let shShineHex = $state('#3d6bff'); // the picker's seed — becomes the param on pick
  let shRingColor = $state(SHIMMER_INITIAL.ringColor); // 'currentColor' | a hex override
  let shRingHex = $state('#1e2f56');
  let shShineWidth = $state(SHIMMER_INITIAL.shineWidth);
  let shSpeed = $state(SHIMMER_INITIAL.speed);
  let shRingW = $state(SHIMMER_INITIAL.ringW);
  // the fill channel (r11): undefined = the context's theme token
  // (light/dark follows the Context), null = transparent,
  // number = solidFill()-minted opaque
  let shFill = $state<number | null | undefined>(undefined);
  let shFillHex = $state('#0d1220');
  const shFillReadout = $derived(
    shFill === undefined ? 'auto (context)' : shFill === null ? 'transparent' : `#${shFill.toString(16).padStart(6, '0')}`,
  );
  const shimmerFx = $derived(
    shimmer({
      shine: shShine,
      ringColor: shRingColor,
      shineWidth: `${shShineWidth}deg`,
      speed: shSpeed,
      ringW: shRingW,
      fill: shFill,
    }),
  );
  function resetShimmer(): void {
    shShine = SHIMMER_INITIAL.shine;
    shRingColor = SHIMMER_INITIAL.ringColor;
    shShineWidth = SHIMMER_INITIAL.shineWidth;
    shSpeed = SHIMMER_INITIAL.speed;
    shRingW = SHIMMER_INITIAL.ringW;
    shFill = undefined;
  }
  const shimmerUsage = $derived(`<script lang="ts">
  import { pressEffect, solidFill } from '@ui/press-button';
  import { shimmer } from '@ui/press-button/press-button.svelte';
${close}

<!-- the host itself carries the ring — its border IS the band. shine defaults
     to the primary token, ring-color to currentColor, and fill: an opaque
     number from solidFill(cssColor) against the context's light/dark base, or
     null for transparent (the border-area cutout where the engine supports
     it, the blend emulation elsewhere) -->
<button {@attach pressEffect(shimmer({ shine: ${shShine === SHIMMER_INITIAL.shine ? "'var(--primary)'" : q(shShine)}, ringColor: ${shRingColor === SHIMMER_INITIAL.ringColor ? "'currentColor'" : q(shRingColor)}, shineWidth: '${shShineWidth}deg', speed: ${shSpeed}, ringW: ${shRingW}, fill: ${shFill === null ? 'null' : shFill === undefined ? 'solidFill(\'rgba(255, 255, 255, 0.35)\')' : `solidFill('${shFillHex}')`} }))}>
  deploy
</button>`);
  const shimmerFiles: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'registry/files/ui/press-button/press-effect-runtime.ts', content: pressRuntimeSource },
    { name: 'src/lib/ui/shimmer-usage.svelte', content: shimmerUsage, kind: 'usage' },
  ];
  const resolveShimmerUsage = (file: TreeFile): string =>
    file.name.endsWith('shimmer-usage.svelte') ? shimmerUsage : file.content;

  // ---- pulse — sonar rings breathe outward from the silhouette --------

  const PULSE_INITIAL = { color: 'var(--primary)', duration: 2500, distance: 0.7, variant: 'slow' as const };
  const PULSE_VARIANT_OPTIONS: readonly { value: 'slow' | 'ring' | 'ripple'; label: string }[] = [
    { value: 'slow', label: 'slow' },
    { value: 'ring', label: 'ring' },
    { value: 'ripple', label: 'ripple' },
  ];
  let puColor = $state(PULSE_INITIAL.color);
  let puHex = $state('#e5489b');
  let puDuration = $state(PULSE_INITIAL.duration);
  let puDistance = $state(PULSE_INITIAL.distance);
  let puVariant = $state<'slow' | 'ring' | 'ripple'>(PULSE_INITIAL.variant);
  const pulseDistance = $derived(Math.round(puDistance * 100) / 100);
  const pulseFx = $derived(
    pulse({
      color: puColor,
      duration: puDuration,
      distance: `${pulseDistance}em`,
      variant: puVariant,
    }),
  );
  function resetPulse(): void {
    puColor = PULSE_INITIAL.color;
    puDuration = PULSE_INITIAL.duration;
    puDistance = PULSE_INITIAL.distance;
    puVariant = PULSE_INITIAL.variant;
  }
  const pulseUsage = $derived(`<script lang="ts">
  import { pressEffect } from '@ui/press-button';
  import { pulse } from '@ui/press-button/press-button.svelte';
${close}

<!-- the leaf form — a plain element, the factory inline; the dock's live params -->
<button {@attach pressEffect(pulse({ color: ${q(puColor)}, duration: ${puDuration}, distance: '${pulseDistance}em', variant: '${puVariant}' }))}>
  deploy
</button>`);
  const pulseFiles: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'registry/files/ui/press-button/press-effect-runtime.ts', content: pressRuntimeSource },
    { name: 'src/lib/ui/pulse-usage.svelte', content: pulseUsage, kind: 'usage' },
  ];
  const resolvePulseUsage = (file: TreeFile): string =>
    file.name.endsWith('pulse-usage.svelte') ? pulseUsage : file.content;

  // ---- rainbow — the aurora ring on a 200% stop-train flow --------------

  // the five default hsl primes, hex twins for the PICKERS ONLY — the
  // state holds the builder's own strings; a pick writes a hex in
  const RAINBOW_INITIAL: {
    speed: number;
    colors: [string, string, string, string, string];
  } = {
    speed: 2000,
    colors: [
      'hsl(0 100% 63%)',
      'hsl(270 100% 63%)',
      'hsl(210 100% 63%)',
      'hsl(195 100% 63%)',
      'hsl(90 100% 63%)',
    ],
  };
  const HSL_TO_HEX: Readonly<Record<string, string>> = {
    'hsl(0 100% 63%)': '#ff4242',
    'hsl(270 100% 63%)': '#a142ff',
    'hsl(210 100% 63%)': '#42a1ff',
    'hsl(195 100% 63%)': '#42d0ff',
    'hsl(90 100% 63%)': '#ffa142',
  };
  /** the picker display value: hex passes through, the known defaults
   *  ride their twins, anything else falls back to black */
  function hexOf(color: string): string {
    if (color.startsWith('#')) return color;
    return HSL_TO_HEX[color] ?? '#000000';
  }
  let rbSpeed = $state(RAINBOW_INITIAL.speed);
  let rbColors = $state<[string, string, string, string, string]>([...RAINBOW_INITIAL.colors]);
  // the r13 sibling channels: ring-w on the host's border, the fill
  // face (auto = Canvas / null = cutout / number = solidFill())
  let rbRingW = $state(1);
  let rbFill = $state<number | null | undefined>(undefined);
  let rbFillHex = $state('#0d1220');
  const rbFillReadout = $derived(
    rbFill === undefined ? 'auto (context)' : rbFill === null ? 'transparent' : `#${rbFill.toString(16).padStart(6, '0')}`,
  );
  const rainbowFx = $derived(
    rainbow({ speed: rbSpeed, colors: rbColors, ringW: rbRingW, fill: rbFill }),
  );
  function resetRainbow(): void {
    rbSpeed = RAINBOW_INITIAL.speed;
    rbColors = [...RAINBOW_INITIAL.colors];
    rbRingW = 1;
    rbFill = undefined;
  }
  const rainbowUsage = $derived(`<script lang="ts">
  import { pressEffect } from '@ui/press-button';
  import { rainbow } from '@ui/press-button/press-button.svelte';
${close}

<!-- the leaf form — the host's own border IS the flowing ring (ring-w);
     fill: solidFill(cssColor) → opaque number, null → the cutout, omitted → Canvas -->
<button {@attach pressEffect(rainbow({ speed: ${rbSpeed}, colors: [${rbColors.map((c) => q(c)).join(', ')}], ringW: ${rbRingW}, fill: ${rbFill === null ? 'null' : rbFill === undefined ? 'undefined' : `solidFill('${rbFillHex}')`} }))}>
  upgrade
</button>`);
  const rainbowFiles: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'registry/files/ui/press-button/press-effect-runtime.ts', content: pressRuntimeSource },
    { name: 'src/lib/ui/rainbow-usage.svelte', content: rainbowUsage, kind: 'usage' },
  ];
  const resolveRainbowUsage = (file: TreeFile): string =>
    file.name.endsWith('rainbow-usage.svelte') ? rainbowUsage : file.content;

  // ---- ripple — ink from the exact press point -------------------------

  const RIPPLE_INITIAL = { color: 'currentColor', duration: 600, shape: 'round' as const, soft: 1.5 };
  const RIPPLE_SHAPE_OPTIONS: readonly { value: 'round' | 'bevel'; label: string }[] = [
    { value: 'round', label: 'round' },
    { value: 'bevel', label: 'bevel' },
  ];
  let riColor = $state(RIPPLE_INITIAL.color);
  let riHex = $state('#8b5cf6');
  let riDuration = $state(RIPPLE_INITIAL.duration);
  let riShape = $state<'round' | 'bevel'>(RIPPLE_INITIAL.shape);
  // the demo ships a VISIBLE softness (the param exists to be seen — 0
  // is the honest library default, the demo's job is to show the knob)
  let riSoft = $state(RIPPLE_INITIAL.soft);
  const rippleFx = $derived(ripple({ color: riColor, duration: riDuration, shape: riShape, soft: riSoft }));
  function resetRipple(): void {
    riColor = RIPPLE_INITIAL.color;
    riDuration = RIPPLE_INITIAL.duration;
    riShape = RIPPLE_INITIAL.shape;
    riSoft = RIPPLE_INITIAL.soft;
  }
  const rippleUsage = $derived(`<script lang="ts">
  import { pressEffect } from '@ui/press-button';
  import { ripple } from '@ui/press-button/press-button.svelte';
${close}

<!-- the leaf form — a plain element, the factory inline; the dock's live params -->
<button {@attach pressEffect(ripple({ color: ${q(riColor)}, duration: ${riDuration}, shape: '${riShape}', soft: ${riSoft} }))}>
  deploy — press me
</button>`);
  const rippleFiles: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'registry/files/ui/press-button/press-effect-runtime.ts', content: pressRuntimeSource },
    { name: 'src/lib/ui/ripple-usage.svelte', content: rippleUsage, kind: 'usage' },
  ];
  const resolveRippleUsage = (file: TreeFile): string =>
    file.name.endsWith('ripple-usage.svelte') ? rippleUsage : file.content;
</script>

<svelte:head>
  <title>Effects · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai effect family: effects are attachments, not components — the leaf form mounts a factory on your own element, the component-tag form reaches a host's root through its rest spread (data-jx-attach names the mounting point). Two residents share this home: glass (blur the zero-JS frost member, liquid the kube.io lens, liquid.apple the SwiftUI semantic layer) and the press loops (shimmer, pulse, rainbow, ripple). Params flow — replace, never mutate; two channels — data-jx-attach mounts, data-jx-effect paints."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Effects"
        title="effects — attachments, not components"
        summary={"The effect family's one law: an effect is an ATTACHMENT — a factory you mount on an element, never a component you render. The leaf form ({@attach pressEffect(shimmer())}) puts a loop on your own button; the component-tag form (<PressButton {@attach pressEffect(…) }>) reaches a host's root through its rest spread — data-jx-attach names the mounting point, the optional stamp. Every effect is element-level paint: it never owns semantics, never moves the body, and degrades honestly (frost before lens, frozen loops under reduced motion). Scroll-driven motion is a different domain — scroll-run owns it, linked below. Two residents share this home: glass (frost, the liquid lens, the SwiftUI semantic layer) and the press loops (shimmer, pulse, rainbow, ripple)."}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">leaf form · your own element</span>
          <span class="pill">component tag · the host's root</span>
          <span class="pill">fromAction · the action bridge</span>
          <span class="pill">params flow, never mutate</span>
          <span class="pill">data-jx-attach mounts · data-jx-effect paints</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
         ABOVE the demos — Intro → Install → Usage → Examples → API →
         See Also is the page law; the sections between stay page-local.
         The Install REGION teaches the FAMILY forms (effect-attachments
         Lane H, the r5 Owner request #2): `add effects` installs every
         ui member of the group (registry order) and is the primary
         command; `add effects/<member>` installs one member with its
         membership validated. The member blocks keep their item URLs;
         the family block has none — there is no `effects` registry
         item. -->
    <div data-reveal="">
      <div class="flex flex-col gap-3">
        <DocsInstall name="effects" item={null} />
        <DocsInstall name="effects/glass" item="glass" />
        <DocsInstall name="effects/press-button" item="press-button" />
      </div>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary={"Two mount forms and one bridge. Build the effect object with a typed builder, feed it to a factory, mount the factory — the whole {@attach} expression is the attachment, on a leaf element or a host's component tag alike. Never write into a mounted fx; never hand an action-shaped helper to {@attach} raw."}
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={usage} lang="svelte" meta="Effects usage" />
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            <strong class="text-foreground">The param-flow law.</strong> Params FLOW — derive the fx
            object ($derived) and let a change replace the factory call; never mutate a mounted fx in
            place. The channel has no update call: a replaced fx is a fresh closure, an identity
            remount (old teardown, fresh mount — the glass maps regenerate in single-digit ms). Deep
            mutation is a two-sided trap: the channel itself never deep-reads the param, but a
            $state-held fx registers fine-grained deps through the attachment body's own property
            reads — so mutation re-runs the attachment while the old closure stays captured. Replace,
            always.
          </p>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            <strong class="text-foreground">The two-channel law.</strong> <code>data-jx-attach</code>
            is the JS channel — WHERE effects mount: the host stamps it on the mounting-point
            element ('root' on press-button/chip/icon-button, 'indicator' on tabs). Its value is
            the point's name, nothing more — an optional, queryable stamp, never the forwarding
            mechanism (the component tag's rest spread is). <code>data-jx-effect</code> is the
            CSS channel — WHAT the law sheet paints (the glass frost/lens stamps). The two are
            orthogonal by design: the tabs liquid indicator carries both, and neither implies
            the other.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- Examples · glass — the playground canvas over the visual band -->
    <div id="glass" data-reveal="">
      <ComponentCanvas
        title="glass"
        description="The lens over a visual band — gradient text and a 24px grid give refraction something to refract (the approved prototype's backdrop recipe). The dock covers BOTH layers: the physical sliders feed liquid() directly, the variant row compiles liquid.apple(); the source lane emits the exact builder snippet. Drag the sliders — the searchbox, card and wide pill all ride ONE effect object through the identity remount."
        sourceUrl={registrySourceUrl('glass')}
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
                  {@attach liquidGlass(physicalFx)}
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
                  {@attach liquidGlass(physicalFx)}
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
                  {@attach liquidGlass(physicalFx)}
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
                  {@attach appleMount(liveAppleFx)}
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
                      {@attach appleMount(item.fx)}
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
                      {@attach appleMount(item.fx)}
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
              every change rides the mount's identity remount —
              <code>{'{@attach liquidGlass(fx)}'}</code> re-arms with
              the fresh closure, never a second code path. The variant row compiles
              <code>liquid.apple()</code> the same way: identity / isEnabled false maps to the frost
              member (zero lens cost), interactive stamps the press-motion var.
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
            meta="the glass builders"
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
                  <td class="text-muted-foreground p-2">frost — the unconditional base paint holds (attachments are SSR-inert; disable JS on this page: the band stays frosted)</td>
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
                  <td class="text-muted-foreground p-2">every press loop and the band scenery freeze; the interactive press choreography drops (motion is an enhancement too)</td>
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

    <!-- Examples · the press loops — ONE GALLERY PER EFFECT (the Owner
         review, 2026-09-08: showcase each effect and its parameters —
         neutral plain hosts, one dock over the builder's real params,
         one live sample; never the button component) -->

    <div id="shimmer" data-reveal="">
      <ComponentCanvas
        title="shimmer"
        description="press family · shimmer — the shine arc walks the BORDER BAND, painted ON THE HOST ITSELF (no child layer, no inset — the Owner's r11 ruling): the host's own border is the ring's geometry (width = ringW, color forced transparent, image forced hidden), and the double background — a fill layer clipped to the padding box over a rotating conic — clips through --shimmer-clip: border-area where Chrome 139+ answers (the TRUE cutout — a transparent face shows the band behind it), border-box elsewhere. The fill channel: a 0xRRGGBB number (solidFill() mints these from any CSS color against the context's light/dark base — try it over the animated band), or null for transparent (the blend emulation — white + darken in light contexts, black + lighten in dark — where border-area is missing). The hosts are NEUTRAL plain elements; drag the dock and every host rides ONE fx object through the identity remount."
        sourceUrl={registrySourceUrl('press-button')}
        files={shimmerFiles}
        stage="center"
        onreset={resetShimmer}
        output={[
          { label: 'speed', value: `${shSpeed}ms` },
          { label: 'shine-width', value: `${shShineWidth}deg` },
          { label: 'ring-w', value: `${shRingW}px` },
          { label: 'ring-color', value: shRingColor },
          { label: 'fill', value: shFillReadout },
        ]}
        resolveFileContent={resolveShimmerUsage}
      >
        <div
          class="glass-band fx-band isolate relative w-full overflow-hidden rounded-lg"
          data-fx-band="shimmer"
          aria-label="shimmer demo stage over the animated band"
        >
          <div class="glass-band-bg" aria-hidden="true"></div>
          <div class="glass-band-grid" aria-hidden="true"></div>
          <div class="fx-stage fx-stage-band relative" aria-label="shimmer demo stage">
            <button
              type="button"
              class="fx-host fx-host-fill"
              data-fx-demo="shimmer-fill"
              {@attach pressEffect(shimmerFx)}
            >
              deploy
            </button>
            <button
              type="button"
              class="fx-host fx-host-pill"
              data-fx-demo="shimmer-pill"
              {@attach pressEffect(shimmerFx)}
            >
              invite
            </button>
            <button
              type="button"
              class="fx-host fx-host-tile"
              data-fx-demo="shimmer-tile"
              aria-label="shimmer on a square tile"
              {@attach pressEffect(shimmerFx)}
            >
              <span aria-hidden="true">⌘</span>
            </button>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="shine" hint="the arc's color — the primary token by default, or any picked color">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={shShine === 'var(--primary)'}
                  onclick={() => (shShine = 'var(--primary)')}
                >
                  primary
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={shShine.startsWith('#') ? shShine : shShineHex}
                  oninput={(event) => {
                    shShineHex = event.currentTarget.value;
                    shShine = shShineHex;
                  }}
                  aria-label="shimmer shine color"
                />
              </div>
            </PlayRow>
            <PlayRow label="ring-color" hint="the ring's rest color — currentColor by default (the host's own ink), or any picked color">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={shRingColor === 'currentColor'}
                  onclick={() => (shRingColor = 'currentColor')}
                >
                  currentColor
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={shRingColor.startsWith('#') ? shRingColor : shRingHex}
                  oninput={(event) => {
                    shRingHex = event.currentTarget.value;
                    shRingColor = shRingHex;
                  }}
                  aria-label="shimmer ring color"
                />
              </div>
            </PlayRow>
            <PlayRow label="fill" hint="auto = the context's base, opaque · a color = solidFill() mints the number · transparent = null (the cutout, or the blend emulation)">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={shFill === undefined}
                  onclick={() => (shFill = undefined)}
                >
                  auto
                </button>
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={shFill === null}
                  onclick={() => (shFill = null)}
                >
                  transparent
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={shFillHex}
                  oninput={(event) => {
                    shFillHex = event.currentTarget.value;
                    shFill = solidFill(shFillHex);
                  }}
                  aria-label="shimmer fill color"
                />
              </div>
            </PlayRow>
            <PlayRow label="shine-width" hint="10–180deg · the arc's angular footprint">
              <PlayRange bind:value={shShineWidth} min={10} max={180} step={5} />
            </PlayRow>
            <PlayRow label="speed" hint="400–12000ms · one full revolution of the arc">
              <PlayRange bind:value={shSpeed} min={400} max={12000} step={100} />
            </PlayRow>
            <PlayRow label="ring-w" hint="1–8px · the HOST's border-width — the border IS the ring">
              <PlayRange bind:value={shRingW} min={1} max={8} step={0.5} />
            </PlayRow>
            <PlayHelp>
              six knobs — <code>shine</code> (defaults to the primary token), <code>ringColor</code>
              (the ring's rest color, default currentColor — the host's own ink),
              <code>fill</code>, <code>shineWidth</code>, <code>speed</code>,
              <code>ringW</code> (a number is px; any CSS length string works).
              <code>fill</code> is the number channel: undefined rides the color-scheme system
              color <code>Canvas</code> (the face follows the Context's dark/light live — light →
              white, dark → black), an explicit number comes from
              <code>solidFill(cssColor)</code> (composited over the context's light/dark base), or
              <code>null</code> for transparent — the true cutout where the engine clips
              <code>border-area</code>, the white/black + <code>darken</code>/<code>lighten</code>
              blend emulation where it does not (best seen over the animated band). The deeper knob
              <code>--shimmer-shine-start</code> (the arc's head angle) is an inheritable var. A
              dock change REPLACES the fx (a fresh closure, an identity remount) — params flow,
              never mutate. The loop freezes under reduced motion.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="pulse" data-reveal="">
      <ComponentCanvas
        title="pulse"
        description="press family · pulse — sonar rings breathe outward from the body's own silhouette: a negative-z copy of the body casts expanding box-shadows, and the variant picks the breathing curve — slow expands and fades, ring holds then dissolves at its extent and re-condenses, ripple eases out on a settling curve. Neutral plain hosts, one fx object, identity remounts."
        sourceUrl={registrySourceUrl('press-button')}
        files={pulseFiles}
        stage="center"
        onreset={resetPulse}
        output={[
          { label: 'variant', value: puVariant },
          { label: 'duration', value: `${puDuration}ms` },
          { label: 'distance', value: `${pulseDistance}em` },
        ]}
        resolveFileContent={resolvePulseUsage}
      >
        <div
          class="glass-band fx-band isolate relative w-full overflow-hidden rounded-lg"
          data-fx-band="pulse"
          aria-label="pulse demo stage over the animated band"
        >
          <div class="glass-band-bg" aria-hidden="true"></div>
          <div class="glass-band-grid" aria-hidden="true"></div>
          <div class="fx-stage fx-stage-band relative" aria-label="pulse demo stage">
          <button
            type="button"
            class="fx-host fx-host-fill"
            data-fx-demo="pulse-fill"
            {@attach pressEffect(pulseFx)}
          >
            deploy
          </button>
          <button
            type="button"
            class="fx-host fx-host-pill"
            data-fx-demo="pulse-pill"
            {@attach pressEffect(pulseFx)}
          >
            invite
          </button>
          <button
            type="button"
            class="fx-host fx-host-tile"
            data-fx-demo="pulse-tile"
            aria-label="pulse on a square tile"
            {@attach pressEffect(pulseFx)}
          >
            <span aria-hidden="true">⌘</span>
          </button>
        </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="variant" hint="the breathing curve — slow: expand-and-fade · ring: breathe out and back · ripple: eased expand-fade">
              <PlaySegmented bind:value={puVariant} options={PULSE_VARIANT_OPTIONS} />
            </PlayRow>
            <PlayRow label="duration" hint="600–8000ms · one ring cycle">
              <PlayRange bind:value={puDuration} min={600} max={8000} step={100} />
            </PlayRow>
            <PlayRow label="distance" hint="0.2–3em · how far the ring expands from the body">
              <PlayRange bind:value={puDistance} min={0.2} max={3} step={0.05} />
            </PlayRow>
            <PlayRow label="color" hint="the ring color — any CSS color; var(--primary) is the builder's default">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={puColor === 'var(--primary)'}
                  onclick={() => (puColor = 'var(--primary)')}
                >
                  var(--primary)
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={puColor.startsWith('#') ? puColor : puHex}
                  oninput={(event) => {
                    puHex = event.currentTarget.value;
                    puColor = puHex;
                  }}
                  aria-label="pulse ring color"
                />
              </div>
            </PlayRow>
            <PlayHelp>
              the silhouette copy is the runtime's own layer (<code>background: inherit</code>),
              so the rings follow the HOST's shape — pill hosts breathe as pills. Same law as
              every gallery: the dock's fx flows through the identity remount, never a
              mutation; reduced motion freezes the rings.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="rainbow" data-reveal="">
      <ComponentCanvas
        title="rainbow"
        description="press family · rainbow — shimmer's SIBLING on the same host-channel technique (r13): the host's own border IS the flowing ring (width = ringW, forced transparent + image hidden), the wrap-stop train rides background layer 2 through the same border-area gate and fill channel (auto = Canvas theme-live / null = the true cutout / a solidFill() number), and the registered shift's one animation on the host drives the unchanged blurred under-glow below through inheritance. Neutral plain hosts, one fx object, identity remounts."
        sourceUrl={registrySourceUrl('press-button')}
        files={rainbowFiles}
        stage="center"
        onreset={resetRainbow}
        output={[
          { label: 'speed', value: `${rbSpeed}ms` },
          { label: 'stops', value: String(rbColors.length) },
          { label: 'ring-w', value: `${rbRingW}px` },
          { label: 'fill', value: rbFillReadout },
        ]}
        resolveFileContent={resolveRainbowUsage}
      >
        <div
          class="glass-band fx-band isolate relative w-full overflow-hidden rounded-lg"
          data-fx-band="rainbow"
          aria-label="rainbow demo stage over the animated band"
        >
          <div class="glass-band-bg" aria-hidden="true"></div>
          <div class="glass-band-grid" aria-hidden="true"></div>
          <div class="fx-stage fx-stage-band relative" aria-label="rainbow demo stage">
          <button
            type="button"
            class="fx-host fx-host-fill"
            data-fx-demo="rainbow-fill"
            {@attach pressEffect(rainbowFx)}
          >
            upgrade
          </button>
          <button
            type="button"
            class="fx-host fx-host-pill"
            data-fx-demo="rainbow-pill"
            {@attach pressEffect(rainbowFx)}
          >
            subscribe
          </button>
          <button
            type="button"
            class="fx-host fx-host-tile"
            data-fx-demo="rainbow-tile"
            aria-label="rainbow on a square tile"
            {@attach pressEffect(rainbowFx)}
          >
            <span aria-hidden="true">⌘</span>
          </button>
        </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="ring-w" hint="1–8px · the HOST's border-width — the border IS the flowing ring">
              <PlayRange bind:value={rbRingW} min={1} max={8} step={0.5} />
            </PlayRow>
            <PlayRow label="fill" hint="auto = Canvas (theme-live) · a color = solidFill() mints the number · transparent = null (the cutout, or the blend emulation)">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={rbFill === undefined}
                  onclick={() => (rbFill = undefined)}
                >
                  auto
                </button>
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={rbFill === null}
                  onclick={() => (rbFill = null)}
                >
                  transparent
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={rbFillHex}
                  oninput={(event) => {
                    rbFillHex = event.currentTarget.value;
                    rbFill = solidFill(rbFillHex);
                  }}
                  aria-label="rainbow fill color"
                />
              </div>
            </PlayRow>
            <PlayRow label="speed" hint="500–8000ms · the flow pace — one full 200% pan of the stop train">
              <PlayRange bind:value={rbSpeed} min={500} max={8000} step={100} />
            </PlayRow>
            <PlayRow label="colors" hint="the five gradient stops, first-to-last along the flowing rim — the builder's own array param">
              <div class="fx-colors">
                {#each rbColors as stop, index (index)}
                  <input
                    class="fx-color-input"
                    type="color"
                    value={hexOf(stop)}
                    oninput={(event) => (rbColors[index] = event.currentTarget.value)}
                    aria-label={`rainbow stop ${index + 1}`}
                  />
                {/each}
              </div>
            </PlayRow>
            <PlayHelp>
              the ring and the under-glow are the runtime's two layer spans; the host keeps
              ONLY the pace and stop vars inline — its background is never touched, so a
              transparent host shows the flowing rim and nothing else. The stops stay a
              five-tuple because the law sheet's stop train reads <code>--c1</code> through
              <code>--c5</code>; a pick writes its hex straight into the array, and reset
              returns the builder's five hsl primes. Reduced motion parks the pan.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="ripple" data-reveal="">
      <ComponentCanvas
        title="ripple"
        description="press family · ripple — ink expands from the exact press point: the factory listens for its own pointerdown (Enter / Space spawn centered ink, no-op while disabled or aria-disabled), a css-animated svg dot scales to the body's long side, its soft edge an optional feGaussianBlur (the soft param — 0 disables the filter), and the seat inherits the host's own border-radius with overflow hidden so the ink stays inside the rim — and the node leaves the DOM on animationend. round pins against the site-wide bevel law; bevel cuts the corners into a diamond. PRESS THE HOSTS — this is the family's one gesture-driven loop."
        sourceUrl={registrySourceUrl('press-button')}
        files={rippleFiles}
        stage="center"
        onreset={resetRipple}
        output={[
          { label: 'duration', value: `${riDuration}ms` },
          { label: 'soft', value: `${riSoft}px` },
          { label: 'shape', value: riShape },
          { label: 'color', value: riColor },
        ]}
        resolveFileContent={resolveRippleUsage}
      >
        <div
          class="glass-band fx-band isolate relative w-full overflow-hidden rounded-lg"
          data-fx-band="ripple"
          aria-label="ripple demo stage over the animated band"
        >
          <div class="glass-band-bg" aria-hidden="true"></div>
          <div class="glass-band-grid" aria-hidden="true"></div>
          <div class="fx-stage fx-stage-band relative" aria-label="ripple demo stage">
          <button
            type="button"
            class="fx-host fx-host-fill"
            data-fx-demo="ripple-fill"
            {@attach pressEffect(rippleFx)}
          >
            deploy — press me
          </button>
          <button
            type="button"
            class="fx-host fx-host-pill"
            data-fx-demo="ripple-pill"
            {@attach pressEffect(rippleFx)}
          >
            invite — press me
          </button>
          <button
            type="button"
            class="fx-host fx-host-tile"
            data-fx-demo="ripple-tile"
            aria-label="ripple on a square tile — press me"
            {@attach pressEffect(rippleFx)}
          >
            <span aria-hidden="true">⌘</span>
          </button>
        </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="shape" hint="the ink silhouette — round: a circle pinned against the bevel law · bevel: the corners cut into a diamond">
              <PlaySegmented bind:value={riShape} options={RIPPLE_SHAPE_OPTIONS} />
            </PlayRow>
            <PlayRow label="duration" hint="150–2000ms · one ink expansion">
              <PlayRange bind:value={riDuration} min={150} max={2000} step={50} />
            </PlayRow>
            <PlayRow label="soft" hint="0–4px · the svg feGaussianBlur edge — 0 disables the filter entirely (the library default); the demo ships 1.5 so the softness shows">
              <PlayRange bind:value={riSoft} min={0} max={4} step={0.25} />
            </PlayRow>
            <PlayRow label="color" hint="the ink color — any CSS color; currentColor rides the host's own text">
              <div class="fx-color">
                <button
                  type="button"
                  class="fx-color-token"
                  aria-pressed={riColor === 'currentColor'}
                  onclick={() => (riColor = 'currentColor')}
                >
                  currentColor
                </button>
                <input
                  class="fx-color-input"
                  type="color"
                  value={riColor.startsWith('#') ? riColor : riHex}
                  oninput={(event) => {
                    riHex = event.currentTarget.value;
                    riColor = riHex;
                  }}
                  aria-label="ripple ink color"
                />
              </div>
            </PlayRow>
            <PlayHelp>
              the ink fires on POINTERDOWN — the factory owns its gesture surface, so it
              cannot see a host's loading lock (the documented price; mounting consumers
              that need the lock wrap the factory with their own gating). Keyboard activation
              centers the ink; reduced motion never spawns it — the anchored press answers
              the pointer instead.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
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
          { name: '--jx-glass-filter', default: 'mount-written', source: 'component', description: 'The url(#id) pointer to the lens filter — written ONLY by the mount after appending the filter node, never in markup. Hand-writing it is documented misuse.' },
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
      summary="Builders build typed fx objects (pure — they never touch the document); factories turn an fx into an attachment; hosts expose named hooks. Glass numeric args clamp into range, NaN / ±Infinity / non-finite throws TypeError at construction, surface validates against the enum."
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
        <PropsTable
          title="the press builders — shimmer / pulse / rainbow / ripple"
          props={[
            { name: 'shimmer(o)', type: 'ShimmerEffect', default: 'see below', description: 'The shine arc walks the host’s OWN border — the effect paints the HOST ITSELF (no child layer, no inset): border-width = ringW with color forced transparent and image forced hidden, the double background (a fill layer clipped to the padding box over a rotating conic) clipped through --shimmer-clip — border-area where Chrome 139+ answers (the TRUE cutout), border-box elsewhere. Options: shine? (any CSS color, default var(--primary)), ringColor? (the ring’s REST color — the band the arc walks on, default currentColor), fill? (the FACE: an opaque 0xRRGGBB number — solidFill(cssColor) mints these by compositing over the context’s light/dark base — or null for transparent; default = the color-scheme system color Canvas — light/dark follows the Context live), shineWidth? (the arc’s angular width, default 30deg), speed? (one full revolution, in ms, default 3000), ringW? (number = px, or any CSS length string, default 4). A null fill where border-area is missing rides the blend emulation: light context → white + mix-blend-mode darken, dark → black + lighten. Inheritable: --shimmer-shine-start (the arc’s head angle, default 280deg).' },
            { name: 'pulse(o)', type: 'PulseEffect', default: 'see below', description: 'Sonar rings breathe outward from the body’s silhouette. Options: color? (default var(--primary)), duration? (default 2500ms), distance? (default 0.7em), variant? — slow | ring | ripple (default slow).' },
            { name: 'rainbow(o)', type: 'RainbowEffect', default: 'see below', description: 'Shimmer’s sibling on the SAME host-channel technique (r13): the host’s own border IS the flowing ring (border-width = ringW, color forced transparent, image hidden); the wrap-stop train (a registered --jx-rainbow-shift pans the stops through one seamless 200% cycle — top, bottom, both sides alike) rides background layer 2 through the same border-area gate and fill channel as shimmer (fill: an opaque 0xRRGGBB number from solidFill(), null for the true cutout / blend emulation, default Canvas — light/dark follows the Context live); the blurred under-glow below is unchanged and inherits the shift. Options: speed? (the flow pace in ms, default 2000), colors? (a non-empty array, default five hsl primes), ringW? (number = px, or any CSS length string, default 4), fill? (number | null).' },
            { name: 'ripple(o)', type: 'RippleEffect', default: 'see below', description: 'Ink expands from the exact press point, centered on keyboard activation — a css-animated svg dot with an optional feGaussianBlur soft edge (soft, default 0 — 0 disables the filter), riding a seat that inherits the host’s border-radius with overflow hidden, removed on animationend. Options: color? (default currentColor), duration? (default 600ms), soft? (default 0), shape? — round | bevel (bevel cuts the corners into a diamond).' },
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
          title="the attachment factories + the bridge"
          props={[
            { name: 'liquidGlass(fx)', type: 'Attachment<HTMLElement>', default: '—', description: 'The glass factory: {@attach liquidGlass(fx)} is the whole mount — stamps vars, measures, canvas-encodes the maps, appends the chain, writes the pointer LAST. A replaced fx re-runs the factory (identity remount — teardown + rebuild, maps regenerate in single-digit ms; frost stands during the swap). ResizeObserver rAF-coalesced regeneration; the no-canvas and zero-box guards leave frost standing.' },
            { name: 'pressEffect(fx)', type: 'Attachment<HTMLElement>', default: '—', description: 'The press factory — SELF-LISTENING (Owner ruling): pointerdown/pointerup + keydown Enter/Space, no-op while the element matches :disabled / [aria-disabled="true"] (re-checked per event), reduced-motion gated inside; teardown cancels WAAPI + listeners and strips the stamped layers/vars/classes. Documented price: the ripple ink fires on POINTERDOWN and cannot see a host’s loading lock — mounting consumers that need the lock wrap the factory with their own gating.' },
            { name: 'fromAction(action, fn?)', type: "from 'svelte/attachments'", default: '—', description: 'The bridge for ACTION-shaped helpers (update/destroy objects — third-party or the repo’s own internals): calls action(element, fn()) once, update(arg) when the getter’s value changes (reference-level), destroy on teardown. Never hand an action to {@attach} raw — the object return is silently dropped (the leak counter-example in the spec battery).' },
            { name: 'attachLiquidGlass(el, fx)', type: '(HTMLElement, LiquidGlassEffect) => { update, destroy }', default: '—', description: 'The framework-agnostic glass kernel — what the factory wraps (the ripple precedent: effects may own runtime JS).' },
          ]}
        />
        <PropsTable
          title="the mounting points — data-jx-attach, the optional named stamps"
          props={[
            { name: 'press-button', type: "'root'", default: '—', description: 'The root element carries data-jx-attach=\'root\'; attach through the component tag — <PressButton {@attach pressEffect(shimmer())}> — the rest spread lands it on the button/anchor, inside the press law.' },
            { name: 'chip', type: "'root'", default: '—', description: 'The root element carries data-jx-attach=\'root\'; attach through the component tag — the compact rung of the press family takes the same attachment shape.' },
            { name: 'icon-button', type: "'root'", default: '—', description: 'The chain: this component\'s rest spread forwards into the wrapped PressButton\'s own spread — one attachment surface, two hops, landing at the same root button.' },
            { name: 'tabs', type: "'indicator'", default: '—', description: 'The shared indicator element carries data-jx-attach=\'indicator\' as its OPTIONAL named stamp; the mount itself is the component\'s OWN material business (indicator=\'liquid\' derives it — no consumer reach onto the engine-owned element). The element can carry BOTH channels: the stamp (the JS naming) and data-jx-effect (the paint stamp).' },
          ]}
        />
        <PropsTable
          title="the stamp helpers"
          props={[
            { name: 'glassAttrs(fx)', type: 'Record<string, string>', default: 'spread', description: 'Stamps data-jx-effect + the vars style. For liquid it carries the tuning vars ONLY — the --jx-glass-filter pointer belongs to the mount exclusively, never to markup.' },
            { name: 'glassVars(fx)', type: 'string', default: '—', description: 'The vars string alone (the style attribute’s glass payload, semicolon-joined).' },
          ]}
        />
        <PropsTable
          title="PressButton — the component-tag form's first host (public contract)"
          props={[
            { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost' | 'link'", default: "'outline' · ambient zone", description: 'Selects the ladder rung; link is the interaction exception. Omitted → the ambient paint zone (ButtonGroup / variant scope), else the frozen own. Semantic hue injects through --jx-fill/--jx-fill-ink, --jx-tonal, --jx-outline classes at the call site.' },
            { name: '{@attach …} (component tag)', type: 'Attachment<HTMLElement>', default: '—', description: 'The effect mount (r4): <PressButton {@attach pressEffect(shimmer())}> — the tag compiles to a symbol-keyed prop, the rest spread lands it on the stamped root. An undefined value skips (never a crash); a replaced fx is an identity remount.' },
            { name: '…rest', type: 'HTMLAttributes<HTMLElement>', default: '—', description: 'The rest lane: arbitrary attributes land verbatim on the root (button or anchor) — the same lane the component-tag attachment rides.' },
            { name: 'href', type: 'string', default: '—', description: 'Renders an anchor and navigates to the target; hrefs not starting with / open a new tab with noreferrer automatically.' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'The async pose: aria-disabled=true (focusable), pointer AND keyboard activation suppressed, href navigation blocked, spinner glyph in the leading lane. Press law holds unchanged. Pair with the one-shot flash() helper (bind:this) on settle.' },
            { name: 'raised', type: 'boolean', default: "'true' · ambient zone", description: 'The physics axis, orthogonal to paint: false is the FLAT texture — no rest/hover shadow, the body never moves, an engrave-tier inset alone creates the press. Inert on link.' },
            { name: 'onclick', type: '() => void', default: '—', description: 'Runs for button activation.' },
            { name: 'children', type: 'Snippet', required: true, description: 'Button label and optional inline icon content — the label is a snippet, so icons compose inline with the component’s own gap.' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="migration" data-reveal="">
    <SectionCard
      family="migration"
      headerRegion="migration"
      eyebrow="migration"
      title="Migrating to attachments"
      summary="The effect-attachments migration (2026-09-09; r4 2026-09-10) retired the action-directive mounts, the builder-prop form and the attachments record: every effect now mounts through a factory — the leaf form on your own elements, the component-tag form through hosts."
    >
      <div class="flex flex-col gap-5">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[560px] border-collapse text-left text-[12.5px]">
            <tbody class="align-top">
              <tr class="border-border/60 border-b">
                <td class="w-[280px] p-2 font-mono">{'use:pressEffect(fx)'}</td>
                <td class="text-muted-foreground p-2">→ <code>{'{@attach pressEffect(fx)}'}</code> — the same factory, the attachment channel. The element-level action directive is retired repo-wide; the canary in the spec battery holds it at zero.</td>
              </tr>
              <tr class="border-border/60 border-b">
                <td class="p-2 font-mono">{'<PressButton effect={…}>'}</td>
                <td class="text-muted-foreground p-2">→ <code>{'<PressButton {@attach pressEffect(shimmer())}>'}</code> — the builder-prop retired with the host’s effect branches, and the r4 review retired the record that briefly replaced it: the component tag is the one uniform syntax, the host’s rest spread lands it at the stamped root. Chip’s default ripple died with its prop — attach through the tag.</td>
              </tr>
              <tr class="border-border/60 border-b">
                <td class="p-2 font-mono">{'<PressButton attachments={{ root: … }}>'}</td>
                <td class="text-muted-foreground p-2">→ <code>{'<PressButton {@attach pressEffect(…)}>'}</code> — the attachments record (r2’s interim shape) retired with r4: the same mount through the tag, one less prop, the same stamped root.</td>
              </tr>
              <tr class="border-border/60 border-b">
                <td class="p-2 font-mono">{'use:liquidGlass(fx)'}</td>
                <td class="text-muted-foreground p-2">→ <code>{'{@attach liquidGlass(fx)}'}</code> — liquidGlass IS the factory now; the kernel (attachLiquidGlass) stays exported for framework-agnostic use.</td>
              </tr>
              <tr class="border-border/60 border-b">
                <td class="p-2 font-mono">{'use:someAction(el, p)'}</td>
                <td class="text-muted-foreground p-2">→ <code>{'{@attach fromAction(someAction, () => p)}'}</code> — action-shaped helpers (update/destroy objects) MUST ride the bridge: a bare attach silently drops the object return and leaks (the spec battery’s counter-example). This is also how the repo’s own internals mounted.</td>
              </tr>
              <tr>
                <td class="p-2 font-mono">toast’s ToastEffect</td>
                <td class="text-muted-foreground p-2">NOT this family — a material stamp (the toast surface’s own paint), untouched by the migration; its battery stays green, canary-guarded.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          The glass channel’s earlier migration rides the same page: the retired hand-tuned
          <code>.jx-glass</code> class is a stamp-channel member now — <code>blur()</code> defaults
          ARE the retired values verbatim (14px · 1.35 · background 68%), so an unconfigured
          migration is computed-equivalent by construction; a migration canary source-scans for
          stray <code>jx-glass</code> references so the old class cannot quietly return. Tuned
          surfaces name their values through the same builder — toast 12px / saturate 1 / popover
          55%, tabs glass 10px / 1.5 / 40%, tabs liquid the lens itself at frost 2px / 1.6.
        </p>
        <CodeBlock
          code={`<!-- the frost channel, BEFORE the class retired:
     <div class="jx-glass …">…</div> — NOW the stamp channel -->
<div {...glassAttrs(blur())} class="frosted-panel">…</div>

<!-- a tuned surface names its values through the same builder -->
<div {...glassAttrs(blur({ radius: '12px', saturate: 1 }))} class="toast-ground">…</div>`}
          lang="svelte"
          meta="the frost migration"
        />
      </div>
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="glass" />
    <div class="mt-3 flex flex-wrap gap-3">
      <a class="pill" href="/docs/components/scroll-run.html">scroll-run — the motion domain (out of family by ruling)</a>
      <a class="pill" href="/docs/components/tabs.html">tabs — the liquid indicator demo (both channels)</a>
      <a class="pill" href="/tokens.html">tokens — theming &amp; the stamp channel</a>
    </div>
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

  /* the press effect galleries (Owner review 2026-09-08): the EFFECT is
     the protagonist — the stage is a plain page-background card and the
     hosts are neutral plain elements defined ONCE here (never the button
     component, never jx- classes). The runtime stamps the stacking pose
     (relative z-0) itself; these rules own only the neutral chrome. */
  .fx-stage {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1.75rem;
    padding: 2.75rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--background, Canvas);
  }
  /* the press galleries ride the glass band's animated scenery (the
     Owner's r11 ruling: the blend/cutout fills need something to
     blend against); the stage sheds its own card chrome so the band
     reads, and the wrapper isolates so the hosts' mix-blend-mode
     composites against the band, never the page behind it */
  .fx-band {
    border: 1px solid var(--border);
  }
  .fx-stage-band {
    border: none;
    background: transparent;
    padding: 5.5rem 1.5rem;
  }
  .fx-host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    margin: 0;
    border: 1px solid var(--border);
    padding: 0;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    color: var(--foreground);
    cursor: pointer;
  }
  .fx-host:focus-visible {
    outline: 2px solid var(--ring, var(--primary));
    outline-offset: 2px;
  }
  .fx-host-fill {
    height: 40px;
    padding: 0 18px;
    border-radius: 10px;
    background: var(--card);
  }
  .fx-host-pill {
    height: 40px;
    padding: 0 20px;
    border-radius: 999px;
    background: transparent;
  }
  .fx-host-tile {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--card);
    font-size: 16px;
  }
  /* the color rows — a token chip (the builder default, unpickable in a
     color input) beside the picker whose pick overrides it */
  .fx-color,
  .fx-colors {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .fx-colors {
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .fx-color-token {
    appearance: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .fx-color-token[aria-pressed='true'] {
    color: var(--foreground);
    border-color: color-mix(in oklab, var(--foreground) 25%, transparent);
    background: color-mix(in oklab, var(--foreground) 6%, transparent);
  }
  .fx-color-input {
    appearance: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: transparent;
    width: 2.5rem;
    height: 1.9rem;
    padding: 2px;
    cursor: pointer;
  }
  .fx-color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .fx-color-input::-webkit-color-swatch,
  .fx-color-input::-moz-color-swatch {
    border: none;
    border-radius: 5px;
  }
</style>
