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
 *      rAF-coalesced (one report per frame; the shell's store
 *      throttles the wire at 16ms), reported to the studio parent as
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
 *          name tag (60ms linear glide — presence streams at the
 *          16ms gateway window cadence)
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
/** this canvas's own name (cursors are canvas-scoped — presence-visuals
 *  ruling 2: a cursor on another page is invisible here) */
const CANVAS_NAME = typeof location !== 'undefined'
  ? (/^\/prototypes\/([^/]+)\/?$/.exec(location.pathname)?.[1] ?? '')
  : '';

/* ── the shared indicator family (picker INDICATOR_CSS's grammar) ────── */

const REMOTE_INDICATOR_CSS = [
  // the shared-element glide law (#48, verbatim from the picker): the
  // element never leaves the layout; boxes ride the classic iOS curve
  // 240ms, opacity fades plain ease. The cursor subclass shortens the
  // box transition to 60ms linear — it tracks the 16ms-window
  // presence stream with a small margin.
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
  `[data-jx-remote$=":cursor"] .jx-remote-arrow {`,
  `  position: absolute;`,
  `  top: 0; left: 0;`,
  `  transform-origin: 0 0;`,
  `  display: block;`,
  `  line-height: 0;`,
  `  /* walkthrough R2 blend law: the arrow inverts what it covers, */`,
  `  /* canvas content stays visible; the tag never blends (readable) */`,
  `  mix-blend-mode: difference;`,
  `  pointer-events: none;`,
  `}`,
  `[data-jx-remote$=":cursor"] .jx-remote-arrow svg {`,
  `  display: block;`,
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
  `  color: #f5f1e8;`,
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
  // the pointer-shaped cursor (walkthrough R2): a real mouse arrow —
  // tip at (0,0) so the transform lands the TIP on the reported point;
  // the arrow layer blends (difference) so canvas content shows
  // through, the name tag does not (readability first)
  const arrow = document.createElement('span');
  arrow.className = 'jx-remote-arrow';
  arrow.innerHTML =
    `<svg viewBox="0 0 14 20" width="14" height="20" aria-hidden="true" focusable="false">` +
    `<path d="M1 1 L1 16.2 L4.7 12.8 L7.2 18.4 L9.3 17.5 L6.9 12.2 L12 12.1 Z" ` +
    `fill="hsl(${hue} 85% 45%)" stroke="rgba(13, 12, 11, 0.65)" stroke-width="1" stroke-linejoin="round"/></svg>`;
  const tag = document.createElement('span');
  tag.className = 'jx-remote-tag';
  // space+slash syntax — the legacy `h, s%, l% / a` mix is INVALID css
  // and Chrome silently dropped it (the walkthrough's unreadable ids)
  tag.style.background = `hsl(${hue} 85% 45% / 0.92)`;
  tag.textContent = player.name;
  cursor.appendChild(arrow);
  cursor.appendChild(tag);

  const ring = document.createElement('div');
  ring.setAttribute('data-jx-remote', `${player.playerId}:canvas-focus`);
  ring.setAttribute('aria-hidden', 'true');
  ring.style.borderColor = `hsl(${hue}, 70%, 55%)`;
  const badge = document.createElement('span');
  badge.className = 'jx-remote-badge';
  badge.style.background = `hsl(${hue} 70% 55% / 0.92)`;
  ring.appendChild(badge);

  document.documentElement.appendChild(cursor);
  document.documentElement.appendChild(ring);
  entry = { cursor, arrow, tag, ring, badge, attention: null, ringKey: null, parkedCursor: null, hasMouse: player.hasMouse === true };
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

/** frame-surface coordinates resolve through the owning kit iframe.
 *  The kit reports in ITS CSS pixels (pre-transform); the iframe's
 *  rect is POST-lens-transform canvas-doc pixels — the two spaces
 *  meet only through the measured scale k (rect.width / the kit
 *  document's viewport width). Returns {x, y, k}; null parks the
 *  cursor (the frame is gone). */
function surfaceOffset(surface) {
  if (typeof surface !== 'string' || !surface.startsWith('frame:')) return { x: 0, y: 0, k: 1 };
  const frameId = surface.slice('frame:'.length);
  const frame = document.querySelector(`iframe[name="${FRAME_NAME_PREFIX}${frameId}"]`);
  if (frame === null) return null; // frame gone — the cursor parks off-stage
  const rect = frame.getBoundingClientRect();
  let k = 1;
  const kitDoc = frame.contentDocument;
  if (kitDoc !== null) {
    const kitW = kitDoc.documentElement.clientWidth;
    if (kitW > 0 && rect.width > 0) k = rect.width / kitW;
  }
  return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, k };
}

function placeCursor(entry, cursor) {
  const offset = surfaceOffset(cursor.surface);
  if (offset === null) {
    entry.parkedCursor = cursor; // the kit iframe is not there YET — the align loop retries when it lands
    entry.cursor.style.opacity = '0';
    return;
  }
  entry.parkedCursor = null;
  const k = lensK();
  entry.cursor.style.transform = `translate(${offset.x + cursor.x * offset.k}px, ${offset.y + cursor.y * offset.k}px)`;
  entry.arrow.style.transform = `scale(${k})`; // tip rides (0,0) — the reported point
  entry.tag.style.top = `${-9 * k}px`;
  entry.tag.style.left = `${8 * k}px`;
  entry.tag.style.fontSize = `${10 * k}px`;
  // the virtual-mouse law: visibility flips, the element never rebuilds
  entry.cursor.style.opacity = entry.hasMouse ? '1' : '0';
}

/** the attention target's canvas-document box. The focus carries the
 *  protocol componentId (the native `id` attribute stamped into the
 *  source at ingest) — same-origin, adding the iframe offset. When the
 *  attention carries a frameId, the NAMED kit resolves FIRST (the same
 *  id lives in multiple kits — mobile/desktop variants — and a host-doc
 *  id collision must not steal a kit-addressed pick), then the host
 *  document, then every kit iframe. Unresolvable ids return null (the
 *  ring fades out — the badge keeps the id legible, never a
 *  wrong-element ring). */
export function resolveAttentionBox(attention) {
  if (attention === null || attention.kind !== 'canvas') return null;
  const idSelector = `[id="${CSS.escape(attention.component)}"]`;
  // the kit-addressed resolution (walkthrough R2): the same component id
  // exists in MULTIPLE kits (mobile/desktop variants of one file) — the
  // attention's frameId names the kit the pick happened in; resolve
  // THERE first (Codex r2w: ahead of the host document too — a host-doc
  // id collision must not steal a kit-addressed pick), then the host
  // document, then the DOM-order scan as the fallback
  const frames = [];
  if (typeof attention.frameId === 'string' && attention.frameId.length > 0) {
    const named = document.querySelector(`iframe[name="${FRAME_NAME_PREFIX}${attention.frameId}"]`);
    if (named !== null) frames.push(named);
  }
  for (const frame of frames) {
    const doc = frame.contentDocument;
    if (doc === null) continue; // cross-origin — not ours
    const el = doc.querySelector(idSelector);
    if (el === null) continue;
    const rect = frame.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    // kit CSS px → canvas-doc px through the measured lens scale (the
    // surfaceOffset law — pre/post-lens spaces meet only via k)
    const kitW = doc.documentElement.clientWidth;
    const k = kitW > 0 && rect.width > 0 ? rect.width / kitW : 1;
    return { x: rect.left + box.left * k + window.scrollX, y: rect.top + box.top * k + window.scrollY, w: box.width * k, h: box.height * k };
  }
  const own = document.querySelector(idSelector);
  if (own !== null) {
    const rect = own.getBoundingClientRect();
    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, w: rect.width, h: rect.height };
  }
  for (const frame of document.querySelectorAll('iframe')) {
    if (frames.includes(frame)) continue; // the named miss is not retried
    const doc = frame.contentDocument;
    if (doc === null) continue; // cross-origin — not ours
    const el = doc.querySelector(idSelector);
    if (el === null) continue;
    const rect = frame.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    // kit CSS px → canvas-doc px through the measured lens scale (the
    // surfaceOffset law — pre/post-lens spaces meet only via k)
    const kitW = doc.documentElement.clientWidth;
    const k = kitW > 0 && rect.width > 0 ? rect.width / kitW : 1;
    return { x: rect.left + box.left * k + window.scrollX, y: rect.top + box.top * k + window.scrollY, w: box.width * k, h: box.height * k };
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
        cursor.canvas === CANVAS_NAME && // another canvas's cursor is invisible here (ruling 2)
        (cursor.surface === 'canvas' || (typeof cursor.surface === 'string' && cursor.surface.startsWith('frame:')))) {
      placeCursor(entry, cursor);
    } else {
      entry.cursor.style.opacity = '0'; // other-canvas, mouseless — parked, not destroyed
      entry.parkedCursor = null; // not waiting on a kit — no retry intent
    }
    const attention = player.attention;
    if (attention !== null && attention !== undefined && attention.kind === 'canvas') {
      // the retry law (walkthrough R2): a placement that FAILED (the kit
      // iframe not loaded yet — placeRing left ringKey null) re-attempts
      // on every later frame; the idempotence skip only covers a ring
      // that actually rendered
      if (entry.attention === null || entry.ringKey === null || boxKeyOfAttention(entry.attention) !== boxKeyOfAttention(attention)) {
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
    if (entry.attention !== null || entry.parkedCursor !== null) return true;
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
    if (entry.parkedCursor !== null) placeCursor(entry, entry.parkedCursor); // the kit landed — retry the parked cursor
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
    if (data.type === 'jx-design:frame-cursor') {
      // a kit frame's own pointer (P2): forward it upstream as the local
      // cursor — the frame's document coords ride surface frame:<id>,
      // remote renderers add this iframe's offset (the report grammar)
      if (typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.frameId !== 'string' || data.frameId === '') return;
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'jx-design:local-cursor', canvas: CANVAS_NAME, surface: `frame:${data.frameId}`, x: data.x, y: data.y }, window.location.origin);
      }
      return;
    }
    if (data.type === 'jx-design:presence') {
      renderPresence(data.players);
      // the primary law (ruling 1): the local player's hue re-paints the
      // page's jixoai-ui primary — this canvas document AND every kit
      // frame document it hosts (same-origin; light/dark twins keep
      // their theme, only the primary hue rides)
      if (typeof data.brandHueOklch === 'number' && Number.isFinite(data.brandHueOklch)) {
        applyBrandHueTo(document, data.brandHueOklch);
        for (const frame of document.querySelectorAll('iframe')) {
          const doc = frame.contentDocument;
          if (doc !== null) applyBrandHueTo(doc, data.brandHueOklch);
        }
      }
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

  // the UP report: pointermove → rAF-coalesced (frame cadence, P7's
  // game-grade latency budget) → parent. In canvas-document coordinates
  // (clientX + scrollX): the receiving shell forwards them as surface
  // 'canvas' untouched — no lens math anywhere
  if (window.parent !== window) {
    let cursorRaf = 0;
    let pending = null;
    document.addEventListener(
      'pointermove',
      (event) => {
        pending = { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY };
        if (cursorRaf !== 0) return;
        cursorRaf = requestAnimationFrame(() => {
          cursorRaf = 0;
          const point = pending;
          pending = null;
          if (point !== null) {
            window.parent.postMessage({ type: 'jx-design:local-cursor', canvas: CANVAS_NAME, x: point.x, y: point.y }, window.location.origin);
          }
        });
      },
      { capture: true, passive: true },
    );
  }
}

/** set --brand-hue (oklch degrees) on a same-origin document root */
function applyBrandHueTo(doc, oklchHue) {
  const root = doc.documentElement; // null mid-teardown (about:blank lifecycle) — skip, the next broadcast repaints
  if (root === null) return;
  root.style.setProperty('--brand-hue', String(oklchHue));
}

/** lens change: re-compensate every live element's chrome (sizes only —
 *  boxes are canvas-space and never rescale, the picker's law) */
function rechrome() {
  const k = lensK();
  for (const entry of roster.values()) {
    entry.arrow.style.transform = `scale(${k})`;
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
