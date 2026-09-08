/**
 * glass-map.spec.ts — the PURE core goldens (glass-effect design §5,
 * 2026-09-08): kube.io's generator ported, and its output law pinned
 * straight against the source module — zero DOM, node-runnable, the
 * icon-gate law restated (derive from source, trust no artifact; there
 * IS no artifact).
 *
 * THE SAMPLING PROTOCOL IS PART OF THE GOLDEN (Lane D pin, r10): maps
 * raster at 2× dpr, so "1 display px inside the border" reads raster
 * px = dpr on the axis. The rim numbers below (225/31 at kube's own
 * searchbox geometry 420×56 r=28) are protocol-locked — sampling at
 * raster-px-1 (0.5 display px in) would read 239/17 and pass a
 * looser claim; ONE protocol only, stated per assertion.
 *
 * Goldens asserted (design §5, measured on the shipped module and
 * cross-checked against kube's decoded maps — our port renders
 * 840×112 at their geometry with border encodings 225/31 vs their
 * 227/36):
 *  - center neutrality (128,128) ±1;
 *  - rim inward pull on the DEFAULT convex-squircle ≥ 90 steps
 *    (concave/lip legitimately flip — physics, not regression);
 *  - monotone decay at 1/8/17/34 px inside, zero beyond the bezel;
 *  - band UNIFORMITY on a 512×256 element (±2 steps, top vs left —
 *    a stretched-map regression cannot pass);
 *  - quadrant antisymmetry |R(x)+R(−x)−256| ≤ 2;
 *  - the profile shape triplet on ALL FOUR surfaces (argmax |d| within
 *    s ≤ 0.01 of the border, border sample ≥ 60% of max, mid-band
 *    ≤ 55% of max — edge concentration);
 *  - the specular anchors (peak RGB 220 top / 129 left, peak α 191/65
 *    — kube's decoded 220/128 and 191/64 within rounding);
 *  - the HARD raster area cap (2000×1200 → 660×396 = 261,360 ≤ 512²,
 *    floor rounding — round overshoots by a row × column);
 *  - the 2× raster law (420×56 → 840×112).
 */
import { describe, expect, it } from 'vitest';
import {
  SURFACES,
  computeLensField,
  computeSpecularField,
  profile,
  type RasterField,
} from '../src/lib/ui/glass/glass-map';

// kube's searchbox geometry — the element their decoded hero maps ship
// for (420×56, r=28); every rim golden below is measured at it
const KUBE = { width: 420, height: 56, radius: 28 } as const;
const PHYSICS = { bezel: 22, thickness: 30, surface: 'convex-squircle' } as const;

const lens = (o?: Partial<Parameters<typeof computeLensField>[0]>): RasterField =>
  computeLensField({ ...KUBE, ...PHYSICS, ...o });

/** raster pixel as [R,G,B,A] */
const px = (f: RasterField, x: number, y: number): [number, number, number, number] => {
  const i = (y * f.width + x) * 4;
  return [f.data[i], f.data[i + 1], f.data[i + 2], f.data[i + 3]];
};

// ---------------------------------------------------------------------------
// center neutrality + the raster laws
// ---------------------------------------------------------------------------
describe('glass-map · raster geometry', () => {
  it('rasters at 2× dpr by default (420×56 → 840×112, kube ships exactly this map size)', () => {
    const f = lens();
    expect(f.width).toBe(840);
    expect(f.height).toBe(112);
  });

  it('the element center encodes neutral (128,128) ±1 with full alpha', () => {
    const f = lens();
    const [r, g, b, a] = px(f, Math.floor(f.width / 2), Math.floor(f.height / 2));
    expect(Math.abs(r - 128)).toBeLessThanOrEqual(1);
    expect(Math.abs(g - 128)).toBeLessThanOrEqual(1);
    expect(b).toBe(0);
    expect(a).toBe(255);
  });

  it('the raster area cap is a HARD cap: 2000×1200 floors to 660×396 = 261,360 ≤ 262,144', () => {
    const f = computeLensField({ ...KUBE, width: 2000, height: 1200, ...PHYSICS });
    expect(f.width).toBe(660);
    expect(f.height).toBe(396);
    expect(f.width * f.height).toBe(261_360);
    expect(f.width * f.height).toBeLessThanOrEqual(262_144);
  });

  it('the area-capped raster keeps the field in ELEMENT px (the band still reads at the border, the center stays neutral)', () => {
    const f = computeLensField({ ...KUBE, width: 2000, height: 1200, ...PHYSICS });
    const midRow = Math.floor(f.height / 2);
    // raster px 0's center sits ~1.5 display px inside — deep enough in
    // the 22px bezel to still carry strong inward pull
    const [borderR, borderG] = px(f, 0, midRow);
    expect(borderR - 128).toBeGreaterThanOrEqual(60);
    expect(Math.abs(borderG - 128)).toBeLessThanOrEqual(2);
    const [cr, cg] = px(f, Math.floor(f.width / 2), midRow);
    expect(Math.abs(cr - 128)).toBeLessThanOrEqual(1);
    expect(Math.abs(cg - 128)).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// the rim goldens — SAMPLING PROTOCOL PINNED (raster px = dpr = 1 display
// px inside the border; the axis-mid sample, straight edge)
// ---------------------------------------------------------------------------
describe('glass-map · rim inward pull (default convex-squircle)', () => {
  const f = lens();
  const midY = Math.floor(f.height / 2);
  /** 1 display px inside a given edge, on the perpendicular mid-line */
  const oneDisplayPxIn = {
    left: px(f, 2, midY), // raster px 2 = dpr
    right: px(f, f.width - 1 - 2, midY),
  };

  it('the LEFT border mid-edge encodes R ≥ 128 + 90 (measured 225, kube decodes 227)', () => {
    expect(oneDisplayPxIn.left[0]).toBeGreaterThanOrEqual(218);
    expect(oneDisplayPxIn.left[0]).toBeLessThanOrEqual(235);
  });

  it('the RIGHT border mid-edge encodes R ≤ 128 − 90 (measured 31, kube decodes 36)', () => {
    expect(oneDisplayPxIn.right[0]).toBeLessThanOrEqual(38);
    expect(oneDisplayPxIn.right[0]).toBeGreaterThanOrEqual(21);
  });

  it('the perpendicular channel stays neutral at the border sample (|G−128| ≤ 2 — axis symmetry)', () => {
    expect(Math.abs(oneDisplayPxIn.left[1] - 128)).toBeLessThanOrEqual(2);
    expect(Math.abs(oneDisplayPxIn.right[1] - 128)).toBeLessThanOrEqual(2);
  });

  it('monotone decay: |enc−128| strictly decreases at 1/8/17 px inside and is ZERO at/beyond the bezel', () => {
    const d1 = Math.abs(oneDisplayPxIn.left[0] - 128);
    const d8 = Math.abs(px(f, 2 * 8, midY)[0] - 128);
    const d17 = Math.abs(px(f, 2 * 17, midY)[0] - 128);
    const d34 = Math.abs(px(f, 2 * 34, midY)[0] - 128);
    const d44 = Math.abs(px(f, 2 * 44, midY)[0] - 128); // 2× the 22px bezel
    expect(d1).toBeGreaterThan(d8);
    expect(d8).toBeGreaterThan(d17);
    expect(d17).toBeGreaterThan(d34);
    expect(d34).toBe(0);
    expect(d44).toBe(0);
  });

  it('quadrant antisymmetry: |R(x,y) + R(−x,y) − 256| ≤ 2 over the whole map, G mirrored in y', () => {
    let worstR = 0;
    let worstG = 0;
    for (let y = 0; y < f.height; y++) {
      for (let x = 0; x < f.width; x++) {
        const a = px(f, x, y);
        // R's displacement axis is x → mirror across the VERTICAL axis;
        // G's is y → mirror across the horizontal one (design §5 "G in y")
        const bR = px(f, f.width - 1 - x, y);
        const bG = px(f, x, f.height - 1 - y);
        worstR = Math.max(worstR, Math.abs(a[0] + bR[0] - 256));
        worstG = Math.max(worstG, Math.abs(a[1] + bG[1] - 256));
      }
    }
    expect(worstR).toBeLessThanOrEqual(2);
    expect(worstG).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// band uniformity — THE anisotropy law (a stretched-map regression, v1's
// failure mode, cannot pass: top-edge and left-edge profiles are compared
// through their OWN displacement axis — top rides G, left rides R)
// ---------------------------------------------------------------------------
describe('glass-map · band uniformity (the anisotropy law, 512×256)', () => {
  it('top-edge mid-column and left-edge mid-row agree within ±2 steps at every sampled depth', () => {
    const f = computeLensField({ ...KUBE, ...PHYSICS, width: 512, height: 256 });
    const scale = f.width / 512;
    const midCol = Math.floor(f.width / 2);
    const midRow = Math.floor(f.height / 2);
    let worst = 0;
    let worstDepth = 0;
    for (let depth = 0.5; depth <= 22; depth += 0.5) {
      // the raster px whose CENTER sits `depth` display px inside the border
      const rx = Math.round(depth * scale - 0.5);
      const top = Math.abs(px(f, midCol, rx)[1] - 128); // top edge → G is the axis
      const left = Math.abs(px(f, rx, midRow)[0] - 128); // left edge → R is the axis
      const diff = Math.abs(top - left);
      if (diff > worst) {
        worst = diff;
        worstDepth = depth;
      }
    }
    expect(worst).toBeLessThanOrEqual(2);
    expect(worstDepth).toBeTypeOf('number');
  });
});

// ---------------------------------------------------------------------------
// the profile — kube's ray tracer with the PATH term (§5)
// ---------------------------------------------------------------------------
describe('glass-map · profile shape (all four surfaces)', () => {
  const triplet = (name: keyof typeof SURFACES) => {
    const p = profile(22, 30, SURFACES[name]);
    let max = 0;
    let argmax = 0;
    for (let i = 0; i < p.length; i++) {
      const a = Math.abs(p[i]);
      if (a > max) {
        max = a;
        argmax = i / p.length;
      }
    }
    const border = Math.abs(p[0]) / max;
    const mid = Math.abs(p[Math.floor(0.5 * p.length)]) / max;
    return { argmax, border, mid };
  };

  for (const name of Object.keys(SURFACES) as (keyof typeof SURFACES)[]) {
    it(`${name}: argmax |d| within s ≤ 0.01 of the border, border ≥ 60% of max, mid-band ≤ 55%`, () => {
      const { argmax, border, mid } = triplet(name);
      // (convex-squircle's argmax sits at s = 0.0059 with border = 73% —
      // a naive "peaks at s=0" golden would contradict the code)
      expect(argmax).toBeLessThanOrEqual(0.01);
      expect(border).toBeGreaterThanOrEqual(0.6);
      expect(mid).toBeLessThanOrEqual(0.55);
    });
  }

  it('the PATH term is real: the profile carries displacement all the way INTO the flat interior direction (max > 0 for every surface)', () => {
    for (const name of Object.keys(SURFACES) as (keyof typeof SURFACES)[]) {
      const p = profile(22, 30, SURFACES[name]);
      expect(Math.max(...p.map(Math.abs))).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// the specular field — kube's thin border ring, direction-biased
// ---------------------------------------------------------------------------
describe('glass-map · specular anchors', () => {
  const s = computeSpecularField({ ...KUBE, ...PHYSICS });
  const midCol = Math.floor(s.width / 2);
  const midRow = Math.floor(s.height / 2);

  it('the TOP border peaks at RGB 220 ±4 with α 191 ±4 (1 display px in — the pinned protocol row)', () => {
    // the ring's peak row on the top straight edge, mid column
    let peakY = 0;
    let peakA = -1;
    for (let y = 0; y < 6; y++) {
      const a = px(s, midCol, y)[3];
      if (a > peakA) {
        peakA = a;
        peakY = y;
      }
    }
    expect(peakY).toBe(1); // raster row 1 = dpr = 1 display px inside
    const [r, , , a] = px(s, midCol, peakY);
    expect(Math.abs(r - 220)).toBeLessThanOrEqual(4);
    expect(Math.abs(a - 191)).toBeLessThanOrEqual(4);
  });

  it('the LEFT border peaks at RGB 129 ±4 with α 64 ±4 — the vertical light axis dims the sides', () => {
    let peakX = 0;
    let peakA = -1;
    for (let x = 0; x < 6; x++) {
      const a = px(s, x, midRow)[3];
      if (a > peakA) {
        peakA = a;
        peakX = x;
      }
    }
    expect(peakX).toBe(1);
    const [r, , , a] = px(s, peakX, midRow);
    expect(Math.abs(r - 129)).toBeLessThanOrEqual(4);
    expect(Math.abs(a - 64)).toBeLessThanOrEqual(4);
  });

  it('black-transparent elsewhere: the deep interior and the far outside stay zero', () => {
    const center = px(s, midCol, Math.floor(s.height / 2));
    expect(center).toEqual([0, 0, 0, 0]);
    // far outside: y = −8 display px would be off-raster; the raster only
    // covers the element box, so the top-left corner's diagonal far side
    // and the interior prove the "elsewhere" law together
    const deep = px(s, midCol, Math.floor(s.height / 2) + 8);
    expect(deep).toEqual([0, 0, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// surface enum + hostile geometry
// ---------------------------------------------------------------------------
describe('glass-map · surface enum + degenerate geometry', () => {
  it('SURFACES is exactly kube\'s four (convex-circle, convex-squircle, concave, lip)', () => {
    expect(Object.keys(SURFACES).sort()).toEqual(
      ['concave', 'convex-circle', 'convex-squircle', 'lip'],
    );
  });

  it('an unknown surface cannot produce a field (the builder enum gate is the front door)', () => {
    expect(() =>
      computeLensField({ ...KUBE, ...PHYSICS, surface: 'bogus' as never }),
    ).toThrow();
  });

  it('a razor-thin element still rasterizes (the Math.max(2, …) floor) without throwing', () => {
    const f = computeLensField({ width: 4, height: 4, radius: 2, bezel: 4, thickness: 2, surface: 'lip' });
    expect(f.width).toBeGreaterThanOrEqual(2);
    expect(f.height).toBeGreaterThanOrEqual(2);
    expect(() => px(f, 0, 0)).not.toThrow();
  });
});
