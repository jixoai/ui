# TASK 139 — terminal-header (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 2 CONFIRMED.**
Owner = marginalia; her 1st (T131, PASS 0M/0m/1L/0N) is LEDGERED — the Components→Docs
copy rename lands at the next consolidation, not this review's to find. This 2nd
verifies the standing state, re-derives the bezel/panel/drawer receipts, and adds the
fresh axis. Dist = **14c8ecd2** (fresh build rc=0). Port 5243 mine; killed after probes,
lsof post rc=1, siblings untouched.

## The ledgered finding — state-checked, honestly standing

- **LOW (the interaction copy names a "Components" pill that does not exist)** — STILL
  PRESENT as ledgered: the two seats (:193 the stage card, :205 the PlayHelp) still teach
  "click the *Components* pill in the real header above" (the `<em>` markup split my
  first grep — the copy is there), while the live bar's pills are Overview and Docs. The
  rename is consolidation's one-line edit.

## Her receipts — re-derived on my instruments

- **The bezel lock, two-read**: the live `header.jx-nav` computes **background
  oklch(0.2 0 0)** with **color-scheme dark** while the page body computes **oklch(1 0
  0)** light — the dark CRT shell on a light page, exactly her pair.
- **The mega panel is the browser's**: a real click on the **Docs** pill opens exactly
  **one popover** (top layer) whose first link is "install the zero-tooling prerequisite…"
  (her exact first link); **Escape closes it** (open-popover census 1 → 0). No
  header-owned close machinery.
- **The drawer at 500px, on the real-input path**: the "Toggle navigation" hamburger is
  visible; a real click flips `aria-expanded` → "true" and **focus lands on the burger**
  (mousedown focus); Escape closes (`aria-expanded` → "false") and **focus is RESTORED to
  the burger** — her :239-246 law reproduced end-to-end with real input events.

## The fresh axis — the drawer tree census drifts with the campaign

Her drawer held **279 links** at the T131 vintage. Measured at ef520d44-era HEAD: the
drawer's navs read **138 links (the desktop mega nav, width 0 — hidden), 140 links
(visible, 468px), and 222 links (visible, full 500px)** — the 500px drawer holds 222.
The delta is not a defect: the docs tree is living content (the same signature as card's
"6164px scrollable" attribution — point-in-time digits under a growing site). Recorded so
the next prober quotes the current census with the at-read-time clause instead of
expecting 279.

## Standard battery

- **LAW #19: 36 ids, zero duplicates**; h1 ×1.
- Gates: verify:docs **rc=0** (one transient sibling-dist ENOENT crash before the clean
  re-run, recorded in the scroll-run report) · ONE saved svelte-check: page 0 errors,
  family 0 errors + 7 standing warnings.
- Probe-fault ownership: (1) my drawer drive used an evaluate-click first — programmatic
  `.click()` never FOCUSES the burger, so the Escape-restore read landed on BODY and
  false-failed her law; the real-input re-drive (Playwright click) is the receipt — the
  restore law needs a focus-holding opener to have anything to restore; (2) my drawer-nav
  finder (nav/[class*=drawer] with >50 visible links) missed the panel twice before the
  nav census; (3) my first "Components pill" grep counted 0 — the `<em>` markup splits
  the phrase; the two seats are at :193/:205.
- Artifacts: /tmp/g139-{sr-sel,r2,th}.mjs + /tmp/g139-{build,docs,docs2,scheck,preview}.log.

## Open questions

The copy rename (her LOW) is the only owed item — confirmed standing at both seats, one
consolidation away.
