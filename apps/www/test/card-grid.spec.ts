/**
 * The card-grid composition contract (test/card-grid.spec.ts).
 *
 * Born 2026-09-03 from a real pollution (card-grid had ZERO tests), and
 * REWRITTEN the same day after rev.1 overcorrected: adding a [sep] third
 * shared row broke the original content-agnostic contract — any
 * two-block card's body landed in the separator row, and wrapped
 * cards' zone-named placement fell apart in implicit bands (names only
 * exist on a grid's FIRST band: headers/bodies/separators collapsed
 * onto one another on the docs page).
 *
 * The restored law (rev.2, back to the 2026-08-21 "grid+subgrid
 * equalizer" bytes): TWO shared rows (auto 1fr), children span two and
 * subgrid, the grid NEVER asks what a child is — and the section
 * card's structural separator rides its header row's bottom edge via
 * INTEGER cell placement (grid-area), which resolves in every context.
 * jsdom has no layout: the grid LAWS are asserted against the css
 * source (the gate pattern), the DOM contract against a rendered
 * CardGrid + SectionCards + a plain two-block card.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import CardGridHost from './fixtures/card-grid-host.svelte';

// component css rides the svelte pipeline in vitest (the ?raw import
// resolves empty here, unlike the kernel's plain-css ?raw) — read the
// source files from disk, the same bytes the build ships (vitest's
// cwd is the package root)
const gridCss = readFileSync(resolve('src/lib/ui/card-grid/card-grid.css'), 'utf8');
const sectionCss = readFileSync(resolve('src/lib/ui/section-card/section-card.css'), 'utf8');

const cleanCss = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('card-grid — the content-agnostic equalizer (the css law)', () => {
  it('two shared rows: header auto, body 1fr (the original equalizer)', () => {
    expect(cleanCss(gridCss)).toMatch(/\.jx-card-grid\s*\{[^}]*grid-template-rows:\s*auto\s+1fr/s);
  });
  it('every card spans TWO rows and subgrids them', () => {
    expect(cleanCss(gridCss)).toMatch(
      /\.jx-card-grid > \*\s*\{[^}]*grid-row: span 2[^}]*grid-template-rows: subgrid/s,
    );
  });
  it('NO third shared row and NO named shared rows by DEFAULT (rev.1 stranded wrapped bands)', () => {
    const body = cleanCss(gridCss);
    expect(body).not.toMatch(/grid-template-rows:\s*\[/);
    // the unconditional child law stays span 2; span 3 exists ONLY
    // under the explicit [data-rows='foot'] branch
    const footBranch = /\.jx-card-grid\[data-rows='foot'\] > \*\s*\{[^}]*grid-row: span 3/s.exec(body);
    expect(footBranch, 'the foot-mode span-3 branch').not.toBeNull();
    const stripped = body.replace(/\.jx-card-grid\[data-rows='foot'\][^{}]*\{[^}]*\}/gs, '');
    expect(stripped).not.toMatch(/span 3/);
  });
  it('THE FOOT MODE (2026-09-03): an EXPLICIT third shared row, declared by the landlord', () => {
    const body = cleanCss(gridCss);
    expect(body).toMatch(
      /\.jx-card-grid\[data-rows='foot'\]\s*\{[^}]*grid-template-rows:\s*auto\s+1fr\s+auto/s,
    );
    expect(body).toMatch(/\.jx-card-grid\[data-rows='foot'\] > \*\s*\{[^}]*grid-row: span 3/s);
    expect(body).toMatch(
      /\.jx-card-grid\[data-rows='foot'\] > \*\[data-no-subgrid\]\s*\{[^}]*grid-row:\s*auto/s,
    );
    // the DEFAULT two-row contract stays byte-exact for existing consumers
    expect(body).toMatch(/\.jx-card-grid\s*\{[^}]*grid-template-rows:\s*auto\s+1fr\s*;/s);
  });
  it('the no-subgrid opt-out survives untouched', () => {
    expect(cleanCss(gridCss)).toMatch(
      /\.jx-card-grid > \*\[data-no-subgrid\]\s*\{[^}]*grid-row: auto[^}]*grid-template-rows: none/s,
    );
  });
});

describe('section-card — the edge-riding structural separator (the css law)', () => {
  it('the section is a two-row grid: header+separator share row 1, body row 2', () => {
    expect(cleanCss(sectionCss)).toMatch(
      /:where\(\[data-jx-section\]\)\s*\{[^}]*grid-template-rows:\s*auto\s+auto/s,
    );
  });
  it('the single column is minmax(0,1fr) — no max-content blowout (code scrolls, text wraps)', () => {
    expect(cleanCss(sectionCss)).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });
  it('the separator pins to the header cell\'s bottom edge — INTEGER placement, context-free', () => {
    expect(cleanCss(sectionCss)).toMatch(
      /:where\(\[data-jx-section-sep\]\)\s*\{[^}]*grid-area: 1 \/ 1[^}]*align-self: end/s,
    );
    expect(cleanCss(sectionCss)).toMatch(
      /:where\(\[data-jx-section-header\]\)\s*\{[^}]*grid-area: 1 \/ 1/s,
    );
    expect(cleanCss(sectionCss)).toMatch(
      /:where\(\[data-jx-section-body\]\)\s*\{[^}]*grid-area: 2 \/ 1/s,
    );
  });
  it('NO [sep] track and NO zone row names (rev.1\'s stranded vocabulary)', () => {
    const body = cleanCss(sectionCss);
    expect(body).not.toMatch(/\[sep\]/);
    expect(body).not.toMatch(/grid-row:\s*(header|sep|body)\b/);
  });
});

describe('card-grid — the DOM contract (rendered composition)', () => {
  it('section cards carry three zones in order, the standard separator between', () => {
    const { container } = render(CardGridHost);
    const grid = container.querySelector('.jx-card-grid')!;
    expect(grid).toBeTruthy();
    const sections = [...grid.children].filter((c) => c.hasAttribute('data-jx-section'));
    expect(sections.length).toBe(2);
    for (const card of sections) {
      const zones = [...card.children];
      expect(zones[0].hasAttribute('data-jx-section-header')).toBe(true);
      expect(zones[1].matches('[data-jx-section-sep][data-jx-separator]')).toBe(true);
      expect(zones[1].tagName).toBe('HR');
      expect(zones[2].hasAttribute('data-jx-section-body')).toBe(true);
      // the retired border must not ride the header zone's classes
      expect(zones[0].className).not.toContain('border-b');
    }
  });
  it('a plain two-block div card qualifies unchanged — the grid never asks what a child is', () => {
    const { container } = render(CardGridHost);
    const grid = container.querySelector('.jx-card-grid')!;
    const plain = [...grid.children].find((c) => c.tagName === 'DIV');
    expect(plain).toBeTruthy();
    expect(plain!.children.length).toBe(2);
    expect(plain!.hasAttribute('data-no-subgrid')).toBe(false);
  });
  it('the card consumes the closed density aliases — no viewport-variant paddings (the density axis owns compactness)', () => {
    const { container } = render(CardGridHost);
    const grid = container.querySelector('.jx-card-grid')!;
    for (const card of [...grid.children].filter((c) => c.hasAttribute('data-jx-section'))) {
      const header = card.querySelector('[data-jx-section-header]')!;
      const body = card.querySelector('[data-jx-section-body]')!;
      // token-derived formulas resolve to the legacy pixels at default
      // scope and step with the density scope (before adoption, the
      // density demo showed four pixel-identical panes)
      expect(header.className).toContain('--jx-inset');
      expect(header.className).toContain('--jx-stack');
      expect(body.className).toContain('--jx-stack');
      // the retired vocabulary: viewport variants on the card's own zones
      expect(header.className).not.toMatch(/\bsm:px-|\bsm:py-/);
      expect(body.className).not.toMatch(/\bsm:px-|\bsm:py-/);
    }
  });
  it('the section declares its line identity — data-role always ships, data-ordering only when claimed', () => {
    const { container } = render(CardGridHost);
    const grid = container.querySelector('.jx-card-grid')!;
    for (const card of [...grid.children].filter((c) => c.hasAttribute('data-jx-section'))) {
      // the factory default IS the declaration (ontology R1): the
      // harvester reads, never guesses
      expect(card.getAttribute('data-role')).toBe('section');
      expect(card.hasAttribute('data-ordering')).toBe(false);
    }
  });
  it('the grid container keeps the auto-fit column grammar and no card carries subgrid utilities', () => {
    const { container } = render(CardGridHost);
    const grid = container.querySelector('.jx-card-grid')!;
    expect(grid.className).toContain('grid-cols-[repeat(auto-fit');
    for (const card of grid.children) {
      // the subgrid law is card-grid.css's (D1 residue) — consumer
      // duplication once desynced the span (row-span-2 utilities)
      expect(card.className).not.toContain('row-span-');
      expect(card.className).not.toContain('grid-rows-subgrid');
    }
  });
});
