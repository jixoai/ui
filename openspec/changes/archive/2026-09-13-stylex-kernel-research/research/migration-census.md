# R5/R6 — the migration census (migration-census.md)

> Orthogonal intents: (1) per-family migration-surface table for all 106
> registry:ui items under frozen, reproducible counting rules; (2) the
> cn()-string surface census (tasks.md R5 bullet 2 — the named gap in
> r0's literal-class lower bound); (3) design §1.4 refined to a per-gate
> verdict table with exact script-level probe call sites; (4) the
> TW4-specific construct inventory (the StyleX-side receiving surface);
> (5) friction log. Written 2026-09-13 by the R5 census subagent, pure
> analysis: zero build, zero install, zero network.

## §0 Anchor, instruments, reconciliation

Tree: worktree `/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex`, branch
`stylex-integration`, HEAD `d32b0a40` (gate-1 PASS commit; tracked tree
of `registry/**` identical to the census baseline `3c9097e0` for
measured paths — the intervening commits touch only this change folder,
same lineage r0-census.md §a established). `git status --short` at task
start/end: only the two files this task creates.

Instruments (both committed next to this file, zero-dep node):

- `research/r0-census.mjs` — FROZEN literal-class grammar (class="…" /
  class='…' / class={`…`} static chunks) + frozen TW judgment regex.
- `research/r5-cn-surface.mjs` — NEW frozen instrument for
  `class={cn('…' | `…`)}`: site rule `/\bclass\s*=\s*\{\s*cn\s*\(/`,
  first-argument rule (whitespace-skip, then a quote, else the site is
  counted but NOT harvested), TW judgment regex copied VERBATIM from
  r0 (identical 口径). Known exclusions, shared with r0 by design:
  arbitrary-value variant prefixes (`[@media(forced-colors:active)]:`,
  `min-[850px]:`) are not stripped, so such tokens count as non-TW;
  conditional first args (`motion.supported && 'jx-waapi'`) and
  later-string args are not harvested; `class:list`, ternaries and
  script-side `cn()` composition are out of scope.

Whole-tree receipts (verbatim, `node <instrument> <dir>`):

```
=== registry/files/ui ===            (r5-cn-surface.mjs)
svelte_files_scanned: 218
files_with_cn_sites: 157
cn_attr_sites: 239
harvested_first_string_sites: 198
tokens_in_first_string_args: 1226
tw_tokens_in_first_string_args: 991
tw_unique_tokens: 237
bracket_property_tokens (non-TW carriers, separate count): 66

=== registry/files/lib ===           (r5-cn-surface.mjs)
svelte_files_scanned: 1 / cn_attr_sites: 1 / tw_tokens: 2   (icon-table)
```

Reconciliation against r0-census.md (all exact):

| check | r0 receipt | this census | verdict |
|---|---|---|---|
| family-dir literal TW tokens | 2340 (whole ui tree) | 2280 (106 family dirs) + 60 (loose `search-palette.svelte`) | ✓ exact |
| TW-bearing files | 94 | 94 (union re-count, verbatim r0 regex) | ✓ exact |
| svelte files | 218 | 218 | ✓ exact |
| cn() reconciliation | — | 239 attribute sites; `rg -o '\bcn\(' --glob '*.svelte'` = 261 raw mentions; gap = script-side composition (`pagination-next.svelte:39 const edgeChip = cn(`), snippet-prop passing (`toc-link.svelte:32 class: cn(className)`), comment mentions | documented |
| touch-file union | — | 94 TW-bearing ∪ 109 cn-bearing = **146 svelte files** (overlap 57) | new R5 figure |

Per-family driver: both instruments spawned per family dir (106×2
short-lived node processes, all exited 0); file-shape stats by walk.
Family list = `jq -r '.items[] | select(.type=="registry:ui") | .name'
registry.json` → 106 (the 107th dir entry is the loose
`registry/files/ui/search-palette.svelte`, referenced by NO registry
item — boundary artifact, counted in totals, not a family).

## §1 Per-family census table

Column legend. **files** = svelte+ts in family dir (css counted
separately); **LOC** = newline-split count (≤ +1/file vs `wc -l`;
tree-total wc-equivalent 52,926); **css** = folder-css files:lines
(73 files / 9,530 lines total — placement law #2, stays CSS under any
outcome); **TWlit** = r0 literal-class TW token occurrences; **cn** =
class={cn(} sites (harvested first-string sites); **TWcn** = TW tokens
in harvested first-string args; **br** = bracket arbitrary-property
tokens in those args (`[padding-inline:var(--jx-inset)]` — non-TW under
the frozen grammar, StyleX-relevant carriers); **vt** = variant
class-map table present (`} as const` maps and/or `Record<` typed maps —
the press-button:463-473 idiom); **markers** = coupling evidence
(surface = stamps `jx-surface`; press = `jx-press`; cq = `@container`;
waapi = `jx-waapi` stamp or `.animate(`; kf = `@keyframes` in family
css; fc = `forced-colors` tokens in markup; print = `@media print` in
family css; vtab = variant map; rm = reduced-motion gate
`motion.supported`/`prefers-reduced-motion`); **risk** = §2 rubric.
`*` = frozen corpus family (design §3 L3).

| family | files | LOC | css | TWlit | cn(harv) | TWcn | br | vt | markers | risk |
|---|---|---|---|---|---|---|---|---|---|---|
| accordion | 3 | 226 | 2:84 | 26 | 2(2) | 7 | 0 | | rm | moderate |
| alert | 3 | 186 | 1:14 | 1 | 3(3) | 17 | 0 | Y | fc,vtab | moderate |
| anchor | 4 | 250 | — | 0 | 1(1) | 5 | 0 | | | routine |
| avatar | 3 | 237 | — | 0 | 2(0) | 0 | 0 | Y | vtab | moderate |
| badge | 3 | 160 | — | 2 | 1(1) | 10 | 6 | Y | fc,vtab | moderate |
| badge-indicator | 2 | 91 | — | 0 | 3(1) | 2 | 0 | | | routine |
| blockquote | 3 | 339 | — | 4 | 2(2) | 11 | 0 | Y | fc,vtab | moderate |
| breadcrumb | 11 | 626 | 1:36 | 16 | 10(6) | 39 | 0 | | | moderate |
| button-group | 5 | 1362 | 1:217 | 3 | 2(1) | 2 | 0 | | | moderate |
| card | 5 | 724 | 2:333 | 15 | 0(0) | 0 | 0 | | cq | moderate |
| card-grid | 2 | 227 | 1:111 | 0 | 1(1) | 4 | 0 | | rm | routine |
| carousel | 2 | 248 | 1:16 | 51 | 2(2) | 12 | 0 | | | moderate |
| cascader | 3 | 175 | 1:14 | 18 | 1(1) | 4 | 0 | | | moderate |
| chart | 7 | 963 | 1:70 | 9 | 5(5) | 10 | 2 | Y | vtab,rm | moderate |
| checkbox | 3 | 209 | 1:27 | 0 | 3(2) | 0 | 0 | | | routine |
| chip | 3 | 242 | — | 2 | 0(0) | 0 | 0 | Y | press,fc,vtab | moderate |
| code-card* | 2 | 614 | 1:164 | 36 | 3(2) | 7 | 0 | | rm | high |
| color-picker | 5 | 1166 | 1:215 | 72 | 5(5) | 17 | 0 | | surface,waapi,rm | high |
| combobox | 3 | 930 | 1:137 | 82 | 5(5) | 35 | 1 | | surface,waapi,rm | high |
| command | 8 | 863 | 1:51 | 20 | 6(5) | 36 | 3 | | surface,waapi | high |
| component-canvas | 5 | 1835 | 1:395 | 159 | 6(6) | 46 | 0 | Y | surface,press,cq,print,vtab,rm | high |
| date-picker | 7 | 1955 | 1:128 | 266 | 8(8) | 66 | 0 | | surface,waapi,rm | high |
| descriptions | 4 | 189 | 1:19 | 3 | 3(3) | 12 | 3 | | cq | moderate |
| dialog | 3 | 438 | 1:81 | 7 | 0(0) | 0 | 0 | | surface,waapi,rm | high |
| dropdown-menu | 4 | 521 | 1:86 | 18 | 2(2) | 8 | 0 | | surface,press,waapi | high |
| empty | 3 | 97 | — | 22 | 1(1) | 7 | 2 | | | moderate |
| figure | 4 | 596 | — | 0 | 0(0) | 0 | 0 | Y | vtab | moderate |
| file-input | 3 | 674 | 1:121 | 87 | 7(7) | 68 | 9 | | press,rm | moderate |
| float-button | 3 | 250 | 1:24 | 1 | 4(2) | 6 | 0 | Y | surface,press,waapi,vtab | high |
| ghostty-term | 4 | 1700 | 1:25 | 9 | 2(2) | 7 | 0 | | rm | moderate |
| glass | 4 | 716 | 1:119 | 0 | 0(0) | 0 | 0 | Y | surface,fc,print,vtab,rm | high |
| heading | 2 | 91 | — | 0 | 1(1) | 3 | 0 | | | routine |
| hero-section | 2 | 254 | 1:42 | 40 | 1(1) | 9 | 0 | | cq,kf,rm | moderate |
| highlight-detect-default | 2 | 34 | — | 0 | 0(0) | 0 | 0 | | | routine |
| hover-card | 3 | 280 | 1:33 | 2 | 2(2) | 7 | 0 | | surface,waapi | high |
| icon* | 3 | 192 | — | 0 | 0(0) | 0 | 0 | | | routine |
| icon-button | 3 | 225 | — | 1 | 0(0) | 0 | 0 | | press | moderate |
| image | 2 | 104 | — | 9 | 1(1) | 2 | 0 | | | routine |
| inline-code | 3 | 582 | 1:88 | 0 | 1(0) | 0 | 0 | Y | fc,vtab | moderate |
| input | 3 | 1362 | 1:446 | 36 | 1(1) | 0 | 0 | Y | surface,cq,waapi,vtab,rm | high |
| input-group | 5 | 378 | 1:69 | 0 | 3(3) | 23 | 0 | | rm | moderate |
| input-otp | 3 | 269 | 1:18 | 13 | 2(2) | 17 | 0 | | | moderate |
| kbd | 3 | 120 | — | 0 | 1(1) | 6 | 3 | Y | fc,vtab | moderate |
| language-switcher | 3 | 235 | — | 42 | 2(2) | 14 | 0 | | | moderate |
| link | 2 | 103 | — | 3 | 1(1) | 3 | 1 | | fc | moderate |
| list | 2 | 171 | — | 0 | 0(0) | 0 | 0 | Y | vtab | moderate |
| list-item | 21 | 2045 | 1:773 | 0 | 12(3) | 3 | 0 | | cq,rm | moderate |
| markdown | 4 | 1496 | 1:211 | 0 | 1(1) | 0 | 0 | Y | kf,print,vtab,rm | high |
| math-block | 2 | 396 | 1:36 | 8 | 2(2) | 16 | 0 | | press,rm | moderate |
| math-inline | 2 | 89 | — | 0 | 1(0) | 0 | 0 | | | routine |
| menubar | 7 | 851 | 1:55 | 2 | 4(3) | 26 | 0 | | surface,waapi | high |
| mermaid | 2 | 506 | 1:133 | 75 | 2(2) | 19 | 0 | | press,kf,rm | moderate |
| native-select | 3 | 149 | — | 4 | 1(1) | 0 | 0 | | rm | routine |
| navigation-menu | 8 | 1022 | — | 4 | 5(5) | 29 | 0 | | surface,waapi,rm | high |
| number-input | 3 | 352 | 1:65 | 44 | 1(1) | 13 | 0 | | rm | moderate |
| pagination | 10 | 456 | — | 0 | 6(5) | 49 | 0 | | press | moderate |
| pattern-cta | 2 | 160 | 1:37 | 37 | 0(0) | 0 | 0 | | | moderate |
| pattern-faq | 2 | 116 | 1:23 | 50 | 0(0) | 0 | 0 | | | moderate |
| pattern-hero-set | 4 | 334 | 1:46 | 106 | 0(0) | 0 | 0 | | kf,rm | moderate |
| pattern-login | 3 | 271 | 1:40 | 90 | 0(0) | 0 | 0 | | | moderate |
| pattern-pricing | 2 | 159 | 1:23 | 30 | 0(0) | 0 | 0 | | | moderate |
| popconfirm | 3 | 357 | 1:26 | 33 | 3(3) | 23 | 3 | | surface,waapi | high |
| popover* | 3 | 462 | 1:87 | 22 | 1(1) | 0 | 0 | | surface,press,waapi,rm | high |
| press-button* | 5 | 1626 | 1:348 | 27 | 0(0) | 0 | 0 | Y | press,kf,fc,vtab,rm | high |
| progress | 3 | 156 | 1:53 | 11 | 2(2) | 12 | 0 | | kf,rm | moderate |
| progressive-blur | 2 | 445 | 1:159 | 8 | 2(2) | 5 | 1 | | kf | moderate |
| prose* | 3 | 399 | 1:140 | 0 | 1(1) | 0 | 0 | | fc,print | high |
| prototype-flex | 2 | 78 | — | 0 | 0(0) | 0 | 0 | | | routine |
| prototype-grid | 2 | 77 | — | 0 | 0(0) | 0 | 0 | | | routine |
| prototype-waterfall | 2 | 77 | — | 0 | 0(0) | 0 | 0 | | | routine |
| radio | 3 | 138 | — | 0 | 2(1) | 0 | 0 | | | routine |
| range* | 4 | 828 | 1:256 | 4 | 3(3) | 2 | 0 | | | high |
| reference | 2 | 145 | — | 0 | 0(0) | 0 | 0 | | | routine |
| result | 3 | 120 | — | 9 | 3(3) | 13 | 6 | Y | vtab | moderate |
| scaffold-float | 2 | 84 | — | 0 | 0(0) | 0 | 0 | | | routine |
| scroll-area | 2 | 360 | 1:62 | 2 | 3(3) | 0 | 0 | Y | vtab,rm | moderate |
| scroll-run | 3 | 1030 | 1:377 | 3 | 0(0) | 0 | 0 | Y | vtab,rm | moderate |
| scroll-virtual | 2 | 176 | — | 1 | 0(0) | 0 | 0 | | | routine |
| section-card | 3 | 390 | 1:47 | 12 | 0(0) | 0 | 0 | Y | vtab | moderate |
| select | 3 | 598 | 1:110 | 19 | 5(5) | 32 | 1 | | surface,waapi,rm | high |
| separator* | 3 | 285 | 1:150 | 0 | 2(2) | 5 | 0 | | | moderate |
| sheet | 3 | 411 | 1:87 | 19 | 4(2) | 5 | 0 | Y | surface,kf,vtab,rm | high |
| skeleton | 3 | 94 | 1:23 | 0 | 1(1) | 3 | 0 | | kf,rm | moderate |
| spin | 4 | 1043 | 1:49 | 16 | 2(2) | 5 | 0 | Y | kf,vtab,rm | moderate |
| statistic | 3 | 93 | — | 11 | 2(2) | 2 | 2 | Y | vtab | moderate |
| steps | 8 | 644 | 1:102 | 1 | 7(6) | 16 | 7 | Y | kf,vtab,rm | moderate |
| system-dialog | 12 | 1107 | 1:94 | 6 | 5(4) | 13 | 0 | Y | surface,press,waapi,fc,vtab | high |
| table | 3 | 370 | 1:197 | 2 | 2(2) | 9 | 3 | | cq,rm | moderate |
| tabs | 6 | 1093 | 1:147 | 5 | 3(3) | 17 | 5 | | fc,rm | moderate |
| tags-input | 3 | 715 | 1:133 | 41 | 4(4) | 40 | 1 | | surface,waapi,kf,rm | high |
| terminal-card | 2 | 169 | 1:30 | 47 | 2(2) | 6 | 0 | | rm | moderate |
| terminal-footer | 3 | 140 | 1:30 | 24 | 3(3) | 17 | 1 | | | moderate |
| terminal-header | 2 | 505 | 1:211 | 100 | 1(1) | 4 | 0 | | surface,cq,rm | high |
| text | 11 | 328 | — | 0 | 1(0) | 0 | 0 | Y | fc,vtab | moderate |
| textarea | 3 | 211 | — | 23 | 0(0) | 0 | 0 | | | moderate |
| theme-toggle | 3 | 207 | — | 8 | 2(2) | 4 | 0 | Y | vtab | moderate |
| timeline | 10 | 1000 | 1:526 | 0 | 7(7) | 16 | 5 | | kf,rm | moderate |
| toast | 6 | 1409 | 1:261 | 105 | 6(3) | 8 | 0 | Y | press,waapi,kf,fc,vtab,rm | moderate† |
| toc | 5 | 796 | 1:319 | 0 | 4(1) | 0 | 0 | | cq,fc,rm | moderate |
| toggle* | 3 | 104 | — | 0 | 1(1) | 0 | 0 | | | routine |
| toggle-group | 4 | 329 | — | 2 | 3(2) | 0 | 0 | | | routine |
| tooltip | 3 | 845 | 1:93 | 10 | 1(1) | 1 | 0 | | surface,waapi,rm | high |
| tour | 3 | 499 | 1:57 | 41 | 2(1) | 0 | 0 | | surface,waapi | high |
| transfer | 2 | 256 | 1:40 | 111 | 3(3) | 19 | 0 | | cq | moderate |
| tree-view | 3 | 717 | 1:114 | 31 | 5(5) | 37 | 1 | | rm | moderate |
| website-scaffold | 2 | 877 | 1:650 | 1 | 0(0) | 0 | 0 | | cq,kf,rm | moderate |

† toast is the single notable borderline: 6 coupling markers + 113 TW
tokens + `.animate(` WAAPI, mechanically moderate only because it does
not stamp `jx-surface` (it renders its own viewport layer). Under an
"overlay physics" high-rule it would grade high — recorded, not silently
regarded. range grades high on H4 (law mount + container-query
geometry, frozen corpus) despite a 6-token TW surface — the TW count is
NOT the risk carrier there, the css-laws mount is.

Marker evidence commands (family lists derived from these, verbatim):

```
rg -l "jx-surface" registry/files/ui --glob '*.svelte' --glob '*.ts' --glob '*.css'   → 23 families
rg -l "jx-press"   …                                                                  → 14 families
rg -l "data-density" …                                                               → 59 families
rg -l "@container" …                                                                 → 11 families + search-palette route usage
rg -l "jx-waapi" … ; rg -l '\.animate\(' …                                           → 18 + toast/navigation-menu/tooltip/search-palette
rg -l "@keyframes" registry/files/ui --glob '*.css'                                  → 16 families + search-palette.svelte
rg -l "forced-colors" registry/files/ui --glob '*.svelte'                            → 15 families
rg -l 'prefers-reduced-motion|reduced-motion' … (+ rg -o 'motion\.supported' = 18 sites) → 44 families
rg -l '@media print' registry/files/ui --glob '*.css'                                → component-canvas glass markdown prose
rg -l '\} as const' … ; rg -l 'Record<' … ; rg -l '\w+\[[a-z.]*(ariant|one|ize|orner|ill|hape|ensity)\]' … → vtable column
```

Print marker honesty note: `rg 'print:' --glob '*.svelte'` hits
button-group.svelte:465 and inline-code.svelte:98 — both are the words
"footprint:"/"fingerprint:" in comments; verified char-by-char, **zero
TW `print:` variants exist in family markup**. Print coupling is: the
4 folder-css files above + the www print kernel
(`apps/www/src/lib/print/{kernel-print.css,sim-shell.css,print-viewport,pipeline,freeze}.svelte.ts`)
+ `registry/files/lib/typography.svelte.ts` `@media print` + the
props-table-print-hook suite + the dist print-whitelist sheet
(`2.CbJUjOH3.css`, r0 §e).

Cross-dir registry edges (family scope includes lib files — census
column "files" counts family-dir files only; these ride the item):
popover → `registry/files/lib/surface-motion.ts` (204 LOC);
date-picker → `lib/locale.svelte.ts`; text → `lib/text-style.svelte.ts`;
toast → `lib/toast-store.ts`.

## §2 Summary — migration surface, risk buckets, D7 anchors

Migration surface totals (implementation-input side only; observation
consumers like apps/www docs routes are out per design §1.3):

| slice | files | LOC | notes |
|---|---|---|---|
| 106 family dirs | 478 (217 sv + 188 ts + 73 css) | 52,926 (`wc -l`; 43,396 markup/ts + 9,530 css) | the GO's edit surface |
| loose search-palette.svelte | 1 | 361 | 60 TW tokens, no registry item |
| shared lib (`registry/files/lib`) | 52 | 10,882 | cn (utils.ts), surface-motion, density, typography… |
| theme sheets + entry | 3 | 4,746 | jixoai.css 2,273 + jx-pure.css 2,363 + app.css 110 |
| **markup touch set** | **146 svelte** | — | 94 TW-bearing ∪ 109 cn-bearing (frozen grammars) |

Token surface: 2,280 literal TW (family dirs; +60 loose = 2,340 = r0) +
991 cn-first-string TW + 66 bracket arbitrary-property carriers =
**3,337 frozen-grammar token occurrences**, itself a lower bound
(41 unharvested cn sites, class:list/ternary forms, script-side cn,
`[@media(...)]:`-prefixed media variants all excluded by the frozen
grammar — badge.svelte alone shows 12-vs-10 on media variants).

Risk buckets (mechanical rubric — HIGH = stamps jx-surface OR
press-button OR code-card OR range OR print-css family; MODERATE =
not high AND (combined TW ≥ 15 OR css ≥ 150 lines OR variant map OR
waapi/kf/fc/cq/press marker); ROUTINE = otherwise):

- **high (27)**: code-card*, color-picker, combobox, command,
  component-canvas, date-picker, dialog, dropdown-menu, float-button,
  glass, hover-card, input, markdown, menubar, navigation-menu,
  popconfirm, popover*, press-button*, prose*, range*, select, sheet,
  system-dialog, tags-input, terminal-header, tooltip, tour.
- **moderate (60)**: accordion alert avatar badge blockquote breadcrumb
  button-group card carousel cascader chart chip descriptions empty
  figure file-input ghostty-term hero-section icon-button inline-code
  input-group input-otp kbd language-switcher link list list-item
  math-block mermaid number-input pagination pattern-cta pattern-faq
  pattern-hero-set pattern-login pattern-pricing progress
  progressive-blur result scroll-area scroll-run section-card
  separator* skeleton spin statistic steps table tabs terminal-card
  terminal-footer text textarea theme-toggle timeline toast† toc
  transfer tree-view website-scaffold.
- **routine (19)**: anchor badge-indicator card-grid checkbox heading
  highlight-detect-default icon* image math-inline native-select
  prototype-flex prototype-grid prototype-waterfall radio reference
  scaffold-float scroll-virtual toggle* toggle-group.

Corpus coverage: 5 of the 8 frozen corpus families are in the high
bucket (press-button, popover, range, code-card, prose); icon and
toggle grade routine, separator moderate. **22 of 27 high families
have no corpus proof** (dialog explicitly deferred by the D2 ruling).
The four D7-named high-risk ARCHETYPES all have a corpus carrier
(surface→popover, press-physics→press-button, print→code-card/prose,
density→rides all corpus families; container queries→range), so
archetype-level paths exist; instance-level proof does not.

D7 anchor mapping (design §4; evidence-oriented — R6 decides):

| anchor | literal test | evidence |
|---|---|---|
| 0: ">60 files" | file unit undefined in design | 146 markup touch files (ui tree alone; + lib + 3 sheets + 2 vite configs + www mirror regen). No reading of "file" in this census lands ≤60 except "high-risk files only" (27) or "families" (106) |
| 3: "≤40 files, high-risk proven on corpus" | same unit problem; 27 high families, 5 corpus-proven | unreachable on file count under the honest reading; reachable only if "files" := per-family kernel rewrites |
| 5: "≤20 files, all routine" | 19 routine families exist but 87 are not routine | unreachable |

Preliminary落点 (not a verdict): under the natural file reading the
census evidence sits at the **0 anchor's file-count criterion**, while
the "no proven path" criterion is only PARTIALLY met (archetypes
proven, instances not). If R6 instead prices D7 by family/kernel units
(27 high), the score lands between 0 and 3 — that definitional choice
is R6's to make and must be logged in the amendment ledger either way.

## §3 Gate inventory — per-gate verdicts (design §1.4 refined)

Legend: verdict ∈ untouched (research touches nothing) |
research-evidence-only (the gate's expectations feed D1/D2/RQ4; a GO
would rewrite it in the follow-up change) | follow-up-apply (the
follow-up change edits what the gate locks). Reachability evidence:
`deploy.yml:79` runs `node scripts/verify-all.mjs` (the composite);
`verify-all.mjs` chains the npm gates at lines 59–141 and the managed
browser probes at 154–291.

| gate | locked by (call site) | verdict | what moves under a GO |
|---|---|---|---|
| registry dependency shape (A4 prefix) | verify-all.mjs:40–54 inline | follow-up-apply | edge set: utils/cn and theme items change if the cn/tailwind-merge supply retires |
| verify:standards | verify-all.mjs:59 → scripts/verify-standards.mjs | research-evidence-only | enumerates which css-laws faces a GO rewrites |
| verify:laws / icons / spins / migration | verify-all.mjs:72–79 (npm) | untouched | generators untouched during research |
| verify:mirror | verify-all.mjs:75 → gen-mirror-manifest --check | research-evidence-only → follow-up-apply at apply time | canonical-first edit + www regeneration (byte-mirror set: apps/www/src/lib/ui/**, jixoai.css, jx-pure.css, app.css pair) |
| verify:context | verify-all.mjs:76 | research-evidence-only | runtime channels stay (spec-mandated, §1.2) |
| verify:deps | verify-all.mjs:77 → scripts/verify-deps.mjs (INSTALL_PREREQUISITES = jixoai-theme, jx-pure) | follow-up-apply | consumer closure: tailwindcss/@tailwindcss/vite/clsx/tailwind-merge edges |
| verify:budgets / docs / meta | verify-all.mjs:78–79 | follow-up-apply | byte budgets + docs taxonomy re-derived |
| vite.config.ts dual-app byte-identity | verify-all.mjs:86–95 (byte compare) | follow-up-apply | StyleX unplugin wiring must land in BOTH configs identically |
| ghostty-pin / registry-test-mirror | verify-all.mjs:100, 109–133; deploy.yml:81 | untouched | supply chain, local mirror |
| verify:shadcn-add | verify-all.mjs:138 | research input (RQ4) | becomes the A/B/C distribution fixture harness |
| verify:km / verify:print / verify:stacking-isolation | verify-all.mjs:241–291 (managed static server + probe children) | observation | probe METHOD reused for D1/D2 fixtures |
| verify:press / surface / trygrid / parity | root package.json aliases ONLY; NOT in verify-all, NOT in CI | research-evidence-only | D2-14/D2-15 derive from verify-surface's enumerated-override registry; every probe whose selector vocabulary moves gets rewritten |
| verify-folder-css.mjs / verify-layer-law.mjs / verify-jx-pure.mjs / verify-jx-pure-engines.mjs | **no npm alias, no verify-all entry, no CI step** — on-demand `node scripts/verify-*.mjs [port]` against a running dev server (:5199, headers document `pnpm dev` first); referenced only by: this change (design.md:161, verification.md:37), probe route apps/www/src/routes/probe-folder-css/+page.svelte:10,18, and docs-structure.spec.ts:286–290 (route-exclusion list) | research-evidence-only | folder-css contract (side-effect import, @layer, ::after, @container, single-load, layer law) is the D2 fixture grammar; engines probe supplies the cross-engine method |
| verify:betlang-pin | root package.json; CI betlang-wasm-release.yml:70–71 | untouched | wasm supply chain |
| www law suites: tw-context-probe, tw-standard-layer-probe, jx-pure-parity, dld-layers, density-adoption ×5, density-context, props-table-print-hook, registry-payload-parity, press-button, hook-law | apps/www/test/*.spec.ts — **176 spec files** (design said ~170; `ls apps/www/test/*.spec.ts \| wc -l` = 176), run locally via `npm --prefix apps/www run test` (vitest); NOT in CI (deploy.yml has no vitest step) | research-evidence-only | the tw-* two are the direct TW-coupling gates a GO retires/rewrites; the rest supply D2 expectations |
| ~170 component suites (batch1–8 + per-family) | apps/www/test/batch*.spec.ts + per-family specs, local vitest only | follow-up-apply | paint assertions rewritten where computed styles move to stylex classes |
| check-tw4-prereq | apps/www/package.json:15 + registry/package.json:15 (`check:tw4`), README.md:48 + README-zh.md:55 (consumer contract docs), packages/vite-plugin/src/index.ts:43 (error-surface pattern reference) | follow-up-apply | the consumer prerequisite contract itself — TW-as-prereq is what a GO retires |

## §4 TW-specific constructs — the StyleX receiving surface

Everything below is what a StyleX kernel must absorb or retire
(commands verbatim, all against tracked source):

| construct | inventory | StyleX-side meaning |
|---|---|---|
| `@theme inline` mapping region | jixoai.css:783–833 (51 lines), **49 vars**: 37 `--color-*`, 3 `--font-*`, `--radius`, 8 `--shadow-*` (`grep -n '@theme'` → single block; `sed -n '783,833p' \| grep -c '^\s*--'` = 49) | THE region a GO rewrites (design §1.2): token→utility projection becomes defineVars/theme contract |
| `@custom-variant` | **1**: `dark (&:where(.dark, .dark *))` (jixoai.css:782) | dark scope strategy; StyleX has no variants — theme scope or attr selector |
| `@utility` rules | **7**: jx-hue-primary/neutral/error/success/warning/info + jx-pair-destructive (jixoai.css:1084–1091; intent layer, css-laws boundary out of scope by name) | becomes inline vars or law serializer output |
| arbitrary-value var carriers | `[utility]-[var(--jx-*)]` = **130**; `[prop:var(--jx-*` arbitrary-property = **153**; `[--jx-*:…]` custom-prop setters = **91** (rg over registry/files/ui *.svelte); `px-[var(--jx-inset)]` alone = 26 | the density/context var bridge — StyleX expresses as styles object props referencing vars; the SETTER form (`[--jx-press-shadow:none]`) is the press-pose mechanism and has no variant-free StyleX equivalent beyond inline style vars |
| cn() extendTailwindMerge custom groups | registry/files/lib/utils.ts:22–36 (+ byte-mirror apps/www/src/lib/utils.ts): classGroups `jx-hue` (6 literals), `jx-pair` (1) | dedupe semantics (same-slot last-wins) must be re-created in whatever merge/override discipline replaces cn |
| `@apply` residual | **2 real directives**: app.css:55 `@apply border-border`, app.css:63 `@apply bg-background text-foreground antialiased` — ×2 copies (registry/files/app.css + apps/www/src/app.css). The other 20 rg hits are comments | trivially portable; entry base layer only |
| TW variant prefixes in markup | frozen-grammar family table (r0): flex=198 grid=23 px=64 py=47 text=356 bg=83 border=181 rounded=17 gap=97, md:=0 dark:=0 across registry/files/ui; plus forced-colors: and [@media(forced-colors:active)]: media variants in 15 families | zero responsive md:/dark: usage in the ui tree (docs routes own those); the variant surface is forced-colors + pseudo interaction |

## §5 Friction feedback (subagent protocol)

1. **r0's frozen variant-strip regex undercounts media-variant tokens**
   (`[@media(forced-colors:active)]:bg-[Canvas]` judged non-TW). Kept
   for 口径 identity — both instruments share the exclusion so numbers
   stay comparable — but R6 quoting "TW token counts" should say
   "frozen-grammar TW tokens". The gap is small but systematic in
   exactly the forced-colors-heavy families (badge 12 actual vs 10
   frozen).
2. **The 991 cn-TW figure is itself a lower bound**: 41/239 sites have
   non-string first args (`motion.supported && 'jx-waapi'`), later
   conditional strings are unharvested, and 22 raw `cn(` mentions are
   script-side composition the attribute grammar cannot see. An exact
   count needs AST extraction — deliberately out of scope for a frozen
   zero-dep instrument; recorded as the next instrument's requirement
   if R6 needs the exact figure.
3. **D7's "files" unit is undefined** and the anchors are
   unit-sensitive to the point of flipping the score (146 vs 27 vs 106
   under three defensible readings). This census reports all three and
   refuses to pick; the pick belongs to R6 + amendment ledger.
4. **Short-string marker scans produce false friends**: `print:`
   matched "footprint:"/"fingerprint:" comments; `@container` matches
   both TW named-container utilities in markup and real CSS at-rules.
   Every marker in §1 was verified by reading at least one hit site;
   future briefs should demand that step explicitly.
5. **Driver TSV parse bug caught by cross-check**: the r5 script's
   label containing parentheses failed a naive `key: value` regex in
   the throwaway driver, silently zeroing one column; the whole-tree
   receipt (66 bracket tokens) exposed it. Cross-checking per-family
   sums against a whole-tree run is cheap and should stay mandatory.
6. **Infinite-loop hazard in throwaway tooling**: an inline
   `while ((m = /re/g.exec(text)))` re-creates the regex each
   iteration (lastIndex resets) — the union probe hung and was killed;
   the fixed version pre-allocates the regex. No orphans remain
   (`pgrep` clean after kill).
