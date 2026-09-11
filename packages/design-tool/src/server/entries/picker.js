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
const HIGHLIGHT_CLASS = 'jx-design-pick-highlight';

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
  if (highlighted !== null) highlighted.classList.remove(HIGHLIGHT_CLASS);
  highlighted = element;
  if (element !== null) {
    element.classList.add(HIGHLIGHT_CLASS);
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
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

  // the highlight style: outline only (layout-neutral — measurements
  // like the kit's adaptive height must not see the picker). Injected
  // unconditionally: the class does nothing until code adds it, so a
  // standalone document stays visually byte-identical.
  const style = document.createElement('style');
  style.textContent = [
    `.${HIGHLIGHT_CLASS} {`,
    `  outline: 2px solid #e05656;`,
    `  outline-offset: 2px;`,
    `}`,
  ].join('\n');
  document.head.appendChild(style);

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
}
