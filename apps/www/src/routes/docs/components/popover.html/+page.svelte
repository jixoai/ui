<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Popover from '$lib/ui/popover/popover.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { onMount } from 'svelte';
  import { PlayFields, PlayRow, PlayRange, PlaySegmented, PlayHelp } from '$lib/playground';

  // the nine @position-try candidates are injected at RUNTIME: every
  // CSS processor on the path (Svelte scoped styles AND the Vite/
  // Tailwind pipeline) strips @position-try rule bodies — it treats
  // inset-area as an unknown property and drops the declarations.
  // overview-card's wing candidates have silently suffered the same
  // fate (masked by its flip-inline fallback). A plain style node
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
  import popoverSource from '$lib/ui/popover/popover.svelte?raw';

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
  const variantOptions: { value: 'solid' | 'acrylic' | 'auto'; label: string }[] = [
    { value: 'auto', label: 'auto' },
    { value: 'acrylic', label: 'acrylic' },
    { value: 'solid', label: 'solid' },
  ];

  // nine-grid position-try: each cell toggles one custom @position-try
  // candidate (see the @position-try rules in the page styles); the
  // panel tries the ENABLED cells, in grid order, when the initial
  // placement overflows
  type TryId = 'top-start' | 'top' | 'top-end' | 'left' | 'center' | 'right' | 'bottom-start' | 'bottom' | 'bottom-end';
  const TRY_CELLS: { id: TryId; label: string }[] = [
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
  const ALL_TRIES: TryId[] = TRY_CELLS.map((c) => c.id);
  // default order puts bottom-end FIRST — the classic initial position
  // while all nine stay lit (recently lit cells unshift ahead of it)
  let canvasTries = $state<TryId[]>(['bottom-end', ...ALL_TRIES.filter((t) => t !== 'bottom-end')]);
  const tryFallbacks = $derived(
    canvasTries.length ? canvasTries.map((id) => `--jx-try-${id}`).join(', ') : undefined,
  );
  // THE INTUITED LAW (Owner report, 2026-08-23): the FIRST lit cell is
  // the INITIAL position — the grid selects where the panel lives, the
  // remaining cells are the overflow fallback chain. All-on (the
  // default) keeps the classic bottom-end start; an empty grid falls
  // back to bottom-end too (no candidates either way)
  const canvasPlacement = $derived<TryId>(canvasTries[0] ?? 'bottom-end');

  // anchor gap playground (2026-08-26): 'side' puts the value on the
  // edge FACING the initial cell (flush inline alignment — the default
  // demo); 'uniform' demonstrates the all-sides margin ring (the inline
  // alignment edge insets by the same value). 0 = the r22 flush law
  let canvasGap = $state(0);
  let canvasGapMode = $state<'side' | 'uniform'>('side');
  const gapModeOptions: { value: 'side' | 'uniform'; label: string }[] = [
    { value: 'side', label: 'anchored side' },
    { value: 'uniform', label: 'uniform' },
  ];
  const sideGap = $derived.by(() => {
    if (canvasGap === 0 || canvasGapMode !== 'side') return undefined;
    const g = `${canvasGap}px`;
    if (canvasPlacement.startsWith('bottom')) return `${g} 0 0 0`;
    if (canvasPlacement.startsWith('top')) return `0 0 ${g} 0`;
    if (canvasPlacement === 'left') return `0 ${g} 0 0`;
    if (canvasPlacement === 'right') return `0 0 0 ${g}`;
    return g; // center: a ring reads better than any single side
  });
  const canvasGapProp = $derived(
    canvasGap === 0 ? undefined : canvasGapMode === 'uniform' ? canvasGap : sideGap,
  );

  function toggleTry(id: TryId): void {
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
    // position-try locks when the panel opens — an OPEN panel never
    // re-evaluates; close and reopen in the next frame. Judged by
    // :popover-open, NOT display: during the exit window the panel is
    // still rendered (display block) but logically closed, and the
    // display-based check REOPENED dying panels — phantom opens that
    // the next real click then closed (the trygrid alternating
    // pass/fail, r27). A mid-exit toggle simply lands on the next open
    const pop = document.getElementById('canvas-pop') as HTMLElement | null;
    if (pop?.matches(':popover-open')) {
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
    canvasGap = 0;
    canvasGapMode = 'side';
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
<Popover id="actions" {triggerLabel} variant=${q(canvasVariant)}${canvasGapProp !== undefined ? ` gap=${q(String(canvasGapProp))}` : ''}>
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
</script>

<svelte:head>
  <title>Popover · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popover component: the native Popover API — popover=&quot;auto&quot; light dismiss, a declarative popovertarget trigger, top-layer rendering — in a zero-script component. Anchored placement is the named extension direction."
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
  <div data-reveal="">
    <ComponentCanvas
      title="popover"
      description="popover=&quot;auto&quot; + popovertarget: light dismiss, Escape, aria-expanded, and top-layer rendering are the browser's — the panel anchors to the trigger through CSS Anchor Positioning. Relabel the trigger from the Playground."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/popover.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetPopoverCanvas}
      output={[
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
          gap={canvasGapProp}
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
        <PlayFields>
          <!-- free-text prop: the kit has no text control, so the registry
               Input rides the standard row (PlayRow owns the label) -->
          <PlayRow label="triggerLabel">
            <Input
              placeholder="Actions"
              aria-label="triggerLabel"
              class="w-36 text-[12.5px]"
              bind:value={canvasTriggerLabel}
            />
          </PlayRow>
          <PlayRow label="variant">
            <PlaySegmented bind:value={canvasVariant} options={variantOptions} />
          </PlayRow>
          <PlayRow label="position-try">
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
          </PlayRow>
          <PlayHelp>
            the MOST RECENTLY lit cell is the panel's initial position; the rest are the
            <code>@position-try</code> fallback chain, tried in order
            when the initial overflows. the center cell is the master switch
            (all ⇄ none); a live panel reopens itself on toggle.
          </PlayHelp>
          <PlayRow label="gap (px)">
            <PlayRange bind:value={canvasGap} min={0} max={16} step={1} />
          </PlayRow>
          <PlayRow label="gap mode">
            <PlaySegmented bind:value={canvasGapMode} options={gapModeOptions} />
          </PlayRow>
          <PlayHelp>
            the anchor <code>gap</code> rides margin semantics:
            <strong>anchored side</strong> puts the value on the edge facing the
            initial cell (inline edges stay flush — the precise form), while
            <strong>uniform</strong> rings all four sides (the alignment edge
            insets by the same value). 0 = the r22 flush law. flips do not
            carry the gap — a flipped state hugs flush again.
          </PlayHelp>
          <PlayHelp>
            the playground edits the <code>triggerLabel</code>,
            <code>variant</code>, gap, and position-try set live — open the panel
            and click outside, press Escape, or pick a row: three native exits, zero JS on the
            close path. auto = acrylic unless the environment asks for reduced transparency.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- Menu demo -->
  <div id="popover-menu" data-reveal="">
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
  <div id="popover-card" data-reveal="">
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
  <div id="popover-base" data-reveal="">
    <SectionCard
      family="popover-base"
      headerRegion="popover-base"
      eyebrow="W3C foundation"
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Popover variants" summary="Panel content is free; the variant axes are surface paint, placement, and the trigger.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">solid | acrylic | auto</code> (default) — acrylic is a dual-layer backdrop-filter; auto defers to the environment's transparency preference.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">placement — nine positions</p>
        <p class="text-[13px] leading-6">The six classic sides plus <code class="text-accent">left | right | center</code>; default <code class="text-accent">bottom-end</code> — under the trigger, right edges aligned.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">trigger</p>
        <p class="text-[13px] leading-6">The default button carries popovertarget; a custom <code class="text-accent">trigger</code> snippet renders your own control (drive it via the imperative handle).</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Menu rows repeat popovertarget to close on select — still zero JavaScript on the close path."><CodeBlock code={menuUsage} lang="svelte" meta="Popover usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Light dismiss, Escape, and top-layer focus order are the browser's; one native toggle seam mirrors aria-expanded."><A11yTable keys={[{ key: 'Enter / Space', action: 'Toggle the panel from the popovertarget trigger (native button)' }, { key: 'Escape', action: 'Close the panel; focus returns to the trigger' }, { key: 'Tab', action: 'Moves through the panel body content while open' }]} aria={[{ name: 'aria-expanded', value: 'true/false', description: 'On the default trigger — mirrored live from :popover-open by the toggle seam.' }, { name: 'popover', value: '"auto"', description: 'Light dismiss (outside click / focus loss) and one-at-a-time are native.' }, { name: 'position-visibility', value: 'anchors-visible', description: 'A panel whose anchor scrolled away hides instead of floating stale.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The anchored panel rides the shared motion kernel; the scroll ring's padding is token-overridable."><div class="flex flex-col gap-5"><DensityDemo><Popover id="density-pop" triggerLabel="density"><p class="w-52 text-[12.5px] leading-6">The trigger rhythm follows the scope; the panel pad rides --jx-pop-pad tokens.</p></Popover></DensityDemo><TokenTable tokens={[{ name: '--jx-pop-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-pop-gap', default: '0px (gap prop)', source: 'component', description: 'Anchor gap with margin semantics; 0 = the flush law.' }, { name: '--jx-pop-pad / -inline', default: '12px 14px / 14px', source: 'component', description: 'The scroll ring’s padding; consumer-overridable.' }, { name: '--jx-surface-in-x/y · -ox/-oy', default: 'direction vectors', source: 'component', description: 'Slide-in and shadow offsets, measured live against the anchor.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Stable-gutter scrollbar compensation in the scroll ring.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Ten props plus the bind:this imperative handle — no controlled state model."><PropsTable props={[{ name: 'id', type: 'string', default: '—', description: 'Popover id: popovertarget association + the CSS anchor name.', required: true }, { name: 'triggerLabel', type: 'string', default: "''", description: 'Default trigger button label; ignored when a trigger snippet is given.' }, { name: 'placement', type: "'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start' | 'left' | 'right' | 'center'", default: "'bottom-end'", description: 'The INITIAL anchored position; chosen once at open, never re-evaluated while open.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint.' }, { name: 'tryFallbacks', type: 'string', default: "''", description: 'Raw position-try value — custom @position-try idents replace the default flip series.' }, { name: 'gap', type: 'number | string', default: '—', description: 'Anchor gap, margin semantics — number = uniform px; shorthand gaps only the facing side. Invalid input is ignored.' }, { name: 'trigger', type: 'Snippet', default: '—', description: 'Custom trigger control; anchoring stays component-owned.' }, { name: 'panelClass', type: 'string', default: "''", description: 'Appended to the panel (width, grid, tokens — never anchoring).' }, { name: 'onToggle', type: '(open: boolean) => void', default: '—', description: 'Mirrors the native toggle event; the only open-state source of truth.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The whole panel body.', required: true }, { name: 'bind:this', type: '{ show, hide, toggle }', default: '—', description: 'Imperative handle — thin native passthroughs for exceptional triggers.' }]} /></SectionCard></div>
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
