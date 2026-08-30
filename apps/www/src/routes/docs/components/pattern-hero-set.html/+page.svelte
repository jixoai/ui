<!--
  Docs page for pattern-hero-set (2026-08-30, terminal-patterns).
  Intents:
  1. Pattern summary from the registry catalog (CATALOG lookup, fail-loud).
  2. Three live demos — the terminal-window hero, the ascii-art headline
     hero, the badge-marquee hero.
  3. A pick guide: which form for which landing story.
  4. Usage CodeBlock shared with the canvas drawers.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PatternHeroSet from '$lib/ui/pattern-hero-set/pattern-hero-set.svelte';
  import PatternHeroAscii from '$lib/ui/pattern-hero-set/pattern-hero-ascii.svelte';
  import PatternHeroMarquee from '$lib/ui/pattern-hero-set/pattern-hero-marquee.svelte';

  import patternHeroSetSource from '$lib/ui/pattern-hero-set/pattern-hero-set.svelte?raw';
  import patternHeroAsciiSource from '$lib/ui/pattern-hero-set/pattern-hero-ascii.svelte?raw';
  import patternHeroMarqueeSource from '$lib/ui/pattern-hero-set/pattern-hero-marquee.svelte?raw';

  const entry = CATALOG.find((candidate) => candidate.name === 'pattern-hero-set');
  if (!entry) {
    throw new Error('catalog miss: "pattern-hero-set" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PatternHeroSet from '@ui/pattern-hero-set.svelte';
  import PatternHeroAscii from '@ui/pattern-hero-set/pattern-hero-ascii.svelte';
  import PatternHeroMarquee from '@ui/pattern-hero-set/pattern-hero-marquee.svelte';
  import Badge from '@ui/badge.svelte';
${close}

<!-- 1. the terminal-window hero: one string drives CTA + typed demo -->
<PatternHeroSet
  eyebrow="your-app · v1"
  summary="One command, whole registry."
  copyCommand="npx jixoai-ui init --hue 210"
>
  {#snippet title()}Ship the registry. <em>Keep the source.</em>{/snippet}
  {#snippet badges()}<Badge>OKLCH tokens</Badge>{/snippet}
</PatternHeroSet>

<!-- 2. the ascii-art hero: the banner IS the headline -->
<PatternHeroAscii art={figletBanner} summary="Mono scale clamps; art scrolls, never reflows." />

<!-- 3. the badge-marquee hero: a live token strip under the lead -->
<PatternHeroMarquee items={['oklch tokens', 'zero-dep atoms', 'svelte 5']} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/pattern-hero-set/pattern-hero-set.svelte', content: patternHeroSetSource },
    { name: 'registry/files/ui/pattern-hero-set/pattern-hero-ascii.svelte', content: patternHeroAsciiSource },
    { name: 'registry/files/ui/pattern-hero-set/pattern-hero-marquee.svelte', content: patternHeroMarqueeSource },
    { name: 'src/lib/pattern-hero-usage.svelte', content: usage, kind: 'usage' },
  ];

  const asciiBanner = `     _ _ _ ___ _   _       _\n    | | | | . | |_| |_ _ _| |\n    |_____|___| _| | | | |_  |\n    GitHub-flavored brutalism`;
  const marqueeItems = [
    'oklch tokens',
    'zero-dep atoms',
    'svelte 5 runes',
    'press law',
    'container queries',
    'shiki highlight',
    'jx-pure tier-1',
    'variant grammar',
  ];
</script>

<svelte:head>
  <title>Pattern hero set · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui pattern-hero-set component: three hero forms of the terminal grammar — the terminal-window hero (hero-section + prewired terminal-card), the ASCII-art headline hero, and the badge-marquee hero with a reduced-motion static row."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Layout"
      title="pattern-hero-set — three forms, one grammar"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">terminal-window hero</span>
        <span class="pill">ascii-art headline</span>
        <span class="pill">badge marquee · reduced-motion static</span>
      </div>
    </SectionCard>
  </div>

  <div id="terminal" data-reveal="">
    <ComponentCanvas
      title="pattern-hero-set — the terminal-window hero"
      stage="fill"
      description="The canonical main: hero-section with the right column prewired to a terminal-card whose command derives from the copyCommand prop — one string drives the CTA label, the clipboard payload and the typed demo. Title and badges stay snippets; the entrance cascade is hero-section's own."
      sourceUrl={registrySourceUrl('pattern-hero-set')}
      install="pattern-hero-set"
      files={canvasFiles}
    >
      <div class="w-full border border-border bg-muted/40">
        <PatternHeroSet
          eyebrow="your-app · v0"
          summary="A compact instance with the real composition rules — the copy stays yours, the law stays ours. The terminal demo types the same command the CTA copies."
          copyCommand="npx jixoai-ui init --hue 210"
        >
          {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
          {#snippet badges()}
            <Badge>registry</Badge>
            <Badge>copy CTA</Badge>
            <Badge variant="outline">terminal demo</Badge>
          {/snippet}
        </PatternHeroSet>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            <code class="text-accent">copyCommand</code> is the one payload: press the CTA and the
            command hits the clipboard while the terminal types the same string. Narrow the stage
            past 1100px — the terminal drops below the lead (hero-section's column law).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="ascii" data-reveal="">
    <ComponentCanvas
      title="pattern-hero-set — the ASCII-art hero"
      stage="fill"
      description="The headline IS a figlet banner: art arrives as payload and renders whitespace-preserved in a pre under the mono scale law — the size clamps with the viewport and wide banners scroll their own lane, ascii never reflows."
      sourceUrl={registrySourceUrl('pattern-hero-set')}
      install="pattern-hero-set"
      files={canvasFiles}
    >
      <div class="w-full border border-border bg-muted/40">
        <PatternHeroAscii
          art={asciiBanner}
          eyebrow="$ figlet -f standard jixoai"
          summary="The banner is the loudest thing on the page — everything else stays quiet: one lead paragraph, two buttons, no ornament."
          ctaLabel="get started"
          ctaHref="/docs.html"
          secondaryLabel="browse components"
          secondaryHref="/docs/components.html"
        />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            generate the banner with <code>figlet -f standard</code> and paste it into
            <code class="text-accent">art</code> — whitespace is payload, the pre preserves it.
            The CTA row is press-button: fill primary, outline escape.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="marquee" data-reveal="">
    <ComponentCanvas
      title="pattern-hero-set — the badge-marquee hero"
      stage="fill"
      description="A lead block over a token marquee — npm ls energy: plain mono tokens with dot separators (no chip boxes — the strip is text, so no atom paint is duplicated). The loop is pure CSS; under prefers-reduced-motion the animation dies, the aria-hidden duplicate folds away and the strip becomes a static scrollable row."
      sourceUrl={registrySourceUrl('pattern-hero-set')}
      install="pattern-hero-set"
      files={canvasFiles}
    >
      <div class="w-full border border-border bg-muted/40">
        <PatternHeroMarquee items={marqueeItems} ctaLabel="get started" ctaHref="/docs.html">
          {#snippet title()}Every atom, one grammar.{/snippet}
        </PatternHeroMarquee>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            <code class="text-accent">items</code> is plain string payload — the strip renders
            readable row + aria-hidden duplicate and translates -50% seamlessly. Enable your OS's
            reduced-motion setting: the strip settles into one static, scrollable row.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="pick" data-reveal="">
    <SectionCard
      family="pick"
      headerRegion="pick"
      eyebrow="pick guide"
      title="Picking a form"
      summary="Three forms, one decision: what does the first screen prove?"
    >
      <div class="grid gap-4 min-[760px]:grid-cols-3">
        <div class="border border-border p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">terminal-window</span>
          <p class="text-muted-foreground mt-2 text-[13px] leading-6">The product IS a command. The typed demo proves the install story before a single scroll — pair with a copy CTA.</p>
        </div>
        <div class="border border-border p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">ascii-art</span>
          <p class="text-muted-foreground mt-2 text-[13px] leading-6">The brand IS a wordmark. Brutalist confidence with one paragraph of air — nothing else competes with the banner.</p>
        </div>
        <div class="border border-border p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">badge-marquee</span>
          <p class="text-muted-foreground mt-2 text-[13px] leading-6">The value IS a list of properties. The strip keeps moving under a quiet headline — proof by inventory.</p>
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
      summary="One import per form; the set's barrel exports the canonical main as default and the two siblings as named exports."
    >
      <CodeBlock code={usage} lang="svelte" meta="pattern-hero-set usage" />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="PatternHeroSet (the canonical main), PatternHeroAscii and PatternHeroMarquee (named exports)."
    >
      <PropsTable
        props={[
          { name: 'HeroSet: eyebrow / summary', type: 'string', default: '—', description: 'Hero-section lead props, passed through.', required: true },
          { name: 'HeroSet: copyCommand', type: 'string', default: '—', description: 'ONE string, three jobs: CTA label + clipboard payload + the typed terminal command.', required: true },
          { name: 'HeroSet: title / badges / secondary', type: 'Snippet', default: '—', description: 'Hero-section snippets, forwarded as props.' },
          { name: 'HeroSet: barTitle', type: 'string', default: "'quick-start — zsh'", description: "The terminal window's title-bar label." },
          { name: 'HeroSet: outputs', type: 'readonly string[]', default: "['theme installed', 'hue applied']", description: 'Lines surfaced after the command types out.' },
          { name: 'HeroSet: theme / speed', type: "'dark' | 'light' | 'system' / number", default: "'dark' / 1", description: 'Terminal bezel + typing pace multiplier.' },
          { name: 'Ascii: art', type: 'string', default: '—', description: 'The ascii banner — whitespace-preserved payload (figlet output).', required: true },
          { name: 'Ascii: ctaLabel / ctaHref', type: 'string', default: "'get started' / '#'", description: 'The primary CTA; an empty label renders no CTA row.' },
          { name: 'Ascii: secondaryLabel / secondaryHref', type: 'string', default: "'' / '#'", description: 'An outline CTA beside the primary.' },
          { name: 'Marquee: items', type: 'readonly string[]', default: '—', description: 'The marquee tokens — plain string payload.', required: true },
          { name: 'Marquee: title', type: 'Snippet', default: '—', description: 'The h2 content (the strip is below it).' },
          { name: 'Marquee: duration', type: 'number', default: '24', description: 'One full pass of the strip, in seconds.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
