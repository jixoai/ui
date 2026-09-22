# 26 — REVIEW native-scroll-area (2nd of 2; scribe)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: quill's page, remediated state at `4ae492f4`. Reviewer #1 = vellum (PASS, 2 NITs) — independence law held: my findings were formed from source + probes BEFORE I opened vellum's report. Medium for all live probes (LAW #16): Chromium headless, 1440×1000; reduced-motion variants via `reducedMotion` context emulation.

## Per-claim verdicts (all verified TRUE)

### 1. Observer-consumed theme (the fifth mechanism) — VERIFIED, live without re-mount

- **Source chain**: the family `$effect` (`native-scroll-area.svelte:184-198`) builds the viewport's ancestor chain (self included, viewport first) and observes EVERY node with `attributeFilter: ['class', 'data-theme']`; `apply()` → `scheme = resolveThemeScope(vp) ?? undefined`. Kit core `resolveThemeScope` (`core.ts:206-219`): first-hit walk of `data-theme="dark|light"` → `.dark` → `.jx-light`, **self-inclusive**, `null` when unscoped. The family maps null → `undefined` → **`data-scheme={undefined}` renders no attribute** (the OS fallback). The capability sheet maps `data-scheme` → `color-scheme` (`native-capability.css:52-57`).
- **Live flip (ancestor-class channel)**: marked the light panel's viewport (`__probeMark = 42026`), added `.dark` to its outer root → `data-scheme` light→**dark**, computed `color-scheme: dark`; removed → back to light. **`sameNode: true`, marker survived throughout — the SAME DOM node re-schemes; no re-mount.**
- **Lane-stamp channel**: the `theme="dark"` region's outer root carries `.dark` (the `class:dark` stamp IS a scope in the walk) → viewport `data-scheme="dark"`, `color-scheme: dark`. The light panels resolve the canvas stage's `.jx-light` scope (chain-verified).
- **Bonus receipt — nearest-wins**: adding `.dark` to `<html>` does NOT flip the stage-scoped regions (the nearer `.jx-light` answers first in the walk) — the "nearest theme scope" semantics verified, not just asserted.
- The family's ONE raw css read: `--ring` in `native-scroll-area.css:16` (the focus inset ring); the stylex atom table (48 lines) is all structural, zero theme slots.

### 2. Size through inheritance, declaration-scoped — VERIFIED

Axes canvas pair: `nsa-auto` root **16px** vs `nsa-size-14` root **14px** (the §11 stamp); the demo rows measure **12px in BOTH** panels (the declared `--text-label-lg: 0.75rem` voice wins — `tokens.stylex.ts:149` → `jixoai.css:1408`). Both halves of the declaration law live: the stamp moves the root, inheritance reaches only unstyled flow.

### 3. Composition falsified-then-settled (kit-shaped) — VERIFIED, greps

- `native-capability.css` component-tree consumption: **native-scroll-area.svelte ONLY** (the doc pages take the sheet as `?raw` drawer text; core.ts mentions it in comments).
- `hand-drawn.svelte.ts`: consumed by the styled sibling (`ui/scroll-area/*`), never by the platform sibling.
- `scroll-area-kit/core`: imported by BOTH siblings — the shared kernel.
- **button-group hypothesis FALSE**: zero import edges in either direction between button-group and scroll-area-kit/native-scroll-area; the kit header names button-group under scroll-run as "a DIFFERENT shared system… the two systems must not absorb each other" (`core.ts:16-21`), carrying its own attributed copy of the verdict shape.

### 4. LAW #14 (motion) — VERIFIED, with a scope characterization

- Source: the reduced-motion block forces `scroll-behavior: auto` (`native-capability.css:64-70`); **zero `transition` declarations** in the family css, capability sheet, and stylex (grep ×3 = 0); `scrollTo()` is a thin passthrough (`native-scroll-area.svelte:150`).
- Live discriminator: with a smooth class declared on a viewport, computed is **smooth in BOTH media** (a 0,1,0 class beats the zero-specificity `:where` rule even under reduce), and `scroll-behavior` being non-inherited means an html-level smooth never leaks. The rule keeps the sheet's OWN guarantee static — exactly what its comment says ("the sheet merely keeps its guarantees static"). The observable under reduce is `auto`; the "forces" is real within the sheet's own tier. [INFO filed below.]

### 5. a11y — VERIFIED

Live DOM: **0** `[role="scrollbar"]`; **12/12** viewports carry `role="region"` + non-empty `aria-label` + `tabindex="0"` (the WAI scrollable-region pattern). The SSR `role="scrollbar"` string is the a11y table's own documentation row (value "ABSENT"), not a mounted attribute.

### 6. Hand table 9 authored / 17 served — VERIFIED, not drift

Authored hand table = **9 rows** (orientation, scrollbarWidth, label, class, style, onscroll, children*, getViewport(), scrollTo()). The bare `universal` directive (`:540`) folds the 8 shared axis rows beneath — served **17 prop rows across TWO tables** (the fold renders its own table+header; raw `<tr>` byte-counts read 19 with the two headers). Live: `#api` = 2 tables, 17 rows, scrollTo() present. The page's own comment (`:525-530`) documents the fold — the authored-vs-served distinction is on the page; **NOT drift**.

### 7. Incident disclosure — VERIFIED truthful

The comment names the theming-fold surgery that ate the API section + hand universal table, dropped `data-jx-props-table-universal`, and redded docs-universal 109/110. Verified against four records: (a) the comment text; (b) the integration commit `4ae492f4` ("the universal table restored (9 rows; the original missed scrollTo())… the LAST-WRITE write-then-verify incident archived with both gate runs"); (c) served SSR: marker present ×1, 17 rows incl. scrollTo(); (d) **my own gate run: docs-universal GREEN 110/110, exit 0**. The disclosure reads truthfully.

## NIT dispositions (vellum's two, cross-checked)

- **NIT 1 (9-vs-17)**: confirmed exact — 9 authored + 8 folded = 17 served prop rows; page comment pre-documents it. No action.
- **NIT 2 (--ring "the one read")**: confirmed family-css-precise; the capability sheet is var()-free (read in full — zero `var(--`), and the GLOBAL scrollbar token law paints the bar (`jixoai.css:192-194` — currentColor color-mix steps for thumb/hover/active; `:694-698` the global thin + scrollbar-color paint). Same observation, no change — co-signed.

## Findings (severity-tagged)

1. **[INFO · scope precision]** The reduced-motion `scroll-behavior: auto` rule holds the sheet's own tier (observable auto under reduce; zero transitions carry the real reduced-motion story); it does not override consumer-level declarations (a class wins in both media) and needs no help from inheritance (non-inherited property). Matches the rule's own comment — no action; recorded so future probes don't credit the rule with more reach than it has.
2. **[NOTE · structure]** The served 17 renders as TWO tables (the fold's own header row is why raw `<tr>` counts read 19). Counting prop rows, not `<tr>` bytes, keeps receipts comparable.
3. **[NONE]** otherwise — no MAJOR, no MINOR. Every dispatch claim re-derived TRUE from source + raw SSR bytes + live computed probes; vellum's two NITs co-signed after independent re-derivation.

## Gates

| Gate | Result |
|---|---|
| scroll-area-kit + scroll-area-family solos | **45/45 green** |
| docs-structure + props-table-meta-drift + hover-stability | **48/48 green** (vellum's 93/93 = 45+48, reconciled) |
| docs-ambient-vocabulary | **284/284 GREEN** — the 3 navigation-menu-keyed failures vellum saw are gone (quill's in-flight edits landed between the runs; nothing sibling-red remains) |
| docs-universal | **GREEN 110/110, exit 0** (my own run — the incident gate) |
| h1 / toc / anchors | h1 ×1; toc == DOM |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); dev server started in a background wrapper; killed by PID after each probe cycle → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Working-tree writes: this report + experience.md only (review-only task — zero product-tree edits).
- Sibling in-flight files (`navigation-menu.html/*`, `canvas-same-source.spec.ts`) untouched.
- Artifacts: `/tmp/scribe-26-probe{1,2,3}.mjs`, `/tmp/scribe-26-ssr.html`, `/tmp/scribe-26-universal.log`, `/tmp/scribe-26-dev.log`.

## Verdict

**PASS** — native-scroll-area (2nd of 2). The observer-consumed exemplar holds: the fifth theme mechanism is live-measured with node-identity proof, the size story teaches both halves truthfully, the kit boundary is grep-clean, the a11y posture is probe-asserted, and the incident disclosure is truthful against commit, SSR, and a green gate.
