# Wave 1b roster — the tail families (from the archived baseline allowlist)

53 families, 1,005 occurrences (authoritative counts derived from
openspec/changes/archive/2026-09-17-tailwindless-site/research/
tailwindless-allowlist.json, W1's 52 migrated families + separator
subtracted). search-palette and docs-sections-nav carry their svelte
utility debt even though their `.stylex.ts` modules + css already
landed in W1 — W1b finishes those files.

| occurrences | family (files) |
|---|---|
| 57 | search-palette (1) |
| 37 | docs-sections-nav (1) |
| 36 | badge-indicator (1) |
| 36 | math-block (1) |
| 36 | popover (1) |
| 35 | textarea (1) |
| 34 | badge (1) |
| 33 | pattern-pricing (1) |
| 32 | descriptions (2) |
| 31 | progress (1) |
| 29 | theme-toggle (1) |
| 28 | anchor (2) |
| 27 | ghostty-term (1) |
| 27 | kbd (1) |
| 27 | table (1) |
| 26 | spin (1) |
| 25 | input-group (3) |
| 25 | statistic (1) |
| 25 | system-dialog (4) |
| 23 | cascader (1) |
| 22 | card (4) |
| 21 | prototype-kit (2) |
| 20 | docs-pager (1) |
| 19 | button-group (1) |
| 19 | inline-code (1) |
| 19 | scroll-area (1) |
| 19 | timeline (5) |
| 18 | tooltip (1) |
| 17 | range (2) |
| 15 | density-demo (1) |
| 14 | hover-card (1) |
| 14 | list-item (4) |
| 12 | dialog (1) |
| 12 | image (1) |
| 12 | native-select (1) |
| 12 | scroll-run (1) |
| 12 | toggle-group (2) |
| 11 | native-scroll-area (1) |
| 10 | list (1) |
| 10 | text (1) |
| 10 | website-scaffold (1) |
| 9 | heading (1) |
| 8 | checkbox (1) |
| 8 | link (1) |
| 8 | toc (1) |
| 7 | radio (1) |
| 5 | card-grid (1) |
| 4 | skeleton (1) |
| 4 | toggle (1) |
| 2 | markdown (2) |
| 1 | icon-button (1) |
| 1 | prose (1) |
| 1 | scroll-virtual (1) |

Suggested batch split (three parallel agents, disjoint):

- **W1b-A (≤25)**: search-palette, docs-sections-nav, badge-indicator,
  math-block, popover, textarea, badge, pattern-pricing,
  descriptions, progress, theme-toggle, anchor, ghostty-term, kbd,
  table, spin, input-group, statistic (~444)
- **W1b-B (≤19)**: system-dialog, cascader, card, prototype-kit,
  docs-pager, button-group, inline-code, scroll-area, timeline,
  tooltip, range, density-demo, hover-card, list-item (~215)
- **W1b-C (≤12)**: dialog, image, native-select, scroll-run,
  toggle-group, native-scroll-area, list, text, website-scaffold,
  heading, checkbox, link, toc, radio, card-grid, skeleton, toggle,
  markdown, icon-button, prose, scroll-virtual (~150)

Special notes per family: ghostty-term (wasm-asset item — the
virtual-module contract is install prerequisite law, do not touch
the wasm chain); timeline (5 files, the r4–r6 JOINT-LAP + stroke
laws are frozen — migrate utilities only, never the svg geometry);
spin (the round-4..10 verified-pack law is frozen — class hooks
jx-press-spin etc. are css-law keys, keep them); popover/math-block
(__probe__ corpus members exist — the probe copies are NOT in scope;
migrate the lib/ui production files only); icon-button/prose/
scroll-virtual (single-occurrence stragglers — likely one stray
class each).
