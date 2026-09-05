/**
 * Packet A density adoption lock (2026-08-26): every form-text family owns
 * one density policy prop, resolves inherited context, and stamps movable
 * roots. This focused suite exercises the real component roots and the
 * closed control aliases used by their geometry.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Input from '../src/lib/ui/input/input.svelte';
import Textarea from '../src/lib/ui/textarea/textarea.svelte';
import Select from '../src/lib/ui/select/select.svelte';
import NativeSelect from '../src/lib/ui/native-select/native-select.svelte';
import NumberInput from '../src/lib/ui/number-input/number-input.svelte';
import TagsInput from '../src/lib/ui/tags-input/tags-input.svelte';
import InputOtp from '../src/lib/ui/input-otp/input-otp.svelte';
import FileInput from '../src/lib/ui/file-input/file-input.svelte';

const empty: Snippet = (() => {}) as Snippet;
const sourceRoot = resolve(import.meta.dirname, '../../..');

describe('packet A form-text density adoption', () => {
  it('stamps explicit density on every family root', () => {
    const cases = [
      render(Input, { props: { density: 'xs' } }),
      render(Textarea, { props: { density: 'sm' } }),
      render(Select, { props: { density: 'default', options: [{ value: 'a', label: 'A' }] } }),
      render(NativeSelect, { props: { density: 'lg', children: empty } }),
      render(NumberInput, { props: { density: 'xs' } }),
      render(TagsInput, { props: { density: 'sm' } }),
      render(InputOtp, { props: { density: 'default' } }),
      render(FileInput, { props: { density: 'lg' } }),
    ];
    expect(cases.map(({ container }) => container.querySelector('[data-density]')?.getAttribute('data-density')))
      .toEqual(['xs', 'sm', 'default', 'lg', 'xs', 'sm', 'default', 'lg']);
  });

  it('stamps the 2xs rung — the opt-in pro-tool operation scope (2026-09-05-density-2xs)', () => {
    // 2xs widens the union, not the policy: one prop, one stamp — the
    // scoped 6U hit floor it switches on is the css channel's business
    // (verify-density-kernel.mjs), jsdom only proves the stamp
    const { container } = render(Textarea, { props: { density: '2xs' } });
    expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('2xs');
  });

  it('keeps the public seam closed: density is the only policy prop', () => {
    for (const family of ['input', 'textarea', 'select', 'native-select', 'number-input', 'tags-input', 'input-otp', 'file-input']) {
      const source = readFileSync(resolve(sourceRoot, `registry/files/ui/${family}/${family}.svelte`), 'utf8');
      expect(source).toContain('density?: Density');
      expect(source).not.toMatch(/controlSize|ItemSize|data-size/);
    }
  });

  it('uses only closed density aliases for owned footprint classes', () => {
    const files = [
      'input/input.svelte', 'textarea/textarea.svelte', 'select/select.svelte',
      'native-select/native-select.svelte', 'number-input/number-input.svelte',
      'tags-input/tags-input.svelte', 'input-otp/input-otp.svelte', 'file-input/file-input.svelte',
    ];
    for (const file of files) {
      const source = readFileSync(resolve(sourceRoot, `registry/files/ui/${file}`), 'utf8');
      const tokens = [...source.matchAll(/--jx-d-[a-z-]+/g)].map((match) => match[0]);
      expect(tokens.filter((token) => !token.startsWith('--jx-d-ctl-') && ![
        '--jx-d-secondary-text', '--jx-d-leading', '--jx-d-stack-gap', '--jx-d-row-min',
        '--jx-d-hit-min', '--jx-d-text', '--jx-d-line', '--jx-d-inline-inset', '--jx-d-inline-gap',
      ].includes(token))).toEqual([]);
    }
  });
});
