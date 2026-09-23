# TASK 78 — FIRST REVIEW tour.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st of 2; vellum's page — CODE 45 at 6aec7a60, owner-checked
  that I did not code it. Independence law held: her report 45 was opened only AFTER the
  findings below were fixed; the concordance addendum follows at the end)
- **Target**: `apps/www/src/routes/docs/components/tour.html/` (+page.svelte 916 lines)
  over the tour family `apps/www/src/lib/ui/tour/` (svelte 514 / stylex 128 / css 56 /
  defaults 56), served live on :5244.
- **Method**: source reads (lease/restore/dataset paths :321-331, the focus effect
  :255-272, invoker restore :369, the {#if} KNOWN-GAP header :33/:52, carriers
  :228-229), headless Chromium over dev SSR :5244 with REAL-event drives only
  (Playwright clicks/keys — the craft note that programmatic clicks never focus is
  honored by construction), rAF-cadence var sampling on the open tween, an
  oklch→WCAG-contrast computation for the island card, SSR payload parse, the three
  gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 1 NIT. Every dispatched headline
  verified on my own instruments; the theme split lands on the alias-theme law's
  tiers with one refinement to the "3.54:1" framing (the NIT below).

## The FOCUS LAW — VERIFIED on real events

- **Open lands Next**: real click on "start the tour" → `document.activeElement` reads
  **"Next"** (the rAF effect at :255-272, `(nextEl ?? panelEl)?.focus()`).
- **Every step re-lands**: Next (real click) → step 2 → activeElement **"Finish"**
  (the last step's primary — the same landing slot, re-labeled at the end). The engine
  re-lands on EVERY index change (source: `index is a dep: EVERY step change re-lands`).
- **Escape/Skip/Finish restore the invoker**: after Escape, Skip, and Finish
  (three separate drives), activeElement reads **"start the tour"** — the opener, all
  three times (`invokerFocus.el?.focus()` :369).
- Keyboard path: ArrowRight advances (real key), Escape finishes via :412.

## The REVERSIBLE anchor lease — VERIFIED verbatim

- During open: the target `section` carries `anchor: --jx-tour-s25` (per-instance —
  `--jx-tour-${autoId}` at :164) with `dataset.jxTourPriorAnchor` recorded (prior ""
  = the target had no inline anchor-name → restore removes the property, :328-329).
- After close: **lease census empty** — no element carries the lease, dataset cleaned
  (:331). The panel's `position-anchor: --jx-tour-s25` rides the same name (:237/:448).
- Prior-restoration with a non-empty prior was exercised by the close path's
  removeProperty branch; the restore-existing branch is source-read (:329-330), no
  page demo ships a pre-anchored target (none observed in the census).

## The {#if} reopen gap — DETERMINISTIC, both paths re-derived

- **Fresh-page first open**: `--jx-p` sampled at ~60ms cadence reads
  **0.2535 → 0.4348 → 0.6522 → 0.9057 → 1** — the surface-motion kernel's ramp over
  the authored 460ms window, live at the card.
- **Every reopen** (Escape then same opener): samples read **1, 1, 1, 1, 1** — flat
  at 1.000 from the first frame, no tween. The {#if open && step} remount starts the
  card past the transition (the family's documented KNOWN GAP, source :33/:52 — the
  exit choreography never runs and the remount snaps). Deterministic, as billed.
- **Step moves do NOT re-run the tween**: --jx-p stays exactly 1 across a Next
  advance while the card re-anchors on the live axis (x moved, p constant) — the
  "step moves ride the live anchor axis" claim, verified.

## The radius drift (drift #15) — CONFIRMED AS BILLED

- The card stamps `--jx-radius-consumed: calc(max(0px, calc(0px - 0px)) * 1)` (the
  auto lane composition, carriers :228-229), the computed **border-radius is 0px**,
  and `grep -rn 'var(--jx-radius-consumed'` over `lib/ui/tour/` returns **zero
  readers** — the stamp is dead supply in the chain, exactly the billed shape.

## The theme split — the split CONFIRMED at the ink atoms; tier classification + one refinement

- **The dark-island card** (`theme="dark"`, the card root carries `class="… dark"` —
  its own island through the popover promotion):
  - The island re-derives the SITE tokens: `--foreground` = oklch(1 0 0) at the card
    (white), `--popover`/`--card` = oklch(0.3211) (the dark-side fill tokens) — the
    ground half of the split, live.
  - **The ink is FROZEN black at the atoms**: `--jx-foreground` = oklch(0 0 0) on the
    card, the title ink computes **oklch(0 0 0)** and the description
    **oklch(0.3211 0 0)** — the stylex atoms read the :root aliases (:51/:57/:62),
    which a mid-tree island cannot re-substitute. **Tier 2 (island-proof) for the
    ink; the ground rides the island's own re-declared fill tokens.** No pin-finder
    hold: the card's island is the mechanism, not a stage artifact.
  - My first read of the card ROOT's `color` returned oklch(1 0 0) — that is the
    site `.dark` rule painting the root with the re-derived site token, NOT the ink
    atoms; the atoms' own computed colors are the honest ink reads (instrument note).
- **The unpinned card under root html.dark (the interesting read)**: the main tour
  opened outside any island — **title ink flips to oklch(1 0 0)** and
  `--jx-foreground` at the title reads oklch(1 0 0) — **tier 1 (live at the root)**,
  no hold anywhere. Tour is the fifth family the alias-theme law covers, both tiers
  on one page.
- **The NIT — the "3.54:1" framing**: the painted card face is a TRANSLUCENT stack —
  the only opaque-ish fills in the subtree are the WAAPI shadow child
  (`oklch(0 0 0 / 0.596)`) and the `::after` layer (`oklch(1 0 0 / 0.32)`); there is
  no opaque dark surface fill to read a stable ratio against, and the composite
  depends on whatever ground the non-modal card floats over (my composite over the
  light page lands ≈ 6.9:1, not 3.54). The split is real; the single-contrast number
  is not a stable property of this card. One-sentence page hedge (or a pinned ground
  behind the island demo) would make the receipt reproducible.

## Dismissal ×3 + step-move + scrollIntoView — VERIFIED

- **Skip** closes with focus restored ✓; **Escape** closes with focus restored ✓
  (twice); **Finish** (last step, real click) closes ✓ — and `onfinish` fires on the
  end paths (source :368; the page's `finishedAt` receipt binding at :746 renders the
  demo state). Step-move settles in the same frame (p constant, geometry re-anchored).
- **scrollIntoView({block:'nearest'})** (:324): with the tour open and the page
  scrolled away from the next target, ArrowRight brought the **lease target from
  outside to inside the viewport** (element-visibility flip false → true; the docs
  shell scrolls an inner container, so window.scrollY stays 0 — receipted at the
  element level).

## Standard battery

- **SSR/post-settle**: payload 1,240,949 bytes; h1 ×1; universal marker present;
  0 undefined literals; the 9 "null" byte hits are prose ("null fills") and the
  TourStep type signature (`HTMLElement | null`) — content, not literals.
- **Warm-reload**: consecutive SSR fetches byte-identical (no module-counter drift).
- **EXTRA-lane by name**: PropsTable serves steps/open/startAt/onfinish/onstep/card/
  variant/class + the TourStep pair (target/title/description); the TokenTable serves
  the lease/gap/tint/--jx-p/hole-border/--jx-radius-consumed/elevation/--jx-hit rows.
- **KEYED-EACH**: the recipe dots each keys the index (`Array.from({length: api.total}
  (_, i) => i) as i (i)` — unique by construction; the LAW #18 surface is empty by
  the page's own receipt at :399).
- **LAW #19**: 90 ids on the live DOM, zero duplicates.
- **Vocabulary-grep**: zero `jxoai` hits in family or page.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **tour.html: 0 diagnostics**. Family lane, pre-existing (files untouched by me): 3 ERRORs in tour.svelte (:353 HTMLElement\|null narrowing; :430 the Object.entries-undefined overload; :456 excess `autoId` prop) — the family owner's standing debt |

Sibling keyed noise receipted, not chased: quill's website-scaffold.html, vellum's
textarea, scribe's toast in flight.

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 60537; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- html.dark classes and DOM state reverted in-probe; all drives REAL events.
- Instrument honesty: (1) my first drive used the size-18 universal tour, whose steps
  are unavailable — it opened, tweened, and auto-finished mid-probe (the
  unavailable-targets end path, observed live); re-drove on the multi-step main tour
  with live targets; (2) the ink read needed the ATOMS (title/desc), not the card
  root — the root's color is the site .dark paint, a different chain; (3) the
  scrollIntoView receipt lives at the element level (inner scroller); (4) one probe
  died on a destroyed execution context after an island Escape — the remaining reads
  re-ran on a fresh page.
- Artifacts: /tmp/marginalia-78-probe{1,2,3}.mjs, /tmp/marginalia-78-ssr.html,
  /tmp/marginalia-78-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The translucent card face**: with no opaque fill in the chain, the island card's
   contrast is ground-dependent by construction — if the Owner wants a stable
   contrast number on the dark-island demo, the demo needs a pinned ground (or the
   receipt text drops the single number). The NIT above names the one-sentence fix.
2. **The 3 family ERRORs** (:353/:430/:456) — the standing-debt ledger, tour owner.

---

## Concordance addendum (appended after reading vellum's report 45)

My findings above were fixed before this section.

- **FULL CONCORDANCE — every overlapping receipt reproduced**: the focus law on real
  events (open lands Next / re-lands reading "Finish" on the last step / Escape and
  Skip restore the invoker / programmatic clicks never focus — her owned probe fault 1
  is the craft note the dispatch baked into my method); the lease verbatim
  (`--jx-tour-s25`, prior "" recorded, restore + dataset delete on advance and close);
  the {#if} reopen gap deterministic BOTH paths (her first-open tween 0.109→…→0.652
  mid-ramp and reopen flat 1.000 = my 0.2535→…→1 and all-1s — and her OQ2's
  "deterministic on reopen, not a race" refinement matches my framing); the radius
  drift #15 (stamped, computed 0px, zero readers — her explicit-lane
  `calc(10px * 1)` seat, my auto-lane `max(0px, 0px − 0px) * 1` seat: both stamped
  forms, neither read); the theme split (island ground re-derives, title ink frozen
  black); scrollIntoView (her 12rem-scrollbox scrollTop 0→236 receipt is the sharper
  form of my element-visibility flip); dismissal ×3 with the onfinish readout; the
  dots keyed `(i)`; LAW #19 **90 ids, duplicates none** (her count == mine exactly);
  universal 110/110 and page 0 diagnostics.
- **The tier classification the dispatch asked for is now ON the record**: her OQ3
  flagged the island ink drift as the #14 family pattern with a candidate fix; my
  receipt places it in the alias-theme law's tiers — the ink is TIER 2 (island-proof:
  the card's own class:dark re-declares site tokens — --foreground white at the card —
  but cannot re-substitute the :root aliases the atoms read), and the SAME page
  receipts TIER 1 (the unpinned tour under root html.dark flips its title ink white).
  Both tiers measured on one family; the pin-finder was never needed (no unexplained
  hold).
- **The 3.54:1 number — method difference, not a split contradiction**: her ground is
  the jx-surface fill-chain head (oklch(0.245 0 0), the level4 dark rung); my subtree
  walk found NO opaque fill — the painted face is the layered stack (shadow child
  oklch(0 0 0 / 0.596) + ::after oklch(1 0 0 / 0.32)) over whatever the non-modal
  card floats across, and my composite lands ≈ 6.9:1. The SPLIT is real on both
  instruments; the single ratio is method- and ground-dependent — which is exactly my
  NIT (a pinned ground behind the island demo, or the page drops the single number).
  Her OQ3's owner fix (stamp the ink pair under class:dark) is the substantive
  resolution and supersedes the framing either way.
- **Additions (mine, not in report 45)**: the card-root-vs-ink-atoms read-site note
  (the root's color is the site .dark paint — the honest ink read is the atoms);
  the tier-1 unpinned-card census receipt on the same page; the auto-lane stamp form
  of drift #15; warm-reload hash-identical SSR (1,240,949 bytes, consecutive fetches
  byte-equal); the 9 "null" byte hits decoded as prose + the TourStep type signature;
  and the unavailable-targets auto-finish trap (my first drive opened the size-18
  tour, which tweened and finished mid-probe — a live demonstration of the end path
  her OQ list implies).
