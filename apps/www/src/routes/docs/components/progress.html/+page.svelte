<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Progress from '$lib/ui/progress/progress.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import progressSource from '$lib/ui/progress/progress.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Progress from '@ui/progress.svelte';
${close}

<Progress value={0.42} label="sync" />      <!-- 42% -->
<Progress value={done} max={total} />       <!-- your scale -->
<Progress />                                <!-- indeterminate: activity, not progress -->`;

  const canvasUsage = `<Progress {value} label="deploy" />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/progress/progress.svelte', content: progressSource },
    { name: 'src/lib/ui/progress-usage.svelte', content: canvasUsage, kind: 'usage' },
  ];

  // the states pair (types section), swept through a canvas: the
  // determinate bar with its % readout against the indeterminate sweep
  const progressTypesDemo = `<script lang="ts">
  import Progress from '@ui/progress.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex min-w-56 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">determinate</span><Progress value={0.42} label="sync" /><span class="text-muted-foreground text-[12.5px]">value present — a real 0..max position with a % readout</span></div>
  <div class="flex min-w-56 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">indeterminate</span><Progress label="connecting" /><span class="text-muted-foreground text-[12.5px]">value omitted — activity, not progress (terminal stripe sweep)</span></div>
</div>`;

  const progressTypesFiles: TreeFile[] = [
    { name: 'progress-types-demo.svelte', content: progressTypesDemo, kind: 'usage' },
  ];

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { value: 0.42 };
  let value = $state(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }

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

  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<Progress size={18} density="small">…</Progress>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/progress-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 34) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/progress/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "MANAGED BUT PAINT-INVARIANT — the rung attr rides the root and the channels stay open for composed descendants, but the bar's own paint is density-invariant: the height equation calc(var(--jx-unit) * 2.5) reads the FIXED 4px unit (measured 10px at every rung including the 2xs stamp), and the readout voices ride promoted label steps (12px, measured constant). The zero-hit ruling stands — value/max/label are data semantics. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "ROOT ECHO — the §11 stamp scales the field root (the readout head rides the root's font), while the native bar keeps its 10px equation. Zero --jx-size-effective readers (grep receipt). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape or factor consumer in ui/progress/). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "OWN SEAM, AXIS UNREAD — the bar's corner rides the promotion seam var(--progress-radius, 4px) (measured 4px ambient; stamped 9px → 9px live in the probe — a consumer var can re-shape it), and the axis carriers are unread (zero radius-effective readers, grep receipt). Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the fill paints var(--primary) straight from the legacy chain (the global brand-hue runtime moves it), with zero --jx-color-effective readers (grep receipt): the hue AXIS never reaches the bar. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE FROZEN-INK SEAM, THIRD INSTANCE (measured per element under .dark) — the FILL re-derives: the pseudo rule paints var(--primary), a live legacy chain, so the fill flips to the drifted dark primary (measured oklch(0.6489 …) → 0.7044-family). Everything else freezes: the track (--jx-muted atom), the 1px frame (--jx-border atom) and the label/value readout inks (--jx-muted-foreground/--jx-foreground atoms) all keep their LIGHT values under dark — a brand stripe on a light track with light ink. system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the bar carries a 1px frame, no shadow tier. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "TWO LIVE CLOCKS, BOTH OFF THE AXIS — the indeterminate sweep rides the promotion seams var(--motion-indeterminate, 900ms) linear infinite (measured 0.9s/linear/24px tile) and slows to 4s under prefers-reduced-motion (measured); the determinate fill's authored 200ms decelerate is LIVE — burst-measured (3 runs, clip frames decoded in-page): the edge moves by 32–53ms and settles by 82–99ms, and the tween PERSISTS under reduced-motion (moved 32–36ms, settled 98–103ms — the engine's smoothing is css-unreachable); a 3s-linear injection stretches the paint to ≈4–4.5s across instruments (3.0s by slope fit; 4.1s task-39; 4.5s on the re-verify's CDP-timestamped capture — the stretch is slope-consistent linear, the exact span is instrument-bound), so the transition channel governs; --jx-motion-effective has zero readers (grep receipt). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import Progress from '@ui/progress.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px) applies; at 48rem+ the md case (18px)
     wins — the readout root scales, the bar stays 10px -->
<Progress value={0.6} label="sync" size={query({ md: 18 }, 13)} />`;

  const queryFiles: TreeFile[] = [
    { name: 'progress-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Progress · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai progress: the native <progress> element — role, value semantics and the indeterminate state are the browser's — with the jixoai paint and an optional label + polite % readout."
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
      eyebrow="registry:ui · NativeHTML"
      title="progress — the element, painted"
      summary="W3C-first: progress IS the native <progress> element. Role, value semantics, min/max mapping and the indeterminate state all belong to the browser. The component adds only the jixoai paint — 1px frame, brand fill, a terminal stripe sweep for the indeterminate run — and an optional label with a polite % readout."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">native &lt;progress&gt;</span>
        <span class="pill">indeterminate built-in</span>
        <span class="pill">two live clocks, measured</span>
        <span class="pill">polite % readout</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (the archetype's install anchor; chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="progress" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="The native element carries the semantics; the family carries two clocks, one seam, and a polite readout — all measured."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The semantics are the platform's, and the family adds nothing to them: a native
          <code class={cx(rt.inkPrimary)}>&lt;progress&gt;</code> exposes the progressbar role and
          its value mapping natively (indeterminate simply omits the current value — measured
          position −1 with no valuenow), the fallback content inside the element serves ancient
          engines, and zero ARIA wiring is authored. The component paints the bar (appearance
          reset across both engines, a 1px hairline frame over a muted track, brand fill at a
          10px height and a 4px corner seam), and adds a label + live % readout.
        </p>
        <p class={cx(rt.para)}>
          There are TWO clocks, and both are live. The INDETERMINATE clock: a terminal-stripe
          sweep at var(--motion-indeterminate, 900ms) linear, a 24px tile — measured
          0.9s/linear/infinite, slowing to 4s under prefers-reduced-motion. The VALUE clock: the
          fill's authored 200ms decelerate is live — burst-measured (clip frames decoded
          in-page), the fill edge is mid-tween at ~35ms and settles inside ~150ms of paint, not a
          first-frame jump — and the tween PERSISTS under reduced-motion: the css kill wins the
          cascade, yet the engine's own smoothing keeps the visible motion (css-unreachable — a
          reduced-motion user still sees the fill animate). Instrument note, carried honestly: a
          single capture taken ≥200ms after the set sees two settled bars and reads "inert" —
          burst capture is the truth instrument for paint transitions. The % readout is
          <code class={cx(rt.inkPrimary)}>role=status</code>: polite — announced when the reader
          is idle, never interrupting.
        </p>
        <p class={cx(rt.para)}>
          The eight axes are near-zero by ruling (value/max/label are data semantics): density is
          managed but the paint is density-invariant (measured 10px at every rung — the height
          equation reads the fixed 4px unit); the radius corner rides the own 4px promotion seam;
          theme is the frozen-ink seam's third instance — the fill re-derives with the brand
          chain while the track, frame and readout inks keep their light literals; size echoes on
          the root; shape/color/elevation/motion supply unread. Kinship:
          <code class={cx(rt.inkPrimary)}>spin</code> (the activity twin for spaces a bar cannot
          fit) and <code class={cx(rt.inkPrimary)}>timeline</code> (the position-on-a-scale
          cousin).
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="progress"
      stage="center"
      description="A determinate bar driven live from the playground, and an indeterminate one below — same element, no value attribute."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/progress/progress.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'value', value: `${Math.round(value * 100)}%` }]}
    >
      <div class={cx(rt.col24, rt.wFull, rt.maxWMd)}>
        <Progress {value} label="deploy" />
        <Progress label="connecting" />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="value">
            <PlayRange bind:value min={0} max={1} step={0.01} />
          </PlayRow>
          <PlayHelp>
            omit <code>value</code> for the indeterminate bar — the honest state when you know
            something is happening but not how much. The % readout is <code>role=status</code>:
            polite, announced when the reader is idle.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="progress-base" data-reveal="">
    <SectionCard
      family="progress-base"
      headerRegion="progress-base"
      eyebrow="W3C foundation"
      title="What the platform gives"
      summary="The element exposes aria-valuenow/min/max natively (indeterminate simply omits valuenow), renders fallback content for ancient engines, and needs no ARIA wiring from us. The paint resets both engines' ::-progress pseudo-elements so WebKit and Gecko draw the same bar."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two states, one element: determinate maps a 0..max scale; omitted value means indeterminate."><ComponentCanvas title="progress · states" stage="center" files={progressTypesFiles}>
    <div class={cx(rt.wrapStart24)}>
      <div class={cx(rt.col12, rt.panel, rt.prgMinW56)}><span class={cx(rt.eyebrowPrimary)}>determinate</span><Progress value={0.42} label="sync" /><span class={cx(rt.inkMuted, rt.text125)}>value present — a real 0..max position with a % readout</span></div>
      <div class={cx(rt.col12, rt.panel, rt.prgMinW56)}><span class={cx(rt.eyebrowPrimary)}>indeterminate</span><Progress label="connecting" /><span class={cx(rt.inkMuted, rt.text125)}>value omitted — activity, not progress (terminal stripe sweep)</span></div>
    </div>
  </ComponentCanvas></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Pass a 0..max value, or omit it for the honest 'something is happening' state."><CodeBlock code={usage} lang="svelte" meta="Progress usage" /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The bar's paint is density-INVARIANT — the height equation reads the fixed 4px unit (measured 10px at every rung, floor included) — and its clocks ride promotion seams: the sweep's 900ms linear and the fill's corner seam are reported constants a consumer var can re-shape."><div class={cx(rt.col24)}><DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}><Progress value={0.42} label="sync" /></DensityDemo><div class={cx(rt.mt20)}><TokenTable tokens={[{ name: 'brand fill', default: 'var(--primary)', source: 'color', description: 'The determinate fill — a live legacy chain, re-derives under .dark (measured).' }, { name: '--progress-radius', default: '4px', source: 'component', description: 'The bar corner promotion seam (measured ambient 4px; a consumer var re-shapes it).' }, { name: '--motion-indeterminate', default: '900ms', source: 'structural', description: 'The stripe sweep period (promotion seam; 4s under reduced motion, measured).' }, { name: '--motion-linear', default: 'linear', source: 'structural', description: 'The sweep timing (promotion seam).' }, { name: '--jx-unit', default: '0.25rem', source: 'density', description: 'The bar height reads unit × 2.5 = 10px — the unit is density-invariant.' }]} /></div></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Three data props and the class passthrough. The generated meta carries 12 NAMED entries (value, max, label, the eight axes, class) and no rest key — the component is rest-less: undeclared attributes are dropped, not spread, and the element's role and value semantics are native, not forwarded. The universal fold serves the eight axis rows."><PropsTable universal props={[{ name: 'value', type: 'number', default: '—', description: '0..max; omitted ⇒ indeterminate ("activity", not "progress").' }, { name: 'max', type: 'number', default: '1', description: "The element's own spec default." }, { name: 'label', type: 'string', default: '—', description: 'Visible label above the bar (also names the element via aria-label; without one the bar falls back to the generic name "progress").' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on progress"
      summary="The zero-hit family, measured honestly: density is managed but the paint is density-INVARIANT (10px at every rung — the height equation reads the fixed unit); the corner rides the own 4px promotion seam (axis unread); theme is the frozen-ink seam's third instance — the brand fill re-derives while track, frame and readout inks stay light literals; size echoes on the root; shape/color/elevation/motion supply unread. Two live clocks, both off the axis: the 0.9s stripe sweep and the fill's burst-measured tween that persists under reduced-motion."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the two live clocks (sweep 0.9s/linear/infinite with a 24px tile, 4s under
          reduced motion; the fill edge burst-measured moving by 32–53ms and settling by 82–99ms
          in normal mode — and PERSISTING under reduced motion, 32–36ms moved / 98–103ms settled
          across 3 runs, with a 3s-linear injection stretching the paint to a slope-consistent linear crawl (≈4–4.5s, instrument-bound); a single capture
          taken ≥200ms after the set would read "inert" — burst is the truth instrument for paint
          transitions), the density-invariant
          height (10px at the 2xs stamp), the radius seam (4px ambient, 9px stamped), the theme
          split (fill 0.6489-family → 0.7044-family under .dark while the label ink stayed
          oklch(0.3211 0 0)) and the platform mapping (indeterminate position −1, valuenow
          omitted; aria-valuenow=100 at max=250) were measured on this page's served DOM (probe,
          task 34; the fill-clock burst receipts re-measured at task 39); the unread rows carry
          grep receipts over ui/progress/. The query() seat below rides the md viewport key
          (48rem) on the size lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="progress · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <Progress value={0.6} label="sync" size={responsiveSize} />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the readout root scales while the bar stays 10px.
                The number lane goes bare. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="Progress · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}><Progress value={0.7} label="axes" size={18} density="small" /></div>
              <div class={cx(rt.panel)}><Progress label="named steps" size="medium" radius="large" /></div>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native element already exposes value semantics (indeterminate omits the current value); the component adds only a polite % readout and a generic-name fallback worth knowing about."><A11yTable keys={[{ key: '—', action: 'Not a focus stop and no keys of its own — value changes announce through the polite status readout, never by stealing focus' }]} aria={[{ name: 'progressbar (implicit)', value: 'native element', description: 'role, value mapping and the indeterminate state are the platform\u2019s — measured: position 0.42 determinate, position −1 with no valuenow when omitted' }, { name: 'aria-valuenow / min / max', value: 'native', description: 'Exposed by the element (measured aria-valuenow=100 at max=250); no ARIA attributes are authored' }, { name: 'aria-label', value: 'label ?? "progress"', description: 'Names the bar; without a visible label the fallback is the GENERIC "progress" — pass a label when several bars share a page (anchoring note)' }, { name: 'role: status', value: 'on the % readout', description: 'Polite live region — announced when the reader is idle; the value is announced through the relation, not read off the bar (measured "42%")' }, { name: 'prefers-reduced-motion', value: 'split, measured', description: 'The stripe sweep slows to 4s (measured); the fill tween is NOT fully suppressible — the css transition is killed outright yet the visible tween persists (engine-side smoothing, css-unreachable; burst-measured across 3 runs)' }]} /></SectionCard></div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="progress" />
  </div>
</div>
