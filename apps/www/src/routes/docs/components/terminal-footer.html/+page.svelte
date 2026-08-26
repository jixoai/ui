<!--
  Docs page for the terminal-footer family (composition-first,
  2026-08-25). Intents: hero summary, one ComponentCanvas over the
  composed footer (columns with free links), the ghost recipe section.
  Structure follows the list-item exemplar; the component family is
  untouchable from here.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '$lib/ui/terminal-footer/terminal-footer-column.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import terminalFooterSource from '$lib/ui/terminal-footer/terminal-footer.svelte?raw';
  import terminalFooterCssSource from '$lib/ui/terminal-footer/terminal-footer.css?raw';
  import CodeBlock from '$lib/code-block.svelte';
  import { GITHUB_URL } from '$lib/site';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import TerminalFooter from '@ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '@ui/terminal-footer/terminal-footer-column.svelte';
${close}

<!-- the meta row is composed: columns carry a title + FREE links -->
<TerminalFooter ghost="JIXOAI/UI" copyright="© 2026 jixoai · MIT">
  <TerminalFooterColumn title="project">
    <a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a>
    <a href="/r/registry.json">Registry JSON</a>
  </TerminalFooterColumn>
</TerminalFooter>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/terminal-footer/terminal-footer.svelte', content: terminalFooterSource },
    { name: 'registry/files/ui/terminal-footer/terminal-footer.css', content: terminalFooterCssSource },
    { name: 'src/lib/ui/terminal-footer-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Terminal footer · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-footer family: the ghost wordmark that closes the narrative — a huge hollow brand word via text-stroke with an @supports fallback — over a composed meta row of TerminalFooterColumn parts (title + free links) and the © line."
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
        summary="The closing beat of the page narrative: one giant hollow brand word — clamp(3rem, 11vw, 9rem), transparent fill, a 1px text-stroke of the border color at 55% — over a meta row composed as TerminalFooterColumn parts: a column title plus FREE link children (the closed links[] data prop died with the data-driven form). Decorative by declaration: the word is aria-hidden and unselectable, so it is pure sign-off, never information."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">text-stroke recipe</span>
          <span class="pill">@supports fallback</span>
          <span class="pill">aria-hidden · unselectable</span>
          <span class="pill">columns composed</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="terminal-footer"
        description="A real footer renders here — composed from columns with free links, staged inline at the canvas width. The ghost scales with the viewport (11vw with clamps), so narrow the window and watch the wordmark breathe."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-footer/terminal-footer.svelte"
        {files}
        stage="fill"
      >
        <div class="w-full">
          <p class="text-muted-foreground mb-4 text-center text-[12.5px]">
            ↓ a live footer, rendered directly — the stage is its viewport
          </p>
          <TerminalFooter ghost="JIXOAI-UI" copyright="© 2026 jixoai · MIT">
            <TerminalFooterColumn title="project">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
              <a href="/r/registry.json">Registry JSON</a>
            </TerminalFooterColumn>
            <TerminalFooterColumn title="registry">
              <a href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">
                shadcn registry docs
              </a>
            </TerminalFooterColumn>
          </TerminalFooter>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              hover a link inside a column — it warms from muted to the brand hue (a layered
              descendant rule; the anchors are free children, so no utility slot exists on them).
              Narrow the viewport: the ghost word scales by <code>11vw</code> between clamps, so
              it breathes with the window instead of overflowing.
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
        summary="Three declarations carry the effect; the fourth is honesty about engine support. The wordmark never carries meaning a screen reader needs — the composed link columns below do that work."
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
              <code class="text-accent">select-none</code> — decorative by construction; external
              links are authored by the caller (target/rel are yours to set)</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One footer shell; the meta row is composed freely — titled or untitled columns of free links.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-56 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">titled column</span><TerminalFooterColumn title="project"><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a><a href="/r/registry.json">Registry JSON</a></TerminalFooterColumn><span class="text-muted-foreground text-[12.5px]">title + free link children</span></div>
      <div class="flex min-w-56 flex-1 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">untitled stack</span><TerminalFooterColumn><a href="/docs.html">Docs</a><a href="/recipes.html">Recipes</a></TerminalFooterColumn><span class="text-muted-foreground text-[12.5px]">omit title for a bare link stack</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose the footer from column parts; ghost and copyright are the shell's own strings."><CodeBlock code={usage} lang="svelte" meta="TerminalFooter usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The ghost is decorative by declaration; the real content is the composed landmark and its free links."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the column links in composed order' }]} aria={[{ name: 'aria-hidden', value: 'true', description: 'On the ghost wordmark + select-none — pure sign-off, never information' }, { name: 'footer', value: 'landmark', description: 'The root is a real footer element' }, { name: 'target/rel', value: 'yours', description: 'External link attributes are authored by the caller on the free anchors' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Viewport-scaled chrome, not density-scaled: the ghost breathes by 11vw; the paint is three text-stroke declarations with an @supports fallback."><div class="flex flex-col gap-6"><DensityDemo><TerminalFooter ghost="JIXOAI-UI" copyright="© 2026 jixoai · MIT"><TerminalFooterColumn title="project"><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></TerminalFooterColumn></TerminalFooter></DensityDemo><TokenTable tokens={[{ name: 'ghost scale', default: 'clamp(3rem, 11vw, 9rem)', source: 'component' }, { name: '-webkit-text-stroke', default: '1px border @ 55%', source: 'color' }, { name: '@supports fallback', default: '35% border-tinted fill', source: 'color' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the TerminalFooter and TerminalFooterColumn Props interfaces."><PropsTable props={[{ name: 'ghost', type: 'string', default: '—', description: 'The ghost wordmark (decorative, aria-hidden).', required: true }, { name: 'copyright', type: 'string', default: '© {live year}', description: 'The © row text.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The meta row — compose TerminalFooterColumn parts.', required: true }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough (footer root / column root).' }, { name: 'Column: title', type: 'string', default: '—', description: 'The column heading; omit for an untitled link stack.' }, { name: 'Column: children', type: 'Snippet', default: '—', description: 'FREE link children — anchors are yours to author.', required: true }]} /></SectionCard></div>
</div>
