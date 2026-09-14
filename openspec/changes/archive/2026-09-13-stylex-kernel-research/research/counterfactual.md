# R2b — the TW4 in-place counterfactual BUILD (counterfactual.md)

> Orthogonal intents: (1) BUILD the null hypothesis — docs-route utility
> generation split into a docs-only sheet, non-docs pages stop carrying it
> (design §1.1 R2b: "route-family sheet via TW4 multiple-entry CSS");
> (2) re-measure P1/P2 under the IDENTICAL frozen protocol (same corpus,
> device, browser, cold-cache contexts, same instruments as R2);
> (3) answer the D4 question: what share of the engine-swap's claimed
> benefit does the in-place split recover? Variant is TEMPORARY — applied,
> measured, reverted (`git checkout --`), diff recorded below. Written
> 2026-09-13 by the L2 measurement subagent. Baseline: research/baseline.md.

## §1 The variant (diff-attached, 41 lines + 1 new file)

Mechanism (TW4): the shared entry `apps/www/src/app.css` keeps
`@import 'tailwindcss'` but adds `@source not './routes/docs'` +
`@source not './routes/docs.html'` (scan exclusion); a NEW utilities-only
entry `apps/www/src/docs.css`:

```css
@import 'tailwindcss/utilities' source(none);
@source './routes/docs';
@source './routes/docs.html';
/* + compile-context copies: @custom-variant dark, the @theme inline
   token→utility mapping (jixoai.css:782-833), the app.css radius
   supplement, and the 8 @utility rules (jx-hue-*/jx-pair-*,
   jixoai.css:1084-1093) — generation context, not shipped duplication */
```

wired ONLY into `routes/docs/+layout.svelte` and
`routes/docs.html/+page.svelte` (the two docs-family entry points).
Installed TW = 4.3.3 (lockfile) — `@source not` supported. Full diff:
/tmp/r2b-variant.diff (4 files: app.css +4, docs/+layout.svelte +2,
docs.html/+page.svelte +2, docs.css new 46 lines).

Build: exit 0, **16.06s** (R2 was 18.53s — same range, noise).

```
R2 (HEAD)                        R2b (variant)
main 0.C3M4OLbU.css 300,233B     main 0.DBte-LKL.css 288,806B (−11,427)
  utilities layer 106,942/1502     utilities layer  95,869/1351 (−11,073/−151)
  all other buckets identical      all other buckets identical
127 assets                       127 + docs.CKZtPWI7.css 28,977B (gz 5,586)
```

docs sheet composition (attribution + selector histogram): 16,209B
utilities (291 rules, UNLAYERED — see §4) + 9,115B @property/@keyframes
machinery (89 rules) + 2,011B emitted theme vars (26) + 1,529B properties
layer + 67B whitespace.

## §2 Docs-only link assertion (the split's core contract)

All 126 prerendered pages checked programmatically:

```
pages=126 docsPages=119 violations=0
  119/119 docs pages (docs/** + docs.html) link BOTH main + docs sheet
    7/  7 non-docs pages (index, blueprints, patterns, parity, tokens,
      probe-folder-css, prototypes/404 shell) link ONLY the main sheet
```

## §3 Same-protocol P1/P2 — R2 vs R2b

P1 (per-page initial-load render-blocking bytes):

| page | R2 raw (gzip) | R2b raw (gzip) | Δ raw |
|---|---|---|---|
| index.html (non-docs) | 343,611 (54,548) | 332,184 (52,789) | **−11,427 (−3.3%)** |
| docs/icons.html (docs) | 380,855 (61,064) | 398,405 (64,891) | **+17,550 (+4.6%)** |
| docs/components/press-button.html (docs) | 380,555 (60,843) | 398,105 (64,670) | **+17,550 (+4.6%)** |
| site-wide avg (126 pages) | 386,044 (62,615) | 401,984 (66,132) | **+15,940 (+4.1%)** |

P2 (identical instrument/protocol; used-selector ratio, count of testable):

| page | R2 | R2b | reading |
|---|---|---|---|
| index.html | 22.3% (main 22.1%) | **23.9%** (main 23.9%) | same used count (613) over a smaller sheet |
| docs/icons.html | 28.5% (main 29.8%) | **30.6%** (main 32.0% + docs sheet 34.3%) | two-sheet union barely concentrates |
| press-button.html | 32.2% (main 31.5%) | **34.0%** (main 33.8% + docs sheet 32.7%) | the docs sheet ITSELF is only ~1/3 used per docs page |

Raw outputs: /tmp/r2b-p1.txt, /tmp/r2b-p2-used.txt.

## §4 Mechanism findings (why the recovery is small)

```
WHERE THE 106.9KB UTILITIES LIVE (R2, by scan family):
┌──────────────────────────────────────────────────────────────┐
│ docs-ONLY tokens (moved to docs sheet)      11.1KB / 151 rul │ ← the only movable slice
│ shared tokens (docs ∩ lib/non-docs)          ~5.1KB re-gen'd │ ← duplicated in BOTH sheets
│ non-docs tokens (lib components + pages)    ~90.8KB          │ ← stays, every page still needs
└──────────────────────────────────────────────────────────────┘
PER-ENTRY FIXED COST of a second TW4 CSS entry: ≈12.6KB raw
  (machinery 9.1 + theme-var emission 2.0 + properties layer 1.5)
  — k-way splits multiply this; it is why docs pages NET-REGRESS
CASCADE: the utilities-only entry emits its rules UNLAYERED (no
  @layer utilities wrapper) — on docs pages they load after the main
  sheet, so they outrank every layered rule and tie-break jixoai.css's
  own unlayered token rules by document order. Equivalent to
  utilities-last in practice, but a D2-style cascade probe would need
  to re-pin this for any production adoption.
```

## §5 The D4 answer — recovery share of the claimed benefit

The engine swap's P1/P2-anchored claim = per-page critical CSS shrinks
toward what the page USES. R2 measured the headroom: 68–78% of delivered
selectors (81–87% by bytes) are unused per page. The in-place split
recovered:

- non-docs pages: 11,427B of ~298KB byte-weighted-irrelevant CSS on
  index = **~3.8% of the measured waste** (−3.3% of page bytes);
- docs pages: **NEGATIVE (−17.6KB, +4.6%)** — and 119/126 pages are docs
  pages, so the site-wide average REGRESSES +4.1%;
- the docs-only sheet itself still runs ~66–67% unused per docs page
  (route-FAMILY granularity ≠ route granularity).

**Verdict: the TW4 in-place route-family split recovers ≈4% of the
per-page-irrelevance the StyleX swap claims to eliminate, and regresses
the page family that dominates this site.** The irrelevance is not a
docs/non-docs artifact — it is the union-of-all-sources utility sheet
PLUS the genuinely shared kernel sheets (jx-pure 103.2KB + jixoai tokens
43.6KB = 49% of the main sheet, used by every page's components). Only
per-component extraction (the atomic model StyleX brings) attacks the
remaining ~96%; splitting finer in TW4 pays the ~12.6KB per-entry fixed
cost each time and un-layers the cascade. D4 scores this honestly: the
counterfactual column CANNOT reach the claim; the null hypothesis does
not close the gap.

## §6 Friction feedback (mandatory)

1. **`@source not` + utilities-only entry is under-documented territory**:
   no doc states that `tailwindcss/utilities` emits UNLAYERED rules or
   that a second entry re-emits ~2KB of used theme vars + 9.1KB of
   @property machinery; both were discovered by attribution of the built
   sheet. Any production adoption needs the cascade re-pinned (D2-style).
2. **Compile-context duplication is unavoidable in this mechanism**:
   the docs entry needs its own copy of @theme inline + @utility defs
   (source-level duplication, drift-prone). A cleaner TW4-native split
   would need TW to share theme context across entries — it cannot.
3. **The .html-suffixed route dirs**: dev URLs are
   `/docs/components/press-button.html` (the suffix is part of the route
   dir name); my first two HMR legs probed the suffixless URL and
   measured a 404 fallback page (anchor null). Dist probes were
   unaffected (file names). Cost: two instrument legs.
4. **The dev-optimizer 504 cycle**: after EVERY cold start, the first
   page load triggers "504 Outdated Optimize Dep" + a forced reload;
   probes must warm up + reload before measuring (frozen into the
   instrument).
5. **HMR measurement flakiness under load** (see baseline §5): 1/5 lost
   DOM updates with vite-side update logged; identical-to-original
   writes lose updates at 2/5 (content-dedup suspected). A production-
   grade HMR harness needs per-iteration UNIQUE writes + a DOM-side
   timeout taxonomy, not just vite log latency.
6. **playwright-core reuse across checkouts**: the probe imports
   playwright-core from the MAIN checkout's node_modules (read-only) —
   zero-install probing; worth institutionalizing for subagent probes
   instead of per-worktree installs.

## §7 Process + hygiene record

- Variant reverted: `git checkout --` on the 3 modified files +
  `rm docs.css`; `git status` clean; baseline rebuilt (main sheet
  300,233B, byte-count identical to R2 — the restore is complete).
- No processes from this task survive (same sweep evidence as
  baseline §7); port 5397 free; only apps/www + the new docs.css were
  touched; openspec/ and spike/ untouched; no git commit made.

## Appendix — verbatim variant diff (git diff @ R2b, + docs.css in full)

```diff
diff --git a/apps/www/src/app.css b/apps/www/src/app.css
@@ -22,3 +22,7 @@
 @import 'tailwindcss';
+/* R2b COUNTERFACTUAL (temporary): docs-route sources excluded here —
+ * their utilities are generated in the docs-only entry src/docs.css */
+@source not './routes/docs';
+@source not './routes/docs.html';
 @import './lib/jixoai.css';
diff --git a/apps/www/src/routes/docs/+layout.svelte b/apps/www/src/routes/docs/+layout.svelte
@@ <script lang="ts">
+  // R2b counterfactual: docs-family utility sheet
+  import '../../docs.css';
   import { page } from '$app/state';
diff --git a/apps/www/src/routes/docs.html/+page.svelte b/apps/www/src/routes/docs.html/+page.svelte
@@ <script lang="ts">
+  // R2b counterfactual: docs-family utility sheet
+  import '../../docs.css';
   import { page } from '$app/state';
```

New file `apps/www/src/docs.css` (46 lines): header comment +
`@import 'tailwindcss/utilities' source(none);` + `@source './routes/docs';`
+ `@source './routes/docs.html';` + verbatim copies of jixoai.css:782-833
(`@custom-variant dark` + `@theme inline` mapping), the app.css radius
supplement (`--radius-*: initial; --radius: var(--radius);`), and
jixoai.css:1084-1093 (8 `@utility jx-hue-*/jx-pair-*` rules).
