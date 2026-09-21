<!--
  boot-splash — canonical page (the FOUC round, 2026-09-19 — Owner
  design). The mask whose styles cannot be late. Demo-standard
  skeleton: Intro → Install → Usage → Examples → a11y/theming → API →
  See Also.
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import BootSplash from '$lib/ui/boot-splash';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'boot-splash')?.summary;
  if (!heroSummary) throw new Error('catalog entry "boot-splash" is missing — registry.json meta drift');

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import bootSplashSource from '$lib/ui/boot-splash/boot-splash.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import WebsiteScaffold from '@ui/website-scaffold';
  import BootSplash from '@ui/boot-splash';
${close}

<WebsiteScaffold>
  {#snippet splash()}
    <BootSplash
      title="your-app"
      subtitle="the design language"
      description="loading the style sheet…"
      exit="blur-out"
    />
  {/snippet}

  <!-- the page itself -->
</WebsiteScaffold>`;

  // ---- the workbench: replay the mask, swap the exit + signal live ----
  type Exit = 'opacity-out' | 'blur-out' | 'none';
  type Signal = 'fonts' | 'load' | 'manual';
  let splashOpen = $state(false);
  let exit = $state<Exit>('blur-out');
  let revealOn = $state<Signal>('fonts');
  const canvasInitial = { exit: 'blur-out' as Exit, revealOn: 'fonts' as Signal };
  function resetCanvas(): void {
    splashOpen = false;
    exit = canvasInitial.exit;
    revealOn = canvasInitial.revealOn;
  }
  const usageLive = $derived(`<script lang="ts">
  import BootSplash from '@ui/boot-splash';
${close}

<BootSplash
  open={splashOpen}
  exit="${exit}"
  revealOn="${revealOn}"
  title="your-app"
  description="loading the style sheet…"
/>`);
  const files: TreeFile[] = [
    { name: 'registry/files/ui/boot-splash/boot-splash.svelte', content: bootSplashSource },
    { name: 'src/lib/ui/boot-splash-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // the page's local join (the separator serialize law)
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
  let universalSplashOpen = $state(false);
  // ---- the universal props demo (explicit-props W3-D5) --------------------
  const universalUsage = `<BootSplash title="your-app" revealOn="manual" open={splashOpen} size={18} />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/universal-props-demo.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Boot Splash · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai boot-splash component: the FOUC mask — a splash layer whose styles cannot be late. Every style rides the HTML itself (inline attributes + a head-carried style block SSR renders inline, never an async chunk), so it paints before any stylesheet and covers the unstyled window. Five slots (logo, loading, title, subtitle, description), the opacity-out | blur-out exit vocabulary, and reveal signals (fonts | load | manual) with a timeout cap."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="boot-splash — the mask whose styles cannot be late"
        summary={heroSummary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">zero css files · by law</span>
          <span class="pill">inline styles + head-carried keyframes</span>
          <span class="pill">SMIL svg spinner default</span>
          <span class="pill">opacity-out · blur-out exits</span>
          <span class="pill">noscript + reduced-motion escapes</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="boot-splash" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Mount it inside WebsiteScaffold's splash snippet — the scaffold carries the seat at its host root, the splash renders before the page chrome and dismisses itself when the sheet settles."
      >
        <CodeBlock code={usage} lang="svelte" meta="BootSplash usage" />
      </SectionCard>
    </div>

    <!-- workbench: replay the mask -->
    <div id="boot-splash-workbench" data-region="boot-splash-workbench" data-reveal="">
      <ComponentCanvas
        title="boot-splash"
        description="Replay the mask: the layer covers the viewport (fixed, z-max, pointer-events none — clicks pass through), holds through the display floor, then runs the chosen exit. This page's fonts are already settled, so 'fonts' and 'load' both dismiss after the 350ms floor; 'manual' holds until you dismiss it."
        sourceUrl={registrySourceUrl('boot-splash')}
        {files}
        stage="center"
        onreset={resetCanvas}
        output={[
          { label: 'exit', value: exit },
          { label: 'revealOn', value: revealOn },
          { label: 'open', value: String(splashOpen) },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
          <div class={cx(rt.rowC16)}>
            <button class="pill" onclick={() => (splashOpen = true)}>
              replay the splash
            </button>
            {#if revealOn === 'manual' && splashOpen}
              <button class="pill" onclick={() => (splashOpen = false)}>
                dismiss (bind:open → the exit runs)
              </button>
            {/if}
          </div>
          <p class={cx(rt.bodyMuted, rt.pretty)}>
            The layer you just saw IS the component: hardcoded grounds (light
            and <code class={cx(rt.inkAccent)}>prefers-color-scheme</code> dark pairs), the default
            SMIL arc spinner, and the exit keyframes — all carried in the
            document itself. Nothing about it can arrive late.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="exit">
              <PlaySelect bind:value={exit} options={[{ value: 'opacity-out', label: 'opacity-out' }, { value: 'blur-out', label: 'blur-out' }, { value: 'none', label: 'none' }]} />
            </PlayRow>
            <PlayRow label="revealOn">
              <PlaySelect bind:value={revealOn} options={[{ value: 'fonts', label: 'fonts (document.fonts.ready)' }, { value: 'load', label: 'load (window load)' }, { value: 'manual', label: 'manual (bind:open)' }]} />
            </PlayRow>
            <PlayHelp>
              Every replay mounts a fresh layer: fonts/load dismiss at the
              floor, manual waits for your dismiss button — and that dismiss
              rides the same exit vocabulary (open flipping false runs the
              leaving phase, animationend unmounts).
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- the law -->
    <div id="zero-css" data-reveal="">
      <SectionCard
        family="zero-css"
        headerRegion="zero-css"
        eyebrow="the law"
        title="The zero-css-file law"
        summary="The component imports no css, no atoms, no tokens. Element styles live in inline style attributes; the sheet-level vocabulary — light/dark grounds, the exit keyframes, the reduced-motion and noscript escapes — rides a style block inside svelte:head, which SSR renders inline into the document. Any external stylesheet would reintroduce the very race this layer exists to hide."
      >
        <CodeBlock
          code={`<!-- what the served HTML carries (view-source on this site's own boot): -->
<style data-jx-boot-splash>
  .jx-boot-splash-layer { position: fixed; inset: 0; z-index: 2147483647; … }
  @media (prefers-color-scheme: dark) { … }
  @keyframes jx-boot-splash-blur-out { to { opacity: 0; filter: blur(14px); } }
</style>
<noscript><style>.jx-boot-splash-layer { display: none !important; }</style></noscript>

<div data-jx-splash="layer" class="jx-boot-splash-layer" role="status" …>
  <!-- the SMIL spinner: animateTransform rides the SVG itself -->
</div>`}
          lang="html"
          meta="the delivered bytes"
        />
      </SectionCard>
    </div>

    <!-- slots -->
    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="slots"
        title="The five slots"
        summary="logo (the brand mark) · loading (the animation — default: a hardcoded SMIL arc spinner, zero css by construction; compose a spin-pack loader here) · title · subtitle · description (progress or time-consuming copy). Text slots are plain strings; the two composition slots are snippets."
      >
        <CodeBlock
          code={`<BootSplash
  title="your-app"
  subtitle="the terminal design language"
  description="loading the style sheet…"
  exit="blur-out"
>
  {#snippet logo()}
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><!-- your mark --></svg>
  {/snippet}
  {#snippet loading()}
    <!-- any spin-pack loader: its svg carries its own inline styles -->
  {/snippet}
</BootSplash>`}
          lang="svelte"
          meta="the full surface"
        />
      </SectionCard>
    </div>

    <!-- exits -->
    <div id="exits" data-reveal="">
      <SectionCard
        family="exits"
        headerRegion="exits"
        eyebrow="exits"
        title="Exit vocabulary — opacity-out · blur-out · none"
        summary="The keyframes live in the same head block; the animationend hands control back (open flips false, the layer unmounts). prefers-reduced-motion skips the animation; the manual mode's bind:open flip rides the identical leaving phase."
      >
        <CodeBlock
          code={`exit="opacity-out"  → to { opacity: 0 }
exit="blur-out"     → to { opacity: 0; filter: blur(14px) }
exit="none"         → no phase: the floor elapsed, the layer unmounts`}
          lang="css"
          meta="the three exits"
        />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="accessibility" data-reveal="">
    <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The layer is role=status (labelled by the title) — a polite loading announcement. It is pointer-events: none by law: a fast click during the boot window passes through to the (unstyled but functional) page beneath. noscript hides the layer entirely; reduced-motion skips the exit; the timeout cap guarantees the page is never held hostage.">
      <PropsTable universal props={[
        { name: 'role', type: '"status"', default: 'component-owned', description: 'A polite live region — screen readers announce the loading state once, without interrupting.' },
        { name: 'aria-label', type: 'string', default: 'the title prop (fallback "loading")', description: 'Names the status region.' },
        { name: 'pointer-events', type: 'none', default: 'always', description: 'The mask is visual-only — it can never eat input, so the unstyled page beneath stays operable through the boot window.' },
      ]} />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Tokens" summary="None — by law. The grounds are hardcoded light/dark pairs behind prefers-color-scheme: the token sheet may not have arrived yet, so the layer carries its own ink in both schemes. It is the one surface in the system that may not read a token.">
      <PropsTable props={[{ name: '(none)', type: '—', default: 'hardcoded oklch pairs', description: 'light: oklch(1 0 0) / oklch(0.2 0 0); dark (prefers-color-scheme): oklch(0.145 0 0) / oklch(0.9551 0 0). Token-dependence is the race this layer exists to mask.' }]} />
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query(). The zero-css-file law is untouched: the §10 carriers are INLINE style declarations (this component own element idiom) joining the exit-duration channel; the layer is transient by design — the surface rides whatever window it has and never touches the exit/reveal machinery."
    >
      <ComponentCanvas title="boot-splash · universal props" stage="fill" files={universalFiles}>
{#if universalSplashOpen}
        <BootSplash title="axes joined" description="size 18 — replay below" revealOn="manual" bind:open={universalSplashOpen} size={18} />
      {/if}
      <div class={cx(rt.panel)}><button class="pill" onclick={() => (universalSplashOpen = true)}>replay the splash at size 18</button></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eleven props; zero required. The dismissal economy: revealOn picks the signal, timeoutMs caps it, minMs floors it, durationMs times the exit.">
      <PropsTable props={[
        { name: 'logo', type: 'Snippet', default: '—', description: 'The brand mark (LOGO slot) — any inline svg/mark; it rides the layer\u2019s own centering.' },
        { name: 'loading', type: 'Snippet', default: 'SMIL arc spinner', description: 'The loading animation slot. The default is a hardcoded SMIL svg spinner (animateTransform — zero css by construction); compose a spin-pack loader here, its svg carries its own inline styles.' },
        { name: 'title', type: 'string', default: '—', description: 'The primary line; also the status region\u2019s aria-label fallback.' },
        { name: 'subtitle', type: 'string', default: '—', description: 'The secondary line.' },
        { name: 'description', type: 'string', default: '—', description: 'Running copy — progress, or time-consuming text (the Owner spec\u2019s consumption lane).' },
        { name: 'exit', type: "'opacity-out' | 'blur-out' | 'none'", default: "'opacity-out'", description: 'The exit animation; keyframes ride the same head block.' },
        { name: 'revealOn', type: "'fonts' | 'load' | 'manual'", default: "'fonts'", description: 'When the layer dismisses itself: document.fonts.ready (the last layout-shifting resource class), the window load event, or manual — bind:open is yours (a flip to false runs the exit vocabulary).' },
        { name: 'timeoutMs', type: 'number', default: '4000', description: 'The hard cap — a hung font CDN never holds the page hostage.' },
        { name: 'minMs', type: 'number', default: '350', description: 'The minimum display floor — avoids the blink-flash of an instant dismissal.' },
        { name: 'durationMs', type: 'number', default: '350', description: 'The exit animation length.' },
        { name: 'open', type: 'boolean (bindable)', default: 'true', description: 'The dismissal state; manual mode\u2019s control surface.' },
      ]} />
    </SectionCard>
  </div>
  <div data-reveal="">
    <DocsSeeAlso name="boot-splash" />
  </div>
</div>
