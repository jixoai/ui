/**
 * The website-scaffold header-var SEAM gate (2026-09-05, the toc-flush
 * bug). Layout geometry is css — jsdom can't compute it — so this pins
 * the one JS fact the whole immersive law hangs on: the RO's measured
 * --jx-header-h correction must land on .jx-shell, the var's DECLARING
 * scope. .jx-shell re-declares --jx-header-h on itself (58px/74px per
 * container form), so a host-level write is shadowed for every
 * descendant — the toc's compaction transform then ran on the stale
 * token while the real band measured differently, and the hidden toc
 * parked a few px short of flush (user report: "ToC 和顶部有一小口
 * 距离"). jsdom reports offsetHeight 0 — the VALUE is environment
 * dependent; the SEAM is the point.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Host from './fixtures/scaffold-header-seam-host.svelte';

describe('website-scaffold — the header-var seam', () => {
  it('the RO correction lands on .jx-shell (the declaring scope), never on the host', async () => {
    const { container } = render(Host);
    const host = container.querySelector<HTMLElement>('.jx-shell-host')!;
    const shell = container.querySelector<HTMLElement>('.jx-shell')!;

    // measured at mount (jsdom: 0px — the SEAM, not the value, is pinned)
    await vi.waitFor(() =>
      expect(shell.style.getPropertyValue('--jx-header-h')).toMatch(/px$/),
    );
    // a host-level write would be shadowed by .jx-shell's own
    // re-declaration — the shadowed-write path must not exist
    expect(host.style.getPropertyValue('--jx-header-h')).toBe('');
  });
});

describe('website-scaffold — the rail compaction GROWTH law (css source, 2026-09-05)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/lib/ui/website-scaffold/website-scaffold.css'), 'utf8');
  const dsn = readFileSync(resolve(process.cwd(), 'src/lib/ui/docs-sections-nav.svelte'), 'utf8');

  it('the rails transition max-height alongside the transform — one curve, both properties', () => {
    // height +h cancels translateY −h: a cap-bound rail's bottom edge
    // stays mathematically pinned through the whole compaction
    expect(css).toMatch(/max-height 260ms cubic-bezier\(0\.22, 0\.61, 0\.36, 1\)/);
  });

  it('the toc cap grows by the header height in each container form', () => {
    expect(css).toContain('max-height: calc(100% - 5rem + var(--jx-header-h, 64px))');
    expect(css).toContain('max-height: calc(100% - 1.25rem + var(--jx-header-h, 64px))');
  });

  it('the tree rail cap grows by the header height (its own component css — site-only part)', () => {
    expect(dsn).toContain(':global(.jx-shell-host[data-hidden]) .jx-dsn');
    expect(dsn).toContain('max-height: calc(100% + var(--jx-header-h, 64px))');
  });
});
