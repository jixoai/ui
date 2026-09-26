/**
 * Press-effect fill BASIS suite (test/press-fill-basis.spec.ts,
 * timeline-reui-progress-upgrade W1, 2026-09-15).
 *
 * The Owner's r2 correction: the AUTO fill (and solidFill's default
 * base) rides the theme scope's --background TOKEN — the SAME basis as
 * text/border — never a measured ancestor background. The full pixel
 * battery (light stage + dark glass-band, live flips, rainbow parity)
 * is research/w1/fill-scope-token-probe.mjs against the dev server;
 * this file pins the resolver's UNIT contract under jsdom:
 *
 *  - the explicit-fill regression: solidFill(cssColor, base) composites
 *    unchanged (explicit bases never consult the scope at all);
 *  - the HOSTLESS token base: solidFill(color) with no base reads the
 *    document ROOT's --background (jsdom has no cascade — the inline
 *    custom property IS the root's computed value) through color-utils'
 *    oklch bridge;
 *  - the nearest-scope-wins walk (self included), the raw-string
 *    slash-alpha pre-pass (absent / `/ 1` / `/ 100%` proceed; `/ none`,
 *    < 1, unparsable fall to the white/black ladder), and the
 *    no-document world (contextIsDark's matchMedia guard answers
 *    light in jsdom — white);
 *  - the retirement: contextBase/contextBaseCss are GONE from the
 *    module surface (the measured walk's exports deleted with it).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as runtime from '../src/lib/ui/press-button/press-effect-runtime';

const { contextCanvasCss, solidFill } = runtime;

// jsdom computes no cascade: an inline custom property on
// document.documentElement IS the root's computed --background — the
// stub the hostless base reads
const stubRootToken = (token: string): void => {
  document.documentElement.style.setProperty('--background', token);
};

describe('the fill auto basis — the theme scope token', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--background');
    document.body.querySelector('[data-fill-basis-fixture]')?.remove();
  });

  it('the retirement: contextBase/contextBaseCss are gone, contextCanvasCss is the surface', () => {
    expect(runtime).not.toHaveProperty('contextBase');
    expect(runtime).not.toHaveProperty('contextBaseCss');
    expect(typeof contextCanvasCss).toBe('function');
  });

  it('the explicit-fill regression: rgba(255,255,255,.35) over an explicit base composites unchanged', () => {
    // 0.35·255 + 0.65·10 = 95.75 → 96 (0x60) per channel — the explicit
    // base path predates and survives the basis correction untouched
    expect(solidFill('rgba(255, 255, 255, 0.35)', '#0a0a0a')).toBe(0x606060);
  });

  it('hostless solidFill composites over the document-root token (the oklch bridge)', () => {
    // a red half-tint discriminates the base channels: over white →
    // (255, 128, 128); over black → (128, 0, 0)
    stubRootToken('oklch(1 0 0)');
    expect(solidFill('rgba(255, 0, 0, 0.5)')).toBe(0xff8080);
    stubRootToken('oklch(0 0 0)');
    expect(solidFill('rgba(255, 0, 0, 0.5)')).toBe(0x800000);
    // hex tokens ride the same bridge (250, 250, 250): r rounds 252.5→253
    stubRootToken('#fafafa');
    expect(solidFill('rgba(255, 0, 0, 0.5)')).toBe(0xfd7d7d);
  });

  it('contextCanvasCss parses the root token to an rgb() string', () => {
    stubRootToken('oklch(1 0 0)');
    expect(contextCanvasCss()).toBe('rgb(255 255 255)');
    stubRootToken('oklch(0.145 0 0)');
    expect(contextCanvasCss()).toBe('rgb(10 10 10)');
  });

  it('the walk is SELF-included and the nearest scope outranks the root token', () => {
    stubRootToken('oklch(0 0 0)'); // the root says black…
    const scope = document.createElement('div');
    scope.dataset.fillBasisFixture = '';
    scope.className = 'jx-light';
    scope.style.setProperty('--background', 'oklch(1 0 0)'); // …the scope says white
    const host = document.createElement('button');
    scope.append(host);
    document.body.append(scope);
    expect(contextCanvasCss(host)).toBe('rgb(255 255 255)'); // the scope wins
    // self-included: the host itself carrying the scope marker is the scope
    host.setAttribute('data-theme', 'dark');
    host.style.setProperty('--background', '#123456');
    expect(contextCanvasCss(host)).toBe('rgb(18 52 86)');
  });

  it('the slash-alpha pre-pass judges the RAW token: opaque proceeds, the rest falls back', () => {
    stubRootToken('oklch(0 0 0 / 1)');
    expect(contextCanvasCss()).toBe('rgb(0 0 0)'); // `/ 1` proceeds
    stubRootToken('oklch(0 0 0 / 100%)');
    expect(contextCanvasCss()).toBe('rgb(0 0 0)'); // `/ 100%` proceeds
    // jsdom's unscoped root + absent matchMedia → contextIsDark false → white
    stubRootToken('oklch(0 0 0 / 0.5)');
    expect(contextCanvasCss()).toBe('#ffffff'); // alpha < 1 → the ladder
    stubRootToken('oklch(0 0 0 / none)');
    expect(contextCanvasCss()).toBe('#ffffff'); // css "missing component" → the ladder
    stubRootToken('oklch(0 0 0 / junk)');
    expect(contextCanvasCss()).toBe('#ffffff'); // unparsable alpha → the ladder
    stubRootToken('not-a-color');
    expect(contextCanvasCss()).toBe('#ffffff'); // unparsable token → the ladder
    stubRootToken('');
    expect(contextCanvasCss()).toBe('#ffffff'); // no token → the ladder
  });

  it('a DARK scope with a bad token takes the ladder\'s black arm', () => {
    const scope = document.createElement('div');
    scope.dataset.fillBasisFixture = '';
    scope.className = 'dark';
    scope.style.setProperty('--background', 'oklch(0 0 0 / 0.5)');
    const host = document.createElement('button');
    scope.append(host);
    document.body.append(scope);
    expect(contextCanvasCss(host)).toBe('#000000');
  });

  it('no document at all → the white/black ladder by contextIsDark (light in jsdom)', () => {
    vi.stubGlobal('document', undefined);
    try {
      expect(contextCanvasCss()).toBe('#ffffff');
      expect(solidFill('rgba(255, 0, 0, 0.5)')).toBe(0xff8080); // over white
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
