/**
 * The system trio gates (system-dialog, 2026-09-09 — Owner: "它需要
 * 承担 window.alert/window.prompt/window.confirm 这三种弹窗的职责").
 * The imperative api mounts the family at the CENTER pose (a system
 * dialog has no trigger to anchor beside) and resolves EXACTLY ONCE:
 * an affirmative action resolves its value, any close without an
 * action resolves the cancel value (false / null). jsdom degrades the
 * popover engine (guarded in Content) — the state machine, the
 * resolution seams, and the DOM contract all stay assertable.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { alert, confirm, prompt } from '$lib/ui/system-dialog/system-dialog.svelte.ts';

const here = import.meta.dirname;

/** the NEWEST mounted panel: a resolved host unmounts 500ms later
 *  (the exit window), so a fast test suite still sees the previous
 *  test's dead panel in the body — the last one is always ours */
const panelOf = (root: HTMLElement): HTMLElement => {
  const all = root.querySelectorAll('[popover="manual"][role="alertdialog"]');
  return all[all.length - 1]!;
};

describe('confirm — the window.confirm posture', () => {
  it('the affirmative action resolves true', async () => {
    let result: boolean | undefined;
    confirm({ title: 'delete?', description: 'this cannot be undone' }).then((v) => (result = v));
    const panel = panelOf(document.body);
    expect(panel.getAttribute('data-pose')).toBe('center');
    expect(panel.textContent).toContain('delete?');
    await fireEvent.click(panel.querySelector('[data-jx-sysdlg-action]')!);
    await waitFor(() => expect(result).toBe(true));
  });

  it('the cancel resolves false; a bare string shorthand fills the title', async () => {
    let result: boolean | undefined;
    confirm('discard changes?').then((v) => (result = v));
    const panel = panelOf(document.body);
    expect(panel.textContent).toContain('discard changes?');
    await fireEvent.click(panel.querySelector('[data-jx-sysdlg-cancel]')!);
    await waitFor(() => expect(result).toBe(false));
  });

  it('Escape resolves the cancel value through the shared close path', async () => {
    let result: boolean | undefined;
    confirm('sure?').then((v) => (result = v));
    const panel = panelOf(document.body);
    await fireEvent.keyDown(panel, { key: 'Escape' });
    await waitFor(() => expect(result).toBe(false));
  });
});

describe('prompt — the window.prompt posture', () => {
  it('typing then submitting resolves the string', async () => {
    let result: string | null | undefined;
    prompt({ title: 'rename', inputLabel: 'name', initialValue: 'ui' }).then(
      (v) => (result = v),
    );
    const panel = panelOf(document.body);
    const input = panel.querySelector<HTMLInputElement>('[data-jx-sysdlg-prompt-input]')!;
    expect(input).not.toBeNull();
    input.value = 'ui-labs';
    await fireEvent.input(input);
    await fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(result).toBe('ui-labs'));
  });

  it('Escape resolves null (never a string)', async () => {
    let result: string | null | undefined;
    prompt('rename?').then((v) => (result = v));
    const panel = panelOf(document.body);
    await fireEvent.keyDown(panel, { key: 'Escape' });
    await waitFor(() => expect(result).toBeNull());
  });
});

describe('alert — the window.alert posture', () => {
  it('a single affirmative action resolves (no cancel is mounted)', async () => {
    let settled = false;
    alert({ title: 'saved', description: 'the key rotated' }).then(() => (settled = true));
    const panel = panelOf(document.body);
    expect(panel.querySelector('[data-jx-sysdlg-cancel]')).toBeNull();
    expect(panel.textContent).toContain('saved');
    await fireEvent.click(panel.querySelector('[data-jx-sysdlg-action]')!);
    await waitFor(() => expect(settled).toBe(true));
  });

  it('the strip still splits evenly under the Separator rim (the carved law holds)', async () => {
    confirm('discard?');
    const panel = panelOf(document.body);
    const strip = panel.querySelector('[data-jx-sysdlg-actions]')!;
    expect(strip.querySelector(':scope > hr, :scope > [data-jx-separator]')).not.toBeNull();
    const group = strip.querySelector(':scope > [data-jx-btngroup]')!;
    expect(group.className).toContain('w-full');
    await fireEvent.click(panel.querySelector('[data-jx-sysdlg-cancel]')!);
  });
});

describe('the mount lifecycle', () => {
  it('the host unmounts after the exit window (no leaking DOM)', async () => {
    let done = false;
    alert('bye').then(() => (done = true));
    const before = panelOf(document.body);
    expect(before).not.toBeNull();
    await fireEvent.click(before.querySelector('[data-jx-sysdlg-action]')!);
    await waitFor(() => expect(done).toBe(true));
    // EXIT_MS (500) later the mount target leaves the body entirely
    await new Promise((r) => setTimeout(r, 650));
    expect(document.body.contains(before)).toBe(false);
  });
});

describe('the corner context (the mobile-dev ruling: publish, never clip)', () => {
  it('the surface publishes --jx-corner; the split cells pair it concentrically', () => {
    const css = readFileSync(
      resolve(here, '../src/lib/ui/system-dialog/system-dialog.css'),
      'utf8',
    );
    // the PROVIDER: the surface declares its corner once (mirroring the
    // theme's --radius source its own `rounded` rides) — the lane is
    // css inheritance, the platform's context mechanism, SSR-pure
    expect(css).toMatch(/\[data-jx-sysdlg\]\)\s*\{[^}]*--jx-corner: var\(--radius, 0px\)/s);
    // the CONCENTRIC PAIRING: first cell end-start, last cell end-end —
    // never a clip on the surface (the engrave shadow must never shear)
    expect(css).toMatch(/:first-child\s*\{\s*border-end-start-radius: var\(--jx-corner, 0px\)/s);
    expect(css).toMatch(/:last-child\s*\{\s*border-end-end-radius: var\(--jx-corner, 0px\)/s);
    // the kernel's cluster pairs the same lane (inert at 0 without a
    // provider — every square surface stays exactly as it was)
    const footerCss = readFileSync(
      resolve(here, '../src/lib/ui/card/card-footer.css'),
      'utf8',
    );
    expect(footerCss).toMatch(/\[data-jx-btngroup\] > :last-child\s*\{[^}]*border-end-end-radius: var\(--jx-corner, 0px\)/s);
  });
});

// keep the render import honest for future DOM-face hosts
void render;
