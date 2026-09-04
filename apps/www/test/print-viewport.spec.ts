/**
 * print-viewport — the re-scope channel's unit lane
 * (print-determinism, 2026-09-04). The jsdom surface pins the
 * transform's CONTRACT; the browser differential (verify-print 2l)
 * is the acceptance definition — this file locks the mechanics:
 * disabling originals reversibly, synthesizing container queries at
 * the same cascade layer, the tw4 max- inversion, the loud-fallback
 * family, viewport-unit declaration overrides, and the zero-residue
 * disarm.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, unmount } from 'svelte';
import {
  armPrintViewport,
  PRINT_VIEWPORT_CONTAINER,
  VIEWPORT_RESCOPE_STYLE_ATTR,
} from '../src/lib/print/print-viewport.svelte';

/** inject a <style> and return its sheet (jsdom parses style text) */
const inject = (css: string): HTMLStyleElement => {
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
  return el;
};

const channelStyle = (): HTMLStyleElement | null =>
  document.head.querySelector(`style[${VIEWPORT_RESCOPE_STYLE_ATTR}]`);

describe('print-viewport — the viewport→page re-scope channel', () => {
  const cleanups: (() => void)[] = [];
  afterEach(() => {
    while (cleanups.length) cleanups.pop()();
    document.head.querySelectorAll(`style[${VIEWPORT_RESCOPE_STYLE_ATTR}]`).forEach((s) => s.remove());
  });

  it('re-scopes a width query: original disabled reversibly, container twin synthesized', () => {
    const sheet = inject('@media (width >= 48rem) { .a { color: red } }');
    cleanups.push(() => sheet.remove());
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    const media = (sheet.sheet!.cssRules[0] as CSSMediaRule).media;
    expect(media.mediaText).toContain('not all');
    const synth = channelStyle();
    expect(synth?.textContent).toContain(`@container ${PRINT_VIEWPORT_CONTAINER} (width >= 48rem)`);
    expect(synth?.textContent).toContain('color: red');
    expect(report.rescopeCount).toBe(1);
    disarm();
    expect(media.mediaText).not.toContain('not all');
    expect(channelStyle()).toBeNull();
  });

  it('preserves the cascade layer and non-width media wrappers on the chain', () => {
    const sheet = inject('@layer utilities { @media print { @media (min-width: 40rem) { .b { float: left } } } }');
    cleanups.push(() => sheet.remove());
    const { disarm } = armPrintViewport();
    cleanups.push(disarm);
    const text = channelStyle()?.textContent ?? '';
    expect(text).toContain('@layer utilities');
    expect(text).toContain('@media print');
    expect(text).toContain(`@container ${PRINT_VIEWPORT_CONTAINER}`);
    expect(text.indexOf('@layer utilities')).toBeLessThan(text.indexOf('@media print'));
    expect(text.indexOf('@media print')).toBeLessThan(text.indexOf('@container'));
  });

  it('the tw4 max- inversion: `not all and (width >= 64rem)` becomes (width < 64rem) — never a fallback', () => {
    const sheet = inject('@media not all and (width >= 64rem) { .c { display: none } }');
    cleanups.push(() => sheet.remove());
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    expect(report.rescopeCount).toBe(1);
    expect(report.fallbackCount).toBe(0);
    expect(channelStyle()?.textContent).toContain(`@container ${PRINT_VIEWPORT_CONTAINER} (width < 64rem)`);
  });

  it('non-width queries are never the channel\'s business — untouched', () => {
    const sheet = inject('@media (hover: hover) { .d { opacity: 1 } } @media print { .e { color: blue } }');
    cleanups.push(() => sheet.remove());
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    expect(report.rescopeCount).toBe(0);
    expect(report.fallbackCount).toBe(0);
    const medias = [...sheet.sheet!.cssRules].map((r) => (r as CSSMediaRule).media.mediaText);
    expect(medias.every((m) => !m.includes('not all'))).toBe(true);
    expect(channelStyle()?.textContent ?? '').not.toContain('@container');
  });

  it('height-family and screen-typed width queries degrade loudly — disabled, warned, never thrown', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    cleanups.push(() => warn.mockRestore());
    const sheet = inject(
      '@media (min-height: 40rem) { .f { color: red } } @media screen and (min-width: 48rem) { .g { color: green } }',
    );
    cleanups.push(() => sheet.remove());
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    expect(report.fallbackCount).toBe(2);
    expect(warn).toHaveBeenCalledTimes(2);
    const medias = [...sheet.sheet!.cssRules].map((r) => (r as CSSMediaRule).media.mediaText);
    expect(medias.every((m) => m.includes('not all'))).toBe(true);
    disarm();
    const restored = [...sheet.sheet!.cssRules].map((r) => (r as CSSMediaRule).media.mediaText);
    expect(restored.every((m) => !m.includes('not all'))).toBe(true);
  });

  it('viewport-unit DECLARATIONS get pose overrides (vw→cqw) — the original rule stays untouched', () => {
    // plain units (not clamp()): jsdom's cssstyle drops modern function
    // values it cannot parse — the clamp family is covered by the real
    // browser differential (verify-print 2l), this lane pins the
    // transform mechanics on parseable declarations
    const sheet = inject('.hero { width: 50vw; color: red }');
    cleanups.push(() => sheet.remove());
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    expect(report.unitOverrideCount).toBe(1);
    const text = channelStyle()?.textContent ?? '';
    expect(text).toContain('50cqw');
    expect(text).toContain('width: 50cqw');
    // the untouched halves ride along verbatim
    expect(text).toContain('color: red');
    // the original rule is NOT disabled (declaration overrides win by
    // pose-scoped source order — the web face outside the pose never
    // sees the synthetic sheet at all)
    expect((sheet.sheet!.cssRules[0] as CSSStyleRule).style.cssText).toContain('50vw');
  });

  it('the container declaration rides the synthetic unit and the report is probe-readable', () => {
    inject('@media (width >= 40rem) { .h { color: red } }');
    const { report, disarm } = armPrintViewport();
    cleanups.push(disarm);
    const synth = channelStyle();
    expect(synth?.textContent).toContain(`container-name: ${PRINT_VIEWPORT_CONTAINER}`);
    expect(synth?.getAttribute('data-report')).toContain('"rescopeCount":1');
  });
});
