/**
 * liquid-glass-action.spec.ts — the mount runtime + filter chain
 * (glass-effect design §4/§10, 2026-09-08), jsdom.
 *
 * Contracts:
 *  - buildFilter (pure DOM, node-buildable): kube's NINE primitives in
 *    THEIR verbatim order — feGaussianBlur → feImage lens →
 *    feDisplacementMap → feColorMatrix saturate → feImage specular →
 *    feComposite in → feComponentTransfer(feFuncA slope) → feBlend ×2 —
 *    with the fx-derived stdDeviation/scale/saturate/slope values, both
 *    feImages at element size (x=0 y=0 width height), sRGB;
 *  - attachLiquidGlass mount: stamps the channel + vars, and (canvas
 *    stubbed) appends the host svg + chain to document.body and writes
 *    the --jx-glass-filter pointer AFTER the node exists (the render
 *    law — a SET pointer never precedes its fragment);
 *  - the shape override beats border-radius at measure ('capsule' =
 *    min(w,h)/2; number = px clamped; unset = the element's computed
 *    border-radius; nothing computable = full capsule) — verified by
 *    capturing the encoded field through the canvas stub and comparing
 *    byte-for-byte with computeLensField at the expected radius;
 *  - update(fx) re-stamps the vars and rebuilds the chain;
 *  - destroy removes the host svg, the pointer var, and the RO;
 *  - the NO-CANVAS guard: jsdom's getContext('2d') is null — with a
 *    NON-ZERO rect mocked (jsdom rects are 0×0, so the zero-box guard
 *    would fire first — the design's own note), the mount stamps vars
 *    and returns: frost stands, no svg, no pointer, no crash;
 *  - the ZERO-BOX guard: a 0×0 element (display:none posture) mounts
 *    quietly — no svg, no pointer, no crash (the RO catches it later);
 *  - the Svelte action wrapper returns the {update, destroy} handle.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  attachLiquidGlass,
  buildFilter,
  liquidGlass,
} from '../src/lib/ui/glass/liquid-glass.svelte';
import { computeLensField, type RasterField } from '../src/lib/ui/glass/glass-map';
import { liquid } from '../src/lib/ui/glass/glass';

// ---- shared fixtures --------------------------------------------------------
const RECT_420x56 = {
  width: 420,
  height: 56,
  top: 0,
  left: 0,
  right: 420,
  bottom: 56,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

/** jsdom has no layout: pin a non-zero box per element */
function mockRect(el: Element, rect: DOMRect = RECT_420x56) {
  return vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect);
}

/** canvas 2D stub: captures every encoded field (lens first, specular
 *  second), returns stub PNG urls; the captures ride a module-level list
 *  the shape-override specs read back */
let captures: Uint8ClampedArray[] = [];
function stubCanvas() {
  captures = [];
  const ctx = {
    createImageData: (w: number, h: number) => ({
      width: w,
      height: h,
      data: new Uint8ClampedArray(w * h * 4),
    }),
    putImageData: (img: { data: Uint8ClampedArray }) => {
      captures.push(new Uint8ClampedArray(img.data));
    },
  };
  const getCtx = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  const toURL = vi
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockReturnValue('data:image/png;base64,STUBBED');
  return { getCtx, toURL };
}

function lensCaptureFirst(): Uint8ClampedArray {
  expect(captures.length).toBeGreaterThan(0);
  return captures[0];
}

const fieldEqual = (a: Uint8ClampedArray, f: RasterField) =>
  a.length === f.data.length && a.every((v, i) => v === f.data[i]);

function target(): HTMLElement {
  const el = document.createElement('div');
  document.body.append(el);
  return el;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.querySelectorAll('svg.jx-glass-host').forEach((n) => n.remove());
});

// ---------------------------------------------------------------------------
// buildFilter — the 9-primitive chain, kube's verbatim order
// ---------------------------------------------------------------------------
describe('buildFilter · the chain (pure DOM)', () => {
  const fx = liquid();
  const filter = buildFilter(document, 'jx-lg-test', fx, 'data:lens', 'data:spec', 420, 56);

  const kids = () => [...filter.children] as SVGElement[];

  it('the filter carries its id and sRGB interpolation', () => {
    expect(filter.tagName).toBe('filter');
    expect(filter.getAttribute('id')).toBe('jx-lg-test');
    expect(filter.getAttribute('color-interpolation-filters')).toBe('sRGB');
  });

  it('NINE primitives in kube\'s verbatim order', () => {
    expect(kids().map((n) => n.tagName)).toEqual([
      'feGaussianBlur',
      'feImage',
      'feDisplacementMap',
      'feColorMatrix',
      'feImage',
      'feComposite',
      'feComponentTransfer',
      'feBlend',
      'feBlend',
    ]);
  });

  it('frost first: feGaussianBlur(stdDeviation=fx.blur) over SourceGraphic', () => {
    const [g] = kids();
    expect(g.getAttribute('in')).toBe('SourceGraphic');
    expect(g.getAttribute('stdDeviation')).toBe(String(fx.blur));
    expect(g.getAttribute('result')).toBe('blurred_source');
  });

  it('the lens feImage at element size, then displacement off its R/G', () => {
    const [, img, disp] = kids();
    expect(img.getAttribute('href')).toBe('data:lens');
    expect(img.getAttribute('x')).toBe('0');
    expect(img.getAttribute('y')).toBe('0');
    expect(img.getAttribute('width')).toBe('420');
    expect(img.getAttribute('height')).toBe('56');
    expect(img.getAttribute('result')).toBe('displacement_map');
    expect(disp.getAttribute('in')).toBe('blurred_source');
    expect(disp.getAttribute('in2')).toBe('displacement_map');
    expect(disp.getAttribute('xChannelSelector')).toBe('R');
    expect(disp.getAttribute('yChannelSelector')).toBe('G');
    expect(disp.getAttribute('scale')).toBe(String(fx.scale));
    expect(disp.getAttribute('result')).toBe('displaced');
  });

  it('rim saturation, the specular pair, and the two blends wire per §4', () => {
    const [, , , sat, spec, comp, transfer, blend1, blend2] = kids();
    expect(sat.getAttribute('type')).toBe('saturate');
    expect(sat.getAttribute('values')).toBe(String(fx.rimSaturate));
    expect(sat.getAttribute('in')).toBe('displaced');
    expect(spec.getAttribute('href')).toBe('data:spec');
    expect(spec.getAttribute('result')).toBe('specular_layer');
    expect(comp.getAttribute('operator')).toBe('in');
    expect(comp.getAttribute('in')).toBe('displaced_saturated');
    expect(comp.getAttribute('in2')).toBe('specular_layer');
    // feComponentTransfer owns exactly one feFuncA linear with fx.specular slope
    expect(transfer.getAttribute('in')).toBe('specular_layer');
    const func = transfer.children[0] as SVGElement;
    expect(transfer.children.length).toBe(1);
    expect(func.tagName).toBe('feFuncA');
    expect(func.getAttribute('type')).toBe('linear');
    expect(func.getAttribute('slope')).toBe(String(fx.specular));
    expect(blend1.getAttribute('in')).toBe('specular_saturated');
    expect(blend1.getAttribute('in2')).toBe('displaced');
    expect(blend1.getAttribute('mode')).toBe('normal');
    expect(blend1.getAttribute('result')).toBe('withSaturation');
    expect(blend2.getAttribute('in')).toBe('specular_faded');
    expect(blend2.getAttribute('in2')).toBe('withSaturation');
    expect(blend2.getAttribute('mode')).toBe('normal');
    // the final blend has no result alias (the chain's output)
    expect(blend2.hasAttribute('result')).toBe(false);
  });

  it('tuning flows from fx: a retuned effect retunes the chain', () => {
    const tuned = liquid({ blur: 1.5, scale: 99, rimSaturate: 8, specular: 0.6 });
    const f = buildFilter(document, 'jx-lg-tuned', tuned, 'L', 'S', 100, 40);
    const k = [...f.children] as SVGElement[];
    expect(k[0].getAttribute('stdDeviation')).toBe('1.5');
    expect(k[2].getAttribute('scale')).toBe('99');
    expect(k[3].getAttribute('values')).toBe('8');
    expect((k[6].children[0] as SVGElement).getAttribute('slope')).toBe('0.6');
  });
});

// ---------------------------------------------------------------------------
// attachLiquidGlass — the mount (canvas stubbed for the full path)
// ---------------------------------------------------------------------------
describe('attachLiquidGlass · mount', () => {
  beforeEach(() => stubCanvas());

  it('stamps the channel + vars on the element', () => {
    const el = target();
    const rect = mockRect(el);
    attachLiquidGlass(el, liquid({ radius: '3px', saturate: 1.7 }));
    expect(el.getAttribute('data-jx-effect')).toBe('liquid-glass');
    const style = `${el.getAttribute('style') ?? ''};${el.style.cssText}`;
    expect(style).toMatch(/--jx-glass-radius:\s*3px/);
    expect(style).toMatch(/--jx-glass-saturate:\s*1.7/);
    rect.mockRestore();
  });

  it('appends the host svg + the chain to document.body and writes the pointer AFTER the node', () => {
    const el = target();
    mockRect(el);
    attachLiquidGlass(el, liquid());
    const host = document.body.querySelector('svg.jx-glass-host') as SVGSVGElement;
    expect(host).toBeTruthy();
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.style.width).toBe('0px'); // zero-size host, never paints
    const filter = host.querySelector('filter');
    expect(filter).toBeTruthy();
    const id = filter!.getAttribute('id')!;
    // the render law: the pointer targets a node that ALREADY exists —
    // SET-pointer-before-fragment is unrepresentable through the API
    expect(document.getElementById(id)).toBe(filter);
    expect(el.style.getPropertyValue('--jx-glass-filter')).toBe(`url('#${id}')`);
    // the chain inside is the 9-primitive law at element size
    const img = filter!.querySelector('feImage');
    expect(img!.getAttribute('width')).toBe('420');
    expect(img!.getAttribute('height')).toBe('56');
    expect(filter!.children.length).toBe(9);
  });

  it('connects a ResizeObserver to the target (rAF-coalesced rebuilds ride it)', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class SpyRO {
      observe = observe;
      disconnect = disconnect;
      unobserve(): void {}
    }
    const NativeRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = SpyRO as unknown as typeof ResizeObserver;
    window.ResizeObserver = SpyRO as unknown as typeof ResizeObserver;
    try {
      const el = target();
      mockRect(el);
      attachLiquidGlass(el, liquid());
      expect(observe).toHaveBeenCalledWith(el);
    } finally {
      globalThis.ResizeObserver = NativeRO;
      window.ResizeObserver = NativeRO;
    }
  });
});

// ---------------------------------------------------------------------------
// the shape override — measure logic (rect + computed border-radius mocked)
// ---------------------------------------------------------------------------
describe('attachLiquidGlass · the shape override beats border-radius', () => {
  beforeEach(() => stubCanvas());

  /** the captured lens field must be byte-identical to computeLensField
   *  at the expected radius — and DISCRIMINABLE from a neighboring one,
   *  so the equality actually pins the geometry */
  const fieldAt = (radius: number): RasterField =>
    computeLensField({
      width: 420,
      height: 56,
      radius,
      bezel: 22,
      thickness: 30,
      surface: 'convex-squircle',
    });

  const usedRadius = (capture: Uint8ClampedArray, expected: number, neighbor: number) => {
    expect(fieldEqual(capture, fieldAt(expected))).toBe(true);
    expect(fieldEqual(capture, fieldAt(neighbor))).toBe(false);
  };

  it("'capsule' = min(w,h)/2 — beats a border-radius the element also carries", () => {
    const el = target();
    mockRect(el);
    const cs = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ borderTopLeftRadius: '4px' } as CSSStyleDeclaration);
    const fx = liquid.apple({ shape: 'capsule' });
    const handle = attachLiquidGlass(el, fx);
    handle.destroy();
    cs.mockRestore();
    usedRadius(lensCaptureFirst(), 28, 4); // min(420,56)/2, NOT the 4px radius
  });

  it('a number shape = corner radius px (clamped into [0, min/2])', () => {
    const el = target();
    mockRect(el);
    const fx = liquid.apple({ shape: 7 });
    const handle = attachLiquidGlass(el, fx);
    handle.destroy();
    usedRadius(lensCaptureFirst(), 7, 28);
  });

  it('unset shape reads the element\'s computed border-radius', () => {
    const el = target();
    mockRect(el);
    const cs = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ borderTopLeftRadius: '4px' } as CSSStyleDeclaration);
    const handle = attachLiquidGlass(el, liquid());
    handle.destroy();
    cs.mockRestore();
    usedRadius(lensCaptureFirst(), 4, 28);
  });

  it('nothing computable → the full capsule fallback (jsdom computes no radius)', () => {
    const el = target();
    mockRect(el);
    const handle = attachLiquidGlass(el, liquid());
    handle.destroy();
    usedRadius(lensCaptureFirst(), 28, 8);
  });
});

// the shape-override describe reads captures/lensCaptureFirst from the
// module-level stub side channel declared at the top of the file

// ---------------------------------------------------------------------------
// update / destroy lifecycle
// ---------------------------------------------------------------------------
describe('attachLiquidGlass · lifecycle', () => {
  beforeEach(() => stubCanvas());

  it('update(fx) re-stamps the vars and rebuilds the chain with the new tuning', () => {
    const el = target();
    mockRect(el);
    const handle = attachLiquidGlass(el, liquid());
    const before = document.body.querySelector('svg.jx-glass-host filter') as SVGFilterElement;
    expect(before.querySelector('feDisplacementMap')!.getAttribute('scale')).toBe('55');
    handle.update(liquid({ scale: 99, radius: '9px' }));
    const style = `${el.getAttribute('style') ?? ''};${el.style.cssText}`;
    expect(style).toMatch(/--jx-glass-radius:\s*9px/);
    const after = document.body.querySelector('svg.jx-glass-host filter') as SVGFilterElement;
    expect(after.querySelector('feDisplacementMap')!.getAttribute('scale')).toBe('99');
    // still the render law: the pointer tracks a live node
    const id = after.getAttribute('id')!;
    expect(document.getElementById(id)).toBe(after);
    handle.destroy();
  });

  it('destroy removes the host svg, the pointer var, and the RO', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class SpyRO {
      observe = observe;
      disconnect = disconnect;
      unobserve(): void {}
    }
    const NativeRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = SpyRO as unknown as typeof ResizeObserver;
    window.ResizeObserver = SpyRO as unknown as typeof ResizeObserver;
    try {
      const el = target();
      mockRect(el);
      const handle = attachLiquidGlass(el, liquid());
      expect(document.body.querySelector('svg.jx-glass-host')).toBeTruthy();
      expect(el.style.getPropertyValue('--jx-glass-filter')).not.toBe('');
      handle.destroy();
      expect(document.body.querySelector('svg.jx-glass-host')).toBeNull();
      expect(el.style.getPropertyValue('--jx-glass-filter')).toBe('');
      expect(disconnect).toHaveBeenCalled();
    } finally {
      globalThis.ResizeObserver = NativeRO;
      window.ResizeObserver = NativeRO;
    }
  });
});

// ---------------------------------------------------------------------------
// the guards — no canvas (jsdom) and the zero box
// ---------------------------------------------------------------------------
describe('attachLiquidGlass · guards', () => {
  it('NO-CANVAS guard: vars stamped, NO svg, NO pointer, no crash (frost stands)', () => {
    // jsdom's HTMLCanvasElement.getContext('2d') is null by default — do
    // NOT stub it here; the non-zero rect mock is what routes the mount
    // past the zero-box guard into the canvas guard (the design's note:
    // jsdom rects are 0×0, so the zero-box guard fires first otherwise)
    const el = target();
    const rect = mockRect(el);
    expect(() => attachLiquidGlass(el, liquid({ radius: '5px' }))).not.toThrow();
    expect(el.getAttribute('data-jx-effect')).toBe('liquid-glass');
    const style = `${el.getAttribute('style') ?? ''};${el.style.cssText}`;
    expect(style).toMatch(/--jx-glass-radius:\s*5px/);
    expect(document.body.querySelector('svg.jx-glass-host')).toBeNull();
    expect(el.style.getPropertyValue('--jx-glass-filter')).toBe('');
    rect.mockRestore();
  });

  it('ZERO-BOX guard: a 0×0 element (display:none posture) mounts quietly — the RO catches it appearing', () => {
    const el = target(); // jsdom's native 0×0 rect, no mock
    expect(() => attachLiquidGlass(el, liquid())).not.toThrow();
    expect(el.getAttribute('data-jx-effect')).toBe('liquid-glass'); // vars still stamped
    expect(document.body.querySelector('svg.jx-glass-host')).toBeNull();
    expect(el.style.getPropertyValue('--jx-glass-filter')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// the Svelte action wrapper
// ---------------------------------------------------------------------------
describe('liquidGlass · the Svelte action', () => {
  beforeEach(() => stubCanvas());

  it('wraps attachLiquidGlass: same mount behavior, returns the {update, destroy} handle', () => {
    const el = target();
    mockRect(el);
    const handle = liquidGlass(el, liquid());
    expect(typeof handle.update).toBe('function');
    expect(typeof handle.destroy).toBe('function');
    expect(el.getAttribute('data-jx-effect')).toBe('liquid-glass');
    expect(document.body.querySelector('svg.jx-glass-host')).toBeTruthy();
    handle.destroy();
  });
});
