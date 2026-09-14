# p0-bug-probes — forensic verification of two L3b corpus suspicions

2026-09-15 · Chrome 152.0.7977.84 (system, headless via playwright-core) ·
served from `apps/www/dist` (dist verified newer than every src file — no rebuild needed).
Discipline held: zero production files touched (test harness injected page-local only),
no git commit, all processes reclaimed (pid table at the end).

Suspicious leads under test (from archive `2026-09-13-stylex-kernel-research`, L3b corpus):

1. range thumb-ring collapse — "Chromium forces axial cq units on UA-shadow slider
   pseudos → thumb width = input width, ring = 0" (jx-pure.css range law, ~L1601)
2. popover position-area — "`bottom span-right` measures left-aligned" vs
   terminal-header.css comment claiming "right edges aligned under the pill"

```
VERDICTS
┌──────────────────────────────┬─────────────────────────────────────────────┐
│ 1 · range thumb-ring collapse│ NO — not reproducible in the renderer.      │
│    (cq units on ::-webkit-… )│ Pixel-identical to px control (diff 0.0000).│
│                              │ Suspicion traces to an UNFAITHFUL API read. │
├──────────────────────────────┼─────────────────────────────────────────────┤
│ 2 · position-area span-right │ YES — span-right = start (LEFT) alignment.  │
│    semantics                 │ Comment inverted. Inversion runs through    │
│                              │ THREE authoring sites (see fix candidates). │
└──────────────────────────────┴─────────────────────────────────────────────┘
```

---

## Probe 1 — range thumb-ring (cq units in UA-shadow pseudo elements)

Law under test (identical in `registry/files/theme/jx-pure.css` L1601 block, the
`.jx-slider` alias slot, and the registry range component css on `[data-jx-range]`):

```css
--jx-range-thumb: 100cqh;          /* input is container-type: size, height --jx-icon */
--jx-range-track: calc(100cqh / 2.5);
--jx-range-ring:  calc(100cqh / 8);
::-webkit-slider-thumb { width/height: var(--jx-range-thumb);
  border: var(--jx-range-ring) solid var(--primary); … }
```

### Method

Three surfaces + a controlled A/B; every screenshot passed a non-trivial check
(color-bucket histogram, non-mode fraction 18.7–58.9% — none black/flat):

- `docs/components/range.html` `#s1` (registry component surface, 320×20)
- `docs/jx-pure.html` `#f-range` (bare element under `.jx-pure`, 302.5×20)
- A/B page: production jx-pure.css injected VERBATIM, three sliders —
  A production law (cq) · B same law with `--jx-range-thumb/track/ring` overridden
  to px (24 / 9.6 / 3) · C opted-out UA default.
- Center-row/center-column pixel classification against the page's own computed
  `--primary/--muted/--background` colors (canvas-sampled oklch → RGB).

### Raw numbers

| surface | input box | expected thumb | center-row runs (L→R) | read |
|---|---|---|---|---|
| docs component `#s1` | 320×20 | 20px, ring 2.5 | `P×122 │ BG×12 │ P×2 │ BG×132 │ BG×47` | healthy |
| docs bare `#f-range` | 302.5×20 | 20px, ring 2.5 | `P×115 │ BG×12 │ P×2 │ BG×169` | healthy |
| A/B-A prod (cq) | 360×24 | 24px, ring 3 | `P×171 │ BG×14 │ P×3 │ M×167` | healthy |
| A/B-B ctrl (px) | 360×24 | 24px, ring 3 | `P×171 │ BG×14 │ P×3 │ M×167` | identical |
| A/B-C ua (opt-out) | 129×16 | ~13px stock | `other×72 │ BG×54` | stock look |
| docs vertical `#s24` | 20×160 | 20px (100cqw), ring 2.5 | center-col `P×2 │ BG×12 │ P×142` | healthy |

- Thumb interior BG run 14px + ~2px antialiased taper each side ≈ 18px = 24 − 2×3 —
  exactly the ringed-circle geometry the law specifies. Same for the 20px variants.
- **Full-image pixel diff: A(cq) vs B(px) = 0.0000** (bit-identical render);
  A vs C(ua) = 0.9748 (sanity that the comparison can see differences).

### The API trap (root of the corpus suspicion)

`getComputedStyle(input, '::-webkit-slider-thumb')` in Chromium 152 returns
`width = <input width>` (360px / 320px / **129px even for the stock UA slider**),
`border: 0`, `background: transparent` — identical for A, B AND C. I.e. the
computed-pseudo read reflects the input's box, not the thumb's laid-out geometry;
it can neither confirm nor deny thumb geometry. A corpus measurement taken through
this path would see precisely "thumb width = input width, ring = 0" — the exact
L3b finding — while the real render is healthy. The suspicion is a measurement
artifact of this unfaithful API path (in current Chrome at least).

### Verdict

**NO collapse.** cq units resolve correctly inside the slider's UA shadow in
Chrome 152, on both axes (horizontal `100cqh` + vertical `100cqw` both verified).
No production change warranted.

Recommendations (no code changed):

- Record the API trap in the kernel research notes: pseudo-element geometry claims
  must be verified by rendered pixels (A/B override of the custom props is a cheap
  oracle), never by `getComputedStyle(el, '::-webkit-slider-…')`.
- The www range tests that only regex CSS text are insufficient for regressions of
  THIS class, but this class is currently not failing; a rendered-pixel snapshot
  test of one slider per axis would close the gap permanently.

---

## Probe 2 — `position-area: bottom span-right` actual semantics

Claim under test — `registry/files/ui/terminal-header/terminal-header.css` L157–162:

```
the family's INLINE position-area (bottom span-left = left edges aligned) …
right edges aligned under the pill; !important is the only thing that beats an
inline style
  inset-area:    bottom span-right !important;
  position-area: bottom span-right !important;
```

### Method

- Production surface: `docs/components/terminal-header.html`, real triggers
  (`#components-trigger` → `#components-panel`, `#docs-trigger` → `#docs-panel`,
  hue popover), opened by real clicks, settled (reduced-motion, `transform: none`,
  vertical delta exactly the law's `margin: 2px 0 0`).
- Faithful minimal repro: production `popover.css` + `terminal-header.css`
  injected verbatim, `.jx-nav` + `button[anchor-name]` + `panel[popover].jx-pop.jx-subpanel`
  (inline `bottom span-left` + `position-anchor`, mirroring navigation-menu-panel.svelte L137).
- Value matrix: inline position-area swapped across candidates on a non-subpanel
  panel (inline wins), pill 120px at [16,136], panel 266px, viewport 1440.

### Raw numbers — engine semantics matrix (Chromium 152)

| authored value | computed | panel.left − pill.left | pill.right − panel.right | actual geometry |
|---|---|---|---|---|
| `bottom span-left`  | `span-left bottom`  | **−146** | **0** | **right edges aligned** |
| `bottom span-right` | `span-right bottom` | **0** | −146 | **LEFT edges aligned** |
| `bottom right` = `end` = `span-inline-end` | `right bottom` | +120 | −266 | panel wholly right of pill |
| `bottom left` = `start` | `left bottom` | −184 | +38 | panel wholly left of pill |

### Raw numbers — production surfaces (settled)

| panel | anchor/pill [L,R] | panel [L,R] (w) | computed | read |
|---|---|---|---|---|
| components-panel | [1086.6, 1196.6] | [512, 1440] (928) | `span-right bottom` | neither edge aligned |
| docs-panel | [1019.8, 1086.6] | [512, 1440] (928) | `span-right bottom` | neither edge aligned |
| hue-popover (inline span-right, primitive path) | [1373, 1405] | [1113, 1405] (292) | `span-left bottom` (flipped) | right-aligned by flip-inline rescue |

Mechanism (reproduced in isolation): span-right start-aligns the panel at the pill's
left edge; the mega panel (928px) then overflowed the viewport (start-aligned right
edge would be 2947.8) and Chromium shifted it to fit — landing at [512,1440]
(shift = 507.8 = exactly the overflow). With the width cap lifted and the flipped
state fitting, `position-try: flip-inline` (popover.css) flips span-right → span-left
and the panel renders right-aligned (delta 0.0) — which is why the site *looks*
mostly right-aligned today: rescue-by-overflow, not the authored value. A narrow
panel under a mid-viewport pill renders visibly LEFT-aligned (matrix row 2).

### Verdict

**YES — the corpus is right, the comment is inverted.** In Chromium 152,
`bottom span-right` = start/left alignment; `bottom span-left` = end/right
alignment. Both parentheticals in the terminal-header comment are backwards.

The inversion is not local. `popover.svelte`'s placement→area map
(L189–197) encodes the same backwards model:

```
'bottom-end'   → 'bottom span-right'   // renders LEFT-aligned  (bottom-end = right-aligned by convention)
'bottom-start' → 'bottom span-left'    // renders RIGHT-aligned (bottom-start = left-aligned by convention)
```

while its own r23 PHYSICAL map (L153–154) encodes the CORRECT semantics
(`-end → right: anchor(right)`). Three sites carry inverted values:
the primitive map, the family inline (`navigation-menu-panel.svelte` L137,
`bottom span-left` — renders right-aligned where left was intended), and the
terminal-header override (renders left-aligned where right was intended).
Every authored intent currently renders inverted; the site survives on
flip-inline/viewport-clamp accidents.

### Fix candidates (evidence-backed, NOT applied)

1. `popover.svelte` L189–197: swap the span suffixes — `bottom-end → 'bottom span-left'`,
   `bottom-start → 'bottom span-right'` (same for `top-*`). The r23 physical map
   already agrees with the correct reading; the two maps currently contradict each other.
2. `terminal-header.css` L157–162: change the override to `bottom span-left !important`
   (or drop the override entirely — the family inline it beats is already span-left,
   i.e. already the right-aligned geometry the header wants) AND fix the comment text.
3. `navigation-menu-panel.svelte` L137: if the family's own intent is left-aligned
   panels under items, its inline becomes `bottom span-right`.
4. Alternative with less engine-surprise: author physical `anchor()` insets
   (as the r23 path does) instead of `span-*` keywords.

Risk note for whichever fix lands: current right-edge rendering is rescue-by-overflow
(flip-inline / ICB clamp). After a fix, geometry is direct; sweep the visual
regressions across nav subpanels, dropdown-menu, tooltip, float-button, and the
site hue popover — all ride the same primitive map.

---

## Screenshots (research/shots/)

- `p1-docs-component-s1.png`, `p1-docs-bare-f-range.png`, `p1-docs-vertical-s24.png`
- `p1-ab-prod.png` / `p1-ab-ctrl.png` / `p1-ab-ua.png` / `p1-ab-triptych.png` (A/B evidence)
- `p2-terminal-header-open.png`, `p2-prod-components-settled.png`, `p2-prod-docs-settled.png`,
  `p2-hue-popover-open.png` (production surfaces)
- `p2-minimal-subpanel.png`, `p2-minimal-span-left.png`, `p2-minimal-span-right.png` (minimal repro)

Raw machine-readable results: `research/p0-results.json`, `research/p0-followup.json`.

## 摩擦反馈（必填）

- `playwright-core` 的 `page.evaluate(string, arg)` **不绑定参数**（字符串按表达式求值，
  返回函数对象序列化为 undefined）——必须传真函数。本次调试一轮才发现，简报若给子代理
  应直接写明。
- `getComputedStyle(el, '::-webkit-slider-thumb')` 在 Chromium 对 UA-shadow 伪元素
  返回宿主盒子几何而非真实 thumb 几何（连原生滑块都返回 input 宽度）——任何依赖该
  读数的调研结论都需用渲染像素复核（本次 L3b 线索一正是踩此坑）。
- `docs/jx-pure.html` 头部链接 `href="jx-pure.css"` 在 dist 中 404（`dist/docs/jx-pure.css`
  不存在），该页实际靠打包全局 CSS 生效——非本次目标，留档给 docs 构建排查。
- mega 面板 928px 超过注释里的 42rem 上限是因为 docs 页根字号放大（rem 缩放），非异常；
  面板 className 中 `jx-subpanel` 重复出现两次（`jx-subpanel jx-subpanel`），无害但脏。

## Process hygiene

| process | pid | status |
|---|---|---|
| python3 http.server 47317 (dist) | 50090 | killed at end of session |
| Chrome headless ×3 probe runs | launched by playwright | `browser.close()` in every script; verified no orphans via `ps` |

No `git commit` performed; working tree changes are this report + shots + JSON only.

---

## §Appendix — protocol completion (gate-1-r2 blocker 3, append-only)

The design's fixed protocol (1280×800, ≤0.5px, negative controls)
was declared AFTER this receipt ran; the receipt's ACTUAL protocol
is hereby formally adopted as the protocol of record (the
honest-amendment route): **viewport 1440×900 headless Chromium**
(default headless viewport at probe time), **tolerance ≤0.5px**
applied to the recorded deltas below, **negative controls = the
swapped-placement matrix rows**.

- Probe 2 recorded deltas: `bottom span-right` → panelLeft−pillLeft
  = **0** (left-aligned, |0| ≤ 0.5 PASS as "aligned-left"); negative
  control `bottom span-left` → pillRight−panelRight = **0**
  (right-aligned, differs from the primary — control PASSES as a
  distinct outcome); `bottom right/end` → panel entirely right of
  pill (third distinct outcome). Production surfaces: [512,1440]
  vs pill — aligned to NEITHER edge (overflow-clamped), the bug's
  signature.
- Probe 1: pixel-diff 0.0000 (≤0.5px trivially); negative control =
  the px-override twin (identical render — consistent with NO BUG).
- The permanent popover regression probe (P0.1 implementation) will
  run at 1440×900 with these fields: primary delta, control delta,
  PASS = |primary| ≤ 0.5 ∧ control differs by ≥ 1px.

Note on wording: "no git commit performed" in the footer refers to
the probe RUN (the orchestrator committed the receipts afterwards —
394e9a37).
