<!--
  @jixoai/ui-design (studio) — the stage view (design-studio r3, issue
  #21: canvas zoom / pan / reset; r3 polish #24/#25: the natural-size
  sheet + auto camera + blueprint workspace).

  Orthogonal intent (1): the CAMERA over the canvas iframe. The lens
  law (stage-lens.ts): scale + translate ride one css transform on the
  wrapper around the iframe — the iframe's URL never changes under a
  lens operation. Its LAYOUT SIZE now follows the canvas document's
  reported natural metrics (#24): the sheet is the canvas at authored
  size (kit studio mode renders frames unscaled), and the stage is the
  workspace around it. Transform is ink, layout is law.

  The auto camera (#24): until the user takes it (wheel / drag / HUD
  zoom), every metrics report and stage resize re-fits the sheet
  centered (fitStageLens, scale ≤ 1). The HUD's fit returns to auto.
  A stored lens from a previous canvas restores MANUAL — an explicit
  camera must never be silently re-fitted away.

  The blueprint workspace (#25, Owner 2026-09-12「画布背景改成一种
  蓝图风格的网格」): the stage paints a deep-blue two-tier grid that
  lives in CAMERA space — cell size and position derive from the lens,
  so the grid pans and zooms WITH the design (anchored in canvas
  coordinates; a static grid would swim against the content).

  Interaction surfaces (the iframe is an event black hole — the stage
  works AROUND that without ever touching the picker/kit inside):

    zoom    ⌘/Ctrl + wheel over the exposed workspace — cursor-anchored;
            OVER the canvas the wheel relays up (#24): frame-entry →
            canvas-entry → here (same-origin postMessage), so the
            natural gesture works anywhere the design is;
            ⌥/Space lens-mode makes wheel + drag work ANYWHERE;
            the HUD's −/+ step around the stage center
    pan     drag the workspace (left or middle button); ⌥/Space
            lens-mode drags ANYWHERE
    reset   the HUD's fit — back to the auto camera
    lens    hold ⌥ (option) or Space → a tinted sheet with a dashed
            mode rim interposes above the iframe + the HUD shows the
            mode tag (the r2 transparent sheet was INVISIBLE — 04-lens-
            mode.png was byte-identical to 03-zoomed.png); picking is
            suspended only while the modifier is held. Released on
            keyup and on window blur.

  The DOM contract the walkthrough scripts rely on: the root keeps
  .studio-preview, the iframe keeps .studio-iframe; the {#key src}
  remount seam is unchanged; the iframe flows up through onIframe (the
  shell's tree walks its same-origin document).

  State persistence: a MANUAL lens persists to sessionStorage — vite's
  full-reload broadcasts (every design/ file write) reload the studio
  page and the explicit camera survives. The AUTO camera never writes
  (a stored auto-fit from a bigger canvas would straitjacket the next).

  Original need: Owner 2026-09-11 —「中间的画布要能支持缩放拖动复位等
  操作」(#21); 2026-09-12 —「缩放也有问题…画布背景改成一种蓝图风格的
  网格」(#24/#25). Svelte 5 runes.
-->
<script lang="ts">
  import {
    STAGE_LENS_HOME,
    STAGE_LENS_STEP,
    fitStageLens,
    formatStageZoom,
    panStageLens,
    parseStageLens,
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

  // a stored lens is an EXPLICIT camera from a previous session — it
  // restores as manual; a fresh session starts on the auto camera
  function initialLens(): { lens: StageLens; manual: boolean } {
    try {
      const stored = parseStageLens(sessionStorage.getItem(STAGE_LENS_STORE_KEY));
      if (stored !== null) return { lens: stored, manual: true };
    } catch {
      /* private mode — camera without memory */
    }
    return { lens: STAGE_LENS_HOME, manual: false };
  }
  const boot = initialLens();
  let lens: StageLens = $state(boot.lens);
  /** the camera's regime: auto re-fits on every metrics/resize report;
   *  the FIRST manual gesture freezes it (fit is the way back) */
  let manual = $state(boot.manual);

  /** the canvas document's reported natural size (null = pre-metrics) */
  let sheet: { width: number; height: number } | null = $state(null);

  /** ⌥/Space lens mode: the mode sheet above the iframe is up */
  let lensMode = $state(false);
  /** a pan gesture is live (cursor affordance only) */
  let panning = $state(false);
  /** the live pan gesture's origin (screen coords + the lens it started from) */
  let panOrigin: { pointerId: number; clientX: number; clientY: number; from: StageLens } | null = null;

  /** every MANUAL lens mutation persists; the auto camera never writes */
  function applyLens(next: StageLens, nextManual = true): void {
    lens = next;
    manual = nextManual;
    try {
      if (nextManual) sessionStorage.setItem(STAGE_LENS_STORE_KEY, serializeStageLens(next));
      else sessionStorage.removeItem(STAGE_LENS_STORE_KEY);
    } catch {
      /* persistence is best-effort */
    }
  }

  /* ── the auto camera: fit the sheet into the stage, centered ──────── */

  function autoFit(): void {
    if (manual) return;
    const rect = stageEl?.getBoundingClientRect();
    if (rect === undefined || sheet === null) return;
    lens = fitStageLens(rect.width, rect.height, sheet.width, sheet.height);
  }

  // the canvas document's metrics (#24): natural size + growth. An
  // auto camera re-fits; a manual camera only re-sizes the sheet (the
  // user's zoom/pan is never silently re-taken). An identical report
  // is a no-op — the #26 loop taught that RO over-firing must never
  // churn the camera when the numbers stand still
  function onCanvasMetrics(width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
    if (sheet !== null && sheet.width === width && sheet.height === height) return;
    sheet = { width, height };
    if (!manual) autoFit();
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

  /** the workspace's wheel: ⌘/Ctrl (macOS pinch arrives as ctrl+wheel);
   *  a PLAIN wheel keeps page/iframe scroll semantics — untouched.
   *  Direct hits only: the mode sheet's zoom bubbles here too */
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

  /* ── the relayed ⌘+wheel (#24): anywhere over the canvas ──────────── */

  // frame-entry posts to the canvas doc (canvas-doc coords); the canvas
  // doc adds the child iframe's offset and forwards (still canvas-doc
  // coords). The lens maps canvas-doc px → stage px: screen = t + z·c,
  // so the anchor needs no rect math at all.
  function onRelayZoom(detail: { deltaY: number; deltaMode?: number; x: number; y: number }): void {
    applyLens(
      zoomStageLensBy(lens, stageWheelFactor(detail.deltaY, detail.deltaMode ?? 0), {
        x: lens.x + detail.x * lens.scale,
        y: lens.y + detail.y * lens.scale,
      }),
    );
  }

  function onMessage(event: MessageEvent): void {
    if (event.source !== iframeEl?.contentWindow) return;
    const data = event.data as
      | { type?: string; width?: number; height?: number; deltaY?: number; deltaMode?: number; x?: number; y?: number }
      | null;
    if (data === null || typeof data !== 'object') return;
    if (data.type === 'jx-design:canvas-metrics' && typeof data.width === 'number' && typeof data.height === 'number') {
      onCanvasMetrics(data.width, data.height);
    } else if (
      data.type === 'jx-design:wheel-zoom' &&
      typeof data.deltaY === 'number' &&
      typeof data.x === 'number' &&
      typeof data.y === 'number'
    ) {
      onRelayZoom({ deltaY: data.deltaY, deltaMode: data.deltaMode, x: data.x, y: data.y });
    }
  }

  /* ── pan (shared by the workspace and the lens-mode sheet) ────────── */

  function onPanPointerDown(event: PointerEvent): void {
    if (event.button !== 0 && event.button !== 1) return; // left / middle only
    // DIRECT hits only: the mode sheet's pointerdown bubbles here too
    // (a child handler + this one would double-apply every move), and
    // the HUD's buttons must click, not pan — children run their own paths
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
    // back to the AUTO camera: the next metrics/resize re-fit covers
    // the common case; an immediate fit covers the no-metrics rest
    manual = false;
    try {
      sessionStorage.removeItem(STAGE_LENS_STORE_KEY);
    } catch {
      /* best-effort */
    }
    const rect = stageEl?.getBoundingClientRect();
    if (rect !== undefined && sheet !== null) {
      lens = fitStageLens(rect.width, rect.height, sheet.width, sheet.height);
    } else {
      lens = STAGE_LENS_HOME;
    }
  }

  // the iframe seam: {#key src} remounts re-bind, unmount nulls — the
  // effect re-runs on each, the shell's tree always holds the live frame.
  // A canvas switch also drops the metrics channel — the new document
  // reports its own; the auto camera re-fits on that report (reading
  // `manual` here would re-run the effect on every fit() and lose the
  // sheet mid-session — the report path owns the camera instead)
  $effect(() => {
    onIframe?.(iframeEl);
  });

  $effect(() => {
    if (iframeEl === null) return;
    sheet = null;
  });

  // the relay + resize wiring: messages from the live canvas document,
  // stage resizes re-fitting an auto camera
  $effect(() => {
    if (stageEl === null) return;
    window.addEventListener('message', onMessage);
    const observer = new ResizeObserver(() => autoFit());
    observer.observe(stageEl);
    return () => {
      window.removeEventListener('message', onMessage);
      observer.disconnect();
    };
  });

  /* ── the blueprint grid's camera-space parameters (#25) ───────────── */

  const GRID_CELL = 24; // minor cell, canvas px (major = 5 cells)
  const gridStyle = $derived.by(() => {
    const cell = GRID_CELL * lens.scale;
    const major = cell * 5;
    const cellSize = `${cell}px ${cell}px`;
    const majorSize = `${major}px ${major}px`;
    const origin = `${lens.x}px ${lens.y}px`;
    return {
      // 4 layers in paint order (major-v, major-h, minor-v, minor-h) —
      // size/position lists map to layers one-to-one
      backgroundSize: `${majorSize}, ${majorSize}, ${cellSize}, ${cellSize}`,
      backgroundPosition: `${origin}, ${origin}, ${origin}, ${origin}`,
    } as const;
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
      <!-- the blueprint grid (#25): camera-space cell size + position —
           the workspace's texture pans and zooms WITH the design -->
      <div class="studio-stage-grid" data-stage-grid style:background-size={gridStyle.backgroundSize} style:background-position={gridStyle.backgroundPosition}></div>
      <!-- the camera: transform-only, origin 0 0. The wrapper carries the
           sheet's reported natural size (#24); {#key src} lives INSIDE so
           canvas switches never reset the lens -->
      <div
        class="studio-stage-lens"
        data-stage-lens
        data-scale={lens.scale}
        style:transform={stageLensTransform(lens)}
        style:width={sheet === null ? undefined : `${sheet.width}px`}
        style:height={sheet === null ? undefined : `${sheet.height}px`}
      >
        {#key src}
          <iframe class="studio-iframe" {src} {title} bind:this={iframeEl}></iframe>
        {/key}
      </div>
      {#if lensMode}
        <!-- the mode sheet: while ⌥/Space is held the parent owns the
             whole stage — drag pans, wheel zooms, anywhere. Tinted +
             rimmed (#24): the r2 transparent sheet was invisible -->
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
           the canvas underneath; floats on the workspace, never over
           the sheet at fit (scale ≤ 1 leaves workspace margin) -->
      <div class="studio-stage-hud" class:lensing={lensMode}>
        {#if lensMode}<span class="studio-stage-mode" data-stage-mode>lens</span>{/if}
        <button
          class="studio-stage-btn"
          type="button"
          data-act="out"
          aria-label="zoom out"
          onclick={() => hudZoom(1 / STAGE_LENS_STEP)}
        >−</button>
        <span class="studio-stage-zoom" data-stage-zoom title="⌘/Ctrl+wheel zooms (anywhere over the canvas too) — drag pans">{formatStageZoom(lens.scale)}</span>
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
          aria-label="reset the camera to fit"
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
  }
  .studio-preview-empty {
    margin: auto;
    color: #8d8578;
  }
  /* the workspace (#25→#27): true cyanotype — a deep Prussian blue
     field, WHITE-print linework (the blueprint print exposes to white),
     a paper-weight vignette at the edges. overflow clips the
     transformed sheet (zoomed-in ink must not spill into the columns) */
  .studio-stage {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    touch-action: none; /* pointer pan owns touch gestures on the workspace */
    cursor: grab; /* the exposed workspace (zoomed-out / panned) drags */
    background:
      radial-gradient(ellipse 120% 90% at 50% 45%, rgba(21, 62, 106, 0.92) 0%, rgba(10, 32, 58, 0.97) 62%, rgba(5, 20, 38, 1) 100%),
      #0a2038;
  }
  .studio-stage.panning {
    cursor: grabbing;
  }
  /* the blueprint grid: two tiers of WHITE-print lines (cyanotype —
     the print's ink is the LIGHT color) via repeating gradients. Sits
     UNDER the sheet; its size/position ride the camera (inline style)
     so it never swims */
  .studio-stage-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    /* 4 layers in paint order: major-v, major-h (heavier), then minor-v,
       minor-h (fainter) — the camera's inline size/position ride all 4 */
    background-image:
      linear-gradient(to right, rgba(198, 226, 255, 0.2) 0 1px, transparent 1px 100%),
      linear-gradient(to bottom, rgba(198, 226, 255, 0.2) 0 1px, transparent 1px 100%),
      linear-gradient(to right, rgba(198, 226, 255, 0.07) 0 1px, transparent 1px 100%),
      linear-gradient(to bottom, rgba(198, 226, 255, 0.07) 0 1px, transparent 1px 100%);
    background-size: 120px 120px, 120px 120px, 24px 24px, 24px 24px;
  }
  .studio-stage-lens {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
    /* the ground IS the blueprint (#27, Owner 2026-09-12「直接蓝图
       底色就好」): no white sheet under the matrix — frames float on
       the workspace; pre-metrics (no size yet) it still fills like
       the old inset-0 */
    width: 100%;
    height: 100%;
  }
  .studio-iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    color-scheme: dark;
  }
  /* lens mode (#24 visibility): tint + dashed rim — the mode must be
     SEEN on, not inferred from behavior */
  .studio-stage-sheet {
    position: absolute;
    inset: 0;
    z-index: 2;
    cursor: grab;
    background: rgba(198, 226, 255, 0.06);
    outline: 1px dashed rgba(198, 226, 255, 0.55);
    outline-offset: -3px;
  }
  .studio-stage-sheet.panning {
    cursor: grabbing;
  }
  .studio-stage-hud {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 3; /* above the mode sheet: fit stays reachable mid-lens-mode */
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.1875rem;
    background: #0d0c0bee;
    border: 1px solid #262320;
    border-radius: 4px;
    box-shadow: 0 0.5rem 1.25rem rgba(3, 14, 28, 0.55);
    backdrop-filter: blur(4px);
    pointer-events: none; /* the gaps click through to the canvas */
  }
  .studio-stage-hud.lensing {
    border-color: rgba(198, 226, 255, 0.55);
  }
  .studio-stage-mode {
    color: #b8d4ff;
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    padding: 0.1875rem 0.375rem;
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
