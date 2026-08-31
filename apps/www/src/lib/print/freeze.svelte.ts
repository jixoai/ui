/**
 * jixoai print freeze (lib/print/freeze.svelte.ts, print-pipeline,
 * 2026-08-30) — the prepareSnapshot TRANSACTION and its clone-only
 * transforms.
 *
 * The pipeline contract (design.md «管线全景», one transaction):
 *
 *   preparatory medium signal   sim = the caller's stamp; direct print
 *                              records createdStamp — an existing sim
 *                              stamp is REUSED, never owned; only the
 *                              screen state self-stamps
 *   plugin interventions       land on the live tree reactively
 *                              (density→sm, hue→pin — print plugin)
 *   scoped animation capture   source-root subtree ONLY via
 *                              getAnimations({subtree:true}); per item
 *                              {wasRunning, currentTime}; ONLY running
 *                              ones pause — pre-paused animations are
 *                              never touched nor resumed
 *   DOM-commit barrier         double-rAF + fail-loud assertions that
 *                              the source root carries the intervened
 *                              stamps (data-density="sm")
 *   readiness gate             fonts ready, lazy loading lifted,
 *                              images decoded — timeout budget with
 *                              progress and cancellation
 *   deep clone                 of the immutable source root
 *   clone-only transforms      CSS per-slot frame transfer (negative
 *                              animation-delay from the recorded
 *                              currentTime), pre→line spans, the ToC
 *                              page nav, ids preserved by cloning
 *   live animations resumed    idempotent restore token touching only
 *                              what THIS transaction paused
 *
 * WAAPI/JS animations are NOT transferable — the transaction
 * CONTINUES with a structured diagnostic (six codes: FINISHED,
 * ALTERNATE, UNMATCHED_SLOT, NO_NAME, WAAPI, JS), never rejecting.
 *
 * VERIFICATION SPLIT (r6 CLOSED item): the pure path/slot/math/
 * diagnostic functions are jsdom-testable (everything exported
 * below); the clone computed-phase assertions live ONLY in the real
 * Chromium verify-print probe (jsdom has no CSS animation timeline).
 */

import { PRINT_SIM_ATTR } from '../medium.svelte';

// ── diagnostics ────────────────────────────────────────────────────────────

export type DiagnosticCode =
  | 'FINISHED'
  | 'ALTERNATE'
  | 'UNMATCHED_SLOT'
  | 'NO_NAME'
  | 'WAAPI'
  | 'JS';

export interface PrintDiagnostic {
  readonly code: DiagnosticCode;
  /** which element/animation owns the row (sim renders it; direct
   *  print records it into the artifact metadata + console) */
  readonly owner: string;
  readonly message: string;
}

// ── CSS per-slot frame transfer (pure math, design.md §CSS 帧转移) ─────────

/**
 * The design's exact per-slot write rule:
 *
 *   delay′ = (c < d) ? (d − c) : −((c − d) mod D)
 *
 * c = Animation.currentTime (ms, includes the delay segment);
 * d = the slot's computed animation-delay (ms); D = the slot's
 * computed animation-duration (ms). Pre-delay → the REMAINING delay;
 * running segment → a negative phase so t=0 already sits at the
 * source's phase.
 */
export function transferDelay(c: number, d: number, D: number): number {
  if (c < d) return d - c;
  if (D <= 0) return 0; // degenerate duration — guarded by callers via FINISHED
  return -((c - d) % D);
}

/** parse a computed CSS time list ("0s, -1.5s" / "100ms") into ms numbers */
export function parseTimeList(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0)
    .map((piece) => {
      const m = /^(-?[\d.]+)ms$/i.exec(piece) ?? /^(-?[\d.]+)s$/i.exec(piece);
      if (!m) return 0;
      const n = Number(m[1]);
      return piece.toLowerCase().endsWith('ms') ? n : n * 1000;
    });
}

/** parse a computed animation-iteration-count list ("infinite, 3") */
export function parseIterationList(value: string | null | undefined): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0)
    .map((piece) => (/^infinite$/i.test(piece) ? Infinity : Number(piece) || 0));
}

/** the slot key's ordinal half: which occurrence of `name` in the list */
export function slotIndexOf(names: readonly string[], name: string, occurrence: number): number {
  let seen = -1;
  for (let i = 0; i < names.length; i++) {
    if (names[i] === name) {
      seen++;
      if (seen === occurrence) return i;
    }
  }
  return -1;
}

/** element ordinal path (child index per depth, from the source root) */
export function elementPath(root: Element, el: Element): number[] {
  const path: number[] = [];
  let node: Element = el;
  while (node !== root && node.parentElement !== null) {
    const parent = node.parentElement;
    let index = 0;
    let sibling: Element | null = node.previousElementSibling;
    while (sibling) {
      index++;
      sibling = sibling.previousElementSibling;
    }
    path.unshift(index);
    node = parent;
  }
  return node === root ? path : []; // outside the root → unusable
}

/** resolve an ordinal path inside the clone (clone preserves order) */
export function resolvePath(root: Element, path: readonly number[]): Element | null {
  let node: Element = root;
  for (const index of path) {
    const child = node.children[index];
    if (child === undefined) return null;
    node = child;
  }
  return node;
}

/** the slot-level verdict (pure): a delay′ or one of the six codes */
export function classifySlot(input: {
  c: number;
  d: number;
  D: number;
  N: number;
  direction: string;
}): { delayPrime: number | null; diagnostic: DiagnosticCode | null; message?: string } {
  const { c, d, D, N, direction } = input;
  if (/alternate/i.test(direction)) {
    return {
      delayPrime: null,
      diagnostic: 'ALTERNATE',
      message: 'direction alternates — the phase formula does not model direction flips',
    };
  }
  if (Number.isFinite(N) && c >= d + D * N) {
    return {
      delayPrime: null,
      diagnostic: 'FINISHED',
      message: `currentTime ${c}ms ≥ end ${d + D * N}ms — the slot rests at its end state`,
    };
  }
  if (D <= 0) {
    return {
      delayPrime: null,
      diagnostic: 'FINISHED',
      message: 'zero computed duration',
    };
  }
  return { delayPrime: transferDelay(c, d, D), diagnostic: null };
}

// ── animation capture (scoped protocol) ────────────────────────────────────

export type AnimationKind = 'css-animation' | 'css-transition' | 'waapi' | 'js';

export interface CapturedAnimation {
  readonly anim: Animation;
  readonly kind: AnimationKind;
  /** playState was running/pending at capture — only these pause */
  readonly wasRunning: boolean;
  /** the frozen time (ms) recorded BEFORE pausing */
  readonly currentTime: number;
  /** css-animation: the @keyframes name */
  readonly animationName?: string;
  /** css-transition: the transitioned property */
  readonly transitionProperty?: string;
  /** css-transition: the target element (for the computed freeze) */
  readonly transitionTarget?: Element;
}

function classifyAnimation(anim: Animation): AnimationKind {
  const w = window as unknown as {
    CSSAnimation?: new () => Animation;
    CSSTransition?: new () => Animation;
    Animation?: new () => Animation;
  };
  if (w.CSSAnimation && anim instanceof w.CSSAnimation) return 'css-animation';
  if (w.CSSTransition && anim instanceof w.CSSTransition) return 'css-transition';
  if (w.Animation && anim instanceof w.Animation) {
    // a KeyframeEffect-backed Animation = element.animate() (WAAPI);
    // anything else (custom tick, no effect target) = script-driven
    const effect = anim.effect as { target?: Element | null } | null;
    return effect && effect.target ? 'waapi' : 'js';
  }
  return 'js';
}

/**
 * Enumerate the source-root subtree ONLY (root.getAnimations({subtree:
 * true})), record {wasRunning, currentTime} per item, and pause the
 * running ones. Pre-paused animations are recorded but never touched.
 * Feature-detected: environments without the Web Animations API (jsdom
 * without a patch) capture nothing.
 */
export function captureAnimations(root: HTMLElement): CapturedAnimation[] {
  if (typeof root.getAnimations !== 'function') return [];
  const out: CapturedAnimation[] = [];
  for (const anim of root.getAnimations({ subtree: true })) {
    const kind = classifyAnimation(anim);
    const wasRunning = anim.playState === 'running' || anim.playState === 'pending';
    const record: CapturedAnimation = {
      anim,
      kind,
      wasRunning,
      currentTime: anim.currentTime ?? 0,
    };
    if (kind === 'css-animation') {
      const name = (anim as Animation & { animationName?: string }).animationName;
      record.animationName = typeof name === 'string' ? name : undefined;
    } else if (kind === 'css-transition') {
      const property = (anim as Animation & { transitionProperty?: string }).transitionProperty;
      const effect = anim.effect as { target?: Element | null } | null;
      record.transitionProperty = typeof property === 'string' ? property : undefined;
      record.transitionTarget = effect?.target ?? undefined;
    }
    if (wasRunning) {
      try {
        anim.pause();
      } catch {
        /* an animation that refuses pausing keeps its diagnostic-free path */
      }
    }
    out.push(record);
  }
  return out;
}

/** the idempotent restore token — resumes ONLY what this transaction paused */
export function makeRestoreToken(records: readonly CapturedAnimation[]): {
  restore(): void;
} {
  let done = false;
  return {
    restore() {
      if (done) return;
      done = true;
      for (const record of records) {
        if (!record.wasRunning) continue;
        try {
          record.anim.play();
        } catch {
          /* already finished/removed — nothing to resume */
        }
      }
    },
  };
}

// ── the transfer plan (pure, jsdom-testable) ───────────────────────────────

export interface ComputedAnimationInfo {
  /** computed animation-name list (["none"] when absent) */
  names: string[];
  /** computed animation-delay list, ms */
  delays: number[];
  /** computed animation-duration list, ms */
  durations: number[];
  /** computed animation-iteration-count list (Infinity for infinite) */
  iterations: number[];
  /** computed animation-direction list */
  directions: string[];
  /** computed transition-property (single string, for freezes) */
  transitionProperty?: string;
  /** computed value of one property (transition freezes) */
  valueOf?(property: string): string | null;
}

export interface SlotWrite {
  readonly path: readonly number[];
  readonly slot: number;
  readonly animationName: string;
  readonly c: number;
  readonly d: number;
  readonly D: number;
  readonly N: number;
  readonly delayPrime: number | null;
  readonly diagnostic: DiagnosticCode | null;
}

export interface ElementWrite {
  readonly path: readonly number[];
  /** per-slot values: a number = delay′ (ms); a string = the original
   *  computed delay carried over for an untransferred slot */
  readonly delays: (number | string)[];
  readonly sourceClass: string | null;
  readonly sourceTag: string;
  readonly transitionProperty: string | null;
  readonly transitionValue: string | null;
  readonly slots: readonly SlotWrite[];
}

export interface FrameTransferPlan {
  readonly writes: ElementWrite[];
  readonly diagnostics: PrintDiagnostic[];
}

const describeElement = (el: Element): string => {
  const id = el.id ? `#${el.id}` : '';
  const cls = el.classList.length ? `.${[...el.classList].slice(0, 3).join('.')}` : '';
  return `<${el.tagName.toLowerCase()}${id}${cls}>`;
};

/**
 * Build the per-slot write plan from the capture records. Pure: the
 * computed-style reads arrive via `readComputed` (the default reads
 * the LIVE source element — attached, so computed styles are real;
 * tests inject fakes).
 */
export function planFrameTransfer(
  root: HTMLElement,
  records: readonly CapturedAnimation[],
  readComputed: (el: Element) => ComputedAnimationInfo,
): FrameTransferPlan {
  interface Pending {
    el: Element;
    path: number[];
    sourceClass: string | null;
    slots: SlotWrite[];
    hasTransition: boolean;
  }
  const byElement = new Map<Element, Pending>();
  const diagnostics: PrintDiagnostic[] = [];

  const pendingFor = (el: Element): Pending | undefined => {
    const path = elementPath(root, el);
    if (path.length === 0 && el !== root) {
      diagnostics.push({
        code: 'UNMATCHED_SLOT',
        owner: describeElement(el),
        message: 'the animated element sits outside the source root — no ordinal path',
      });
      return undefined;
    }
    let pending = byElement.get(el);
    if (!pending) {
      pending = {
        el,
        path,
        sourceClass: el.getAttribute('class'),
        slots: [],
        hasTransition: false,
      };
      byElement.set(el, pending);
    }
    return pending;
  };

  // occurrence counting per element+name (the slot key's third axis)
  const occurrences = new Map<Element, Map<string, number>>();

  for (const record of records) {
    const effect = record.anim.effect as { target?: Element | null } | null;
    const target = effect?.target ?? record.transitionTarget ?? undefined;

    if (record.kind === 'waapi' || record.kind === 'js') {
      diagnostics.push({
        code: record.kind === 'waapi' ? 'WAAPI' : 'JS',
        owner: target ? describeElement(target) : '<detached animation>',
        message:
          record.kind === 'waapi'
            ? `WAAPI animation ${JSON.stringify(record.animationName ?? '')} is not transferable — the owner continues; the clone shows its CSS-authored state`
            : 'script-driven animation is not transferable — the owner continues',
      });
      continue;
    }

    if (record.kind === 'css-transition') {
      const pending = target ? pendingFor(target) : undefined;
      if (pending) pending.hasTransition = true;
      continue;
    }

    // css-animation: per-slot math
    if (!target) {
      diagnostics.push({
        code: 'JS',
        owner: '<detached css animation>',
        message: 'a CSS animation without a live target could not be planned',
      });
      continue;
    }
    const info = readComputed(target);
    const name = record.animationName ?? '';
    if (info.names.length === 0 || info.names.every((n) => n === 'none') || !name) {
      diagnostics.push({
        code: 'NO_NAME',
        owner: describeElement(target),
        message: 'computed animation-name is none — no slot to transfer onto',
      });
      continue;
    }
    const perElement = occurrences.get(target) ?? new Map<string, number>();
    const occurrence = perElement.get(name) ?? 0;
    perElement.set(name, occurrence + 1);
    occurrences.set(target, perElement);

    const slot = slotIndexOf(info.names, name, occurrence);
    if (slot < 0) {
      diagnostics.push({
        code: 'UNMATCHED_SLOT',
        owner: describeElement(target),
        message: `animation ${name} (occurrence ${occurrence}) not present in the computed name list [${info.names.join(', ')}]`,
      });
      continue;
    }
    const d = info.delays[slot] ?? 0;
    const D = info.durations[slot] ?? 0;
    const N = info.iterations[slot] ?? 1;
    const direction = info.directions[slot] ?? 'normal';
    const verdict = classifySlot({ c: record.currentTime, d, D, N, direction });
    const slotWrite: SlotWrite = {
      path: elementPath(root, target),
      slot,
      animationName: name,
      c: record.currentTime,
      d,
      D,
      N,
      delayPrime: verdict.delayPrime,
      diagnostic: verdict.diagnostic,
    };
    if (verdict.diagnostic) {
      diagnostics.push({
        code: verdict.diagnostic,
        owner: describeElement(target),
        message: `${name} slot ${slot}: ${verdict.message ?? ''}`,
      });
    }
    const pending = pendingFor(target);
    if (pending) pending.slots.push(slotWrite);
  }

  // compose the per-element writes
  const writes: ElementWrite[] = [];
  for (const pending of byElement.values()) {
    const info = readComputed(pending.el);
    const delays: (number | string)[] = [];
    for (let i = 0; i < info.names.length; i++) delays.push(`${info.delays[i] ?? 0}ms`);
    for (const slot of pending.slots) {
      if (slot.delayPrime !== null) delays[slot.slot] = slot.delayPrime;
    }
    writes.push({
      path: pending.path,
      delays,
      sourceClass: pending.sourceClass,
      sourceTag: pending.el.tagName,
      transitionProperty: pending.hasTransition ? (info.transitionProperty ?? null) : null,
      transitionValue: pending.hasTransition
        ? (info.valueOf?.(info.transitionProperty ?? '') ?? null)
        : null,
      slots: pending.slots,
    });
  }
  return { writes, diagnostics };
}

/**
 * Apply the plan to the CLONE (clone-only law): inline
 * animation-delay lists + animation-play-state: paused on the matched
 * elements, `transition: none` (+ the frozen computed value when
 * enumerable) on transition elements. Path resolution failures and
 * class/tag drift become UNMATCHED_SLOT diagnostics — continue, never
 * reject.
 */
export function applyFrameTransfer(clone: HTMLElement, plan: FrameTransferPlan): {
  applied: number;
  diagnostics: PrintDiagnostic[];
} {
  const diagnostics: PrintDiagnostic[] = [];
  let applied = 0;
  for (const write of plan.writes) {
    const el = resolvePath(clone, write.path);
    if (!el || el.tagName !== write.sourceTag || el.getAttribute('class') !== write.sourceClass) {
      diagnostics.push({
        code: 'UNMATCHED_SLOT',
        owner: `<${write.sourceTag.toLowerCase()} path=${write.path.join('/')}>`,
        message: 'the clone slot list does not match the source element (path/tag/class drift)',
      });
      continue;
    }
    const style = (el as HTMLElement).style;
    if (write.slots.length > 0) {
      style.animationDelay = write.delays.map((v) => (typeof v === 'number' ? `${v}ms` : v)).join(', ');
      style.animationPlayState = 'paused';
      applied++;
    }
    if (write.transitionProperty !== null) {
      style.transition = 'none';
      const property = write.transitionProperty;
      if (property && property !== 'all' && !property.includes(',') && write.transitionValue !== null) {
        style.setProperty(property, write.transitionValue);
      }
      applied++;
    }
  }
  return { applied, diagnostics };
}

// ── clone transforms: pre lines + the ToC page nav ─────────────────────────

/**
 * pre→line spans ON THE CLONE (the retired code-block family's
 * semantics, migrated to a clone transform): plain-text pres split
 * into block line spans (wrap anchors for print); marked-up pres
 * (Shiki) keep their own `.line` wrappers, adopted into the gutter
 * class. Empty lines keep their height. `lineNumbers=false` stamps
 * the opt-out the kernel stylesheet keys the gutter off.
 */
export function splitPreLines(clone: ParentNode, options: { lineNumbers: boolean }): number {
  let split = 0;
  for (const pre of [...clone.querySelectorAll('pre')]) {
    const code = pre.querySelector('code') ?? pre;
    const markedUp = [...code.childNodes].some((n) => n.nodeType === Node.ELEMENT_NODE);
    if (!options.lineNumbers) pre.setAttribute('data-jx-print-lines', 'off');
    if (markedUp) {
      if (options.lineNumbers) {
        for (const line of code.querySelectorAll(':scope > span.line')) {
          line.classList.add('jx-print-line');
        }
      }
      continue;
    }
    const text = code.textContent ?? '';
    const fragment = document.createDocumentFragment();
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      const span = document.createElement('span');
      span.className = 'jx-print-line';
      span.dataset.line = String(i + 1);
      span.textContent = line === '' ? ' ' : line;
      fragment.appendChild(span);
    });
    code.textContent = '';
    code.appendChild(fragment);
    split++;
  }
  return split;
}

/**
 * The ToC page, injected into the clone: a nav whose entries follow
 * the site's OWN heading structure — every h2, addressed by its own
 * id or the nearest id-bearing ancestor (the section wrappers the
 * site's web toc already scrolls to — no parallel registry). Page
 * numbers resolve through the kernel's target-counter rules (real
 * kernel-computed numbers — no parallel web component survives).
 */
export function injectTocNav(
  clone: HTMLElement,
  options: { label?: string } = {},
): HTMLElement | null {
  const entries: { id: string; label: string }[] = [];
  const seen = new Set<string>();
  for (const head of [...clone.querySelectorAll('h2')]) {
    const id = head.id || head.closest('[id]')?.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    entries.push({ id, label: head.textContent?.trim() ?? '' });
  }
  if (entries.length === 0) return null;
  const nav = document.createElement('nav');
  nav.setAttribute('data-jx-print-toc', '');
  nav.setAttribute('role', 'doc-toc');
  const eyebrow = document.createElement('p');
  eyebrow.setAttribute('data-jx-print-toc-eyebrow', '');
  eyebrow.textContent = options.label ?? 'contents';
  const list = document.createElement('ul');
  list.setAttribute('data-jx-print-toc-list', '');
  for (const entry of entries) {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = `#${entry.id}`;
    anchor.textContent = entry.label;
    item.appendChild(anchor);
    list.appendChild(item);
  }
  nav.append(eyebrow, list);
  if (clone.firstChild) clone.insertBefore(nav, clone.firstChild);
  else clone.appendChild(nav);
  return nav;
}

// ── hashing (the same-artifact semantics) ──────────────────────────────────

/** FNV-1a 32-bit — stable, dependency-free */
export function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** the frozen-snapshot hash: the transformed clone + the transform config */
export function hashSnapshot(clone: HTMLElement, configSignature: string): string {
  return hashString(`${configSignature}\u0000${clone.outerHTML}`);
}

// ── the transaction ────────────────────────────────────────────────────────

export interface PrintProgress {
  readonly phase: 'interventions' | 'fonts' | 'images' | 'clone';
  readonly done: number;
  readonly total: number;
}

export interface PrepareOptions {
  /** 'sim' = the caller's stamp is already on; 'print' = this
   *  transaction self-stamps when (and only when) the medium is screen */
  purpose: 'sim' | 'print';
  /** the print gutter config bit (default on) */
  lineNumbers?: boolean;
  /** inject the ToC page nav (default on) */
  toc?: boolean;
  /** the ToC eyebrow label */
  tocLabel?: string;
  /** readiness budget (default 8000ms) */
  timeoutMs?: number;
  onProgress?: (progress: PrintProgress) => void;
  /** cancellation for the PREPARATION phase (before preview) */
  signal?: AbortSignal;
  /** override computed-style reads (tests) */
  readComputed?: (el: Element) => ComputedAnimationInfo;
  /** assert the density stamp on the barrier (default true — pages
   *  hosting the layer without a density consumer pass false) */
  assertDensity?: boolean;
}

export interface FrozenSnapshot {
  readonly purpose: 'sim' | 'print';
  readonly clone: HTMLElement;
  readonly diagnostics: PrintDiagnostic[];
  readonly transfer: {
    readonly writes: readonly ElementWrite[];
    readonly applied: number;
  };
  readonly lineSplits: number;
  readonly tocEntries: number;
  readonly createdStamp: boolean;
  readonly hash: string;
  /** idempotent — resumes only what this transaction paused */
  restore(): void;
  /** remove ONLY a stamp this transaction created (afterprint law) */
  releaseStamp(): void;
}

const doubleRaf = async (): Promise<void> => {
  const raf =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb: () => void) => setTimeout(cb, 0);
  await new Promise<void>((resolve) => raf(() => raf(() => resolve())));
};

class PrepareAborted extends Error {
  constructor(reason: string) {
    super(`[print/freeze] prepareSnapshot aborted: ${reason}`);
    this.name = 'PrepareAborted';
  }
}

async function withBudget<T>(
  run: Promise<T>,
  label: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      run,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`[print/freeze] readiness timeout after ${timeoutMs}ms waiting for ${label}`)),
          timeoutMs,
        );
      }),
      new Promise<never>((_, reject) => {
        if (signal?.aborted) reject(new PrepareAborted('signal already aborted'));
        else signal?.addEventListener('abort', () => reject(new PrepareAborted('cancel')), { once: true });
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * The readiness gate: lift lazy loading FIRST (clone-side images never
 * load), then fonts, then every image complete+decoded — inside the
 * timeout budget, with progress and cancellation.
 */
async function readinessGate(
  root: HTMLElement,
  options: { timeoutMs?: number; onProgress?: (p: PrintProgress) => void; signal?: AbortSignal },
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const report = options.onProgress ?? (() => {});

  // 1. lazy lift — attributes only, live behavior is a scroll away
  const images = [...root.querySelectorAll('img')];
  for (const img of images) {
    if (img.getAttribute('loading') === 'lazy') img.setAttribute('loading', 'eager');
    img.setAttribute('decoding', 'sync');
  }

  // 2. fonts (pagedjs's own loadFonts waits for the document; we front-run it)
  report({ phase: 'fonts', done: 0, total: 1 });
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  await withBudget(fonts?.ready ?? Promise.resolve(), 'document.fonts.ready', timeoutMs, options.signal);
  report({ phase: 'fonts', done: 1, total: 1 });

  // 3. images complete + decoded
  let done = 0;
  await Promise.all(
    images.map((img) =>
      withBudget(
        (async () => {
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            });
          }
          if (typeof img.decode === 'function' && img.naturalWidth > 0) {
            await img.decode().catch(() => {});
          }
          done++;
          report({ phase: 'images', done, total: images.length });
        })(),
        `image ${img.getAttribute('src') ?? '<inline>'}`,
        timeoutMs,
        options.signal,
      ),
    ),
  );
}

const readComputedDefault = (el: Element): ComputedAnimationInfo => {
  const cs = getComputedStyle(el);
  const names = cs.animationName === '' ? [] : cs.animationName.split(',').map((s) => s.trim());
  return {
    names,
    delays: parseTimeList(cs.animationDelay),
    durations: parseTimeList(cs.animationDuration),
    iterations: parseIterationList(cs.animationIterationCount),
    directions: cs.animationDirection === '' ? [] : cs.animationDirection.split(',').map((s) => s.trim()),
    transitionProperty: cs.transitionProperty,
    valueOf: (property) => (property ? (cs as unknown as Record<string, string>)[property] ?? null : null),
  };
};

/**
 * prepareSnapshot — the whole transaction. Fail-loud on the barrier
 * and the readiness budget; CONTINUES through untransferable
 * animations with structured diagnostics.
 */
export async function prepareSnapshot(
  root: HTMLElement,
  options: PrepareOptions,
): Promise<FrozenSnapshot> {
  const lineNumbers = options.lineNumbers ?? true;
  const toc = options.toc ?? true;
  const report = options.onProgress ?? (() => {});

  // ── 0. stamp transaction ownership ─────────────────────────────────
  // 'print' self-stamps ONLY from screen; an existing sim stamp is
  // reused without ownership. 'sim' never stamps (the toggle owns it).
  let createdStamp = false;
  if (options.purpose === 'print' && !root.hasAttribute(PRINT_SIM_ATTR)) {
    root.setAttribute(PRINT_SIM_ATTR, '');
    createdStamp = true;
  }
  const releaseStamp = (): void => {
    if (!createdStamp) return;
    createdStamp = false;
    root.removeAttribute(PRINT_SIM_ATTR);
  };

  // ── 1. scoped animation capture (before the try: the failure path
  //    must still resume what it paused) ─────────────────────────────
  const records = captureAnimations(root);
  const restoreToken = makeRestoreToken(records);

  try {
    // ── 2. the DOM-commit barrier ───────────────────────────────────
    report({ phase: 'interventions', done: 0, total: 1 });
    await doubleRaf();
    if (options.signal?.aborted) throw new PrepareAborted('cancel');
    if (options.assertDensity !== false) {
      const density = root.getAttribute('data-density');
      if (density !== 'sm') {
        throw new Error(
          `[print/freeze] DOM-commit barrier: source root data-density=${JSON.stringify(density)}, expected "sm" — the plugin intervention has not committed; refusing to clone a half-intervened tree`,
        );
      }
    }

    // ── 3. readiness gate ───────────────────────────────────────────
    await readinessGate(root, options);

    // ── 4. the deep clone ───────────────────────────────────────────
    report({ phase: 'clone', done: 0, total: 1 });
    if (options.signal?.aborted) throw new PrepareAborted('cancel');
    const clone = root.cloneNode(true) as HTMLElement;
    // the clone is the PRODUCT, not the preview state: the sim stamp
    // and the source marker never ride into the paged output
    clone.removeAttribute(PRINT_SIM_ATTR);
    clone.removeAttribute('data-print-source');

    // ── 5. clone-only transforms ────────────────────────────────────
    const plan = planFrameTransfer(root, records, options.readComputed ?? readComputedDefault);
    const applied = applyFrameTransfer(clone, plan);
    const diagnostics = [...plan.diagnostics, ...applied.diagnostics];
    const lineSplits = splitPreLines(clone, { lineNumbers });
    const tocNav = toc ? injectTocNav(clone, { label: options.tocLabel }) : null;

    // ── 6. live animations resume (the source tree is no longer needed)
    restoreToken.restore();
    report({ phase: 'clone', done: 1, total: 1 });

    const configSignature = JSON.stringify([lineNumbers, toc, options.tocLabel ?? 'contents']);
    return {
      purpose: options.purpose,
      clone,
      diagnostics,
      transfer: { writes: plan.writes, applied: applied.applied },
      lineSplits,
      tocEntries: tocNav ? tocNav.querySelectorAll('a').length : 0,
      createdStamp,
      hash: hashSnapshot(clone, configSignature),
      restore: () => restoreToken.restore(),
      releaseStamp,
    };
  } catch (error) {
    // a failed transaction still releases what it stamped and resumes
    // what it paused — no half-frozen tree survives a failure
    restoreToken.restore();
    releaseStamp();
    throw error;
  }
}
