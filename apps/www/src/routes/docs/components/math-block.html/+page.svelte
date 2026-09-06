<!--
  math-block — canonical page (katex-mermaid, 2026-09-06). The display
  math surface: the sync-SSR lane (prerender bakes REAL katex markup —
  no floor, no hydration work), the scroll-run strip for wide
  equations, the in-place error paint. Full demo-standard skeleton:
  Intro → Install → Usage → Examples → API → See Also (in-scope,
  hard-fail).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import MathBlock from '$lib/ui/math-block';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'math-block')?.summary;
  if (!heroSummary) throw new Error('catalog entry "math-block" is missing — registry.json meta drift');

  // Same-source law: the code drawer shows the exact registry copies this
  // site runs. `?raw` keeps them byte-identical — embedding component
  // sources (backslashes, ${}, closing tags) in template literals by hand
  // would be an escaping minefield.
  import mathBlockSource from '$lib/ui/math-block/math-block.svelte?raw';
  import katexSource from '$lib/katex.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- the workbench formulas (presets the playground swaps) ----------
  type DemoFormula = 'euler' | 'maxwell' | 'system';

  const formulas: Record<DemoFormula, { label: string; tex: string }> = {
    euler: {
      label: 'Euler identity',
      tex: '\\mathrm{e}^{\\mathrm{i}\\pi} + 1 = 0',
    },
    maxwell: {
      label: "Maxwell's equations",
      tex: '\\begin{aligned}\n\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} & \\nabla \\cdot \\mathbf{B} &= 0 \\\\\n\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} & \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}\n\\end{aligned}',
    },
    system: {
      label: 'linear system',
      tex: '\\mathbf{A}\\mathbf{x} = \\mathbf{b}, \\quad \\mathbf{A} = \\begin{pmatrix} a_{11} & a_{12} & \\cdots & a_{1n} \\\\ a_{21} & a_{22} & \\cdots & a_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m1} & a_{m2} & \\cdots & a_{mn} \\end{pmatrix}, \\quad \\mathbf{x} = \\begin{pmatrix} x_1 \\\\ x_2 \\\\ \\vdots \\\\ x_n \\end{pmatrix}, \\quad \\mathbf{b} = \\begin{pmatrix} b_1 \\\\ b_2 \\\\ \\vdots \\\\ b_m \\end{pmatrix}, \\quad \\lVert \\mathbf{A}\\mathbf{x} - \\mathbf{b} \\rVert_2 \\le \\varepsilon \\left( \\lVert \\mathbf{A} \\rVert_2 \\, \\lVert \\mathbf{x} \\rVert_2 + \\lVert \\mathbf{b} \\rVert_2 \\right)',
    },
  };

  // playground state: the page owns the snapshot + reset; tex derives
  // from the preset (every pick re-derives the markup synchronously);
  // the usage file in the drawer tracks the live pick
  let formula = $state<DemoFormula>('euler');
  const tex = $derived(formulas[formula].tex);
  const canvasInitial = { formula: 'euler' as DemoFormula };
  function resetCanvas(): void {
    formula = canvasInitial.formula;
  }
  const formulaOptions: { value: DemoFormula; label: string }[] = [
    { value: 'euler', label: 'Euler identity' },
    { value: 'maxwell', label: 'Maxwell (aligned)' },
    { value: 'system', label: 'linear system (wide)' },
  ];

  // q() JSON-quotes free text for a JS-string position; TeX in an
  // ATTRIBUTE position shows single backslashes (Svelte attributes do
  // not process backslash escapes) — qAttr is that projection
  const q = (value: string): string => JSON.stringify(value);
  const qAttr = (value: string): string => JSON.stringify(value).replaceAll('\\\\', '\\');
  const usageLive = $derived(`<script lang="ts">
  import MathBlock from '@ui/math-block';
${close}

<!-- the tex prop is a runtime string; the markup bakes at prerender -->
<MathBlock tex=${qAttr(tex)} />`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/math-block/math-block.svelte', content: mathBlockSource },
    { name: 'registry/files/lib/katex.ts', content: katexSource },
    { name: 'src/lib/ui/math-block-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // static usage sample for the standard Usage section (the workbench
  // drawer above tracks its own live copy)
  const usageCode = `<script lang="ts">
  import MathBlock from '@ui/math-block';
${close}

  let tex = $state('\\\\int_{-\\\\infty}^{\\\\infty} \\\\mathrm{e}^{-x^2} \\\\, dx = \\\\sqrt{\\\\pi}');
${close}

<!-- display math: markup bakes during prerender — zero flash, zero CLS -->
<MathBlock {tex} />

<!-- the wide strip: long formulas scroll, chips and veil ride the
     shared scroll-run verdict; copyable=false drops the footer -->
<MathBlock
  tex="\\begin{aligned} \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\ \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} \\end{aligned}"
  copyable={false}
/>`;

  const maxwellTex = formulas.maxwell.tex;
  const systemTex = formulas.system.tex;
</script>

<svelte:head>
  <title>Math block · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai math-block component: the display math surface — a native figure framing real KaTeX markup baked synchronously at prerender (the isomorphic lane: no floor, no hydration work), a wide-equation strip riding the shared scroll-run verdict, an in-place error paint in the error token, and a copy control carrying the raw TeX."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- page head -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="math-block — display math, baked at prerender"
        summary={heroSummary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">based on KaTeX</span>
          <span class="pill">sync SSR lane · zero flash</span>
          <span class="pill">scroll-run strip · shared verdict</span>
          <span class="pill">errors paint in place</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton: Install then Usage sit ABOVE the
         demos — Intro → Install → Usage → Examples → API → See Also -->
    <div data-reveal="">
      <DocsInstall name="math-block" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="tex is a runtime string rendered synchronously in display mode — the markup IS the paint, so prerender bakes it and a prop change re-derives live."
      >
        <CodeBlock code={usageCode} lang="svelte" meta="MathBlock usage" />
      </SectionCard>
    </div>

    <!-- workbench: the live card, formula preset swapped from the playground -->
    <div id="math-block-workbench" data-region="math-block-workbench" data-reveal="">
      <ComponentCanvas
        title="math-block"
        description="The complete figure: the strip (the run is the scroller), ScrollChrome's shadow veil + nudge chips gated by the scroll verdict, and the copy control carrying the raw TeX. The playground swaps the formula — a wider one flips the verdict open and the chrome arms."
        sourceUrl={registrySourceUrl('math-block')}
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[{ label: 'formula', value: formulas[formula].label }]}
        resolveFileContent={resolveUsage}
      >
        <MathBlock {tex} class="w-full max-w-[40rem]" />
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="formula">
              <PlaySelect bind:value={formula} options={formulaOptions} />
            </PlayRow>
            <PlayHelp>
              Every pick re-derives the markup synchronously — watch the chips appear the
              moment a formula outgrows its column: the stamp machine re-verdicts on the
              content-growth restamp, the shared scroll-run law riding wholesale.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- wide equations: the strip -->
    <div id="math-block-strip" data-region="math-block-strip" data-reveal="">
      <SectionCard
        family="math-block-strip"
        headerRegion="math-block-strip"
        eyebrow="scroll law"
        title="Wide equations — the shared scroll strip"
        summary="A display formula is not prose: it must not wrap. The strip is a scroll-run (data-jx-scroll-run + data-axis=horizontal) inside a one-cell grid host; the stamp verdict gates the shadow veil and the two nudge chips, and a formula that fits paints no chrome at all."
      >
        <div class="flex flex-col gap-5">
          <div class="border border-border p-4">
            <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              aligned — Maxwell's equations
            </p>
            <MathBlock tex={maxwellTex} copyable={false} class="w-full max-w-[42rem]" />
          </div>
          <div class="border border-border p-4">
            <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              matrices — a linear system wider than the column
            </p>
            <MathBlock tex={systemTex} class="w-full max-w-[42rem]" />
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            Both ride the same contract as tabs and button-group strips — the ONE
            scrollable-region system, never a local copy. The run measures along the inline
            axis only; the verdict <code class="text-accent">none | start-closed | end-closed | open</code>
            is the single truth every overlay keys on, and pre-hydration the shared css
            paints nothing (the prerendered markup stands alone).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- error paint -->
    <div id="math-block-errors" data-region="math-block-errors" data-reveal="">
      <SectionCard
        family="math-block-errors"
        headerRegion="math-block-errors"
        eyebrow="errors"
        title="Invalid TeX paints in place"
        summary="throwOnError:false is the facade default: the bad source run renders error-tinted inside the same box — no error chrome, no thrown exception — and one console.warn carries the KaTeX diagnostic."
      >
        <div class="flex flex-col gap-5">
          <div class="border border-border p-4">
            <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                an unclosed group — {'\\frac{'} left open
            </p>
            <MathBlock tex={'\\frac{\\pi}{2} + \\frac{'} class="w-full max-w-[40rem]" />
          </div>
          <p class="text-muted-foreground text-pretty text-[13px] leading-6">
            The error run paints in <code class="text-accent">var(--error)</code> — katex's own
            output under the facade's <code class="text-accent">errorColor</code> token binding,
            so light/dark follows the sheet with zero re-render. A caller forcing
            <code class="text-accent">throwOnError: true</code> (strict options) still gets a
            safe surface: the component catches, paints the escaped raw source, and warns —
            errors never escape a component boundary.
          </p>
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
      summary="The figure keeps figure semantics; role=math lives on the inner content-only wrapper, so the copy button stays a discoverable interactive node. KaTeX's hidden MathML is the screen-reader path — no aria-label shadows it."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Reaches the strip (focusable scroll run) and the copy control' },
          { key: '← / →', action: 'Scroll the focused strip when the verdict is open' },
          { key: 'Enter / Space', action: 'Activate the copy button (raw TeX payload)' },
        ]}
        aria={[
          { name: 'role="math"', value: 'inner wrapper', description: 'Only the katex output carries it — the figure and the button keep their own semantics.' },
          { name: 'hidden MathML', value: 'katex output', description: 'The screen-reader path ships in the markup itself (output: htmlAndMathml default); surfaces mount no aria-label.' },
          { name: 'aria-label', value: 'copy / copied', description: 'On the copy button; flips for the 1.6s feedback window.' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Tokens"
      summary="The surface owns almost no paint: KaTeX paints in currentColor, the error run rides the error token, and the strip's chrome rides the shared scroll-run knobs on the host."
    >
      <TokenTable
        tokens={[
          { name: '--error', default: 'jixoai-theme error token', source: 'color', description: 'The errorColor default the facade binds — the in-place error run and the degraded-source paint.' },
          { name: '--ring', default: 'jixoai-theme ring token', source: 'color', description: 'Focus-visible rings on the copy control.' },
          { name: '--jx-scroll-veil', default: 'inset · 1.5', source: 'color', description: 'Host-owned band width for the shadow veil (the shared scroll-run knob).' },
          { name: '--jx-scroll-chevron-*', default: 'shared defaults', source: 'color', description: 'Nudge chip ink/size/glyph slots — all four physical direction slots swappable.' },
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
      summary="Six props plus the HTML rest; tex is the only required one. Everything else is composition over the facade."
    >
      <PropsTable
        props={[
          { name: 'tex', type: 'string', default: '—', description: 'TeX source (runtime string — rendered synchronously in display mode).', required: true },
          { name: 'copyable', type: 'boolean', default: 'true', description: 'Copy control on the footer bar (press physics, clipboard fallback, 1.6s copied feedback; the payload is the raw TeX).' },
          { name: 'labels', type: '{ copy?: string; copied?: string }', default: '—', description: 'Localization payload for the control vocabulary; absent = the English literals shipped, rendered byte-identically.' },
          { name: 'macros', type: "KatexOptions['macros']", default: '—', description: 'KaTeX macros — merged per key OVER the site-level registerMacros table ($lib/katex).' },
          { name: 'strict', type: "KatexOptions['strict']", default: '—', description: 'KaTeX strict mode passthrough (boolean | ignore | warn | error | handler).' },
          { name: 'trust', type: "KatexOptions['trust']", default: '—', description: 'KaTeX trust passthrough (boolean | handler).' },
          { name: 'class', type: 'string', default: "''", description: 'Merged onto the figure through cn().' },
          { name: '…rest', type: 'HTMLAttributes<HTMLElement>', default: '—', description: 'Spread onto the figure BEFORE the component\u2019s own data-kind/data-jx-math-block stamps — consumer attributes land, component semantics stay un-overridable.' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="math-block" />
  </div>
</div>
