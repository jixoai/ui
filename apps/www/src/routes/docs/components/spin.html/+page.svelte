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
  import { PlayFields, PlayHelp, PlayNumber, PlayRow, PlaySelect } from '$lib/playground';
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
import { jixoai } from '@jixoai/ui-vite-plugin';
// the vendored loader packs (review R2): the full 109-loader magecdn
// catalog and SamHerbert's 12 — spread what you want, or bring files
import { magecdnSpinners } from '@jixoai/ui-vite-plugin/spinners/magecdn';
import { svgLoadersSpinners } from '@jixoai/ui-vite-plugin/spinners/svg-loaders';

export default {
  plugins: [
    jixoai({
      // bare {} = the vendored blocks-wave only; custom loaders join by
      // name — a kebab grammar, and an svg spinner named like a text
      // spinner OVERRIDES the catalog entry (explicit config beats
      // built-ins, the icons law)
      spinners: {
        spinners: {
          ...magecdnSpinners, // every magecdn loader joins the union
          'my-loader': { file: './src/loaders/my-loader.svg' },
          ...svgLoadersSpinners, // later spread wins on name overlap
        },
      },
    }),
  ],
};

// then regenerate the committed artifact (the repo's single writer):
//   npm run gen:spins
// <Spin spinner="my-loader" /> now type-checks and renders — the
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
    'circle',
    'arrow',
    'bounce',
    'growVertical',
    'toggle3',
    'star',
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — the driven instance below crosses BOTH corpora live
  // catalog-anchored initial timings (review round 2): the controls
  // start at the EFFECTIVE values (dots: interval 80, linger auto =
  // (10-1)×80/2 = 360) and re-anchor when the name changes — a control
  // showing 0 for "catalog default" read as broken
  const catalogOf = (name: TextSpinnerName | SpinName): (typeof SPINNER_CATALOG)[TextSpinnerName] | undefined =>
    Object.hasOwn(SPINNER_CATALOG, name) ? SPINNER_CATALOG[name as TextSpinnerName] : undefined;
  const autoLinger = (name: TextSpinnerName | SpinName): number => {
    const cat = catalogOf(name);
    return cat ? Math.round(((cat.frames.length - 1) * cat.interval) / 2) : 0;
  };
  const canvasInitial = {
    spinner: 'dots' as TextSpinnerName | SpinName,
    size: 16,
    interval: SPINNER_CATALOG.dots.interval,
    linger: autoLinger('dots'),
  };
  let spinner = $state<TextSpinnerName | SpinName>(canvasInitial.spinner);
  let size = $state(canvasInitial.size);
  let interval = $state(canvasInitial.interval);
  let linger = $state(canvasInitial.linger);
  // name changes re-anchor the timings to the catalog (the driven
  // instance always passes explicit numbers; the 'auto' default lives
  // on the static instances across this page)
  $effect(() => {
    const cat = catalogOf(spinner);
    if (cat) {
      interval = cat.interval;
      linger = autoLinger(spinner);
    }
  });
  function resetCanvas(): void {
    spinner = canvasInitial.spinner;
    size = canvasInitial.size;
    interval = canvasInitial.interval;
    linger = canvasInitial.linger;
  }
  // the gallery reps + every generated svg name — the driven select is
  // the name-lane story in miniature (text ↔ svg crossing, zero edits
  // when either corpus grows)
  const spinnerOptions: { value: TextSpinnerName | SpinName; label: string }[] = [
    ...GALLERY.map((value) => ({ value, label: value })),
    ...SPIN_NAMES.map((value) => ({ value, label: `${value} (svg)` })),
  ];
</script>

<svelte:head>
  <title>Spin · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Spin component, ora's voice: one spinner name lane over two corpora — 60 named text spinners from the cli-spinners catalog (dots, line, arc, bounce …) and the generated svg artifact (blocks-wave, custom loaders via the vite plugin). role=status frames under a live matchMedia reduced-motion listener; wrapping posture: an aria-busy container whose scrim OWNS pointer events."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Feedback"
        title="spin — a name, not a cursor"
        summary="The loading indicator in ora's voice. You hand it a NAME: any of the 60 text spinners curated from cli-spinners (frames and intervals verbatim — dots, line, arc, bounce…), or a name from the generated svg artifact (blocks-wave by default, the vendored loader packs and your own files through the vite plugin). The union closes at build time, so a misspelled spinner is a compile error, never a shipped blank. role=status keeps loading polite by construction; under prefers-reduced-motion the text frames rest on frame 0 and the svg clock freezes — observed live, not once at mount."
      >
        <div class="flex flex-wrap gap-3">
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
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            <div class="flex flex-col items-center gap-2">
              <Spin label="loading checks" />
              <code class="text-muted-foreground font-mono text-[11px]">dots · default</code>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Spin spinner="blocks-wave" label="building" size={24} />
              <code class="text-muted-foreground font-mono text-[11px]">blocks-wave · 24</code>
            </div>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <Spin {spinner} {size} {interval} {linger} label="loading checks" />
            <code class="text-muted-foreground font-mono text-[11.5px]">&lt;Spin spinner=&quot;{spinner}&quot; size={size} {interval} {linger} /&gt;</code>
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
              <PlayNumber bind:value={interval} min={0} max={1200} step={10} />
            </PlayRow>
            <PlayRow label="linger">
              <PlayNumber bind:value={linger} min={0} max={3000} step={40} />
            </PlayRow>
            <PlayHelp>
              <code>spinner</code> takes any member of <code>TextSpinnerName</code>
              ({TEXT_SPINNER_NAMES.length} catalog names) or <code>SpinName</code> (the generated
              svg set — <code>blocks-wave</code> plus the curated pack picks). The artifact lane resolves FIRST: an svg
              spinner named like a text one overrides the catalog entry. <code>size</code> is the
              svg posture's square edge — absent rides <code>var(--jx-icon)</code>.
              <code>interval</code> and <code>linger</code> are the text
              posture's two timings — the frame step and the frame residue duration
              ('auto' = (frames−1)×interval/2; 0 = none). Changing the name re-anchors
              both to the catalog; the controls commit live (typing and the −/+ pair).
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
        <div class="flex flex-wrap items-start gap-x-8 gap-y-6">
          {#each GALLERY as name (name)}
            <div class="flex min-w-24 flex-col items-center gap-2">
              <Spin spinner={name} label={name} />
              <code class="text-muted-foreground font-mono text-[11px]">{name}</code>
              <span class="text-muted-foreground font-mono text-[10px]">{SPINNER_CATALOG[name].interval}ms</span>
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
        title="The linger trail — the frame residue timing"
        summary="`linger` is how long each retiring frame stays visible in the cursor's own grid cell, fading out linearly — the trail's depth emerges from linger / interval. Type `number | 'auto'`: the default 'auto' = (frames − 1) × interval / 2 (half the cycle lingers — the gallery above runs it), 0 hides at the interval handoff. `interval` overrides the frame step (explicit prop > the Defaults slot > the spinner's catalog value); both ride the family's one Defaults contract, so a context — or the plugin mounting one — can set them ambiently for every spinner at once."
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-wrap items-start gap-x-12 gap-y-6">
            <div class="flex min-w-36 flex-col items-center gap-2">
              <Spin spinner="growVertical" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">growVertical · linger 'auto' (default)</code>
            </div>
            <div class="flex min-w-36 flex-col items-center gap-2">
              <Spin spinner="dqpb" linger={500} label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">dqpb · linger 500</code>
            </div>
            <div class="flex min-w-36 flex-col items-center gap-2">
              <Spin spinner="dots" interval={160} linger={480} label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">dots · interval 160 + linger 480</code>
            </div>
            <div class="flex min-w-36 flex-col items-center gap-2">
              <Spin spinner="pong" interval={120} linger={0} label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">pong · linger 0 — no residue</code>
            </div>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            <strong class="text-foreground font-medium">Stable by construction.</strong>
            Every frame — live and lingered — renders in the SAME grid cell with
            <code class="text-accent">white-space: pre</code>, so the trail never moves layout: a slow blank frame
            (simpleDots' three spaces) holds its advance width, and switching names never jitters the box. Lingered
            frames never spawn under <code class="text-accent">prefers-reduced-motion</code> and clear the moment
            reduce engages; SSR renders none, so hydration matches.
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
        <div class="flex flex-col gap-6">
          <div class="flex flex-wrap items-start gap-10">
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="blocks-wave" label="building" />
              <code class="text-muted-foreground font-mono text-[11px]">size · var(--jx-icon) (absent default)</code>
            </div>
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="blocks-wave" label="building" size={24} />
              <code class="text-muted-foreground font-mono text-[11px]">size · 24 (pinned)</code>
            </div>
          </div>
          <div class="flex flex-wrap items-start gap-x-10 gap-y-6">
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="tail-spin" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">tail-spin</code>
            </div>
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="spinning-circles" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">spinning-circles</code>
            </div>
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="3-dots-bounce" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">3-dots-bounce</code>
            </div>
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="bars-scale" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">bars-scale</code>
            </div>
            <div class="flex min-w-40 flex-col items-center gap-2">
              <Spin spinner="clock" label="loading" />
              <code class="text-muted-foreground font-mono text-[11px]">clock</code>
            </div>
          </div>
          <p class="text-muted-foreground text-[13px] leading-6">
            <strong class="text-foreground font-medium">Reduced motion, two named channels.</strong>
            SMIL-animated loaders freeze through
            <code class="text-accent">root.pauseAnimations()</code> driven by the component's live
            <code class="text-accent">matchMedia('(prefers-reduced-motion: reduce)')</code>
            listener — frozen means the first frame (blocks-wave's resting 3×3 grid), and
            un-reducing restarts the clock. CSS-keyframed loaders ride the second channel:
            spin.css's static <code class="text-accent">animation: none</code> kill scoped to
            <code class="text-accent">[data-jx-spin-svg]</code>. The channels are documented, never
            conflated — a custom loader chooses its engine by how its artwork is written.
          </p>
          <p class="text-muted-foreground text-[13px] leading-6">
            <strong class="text-foreground font-medium">Multi-instance lockstep.</strong> SMIL
            syncbase references resolve by element id, and duplicate ids across instances resolve
            to the first match in document order — so same-artwork instances animate in
            <em>lockstep</em>, and if that first instance unmounts first (SPA navigation), the
            dependents' timelines become engine-defined (they may freeze or reset). Independent
            phasing would require rewriting ids inside the trusted payload at render time; the
            byte-faithful law wins and the sharp edge is documented here instead.
          </p>
          <p class="text-muted-foreground text-[13px] leading-6">
            <strong class="text-foreground font-medium">Custom svg spinners</strong> come from
            <code class="text-accent">@jixoai/ui-vite-plugin</code>'s spinners feature: opt in with
            <code class="text-accent">jixoai({'{'} spinners {'}'})</code>, name your svg files, and
            the plugin regenerates the committed artifact — the shipped
            <code class="text-accent">@jixoai/spin-set</code> stays a plain inline module with zero
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
        <div class="flex flex-wrap items-start gap-6">
          <div class="flex min-w-52 flex-col gap-3 border border-border p-4">
            <span class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">bare · inline glyph</span>
            <Spin label="loading checks" />
            <span class="text-muted-foreground text-[12.5px]">frame cycling under role=status — text or svg by name</span>
          </div>
          <div class="flex min-w-52 flex-col gap-3 border border-border p-4">
            <span class="text-primary font-nav text-[11px] uppercase tracking-[0.24em]">wrapping · container</span>
            <div class="border border-border bg-card p-4">
              <Spin label="syncing"><p class="text-[13px]">wrapped content — scrim owns pointers</p></Spin>
            </div>
            <span class="text-muted-foreground text-[12.5px]">aria-busy container; loading is not disabled, interactions stop anyway</span>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
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
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <div class="flex flex-wrap items-center gap-8">
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
          { name: 'interval', type: 'number', default: 'the catalog value', description: 'The frame step in ms — explicit prop > the Defaults slot (context/plugin injectable) > the spinner’s own catalog interval (line 130ms, simpleDots 400ms…). The svg lane ignores it (its clock is the SMIL document).' },
          { name: 'linger', type: "number | 'auto'", default: "'auto'", description: "The frame linger duration: each retiring frame stays in the cursor’s own grid cell fading out LINEARLY for this long. 'auto' = (frames − 1) × interval / 2 — half the cycle lingers; 0 = hide at the interval handoff. The trail depth = linger / interval. Context/plugin injectable like the interval; never spawns under reduced motion." },
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
