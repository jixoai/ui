/**
 * Density context lock (design-language-kernel P3). The Svelte
 * channel: resolution law (explicit ?? inherited ?? 'default'),
 * getter-backed reactivity, nested shadowing, and the no-pixels
 * policy of the module surface. The css scope channel is gated by
 * verify-density-kernel.mjs on real Chromium.
 *
 * context-plugin-v2 D3-C: the resolution-law its run INSIDE a
 * component window (unit-resolve-host) — resolveDensity reads the
 * plugin scope, and outside a window Svelte's own
 * lifecycle_outside_component propagates (the hard contract; the
 * retired degradation is the kernel spec's throw assertion).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/density-context-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { resolveDensity, DEFAULT_DENSITY, type DensityContext } from '../src/lib/density.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const moduleSource = readFileSync(resolve(specDir, '../src/lib/density.svelte.ts'), 'utf8');

/** the in-window resolve carrier: compute runs inside the host's
 *  $derived (rootless — no provider, no plugin root), onvalue reports
 *  the outcome array back here */
const resolveInWindow = (compute: () => unknown): unknown => {
  const holder: { value?: unknown; error?: unknown } = {};
  render(UnitResolveHost, {
    props: {
      compute,
      onvalue: (value, error) => {
        holder.value = value;
        holder.error = error;
      },
    },
  });
  flushSync();
  expect(holder.error).toBeUndefined();
  return holder.value;
};

describe('density context — the policy channel', () => {
  it('resolution law: explicit ?? inherited ?? optional local fallback; no opinion = undefined', () => {
    const inherited: DensityContext = { density: 'sm' };
    expect(
      resolveInWindow(() => [
        resolveDensity('lg', inherited),
        resolveDensity(undefined, inherited),
        // no opinion resolves to UNDEFINED — the consumer stamps nothing
        // so the ambient css scope channel flows through (fleet law
        // 2026-08-28, generalizing the chrome-density-tier nav ruling)
        resolveDensity(undefined, undefined),
        // a local fallback is a REAL opinion (Table defaults sm)
        resolveDensity(undefined, undefined, 'sm'),
      ]),
    ).toEqual(['lg', 'sm', undefined, 'sm']);
    expect(resolveInWindow(() => resolveDensity(undefined, undefined))).not.toBe(DEFAULT_DENSITY);
  });

  it('an undefined opinion flows through exactly like no context (chrome-density-tier r3)', () => {
    const noOpinion: DensityContext = { density: undefined };
    expect(
      resolveInWindow(() => [resolveDensity(undefined, noOpinion), resolveDensity('lg', noOpinion)]),
    ).toEqual([undefined, 'lg']);
  });

  it('providers stamp data-density; nested providers shadow; explicit wins', () => {
    const { container } = render(Host);
    const scopes = [...container.querySelectorAll('[data-density]')];
    // outer sm → inner xs (shadowing) → explicit lg leaf inside xs
    expect(scopes.map((el) => el.getAttribute('data-density'))).toEqual([
      'sm',
      'xs',
      'lg',
    ]);
  });

  it('the context is getter-backed — provider prop changes re-stamp live', async () => {
    const { container, rerender } = render(Host);
    await rerender({ outer: 'lg' });
    expect(container.querySelector('[data-density]')!.getAttribute('data-density')).toBe('lg');
    // the nested provider still shadows with its own explicit value
    expect(container.querySelectorAll('[data-density="xs"]').length).toBe(1);
  });

  it('the module owns policy only — no pixels, no style writes, no cn', () => {
    // comments may mention the policy; the CODE may not violate it
    const code = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\d+px/);
    expect(code).not.toMatch(/\.style\b|setProperty|classList/);
    expect(code).not.toMatch(/: any|as any/);
  });
});
