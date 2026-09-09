/**
 * The Select commit-hook gates (issue #6, 2026-09-10): passing onchange
 * used to ride the rest lane onto the trigger BUTTON — where the native
 * change event never fires — a silently dead binding (six broken usages
 * shipped in ai-fly's webui before anyone noticed). The prop is now a
 * typed channel owning the commit path: it fires with the newly
 * committed value alongside the bind:value write, on every commit route
 * (click, Enter, Space — all funnel through choose()).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Select from '$lib/ui/select/select.svelte';
import Host from './fixtures/select-onchange-host.svelte';

const here = import.meta.dirname;

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

const optionBy = (c: HTMLElement, text: string): Element =>
  [...c.querySelectorAll('[role="option"]')].find((el) => el.textContent?.includes(text))!;

describe('Select onchange — the commit hook (issue #6)', () => {
  it('fires with the committed value on the click path', async () => {
    const seen: string[] = [];
    const { container } = render(Select, {
      props: { options, onchange: (v: string) => seen.push(v) },
    });
    await fireEvent.click(optionBy(container, 'Beta'));
    expect(seen).toEqual(['b']);
  });

  it('bind:value and onchange stay in lockstep (the sugar contract)', async () => {
    const { container } = render(Host);
    await fireEvent.click(optionBy(container, 'Beta'));
    expect(container.querySelector('[data-testid="onchange-readout"]')!.textContent).toBe('b');
    expect(container.querySelector('[data-testid="bound-value"]')!.textContent).toBe('b');
  });

  it('a disabled row neither commits nor fires', async () => {
    const seen: string[] = [];
    const { container } = render(Select, {
      props: { options, onchange: (v: string) => seen.push(v) },
    });
    await fireEvent.click(optionBy(container, 'Gamma'));
    expect(seen).toEqual([]);
  });

  it('the dead rest lane is closed at the source (the trigger can never see onchange)', () => {
    const src = readFileSync(resolve(here, '../src/lib/ui/select/select.svelte'), 'utf8');
    // omitted from the rest contract, destructured before ...rest, and
    // fired from the one commit funnel
    expect(src).toContain("Omit<HTMLButtonAttributes, 'onchange'>");
    expect(src).toMatch(/let \{[\s\S]*?onchange,[\s\S]*?\.\.\.rest/s);
    expect(src).toMatch(/value = option\.value;\s*\n\s*onchange\?\.\(value\)/);
  });
});
