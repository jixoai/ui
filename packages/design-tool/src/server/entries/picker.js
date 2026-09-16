/**
 * @jixoai/ui-design (server entries) — the canvas picker, rewritten
 * around ONE truth (the acceptance-fixes round, Owner 2026-09-17:
 * "做减法 — the laws a user can recite").
 *
 * The frame-surface half of the selection loop: in studio-embedded
 * frames (or with ?pick=1 forced on), a click resolves the NEAREST
 * STAMPED ancestor (data-jx-component — the usage-site stamp) and
 * reports the selection UP the same-origin iframe chain to the
 * studio's window.__jixoaiDesignSelect hook. Lazy per-click activation
 * (r3 T6): every click re-walks the (cheap, bounded) parent chain, so
 * a frame embedded any time after its load picks up on the very next
 * click, and a standalone document passes through untouched.
 *
 * THE SINGLE-TRUTH MODEL (#44 kept, the state split removed): the
 * CANVAS document is the host and the ONLY place a ring is placed.
 * Every document — host or frame — does exactly two things: REPORT
 * (a box, a source name, and whether this is a user pick or a
 * follow-along refresh) and ANSWER the host's DOWN seams. Three laws,
 * no exceptions, all of them in resolveRingUpdate:
 *
 *   1. hover with a box: the LAST event wins (the pointer is the
 *      truth — whoever it just entered takes the ring).
 *   2. selected with a box: a user PICK always wins and names its
 *      source document the owner; a refresh only counts when it comes
 *      from the current owner (a stale frame cannot steal the ring).
 *   3. clearing (no box): only the current owner may clear.
 *
 * THE FOLLOW-ALONG (one law, not four event kinds): while a document
 * has a target (or the host hosts a frame-owned ring), a rAF loop
 * re-reads the target's rect every frame and re-reports/re-hosts ONLY
 * when it moved — BCR changes of any cause (reflow, style, resize,
 * scroll, DOM churn) align by construction; an idle frame sends no
 * message and writes no style (the rect reads are the whole cost);
 * background tabs pause on their own (rAF), and the loop stops
 * entirely once nothing is marked. The
 * host re-hosts frame-owned rings from its OWN iframe measurement
 * against the kept in-frame box — no cross-document query, no down
 * channel. #48's glide/fade windows and the lens compensation ride
 * unchanged.
 *
 * Honest degradation (the r2 matrix): clicks on unstamped content
 * pass through untouched — unselectable, by design, never an error.
 *
 * Plain JS browser code (the entries house style), self-styled: the
 * frame document may carry any theme.
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

/**
 * The three laws (pure — the decision, never the effect). Given the
 * ring's current owner, the report's kind/source/boxness and whether
 * it is a user pick, decide `{ owner, apply }`. Everything the host's
 * accept() does is place-or-ignore exactly what this returns.
 */
export function resolveRingUpdate(prevOwner, kind, frameName, hasBox, isPick) {
  if (hasBox) {
    if (kind === 'hover') return { owner: frameName, apply: true };
    if (isPick || prevOwner === frameName) return { owner: frameName, apply: true };
    return { owner: prevOwner, apply: false };
  }
  if (prevOwner === frameName) return { owner: null, apply: true };
  return { owner: prevOwner, apply: false };
}

function findStudioWindow() {
  return findStudioWindowFrom(window);
}

function frameIdFromWindowName(name) {
  return name.startsWith(FRAME_NAME_PREFIX) && name.length > FRAME_NAME_PREFIX.length
    ? name.slice(FRAME_NAME_PREFIX.length)
    : null;
}

/* ── per-document record (for refresh reports and the DOWN seams) ── */
let highlighted = null;
let hovered = null;

const IS_CANVAS_HOST = typeof location !== 'undefined' && location.pathname.startsWith('/prototypes/');

/* ── the report: one shape, one road ──────────────────────────────── */
function emit(kind, element, origin) {
  const connected = element !== null && element !== undefined && element.isConnected;
  let payload = null;
  if (connected) {
    const rect = element.getBoundingClientRect();
    payload = { x: rect.left + (IS_CANVAS_HOST ? window.scrollX : 0), y: rect.top + (IS_CANVAS_HOST ? window.scrollY : 0),
      w: rect.width, h: rect.height,
      component: element.getAttribute('data-jx-component'), instance: element.getAttribute('data-jx-instance') };
  }
  lastSent[kind] = payloadKey(payload); // the align loop keys off every send, pick or refresh
  if (IS_CANVAS_HOST) {
    accept(kind, 'canvas', payload, origin, null);
    return;
  }
  if (window.parent === window) return; // standalone — nobody to host
  window.parent.postMessage(
    { type: 'jx-design:indicator-report', kind, frameName: window.name, payload, origin },
    window.location.origin,
  );
}

function applyHighlight(element, origin = 'pick') {
  highlighted = element;
  // scroll only INSIDE the owning frame (the host has no frame bounds)
  if (element !== null && !IS_CANVAS_HOST) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  emit('selected', element, origin);
  ensureAlignLoop();
}

/* the hover ring hides over the selected element (the selection ring
   already marks it) — the twin of the old #46 law, kept */
function applyHover(element, origin = 'pick') {
  hovered = element;
  emit('hover', element !== null && element !== highlighted ? element : null, origin);
  ensureAlignLoop();
}

/* ── the host's ring pair (#44: ONE pair per canvas) ──────────────── */
const indicators = new Map(); // kind → element (host only)
const ringOwner = { hover: null, selected: null }; // the source document each ring answers to
const ringLast = { hover: null, selected: null }; // { box, frameBox, meta } | null
let lensScale = 1; // the studio's current zoom (stroke compensation)

const INDICATOR_CSS = [
  // the shared-element glide (#48): the ring NEVER leaves the layout
  // (display flips kill CSS transitions — the glide must survive
  // crossing gaps/frames). Boxes ride the CLASSIC iOS CURVE
  // cubic-bezier(0.25, 0.1, 0.25, 1) — smooth, NO overshoot (Owner
  // 2026-09-14: the spring was too much); opacity fades plain ease.
  `[data-jx-indicator] {`,
  `  position: absolute;`,
  `  top: 0; left: 0;`,
  `  pointer-events: none;`,
  `  z-index: 2147483646;`,
  `  box-sizing: border-box;`,
  `  opacity: 0;`,
  `  transition: transform 240ms cubic-bezier(0.25, 0.1, 0.25, 1), width 240ms cubic-bezier(0.25, 0.1, 0.25, 1), height 240ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 140ms ease;`,
  `  will-change: transform, width, height, opacity;`,
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

/** the hover fade-window (#48): a transient null (crossing a gap or a
 *  frame boundary) does not hide the ring immediately — a new box
 *  within the window cancels the fade and GLIDES there; only a real
 *  rest clears it. Selection nulls are deliberate and apply at once. */
const hoverFadeTimers = new Map(); // kind → timeout (hover only)

/** host: place an overlay from a canvas-space box (the ONLY placement
 *  path — accept() decides, this paints). `frameBox` keeps the frame
 *  viewport box for frame-owned rings so the host can re-measure the
 *  iframe offset locally on any host-side layout change. */
function placeIndicatorBox(kind, box, meta, frameBox = null) {
  const el = ensureIndicator(kind);
  if (box === null) {
    ringLast[kind] = null;
    const applyFade = () => { el.style.opacity = '0'; };
    if (kind === 'hover') {
      clearTimeout(hoverFadeTimers.get(kind));
      hoverFadeTimers.set(kind, setTimeout(applyFade, 160));
    } else {
      clearTimeout(hoverFadeTimers.get(kind));
      applyFade();
    }
    return;
  }
  if (kind === 'hover') clearTimeout(hoverFadeTimers.get(kind));
  ringLast[kind] = { box, frameBox, meta: meta ?? null };
  const k = 1 / Math.max(lensScale, 0.05);
  el.style.display = 'block';
  el.style.opacity = '1';
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

function badgeOf(payload) {
  return payload.component !== null
    ? `${payload.component} #${payload.instance ?? '?'} · ${Math.round(payload.w)}×${Math.round(payload.h)}`
    : `${Math.round(payload.w)}×${Math.round(payload.h)}`;
}

/** host: the single adjudication gate — the three laws, nothing else */
function accept(kind, frameName, payload, origin, frameBox) {
  const ruling = resolveRingUpdate(ringOwner[kind], kind, frameName, payload !== null, origin === 'pick');
  if (!ruling.apply) return;
  if (ringOwner[kind] !== ruling.owner) ownerIframe[kind] = null; // re-resolve the owner's iframe
  ringOwner[kind] = ruling.owner;
  placeIndicatorBox(
    kind,
    payload,
    kind === 'selected' && payload !== null ? badgeOf(payload) : null,
    frameBox,
  );
  ensureAlignLoop();
}

function iframeByName(name) {
  return document.querySelector(`iframe[name="${name}"]`) ?? null;
}

/** host: re-host frame-owned rings — the iframe offset is host-side
 *  truth, measured here and now against the kept in-frame box (the
 *  lens chrome compensation rides the same re-placement). */
/* transitions OFF while tracking (glued), back ON after a short idle
 * so the next target change glides again (#48) */
let trackIdleTimer = 0;
function armTrackingClass() {
  for (const el of indicators.values()) el.classList.add('jx-tracking');
  clearTimeout(trackIdleTimer);
  trackIdleTimer = setTimeout(() => {
    for (const el of indicators.values()) el.classList.remove('jx-tracking');
  }, 160);
}

/** the follow-along refresh (explicit re-sync: the lens broadcast) —
 *  force re-hosts (the chrome scales) and re-reports; a stale frame's
 *  report is ignored by law 2, no guard needed here */
function trackIndicators() {
  emit('selected', highlighted, 'refresh');
  emit('hover', hovered !== null && hovered !== highlighted ? hovered : null, 'refresh');
  if (IS_CANVAS_HOST) {
    rehostFrameRing('selected', true);
    rehostFrameRing('hover', true);
    armTrackingClass();
  }
}

/* ── the align loop: every frame, read the rects, act on change ────
 * The whole follow-along law. While anything is marked (a live local
 * target, or — host-side — a frame-owned ring), one rAF step per
 * frame re-reads and re-reports ONLY movements (an idle frame sends
 * no message and writes no style — the rect reads are the whole
 * cost); when nothing is marked the loop is not scheduled at all. A
 * target that left the DOM unmarks itself; a host whose owning frame
 * left the canvas retires the ring it owned. */
let alignRaf = 0;
const lastSent = { selected: null, hover: null }; // payload keys ('null' for none)
const ownerIframe = { selected: null, hover: null }; // host cache: owner frame name → element

function payloadKey(p) {
  return p === null ? 'null' : `${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.w.toFixed(1)} ${p.h.toFixed(1)}`;
}

function hasAlignWork() {
  if ((highlighted !== null && highlighted.isConnected) || (hovered !== null && hovered.isConnected)) return true;
  return IS_CANVAS_HOST && (ringOwner.selected !== null || ringOwner.hover !== null);
}

function ensureAlignLoop() {
  if (alignRaf !== 0 || !hasAlignWork()) return;
  alignRaf = requestAnimationFrame(alignStep);
}

function alignStep() {
  alignRaf = 0;
  // dead targets unmark themselves (HMR churn, canvas re-mounts) —
  // the next key compare emits the clearing null and the loop can stop
  if (highlighted !== null && !highlighted.isConnected) highlighted = null;
  if (hovered !== null && !hovered.isConnected) hovered = null;
  // local targets: re-read and re-report on movement only
  for (const [kind, el] of [
    ['selected', highlighted],
    ['hover', hovered !== null && hovered !== highlighted ? hovered : null],
  ]) {
    const key = el === null || el === undefined ? 'null' : payloadKey(rectOf(el));
    if (key !== lastSent[kind]) emit(kind, el ?? null, 'refresh');
  }
  if (IS_CANVAS_HOST) {
    rehostFrameRing('selected', false);
    rehostFrameRing('hover', false);
  }
  if (hasAlignWork()) alignRaf = requestAnimationFrame(alignStep);
}

/** host: re-host a frame-owned ring from the host's OWN iframe
 *  measurement against the kept in-frame box. `force` re-places even
 *  without movement (the lens broadcast — the chrome scales with the
 *  zoom while the box does not move). A vanished owning frame retires
 *  the ring (its document is gone; the canvas-switch path clears the
 *  panel selection on its own). */
function rehostFrameRing(kind, force) {
  const owner = ringOwner[kind];
  if (owner === null || owner === 'canvas') return;
  const last = ringLast[kind];
  if (last === null || last.frameBox === null) return;
  let ifr = ownerIframe[kind];
  if (ifr === null || !ifr.isConnected) {
    ifr = iframeByName(owner); // owner IS the full frame name
    ownerIframe[kind] = ifr;
  }
  if (ifr === null) {
    ringOwner[kind] = null;
    ownerIframe[kind] = null;
    placeIndicatorBox(kind, null);
    return;
  }
  const rect = ifr.getBoundingClientRect();
  const box = { x: rect.left + window.scrollX + last.frameBox.x, y: rect.top + window.scrollY + last.frameBox.y,
    w: last.frameBox.w, h: last.frameBox.h };
  if (force || payloadKey(box) !== payloadKey(last.box)) {
    placeIndicatorBox(kind, box, last.meta, last.frameBox);
    armTrackingClass();
  }
}

/** the reporter's in-frame rect (viewport coords — the host adds the
 *  iframe offset); the host's own targets read in document coords */
function rectOf(el) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + (IS_CANVAS_HOST ? window.scrollX : 0), y: rect.top + (IS_CANVAS_HOST ? window.scrollY : 0),
    w: rect.width, h: rect.height };
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

  // the indicator pair (#44): the HOST document owns the one ring
  // pair; reporter frames inject nothing visual
  if (IS_CANVAS_HOST) {
    const style = document.createElement('style');
    style.textContent = INDICATOR_CSS;
    document.head.appendChild(style);
  }

  // the follow-along is the align loop (rAF, change-detected) — no
  // event listeners to keep in sync; a scroll/resize/style/DOM churn
  // all surface as the same thing: the target's rect moved

  if (IS_CANVAS_HOST) {
    // frame reports arrive here — iframe offset + box = canvas box
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data === null || typeof data !== 'object' || data.type !== 'jx-design:indicator-report') return;
      if (event.source === null || event.source === window) return;
      const frame = Array.from(document.querySelectorAll('iframe')).find(
        (el) => el.contentWindow === event.source,
      );
      if (frame === undefined) return;
      const origin = data.origin === 'pick' ? 'pick' : 'refresh';
      if (data.payload === null) {
        accept(data.kind, data.frameName, null, origin, null);
        return;
      }
      const rect = frame.getBoundingClientRect();
      accept(
        data.kind, data.frameName,
        { x: rect.left + window.scrollX + data.payload.x, y: rect.top + window.scrollY + data.payload.y,
          w: data.payload.w, h: data.payload.h, component: data.payload.component ?? null, instance: data.payload.instance ?? null },
        origin,
        { x: data.payload.x, y: data.payload.y, w: data.payload.w, h: data.payload.h },
      );
    });
    // the studio's lens broadcast: stroke/badge compensation only (the
    // overlay lives in canvas space — the box itself never needs
    // mapping; rehost also re-measures iframe offsets)
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
      // nothing means standalone: pass through, untouched
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
      applyHighlight(stamped, 'pick');
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

  // Escape clears the selection (the chip's other removal path). The
  // panel follows ONLY when the ring answered to THIS document (the
  // owner law's UI twin): a frame-owned selection survives the HOST
  // document's Escape — its owner (the frame) is the one that may
  // clear it, from inside the frame.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || highlighted === null) return;
    applyHighlight(null, 'pick');
    if (IS_CANVAS_HOST && ringOwner.selected !== null && ringOwner.selected !== 'canvas') return;
    const studio = findStudioWindow();
    if (studio !== null) studio.__jixoaiDesignSelect(null);
  });

  // the DOWN seams: tree selection and tree hover drive THIS document
  // (a pick — the tree click is a user action; registered
  // unconditionally, a standalone document simply has no caller)
  window.__jixoaiDesignHighlight = (target) => {
    applyHighlight(target === null ? null : elementFor(target), 'pick');
  };
  window.__jixoaiDesignHover = (target) => {
    // the highlight twin WITHOUT the scroll (hover never moves the viewport)
    applyHover(target === null ? null : elementFor(target), 'pick');
  };

  // the hover loop (#46→rev, Owner 2026-09-14): hover granularity is
  // the NEAREST STAMPED ANCESTOR — the SAME target a click selects.
  // The ring promises exactly what a click does; outside any stamped
  // usage there is NO ring and clicks pass through, also consistent.
  document.addEventListener(
    'mouseover',
    (event) => {
      const target = event.target;
      if (target === null || typeof target.closest !== 'function') return;
      const stamped = target.closest('[data-jx-component]');
      applyHover(stamped, 'pick');
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
      applyHover(null, 'pick');
      const studio = findStudioWindow();
      if (studio !== null && typeof studio.__jixoaiDesignHover === 'function') {
        studio.__jixoaiDesignHover(null);
      }
    },
    { capture: true, passive: true },
  );
}
