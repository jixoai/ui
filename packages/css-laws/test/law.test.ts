/**
 * Tests for the css-laws package — verify single-sourcing and correctness.
 */
import { describe, expect, it } from 'vitest';
import { serializeLaw } from '../src/serializers/core';
import { checkboxLaw } from '../src/laws/checkbox';
import { rangeLaw } from '../src/laws/range';

/** extract just the "prop: value;" pairs in order (ignores selectors, braces, wrappers) */
function extractDecls(css: string): string[] {
  return css.match(/[\w-]+:\s*[^;{}]+;/g) ?? [];
}

describe('ComponentLaw serializer', () => {
  describe('single-sourcing (utility ≡ face declarations)', () => {
    it('checkbox: identical declaration sequence in both modes', () => {
      const util = serializeLaw(checkboxLaw, { format: 'utility' });
      const face = serializeLaw(checkboxLaw, { format: 'face' });
      expect(extractDecls(util.css)).toEqual(extractDecls(face.css));
    });

    it('range: identical declaration sequence in both modes', () => {
      const util = serializeLaw(rangeLaw, { format: 'utility' });
      const face = serializeLaw(rangeLaw, { format: 'face' });
      expect(extractDecls(util.css)).toEqual(extractDecls(face.css));
    });
  });

  describe('utility mode output', () => {
    it('generates .jx-html-checkbox class selectors', () => {
      const r = serializeLaw(checkboxLaw, { format: 'utility' });
      expect(r.css).toContain('.jx-html-checkbox {');
      expect(r.css).toContain('.jx-html-checkbox::before {');
      expect(r.css).toContain('.jx-html-checkbox:checked, .jx-html-checkbox:indeterminate {');
      expect(r.css).toContain('.jx-html-checkbox:checked::before {');
      expect(r.css).toContain('.jx-html-checkbox:focus-visible {');
      expect(r.css).toContain('.jx-html-checkbox:disabled {');
    });

    it('generates .jx-html-range with custom properties', () => {
      const r = serializeLaw(rangeLaw, { format: 'utility' });
      expect(r.css).toContain('.jx-html-range {');
      expect(r.css).toContain('--jx-range-thumb: 100cqh');
      expect(r.css).toContain('container-type: size');
    });

    it('generates @supports blocks for engine pseudos', () => {
      const r = serializeLaw(rangeLaw, { format: 'utility' });
      expect(r.css).toContain('@supports selector(::-webkit-slider-runnable-track)');
      expect(r.css).toContain('@supports selector(::-moz-range-progress)');
    });

    it('generates @media degradation blocks', () => {
      const r = serializeLaw(checkboxLaw, { format: 'utility' });
      expect(r.css).toContain('@media (prefers-reduced-motion: reduce)');
    });
  });

  describe('face mode output', () => {
    it('generates :where(.jx-pure) scoped element selectors', () => {
      const r = serializeLaw(checkboxLaw, { format: 'face' });
      expect(r.css).toContain(':where(.jx-pure) input[type="checkbox"]');
      expect(r.css).not.toContain('.jx-html-checkbox');
    });

    it('range face uses input[type=range] selector', () => {
      const r = serializeLaw(rangeLaw, { format: 'face' });
      expect(r.css).toContain("input[type='range']");
      expect(r.css).not.toContain('.jx-html-range');
    });
  });

  describe('css correctness', () => {
    it('checkbox has the clip-path morph', () => {
      const r = serializeLaw(checkboxLaw, { format: 'utility' });
      expect(r.css).toContain('clip-path: polygon(20% 100%');
      expect(r.css).toContain('polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%');
      expect(r.css).toContain('polygon(10% 40%, 10% 60%');
    });

    it('range has cqw shadow fill formula', () => {
      const r = serializeLaw(rangeLaw, { format: 'utility' });
      expect(r.css).toContain('box-shadow: calc(-100cqw');
    });
  });
});
