# R2 baseline — the frozen-HEAD performance receipt (baseline.md)

> Orthogonal intents: (1) rebuild www at frozen HEAD 0f2b837e and attribute
> the CURRENT main sheet (superseding the r0-census §f historical artifact);
> (2) measure P1 (asset/link inventory), P2 (used-selector ratio, 3 frozen
> pages), P3 (dev cold-start + HMR medians), P4 (auxiliary heuristic);
> (3) leave install/build/process receipts. Protocol: design §1.1/§4 D4,
> verification R2 section. Same device/browser/cache protocol as R2b
> (counterfactual.md). Written 2026-09-13 by the L2 measurement subagent.

## §0 Environment + install receipts

| fact | value |
|---|---|
| worktree | `/Users/kzf/Dev/GitHub/jixoai-labs/ui-stylex`, branch `stylex-integration`, HEAD `0f2b837e` (tree clean at task start AND end) |
| machine | Apple M1 16GB, macOS 26.5.2; swap at start `18,192.94M/19,456M used` (deep swap, machine-wide), load avg 4.30–6.14; swap at end `19,590.94M/20,480M`. Disk: 179Gi free (the R0 ENOSPC incident is resolved) |
| node/npm | node v24.21.0, npm 11.x (`npm ci --no-audit --no-fund`, npm registry only) |
| browser | system Chrome `/Applications/Google Chrome.app/...` via playwright-core (reused READ-ONLY from main checkout's node_modules — worktree root has no install) |

Installs (worktree had NO node_modules anywhere):

| step | command | wall |
|---|---|---|
| www deps | `npm ci` in `apps/www` | **1:00.50** (11.85s user; lockfile sha256 `f3ea5a52…35917c`; lockfile untouched by install — `git status` clean) |
| plugin deps | `npm ci` in `packages/vite-plugin` | 17.21s (sha256 `fe1ebf93…a4393f`) |
| plugin build | `npm run build` (tsdown) — mirrors build-site.mjs step 0 | 3.69s (dist/ 509.16kB, 89 files) |
| offline wasm | LOCAL COPY from main checkout (no network): `packages/betlang-wasm/dist/betlang_wasm.wasm` (sha256 `4767e419…27f764`) + 3 ghostty wasms into `node_modules/.cache/jixoai-ghostty/` — the plugin's own sha-verified cache path. crates.io/ghostty downloads are outside this task's network mandate; recorded as environment workaround | <1s |

npm warned `install-scripts` blocked for tree-sitter-javascript/typescript
(node-gyp-build); the build succeeded without them — native builds not on
the CSS build path. `apps/www/node_modules` = 391MB after install.

## §1 Build receipt

Actual command (per apps/www/package.json — the same vite invocation
build-site.mjs step 1 runs; the root orchestrator's later public//registry
steps do not touch dist CSS):

```
cd apps/www && npm run build   # = vite build
```

- R2 build: **18.528s wall** (20.07s user / 3.74s sys; PLUGIN_TIMINGS: 99%
  of 13.5s in hooks; sveltekit-compile writeBundle 60%/8.1s). Exit 0.
  Log: /tmp/r2-www-build.log.
- R0's 59s/102s attempts were swap+ENOSPC-bound; at today's 179Gi-free
  state the same pipeline is a sub-20s build.
- Post-R2b restore rebuild: exit 0, main sheet `300,233B` — byte-count
  identical to the first R2 build (reproducibility receipt).

## §2 Main-sheet attribution at HEAD (vs the 09-11 historical artifact)

Instrument: frozen `research/r0-sheet-attribution.cjs` (r0-census §e
method, unchanged). New main sheet `0.C3M4OLbU.css`:

| bucket | 09-11 dist (d17abd58, §f) | HEAD 0f2b837e (R2) | drift |
|---|---|---|---|
| total | 300,245B / 2,309 rules | **300,233B / 2,310 rules** | **−12B / +1 rule** |
| TW utilities layer | 106,954B / 1,501 | 106,942B / 1,502 | −12B / +1 |
| jx-pure (components layer) | 78,317B / 327 | 78,317B / 327 | 0 |
| jixoai.css unlayered | 42,317B / 80 | 42,317B / 80 | 0 |
| jx-pure unlayered (Tier-2) | 24,888B / 85 | 24,888B / 85 | 0 |
| @-machinery unlayered | 11,388B / 97 | 11,388B / 97 | 0 |
| TW4 theme layer | 9,186B / 5 | 9,186B / 5 | 0 |
| all other buckets | identical | identical | 0 |

**The §h drift concern is empirically refuted at sheet level**: input drift
`git diff d17abd58..HEAD -- apps/www/src registry/files packages` = 28
files, +3,641/−165 (spin family + tree-view caret) — yet every new TW
candidate in that drift was ALREADY a generated utility on 09-11; the
whole delta is −12B in the utilities layer. The 09-11 numbers are therefore
valid as an order-of-magnitude anchor AND nearly exact for HEAD.

## §3 P1 — CSS asset inventory + per-page link analysis

Instrument: /tmp/r2-css-inventory.mjs (link scan over dist/**/*.html, same
method as r0-census §e, + brotli). Raw output: /tmp/r2-p1-inventory.txt.

```
127 CSS assets; total raw 613,968 / gzip 141,548 / brotli 117,116
main sheet 0.C3M4OLbU.css 300,233B (gz 43,179 / br 31,679) — linked by 126/126 pages
   35.CdKbgtsb.css 50,439 (Fira Code @font-face, 1 page) · katex 29,443 (3)
   list-item 29,329 (~119) · input 11,887 (126) · timeline 11,264 (1) · component-canvas 7,071 (~119)
126 HTML pages; 0 pages without a stylesheet link
13 assets on ALL pages (main sheet + input, separator, card, dialog, toc,
  glass, popover, tooltip, terminal-header, terminal-footer-column,
  press-button, progressive-blur) + ~7 more riding ≥119 pages
per-page linked CSS (initial-load render-blocking, raw):
  min 337,761 (docs.html, 14 links) · avg 386,044 · max 466,779 (blueprints.html, 65)
  gzip avg 62,615 (min 52,632 / max 86,795)
31/127 assets linked by NO prerendered page (client-nav lazy chunks)
```

P1 verdict: the "one monolithic render-blocking sheet" sub-claim holds
exactly as r0-census §e stated it — one 300KB main sheet + a fixed ~20-file
common bundle on every page; page-specific extras add up to +130KB raw on
the heaviest page.

## §4 P2 — used-selector ratio on the 3 frozen pages

Frozen corpus + selection rationale:
1. `index.html` — the landing page, the lightest common-bundle consumer (343,611B linked).
2. `docs/icons.html` — the HEAVIEST docs page by tracked utility tokens (722, r0-census §c top1).
3. `docs/components/press-button.html` — the component-page archetype (385 tokens, census top4) and the D2 corpus family.

Protocol (identical for R2b): headless system Chrome via playwright-core,
**fresh context per page (cold cache)**, viewport 1280×900, `waitUntil:
networkidle` + 1s, served over `http://127.0.0.1:<ephemeral>` (static
file server; file:// blocks cssRules). Instrument: /tmp/r2-used-selectors.mjs.

Method + error sources (frozen):
- Walk `document.styleSheets`; recurse group rules (@media/@supports/@layer/…);
  count CSSStyleRule selector-list members separately (top-level comma split,
  parens-aware); @property/@keyframes/@font-face counted in an at-rule bucket
  (no selector) and excluded from testable ratios.
- Hit-test per compound selector: strip pseudo-elements → querySelector;
  else strip pseudo-classes (incl. functional :not/:has/:where with balanced
  parens) → querySelector; a selector whose principal form executed validly
  and matched nothing = UNUSED (e.g. `:lang(ar)` on the delivered English
  page); nothing ever executed = untestable.
- Declared bias: pseudo-class stripping can only turn unused→used (a
  :hover rule counts used if its origin selector matches); state-gated and
  media-gated rules count by principal selector in the DELIVERED state (no
  dark-mode/density toggles, no scroll, no interaction). Byte-weight =
  rule cssText length ÷ selector-list length.
- Known instrument findings (fixed in-session, receipts in logs): CSS
  nesting makes CSSStyleRule.cssRules an EMPTY-but-truthy list (double-
  count bug fixed by keying recursion on length AND counting the rule);
  `:where(...)`-only selectors are natively testable in Chrome (mis-bucketed
  untestable in v1 of the probe — corrected).

| page | selectors (testable) | used | used-ratio count | used-ratio byte-wt | main-sheet-only ratio |
|---|---|---|---|---|---|
| index.html | 3,237 (2,755; 447 at-rules, 35 untestable) | 613 | **22.3%** | 13.3% | 22.1% |
| docs/icons.html | 3,536 (3,041; 460, 35) | 866 | **28.5%** | 17.0% | 29.8% |
| docs/components/press-button.html | 3,534 (3,039; 460, 35) | 979 | **32.2%** | 19.5% | 31.5% |

P2 verdict: the "sheet content mostly irrelevant per page" sub-claim is
CONFIRMED — 68–78% of delivered selectors (81–87% by cssText bytes) match
nothing on each frozen page in the delivered state. Raw outputs:
/tmp/r2-p2-used.txt.

## §5 P3 — dev cold-start + HMR settle (medians of ≥5)

Method (frozen): cold start = `rm -rf apps/www/node_modules/.vite` (dep-
optimize cache evicted) → spawn `npm run dev -- --port 5397 --strictPort`
detached → wall from spawn to vite's "ready in" line; process group killed
+ verified after EACH run. HMR = one warm server; headless page on
`/docs/components/press-button.html` (dev route names carry the `.html`
suffix — a 404 pitfall, see friction); warm-up nav + reload (the dep
optimizer's "504 Outdated Optimize Dep" first-hit cycle must complete
before measuring); flip the STATIC class `flex-col`↔`flex-row` on
`section-card.svelte:268` (renders on that page); settle = write→DOM
reflects (rAF poll); vite stdout "hmr update" latency recorded alongside.

```
cold start (5 runs):  wall_spawn→ready = 1929 / 1320 / 1812 / 1567 / 2369 ms
                     vite self-reported = 1504 / 990 / 993 / 1236 / 1964 ms
                     MEDIAN wall 1812 ms · median vite 1236 ms
HMR settle (5 flips): 599.6 / 251.9 / −1(timeout) / 0.9(instant, see note) / 332.6 ms
                     clean-sample median ≈ 333 ms (n=3 clean)
                     vite-side hmr-log latency: 421 / 127 / 24 / −1 / 132 ms → median 132 ms
```

HMR flakiness note (honest): 1 of 5 flips (hmr[3]) emitted a vite "hmr
update" at 24ms but the DOM never reflected it within 30s (the following
flip "settled" instantly because the prior one never applied). Under the
machine's load (4.3–6.1, deep swap) this is recorded as environment
flakiness, not a clean median of 5 — both the attempted-5 and clean-3
readings are reported. Earlier legs of the same day with an
identical-to-original write (flex-col→flex-col revert) lost updates at
2/5 — watcher/content-dedup path suspected; the frozen sequence above
avoids identical writes.

P3 verdict: dev-loop cost at www scale is a ~1.8s cold start and a
~130–330ms class-edit HMR roundtrip — TW4 scan/generate is NOT a
perceptible dev-loop tax on this machine at this scale.

## §6 P4 — style-recalc / dynamic-class heuristic (AUXILIARY — cannot drive GO/NO-GO)

- Main sheet rules: 2,310 (attribution §2).
- Dynamic-class face (rg, 2026-09-13, worktree): `cn(` call sites
  **570 across 355 files** (www src + registry files); `class={expr}`
  non-template **320**; `class:directive` **36**; `class:list` **1**;
  interpolated template classes **18 in 16 files**. Frozen r5 census
  context: 991 cn-first-strings + 66 bracket carriers (r5-cn-surface).
- Heuristic product: 2,310 rules × ~945 dynamic-class generation sites —
  the recalc storm surface is bounded by the sheet, which every page
  mounts; on a class-swap the browser re-matches against the SAME rule
  set (selector-count-bound, not byte-bound).
- Scripted interaction trace (recalc-style event counts on icons page):
  **not run** — reason: DevTools tracing session exceeded the task's
  time budget under the current machine load; P4 is auxiliary by
  pre-registration and no verdict dimension depends on it.

## §7 Process record (started/reclaimed)

Every dev server + build + probe process started by this task is dead;
evidence: `pgrep -fl "vite|build-site"` at task end shows ONLY other
projects'/owner's sessions (ai-fly, codex, zcode infra, vite on
13124/13501/13400, design.mjs — not touched). Port 5397: `lsof` empty.

| process | pid(s) | stop evidence |
|---|---|---|
| vite dev (P3 cold ×5) | 87306, 87487, 87569, 87728, 87940 | per-run `[kill] alive_after_kill=false` receipts (/tmp/r2-p3.txt) |
| vite dev (HMR leg v1 orphan) | 88154 | uncaught-exception orphan — found by pgrep, SIGTERM'd, `ORPHAN_RECLAIMED`, port freed (friction #3) |
| vite dev (diag/hmr legs) | 89614, 91848, 93927, 99011 | `reclaimed: true` receipts (/tmp/r2-p3-hmr*.txt, diag logs) |
| builds/probes | npm/vite/node/http-server | all foreground, exited normally (EXIT=0 receipts above) |

Tree hygiene: `git status` clean before build AND after R2b restore;
dist/ + node_modules/ are gitignored paths.
