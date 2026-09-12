<!--
  @jixoai/ui-design (studio) — the stage view (design-studio r3, issue
  #21: canvas zoom / pan / reset).

  Orthogonal intent (1): the CAMERA over the preview iframe. The lens
  law (stage-lens.ts): scale + translate ride one css transform on the
  wrapper around the iframe — the iframe's layout size (its REAL
  viewport) and its URL never change under a lens operation. What zooms
  is the studio's view of the canvas, not the canvas. Transform is ink,
  layout is law (frame-view.svelte's scale-to-fit precedent).

  Interaction surfaces (the iframe is an event black hole — pointer and
  wheel over it belong to its document; the stage works AROUND that
  without ever touching the picker/kit inside):

    zoom    ⌘/Ctrl + wheel over the exposed stage surround (the area a
            zoom-out or pan reveals around the canvas) — cursor-anchored;
            ⌥/Space lens-mode makes wheel zoom ANYWHERE (see below);
            the HUD's −/+ step around the stage center
    pan     drag the exposed surround (left or middle button — free
            canvas, out-of-bounds is legal); ⌥/Space lens-mode drags
            ANYWHERE
    reset   the HUD's fit — identity transform, one key home
    lens    hold ⌥ (option) or Space → a transparent sheet interposes
            mode     above the iframe: the parent receives pointer +
                     wheel over the whole stage, so drag pans and wheel
                     zooms everywhere; picking inside the iframe is
                     suspended only while the modifier is held. Focus
                     caveat (documented): if the caret/focus sits INSIDE
                     the iframe document, the parent window misses the
                     keydown — click any studio chrome first. Released
                     on keyup and on window blur.

  The DOM contract the walkthrough scripts rely on is preserved: the
  root keeps .studio-preview, the iframe keeps .studio-iframe and
  stays a `.studio-preview iframe` descendant; the {#key src} remount
  seam is unchanged. The iframe element flows up through onIframe (the
  shell's tree walks its same-origin document).

  State persistence: the lens lives in sessionStorage (the selection
  store's sibling) — vite's full-reload broadcasts (every design/ file
  write) reload the studio page; the camera survives them and canvas
  switches (the lens state outlives the {#key src} remount).

  Original need: Owner 2026-09-11 —「中间的画布要能支持缩放拖动复位等
  操作」(design-studio-r3 issue #21, 2026-09-12). Svelte 5 runes.
-->
<script lang="ts">
  import {
    STAGE_LENS_HOME,
    STAGE_LENS_STEP,
    formatStageZoom,
    isStageLensHome,
    panStageLens,
    restoreStageLens,
    serializeStageLens,
    stageLensTransform,
    stageWheelFactor,
    zoomStageLensBy,
    STAGE_LENS_STORE_KEY,
    type StageAnchor,
    type StageLens,
  } from './stage-lens.ts';

  interface Props {
    /** the preview iframe's src (null = the empty state) */
    src: string | null;
    /** the iframe's accessibility title */
    title: string;
    /** the shell's iframe seam — the component tree walks its document */
    onIframe?: (element: HTMLIFrameElement | null) => void;
  }
  let { src, title, onIframe }: Props = $props();

  let stageEl: HTMLDivElement | null = $state(null);
  let iframeEl: HTMLIFrameElement | null = $state(null);

  // the camera — restored from sessionStorage at init (sync initializer,
  // plain proven code; the shell's selection ghost taught us to keep
  // side-effectful restores out of effects, not out of initializers)
  function initialLens(): StageLens {
    try {
      return restoreStageLens(sessionStorage);
    } catch {
      return STAGE_LENS_HOME; // private mode etc. — camera without memory
    }
  }
  let lens: StageLens = $state(initialLens());

  /** ⌥/Space lens mode: the transparent sheet above the iframe is up */
  let lensMode = $state(false);
  /** a pan gesture is live (cursor affordance only) */
  let panning = $state(false);
  /** the live pan gesture's origin (screen coords + the lens it started from) */
  let panOrigin: { pointerId: number; clientX: number; clientY: number; from: StageLens } | null = null;

  /** every lens mutation persists — explicit sites, the selection pattern */
  function applyLens(next: StageLens): void {
    lens = next;
    try {
      sessionStorage.setItem(STAGE_LENS_STORE_KEY, serializeStageLens(next));
    } catch {
      /* persistence is best-effort */
    }
  }

  /* ── anchors ──────────────────────────────────────────────────────── */

  function anchorAt(clientX: number, clientY: number): StageAnchor {
    const rect = stageEl?.getBoundingClientRect();
    if (rect === undefined) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  function stageCenter(): StageAnchor {
    const rect = stageEl?.getBoundingClientRect();
    if (rect === undefined) return { x: 0, y: 0 };
    return { x: rect.width / 2, y: rect.height / 2 };
  }

  /* ── zoom ─────────────────────────────────────────────────────────── */

  /** the surround's wheel: ⌘/Ctrl (macOS pinch arrives as ctrl+wheel);
   *  a PLAIN wheel keeps page/iframe scroll semantics — untouched.
   *  Direct hits only: the sheet's zoom bubbles here too (it must not
   *  double-apply inside lens mode) */
  function onSurroundWheel(event: WheelEvent): void {
    if (event.target !== event.currentTarget) return;
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    applyLens(zoomStageLensBy(lens, stageWheelFactor(event.deltaY, event.deltaMode), anchorAt(event.clientX, event.clientY)));
  }

  /** lens mode's wheel: the iframe is covered, so ANY wheel zooms */
  function onLensModeWheel(event: WheelEvent): void {
    event.preventDefault();
    applyLens(zoomStageLensBy(lens, stageWheelFactor(event.deltaY, event.deltaMode), anchorAt(event.clientX, event.clientY)));
  }

  function hudZoom(factor: number): void {
    applyLens(zoomStageLensBy(lens, factor, stageCenter()));
  }

  /* ── pan (shared by the surround and the lens-mode sheet) ─────────── */

  function onPanPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.button !== 1) return; // left / middle only
    // DIRECT hits only: the sheet's pointerdown bubbles here too (a
    // child handler + this one would double-apply every move), and the
    // HUD's buttons must click, not pan — children run their own paths
    if (event.target !== event.currentTarget) return;
    event.preventDefault(); // no text selection, no middle-button autoscroll
    panOrigin = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, from: lens };
    panning = true;
    event.currentTarget?.setPointerCapture(event.pointerId);
  }
  function onPanPointerMove(event: PointerEvent): void {
    if (panOrigin === null || event.pointerId !== panOrigin.pointerId) return;
    applyLens(panStageLens(panOrigin.from, event.clientX - panOrigin.clientX, event.clientY - panOrigin.clientY));
  }
  function onPanPointerEnd(event: PointerEvent): void {
    if (panOrigin === null || event.pointerId !== panOrigin.pointerId) return;
    panOrigin = null;
    panning = false;
  }

  /* ── the ⌥/Space lens mode ────────────────────────────────────────── */

  /** typing targets own their keys — the chat composer must never
   *  trigger pan mode; buttons/links own Space (activation) */
  function ownsItsKeys(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return target.closest('input, textarea, select, [contenteditable], button, a, [role="tab"]') !== null;
  }

  function onKeyDown(event: KeyboardEvent): void {
    // bare Alt owns nothing on any element (no activation, no typing) —
    // it engages unconditionally; focus sitting on a clicked navigator
    // anchor must not eat the lens mode (pixel-probed 2026-09-12)
    if (event.key === 'Alt' && event.altKey) {
      event.preventDefault(); // no menu-bar handoff on menubar platforms
      lensMode = true;
      return;
    }
    // Space activates buttons/links and types — those targets keep it
    if (event.code === 'Space' && !event.repeat && !ownsItsKeys(event.target)) {
      event.preventDefault(); // no page scroll — the stage is the surface
      lensMode = true;
    }
  }
  function onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Alt' || event.code === 'Space') lensMode = false;
  }

  /* ── reset ────────────────────────────────────────────────────────── */

  function fit(): void {
    applyLens(STAGE_LENS_HOME);
  }

  // the iframe seam: {#key src} remounts re-bind, unmount nulls — the
  // effect re-runs on each, the shell's tree always holds the live frame
  $effect(() => {
    onIframe?.(iframeEl);
  });
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} onblur={() => (lensMode = false)} />

<main class="studio-preview">
  {#if src === null}
    <div class="studio-preview-empty">select a canvas on the left</div>
  {:else}
    <div
      class="studio-stage"
      class:panning
      bind:this={stageEl}
      data-stage
      data-lens-mode={lensMode ? 'on' : 'off'}
      onwheel={onSurroundWheel}
      onpointerdown={onPanPointerDown}
      onpointermove={onPanPointerMove}
      onpointerup={onPanPointerEnd}
      onpointercancel={onPanPointerEnd}
    >
      <!-- the camera: transform-only, origin 0 0; the iframe inside keeps
           its full layout size — {#key src} lives INSIDE so canvas
           switches never reset the lens -->
      <div
        class="studio-stage-lens"
        class:shifted={!isStageLensHome(lens)}
        data-stage-lens
        data-scale={lens.scale}
        style:transform={stageLensTransform(lens)}
      >
        {#key src}
          <iframe class="studio-iframe" {src} {title} bind:this={iframeEl}></iframe>
        {/key}
      </div>
      {#if lensMode}
        <!-- the transparent sheet: while ⌥/Space is held the parent owns
             the whole stage — drag pans, wheel zooms, anywhere -->
        <div
          class="studio-stage-sheet"
          class:panning
          aria-hidden="true"
          data-stage-sheet
          onwheel={onLensModeWheel}
          onpointerdown={onPanPointerDown}
          onpointermove={onPanPointerMove}
          onpointerup={onPanPointerEnd}
          onpointercancel={onPanPointerEnd}
        ></div>
      {/if}
      <!-- the HUD: chrome-less buttons (button.studio-frame's look —
           the studio's own chrome-less family), gaps click through to
           the canvas underneath -->
      <div class="studio-stage-hud">
        <button
          class="studio-stage-btn"
          type="button"
          data-act="out"
          aria-label="zoom out"
          onclick={() => hudZoom(1 / STAGE_LENS_STEP)}
        >−</button>
        <span class="studio-stage-zoom" data-stage-zoom title="⌘/Ctrl+wheel or ⌥/Space + wheel zooms — drag pans">{formatStageZoom(lens.scale)}</span>
        <button
          class="studio-stage-btn"
          type="button"
          data-act="in"
          aria-label="zoom in"
          onclick={() => hudZoom(STAGE_LENS_STEP)}
        >+</button>
        <button
          class="studio-stage-btn"
          type="button"
          data-act="fit"
          aria-label="reset the camera to 100% and center"
          onclick={fit}
        >fit</button>
      </div>
    </div>
  {/if}
</main>

<style>
  .studio-preview {
    display: flex;
    min-width: 0;
    background: #161412;
  }
  .studio-preview-empty {
    margin: auto;
    color: #8d8578;
  }
  /* the stage: the lens-mode sheet, the lens wrapper and the HUD all
     anchor here — overflow clips the transformed canvas (a zoomed-in
     lens paints outside; that ink must not spill into the columns) */
  .studio-stage {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    touch-action: none; /* pointer pan owns touch gestures on the surround */
    cursor: grab; /* the exposed surround (zoomed-out / panned) drags */
  }
  .studio-stage.panning {
    cursor: grabbing;
  }
  .studio-stage-lens {
    position: absolute;
    inset: 0;
    transform-origin: 0 0;
    will-change: transform;
  }
  /* the shifted affordance: once the camera leaves home the canvas
     carries its own dashed rim, so the "lens" is visible as a thing */
  .studio-stage-lens.shifted {
    outline: 1px dashed #3a352f;
  }
  .studio-iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }
  .studio-stage-sheet {
    position: absolute;
    inset: 0;
    z-index: 2;
    cursor: grab;
  }
  .studio-stage-sheet.panning {
    cursor: grabbing;
  }
  .studio-stage-hud {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 3; /* above the sheet: fit stays reachable mid-lens-mode */
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.1875rem;
    background: #0d0c0bee;
    border: 1px solid #262320;
    border-radius: 4px;
    pointer-events: none; /* the gaps click through to the canvas */
  }
  /* explicit selectors — a scoped `> *` rule proved droppable by the
     svelte compiler's unused-selector pass (the iframe then ate the
     HUD's clicks; pixel-probed 2026-09-12) */
  .studio-stage-hud .studio-stage-btn,
  .studio-stage-hud .studio-stage-zoom {
    pointer-events: auto;
  }
  .studio-stage-btn {
    all: unset;
    cursor: pointer;
    padding: 0.1875rem 0.4375rem;
    border-radius: 3px;
    color: #8d8578;
    font-size: 0.6875rem;
    line-height: 1;
    text-align: center;
    min-width: 1rem;
  }
  .studio-stage-btn:hover {
    color: #e8e4dd;
    background: #262320;
  }
  .studio-stage-zoom {
    color: #b9b2a6;
    font-size: 0.6875rem;
    min-width: 2.75rem;
    text-align: center;
    font-variant-numeric: tabular-nums;
    user-select: none;
  }
</style>
