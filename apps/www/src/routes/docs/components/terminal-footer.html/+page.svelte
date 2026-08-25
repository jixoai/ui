<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import terminalFooterSource from '$lib/ui/terminal-footer/terminal-footer.svelte?raw';
  import CodeBlock from '$lib/code-block.svelte';
  import { GITHUB_URL } from '$lib/site';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the closing recipe law (the canvas above is the workbench).

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer.svelte';
${close}

<TerminalFooter
  ghost="JIXOAI/UI"
  links={[
    { label: 'GitHub', href: 'https://github.com/jixoai/ui' },
    { label: 'Registry JSON', href: '/r/registry.json' },
  ]}
  copyright="© 2026 jixoai · MIT"
/>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/terminal-footer.svelte', content: terminalFooterSource },
    { name: 'src/lib/ui/terminal-footer-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Terminal footer · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-footer component: the ghost wordmark that closes the narrative — a huge hollow brand word via text-stroke with an @supports fallback, and a muted meta row of links that transition to brand hue on hover."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="terminal-footer — the ghost wordmark"
        summary="The closing beat of the page narrative: one giant hollow brand word — clamp(3rem, 11vw, 9rem), transparent fill, a 1px text-stroke of the border color at 55% — above a muted meta row whose links warm to the brand hue on hover. Decorative by declaration: the word is aria-hidden and unselectable, so it is pure sign-off, never information."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">text-stroke recipe</span>
          <span class="pill">@supports fallback</span>
          <span class="pill">aria-hidden · unselectable</span>
          <span class="pill">hover warms to primary</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="terminal-footer"
        description="A real footer renders here — the live instance below is the same component closing this very page, staged inline at the canvas width. The ghost scales with the viewport (11vw with clamps), so narrow the window and watch the wordmark breathe."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-footer.svelte"
        {files}
        stage="fill"
      >
        <div class="w-full">
          <p class="text-muted-foreground mb-4 text-center text-[12.5px]">
            ↓ a live footer, rendered directly — the stage is its viewport
          </p>
          <TerminalFooter
            ghost="JIXOAI-UI"
            links={[
              { label: 'GitHub', href: GITHUB_URL },
              { label: 'Registry JSON', href: '/r/registry.json' },
            ]}
            copyright="© 2026 jixoai · MIT"
          />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              hover a link in the meta row — it warms from muted to the brand hue. Narrow the
              viewport: the ghost word scales by <code>11vw</code> between
              clamps, so it breathes with the window instead of overflowing.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="ghost-recipe" data-reveal="">
      <SectionCard
        family="ghost-recipe"
        headerRegion="ghost-recipe"
        eyebrow="law"
        title="The ghost, precisely"
        summary="Three declarations carry the effect; the fourth is honesty about engine support. The wordmark never carries meaning a screen reader needs — the links row below does that work."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>scale: <code class="text-accent">font-size: clamp(3rem, 11vw, 9rem)</code> with
              <code class="text-accent">line-height: 0.9</code> — big at every tier, never banner-sized</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>hollow: transparent fill +
              <code class="text-accent">-webkit-text-stroke: 1px</code> of the border token at 55%</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>fallback: <code class="text-accent">@supports not (-webkit-text-stroke)</code> swaps
              to a 35% border-tinted solid fill</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>etiquette: <code class="text-accent">aria-hidden="true"</code> +
              <code class="text-accent">select-none</code> — decorative by construction; links open
              new tabs (<code class="text-accent">target="_blank"</code> is baked in)</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>
