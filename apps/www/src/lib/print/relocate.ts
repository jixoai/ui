/**
 * jixoai print keep enforcement (lib/print/relocate.ts, print-pipeline,
 * 2026-09-03) — the finished-layout relocation pass, extracted from
 * pipeline.svelte.ts and generalized for heading strands (Owner
 * request, 2026-09-03: "a Section's H* often ends a page while its
 * content opens the next — the secondary layout should move it").
 *
 * The pass walks pagedjs's FINISHED pages and mends two strand
 * shapes the kernel's declared keep chain cannot hold on its own
 * (pagedjs consumes break-after: avoid, but its backwalk is
 * sibling-blind to a break that starts deep inside the next block):
 *
 *   strand   an uncut avoid carrier (heading, a section card's
 *            header block, a code card's head strip) ending a page
 *            while its host continues later. Relocated into the
 *            NEAREST split-continuation ancestor half A′ — the
 *            carrier's own parent when it split (the classic mend,
 *            `A′.prepend`), else the deepest ancestor that did
 *            (the ended-whole shape: the carrier's wrapper ended
 *            whole, so it has no continuation of its own; it rides
 *            into A′ immediately before A′'s first visible child —
 *            the carrier's document-order successor).
 *
 *   rejoin   an avoid carrier that pagedjs CUT at the page bottom
 *            (data-split-to: the eyebrow line, or eyebrow+title,
 *            shipped while the rest of the header moved on). The
 *            halves share a data-ref; moving the cut half's
 *            CHILDREN into the pair's head reunites the block with
 *            no tear — the block reassembles whole on the pair's
 *            page. (The cut law still forbids relocating a cut half
 *            ELSEWHERE; rejoin is the one legal cut move.)
 *
 * Bounded by the two laws the spec carries (r5 + codex r6):
 *   CUT-AWARENESS — a cut marker strictly BELOW an uncut carrier is
 *   defensive only (pagedjs marks whole ancestor chains, so it
 *   cannot fire for a clean carrier); acting there would tear the
 *   card, so the pass breaks the round.
 *   SATISFIABILITY — LEAF-measured room on the target page must
 *   host the move (rebuilt wrappers inherit the area's full height;
 *   an any-element scan reads zero room forever). An unsatisfiable
 *   keep is pagedjs's least-bad break and ships as the cut.
 *
 * A relocation re-examines its page: the move exposes a new bottom
 * edge that may itself strand (round bound 5 = the safety net, not
 * the terminator). Moves only ever ADD height to later pages, so a
 * later page can only overflow (never strand) — fit prevents that.
 *
 * resyncStringSets: the moves above can change which h1/h2 a page's
 * running head names (pagedjs resolved string-set into per-page CSS
 * variables during layout — string-sets.js writes
 * --pagedjs-string-{first,last,start,first-except}-{name} onto each
 * .pagedjs_page). Recomputed here from the FINAL DOM with pagedjs's
 * own semantics, so a page never carries the title of a section that
 * now opens on the next page. Moves also orphan split markers —
 * healOrphanedSplits quiets the dead seams before the kernel's dash
 * normalization re-derives its layers.
 *
 * stampSplitDashes: the continuation dash is a BLOCK judgment
 * (2026-09-03, corrected same day: the criterion is the border the
 * PRINT PREVIEW carries) — only a page cut through a print-boxed
 * block (a code card with its head/foot strips, the boxed section
 * opt-out) draws it; plain flow and the borderless default section
 * card draw nothing (the break itself is the signal). The
 * outer-layer border suppression (data-jx-split-outer) stays from
 * the vision-r3/r4 law, and one dash per cut edge holds (nested cut
 * blocks collapse to the innermost).
 *
 * VERIFICATION SPLIT: measurement is INJECTED (KeepMeasure) — the
 * DOM-walk logic is jsdom-testable with synthetic rects; the
 * geometry truths stay in the real-Chromium verify-print probe.
 */

/** the injected geometry — jsdom fixtures supply synthetic values */
export interface KeepMeasure {
  height(el: HTMLElement): number;
  bottom(el: HTMLElement): number;
  top(el: HTMLElement): number;
}

export interface RelocateOutcome {
  /** uncut carriers relocated into their continuation */
  relocated: number;
  /** cut avoid blocks reunited with their split pair */
  rejoined: number;
}

const domMeasure: KeepMeasure = {
  height: (el) => el.getBoundingClientRect().height,
  bottom: (el) => el.getBoundingClientRect().bottom,
  top: (el) => el.getBoundingClientRect().top,
};

/** the page's bottom-most visible LEAF (containers own the bottom
 * edge through padding — the stranded carrier hides INSIDE the
 * outermost container; wrappers that pagedjs rebuilt inherit the
 * area's full height and must not read as content) */
const deepestLeaf = (
  content: HTMLElement,
  m: KeepMeasure,
): { el: HTMLElement; bottom: number } | undefined => {
  let deepest: HTMLElement | undefined;
  let deepestBottom = -Infinity;
  for (const el of [...content.querySelectorAll<HTMLElement>('*')]) {
    if (m.height(el) <= 1) continue;
    let leaf = true;
    for (const child of [...el.children] as HTMLElement[]) {
      if (m.height(child) > 1) {
        leaf = false;
        break;
      }
    }
    if (leaf && m.bottom(el) > deepestBottom) {
      deepestBottom = m.bottom(el);
      deepest = el;
    }
  }
  return deepest === undefined ? undefined : { el: deepest, bottom: deepestBottom };
};

/** LEAF-measured rendered bottom of a page area (fit denominator) */
const leafBottomOf = (content: HTMLElement, m: KeepMeasure): number =>
  deepestLeaf(content, m)?.bottom ?? -Infinity;

const isVisible = (el: HTMLElement, m: KeepMeasure): boolean => {
  if (m.height(el) > 1) return true;
  for (const desc of [el, ...el.querySelectorAll<HTMLElement>('*')]) {
    if (m.height(desc) > 1) return true;
  }
  return false;
};

/** CSS.escape when the environment carries it (the pipeline's own
 * guard — jsdom fixtures run without the CSS namespace; production
 * refs are uuid-shaped regardless) */
const escapeRef = (value: string): string =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value;

/** the continuation half ([data-ref=X][data-split-from]) on a page
 * AFTER index i — split halves always sit on consecutive pages, but
 * the search stays general */
const continuationOn = (
  pages: HTMLElement[],
  i: number,
  ref: string,
): HTMLElement | undefined =>
  pages
    .slice(i + 1)
    .map((p) => p.querySelector<HTMLElement>(`[data-ref="${escapeRef(ref)}"][data-split-from]`))
    .find((el): el is HTMLElement => el !== null);

/** after a move, a wrapper left with no content at all is a dead
 * strip (its split dash would cut at nothing; an emptied section
 * half still paints the hairline) — unwind empties up to the area */
const pruneEmptiedWrappers = (start: HTMLElement, content: HTMLElement): void => {
  let node: HTMLElement | null = start;
  while (
    node !== null &&
    node !== content &&
    !node.classList.contains('pagedjs_page_content') &&
    node.children.length === 0 &&
    !node.textContent?.trim()
  ) {
    const up: HTMLElement | null = node.parentElement;
    node.remove();
    node = up;
  }
};

/** a move that empties+prunes a start-half orphans the OTHER half's
 * split marker — a continuation whose predecessor left the document
 * still draws the "continued" dash at a seam that no longer exists
 * (a reunited header would carry a hairline straight through its
 * middle). A marker heals when no same-ref split-to half exists on
 * an earlier page; same-page seams (nested halves rejoined into one
 * block) heal too — the rejoin's whole point is the block reading
 * whole. Quiet order: each page's froms before its tos, so a
 * same-page predecessor never vouches for its own seam */
export function healOrphanedSplits(outputRoot: HTMLElement): void {
  const seen = new Set<string>();
  for (const page of outputRoot.querySelectorAll<HTMLElement>('.pagedjs_page')) {
    for (const from of [...page.querySelectorAll<HTMLElement>('[data-split-from]')]) {
      const ref = from.getAttribute('data-ref');
      if (ref !== null && !seen.has(ref)) from.removeAttribute('data-split-from');
    }
    for (const to of [...page.querySelectorAll<HTMLElement>('[data-split-to]')]) {
      const ref = to.getAttribute('data-ref');
      if (ref !== null) seen.add(ref);
    }
  }
}

export function relocateStrandedKeeps(
  outputRoot: HTMLElement,
  measure: KeepMeasure = domMeasure,
): RelocateOutcome {
  const outcome: RelocateOutcome = { relocated: 0, rejoined: 0 };
  const pages = [...outputRoot.querySelectorAll<HTMLElement>('.pagedjs_page')];
  for (let i = 0; i < pages.length - 1; i++) {
    const content = pages[i].querySelector<HTMLElement>('.pagedjs_page_content');
    if (!content) continue;
    for (let round = 0; round < 5; round++) {
      const deepest = deepestLeaf(content, measure);
      if (deepest === undefined) break;
      // the OUTERMOST avoid-stamped ancestor of the page's last leaf
      // (parents carry data-ref on every rebuilt node — the pick is
      // the outermost, the ref check only guards fixture hygiene)
      const carriers: HTMLElement[] = [];
      for (let el: HTMLElement | null = deepest.el; el && el !== content; el = el.parentElement) {
        if (el.getAttribute('data-break-after') === 'avoid') carriers.push(el);
      }
      const carrier = carriers
        .reverse()
        .find((el) => (el.parentElement?.getAttribute('data-ref') ?? '') !== '');
      if (!carrier || !carrier.parentElement) break;

      // ── REJOIN: the carrier itself is a cut half — its pair waits
      // on a later page; the children reunite the block there. This
      // branch runs BEFORE the cut-below guard: nested halves inside
      // the cut carrier are the very content being reunited (a
      // header cut inside its own gap div strands the eyebrow+h2
      // half with inner split markers below — moving the children
      // wholesale tears nothing)
      if (carrier.hasAttribute('data-split-to')) {
        const ref = carrier.getAttribute('data-ref');
        const pair = ref ? continuationOn(pages, i, ref) : undefined;
        if (!pair) break; // nothing to reunite with — not our shape
        const pairArea = pair
          .closest('.pagedjs_page')
          ?.querySelector<HTMLElement>('.pagedjs_page_content');
        if (!pairArea) break;
        const available = measure.bottom(pairArea) - leafBottomOf(pairArea, measure);
        // conservative need: the whole half's box (its own padding
        // stays behind; children never cost more than the box)
        if (measure.height(carrier) > available + 1) break; // unsatisfiable — ships as the cut
        const formerParent = carrier.parentElement;
        pair.prepend(...carrier.children);
        carrier.remove();
        pruneEmptiedWrappers(formerParent, content);
        outcome.rejoined++;
        continue;
      }

      // defensive cut-below, STRAND-only: a cut strictly below an
      // uncut carrier cannot occur on pagedjs's marked chains — kept
      // from the r5 law; relocating a torn subtree would rip the
      // card. (The rejoin branch above already returned: its nested
      // markers are reunion content, not tears)
      let cutBelowCarrier = false;
      for (let el: HTMLElement | null = deepest.el; el && el !== carrier; el = el.parentElement) {
        if (el.hasAttribute('data-split-to')) {
          cutBelowCarrier = true;
          break;
        }
      }
      if (cutBelowCarrier) break;

      // ── STRAND: the uncut carrier's nearest split-continuation
      // ancestor half — its own parent when that split (the classic
      // mend), else the deepest ancestor that did (ended-whole)
      let target: HTMLElement | undefined;
      for (let el: HTMLElement | null = carrier.parentElement; el && el !== content; el = el.parentElement) {
        const ref = el.getAttribute('data-ref');
        if (!ref) continue;
        const half = continuationOn(pages, i, ref);
        if (half) {
          target = half;
          break;
        }
      }
      if (!target) break; // no continuation anywhere — not our shape
      const targetArea = target
        .closest('.pagedjs_page')
        ?.querySelector<HTMLElement>('.pagedjs_page_content');
      if (!targetArea) break;
      const available = measure.bottom(targetArea) - leafBottomOf(targetArea, measure);
      if (measure.height(carrier) > available + 1) break; // unsatisfiable keep — least-bad break
      const formerParent = carrier.parentElement;
      if (formerParent.getAttribute('data-ref') === target.getAttribute('data-ref')) {
        // the carrier's own host split — it belongs at the head of
        // its continuation (the classic mend)
        target.prepend(carrier);
      } else {
        // ended-whole: ride into the ancestor's continuation,
        // immediately before the carrier's document-order successor
        // (the half's first visible child)
        const anchor = [...target.children].find((child) =>
          isVisible(child as HTMLElement, measure),
        );
        if (anchor !== undefined) target.insertBefore(carrier, anchor);
        else target.prepend(carrier);
      }
      pruneEmptiedWrappers(formerParent, content);
      outcome.relocated++;
    }
  }
  // the mends above orphan split markers — heal before the dash
  // normalization pass re-derives its outer layers (pipeline order)
  healOrphanedSplits(outputRoot);
  return outcome;
}

/** pagedjs chunks INCREMENTALLY and rebuilds earlier pages as the
 * flow progresses — its flow promise can resolve while a late
 * layout wave is still pending (the live probe watched a cut
 * eyebrow half sit mutation-quiet for 100ms at a mid-page slot,
 * then ride 942px to its resting page-bottom slot WITHOUT any
 * childList mutation — a pure relayout the mutation signal cannot
 * see). So quiet alone is not truth: the gate holds a MINIMUM
 * duration even when quiet, then requires six consecutive
 * mutation-free, signature-stable frames on top. Bounded by a
 * budget — a pathological environment still gets the pass, best
 * effort */
export async function awaitSettledLayout(
  outputRoot: HTMLElement,
  budgetMs = 1500,
  minMs = 250,
): Promise<void> {
  const raf = (): Promise<void> =>
    new Promise((resolve) => requestAnimationFrame(() => resolve()));
  let mutations = 0;
  const observer =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver((records) => {
          mutations += records.filter((record) => record.type === 'childList').length;
        })
      : null;
  observer?.observe(outputRoot, { childList: true, subtree: true });
  try {
    const signature = (): string => {
      const pages = outputRoot.querySelectorAll('.pagedjs_page').length;
      const bottoms = [
        ...outputRoot.querySelectorAll<HTMLElement>('.pagedjs_page [data-break-after="avoid"]'),
      ]
        .map((el) => Math.round(el.getBoundingClientRect().bottom))
        .join(',');
      return `${pages}|${bottoms}`;
    };
    const start = performance.now();
    const deadline = start + budgetMs;
    let previous = signature();
    let quietFrames = 0;
    while (performance.now() < deadline) {
      await raf();
      const moved = mutations;
      mutations = 0;
      const current = signature();
      quietFrames = moved === 0 && current === previous ? quietFrames + 1 : 0;
      previous = current;
      if (quietFrames >= 6 && performance.now() - start >= minMs) break;
    }
  } finally {
    observer?.disconnect();
  }
}

// ── the split dash (a BLOCK judgment, 2026-09-03) ───────────────────────────

/** the print-projection BOX family (Owner correction, 2026-09-03:
 * the criterion is the border the PRINT PREVIEW carries, not the
 * screen's). A code card keeps its head/foot strips in the
 * projection and reads as a discrete block; the boxed section
 * opt-out carries its authored 1px frame; the DEFAULT section card
 * is borderless there (paper is the frame — its bottom hairline is
 * a separator, not a box) and row-ruled tables ride their own row
 * hairlines — neither dashes. Keep in sync with kernel-print.css §7
 * (the dash rules key the stamp) */
const SPLIT_BLOCK_SELECTOR = '.jx-code-card, section.bg-card[data-jx-print="boxed"]';
/** the dash owner stamp — the kernel's dash rules key on it */
const SPLIT_DASH_ATTR = 'data-jx-split-dash';

const samePage = (a: HTMLElement, b: HTMLElement): boolean =>
  a.closest('.pagedjs_page') === b.closest('.pagedjs_page');

/** pagedjs marks the WHOLE rebuilt ancestor chain with
 * data-split-from/to, and EVERY page boundary cuts some chain — so a
 * per-element "innermost owns the dash" rule draws a hairline at
 * nearly every page turn, even where plain flow simply continues
 * (the page break itself is the signal). The dash is a BLOCK
 * judgment (Owner directive, 2026-09-03; corrected same day: the
 * criterion is the border the PRINT PREVIEW carries, not the
 * screen's): only a cut through a print-boxed block
 * (SPLIT_BLOCK_SELECTOR) draws it — the block half carries the
 * bottom dash, its continuation halves the top dash. The default
 * borderless section card (paper is the frame) and plain flow never
 * dash.
 *
 * Two companions stay from the vision-r3/r4 law: ancestor layers at
 * a cut still get data-jx-split-outer (their OWN authored borders at
 * the cut edge say "this ends here" while content continues — the
 * kernel suppresses them), and ONE dash per cut edge holds (nested
 * print-boxed blocks cut at the same page bottom collapse to the
 * INNERMOST block — the visible object being cut) */
export function stampSplitDashes(outputRoot: HTMLElement): void {
  // the r3 outer-quiet: every marked element whose subtree carries
  // the same-side marker is an ancestor layer of the cut
  for (const el of [...outputRoot.querySelectorAll<HTMLElement>('[data-split-to]')]) {
    if (el.querySelector('[data-split-to]')) el.setAttribute('data-jx-split-outer', '');
  }
  for (const el of [...outputRoot.querySelectorAll<HTMLElement>('[data-split-from]')]) {
    if (el.querySelector('[data-split-from]')) el.setAttribute('data-jx-split-outer', '');
  }
  // the block judgment: a cut chain earns a dash only by passing
  // through a boxed card — every HALF of that card (to-side, middle,
  // from-side) stamps, so a card spanning three pages dashes each
  // cut side it owns
  const halves = [
    ...outputRoot.querySelectorAll<HTMLElement>(
      `${SPLIT_BLOCK_SELECTOR}[data-split-to], ${SPLIT_BLOCK_SELECTOR}[data-split-from]`,
    ),
  ];
  // one dash per cut EDGE: a page has one cut edge (its bottom), so
  // a stamped half containing another stamped half of the SAME page
  // defers to the innermost block (the visible object being cut)
  const stamped = halves.filter(
    (half) =>
      !halves.some(
        (other) => other !== half && half.contains(other) && samePage(half, other),
      ),
  );
  for (const half of stamped) half.setAttribute(SPLIT_DASH_ATTR, '');
}

// ── running-head resync (pagedjs string-sets, re-derived) ──────────────────

/** the kernel's declared string-sets (kernel-print.css §9):
 * h1→docTitle, h2→sectionTitle — keep in sync with the source */
const STRING_SETS = [
  { name: 'docTitle', selector: 'h1' },
  { name: 'sectionTitle', selector: 'h2' },
] as const;

/** recompute pagedjs's per-page string variables from the FINAL
 * DOM, mirroring string-sets.js afterPageLayout: first/last = the
 * page's own first/last selection else the value carried in; start
 * = first only when the selection sits at the content top;
 * first-except = "" when the page carries one. The margin boxes
 * read these through content: var(--pagedjs-string-first-…) */
export function resyncStringSets(outputRoot: HTMLElement, measure: KeepMeasure = domMeasure): void {
  const pages = [...outputRoot.querySelectorAll<HTMLElement>('.pagedjs_page')];
  for (const { name, selector } of STRING_SETS) {
    let carried = '';
    for (const page of pages) {
      const selected = [...page.querySelectorAll<HTMLElement>(selector)];
      const first = selected.length ? (selected[0].textContent ?? '') : carried;
      const last = selected.length ? (selected[selected.length - 1].textContent ?? '') : carried;
      const area = page.querySelector<HTMLElement>('.pagedjs_page_content');
      let start = carried;
      if (selected.length && area && Math.abs(measure.top(selected[0]) - measure.top(area)) < 1) {
        start = first;
      }
      const firstExcept = selected.length ? '' : carried;
      const cssString = (value: string): string => JSON.stringify(value);
      page.style.setProperty(`--pagedjs-string-first-${name}`, cssString(first));
      page.style.setProperty(`--pagedjs-string-last-${name}`, cssString(last));
      page.style.setProperty(`--pagedjs-string-start-${name}`, cssString(start));
      page.style.setProperty(`--pagedjs-string-first-except-${name}`, cssString(firstExcept));
      if (selected.length) carried = selected[selected.length - 1].textContent ?? '';
    }
  }
}
