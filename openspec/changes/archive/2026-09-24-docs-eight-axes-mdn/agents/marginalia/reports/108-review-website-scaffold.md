# T108 — website-scaffold (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 3 LOW / 1 NIT — Tier 2 proposed**

Owner = quill (coded it, task 70); this is the 1st review (reassigned after a
lost BOARD row), vellum holds the 2nd. Page:
`apps/www/src/routes/docs/components/website-scaffold.html/+page.svelte`
(477 lines). Family read in full: `website-scaffold.svelte` (332),
`website-scaffold.css` (649), `website-scaffold.stylex.ts` (27),
`website-scaffold-defaults.svelte.ts` (40), `index.ts` (5); the toc family's
`--jx-toc-line` declaration read for the shared-var question.

Process: port 5244 mine (pre-check rc=1, served from apps/www, killed by
wrapper PID — lsof post_rc=1, no orphans). Probes
/tmp/marginalia-108-probe1..4.mjs (logs -p1/-p2). Dist dbb58684. No fixes
applied. Every shell claim below was read on the surface quill's discipline
names: the LIVE shell (this page's own chrome) unless marked exhibit-side.

---

## 0. Quill's BOARD receipts — verified, not trusted

| receipt | verdict | evidence |
|---|---|---|
| ≥1200 form [256 / 1104 / 240] named-area budget | TRUE, digit-exact | at a 1600 viewport the live shell computes `256px 1104px 240px` (probe1 FORM_1600); areas `"header header header" / "tree stage toc"` |
| --jx-header-h 74px, RO correction on .jx-shell (declaring scope) | TRUE | css :85/:118 (58 base / 74 at ≥900); live: the RO wrote `--jx-header-h: 74px` INLINE on `.jx-shell` (probe2 RO_STATE) — the toc-flush seam (:244-250) is real and the write lands on the declaring scope (:256) |
| scroll-padding 106 | TRUE | computed `scroll-padding-block-start: 106px` = --jx-toc-line calc(74px + 0px + 32px) |
| skip link | TRUE (Tab half) | real Tab: first stop IS `.jx-skip-link`, revealed (clip none), text "Skip to content"; target #main (probe3) |
| pointer law | TRUE | computed: top-layer none / header auto / chrome-slot none / float-slot none / slot children auto — and the float-wrapper exception (:200-202) stands in source, "the grant STOPS at float wrappers" |
| view transitions live | TRUE | computed `view-transition-name: site-header` on the band, `page-main` on main#main; the VT carousel machinery is in the sheet (:428-619) |
| immersive translateY(−74.74px) = the header-h itself | TRUE (digits exact) | via the page's OWN playground button (real path): scroll ↓ → host `data-hidden` + header `matrix(…, −74.74)` (that is −101% × the 74px band), toc `−74` (the var), toc max-height `calc(100% + 54.74px)` — the GROWTH law measured; scroll ↑ → everything returns, data-hidden clears |
| named-area budget transitions (3-col → 2-col → tocbar) | TRUE | live re-grid: 1440 `[256/944/240]`, 1000 `[760/240]` + `"header header"/"stage toc"`, 700 `[700]` + `"header"/"tocbar"/"stage"` — container queries on the HOST (resize = host resize for the live shell) |
| EMBEDDABLE fixture-measured at 480px, deliberately NOT rendered | TRUE | the no-nest ruling is stated twice (page :13, :298-305 — "a second 100svh overlay would trap the page"); live: ZERO nested `.jx-shell-host`/`.jx-shell` under main#main (the canvas holds the architecture diagram, not an instance) |
| stage pin (the HOST LAYER's source) present | TRUE | the toc rail rides `.jx-chrome-slot` (children `NAV[tree]`, `DIV[toc]`); `.jx-float-slot` has **0 children** — the two-slot map re-verified on the live shell |
| boot splash end-to-end | TRUE | SSR HTML ships the splash markup + the head style (`data-jx-splash-fan`); the live DOM keeps exactly ONE splash node — the head STYLE block, display:none ("persists by design"); the visual splash is unmounted |
| EXTRA's STRICTEST VERDICT: snippet-composed AND rest-LESS | TRUE from source | the destructure (:157-171) lists header/splash/chrome/children/footer + the eight axes — **no `...rest`, no id, no class**; adopt() returns a release fn (:197-207); roles toc \| tree \| float |
| zero-reader axis rows (grep receipts) | TRUE | `--jx-density-effective` / `--jx-size-effective` / `--jx-shape-*` / `--jx-radius-*` / `--jx-color-*` / elevation / `--jx-motion-effective` / corner-shape: **0 hits** across ui/website-scaffold/ |
| data-density absent at auto (the no-opinion law visible) | TRUE | the live host carries NO data-density attribute |

## 1. The toc channel, end-to-end, once

The page RIDES the channel it documents: authored +page.ts ships 10 entries;
the rendered rail (inside `.jx-chrome-slot`, the scaffold's chrome cell)
renders exactly those 10 in DOM order (probe1 TOC_CHANNEL); install/see-also
are chrome-out per the BOARD ruling (the +page.ts comment names it). The
page-toc data → layout chrome-snippet channel verified live on the family
under test. The toc surfaces render twice inside the toc component (desktop
aside + mobile glass bar — the toc family's dual render; its review owns
that interior).

## 2. Findings

**LOW-1 — the a11y table's Enter row claims focus lands on #main; focus
stays on BODY.** The row (:471): "Enter: Follows the skip link — focus lands
on #main content." Real-path receipt (probe4, from a scrolled position):
Tab reveals the skip link ✓, Enter lands the view EXACTLY on the line —
mainTop **74** = the toc-line, scroll-padding doing its job — but
`document.activeElement` is **BODY** and `main.contains(activeElement)` is
false: main#main carries no `tabindex="-1"`, so the classic skip-link
caveat applies (the viewport lands; focus does not move). The Tab row's
halves are TRUE (first stop ✓, hidden until focused ✓ — focus-visible
reveals, clip-path none). Fix shape: `tabindex="-1"` on main#main plus a
programmatic focus on skip activation — or reword the row to the
view-landing truth.

**LOW-2 — the TokenTable's `--jx-toc-line` default cites the wrong
scope.** The row (:419): default "**76px**" — that is toc.css :315's
`:root` declaration, which toc.css itself scopes as "serves standalone
consumers only" (:308-310). The scaffold's OWN value is derived
(css :90-92: `calc(header-h + chrome-top + line-extra)`) and computes
**106px** on the live wide shell — the same page's receipts paragraph
correctly reports scroll-padding 106px four lines below the table. One
name, two scopes, and the scaffold page's token table shows the other
family's number. Fix shape: label the row (":root standalone default — the
shell derives header-h + chrome-top + 32px") or cite 106.

**LOW-3 — the family's joiner twin is still open (new information).**
website-scaffold.svelte :95-99 carries the OLD cx form
(`filter(Boolean)` without the narrowing predicate); svelte-check seat
:95:28. **The page itself is CLEAN — 0 errors** (its cx at :97-107 already
uses the closed predicate form, :101) — the page gate to 0 holds; this seat
is the family component's, first surfaced by this review (the dispatch
anticipated new information here). Fix shape: the transfer predicate, as
landed on the tooltip trees.

**NIT-1 — a point-in-time scrollable height rides the live-receipts
list.** "6164px scrollable" (:435): live at 1440 the body scrolls
**11074px** — true at task-70, stale now, and it sits mid-list under a
"Receipts (all on the LIVE shell…)" lead (the task-70 attribution clause
comes later in the same sentence). Suggest attributing or dropping it;
scroll-padding 106 stays (structural, current).

## 3. Verified-true, no finding

The self-reference discipline holds: every measured claim names its surface,
and the live/live exhibit split is enforced by the no-nest ruling rather
than asserted. The architecture diagram (canvas pre block) matches the DOM
one-to-one (host → shell → top-layer{header, float-slot} + body{main#main,
footer} — all present, all named right). The immersive law's three-zone
split (header leaves, toc compacts with the max-height growth, tree
slides/hides per form) matches css :323-393 including the wide-form tree
compaction. Reduced-motion swaps (transition none, scroll-behavior auto,
VT crossfade) are in the sheet (:622-647) — the playground button itself
respects the media query (page :90). The measured per-axis table
(universal-props :118-175) renders the eight axes with their grep receipts —
the "rendered table is the claim surface" discipline applied (the API table
additionally carries the universal fold's axis rows, 14 tbody rows total ✓).
Isolation on the host + the z-ladder note (css :42-50) matches the
embeddability contract. W-next #21's corner-lane map is not contradicted:
at 1440 the toc column sits at x1200 w240 (the wrapper; the #21 numbers
were the inner element's), the tree rail at x0 w256 — the lanes are where
the law says. W-next #19: no data-reveal on the scaffold root ✓ (13 reveal
wrappers are the page's hosted sections). The theme strata framing ("the
scaffold hosts them; the canvas stage's light-island is the canvas's stamp")
matches the live DOM (no .dark on the host at auto; body ground light).

## 4. Probe-fault ownership (my artifacts, not the page's)

- **The T54 captor lesson bit twice, and the dispatch's warning was
  right**: probe1 ran `waitUntil: 'commit'` + 2200ms and then measured the
  header band at **9855px tall** (and 7287/10791 at other widths) with the
  RO inline var empty — the pre-hydration SSR/interim state on the dev
  server's first compile. Probe2 (networkidle + fresh load) reads the truth:
  band 74px, RO inline `74px`, everything settled. The splash "5 persistent
  nodes" in probe1 were the same race plus my broad `[class*="splash"]`
  selector; probe2 identifies exactly one persistent node — the head style
  block, by design. No page finding from either.
- Probe1's toc-link list read 20 entries (10 × 2) — the toc component's
  dual desktop/mobile surfaces inside one wrapper, not a duplication bug.
- Probe1's skip-link focused read was malformed (my expression bug) and
  programmatic `.focus()` does not reliably trigger `:focus-visible`;
  probe3 re-ran it with a real Tab.
- The docs-universal gate's first invocation ran from apps/www (my cwd
  slip — npm error, not a gate failure); re-run from the root: GREEN.

## 5. Gate record

- ambient solo: 284/284, rc=0 (known vite-teardown nuisance note).
- `npm run verify:docs-universal` (repo root) → GREEN 110/110, rc=0.
- page-scoped svelte-check (from apps/www): **page 0 errors — the gate to 0
  holds**; the family component carries :95 (the open joiner twin, LOW-3).
- `npm run verify:docs` (dist dbb58684) → rc=1, sole red `toast: skeleton:
  Examples renders before Usage` — the scribe's T71 in flight; seat-attributed
  away from website-scaffold.
- Server killed: lsof :5244 empty (post_rc=1), no orphan processes.
