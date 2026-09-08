<!--
  Docs page for prose (typography-context-and-parts Lane C). The
  reading region provider: eleven absentSlot knobs, two channels (JS
  scope + CSS residue sheet), sovereignty by cascade. The five
  canvases: the knob showcase (scale+flow), indent + initialLetter,
  ink/gradient/ground, family+code-mono, and the sovereignty demo (a
  Prose wrapping a Markdown typography="relaxed" — the trio wins).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import Heading from '$lib/ui/heading/heading.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import Markdown from '$lib/ui/markdown';
  import Prose from '$lib/ui/prose';
  import { usageFile } from '$lib/canvas-usage';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { P, Strong, Mark } from '$lib/ui/text';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copies this
  // site runs (?raw keeps them byte-identical).
  import proseSource from '$lib/ui/prose/prose.svelte?raw';
  import proseCssSource from '$lib/ui/prose/prose.css?raw';

  // The canvas same-source lane (typography-context-and-parts §7): the
  // usage sample composes from THIS PAGE's own canvas markup — one
  // source, two surfaces (the SectionCard CodeBlock + the drawer's
  // usage TreeFile). The hand template literal + `const close` dodge
  // are gone.
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/prose.html/+page';

  const usage = usageFile(
    { Prose: '@ui/prose', '{ P }': '@ui/text' },
    resolveRawCode('knobs'),
  );

  const indentUsage = `<!-- 中文稿纸惯例: the 2em first-line indent, P-only -->
<Prose indent="2em">
  <P>中文稿件每段首行缩进两字，标题永不缩进——标题不是段落。</P>
</Prose>

<!-- the drop cap: BOTH sheet arms, P-only, suppresses the indent -->
<Prose initialLetter={3}>
  <P>The first letter sinks three lines — @supports initial-letter where
  the engine has it, the float ::first-letter fallback everywhere else.</P>
</Prose>`;

  const gradientUsage = `<Prose gradient={{ from: 'var(--primary)', to: 'var(--info)' }}>
  <Heading level={2}>A gradient the marks survive</Heading>
  <P>Fill-only: <Strong>strong</Strong> and <Mark>mark</Mark> keep their
  voice — currentcolor restores against the inherited solid ink.</P>
</Prose>`;

  const sovereigntyUsage = `<Prose size="1.125rem" leading={2}>
  <Markdown typography="relaxed" {source} />
</Prose>

<!-- the trio's root declarations beat inheritance BY CASCADE: the outer
     size/leading can never fight <Markdown typography=…> inside -->`;

  // the sovereignty demo's markdown source: headings + paragraphs the
  // trio restyles its own way
  const sovereigntySource = [
    '## Sovereignty, demonstrated',
    '',
    'The typography **trio** owns scale inside markdown — this relaxed preset stamps its own root declarations, and the outer `<Prose size leading>` wrapper loses to them **by cascade**, not by JS masking.',
    '',
    'Ink and flow knobs still pass through: the region mute tints these lines, but the scale stays the trio\'s.',
  ].join('\n');

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/prose/prose.svelte', content: proseSource },
    { name: 'registry/files/ui/prose/prose.css', content: proseCssSource },
    { name: 'src/lib/ui/prose-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the family demo (canvas-everywhere sweep, 2026-09-08) rides the
  // same-source pilot lane too: the canvas carries id="family", so the
  // drawer's usage file composes from THIS canvas's own children — the
  // hand template literal stays retired on this page
  const familyFiles: TreeFile[] = [
    {
      name: 'prose-family-demo.svelte',
      content: usageFile(
        {
          Prose: '@ui/prose',
          '{ P }': '@ui/text',
          InlineCode: '@ui/inline-code.svelte',
        },
        resolveRawCode('family'),
      ),
      kind: 'usage',
    },
  ];
</script>

<svelte:head>
  <title>Prose · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prose provider: a reading region of eleven absentSlot knobs — size, leading, family, ink, gradient, ground, align, indent, initialLetter, wrap, hyphens — over a div.jx-pure[data-jx-prose] host. Absence IS the state (unset knobs emit nothing, the ambient flows), the plugin chain applies at the provider, and sovereignty is pure cascade: an outer Prose can never fight a Markdown typography preset. The gradient is fill-only (marks restore solid), the drop cap ships both arms, and print/forced-colors restores live in the sheet."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="prose — the reading region, eleven knobs and two channels"
        summary="NOT <Typography> — that word is markdown's live user-facing vocabulary (<Markdown typography=&quot;relaxed&quot;); the provider is <Prose>, rendering a div.jx-pure[data-jx-prose] host. Eleven frozen v1 knobs, every one an absentSlot in ProseDefaults: ABSENCE IS THE STATE — an unset knob emits nothing, stamps nothing, and the ambient channel (an outer prose region's declarations, or no opinion at all) keeps flowing; nested regions inherit every knob they do not set, nearest setter wins. Two channels carry the state: the JS scope (resolved through the plugin chain AT THE PROVIDER — a print-medium plugin can strip gradient/ground before CSS sees them — then provided through the typography lib's context pair) and the CSS residue sheet (prose.css), whose every rule sits at (0,2,0): above the face element rules, BELOW the markdown sheet. That ladder IS the sovereignty contract — an outer <Prose size leading> can never fight <Markdown typography=…>; ink and flow pass through; chrome stays unaffected BY CASCADE; code/kbd stay mono under family; prose stamps no density."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">11 absentSlot knobs</span>
          <span class="pill">absence IS the state</span>
          <span class="pill">sovereignty by cascade</span>
          <span class="pill">gradient is fill-only</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="prose" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Mount the region, compose paragraphs with the text family inside (the residue lanes hook [data-jx-text='p'] — the P component, not a bare p). Set only the knobs you hold opinions on; every unset knob lets the ambient flow."
      >
        <CodeBlock code={usage} lang="svelte" meta="Prose usage" />
      </SectionCard>
    </div>

    <div id="knobs" data-region="prose-knobs" data-family="prose-knobs" data-reveal="">
      <ComponentCanvas
        id="knobs"
        title="prose"
        description="The knob showcase — scale and flow. size rides pure inheritance (headings and paragraphs both scale, and a nested Markdown preset still beats it); leading is the P-only lane (headings keep their 1.25, pre keeps 1.55); align justify pairs with hyphens; wrap pretty is the prose word."
        sourceUrl={registrySourceUrl('prose')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2">
          <div class="flex flex-col gap-2">
            <span class="text-[11px] text-muted-foreground">ambient — no knob set</span>
            <Prose>
              <P>The face's own channels carry this region: 14px body, the p lane at 1.6, ink at the foreground token. Nothing was stamped.</P>
            </Prose>
            <span class="text-[11px] text-muted-foreground">size + leading — scale and flow</span>
            <Prose size="1.0625rem" leading={1.9}>
              <P>17px by inheritance; the P rides the region's 1.9 leading through the presence-gated residue rule. The same string would move a heading's em ladder for free — ambient size scales the ladder.</P>
            </Prose>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[11px] text-muted-foreground">align justify + hyphens auto (lang on the host)</span>
            <Prose align="justify" hyphens="auto" lang="en" size="13.5px">
              <P>Justified columns read best when the engine may break words: hyphens auto needs a lang on the host or an ancestor, and the two knobs are documented as a pair — justify without hyphens rivers, hyphens without justify never shows its work.</P>
            </Prose>
            <span class="text-[11px] text-muted-foreground">wrap pretty — the prose word</span>
            <Prose wrap="pretty">
              <P>Pretty wrapping breaks the final line where the reader needs it; balance is the heading-scope word, stable the tabular one.</P>
            </Prose>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              Every knob is an <code>absentSlot</code>: unset emits nothing, so an ambient channel (an
              outer region's declarations or vars) keeps flowing. <code>size</code> is inheritance
              ONLY — never an element stamp, which is exactly why a nested
              <code>&lt;Markdown typography=…&gt;</code> stays sovereign over it.
              <code>leading</code>/<code>indent</code>/<code>initialLetter</code> are P-only lanes
              gated on the host's <code>data-jx-ty-*</code> presence attrs — presence-gated because
              an ungated <code>var(--jx-ty-leading, inherit)</code> rule would fire always and break
              the face's p{1.6} for every non-prose region.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="indent-initial" data-region="prose-indent-initial" data-family="prose-indent-initial" data-reveal="">
      <SectionCard
        family="indent-initial"
        headerRegion="indent-initial"
        eyebrow="demo"
        title="Indent and the drop cap — the P-only lanes"
        summary="indent is a first-line opinion the region holds about paragraphs only (headings never inherit one — a heading is not a paragraph); '2em' is the 中文稿纸 convention. initialLetter ships BOTH sheet arms — @supports initial-letter where the engine has it, the float ::first-letter fallback everywhere else — because a browser-class-dependent drop cap reads as a bug. The same P suppresses the indent: a drop cap plus a first-line indent double-counts. Drop caps KEEP printing on paper — the manuscript posture, the recorded decision."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={indentUsage} lang="svelte" meta="indent + initialLetter" />
          <div class="grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-2">
              <span class="text-[11px] text-muted-foreground">indent 2em — 中文稿纸惯例</span>
              <Prose indent="2em" size="13.5px">
                <P>中文稿件每段首行缩进两字，正文齐头齐尾。段落之间不加空行，节奏全部由首行缩进承担——这是稿纸的惯例，区域的意见。</P>
                <P>第二段同样缩进。缩进只作用于段落：区域内的标题永不继承首行缩进，因为标题不是段落。</P>
              </Prose>
            </div>
            <div class="flex flex-col gap-2">
              <span class="text-[11px] text-muted-foreground">initialLetter 3 — the drop cap</span>
              <Prose initialLetter={3} size="13.5px">
                <P>The drop cap sinks three lines in every engine: the modern initial-letter path inside @supports, the floated first letter everywhere else. If the same region also set indent, this P would suppress it — the compound rule.</P>
              </Prose>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="ink-gradient-ground" data-region="prose-ink" data-family="prose-ink" data-reveal="">
      <SectionCard
        family="ink"
        headerRegion="ink"
        eyebrow="demo"
        title="Ink, gradient, ground — and the chrome that ignores them"
        summary="ink is the curated four-word union (default/muted/primary/destructive → the four foreground tokens) with a raw escape; links keep primary inside a region (the face B2 element rule — the recorded exception). The gradient is FILL-ONLY: background-clip: text with -webkit-text-fill-color, never color: transparent — currentcolor on a mark would resolve to the inherited transparent and vanish; marks restore solid by element rule, and --jx-ty-ink carries only color tokens so Heading's var-fallback utility never sees an invalid var. ground tints the region; Mark's own highlight law is untouched. And the orthogonality probe: chrome beside the paragraph is unaffected BY CASCADE — element-level declarations beat an inherited wrapper color."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={gradientUsage} lang="svelte" meta="the fill-only gradient" />
          <div class="grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-[11px] text-muted-foreground">ink muted + ground muted — the quiet region</span>
                <Prose ink="muted" ground="muted" class="rounded px-4 py-3">
                  <P>The region mutes its ink and tints its ground — and the chip beside this paragraph keeps its own ink: element-level declarations beat the inherited wrapper color, so control chrome never follows the region's ink by accident.</P>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <Chip>chrome keeps ink</Chip>
                    <Chip variant="outline">orthogonal by cascade</Chip>
                  </div>
                </Prose>
              </div>
              <Prose ink="destructive" size="13px">
                <P>ink is the four-token union plus the raw escape — destructive here, any css color verbatim for everything else.</P>
              </Prose>
            </div>
            <div class="flex flex-col gap-2" data-doc-demo-scope="headings-ok">
              <span class="text-[11px] text-muted-foreground">gradient on the heading + P hooks — marks restore solid</span>
              <Prose gradient={{ from: 'var(--primary)', to: 'var(--info)' }}>
                <Heading level={2} class="text-[1.15rem]">A gradient the marks survive</Heading>
                <P class="mt-1">Fill-only lane: <Strong>strong</Strong>, <Mark>mark</Mark> and the rest keep their voice — the solid color stays inherited, so currentcolor restores against it. Print and forced-colors restores live in the sheet: the paged clone never re-runs the provider.</P>
              </Prose>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="family" data-region="prose-family" data-family="prose-family" data-reveal="">
      <SectionCard
        family="family"
        headerRegion="family"
        eyebrow="demo"
        title="Family — and the code that will not follow it"
        summary="family words resolve to the theme's --font-* tokens; code and kbd keep their own mono element rules (face B1) — a family change is a prose opinion, never a code opinion, so InlineCode chips inside stay their calibrated mono regardless."
      >
        <div class="grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2">
          <ComponentCanvas id="family" title="prose · family" stage="fill" files={familyFiles}>
            <div class="flex flex-col gap-2">
              <span class="text-[11px] text-muted-foreground">family mono — the region, not the chips</span>
              <Prose family="mono" size="13px">
                <P>The whole region sets in the theme's mono token — and the inline chip <InlineCode lang="text">npm run verify</InlineCode> keeps its own mono law anyway: code's face rules are element-level, so family is prose-only by construction.</P>
              </Prose>
            </div>
          </ComponentCanvas>
          <div class="flex flex-col gap-2 rounded border border-warning/45 bg-warning/10 p-4">
            <span class="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">serif is a theme-token dependency — pending</span>
            <p class="m-0 text-[13px] leading-6">
              The <code class="font-mono text-[0.85em]">serif</code> word resolves to
              <code class="font-mono text-[0.85em]">var(--font-serif)</code> — and this theme does
              NOT define <code class="font-mono text-[0.85em]">--font-serif</code> today (only
              --font-sans and --font-mono). Until the theme ships the token,
              <code class="font-mono text-[0.85em]">family="serif"</code> degrades to inheritance
              (the declaration computes to nothing). That is documented, not assumed: the knob is
              frozen with the word, the token is the theme's to add.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="sovereignty" data-region="prose-sovereignty" data-family="prose-sovereignty" data-reveal="">
      <SectionCard
        family="sovereignty"
        headerRegion="sovereignty"
        eyebrow="law"
        title="Sovereignty — the trio wins, by cascade"
        summary="The layering ladder is the whole contract: face element rules (0,1,1) &lt; prose residue rules (0,2,0) &lt; the markdown sheet's §2a (0,2,1) and typography trio (0,3,0) &lt; consumer utilities. An outer <Prose size leading> wrapping a <Markdown typography=…> can never fight the preset — the trio's root declarations beat inheritance, and the residue rules lose to §2a inside [data-jx-markdown]. Zero JS masking, zero markdown changes; ink and flow knobs still pass through."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={sovereigntyUsage} lang="svelte" meta="the sovereignty probe" />
          <div class="flex flex-col gap-2" data-doc-demo-scope="headings-ok">
            <span class="text-[11px] text-muted-foreground">
              outer Prose size 1.125rem + leading 2 — the relaxed preset ignores both, keeps its own 16/1.75
            </span>
            <Prose size="1.125rem" leading={2} class="max-w-3xl">
              <Markdown typography="relaxed" source={sovereigntySource} />
            </Prose>
            <span class="text-[11px] text-muted-foreground">
              and a plain P in the same region does follow the outer size — sovereignty is scoped to the markdown sheet, not the region
            </span>
            <Prose size="1.125rem" leading={2} class="max-w-3xl">
              <P>This paragraph is not inside markdown: it takes the region's 18px and the P lane's 2.0 leading. The ladder applies where the sheets speak — §2a only ever speaks inside [data-jx-markdown].</P>
            </Prose>
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
      summary="The host is a generic flow container — no role, no landmark claim; the reading semantics live in the content's own elements. The presence hooks are styling seams, never semantics. The two engine restores keep the words readable everywhere: forced-colors drops the clipped gradient for CanvasText ink, and print restores solid fill on paper."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — a reading region, not a control' }]}
        aria={[
          { name: 'div[data-jx-prose]', value: 'generic container', description: 'No ARIA injected; the region is structural. Compose landmarks (section, article) around it as the document demands.' },
          { name: 'data-jx-ty-* attrs', value: 'presence hooks', description: 'data-jx-ty-leading/-indent/-initial and data-jx-ty-ink="gradient" are styling/test seams stamped only when the knob is set — they carry no semantics.' },
          { name: 'gradient lane', value: 'forced-colors restore', description: 'The clipped fill drops to currentcolor under forced colors (CanvasText); nothing informational depends on the gradient.' },
          { name: 'drop cap', value: '::first-letter paint', description: 'initialLetter is paint on the real first letter — screen readers announce the word whole; it keeps printing on paper (the manuscript posture).' },
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
      summary="Eleven knobs, every one an absentSlot — no own, no fallback; absence IS the state. Consumer class merges LAST; consumer style lands after the emitted declarations (consumer wins on conflict); rest props pass through untouched."
    >
      <PropsTable props={[
        { name: 'size', type: 'CssLength', default: 'absent', description: "The region's type size — inheritance ONLY, never an element stamp: markdown sovereignty is a cascade fact, not a JS mask, and ambient size scales the heading em ladder for free." },
        { name: 'leading', type: 'number', default: 'absent', description: 'P-only line-height lane (headings keep their 1.25, pre keeps 1.55); applied through the presence-gated residue rule on [data-jx-text=\'p\'].' },
        { name: 'family', type: "'sans' | 'mono' | 'serif' | raw", default: 'absent', description: "Words resolve to the theme --font-* tokens — 'serif' NEEDS the theme to define --font-serif (this theme does not yet; it degrades to inheritance until it does) — or a raw font-family value. Code/kbd keep their own mono element rules." },
        { name: 'ink', type: "'default' | 'muted' | 'primary' | 'destructive' | raw", default: 'absent', description: "The four foreground tokens or a raw color; also mirrors as --jx-ty-ink for Heading's var-fallback utility. Links keep primary inside a region (the face B2 element rule, the recorded exception)." },
        { name: 'gradient', type: '{ from: string; to: string; angle?: number | string } | raw', default: 'absent', description: 'Fill-only lane: structured stops compose a linear-gradient (numeric angle to degrees, default 180deg) or a raw CSS image value verbatim. Never color: transparent — marks restore solid by element rule; print/forced-colors restores live in the sheet.' },
        { name: 'ground', type: "'background' | 'card' | 'popover' | 'muted' | 'secondary' | 'accent' | 'transparent' | raw", default: 'absent', description: "The region's ground token or raw value; Mark's own highlight law is untouched." },
        { name: 'align', type: "'start' | 'center' | 'end' | 'justify'", default: 'absent', description: 'Inheritance lane; justify pairs with hyphens (docs guidance — justify without hyphens rivers).' },
        { name: 'indent', type: 'CssLength', default: 'absent', description: "P-only first-line indent; '2em' is the 中文稿纸 convention. Headings never inherit one; suppressed on a drop-cap P." },
        { name: 'initialLetter', type: '2 | 3 | 4 | 5', default: 'absent', description: 'Drop-cap depth; BOTH sheet arms (@supports initial-letter + the float ::first-letter fallback); suppresses indent on the same P; keeps printing on paper.' },
        { name: 'wrap', type: "'pretty' | 'balance' | 'stable'", default: 'absent', description: 'pretty for prose scopes, balance for heading scopes, stable where lines must not reflow — guidance, not enforcement.' },
        { name: 'hyphens', type: "'auto' | 'none' | 'manual'", default: 'absent', description: "auto needs a lang on the host or an ancestor (documented); pairs with align justify." },
        { name: 'children', type: 'Snippet', default: '—', description: "The region's content — compose with the text family (P and the marks) so the residue lanes hook [data-jx-text='p']." },
        { name: 'class', type: 'string', default: "''", description: 'cn()-merged onto the host LAST — consumer classes win through tailwind-merge dedupe.' },
        { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute (including lang, needed by hyphens auto) passes through to the host div; consumer style lands after the emitted declarations.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="prose" />
  </div>
</div>
