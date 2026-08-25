/**
 * Density context lock (design-language-kernel P3). The Svelte
 * channel: resolution law (explicit ?? inherited ?? 'default'),
 * getter-backed reactivity, nested shadowing, and the no-pixels
 * policy of the module surface. The css scope channel is gated by
 * verify-density-kernel.mjs on real Chromium.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/density-context-host.svelte';
import { resolveDensity, DEFAULT_DENSITY } from '../src/lib/density.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const moduleSource = readFileSync(resolve(specDir, '../src/lib/density.svelte.ts'), 'utf8');

describe('density context — the policy channel', () => {
  it('resolution law: explicit ?? inherited ?? default', () => {
    const inherited = { density: 'sm' as const };
    expect(resolveDensity('lg', inherited)).toBe('lg');
    expect(resolveDensity(undefined, inherited)).toBe('sm');
    expect(resolveDensity(undefined, undefined)).toBe(DEFAULT_DENSITY);
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
