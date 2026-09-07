<!--
  Docs page for heading (markdown-coverage-components §1.2, Lane D).
  The level-laddered heading — the em ladder migrated out of the
  markdown face sheet. Demo law: the component MINTS headings, so every
  demo mounts inside data-doc-demo-scope="headings-ok" (the lint's
  sanctioned opt-out) and no demo mints an h1 (the page owns exactly
  one — the hero); the ladder demo spans levels 2–6.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Heading from '$lib/ui/heading/heading.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import headingSource from '$lib/ui/heading/heading.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { Heading } from '@ui/heading';
${close}

<!-- the ladder: level sets the element AND the em-scaled size -->
<Heading level={2}>The section title</Heading>
<Heading level={3}>A subsection</Heading>

<!-- standalone: the hierarchy scales with the ambient font-size preset
     (em, never rem) and carries no margins of its own -->
<div class="flex flex-col">
  <Heading level={4}>Tight composition</Heading>
  <p>The container rhythm owns the spacing.</p>
</div>`;

  const ladderUsage = `<!-- the six levels (level 1 clamps in; h1 is the page's
     one-per-page title — components default to 2) -->
<Heading level={1}>1.875em — document title</Heading>
<Heading level={2}>1.5em — section</Heading>
<Heading level={3}>1.25em — subsection</Heading>
<Heading level={4}>1.125em — minor</Heading>
<Heading level={5}>1em — quiet label</Heading>
<Heading level={6}>1em — quietest</Heading>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/heading/heading.svelte', content: headingSource },
    { name: 'src/lib/ui/heading-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the demo ladder deliberately spans 2–6: a demo-minted h1 would
  // compete with the page's single hero h1 (the one-h1 law)
  const levels = [2, 3, 4, 5, 6] as const;
  const sizes: Record<number, string> = {
    1: '1.875em',
    2: '1.5em',
    3: '1.25em',
    4: '1.125em',
    5: '1em',
    6: '1em',
  };
</script>

<svelte:head>
  <title>Heading · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai heading: a native h1–h6 by level on the em-scaled size ladder (1.875em h1 down to 1em h5/6) — migrated out of the markdown prose face so the hierarchy scales with the ambient typography preset and the component stands alone. Level IS the structural axis (no paint ladder); no block margins; the rendered truth is what data-jx-heading stamps."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="heading — the ladder emigrated from the face"
        summary="A native h1–h6 by level (1–6, rounded then clamped), carrying the em size ladder that used to live in the markdown prose face: 1.875em at h1 down through 1em at h5/6. em, never rem — the hierarchy scales with the ambient font-size preset (the typography trio law) and survives the escape from the face. What it owns: font-bold, leading-[1.25], foreground ink, the size. What it refuses: a paint ladder (level IS the structural axis — the separator precedent of a literal-axis-only component), block margins (preflight zeroes them; the container rhythm law owns root spacing), and a Defaults file (level is not a style prop). Default level 2 — h1 is the page's one-per-page title, and a component defaulting to it would mint competing titles."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native h1–h6</span>
          <span class="pill">em ladder · preset-scaled</span>
          <span class="pill">level = the structural axis</span>
          <span class="pill">no margins of its own</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="heading" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Hand it a level; the element, the size and the hook all derive from the one clamped value — the tag and data-jx-heading never disagree."
      >
        <CodeBlock code={usage} lang="svelte" meta="Heading usage" />
      </SectionCard>
    </div>

    <div id="ladder" data-region="heading-ladder" data-family="heading-ladder" data-reveal="">
      <ComponentCanvas
        title="heading"
        description="The level ladder, rendered: each level is the native element at its em-scaled size with the same bold 1.25 leading and foreground ink. The demo spans levels 2–6 — a demo-minted h1 would compete with the page's single hero title (the one-h1 law); level 1 renders at 1.875em."
        sourceUrl={registrySourceUrl('heading')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="w-full max-w-xl" data-doc-demo-scope="headings-ok">
          <div class="flex flex-col gap-3">
            {#each levels as lv (lv)}
              <div class="flex items-baseline gap-4">
                <code class="w-24 flex-none font-mono text-[11px] text-muted-foreground">h{lv} · {sizes[lv]}</code>
                <Heading level={lv}>The level {lv} rung</Heading>
              </div>
            {/each}
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The size ladder is <code>em</code>-scaled: bump the ambient font-size (the markdown
              typography presets do exactly this) and the whole hierarchy rescales with it. Level
              values clamp — round to the nearest integer, then bound to 1–6 — and the hook stamps
              the clamped truth, so an out-of-range prop never desyncs tag from
              <code>data-jx-heading</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="standalone" data-region="heading-standalone" data-family="heading-standalone" data-reveal="">
      <SectionCard
        family="standalone"
        headerRegion="standalone"
        eyebrow="demo"
        title="Standalone — outside any prose face"
        summary="The component owns its channels outright, so it works with no jx-pure scope in sight: same ink, same weight, same ladder. It carries no margins — the container rhythm owns the spacing, GitHub's container-tight posture — and the markdown map escapes it (no-jx-pure) so the face stops double-painting it."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={ladderUsage} lang="svelte" meta="the six levels" />
          <div class="max-w-xl rounded-lg border border-border p-5" data-doc-demo-scope="headings-ok">
            <div class="flex flex-col">
              <Heading level={3}>No face, no problem</Heading>
              <p class="text-[13px] leading-6 text-muted-foreground">
                The heading above rendered with zero prose-face context — the em ladder, weight
                and ink are the component's own. The gap you see is this container's rhythm, not
                the heading's margin.
              </p>
            </div>
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
      summary="Native heading semantics — the document outline is real. The id prop is the addressing surface anchor links and aria-labelledby point at."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — document structure, not a control' }]}
        aria={[
          { name: 'h1–h6', value: 'native elements', description: 'The platform announces the level and builds the outline; skipping levels is the caller\'s outline decision, never silently repaired.' },
          { name: 'id', value: 'passthrough', description: 'Optional explicit address — the document addressing surface (anchor navigation, aria-labelledby).' },
          { name: 'data-jx-heading', value: 'clamped level', description: 'Hook attribute carrying the rendered level (1–6) — the clamped truth, never the raw prop.' },
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
      summary="Three props and a verbatim spread; the tag, the size and the hook all derive from one clamped level."
    >
      <PropsTable props={[
        { name: 'level', type: '1 | 2 | 3 | 4 | 5 | 6', default: '2', description: 'The heading level: sets the native element (h1–h6) and the em-scaled size rung. Out-of-range values clamp (rounded, then bounded). Default 2 — h1 is the page\'s one-per-page title; the markdown map always passes level explicitly.' },
        { name: 'id', type: 'string', default: '—', description: 'Optional explicit address — anchor links and aria-labelledby point here.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The heading text.' },
        { name: 'class', type: 'string', default: "''", description: 'Forwarded to the rendered heading element; consumer classes land last.' },
        { name: '...rest', type: 'HTMLAttributes<HTMLHeadingElement>', default: 'spread', description: 'Every other attribute passes through to the native heading element untouched.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="heading" />
  </div>
</div>
