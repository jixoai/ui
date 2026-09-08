<!--
  math-inline — canonical page (katex-mermaid, 2026-09-06). The inline
  math surface: real KaTeX markup inside prose, baked synchronously at
  prerender. Full demo-standard skeleton: Intro → Install → Usage →
  Examples → API → See Also (in-scope, hard-fail).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import MathInline from '$lib/ui/math-inline';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlayText } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'math-inline')?.summary;
  if (!heroSummary) throw new Error('catalog entry "math-inline" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copies this
  // site runs — one ?raw import (audit P1-A2).
  import mathInlineSource from '$lib/ui/math-inline/math-inline.svelte?raw';
  import katexSource from '$lib/katex.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- workbench: one live formula typed from the playground ---------
  const canvasInitial = { tex: '\\mathrm{e}^{\\mathrm{i}\\pi} + 1 = 0' };
  let tex = $state(canvasInitial.tex);
  function resetCanvas(): void {
    tex = canvasInitial.tex;
  }

  // JSON-quote for a JS-string position; a TeX ATTRIBUTE shows single
  // backslashes (Svelte attributes do not process escapes) — qAttr
  const q = (value: string): string => JSON.stringify(value);
  const qAttr = (value: string): string => JSON.stringify(value).replaceAll('\\\\', '\\');
  const usageLive = $derived(`<script lang="ts">
  import MathInline from '@ui/math-inline';
${close}

<!-- inline math inside prose — the span inherits currentColor -->
<p>
  The identity <MathInline tex=${qAttr(tex)} /> ties the five constants together.
</p>`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/math-inline/math-inline.svelte', content: mathInlineSource },
    { name: 'registry/files/lib/katex.ts', content: katexSource },
    { name: 'src/lib/ui/math-inline-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // static usage sample for the standard Usage section (the workbench
  // drawer above tracks its own live copy)
  const usageCode = `<script lang="ts">
  import MathInline from '@ui/math-inline';
${close}

<p class="prose">
  Gaussian beams narrow to a waist
  <MathInline tex="w_0 = \\sqrt{\\frac{2\\lambda}{\\pi \\, \\mathrm{NA}}}" />
  before diverging at half-angle
  <MathInline tex="\\theta \\approx \\frac{\\lambda}{\\pi w_0}" />;
  together they give the product
  <MathInline tex="w_0 \\theta = \\frac{2\\lambda}{\\pi}" />.
</p>`;

  // canvas-everywhere sweep (2026-09-08): hand-authored mirror of the
  // prose-lane demo below — the same-source resolveRawCode migration is
  // the recorded follow-up
  const mathInlineLaneDemo = `<script lang="ts">
  import MathInline from '@ui/math-inline';
${close}

<div class="border border-border p-4">
  <p class="text-pretty text-[15px] leading-7">
    A Gaussian beam narrows to a waist
    <MathInline tex="w_0 = \\sqrt{\\frac{2\\lambda}{\\pi \\, \\mathrm{NA}}}" />
    before diverging at half-angle
    <MathInline tex="\\theta \\approx \\frac{\\lambda}{\\pi w_0}" />;
    together they pin the product
    <MathInline tex="w_0 \\theta = \\frac{2\\lambda}{\\pi}" />,
    while the Rayleigh range
    <MathInline tex="z_R = \\frac{\\pi w_0^2}{\\lambda}" />
    sets how far the waist holds.
  </p>
</div>`;

  const laneFiles: TreeFile[] = [
    { name: 'math-inline-lane-demo.svelte', content: mathInlineLaneDemo, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Math inline · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai math-inline component: the inline math surface — one native span carrying real KaTeX markup rendered synchronously (prerender bakes the formula, no floor, no hydration work), inheriting prose currentColor so light and dark invert with zero re-render, with KaTeX's hidden MathML as the screen-reader path."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- page head -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="math-inline — real math in prose, no chrome"
        summary={heroSummary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">based on KaTeX</span>
          <span class="pill">one span · zero chrome</span>
          <span class="pill">currentColor · zero re-render</span>
          <span class="pill">MathML screen-reader path</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton: Install then Usage sit ABOVE the
         demos — Intro → Install → Usage → Examples → API → See Also -->
    <div data-reveal="">
      <DocsInstall name="math-inline" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Compose the span between prose runs — tex is a runtime string re-derived synchronously on every change; the formula sits on the text baseline and inherits the paragraph's color."
      >
        <CodeBlock code={usageCode} lang="svelte" meta="MathInline usage" />
      </SectionCard>
    </div>

    <!-- workbench: the live formula, typed from the playground -->
    <div id="math-inline-workbench" data-region="math-inline-workbench" data-reveal="">
      <ComponentCanvas
        title="math-inline"
        description="One span, one formula, live: type any TeX in the playground and the markup re-derives synchronously — an unclosed group paints the error run in place (throwOnError:false is the facade default)."
        sourceUrl={registrySourceUrl('math-inline')}
        {files}
        stage="center"
        onreset={resetCanvas}
        output={[{ label: 'tex', value: tex || '—' }]}
        resolveFileContent={resolveUsage}
      >
        <p class="max-w-md text-pretty text-[15px] leading-7">
          The identity
          <MathInline {tex} />
          ties the five constants together — type another one and watch it
          re-derive with no hydration debt.
        </p>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="tex">
              <PlayText bind:value={tex} placeholder={'e^{i\\pi} + 1 = 0'} />
            </PlayRow>
            <PlayHelp>
              Free TeX — the render is synchronous (the isomorphic-small lane), so every
              keystroke paints immediately. The engine css + fonts ride the
              <code>$lib/katex</code> import, never this surface.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- the sync lane -->
    <div id="math-inline-lane" data-region="math-inline-lane" data-reveal="">
      <SectionCard
        family="math-inline-lane"
        headerRegion="math-inline-lane"
        eyebrow="law"
        title="Inline in prose — several formulas, one paragraph"
        summary="Display math owns its figure; inline math rides the sentence. The span carries nothing but the formula output, so prose rhythm, wrapping, and color all belong to the paragraph around it."
      >
        <ComponentCanvas title="math-inline · prose lane" stage="fill" files={laneFiles}>
          <div class="border border-border p-4">
          <p class="text-pretty text-[15px] leading-7">
            A Gaussian beam narrows to a waist
            <MathInline tex={'w_0 = \\sqrt{\\frac{2\\lambda}{\\pi \\, \\mathrm{NA}}}'} />
            before diverging at half-angle
            <MathInline tex={'\\theta \\approx \\frac{\\lambda}{\\pi w_0}'} />;
            together they pin the product
            <MathInline tex={'w_0 \\theta = \\frac{2\\lambda}{\\pi}'} />,
            while the Rayleigh range
            <MathInline tex={'z_R = \\frac{\\pi w_0^2}{\\lambda}'} />
            sets how far the waist holds. Flip the site theme — the formulas
            invert with the prose and <em>nothing re-renders</em>: katex paints in
            currentColor, so light/dark is a color-scheme change, not a re-derive.
          </p>
          </div>
        </ComponentCanvas>
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
      summary="role=math sits on the content-only span; KaTeX's hidden MathML is the screen-reader path, so the surface mounts no aria-label that would shadow it. Consumer aria-* rides the rest spread and wins its own fields."
    >
      <A11yTable
        keys={[
          { key: '—', action: 'No focus stop of its own: the span is prose content, not a control' },
        ]}
        aria={[
          { name: 'role="math"', value: 'on the span', description: 'The span contains only the formula output — nothing inside to flatten.' },
          { name: 'hidden MathML', value: 'katex output', description: 'output: htmlAndMathml is the facade default — the semantic tree ships in the markup itself.' },
          { name: 'aria-label', value: 'none by design', description: 'Would shadow the MathML; a consumer-provided label rides rest and lands.' },
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
      summary="Five props plus the HTML rest; tex is the only required one."
    >
      <PropsTable
        props={[
          { name: 'tex', type: 'string', default: '—', description: 'TeX source (runtime string, rendered synchronously in inline mode).', required: true },
          { name: 'macros', type: "KatexOptions['macros']", default: '—', description: 'KaTeX macros — merged per key OVER the site-level registerMacros table ($lib/katex).' },
          { name: 'strict', type: "KatexOptions['strict']", default: '—', description: 'KaTeX strict mode passthrough (boolean | ignore | warn | error | handler).' },
          { name: 'trust', type: "KatexOptions['trust']", default: '—', description: 'KaTeX trust passthrough (boolean | handler).' },
          { name: 'class', type: 'string', default: "''", description: 'Merged onto the span through cn().' },
          { name: '…rest', type: 'HTMLAttributes<HTMLSpanElement>', default: '—', description: 'Spread onto the span BEFORE the component\u2019s own data-jx-math-inline/role stamps — data-testid/title/aria-*/handlers land untouched.' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="math-inline" />
  </div>
</div>
