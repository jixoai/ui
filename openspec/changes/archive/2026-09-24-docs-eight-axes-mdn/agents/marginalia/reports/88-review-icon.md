# TASK 88 — FIRST REVIEW icon.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W4 at
  64a4f3e9, no CODE report — owner-checked I did not code it. No other icon review
  exists; no concordance addendum applies. All findings derived from my own source
  reads + probes).
- **Target**: `apps/www/src/routes/docs/components/icon.html/` (+page.svelte 317 lines,
  toc 5) over the icon family (svelte 214 / defaults 59 / `$lib/icon-set.gen` — the
  generated artifact), served live on :5244.
- **VERDICT: PASS — MAJOR x0 / MINOR x1 / LOW x0 / NIT x0.** **Tier proposal: Tier 1**
  — the page is tight: every quantitative claim I drove reproduces, the type-safety
  law is source-true, and the single owed item is one missing rail line.
- **The generated-set gate**: `node scripts/gen-icon-set.mjs --check` → **GREEN, fresh:
  "registry/files/lib/icon-set.gen.ts matches the generator (52 icons, 1 chunk(s))"** —
  run before any count receipt, per the dispatch.

## MINOR 1 — #universal-props is unrailable: toc 5 vs 6 served sections

The authored toc lists 5 entries (type-safety / async-paths / usage / accessibility /
api); the DOM serves **6** — the universal-props section (the page's eight-axes
surface, with its own ComponentCanvas seat) renders but has **no rail entry**. No dead
anchors (all 5 toc ids resolve). One toc line closes it. The legacy-class pattern
(dialog, float-button) — the page predates the universal-props-in-the-rail convention.

## The claims — verified digit-exact

- **The size ladder** (`name="eye"`, size 12/16/24/32, keyed `(px)` — LAW #18 source
  :186): rendered widths **12 / 16 / 24 / 32** with matching width attributes — the
  "prop-driven square size" claim, digit-exact.
- **The stroke ladder** (`name="braces"`, size 20, strokeWidth 1.5/2/2.5, keyed
  `(sw)`): stroke-width attributes **1.5 / 2 / 2.5** at constant 20px — "stroke weight
  as a prop" verified.
- **currentColor by artwork nature**: the paired check icons inherit their span's ink
  exactly — primary span oklch(0.6489 0.237 244) → icon stroke AND color identical;
  muted span oklch(0.3211 0 0) → identical. currentColor is INHERITANCE (no alias var
  in the chain) — the two-read on the staged eye ladder: stroke oklch(0 0 0) under
  light AND root dark (**the HOST stratum pin** — the canvas stage's data-theme="light"
  re-pins the context ink; the law's per-chain classification: currentColor follows
  whatever context color wins at the element's scope).
- **aria-hidden baked in**: **166 rendered `svg[data-jx-icon]` on the page — every one
  `aria-hidden="true"`**; the stroke attribute is `currentColor` on all sampled
  glyphs. The decorative-by-contract claim holds page-wide.
- **The type-safety law**: IconName is generated with the set
  (`registry/files/lib/icon-set.gen.ts`: "GENERATED — do not edit"; getIcon/loadIcon/
  ICON_NAMES all exported from the one module) — the union/artifact single-source
  claim is source-true, and the gate is green.
- **The sync default, live**: driving the playground's name select to
  `lucide:gauge` (a bridge-union name) rendered the glyph **instantly** — no
  `virtual:jixoai-icons/chunk` request, no pending box — the "inline chunk answers
  getIcon() immediately" default verified on a bridge-union name. The lazy path is
  budget-dormant on this page (52 icons ≤ the inline chunk; the async-paths section's
  own summary says lazy chunks "exist only past the budget"), so the reserved-span
  identity claim is source-level only — a coverage note, not a gap: the page ships no
  async seat, by design.

## The three count layers — each true at its own layer (no on-page contradiction)

| layer | count |
|---|---|
| the IconName UNION (names, incl. 10 `lucide:` bridge aliases) | **54** |
| generated artworks (the gen-icon-set gate) | **52** |
| the playground dock's playable select options | **44** (the native names; the bridge aliases are not offered) |

The page quotes no static count in prose — the PlayHelp interpolates
`{ICON_NAMES.length}` (the union's 54) and that help text is not present in the served
payload (the dock's PlayFields do not render it in this pass — receipted as absent, so
no count claim to contradict). The gen gate's 52 and the union's 54 are different
layers (artworks vs names), not a drift.

## Standard battery

- **SSR**: 930,529 bytes; h1 ×1; universal marker present (the universal-props canvas);
  0 undefined literals; zero `jxoai`.
- **Warm-reload (strip-style)**: raw fetches differ; **stripped of the dev-assembled
  style block, byte-identical** — the dev-CSS order artifact, third consecutive page.
- **KEYED-EACH**: the size ladder keys `(px)`, the stroke ladder `(sw)` (source :186,
  :196) — unique by construction; LAW #18 holds.
- **LAW #19**: 46 ids on the live DOM, zero duplicates.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| gen-icon-set --check | **GREEN — 52 icons, 1 chunk(s), matches the generator** |
| svelte-check (fleet) | **icon.html: 1 diagnostic** — :106 the Object.entries-undefined overload (the standing fleet class; recorded, not chased). **Family lane: 0 ERRORs** — the icon family is the cleanest audited this campaign |
| verify:docs (dist c666ad32) | **RED — 1 problem, seat = toast** ("Examples renders before Usage") — the recorded red, seat-attributed to the in-flight sibling; **icon.html passes the skeleton lint** |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 34427; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (root dark, the playground select) reverted in-probe.
- Instrument honesty: (1) my first ladder read walked to the row wrapper and reported
  the first row svg four times — re-read at the column's `:scope > svg`; (2) the
  currentColor span finder initially keyed on class names that are stylex hashes —
  re-keyed on span text; (3) the "{ICON_NAMES.length} today" help text is not served
  in this pass — receipted absent rather than quoted from source; (4) one probe
  navigated via textarea.html en route (harmless; all reads on icon.html).
- Artifacts: /tmp/marginalia-88-probe{1,2,3}.mjs, /tmp/marginalia-88-ssr{1,2}.html,
  /tmp/marginalia-88-{dev,wrapper,listener,ambient,universal,scheck,docs}.*.

## Open questions

1. **The rail line** (MINOR 1): one toc entry — fold into any next touch of the page.
2. **The dock's playable set (44)** excludes the 10 lucide: bridge aliases — if the
   playground should drive them too, that is a canvas/family seam question, not a
   defect (the aliases render fine when named in code).
