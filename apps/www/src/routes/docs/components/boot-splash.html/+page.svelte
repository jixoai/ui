<!--
  boot-splash — archetype page (docs-eight-axes-mdn task 34,
  marginalia; tier-2 rewrite of the 2026-09-19 FOUC-round page).
  What moved: + Overview (the FOUC problem + the dismissal economy),
  + the measured eight-axes table (transient-surface receipts, LAW #16
  mediums named), + id anchors on install/see-also, + the theming and
  universal-props sections FOLDED into axes (tokens + the two live
  axis demos), and the workbench replay FIXED — it previously wired
  `open` one-way AND rendered no BootSplash instance at all, so the
  replay button flipped state while nothing mounted. The wire is now
  bind:open over a rendered instance (the dismissal state and the
  button are one source of truth, and the exit vocabulary rides it).
-->
<script lang="ts">
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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
  bind:open={splashOpen}
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

  // ---- the axes demos: the size echo + the controlled theme pair ----
  let sizeSplashOpen = $state(false);
  let propSplashOpen = $state(false);
  let darkSplashOpen = $state(false);
  const axesUsage = `<BootSplash
  size={18}
  revealOn="manual"
  bind:open={sizeSplashOpen}
  title="size 18"
  description="the layer's font-size follows the mirror"
/>

<!-- theme, controlled: the prop ALONE paints nothing — the grounds
     answer the HOST's vocabulary (an ancestor .dark flips them) -->
<BootSplash theme="dark" revealOn="manual" bind:open={propSplashOpen} title="prop alone" />
<div class="dark">
  <BootSplash revealOn="manual" bind:open={darkSplashOpen} title="host bridge" />
</div>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/boot-splash-axes.svelte', content: axesUsage },
  ];

  // the page's local join (the separator serialize law)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(
        (style): style is string | { readonly [key: string]: string | object } =>
          Boolean(style),
      )
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the measured per-axis rows (probes 2026-09-23; every receipt
  // names its medium — LAW #16: raw SSR serves the unconditional base,
  // hydrated probes with real state are the flip instrument) ----
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number · query()`,
      default: `'auto'`,
      description:
        "CARRIER-ONLY — the stamp lands inline on the layer and nothing reads it: the zero-css-file law means no atoms and no channel reads exist (grep receipt: the head block and the markup read no var(--jx-*) token — the only var in the family is its own --jx-boot-splash-duration). The transient mask consumes nothing. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number · query()`,
      default: `'auto'`,
      description:
        "THE §11 ECHO WITH A REM CAVEAT — the mirror lands verbatim on the layer (--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem) measured live) and the layer's own font-size follows it; but the copy tiers are REM (title 1rem · subtitle 0.8125rem · desc 0.75rem — document-root-relative), so the built-in text holds the root scale and only consumer-authored em copy inside the slots would scale. The stamp is real; the visible follow-through is the consumer's. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto' · query()`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the layer is full-viewport (position: fixed; inset: 0): corner geometry has no seat (grep receipt: zero border-radius declarations in the family). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number · query()`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the mask has no corners (grep receipt: zero border-radius reads); the stamps land on the layer and evaporate with it. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string · query()`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the ink and ground are the HARDCODED head-block oklch pairs: the one surface in the system that may not read a token (the zero-css-file law — token-dependence IS the race this layer masks). --jx-color-effective stamps and finds no reader (grep receipt). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto' · query()`,
      default: `'auto'`,
      description:
        "STAMP-ONLY ON SELF; THE GROUNDS ANSWER THE HOST — class:dark lands on the layer itself, but the head block's bridge selectors (.dark .jx-boot-splash-layer) match an ANCESTOR, so the prop's own class paints nothing (measured live: theme=\"dark\" stays light on a light host). The grounds flip through prefers-color-scheme and the ancestor .dark class bridge (measured: an ancestor .dark turns the ground oklch(1 0 0) → oklch(0.145 0 0) and the ink → oklch(0.9551 0 0)). The prop cannot repaint the mask — the head block renders once, before any prop exists; host vocabulary is the only voice a pre-paint layer can hear. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0'…'level5' | 'auto' | number · query()`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the mask casts no shadow: it IS the ground (grep receipt: zero shadow declarations in the family). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number · query()`,
      default: `'auto'`,
      description:
        "THE EXIT IS ITS OWN MACHINE — the exit animation reads the family's own --jx-boot-splash-duration channel (durationMs, default 350ms), not the motion kernel; prefers-reduced-motion kills the exit outright (measured: an instant unmount where the animated path holds the 350ms floor plus the 350ms exit); zero transition declarations (grep receipt). Number unit: coefficient.",
    },
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

    <div id="install" data-reveal="">
      <DocsInstall name="boot-splash" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="The FOUC mask: a fixed, z-max layer whose every style rides the HTML itself, covering the one window stylesheets can still be late for — then dismissing itself on a signal you choose, under a cap you control."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The problem it masks: styles arrive asynchronously — the built head carries ~20
            render-blocking stylesheet links (a waterfall on slow networks), and a dev lane's css
            rides a JS fetcher module (a guaranteed bare flash). Whatever the cause, the first
            paint can be wrong. The splash covers that window with a layer whose styles
            <code class={cx(rt.inkAccent)}>CANNOT be late</code>: element styles ride inline style
            attributes, and the sheet-level vocabulary — the light/dark grounds, the exit
            keyframes, the reduced-motion and noscript escapes — rides a
            <code class={cx(rt.inkAccent)}>style</code> block inside
            <code class={cx(rt.inkAccent)}>svelte:head</code>, which SSR renders inline into the
            document. The component imports no css, no atoms, no tokens.
          </p>
          <p class={cx(rt.measurePara)}>
            The dismissal economy: <code class={cx(rt.inkAccent)}>revealOn</code> picks the signal
            (fonts — the last layout-shifting resource class · load · manual), capped by
            <code class={cx(rt.inkAccent)}>timeoutMs</code> so a hung font CDN never holds the
            page hostage, floored by <code class={cx(rt.inkAccent)}>minMs</code> so an instant
            dismissal never blinks, and timed by <code class={cx(rt.inkAccent)}>durationMs</code>
            through one of the two exit keyframes. The mask is visual-only —
            <code class={cx(rt.inkAccent)}>pointer-events: none</code> — so a fast click passes
            through to the page beneath.
          </p>
          <p class={cx(rt.measurePara)}>
            The eight-axis surface rides whatever window the layer has: the carriers stamp inline
            (the component's own element idiom — the zero-css law untouched), and the layer is
            transient by design. Six of the eight axes find no reader on a surface with no
            atoms, no corners and no shadows; size stamps a real echo with a rem caveat; theme
            stamps a class the grounds cannot hear — the grounds answer the host's own
            vocabulary instead. Per-axis, measured, below.
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
        summary="Mount it inside WebsiteScaffold's splash snippet — the scaffold carries the seat at its host root, the splash renders before the page chrome and dismisses itself when the sheet settles."
      >
        <CodeBlock code={usage} lang="svelte" meta="BootSplash usage" />
      </SectionCard>
    </div>

    <!-- workbench: replay the mask (the replay wires bind:open over a
         rendered instance — one source of truth for the dismissal) -->
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
                dismiss (open flips false — the exit runs)
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
        <BootSplash
          bind:open={splashOpen}
          {exit}
          {revealOn}
          title="your-app"
          description="loading the style sheet…"
        />
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
              leaving phase, animationend unmounts). The wire is bind:open —
              the child's internal dismissal writes back to your state.
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
        summary="logo (the brand mark) · loading (the animation — default: a hardcoded SMIL arc spinner, zero css by construction; compose a spin-pack loader here) · title · subtitle · description (progress or time-consuming copy). Text slots are plain strings; the two composition slots are snippets. A logo takes the lane — the brand mark IS the liveness signal, so the default spinner stands down under it."
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
        summary="The keyframes live in the same head block, timed by --jx-boot-splash-duration; the animationend hands control back (open flips false, the layer unmounts). prefers-reduced-motion skips the animation; the manual mode's bind:open flip rides the identical leaving phase; exit='none' needs no phase at all — the floor elapses and the layer is gone."
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
  <div id="api" data-reveal="">
    <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eleven served props; zero required. The dismissal economy: revealOn picks the signal, timeoutMs caps it, minMs floors it, durationMs times the exit. (meta arithmetic: 21 props − 8 ambient axes = 13 family seats — the 11 served rows plus rest/style, which ride the anchor-passthrough convention.)">
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
        { name: 'open', type: 'boolean (bindable)', default: 'true', description: 'The dismissal state; manual mode\u2019s control surface. BIND it — a one-way open={state} wire is the dead-replay trap: the child\u2019s internal dismissal writes never reach your state.' },
      ]} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on boot-splash"
      summary="A FIRST-TIME all-no-own contract over a TRANSIENT surface: the carriers stamp inline (the component's own element idiom — the zero-css-file law untouched) and the layer reads nothing — no kernel channels, no tokens, no corners, no shadows (grep receipts). The grounds are the hardcoded head-block pairs that answer the HOST's vocabulary (prefers-color-scheme + the ancestor .dark bridge); size stamps a real echo whose rem-tier copy holds the root scale; the exit runs on the family's own duration channel with the reduced-motion kill. Measured 2026-09-23; the layer is transient — every receipt names its window."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            title="boot-splash · the axes, live"
            description="Three receipts on one stage. Size 18: the mirror lands verbatim on the layer (--jx-size-effective: 18px; the layer's font-size follows) while the rem-tier copy holds the root scale. The theme pair is controlled: the prop ALONE (theme='dark', no host class) stays light — its class lands on the layer itself, where no bridge selector can hear it — while the ANCESTOR .dark host flips the grounds to the dark pair (oklch(0.145 0 0) / oklch(0.9551 0 0)) with no prop at all."
            stage="fill"
            files={axesFiles}
          >
            <div class={cx(rt.rowC16, rt.wrap, rt.wFull)}>
              <div class={cx(rt.panel, rt.col16)}>
                <button class="pill" onclick={() => (sizeSplashOpen = true)}>replay at size 18</button>
                {#if sizeSplashOpen}
                  <button class="pill" onclick={() => (sizeSplashOpen = false)}>dismiss</button>
                {/if}
              </div>
              <div class={cx(rt.panel, rt.col16)}>
                <button class="pill" onclick={() => (propSplashOpen = true)}>replay: the prop alone</button>
                {#if propSplashOpen}
                  <button class="pill" onclick={() => (propSplashOpen = false)}>dismiss</button>
                {/if}
              </div>
              <div class={cx(rt.panel, rt.col16)}>
                <button class="pill" onclick={() => (darkSplashOpen = true)}>replay in the dark host</button>
                {#if darkSplashOpen}
                  <button class="pill" onclick={() => (darkSplashOpen = false)}>dismiss</button>
                {/if}
              </div>
            </div>
            <BootSplash
              size={18}
              revealOn="manual"
              bind:open={sizeSplashOpen}
              title="size 18"
              description="the layer's font-size follows the mirror"
            />
            <!-- the controlled theme pair: the prop's class:dark lands ON
                 the layer (no bridge selector matches it); the ANCESTOR
                 .dark is what the head block's selectors match -->
            <BootSplash
              theme="dark"
              revealOn="manual"
              bind:open={propSplashOpen}
              title="prop alone"
              description="theme='dark', no host class — stays light"
            />
            <div class="dark">
              <BootSplash
                revealOn="manual"
                bind:open={darkSplashOpen}
                title="host bridge"
                description="ancestor .dark, no prop — grounds flip"
              />
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <TokenTable
            tokens={[
              { name: '--jx-boot-splash-duration', default: 'durationMs · 350ms', source: 'component', description: 'The exit-animation length channel — the one var the family owns; the exit classes read it through the layer\u2019s inline style.' },
              { name: 'grounds', default: 'light oklch(1 0 0)/oklch(0.2 0 0) · dark 0.145/0.9551', source: 'structural', description: 'The hardcoded head-block pairs behind prefers-color-scheme and the ancestor .dark bridge — token-dependence is the race this layer masks.' },
              { name: '--jx-boot-splash-mark', default: 'oklch(0.2 0 0 / 0.85) · white/0.85 on dark', source: 'structural', description: 'The logo-outline stroke — a brand mark must read on EITHER ground, so the layer exposes the matching stroke var.' },
              { name: 'text tiers', default: '1rem · 0.8125rem · 0.75rem', source: 'structural', description: 'Title/subtitle/desc at opacities 1.0 · 0.8 · 0.68 — the WCAG-run ladder (desc at the old 0.55 read ~3.9:1, under the AA 4.5 line).' },
              { name: 'kernel channels', default: 'unread', source: 'density', description: 'The zero-css law\u2019s other face: the layer reads no --jx-hit/--jx-gap/--jx-inset/--jx-text — the carriers stamp and find no consumer.' },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The layer is role=status (labelled by the title) — a polite loading announcement. It is pointer-events: none by law: a fast click during the boot window passes through to the (unstyled but functional) page beneath. noscript hides the layer entirely; reduced-motion skips the exit; the timeout cap guarantees the page is never held hostage.">
      <PropsTable universal props={[
        { name: 'role', type: '"status"', default: 'component-owned', description: 'A polite live region — screen readers announce the loading state once, without interrupting.' },
        { name: 'aria-label', type: 'string', default: 'the title prop (fallback "loading")', description: 'Names the status region.' },
        { name: 'pointer-events', type: 'none', default: 'always', description: 'The mask is visual-only — it can never eat input, so the unstyled page beneath stays operable through the boot window.' },
      ]} />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="boot-splash" />
  </div>
</div>
