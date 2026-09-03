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
 *
 * THE AMBIENT PRINT ENTRY (Owner directive, 2026-09-01): a print the
 * BROWSER initiates auto-initializes the pipeline — beforeprint
 * stamps the print pose SYNCHRONOUSLY (the dialog can never print
 * the raw screen), the async half runs the button-print transaction
 * with the layer's grammar (never a fallback default), the flight
 * never calls window.print (the dialog is already open — a second
 * call would stack another), and afterprint owns the exit including
 * the dialog-closed-early settle. dispose() re-arms the entry (the
 * pipeline keeps serving); destroy() — the layer's unmount — is the
 * only disarm.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRINT_SIM_ATTR } from '../src/lib/medium.svelte';
import { createPrintPipeline, type PrintPipeline } from '../src/lib/print/pipeline.svelte';
import { PageConfigError } from '../src/lib/print/page-config';

interface PreviewCall {
  content: DocumentFragment;
  stylesheets: { [url: string]: string }[];
  renderTo: HTMLElement;
}

const kernel = vi.hoisted(() => ({
  calls: [] as PreviewCall[],
  mode: 'immediate' as 'immediate' | 'deferred' | 'fail',
  deferreds: [] as (() => void)[],
  // the deferred lane's reject side (codex r3): a late REJECTION
  // rides guarded's NORMAL error branch — the resolve-only lane
  // could not exercise it
  rejects: [] as ((error: Error) => void)[],
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
          // the top-left margin box (r7): the header-icon stamp targets
          // it — present on every mocked page so the fixture exercises
          // the prewarm→data-URI road
          const margin = document.createElement('div');
          margin.className = 'pagedjs_margin pagedjs_margin-top-left';
          const marginContent = document.createElement('div');
          marginContent.className = 'pagedjs_margin-content';
          margin.appendChild(marginContent);
          page.appendChild(margin);
          const holder = document.createElement('section');
          holder.setAttribute('data-id', i === 0 ? 'transaction' : `sec-${i}`);
          page.appendChild(holder);
          pages.appendChild(page);
        }
        renderTo.appendChild(pages);
      };
      if (kernel.mode === 'deferred') {
        return new Promise<{ total: number }>((resolve, reject) => {
          kernel.deferreds.push(() => {
            build();
            resolve({ total: 3 });
          });
          kernel.rejects.push((error: Error) => reject(error));
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
    // relocate's settled-layout gate times itself on performance.now
    // — a real clock against fake-advanced frames never crosses its
    // minimum window, stranding every flight in 'rendering'
    'performance',
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

/** flush the microtask chain (drive(0) advances nothing — its slice
 *  loop is empty at 0ms; the settle continuations ride microtasks) */
const flush = (): Promise<void> => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  kernel.calls.length = 0;
  kernel.mode = 'immediate';
  kernel.deferreds.length = 0;
  kernel.rejects.length = 0;
  makeMeasurable(800);
  vi.stubGlobal('print', vi.fn());
  root = document.createElement('main');
  root.setAttribute('data-print-source', '');
  root.setAttribute('data-density', 'sm'); // the committed intervention
  root.innerHTML =
    '<h2 id="transaction">The transaction</h2><p>one</p><h2 id="animation">Animation</h2><pre><code>a\nb</code></pre>';
  document.body.appendChild(root);
  pipeline = createPrintPipeline(() => root, () => ({ config: CONFIG }));
});

afterEach(() => {
  // destroy, not bare dispose: the ambient entry re-arms on dispose
  // (the pipeline survives it) — only destroy disarms, and these
  // listeners must not leak onto the shared jsdom window
  pipeline.destroy();
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
      // retire the flight tail's post-ready mend (its settle window
      // parks rAFs on the fake clock) before the timer hygiene read
      await drive(3000);
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

// =========================================================================
// THE AMBIENT PRINT ENTRY — beforeprint auto-init (Owner, 2026-09-01)
// =========================================================================
describe('ambient print: a browser-initiated print auto-initializes the pipeline', () => {
  const dispatchBeforePrint = (): void => {
    window.dispatchEvent(new Event('beforeprint'));
  };

  it('the pose lands synchronously, the pages mount with the layer grammar, afterprint owns the exit', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      dispatchBeforePrint();
      // the SYNCHRONOUS half: the pose beats the dialog — the app
      // shell is hidden the instant the dialog opens, whatever the
      // async half manages to mount in time
      expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(true);
      // the async half: the same transaction the print button runs,
      // with the layer's grammar (a cold Ctrl/Cmd+P never falls back
      // to a default page setup)
      await untilReady();
      expect(kernel.calls).toHaveLength(1);
      expect(kernel.calls[0]!.stylesheets.map((sheet) => Object.values(sheet).join('')).join('')).toContain('counter(page)');
      expect(pipeline.artifactMetadata).toBeDefined();
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true); // the ambient self-stamp
      // the flight NEVER calls window.print — the dialog is already
      // open (a second call would stack another)
      expect((window.print as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(0);
      dispatchAfterPrint();
      await flush(); // flush the settle + dispose microtasks
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // released
      expect(pipeline.status).toBe('idle');
      expect(document.querySelector('[data-print-output]')).toBeNull();
      expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a dialog that closes before the render finishes settles at completion (the artifact never outlives its print)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      kernel.mode = 'deferred';
      dispatchBeforePrint();
      await vi.waitFor(() => expect(kernel.deferreds).toHaveLength(1)); // render pends
      dispatchAfterPrint(); // the dialog LEFT while the render was in flight
      kernel.deferreds[0]!(); // the render lands AFTER afterprint
      await drive(450); // flush to completion + the settled-layout
      // gate (relocate's awaitSettledLayout holds a 250ms minimum
      // plus six quiet frames before the enforcement pass runs)
      expect(kernel.calls).toHaveLength(1); // the render ran (the live dialog got the pages)
      expect(pipeline.status).toBe('idle'); // …and settled at once
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false);
      expect(document.querySelector('[data-print-output]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('a beforeprint ours already owns is a no-op (the sim artifact, or our own in-flight print)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      // the sim artifact case: the pose is ours, the dialog prints the
      // paged output, no second render kicks
      const sim_ = pipeline.runSim({ config: CONFIG });
      await untilReady();
      dispatchBeforePrint();
      await flush();
      expect(kernel.calls).toHaveLength(1);
      await sim_;
      pipeline.closeSim();
      // the in-flight print case: OUR window.print() is what fires
      // beforeprint — the single-flight guard must not treat it as
      // ambient
      kernel.mode = 'deferred';
      const print_ = pipeline.runPrint({ config: CONFIG });
      await vi.waitFor(() => expect(kernel.deferreds).toHaveLength(1));
      dispatchBeforePrint();
      expect(kernel.calls).toHaveLength(2); // still just the print flight's render
      kernel.deferreds[0]!();
      await untilReady();
      dispatchAfterPrint();
      await print_;
      expect(kernel.calls).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('dispose re-arms the ambient entry; destroy (the layer unmount) is the only disarm', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      dispatchBeforePrint();
      await untilReady();
      dispatchAfterPrint();
      await flush(); // the exit disposed the artifact…
      expect(pipeline.status).toBe('idle');
      // …but the pipeline SURVIVES: the next ambient print re-initializes
      dispatchBeforePrint();
      await vi.waitFor(() => expect(kernel.calls).toHaveLength(2));
      dispatchAfterPrint();
      await flush();
      // TERMINAL: destroy takes the entry down with the layer
      pipeline.destroy();
      dispatchBeforePrint();
      await drive(50);
      expect(kernel.calls).toHaveLength(2); // nothing re-initialized
    } finally {
      vi.useRealTimers();
    }
  });
});

// =========================================================================
// codex r2 residuals — the P1-4/P1-5 closure
// =========================================================================
describe('codex r2: the afterprint wait and the config-failure road close', () => {
  it('a print() that dispatches afterprint SYNCHRONOUSLY settles inside the call — zero stray timers', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      // the embedded-environment shape: the stub dispatches the event
      // synchronously, INSIDE window.print() — the grace timer must
      // already exist for settle to clear it (r2: the old order armed
      // it after the call, leaving a dead 400ms timer behind)
      vi.stubGlobal('print', () => {
        window.dispatchEvent(new Event('afterprint'));
      });
      root.setAttribute(PRINT_SIM_ATTR, ''); // the caller's sim — survives
      const run_ = pipeline.runPrint({ config: CONFIG });
      await untilReady(); // drive the (fake-rAF) preparation to ready
      await flush(); // the wait executor: print() + the SYNC settle inside it
      await run_;
      // the flight's tail fired the post-ready mend — retire its
      // settle window before the zero-stray-timers assertion
      await drive(3000);
      expect(vi.getTimerCount()).toBe(0); // the fallback was CLEARED, not orphaned
      expect(pipeline.status).toBe('ready');
      expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('sim-survives direct prints keep the afterprint listener book BALANCED (no closure drift)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      root.setAttribute(PRINT_SIM_ATTR, '');
      for (let i = 0; i < 2; i++) {
        const run_ = pipeline.runPrint({ config: CONFIG });
        await untilReady();
        await drive(400); // the headless stub's grace fallback settles each
        await run_;
      }
      const added = addSpy.mock.calls.filter(([type]) => type === 'afterprint').length;
      const removed = removeSpy.mock.calls.filter(([type]) => type === 'afterprint').length;
      // each print's waiter detached ITSELF at settle (r2: the
      // registry closure went with it — no accumulation until dispose)
      expect(added).toBe(2);
      expect(removed).toBe(2);
      expect(pipeline.status).toBe('ready');
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a config the grammar rejects releases the self-stamp (no stranded medium)', async () => {
    // config is a PUBLIC unknown boundary — parsePageConfig throws
    // PageConfigError AFTER the transaction self-stamped (r2: the
    // throw used to bypass every release guard)
    const bad = {
      size: 'A4',
      margin: { top: -1, right: 16, bottom: 18, left: 16, unit: 'mm' },
    };
    await expect(pipeline.runPrint({ config: bad })).rejects.toThrow(PageConfigError);
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // NOT stranded
    expect(pipeline.status).toBe('error');
    expect(document.querySelector('[data-print-output]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
  });
});

// =========================================================================
// codex r3 — destroy is a terminal STATE, not a suggestion
// =========================================================================
describe('codex r3: destroy is terminal and enforced', () => {
  const dispatchBeforePrint = (): void => {
    window.dispatchEvent(new Event('beforeprint'));
  };

  it('a public dispose() after destroy does not resurrect the ambient entry', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      pipeline.destroy();
      pipeline.dispose(); // an external call — or a late flight's error branch
      dispatchBeforePrint();
      await drive(50);
      expect(kernel.calls).toHaveLength(0); // nothing re-initialized
      expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a late preview REJECT after destroy re-arms nothing (the error branch disposes, but the flag holds)', async () => {
    vi.useFakeTimers(FAKE_CLOCK);
    try {
      kernel.mode = 'deferred';
      dispatchBeforePrint();
      await vi.waitFor(() => expect(kernel.deferreds).toHaveLength(1)); // render pends
      pipeline.destroy(); // the layer leaves while the preview is in flight
      kernel.rejects[0]!(new Error('late rejection (test fixture)')); // the reject lane
      await drive(50); // the error branch: guarded catch → dispose (flagged — no re-arm)
      dispatchBeforePrint(); // whatever survived must not serve
      await drive(50);
      expect(kernel.calls).toHaveLength(1); // only the FIRST ambient render
      expect(pipeline.lastError).toMatch(/late rejection/); // the failure DID surface
      expect(document.querySelector('[data-print-output]')).toBeNull();
      expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('runSim/runPrint reject after destroy — no output, no stamps, no listeners', async () => {
    pipeline.destroy();
    await expect(pipeline.runSim({ config: CONFIG })).rejects.toThrow(/destroyed/);
    await expect(pipeline.runPrint({ config: CONFIG })).rejects.toThrow(/destroyed/);
    expect(kernel.calls).toHaveLength(0);
    expect(document.querySelector('[data-print-output]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false);
  });
});

// =========================================================================
// r7 — the mounted-artifact print fast path, prewarm, the pending bar
// =========================================================================
describe('r7: the bar print reuses the mounted sim (zero rebuild)', () => {
  it('a print with a mounted artifact never re-runs the pipeline — renderId holds, print is called, the artifact survives', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const callsAfterSim = kernel.calls.length;
    const output = document.querySelector('[data-print-output]') as HTMLElement;
    const metaBefore = JSON.parse(output.dataset.jxPrintMeta ?? '{}') as { renderId: number };
    expect(typeof metaBefore.renderId).toBe('number');

    const run_ = pipeline.runPrint({ config: CONFIG }); // the bar's print button
    await vi.waitFor(() => expect(vi.mocked(window.print)).toHaveBeenCalled());
    dispatchAfterPrint();
    await run_;

    expect(kernel.calls).toHaveLength(callsAfterSim); // ZERO rebuilds — the Owner's chaos is gone
    const metaAfter = JSON.parse(output.dataset.jxPrintMeta ?? '{}') as { renderId: number };
    expect(metaAfter.renderId).toBe(metaBefore.renderId); // same BUILD serves both exits
    expect(output.isConnected).toBe(true); // the sim stamp kept the artifact
    expect(pipeline.status).toBe('ready');
  });
});

describe('r7: prewarm resolves the header icon before any flight', () => {
  it('prewarm fetches the icon once and the stamp carries the data URI (synchronous bytes)', async () => {
    const config = {
      ...CONFIG,
      headerIcon: '/icon.svg',
      header: { 'top-left': 'string:docTitle' as const },
    };
    // string body: a jsdom-realm Blob chokes undici's Response
    // constructor (cross-realm BodyInit) — the string form is native
    const fetchMock = vi.fn(
      async () => new Response('<svg viewBox="0 0 48 48"/>', { headers: { 'content-type': 'image/svg+xml' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await pipeline.prewarm({ config });
    expect(fetchMock).toHaveBeenCalledWith('/icon.svg');

    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config });
    expect(fetchMock).toHaveBeenCalledTimes(1); // the flight hit the cache
    const icons = [...document.querySelectorAll('.jx-print-header-icon')] as HTMLImageElement[];
    expect(icons.length).toBe(3); // one per mocked page
    for (const icon of icons) {
      expect(icon.getAttribute('src')).toMatch(/^data:image\/svg\+xml;base64,/);
    }
  });

  it('prewarm never throws on an invalid config (the flight fails loud instead)', async () => {
    await expect(
      pipeline.prewarm({ config: { ...CONFIG, margin: { top: -1, right: 0, bottom: 0, left: 0, unit: 'mm' } as never } }),
    ).resolves.toBeUndefined();
    expect(kernel.calls).toHaveLength(0);
  });
});

describe('r7: the sim bar precedes the render', () => {
  it('a pending flight carries stage text and a disabled print button; ready enables it', async () => {
    kernel.mode = 'deferred';
    root.setAttribute(PRINT_SIM_ATTR, '');
    const run_ = pipeline.runSim({ config: CONFIG });
    await vi.waitFor(() => expect(kernel.deferreds).toHaveLength(1)); // the render pends

    const bar = document.querySelector('[data-jx-print-sim-bar]') as HTMLElement | null;
    expect(bar).not.toBeNull();
    const status = bar!.querySelector<HTMLElement>('[data-jx-print-bar-status]');
    expect(status?.textContent).toMatch(/rendering/);
    const printBtn = bar!.querySelector<HTMLButtonElement>('[data-jx-print-bar-print]');
    expect(printBtn?.disabled).toBe(true); // nothing to print yet
    // the r9 layout: [copy | actions] — the two texts STACK inside ONE
    // copy block (title label over status description), the buttons
    // group on the right; the stamp attribute names are unchanged
    const copy = bar!.querySelector<HTMLElement>('[data-jx-print-bar-copy]');
    expect(bar!.children).toHaveLength(2);
    expect(copy).not.toBeNull();
    expect(copy!.querySelector('[data-jx-print-bar-title]')).not.toBeNull();
    expect(copy!.contains(status!)).toBe(true);
    const actions = bar!.querySelector<HTMLElement>('[data-jx-print-bar-actions]');
    expect(actions).not.toBeNull();
    expect(actions!.contains(printBtn!)).toBe(true);
    expect(actions!.querySelector('[data-jx-print-bar-toggle]')).not.toBeNull();

    kernel.deferreds[0]!(); // the render lands
    await run_;
    expect(printBtn?.disabled).toBe(false);
    expect(status?.textContent).toMatch(/3 pages/);
  });
});
