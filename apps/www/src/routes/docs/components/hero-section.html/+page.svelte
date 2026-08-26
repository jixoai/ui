<!--
  Docs page for hero-section (2026-08-25, composition-first-apis).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One ComponentCanvas: the full composed hero — title snippet with
     the accent em, badges snippet composing Badge parts, the default
     copy CTA, secondary + terminal snippets.
  3. Composition section: what each snippet owns (incl. the copy
     override).
  4. Usage CodeBlock shared with the canvas drawer.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import HeroSection from '$lib/ui/hero-section/hero-section.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';

  import heroSectionSource from '$lib/ui/hero-section/hero-section.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'hero-section');
  if (!entry) {
    throw new Error('catalog miss: "hero-section" has no registry meta — fix registry.json');
  }

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import Badge from '@ui/badge.svelte';
  import PressButton from '@ui/press-button.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<HeroSection
  eyebrow="my-app · v1"
  summary="One paragraph of max-62ch lead context."
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet title()}Ship terminals anywhere. <em>One hue.</em>{/snippet}
  {#snippet badges()}
    <Badge>OKLCH tokens</Badge>
    <Badge tone="primary">Svelte 5</Badge>
  {/snippet}
  {#snippet secondary()}
    <PressButton variant="outline" href="/docs.html">Get started</PressButton>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 200"
      outputs={['theme installed', 'hue applied']} />
  {/snippet}
</HeroSection>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/hero-section/hero-section.svelte', content: heroSectionSource },
    { name: 'src/lib/ui/hero-section-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Hero section · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hero-section component, composition-first: title and badges arrive as snippets (the em carries the accent paint, Badge parts compose the row), the copy-command CTA stays a default overridable by a copy snippet, the terminal snippet rides the second column at min-1100px."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="hero-section — the Broadside hero, opened"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">title / badges snippets</span>
          <span class="pill">copy CTA default + override</span>
          <span class="pill">terminal snippet slot</span>
          <span class="pill">staggered reveal</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="hero-section"
        stage="fill"
        description="A complete composed hero — the title snippet carries its own accent em, the badges snippet composes Badge parts, the default copy CTA flips to its copied surface on press. Narrow the viewport past 1100px and the terminal card drops below the lead."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/hero-section/hero-section.svelte"
        files={canvasFiles}      >
        <div class="w-full border border-border bg-muted/40">
          <HeroSection
            eyebrow="your-app · v0"
            summary="A compact instance with the real composition rules — the copy stays yours, the law stays ours. The CTA copies the init command; the terminal demo composes from the same registry files."
            copyCommand="npx jixoai-ui init --hue 210"
          >
            {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
            {#snippet badges()}
              <Badge>registry</Badge>
              <Badge tone="primary">copy CTA</Badge>
              <Badge tone="outline">terminal demo</Badge>
            {/snippet}
            {#snippet secondary()}
              <PressButton variant="outline" href="/docs/components.html">
                browse components
              </PressButton>
            {/snippet}
            {#snippet terminal()}
              <TerminalCard
                barTitle="quick-start — zsh"
                command="npx jixoai-ui init --hue 210"
                outputs={['theme installed', 'hue applied · 210']}
              />
            {/snippet}
          </HeroSection>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              press the PRIMARY CTA — the command hits the clipboard and the button flips to its
              <code>copied</code> surface for 1.4s (a press-button underneath). The title's
              <code class="text-accent">em</code> carries the accent paint wherever you put it;
              the badges row is whatever you compose. A <code class="text-accent">copy</code>
              snippet replaces the default CTA wholesale when you need your own.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="composition"
        title="What the snippets own"
        summary="Structure and chrome are the component's; content is authored. Strings survive only where they are payload or plain text — everything that changes WHAT renders is a snippet."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">title</code> snippet — the whole h1 content; any
                <code class="text-accent">&lt;em&gt;</code> inside carries the accent paint
                (component css <code>:where()</code> rule — the split-em styling the old
                titleLead/titleAccent props carried)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">badges</code> snippet — compose Badge parts
                (<code class="text-accent">badges: string[]</code> is dead); the row keeps the
                mono uppercase strip layout</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">copyCommand</code> — the payload: the default CTA's
                label AND its clipboard target; pressing it flips the press-button to the
                <code class="text-accent">copied</code> surface for 1.4s</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">copy</code> snippet — replaces the default copy CTA
                (the command string is still yours to use however you render it)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">terminal</code> snippet — usually a terminal-card;
                the hero only owns the column and the bottom alignment
                (<code class="text-accent">min-[1100px]</code> two-column grid)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">secondary</code> snippet — outline CTAs after the
                copy button; omit it and the row holds the CTA alone</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One hero shape, two authoring lanes: default copy CTA or your own copy snippet.">
    <div class="grid gap-4 min-[760px]:grid-cols-2">
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">default CTA</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">copyCommand supplies the default press-button's label AND clipboard payload; it flips to the copied surface for 1.4s.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">copy override</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">A copy snippet replaces the default CTA wholesale — the command string stays yours to render however.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Snippets own content; strings stay payload. The em inside the title snippet carries the accent paint."><CodeBlock code={usage} lang="svelte" meta="HeroSection usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The hero is landmark chrome: one h1, a real button for the copy CTA, decorative SVGs hidden."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the copy CTA and secondary CTAs in reading order' }, { key: 'Enter / Space', action: 'Activates the copy CTA — command hits the clipboard, surface flips to copied' }]} aria={[{ name: 'aria-label', value: 'copyLabel', description: 'Accessible name for the default copy CTA ("copy" / localized)' }, { name: 'aria-hidden', value: 'true', description: 'On decorative copy-check SVGs' }, { name: 'heading structure', value: 'h1', description: 'The title snippet renders inside the page h1 — keep it one per page' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Display chrome, not a density-scaled control: the hero sizes from the page type ramp and owns one motion token — the staggered reveal delay."><div class="flex flex-col gap-6"><DensityDemo><HeroSection eyebrow="your-app" summary="A compact density sample." copyCommand="npx jixoai-ui init">{#snippet terminal()}<span class="text-muted-foreground text-[12px]">terminal snippet</span>{/snippet}</HeroSection></DensityDemo><TokenTable tokens={[{ name: '--jx-hero-delay', default: 'stagger step', source: 'component', description: 'Per-child delay of the entrance stagger' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the HeroSection Props interface — required payload as strings, authored content as snippets."><PropsTable props={[{ name: 'eyebrow', type: 'string', default: '—', description: 'Mono uppercase strip above the title.', required: true }, { name: 'summary', type: 'string', default: '—', description: 'Lead paragraph (max-62ch measure).', required: true }, { name: 'copyCommand', type: 'string', default: '—', description: 'Clipboard payload — the default CTA label AND copy target.', required: true }, { name: 'copyLabel', type: 'string', default: "'copy'", description: 'aria affordance for the default copy CTA.' }, { name: 'title', type: 'Snippet', default: '—', description: 'The h1 content; <em> inside carries the accent paint.' }, { name: 'badges', type: 'Snippet', default: '—', description: 'The badge row — compose Badge children.' }, { name: 'copy', type: 'Snippet', default: '—', description: 'Replaces the default copy CTA.' }, { name: 'terminal', type: 'Snippet', default: '—', description: 'The second-column terminal (usually terminal-card); hero owns column + bottom alignment.', required: true }, { name: 'secondary', type: 'Snippet', default: '—', description: 'Outline CTAs after the copy button.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>
</div>
