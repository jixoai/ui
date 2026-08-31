/**
 * The pipeline LIFETIME gates (print-pipeline, codex review P1 round,
 * 2026-08-30) — jsdom lane with a CONTROLLABLE pagedjs kernel:
 *
 *   - P1-3 FLIGHT SUPERSEDE: a dispose()/cancel() that lands while an
 *     attempt sits between awaits retires it — a late prepareSnapshot
 *     or a late preview resolve never publishes the artifact, never
 *     registers listeners into a drained array, never flips status,
 *     and still unwinds the stamp the transaction owns
 *   - P1-4 AFTERPRINT HYGIENE: first entry of the afterprint exit
 *     clears the 400ms grace fallback and detaches the window
 *     listener EXPLICITLY — the sim-survives branch never runs
 *     dispose(), so a dispose-dependent cleanup would strand both
 *   - P1-5 FAILURE-ROAD STAMP RELEASE: every road that fails AFTER a
 *     successful prepare (the measurability throw, the preview-phase
 *     catch) releases the transaction's own self-stamp — the medium
 *     re-derives 'screen' instead of sticking on a stranded sim
 *
 * The kernel mock carries three modes: 'immediate' (the plain lane),
 * 'deferred' (a controllable pending preview — the late-resolve
 * fixture) and 'fail' (a rejecting preview — the failure-road
 * fixture). Fake-timer tests fake ONLY the timeout surface: rAF stays
 * REAL (freeze's double-raf barrier rides it), so the drive loop
 * sleeps on the captured-original setTimeout while the 400ms grace
 * fallback sits frozen at zero.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRINT_SIM_ATTR } from '../src/lib/medium.svelte';
import { createPrintPipeline, type PrintPipeline } from '../src/lib/print/pipeline.svelte';

interface PreviewCall {
  content: DocumentFragment;
  stylesheets: { [url: string]: string }[];
  renderTo: HTMLElement;
}

const kernel = vi.hoisted(() => ({
  calls: [] as PreviewCall[],
  mode: 'immediate' as 'immediate' | 'deferred' | 'fail',
  deferreds: [] as (() => void)[],
}));

vi.mock('pagedjs', () => ({
  Previewer: class {
    preview(
      content: DocumentFragment,
      stylesheets: { [url: string]: string }[],
      renderTo: HTMLElement,
    ) {
      kernel.calls.push({ content, stylesheets, renderTo });
      if (kernel.mode === 'fail') {
        return Promise.reject(new Error('preview exploded (test fixture)'));
      }
      const build = (): void => {
        const pages = document.createElement('div');
        pages.className = 'pagedjs_pages';
        for (let i = 0; i < 3; i++) {
          const page = document.createElement('div');
          page.className = 'pagedjs_page';
          const holder = document.createElement('section');
          holder.setAttribute('data-id', i === 0 ? 'transaction' : `sec-${i}`);
          page.appendChild(holder);
          pages.appendChild(page);
        }
        renderTo.appendChild(pages);
      };
      if (kernel.mode === 'deferred') {
        return new Promise<{ total: number }>((resolve) => {
          kernel.deferreds.push(() => {
            build();
            resolve({ total: 3 });
          });
        });
      }
      build();
      return Promise.resolve({ total: 3 });
    }
  },
}));

// jsdom has no layout: make every element measurable by default, with
// per-test overrides for the fail-loud cases
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
const makeMeasurable = (px: number): void => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => px,
  });
};

// the fake-timer lane fakes the timeout AND rAF surfaces TOGETHER:
// jsdom's requestAnimationFrame rides the global setTimeout, so faking
// only the timeout starves freeze's double-raf barrier AND strands a
// jsdom frame callback on the discarded clock — killing the rAF loop
// for every test after it. With both faked, the whole preparation
// (double-raf → readiness → clone) drives on the fake clock via
// advanceTimersByTimeAsync, and jsdom's own loop is never touched
const FAKE_CLOCK = {
  toFake: [
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ],
};

let root: HTMLElement;
let pipeline: PrintPipeline;
const CONFIG = {
  size: 'A4' as const,
  margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' as const },
  footer: { 'bottom-left': 'counter(page)' as const, 'bottom-right': 'counter(pages)' as const },
};

/** advance the fake clock in slices — microtasks (fonts.ready, the
 *  mocked kernel import) flush between the fired timers/frames */
const drive = async (ms: number): Promise<void> => {
  for (let advanced = 0; advanced < ms; advanced += 8) {
    await vi.advanceTimersByTimeAsync(8);
  }
};

/** poll the fake clock until the pipeline reaches 'ready' */
const untilReady = async (): Promise<void> => {
  for (let i = 0; i < 100 && pipeline.status !== 'ready'; i++) {
    await vi.advanceTimersByTimeAsync(8);
  }
  expect(pipeline.status).toBe('ready');
};

const dispatchAfterPrint = (): void => {
  window.dispatchEvent(new Event('afterprint'));
};

beforeEach(() => {
  kernel.calls.length = 0;
  kernel.mode = 'immediate';
  kernel.deferreds.length = 0;
  makeMeasurable(800);
  vi.stubGlobal('print', vi.fn());
  root = document.createElement('main');
  root.setAttribute('data-print-source', '');
  root.setAttribute('data-density', 'sm'); // the committed intervention
  root.innerHTML =
    '<h2 id="transaction">The transaction</h2><p>one</p><h2 id="animation">Animation</h2><pre><code>a\nb</code></pre>';
  document.body.appendChild(root);
  pipeline = createPrintPipeline(() => root);
});

afterEach(() => {
  pipeline.dispose();
  root.remove();
  document.querySelector('[data-print-output]')?.remove();
  document.documentElement.removeAttribute('data-jx-print-active');
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// =========================================================================
// P1-3 — the flight-supersede law
// =========================================================================
describe('P1-3: dispose/cancel retire in-flight attempts', () => {
  it('dispose mid-preparation: the late snapshot unwinds its own stamp and exits silently', async () => {
    // runPrint stamps SYNCHRONOUSLY before its first await — dispose
    // therefore lands while the transaction sits in its double-raf
    const run_ = pipeline.runPrint({ config: CONFIG }); // screen → self-stamp
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true);
    pipeline.dispose(); // unmount / teardown before any resumption
    await expect(run_).resolves.toBeUndefined(); // SILENT — not an error flip
    expect(pipeline.status).toBe('idle');
    expect(pipeline.lastError).toBeUndefined();
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // the stamp unwound
    expect(document.querySelector('[data-print-output]')).toBeNull(); // nothing published
  });

  it('dispose mid-preview: the late preview resolve never resurrects the artifact', async () => {
    kernel.mode = 'deferred';
    root.setAttribute(PRINT_SIM_ATTR, '');
    const run_ = pipeline.runSim({ config: CONFIG });
    await vi.waitFor(() => expect(kernel.deferreds).toHaveLength(1)); // preview pending
    pipeline.dispose(); // sim-off / unmount while the render is in flight
    expect(pipeline.status).toBe('idle');
    kernel.deferreds[0]!(); // the LATE continuation lands
    await expect(run_).resolves.toBeUndefined(); // silent supersede exit
    expect(pipeline.status).toBe('idle'); // never flipped to ready/error
    expect(pipeline.artifactMetadata).toBeUndefined(); // nothing published
    expect(pipeline.pageCount).toBe(0);
    expect(document.querySelector('[data-print-output]')).toBeNull(); // attempt DOM unwound
    expect(document.querySelector('[data-jx-print-sim-bar]')).toBeNull(); // no post-dispose listener wiring
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
  });

  it('dispose during the afterprint wait: the late 400ms fallback exits silently (no ready-flip)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      root.setAttribute(PRINT_SIM_ATTR, ''); // the CALLER's sim — survives
      const run_ = pipeline.runPrint({ config: CONFIG });
      await untilReady();
      expect(vi.getTimerCount()).toBe(1); // exactly the grace fallback pending
      pipeline.dispose(); // unmount while the (stubbed) dialog wait pends
      expect(pipeline.status).toBe('idle');
      expect(document.querySelector('[data-print-output]')).toBeNull();
      await drive(400); // the fallback fires — STALE
      await run_; // settles silently
      expect(pipeline.status).toBe('idle'); // never flipped back to 'ready'
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true); // the caller's stamp untouched
      expect(document.querySelector('[data-print-output]')).toBeNull(); // no revival
      expect(vi.getTimerCount()).toBe(0); // the fallback consumed
    } finally {
      vi.useRealTimers();
    }
  });
});

// =========================================================================
// P1-4 — the afterprint exit hygiene
// =========================================================================
describe('P1-4: the afterprint grace fallback hygiene', () => {
  it('first entry clears the fallback timer and detaches the window listener (the sim-survives branch never disposes)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      root.setAttribute(PRINT_SIM_ATTR, ''); // the caller's sim — survives
      const run_ = pipeline.runPrint({ config: CONFIG });
      await untilReady();
      expect(vi.getTimerCount()).toBe(1); // the 400ms grace fallback IS pending
      const registered = addSpy.mock.calls
        .filter(([type]) => type === 'afterprint')
        .map(([, fn]) => fn as EventListener);
      expect(registered).toHaveLength(1);
      dispatchAfterPrint();
      await run_;
      // timer hygiene: the fallback was CLEARED on first entry, not
      // left to fire at 400ms
      expect(vi.getTimerCount()).toBe(0);
      // listener hygiene: detached EXPLICITLY — no dispose ran to do it
      expect(
        removeSpy.mock.calls.some(
          ([type, fn]) => type === 'afterprint' && (fn as EventListener) === registered[0],
        ),
      ).toBe(true);
      // behavior semantics UNCHANGED: the sim survives, the artifact
      // stays, the status holds 'ready'
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true);
      expect(pipeline.status).toBe('ready');
      expect(document.querySelector('[data-print-output]')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

// =========================================================================
// P1-5 — failure roads after a successful prepare release the self-stamp
// =========================================================================
describe('P1-5: post-prepare failure roads unwind the self-stamp', () => {
  it('a preview failure releases the transaction\'s own stamp (the medium re-derives screen)', async () => {
    kernel.mode = 'fail';
    await expect(pipeline.runPrint({ config: CONFIG })).rejects.toThrow(/preview exploded/);
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // NOT stranded
    expect(pipeline.status).toBe('error');
    expect(pipeline.lastError).toMatch(/preview exploded/);
    expect(document.querySelector('[data-print-output]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
  });

  it('the measurability failure road releases the self-stamp too', async () => {
    makeMeasurable(0); // display:none-equivalent
    await expect(pipeline.runPrint({ config: CONFIG })).rejects.toThrow(/not measurable/);
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // NOT stranded
    expect(pipeline.status).toBe('error');
    expect(document.querySelector('[data-print-output]')).toBeNull();
  });
});
