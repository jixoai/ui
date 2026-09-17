/**
 * @jixoai/ui-design (studio) — presence-visuals: the pure math behind
 * the multiplayer visual layer (Owner's presence-visuals rulings,
 * 2026-09-17).
 *
 * Two laws live here:
 *   1. the INDICATOR PRIMARY LAW — a player's colorHue (HSL degrees,
 *      (73·n)%360) drives the page's jixoai-ui primary by rewriting
 *      `--brand-hue` (an OKLCH hue, jixoai.css L48) — the hue systems
 *      differ, so hslHueToOklchHue() walks hsl→sRGB→linear→oklab→hue.
 *   2. the RIBBON LAW — a row highlighted by N players becomes a
 *      rainbow ribbon: one player is the plain single color (today's
 *      look, unchanged); N players split the border evenly, in the
 *      LOCAL order (self first), via the Owner's border-image
 *      VERTICAL gradient syntax (`… 0 0 0 1 / 0 0 0 2px`, P5/P6).
 *
 * Framework-agnostic pure functions — node-testable, no DOM.
 * Original need: presence-visuals task group 1 (2026-09-17).
 */

/* ── law 1: HSL hue → OKLCH hue ──────────────────────────────────────── */

/** hsl(h, 100%, 50%) → sRGB (the maximal-chroma sweep at mid lightness) */
function hslToSrgb(hue: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 60;
  // the six-segment wheel: red→yellow→green→cyan→blue→magenta→red
  const sector = Math.floor(h);
  const f = h - sector;
  switch (sector) {
    case 0: return [1, f, 0];
    case 1: return [1 - f, 1, 0];
    case 2: return [0, 1, f];
    case 3: return [0, 1 - f, 1];
    case 4: return [f, 0, 1];
    default: return [1, 0, 1 - f];
  }
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** sRGB → oklab hue in degrees [0, 360) — Björn Ottosson's matrices */
export function hslHueToOklchHue(hslHue: number): number {
  const [r0, g0, b0] = hslToSrgb(hslHue);
  const r = linearize(r0);
  const g = linearize(g0);
  const b = linearize(b0);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const deg = (Math.atan2(bb, a) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** the player-hue expression the chrome family uses (chips/cursors) */
export function playerHueCss(hue: number): string {
  return `hsl(${hue}, 85%, 45%)`;
}

/** apply a player's hue to a document root's --brand-hue (the jixoai-ui
 *  primary re-paints the whole surface — indicators included) */
export function applyBrandHue(document: Document, hslHue: number): void {
  document.documentElement.style.setProperty('--brand-hue', String(hslHueToOklchHue(hslHue)));
}

/* ── law 2: the multiplayer ribbon (the Owner syntax, P5/P6) ──────────── */

export type RibbonStyle =
  | { readonly single: true; readonly style: string }
  | { readonly single: false; readonly style: string; readonly image: string };

/**
 * The border-inline-start highlight for a row that N players attend —
 * the Owner's border-image syntax verbatim (presence-liveness P5/P6,
 * 2026-09-18: no horizontal rainbow):
 *
 *   single: border-inline-start: 2px solid <color>;
 *           border-image: none;
 *   multi:  border-inline-start: 2px solid <any>; (placeholder only)
 *           border-image: linear-gradient(to bottom, …) 0 0 0 1 / 0 0 0 2px;
 *
 * Order is the CALLER's local view (self first, then the joining
 * ordinal). One player keeps today's plain single-color look; N
 * players split the border VERTICALLY into N equal hard-stop segments
 * (segment i spans [i/N, (i+1)/N] — `red 0 33.33%, green 33.33%
 * 66.66%, …`). `style` is the COMPLETE inline style for the carrying
 * row; `image` (multi only) exposes the gradient for assertions.
 * Browsers normalize the shorthand into the computed components
 * border-image-slice '0 0 0 1' / border-image-width '0 0 0 2px'.
 */
export function ribbonOf(hues: readonly number[]): RibbonStyle | null {
  if (hues.length === 0) return null;
  if (hues.length === 1) {
    return {
      single: true,
      style: `border-inline-start: 2px solid ${playerHueCss(hues[0])}; border-image: none;`,
    };
  }
  const stops: string[] = [];
  const step = 100 / hues.length;
  hues.forEach((hue, index) => {
    const from = index === 0 ? '0' : `${(index * step).toFixed(4)}%`;
    const to = `${((index + 1) * step).toFixed(4)}%`;
    stops.push(`${playerHueCss(hue)} ${from} ${to}`);
  });
  const image = `linear-gradient(to bottom, ${stops.join(', ')})`;
  return {
    single: false,
    style: `border-inline-start: 2px solid transparent; border-image: ${image} 0 0 0 1 / 0 0 0 2px;`,
    image,
  };
}
