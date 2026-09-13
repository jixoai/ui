/**
 * @jixoai/ui-design (server entries) — the canvas picker (r2 T4,
 * lazy activation r3 T6).
 *
 * The frame-surface half of the selection loop: in studio-embedded
 * frames (or with ?pick=1 forced on), a click resolves the NEAREST
 * STAMPED ancestor (data-jx-component — the usage-site stamp, r2 §3),
 * highlights it, and reports the selection UP the same-origin iframe
 * chain to the studio's window.__jixoaiDesignSelect hook (the frame's
 * parent chain IS the studio — no postMessage round-trip needed).
 *
 * Lazy activation (r3 T6, #14 P1-1): the studio lookup ran ONCE at
 * init — a frame document whose load races the studio seam (vite HMR
 * reloads both; the fresh seam may not exist yet when a reloaded
 * frame's picker initializes) stayed dead forever with no self-heal.
 * Now every CLICK re-walks the (cheap, bounded) parent chain: a frame
 * embedded any time after its load picks up on the very next click,
 * and a standalone document — the walk still finds nothing — passes
 * through untouched, byte-identical to before.
 *
 * Also exposes the DOWN direction for the ComponentTreeView (T5):
 * window.__jixoaiDesignHighlight({usageIndex, iterationIndex} | null)
 * highlights (and scrolls to) a usage inside THIS document.
 *
 * The INDICATOR era (#43→#44, Owner 2026-09-12): ONE ring pair per
 * CANVAS, not per frame. The CANVAS document is the single HOST (its
 * overlays ride the whole-canvas coordinate space, so a selection
 * moving between frames GLIDES across the canvas, and the studio's
 * lens broadcast compensates stroke/badge size so the ring stays
 * constant on screen at any zoom). FRAME documents are REPORTERS:
 * they own no overlays — hover/selection/track events ship the box
 * (frame viewport coords + frame name) up to the host, which maps
 * iframe-offset + box into canvas coordinates and places the ring.
 * #46: hover granularity is the actual element under the pointer
 * (the child, not its component ancestor); selection stays
 * component-granular (nearest stamped ancestor).
 *
 * Honest degradation (the r2 matrix): clicks on unstamped content
 * (native elements, components without a single-root rest spread,
 * third-party components) pass through untouched — unselectable, by
 * design, never an error.
 *
 * Plain JS browser code (the entries house style), self-styled: the
 * frame document may carry any theme.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T4); lazy
 * activation Owner 2026-09-12 (design-studio-r3 T6, #14 P1-1).
 */

const FRAME_NAME_PREFIX = 'jixoai-design-frame-';

/**
 * Walk up a same-origin parent chain (bounded) for the studio hook.
 * Structural input (the selection.ts house style): the test seam —
 * `root` is anything window-shaped ({ parent, __jixoaiDesignSelect }),
 * so the chain law (bounded depth, cross-origin bail, top stop) is
 * node-testable without a DOM. Exported for picker.test.ts only.
 */
export function findStudioWindowFrom(root, maxDepth = 6) {
  let window_ = root;
  for (let depth = 0; depth < maxDepth && window_ !== null; depth += 1) {
    try {
      if (typeof window_.__jixoaiDesignSelect === 'function') return window_;
    } catch {
      return null; // cross-origin ancestor — the studio is not up there
    }
    if (window_.parent === window_) break;
    window_ = window_.parent;
  }
  return null;
}

function findStudioWindow() {
  return findStudioWindowFrom(window);
}

function frameIdFromWindowName(name) {
  return name.startsWith(FRAME_NAME_PREFIX) && name.length > FRAME_NAME_PREFIX.length
    ? name.slice(FRAME_NAME_PREFIX.length)
    : null;
}

let highlighted = null;

function applyHighlight(element) {
  if (highlighted === element) return;
  highlighted = element;
  if (element !== null && !IS_CANVAS_HOST) {
    // scroll only INSIDE the owning frame (the host has no frame bounds)
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  if (IS_CANVAS_HOST) {
    placeIndicator('selected', element);
    observeTargets();
  } else {
    reportIndicator('selected', element);
  }
}

/* the hover indicator (#31→#43): its own overlay, its own color,
   lower visual weight than the selection ring */
let hovered = null;

function applyHover(element) {
  if (hovered === element) return;
  hovered = element;
  const ring = element !== null && element !== highlighted ? element : null;
  if (IS_CANVAS_HOST) {
    placeIndicator('hover', ring);
    observeTargets();
  } else {
    reportIndicator('hover', ring);
  }
}

/* ── the DOM-level indicators (#43, Owner 2026-09-12) ──────────────────
 *
 * Two overlays per document — [data-jx-indicator="hover"|"selected"] —
 * absolutely positioned at document level (appended to documentElement:
 * body rewrites must not kill them), pointer-events:none, glued to the
 * target's box. The selection overlay carries a metadata badge
 * (component id · usage index · live W×H). CSS transitions make target
 * changes glide; a `tracking` class suppresses them during scroll/resize
 * so the ring stays welded instead of rubber-banding.
 */

const INDICATOR_CSS = [
  `[data-jx-indicator] {`,
  `  position: absolute;`,
  `  top: 0; left: 0;`,
  `  pointer-events: none;`,
  `  z-index: 2147483646;`,
  `  box-sizing: border-box;`,
  `  transition: transform 120ms ease, width 120ms ease, height 120ms ease;`,
  `  will-change: transform, width, height;`,
  `}`,
  `[data-jx-indicator].jx-tracking {`,
  `  transition: none;`,
  `}`,
  `[data-jx-indicator="hover"] {`,
  `  border: 1.5px solid rgba(96, 140, 255, 0.55);`,
  `  border-radius: 2px;`,
  `}`,
  `[data-jx-indicator="selected"] {`,
  `  border: 1.5px solid #e05656;`,
  `  border-radius: 2px;`,
  `}`,
  `[data-jx-indicator] .jx-indicator-badge {`,
  `  position: absolute;`,
  `  top: -19px;`,
  `  left: -1.5px;`,
  `  padding: 1px 5px;`,
  `  font: 10px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;`,
  `  white-space: nowrap;`,
  `  color: #ffe3e3;`,
  `  background: #2a1214;`,
  `  border: 1px solid #e05656;`,
  `  border-radius: 3px;`,
  `}`,
].join('\n');

// the ROLE split (#44): canvas pages HOST the one ring pair; frame
// surfaces REPORT into it. A standalone frame (no embedding) keeps
// its selection seams and simply paints nothing.
const IS_CANVAS_HOST = typeof location !== 'undefined' && location.pathname.startsWith('/prototypes/');
const indicators = new Map(); // kind → element (host only)
let trackIdleTimer = 0;
let targetObserver = null;
let lensScale = 1; // host: the studio's current zoom (stroke compensation)
/* #44 state law (the deselect/ghost-ring bugs, Owner 2026-09-14):
 * each ring has an OWNER — the document that last placed a real box
 * (a frameName, 'canvas', or null). Only the owner's null clears the
 * ring; late nulls from a frame the pointer already left are ignored
 * (the leave-A / enter-B cross-document ordering race). The last
 * box+meta are kept so a lens change can re-apply ONLY the chrome
 * (stroke/badge compensation) without touching placement. */
const ringOwner = { hover: null, selected: null };
const ringLast = { hover: null, selected: null }; // {box, meta} | null

/** frame-side: ship a box (or null) to the canvas host */
function reportIndicator(kind, element) {
  if (IS_CANVAS_HOST) return; // hosts place directly
  if (window.parent === window) return; // standalone — nobody to host
  let payload = null;
  if (element !== null && element.isConnected) {
    const rect = element.getBoundingClientRect();
    payload = {
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
      component: element.getAttribute('data-jx-component'),
      instance: element.getAttribute('data-jx-instance'),
    };
  }
  window.parent.postMessage(
    { type: 'jx-design:indicator-report', kind, frameName: window.name, payload },
    window.location.origin,
  );
}

function ensureIndicator(kind) {
  let el = indicators.get(kind);
  if (el !== undefined && el.isConnected) return el;
  el = document.createElement('div');
  el.setAttribute('data-jx-indicator', kind);
  el.setAttribute('aria-hidden', 'true');
  if (kind === 'selected') {
    const badge = document.createElement('span');
    badge.className = 'jx-indicator-badge';
    el.appendChild(badge);
  }
  document.documentElement.appendChild(el);
  indicators.set(kind, el);
  return el;
}

/** host: reposition a placed overlay from a canvas-space box */
function placeIndicatorBox(kind, box, meta) {
  const el = ensureIndicator(kind);
  if (box === null) {
    el.style.display = 'none';
    ringLast[kind] = null;
    return;
  }
  ringLast[kind] = { box, meta: meta ?? null };
  const k = 1 / Math.max(lensScale, 0.05);
  el.style.display = 'block';
  el.style.transform = `translate(${box.x}px, ${box.y}px)`;
  el.style.width = `${box.w}px`;
  el.style.height = `${box.h}px`;
  el.style.borderWidth = `${1.5 * k}px`;
  el.style.borderRadius = `${2 * k}px`;
  if (kind === 'selected') {
    const badge = el.querySelector('.jx-indicator-badge');
    if (badge !== null) {
      badge.style.top = `${-19 * k}px`;
      badge.style.left = `${-1.5 * k}px`;
      badge.style.padding = `${1 * k}px ${5 * k}px`;
      badge.style.fontSize = `${10 * k}px`;
      badge.style.lineHeight = `${1.4}`;
      badge.style.borderWidth = `${1 * k}px`;
      badge.style.borderRadius = `${3 * k}px`;
      badge.textContent = meta;
    }
  }
}

/** reposition a placed overlay for a LOCAL element (host's own stamps) */
function placeIndicator(kind, element) {
  ringOwner[kind] = element !== null && element.isConnected ? 'canvas' : ringOwner[kind];
  if (element === null || !element.isConnected) {
    if (ringOwner[kind] === 'canvas') placeIndicatorBox(kind, null);
    return;
  }
  const rect = element.getBoundingClientRect();
  placeIndicatorBox(kind, { x: rect.left + window.scrollX, y: rect.top + window.scrollY, w: rect.width, h: rect.height },
    element.getAttribute('data-jx-component') !== null
      ? `${element.getAttribute('data-jx-component')} #${element.getAttribute('data-jx-instance') ?? '?'} · ${Math.round(rect.width)}×${Math.round(rect.height)}`
      : `${Math.round(rect.width)}×${Math.round(rect.height)}`);
}

/** scroll/resize repositioning: transitions OFF while tracking (glued),
 *  back ON after a short idle so the next target change glides again */
function trackIndicators() {
  if (!IS_CANVAS_HOST) {
    // frame side: the host needs the fresh box (content moved inside us)
    reportIndicator('selected', highlighted);
    reportIndicator('hover', hovered !== null && hovered !== highlighted ? hovered : null);
    return;
  }
  for (const [kind, el] of indicators) {
    if (el.style.display === 'none') continue;
    if (ringOwner[kind] === 'canvas') {
      el.classList.add('jx-tracking');
      placeIndicator(kind, kind === 'selected' ? highlighted : hovered);
    } else {
      // frame-owned: re-apply ONLY the zoom-compensated chrome from the
      // stored box — the host's own null locals must never clobber it
      const last = ringLast[kind];
      if (last !== null) {
        el.classList.add('jx-tracking');
        placeIndicatorBox(kind, last.box, last.meta);
      }
    }
  }
  clearTimeout(trackIdleTimer);
  trackIdleTimer = setTimeout(() => {
    for (const el of indicators.values()) el.classList.remove('jx-tracking');
  }, 160);
}

/** content resize follows the CURRENT targets (a growing button keeps
 *  its ring and badge honest) */
function observeTargets() {
  if (typeof ResizeObserver === 'undefined') return;
  targetObserver?.disconnect();
  const watch = [
    ['selected', highlighted],
    ['hover', hovered],
  ].filter(([, el]) => el !== null && el.isConnected);
  if (watch.length === 0) return;
  targetObserver = new ResizeObserver(() => trackIndicators());
  for (const [, el] of watch) targetObserver.observe(el);
}

function elementFor(target) {
  if (target === null) return null;
  const elements = document.querySelectorAll(
    `[data-jx-instance="${target.usageIndex}"]`,
  );
  if (elements.length === 0) return null;
  const index = target.iterationIndex === null ? 0 : Math.min(target.iterationIndex, elements.length - 1);
  return elements[index] ?? null;
}

export function initDesignPicker() {
  // ?pick=1 forces activation regardless of the studio walk (the
  // standalone-frame debug surface); otherwise activation is decided
  // per click by the lazy walk below
  const forced = new URLSearchParams(window.location.search).get('pick') === '1';

  // the indicator style (#44): the HOST document owns the one ring
  // pair; reporter frames inject nothing visual
  if (IS_CANVAS_HOST) {
    const style = document.createElement('style');
    style.textContent = INDICATOR_CSS;
    document.head.appendChild(style);
  }

  // scroll keeps the rings glued (transition suppressed while tracking;
  // reporters re-ship their boxes so the host follows)
  document.addEventListener('scroll', () => trackIndicators(), { capture: true, passive: true });
  window.addEventListener('resize', () => trackIndicators(), { passive: true });

  // HOST: frame reports arrive here — iframe offset + box = canvas box
  if (IS_CANVAS_HOST) {
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data === null || typeof data !== 'object' || data.type !== 'jx-design:indicator-report') return;
      if (event.source === null || event.source === window) return;
      const frame = Array.from(document.querySelectorAll('iframe')).find(
        (el) => el.contentWindow === event.source,
      );
      if (frame === undefined) return;
      if (data.payload === null) {
        // ONLY the current owner may clear (a late null from a frame
        // the pointer already left must not ghost the ring)
        if (ringOwner[data.kind] === data.frameName) {
          ringOwner[data.kind] = null;
          placeIndicatorBox(data.kind, null);
        }
        return;
      }
      ringOwner[data.kind] = data.frameName;
      const rect = frame.getBoundingClientRect();
      const badge =
        data.kind === 'selected' && data.payload.component !== null
          ? `${data.payload.component} #${data.payload.instance ?? '?'} · ${Math.round(data.payload.w)}×${Math.round(data.payload.h)}`
          : null;
      placeIndicatorBox(
        data.kind,
        {
          x: rect.left + window.scrollX + data.payload.x,
          y: rect.top + window.scrollY + data.payload.y,
          w: data.payload.w,
          h: data.payload.h,
        },
        badge,
      );
    });
    // the studio's lens broadcast: stroke/badge compensation only (the
    // overlay lives in canvas space — the box itself never needs mapping)
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data === null || typeof data !== 'object' || data.type !== 'jx-design:lens') return;
      if (typeof data.scale !== 'number' || !Number.isFinite(data.scale)) return;
      lensScale = Math.min(Math.max(data.scale, 0.05), 10);
      trackIndicators();
    });
  }

  document.addEventListener(
    'click',
    (event) => {
      // lazy activation (r3 T6): re-walk the chain on EVERY click —
      // the studio seam may have appeared after this document loaded
      // (the HMR double-reload race), and a walk that still finds
      // nothing means standalone: pass through, untouched, same as
      // never having been injected
      const studio = findStudioWindow();
      if (studio === null && !forced) return;
      const target = event.target;
      if (target === null || typeof target.closest !== 'function') return;
      const stamped = target.closest('[data-jx-component]');
      if (stamped === null) return; // unstamped content passes through
      event.preventDefault();
      event.stopPropagation();
      const usageIndex = Number(stamped.getAttribute('data-jx-instance'));
      const component = stamped.getAttribute('data-jx-component');
      if (!Number.isInteger(usageIndex) || component === null) return;
      const all = document.querySelectorAll(`[data-jx-instance="${String(usageIndex)}"]`);
      const iterationIndex = all.length > 1 ? Array.prototype.indexOf.call(all, stamped) : null;
      applyHighlight(stamped);
      if (studio !== null) {
        studio.__jixoaiDesignSelect({
          frameId: frameIdFromWindowName(window.name),
          usageIndex,
          iterationIndex,
          component,
          instanceCount: all.length,
        });
      }
    },
    true,
  );

  // Escape clears the selection (the chip's other removal path)
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || highlighted === null) return;
    applyHighlight(null);
    const studio = findStudioWindow();
    if (studio !== null) studio.__jixoaiDesignSelect(null);
  });

  // the DOWN seam: tree selection highlights inside this document.
  // Registered unconditionally — a standalone document simply has no
  // caller, and a document embedded later is reachable immediately.
  window.__jixoaiDesignHighlight = (target) => {
    applyHighlight(target === null ? null : elementFor(target));
  };

  // the hover DOWN seam (#31): tree hover lights the element — the
  // highlight twin WITHOUT the scroll (hover never moves the viewport)
  window.__jixoaiDesignHover = (target) => {
    applyHover(target === null ? null : elementFor(target));
  };

  // the hover loop (#46→rev, Owner 2026-09-14): hover granularity is
  // the NEAREST STAMPED ANCESTOR — the SAME target a click selects.
  // The ring promises exactly what a click does (the raw-child
  // experiment made hover and click disagree: rings on raw children
  // whose clicks selected the ancestor — "点击没有效果" 的体感);
  // outside any stamped usage there is NO ring and clicks pass
  // through, also consistent. Stamped CHILDREN ring themselves
  // (the innermost ancestor), which is the #46 intent.
  document.addEventListener(
    'mouseover',
    (event) => {
      const target = event.target;
      if (target === null || typeof target.closest !== 'function') return;
      const stamped = target.closest('[data-jx-component]');
      applyHover(stamped);
      if (stamped === null) return;
      const usageIndex = Number(stamped.getAttribute('data-jx-instance'));
      const component = stamped.getAttribute('data-jx-component');
      if (!Number.isInteger(usageIndex) || component === null) return;
      const all = document.querySelectorAll(`[data-jx-instance="${String(usageIndex)}"]`);
      const iterationIndex = all.length > 1 ? Array.prototype.indexOf.call(all, stamped) : null;
      const studio = findStudioWindow();
      if (studio !== null && typeof studio.__jixoaiDesignHover === 'function') {
        studio.__jixoaiDesignHover({
          frameId: frameIdFromWindowName(window.name),
          usageIndex,
          iterationIndex,
          component,
          instanceCount: all.length,
        });
      }
    },
    { capture: true, passive: true },
  )
  document.addEventListener(
    'mouseout',
    (event) => {
      // only when truly LEAVING the stamped element (not crossing a child)
      if (event.relatedTarget !== null && event.target !== null) {
        const from = event.target.closest ? event.target.closest('[data-jx-component]') : null;
        const to = event.relatedTarget.closest ? event.relatedTarget.closest('[data-jx-component]') : null;
        if (from !== null && from === to) return;
      }
      applyHover(null);
      const studio = findStudioWindow();
      if (studio !== null && typeof studio.__jixoaiDesignHover === 'function') {
        studio.__jixoaiDesignHover(null);
      }
    },
    { capture: true, passive: true },
  );
}
