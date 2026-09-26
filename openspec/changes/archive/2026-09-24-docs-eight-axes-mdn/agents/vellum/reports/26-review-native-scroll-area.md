# TASK 26 — REVIEW native-scroll-area (1st of 2; reviewer #1 vellum)

Page: quill's, integrated at 4ae492f4 (post-remediation). Reviewer #2 is
scribe (independence law). All seven claims under review were re-derived from
source AND the served DOM. Verdict: **PASS** — zero blocking findings; two
documentation-precision NITs, neither blocking.

## Claim-by-claim verification

**1. The observer-consumed theme mechanism (the fifth) — VERIFIED, source +
live.** Source chain: the family's `$effect` (native-scroll-area.svelte:184)
builds the viewport's ancestor chain and observes every node with
`attributeFilter: ['class', 'data-theme']`; `apply()` resolves through the
kit core's `resolveThemeScope` (core.ts:217 — self-included walk:
`data-theme="dark|light"` → `.dark` → `.jx-light`, first hit; `null` =
unscoped → NO data-scheme attribute, the OS fallback). The capability sheet
maps `data-scheme` → `color-scheme` (native-capability.css:52-57). The lane's
`theme="dark"` stamp is `class:dark` on the OUTER root (svelte:212) — a scope
in the walk. LIVE (named medium: `data-scheme` attribute +
`getComputedStyle().colorScheme` on the light panel's viewport):
`light/light` → add `.dark` to an ancestor → `dark/dark` → remove →
`light/light`; a `data-theme="dark"` flip ALSO re-resolves (`dark`), remove →
`light` — both observed channels proven live, no re-mount. The lane-stamped
region: root `.dark` present, viewport `data-scheme="dark"`, computed
`color-scheme: dark`. The family's ONE raw css read: `--ring` in
native-scroll-area.css:16 (the focus ring — the only `var(--non-jx)` read in
the family's own css); the stylex atom table carries zero theme slots (48
lines, all structural — law note says so and the source agrees).

**2. Size through inheritance, declaration-scoped — VERIFIED, live.** Stamped
root inline measured verbatim (`--jx-size-effective: 14px; font-size:
var(--jx-size-effective, 1rem)`); outer root computed **16px (auto) → 14px
(size={14})**; the demo rows' own declared 12px voice measures **12px in
both** panels — the declaration precedence exactly as the caption teaches
(quill's self-falsification note preserved).

**3. The composed story, kit-shaped — VERIFIED, greps.** Zero `scroll-run`
imports in ui/native-scroll-area/ and scroll-area-kit/ (the button-group
overflow=scroll hypothesis is falsified here — the kit header attributes the
verdict SHAPE as its own copy, "the two systems must not absorb each other");
`hand-drawn.svelte.ts` is imported only by the styled sibling; the platform
sibling consumes ONLY `resolveThemeScope` + `native-capability.css` ("the
siblings share the core, never each other's halves" — the page's kitUsage
string says exactly this).

**4. LAW #14 — VERIFIED.** The kit's reduced-motion block forces
`scroll-behavior: auto` (native-capability.css:64-70); **zero `transition`**
declarations in the family css and the capability sheet (grep count 0);
`scrollTo()` is a thin passthrough (svelte:173-175); smooth scrolling and bar
fades are the OS's own, as the token table states.

**5. a11y — VERIFIED.** Live DOM: **0** `[role="scrollbar"]` elements;
**12/12** viewports carry `role="region"` + `aria-label` + `tabindex="0"`
(the WAI scrollable-region pattern). The single SSR `role="scrollbar"` string
is the a11y table's own documentation row (name cell: `role="scrollbar"`,
value: "ABSENT") — text, not a mounted attribute. The Gate-1 r1 framing
("a scrollbar role on a nonexistent thumb would be a violation, not a
feature") is on the page.

**6. Hand table + marker + incident disclosure — VERIFIED.** The authored
hand table is exactly **9 rows** in the dispatch's order (orientation,
scrollbarWidth, label, class, style, onscroll, children*, getViewport(),
scrollTo() — the remediation's scrollTo() restoration confirmed in the served
table); the bare `universal` directive renders the shared 8 axis rows
beneath (17 served — the image model, no generated meta exists for this
family: only native-select.meta.ts matches "native"; EXTRA n/a as dispatched,
the carriers-bijection drift #9 second instance). The incident disclosure
comment (page:525-530) names the theming-fold surgery, the dropped
`data-jx-props-table-universal` marker, and the docs-universal 109/110; the
integration commit 4ae492f4 names the LAST-WRITE write-then-verify incident
with both gate runs. The marker measures present in SSR.

**7. Standard — VERIFIED.** Tier 2 (image model) respected; h1 ×1; toc == DOM
(6 ids: overview, capabilities, usage, accessibility, axes, api — machine-
checked `ok: true`); install + see-also present; supply-only greps across the
family AND the kit's capability sheet return zero carrier readers
(`--jx-size/shape/radius/color/elevation/motion-effective`,
`--jx-radius-factor`); console noise zero.

## Findings

- **NIT (doc precision, non-blocking)**: the dispatch's "9 rows" is the
  AUTHORED hand table; the served #api table carries 17 rows (the `universal`
  directive folds the shared 8 beneath). The page's own comment says this
  ("the hand table with the bare `universal` directive is the image model") —
  no page change needed; recorded here so reviewer #2 doesn't flag the count.
- **NIT (doc precision, non-blocking)**: the axisTokens row "--ring — raw
  theme token (the one read)" is precise for the FAMILY's own css, but the
  page's atoms note and the capability sheet are also theme-read-free only
  because the theme's global scrollbar-token law does the painting — the
  row's description already carries this ("the global token law painting the
  bar"); no change needed, an observation for reviewer #2's re-read.
- **No MAJOR/MINOR findings.** Every measured claim reproduced; the two
  prose-precision points above are already answered by the page's own text.

## Gates (this review)

- Affected specs solo: scroll-area-kit + scroll-area-family + docs-structure +
  props-table-meta-drift + hover-stability = **93/93 GREEN** (kit's own spec
  among them, as dispatched).
- docs-ambient-vocabulary: the 3 failures are navigation-menu-keyed —
  coordinator-attributed to quill's in-flight CODE (sibling-attributed); the
  file-input matrix rows from my task 25 run green inside the same suite.
- Probe: /tmp/vellum-26-nsa-probe.mjs (source-of-truth output in this report);
  console noise zero.
- Port 5242 empty before (rc=1) and after teardown (rc=1; vite 86242 killed by
  PID). NO commits, NO push. Siblings' in-flight files untouched.

## Verdict

**PASS** — the post-remediation page holds: the fifth theme mechanism is real
and live-measured (both observer channels), the size story teaches both halves
truthfully, the kit boundary is grep-clean, the a11y posture is probe-asserted,
and the incident is disclosed on the page and in the integration commit.
Ready for scribe's 2nd review.
