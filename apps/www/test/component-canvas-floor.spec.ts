/**
 * ComponentCanvas floor suite (test/component-canvas-floor.spec.ts,
 * canvas-floor-lab 2026-08-30).
 *
 * The floor gates, read through the DOM:
 * 1. OUTLINE — the canvas root carries data-toc-skip, the title is a
 *    styled paragraph (no h2), and deriveTocOutline over a page wrapper
 *    yields the page's own sections only.
 * 2. STAGE TOGGLES — light/dark + comfortable/compact segmented pairs
 *    set data-theme/data-density (mapped onto the theme sheet's own
 *    scope vocabulary: compact → 'sm') on the STAGE element only, with
 *    the theme sheet's dark/jx-light token-scope class riding along;
 *    bind:theme/bind:density write back to the page (ownership law);
 *    sibling canvases are untouched.
 * 3. DRAWER SHAPE — ≤2 files render a real tablist (roving tabindex,
 *    aria-selected, arrows select) over ONE CodeCard with no tree
 *    pane; ≥3 files keep the tree. Drawer default = the usage file.
 * 4. INSTALL BADGE — copies `npx jixoai-ui add <name>` with a flash.
 * 5. DERIVATION — registrySourceUrl projects the registry path for the
 *    six pilot items onto existing files (fs check), and no pilot page
 *    carries a literal sourceUrl="https://…" attribute (the no-github
 *    -href law, scoped to source links; demo href anchors are content).
 * 6. SCHEMA COEXISTENCE — schema rows + stage toggles + tabs in one
 *    canvas (schema mode must not regress under the floor rework).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registrySourcePath, registrySourceUrl } from '$lib/registry-source';
import { deriveTocOutline } from '$lib/toc-outline';

import CanvasFloorHost from './fixtures/canvas-floor-host.svelte';
import CanvasFloorSchemaHost from './fixtures/canvas-floor-schema-host.svelte';

// walk up from the cwd to the repo root (registry.json marker) — vitest
// may be launched from apps/www or the workspace root
const repoRoot = (() => {
  let dir = process.cwd();
  for (let i = 0; i < 5 && !existsSync(join(dir, 'registry.json')); i++) {
    dir = dirname(dir);
  }
  return resolve(dir);
})();

const stages = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('[data-jx-canvas-stage]')];

describe('floor: the canvas stays out of the outline', () => {
  it('root carries data-toc-skip; the title is a styled paragraph, not a heading', () => {
    const { container } = render(CanvasFloorHost);
    const roots = container.querySelectorAll('[data-jx-canvas]');
    expect(roots.length).toBe(2);
    for (const root of roots) expect(root.hasAttribute('data-toc-skip')).toBe(true);
    const title = container.querySelector('p[data-jx-canvas-title]')!;
    expect(title.textContent).toBe('floor widget');
    // no h1/h2 rides the canvas chrome; the pane h3 is the only heading
    const headings = container.querySelectorAll('[data-jx-canvas] h1, [data-jx-canvas] h2');
    expect(headings.length).toBe(0);
  });

  it('deriveTocOutline yields the page section only — no canvas-internal headings', () => {
    const { container } = render(CanvasFloorHost);
    const entries = deriveTocOutline(container.querySelector('[data-testid="floor-root"]')!);
    expect(entries.map((e) => e.label)).toEqual(['page section']);
  });
});

describe('floor: stage theme/density toggles', () => {
  it('projects data-theme + the theme sheet scope class onto the stage only', async () => {
    const { container } = render(CanvasFloorHost);
    const [floorStage, treeStage] = stages(container);
    expect(floorStage.getAttribute('data-theme')).toBe('light');
    expect(floorStage.classList.contains('jx-light')).toBe(true);

    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-option="dark"]')!,
    );
    expect(floorStage.getAttribute('data-theme')).toBe('dark');
    expect(floorStage.classList.contains('dark')).toBe(true);
    // the page-owned binding reflects the change (ownership law)
    expect(
      container.querySelector<HTMLElement>('[data-testid="stage-demo"]')!.getAttribute('data-theme'),
    ).toBe('dark');
    // sibling canvas untouched (scoping law)
    expect(treeStage.getAttribute('data-theme')).toBe('light');
  });

  it('compact maps onto the sm density scope; comfortable pins default', async () => {
    const { container } = render(CanvasFloorHost);
    const [floorStage] = stages(container);
    expect(floorStage.getAttribute('data-density')).toBe('default');

    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-density-option="compact"]')!,
    );
    expect(floorStage.getAttribute('data-density')).toBe('sm');
    expect(
      container.querySelector<HTMLElement>('[data-testid="stage-demo"]')!.getAttribute('data-density'),
    ).toBe('compact');

    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-density-option="comfortable"]')!,
    );
    expect(floorStage.getAttribute('data-density')).toBe('default');
  });

  it('segments are aria-pressed groups painted per the jx segmented law', () => {
    const { container } = render(CanvasFloorHost);
    const themeSeg = container.querySelector<HTMLElement>('[data-jx-canvas-theme-seg]')!;
    expect(themeSeg.getAttribute('role')).toBe('group');
    const dark = container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-option="dark"]')!;
    expect(dark.className).toContain('jx-canvas-seg-btn');
    expect(dark.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('floor: the two-file drawer renders tabs, the ≥3 tree stays', () => {
  it('≤2 files: filename tablist over one CodeCard, no tree pane', async () => {
    const { container } = render(CanvasFloorHost);
    const floor = container.querySelector('[data-jx-canvas]')!;
    const tabs = floor.querySelector<HTMLElement>('[data-jx-canvas-tabs]')!;
    expect(tabs.getAttribute('role')).toBe('tablist');
    const tabButtons = [...tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabButtons.length).toBe(2);
    expect(floor.querySelector('.jx-canvas-tree')).toBeNull();
    expect(floor.querySelectorAll('.jx-code-card, [data-jx-code-card]').length).toBe(1);

    // drawer default = the usage file (second tab selected)
    expect(tabButtons[1].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons[1].tabIndex).toBe(0);
    expect(tabButtons[0].getAttribute('aria-selected')).toBe('false');

    // click swaps the single CodeCard's file + selection
    await fireEvent.click(tabButtons[0]);
    expect(tabButtons[0].getAttribute('aria-selected')).toBe('true');
    expect(floor.querySelector('.jx-code-card')!.textContent).toContain('source');

    // panel ↔ tab wiring
    const panel = floor.querySelector('[role="tabpanel"]')!;
    expect(panel.getAttribute('aria-labelledby')).toBe(tabButtons[0].id);
  });

  it('arrow keys move selection (automatic activation, roving tabindex)', async () => {
    const { container } = render(CanvasFloorHost);
    const tabs = container.querySelector<HTMLElement>('[data-jx-canvas-tabs]')!;
    const [first, second] = [...tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    second.focus();
    await fireEvent.keyDown(tabs, { key: 'ArrowLeft' });
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(first);
    await fireEvent.keyDown(tabs, { key: 'End' });
    expect(second.getAttribute('aria-selected')).toBe('true');
  });

  it('≥3 files: the tree pane stays, no tablist', () => {
    const { container } = render(CanvasFloorHost);
    const canvases = [...container.querySelectorAll('[data-jx-canvas]')];
    const treeCanvas = canvases.find((c) =>
      c.querySelector('[data-jx-canvas-playground-title]') === null && c !== canvases[0],
    )!;
    expect(treeCanvas.querySelector('.jx-canvas-tree')).not.toBeNull();
    expect(treeCanvas.querySelector('[data-jx-canvas-tabs]')).toBeNull();
  });
});

describe('floor: the install badge', () => {
  const writeText = vi.fn(() => Promise.resolve());
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies the install command with a clipboard flash', async () => {
    const { container } = render(CanvasFloorHost);
    const badge = container.querySelector<HTMLButtonElement>('[data-jx-canvas-install]')!;
    expect(badge.textContent).toContain('npx jixoai-ui add press-button');
    await fireEvent.click(badge);
    expect(writeText).toHaveBeenCalledWith('npx jixoai-ui add press-button');
    expect(badge.getAttribute('aria-label')).toBe('Install command copied');
    // absent install prop → no badge on the second canvas
    const canvases = [...container.querySelectorAll('[data-jx-canvas]')];
    expect(canvases[1].querySelector('[data-jx-canvas-install]')).toBeNull();
  });
});

describe('floor: the lab follows the controls (typed state object)', () => {
  it('control change re-renders the snippet; reset restores; projection tracks', async () => {
    const { container } = render(CanvasFloorHost);
    const outputRows = container.querySelectorAll('[data-jx-canvas-output-row]');
    expect(outputRows.length).toBe(1);
    expect(outputRows[0].querySelector('dd')!.textContent).toBe('fill');

    // flip the variant select → snippet + projection follow (the kit row
    // rides ItemField — the select lives inside the playground pane)
    const select = container.querySelector<HTMLSelectElement>('.jx-canvas-playground select')!;
    await fireEvent.change(select, { target: { value: 'tonal' } });
    expect(outputRows[0].querySelector('dd')!.textContent).toBe('tonal');
    await fireEvent.click(container.querySelector<HTMLButtonElement>('.jx-canvas-code-toggle')!);
    const drawer = container.querySelector<HTMLElement>('.jx-canvas-code-drawer')!;
    expect(drawer.textContent).toContain('variant="tonal"');

    // reset restores the documented default
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!);
    expect(outputRows[0].querySelector('dd')!.textContent).toBe('fill');
  });
});

describe('floor: schema mode coexistence (no regression)', () => {
  it('schema rows render beside working stage toggles and tabs', async () => {
    const { container } = render(CanvasFloorSchemaHost);
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    expect(rows.length).toBe(1);
    expect(container.querySelector('[data-jx-canvas-seg-option="tonal"]')).not.toBeNull();

    const stage = container.querySelector<HTMLElement>('[data-jx-canvas-stage]')!;
    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-option="dark"]')!,
    );
    expect(stage.getAttribute('data-theme')).toBe('dark');
    expect(container.querySelector('[data-jx-canvas-tabs]')).not.toBeNull();
  });
});

describe('floor: the real pilot pages (dialog, component-canvas)', () => {
  it('dialog page mounts with a derived source link, tabs and toggles', async () => {
    const DialogPage = (await import('../src/routes/docs/components/dialog.html/+page.svelte')).default;
    const { container } = render(DialogPage);
    const source = container.querySelector<HTMLAnchorElement>('[data-jx-canvas-source]')!;
    expect(source.getAttribute('href')).toBe(registrySourceUrl('dialog'));
    expect(container.querySelector('[data-jx-canvas-install]')!.textContent).toContain(
      'npx jixoai-ui add dialog',
    );
    expect(container.querySelector('[data-jx-canvas-tabs]')).not.toBeNull();
    expect(container.querySelector('[data-jx-canvas-theme-seg]')).not.toBeNull();

    // the REAL outline probe: SectionCard h2s join, canvas chrome never
    const labels = deriveTocOutline(container).map((e) => e.label.toLowerCase());
    expect(labels).not.toContain('dialog');
    expect(labels).not.toContain('playground');
  });

  it('badge and chip pages mount with derived links, tabs and play-state labs', async () => {
    const BadgePage = (await import('../src/routes/docs/components/badge.html/+page.svelte')).default;
    const badge = render(BadgePage);
    expect(
      badge.container.querySelector<HTMLAnchorElement>('[data-jx-canvas-source]')!.getAttribute('href'),
    ).toBe(registrySourceUrl('badge'));
    expect(badge.container.querySelector('[data-jx-canvas-tabs]')).not.toBeNull();

    const ChipPage = (await import('../src/routes/docs/components/chip.html/+page.svelte')).default;
    const chip = render(ChipPage);
    expect(
      chip.container.querySelector<HTMLAnchorElement>('[data-jx-canvas-source]')!.getAttribute('href'),
    ).toBe(registrySourceUrl('chip'));
    // the chip lab: playState projection rows track the typed state object
    const rows = chip.container.querySelectorAll('[data-jx-canvas-output-row]');
    expect(rows.length).toBe(3);
    expect(rows[0].querySelector('dd')!.textContent).toBe('tonal');
    const labels = deriveTocOutline(chip.container).map((e) => e.label.toLowerCase());
    expect(labels).not.toContain('chip');
    expect(labels).not.toContain('playground');
  });

  it('component-canvas page mounts: both canvases derived, outer carries the badge', async () => {
    const CanvasPage = (
      await import('../src/routes/docs/components/component-canvas.html/+page.svelte')
    ).default;
    const { container } = render(CanvasPage);
    const sources = [...container.querySelectorAll<HTMLAnchorElement>('[data-jx-canvas-source]')];
    expect(sources.length).toBe(2);
    for (const s of sources) {
      expect(s.getAttribute('href')).toMatch(/^https:\/\/github\.com\/jixoai\/ui\/blob\/main\/registry\/files\/ui\//);
    }
    expect(sources[0].getAttribute('href')).toBe(registrySourceUrl('component-canvas'));
    expect(sources[1].getAttribute('href')).toBe(registrySourceUrl('press-button'));
    expect(container.querySelector('[data-jx-canvas-install]')!.textContent).toContain(
      'npx jixoai-ui add component-canvas',
    );
    // outline probe on the recursive page: no canvas-internal headings
    const labels = deriveTocOutline(container).map((e) => e.label.toLowerCase());
    expect(labels).not.toContain('component-canvas');
    expect(labels).not.toContain('press-button');
    expect(labels).not.toContain('playground');
  });
});

describe('floor: sourceUrl derivation', () => {
  const pilots = ['press-button', 'input', 'dialog', 'badge', 'chip', 'component-canvas'];

  it('projects every pilot item onto a registry file that exists', () => {
    for (const name of pilots) {
      const path = registrySourcePath(name);
      expect(path, name).toMatch(/^registry\/files\/ui\//);
      expect(existsSync(join(repoRoot, path)), `${name} → ${path}`).toBe(true);
      expect(registrySourceUrl(name)).toBe(`https://github.com/jixoai/ui/blob/main/${path}`);
    }
  });

  it('throws loudly for unknown items (no silent dead links)', () => {
    expect(() => registrySourceUrl('not-an-item')).toThrow(/no registry item/);
  });

  it('pilot pages carry no literal sourceUrl attribute (derivation only)', () => {
    for (const page of pilots) {
      const file = join(
        repoRoot,
        'apps/www/src/routes/docs/components',
        `${page}.html`,
        '+page.svelte',
      );
      const source = readFileSync(file, 'utf8');
      expect(source, page).not.toMatch(/sourceUrl="https?:/);
    }
  });
});
