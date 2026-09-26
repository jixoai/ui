# TASK 30 — REVIEW navigation-menu (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (2nd reviewer; 1st = scribe — independence law held: all findings below were derived from source + my own probes BEFORE reading scribe's `27-review-navigation-menu.md` and quill's `22-navigation-menu.md`)
- **Target**: quill's page integrated at `4cfde004` — `navigation-menu.html/+page.svelte` (658 lines) + `+page.ts` + the ambient matrix re-pin
- **Method**: source reads (family svelte/stylex/indicator + popover.css), live computed probes on real OPEN menus (LAW #14: the popover's motion kernel measured 0.46s; every read taken 700ms+ past open), co-resident theme islands, viewport-fresh query loads, SSR raw-byte parse (1,147,630 bytes), the menu-family + ambient solos, docs-universal, fleet svelte-check grepped to the page
- **VERDICT: PASS** — all five dispatched claims verified TRUE on real open menus; findings: 1 LOW co-signed (the a11y table's tabindex receipt does not reproduce — scribe's finding, my measurement independently confirms), 1 LOW mine (missing `#install`/`#see-also` anchors — the recurring fleet class). Both ride consolidation; no re-review needed.

## The five dispatched claims — verified TRUE

1. **Consumption one promotion away — VERIFIED.** Source: the nav root ALWAYS stamps `--jx-radius-consumed` (navigation-menu.svelte:226-227 — explicit `calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))` when a lane resolves, else the §3 concentric form verbatim); `.jx-pop`'s border-radius reads exactly that var with the same auto fallback (popover.css:43-47) + `corner-shape: var(--jx-shape-effective, round)`. Measured on real open menus: root style attrs carry the forms (ambient: the concentric calc verbatim; radius bar: `--jx-radius-effective: var(--jx-radius-large)` + the explicit form); the OPEN popover computes **0px ambient → 10px radius="large"**. `:popover-open` true, DOM parent unmoved (the promotion moves paint, never DOM). LAW #14 honored: the popover's motion kernel computes **0.46s** transitions — every read taken 700ms+ past open.
2. **Theme split through the red herring — VERIFIED (clean signal only).** Medium: co-resident specimens, idle neutral tokens, no hue reads (quill's wall-clock warning honored). PANEL FLIPS: the open dark panel's raw `--popover` computes **oklch(1 0 0) → oklch(0.3211 0 0)** and `--popover-foreground` **0 0 0 → 1 0 0** under the scoped `.dark` (the promotion keeps DOM inheritance). BAR INK FREEZES: idle trigger color **oklch(0.3211 0 0) in BOTH scopes** (typed aliases computed at :root) while the raw underneath flips — my `--foreground` read: **0 0 0 → 1 0 0**; the dispatch's `0.3211 → 0.8452` pair is the `--muted-foreground` voice (scribe's receipt) — different raw token, same flip class. The `.dark` bridge lands on the root (class-verified) — nothing reads it in the bar's atoms.
3. **Density declaration-scope freeze — VERIFIED.** `density={1.5}` (nsm-coef): root `data-density` **absent**, carrier **`--jx-density-coefficient: 1.5`** stamped verbatim, link entries hold **40px / 13px**. Rung contrast measured: ambient trigger **40px / 13px / pad 0×12px, no attribute** vs `density="sm"` **32px / 12px / pad 0×8px with data-density="sm"** on the root — the declaration-scope freeze (a bare coefficient re-rungs nothing; the rung attribute IS the scope).
4. **Size supply-only for entries — VERIFIED.** `size={14}` root computes **14px** with the §11 stamp verbatim (`--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)`); the bar link holds **13px / 40px** — the kernel type voice beats inheritance by declaration.
5. **Indicator pins — VERIFIED with one receipt correction (finding 1).** `view-transition-name: jx-nav-indicator` stamped inline under motion="navigation" (computed reads back the name); the waapi bar carries **no such element/name** (searched all descendants — none). `aria-hidden="true"` ✓. **Hug-box == entry box: 145 vs 144.91 (device-px quantization of the same box), heights 40 == 40, `transform: translate(0px, 0px)`** — hug inset own 0. **Roving trim**: fresh load — exactly ONE tab stop in the main bar, the BUTTON "components" (tabindex="0", the current-section trigger), the registry trigger at tabindex="-1".

## The spine + the hand table — VERIFIED

- **Duplication contract**: served in the hero/Overview/Usage ("Duplicated deliberately… no hidden coupling" — confirmed in the raw SSR). Greps: zero component-tree imports between the three menu roots (navigation-menu / menubar / dropdown-menu); the only cross-family coupling is fleet-law level (density-adoption-menus' honest-opinion law, whose spec is among the greens). The family's module registry (the duplicate-registration guard, navigation-menu.svelte:267 "first registration wins") is the deliberate identity law, not coupling.
- **Hand universal table**: exactly **13 authored rows** (label, density, variant, inset, size, shape, radius, color, theme, elevation, motion, class/style, children) — the 110-gate marker seat. Served expansion (axis rows folding into the shared universal section) is the directive mechanism, not drift.
- **SSR**: 1,147,630 bytes; toc 7/7 present, **order == DOM**; h1 = 1; 7 tables / 148 cells / **0 empty**.

## Findings (severity-tagged)

1. **[LOW · co-signs scribe finding 1 — receipt does not reproduce]** The a11y table (`+page.svelte:496`) states `indicator — "aria-hidden + tabindex -1 … (probe-asserted)"`; the DOM carries `aria-hidden="true"` but **no tabindex attribute at all** (my probe: `getAttribute('tabindex')` → null; source markup has none). The INTENT holds — a bare span is not focusable, no tab stop, no semantics — but a probe-asserted receipt must reproduce. Fix: add `tabindex="-1"` to the indicator span (makes all three records true) or reword the row to "aria-hidden; not focusable (plain span)". My measurement was taken independently before the cross-read — the same null.
2. **[LOW · fleet consistency — my addition; not in scribe's report]** The Install and See-Also wrappers carry **no id anchors** (`:303`/`:637` bare `<div data-reveal="">` wrappers) — the recurring class (code-card, link, carousel, navigation-menu; badge-indicator ships the ids). Two attributes; rides consolidation.
3. **[NOTE · counting rule reconciled]** 13 = the authored source-array count; served, the api section shows more rows across tables because the `universal` directive folds the axis-named rows into the shared section (scribe's NOTE 2 — same reconciliation, both counters agree on 13 authored).
4. **[INFO · gate coverage]** My menu-family solo set ran 5 files (**31/31** — indicator, density-adoption-menus, defaults-nav-clean, defaults-nav-providers, popover-gap); scribe's ran 6 (**60/60**, adding nav-filter + docs-nav-filter). Combined coverage is complete; nothing keyed to navigation-menu failed in either.

## Gates (this review)

| Gate | Result |
|---|---|
| Menu-family solos (5 files) | **31/31, exit 0** |
| docs-ambient-vocabulary solo | **284/284, exit 0** (the re-pin holds under my own run) |
| verify:docs-universal | exit 0 — GREEN 110/110 |
| svelte-check (fleet) | navigation-menu page **0 diagnostics** |
| Raw SSR | 1,147,630 bytes; toc 7/7 order==DOM; h1 = 1; 0 empty cells / 148; the duplication spine served |
| Live probes | radius 0px → 10px on open panels (0.46s kernel awaited, DOM unmoved); panel token flip 1 0 0 → 0.3211 0 0 under the island; bar ink frozen 0.3211 both scopes; coef 1.5 carrier-only 40/13; rungs 40/13/12 vs 32/12/8; size echo 14px root / 13px entries; indicator vtn + hug 145==145 + roving trim |

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my wrapper → vite; killed by PID at session end → **EMPTY after** (rc=1); background exit 143 = my SIGTERM.
- **NO commits, NO pushes, zero product-tree edits** (review-only; writes are this report + experience.md). vellum's ghostty-term in-flight files untouched; no ghostty-keyed noise encountered in my gates.
- Independence: my probes and findings were complete before reading scribe's 27 and quill's 22; the cross-read found zero conflicts — scribe's LOW is independently confirmed by my own measured `tabindex: null`, and the surface-element vs pop-token reads (0.96→0.185 vs 1 0 0→0.3211) are complementary layers of the same flip.
- Artifacts: probes `/tmp/marginalia-30-probe{1,2,3}.mjs`; SSR `/tmp/marginalia-30-ssr.html`; gate logs `/tmp/marginalia-30-{menuspecs,ambient,universal,scheck,dev}.log`.
- Probe craft banked: `:top-layer *` is not a valid selector (the pseudo-class has no universal form — match the element instead); read helpers live inside `page.evaluate`; popover receipts await the computed transitionDuration before reading.
