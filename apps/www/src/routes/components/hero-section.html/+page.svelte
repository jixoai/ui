<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import HeroSection from '$lib/ui/hero-section.svelte';
  import heroSectionSource from '$lib/ui/hero-section.svelte?raw';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the composition law (the canvas above is the workbench).

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import HeroSection from '@ui/hero-section.svelte';
  import PressButton from '@ui/press-button.svelte';
  import TerminalCard from '@ui/terminal-card.svelte';
${close}

<HeroSection
  eyebrow="my-app · v1"
  titleLead="Ship terminals anywhere. "
  titleAccent="One hue."
  summary="One paragraph of max-62ch lead context."
  badges={['OKLCH tokens', 'Svelte 5', 'MIT']}
  copyCommand="npx jixoai-ui init --hue 200"
>
  {#snippet secondary()}
    <PressButton variant="outline" href="/docs.html">Get started</PressButton>
  {/snippet}
  {#snippet terminal()}
    <TerminalCard barTitle="quick-start — zsh"
      command="npx jixoai-ui init --hue 200"
      outputs={['theme installed', 'hue applied']} />
  {/snippet}
</HeroSection>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/hero-section.svelte', content: heroSectionSource },
    { name: 'src/lib/ui/hero-section-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Hero section · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hero-section component: the Broadside hero — clamp-scaled bold lead type with a primary accent tail, badge row, a copy-command PRIMARY CTA with copied feedback, and the terminal card in a bottom-aligned second column at min-1100px."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="hero-section — the Broadside hero"
        summary="The opening statement of a page: a tracked eyebrow, clamp-scaled bold lead type whose accent tail carries the brand hue, a max-62ch text-pretty summary, a mono badge row, and the copy-command PRIMARY CTA — press it and the command reaches the clipboard while the button flips to its copied surface for 1.4s. The terminal snippet rides a bottom-aligned second column once the viewport reaches 1100px."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">copy-command CTA</span>
          <span class="pill">accent tail</span>
          <span class="pill">terminal snippet slot</span>
          <span class="pill">staggered reveal</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="hero-section"
        description="A complete hero, rendered live — press the CTA to copy the command (watch the copied surface), or narrow the viewport past 1100px and watch the terminal card drop below the lead."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/hero-section.svelte"
        {files}
      >
        <div class="w-full border border-border bg-muted/40">
          <HeroSection
            eyebrow="your-app · v0"
            titleLead="Ship the registry into your repo. "
            titleAccent="Keep the source."
            summary="A compact instance with the real composition rules — the copy stays yours, the law stays ours. The CTA copies the init command; the terminal demo composes from the same registry files."
            badges={['registry', 'copy CTA', 'terminal demo']}
            copyCommand="npx jixoai-ui init --hue 210"
          >
            {#snippet secondary()}
              <PressButton variant="outline" href="/components.html">
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
          <div class="jx-play-fields">
            <p class="jx-play-help">
              press the PRIMARY CTA — the command hits the clipboard and the button flips to its
              <code class="text-accent">copied</code> surface for 1.4s (a press-button underneath).
              Then narrow the viewport past 1100px: the terminal card drops below the lead, the
              staggered entrance choreography stays intact.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="slots" data-reveal="" use:reveal>
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="composition"
        title="What the slots own"
        summary="Every degree of freedom is a prop or a snippet with one owner: copy arrives as props, extra CTAs and the terminal demo arrive as snippets, and the component owns the grid, the type scale, and the staggered reveal choreography."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">titleLead</code> +
                <code class="text-accent">titleAccent</code> — the title splits so the accent tail can
                carry <code class="text-accent">text-primary</code> without a markup escape hatch</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">copyCommand</code> — the PRIMARY CTA label AND its
                clipboard payload; pressing it flips the press-button to the
                <code class="text-accent">copied</code> surface for 1.4s with a check icon</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">terminal</code> snippet — usually a terminal-card; the
                hero only owns the column and the bottom alignment
                (<code class="text-accent">min-[1100px]</code> two-column grid)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">secondary</code> snippet — outline CTAs after the copy
                button; omit it and the row holds the CTA alone</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>clipboard has a fallback path (<code class="text-accent">execCommand</code> via a
                transient textarea) for non-secure contexts</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>entrance choreography is built in: static
                <code class="text-accent">data-reveal</code> attributes with staggered delays (60 →
                260ms), so flat-file loads never flash</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>
