<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import FloatButton from '$lib/ui/float-button/float-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the menu-idiom demo + the closing law, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import floatbuttonSource from '$lib/ui/float-button/float-button.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import FloatButton from '@ui/float-button.svelte';
${close}

<!-- plain idiom: a lone fixed action (compose, support, back-to-top) -->
<FloatButton label="back to top" onclick={() => scrollToTop()}>
  <span aria-hidden="true">↑</span>
</FloatButton>

<!-- menu idiom: children + an actions snippet — the button toggles a
     popover=auto stack above itself (native light dismiss, Escape, top layer) -->
<FloatButton label="quick actions" corner="bottom-left">
  <span aria-hidden="true">+</span>
  {#snippet actions()}
    <button type="button" role="menuitem" onclick={compose}>compose</button>
    <button type="button" role="menuitem" onclick={support}>support</button>
  {/snippet}
</FloatButton>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/float-button.svelte', content: floatbuttonSource },
    { name: 'src/lib/ui/float-button-usage.svelte', content: usage },
  ];

  // the overlay shell scrolls on .jx-shell-body, not the window — the
  // back-top action must ride the REAL scroll plane (motion-aware)
  function scrollToTop(): void {
    const body = document.querySelector('.jx-shell-body');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    body?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
</script>

<style>
  /* scrollable stage: the back-top action is demonstrable in place;
     no reveal wrapper — a transformed ancestor hijacks position:fixed
     during the transition window (walkthrough-3 note) */
  .jx-fab-stage {
    position: relative;
    max-height: 14rem;
    overflow-y: auto;
    border: 1px dashed var(--border);
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  /* menu idiom items: the popover carries role=menu; rows are menuitems */
  .jx-fab-menu-item {
    display: block;
    width: 100%;
    border: none;
    background: none;
    color: inherit;
    font-size: 12.5px;
    text-align: left;
    padding: 0.45rem 0.6rem;
    cursor: pointer;
  }
  .jx-fab-menu-item:hover {
    background: var(--muted);
    color: var(--primary);
  }
  .jx-fab-menu-item:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
</style>

<svelte:head>
  <title>FloatButton · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai float-button component: the floating action button in two idioms — plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop; your layout is never touched."
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
        eyebrow="registry:ui · General"
        title="float-button — the fixed corner action"
        summary="The floating action button in two idioms: plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop — your layout is never touched."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">plain · menu idioms</span>
          <span class="pill">corner is a prop</span>
          <span class="pill">popover=auto menu</span>
          <span class="pill">label always required</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="float-button"
        description="float-button — the fixed corner action: scroll this box (or the page), then press the corner button to ride back to the top."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/float-button.svelte"
        files={canvasFiles}
      >
        <div class="jx-fab-stage">
          <p class="text-muted-foreground text-[12.5px] leading-6">
            scroll inside this box or the page itself — the button stays pinned to the viewport
            corner. Press it and the page rides back to its top.
          </p>
          {#each Array(12) as _, i (i)}
            <p class="text-[12.5px] leading-6 text-muted-foreground/70">filler row {i + 1}</p>
          {/each}
          <FloatButton label="back to top" onclick={scrollToTop}>
            <span aria-hidden="true">↑</span>
          </FloatButton>
        </div>
        {#snippet playground()}
          <div class="jx-play-fields">
            <p class="jx-play-help">
              the button is fixed bottom-right of the viewport — no wrapper, no portal:
              <code class="text-accent">corner</code> picks the fixed point and your layout is
              never touched. label is REQUIRED: an icon-only button must say itself.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="menu-idiom" data-reveal="">
      <SectionCard
        family="menu-idiom"
        headerRegion="menu-idiom"
        eyebrow="demo"
        title="The menu idiom"
        summary="Pass an actions snippet and the same button becomes a menu trigger: a popover=auto stack opens above it with native light dismiss, Escape, and top-layer rendering — the component adds only the aria wiring (aria-haspopup=menu, aria-expanded) and the anchor geometry."
      >
        <div class="flex flex-col gap-5">
          <p class="text-[13px] leading-6">
            A second live instance sits fixed at the viewport's
            <strong class="font-semibold">bottom-left</strong> — press the
            <span aria-hidden="true">+</span> button there to open its stack. Items are ordinary
            buttons carrying <code class="text-accent">role="menuitem"</code>; the popover itself
            already carries <code class="text-accent">role="menu"</code>.
          </p>
          <FloatButton label="quick actions" corner="bottom-left">
            <span aria-hidden="true">+</span>
            {#snippet actions()}
              <button type="button" role="menuitem" class="jx-fab-menu-item" onclick={scrollToTop}>
                back to top
              </button>
              <button
                type="button"
                role="menuitem"
                class="jx-fab-menu-item"
                onclick={() => void navigator.clipboard?.writeText('https://ui.jixoai.com')}
              >
                copy this page link
              </button>
              <a
                role="menuitem"
                class="jx-fab-menu-item"
                href="https://github.com/jixoai/ui"
                target="_blank"
                rel="noreferrer"
              >
                github ↗
              </a>
            {/snippet}
          </FloatButton>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="fab-law" data-reveal="">
      <SectionCard
        family="fab-law"
        headerRegion="fab-law"
        eyebrow="law"
        title="Corner is a prop, label is the law"
        summary="Positioning is a prop, not a wrapper: the component owns its fixed point and the consumer's layout is never touched. The surface follows the press-button laws at a fixed size, and the accessible name is mandatory."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">label</code> is required — an icon-only button must say
              itself; the glyph is decorative and <code class="text-accent">aria-hidden</code></span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">corner</code> picks one of four fixed points
              (bottom-right default); no wrapper element, no consumer layout change</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the menu idiom rides <code class="text-accent">popover="auto"</code>: light
              dismiss, Escape, and the top layer belong to the browser; CSS anchor positioning
              keeps the stack glued to its button with flip fallbacks</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the press law is shared with press-button (.jx-press at float scale): hover grows
              the shadow (--shadow → --shadow-md) without moving the body, active presses +1px,+1px
              on the anchored shadow layer, <code class="text-accent">:focus-visible</code> keeps
              the ring</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
