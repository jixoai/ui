# Proposal: inline-code engine upgrade + the fused/solid rework + the text modifier kernel

## Why

The Owner's R4 rulings (2026-09-08, six asks):

1. **Markdown 内默认启用 lang=auto** — the detection capability the chip
   already owns must actually reach markdown faces; today the frozen map
   pins `lang="text"` and the capability is dead code on the site's
   highest-traffic consumer.
2. **inline-code 默认使用 microlighter** — the token-span shiki path is
   the heavyweight engine for a chip; the range engine (4.5KB, zero
   markup, copyable plain text) is the honest default for inline code.
3. **fused 变体** — drop tonal-as-default, keep tonal, mint **fused**
   (the separator's backdrop-fusion technique as chip paint); dually,
   separator's default technique earns its name (**fused**) and a plain
   **solid** fill joins the vocabulary (ink-law amendment, Owner
   2026-09-08: `--border`).
4. **圆角随 Density** — default mode 4px; other sizes map to 2px/8px
   (Owner delegated the mapping; ruling: 2xs/xs/sm→2, default→4, lg→8).
5. **Text lineHeight + shared modifier kernel** — every Text member
   gains the common text modifiers (line-height/weight/italic/tracking/
   family/font-size); inline-code shares the kernel but stays its own
   component.
6. **padding-inline 公式** — `radius + fontSize × (lineHeight − 1) / 2`
   (worked examples: 4px/12px/1 ⇒ 4px; 4px/12px/1.5 ⇒ 7px).

Four rulings locked in plan review: **fused 铸成新阶梯词**（语法级词汇演进，
非 literal 槽转换）、**microlighter 特性门控纯文本降级**（不回退 shiki）、
**2/4/8 三档**、**separator solid 用 --border**。

## What Changes

- **inline-code** — engine seam (`backend` prop → `HIGHLIGHT_KEY`
  context → stock `DEFAULT_MICROLIGHTER_BACKEND`), own pre-gate on
  `CSS.highlights` (jsdom/old browsers stay plain, silently), the
  shiki token-span path RETIRED (detection stays: fingerprints are
  ours, sync, zero-download); variant slot becomes
  `['fused','tonal','outline']` own **fused**; radius leaves
  `rounded-(--radius)` for the density ladder token; padding-inline
  becomes the radius×leading calc; the six modifier props ride the
  shared kernel.
- **separator** — literal slot `line` renamed **fused** (zero CSS
  delta: the base strip's selector is value-agnostic presence), new
  **solid** (`background: var(--border)`, `backdrop-filter: none`);
  the subtraction ink law gains the Owner's solid exception.
- **the paint ladder** — `fused` joins `PaintVariant`
  (`fill|tonal|outline|ghost|link|fused`) and the config mirror +
  frozen table row + vg docs page.
- **text family** — six modifier props (`lineHeight weight italic
  tracking family fontSize`) resolved through the new shared kernel
  `registry/files/lib/text-style.svelte.ts`; the ambient scale law
  gains its explicit-prop amendment (absent = inheritance flows,
  explicit = utility override; an explicit member lineHeight beats
  the prose region's leading — the layer law's own posture).
- **markdown face** — both `inline_code` call sites drop
  `lang="text"` and ride the component default `auto`; the
  zero-work-per-span streaming law is restated as the detect-sync /
  highlight-async split.
- **theme density ladder** — `--jx-density-chip-radius-{2xs,xs,sm,default,lg}`
  primitives (2/2/2/4/8px) + the per-scope `--jx-chip-radius` remap.
- **highlight-engines spec** — the single-default-engine law now
  covers both surfaces: code-card ships shiki, inline-code ships
  microlighter; each surface's stock default is its own.

## Impact

Registry items touched: inline-code, separator, text (+8 sugars
pass-through), markdown, jixoai-theme, the highlight core (anchor
generalization + rAF coalescing + DEFAULT_MICROLIGHTER_BACKEND), and
a NEW lib file `text-style.svelte.ts`. Mirrors (apps/www/src/lib/**),
frozen-availability chain (config + vg page + living spec), docs
pages (inline-code / separator / text), meta tables, and the test
battery (inline-code.spec, markdown-render.spec, separator specs,
text specs, props-table-meta-drift) all move in the same change.
