/**
 * prototype-kit contract suite (test/prototype-kit/prototype-kit.spec.ts,
 * 2026-09-11) — the acceptance face of the prototype-standard spec
 * (openspec/changes/design-studio): frame URL contract, context
 * inheritance/override, id-conflict warning, grid law on the canvas,
 * and the no-design-host notice state.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * the navigator would see it (attributes, style properties, iframe
 * src) — never through component internals. The design host is faked
 * through the injection channel the kit documents
 * (window.__jixoaiDesignHost), restored after every test.
 */
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tick } from 'svelte';
import { buildFrameUrl, installOverlayScrollbar, normalizeRef } from '../../../../registry/files/ui/prototype-kit';

import ConflictHost from './fixtures/conflict-host.svelte';
import FrameHost from './fixtures/frame-host.svelte';
import InheritCanvasHost from './fixtures/inherit-canvas-host.svelte';
import NestedCanvasHost from './fixtures/nested-canvas-host.svelte';

function host(on = true): void {
  window.__jixoaiDesignHost = on;
}

function paramsOf(src: string): URLSearchParams {
  expect(src.startsWith('/__design__/frame?')).toBe(true);
  return new URLSearchParams(src.slice('/__design__/frame?'.length));
}

afterEach(() => {
  delete window.__jixoaiDesignHost;
  delete window.__jixoaiDesignStudio;
  if (window.location.pathname !== '/') window.history.pushState(null, '', '/');
  cleanup();
});

// ---------------------------------------------------------------------------
// the URL contract (pure builder — the kit↔server seam)
// ---------------------------------------------------------------------------
describe('buildFrameUrl', () => {
  it('assembles the contract shape: p, f, theme, w, h', () => {
    const url = buildFrameUrl({
      prototype: 'checkout',
      ref: './pages/checkout.svelte',
      theme: 'dark',
      width: 1280,
      height: 800,
    });
    expect(url).toBe('/__design__/frame?p=checkout&f=pages%2Fcheckout.svelte&theme=dark&w=1280&h=800');
  });

  it('strips only the leading ./ from refs', () => {
    expect(normalizeRef('./pages/hero.svelte')).toBe('pages/hero.svelte');
    expect(normalizeRef('components/press-idle.svelte')).toBe('components/press-idle.svelte');
    expect(normalizeRef('a/./b.svelte')).toBe('a/./b.svelte');
  });

  it('omits w/h when unknown and fills only for component semantics', () => {
    const adaptive = buildFrameUrl({ prototype: 'p', ref: './c.svelte', theme: 'auto', fill: false });
    expect(adaptive).toBe('/__design__/frame?p=p&f=c.svelte&theme=auto&fill=0');
    const locked = buildFrameUrl({
      prototype: 'p',
      ref: './c.svelte',
      theme: 'auto',
      width: 240,
      height: 96,
      fill: true,
    });
    expect(locked).toBe('/__design__/frame?p=p&f=c.svelte&theme=auto&w=240&h=96&fill=1');
    // page frames pass no fill at all — the viewport is always locked
    const page = buildFrameUrl({ prototype: 'p', ref: './x.svelte', theme: 'light', width: 390, height: 844 });
    expect(page).not.toContain('fill');
  });

  it('URL-encodes exotic prototype and ref values', () => {
    const url = buildFrameUrl({
      prototype: 'my proto',
      ref: './pages/a b.svelte',
      theme: 'auto',
    });
    const query = paramsOf(url);
    expect(query.get('p')).toBe('my proto');
    expect(query.get('f')).toBe('pages/a b.svelte');
  });
});

// ---------------------------------------------------------------------------
// frames: URL wiring through the canvas context
// ---------------------------------------------------------------------------
describe('frame rendering', () => {
  it('a page frame inside a canvas builds the contract URL', () => {
    host();
    const { container } = render(FrameHost);
    const frame = container.querySelector('#hero-light')!;
    expect(frame.getAttribute('data-jx-prototype-frame')).toBe('page');
    // readable annotations, as authored
    expect(frame.getAttribute('data-jx-prototype-ref')).toBe('./pages/hero.svelte');
    expect(frame.getAttribute('data-jx-prototype-theme')).toBe('light');
    const iframe = frame.querySelector('iframe')!;
    const query = paramsOf(iframe.getAttribute('src') ?? '');
    expect(query.get('p')).toBe('welcome');
    expect(query.get('f')).toBe('pages/hero.svelte');
    expect(query.get('theme')).toBe('light');
    expect(query.get('w')).toBe('390');
    expect(query.get('h')).toBe('844');
    expect(query.has('fill')).toBe(false);
    // the REAL viewport stays on the iframe attributes (scale-to-fit
    // never rewrites it)
    expect(iframe.getAttribute('width')).toBe('390');
    expect(iframe.getAttribute('height')).toBe('844');
    expect(iframe.getAttribute('title')).toBeTruthy();
  });

  it('a component frame defaults to adaptive height (fill=0) and carries h as initial', () => {
    host();
    const { container } = render(FrameHost);
    const query = paramsOf(
      container.querySelector('#press-idle iframe')!.getAttribute('src') ?? ''
    );
    expect(query.get('fill')).toBe('0');
    expect(query.get('h')).toBe('96');
    expect(query.get('w')).toBe('240');
  });

  it('fill locks the height (fill=1)', () => {
    host();
    const { container } = render(FrameHost, {
      props: { componentProps: { fill: true } },
    });
    const query = paramsOf(
      container.querySelector('#press-idle iframe')!.getAttribute('src') ?? ''
    );
    expect(query.get('fill')).toBe('1');
  });

  it('a component frame without height omits h', () => {
    host();
    const { container } = render(FrameHost, {
      props: { componentProps: { height: undefined } },
    });
    const query = paramsOf(
      container.querySelector('#press-idle iframe')!.getAttribute('src') ?? ''
    );
    expect(query.has('h')).toBe(false);
  });

  it('theme defaults to auto', () => {
    host();
    const { container } = render(FrameHost, {
      props: { pageProps: { theme: undefined } },
    });
    const query = paramsOf(
      container.querySelector('#hero-light iframe')!.getAttribute('src') ?? ''
    );
    expect(query.get('theme')).toBe('auto');
    expect(container.querySelector('#hero-light')!.getAttribute('data-jx-prototype-theme')).toBe(
      'auto'
    );
  });
});

// ---------------------------------------------------------------------------
// context: inheritance and override
// ---------------------------------------------------------------------------
describe('prototype context', () => {
  it('a nested canvas overrides the prototype for its own frames', () => {
    host();
    const { container } = render(NestedCanvasHost);
    const outer = paramsOf(
      container.querySelector<HTMLIFrameElement>('#outer-p iframe')!.getAttribute('src') ?? ''
    );
    const inner = paramsOf(
      container.querySelector<HTMLIFrameElement>('#inner-p iframe')!.getAttribute('src') ?? ''
    );
    expect(outer.get('p')).toBe('outer');
    expect(inner.get('p')).toBe('inner');
  });

  it('a nested canvas without its own name inherits the outer one', () => {
    host();
    const { container } = render(InheritCanvasHost);
    const query = paramsOf(
      container.querySelector<HTMLIFrameElement>('#inherited-p iframe')!.getAttribute('src') ?? ''
    );
    expect(query.get('p')).toBe('inherited-outer');
  });

  it('a canvas with no name anywhere derives it from the canvas-page URL', () => {
    host();
    window.history.pushState(null, '', '/prototypes/welcome/canvas');
    const { container } = render(FrameHost, { props: { canvasProps: { prototype: undefined } } });
    const query = paramsOf(
      container.querySelector<HTMLIFrameElement>('#hero-light iframe')!.getAttribute('src') ?? ''
    );
    expect(query.get('p')).toBe('welcome');
  });
});

// ---------------------------------------------------------------------------
// id discipline
// ---------------------------------------------------------------------------
describe('frame ids', () => {
  it('warns once on a duplicate id within the canvas; the first wins as the anchor', async () => {
    host();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ConflictHost);
    await tick(); // svelte flushes mount effects on a microtask
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('duplicate frame id "dup"');
    // both frames render; the document anchor resolves to the first
    const frames = container.querySelectorAll('[id="dup"]');
    expect(frames).toHaveLength(2);
    expect(document.getElementById('dup')).toBe(frames[0]);
    warn.mockRestore();
  });

  it('no warning for unique ids', async () => {
    host();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(FrameHost);
    await tick();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// the canvas grid law
// ---------------------------------------------------------------------------
describe('canvas grid', () => {
  it('grid is the layout engine: number tracks, rows, gap', () => {
    const { container } = render(FrameHost, {
      props: { canvasProps: { gridCols: 3, gridRows: 2, gap: 24 } },
    });
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.display).toBe('grid');
    expect(canvas.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
    expect(canvas.style.gridTemplateRows).toBe('repeat(2, minmax(0, 1fr))');
    expect(canvas.style.gap).toBe('24px');
  });

  it('string tracks pass through verbatim', () => {
    const { container } = render(FrameHost, {
      props: { canvasProps: { gridCols: '[full-start] 1fr [full-end]', gap: '0.5rem' } },
    });
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe('[full-start] 1fr [full-end]');
    expect(canvas.style.gap).toBe('0.5rem');
  });

  it('the default is the adaptive auto-fill wrap, gap 16px', () => {
    const { container } = render(FrameHost);
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))'
    );
    // no explicit rows — implicit, content-sized
    expect(canvas.style.gridTemplateRows).toBe('');
    expect(canvas.style.gap).toBe('16px');
  });

  it('a canvas label spans the full row and never becomes a heading', () => {
    const { container } = render(FrameHost, {
      props: { canvasProps: { label: 'hero matrix' } },
    });
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.getAttribute('aria-label')).toBe('hero matrix');
    const caption = canvas.querySelector<HTMLElement>('[data-jx-prototype-canvas-label]')!;
    expect(caption.tagName).toBe('P');
    expect(caption.style.gridColumn).toBe('1 / -1');
    expect(caption.textContent).toContain('hero matrix');
  });
});

// ---------------------------------------------------------------------------
// studio mode (#24): the design studio's embed — natural size, camera
// authority handed to the stage
// ---------------------------------------------------------------------------
describe('studio mode', () => {
  it('numeric tracks swap to max-content (natural size, count preserved)', () => {
    host();
    window.__jixoaiDesignStudio = true;
    const { container } = render(FrameHost, {
      props: { canvasProps: { gridCols: 3 } },
    });
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe('repeat(3, max-content)');
  });

  it('the adaptive default swaps to auto-fill max-content', () => {
    host();
    window.__jixoaiDesignStudio = true;
    const { container } = render(FrameHost);
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe('repeat(auto-fill, max-content)');
  });

  it('string tracks stay verbatim (the author escape hatch beats the mode)', () => {
    host();
    window.__jixoaiDesignStudio = true;
    const { container } = render(FrameHost, {
      props: { canvasProps: { gridCols: '[full-start] 1fr [full-end]' } },
    });
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe('[full-start] 1fr [full-end]');
  });

  it('the frame shell drops the max-width clamp (natural width)', () => {
    host();
    window.__jixoaiDesignStudio = true;
    const { container } = render(FrameHost);
    const shell = container.querySelector<HTMLElement>('#hero-light > div')!;
    expect(shell.style.maxWidth).toBe('');
  });

  it('outside the studio the responsive regime is untouched (regression pair)', () => {
    host();
    const { container } = render(FrameHost);
    const canvas = container.querySelector<HTMLElement>('[data-jx-prototype-canvas]')!;
    expect(canvas.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(min(100%, 30rem), 1fr))'
    );
    const shell = container.querySelector<HTMLElement>('#hero-light > div')!;
    expect(shell.style.maxWidth).toBe('100%');
  });
});

// ---------------------------------------------------------------------------
// the degrade path: no design host
// ---------------------------------------------------------------------------
describe('notice state', () => {
  it('without the design host the frame shows the notice instead of an iframe', () => {
    host(false);
    const { container } = render(FrameHost);
    expect(container.querySelector('iframe')).toBeNull();
    const notice = container.querySelector<HTMLElement>('[data-jx-prototype-notice]')!;
    expect(notice.getAttribute('role')).toBe('note');
    expect(notice.textContent).toContain('requires the design server');
    // the anchor id survives the degrade
    expect(container.querySelector('#hero-light')).not.toBeNull();
  });

  it('the window flag channel switches the frame live at mount', () => {
    host();
    const { container } = render(FrameHost);
    expect(container.querySelector('iframe')).not.toBeNull();
  });

  it('outside any canvas the notice names the missing prototype context', () => {
    host();
    const { container } = render(FrameHost, {
      props: {
        canvasProps: { prototype: undefined },
        pageProps: { id: 'orphan', ref: './pages/hero.svelte' },
      },
    });
    // no /prototypes/ URL to derive from in the test environment
    const notice = container.querySelector<HTMLElement>('[data-jx-prototype-notice]')!;
    expect(notice.textContent).toContain('no prototype context');
  });
});

// ---------------------------------------------------------------------------
// the overlay scrollbar (#22): a kit surface's scrollbar never takes
// layout width from the content it scrolls
// ---------------------------------------------------------------------------
describe('overlay scrollbar', () => {
  it('hides the native viewport scrollbar, mounts a floating thumb; release removes both', () => {
    const release = installOverlayScrollbar(window, document);
    const style = document.querySelector('style[data-jx-frame-overlay-scrollbar]');
    expect(style).not.toBeNull();
    // the layout-steal killer: the viewport bar is display:none'd
    expect(style!.textContent).toContain('scrollbar-width:none');
    expect(style!.textContent).toContain('::-webkit-scrollbar');
    const thumb = document.querySelector<HTMLElement>('[data-jx-frame-vscroll-thumb]');
    expect(thumb).not.toBeNull();
    expect(thumb!.getAttribute('aria-hidden')).toBe('true');
    release();
    expect(document.querySelector('style[data-jx-frame-overlay-scrollbar]')).toBeNull();
    expect(document.querySelector('[data-jx-frame-vscroll-thumb]')).toBeNull();
  });

  it('is idempotent per document (nested canvases install once)', () => {
    const first = installOverlayScrollbar(window, document);
    const second = installOverlayScrollbar(window, document);
    expect(document.querySelectorAll('style[data-jx-frame-overlay-scrollbar]')).toHaveLength(1);
    second();
    expect(document.querySelector('style[data-jx-frame-overlay-scrollbar]')).not.toBeNull();
    first();
    expect(document.querySelector('style[data-jx-frame-overlay-scrollbar]')).toBeNull();
  });

  it('the thumb follows the client/scroll ratio law and disappears without overflow', async () => {
    // jsdom has no layout — shadow the geometry the law reads, restore after
    const root = document.documentElement;
    const shadow = (prop: string, value: number): void => {
      Object.defineProperty(root, prop, { value, configurable: true });
    };
    const unshadow = (prop: string): void => {
      delete (root as unknown as Record<string, unknown>)[prop];
    };
    // one animation-frame tick (vitest's jsdom ships a live rAF) + settle —
    // the module's sync rides rAF, so the test must wait the SAME bus
    const frame = async (): Promise<void> => {
      await new Promise<void>((resolve) => {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve());
        } else {
          setTimeout(resolve, 0);
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 5));
    };
    const props = ['scrollHeight', 'clientHeight', 'scrollTop'];
    shadow('scrollHeight', 2000);
    shadow('clientHeight', 500);
    shadow('scrollTop', 250);
    try {
      const release = installOverlayScrollbar(window, document);
      const thumb = document.querySelector<HTMLElement>('[data-jx-frame-vscroll-thumb]')!;
      await frame();
      // scrollable (2000 > 500): visible; height = 500/2000 × 500 = 125px;
      // top = 250/2000 × 500 = 62.5px
      expect(thumb.style.visibility).toBe('visible');
      expect(parseFloat(thumb.style.height)).toBeCloseTo(125, 0);
      expect(Math.abs(parseFloat(thumb.style.top) - 62.5)).toBeLessThan(1);
      // a viewport scroll re-syncs position
      shadow('scrollTop', 1000);
      document.dispatchEvent(new window.Event('scroll'));
      await frame();
      expect(Math.abs(parseFloat(thumb.style.top) - 250)).toBeLessThan(1);
      // no overflow: the thumb steps aside
      shadow('scrollHeight', 400);
      document.dispatchEvent(new window.Event('scroll'));
      await frame();
      expect(thumb.style.visibility).toBe('hidden');
      release();
    } finally {
      for (const prop of props) unshadow(prop);
    }
  });
});
