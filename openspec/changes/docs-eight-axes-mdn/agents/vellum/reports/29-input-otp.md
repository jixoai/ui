# TASK 29 — CODE input-otp (vellum)

## Tier decision: TIER 2 (优化重构)

Gap analysis: the skeleton (298 lines) carried a live workbench canvas with
drawer + data-region, a variants grid, usage, a11y, a theming DensityDemo +
TokenTable, and a hand API table — but NO install, NO Overview, NO
DocsSeeAlso, NO measured axes table, a falsified universal-props claim (the
copied "family CONSUMES size and color" template text — false on both axes,
measured), a folded density row in the api table (the ghostty misfold class),
a broken toc (otp-demo listed last though first in DOM; universal-props
missing), and the unordered tail trio. Tier 1 would keep the false claim and
the missing layers; tier 3 would rewrite a compact 303-line family that owns
its own behavior specs — unjustified. Tier 2.

## Measurements (probe /tmp/vellum-29-otp-probe.mjs)

- **density — CONSUMED, the slot geometry IS the contract**: slot box =
  max(--jx-hit, --jx-line × 2), measured **32 / 36 / 40 / 48px** across
  xs/sm/default/lg — the line×2 leg WINS at xs/sm (two lines outgrow the
  hit); cell voice --jx-text **11/12/13/15px**; slot rhythm --jx-gap
  **8/8/12/16px**. The ambient attr stays absent under DensityDemo scope
  boxes (the two-channel finding).
- **size — the §11 echo (a falsified claim corrected)**: stamp verbatim
  (computed 14px / 18px on the roots); slot voice stays --jx-text
  (density-governed) and the slot box the hit/line lane — nothing follows.
  The page previously claimed "the family CONSUMES size and color": falsified
  on both, corrected in place.
- **theme — two-voice split, measured**: inside a scoped `.dark` the slot
  frame and ground keep the :root pole (border oklch(0 0 0), ground
  oklch(1 0 0) — a code field keeps its light paper in a dark island) while
  the FOCUS ring flips to the dark ring (measured outline
  oklch(0.7044 0.1872 …) matching the scope's --ring calc form) and the
  complete-state focus ink (--primary) flips with it. The code VALUE is user
  data — never re-themed.
- **shape / radius / color / elevation / motion — SUPPLY-ONLY** (grep
  receipts over ui/input-otp/: zero carrier readers, zero border-radius,
  zero shadows, zero TRANSITIONS — the complete-state border swap is instant;
  LAW #14 clean by absence).
- **Behavior chain — measured live** (synthetic input events): typing in slot
  0 auto-advances focus to slot 1; a 4-char paste into the focused slot
  DISTRIBUTED across the set (slots read 7-3-4-5-6); the a11y model is
  PER-SLOT: role="group" + aria-label from the label prop,
  `autocomplete="one-time-code"` on the FIRST slot only, inputmode follows
  numeric, aria-invalid + aria-describedby wire the error line.
- **The api misfold — found and fixed**: the authored density row (axis NAME,
  family ambient-scope contract) was folded away by the universal directive —
  served contract table was **7 rows**; after the EXTRA lane
  (`docs={{ extra: [apiDensityRow] }}`, reference identity) it serves
  **8 rows including density** — measured. Arithmetic: 27 meta rows (26 named
  + synthesized rest) − 8 axes = the consumer rows served by name.

## Structural changes (2 files, +233/−50)

- +DocsInstall (id="install"), +Overview (per-slot a11y model / bridge honest
  submit / typed paint + kinship), +DocsSeeAlso at id="see-also".
- +#universal-props rebuild: the measured 8-row table, receipts note, a NEW
  query() case (`size={query({ md: 18 }, 14)}` — md key 48rem), demo retained.
- DOM reorder to archetype: install / overview / otp-demo / types / usage /
  theming / api / universal-props / accessibility / see-also (the trio last).
- toc rebuilt: follows DOM exactly, chrome OUT (install, see-also); 8 entries.

## Gates (all green)

- Baseline BEFORE: 7 files **408/408** (batch4-components,
  density-adoption-form-text, defaults-form-families,
  docs-ambient-vocabulary, docs-structure, props-table-meta-drift,
  terminal-patterns).
- AFTER: same 7 **408/408**.
- Page-scoped svelte-check: **PAGE CLEAN (0 mentions)**; fleet 1598 → 1597
  errors / 627 → 626 files (the rewrite removed the page's latent
  `filter(Boolean)` cx error).
- `verify:tailwindless` — receipt, bound verbatim: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim
  (explicit-props design §16.2); drift either direction is red` (✓ GREEN).
- `verify:docs` — ✓ all docs pages pass the skeleton lint.
- `verify:docs-universal` — **GREEN 110/110** (marker count ×1, on the api
  table's shared section).
- Matrix: no input-otp pins existed (checked the fixture) and no ambient rows
  moved — no re-pin needed; ambient solo green within the 408.
- Post-rewrite DOM verify: h1 ×1, install + see-also, toc==DOM, api contract
  table 8 rows incl. density, zero pageerrors.

## Diff (mine)

- `apps/www/src/routes/docs/components/input-otp.html/+page.svelte` (+233/−50)
- `apps/www/src/routes/docs/components/input-otp.html/+page.ts` (toc)
- No family files touched. NO commits, NO push. Quill's popconfirm files
  untouched.

## Process

- Port 5242 empty before (rc=1) and after teardown (rc=1; vite 41020 +
  wrapper 40984 killed by PID).
- Probes: /tmp/vellum-29-otp-probe.mjs (pre + post-edit; the post run
  re-measured the served fold state).

## Open questions for reviewers

1. The axes size row states the falsification explicitly ("the pre-29 page
   text claimed the family CONSUMES size — falsified, this row is the
   correction") — keep the self-correcting provenance in the served table, or
   move it to a review note only?
2. The Overview describes the per-slot a11y model as a design choice; the
   single-hidden-input pattern is the other school — flag if the page should
   name the alternative and why this fleet chose slots.
3. density's api row keeps the raw rung-id union type ('2xs'|'xs'|…); the
   axes row carries the alias ladder — both true, but the table voices
   differ; fine or unify through the curation?
