/**
 * The pipeline gates (print-pipeline, 2026-08-30) — jsdom lane with
 * a MOCKED pagedjs kernel:
 *
 *   - the PREVIEW-INPUTS RUNTIME SPY: the real preview() arguments —
 *     kernel-print.css + the compiled @page css ONLY; sim-shell.css
 *     is NEVER in them; content is the detached, transformed clone;
 *     renderTo is the connected output sibling
 *   - STAMP OWNERSHIP (the r6 CLOSED fixture set): screen → direct
 *     print self-stamps and afterprint removes it (medium
 *     re-derives screen); an existing sim survives a direct print
 *     (reused, not owned — afterprint removes NOTHING, the artifact
 *     stays, the medium re-derives sim)
 *   - the DOM-COMMIT BARRIER fails loud (density not committed)
 *   - the MEASURABILITY assertion fails loud (offsetWidth 0)
 *   - THE SAME-ARTIFACT semantics: same config reuses (one preview);
 *     a config change rebuilds (two previews)
 *   - four-way IDEMPOTENT cleanup: no output root, no inserted head
 *     styles, no html active stamp, after sim-off / afterprint /
 *     failure / post-preview cancel
 *   - WAAPI diagnostics ride the sim rows without throwing
 *   - THE PAPER THEME (Owner ruling, 2026-09-03): absent = light —
 *     the output root stamps the theme sheet's own scope class +
 *     color-scheme (data-print-theme); a theme-only change rebuilds;
 *     under light the clone's dark:-variant utilities retire, under
 *     a dark declaration they stay
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRINT_SIM_ATTR } from '../src/lib/medium.svelte';
import { createPrintPipeline, type PrintPipeline } from '../src/lib/print/pipeline.svelte';
import kernelPrintCssRaw from '../src/lib/print/kernel-print.css?raw';

const spy = vi.hoisted(() => ({ calls: [] as PreviewCall[] }));
interface PreviewCall {
  content: DocumentFragment;
  stylesheets: { [url: string]: string }[];
  renderTo: HTMLElement;
}

vi.mock('pagedjs', () => ({
  Previewer: class {
    preview(content: DocumentFragment, stylesheets: { [url: string]: string }[], renderTo: HTMLElement) {
      spy.calls.push({ content, stylesheets, renderTo });
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
      return Promise.resolve({ total: 3 });
    }
  },
}));

// jsdom has no layout: make every element measurable by default, with
// per-test overrides for the fail-loud case
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
const makeMeasurable = (px: number): void => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => px,
  });
};

let root: HTMLElement;
let pipeline: PrintPipeline;
const CONFIG = {
  size: 'A4' as const,
  margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' as const },
  footer: { 'bottom-left': 'counter(page)' as const, 'bottom-right': 'counter(pages)' as const },
};

beforeEach(() => {
  spy.calls.length = 0;
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
  for (const style of document.head.querySelectorAll('[data-pagedjs-inserted-styles]')) style.remove();
  document.documentElement.removeAttribute('data-jx-print-active');
  if (originalOffsetWidth) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const dispatchAfterPrint = (): void => {
  window.dispatchEvent(new Event('afterprint'));
};

// =========================================================================
// the preview-inputs runtime spy
// =========================================================================
describe('preview() inputs (the runtime spy)', () => {
  it('feeds exactly kernel-print.css + the compiled @page css — sim-shell NEVER appears', async () => {
    await pipeline.runSim({ config: CONFIG });
    expect(spy.calls).toHaveLength(1);
    const call = spy.calls[0]!;
    expect(Object.keys(call.stylesheets[0]!)).toEqual(['jx-kernel-print.css']);
    expect(call.stylesheets[0]!['jx-kernel-print.css']).toBe(kernelPrintCssRaw);
    expect(Object.keys(call.stylesheets[1]!)).toEqual(['jx-page.css']);
    const pageCss = call.stylesheets[1]!['jx-page.css']!;
    expect(pageCss).toContain('@page');
    expect(pageCss).toContain('size: A4;');
    expect(pageCss).toContain('@bottom-left');
    // the red line: no sim shell, no not-print wrappers, in ANY input
    for (const sheet of call.stylesheets) {
      for (const text of Object.values(sheet)) {
        expect(text).not.toContain('sim-shell');
        expect(text).not.toContain('@media not print');
        expect(text).not.toContain('[data-jx-print-sim]');
      }
    }
  });

  it('content is the detached transformed clone (in a fragment); renderTo is the connected output sibling', async () => {
    await pipeline.runSim({ config: CONFIG });
    const call = spy.calls[0]!;
    // paged.js's element-root walker bug: the handoff rides a
    // DocumentFragment (still detached from the live tree)
    expect(call.content).toBeInstanceOf(DocumentFragment);
    const clone = call.content.firstElementChild!;
    expect(clone).not.toBe(root); // a clone, never the live tree
    expect(clone.getAttribute('data-print-source')).toBeNull(); // stripped
    expect(clone.querySelector('[data-jx-print-toc]')).not.toBeNull(); // ToC injected
    expect(call.renderTo.hasAttribute('data-print-output')).toBe(true);
    expect(call.renderTo.isConnected).toBe(true);
    expect(document.body.contains(call.renderTo)).toBe(true);
  });

  it('the clone carries the pre-line transform', async () => {
    await pipeline.runSim({ config: CONFIG });
    const clone = spy.calls[0]!.content.firstElementChild!;
    expect(clone.querySelectorAll('.jx-print-line')).toHaveLength(2);
  });
});

// =========================================================================
// the paper theme (Owner ruling, 2026-09-03): paper is white
// =========================================================================
describe('the paper theme stamp', () => {
  it('absent theme stamps LIGHT by law: jx-light scope + color-scheme on the output root', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const out = document.querySelector<HTMLElement>('[data-print-output]')!;
    expect(out.getAttribute('data-print-theme')).toBe('light');
    expect(out.classList.contains('jx-light')).toBe(true);
    expect(out.classList.contains('dark')).toBe(false);
    expect(out.style.colorScheme).toBe('light');
  });

  it("theme:'dark' declares the exception: dark scope + the stamp the kernel keys on", async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: { ...CONFIG, theme: 'dark' } });
    const out = document.querySelector<HTMLElement>('[data-print-output]')!;
    expect(out.getAttribute('data-print-theme')).toBe('dark');
    expect(out.classList.contains('dark')).toBe(true);
    expect(out.classList.contains('jx-light')).toBe(false);
    expect(out.style.colorScheme).toBe('dark');
  });

  it('a theme-only change REBUILDS (the stamp never survives the other scope) — idempotent re-stamp', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    await pipeline.runSim({ config: { ...CONFIG, theme: 'dark' } });
    expect(spy.calls).toHaveLength(2); // not the same artifact: the scope changed
    const out = document.querySelector<HTMLElement>('[data-print-output]')!;
    expect(out.classList.contains('dark')).toBe(true);
    expect(out.classList.contains('jx-light')).toBe(false); // no residue of the light flight
  });

  it("an invalid theme fails loud (the grammar's boundary)", async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await expect(pipeline.runSim({ config: { ...CONFIG, theme: 'blue' } })).rejects.toThrow(
      /theme/,
    );
    expect(spy.calls).toHaveLength(0);
  });
});

describe('the light declaration retires dark:-variant utilities from the clone', () => {
  const chipWithDarkUtilities = (): HTMLElement => {
    // inline-code's real shape: the light palette as plain utilities,
    // the dark adaptation as dark: variants (the form controls'
    // scheme-light dark:scheme-dark rides the same law)
    const chip = document.createElement('code');
    chip.className =
      'jx-inline-code [--tok-token-function:color-mix(in_oklab,var(--primary)_62%,var(--foreground))] dark:[--tok-token-function:color-mix(in_oklab,var(--primary)_58%,oklch(1_0_0))] scheme-light dark:scheme-dark';
    root.querySelector('p')!.appendChild(chip);
    return chip;
  };

  it('LIGHT retires every dark: class, keeps everything else (the paper-is-white clone half)', async () => {
    const chip = chipWithDarkUtilities();
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const clone = spy.calls[0]!.content.firstElementChild!;
    const clonedChip = clone.querySelector('code')!;
    expect(clonedChip).not.toBe(chip); // the product, never the live tree
    expect(clonedChip.classList.contains('dark:[--tok-token-function:color-mix(in_oklab,var(--primary)_58%,oklch(1_0_0))]')).toBe(false);
    expect(clonedChip.classList.contains('dark:scheme-dark')).toBe(false);
    // the light utilities ride untouched — they ARE the light palette
    expect(clonedChip.classList.contains('scheme-light')).toBe(true);
    expect(clonedChip.className).toContain('--tok-token-function:color-mix(in_oklab,var(--primary)_62%');
    // the live tree never changed
    expect(chip.className).toContain('dark:scheme-dark');
  });

  it('DARK keeps them — the utilities ARE the declared adaptation', async () => {
    chipWithDarkUtilities();
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: { ...CONFIG, theme: 'dark' } });
    const clone = spy.calls[0]!.content.firstElementChild!;
    expect(clone.querySelector('code')!.className).toContain('dark:scheme-dark');
  });
});

// =========================================================================
// the mounted-artifact fast path honors the paper declaration
// (codex print-paper-theme r1, 2026-09-03): the r7 zero-rebuild law
// covers the SAME config's live content — a CHANGED declaration (or
// an invalid one) must never print a stale scope silently
// =========================================================================
describe('the mounted-artifact fast path honors the declaration', () => {
  it('a mounted LIGHT sim + a dark direct print REBUILDS (never prints the stale scope)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const run_ = pipeline.runPrint({ config: { ...CONFIG, theme: 'dark' } });
    await vi.waitFor(() => expect(pipeline.status).toBe('ready'));
    expect(spy.calls).toHaveLength(2); // NOT the fast path — the declaration changed
    const out = document.querySelector<HTMLElement>('[data-print-output]')!;
    expect(out.getAttribute('data-print-theme')).toBe('dark');
    expect(out.classList.contains('dark')).toBe(true);
    expect(out.classList.contains('jx-light')).toBe(false);
    dispatchAfterPrint();
    await run_;
  });

  it('a mounted artifact + an INVALID theme fails loud (the fast path parses too)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    await expect(pipeline.runPrint({ config: { ...CONFIG, theme: 'blue' } })).rejects.toThrow(
      /theme/,
    );
    expect(pipeline.status).toBe('error');
  });

  it('the SAME config keeps the r7 zero-rebuild fast path (the bar print law holds)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const run_ = pipeline.runPrint({ config: CONFIG });
    await vi.waitFor(() => expect(pipeline.status).toBe('ready'));
    expect(spy.calls).toHaveLength(1); // the mounted artifact, no rebuild
    dispatchAfterPrint();
    await run_;
  });
});

// =========================================================================
// stamp ownership (the r6 fixtures)
// =========================================================================
describe('stamp transaction ownership', () => {
  it('screen → direct print: self-stamps; afterprint removes ONLY it; medium re-derives screen', async () => {
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false);
    const run_ = pipeline.runPrint({ config: CONFIG });
    await vi.waitFor(() => expect(pipeline.status).toBe('ready'));
    // the preparatory stamp preceded everything (visible BEFORE print)
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true);
    const meta = pipeline.artifactMetadata!;
    expect(meta.createdStamp).toBe(true);
    dispatchAfterPrint();
    await run_;
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(false); // only the self-stamp left
    expect(pipeline.status).toBe('idle'); // and the artifact disposed
    expect(document.querySelector('[data-print-output]')).toBeNull();
  });

  it('existing sim survives a direct print: afterprint removes NOTHING, the artifact stays', async () => {
    root.setAttribute(PRINT_SIM_ATTR, ''); // the sim toggle's stamp
    await pipeline.runSim({ config: CONFIG });
    const simOutput = document.querySelector('[data-print-output]');
    expect(simOutput).not.toBeNull();

    const run_ = pipeline.runPrint({ config: CONFIG }); // same hashes → REUSE
    await vi.waitFor(() => expect(pipeline.status).toBe('ready'));
    expect(spy.calls).toHaveLength(1); // the same completed artifact, no rebuild
    expect(pipeline.artifactMetadata!.createdStamp).toBe(false); // reused, not owned
    dispatchAfterPrint();
    await run_;
    // the transaction removed nothing it did not create:
    expect(root.hasAttribute(PRINT_SIM_ATTR)).toBe(true); // sim survives
    expect(pipeline.status).toBe('ready'); // the artifact stays
    expect(document.querySelector('[data-print-output]')).toBe(simOutput); // the same root
  });

  it('sim → off → on: the second run rebuilds cleanly (no stale pages)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const first = document.querySelector('[data-print-output]')!;
    expect(first.querySelectorAll('.pagedjs_page')).toHaveLength(3);
    root.removeAttribute(PRINT_SIM_ATTR);
    pipeline.closeSim();
    expect(document.querySelector('[data-print-output]')).toBeNull();

    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const second = document.querySelector('[data-print-output]')!;
    expect(second).not.toBe(first);
    expect(second.querySelectorAll('.pagedjs_page')).toHaveLength(3);
    expect(spy.calls).toHaveLength(2);
  });
});

// =========================================================================
// the same-artifact semantics
// =========================================================================
describe('the same-artifact hash semantics', () => {
  it('the same config reuses the completed artifact (one preview)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    await pipeline.runSim({ config: CONFIG });
    expect(spy.calls).toHaveLength(1);
    expect(pipeline.pageCount).toBe(3);
  });

  it('a config change invalidates (different stylesheet hash → rebuild)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    await pipeline.runSim({
      config: { ...CONFIG, margin: { top: 20, right: 20, bottom: 20, left: 20, unit: 'mm' } },
    });
    expect(spy.calls).toHaveLength(2);
    expect(spy.calls[1]!.stylesheets[1]!['jx-page.css']).toContain('margin: 20mm 20mm 20mm 20mm');
  });
});

// =========================================================================
// fail-loud assertions
// =========================================================================
describe('fail-loud contracts', () => {
  it('the DOM-commit barrier refuses a half-intervened tree', async () => {
    root.setAttribute('data-density', 'default'); // the intervention never committed
    root.setAttribute(PRINT_SIM_ATTR, '');
    await expect(pipeline.runSim({ config: CONFIG })).rejects.toThrow(/DOM-commit barrier/);
    expect(spy.calls).toHaveLength(0);
    expect(pipeline.status).toBe('error');
  });

  it('an unmeasurable output root fails instead of emitting zero-size pages', async () => {
    makeMeasurable(0); // display:none-equivalent
    root.setAttribute(PRINT_SIM_ATTR, '');
    await expect(pipeline.runSim({ config: CONFIG })).rejects.toThrow(/not measurable/);
    expect(spy.calls).toHaveLength(0);
    expect(document.querySelector('[data-print-output]')).toBeNull(); // no residue
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
  });

  it('preparation-phase cancellation aborts the transaction', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    const run_ = pipeline.runSim({ config: CONFIG, timeoutMs: 60 });
    pipeline.cancel(); // before preview entry
    await expect(run_).rejects.toThrow();
    expect(spy.calls).toHaveLength(0);
  });

  it('post-preview cancellation leaves no residue (best-effort removal)', async () => {
    const run_ = pipeline.runPrint({ config: CONFIG });
    await vi.waitFor(() => expect(pipeline.status).toBe('ready'));
    pipeline.cancel(); // after preview entry
    await run_; // the stubbed print's grace exit settles the promise
    expect(document.querySelector('[data-print-output]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
  });
});

// =========================================================================
// four-way idempotent cleanup + diagnostics
// =========================================================================
describe('cleanup and diagnostics', () => {
  it('sim-off cleans pages, head styles, listeners and the active stamp', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(true);
    pipeline.closeSim();
    expect(document.querySelector('[data-print-output]')).toBeNull();
    expect(document.documentElement.hasAttribute('data-jx-print-active')).toBe(false);
    // idempotent
    pipeline.closeSim();
    pipeline.dispose();
  });

  it('a failed retry leaves no residue (the failure road)', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    makeMeasurable(0); // force the next attempt to fail
    await expect(pipeline.runSim({ config: { ...CONFIG, size: 'Letter' } })).rejects.toThrow(
      /not measurable/,
    );
    expect(document.querySelector('[data-print-output]')).toBeNull();
    makeMeasurable(800);
    await pipeline.runSim({ config: { ...CONFIG, size: 'Letter' } }); // the retry succeeds
    expect(document.querySelector('[data-print-output]')!.querySelectorAll('.pagedjs_page')).toHaveLength(3);
  });

  it('WAAPI owners continue with a structured diagnostic row (no throw)', async () => {
    class AnimationFake {
      playState = 'running';
      currentTime = 1234;
      effect = { target: root.querySelector('p') };
      pause = vi.fn();
      play = vi.fn();
    }
    (window as unknown as { Animation: unknown }).Animation = AnimationFake;
    const anim = new AnimationFake();
    root.getAnimations = () => [anim as unknown as Animation];
    root.setAttribute(PRINT_SIM_ATTR, '');
    await pipeline.runSim({ config: CONFIG });
    const codes = pipeline.diagnostics.map((d) => d.code);
    expect(codes).toContain('WAAPI');
    expect(pipeline.status).toBe('ready');
    // the sim's diagnostic row rides the output root's metadata too
    const meta = JSON.parse(
      document.querySelector('[data-print-output]')!.dataset.jxPrintMeta!,
    ) as { diagnostics: { code: string }[] };
    expect(meta.diagnostics.map((d) => d.code)).toContain('WAAPI');
  });

  it('single-flight: a second run while in flight joins the first', async () => {
    root.setAttribute(PRINT_SIM_ATTR, '');
    const first = pipeline.runSim({ config: CONFIG });
    const second = pipeline.runSim({ config: CONFIG });
    await Promise.all([first, second]);
    expect(spy.calls).toHaveLength(1);
  });
});
