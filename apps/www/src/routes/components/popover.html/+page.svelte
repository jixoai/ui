<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import Popover from '$lib/ui/popover.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';
  import { onMount } from 'svelte';

  // the nine @position-try candidates are injected at RUNTIME: every
  // CSS processor on the path (Svelte scoped styles AND the Vite/
  // Tailwind pipeline) strips @position-try rule bodies — it treats
  // inset-area as an unknown property and drops the declarations.
  // overview-card's wing candidates have silently suffered the same
  // fate (masked by its flip-inline fallback). A plain <style> node
  // in the head bypasses all processors.
  onMount(() => {
    const style = document.createElement('style');
    style.dataset.jxTryGrid = '';
    // physical-inset form: Chrome's @position-try allow-list no longer
    // accepts inset-area inside candidates — only inset/margin/size and
    // self-alignment. Every edge is written explicitly (auto for the
    // freed sides) because a candidate only overrides the properties it
    // names; the flush margin stays 0 (r22). anchor-center does the
    // span-alignment; the center cell is a viewport-centered inset 0 +
    // margin auto pair (fit-content sizing keeps the panel small)
    style.textContent = `
      @position-try --jx-try-top-start {
        bottom: anchor(top); top: auto; left: anchor(left); right: auto;
      }
      @position-try --jx-try-top {
        bottom: anchor(top); top: auto; left: auto; right: auto;
        justify-self: anchor-center;
      }
      @position-try --jx-try-top-end {
        bottom: anchor(top); top: auto; left: auto; right: anchor(right);
      }
      @position-try --jx-try-left {
        right: anchor(left); left: auto; top: auto; bottom: auto;
        align-self: anchor-center;
      }
      @position-try --jx-try-center {
        top: 0; bottom: 0; left: 0; right: 0; margin: auto;
      }
      @position-try --jx-try-right {
        left: anchor(right); right: auto; top: auto; bottom: auto;
        align-self: anchor-center;
      }
      @position-try --jx-try-bottom-start {
        top: anchor(bottom); bottom: auto; left: anchor(left); right: auto;
      }
      @position-try --jx-try-bottom {
        top: anchor(bottom); bottom: auto; left: auto; right: auto;
        justify-self: anchor-center;
      }
      @position-try --jx-try-bottom-end {
        top: anchor(bottom); bottom: auto; left: auto; right: anchor(right);
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  });

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import popoverSource from '$lib/ui/popover.svelte?raw';

  let choice = $state<string | null>(null);

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const menuUsage = `<script lang="ts">
  import Popover from '@ui/popover.svelte';
${close}

<!-- menu rows repeat popovertarget to close on select — still zero JS -->
<Popover id="actions" triggerLabel="Actions">
  <div class="flex flex-col">
    <button type="button" class="pop-row" popovertarget="actions">Rename…</button>
    <button type="button" class="pop-row" popovertarget="actions">Archive</button>
  </div>
</Popover>`;

  const cardUsage = String.raw`<Popover id="status" triggerLabel="Registry status">
  <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
    registry status
  </p>
  <p>Any content — the snippet is the whole panel body.</p>
</Popover>`;

  // ---- component canvas (audit P1-A2): LIVE trigger + label playground --
  const canvasInitial = { triggerLabel: 'Actions', choice: null as string | null };
  let canvasTriggerLabel = $state(canvasInitial.triggerLabel);
  let canvasChoice = $state<string | null>(canvasInitial.choice);
  let canvasVariant = $state<'solid' | 'acrylic' | 'auto'>('auto');

  // nine-grid position-try: each cell toggles one custom @position-try
  // candidate (see the @position-try rules in the page styles); the
  // panel tries the ENABLED cells, in grid order, when the initial
  // placement overflows
  const TRY_CELLS: { id: string; label: string }[] = [
    { id: 'top-start', label: '◤' },
    { id: 'top', label: '▲' },
    { id: 'top-end', label: '◥' },
    { id: 'left', label: '◀' },
    { id: 'center', label: '•' },
    { id: 'right', label: '▶' },
    { id: 'bottom-start', label: '◣' },
    { id: 'bottom', label: '▼' },
    { id: 'bottom-end', label: '◢' },
  ];
  const ALL_TRIES = TRY_CELLS.map((c) => c.id);
  // default order puts bottom-end FIRST — the classic initial position
  // while all nine stay lit (recently lit cells unshift ahead of it)
  let canvasTries = $state<string[]>(['bottom-end', ...ALL_TRIES.filter((t) => t !== 'bottom-end')]);
  const tryFallbacks = $derived(
    canvasTries.length ? canvasTries.map((id) => `--jx-try-${id}`).join(', ') : undefined,
  );
  // THE INTUITED LAW (Owner report, 2026-08-23): the FIRST lit cell is
  // the INITIAL position — the grid selects where the panel lives, the
  // remaining cells are the overflow fallback chain. All-on (the
  // default) keeps the classic bottom-end start; an empty grid falls
  // back to bottom-end too (no candidates either way)
  const canvasPlacement = $derived(canvasTries[0] ?? 'bottom-end');

  function toggleTry(id: string): void {
    if (id === 'center') {
      // the center cell is the master switch: all-on ⇄ all-off
      canvasTries = canvasTries.length === ALL_TRIES.length
      ? []
      : ['bottom-end', ...ALL_TRIES.filter((t) => t !== 'bottom-end')];
    } else {
      // newly lit cells go FIRST — "the cell I just lit is where the
      // panel should live" (the initial position follows canvasTries[0])
      canvasTries = canvasTries.includes(id)
        ? canvasTries.filter((t) => t !== id)
        : [id, ...canvasTries.filter((t) => t !== id)];
    }
    // position-try locks when the panel opens — a visible panel never
    // re-evaluates. Reopen in the next frame so the grid feels
    // immediate. VISIBILITY is judged by display, not :popover-open: a
    // panel mid-exit has already dropped the pseudo-class, and skipping
    // the reopen there stranded the panel closed (the rapid-toggle
    // dead-panel corruption, r25)
    const pop = document.getElementById('canvas-pop') as HTMLElement | null;
    if (pop && getComputedStyle(pop).display !== 'none') {
      pop.hidePopover();
      requestAnimationFrame(() => {
        if (!pop.isConnected) return;
        (pop as HTMLElement & { showPopover(): void }).showPopover();
      });
    }
  }

  function resetPopoverCanvas(): void {
    canvasTriggerLabel = canvasInitial.triggerLabel;
    canvasChoice = canvasInitial.choice;
    canvasVariant = 'auto';
    canvasTries = [...ALL_TRIES];
  }

  // live usage code tracks the current triggerLabel; q() keeps user input
  // (quotes, apostrophes, newlines) a legal string literal in the source
  const q = (value: string): string => JSON.stringify(value);
  const canvasUsageLive = $derived(`<script lang="ts">
  import Popover from '@ui/popover.svelte';
${close}

let triggerLabel = $state(${q(canvasTriggerLabel)});
${close}

<!-- rows repeat popovertarget to close on select — still zero JS -->
<Popover id="actions" {triggerLabel} variant=${q(canvasVariant)}>
  <div class="flex w-52 flex-col">
    <button type="button" class="pop-row" popovertarget="actions">Rename…</button>
    <button type="button" class="pop-row" popovertarget="actions">Archive</button>
  </div>
</Popover>`);

  const resolveCanvasUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? canvasUsageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/popover.svelte', content: popoverSource },
    { name: 'src/lib/ui/popover-usage.svelte', content: canvasUsageLive },
  ];

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [
    { id: 'popover-menu', label: 'menu type' },
    { id: 'popover-card', label: 'card type' },
    { id: 'popover-base', label: 'NativeHTML base' },
  ];
</script>

<svelte:head>
  <title>Popover · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popover component: the native Popover API — popover=&quot;auto&quot; light dismiss, a declarative popovertarget trigger, top-layer rendering — in a zero-script component. Anchored placement is the named extension direction."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="popover — declarative, zero script"
      summary="The native Popover API does everything: the panel carries popover=&quot;auto&quot; and the trigger is wired with popovertarget, so light dismiss, Escape, aria-expanded, and top-layer rendering come from the browser. The component ships no JavaScript at all — open this page's view source and check."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">popover="auto"</span>
        <span class="pill">popovertarget trigger</span>
        <span class="pill">light dismiss · Escape</span>
        <span class="pill">top layer</span>
        <span class="pill">0 lines of JS</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench (audit P1-A2): LIVE trigger + label playground + sources -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="popover"
      description="popover=&quot;auto&quot; + popovertarget: light dismiss, Escape, aria-expanded, and top-layer rendering are the browser's — the panel anchors to the trigger through CSS Anchor Positioning. Relabel the trigger from the Playground."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/popover.svelte"
      files={canvasFiles}
      onreset={resetPopoverCanvas}
      echo={[
        { label: 'trigger', value: canvasTriggerLabel || '—' },
        { label: 'last action', value: canvasChoice ?? '—' },
      ]}
      resolveFileContent={resolveCanvasUsage}
    >
      <div class="flex flex-col items-center gap-4">
        <!-- the panel lives in the stage; the top layer lifts it on open -->
        <Popover
          id="canvas-pop"
          triggerLabel={canvasTriggerLabel}
          variant={canvasVariant}
          placement={canvasPlacement}
          {tryFallbacks}
        >
          <div class="flex w-52 flex-col">
            <button type="button" class="pop-row" popovertarget="canvas-pop"
              onclick={() => (canvasChoice = 'renamed')}>Rename…</button>
            <button type="button" class="pop-row" popovertarget="canvas-pop"
              onclick={() => (canvasChoice = 'link copied')}>Copy link</button>
            <button type="button" class="pop-row pop-row-destructive" popovertarget="canvas-pop"
              onclick={() => (canvasChoice = 'deleted')}>Delete</button>
          </div>
        </Popover>
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <Input label="triggerLabel" placeholder="Actions" bind:value={canvasTriggerLabel} />
          </div>
          <div class="jx-play-field">
            <fieldset class="jx-play-variant">
              <legend>variant</legend>
              <div class="jx-play-variant-row" role="radiogroup" aria-label="variant">
                {#each ['auto', 'acrylic', 'solid'] as v (v)}
                  <label>
                    <input type="radio" name="jx-pop-variant" value={v} bind:group={canvasVariant} />
                    <span>{v}</span>
                  </label>
                {/each}
              </div>
            </fieldset>
          </div>
          <div class="jx-play-field">
            <fieldset class="jx-play-try">
              <legend>position-try</legend>
              <div class="jx-try-grid" role="group" aria-label="position-try candidates">
                {#each TRY_CELLS as cell (cell.id)}
                  <button
                    type="button"
                    class="jx-try-cell"
                    class:jx-try-on={canvasTries.includes(cell.id)}
                    aria-pressed={canvasTries.includes(cell.id)}
                    title={cell.id}
                    onclick={() => toggleTry(cell.id)}
                  >{cell.label}</button>
                {/each}
              </div>
              <p class="jx-play-help">
                the MOST RECENTLY lit cell is the panel's initial position; the rest are the
                <code class="text-accent">@position-try</code> fallback chain, tried in order
                when the initial overflows. the center cell is the master switch
                (all ⇄ none); a live panel reopens itself on toggle.
              </p>
            </fieldset>
          </div>
          <p class="jx-play-help">
            the playground edits the <code class="text-accent">triggerLabel</code>,
            <code class="text-accent">variant</code>, and position-try set live — open the panel
            and click outside, press Escape, or pick a row: three native exits, zero JS on the
            close path. auto = acrylic unless the environment asks for reduced transparency.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Menu demo -->
  <div id="popover-menu" data-reveal="" use:reveal>
    <SectionCard
      family="popover-menu"
      headerRegion="popover-menu"
      eyebrow="demo"
      title="Menu type"
      summary="Action rows inside the children snippet. Each row repeats popovertarget so selecting closes the panel — still no JavaScript on the close path; only the row's own onclick does its work."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <Popover id="demo-menu" triggerLabel="Actions">
            <div class="flex w-52 flex-col">
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'renamed')}>Rename…</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'link copied')}>Copy link</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'duplicated')}>Duplicate</button>
              <button type="button" class="pop-row" popovertarget="demo-menu"
                onclick={() => (choice = 'archived')}>Archive</button>
              <button type="button" class="pop-row pop-row-destructive" popovertarget="demo-menu"
                onclick={() => (choice = 'deleted')}>Delete</button>
            </div>
          </Popover>
          <span class="text-muted-foreground text-[12.5px]">
            last action: <code class="text-accent">{choice ?? '—'}</code>
          </span>
        </div>
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          Click anywhere outside, press Escape, or pick a row — three exits, all native. While
          open, the caret flips via <code class="text-accent">:has(+ :popover-open)</code> where
          the engine supports it.
        </p>
        <CodeBlock code={menuUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- Card demo -->
  <div id="popover-card" data-reveal="" use:reveal>
    <SectionCard
      family="popover-card"
      headerRegion="popover-card"
      eyebrow="demo"
      title="Card type"
      summary="The children snippet is the whole panel body, so richer content — status facts and a link out — composes with the same one-element base."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <Popover id="demo-card" triggerLabel="Registry status">
            <div class="flex flex-col gap-3">
              <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                registry status
              </p>
              <p class="text-[13px] leading-6">
                Components are served as same-source files from this domain — nothing here is a
                runtime dependency.
              </p>
              <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[12.5px]">
                <dt class="text-muted-foreground">items</dt>
                <dd class="tabular-nums">12</dd>
                <dt class="text-muted-foreground">runtime deps</dt>
                <dd class="tabular-nums">0</dd>
                <dt class="text-muted-foreground">license</dt>
                <dd>MIT</dd>
              </dl>
              <div>
                <PressButton href="/r/registry.json" external>registry.json</PressButton>
              </div>
            </div>
          </Popover>
        </div>
        <CodeBlock code={cardUsage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <!-- NativeHTML base -->
  <div id="popover-base" data-reveal="" use:reveal>
    <SectionCard
      family="popover-base"
      headerRegion="popover-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives, what we add"
      summary="The component is styling and structure over two native attributes. Everything behavioral is the browser's; the one design decision we own is the placement strategy, and anchoring is left as a named extension direction."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">platform-native, free</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">popover="auto"</code> — light dismiss: outside click or focus loss closes; only one auto popover stays open at a time</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">popovertarget=&#123;id&#125;</code> — declarative trigger wiring; Enter/Space toggle, and the browser exposes <code class="text-accent">aria-expanded</code> on the button</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>top layer — the panel renders above sticky headers, transforms, and open dialogs</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>Escape closes natively; focus returns to the trigger</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">::backdrop</code> ships with popovers too — kept transparent so dismissing never dims the page</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">jixoai strategy &amp; extensions</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>zero-script component — markup and styles only, no state, no effects</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>placement v1 — authored centering: <code class="text-accent">inset-area: center</code> with an inset + margin fallback (the UA default centers via <code class="text-accent">margin: auto</code>)</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: anchored placement next to the trigger — CSS Anchor Positioning (<code class="text-accent">anchor-name</code> + <code class="text-accent">position-anchor</code>/<code class="text-accent">inset-area</code>), a future <code class="text-accent">placement</code> prop</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>floating-surface law: the hard offset shadow is a REAL <code class="text-accent">::after</code> layer; <code class="text-accent">@starting-style</code> + <code class="text-accent">allow-discrete</code> run the open/close pull-apart — layers press together, then separate into elevation</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>surface variants: <code class="text-accent">variant="solid | acrylic | auto"</code> — solid keeps the opaque surface with the original-color translucent shadow (black in light mode, white in dark); acrylic is a dual-layer <code class="text-accent">backdrop-filter</code> (surface blur + shadow-layer brightness); auto picks acrylic unless the environment asks for reduced transparency</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>extension: <code class="text-accent">popover="manual"</code> variant for toast-like panels that ignore light dismiss</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<style>
  .pop-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 6px 8px;
    text-align: left;
    font-size: 13px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }
  .pop-row:hover {
    background: color-mix(in oklab, currentColor 8%, transparent);
  }
  .pop-row-destructive {
    color: var(--destructive);
  }
  .pop-row-destructive:hover {
    color: var(--destructive-foreground);
    background: var(--destructive);
  }
  .jx-play-variant {
    margin: 0;
    border: none;
    padding: 0;
  }
  .jx-play-variant legend {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin-bottom: 6px;
  }
  .jx-play-variant-row {
    display: inline-flex;
    border: 1px solid var(--border);
  }
  .jx-play-variant-row label {
    position: relative;
    display: inline-flex;
  }
  .jx-play-variant-row label + label {
    border-left: 1px solid var(--border);
  }
  .jx-play-variant-row input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .jx-play-variant-row span {
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    color: var(--muted-foreground);
    transition: background-color 120ms ease-out, color 120ms ease-out;
  }
  .jx-play-variant-row label:hover span {
    background: color-mix(in oklab, currentColor 8%, transparent);
  }
  .jx-play-variant-row input:checked + span {
    background: var(--foreground);
    color: var(--background);
  }
  .jx-play-variant-row input:focus-visible + span {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* nine-grid: one toggle per candidate */
  .jx-try-grid {
    display: grid;
    grid-template-columns: repeat(3, 2rem);
    gap: 3px;
    width: fit-content;
  }
  .jx-try-cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    font-size: 11px;
    line-height: 1;
    color: var(--muted-foreground);
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    transition:
      background-color 120ms ease-out,
      color 120ms ease-out,
      border-color 120ms ease-out;
  }
  .jx-try-cell:hover {
    border-color: var(--primary);
    color: var(--foreground);
  }
  /* ON = primary foreground over a faint primary tint — unmistakable
     in both themes; the on-hover pair keeps the SAME fg/bg pairing so
     text never melts into its own background (the old on-state painted
     background: foreground while :hover recolored the text foreground
     — glyph and ground collapsed into one color) */
  .jx-try-on {
    color: var(--primary);
    border-color: var(--primary);
    background: color-mix(in oklab, var(--primary) 12%, transparent);
  }
  .jx-try-on:hover {
    color: var(--primary);
    background: color-mix(in oklab, var(--primary) 22%, transparent);
  }
  .jx-try-cell:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

</style>
