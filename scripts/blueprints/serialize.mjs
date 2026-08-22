/**
 * In-page blueprint serializer (scripts/blueprints/serialize.mjs).
 *
 * Runs INSIDE the headless browser via page.evaluate() (the function
 * source is shipped to the page — it must stay fully self-contained).
 *
 * What it does: for one [data-blueprint] stage, walk the REAL rendered
 * DOM and emit a flat, paint-ordered list of visual primitives —
 * boxes (background/border/shadow/radius), text lines (measured with
 * the Range API, so wrapping and alignment come from the real layout
 * engine), and rasterized replaced content (<img>, inline <svg>,
 * canvas). satori (a flexbox-only renderer) could never re-layout this
 * design system's grids/anchors/subgrids — so we don't ask it to: the
 * geometry comes from the browser, satori only VECTOR-PAINTS it.
 *
 * Determinism contract (the incremental cache hashes this JSON):
 *  - all coordinates rounded to 0.1px
 *  - animations/transitions frozen by injected CSS before this runs
 *  - colors normalized to rgba() through the color-mix(in srgb) probe
 *    (computed oklch() strings never reach the output)
 */

/** @param {string} selector — the [data-blueprint] stage selector */
export async function serializeStageInPage(selector) {
  const stage = document.querySelector(selector);
  if (!stage) throw new Error(`stage not found: ${selector}`);

  const round = (n) => Math.round(n * 10) / 10;

  // ---- color normalization: any css color -> rgba(r,g,b,a) ----
  // Computed styles keep oklch()/color() verbatim in Chrome; canvas
  // fillStyle doesn't reliably normalize wide-gamut inputs either. The
  // color-mix(in srgb, X 100%, transparent) probe DOES: interpolation
  // forces an srgb-resolved computed value.
  const probe = document.createElement('span');
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const colorCache = new Map();
  const parseRgb = (out) => {
    const m = out.match(
      /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.%]+))?\s*\)|color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.%]+))?\s*\)/i,
    );
    if (!m) return null;
    if (m[1] !== undefined) {
      const a = m[4] === undefined || m[4] === '' ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return `rgba(${Math.round(+m[1])},${Math.round(+m[2])},${Math.round(+m[3])},${round(a)})`;
    }
    const a = m[8] === undefined || m[8] === '' ? 1 : m[8].endsWith('%') ? parseFloat(m[8]) / 100 : parseFloat(m[8]);
    return `rgba(${Math.round(+m[5] * 255)},${Math.round(+m[6] * 255)},${Math.round(+m[7] * 255)},${round(a)})`;
  };
  const color = (str) => {
    if (!str) return null;
    const key = String(str);
    if (colorCache.has(key)) return colorCache.get(key);
    let out = null;
    try {
      probe.style.color = '';
      probe.style.color = `color-mix(in srgb, ${key} 100%, transparent)`;
      const computed = getComputedStyle(probe).color;
      out = parseRgb(computed) ?? parseRgb(key);
      // alpha 0 = transparent paint — normalize to null
      if (out && /,0\)$/.test(out)) out = null;
    } catch {
      out = parseRgb(key);
    }
    colorCache.set(key, out);
    return out;
  };

  const stageRect = stage.getBoundingClientRect();

  // ---- replaced-content rasterization (2x for crisp icons) ----
  const rasterCache = new WeakMap();
  async function rasterize(el, w, h) {
    if (rasterCache.has(el)) return rasterCache.get(el);
    let src = null;
    try {
      if (el instanceof HTMLImageElement) {
        src = el.src;
      } else if (el instanceof HTMLCanvasElement) {
        src = el.toDataURL('image/png');
      } else if (el instanceof SVGSVGElement) {
        const clone = el.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const vb = (el.getAttribute('viewBox') || `0 0 ${w} ${h}`).split(/\s+/).map(Number);
        clone.setAttribute('width', String(vb[2]));
        clone.setAttribute('height', String(vb[3]));
        const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
        src = URL.createObjectURL(blob);
      }
    } catch {
      src = null;
    }
    if (!src) return null;
    const dataUrl = await new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'sync';
      img.onload = () => {
        try {
          const scale = 2;
          const cnv = document.createElement('canvas');
          cnv.width = Math.max(1, Math.round(w * scale));
          cnv.height = Math.max(1, Math.round(h * scale));
          const ctx = cnv.getContext('2d');
          ctx.drawImage(img, 0, 0, cnv.width, cnv.height);
          resolve(cnv.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    if (el instanceof SVGSVGElement && src.startsWith('blob:')) URL.revokeObjectURL(src);
    rasterCache.set(el, dataUrl);
    return dataUrl;
  }

  // ---- text helpers ----
  const applyTransform = (text, tt) =>
    tt === 'uppercase' ? text.toUpperCase()
    : tt === 'lowercase' ? text.toLowerCase()
    : tt === 'capitalize' ? text.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase())
    : text;

  // Split one text node into visual lines (Range-measured). Each line
  // becomes its own txt primitive at its real line-box rect.
  function textLines(node, hostCS, out, ctx) {
    const raw = node.nodeValue;
    if (!raw || !/\S/.test(raw)) return;
    const range = document.createRange();
    const marks = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(raw))) marks.push([m.index, m.index + m[0].length]);
    if (!marks.length) return;
    const groups = [];
    let current = null;
    let lastTop = null;
    for (const [s, e] of marks) {
      range.setStart(node, s);
      range.setEnd(node, e);
      const r = range.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const top = round(r.top);
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        current = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, words: [] };
        groups.push(current);
        lastTop = top;
      }
      current.left = Math.min(current.left, r.left);
      current.right = Math.max(current.right, r.right);
      current.top = Math.min(current.top, r.top);
      current.bottom = Math.max(current.bottom, r.bottom);
      current.words.push(raw.slice(s, e));
    }
    const tt = hostCS.textTransform;
    for (const g of groups) {
      const x = round(g.left - stageRect.left + ctx.dx);
      const y = round(g.top - stageRect.top + ctx.dy);
      const w = round(g.right - g.left);
      const h = round(g.bottom - g.top);
      if (w <= 0 || h <= 0) continue;
      out.push({
        k: 'txt',
        x, y, w, h,
        t: applyTransform(g.words.join(' '), tt),
        s: round(parseFloat(hostCS.fontSize)),
        w8: hostCS.fontWeight,
        f: hostCS.fontFamily.includes('Share Tech Mono') ? 'n' : 'm',
        c: color(hostCS.color) ?? 'rgba(0,0,0,1)',
        sp: hostCS.letterSpacing === 'normal' ? null : round(parseFloat(hostCS.letterSpacing)),
        op: ctx.op,
      });
    }
  }

  // Pseudo-elements (::before/::after) have no geometry API; resolve
  // their computed insets/size against the host box. Covers the design
  // system's patterns (inset:0 surfaces, corner dots, checkmark fills).
  function pseudoBox(el, pseudo, hostBox, cs, out, ctx) {
    const ps = getComputedStyle(el, pseudo);
    if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none') return;
    const px = (v, base) => (v.endsWith('px') ? parseFloat(v) : v.endsWith('%') ? (parseFloat(v) / 100) * base : null);
    let { x, y, w, h } = hostBox;
    const iw = px(ps.width, hostBox.w);
    const ih = px(ps.height, hostBox.h);
    const l = px(ps.left, hostBox.w);
    const r = px(ps.right, hostBox.w);
    const t = px(ps.top, hostBox.h);
    const b = px(ps.bottom, hostBox.h);
    if (ps.position === 'absolute' || ps.position === 'fixed') {
      if (iw !== null) { w = iw; if (l !== null) x = hostBox.x + l; else if (r !== null) x = hostBox.x + hostBox.w - r - w; }
      if (ih !== null) { h = ih; if (t !== null) y = hostBox.y + t; else if (b !== null) y = hostBox.y + hostBox.h - b - h; }
    }
    const op2 = ctx.op * (ps.opacity === '1' ? 1 : parseFloat(ps.opacity));
    const bg = color(ps.backgroundColor);
    const bw = ['top', 'right', 'bottom', 'left'].map((side) =>
      ps[`border${side[0].toUpperCase()}${side.slice(1)}Style`] === 'none' ? 0 : parseFloat(ps[`border${side[0].toUpperCase()}${side.slice(1)}Width`]) || 0,
    );
    const bc = ['Top', 'Right', 'Bottom', 'Left'].map((side) => color(ps[`border${side}Color`]));
    if (bg || bw.some(Boolean)) {
      out.push({
        k: 'box', x: round(x), y: round(y), w: round(w), h: round(h),
        bg, op: op2, bw: bw.map(round), bc,
        r: radius(ps), sh: null,
      });
    }
    const content = ps.content;
    const cm = content && content.match(/^["'](.*)["']$/);
    if (cm && cm[1].trim() && ps.color) {
      out.push({
        k: 'txt', x: round(x), y: round(y), w: round(w), h: round(h),
        t: cm[1], s: round(parseFloat(ps.fontSize)), w8: ps.fontWeight,
        f: ps.fontFamily.includes('Share Tech Mono') ? 'n' : 'm',
        c: color(ps.color) ?? 'rgba(0,0,0,1)', sp: null, op: op2,
      });
    }
  }

  const radius = (cs) => {
    const val = (v) => {
      if (v.endsWith('%')) return parseFloat(v) >= 50 ? 9999 : round(parseFloat(v));
      return round(parseFloat(v)) || 0;
    };
    const parts = cs.borderRadius.split('/');
    const first = parts[0].trim().split(/\s+/);
    const [a, b = a, c = a, d = b] = first;
    return [val(a), val(b), val(c), val(d)];
  };

  // clamp a rect into the stage: top-layer/fixed panels (modals,
  // popovers, toast stacks) live in viewport space — translate them by
  // the minimal delta so the blueprint shows them inside the stage.
  function clampOffset(rect) {
    const inside = (r) =>
      r.left >= stageRect.left - 1 && r.right <= stageRect.right + 1 &&
      r.top >= stageRect.top - 1 && r.bottom <= stageRect.bottom + 1;
    if (inside(rect)) return { dx: 0, dy: 0 };
    const w = rect.width, h = rect.height;
    if (w > stageRect.width || h > stageRect.height) {
      return {
        dx: stageRect.left + stageRect.width / 2 - (rect.left + w / 2),
        dy: stageRect.top + stageRect.height / 2 - (rect.top + h / 2),
      };
    }
    return {
      dx: rect.left < stageRect.left ? stageRect.left - rect.left
        : rect.right > stageRect.right ? stageRect.right - rect.right : 0,
      dy: rect.top < stageRect.top ? stageRect.top - rect.top
        : rect.bottom > stageRect.bottom ? stageRect.bottom - rect.bottom : 0,
    };
  }

  const nodes = [];

  async function walk(el, ctx) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return;

    let { dx, dy } = ctx;
    const topLayer = el.matches(':modal, :popover-open') || cs.position === 'fixed';
    if (topLayer) ({ dx, dy } = clampOffset(rect));
    const ctx2 = { ...ctx, dx, dy, op: ctx.op * (cs.opacity === '1' ? 1 : parseFloat(cs.opacity) || 0) };

    const x = round(rect.left - stageRect.left + dx);
    const y = round(rect.top - stageRect.top + dy);
    const w = round(rect.width);
    const h = round(rect.height);
    const box = { x, y, w, h };

    // replaced content -> raster (before children; border still paints)
    let raster = null;
    if (
      el instanceof HTMLImageElement || el instanceof HTMLCanvasElement ||
      (el instanceof SVGSVGElement && !el.classList.contains('bp-skip'))
    ) {
      raster = await rasterize(el, w, h);
    }

    const bg = color(cs.backgroundColor);
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map((side) =>
      cs[`border${side}Style`] === 'none' ? 0 : parseFloat(cs[`border${side}Width`]) || 0,
    );
    const bc = ['Top', 'Right', 'Bottom', 'Left'].map((side) => color(cs[`border${side}Color`]));
    const sh = cs.boxShadow && cs.boxShadow !== 'none' ? cs.boxShadow : null;
    if (bg || bw.some(Boolean) || sh) {
      nodes.push({ k: 'box', x, y, w, h, bg, op: ctx2.op, bw: bw.map(round), bc, r: radius(cs), sh });
    }
    if (raster) {
      nodes.push({ k: 'img', x, y, w, h, src: raster, op: ctx2.op, r: radius(cs) });
    }

    // pseudo paint rides the host geometry
    pseudoBox(el, '::before', box, cs, nodes, ctx2);
    pseudoBox(el, '::after', box, cs, nodes, ctx2);

    // form-control values: the browser paints these, not DOM text nodes
    if (
      (el instanceof HTMLInputElement && !/^(checkbox|radio|color|file|range|button|submit|reset|image)$/.test(el.type)) ||
      el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
    ) {
      const value =
        el instanceof HTMLSelectElement
          ? el.selectedOptions[0]?.textContent ?? ''
          : el instanceof HTMLInputElement && !el.value && el.placeholder
            ? el.placeholder
            : el.value;
      const pcs = !el.value && el.placeholder ? getComputedStyle(el, '::placeholder') : cs;
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padT = parseFloat(cs.paddingTop) || 0;
      const bt = parseFloat(cs.borderTopWidth) || 0;
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const lines = String(value ?? '').split('\n');
      lines.forEach((line, i) => {
        if (!line) return;
        nodes.push({
          k: 'txt',
          x: round(x + bl + padL),
          y: round(el instanceof HTMLTextAreaElement ? y + bt + padT + i * lh : y + h / 2 - lh / 2),
          w: round(w - bl - padL - (parseFloat(cs.paddingRight) || 0)),
          h: round(lh),
          t: applyTransform(line, cs.textTransform),
          s: round(parseFloat(cs.fontSize)),
          w8: cs.fontWeight,
          f: cs.fontFamily.includes('Share Tech Mono') ? 'n' : 'm',
          c: color(pcs.color) ?? 'rgba(0,0,0,1)',
          sp: null, op: ctx2.op,
        });
      });
    }

    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        textLines(child, cs, nodes, ctx2);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        await walk(child, ctx2);
      }
    }
  }

  await walk(stage, { dx: 0, dy: 0, op: 1 });

  probe.remove();

  const cs = getComputedStyle(stage);
  return {
    name: stage.dataset.blueprint,
    w: round(stageRect.width),
    h: round(stageRect.height),
    bg: color(cs.backgroundColor) ?? 'rgba(255,255,255,1)',
    nodes,
  };
}
