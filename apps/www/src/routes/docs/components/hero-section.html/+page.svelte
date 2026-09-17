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
  import { rt } from '$lib/surface/routes.stylex';
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
  summary="One paragraph of lead context at the 16cm ergonomic measure."
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet title()}Ship terminals anywhere. <em>One hue.</em>{/snippet}
  {#snippet badges()}
    <Badge>OKLCH tokens</Badge>
    <Badge>Svelte 5</Badge>
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

  // canvas-everywhere sweep (2026-09-08): the wide-form demo's usage
  // mirror — hand-authored to match the stage markup (same-source
  // migration is the recorded follow-up).
  const heroSectionWideDemo = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import Badge from '@ui/badge.svelte';
  import PressButton from '@ui/press-button.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<!-- the row form engages at ≥64rem of the hero's own CONTENT box —
     pan a narrow host sideways to see it (container query, not media) -->
<div class="overflow-x-auto">
  <div class="min-w-[67rem]">
    <HeroSection
      eyebrow="your-app · v0"
      summary="The same composition at full width — the lead keeps its 16cm ergonomic measure."
      copyCommand="npx jixoai-ui init --hue 210"
    >
      {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
      {#snippet badges()}
        <Badge>registry</Badge>
        <Badge>copy CTA</Badge>
        <Badge variant="outline">terminal demo</Badge>
      {/snippet}
      {#snippet secondary()}
        <PressButton variant="outline" href="/docs/components.html">browse components</PressButton>
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
</div>`;
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
</script>

<svelte:head>
  <title>Hero section · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hero-section component, composition-first: title and badges arrive as snippets (the em carries the accent paint, Badge parts compose the row), the copy-command CTA stays a default overridable by a copy snippet, and the optional terminal snippet rides the second column at the ≥64rem CONTAINER tier — below it, or without it, the hero stacks and the wide form keeps its whitespace focus. The measure is centimetres (lead 16cm, title 22cm): the ergonomic reading brand."
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
        eyebrow="registry:ui · Layout"
        title="hero-section — the Broadside hero, opened"
        summary={entry.summary}
      >
        <div class={cx(rt.wrap12)}>
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
        scroll="grow"
        description="A complete composed hero in the stacked (below-tier) form — the docs column cannot offer the 64rem of content the wide tier needs, so this stage shows the terminal card stacked under the lead, rendered in full (the canvas's scroll cap is lifted for this composition demo). The wide form lives in the sample below. The title snippet carries its own accent em, the badges snippet composes Badge parts, the default copy CTA flips to its copied surface on press."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/hero-section/hero-section.svelte"
        files={canvasFiles}      >
        <div class={cx(rt.wFull, rt.frame, rt.bgMuted40)}>
          <HeroSection
            eyebrow="your-app · v0"
            summary="A compact instance with the real composition rules — the copy stays yours, the law stays ours. The CTA copies the init command; the terminal demo composes from the same registry files."
            copyCommand="npx jixoai-ui init --hue 210"
          >
            {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
            {#snippet badges()}
              <Badge>registry</Badge>
              <Badge>copy CTA</Badge>
              <Badge variant="outline">terminal demo</Badge>
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
              <code class={cx(rt.inkAccent)}>em</code> carries the accent paint wherever you put it;
              the badges row is whatever you compose. A <code class={cx(rt.inkAccent)}>copy</code>
              snippet replaces the default CTA wholesale when you need your own.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="wide-form" data-reveal="">
      <SectionCard
        family="wide-form"
        headerRegion="wide-form"
        eyebrow="container tier"
        title="the wide form — 64rem of the hero's own content"
        summary="The row form answers the hero's own box, not the viewport: at ≥64rem of CONTENT the grid takes its second column and the terminal aside bottom-aligns against the lead. This docs column cannot offer that width, so the sample below pans sideways in its own scroll lane — an honest presentation of a container tier the page's column can never reach."
      >
        <div class={cx(rt.col12)}>
          <ComponentCanvas
            title="hero-section · wide form"
            stage="fill"
            scroll="grow"
            files={[{ name: 'hero-section-wide-demo.svelte', content: heroSectionWideDemo, kind: 'usage' }]}
          >
            <div
              data-jx-hero-wide-pan=""
              class={cx(rt.oxAuto, rt.frame, rt.bgMuted40)}
            >
              <!-- 67rem floor = the 64rem tier + the section's own px-4
                   insets: the container query reads the section's CONTENT
                   box, so the pan must clear the tier PLUS the section
                   padding for the row form to engage -->
              <div class={cx(rt.hsMinW67)}>
                <HeroSection
                  eyebrow="your-app · v0"
                  summary="The same composition at full width — the lead keeps its 16cm ergonomic measure while the aside column tracks 10.5–13cm beside it."
                  copyCommand="npx jixoai-ui init --hue 210"
                >
                  {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
                  {#snippet badges()}
                    <Badge>registry</Badge>
                    <Badge>copy CTA</Badge>
                    <Badge variant="outline">terminal demo</Badge>
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
            </div>
          </ComponentCanvas>
          <p class={cx(rt.m0, rt.inkMuted, rt.text125, rt.lead5)}>
            pan the lane sideways — its thin scrollbar is the affordance (the site scrollbar law).
            The tier boundary is a CONTAINER query on the hero section itself, so embedding the
            hero in any ≥64rem box takes the row form regardless of the viewport.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="composition"
        title="What the snippets own"
        summary="Structure and chrome are the component's; content is authored. Strings survive only where they are payload or plain text — everything that changes WHAT renders is a snippet."
      >
        <div class={cx(rt.col20)}>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>title</code> snippet — the whole h1 content; any
                <code class={cx(rt.inkAccent)}>&lt;em&gt;</code> inside carries the accent paint
                (component css <code>:where()</code> rule — the split-em styling the old
                titleLead/titleAccent props carried)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>badges</code> snippet — compose Badge parts
                (<code class={cx(rt.inkAccent)}>badges: string[]</code> is dead); the row keeps the
                mono uppercase strip layout</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>copyCommand</code> — the payload: the default CTA's
                label AND its clipboard target; pressing it flips the press-button to the
                <code class={cx(rt.inkAccent)}>copied</code> surface for 1.4s</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>copy</code> snippet — replaces the default copy CTA
                (the command string is still yours to use however you render it)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>terminal</code> snippet — usually a terminal-card, and
                OPTIONAL: the hero only owns the column and the bottom alignment
                (<code class={cx(rt.inkAccent)}>@min-[64rem]/jx-hero</code> container-tier grid; without
                the snippet the wide form keeps the right side empty — whitespace is the focus)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>secondary</code> snippet — outline CTAs after the
                copy button; omit it and the row holds the CTA alone</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One hero shape, two authoring lanes: default copy CTA or your own copy snippet.">
    <div class={cx(rt.grid760b)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>default CTA</span><p class={cx(rt.bodyMuted, rt.mt8)}>copyCommand supplies the default press-button's label AND clipboard payload; it flips to the copied surface for 1.4s.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>copy override</span><p class={cx(rt.bodyMuted, rt.mt8)}>A copy snippet replaces the default CTA wholesale — the command string stays yours to render however.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Snippets own content; strings stay payload. The em inside the title snippet carries the accent paint."><CodeBlock code={usage} lang="svelte" meta="HeroSection usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The hero is landmark chrome: one h1, a real button for the copy CTA, decorative SVGs hidden."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the copy CTA and secondary CTAs in reading order' }, { key: 'Enter / Space', action: 'Activates the copy CTA — command hits the clipboard, surface flips to copied' }]} aria={[{ name: 'aria-label', value: 'copyLabel', description: 'Accessible name for the default copy CTA ("copy" / localized)' }, { name: 'aria-hidden', value: 'true', description: 'On decorative copy-check SVGs' }, { name: 'heading structure', value: 'h1', description: 'The title snippet renders inside the page h1 — keep it one per page' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Display chrome, not a density-scaled control: the hero sizes from the page type ramp and owns one motion token — the staggered reveal delay."><div class={cx(rt.col24)}><DensityDemo><HeroSection eyebrow="your-app" summary="A compact density sample." copyCommand="npx jixoai-ui init">{#snippet terminal()}<span class={cx(rt.inkMuted, rt.text12)}>terminal snippet</span>{/snippet}</HeroSection></DensityDemo><TokenTable tokens={[{ name: '--jx-hero-delay', default: 'stagger step', source: 'component', description: 'Per-child delay of the entrance stagger' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the HeroSection Props interface — payload as strings, authored content as snippets; copyCommand is snippet-conditional."><PropsTable props={[{ name: 'eyebrow', type: 'string', default: '—', description: 'Mono uppercase strip above the title.', required: true }, { name: 'summary', type: 'string', default: '—', description: 'Lead paragraph (16cm ergonomic measure).', required: true }, { name: 'copyCommand', type: 'string', default: '—', description: 'Clipboard payload — the default CTA label AND copy target. Required exactly when the DEFAULT copy CTA renders; optional when a #copy snippet replaces it.' }, { name: 'copyLabel', type: 'string', default: "'copy'", description: 'aria affordance for the default copy CTA.' }, { name: 'title', type: 'Snippet', default: '—', description: 'The h1 content; <em> inside carries the accent paint.' }, { name: 'badges', type: 'Snippet', default: '—', description: 'The badge row — compose Badge children.' }, { name: 'copy', type: 'Snippet', default: '—', description: 'Replaces the default copy CTA wholesale (copyCommand optional).' }, { name: 'terminal', type: 'Snippet', default: '—', description: 'The OPTIONAL second-column aside (usually terminal-card); hero owns column + bottom alignment at the ≥64rem container tier; without it the wide form keeps the right side empty.' }, { name: 'secondary', type: 'Snippet', default: '—', description: 'Outline CTAs after the copy button.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>
</div>
