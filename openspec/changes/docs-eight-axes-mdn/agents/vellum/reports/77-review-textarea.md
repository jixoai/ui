# T77 — FIRST REVIEW textarea.html (vellum)

**Verdict: PASS** — **0 MAJOR / 0 MINOR / 2 LOW / 1 NIT**. Every headline claim reproduced on
my own instruments; the two LOWs are phrasing/precision notes, the NIT is an instrument
observation. Independence law kept: findings formed from my own source reads (textarea.svelte
260L, stylex, defaults, the 597-line page, the meta) and two probe passes BEFORE opening
quill's report 68; the cross-check addendum follows.

## The headline claims, re-derived (my probes, 5242)

**THE THREE VERDICT CLASSES — verified on the real element.**
- **Forwarded-WITH-A-JOB**: the textarea-base field reads back `maxlength` attr "280" and
  IDL `maxLength` 280 — and the job is real: the types-count seat's readout renders
  "N / 280" off that same maxlength (the workbench's no-maxlength instance renders plain "N"
  — the source's two modes both observed). `rows` attr "5" read back on the rows-5 seat; the
  family default 4 is the destructure fallback (source :162 — and the rows-4 density
  projection below lands digit-exact on it). `oninput`: source-ordered — the caller handler
  fires after `liveValue`/`value` sync (textarea.svelte:207-213).
- **Forwarded-VERBATIM**: `name="demo_notes"` read off the element; placeholder likewise.
  spellcheck/wrap are not exercised by any served seat — they ride `{...rest}` by source
  (textarea.svelte:240); noted as a seat gap, not a defect.
- **WITHHELD**: no `color` attribute on any field (probe), the axis declared
  (`Omit<HTMLTextareaAttributes, 'color'>` :90 + the color prop) — the §1 collision rule's
  color half holds.
- **§1 size collision**: the size-stamped seat's textarea carries **no size attribute**
  (hasAttribute false); the stamp lands on the field root
  (`--jx-size-effective: 18px; font-size: var(…)` inline, root font 18px).

**Announcement discipline — VERIFIED, both directions.** Code-point counting: 🫠🫠 renders
**"2 / 280"** (4 UTF-16 units → 2 code points). The hysteresis on the maxlength field:
"0 / 280" off → 250 off → **252 polite** (ceil(280×0.9) = 252 — the boundary is exact, not
fuzzy) → 260 polite → back to 251 **off**. The flip is live in both directions at the precise
90% boundary.

**Error contract — VERIFIED.** aria-invalid="true", aria-describedby resolving to the
"! bio is required" line, shell `border-style: dashed` via jx-invalid. The stub correction
holds under the two-read protocol: message paint oklch(0 0 0) == `--destructive` at the field
(oklch(0 0 0) — in this profile destructive IS black; the theme is monochrome end to end),
and the dashed border paints `--border` (0 0 0) — shape, not hue, exactly as the page frames
it.

**THEME STRATA — VERIFIED with the two-read protocol.**
- **L1 page bridge**: emulating `prefers-color-scheme: dark` flips `--border` page-wide
  (oklch(0 0 0) → oklch(1 0 0) at body) — and the mechanism receipt: the site's theme sync
  ADDS `html.dark` on the OS signal (htmlClass observed "js" → "js dark"), so the system path
  rides the class bridge.
- **L2 host island**: the served demo field inside the canvas stage holds the light profile
  under root dark — `--border` at the field 0 0 0, shell paint 0 0 0 (island beats page). Pin
  site: the stage `div[data-theme="light"].jx-light`.
- **L3 component stamp**: adding `.dark` (exactly what `theme="dark"` stamps) to the
  island-pinned field root — **closest scope wins**: `--border` at the field flips to
  oklch(1 0 0) and the shell paint follows (after the border-color transition settles — my
  first read caught the var flipped while the paint lagged mid-transition; the settle is the
  two-read protocol's fine print). The invalid signal stays monochrome at every stratum.
- **Density — VERIFIED digit-exact at the family default.** 2xs: voice **10px**, rows-4 height
  **60px**; lg: voice **15px**, rows-4 height **90px** (the served demo sample is rows-3 —
  45px/68px, exactly rows × voice × 1.5 — and setting the IDL rows=4 reproduces the quoted
  60/90). No-opinion + reactive holds; `data-density` stamps the demo scope wrapper (§4's
  scope half). Zero `--jx-density-effective` readers ✓.

**Structure/battery**: toc == DOM == SSR rail 11/11 (install/see-also chrome OUT). **LAW
#18**: no each block in the family (the count/slots are snippets — the keyed surface is empty
by construction; grep receipt). **LAW #19**: page ids, duplicates NONE (67 total per probe —
the count includes the scaffold's own). **Vocabulary-grep**: size/shape/radius/color/motion/
elevation/density-effective — 0 files each over ui/textarea/. **SSR duality + warm-reload**:
the served fields ship in the raw HTML; the count/error/strata receipts reproduce across
loads (the strata across TWO loads: light-first and dark-first emulation orders both ran).

## Findings

1. **[LOW] The served seats never exercise spellcheck/wrap verbatim forwarding** — the
   headline's forwarded-VERBATIM class is source-true (`{...rest}` on the textarea) and `name`
   is measured, but no served seat passes `spellcheck` or `wrap`, so the class's measured
   receipt covers name/placeholder/maxlength/rows only. One attribute on an existing seat
   (e.g. `spellcheck="false"` on the base demo) would complete the class on the served DOM.
2. **[LOW] The density heights (60/90) are rows-4 projections** — the served DensityDemo
   sample is rows-3 (45/68 measured; exactly rows × voice × 1.5). The quoted numbers
   reproduce only after setting the IDL rows=4 — worth naming the rows in the cell so the
   next probe doesn't read the 45/68 as a contradiction.
3. **[NIT] The L1 mechanism is the site's theme sync, not bare prefers-dark** — the flip is
   real but arrives via the scaffold adding `html.dark` on the OS signal (observed "js" →
   "js dark"). The axisRow's "under prefers-dark (system theme)" is user-true; the mechanism
   footnote would make the receipt self-contained.

## Gates

- ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0**.
- `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on textarea.html/+page.(svelte|ts)** (fleet rc=1 =
  pre-existing debt elsewhere; siblings quill/website-scaffold, marginalia/tabs, scribe/toast
  receipted, untouched).

## Cross-check (quill's report 68, read only after the verdict was filed)

- **Concordance (full) on the headline battery**: the three verdict classes (her forwarded-
  with-a-job / verbatim / withheld framing matches my measurements), code-point counting
  (🫠🫠 = 2), the aria-live hysteresis with the exact ceil(90%) boundary and both-direction
  flip, the error contract, the §1 size collision, all three theme strata, density 10px/60px
  vs 15px/90px, the zero-reader greps, KEYED-EACH empty, LAW #19 — all reproduce under my
  independent probes.
- **Instrument note (hers, now mine)**: her measured maxlength=10 seat ("5 / 10" law, polite
  at 9/10) is NOT on the integrated page — the served seats cap at 280 (my boundary receipt:
  polite at exactly 252 = ceil(280×0.9)). Her probe live-mounted the 10-cap instance; the
  integrated page demonstrates the law at the 280 cap. Same formula, different cap — no
  conflict, but the dispatch's "maxLength=10 read back" lives on in her probe, not in a
  served seat. This folds into my LOW 1 (the served seats don't exercise the verbatim class
  fully either): the page could carry one small-cap count seat and one spellcheck/wrap seat
  and every headline number would be served-DOM verbatim.
- **Additions from my pass (not in hers)**: (1) the workbench's no-maxlength count mode
  observed live — the readout renders plain "21" with aria-live permanently off, the source's
  two modes both demonstrated on the served page; (2) the SETTLED L3 two-read — the var flips
  instantly while the shell paint follows only after the border-color transition (my first
  read caught the divergence; the settle is the protocol's fine print) — her L3 was
  source + attr receipt, mine adds the settled paint flip; (3) the rows-4 projection
  arithmetic (the served DensityDemo sample is rows-3: 45/68 = rows × voice × 1.5; the
  quoted 60/90 reproduce at the family default) — reconciles her quoted numbers with the
  served sample; (4) the L1 mechanism footnote — the site's theme sync adds `html.dark` on
  the OS signal (observed "js" → "js dark"), so "under prefers-dark" rides the class bridge.
- **Conflicts**: none. Her open question 2 (the api summary's 20-named-props count vs the 12
  rendered rows) is a fleet-convention call — noting concurrence that either convention is
  fine if stated once.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 56193 + listener 56256 (/tmp/t77/*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Emulations (colorScheme, reduced-motion where used) reset in-probe;
  the html.dark injection in the strata segment was site-synced (observed, not fought).
- Probe faults owned: my first count-hysteresis run targeted the workbench field (no
  maxlength → the hysteresis never arms; all-off reads are CORRECT there — the workbench
  demonstrates the plain-N mode) — re-pointed to the maxlength seat; my first L3 read caught
  the var flipped while the paint lagged the border-color transition — the settle is part of
  the two-read protocol (the T73 first-frame lesson, transition edition).
