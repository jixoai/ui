# T75 — FIRST REVIEW terminal-footer.html (vellum)

**Verdict: PASS** — with **1 MINOR** (the size row's inherited-echo claim does not reproduce on
the served DOM; one clause fixes it), **0 MAJOR**, **2 LOW** (scoped-vs-root ink phrasing; the
pin-site naming could be one line in the family docs), **1 NIT** (stage-constrained shell width).
Independence law kept: findings formed from my own source reads (the five family files, the
414-line page) and two probe passes BEFORE opening quill's report 67; the cross-check addendum
follows.

## The headline claims, re-derived (my probes, 5242)

**THE HOST LAYER — VERIFIED, and the pin site is NAMED.** The served demo footer's pin chain
contains exactly one captor: `div[data-theme="light"].jx-light` — the component-canvas stage —
which re-pins the whole light profile (`--card` oklch(1 0 0), `--muted-foreground`
oklch(0.3211 0 0) computed AT the stage). Under `html.dark` injection:
- the PAGE flips — `--border` at body **oklch(0 0 0) → oklch(1 0 0)**, at main → oklch(1 0 0)
  (the root re-derivation);
- the SERVED demo footer's stroke **stays black** — oklab(0 0 0 / 0.55) — because the stage pin
  governs its subtree (location beats the prop, and beats the root);
- **the SAME footer cloned to body level re-derives white** — oklab(1 0 0 / 0.55);
- **a component `.dark` stamp re-derives in place** — clean-light-state test: footer stroke
  black → add `.dark` ON the footer root → oklab(1 0 0 / 0.55) → remove → black restored.

**Inside the component — VERIFIED digit-exact.** The same own-dark test: stroke flips
(0 0 0/0.55 → 1 0 0/0.55) while the meta/title ink **holds** oklch(0.3211 0 0) — the stroke
rides `color-mix` over `var(--border)` (a base token the `.dark` scopes re-declare), the ink
rides `--jx-muted-foreground` (:root-pinned alias). Both halves of the split measured on one
element.

**Ghost clamp + shell — VERIFIED digit-exact.** Ghost font-size **140.8px at a 1280 viewport**
(11vw under the cap) and **144px at 1600** (the 9rem cap); shell `max-width: 1440px` (90rem)
with auto margins (centered: |ml−mr| < 1px); padding seams **16 / 24 / 32px** at base /
40rem / 64rem — all measured across viewport sizes. Warm-reload reproduces (140.8px / 32px).

**Hover seam — VERIFIED.** `0.15s ease-out` baseline; `--motion-150: 2s` injection on the root
→ **2s** (the seam governs); RM emulation → **0.15s preserved** (no kill authored, none needed —
a color change has no motion path). Hover ink measured muted oklch(0.3211 0 0) → primary
oklch(0.6489 0.237 53) (the var reads straight from the legacy chain).

**Density paint-invariance — VERIFIED.** The DensityDemo 2xs and lg scopes render identical
footers (padding 32px, meta row gap 8px, ghost 140.8px, ink — all equal; the rung lives on the
demo's scope wrapper, which is exactly the §4 scope half).

**Shape/radius/elevation supply-only — VERIFIED.** Computed border-radius 0px, box-shadow none,
no shape attr; zero effective-carrier greps over ui/terminal-footer/ (size/shape/radius/color/
motion/elevation/density-effective: **0 files each**).

**EXTRA VERDICT — VERIFIED (attribute-transparent, NOT rest-less).** Source: the shell spreads
`{...rest}` onto the real `<footer>` (terminal-footer.svelte:147) and the column onto its div
(terminal-footer-column.svelte:43); `Props extends Omit<HTMLAttributes<HTMLElement>, 'color'>`
(:55) withholds the color ATTRIBUTE while the color AXIS is a declared prop — served footer
carries no `color` attribute (probe) and is a real `<footer>` landmark.

**Structure**: toc == DOM == SSR rail 9/9 (overview, live-demo, terminal-footer-base, types,
usage, theming, api, universal-props, accessibility; install/see-also chrome OUT — deduped the
rail's double render). **LAW #18**: no each block exists in the family (the columns are
snippets — the keyed surface is empty by construction). **LAW #19**: 67 ids page-wide,
duplicates NONE. **SSR/post-settle duality + warm-reload**: the served footer ships in the raw
HTML and the ghost/seam numbers reproduce after reload.

## Findings

1. **[MINOR] The size row's inherited-echo claim does not reproduce — and the row
   self-contradicts.** The axisRow says "the © line and the column links inherit (measured 30px
   under a 30px stamp)" — but the metaRow atom sets `fontSize: --jx-text-small` (12.5px fixed),
   so EVERY family-rendered text inside the meta row (© line, links) is pinned: under the
   served 18px stamp I measured root font-size **18px** with metaRow **12.5px**, © line
   **12.5px**, links **12.5px**, title **11px** — identical to the ambient 16px footer
   (12.5/12.5/12.5/11). The row's own second half ("the column-title/copyright voices ride
   fixed promoted label steps (11px/12.5px, measured constant)") is the TRUE half and
   contradicts the first. The stamp's visible follow-through on THIS family is the root
   font-size only — no family-rendered text follows it. One clause fixes the cell (the echo
   reaches the root and any consumer content OUTSIDE the meta row, which the composed family
   never produces).
2. **[LOW] The ink-freeze phrasing is scoped-true but reads general.** "the meta/title ink
   keeps its light --jx-muted-foreground (the --jx-* set is :root-only — frozen)" holds under
   the stage pin / scoped `.dark` islands (measured holding at 0.3211) — but at ROOT-level dark
   the same alias re-derives (my body-level clone under `html.dark` reads the dark 0.8452).
   The standard alias law is two-sided; one qualifier ("under a scoped island") completes it.
3. **[LOW] Name the pin site in the family/page docs.** The captor is exactly ONE element
   (`div[data-theme="light"].jx-light`, the canvas stage) — my chain walk found a single pin.
   One sentence naming it (marginalia's task-74 re-adjudication may refine the mechanics; the
   site name stands today) saves the next auditor the chain walk.
4. **[NIT] The stage constrains the shell** — the served demo footer measures 659px wide inside
   its stage at 1280 (the 90rem cap shows via max-width, not actual width). The page's
   "measured 1440px wide, centered, at a 1600 viewport" receipt needs an out-of-stage
   measurement to be literally true; max-width + centered margins are the honest in-stage
   receipts.

## Gates

- ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0**.
- `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on terminal-footer.html/+page.(svelte|ts)** (fleet
  rc=1 = pre-existing debt elsewhere — untouched files; sibling noise receipted: quill's toc,
  marginalia's re-adjudication probe, scribe's toast are in flight, not mine to chase).

## Cross-check (quill's report 67, read only after the verdict was filed)

- **Concordance (full) on the headline receipts**: the host layer (page --border flips white
  at body/main under html.dark — her oklch(1 0 0) at body/main, mine identical; the served
  demo stays black-stroked; the body-level clone re-derives white), the island named as
  `data-theme="light"` + `.jx-light` (my chain walk finds exactly one captor element carrying
  both), the inside-component split (stroke re-derives, --jx-muted-foreground ink holds), the
  ghost clamp (140.8/144), the seams (16/24/32 — her widths 600/800/1280, mine 500/800/1200,
  same thresholds), the hover seam triad (0.15s / 2s-under-injection / RM-preserved), density
  paint-invariance at 2xs/lg, shape/radius 0px + elevation none, the EXTRA verdict's wording
  and source facts, KEYED-EACH empty by construction, LAW #19 zero dupes.
- **Color hue discipline concordance**: she quotes L/C only ("hue never" — the brand-hue
  runtime rotated hues 124/165/185 across her loads); my hover receipt read primary at
  **hue 53** — a fourth hue value with identical L/C, independently confirming her rotation
  claim and her quote discipline.
- **THE CONFLICT — her size receipt vs my served-DOM measurement (finding 1)**: her probe
  claims "30px © line under a 30px stamp"; mine measures the © line at **12.5px under an 18px
  stamp** (and 12.5px ambient), with the metaRow atom's fixed `--jx-text-small` step as the
  structural reason no family-rendered text can inherit past it. The atom table arbitrates:
  the metaRow sets the fontSize, every free text lives inside it. My MINOR stands, now
  double-evidenced; her ghost-immovable and title/copyright-constant halves reproduce.
  (Possible reconciliation: her 30px read may have been the ROOT font-size, not the © line —
  the root DOES echo the stamp.)
- **Additions from my pass (not in hers)**: the clean-state component `.dark` in-place stamp
  (she measured the class landing and the host-driven flips; the in-place re-derive with the
  ink holding is mine); the ROOT-level-dark completion of the ink story (the body-level clone
  under html.dark reads the dark 0.8452 — "frozen" is scoped-island-true, root-dark
  re-derives; my LOW 2); the query-seat narrow flip measured live (13px at 600 vs 18px at
  1280); the toc rail double-render dedup note.
- **Gate-shape note**: her ambient solo was docs-ambient-vocabulary (284/284); mine the
  three-file batch2/structure/nav-filter set (56/56) — different solo selections across
  rounds, both green; no contradiction.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 45128 + listener 45185 (/tmp/t75/*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. DOM injections (html.dark, the body-level clone, the .dark stamp,
  the --motion-150 injection) all restored in-probe; RM/colorScheme emulations reset.
- Probe faults owned: my first own-dark segment ran while my own `html.dark` injection was
  still live (before/after both white — contaminated); redone in a clean light state. My first
  density filter looked for the rung on the footer root; the DensityDemo stamps the wrapper
  (the §4 scope half) — re-pointed. My first size-echo read grabbed the column-title span as
  "the © line" — re-pointed to the metaRow's direct span child, which is what adjudicated
  finding 1.
