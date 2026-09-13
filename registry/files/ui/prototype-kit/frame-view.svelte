<!--
  jixoai prototype frame view (registry/files/ui/prototype-kit/frame-view.svelte).
  The PRIVATE shared chrome of PrototypePage and PrototypeComponent (not
  part of the kit's public surface): the caption, the scale-to-fit shell,
  the real <iframe>, and the visible notice state. The two frame kinds
  differ only in how their URL and height semantics resolve — everything
  DOM-level lives here once.

  - REAL IFRAME (design.md §2): media and container queries inside the
    ref'd page follow the iframe's own viewport — the responsive-matrix
    core. The iframe's width/height ATTRIBUTES stay the real viewport;
    width overflow of the grid cell is handled by VISUAL scaling
    (transform: scale, origin top-left) so the real viewport is never
    faked — the shell's layout height is set to the scaled height so
    grid rows flow correctly (grid supplies layout; transform is ink).
    STUDIO MODE (#24): embedded by the studio the shell keeps NATURAL
    width and scale 1 — the stage's camera (zoom/pan/auto-fit) is the
    one view-scaling authority; standalone hosts keep scale-to-fit.
  - ADAPTIVE HEIGHT (component frames, fill not locked): the initial
    height is the prop; once the design frame loads, the SAME-ORIGIN
    content document is measured (documentElement/body scrollHeight)
    and a ResizeObserver on the content body keeps the frame at content
    height. Cross-origin or failed access keeps the initial height
    silently — the degrade path, not an error.
  - NOTICE STATE: outside a design-server host (or without a prototype
    context) the frame renders a visible notice instead of a dead 404
    iframe. Deliberately self-styled inline (dashed border, muted
    color) — the notice is exactly the state where the design host's
    tailwind context may be absent, so it must not depend on it.
  - OVERLAY SCROLLBAR (#22): same-origin design frames get the
    overlay-scrollbar law installed in their content document on load
    (native bar hidden + a floating self-drawn thumb) — the frame's
    viewport width is the contract, a scrollbar must never reflow the
    ref'd page. See overlay-scrollbar.ts for the law and the
    scroll-virtual ruling.
  - ID DISCIPLINE: the id lands on the figure root (the DOM anchor
    that survives the notice state); dev mode warns on a duplicate id
    within the nearest canvas scope, first occurrence wins as the
    anchor (native getElementById order — both still render).

  Original requirement input: Owner 2026-09-11 — the prototype
  standard (canvas/page/component) for `jixoai-ui design`.
-->
<script module lang="ts">
  // one warning per (scope, id) across ALL frame instances of this
  // module — mount callbacks flush after the tree is built, so every
  // duplicate frame sees the finished scope and would otherwise warn
  const warnedIdsByScope = new WeakMap<Element, Set<string>>();
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { isDevMode, isStudioHost } from './context';
  import type { PrototypeTheme } from './context';
  import { installOverlayScrollbar } from './overlay-scrollbar';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** DOM anchor id, unique within the canvas (dev warning on dup) */
    id: string;
    /** which public frame kind owns this view */
    kind: 'page' | 'component';
    /** the ref as authored (annotation only here — the URL is built
     *  upstream; carried as a data attribute for readability) */
    frameRef: string;
    theme: PrototypeTheme;
    /** the resolved frame-surface URL; undefined = notice state */
    src?: string;
    /** the notice rendered when src is undefined */
    notice: string;
    /** real viewport width in px (iframe attribute + scale basis) */
    width: number;
    /** real viewport height in px — the INITIAL height when adaptive */
    height?: number;
    /** component kind: measure the frame content and track its height */
    adaptive?: boolean;
    /** visible caption (defaults off; the id alone anchors) */
    label?: string;
  }

  let {
    id,
    kind,
    frameRef,
    theme,
    src = undefined,
    notice,
    width,
    height = undefined,
    adaptive = false,
    label = undefined,
    class: className = '',
    ...rest
  }: Props = $props();

  // the iframe default when no initial height was given (component
  // frames may omit height — adaptation takes over after load)
  const FALLBACK_HEIGHT = 160;

  let shell: HTMLDivElement | undefined = $state(undefined);
  let iframeEl: HTMLIFrameElement | undefined = $state(undefined);

  // visual scale (1 = natural size); layout height of the shell is
  // derived from the effective height so grid rows hug the paint
  let scale = $state(1);
  // the MEASURED content height — only meaningful when adaptive; the
  // prop stays the reactive source for locked frames
  let measuredHeight = $state<number | undefined>(undefined);

  const effectiveHeight = $derived(
    adaptive ? (measuredHeight ?? height ?? FALLBACK_HEIGHT) : (height ?? FALLBACK_HEIGHT)
  );

  // ---- scale-to-fit -------------------------------------------------------
  function fitToShell(): void {
    // studio mode (#24): natural size, always — the stage's camera is
    // the one view-scaling authority (the r2 scale-to-fit shrank the
    // 1280 frame to 0.27× inside its ~340px cell: unreadable by
    // construction, the "缩放也有问题" root)
    if (isStudioHost()) {
      scale = 1;
      return;
    }
    if (!shell) return;
    const available = shell.clientWidth;
    if (!available || !Number.isFinite(available)) return; // jsdom: no layout
    const next = available / width;
    // floor at 5% so an absurdly narrow cell still shows something
    scale = next < 1 ? Math.max(next, 0.05) : 1;
  }

  // ---- dev id-conflict warning ---------------------------------------------

  function escapeIdForSelector(value: string): string {
    // CSS.escape when the platform has it; the manual path covers
    // engines without the CSS global (jsdom) — quotes and backslashes
    // only, ids are author-chosen anchors
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(value);
    }
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function warnOnDuplicateId(): void {
    const scope = shell?.closest('[data-jx-prototype-canvas]') ?? document.body;
    const duplicates = scope.querySelectorAll(`[id="${escapeIdForSelector(id)}"]`);
    if (duplicates.length <= 1) return;
    let warned = warnedIdsByScope.get(scope);
    if (!warned) {
      warned = new Set<string>();
      warnedIdsByScope.set(scope, warned);
    }
    if (warned.has(id)) return;
    warned.add(id);
    console.warn(
      `[prototype-kit] duplicate frame id "${id}" in canvas — the first occurrence wins as the anchor`
    );
  }

  // ---- adaptive height (same-origin design frames only) -------------------
  function measureFrame(): void {
    if (!adaptive || !iframeEl) return;
    try {
      const doc = iframeEl.contentDocument;
      const win = iframeEl.contentWindow;
      if (!doc || !win) return;
      // only our own design frames are measurable; about:blank (pre
      // load) and cross-origin documents keep the initial height
      if (!win.location.pathname.startsWith('/__design__/')) return;
      const measured = Math.ceil(
        Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0)
      );
      if (measured > 0) measuredHeight = measured;
    } catch {
      // cross-origin access throws — degrade to the initial height
    }
  }

  // ---- overlay scrollbar (#22): the frame document's scrollbar must
  // never steal layout width from the ref'd page's viewport. Installed
  // on load (each reload gets a fresh law), released before every
  // reinstall and on teardown. Same-origin design frames only — the
  // pathname probe doubles as the cross-origin guard.
  let overlayRelease: (() => void) | null = null;

  function refreshOverlayScrollbar(): void {
    overlayRelease?.();
    overlayRelease = null;
    const doc = iframeEl?.contentDocument;
    const win = iframeEl?.contentWindow;
    if (!doc || !win) return;
    try {
      if (!win.location.pathname.startsWith('/__design__/')) return;
    } catch {
      return; // cross-origin — not ours to touch
    }
    overlayRelease = installOverlayScrollbar(win, doc);
  }

  onMount(() => {
    if (isDevMode()) warnOnDuplicateId();

    const cleanups: Array<() => void> = [];
    if (shell && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => fitToShell());
      observer.observe(shell);
      cleanups.push(() => observer.disconnect());
      fitToShell();
    }
    cleanups.push(() => {
      overlayRelease?.();
      overlayRelease = null;
    });
    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  });

  // keep a body observer live on the loaded design frame so content
  // growth re-measures (guarded: jsdom has no ResizeObserver)
  $effect(() => {
    if (!adaptive || !iframeEl || typeof ResizeObserver === 'undefined') return;
    const doc = iframeEl.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return;
    const observer = new ResizeObserver(() => measureFrame());
    observer.observe(body);
    return () => observer.disconnect();
  });

  const titleText = $derived(label ?? `${kind} frame: ${frameRef}`);
</script>

<figure
  id={id}
  data-jx-prototype-frame={kind}
  data-jx-prototype-ref={frameRef}
  data-jx-prototype-theme={theme}
  class={cn('m-0 flex flex-col gap-1', className)}
  {...rest}
>
  {#if label}
    <figcaption
      data-jx-prototype-label
      class="font-mono text-xs tracking-wide text-muted-foreground uppercase"
    >
      {label}
    </figcaption>
  {/if}
  {#if src === undefined}
    <div
      data-jx-prototype-notice
      role="note"
      style="border: 1px dashed var(--jx-outline, currentColor); padding: 0.75rem 1rem; color: var(--muted-foreground, inherit); font-family: ui-monospace, monospace; font-size: 0.8125rem; max-width: {width}px;"
    >
      {notice}
    </div>
  {:else}
    <div
      bind:this={shell}
      class="overflow-hidden rounded-(--radius) border border-border"
      style:height="{effectiveHeight * scale}px"
      style:max-width={isStudioHost() ? undefined : '100%'}
    >
      <div
        style:width="{width}px"
        style:height="{effectiveHeight}px"
        style:transform="scale({scale})"
        style:transform-origin="top left"
      >
        <iframe
          bind:this={iframeEl}
          class="block border-0"
          {src}
          title={titleText}
          name="jixoai-design-frame-{id}"
          {width}
          height={effectiveHeight}
          onload={() => {
            measureFrame();
            refreshOverlayScrollbar();
          }}
        ></iframe>
      </div>
    </div>
  {/if}
</figure>
