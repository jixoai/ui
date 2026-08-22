/**
 * Scene JSON → SVG renderer (scripts/blueprints/render.mjs).
 *
 * The second half of the blueprint pipeline: takes the geometry+style
 * JSON the in-page serializer produced and paints it through
 * vercel/satori. satori is a flexbox-only renderer — it could never
 * re-layout this design system's grids/subgrids/anchor positioning —
 * so every primitive is emitted ABSOLUTELY POSITIONED at its
 * browser-measured rect. satori's job is the vector paint.
 *
 * satori 0.33 converts text runs to glyph PATHS (harfbuzz), so the
 * output is fully self-contained — no font embedding, identical
 * rendering inside an isolated <img>.
 *
 * The blueprint look (user spec): every color is DESATURATED to its
 * sRGB luma — the overview preview must read as a gray drafting
 * blueprint, never compete with the real component pages.
 *
 * Incremental-cache note: bump CONVERTER_VERSION whenever this file's
 * OUTPUT semantics change — the cache key hashes it.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
void here;

export const CONVERTER_VERSION = 'bp-v1';

// ---- fonts: static latin subsets of the site faces (woff — satori's
// opentype parser reads woff, not woff2) ----
const FONT_SPECS = [
  { pkg: '@fontsource/jetbrains-mono', stem: 'jetbrains-mono-latin', family: 'JetBrains Mono', weight: 400 },
  { pkg: '@fontsource/jetbrains-mono', stem: 'jetbrains-mono-latin', family: 'JetBrains Mono', weight: 500 },
  { pkg: '@fontsource/jetbrains-mono', stem: 'jetbrains-mono-latin', family: 'JetBrains Mono', weight: 600 },
  { pkg: '@fontsource/jetbrains-mono', stem: 'jetbrains-mono-latin', family: 'JetBrains Mono', weight: 700 },
  { pkg: '@fontsource/share-tech-mono', stem: 'share-tech-mono-latin', family: 'Share Tech Mono', weight: 400 },
];

const FAMILY = { m: 'JetBrains Mono', n: 'Share Tech Mono' };
const WEIGHTS = { m: [400, 500, 600, 700], n: [400] };

const satoriFonts = FONT_SPECS.map(({ pkg, stem, family, weight }) => ({
  name: family,
  data: readFileSync(require.resolve(path.join(pkg, 'files', `${stem}-${weight}-normal.woff`))),
  weight,
  style: 'normal',
}));

// fingerprint covers EVERYTHING that changes rendered output while the
// serialized scene JSON may stay identical: converter semantics, the
// satori implementation itself, and the measuring fonts (Codex r2 —
// Hash.update takes ONE data arg; spreading the font buffers silently
// hashed only the first font)
const fingerprint = createHash('sha256').update(CONVERTER_VERSION);
fingerprint.update(readFileSync(require.resolve('satori')));
for (const font of satoriFonts) fingerprint.update(font.data);
export const CONVERTER_FINGERPRINT = fingerprint.digest('hex');

// ---- grayscale: rgba(r,g,b,a) -> rgba(l,l,l,a) ----
const LUMA = [0.2126, 0.7152, 0.0722];
function gray(colorStr) {
  if (!colorStr) return undefined;
  const m = colorStr.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return undefined;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  const a = m[4] === undefined ? 1 : +m[4];
  if (a === 0) return undefined;
  const l = Math.round(r * LUMA[0] + g * LUMA[1] + b * LUMA[2]);
  return `rgba(${l},${l},${l},${a})`;
}

// computed box-shadow string -> satori shorthand (first shadow only)
function shadow(cs) {
  const m =
    cs && cs.match(/(rgba?\([^)]+\)|color\(srgb[^)]+\))\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/);
  if (!m) return undefined;
  const c = gray(m[1]);
  if (!c) return undefined;
  return `${m[2]}px ${m[3]}px ${m[4]}px ${m[5]}px ${c}`;
}

// satori's yoga layout wants NUMBERS for geometry (string px values
// silently collapse the node) — colors/radii/shadows stay strings
const px = (n) => n;

// satori's css parsers choke on undefined style VALUES (silently
// emitting an empty svg) — never set a key whose value is undefined
function compact(style) {
  const out = {};
  for (const [k, v] of Object.entries(style)) if (v !== undefined) out[k] = v;
  return out;
}
const quantizeWeight = (w8, fam) => {
  const list = WEIGHTS[fam];
  const n = Math.round(parseFloat(w8) || 400);
  return list.reduce((best, cur) => (Math.abs(cur - n) < Math.abs(best - n) ? cur : best), list[0]);
};

function nodeToSatori(node) {
  const opacity = node.op === undefined || node.op === 1 ? undefined : node.op;
  if (node.k === 'box') {
    const bg = gray(node.bg);
    const radius =
      node.r && node.r.some((v) => v > 0)
        ? node.r[0] >= 9999 ? '50%' : `${node.r[0]}px ${node.r[1]}px ${node.r[2]}px ${node.r[3]}px`
        : undefined;
    const children = [];
    if (bg || shadow(node.sh)) {
      children.push({
        type: 'div',
        props: {
          style: compact({
            position: 'absolute',
            left: 0, top: 0, width: node.w, height: node.h,
            backgroundColor: bg,
            borderRadius: radius,
            boxShadow: shadow(node.sh),
          }),
        },
      });
    }
    // per-side borders paint as edge rects (the radius-0 design law
    // makes this exact; rounded borders are not part of the language)
    const [bt, br, bb, bl] = node.bw || [0, 0, 0, 0];
    const edge = (x, y, w, h, c) =>
      c && {
        type: 'div',
        props: {
          style: compact({ position: 'absolute', left: px(x), top: px(y), width: px(w), height: px(h), backgroundColor: c }),
        },
      };
    const edges = [
      edge(0, 0, node.w, bt, gray(node.bc?.[0])),
      edge(node.w - br, 0, br, node.h, gray(node.bc?.[1])),
      edge(0, node.h - bb, node.w, bb, gray(node.bc?.[2])),
      edge(0, 0, bl, node.h, gray(node.bc?.[3])),
    ].filter(Boolean);
    if (!children.length && !edges.length) return null;
    return {
      type: 'div',
      props: {
        style: compact({ position: 'absolute', display: 'flex', left: px(node.x), top: px(node.y), width: px(node.w), height: px(node.h), opacity }),
        children: [...children, ...edges],
      },
    };
  }
  if (node.k === 'txt') {
    return {
      type: 'div',
      props: {
        style: compact({
          position: 'absolute',
          left: px(node.x), top: px(node.y), width: px(node.w), height: px(node.h),
          opacity,
          color: gray(node.c),
          fontFamily: FAMILY[node.f],
          fontSize: px(node.s),
          fontWeight: quantizeWeight(node.w8, node.f),
          whiteSpace: 'pre',
          // string px REQUIRED: satori reads NUMERIC lineHeight/
          // letterSpacing as CSS unitless multipliers (13 ⇒ 13× the
          // font size), hurling glyphs off-canvas
          lineHeight: `${node.h}px`,
          letterSpacing: node.sp ? `${node.sp}px` : undefined,
        }),
        children: node.t,
      },
    };
  }
  if (node.k === 'img') {
    return {
      type: 'img',
      props: {
        src: node.src,
        style: compact({
          position: 'absolute',
          left: px(node.x), top: px(node.y), width: px(node.w), height: px(node.h),
          opacity,
          borderRadius: node.r && node.r[0] >= 9999 ? '50%' : undefined,
        }),
      },
    };
  }
  return null;
}

/** @param {{name:string,w:number,h:number,bg:string,nodes:any[]}} scene */
export async function renderScene(scene) {
  const children = scene.nodes.map(nodeToSatori).filter(Boolean);
  return satori(
    {
      type: 'div',
      props: {
        style: {
          position: 'relative',
          width: scene.w,
          height: scene.h,
          display: 'flex',
          backgroundColor: gray(scene.bg) ?? 'rgba(255,255,255,1)',
        },
        children,
      },
    },
    {
      width: scene.w,
      height: scene.h,
      fonts: satoriFonts,
    },
  );
}
