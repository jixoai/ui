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
 * The INDICATOR era (#31→#43, Owner 2026-09-12): two DOM-level
 * overlays per document — a HOVER ring (blue, subtle, gliding between
 * elements via CSS transition) and a SELECTION ring (red) carrying a
 * metadata badge (component id, usage index, live W×H). They track
 * the target box through resize (ResizeObserver) and scroll
 * (transition suppressed while tracking so the ring stays glued) and
 * REPLACE the css-outline/box-shadow pair: a DOM indicator composes,
 * animates, and carries information css-only never could.
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
  if (element !== null) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  placeIndicator('selected', element);
  observeTargets();
}

/* the hover indicator (#31→#43): its own overlay, its own color,
   lower visual weight than the selection ring */
let hovered = null;

function applyHover(element) {
  if (hovered === element) return;
  hovered = element;
  placeIndicator('hover', element !== null && element !== highlighted ? element : null);
  observeTargets();
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

const indicators = new Map(); // kind → element
let trackIdleTimer = 0;
let targetObserver = null;

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

/** reposition a placed overlay (and refresh the badge text) */
function placeIndicator(kind, element) {
  const el = ensureIndicator(kind);
  if (element === null || !element.isConnected) {
    el.style.display = 'none';
    return;
  }
  const rect = element.getBoundingClientRect();
  el.style.display = 'block';
  el.style.transform = `translate(${rect.left + window.scrollX}px, ${rect.top + window.scrollY}px)`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
  if (kind === 'selected') {
    const badge = el.querySelector('.jx-indicator-badge');
    if (badge !== null) {
      const component = element.getAttribute('data-jx-component') ?? '?';
      const instance = element.getAttribute('data-jx-instance') ?? '?';
      badge.textContent = `${component} #${instance} · ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    }
  }
}

/** scroll/resize repositioning: transitions OFF while tracking (glued),
 *  back ON after a short idle so the next target change glides again */
function trackIndicators() {
  for (const [kind, el] of indicators) {
    if (el.style.display === 'none') continue;
    el.classList.add('jx-tracking');
    placeIndicator(kind, kind === 'selected' ? highlighted : hovered);
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

  // the indicator style (#43): overlays + badge. Injected
  // unconditionally — nothing paints until code places them, so a
  // standalone document stays visually byte-identical.
  const style = document.createElement('style');
  style.textContent = INDICATOR_CSS;
  document.head.appendChild(style);

  // scroll keeps the rings glued (transition suppressed while tracking)
  document.addEventListener('scroll', () => trackIndicators(), { capture: true, passive: true });
  window.addEventListener('resize', () => trackIndicators(), { passive: true });

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

  // the hover UP loop (#31): mouseover/mouseout on stamped elements —
  // outline locally + report to the studio (the tree lights its row).
  // Passive + capture: cheap, and no click semantics are touched.
  document.addEventListener(
    'mouseover',
    (event) => {
      const target = event.target;
      if (target === null || typeof target.closest !== 'function') return;
      const stamped = target.closest('[data-jx-component]');
      const element = stamped === null ? null : stamped;
      applyHover(element);
      if (element === null) return;
      const usageIndex = Number(element.getAttribute('data-jx-instance'));
      const component = element.getAttribute('data-jx-component');
      if (!Number.isInteger(usageIndex) || component === null) return;
      const all = document.querySelectorAll(`[data-jx-instance="${String(usageIndex)}"]`);
      const iterationIndex = all.length > 1 ? Array.prototype.indexOf.call(all, element) : null;
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
  );
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
