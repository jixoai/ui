import { describe, expect, it } from 'vitest';
import { createSafetyChecker } from '../../src/icons/safety.js';

/** a clean, lucide-style icon — passes every default check */
const CLEAN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
  'fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>' +
  '<line x1="16" y1="2" x2="16" y2="6"/>' +
  '<line x1="8" y1="2" x2="8" y2="6"/>' +
  '</svg>';

/** a <path> whose d attribute contains exactly `count` command letters */
function pathSvg(commandCount: number): string {
  // 1 leading M + (count - 1) L commands
  const d = `M0 0 ${'L1 1 '.repeat(commandCount - 1)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
}

describe('createSafetyChecker — clean SVGs', () => {
  it('passes a clean lucide-style SVG with zero issues', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const result = checker.check(CLEAN_SVG);
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('does not false-positive on text that merely contains an element name', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><text>used by users</text></svg>';
    expect(checker.check(svg).passed).toBe(true);
  });
});

describe('createSafetyChecker — byte size', () => {
  it('catches an SVG over the default 10KB limit', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const oversized = `<svg><!--${'x'.repeat(11000)}--></svg>`;
    const result = checker.check(oversized);
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.message).toMatch(/byte size \d+ exceeds/i);
  });

  it('honors a custom maxBytes', () => {
    const strict = createSafetyChecker({ mode: 'warn', maxBytes: 50 });
    expect(strict.check(CLEAN_SVG).passed).toBe(false);

    const lenient = createSafetyChecker({ mode: 'warn', maxBytes: 10240 });
    expect(lenient.check(CLEAN_SVG).passed).toBe(true);
  });

  it('counts UTF-8 bytes, not characters', () => {
    // 5 + (4 × 2 bytes) + 6 = 19 bytes, but only 15 characters
    const svg = '<svg>éééé</svg>';
    const checker = createSafetyChecker({ mode: 'warn', maxBytes: 16 });
    const result = checker.check(svg);
    expect(result.passed).toBe(false);
    expect(result.issues[0]?.message).toMatch(/19 exceeds the limit of 16/);
  });
});

describe('createSafetyChecker — path command count', () => {
  it('passes at exactly 500 commands (the default limit)', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    expect(checker.check(pathSvg(500)).passed).toBe(true);
  });

  it('fails at 501 commands', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const result = checker.check(pathSvg(501));
    expect(result.passed).toBe(false);
    expect(result.issues[0]?.message).toMatch(
      /path command count 501 exceeds the limit of 500/,
    );
  });

  it('sums commands across multiple <path> elements', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const twoPaths = (perPath: number): string => {
      const d = `M0 0 ${'L1 1 '.repeat(perPath - 1)}`;
      return (
        '<svg xmlns="http://www.w3.org/2000/svg">' +
        `<path d="${d}"/><path d="${d}"/>` +
        '</svg>'
      );
    };
    expect(checker.check(twoPaths(250)).passed).toBe(true); // 500 total — at the limit
    expect(checker.check(twoPaths(300)).passed).toBe(false); // 600 total — over
  });

  it('does not count scientific-notation exponents as commands', () => {
    // commands: M, Z — the e/E in 1e3 / 2E-4 are number syntax
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1e3 2E-4Z"/></svg>';
    const exact = createSafetyChecker({ mode: 'warn', maxPathCommands: 2 });
    const oneShort = createSafetyChecker({ mode: 'warn', maxPathCommands: 1 });
    expect(exact.check(svg).passed).toBe(true);
    expect(oneShort.check(svg).passed).toBe(false);
  });

  it('honors a custom maxPathCommands', () => {
    const checker = createSafetyChecker({ mode: 'warn', maxPathCommands: 3 });
    expect(checker.check(pathSvg(3)).passed).toBe(true);
    expect(checker.check(pathSvg(4)).passed).toBe(false);
  });
});

describe('createSafetyChecker — disallowed elements', () => {
  const wrap = (inner: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  it.each([
    ['script', wrap('<script>alert(1)</script>')],
    ['foreignObject', wrap('<foreignObject><div>html</div></foreignObject>')],
    ['use', wrap('<use href="#evil"/>')],
    ['script (uppercase)', wrap('<SCRIPT>alert(1)</SCRIPT>')],
  ])('catches %s by default', (_label, svg) => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const result = checker.check(svg);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => /disallowed element/.test(issue.message))).toBe(true);
  });

  it('reports the element name that was found', () => {
    const checker = createSafetyChecker({ mode: 'warn' });
    const result = checker.check(wrap('<use href="#evil"/>'));
    expect(result.issues[0]?.message).toContain('<use>');
  });

  it('a custom disallowedElements list replaces the default', () => {
    const checker = createSafetyChecker({ mode: 'warn', disallowedElements: ['image'] });
    // image is now disallowed…
    expect(checker.check(wrap('<image href="http://evil/x.png"/>')).passed).toBe(false);
    // …and script is no longer checked (the list is replaced, not extended)
    expect(checker.check(wrap('<script>alert(1)</script>')).passed).toBe(true);
  });

  it('accumulates multiple issues in one result', () => {
    const checker = createSafetyChecker({ mode: 'warn', maxBytes: 10 });
    const result = checker.check(
      wrap(`<script>alert(1)</script><!--${'x'.repeat(100)}-->`),
    );
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(2);
  });
});

describe('createSafetyChecker — warn vs error modes', () => {
  const BAD_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';

  it("warn mode flags issues with severity 'warning'", () => {
    const result = createSafetyChecker({ mode: 'warn' }).check(BAD_SVG);
    expect(result.passed).toBe(false);
    expect(result.issues.every((issue) => issue.severity === 'warning')).toBe(true);
  });

  it("error mode flags issues with severity 'error'", () => {
    const result = createSafetyChecker({ mode: 'error' }).check(BAD_SVG);
    expect(result.passed).toBe(false);
    expect(result.issues.every((issue) => issue.severity === 'error')).toBe(true);
  });

  it('carries the source label on every issue', () => {
    const result = createSafetyChecker({ mode: 'warn' }).check(
      BAD_SVG,
      'file icons/evil.svg',
    );
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.every((issue) => issue.source === 'file icons/evil.svg')).toBe(true);
  });
});
