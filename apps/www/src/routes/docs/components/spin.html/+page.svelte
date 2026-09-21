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
      .filter(Boolean)
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

    <div data-reveal="">
      <DocsInstall name="spin" />
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

    <div data-reveal="">
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
  </div>
</div>

<div class={cx(rt.shellFlush)}>
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

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Theming"
      summary="One paint word for both lanes: currentColor in the primary hue. The svg posture inherits the text color of its slot; the text frames are mono glyphs; the wrapping badge rides the popover tokens."
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
            { name: 'text-primary', default: 'frames + svg paint', source: 'color', description: 'currentColor in the primary hue — the whole indicator, text and svg alike' },
            { name: 'interval', default: 'per spinner (80-400ms)', source: 'component', description: 'Rides the catalog verbatim (line 130ms, simpleDots 400ms…); the svg lane is clocked by its own SMIL document' },
            { name: 'bg-popover', default: 'status pill fill', source: 'color' },
            { name: '--scrim', default: 'wrap posture dim', source: 'color', description: 'The family scrim token — a modal dim on the wrapping posture, never a hand-mixed tint' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. §13: size numbers are the axis' number lane VERBATIM (px); the absent state keeps riding the density ruler's --jx-icon."
    >
      <ComponentCanvas title="Spin · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Spin spinner="blocks-wave" size={28} label="loading" /></div>
        <div class={cx(rt.panel)}><Spin spinner="dots" label="loading" /></div>
        <div class={cx(rt.panel)}><Spin spinner="blocks-wave" size={20} color="primary" label="loading" /></div>
        <div class={cx(rt.panel)}><Spin spinner="dots" size={20} density="small" label="loading" /></div>
        </div>
      </ComponentCanvas>
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
      <PropsTable
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

  <div data-reveal="">
    <DocsSeeAlso name="spin" />
  </div>
</div>
