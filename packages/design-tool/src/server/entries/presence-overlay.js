/**
 * @jixoai/ui-design (server entries) — the canvas-document presence
 * overlay (collab-presence design.md §4): the REMOTE half of the
 * three indicator families that lives in the canvas document (the
 * same ground the picker's ring pair owns), plus the LOCAL cursor
 * report lane the shell cannot see (the iframe is an event black
 * hole — postMessage is the only road out, the canvas-entry law).
 *
 * Two roads, one file (the picker's house style — plain JS,
 * self-styled, same-origin only):
 *
 *   UP  (local cursor): pointermove over THIS canvas document,
 *      ~50ms trailing throttle, reported to the studio parent as
 *      {type:'jx-design:local-cursor', x, y} in CANVAS-DOCUMENT
 *      coordinates (clientX + scrollX — the picker emit's coordinate
 *      law). The shell forwards it on the ws as surface 'canvas';
 *      the coordinates never cross a lens transform, so no rescaling
 *      is ever needed on this road.
 *
 *   DOWN (remote indicators): the studio parent broadcasts
 *      {type:'jx-design:presence', players:[…]} (the lens-broadcast
 *      message pattern — rAF-coalesced on the shell side). This
 *      document renders, per player, the shared-element pair:
 *        [data-jx-remote="<playerId>:cursor"]      the mouse dot +
 *          name tag (60ms linear glide — presence streams at ~50ms)
 *        [data-jx-remote="<playerId>:canvas-focus"] the ghost ring
 *          (240ms classic-curve glide — the picker INDICATOR_CSS
 *          family), badge `<name> · <component>#<n>`, 1px player
 *          hue border at opacity .55
 *      Elements are per-player RESIDENT (join builds, leave retires
 *      with a fade); a hasMouse flip only toggles visibility — the
 *      virtual-mouse law (never destroy-and-rebuild). AI players
 *      (hasMouse false) never show a cursor. Ring targets resolve
 *      through the picker's report grammar: frameId null → this
 *      document, else the kit iframe (name jixoai-design-frame-<id>)
 *      queried same-origin with the iframe offset added — and a rAF
 *      align loop re-reads every live target's rect, re-placing ONLY
 *      on movement (attention at rest writes no style).
 *
 * Degradation (§4): an empty players list retires every element —
 * the shell sends exactly that when the ws drops.
 *
 * Original need: collab-presence task group 2 (2026-09-16).
 */

const FRAME_NAME_PREFIX = 'jixoai-design-frame-';
const IS_CANVAS_HOST = typeof location !== 'undefined' && location.pathname.startsWith('/prototypes/');

/* ── the shared indicator family (picker INDICATOR_CSS's grammar) ────── */

const REMOTE_INDICATOR_CSS = [
  // the shared-element glide law (#48, verbatim from the picker): the
  // element never leaves the layout; boxes ride the classic iOS curve
  // 240ms, opacity fades plain ease. The cursor subclass shortens the
  // box transition to 60ms linear — it tracks a ~50ms presence stream.
  `[data-jx-remote] {`,
  `  position: absolute;`,
  `  top: 0; left: 0;`,
  `  pointer-events: none;`,
  `  z-index: 2147483646;`,
  `  box-sizing: border-box;`,
  `  opacity: 0;`,
  `  transition: transform 240ms cubic-bezier(0.25, 0.1, 0.25, 1), width 240ms cubic-bezier(0.25, 0.1, 0.25, 1), height 240ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 140ms ease;`,
  `  will-change: transform, width, height, opacity;`,
  `}`,
  `[data-jx-remote$=":cursor"] {`,
  `  transition: transform 60ms linear, opacity 140ms ease;`,
  `}`,
  `[data-jx-remote$=":cursor"] .jx-remote-dot {`,
  `  position: absolute;`,
  `  top: -4px; left: -4px;`,
  `  width: 9px; height: 9px;`,
  `  border-radius: 50%;`,
  `  box-shadow: 0 0 0 1px rgba(13, 12, 11, 0.55);`,
  `}`,
  `[data-jx-remote$=":cursor"] .jx-remote-tag {`,
  `  position: absolute;`,
  `  top: -9px; left: 8px;`,
  `  padding: 1px 5px;`,
  `  font: 10px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;`,
  `  white-space: nowrap;`,
  `  border-radius: 3px;`,
  `  color: #f5f1e8;`,
  `}`,
  `[data-jx-remote$=":canvas-focus"] {`,
  `  border-radius: 2px;`,
  `}`,
  `[data-jx-remote$=":canvas-focus"] .jx-remote-badge {`,
  `  position: absolute;`,
  `  top: -17px;`,
  `  left: -1px;`,
  `  padding: 1px 5px;`,
  `  font: 10px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;`,
  `  white-space: nowrap;`,
  `  border-radius: 3px;`,
  `}`,
].join('\n');

/* ── the per-player resident pair ──────────────────────────────────── */

const roster = new Map(); // playerId → entry {cursor, dot, tag, ring, badge, attention, ringKey}
let lensScale = 1;
let styleInjected = false;

function ensureEntry(player) {
  let entry = roster.get(player.playerId);
  if (entry !== undefined && entry.cursor.isConnected && entry.ring.isConnected) {
    entry.hasMouse = player.hasMouse === true;
    return entry;
  }
  const hue = player.colorHue;
  const cursor = document.createElement('div');
  cursor.setAttribute('data-jx-remote', `${player.playerId}:cursor`);
  cursor.setAttribute('aria-hidden', 'true');
  const dot = document.createElement('span');
  dot.className = 'jx-remote-dot';
  dot.style.background = `hsl(${hue}, 85%, 45%)`;
  const tag = document.createElement('span');
  tag.className = 'jx-remote-tag';
  tag.style.background = `hsl(${hue}, 85%, 45% / 0.92)`;
  tag.textContent = player.name;
  cursor.appendChild(dot);
  cursor.appendChild(tag);

  const ring = document.createElement('div');
  ring.setAttribute('data-jx-remote', `${player.playerId}:canvas-focus`);
  ring.setAttribute('aria-hidden', 'true');
  ring.style.borderColor = `hsl(${hue}, 70%, 55%)`;
  const badge = document.createElement('span');
  badge.className = 'jx-remote-badge';
  badge.style.background = `hsl(${hue}, 70%, 55% / 0.92)`;
  ring.appendChild(badge);

  document.documentElement.appendChild(cursor);
  document.documentElement.appendChild(ring);
  entry = { cursor, dot, tag, ring, badge, attention: null, ringKey: null, hasMouse: player.hasMouse === true };
  roster.set(player.playerId, entry);
  // a fast leave→join re-creates the entry: cancel any pending retire
  // timer holding the PREVIOUS generation's elements (its capture would
  // leak this one's, and a stale capture never removes its own)
  clearTimeout(retireTimers.get(player.playerId));
  retireTimers.delete(player.playerId);
  return entry;
}

/** a departed player: fade out (the transition family), then remove */
const retireTimers = new Map(); // playerId → timeout
function retireEntry(playerId) {
  const entry = roster.get(playerId);
  if (entry === undefined) return;
  entry.attention = null;
  entry.cursor.style.opacity = '0';
  entry.ring.style.opacity = '0';
  clearTimeout(retireTimers.get(playerId));
  retireTimers.set(playerId, setTimeout(() => {
    retireTimers.delete(playerId);
    entry.cursor.remove();
    entry.ring.remove();
  }, 240));
  roster.delete(playerId);
}

/* ── the lens compensation (the picker's k law) ────────────────────── */

function lensK() {
  return 1 / Math.min(Math.max(lensScale, 0.05), 10);
}

/* ── placement ─────────────────────────────────────────────────────── */

/** frame-surface coordinates resolve through the owning kit iframe */
function surfaceOffset(surface) {
  if (typeof surface !== 'string' || !surface.startsWith('frame:')) return { x: 0, y: 0 };
  const frameId = surface.slice('frame:'.length);
  const frame = document.querySelector(`iframe[name="${FRAME_NAME_PREFIX}${frameId}"]`);
  if (frame === null) return null; // frame gone — the cursor parks off-stage
  const rect = frame.getBoundingClientRect();
  return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
}

function placeCursor(entry, cursor) {
  const offset = surfaceOffset(cursor.surface);
  if (offset === null) {
    entry.cursor.style.opacity = '0';
    return;
  }
  const k = lensK();
  entry.cursor.style.transform = `translate(${cursor.x + offset.x}px, ${cursor.y + offset.y}px)`;
  entry.dot.style.width = entry.dot.style.height = `${9 * k}px`;
  entry.dot.style.top = entry.dot.style.left = `${-4.5 * k}px`;
  entry.tag.style.top = `${-9 * k}px`;
  entry.tag.style.left = `${8 * k}px`;
  entry.tag.style.fontSize = `${10 * k}px`;
  // the virtual-mouse law: visibility flips, the element never rebuilds
  entry.cursor.style.opacity = entry.hasMouse ? '1' : '0';
}

/** the attention target's canvas-document box. The focus carries the
 *  protocol componentId (the native `id` attribute stamped into the
 *  source at ingest) — resolved by `[id=…]` in THIS document first,
 *  then inside every kit iframe (same-origin), adding the iframe
 *  offset. Unresolvable ids return null (the ring fades out — the
 *  badge keeps the id legible, never a wrong-element ring). */
export function resolveAttentionBox(attention) {
  if (attention === null || attention.kind !== 'canvas') return null;
  const idSelector = `[id="${CSS.escape(attention.component)}"]`;
  const own = document.querySelector(idSelector);
  if (own !== null) {
    const rect = own.getBoundingClientRect();
    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, w: rect.width, h: rect.height };
  }
  for (const frame of document.querySelectorAll('iframe')) {
    const doc = frame.contentDocument;
    if (doc === null) continue; // cross-origin — not ours
    const el = doc.querySelector(idSelector);
    if (el === null) continue;
    const rect = frame.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    return { x: rect.left + box.left + window.scrollX, y: rect.top + box.top + window.scrollY, w: box.width, h: box.height };
  }
  return null;
}

function boxKey(box) {
  return box === null ? 'null' : `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.w.toFixed(1)} ${box.h.toFixed(1)}`;
}

function placeRing(entry, name, attention) {
  const box = resolveAttentionBox(attention);
  entry.attention = attention;
  if (box === null) {
    entry.ringKey = null;
    entry.ring.style.opacity = '0';
    return;
  }
  entry.ringKey = boxKey(box);
  const k = lensK();
  entry.ring.style.opacity = '0.55';
  entry.ring.style.borderWidth = `${1 * k}px`;
  entry.ring.style.transform = `translate(${box.x}px, ${box.y}px)`;
  entry.ring.style.width = `${box.w}px`;
  entry.ring.style.height = `${box.h}px`;
  entry.badge.style.top = `${-17 * k}px`;
  entry.badge.style.fontSize = `${10 * k}px`;
  entry.badge.style.padding = `${1 * k}px ${5 * k}px`;
  entry.badge.textContent = attention.instance === null || attention.instance === undefined
    ? `${name} · ${attention.component}`
    : `${name} · ${attention.component}#${attention.instance}`;
}

/* ── the DOWN render (the shell's presence broadcast) ──────────────── */

function renderPresence(players) {
  if (!Array.isArray(players)) return;
  const live = new Set();
  for (const player of players) {
    if (player === null || typeof player !== 'object' || typeof player.playerId !== 'string') continue;
    live.add(player.playerId);
    const entry = ensureEntry(player);
    const cursor = player.cursor;
    if (cursor !== null && cursor !== undefined && typeof cursor.x === 'number' && typeof cursor.y === 'number' &&
        (cursor.surface === 'canvas' || (typeof cursor.surface === 'string' && cursor.surface.startsWith('frame:')))) {
      placeCursor(entry, cursor);
    } else {
      entry.cursor.style.opacity = '0'; // off-canvas or mouseless — parked, not destroyed
    }
    const attention = player.attention;
    if (attention !== null && attention !== undefined && attention.kind === 'canvas') {
      if (entry.attention === null || boxKeyOfAttention(entry.attention) !== boxKeyOfAttention(attention)) {
        placeRing(entry, player.name, attention);
      } else {
        entry.attention = attention; // same target — the align loop owns refinements
      }
    } else {
      entry.attention = null;
      entry.ringKey = null;
      entry.ring.style.opacity = '0';
    }
  }
  for (const playerId of [...roster.keys()]) {
    if (!live.has(playerId)) retireEntry(playerId);
  }
  ensureAlignLoop();
}

/** attention identity for the re-place gate: same target → no re-style */
function boxKeyOfAttention(attention) {
  return attention === null
    ? 'null'
    : `${attention.kind}:${attention.component}:${attention.instance}:${attention.frameId ?? ''}`;
}

/* ── the align loop (the picker's rAF law, ring half only) ─────────── */

let alignRaf = 0;

function hasAlignWork() {
  for (const entry of roster.values()) {
    if (entry.attention !== null) return true;
  }
  return false;
}

function ensureAlignLoop() {
  if (alignRaf !== 0 || !hasAlignWork()) return;
  alignRaf = requestAnimationFrame(alignStep);
}

function alignStep() {
  alignRaf = 0;
  for (const entry of roster.values()) {
    const attention = entry.attention;
    if (attention === null) continue;
    const box = resolveAttentionBox(attention);
    const key = boxKey(box);
    if (key !== entry.ringKey) {
      // the target moved (reflow, HMR churn, a vanished frame) — re-place
      if (box === null) {
        entry.ringKey = null;
        entry.ring.style.opacity = '0';
      } else {
        entry.ringKey = key;
        const k = lensK();
        entry.ring.style.opacity = '0.55';
        entry.ring.style.transform = `translate(${box.x}px, ${box.y}px)`;
        entry.ring.style.width = `${box.w}px`;
        entry.ring.style.height = `${box.h}px`;
      }
    }
  }
  if (hasAlignWork()) alignRaf = requestAnimationFrame(alignStep);
}

/* ── the UP report (this document's own cursor) ────────────────────── */

const LOCAL_CURSOR_THROTTLE_MS = 50;

export function initPresenceOverlay() {
  if (!IS_CANVAS_HOST) return; // frames and standalone documents stay untouched
  if (!styleInjected) {
    styleInjected = true;
    const style = document.createElement('style');
    style.textContent = REMOTE_INDICATOR_CSS;
    document.head.appendChild(style);
  }

  // the DOWN seams: the shell's presence broadcast + the picker's lens
  // broadcast (stroke/tag compensation — the same message, second ear)
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data === null || typeof data !== 'object') return;
    if (data.type === 'jx-design:presence') {
      renderPresence(data.players);
      return;
    }
    if (data.type === 'jx-design:lens') {
      if (typeof data.scale !== 'number' || !Number.isFinite(data.scale)) return;
      const next = Math.min(Math.max(data.scale, 0.05), 10);
      if (next === lensScale) return;
      lensScale = next;
      rechrome();
    }
  });

  // the UP report: pointermove → ~50ms trailing throttle → parent. In
  // canvas-document coordinates (clientX + scrollX): the receiving shell
  // forwards them as surface 'canvas' untouched — no lens math anywhere
  if (window.parent !== window) {
    let timer = 0;
    let pending = null;
    document.addEventListener(
      'pointermove',
      (event) => {
        pending = { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY };
        if (timer !== 0) return;
        timer = setTimeout(() => {
          timer = 0;
          const point = pending;
          pending = null;
          if (point !== null) {
            window.parent.postMessage({ type: 'jx-design:local-cursor', x: point.x, y: point.y }, window.location.origin);
          }
        }, LOCAL_CURSOR_THROTTLE_MS);
      },
      { capture: true, passive: true },
    );
  }
}

/** lens change: re-compensate every live element's chrome (sizes only —
 *  boxes are canvas-space and never rescale, the picker's law) */
function rechrome() {
  const k = lensK();
  for (const entry of roster.values()) {
    entry.dot.style.width = entry.dot.style.height = `${9 * k}px`;
    entry.dot.style.top = entry.dot.style.left = `${-4.5 * k}px`;
    entry.tag.style.top = `${-9 * k}px`;
    entry.tag.style.left = `${8 * k}px`;
    entry.tag.style.fontSize = `${10 * k}px`;
    entry.badge.style.top = `${-17 * k}px`;
    entry.badge.style.fontSize = `${10 * k}px`;
    entry.badge.style.padding = `${1 * k}px ${5 * k}px`;
    entry.ring.style.borderWidth = `${1 * k}px`;
    if (entry.attention !== null) ensureAlignLoop();
  }
}
