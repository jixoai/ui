<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Popover from '$lib/ui/popover/popover.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as popoverMeta } from '$lib/meta/popover.meta';
  import { POPOVER_DOCS } from '$lib/ui/props-table/docs/popover.docs';
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

  // canvasUsageLive captured into canvasFiles BY DESIGN (the drawer mirrors the
  // live usage; resolveCanvasUsage re-reads it per render so the $derived value
  // is current when the file tree re-renders — the state_referenced_locally
  // warning below is the deliberate initial-snapshot capture, not a bug)
  const resolveCanvasUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? canvasUsageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/popover.svelte', content: popoverSource },
    { name: 'src/lib/ui/popover-usage.svelte', content: canvasUsageLive },
  ];

  // ToC outline: pairs with the section ids below, in page order.

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<Popover id="p-default" triggerLabel="level2 · default">…</Popover>
<Popover id="p-l3" triggerLabel="level3" elevation="level3">…</Popover>
<Popover id="p-dp" triggerLabel="8dp" elevation={8}>…</Popover>
<Popover id="p-concave" triggerLabel="level-1" elevation="level-1">…</Popover>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/popover-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Popover · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popover component: the native Popover API — popover=&quot;auto&quot; light dismiss, a declarative popovertarget trigger, top-layer rendering — in a component whose default trigger path runs zero positioning script. Anchored placement ships — the placement prop."
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
      eyebrow="registry:ui · NativeHTML"
      title="popover — declarative, zero script"
      summary="The native Popover API does everything: the panel carries popover=&quot;auto&quot; and the trigger is wired with popovertarget, so light dismiss, Escape, aria-expanded, and top-layer rendering come from the browser. The default trigger path runs zero listeners and zero positioning script — the browser owns open/close, light dismiss, and the top layer; the component's script is one aria toggle seam plus the shared surface-motion kernel (view source and count)."
    >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install popover">
          <TerminalCard
            barTitle="install — popover"
            command="npx jixoai-ui add popover"
            outputs={['https://ui.jixoai.com/r/popover.json']}
          />
        </div>
      {/snippet}

      <div class={cx(rt.wrap12)}>
        <span class="pill">popover="auto"</span>
        <span class="pill">popovertarget trigger</span>
        <span class="pill">light dismiss · Escape</span>
        <span class="pill">top layer</span>
        <span class="pill">0 positioning JS</span>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law; the sections between stay page-local. -->

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Menu rows repeat popovertarget to close on select — still zero JavaScript on the close path."><CodeBlock code={menuUsage} lang="svelte" meta="Popover usage" /></SectionCard></div>

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
      <div class={cx(rt.col16, rt.itemsCenter)}>
        <!-- the panel lives in the stage; the top layer lifts it on open -->
        <Popover
          id="canvas-pop"
          triggerLabel={canvasTriggerLabel}
          variant={canvasVariant}
          placement={canvasPlacement}
          {tryFallbacks}
          gap={canvasGapProp}
        >
          <div class={cx(rt.pvPanel13)}>
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
              class={cx(rt.pvW36, rt.text125)}
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
            (all ⇄ none); the placement change applies from the NEXT open — toggling mid-open closes the panel (the rAF reopen silently no-ops during the hide window, measured).
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
      <div class={cx(rt.col20)}>
        <div class={cx(rt.rowC16, rt.wrap)}>
          <Popover id="demo-menu" triggerLabel="Actions">
            <div class={cx(rt.pvPanel13)}>
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
          <span class={cx(rt.noteSmall)}>
            last action: <code class={cx(rt.inkAccent)}>{choice ?? '—'}</code>
          </span>
        </div>
        <p class={cx(rt.para)}>
          Click anywhere outside, press Escape, or pick a row — three exits, all native. While
          open, the caret flips via <code class={cx(rt.inkAccent)}>:has(+ :popover-open)</code> where
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
      <div class={cx(rt.col20)}>
        <div class={cx(rt.rowC16, rt.wrap)}>
          <Popover id="demo-card" triggerLabel="Registry status">
            <div class={cx(rt.col12)}>
              <p class={cx(rt.eyebrowPrimary)}>
                registry status
              </p>
              <p class={cx(rt.body13)}>
                Components are served as same-source files from this domain — nothing here is a
                runtime dependency.
              </p>
              <dl class={cx(rt.pvDl)}>
                <dt class={cx(rt.inkMuted)}>items</dt>
                <dd class={cx(rt.tabular)}>12</dd>
                <dt class={cx(rt.inkMuted)}>runtime deps</dt>
                <dd class={cx(rt.tabular)}>0</dd>
                <dt class={cx(rt.inkMuted)}>license</dt>
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
      summary="The component is styling and structure over two native attributes. Everything behavioral is the browser's; the one design decision we own is the placement strategy — anchored placement SHIPPED 2026-08-21 (the placement prop, nine positions, demoed above)."

    >
      <div class={cx(rt.grid760b)}>
        <div class={cx(rt.notePanel)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>platform-native, free</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>popover="auto"</code> — light dismiss: outside click closes (Tab-out does NOT close on Chromium — an interop gap; Escape and click-out are the reliable exits); only one auto popover stays open at a time</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>popovertarget=&#123;id&#125;</code> — declarative trigger wiring; Enter/Space toggle, and the browser exposes <code class={cx(rt.inkAccent)}>aria-expanded</code> on the button</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>top layer — the panel renders above sticky headers, transforms, and open dialogs (engine-dependent at the top layer's hit-testing edge: true on system Chrome, not on Chrome for Testing 153 — the z-order seam is the platform's, re-verify per engine)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>Escape closes natively; focus returns to the trigger</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>::backdrop</code> ships with popovers too — kept transparent so dismissing never dims the page</span></li>
          </ul>
        </div>
        <div class={cx(rt.notePanel)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>jixoai strategy &amp; extensions</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>zero positioning script — the open/close path is native; the component's script is the aria toggle seam + the motion kernel (no effects on the trigger path)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>placement v1 — authored centering: <code class={cx(rt.inkAccent)}>inset-area: center</code> with an inset + margin fallback (the UA default centers via <code class={cx(rt.inkAccent)}>margin: auto</code>)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>SHIPPED: anchored placement next to the trigger — CSS Anchor Positioning (<code class={cx(rt.inkAccent)}>anchor-name</code> + <code class={cx(rt.inkAccent)}>position-anchor</code>/<code class={cx(rt.inkAccent)}>inset-area</code>) behind the live <code class={cx(rt.inkAccent)}>placement</code> prop (nine positions, demoed above)</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>floating-surface law: the hard offset shadow is a REAL <code class={cx(rt.inkAccent)}>::after</code> layer; <code class={cx(rt.inkAccent)}>@starting-style</code> + <code class={cx(rt.inkAccent)}>allow-discrete</code> run the open/close pull-apart — layers press together, then separate into elevation</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>surface variants: <code class={cx(rt.inkAccent)}>variant="solid | acrylic | auto"</code> — solid keeps the opaque surface with the original-color translucent shadow (black in light mode, white in dark); acrylic is a dual-layer <code class={cx(rt.inkAccent)}>backdrop-filter</code> (surface blur + shadow-layer brightness); auto picks acrylic unless the environment asks for reduced transparency</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>extension: <code class={cx(rt.inkAccent)}>popover="manual"</code> variant for toast-like panels that ignore light dismiss</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Popover variants" summary="Panel content is free; the variant axes are surface paint, placement, and the trigger.">
    <div class={cx(rt.gridMd3)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>variant</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>solid | acrylic | auto</code> (default) — acrylic is a dual-layer backdrop-filter; auto defers to the environment's transparency preference.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>placement — nine positions</p>
        <p class={cx(rt.body13)}>The six classic sides plus <code class={cx(rt.inkAccent)}>left | right | center</code>; default <code class={cx(rt.inkAccent)}>bottom-end</code> — under the trigger, right edges aligned.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb8, rt.inkMuted)}>trigger</p>
        <p class={cx(rt.body13)}>The default button carries popovertarget; a custom <code class={cx(rt.inkAccent)}>trigger</code> snippet renders your own control (drive it via the imperative handle).</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Light dismiss, Escape, and top-layer focus order are the browser's; one native toggle seam mirrors aria-expanded."><A11yTable keys={[{ key: 'Enter / Space', action: 'Toggle the panel from the popovertarget trigger (native button)' }, { key: 'Escape', action: 'Close the panel; focus returns to the trigger' }, { key: 'Tab', action: 'Moves through the panel body content while open' }]} aria={[{ name: 'aria-expanded', value: 'true/false', description: 'On the default trigger — mirrored live from :popover-open by the toggle seam.' }, { name: 'popover', value: '"auto"', description: 'Light dismiss (outside click / focus loss) and one-at-a-time are native.' }, { name: 'position-visibility', value: 'anchors-visible', description: 'A panel whose anchor scrolled away hides instead of floating stale.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The anchored panel rides the shared motion kernel; the scroll ring's padding is token-overridable."><div class={cx(rt.col20)}><DensityDemo>
          {#snippet childrenScoped(scope)}
            <Popover id={`density-pop-${scope}`} triggerLabel="density ({scope})"><p class={cx(rt.pvW52, rt.text125, rt.lead6)}>Density-FLAT by family mechanism (measured): the scope stamps re-derive on the wrapper (the --jx-hit arithmetic 28/32/40/48) but this family's trigger and panel consume no density lane — the trigger stays 43px and the panel pad 12px 14px across every rung; each rung's panel is its OWN instance (density-pop-xs/sm/default/lg — per-rung ids, LAW #19).</p></Popover>
            {/snippet}
        </DensityDemo><TokenTable tokens={[{ name: '--jx-pop-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-pop-gap', default: '0px (gap prop)', source: 'component', description: 'Anchor gap with margin semantics; 0 = the flush law.' }, { name: '--jx-pop-pad / -inline', default: '12px 14px / 14px', source: 'component', description: 'The scroll ring’s padding; consumer-overridable.' }, { name: '--jx-surface-in-x/y · -ox/-oy', default: 'direction vectors', source: 'component', description: 'Slide-in and shadow offsets, measured live against the anchor.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Stable-gutter scrollbar compensation in the scroll ring.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Stamps re-derive on the wrapper with the rung arithmetic but NO family surface consumes the lane (trigger 43px, panel pad constant — measured flat).' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The anchored panel carries its OWN elevation — level2 (3dp, M3's menu rung): the theme's level table pairs the shadow recipe with the ladder rung; an explicit lane or a dp number steps both. The carriers stamp the promoted panel root — self-carried across the top layer."
    >
      <ComponentCanvas title="Popover · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.wrap12)}>
          <Popover id="univ-default" triggerLabel="level2 · default"><p class={cx(rt.text13)}>3dp + the surface-container-low rung.</p></Popover>
          <Popover id="univ-l3" triggerLabel="level3" elevation="level3"><p class={cx(rt.text13)}>6dp + the surface-container rung.</p></Popover>
          <Popover id="univ-dp" triggerLabel="8dp" elevation={8}><p class={cx(rt.text13)}>Exact dp snaps down — 8dp IS level4.</p></Popover>
          <Popover id="univ-concave" triggerLabel="level-1" elevation="level-1"><p class={cx(rt.text13)}>The concave: inset shadow + the deepest rung.</p></Popover>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Ten props plus the bind:this imperative handle — no controlled state model."><PropsTable meta={popoverMeta} docs={POPOVER_DOCS} /></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="popover" />
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
