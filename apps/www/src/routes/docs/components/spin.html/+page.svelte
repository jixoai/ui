<!--
  Docs page for the spin component (spin-ora-svg-lane D2, 2026-09-11).
  Intents:
  1. Hero + canvas: the unified `spinner` name lane — the playground
     drives one instance across BOTH corpora (text catalog names and
     the generated svg artifact) with the svg posture's size slot.
  2. The text gallery: FAMILY REPRESENTATIVES of the 60-name
     cli-spinners catalog, not the whole list (design §7).
  3. The svg lane: blocks-wave, the size slot, and the reduced-motion
     contract (two named channels) + the multi-instance lockstep law.
  4. Postures (bare / wrapping — the law is UNCHANGED from the
     bracket-cursor era), usage, a11y, theming, API.
  Custom svg spinners come from @jixoai/ui-vite-plugin's spinners
  feature (jixoai({ spinners }) regenerating the artifact) — this page
  documents the contract; the plugin's own story stays on its docs.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Spin from '$lib/ui/spin';
  import { SPINNER_CATALOG, TEXT_SPINNER_NAMES, type TextSpinnerName } from '$lib/ui/spin/spin-catalog';
  import { SPIN_NAMES, type SpinName } from '$lib/spin-set.gen';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp, PlayNumber, PlayRow, PlaySelect, PlaySegmented, PlayTiming } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site
  // runs ($lib/ui/spin is the byte-mirror of registry/files/ui/spin).
  import spinSource from '$lib/ui/spin/spin.svelte?raw';
  import spinCatalogSource from '$lib/ui/spin/spin-catalog.ts?raw';
  import spinCssSource from '$lib/ui/spin/spin.css?raw';
  import spinDefaultsSource from '$lib/ui/spin/spin-defaults.svelte.ts?raw';
  import spinIndexSource from '$lib/ui/spin/index.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Spin from '@ui/spin';
${close}

<!-- default: the 'dots' text spinner under role=status -->
<Spin label="loading checks" />

<!-- any catalog name — the union is the list, a typo is a compile error -->
<Spin spinner="line" label="syncing" />
<Spin spinner="simpleDots" label="fetching" />

<!-- the svg lane: names from the generated artifact take size -->
<Spin spinner="blocks-wave" label="building" size={24} />

<!-- wrapping posture: children flip the component into a container -->
<Spin label="syncing">…content…</Spin>`;

  const customLoader = `// vite.config.ts — @jixoai/ui-vite-plugin's spinners feature
import { jixoai, defineSpinnerChannel } from '@jixoai/ui-vite-plugin';
import { magecdn } from '@jixoai/ui-vite-plugin/spinners/magecdn';
import { sam } from '@jixoai/ui-vite-plugin/spinners/svg-loaders';

export default {
  plugins: [
    jixoai({
      // bare {} = the vendored blocks-wave only. Custom loaders ride
      // either lane — a CHANNEL (an id + prefix + its own record, the
      // icon channel contract; entries join as prefix:name keys) or
      // the flat record (kebab or prefix:name keys; explicit beats
      // channels and built-ins, the icons override law)
      spinners: {
        channels: [
          // your own channel — the public factory validates shape +
          // grammar; one channel per prefix is enforced at config time
          defineSpinnerChannel({
            id: 'myco',
            prefix: 'myco',
            spinners: {
              'cadence': '<svg …>…</svg>',        // inline literal
              'wave-loader': { file: './src/loaders/wave.svg' },
            },
          }),
          // a pack as a channel — pick is a filter over the 94
          magecdn({ pick: ['clock', 'bars-scale'] }),
          // SamHerbert's 12 under the sam: prefix
          sam(),
        ],
        spinners: {
          'flat-loader': { file: './src/loaders/flat.svg' },
          'myco:cadence': '<svg …>…</svg>', // same FULL name overrides the channel entry
        },
      },
    }),
  ],
};

// then regenerate the committed artifact (the repo's single writer):
//   npm run gen:spins
// <Spin spinner="myco:cadence" />, <Spin spinner="magecdn:clock" />,
// <Spin spinner="sam:tail-spin" /> — all type-check and render; the
// SpinName union closes with the artifact, so a typo is a compile
// error exactly like the text lane.`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/spin/spin.svelte', content: spinSource },
    { name: 'registry/files/ui/spin/spin-catalog.ts', content: spinCatalogSource },
    { name: 'registry/files/ui/spin/spin-defaults.svelte.ts', content: spinDefaultsSource },
    { name: 'registry/files/ui/spin/spin.css', content: spinCssSource },
    { name: 'registry/files/ui/spin/index.ts', content: spinIndexSource },
    { name: 'src/lib/ui/spin-usage.svelte', content: usage, kind: 'usage' },
  ];

  // The text gallery's FAMILY REPRESENTATIVES (design §7): one name per
  // visual family, NOT all 60 — the full union rides the catalog.
  const GALLERY: readonly TextSpinnerName[] = [
    'dots',
    'dots2',
    'line',
    'pipe',
    'simpleDots',
    'arc',
    'arrow',
    'bounce',
    'growVertical',
    'toggle3',
    'star',
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — the driven instance below crosses BOTH corpora live
  // the timing pairs ride 'auto' by default (review round 4): every
  // catalog name carries a HAND-TUNED interval/linger pair — the
  // PlayTiming controls flip between auto (the tuned pair) and a
  // custom number, seeded from the tuned value when flipping
  const catalogOf = (name: TextSpinnerName | SpinName): (typeof SPINNER_CATALOG)[TextSpinnerName] | undefined =>
    Object.hasOwn(SPINNER_CATALOG, name) ? SPINNER_CATALOG[name as TextSpinnerName] : undefined;
  type LingerType = 'end' | 'start' | 'both';
  const canvasInitial = {
    spinner: 'dots' as TextSpinnerName | SpinName,
    size: 16,
    interval: 'auto' as 'auto' | number,
    linger: 'auto' as 'auto' | number,
    lingerType: 'auto' as 'auto' | LingerType,
  };
  let spinner = $state<TextSpinnerName | SpinName>(canvasInitial.spinner);
  let size = $state(canvasInitial.size);
  let interval = $state<'auto' | number>(canvasInitial.interval);
  let linger = $state<'auto' | number>(canvasInitial.linger);
  let lingerType = $state<'auto' | LingerType>(canvasInitial.lingerType);
  // name changes reset the timings to auto (the tuned pair + type follow
  // the name; custom values belong to the name they were tuned on)
  $effect(() => {
    spinner;
    interval = 'auto';
    linger = 'auto';
    lingerType = 'auto';
  });
  function resetCanvas(): void {
    spinner = canvasInitial.spinner;
    size = canvasInitial.size;
    interval = canvasInitial.interval;
    linger = canvasInitial.linger;
    lingerType = canvasInitial.lingerType;
  }
  // the gallery reps + every generated svg name — the driven select is
  // the name-lane story in miniature (text ↔ svg crossing, zero edits
  // when either corpus grows)
  const spinnerOptions: { value: TextSpinnerName | SpinName; label: string }[] = [
    ...GALLERY.map((value) => ({ value, label: value })),
    ...SPIN_NAMES.map((value) => ({ value, label: `${value} (svg)` })),
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
  // ---- the universal props demo (explicit-props W3-B) --------------------
  const universalUsage = `<!-- §13: the number lane verbatim -->
<Spin spinner="blocks-wave" size={24} label="loading" />
<Spin spinner="dots" label="loading" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/spin-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 41) — every cell measured on
  // the served DOM (probe) or negative-grepped over ui/spin/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "MANAGED STAMP, ZERO-READER CLASS — the resolved rung is stamped on the root (data-density, measured 'sm' under density=\"small\" on both postures) and the ambient scope channel keeps flowing, but NOTHING in the family reads it (grep receipt). THE LIVE CONSUMER is the RULER, not the axis: the absent-size svg edge rides var(--jx-icon), which the ambient density scope scales. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `number | string (the family's own hybrid, §13)`,
      default: `absent → var(--jx-icon)`,
      description:
        "THE HYBRID OWN — a NUMBER is the universal size axis' number lane verbatim (px) and additionally stamps the §1 carrier for descendants; a string is any CSS length (the family's own lane); ABSENT is a STATE: the svg edge rides the density ruler's var(--jx-icon) through an inline style (attrs cannot carry var()). The text posture ignores the slot entirely (it paints var(--jx-text)). Zero size-effective READERS (grep receipt) — the svg's width/height attributes or the ruler inline style are the consumption. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape consumer in ui/spin/; a loader glyph has no corners of its own). Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero radius-effective readers (grep receipt); the wrap posture pill uses the family hairline, not the radius axis. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the ink is PINNED to the primary hue (glyph + cursor + inline all read --jx-primary); zero --jx-color-effective readers (grep receipt). The hue axis never reaches the loader — repainting means re-theming --primary, not spinning the color lane. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE ROOT-PINNED ALIAS (the separator find's shape #2, measured) — the ink reads --jx-primary, a :root-declared alias (--jx-primary: var(--primary), one of 116 `: var(` chains in the token table) whose var() substitutes AT THE ROOT: a scoped .dark island re-derives inherited --primary but the ink HELDS the light value (measured frozen), while root-level html.dark re-derives it (measured flip). class:dark stamps for composed descendants. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the wrap pill\'s shadow is the family\'s --jx-shadow token, not the axis. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE FAMILY IS MOTION — and the axis stays SUPPLY-ONLY (zero motion-effective readers, grep receipt): the animation is the flat CSS engine's own (per-frame opacity keyframes, negative-delay phasing; pulse-in-pixels receipts: rAF-sampled opacity oscillates, transform/transition/background are computed-style NEGATIVES), and reduced motion is TWO NAMED CHANNELS measured live — the text frames' static CSS kill (animation: none → frame 0 face) and the svg lane's SMIL clock pause (root.pauseAnimations() on the matchMedia listener). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: the DENSITY lane's rung stamp. The size prop
  // is the family's own hybrid (number | string — a passthrough) and
  // REJECTS query() by type; the family contract records that the
  // named/auto/query lanes are not adopted on the loader. The stamp is
  // the receipt: the rung flips while nothing in the family reads it.
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import Spin from '@ui/spin';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- the md key is the registered VIEWPORT scale (48rem): below it the
     small rung stamps, at 48rem+ large wins — data-density flips on
     the element while nothing in the family reads it (the zero-reader
     class): the stamp IS the receipt. size itself REJECTS query() —
     it is the family's own number|string hybrid, not an axis seat. -->
<Spin spinner="blocks-wave" density={query({ md: 'large' }, 'small')} label="loading" />`;

  const queryFiles: TreeFile[] = [
    { name: 'spin-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Spin · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Spin component, ora's voice: one spinner name lane over two corpora — 60 named text spinners from the cli-spinners catalog (dots, line, arc, bounce …) and the generated svg artifact (blocks-wave, custom loaders via the vite plugin). role=status frames under a live matchMedia reduced-motion listener; wrapping posture: an aria-busy container whose scrim OWNS pointer events."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Feedback"
        title="spin — a name, not a cursor"
        summary="The loading indicator in ora's voice. You hand it a NAME: any of the 60 text spinners curated from cli-spinners (frames and intervals verbatim — dots, line, arc, bounce…), or a name from the generated svg artifact (blocks-wave by default, the vendored loader packs and your own files through the vite plugin). The union closes at build time, so a misspelled spinner is a compile error, never a shipped blank. role=status keeps loading polite by construction; under prefers-reduced-motion the text frames rest on frame 0 and the svg clock freezes — observed live, not once at mount."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">one spinner name lane — text + svg</span>
          <span class="pill">60-name catalog, frames verbatim</span>
          <span class="pill">svg artifact · SMIL + currentColor</span>
          <span class="pill">live reduced-motion listener</span>
          <span class="pill">aria-busy wrap posture</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="spin" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="A name, two corpora, one flat CSS engine: the union closes at build time, the frames render once each, and reduced motion is two named measured channels — never an assumption."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            You hand it a NAME, not a cursor. The name lane crosses two corpora: the curated
            <code class={cx(rt.inkPrimary)}>cli-spinners</code> text catalog (60 names, frames
            and per-spinner intervals verbatim) and the generated svg artifact (blocks-wave plus
            the vendored packs — your own loaders through the vite plugin). The artifact lane
            resolves FIRST, and the union closes at build time: a misspelled spinner is a
            compile error, never a shipped blank. Both lanes announce through
            <code class={cx(rt.inkPrimary)}>role=status</code> — polite by construction.
          </p>
          <p class={cx(rt.para)}>
            The text lane is the FLAT CSS ENGINE: every frame renders ONCE as its own grid cell
            span, phased by a negative animation delay — no element churn, no JS clock; JS only
            fills the parameters (one shared keyframes rule per timing set). The trail is the
            opacity animation itself, the box never breathes (the widest frame's advance width
            holds the cell), and reduced motion is a static media kill landing on the base face:
            frame 0 alone, LIVE media semantics, zero JS. The svg lane keeps its OWN engine —
            the SMIL document inside the artwork — frozen through a live matchMedia listener
            that pauses the clock. Two named channels, measured, never conflated.
          </p>
          <p class={cx(rt.para)}>
            The eight axes are near-zero by measurement: density stamps a managed rung and size
            is the family's §13 hybrid (numbers stamp the §1 carrier; the ABSENT state rides the
            density ruler's var(--jx-icon)); shape/radius/color/elevation/motion supply unread —
            the ink is pinned to the primary hue through the ROOT-PINNED ALIAS chain
            (--jx-primary: var(--primary)), and it is FROZEN EVERYWHERE: a scoped dark island
            cannot repaint it, and at root-level dark the html alias re-derives but the
            re-derived value never reaches the glyph (measured at the element — the A/B
            adjudication). Kinship:
            <code class={cx(rt.inkPrimary)}>skeleton</code> (the fleet's other motion surface —
            the pulse beside the spin),
            <code class={cx(rt.inkPrimary)}>progress</code> (determinate loading),
            <code class={cx(rt.inkPrimary)}>toast</code> (the completion announcement).
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="spin"
        description="One name, two corpora. The playground drives the lower instance across the name lane; the upper rows are the default text posture and the svg artifact at its size ladder."
        sourceUrl={registrySourceUrl('spin')}
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
      >
        <div class={cx(rt.col24, rt.itemsCenter)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.justifyCenter, rt.gapX10, rt.gapY20)}>
            <div class={cx(rt.col8, rt.itemsCenter)}>
              <Spin label="loading checks" />
              <code class={cx(rt.note11, rt.fontMono)}>dots · default</code>
            </div>
            <div class={cx(rt.col8, rt.itemsCenter)}>
              <Spin spinner="blocks-wave" label="building" size={24} />
              <code class={cx(rt.note11, rt.fontMono)}>blocks-wave · 24</code>
            </div>
          </div>
          <div class={cx(rt.col10, rt.tBorder, rt.itemsCenter, rt.pt20)}>
            <span class={cx(rt.microEyebrow, rt.inkMuted)}>
              driven by the playground
            </span>
            <Spin {spinner} {size} {interval} {linger} {lingerType} label="loading checks" />
            <code class={cx(rt.inkMuted, rt.fontMono, rt.text115)}>&lt;Spin spinner=&quot;{spinner}&quot; size={size} interval={interval} linger={linger} lingerType=&quot;{lingerType}&quot; /&gt;</code>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="spinner">
              <PlaySelect bind:value={spinner} options={spinnerOptions} />
            </PlayRow>
            <PlayRow label="size">
              <PlayNumber bind:value={size} min={8} max={48} />
            </PlayRow>
            <PlayRow label="interval">
              <PlayTiming bind:value={interval} fallback={SPINNER_CATALOG.dots.interval} max={1200} />
            </PlayRow>
            <PlayRow label="linger">
              <PlayTiming bind:value={linger} fallback={SPINNER_CATALOG.dots.linger} />
            </PlayRow>
            <PlayRow label="lingerType">
              <PlaySegmented
                bind:value={lingerType}
                options={[
                  { value: 'auto' as const, label: 'auto' },
                  { value: 'end' as const, label: 'end' },
                  { value: 'start' as const, label: 'start' },
                  { value: 'both' as const, label: 'both' },
                ]}
              />
            </PlayRow>
            <PlayHelp>
              <code>spinner</code> takes any member of <code>TextSpinnerName</code>
              ({TEXT_SPINNER_NAMES.length} catalog names) or <code>SpinName</code> (the generated
              svg set — <code>blocks-wave</code> plus the curated pack picks). The artifact lane resolves FIRST: an svg
              spinner named like a text one overrides the catalog entry. <code>size</code> is the
              svg posture's square edge — absent rides <code>var(--jx-icon)</code>.
              <code>interval</code> and <code>linger</code> are the text
              posture's two timings — 'auto' rides the name's HAND-TUNED pair, custom
              flips in a number input seeded from the tuned value (0 linger = no
              residue). <code>lingerType</code> picks the opacity mode (auto /
              fade-out / pre-boundary fade-in / both). Changing the name resets all three to auto.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="gallery" data-reveal="">
      <SectionCard
        family="gallery"
        headerRegion="gallery"
        eyebrow="catalog"
        title="The text catalog — family representatives"
        summary="Sixty names, frames and per-spinner intervals copied verbatim from cli-spinners (the corpus ora itself renders). One representative per visual family is shown live; the full union rides spin-catalog.ts — every member renders with the same prop."
      >
        <div class={cx(rt.flex, rt.wrap, rt.itemsStart, rt.gapX8, rt.gapY24)}>
          {#each GALLERY as name (name)}
            <div class={cx(rt.spCell24)}>
              <Spin spinner={name} label={name} />
              <code class={cx(rt.note11, rt.fontMono)}>{name}</code>
              <span class={cx(rt.inkMuted, rt.fontMono, rt.text10)}>{SPINNER_CATALOG[name].interval}/{SPINNER_CATALOG[name].linger}{SPINNER_CATALOG[name].lingerType ? `·${SPINNER_CATALOG[name].lingerType}` : ''}</span>
            </div>
          {/each}
        </div>
      </SectionCard>
    </div>

    <div id="linger-trail" data-reveal="">
      <SectionCard
        family="linger-trail"
        headerRegion="linger-trail"
        eyebrow="timings"
        title="The linger trail — hand-tuned timing pairs"
        summary="Every catalog name carries a HAND-TUNED interval/linger pair (the Owner's five: dots 80/160, dots2 120/0, pipe 120/120, line 160/0, simpleDots 160/160 — the rest family-curation; the gallery captions show each pair). Both props take number | 'auto' with 'auto' (the default) resolving the tuned pair; explicit numbers override, and both ride the family's one Defaults contract, so a context — or the plugin mounting one — can set them ambiently for every spinner at once."
      >
        <div class={cx(rt.col24)}>
          <div class={cx(rt.flex, rt.wrap, rt.itemsStart, rt.gapX12, rt.gapY24)}>
            <div class={cx(rt.spCell36)}>
              <Spin spinner="growVertical" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>growVertical · auto (120/120)</code>
            </div>
            <div class={cx(rt.spCell36)}>
              <Spin spinner="dots" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>dots · auto (80/160)</code>
            </div>
            <div class={cx(rt.spCell36)}>
              <Spin spinner="dots" interval={160} linger={480} label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>dots · custom 160/480</code>
            </div>
            <div class={cx(rt.spCell36)}>
              <Spin spinner="pong" linger={0} label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>pong · linger 0 — no residue</code>
            </div>
          </div>
          <p class={cx(rt.bodyMuted)}>
            <strong class={cx(rt.inkFg, rt.medium)}>Pure CSS, flat, DevTools-friendly.</strong>
            Every frame of the spinner renders ONCE in the SAME grid cell with
            <code class={cx(rt.inkAccent)}>white-space: pre</code> — no element churn, no JS clock; JS only fills the
            animation parameters (one shared keyframes rule per parameter set + a negative per-frame delay phasing
            it into its slot), so the cycle is compositor-smooth, scrub/pause/replay-able in the DevTools Animations
            panel, and freezes on frame 0 under <code class={cx(rt.inkAccent)}>prefers-reduced-motion</code> through a
            static media kill — zero JS in the reduced-motion path. The box never breathes: a slow blank frame
            (simpleDots' three spaces) holds the widest frame's advance width.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="svg-lane" data-reveal="">
      <SectionCard
        family="svg-lane"
        headerRegion="svg-lane"
        eyebrow="svg lane"
        title="The svg artifact — blocks-wave and your own loaders"
        summary="Names that resolve in the generated artifact render the svg posture: the component owns the whole <svg> root (viewBox from the data, the resolved square size, currentColor painting by artwork nature, aria-hidden), and the artwork's inner markup — SMIL animate elements included — crosses through the same RAW-gated sink the icon pipeline uses."
      >
        <div class={cx(rt.col24)}>
          <div class={cx(rt.wrapStart40)}>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="blocks-wave" label="building" />
              <code class={cx(rt.note11, rt.fontMono)}>size · var(--jx-icon) (absent default)</code>
            </div>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="blocks-wave" label="building" size={24} />
              <code class={cx(rt.note11, rt.fontMono)}>size · 24 (pinned)</code>
            </div>
          </div>
          <div class={cx(rt.flex, rt.wrap, rt.itemsStart, rt.gapX10, rt.gapY24)}>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="tail-spin" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>tail-spin</code>
            </div>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="spinning-circles" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>spinning-circles</code>
            </div>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="3-dots-bounce" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>3-dots-bounce</code>
            </div>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="bars-scale" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>bars-scale</code>
            </div>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="clock" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>clock</code>
            </div>
          </div>
          <!-- the channel face dogfood (spinner-channel-api): this
               loader arrives through a docs channel registered in the
               vite config — its artifact key carries the namespace -->
          <div class={cx(rt.flex, rt.wrap, rt.itemsStart, rt.gapX10, rt.gapY24)}>
            <div class={cx(rt.spCell40)}>
              <Spin spinner="docs:cadence" label="loading" />
              <code class={cx(rt.note11, rt.fontMono)}>docs:cadence — a channel entry</code>
            </div>
          </div>
          <p class={cx(rt.bodyMuted)}>
            <strong class={cx(rt.inkFg, rt.medium)}>Reduced motion, two named channels.</strong>
            SMIL-animated loaders freeze through
            <code class={cx(rt.inkAccent)}>root.pauseAnimations()</code> driven by the component's live
            <code class={cx(rt.inkAccent)}>matchMedia('(prefers-reduced-motion: reduce)')</code>
            listener — frozen means the first frame (blocks-wave's resting 3×3 grid), and
            un-reducing restarts the clock. CSS-keyframed loaders ride the second channel:
            spin.css's static <code class={cx(rt.inkAccent)}>animation: none</code> kill scoped to
            <code class={cx(rt.inkAccent)}>[data-jx-spin-svg]</code>. The channels are documented, never
            conflated — a custom loader chooses its engine by how its artwork is written.
          </p>
          <p class={cx(rt.bodyMuted)}>
            <strong class={cx(rt.inkFg, rt.medium)}>Independent instance timelines.</strong> SMIL
            syncbase references resolve by element id ACROSS THE DOCUMENT — duplicate ids across
            instances used to cross-wire (a freshly switched-to loader resolved its begin chains onto
            another instance's long-past timeline and froze until a lucky re-insertion). Every
            instance now namespaces its ids at render (<code class={cx(rt.inkAccent)}>id</code>,
            <code class={cx(rt.inkAccent)}>.begin/.end</code> refs, gradient <code class={cx(rt.inkAccent)}>url(#…)</code>):
            each syncbase graph is self-contained, unmount-safe, and independently phased — the
            deterministic transform rides RAW-gated payload only; artifact bytes stay verbatim.
          </p>
          <p class={cx(rt.bodyMuted)}>
            <strong class={cx(rt.inkFg, rt.medium)}>Native SMIL timelines.</strong>
            The svg lane's clock is the engine's own: SSR'd loaders animate from HTML parse
            (motion by ~0.6s, before hydration), swapped instances from insertion (~80ms) — the component
            never touches the clock, so hydration cannot snap a running loader back to its resting pose.
          </p>
          <p class={cx(rt.bodyMuted)}>
            <strong class={cx(rt.inkFg, rt.medium)}>Custom svg spinners</strong> come from
            <code class={cx(rt.inkAccent)}>@jixoai/ui-vite-plugin</code>'s spinners feature: opt in with
            <code class={cx(rt.inkAccent)}>jixoai({'{'} spinners {'}'})</code>, name your svg files, and
            the plugin regenerates the committed artifact — the shipped
            <code class={cx(rt.inkAccent)}>@jixoai/spin-set</code> stays a plain inline module with zero
            npm deps, so the DEFAULT artifact installs plugin-free either way.
          </p>
          <CodeBlock code={customLoader} lang="ts" meta="custom loaders via the spinners feature" />
        </div>
      </SectionCard>
    </div>

    <div id="postures" data-reveal="">
      <SectionCard
        family="postures"
        headerRegion="postures"
        eyebrow="postures"
        title="Two postures — the law unchanged"
        summary="Bare renders the inline glyph; wrapping children flips the component into an aria-busy container whose scrim OWNS pointer events — never a visual mask over live hit areas (loading and disabled are different states)."
      >
        <div class={cx(rt.wrapStart24)}>
          <div class={cx(rt.minW52, rt.col12, rt.panel)}>
            <span class={cx(rt.eyebrowPrimary)}>bare · inline glyph</span>
            <Spin label="loading checks" />
            <span class={cx(rt.noteSmall)}>frame cycling under role=status — text or svg by name</span>
          </div>
          <div class={cx(rt.minW52, rt.col12, rt.panel)}>
            <span class={cx(rt.eyebrowPrimary)}>wrapping · container</span>
            <div class={cx(rt.panel, rt.bgCard)}>
              <Spin label="syncing"><p class={cx(rt.text13)}>wrapped content — scrim owns pointers</p></Spin>
            </div>
            <span class={cx(rt.noteSmall)}>aria-busy container; loading is not disabled, interactions stop anyway</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Import the component, hand it a spinner name — the label is the polite announcement, children flip the wrapping posture."
      >
        <CodeBlock code={usage} lang="svelte" meta="Spin usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Theming"
      summary="One paint word for both lanes: currentColor in the primary hue — through the ROOT-PINNED alias (--jx-primary: var(--primary)), and the ink is frozen EVERYWHERE — a scoped dark island cannot repaint it, and at root-level dark the html alias re-derives but the value never reaches the glyph (the A/B adjudication, measured at the element). The wrapping badge rides the popover tokens."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo>
          <div class={cx(rt.rowC32, rt.wrap)}>
            <Spin label="loading checks" />
            <Spin spinner="blocks-wave" label="building" />
          </div>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: 'text-primary', default: 'frames + svg paint', source: 'color', description: 'currentColor in the primary hue through the :root alias --jx-primary → var(--primary) — FROZEN EVERYWHERE (scoped island: held; root-level dark: the html alias re-derives but the glyph holds — A/B measured at the element)' },
            { name: 'interval', default: 'per spinner (80-400ms)', source: 'component', description: 'Rides the catalog verbatim (line 130ms, simpleDots 400ms…); the svg lane is clocked by its own SMIL document' },
            { name: 'bg-popover', default: 'status pill fill', source: 'color' },
            { name: '--scrim', default: 'wrap posture dim', source: 'color', description: 'The family scrim token — a modal dim on the wrapping posture, never a hand-mixed tint' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three props, a snippet, and a class — the name lane is the whole vocabulary switch."
    >
      <PropsTable universal
        props={[
          { name: 'spinner', type: 'SpinName | TextSpinnerName', default: "'dots'", description: "The spinner's name — the generated svg artifact resolves FIRST, the text catalog second; an svg spinner named like a text one overrides it (explicit config beats built-ins, the icons law). The union closes at build time — a typo is a compile error." },
          { name: 'label', type: 'string', default: "'loading'", description: 'Announced to assistive tech ("loading checks").' },
          { name: 'size', type: 'number | string', default: 'var(--jx-icon)', description: "The svg posture's square edge. ABSENT rides the density ruler's var(--jx-icon) (presentation attributes cannot carry var(), so the default lands as a CSS width/height); an explicit value (or a slot config) pins it. The text posture paints var(--jx-text) and ignores the slot." },
          { name: 'interval', type: "number | 'auto'", default: "'auto'", description: 'The frame step in ms — explicit prop > the Defaults slot (context/plugin injectable) > the spinner’s HAND-TUNED catalog pair. The svg lane ignores it (its clock is the SMIL document).' },
          { name: 'linger', type: "number | 'auto'", default: "'auto'", description: "The frame linger duration: each retiring frame stays in the cursor’s own grid cell fading out LINEARLY for this long. 'auto' = the spinner’s HAND-TUNED catalog pair (dots 160, line 0…); 0 = hide at the interval handoff. The trail depth = linger / interval. Context/plugin injectable like the interval; reduced motion is a static CSS kill." },
          { name: 'lingerType', type: "'auto' | 'end' | 'start' | 'both'", default: "'auto'", description: "The opacity animation mode: 'end' fades OUT after the duty window (the default trail); 'start' fades IN through the previous frame's window and COMPLETES exactly at the handoff — the frame arrives solid the instant the previous one exits (simpleDots); 'both' breathes — fade in, hold, fade out (arc, toggle3, growVertical). 'auto' (the default) resolves the spinner’s tuned type; linger 0 collapses every type to the discrete blink. Context/plugin injectable." },
          { name: 'children', type: 'Snippet', default: '—', description: 'Wrapping content = container posture with scrim + aria-busy.' },
          { name: 'class', type: 'string', default: "''", description: 'Lands on the root (the inline span, the svg, or the wrapping grid).' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on spin"
      summary="The ZERO-READER CLASS, measured: the family animates by its OWN engine (the flat CSS keyframes + the SMIL clock) and reads NONE of the eight carriers — density stamps a managed rung, size is the family's §13 hybrid (numbers stamp the §1 carrier; ABSENT rides the density ruler's var(--jx-icon)), and shape / radius / color / elevation / motion supply unread. The ink is pinned to the primary hue through the ROOT-PINNED alias — the separator find's shape #2 — frozen EVERYWHERE (the A/B adjudication: html re-derives, the element holds). Reduced motion is two named channels, measured live."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the flat engine (the growVertical seat: 10 frames mounted, ONE shared
          keyframes rule jx-spin-f10-i120-l120-both inside the single style[data-jx-spin-frames]
          element — 12 rules accumulated, the dots rule f10-i80-l160-end among them — with
          per-frame NEGATIVE delays −120ms…−1200ms over a 1200ms cycle), the pulse-in-pixels pair
          (rAF-sampled opacity of a mid frame oscillates the full range — 7/32 samples nonzero —
          while transform stays 'none', background transparent, and transition-duration 0s:
          opacity is the only animated channel), reduced
          motion measured LIVE on both channels (emulated reduce → frame animation-name 'none' with
          frame 0's opacity-1 face; the svg instance's animationsPaused() flips true and back), the
          theme split (the ink HELD the light primary under a scoped .dark island and re-derived at
          root-level dark A/B: html re-derives, the element holds; measured), the density stamp (data-density="sm" on the seat panel) and
          the grep receipts (zero --jx-*-effective readers over ui/spin/) were measured on this
          page's served DOM (probe, task 41). LAW #19 id landscape: duplicate ids NONE page-wide;
          the keyed gallery mounts 11/11. The query() seat below rides the md viewport key (48rem)
          on the density lane's rung stamp.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <!-- the seat rides a FULL-WIDTH ground: shrink-wrapped stages
             squeeze the strip below measurability (the T40 lesson) -->
        <div class={cx(rt.mt20, rt.wFull)}>
          <Spin spinner="blocks-wave" density={responsiveDensity} label="loading" />
          <p class={cx(rt.mt12, rt.note12, rt.inkMuted70)}>
            The md key is the registered VIEWPORT scale (48rem): below it the small rung stamps
            (data-density="sm"); at 48rem and wider large wins ("lg" at a 1280 viewport,
            measured) — the rung flips on the element while no family rule consumes it (the
            zero-reader class): the stamp is the receipt. The size prop itself is the family's
            own number|string hybrid and REJECTS query() — the lanes-vs-passthroughs boundary,
            typecheck-proven; the named/auto/query lanes are not adopted on the loader.
          </p>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="Spin · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
            <div class={cx(rt.panel)}><Spin spinner="blocks-wave" size={28} label="loading" /></div>
            <div class={cx(rt.panel)}><Spin spinner="dots" label="loading" /></div>
            <div class={cx(rt.panel)}><Spin spinner="blocks-wave" size={20} color="primary" label="loading" /></div>
            <div class={cx(rt.panel)}><Spin spinner="dots" size={20} density="small" label="loading" /></div>
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
      summary="role=status is polite by construction — loading is never an alert; the scrim stops pointers without disabling anything; both animated lanes go quiet under reduced motion."
    >
      <A11yTable
        keys={[]}
        aria={[
          { name: 'role', value: 'status', description: 'Polite live region — announced when the reader is idle, never assertive' },
          { name: 'aria-label', value: 'label prop', description: 'Announced to assistive tech ("loading", "loading checks"…)' },
          { name: 'aria-busy', value: '"true"', description: 'On the wrapping container posture' },
          { name: 'aria-hidden', value: 'true', description: 'On the decorative frames and the svg artwork themselves' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="spin" />
  </div>
</div>
