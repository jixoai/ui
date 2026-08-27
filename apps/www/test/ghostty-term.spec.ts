//
// ghostty-term component suite (test/ghostty-term.spec.ts, 2026-08-28).
//
// Two layers against the SAME component source (registry/files/ui/
// ghostty-term/ghostty-term.svelte — the same-source law; the src/lib
// mirror lands with Batch E):
//
//   logic level — the vt-deps seam module (which owns the
//   virtual:jixoai-ghostty and $lib/ghostty-vt ids — neither resolvable
//   under the bare jsdom vitest config) is vi.mock'ed with a dispatcher
//   that delegates to the REAL registry binding by default; logic tests
//   swap in scripted fakes. Canvas 2d contexts come from a recording
//   stub on HTMLCanvasElement.prototype.getContext (jsdom has no canvas
//   rasterizer) and ResizeObserver/rAF are controllable stubs.
//
//   integration level — the REAL pinned wasm (same acquisition chain as
//   ghostty-vt.spec.ts) loaded through the real binding via a data: URL
//   fetched by undici's fetch (Node 22), driving the component's full
//   load→grid→write→dirty-paint→keyEncode pipeline. Skipped when fetch
//   or the wasm bytes are unavailable.
//
// Owner original demand: 2026-08-28 "ghostty-term / Batch D (design.md D5)".
//

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { flushSync, mount, unmount, type ComponentProps } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  GhosttyKeyEventLike,
  GhosttyVT,
  LoadGhosttyVTOpts,
  RowSnapshot,
} from '../../../registry/files/lib/ghostty-vt';
import GhosttyTerm from '../../../registry/files/ui/ghostty-term/ghostty-term.svelte';

// ---------------------------------------------------------------------------
// loader seam: the vt-deps module (which owns the virtual:jixoai-ghostty
// and $lib/ghostty-vt ids) is mocked with a delegating dispatcher
// ---------------------------------------------------------------------------

const loader = vi.hoisted(() => ({
  impl: null as ((opts: LoadGhosttyVTOpts) => Promise<GhosttyVT>) | null,
}));

vi.mock('../../../registry/files/ui/ghostty-term/vt-deps.ts', async () => {
  // default: the REAL binding from the registry source (same-source law);
  // logic tests override loader.impl with scripted fakes. The virtual url
  // stays a fixed marker — the jsdom config has no vite plugin, so the
  // real virtual module is Batch A/plugin + browser-probe territory.
  const real = await import('../../../registry/files/lib/ghostty-vt');
  return {
    virtualWasmUrl: () => Promise.resolve('mock://ghostty-vt.wasm'),
    loadVt: (opts: LoadGhosttyVTOpts): Promise<GhosttyVT> =>
      (loader.impl ?? real.loadGhosttyVT)(opts),
  };
});

// ---------------------------------------------------------------------------
// platform stubs (canvas recorder, ResizeObserver, rAF)
// ---------------------------------------------------------------------------

interface RecordedOp {
  op: 'setTransform' | 'fillRect' | 'fillText';
  args: number[];
  text?: string;
  font?: string;
  fillStyle?: string;
}

interface CtxRecorder {
  font: string;
  fillStyle: string;
  textBaseline: string;
  ops: RecordedOp[];
  measureText(text: string): { width: number };
  setTransform(...args: number[]): void;
  fillRect(...args: number[]): void;
  fillText(text: string, x: number, y: number): void;
}

/** advance width the stubbed measureText reports for 'W' (default 10). */
let measureW = 10;
const ctxRecorders: CtxRecorder[] = [];

const makeCtxRecorder = (): CtxRecorder => {
  const ctx = {
    font: '',
    fillStyle: '',
    textBaseline: '',
    ops: [] as RecordedOp[],
    setTransform(...args: number[]): void {
      ctx.ops.push({ op: 'setTransform', args });
    },
    fillRect(...args: number[]): void {
      ctx.ops.push({ op: 'fillRect', args, fillStyle: ctx.fillStyle });
    },
    fillText(text: string, x: number, y: number): void {
      ctx.ops.push({ op: 'fillText', args: [x, y], text, font: ctx.font, fillStyle: ctx.fillStyle });
    },
    measureText(text: string): { width: number } {
      return { width: text === 'W' ? measureW : Math.round(text.length * measureW * 0.8) };
    },
  } satisfies CtxRecorder;
  return ctx;
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: (): CtxRecorder => {
    const recorder = makeCtxRecorder();
    ctxRecorders.push(recorder);
    return recorder;
  },
});

/** last mounted component's canvas recorder (one canvas per mount) */
const lastCtx = (): CtxRecorder => ctxRecorders[ctxRecorders.length - 1]!;
const fillTexts = (ctx: CtxRecorder): RecordedOp[] => ctx.ops.filter((op) => op.op === 'fillText');

/** controllable ResizeObserver — tests emit content rects manually */
class ControlledRO {
  static last: ControlledRO | null = null;
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ControlledRO.last = this;
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  emit(width: number, height: number): void {
    const entry = {
      contentRect: { width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height },
      target: null,
    } as unknown as ResizeObserverEntry;
    this.callback([entry], this as unknown as ResizeObserver);
  }
}
// setup.ts' jsdom polyfill installs a writable but NON-configurable
// ResizeObserver, so only a value swap (no descriptor reshape) is legal —
// plain assignment on window AND globalThis (the component resolves the
// free identifiers through globalThis) is the seam
const rafStub = (cb: FrameRequestCallback): number =>
  setTimeout(() => cb(0), 0) as unknown as number;
const cancelRafStub = (id: number): void => {
  clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
};
(window as unknown as Record<string, unknown>).ResizeObserver = ControlledRO;
(globalThis as unknown as Record<string, unknown>).ResizeObserver = ControlledRO;
(globalThis as unknown as Record<string, unknown>).requestAnimationFrame = rafStub;
(globalThis as unknown as Record<string, unknown>).cancelAnimationFrame = cancelRafStub;

// ---------------------------------------------------------------------------
// fake vt (scripted dirty rows, recording calls)
// ---------------------------------------------------------------------------

const enc = (text: string): Uint8Array => new TextEncoder().encode(text);
const dec = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

const DEFAULT_FG = 'rgb(255, 255, 255)';
const DEFAULT_BG = 'rgb(0, 0, 0)';

const cellOf = (
  grapheme: string,
  style: Partial<RowSnapshot['cells'][number]['style']> = {},
): RowSnapshot['cells'][number] => ({
  grapheme,
  style: {
    bold: false,
    italic: false,
    underline: 0,
    reverse: false,
    invisible: false,
    fg: DEFAULT_FG,
    bg: DEFAULT_BG,
    ...style,
  },
});

const blankRows = (cols: number, rows: number): RowSnapshot[] =>
  Array.from({ length: rows }, (_, y) => ({ y, cells: Array.from({ length: cols }, () => cellOf('')) }));

interface FakeCalls {
  writes: Uint8Array[];
  resizes: Array<[number, number]>;
  scrolls: number[];
  resets: number;
  frees: number;
  keyEvents: unknown[];
}

const makeFakeVt = (
  onWrite?: (text: string) => RowSnapshot[] | undefined,
): { vt: GhosttyVT; calls: FakeCalls } => {
  const calls: FakeCalls = { writes: [], resizes: [], scrolls: [], resets: 0, frees: 0, keyEvents: [] };
  let dims = [80, 24];
  // the pristine terminal is fully dirty (mirrors the real wasm's first
  // pass — the component samples its default ink/paper sentinels there)
  let dirty: RowSnapshot[] = blankRows(dims[0]!, dims[1]!);
  const vt: GhosttyVT = {
    buildInfo: 'fake-ghostty 1.0',
    variant: 'full',
    typeLayout: {
      schema: 1,
      library_version: 'fake',
      commit: null,
      dirty: false,
      abi: {
        target: 'wasm32',
        os: 'unknown',
        environment: 'gnu',
        pointer_size: 4,
        usize_size: 4,
        max_alignment: 16,
        endian: 'little',
      },
      types: {},
    },
    new(cols: number, rows: number): void {
      dims = [cols, rows];
    },
    reset(): void {
      calls.resets++;
      dirty = blankRows(dims[0]!, dims[1]!);
    },
    resize(cols: number, rows: number): void {
      calls.resizes.push([cols, rows]);
      dims = [cols, rows];
      dirty = blankRows(cols, rows);
    },
    scrollViewport(lines: number): void {
      calls.scrolls.push(lines);
    },
    vtWrite(bytes: Uint8Array): void {
      calls.writes.push(bytes);
      const text = dec(bytes);
      dirty = onWrite?.(text) ?? [{ y: 0, cells: [...text].map((ch) => cellOf(ch)) }];
    },
    dirtyRows(): IterableIterator<RowSnapshot> {
      const pendingRows = dirty;
      dirty = [];
      return pendingRows[Symbol.iterator]();
    },
    keyEncode(event: GhosttyKeyEventLike): Uint8Array {
      calls.keyEvents.push(event);
      if (event.key === 'Enter') return Uint8Array.of(13);
      if (event.key === 'a') return Uint8Array.of(97);
      if (event.key === 'A') return Uint8Array.of(65);
      return new Uint8Array(0);
    },
    paste: {
      isSafe: (text: string): boolean => !text.includes('\n'),
      encode: (text: string): Uint8Array => enc(text),
    },
    snapshotEncode: (): string => 'ZmFrZS1zbmFwc2hvdA==', // base64 "fake-snapshot"
    free(): void {
      calls.frees++;
    },
  };
  return { vt, calls };
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

interface TermComponent {
  write(bytes: Uint8Array): void;
  reset(): void;
  resizeTo(cols: number, rows: number): void;
  snapshot(): string;
}

interface Mounted {
  component: TermComponent;
  root: HTMLDivElement;
  canvas: HTMLCanvasElement;
}

const mounted: { unmount(): void }[] = [];

const renderTerm = (props: Record<string, unknown> = {}): Mounted => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = mount(GhosttyTerm, {
    target,
    props: props as ComponentProps<typeof GhosttyTerm>,
  }) as unknown as TermComponent;
  const root = target.querySelector<HTMLDivElement>('[data-jx-ghostty-term]')!;
  mounted.push({
    unmount(): void {
      unmount(component as never);
      target.remove();
    },
  });
  return { component, root, canvas: root.querySelector('canvas')! };
};

const waitFor = async (probe: () => boolean, timeoutMs = 5000): Promise<void> => {
  const started = Date.now();
  while (!probe()) {
    if (Date.now() - started > timeoutMs) throw new Error('waitFor: condition not met in time');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

/** let stubbed rAF frames and svelte effects settle */
const settle = async (rounds = 4): Promise<void> => {
  for (let i = 0; i < rounds; i++) {
    flushSync();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const keyDown = (root: HTMLDivElement, init: KeyboardEventInit): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  root.dispatchEvent(event);
  return event;
};

beforeEach(() => {
  ctxRecorders.length = 0;
  ControlledRO.last = null;
  measureW = 10;
});

afterEach(() => {
  while (mounted.length > 0) mounted.pop()!.unmount();
  loader.impl = null;
});

// ---------------------------------------------------------------------------
// logic level
// ---------------------------------------------------------------------------

describe('ghostty-term load seam and state machine', () => {
  it('resolves the wasm url through the virtual module when no prop is given', async () => {
    const { vt, calls } = makeFakeVt();
    const seenOpts: LoadGhosttyVTOpts[] = [];
    loader.impl = async (opts) => {
      seenOpts.push(opts);
      return vt;
    };
    const term = renderTerm();
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    expect(seenOpts).toEqual([{ url: 'mock://ghostty-vt.wasm' }]);
    expect(calls.frees).toBe(0);
  });

  it('prefers an explicit wasmUrl prop over the virtual module', async () => {
    const { vt } = makeFakeVt();
    const seenOpts: LoadGhosttyVTOpts[] = [];
    loader.impl = async (opts) => {
      seenOpts.push(opts);
      return vt;
    };
    const term = renderTerm({ wasmUrl: 'custom://wasm' });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    expect(seenOpts).toEqual([{ url: 'custom://wasm' }]);
  });

  it('stamps loading → ready and exposes the canvas aria-hidden', async () => {
    const { vt } = makeFakeVt();
    let release: ((value: GhosttyVT) => void) | undefined;
    loader.impl = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    const term = renderTerm();
    // let the boot microtasks reach the (pending) loader before asserting
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(term.root.getAttribute('data-state')).toBe('loading');
    release!(vt);
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    const canvas = term.root.querySelector('canvas')!;
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('degrades to data-state=error with a terminal-styled fallback face', async () => {
    loader.impl = () => Promise.reject(new Error('simd128 missing'));
    const term = renderTerm();
    await waitFor(() => term.root.getAttribute('data-state') === 'error');
    const fallback = term.root.querySelector('[role="status"]')!;
    expect(fallback.textContent).toContain('ghostty-term: simd128 missing');
  });

  it('frees the vt on destroy exactly once', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 4, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    mounted.pop()!.unmount();
    expect(calls.frees).toBe(1);
  });

  it('flushes pre-ready writes once the wasm becomes ready (no data loss)', async () => {
    // the race: write() lands while the wasm bootstrap is still pending;
    // the rAF that fires in between sees vt === null and used to return
    // without rescheduling — the queued chunk was silently dropped
    const { vt, calls } = makeFakeVt();
    let release: ((value: GhosttyVT) => void) | undefined;
    loader.impl = () =>
      new Promise((resolve) => {
        release = resolve;
      });
    const term = renderTerm({ cols: 8, rows: 2 });
    // let the boot microtasks reach the (pending) loader
    await new Promise((resolve) => setTimeout(resolve, 0));

    term.component.write(enc('Hi')); // pre-ready write
    await settle(2); // rAF fires while vt === null — chunk must survive
    expect(term.root.getAttribute('data-state')).toBe('loading');
    expect(calls.writes.length).toBe(0);

    release!(vt);
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    expect(calls.writes.length).toBe(1);
    expect(dec(calls.writes[0]!)).toBe('Hi');
    const texts = fillTexts(lastCtx()).map((op) => op.text);
    expect(texts).toContain('H');
    expect(texts).toContain('i');
  });
});

describe('ghostty-term root contract', () => {
  it('merges class, forwards rest verbatim, keeps the component stamps last', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({
      class: 'consumer-extra',
      'data-testid': 'gt-root',
      title: 'shell',
      'aria-label': 'My session',
    });
    expect(term.root.className).toContain('consumer-extra');
    expect(term.root.className).toContain('bg-terminal');
    expect(term.root.getAttribute('data-testid')).toBe('gt-root');
    expect(term.root.getAttribute('title')).toBe('shell');
    // rest overrides the default accessible name
    expect(term.root.getAttribute('aria-label')).toBe('My session');
    // component-owned stamps survive the spread
    expect(term.root.hasAttribute('data-jx-ghostty-term')).toBe(true);
    expect(term.root.getAttribute('tabindex')).toBe('0');
  });

  it('defaults the accessible name and density stamp', () => {
    const term = renderTerm();
    expect(term.root.getAttribute('aria-label')).toBe('terminal');
    expect(term.root.getAttribute('data-density')).toBe('default');
  });
});

describe('ghostty-term geometry', () => {
  it('auto mode maps the container box to cols/rows via the cell metrics', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const onResize = vi.fn();
    const term = renderTerm({ onResize });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    // measureW 10, fontSize fallback 13px, leading fallback 20/13 → row 20px
    ControlledRO.last!.emit(205, 68); // → 20 cols × 3 rows
    await settle();
    expect(term.canvas.style.width).toBe('200px');
    expect(term.canvas.style.height).toBe('60px');
    expect(term.canvas.width).toBe(200); // dpr 1 in jsdom
    expect(calls.resizes.at(-1)).toEqual([20, 3]);
    expect(onResize).toHaveBeenCalledWith({ cols: 20, rows: 3 });

    ControlledRO.last!.emit(105, 45); // → 10 cols × 2 rows
    await settle();
    expect(term.canvas.style.width).toBe('100px');
    expect(onResize).toHaveBeenLastCalledWith({ cols: 10, rows: 2 });
  });

  it('explicit cols/rows fix the grid without a ResizeObserver', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    expect(ControlledRO.last).toBeNull();
    expect(term.canvas.style.width).toBe('80px');
    expect(term.canvas.style.height).toBe('40px');
    expect(calls.resizes[0]).toEqual([8, 2]);
  });

  it('rejects a non-finite/non-positive fontSize with one warn and the density fallback', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2, fontSize: -5 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain('finite positive');
    // fallback 13px × leading 20/13 → row height 20 → canvas 40px tall
    expect(term.canvas.style.height).toBe('40px');
    expect(lastCtx().font).toContain('13px');
    warn.mockRestore();
  });

  it('accepts a valid fontSize override and re-derives the row height', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2, fontSize: 26 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    // 26px × 20/13 leading → row 40px → canvas 80px tall
    expect(term.canvas.style.height).toBe('80px');
    expect(lastCtx().font).toContain('26px');
  });
});

describe('ghostty-term render pipeline', () => {
  it('paints one fillText per non-empty cell at cell-width strides', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    term.component.write(enc('Hi!'));
    await settle();
    const texts = fillTexts(lastCtx());
    expect(texts.map((op) => op.text)).toEqual(['H', 'i', '!']);
    expect(texts.map((op) => op.args[0])).toEqual([0, 10, 20]); // x = col * 10
    expect(texts.every((op) => op.args[1] === 10)).toBe(true); // y = rowH/2
    expect(texts[0]!.font).toContain('JetBrains Mono');
  });

  it('batches multiple writes into one vtWrite per frame', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    const writesBefore = calls.writes.length;
    term.component.write(enc('ab'));
    term.component.write(enc('cd'));
    term.component.write(enc('ef'));
    await settle();
    expect(calls.writes.length).toBe(writesBefore + 1);
    expect(dec(calls.writes.at(-1)!)).toBe('abcdef');
  });

  it('maps SGR styling onto the canvas (bold weight, italic slant, color passthrough)', async () => {
    const styled: RowSnapshot[] = [
      {
        y: 0,
        cells: [
          cellOf('G', { bold: true, fg: 'rgb(181, 189, 104)' }),
          cellOf('M', { italic: true, fg: 'rgb(255, 0, 255)' }),
        ],
      },
    ];
    const { vt } = makeFakeVt((text) => (text === 'GM' ? styled : undefined));
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    term.component.write(enc('GM'));
    await settle();
    const texts = fillTexts(lastCtx());
    expect(texts[0]!.font).toContain('700');
    expect(texts[0]!.fillStyle).toBe('rgb(181, 189, 104)');
    expect(texts[1]!.font).toContain('italic');
    expect(texts[1]!.fillStyle).toBe('rgb(255, 0, 255)');
  });

  it('substitutes the wasm default ink/paper with the themed shell colors', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2, theme: { background: '#123456', foreground: '#abcdef' } });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();
    term.component.write(enc('X'));
    await settle();
    const texts = fillTexts(lastCtx());
    // default-fg cells paint the themed shell ink (parsed to rgb)
    expect(texts[0]!.fillStyle).toBe('rgb(171, 205, 239)');
    // the row paper rect used the themed shell background
    const paper = lastCtx().ops.find((op) => op.op === 'fillRect' && op.args[3] === 20);
    expect(paper?.fillStyle).toBe('rgb(18, 52, 86)');
  });
});

describe('ghostty-term input bridge', () => {
  it('encodes keydown through keyEncode and emits onData bytes', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const onData = vi.fn();
    const term = renderTerm({ cols: 8, rows: 2, onData });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    const event = keyDown(term.root, { key: 'Enter', code: 'Enter' });
    expect(event.defaultPrevented).toBe(true);
    expect(onData).toHaveBeenCalledTimes(1);
    expect(Array.from(onData.mock.calls[0]![0]!)).toEqual([13]);
    expect(calls.keyEvents[0]).toMatchObject({ key: 'Enter', code: 'Enter' });
  });

  it('skips bare modifier keys without consuming them', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const onData = vi.fn();
    const term = renderTerm({ cols: 8, rows: 2, onData });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    const shift = keyDown(term.root, { key: 'Shift', code: 'ShiftLeft' });
    expect(shift.defaultPrevented).toBe(false);
    expect(onData).not.toHaveBeenCalled();
  });

  it('does not consume keys the encoder produced no bytes for', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const onData = vi.fn();
    const term = renderTerm({ cols: 8, rows: 2, onData });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    const f13 = keyDown(term.root, { key: 'F13', code: 'F13' });
    expect(f13.defaultPrevented).toBe(false);
    expect(onData).not.toHaveBeenCalled();
  });

  it('gates paste through isSafe and encodes safe text', async () => {
    const { vt } = makeFakeVt();
    loader.impl = async () => vt;
    const onData = vi.fn();
    const term = renderTerm({ cols: 8, rows: 2, onData });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');

    const paste = (text: string): boolean => {
      const event = new Event('paste', { cancelable: true, bubbles: true });
      Object.defineProperty(event, 'clipboardData', {
        value: { getData: (type: string): string => (type === 'text/plain' ? text : '') },
      });
      term.root.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(paste('safe text')).toBe(true);
    expect(onData).toHaveBeenCalledTimes(1);
    expect(dec(onData.mock.calls[0]![0]!)).toBe('safe text');

    onData.mockClear();
    expect(paste('line1\nline2')).toBe(true); // swallowed but not emitted
    expect(onData).not.toHaveBeenCalled();
  });

  it('scrolls the viewport by wheel lines and never lets the page scroll', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();

    const wheel = (deltaY: number): WheelEvent => {
      const event = new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true });
      term.root.dispatchEvent(event);
      return event;
    };

    // row height 20 → deltaY 120 = 6 lines; wheel-down feeds POSITIVE lines
    const down = wheel(120);
    expect(down.defaultPrevented).toBe(true);
    expect(calls.scrolls.at(-1)).toBe(6);

    const up = wheel(-40);
    expect(up.defaultPrevented).toBe(true);
    expect(calls.scrolls.at(-1)).toBe(-2);
  });
});

describe('ghostty-term handle API', () => {
  it('reset / resizeTo / snapshot reach the vt surface', async () => {
    const { vt, calls } = makeFakeVt();
    loader.impl = async () => vt;
    const term = renderTerm({ cols: 8, rows: 2 });
    await waitFor(() => term.root.getAttribute('data-state') === 'ready');
    await settle();

    expect(term.component.snapshot()).toBe('ZmFrZS1zbmFwc2hvdA==');

    term.component.resizeTo(12, 5);
    await settle();
    expect(calls.resizes.at(-1)).toEqual([12, 5]);
    expect(term.canvas.style.width).toBe('120px');

    term.component.reset();
    expect(calls.resets).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// integration level — the REAL wasm through the component's load path
// ---------------------------------------------------------------------------

const DEFAULT_LOCAL_WASM = '/tmp/ghostty-research/ghostty-vt.wasm';

const acquireWasmBytes = async (): Promise<Uint8Array> => {
  const envPath = process.env.JIXOAI_GHOSTTY_WASM_PATH;
  if (envPath !== undefined) return new Uint8Array(readFileSync(envPath));
  if (existsSync(DEFAULT_LOCAL_WASM)) return new Uint8Array(readFileSync(DEFAULT_LOCAL_WASM));
  const { readPin, resolveWasmFromPin } = await import(
    '../../../packages/vite-plugin/src/resolve'
  );
  const pinPath = join(process.cwd(), '../../packages/vite-plugin/ghostty.pin.json');
  const pin = await readPin(pinPath);
  const resolved = await resolveWasmFromPin(pin, { variant: 'full' });
  return resolved.bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

const canFetchDataUrl = typeof fetch === 'function';

describe.skipIf(!canFetchDataUrl)('ghostty-term real wasm integration', () => {
  it('loads via a data: URL, paints written text, and answers with real encodings', async () => {
    const bytes = await acquireWasmBytes();
    const wasmUrl = `data:application/wasm;base64,${bytesToBase64(bytes)}`;
    const onData = vi.fn();
    const term = renderTerm({ cols: 40, rows: 6, wasmUrl, onData });

    await waitFor(() => term.root.getAttribute('data-state') === 'ready', 30_000);
    expect(term.canvas.style.width).toBe(`${40 * measureW}px`);

    term.component.write(enc('Hi'));
    await settle(8);
    const texts = fillTexts(lastCtx()).map((op) => op.text);
    expect(texts).toContain('H');
    expect(texts).toContain('i');

    // real keyEncode: Enter → CR
    keyDown(term.root, { key: 'Enter', code: 'Enter' });
    await settle();
    expect(Array.from(onData.mock.calls[0]![0]!)).toEqual([13]);

    // real snapshot: base64, non-trivial
    const snapshot = term.component.snapshot();
    expect(snapshot.length).toBeGreaterThan(100);
    expect(snapshot).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  }, 120_000);
});
