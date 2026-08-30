/**
 * Chart family glyph-math suite (test/chart-math.spec.ts, OpenSpec
 * 2026-08-30-add-chart-family task 4.1).
 *
 * The math is imported straight from the registry source (same-source
 * law) — pure functions, no DOM. Every frozen degenerate semantic the
 * spec delta names (empty, all-negative, constant, NaN/non-finite,
 * zero-total) is pinned here: same input, same output, every time.
 */
import { describe, expect, it } from 'vitest';

import {
  BAR_RAMP,
  BLOCK,
  BLOCK_RAMP,
  BRAILLE_BASE,
  CHART_PALETTE_SIZE,
  DONUT_NEUTRALS,
  barRun,
  brailleCell,
  donutColor,
  donutGeometry,
  linePoints,
  markerPoints,
  normalize,
  rampIndex,
  seriesBounds,
  seriesRows,
  sparkBlocks,
  sparkBraille,
} from '../../../registry/files/ui/chart/chart.svelte';

describe('seriesBounds — finite bounds only', () => {
  it('computes min/max over the finite points', () => {
    expect(seriesBounds([3, 5, 2, 8, 7])).toEqual({ min: 2, max: 8 });
  });

  it('non-finite points never perturb the bounds', () => {
    expect(seriesBounds([NaN, 5, Infinity])).toEqual({ min: 5, max: 5 });
  });

  it('empty and all-non-finite series are null (the empty guard)', () => {
    expect(seriesBounds([])).toBeNull();
    expect(seriesBounds([NaN, -Infinity, Infinity])).toBeNull();
  });
});

describe('normalize + rampIndex — value → ramp mapping', () => {
  it('maps the finite bounds to 0 and 1', () => {
    expect(normalize(2, 2, 8)).toBe(0);
    expect(normalize(8, 2, 8)).toBe(1);
  });

  it('clamps out-of-range values', () => {
    expect(normalize(0, 2, 8)).toBe(0);
    expect(normalize(100, 2, 8)).toBe(1);
  });

  it('constant series map to the honest midline (no invented range)', () => {
    expect(normalize(4, 4, 4)).toBe(0.5);
    // 8 levels: round(0.5*7)=4 → ▅ (the midline glyph)
    expect(rampIndex(4, 4, 4, 8)).toBe(4);
    expect(BLOCK_RAMP[rampIndex(4, 4, 4, 8)]).toBe('▅');
  });

  it('non-finite values clamp to the floor level (frozen)', () => {
    expect(normalize(NaN, 0, 10)).toBe(0);
    expect(rampIndex(NaN, 0, 10, 8)).toBe(0);
  });

  it('the full block ramp is the eighth-block ladder', () => {
    expect([...BLOCK_RAMP]).toEqual(['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']);
    expect([...BAR_RAMP]).toEqual(['▏', '▎', '▍', '▌', '▋', '▊', '▉', BLOCK]);
  });
});

describe('sparkBlocks — block-mode sparkline', () => {
  it('is proportional to the data between the honest min/max extremes', () => {
    // min→▁ max→█; 3/6→▂ 5/6→▅ 7/6→▇ (round-half-up on the 8-level ramp)
    expect(sparkBlocks([3, 5, 2, 8, 7])).toBe('▂▅▁█▇');
    expect(sparkBlocks([0, 10])).toBe('▁█');
  });

  it('a constant series renders the midline glyph everywhere', () => {
    expect(sparkBlocks([4, 4, 4])).toBe('▅▅▅');
  });

  it('non-finite points keep their x position as blank cells', () => {
    expect(sparkBlocks([NaN, 5])).toBe(' ▅');
    expect(sparkBlocks([NaN, 5]).length).toBe(2);
  });

  it('empty and all-non-finite data render the empty run', () => {
    expect(sparkBlocks([])).toBe('');
    expect(sparkBlocks([NaN, NaN])).toBe('');
  });
});

describe('braille packing — two points per cell', () => {
  it('packs levels into the 2×4 dot matrix with exact code points', () => {
    expect(brailleCell(0, null)).toBe(String.fromCharCode(BRAILLE_BASE + 0x01));
    expect(brailleCell(null, 3)).toBe(String.fromCharCode(BRAILLE_BASE + 0x80));
    expect(brailleCell(1, 1)).toBe(String.fromCharCode(BRAILLE_BASE + 0x02 + 0x20));
    expect(brailleCell(null, null)).toBe(String.fromCharCode(BRAILLE_BASE));
  });

  it('maps min→bottom dot, max→top dot', () => {
    // level = 3 - ramp: min (level 3) → 0x08, max (level 0) → 0x10
    expect(sparkBraille([0, 10])).toBe(String.fromCharCode(BRAILLE_BASE + 0x08 + 0x10));
  });

  it('a constant series packs the level-1 dot pair (frozen midline)', () => {
    expect(sparkBraille([5])).toBe(String.fromCharCode(BRAILLE_BASE + 0x02));
    expect(sparkBraille([5, 5, 5])).toBe(
      String.fromCharCode(BRAILLE_BASE + 0x02 + 0x20).repeat(1) +
        String.fromCharCode(BRAILLE_BASE + 0x02),
    );
  });

  it('the trailing odd point rides the left column in reading order', () => {
    // [0, 10, 5]: bounds 0..10, third point constant-mid → left-only cell
    const s = sparkBraille([0, 10, 5]);
    expect(s.length).toBe(2);
    expect(s.charCodeAt(1) & 0x02).toBe(0x02); // left column level-1 dot
    expect(s.charCodeAt(1) & 0xf0).toBe(0); // right column dotless
  });

  it('non-finite points contribute no dots', () => {
    expect(sparkBraille([NaN, 5])).toBe(String.fromCharCode(BRAILLE_BASE + 0x20));
  });

  it('cell count is ceil(n/2); empty data is the empty string', () => {
    expect(sparkBraille([1, 2, 3, 4, 5, 6, 7]).length).toBe(4);
    expect(sparkBraille([])).toBe('');
    expect(sparkBraille([Infinity, NaN])).toBe('');
  });
});

describe('barRun — horizontal block fill', () => {
  it('the max value fills the whole cell budget', () => {
    expect(barRun(10, 10, 20)).toBe(BLOCK.repeat(20));
  });

  it('integral proportions are full blocks only', () => {
    expect(barRun(5, 10, 10)).toBe(BLOCK.repeat(5));
    expect(barRun(0, 0, 0)).toBe('');
  });

  it('a fractional tail renders the proportional left-eighth partial', () => {
    expect(barRun(5.5, 10, 10)).toBe(`${BLOCK.repeat(5)}▌`); // half cell
    expect(barRun(5.25, 10, 10)).toBe(`${BLOCK.repeat(5)}▎`); // quarter cell
  });

  it('the run never exceeds the cell budget', () => {
    expect(barRun(100, 10, 5)).toBe(BLOCK.repeat(5));
    for (let v = 0; v <= 30; v += 0.7) {
      expect(barRun(v, 10, 8).length).toBeLessThanOrEqual(8);
    }
  });

  it('zero / negative / NaN values and non-positive scales are empty runs', () => {
    expect(barRun(0, 10, 5)).toBe('');
    expect(barRun(-3, 10, 5)).toBe('');
    expect(barRun(NaN, 10, 5)).toBe('');
    expect(barRun(5, 0, 5)).toBe('');
    expect(barRun(5, -10, 5)).toBe('');
    expect(barRun(5, NaN, 5)).toBe('');
    expect(barRun(5, 10, 0)).toBe('');
  });

  it('an all-negative series has no positive extent — every run empty', () => {
    const max = seriesBounds([-3, -8, -1])!.max;
    expect(max).toBe(-1);
    expect(barRun(-3, max, 10)).toBe('');
    expect(barRun(-8, max, 10)).toBe('');
  });
});

describe('linePoints + markerPoints — the polyline geometry', () => {
  it('maps min→the band floor and max→the band ceiling, x honest', () => {
    expect(linePoints([0, 10], 100, 40, 1)).toBe('0,39 100,1');
  });

  it('non-finite points are skipped, never shifted', () => {
    expect(linePoints([0, NaN, 10], 100, 40, 1)).toBe('0,39 100,1');
  });

  it('a constant series is the horizontal midline', () => {
    expect(linePoints([4, 4], 100, 40, 1)).toBe('0,20 100,20');
  });

  it('a single point centers (i/(n-1) is undefined)', () => {
    expect(linePoints([5], 100, 40, 1)).toBe('50,20');
  });

  it('empty and all-non-finite data render no path', () => {
    expect(linePoints([], 100, 40, 1)).toBe('');
    expect(linePoints([NaN, Infinity], 100, 40, 1)).toBe('');
  });

  it('markerPoints doubles every point (the round-cap dot trick)', () => {
    expect(markerPoints('0,39 100,1')).toBe('0,39 0,39 100,1 100,1');
    expect(markerPoints('')).toBe('');
  });
});

describe('donutGeometry — dasharray segment math', () => {
  const R = (96 - 12) / 2;
  const C = 2 * Math.PI * R;

  it('the segment dash lengths sum to the circumference exactly', () => {
    const g = donutGeometry([1, 1, 1], 96, 12)!;
    expect(g.circumference).toBeCloseTo(C, 9);
    // dashes serialize at 0.001px (visually exact); the ring closes
    // to the serialized precision (≤ 0.001px of drift per segment)
    const sum = g.segments.reduce((a, s) => a + Number(s.dash.split(' ')[0]), 0);
    expect(Math.abs(sum - C)).toBeLessThan(0.001 * g.segments.length);
  });

  it('every dash declares the circumference as its gap; offsets accumulate the SERIALIZED lengths', () => {
    const g = donutGeometry([4, 3, 2, 1], 96, 12)!;
    let acc = 0;
    for (const s of g.segments) {
      expect(Number(s.dash.split(' ')[1])).toBeCloseTo(C, 3);
      expect(s.offset).toBe(-acc); // exact — the rendered ring tiles exactly
      acc += Number(s.dash.split(' ')[0]);
    }
  });

  it('shares sum to 1', () => {
    const g = donutGeometry([2, 5, 1, 0.5], 96, 12)!;
    expect(g.segments.reduce((a, s) => a + s.share, 0)).toBeCloseTo(1, 9);
  });

  it('negative / zero / non-finite values are 0-share segments (never invented)', () => {
    const g = donutGeometry([4, 0, -2, NaN, 4], 96, 12)!;
    expect(g.segments.map((s) => s.value)).toEqual([4, 0, 0, 0, 4]);
    expect(g.segments[1].share).toBe(0);
    expect(g.segments[1].dash.startsWith('0.000 ')).toBe(true);
    // and the survivors still close the ring at serialized precision
    const sum = g.segments.reduce((a, s) => a + Number(s.dash.split(' ')[0]), 0);
    expect(Math.abs(sum - C)).toBeLessThan(0.001 * g.segments.length);
  });

  it('a zero total is null — the bare-track state (frozen)', () => {
    expect(donutGeometry([], 96, 12)).toBeNull();
    expect(donutGeometry([0, 0], 96, 12)).toBeNull();
    expect(donutGeometry([-1, -2], 96, 12)).toBeNull();
    expect(donutGeometry([NaN, Infinity, -Infinity], 96, 12)).toBeNull();
  });

  it('the radius derives from size and thickness', () => {
    expect(donutGeometry([1], 96, 12)!.radius).toBe(R);
    expect(donutGeometry([1], 100, 20)!.radius).toBe(40);
  });
});

describe('donutColor — the palette ramp', () => {
  it('rides the theme semantic palette first, then the neutral ladder', () => {
    expect(CHART_PALETTE_SIZE).toBe(5);
    for (let i = 0; i < 5; i++) expect(donutColor(i)).toBe(`var(--chart-${i + 1})`);
    expect(donutColor(5)).toBe(DONUT_NEUTRALS[0]);
    expect(donutColor(6)).toBe(DONUT_NEUTRALS[1]);
    expect(donutColor(5 + DONUT_NEUTRALS.length)).toBe(DONUT_NEUTRALS[0]); // cycles
  });

  it('degenerate indexes freeze to the first palette slot', () => {
    expect(donutColor(-1)).toBe('var(--chart-1)');
    expect(donutColor(1.5)).toBe('var(--chart-1)');
  });

  it('the neutral ladder is brand-hue-derived oklch (tokens, no hex)', () => {
    for (const c of DONUT_NEUTRALS) {
      expect(c).toContain('var(--brand-hue)');
      expect(c).toMatch(/^oklch\(/);
    }
  });
});

describe('seriesRows — the table fallback mirror', () => {
  it('mirrors the series with null for non-finite points', () => {
    expect(seriesRows([1, NaN])).toEqual([
      { index: 0, value: 1 },
      { index: 1, value: null },
    ]);
    expect(seriesRows([])).toEqual([]);
  });
});
