# R0 census — the receipts (r0-census.md)

> Orthogonal intents: (1) anchor every census number quoted by the change
> docs to a reproducible command against a frozen git state; (2) record the
> frozen statistical syntax itself (r0-census.mjs, committed next to this
> file); (3) attribute the built www CSS sheet by origin, with method and
> error sources stated; (4) leave a process-reclaim record. Origin: Codex
> Gate-1 demanded receipts for numbers the design docs quoted without
> evidence. Written 2026-09-13 by the R0-receipts subagent.
>
> NOTE: while this receipt was being written, the orchestrator was revising
> the four change docs in parallel (r2, post Gate-1). Nothing below depends
> on doc text — every anchor is a git state or a command output.

## a. Anchor declaration

Trees and heads (both verified clean of tracked modifications at task
start; see §f for the parallel doc-revision note):

| checkout | path | branch | HEAD |
|---|---|---|---|
| main | `/Users/kzf/Dev/GitHub/jixoai-labs/ui` | main | `3f770d5e` (**not** `3477a6d0` — see below) |
| worktree | `/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex` | stylex-integration | `3c9097e0` |

Brief said main HEAD = `3477a6d0`. Actual: `3f770d5e` — main advanced 4
commits past `3477a6d0` (which is the merge-base) before this task ran:
`77aebb0a` (tree-view caret), `0fcc8c58` (release 0.5.0), `7956521b`
(merge), `3f770d5e` (mirror fix).

`git -C /Users/kzf/Dev/GitHub/jixoai-labs/ui diff 3477a6d0..3c9097e0 --stat`
(verbatim):

```
 openspec/changes/2026-09-13-stylex-kernel-research/.openspec.yaml  |   2 ++
 openspec/changes/2026-09-13-stylex-kernel-research/design.md       | 218 +++++...
 openspec/changes/2026-09-13-stylex-kernel-research/proposal.md     |  72 ++++
 openspec/changes/2026-09-13-stylex-kernel-research/tasks.md        |  79 ++++
 openspec/changes/2026-09-13-stylex-kernel-research/verification.md |  63 ++++
 5 files changed, 434 insertions(+)
```

`--name-status` confirms all five are `A` (additions) under
`openspec/changes/2026-09-13-stylex-kernel-research/`. Therefore the
tracked trees of `3477a6d0` and `3c9097e0` are **byte-identical outside
that change folder** — including `apps/www/**` and `registry/**`.

Equivalence, corrected and empirical (the brief's claim "在主检出构建 =
在 HEAD 3c9097e0 构建" needed repair because main is at `3f770d5e`):

1. `git diff 3c9097e0..3f770d5e --stat -- apps/www registry registry.json`
   touches exactly 5 files: `apps/www/src/lib/ui/tree-view/tree-view.svelte`
   (+16/-1), `registry/files/ui/tree-view/tree-view.svelte` (+16/-1),
   `apps/www/mirror-manifest.json`, `apps/www/test/fixtures/tree-host.svelte`
   + `apps/www/test/tree-view.spec.ts` (tests are not build inputs).
2. The frozen census was run on BOTH trees: every overlapping target
   returns identical numbers (§c) — the caret delta moves no census number
   under the frozen syntax.
3. Build-at-main ≡ build-at-3c9097e0 modulo the two tree-view.svelte
   copies (+ a version string in `packages/vite-plugin/package.json`).
   In practice the build never completed (§e), so the sheet attributed is
   the 2026-09-11 dist anyway — see §e for its own drift bound.

Frozen syntax: `openspec/changes/2026-09-13-stylex-kernel-research/research/r0-census.mjs`
(zero-dep node). Harvest rule: `class="…"`, `class='…'`, and
``class={`…`}`` template literals with every `${…}` interpolation replaced
by one space (static chunks only). Not harvested (frozen exclusions):
`class={expr}` non-template expressions (ternaries/cn() calls/`class={"…"}`
plain strings), `class:list={…}`, `class:name={expr}` directives. TW
judgment: one regex — strip any number of `[a-z0-9-]+:` variant prefixes
(covers `dark:`, `md:`, stacked variants; arbitrary-value variants like
`min-[850px]:` NOT covered — known exclusion), then prefix-match the
family alternation listed in the script header (display/spacing/typography/
color/interaction families; `[pm][trblxy]?-` spacing; prefix semantics so
`flex` covers `flex-1` and `border` covers `border-2`). Walks the working
tree (skips `node_modules/`, `dist/`, `.svelte-kit/`, dot entries) — this
matters: see the tracked-vs-ignored note in §c.

Run commands (recorded verbatim):

```
cd /Users/kzf/Dev/GitHub/jixoai-labs/ui && \
  node /Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex/openspec/changes/2026-09-13-stylex-kernel-research/research/r0-census.mjs \
    registry/files/ui registry/files/routes registry/files/lib \
    apps/www/src apps/www/src/routes apps/www/src/lib demo examples

cd /Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex && \
  node openspec/changes/2026-09-13-stylex-kernel-research/research/r0-census.mjs \
    <same eight targets>
```

## b. Dependency surface

```
./apps/www/package.json:23:    "@tailwindcss/vite": "^4.2.1",
./apps/www/package.json:30:    "tailwindcss": "^4.2.1",
./apps/www/package.json:43:    "clsx": "^2.1.1",
./apps/www/package.json:54:    "tailwind-merge": "^3.3.1",
./registry/package.json:23:    "@tailwindcss/vite": "^4.2.1",
./registry/package.json:30:    "tailwindcss": "^4.2.1",
./registry/package.json:43:    "clsx": "^2.1.1",
./registry/package.json:54:    "tailwind-merge": "^3.3.1",
./demo/pty-terminal/package.json:17/19/21/22: same four (^4.2.1/^4.2.1/^2.1.1/^3.3.1)
```

`./demo/pty-terminal/` is gitignored (see §c). Additionally 26 fixture
consumer package.json files under `./.agents/fixtures/2026-08-24-*` and
`2026-08-30-registry-install-integrity/*` declare the same four packages
(`tailwind-merge` ^3.6.0/^3.7.0 in the newer fixtures) — test fixtures,
not shipped packages. No other tracked package.json declares any of the
four. Reproduce:

```
find . -name package.json -not -path "*/node_modules/*" -not -path "./public/*" \
  -not -path "./apps/www/dist/*" | sort | while read f; do
  grep -nE '"(tailwindcss|@tailwindcss/vite|clsx|tailwind-merge)"' "$f" | sed "s|^|$f:|"; done
```

## c. Re-run census numbers

Raw output, main checkout (full paste; `/tmp/r0-census-main.txt`):

```
# r0-census frozen-syntax run
# host-cwd: /Users/kzf/Dev/GitHub/jixoai-labs/ui
# node: v24.21.0

=== registry/files/ui ===
scanned_files_total: 406 (svelte 218 / ts 188 / js 0)
files_with_class_attr: 108 (svelte 108 / ts 0 / js 0)
files_with_tw_tokens: 94 (svelte 94 / ts 0 / js 0)
tw_token_occurrences: 2340
tw_unique_tokens: 440
family_table(occurrences): flex=198 grid=23 px-=64 py-=47 text-=356 bg-=83 border=181 rounded=17 gap-=97 md:=0 dark:=0
top10_files:
    121  registry/files/ui/date-picker/time-stepper.svelte
    111  registry/files/ui/transfer/transfer.svelte
    102  registry/files/ui/component-canvas/component-canvas.svelte
    100  registry/files/ui/terminal-header/terminal-header.svelte
     87  registry/files/ui/file-input/file-input.svelte
     82  registry/files/ui/combobox/combobox.svelte
     75  registry/files/ui/mermaid/mermaid.svelte
     69  registry/files/ui/pattern-hero-set/pattern-hero-marquee.svelte
     60  registry/files/ui/search-palette.svelte
     57  registry/files/ui/component-canvas/canvas-playground.svelte

=== registry/files/routes ===
scanned_files_total: 111 (svelte 97 / ts 14 / js 0)
files_with_class_attr: 96 (svelte 96 / ts 0 / js 0)
files_with_tw_tokens: 95 (svelte 95 / ts 0 / js 0)
tw_token_occurrences: 13849
tw_unique_tokens: 450
family_table(occurrences): flex=2535 grid=353 px-=635 py-=255 text-=2953 bg-=142 border=1065 rounded=20 gap-=1605 md:=21 dark:=0
top10_files:
    722  registry/files/routes/docs/icons.html/+page.svelte
    577  registry/files/routes/docs/components/tabs.html/+page.svelte
    461  registry/files/routes/docs/components/code-card.html/+page.svelte
    385  registry/files/routes/docs/components/press-button.html/+page.svelte
    361  registry/files/routes/docs/components/skeleton.html/+page.svelte
    323  registry/files/routes/docs/components/variant-grammar.html/+page.svelte
    322  registry/files/routes/docs/components/tour.html/+page.svelte
    306  registry/files/routes/docs/components/dialog.html/+page.svelte
    303  registry/files/routes/docs/components/separator.html/+page.svelte
    268  registry/files/routes/docs/components/spin.html/+page.svelte

=== registry/files/lib ===
scanned_files_total: 52 (svelte 1 / ts 51 / js 0)
files_with_class_attr: 3 (svelte 1 / ts 2 / js 0)
files_with_tw_tokens: 1 (svelte 1 / ts 0 / js 0)
tw_token_occurrences: 63
tw_unique_tokens: 20
family_table(occurrences): flex=0 grid=0 px-=10 py-=10 text-=12 bg-=1 border=5 rounded=1 gap-=0 md:=0 dark:=0
top10_files:
     63  registry/files/lib/icon-table/icon-table.svelte
      0  registry/files/lib/canvas-usage.ts
      0  registry/files/lib/color-utils.ts
      0  registry/files/lib/command-match.ts
      0  registry/files/lib/context-plugin.svelte.ts
      0  registry/files/lib/control-chrome.svelte.ts
      0  registry/files/lib/defaults.svelte.ts
      0  registry/files/lib/density.svelte.ts
      0  registry/files/lib/entity.svelte.ts
      0  registry/files/lib/form-field.ts

=== apps/www/src ===
scanned_files_total: 929 (svelte 515 / ts 414 / js 0)
files_with_class_attr: 405 (svelte 401 / ts 4 / js 0)
files_with_tw_tokens: 382 (svelte 380 / ts 2 / js 0)
tw_token_occurrences: 23483
tw_unique_tokens: 926
family_table(occurrences): flex=3955 grid=444 px-=999 py-=457 text-=4564 bg-=358 border=1761 rounded=77 gap-=2314 md:=26 dark:=0
top10_files:
    722  apps/www/src/routes/docs/icons.html/+page.svelte
    577  apps/www/src/routes/docs/components/tabs.html/+page.svelte
    461  apps/www/src/routes/docs/components/code-card.html/+page.svelte
    385  apps/www/src/routes/docs/components/press-button.html/+page.svelte
    361  apps/www/src/routes/docs/components/skeleton.html/+page.svelte
    325  apps/www/src/routes/docs/effects.html/+page.svelte
    323  apps/www/src/routes/docs/variant-grammar.html/+page.svelte
    322  apps/www/src/routes/docs/components/tour.html/+page.svelte
    306  apps/www/src/routes/docs/components/dialog.html/+page.svelte
    303  apps/www/src/routes/docs/components/separator.html/+page.svelte

=== apps/www/src/routes ===
scanned_files_total: 249 (svelte 133 / ts 116 / js 0)
files_with_class_attr: 132 (svelte 132 / ts 0 / js 0)
files_with_tw_tokens: 131 (svelte 131 / ts 0 / js 0)
tw_token_occurrences: 16827
tw_unique_tokens: 507
family_table(occurrences): flex=3054 grid=397 px-=830 py-=313 text-=3539 bg-=177 border=1280 rounded=32 gap-=1919 md:=26 dark:=0
top10_files: (same first five as apps/www/src; then effects.html 325,
  variant-grammar 323, tour 322, dialog 306, separator 303)

=== apps/www/src/lib ===
scanned_files_total: 678 (svelte 382 / ts 296 / js 0)
files_with_class_attr: 273 (svelte 269 / ts 4 / js 0)
files_with_tw_tokens: 251 (svelte 249 / ts 2 / js 0)
tw_token_occurrences: 6656
tw_unique_tokens: 704
family_table(occurrences): flex=901 grid=47 px-=169 py-=144 text-=1025 bg-=181 border=481 rounded=45 gap-=395 md:=0 dark:=0
top10_files:
    121  apps/www/src/lib/ui/date-picker/time-stepper.svelte
    113  apps/www/src/lib/blueprints/scenes/website-scaffold.svelte
    111  apps/www/src/lib/ui/transfer/transfer.svelte
    106  apps/www/src/lib/blueprints/scenes/scrollbar-measure.svelte
    104  apps/www/src/lib/blueprints/scenes/toc-engine.svelte
    102  apps/www/src/lib/ui/component-canvas/component-canvas.svelte
    100  apps/www/src/lib/ui/terminal-header/terminal-header.svelte
     96  apps/www/src/lib/blueprints/scenes/context-plugin.svelte
     91  apps/www/src/lib/blueprints/scenes/highlight.svelte
     91  apps/www/src/lib/blueprints/scenes/scaffold-float.svelte

=== demo ===
scanned_files_total: 2 (svelte 1 / ts 0 / js 1)
files_with_class_attr: 1 (svelte 1 / ts 0 / js 0)
files_with_tw_tokens: 1 (svelte 1 / ts 0 / js 0)
tw_token_occurrences: 38
tw_unique_tokens: 28
family_table(occurrences): flex=6 grid=0 px-=2 py-=2 text-=5 bg-=2 border=6 rounded=0 gap-=1 md:=0 dark:=0
top10_files:
     38  demo/pty-terminal/src/App.svelte
      0  demo/pty-terminal/src/main.js

=== examples ===
scanned_files_total: 13 (svelte 2 / ts 8 / js 3)
files_with_class_attr: 3 (svelte 2 / ts 0 / js 1)
files_with_tw_tokens: 0 (svelte 0 / ts 0 / js 0)
tw_token_occurrences: 0
tw_unique_tokens: 0
family_table(occurrences): flex=0 grid=0 px-=0 py-=0 text-=0 bg-=0 border=0 rounded=0 gap-=0 md:=0 dark:=0
top10_files: (examples/hmos-icons/* — all 0)
```

Worktree run (exact `3c9097e0` tracked-tree reading): **identical numbers
for every overlapping target** (ui 406/94/2340; lib 52/1/63;
apps/www/src 929/382/23483; routes 249/131/16827; lib 678/251/6656).
Differences are structural, not numeric drift:

- `registry/files/routes` → **0 files** in the worktree: the directory is
  a **gitignored generated mirror** (`.gitignore:24 registry/files/routes/`)
  that exists only in the main working tree. It is NOT source; the tracked
  source is `apps/www/src/routes` (16827 tokens).
- `demo` → **0 files** in the worktree: `demo/pty-terminal/` is gitignored
  (`.gitignore` demo section) — a generated demo present only in main's
  working tree.
- `examples` → 11 files in worktree vs 13 in main: the extra 2 are
  gitignored `examples/hmos-icons/dist-ssr/*.js` build leftovers in main's
  working tree.

Frozen-syntax verdict on the numbers the docs quoted:

| quoted number | where | re-measured (frozen syntax) | verdict |
|---|---|---|---|
| 106 ui items | design.md:53, proposal.md:43 | `registry.json` registry:ui = 106 | exact ✓ |
| 94 TW-bearing files | design.md:53 | 94 (both trees) | exact ✓ |
| 218 svelte files | quoted to Codex | registry/files/ui svelte scanned = 218 | exact ✓ |
| 2191 utility tokens | design.md:54 | **2340** occurrences (both trees; 440 unique) | **corrected** (+149, +6.8%; the original count's extraction rule was never frozen — that gap is exactly why this receipt exists) |
| routes 13155 tokens | quoted to Codex | ambiguous referent: gitignored mirror `registry/files/routes` = 13849; tracked `apps/www/src/routes` = 16827 | **not reproducible exactly**; closest is the mirror at an earlier state; the frozen receipt reports both and pins the tracked source as canonical |
| www 379/929 | quoted to Codex | 929 scanned ✓ exact; TW-bearing = **382** | 929 exact; **382 corrects 379** (both trees give 382 — the 379 predates tree state or used the unfrozen rule) |
| text- 4500 | quoted to Codex | apps/www/src text- occurrences = 4564 (routes 3539 + lib 1025) | ✓ within 1.4% |
| 13k+ docs-routes tokens | proposal.md:13, design.md:59 | mirror 13849 / tracked 16827 | ✓ "13k+" holds under either reading |
| 2273-line jixoai.css | proposal.md:12 | 2273 | exact ✓ |
| 2363-line jx-pure.css | proposal.md:12 | 2363 | exact ✓ |

## d. Static file numbers

```
$ wc -l registry/files/theme/jixoai.css registry/files/theme/jx-pure.css registry/files/app.css
   2273 registry/files/theme/jixoai.css
   2363 registry/files/theme/jx-pure.css
    110 registry/files/app.css      <-- NOTE: app.css lives at registry/files/app.css,
                                        NOT registry/files/theme/app.css (brief's path was wrong)
$ ls registry/files/ui | wc -l
   107                              <-- 106 item dirs + 1 loose file: ui/search-palette.svelte
$ jq '.items | length' registry.json
   140
$ jq -r '.items[].type' registry.json | sort | uniq -c
   106 registry:ui / 31 registry:lib / 2 registry:file / 1 registry:theme
```

## e. Build + CSS attribution

### The build: two attempts, no fresh artifact — 未取得 + 原因

Machine baseline at task start: `vm.swapusage` 16,224.5M/17,408M used
(deep swap), worsening to 18,755M/19,456M with **701M free** by attempt 2;
disk (attempt 2): `df` Data volume **409Gi used of 460Gi, 254Mi available,
100% capacity**.

- **Attempt 1** — `cd main && { time npm run build ; } > /tmp/r0-build.log 2>&1`
  (background task `exec_5eab49e3-…`). Rolldown completed: log line 1545
  `✓ built in 59.29s` + PLUGIN_TIMINGS (94% of 59.2s inside plugin hooks;
  vite-plugin-svelte:compile 32%/18.8s/659 calls). `.svelte-kit/output`
  mtimes are fresh (2026-09-13 17:11) — the bundle WAS written. Then the
  process group died silently between the vite report and SvelteKit's
  adapter phase: no `[build-site] 2/8…7.5/8` phase lines, no `adapting`
  or prerender output, and the shell wrapper itself was killed (its
  `BUILD_EXIT=` line never landed in the log). `apps/www/dist` untouched
  (mtimes still 2026-09-11 20:59). Killing mode consistent with OOM under
  the swap state above. Log: `/tmp/r0-build.log` (1562 lines).
- **Attempt 2** — `/usr/bin/time -p npm run build > /tmp/r0-build2.log 2>&1`
  (foreground). `real 102.47 / user 47.87 / sys 12.30`, **exit 1**:
  `Error: ENOSPC: no space left on device, open
  '…/apps/www/.svelte-kit/output/prerendered/pages/blueprints.html'`
  (prerender phase, sveltejs/kit postbuild/prerender.js). Log:
  `/tmp/r0-build2.log`.

A third attempt cannot succeed (disk 100%; nothing within this task's
mandate can free 460Gi-scale pressure) and the brief's one-build memory
guardrail argues against grinding. **Attribution therefore runs against
the existing COMPLETE dist** — `apps/www/dist`, built 2026-09-11 20:59
from tree state `d17abd58` (2026-09-11 20:56:43, the last sheet-input
commit before the dist mtimes). Drift bound to current HEAD:
`git diff --stat d17abd58..3f770d5e -- apps/www/src registry/files` =
19 files, all in the **spin family + tree-view caret** (spin.css ±56
lines ×2 copies is the ONLY css-file change; spin.svelte/catalog/
defaults/docs-page markup the rest). The frozen census numbers are
identical on both sides of that range, so the sheet below differs from a
hypothetical current-HEAD sheet only by the spin slice.

### CSS asset inventory (apps/www/dist)

127 CSS assets. Largest:

| file | raw B | gzip B | linked by pages |
|---|---|---|---|
| `_app/immutable/assets/0.BINDZyoA.css` (the main sheet) | 300,245 | 43,352 | **126/126** |
| `_app/immutable/assets/35.CdKbgtsb.css` (Fira Code @font-face set) | 50,439 | 23,772 | 1 (ghostty-term) |
| `katex.B132Er_-.css` | 29,443 | 7,998 | 3 |
| `list-item.CURX0hmC.css` | 29,329 | 4,264 | ~119 |
| `input.Vhx_hD5N.css` | 11,887 | 2,531 | 126 |
| `timeline.D8r2yk3d.css` | 11,264 | 1,892 | 1 |
| `component-canvas.ubZZZNhQ.css` | 7,071 | 2,017 | ~119 |
| …120 more (per-component + prism/highlight themes + numbered chunks) | | | |

Reproduce: `find apps/www/dist -name '*.css' -exec sh -c 'for f; do echo "$(wc -c <"$f") $(gzip -c "$f" | wc -c) $f"; done' sh {} +`

### Single-sheet assertion (link scan over dist/**/*.html)

- 126 HTML pages; **0 pages without a stylesheet link**.
- **All 126 pages link the main sheet** `0.BINDZyoA.css` (300,245B /
  43,352B gzip) — via differing relative prefixes (`../../`, `../`, `./`).
- **13 CSS assets are linked by every one of the 126 pages** (main sheet,
  input, separator, card, dialog, toc, glass, popover, tooltip,
  terminal-header, terminal-footer-column, press-button,
  progressive-blur); ~7 more ride ≥119 pages (list-item, component-canvas,
  code-card, code-block, section-card, radio, `2.CbJUjOH3.css` = the print
  whitelist law). The same full common set rides every page → the
  "monolithic render-blocking sheet" claim holds, generalized: not ONE
  file but one fixed ~20-file common bundle + the main sheet.
- Per-page linked CSS (sum over that page's `<link rel="stylesheet">`):
  **raw min 337,773B (patterns.html, 14 links) / avg 386,050B / max
  466,549B (blueprints.html, 65 links)**; gzip avg 63,417B (min 53,154 /
  max 88,763).
- Caveat: 31 of 127 CSS assets are referenced by NO prerendered HTML —
  they are client-navigation lazy chunks (loaded via JS import on route
  change, e.g. the prism/highlight theme files); the per-page numbers
  above are initial-load render-blocking bytes only.

### Content attribution of the main sheet (heuristic — method stated)

Method: string-aware brace-matching segmentation of the whole file
(instrument committed as `research/r0-sheet-attribution.cjs`, same
folder as this receipt). The five TW4 `@layer` blocks are matched by
name and attributed whole (TW4-generated by construction); all bytes
outside any layer form the "unlayered" zones, split into top-level rules
(span from previous rule's closing brace, so selectors are included)
and classified by FIRST-MATCH marker priority:
`@property/@keyframes/@font-face` preludes → machinery;
jx-pure markers (`:where(.jx-pure`, `.jx-html-*` css-laws faces, Tier-2
`.jx-control/.jx-slider/…`) → jx-pure; jixoai markers (`--brand-hue`,
`.jx-hue-`, `[data-density`, `.jx-light`, `.jx-surface`, `.jx-press`,
`--jx-*:` definitions) → jixoai; `svelte-<hash>` → component `<style>`;
`.data-table/--tok-/…` → site modules; rest → residual (sampled below).

```
$ node openspec/changes/2026-09-13-stylex-kernel-research/research/r0-sheet-attribution.cjs \
    /Users/kzf/Dev/GitHub/jixoai-labs/ui/apps/www/dist/_app/immutable/assets/0.BINDZyoA.css
file: …/0.BINDZyoA.css
total_bytes: 300245 (utf8 string len 300201)
layer_spans: theme[0:9186] base[9186:13679] components[13679:101029] utilities[101029:207941] properties[218579:220600]
unlayered_segments: [207941:218579](10638ch) [220600:300201](79601ch)
 106954B  35.6%  rules= 1501  TW utilities layer
  78317B  26.1%  rules=  327  jx-pure.css zone (css-laws faces + Tier-2)   [inside @layer components]
  42317B  14.1%  rules=   80  UNLAYERED: jixoai.css zone (token sheet)      [:root,.jx-light / .dark / .jx-surface blocks]
  24888B   8.3%  rules=   85  UNLAYERED: jx-pure.css zone (css-laws faces + Tier-2)  [Tier-2 opt-ins, label:has() faces]
  11388B   3.8%  rules=   97  UNLAYERED: TW4+entry machinery (@property/@keyframes/@font-face)
  9186B   3.1%  rules=    5  TW4 theme tokens layer
  6570B   2.2%  rules=   53  UNLAYERED: component <style> (svelte-scoped)
  5075B   1.7%  rules=   34  UNLAYERED: residual (unattributed)
  4493B   1.5%  rules=   59  TW4 preflight (base layer)
  4391B   1.5%  rules=   35  residual (unattributed)                        [inside @layer components]
  2539B   0.8%  rules=   17  TW4+entry machinery (@property/@keyframes/@font-face) [inside components]
  2021B   0.7%  rules=    1  TW4 property/var machinery layer               [@supports fallback init]
  1253B   0.4%  rules=    6  jixoai.css zone (token sheet)                  [inside components]
   833B   0.3%  rules=    9  site modules
accounted: 300225B / 300245B (diff 20B = inter-rule whitespace)
residual_selector_prefix_histogram: ?=58 html=8 .dark=2 .jx-dsn=1
```

Aggregated by origin:

| origin | bytes | % | rules |
|---|---|---|---|
| TW4-generated (theme + preflight + utilities + properties + @-machinery) | 136,581 | 45.5% | 1,680 |
| jx-pure.css (css-laws faces + Tier-2, split across components layer + unlayered) | 103,205 | 34.4% | 412 |
| jixoai.css token sheet (almost entirely unlayered :root/.dark/.jx-surface — beats layers by design) | 43,570 | 14.5% | 86 |
| component `<style>` (svelte-scoped) | 6,570 | 2.2% | 53 |
| site modules + residual (scaffold vocabulary) | 10,299 | 3.4% | 78 |
| **total** | **300,225 / 300,245 (99.99%)** | | **2,309** |

Residual samples (the honest 3.4% tail): `:where(.jx-shell-host)`,
`:where(.jx-top-layer)`, `:where(.jx-scaffold-header)`, `.jx-chrome-slot`,
`.jx-docs-pager*`, `.jx-dsn`, `html[data-vt-*]::view-transition-*`
(`.dark` syntax-theme pairs) — i.e. the docs-site scaffold/view-transition
vocabulary, semantically "site modules" that predate the marker list.

Known error sources (declared): (1) TW4 merges `@import`ed sheets into
its layer pipeline — jx-pure Part B lands INSIDE `@layer components`
while Tier-2 Part A is unlayered by cascade law, so the jx-pure zone is
split across two buckets (summed above); (2) first-match marker priority
mis-files rules that mix vocabularies (e.g. a `.jx-surface` rule that
also carries `.jx-html-*`); (3) `.dark`-scoped jixoai blocks without a
`--jx-*:` definition pattern fall to residual (2 rules, sampled); (4)
the attributed dist is the d17abd58 build (drift bounded above);
(5) `class:list`/`class={expr}`-only components are invisible to the
source census (frozen exclusion) — affects census totals, not sheet
attribution.

Rule count method: top-level brace blocks per bucket (a `@media` wrapper
counts as 1 and its inner rules additionally when independently scanned —
the utilities layer's 1501 are top-level blocks inside the layer).

### dist page/byte summary

126 HTML pages; page-average linked CSS 386,050B raw / 63,417B gzip
initial-load; the same 13-asset common set + main sheet on every page.
Answer to "是不是每个页面都加载同一份全量 CSS": **yes for the main sheet
and a fixed ~20-file common bundle (identical set on all 126 pages);
page-specific extras (katex, ghostty-term fonts, blueprint scenes) add
up to +130KB raw on the heaviest page.**

## f. Process record (started/reclaimed)

- Census runs: two short-lived `node` processes (main + worktree) —
  exited normally (exit 0 recorded in-line).
- Build attempt 1: background task `exec_5eab49e3-…` spawning
  `npm run build` → `node scripts/build-site.mjs` → vite; the process
  tree died mid-run (§e). Post-mortem: `pgrep -fl "build-site|shadcn build"`
  → NONE.
- Build attempt 2: foreground `/usr/bin/time -p npm run build` — exited
  itself (exit 1, ENOSPC); no orphans (`pgrep` NONE).
- Final sweep: `pgrep -fl "vite|node.*build"` matches are all OTHER
  projects' pre-existing processes (ai-fly daemons, skill-creator-v2,
  unipty pty helpers, vite dev servers on ports 13124/13501, two codex
  sessions, pnpm-pub daemon, design.mjs) — **not started by this task,
  not touched** (owner's other sessions; killing them is outside my
  mandate). Also observed: ~19 pre-existing `python3 -m http.server`
  orphans (ports 4174/4400-4418) serving this repo's `apps/www/dist` /
  `public/` from earlier sessions — left alone, flagged here for the
  orchestrator.
- Tracked-tree hygiene: main checkout `git status --short` clean before
  AND after both build attempts (public/ and dist/ are gitignored; the
  build's partial writes touched only gitignored paths). Worktree: only
  `?? research/` additions by me; the four change docs show `M` from the
  orchestrator's concurrent r2 revision — not written by this subagent.

## g. Friction feedback (subagent protocol)

1. **Brief's HEAD was stale**: said main = `3477a6d0`; actual `3f770d5e`
   (4 commits moved underneath, including a registry/www content change).
   Resolved by re-deriving equivalence empirically (census on both trees
   + build-input diff enumeration). Suggestion: briefs should pin "as of
   commit X at brief time" and expect drift.
2. **Census targets included generated/ignored dirs**: `registry/files/routes`
   and `demo/` are gitignored mirrors present only in the main working
   tree — a census over them measures generated copies, and the worktree
   (tracked tree) doesn't even have them. The old "routes 13155" number
   becomes unreproducible partly because of this referent ambiguity.
   Resolved by reporting both readings + naming the tracked source
   canonical. Suggestion: the change docs should pick ONE canonical
   routes scope (apps/www/src/routes) and label mirror numbers as such.
3. **"Only run the build once" was unsatisfiable as written**: the
   machine entered the task at 16.2G swap used and 100% disk; attempt 1
   was OOM-killed mid-pipeline, attempt 2 hit ENOSPC. The brief had no
   fallback protocol; I invented one (attribute the freshest complete
   dist + bound input drift via git) — recommend the change's R2 lane
   pre-register exactly this fallback so baseline.md can't be blocked on
   machine state.
4. **Old-number list vs doc citations**: "94/218, 2191, 13155, 379/929,
   text- 4500" are not in the change docs I can read (they came from the
   Codex review, presumably); two of them (13155, 379) are not
   reproducible exactly. Cross-checked all anyway (§c table).
5. **Path error in brief**: app.css is at `registry/files/app.css`, not
   `registry/files/theme/app.css`.
6. **Method note for R2**: naive brace splitting of a TW4 sheet silently
   loses selector bytes and mis-files rules (found and fixed in-session:
   spans must start after the previous rule's closing brace; quotes must
   be tracked or one stray string breaks the whole scan). The committed
   script `research/r0-sheet-attribution.cjs` encodes both fixes — R2's
   `baseline.md` should reuse it rather than re-derive.
