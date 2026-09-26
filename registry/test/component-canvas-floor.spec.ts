/**
 * ComponentCanvas floor suite (test/component-canvas-floor.spec.ts,
 * canvas-floor-lab 2026-08-30).
 *
 * The floor gates, read through the DOM:
 * 1. OUTLINE — the canvas root carries data-toc-skip, the title is a
 *    styled paragraph (no h2), and deriveTocOutline over a page wrapper
 *    yields the page's own sections only.
 * 2. STAGE CHROME (the EIGHT-AXIS BAR, the Owner's post-acceptance
 *    directive 2026-09-21 — successor of the unified-chrome ruling
 *    2026-09-08) — the dock head ships one control per axis: the
 *    theme cycle button (aria-pressed) sets data-theme + the theme
 *    sheet's dark/jx-light token-scope class on the STAGE element
 *    only; the SEVEN menu axes (size · shape · radius · density ·
 *    color · elevation · motion, `auto` + the named steps) ride the
 *    canvas root's SUPPLY (carriers + ambient lanes — the legacy
 *    rung select RETIRED; bind:theme/bind:density stay page-owned);
 *    sibling canvases are untouched; the bar ships on EVERY canvas.
 * 3. DRAWER SHAPE — the tree pane is the ONE drawer shape (Owner revert
 *    2026-09-01: the two-file tabs floor is gone): every canvas renders
 *    the tree over/aside ONE CodeCard, no tablist anywhere. Drawer
 *    default = the usage file; clicking a tree row swaps the code.
 * 4. INSTALL BADGE — copies `npx jixoai-ui add <name>` with a flash.
 * 5. DERIVATION — registrySourceUrl projects the registry path for the
 *    six pilot items onto existing files (fs check), and no pilot page
 *    carries a literal sourceUrl="https://…" attribute (the no-github
 *    -href law, scoped to source links; demo href anchors are content).
 * 6. SCHEMA COEXISTENCE — schema rows + stage toggles + the tree drawer
 *    in one canvas (schema mode must not regress under the floor rework).
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

describe('floor: stage theme/density chrome (the dock head)', () => {
  it('the dock theme button projects data-theme + the scope class onto the stage only', async () => {
    const { container } = render(CanvasFloorHost);
    const [floorStage, treeStage] = stages(container);
    expect(floorStage.getAttribute('data-theme')).toBe('light');
    expect(floorStage.classList.contains('jx-light')).toBe(true);

    const themeButton = container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')!;
    expect(themeButton.getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(themeButton);
    expect(floorStage.getAttribute('data-theme')).toBe('dark');
    expect(floorStage.classList.contains('dark')).toBe(true);
    expect(themeButton.getAttribute('aria-pressed')).toBe('true');
    // the page-owned binding reflects the change (ownership law)
    expect(
      container.querySelector<HTMLElement>('[data-testid="stage-demo"]')!.getAttribute('data-theme'),
    ).toBe('dark');
    // sibling canvas untouched (scoping law)
    expect(treeStage.getAttribute('data-theme')).toBe('light');
  });

  // RE-PINNED (the Owner's eight-axis bar directive, 2026-09-21): the
  // dock-head density select RETIRED — the density control is the axis
  // grammar's menu and its lane rides the canvas root's SUPPLY, so the
  // STAGE's data-density rung keeps its page-owned bindable value (the
  // ownership law: only bind:density writes it) while a lane-consuming
  // specimen in the stage re-densifies through the ambient lane
  it('the dock density axis speaks the grammar and rides the SUPPLY (the stage rung stays page-owned)', async () => {
    const { container } = render(CanvasFloorHost);
    const [floorStage] = stages(container);
    expect(floorStage.getAttribute('data-density')).toBe('default');

    const entries = [...container.querySelectorAll<HTMLButtonElement>(
      '#jx-canvas-floor-widget-axis-density [data-axis-value]',
    )];
    expect(entries.map((el) => el.getAttribute('data-axis-value'))).toEqual([
      'auto', 'small', 'medium', 'large',
    ]);
    await fireEvent.click(entries[1]!); // small
    // the STAGE's rung is untouched (the retired select's old channel)
    expect(floorStage.getAttribute('data-density')).toBe('default');
    // the lane-consuming specimen (the stage's press-button) resolves
    // the ambient density lane and stamps its own rung: small → sm
    const seat = container.querySelector<HTMLElement>('[data-testid="density-seat"]');
    expect(seat?.getAttribute('data-density')).toBe('sm');
  });

  it('the dock head is the eight-axis bar: theme + seven menu axes, on EVERY canvas', () => {
    const { container } = render(CanvasFloorHost);
    const themeButtons = [...container.querySelectorAll<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')];
    const canvases = [...container.querySelectorAll('[data-jx-canvas]')];
    // two canvases on the page → both ship the eight-axis bar (the
    // body-less tree canvas included — no chevron, the bar alone)
    expect(themeButtons.length).toBe(2);
    expect(themeButtons[0]!.getAttribute('aria-label')).toBe('Toggle theme');
    for (const c of canvases) {
      expect(c.querySelectorAll('[data-jx-canvas-axis]').length).toBe(7);
      expect(c.querySelector('[data-jx-canvas-dock-axes]')).not.toBeNull();
      // the smaller bar: the joined run rides the compact density rung
      expect(c.querySelector('[data-jx-canvas-dock-axes] [data-jx-canvas-theme-toggle]')!.getAttribute('data-density')).toBe('xs');
    }
    // the body-less canvas has no chevron and no collapse region
    expect(canvases[1]!.querySelector('[data-jx-canvas-dock-toggle]')).toBeNull();
    expect(canvases[1]!.querySelector('.jx-canvas-dock-collapse')).toBeNull();
  });
});

describe('floor: the tree pane is the one drawer shape (tabs revert)', () => {
  it('≤2 files: the tree pane renders over one CodeCard, no tablist', async () => {
    const { container } = render(CanvasFloorHost);
    const floor = container.querySelector('[data-jx-canvas]')!;
    // the tabs floor is gone at every file count
    expect(floor.querySelector('[data-jx-canvas-tabs]')).toBeNull();
    expect(floor.querySelector('[role="tablist"], [role="tab"], [role="tabpanel"]')).toBeNull();
    // the tree pane + exactly one CodeCard
    const tree = floor.querySelector<HTMLElement>('.jx-canvas-tree')!;
    expect(tree.querySelector('[role="tree"]')).not.toBeNull();
    expect(floor.querySelectorAll('.jx-code-card, [data-jx-code-card]').length).toBe(1);

    // drawer default = the usage file (its treeitem selected)
    const usageItem = tree.querySelector<HTMLElement>(
      '[data-path="src/lib/ui/floor-widget-usage.svelte"]',
    )!;
    expect(usageItem.getAttribute('aria-selected')).toBe('true');
    const sourceItem = tree.querySelector<HTMLElement>(
      '[data-path="registry/files/ui/floor-widget/floor-widget.svelte"]',
    )!;
    expect(sourceItem.getAttribute('aria-selected')).toBe('false');

    // clicking a tree row swaps the single CodeCard's file + selection
    await fireEvent.click(sourceItem.querySelector('.jx-tree-row')!);
    expect(sourceItem.getAttribute('aria-selected')).toBe('true');
    expect(usageItem.getAttribute('aria-selected')).toBe('false');
    expect(floor.querySelector('.jx-code-card')!.textContent).toContain('source');
  });

  it('≥3 files: the same tree drawer, no tablist', () => {
    const { container } = render(CanvasFloorHost);
    const canvases = [...container.querySelectorAll('[data-jx-canvas]')];
    // the body-less canvas (no collapse region) is the tree widget one
    const treeCanvas = canvases.find(
      (c) => c !== canvases[0] && c.querySelector('.jx-canvas-dock-collapse') === null,
    )!;
    expect(treeCanvas.querySelector('.jx-canvas-tree')).not.toBeNull();
    expect(treeCanvas.querySelector('[data-jx-canvas-tabs]')).toBeNull();
    expect(treeCanvas.querySelector('[role="tablist"], [role="tab"]')).toBeNull();
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
    // rides ItemField — the select lives inside the dock BODY, not the
    // head's axis bar)
    const select = container.querySelector<HTMLSelectElement>('[data-jx-canvas-dock-scroll] select')!;
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
    // grindstone #17-3: the segmented schema row rides ItemSegmented —
    // the native radio's value is the segment identity
    expect(container.querySelector('[data-jx-canvas-seg] input[value="tonal"]')).not.toBeNull();

    const stage = container.querySelector<HTMLElement>('[data-jx-canvas-stage]')!;
    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-theme-toggle]')!,
    );
    expect(stage.getAttribute('data-theme')).toBe('dark');
    expect(container.querySelector('.jx-canvas-tree')).not.toBeNull();
  });
});

describe('floor: the real pilot pages (dialog, component-canvas)', () => {
  it('dialog page mounts with a derived source link, tree drawer and toggles', async () => {
    const DialogPage = (await import('../src/routes/docs/components/dialog.html/+page.svelte')).default;
    const { container } = render(DialogPage);
    const source = container.querySelector<HTMLAnchorElement>('[data-jx-canvas-source]')!;
    expect(source.getAttribute('href')).toBe(registrySourceUrl('dialog'));
    expect(container.querySelector('[data-jx-canvas-install]')!.textContent).toContain(
      'npx jixoai-ui add dialog',
    );
    expect(container.querySelector('.jx-canvas-tree')).not.toBeNull();
    // the eight-axis bar (theme button + the seven menu axes)
    expect(container.querySelector('[data-jx-canvas-theme-toggle]')).not.toBeNull();
    expect(container.querySelectorAll('[data-jx-canvas-axis]').length).toBeGreaterThanOrEqual(7);

    // the REAL outline probe: SectionCard h2s join, canvas chrome never
    const labels = deriveTocOutline(container).map((e) => e.label.toLowerCase());
    expect(labels).not.toContain('dialog');
    expect(labels).not.toContain('playground');
  });

  it('badge and chip pages mount with derived links, tree drawers and play-state labs', async () => {
    const BadgePage = (await import('../src/routes/docs/components/badge.html/+page.svelte')).default;
    const badge = render(BadgePage);
    expect(
      badge.container.querySelector<HTMLAnchorElement>('[data-jx-canvas-source]')!.getAttribute('href'),
    ).toBe(registrySourceUrl('badge'));
    expect(badge.container.querySelector('.jx-canvas-tree')).not.toBeNull();

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
      const pageDir = `routes/docs/components/${page}.html`;
      const file = join(repoRoot, 'apps/www/src', pageDir, '+page.svelte');
      const source = readFileSync(file, 'utf8');
      expect(source, page).not.toMatch(/sourceUrl="https?:/);
    }
  });
});
