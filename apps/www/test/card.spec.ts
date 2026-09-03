/**
 * The card structural-surface contract (test/card.spec.ts, born
 * 2026-09-03; r2 2026-09-03 — THE INLINE RULER): the dialog row
 * ruler's structural clone — INTEGER cell placement (never named
 * rows: a wrapped card-grid band rents IMPLICIT rows where line
 * names don't resolve — the 2026-09-03 rev.1 lesson), edge-riding
 * separators, the stamped presence law, the scroll law, the open
 * actions slot — plus the Owner's r2 upgrade: the root owns FIVE
 * named column tracks and the head/foot zones RENT them via
 * subgrid, so passive content enters the content axis BY TRACK and
 * interactive clusters span the inset to ride the card edge flush
 * ("jx-card-foot-start 这里如果要放文字，是要有 padding 的…buttons
 * 在内部使用了 padding").
 *
 * jsdom has no layout: the LAWS are asserted against the css source
 * (the gate pattern), the DOM contract against rendered fixtures.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import CardHost from './fixtures/card-host.svelte';

const cardCss = readFileSync(resolve('src/lib/ui/card/card.css'), 'utf8');
const footCss = readFileSync(resolve('src/lib/ui/card/card-footer.css'), 'utf8');
const cardSrc = readFileSync(resolve('src/lib/ui/card/card.svelte'), 'utf8');
const headerSrc = readFileSync(resolve('src/lib/ui/card/card-header.svelte'), 'utf8');
const footerSrc = readFileSync(resolve('src/lib/ui/card/card-footer.svelte'), 'utf8');

const clean = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

const host = (): HTMLElement => {
  const { container } = render(CardHost);
  return container;
};

describe('card — the inline ruler (the css)', () => {
  it('the root owns FIVE named column tracks: inset / start seat / fill (its floor is the old 10px gap) / end seat / inset — and the BODY row is the flex absorber (dialog verbatim)', () => {
    expect(clean(cardCss)).toMatch(
      /:where\(\[data-jx-card\]\)\s*\{[^}]*grid-template-columns:\s*\[card-inline-start\]\s*0\.875rem\s*\[card-content-start\]\s*auto\s*\[card-fill\]\s*minmax\(0\.625rem,\s*1fr\)\s*\[card-content-end\]\s*auto\s*\[card-inline-end\]\s*0\.875rem[^}]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/s,
    );
  });
  it('head and foot zones RENT the ruler (subgrid columns); the body zone does NOT — it stays full-bleed so its scroll ring owns the dynamic-gutter formula', () => {
    const body = clean(cardCss);
    const head = /:where\(\[data-jx-card-head\]\)\s*\{([^}]*)\}/.exec(body)?.[1] ?? '';
    const foot = /:where\(\[data-jx-card-foot\]\)\s*\{([^}]*)\}/.exec(body)?.[1] ?? '';
    const zone = /:where\(\[data-jx-card-body\]\)\s*\{([^}]*)\}/.exec(body)?.[1] ?? '';
    expect(head).toContain('grid-template-columns: subgrid');
    expect(foot).toContain('grid-template-columns: subgrid');
    expect(zone).not.toContain('subgrid');
  });
  it('zones place by INTEGER row lines and span the full inline extent — never named rows (the subgrid tenant law)', () => {
    const body = clean(cardCss);
    for (const [attr, row] of [['head', '1'], ['body', '2'], ['foot', '3']] as const) {
      expect(body).toMatch(
        new RegExp(`:where\\(\\[data-jx-card-${attr}\\]\\)\\s*\\{[^}]*grid-row:\\s*${row}\\s*;\\s*grid-column:\\s*1\\s*/\\s*-1`, 's'),
      );
    }
    expect(body).not.toMatch(/grid-template-rows:\s*\[/);
    expect(body).not.toMatch(/grid-row:\s*(head|body|foot)\b/);
  });
  it('the separators EDGE-RIDE their zone rows, spanning edge-to-edge (no dedicated 1px tracks to rent)', () => {
    const body = clean(cardCss);
    expect(body).toMatch(
      /:where\(\[data-jx-card-sep='head'\]\)\s*\{[^}]*grid-row:\s*1\s*;[^}]*grid-column:\s*1\s*\/\s*-1[^}]*align-self:\s*end/s,
    );
    expect(body).toMatch(
      /:where\(\[data-jx-card-sep='foot'\]\)\s*\{[^}]*grid-row:\s*3\s*;[^}]*grid-column:\s*1\s*\/\s*-1[^}]*align-self:\s*start/s,
    );
  });
  it('THE SCROLL LAW, grid-tenant edition: the ZONE is a plain occupant, the CELL is the ring — and NEVER min-height: 0 on the zone (it collapses the rented row)', () => {
    const body = clean(cardCss);
    const zone = /:where\(\[data-jx-card-body\]\)\s*\{([^}]*)\}/.exec(body)?.[1] ?? '';
    expect(zone).not.toContain('min-height');
    expect(zone).not.toContain('overflow');
    expect(body).toMatch(
      /:where\(\[data-jx-card-cell\]\)\s*\{[^}]*max-height:\s*100%[^}]*overflow-y:\s*auto[^}]*scrollbar-gutter:\s*stable\s+both-edges/s,
    );
    expect(body).toMatch(
      /:where\(\[data-jx-card-body\]\[data-jx-scroll='off'\]\)\s*:where\(\[data-jx-card-cell\]\)\s*\{[^}]*max-height:\s*none[^}]*overflow-y:\s*visible[^}]*scrollbar-gutter:\s*auto/s,
    );
  });
  it('the head seats: the content face ENTERS at the content lines; the action slot SPANS the end inset to ride the edge flush', () => {
    const body = clean(cardCss);
    expect(body).toMatch(
      /:where\(\.jx-card-head-content\)\s*\{[^}]*grid-column:\s*card-content-start\s*\/\s*card-content-end[^}]*min-inline-size:\s*0/s,
    );
    expect(body).toMatch(
      /:where\(\.jx-card-end-action-slot\)\s*\{[^}]*grid-column:\s*card-content-end\s*\/\s*-1[^}]*justify-self:\s*end/s,
    );
    // the head-grid wrapper is dead — the seats rent the root's ruler directly
    expect(body).not.toMatch(/jx-card-head-grid/);
    expect(cardSrc).not.toContain('jx-card-head-grid');
  });
  it('THE TENANCY GUARD: the reversal container lives on the root, and RETIRES inside card-grid (never a container on a subgrid tenant)', () => {
    const body = clean(cardCss);
    expect(body).toMatch(
      /:where\(\[data-jx-card\]\)\s*\{[^}]*container:\s*jx-card\s*\/\s*inline-size/s,
    );
    expect(body).toMatch(
      /:where\(\.jx-card-grid\)\s*>\s*:where\(\[data-jx-card\]\)\s*\{[^}]*container-type:\s*normal/s,
    );
    // prose in doc comments may NAME the retired utilities; the law
    // binds the markup and the css
    for (const src of [cardSrc, footerSrc]) {
      const markup = src.replace(/<!--[\s\S]*?-->/g, '');
      expect(markup).not.toContain('@container');
      expect(markup).not.toContain('@max-[15rem]');
    }
  });
});

describe('card-footer — the seats on the ruler (the css)', () => {
  it('TEXT seats enter the content axis; the CLUSTER seat spans the end inset to ride the edge flush', () => {
    const body = clean(footCss);
    expect(body).toMatch(
      /:where\(\.jx-card-foot-start\)\s*\{[^}]*grid-column:\s*card-content-start\s*\/\s*card-fill[^}]*justify-self:\s*start/s,
    );
    // THE CROSS-ROW SHARING LAW (measured: a 115px foot cluster leaks
    // into the head row's line 4): the end TEXT seat ends at the end
    // INSET line — never at card-content-end, which the shared end
    // column can push outward
    expect(body).toMatch(
      /:where\(\.jx-card-foot-end\)\s*\{[^}]*grid-column:\s*card-fill\s*\/\s*card-inline-end[^}]*justify-self:\s*end/s,
    );
    expect(body).toMatch(
      /:where\(\.jx-card-foot-cluster\)\s*\{[^}]*grid-column:\s*card-content-end\s*\/\s*-1[^}]*justify-self:\s*end/s,
    );
    expect(body).not.toMatch(/space-between/);
  });
  it('the wrapper DISSOLVES inside the foot zone (the seats rent the root\'s ruler); standalone it renders its own face of the same tracks', () => {
    const body = clean(footCss);
    expect(body).toMatch(
      /:where\(\[data-jx-card-foot\]\)\s*>\s*:where\(\.jx-card-foot-grid\)\s*\{[^}]*display:\s*contents/s,
    );
    expect(body).toMatch(
      /:where\(\.jx-card-foot-grid\)\s*\{[^}]*grid-template-columns:\s*\[card-inline-start\]\s*0\.875rem\s*\[card-content-start\]\s*auto\s*\[card-fill\]\s*minmax\(0\.625rem,\s*1fr\)\s*\[card-content-end\]\s*auto\s*\[card-inline-end\]\s*0\.875rem/s,
    );
  });
  it('the narrow reversal is GRID-NATIVE against the root container: cluster full-bleed on top, text seats below at the content axis', () => {
    const body = clean(footCss);
    expect(body).toMatch(
      /@container\s+jx-card\s*\(width\s*<\s*15rem\)\s*\{[^}]*:where\(\.jx-card-foot-cluster\)\s*\{[^}]*grid-row:\s*1[^}]*grid-column:\s*1\s*\/\s*-1/s,
    );
    expect(body).toMatch(
      /:where\(\.jx-card-foot-start\)\s*\{[^}]*grid-row:\s*2[^}]*grid-column:\s*card-content-start\s*\/\s*card-inline-end/s,
    );
  });
});

describe('card — padding is the ruler\'s law (tracks paint the inline axis; faces keep only block rhythms)', () => {
  it('head face: py-2.5 only — the 14px inline inset arrives BY TRACK (dialog-header painted it by hand; the ruler paints it by law)', () => {
    expect(headerSrc).toContain("class=\"jx-card-head-content {children ? '' : 'py-2.5'}\"");
    expect(headerSrc.replace(/<!--[\s\S]*?-->/g, '')).not.toContain('px-3.5');
  });
  it('THE BAND LAWS (Owner r3+r4): foot text carries NO padding-block — it centers, never sizes; the cluster is a CARVED CELL that fills the band (stretch chain, native end to end)', () => {
    const markup = footerSrc.replace(/<!--[\s\S]*?-->/g, '');
    // no padding/stretch utilities in the MARKUP — the fill is css law
    expect(markup).not.toMatch(/padding|\bpy-|\bpx-/);
    expect(markup).not.toMatch(/h-full|self-stretch/);
    const body = clean(footCss);
    // the carved cell: the seat stretches, becomes the rail the group fills;
    // the buttons' min-h-[--jx-hit] economy is a floor, never a cap
    expect(body).toMatch(
      /:where\(\.jx-card-foot-cluster\)\s*\{[^}]*justify-self:\s*end[^}]*align-self:\s*stretch[^}]*display:\s*grid/s,
    );
  });
  it('the body cell keeps dialog\'s VERBATIM gutter-compensating formula (the scroll ring owns its inline geometry — a dynamic scrollbar is invisible to tracks)', () => {
    expect(cardSrc).toContain('py-3.5 px-[max(0.875rem-var(--jx-scrollbar-thin,0px),0px)]');
  });
  it('no sm: viewport paddings survive on the component surfaces', () => {
    for (const src of [cardSrc, headerSrc, footerSrc]) {
      expect(src).not.toMatch(/\bsm:(px|py|p)-/);
    }
  });
});

describe('card — the DOM contract (rendered)', () => {
  it('a bare card: head stamped, no foot; zones in order [head, sep-head, body]', () => {
    const el = host().querySelector('.card-bare')!;
    expect(el.hasAttribute('data-jx-card')).toBe(true);
    expect(el.hasAttribute('data-sep-head')).toBe(true);
    expect(el.hasAttribute('data-sep-foot')).toBe(false);
    const kids = [...el.children].map((k) => k.getAttribute('data-jx-card-head') !== null ? 'head' : k.getAttribute('data-jx-card-sep') !== null ? `sep:${k.getAttribute('data-jx-card-sep')}` : k.getAttribute('data-jx-card-body') !== null ? 'body' : 'other');
    expect(kids).toEqual(['head', 'sep:head', 'body']);
    const sep = el.querySelector('[data-jx-card-sep="head"]')!;
    expect(sep.tagName).toBe('HR');
    expect(sep.getAttribute('data-jx-separator')).toBe('line');
    expect(sep.getAttribute('data-orientation')).toBe('horizontal');
    expect(sep.getAttribute('aria-hidden')).toBe('true');
  });
  it('NO close button ships — the action seat is the consumer actions snippet', () => {
    const container = host();
    expect(container.querySelectorAll('button[aria-label="Close"]')).toHaveLength(0);
    const slot = container.querySelector('.card-full .jx-card-end-action-slot')!;
    expect(slot).toBeTruthy();
    expect(slot.querySelector('[data-testid="custom-action"]')).toBeTruthy();
    // and absent the snippet, the slot never renders at all
    expect(container.querySelector('.card-bare .jx-card-end-action-slot')).toBeNull();
  });
  it('the foot zone scopes the FLAT texture (Owner 2026-09-04): foot buttons default to the engrave-tier inset, an explicit raised keeps the convex law', () => {
    const footZone = host().querySelector('.card-full [data-jx-card-foot]')!;
    const byText = Object.fromEntries(
      [...footZone.querySelectorAll('button')].map((b) => [b.textContent?.trim(), b]),
    ) as Record<string, HTMLElement>;
    // no explicit prop ⇒ the zone's raised=false default adopts the flat pose
    for (const label of ['Cancel', 'Save']) {
      expect(byText[label].className).toContain('[--jx-press-move:none]');
      expect(byText[label].className).toContain('[--jx-press-shadow-active:var(--shadow-engrave)]');
    }
    // explicit ALWAYS wins — none of the flat block's seams ride (a
    // convex ghost keeps its own none-trio; that is r13 law, not flat)
    expect(byText['Raised'].className).not.toContain('--jx-press-move');
    expect(byText['Raised'].className).not.toContain('engrave');
  });
  it('a full card: both stamps; zone order [head, sep-head, body, sep-foot, foot]; the foot zone is RAW transport', () => {
    const el = host().querySelector('.card-full')!;
    expect(el.hasAttribute('data-sep-foot')).toBe(true);
    const kids = [...el.children].map((k) => k.getAttribute('data-jx-card-head') !== null ? 'head' : k.getAttribute('data-jx-card-sep') !== null ? `sep:${k.getAttribute('data-jx-card-sep')}` : k.getAttribute('data-jx-card-body') !== null ? 'body' : k.getAttribute('data-jx-card-foot') !== null ? 'foot' : 'other');
    expect(kids).toEqual(['head', 'sep:head', 'body', 'sep:foot', 'foot']);
    const footZone = el.querySelector('[data-jx-card-foot]')!;
    // RAW: the first element is the consumer's CardFooter wrapper — no
    // built-in grid/group/divider from Card (the wrapper dissolves via
    // css; the DOM keeps it for the standalone face)
    expect(footZone.children[0].classList.contains('jx-card-foot-grid')).toBe(true);
    expect(footZone.querySelectorAll('[data-jx-btngroup]')).toHaveLength(1);
  });
  it('CardFooter: the start TEXT seat hangs the content axis; ONE leading-seam ButtonGroup in the CLUSTER seat', () => {
    const grid = host().querySelector('.card-full .jx-card-foot-grid')!;
    const start = grid.querySelector('.jx-card-foot-start')!;
    expect(start.textContent).toContain('3 items');
    const cluster = grid.querySelector('.jx-card-foot-cluster')!;
    const group = cluster.querySelector('[data-jx-btngroup]')!;
    expect(group.getAttribute('aria-label')).toBe('card actions');
    expect(group.hasAttribute('data-jx-leading-seam')).toBe(true);
    expect(group.querySelectorAll('button').length).toBeGreaterThanOrEqual(2);
  });
  it('CardFooter end slot replaces the grouped arrangement (the end TEXT seat, not the cluster)', () => {
    const grid = host().querySelector('.grid-host')!;
    const first = grid.children[0].querySelector('.jx-card-foot-grid')!;
    expect(first.querySelector('[data-jx-btngroup]')).toBeNull();
    expect(first.querySelector('.jx-card-foot-end')!.textContent).toContain('raw end');
  });
  it('a headless card renders NO head zone and NO head stamp (honest presence)', () => {
    const el = host().querySelector('.card-headless')!;
    expect(el.hasAttribute('data-sep-head')).toBe(false);
    expect(el.querySelector('[data-jx-card-head]')).toBeNull();
    expect(el.querySelector('[data-jx-card-sep="head"]')).toBeNull();
    expect(el.children[0].hasAttribute('data-jx-card-body')).toBe(true);
  });
  it('scroll={false} stamps the declared non-scroller; on by default', () => {
    const container = host();
    expect(container.querySelector('.card-fixed [data-jx-card-body]')!.getAttribute('data-jx-scroll')).toBe('off');
    expect(container.querySelector('.card-bare [data-jx-card-body]')!.getAttribute('data-jx-scroll')).toBeNull();
  });
  it('the default head face is CardHeader (h2 title) renting the zone directly; zones carry no borders', () => {
    const el = host().querySelector('.card-bare')!;
    const content = el.querySelector('[data-jx-card-head] > .jx-card-head-content')!;
    expect(content.querySelector('h2[data-jx-card-title]')!.textContent).toBe('bare card');
    for (const zone of el.querySelectorAll('[data-jx-card-head], [data-jx-card-body], [data-jx-card-foot]')) {
      expect(zone.className).not.toContain('border-b');
    }
  });
  it('the CardGrid foot mode composes zone-trio cards (the landlord declares the third row)', () => {
    const grid = host().querySelector('.grid-host')!;
    expect(grid.getAttribute('data-rows')).toBe('foot');
    expect(grid.querySelectorAll('[data-jx-card]')).toHaveLength(2);
  });
});
