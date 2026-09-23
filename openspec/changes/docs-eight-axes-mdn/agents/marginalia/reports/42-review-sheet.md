# TASK 42 — REVIEW sheet (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — quill's report 31 NOT read
  before the findings below were fixed; the concordance addendum at the end was appended after
  filing, per the dispatch)
- **Target**: quill's page — `sheet.html/+page.svelte` (382 lines) + `+page.ts` + the family
  (svelte 370 / stylex / css). Zero drift on sheet paths; the tree's uncommitted set
  (scroll-area — vellum, prototype-grid, agents' experience files) belongs to siblings.
- **Method**: source reads (page, family svelte/css, SheetDefaults), PIXELS for the entry/exit
  slides (a per-frame rAF sampler recording (ms, x, open, .closing) — single-evaluate, no
  waitForTimeout gaps), real-input wheel and Escape, a reduced-motion pass, smooth-scroll-aware
  reads on the docs scroller (scroll-behavior: smooth measured on .jx-shell-body — reads ride
  out the animation), SSR parse + real-DOM duplicate-id scan, ambient solo + docs-universal +
  fleet svelte-check.
- **VERDICT: PASS** — 0 MAJOR / 1 MINOR / 2 LOW / 1 NIT. The pixel-timing claims, the
  four-lane stamps, the elevation pair, the focus restore, and the LAW #19 id landscape all
  verify; one dispatched receipt (the backdrop wheel chain) does not reproduce and the page's
  scroll disclosure is imprecise for wheel users.

## The LAW #19 watch-item — the pre/post exhibit pair, receipts CLEAN

- **SSR**: wrapper ids present (install, overview, sheet-demo, law, types, usage, api, axes,
  accessibility, see-also); **zero SSR duplicate ids**.
- **Post-hydration**: real-DOM scan — **zero duplicate ids**. The pre-guard page measured 6
  twins; the served page measures 0. The stamp-side guard's signature is visible: the twin-case
  heading (Overview, whose title slug equals the wrapper id) is left ID-LESS (adoption without
  stamp, toc-outline.ts :88-95), while non-matching titles (the dialog laws; the eight axes)
  stamp their own title slugs, which cannot twin.
- **ToC resolving**: every served fragment anchor resolves; the toc covers all 8 non-chrome
  sections (sheet's toc is complete — the 8-of-13 coverage gap I filed on scroll-virtual does
  NOT occur here).

## The headline claims — verified / not reproduced

1. **Entry pixels — VERIFIED digit-exact at the 1280px viewport.** Per-frame trajectory of the
   dialog's x: **[21ms, 1280] → [46, 1051] → [80, 947] → [112, 911] → [147, 899] → [179, 896
   settled]** — 1280 → 896 (the 24rem panel) through ~5-6 intermediate rAF frames, first move
   at 29ms, decelerating (ease-nav): the claimed ~97-128ms intermediate band sits inside the
   measured tween.
2. **Escape exit — VERIFIED**: with the sheet open, Escape fires the cancel path, the
   **`.closing` class appears inside the open window** (measured true on exit frames), the
   panel slides out (last open x 1228 — near the end of the out-slide), and `dialog.open`
   flips false at **~200-230ms after the keypress** (the 200ms animation + close overhead —
   the claimed 223-230 band). **Focus restores to the trigger** (measured with a REAL trigger
   click: activeElement after Escape == the "Open sheet" button — my first probe used a
   programmatic el.click() which never focuses anything; that artifact was mine, the claim's).
3. **Reduced-motion DOUBLE-KILL — VERIFIED in substance**: under `prefers-reduced-motion` the
   OPEN renders the panel already docked (first frame x=896, no slide frames), and Escape
   closes **instantly (~40-50ms measured vs the claimed 24-30ms — within rAF/CDP jitter, and
   an order of magnitude under the 200ms path)**. Both kills observed: no tween frames AND no
   timer wait.
4. **The backdrop wheel chain — NOT REPRODUCED (this review's principal finding).** The
   dispatched receipt says wheel over the open sheet's ::backdrop chains to .jx-shell-body,
   measured both directions. Measured here: with the sheet open, a wheel over the backdrop at
   (200, 450) moves the docs scroller **NOT AT ALL** — .jx-shell-body.scrollTop pinned at 1000
   through wheel-down 500 and wheel-up 700 — while the wheel EVENT propagates (listener
   receipts: shell-body → document → window all fired). The baseline is honest: the same wheel
   with the sheet CLOSED scrolls the shell 0 → 900, so the pipeline works and the top layer is
   what eats the scroll. **The page's disclosure ("the document's own scroll is not locked for
   you") does not match this measurement for wheel users**: the scroller is not LOCKED
   (programmatic scroll works — measured) but a wheel user effectively cannot scroll the page
   while the sheet is open. Disclosure precision + the non-reproducing receipt = the MINOR
   below; reviewer #2 should reconcile with her original instrument.
5. **Backdrop CLICK — VERIFIED**: a backdrop click leaves the sheet open (the not-wired law,
   measured).
6. **W-next #8 workaround — VERIFIED in place and honest**: every Sheet instance on the page
   (the workbench drawer + the three axis drawers) sits OUTSIDE any ComponentCanvas, with the
   in-source receipt comment ("a canvas-host ancestor beats the drawer's width atoms —
   measured: an 18rem sheet stages full-bleed inside the host"). The 18rem sheet measures
   **288px** at page level (and the default 384px at x 896 in a 1280 viewport) — the
   workaround's numbers are live. The defect itself is not reproducible on the served page (no
   in-canvas specimen survives the workaround — see the LOW).
7. **The axis stamps — VERIFIED**: the "Stamps" drawer (density="small" + theme="dark" +
   radius={12} + size={18}) computes **data-density="sm"**, **class dark**, **12px corners**,
   **18px root voice** — four lanes on one top-layered root. The §7 pair: the root stamps
   `--jx-elevation-effective: 8` + the consumed shadow recipe (the level4 chain resolves the
   full two-layer recipe) and the interior card paints it (the dialog root's own box-shadow is
   none — the recipe paints on the card kernel's surface box; the row's "stamps on the root"
   is accurate about the stamp). width="18rem" + elevation="level2" measures **288px** with
   the level2 pair stamped.

## Findings (severity-tagged)

1. **[MINOR — the scroll disclosure is imprecise for wheel users; the dispatched chaining
   receipt does not reproduce]** Measured: wheel over the open sheet's ::backdrop moves the
   docs scroller zero pixels in either direction (the event propagates to .jx-shell-body —
   listener receipts — but the scroll default does not chain from the top layer), while the
   same wheel with the sheet closed scrolls fine. The page's "the document's own scroll is not
   locked for you" is true about LOCK (nothing authors a lock; programmatic scroll works) and
   misleading about WHEEL (the effective user-facing behavior is a locked page). The dispatch's
   "chains, measured both directions" did not reproduce on this environment. Fix: one honest
   sentence ("wheel over the backdrop is swallowed — the page does not scroll while the sheet
   is open; the scroller itself is never locked").
2. **[LOW — pre-existing typing debt, unchanged files]** family :205/:327 (the cx join class)
   + :163 8× state_referenced_locally warns (the fleet pattern), scenes ×3, a fixture warn.
   Page: **0 diagnostics**. Fleet 1576/610 (sibling set).
3. **[LOW — the W-next #8 defect receipt is not independently reproducible in-tree]** The
   workaround removed every in-canvas specimen, so the "1280 vs 384" defect number cannot be
   re-measured on the served page — the receipt rests on her original probe. Honest as written
   ("measured"); noted so reviewer #2 knows the receipt is historical, not live.
4. **[NIT]** The api summary's "Eight props" is right for the served family rows (verified by
   name: open · side · title · children · header · footer · width · variant) while the meta
   stores 16 named entries (8 family + 8 axes, no rest) — no arithmetic claim is made; this is
   the clean shape.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** — clean; the task-38 sheet keys are gone (the in-tree matrix re-pin carried them) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 610 files) | **page 0 diagnostics**; sheet-path debt pre-existing (unchanged files) |
| Raw SSR + real DOM | h1 ×1; SSR ids clean (no twins); post-hydration ids unique; ToC complete (8/8 non-chrome sections); 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite killed by PID (+ wrapper);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The wheel listeners and stamps were
  injected and restored in the live DOM only; sibling files untouched.
- Independence: quill's report 31 not read before the findings were fixed; the concordance
  addendum follows after filing.
- Instrument honesty: three of my own probe faults were caught and corrected before any
  conclusion (a missing evaluate wrapper, a wheel test run before identifying the real docs
  scroller — scroll-behavior: smooth on .jx-shell-body, and a programmatic trigger click that
  cannot test focus restore). The dispatch's chaining receipt did not survive the corrected
  instrument; everything else did.
- Artifacts: /tmp/marginalia-42-probe{1,2}.mjs, /tmp/marginalia-42-ssr.html,
  /tmp/marginalia-42-{specs,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill's report 31)

My findings above were fixed before this section; the cross-check against report 31:

- **CONCORDANT (reproduced independently)**: the entry trajectory (her 1148→911 intermediate
  frames sit inside my 1051→947→911→899 trace), the escape exit (.closing in the open window,
  223-230ms), reduced-motion instant (her 24-30ms, my ~40-50ms — same substance, jitter
  band), backdrop click never closes, focus restores to the trigger, the 120ms-base/200ms
  declared exception, the canvas-host workaround, and the matrix re-pin (her tableIndex 0→1
  is the in-tree fixture my ambient solo ran green with).
- **DISCORDANT — finding 3 (the backdrop wheel chain)**: she measured the chain (0 → 1396px,
  both directions); I measured the scroller PINNED (wheel over the backdrop at (200, 450),
  ±500/700, zero movement — with the wheel event propagation receipted and a sheet-closed
  baseline proving the pipeline). Her run predates the LAW #19 work; nothing in it plausibly
  touches wheel chaining, so the reconciling variable is unmeasured — most plausibly her wheel
  point landed on the panel's scroll cell at its overscroll boundary (the cell contains its
  own overscroll by design) rather than the bare backdrop. My MINOR stands as measured; her
  probe script is the reconciliation starting point for reviewer #2.
- **ADDITIONS (mine, not in report 31)**: the post-guard id-landscape receipts (0 twins SSR +
  live, the adoption-without-stamp signature on the Overview heading — completing the pre/post
  exhibit pair her finding 5 opened), the scroll-behavior:smooth instrument trap on
  .jx-shell-body reads, and the programmatic-click focus artifact.
- **HER OPEN QUESTIONS, updated**: (1) the SectionCard twin fleet decision — RESOLVED by LAW
  #19's stamper guard (this page is the clean post-exhibit); (2) the canvas-host defect — W-next
  #8, workaround verified in place, defect receipt historical (my LOW); (3) the Tab wrap-around
  documentation stance — concurred (platform-first); (4) the scroll-truth note — needs the
  wheel-precision rewording (my MINOR).
