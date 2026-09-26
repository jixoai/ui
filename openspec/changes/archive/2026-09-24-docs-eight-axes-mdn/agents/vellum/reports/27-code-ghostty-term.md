# TASK 27 — CODE ghostty-term (vellum)

## Tier decision: TIER 2 (优化重构)

Gap analysis against the skeleton's present state (955 lines, 10 sections):
the page was already law-grade where it counted — a rich live workbench
(loopback shell + 9-knob playground), the wasm supply-chain install section
(id="install" existed), typed degradation demos, a law section ("the wasm is
the terminal"), an A11yTable, and hand API tables. What it LACKED was the
archetype's measured layer and tail: NO Overview, NO DocsSeeAlso (SSR
`data-doc-see-also` false), NO measured axes table (#universal-props was a
bare 2-panel demo), toc missing universal-props, the tail trio unordered
(accessibility before universal-props before api), install inside the toc
(chrome — the BOARD ruling puts it out), and a LIVE API-table misfold (below).
Tier 1 would leave the axes table absent; tier 3 would rewrite law-grade
sections and a 1,676-line wasm family that owns its own spec suite — neither
justified. Tier 2.

## The EXTRA-lane misfold (found fixed — the carriers-bijection ruling live)

The pre-edit served API table carried the `universal` directive with NO docs —
so props-table's fold filtered BOTH authored rows named as axes: the served
contract table showed 9 rows, hiding the family-specific density row (the
"'default' · ambient scope" own — contract, not the generic auto) AND the
theme-object row, WHILE the folded generic section served the light/dark/system
theme enum the family does not accept. Double misfold, measured pre-edit
(probe: api table = [cols, rows, auto, fontSize, wasmUrl, onData, onResize,
class, children]). FIX: the docs.extra EXTRA lane — the density + theme rows
hoisted as consts passed BOTH in props and in `docs={{ extra: [apiDensityRow,
apiThemeRow] }}` (reference identity exempts them from the fold). Post-edit
served table: **11 rows including theme (position 6) and density (position
9)** — measured. The universal marker stays on the api table; the generic
8-row fold beneath it is the shared vocabulary reference, and the family truth
lives in the axes table's theme row.

## The eight axes — every cell measured or negative-grepped

- **density — CONSUMED, the one live ladder**: the cell-metric kernels ARE the
  contract. Measured kernel ladder across the demo rungs (data-density stamped
  on the family root): `--jx-text` 12/13/15px, `--jx-line` 18/20/24px at
  sm/default/lg. The family own 'default' (densityAxisSlot('default')) is the
  always-concrete cell math.
- **size — the §11 echo with a built-in nothing-follows proof**: stamp lands
  verbatim (measured root inline `--jx-size-effective: 13px; font-size:
  var(--jx-size-effective, 1rem)`; computed 13px / 18px at the two demo lanes)
  while the error face rides the FIXED `--jx-text-base` voice — measured 13px
  at BOTH size lanes. A div carries no size-like attribute.
- **shape / radius / color / elevation / motion — SUPPLY-ONLY**: grep
  receipts, zero carrier readers across ui/ghostty-term/ + vt-deps.ts; zero
  border-radius, zero shadow declarations, zero transitions in the family css.
  (The demo window's float shadow is PAGE chrome — --shadow-md on the demo
  shell — not the component.)
- **theme — THE SHADOWED SLOT + the typed-frozen split**: the contract's
  theme slot is `absentSlot<GhosttyTermTheme>()` (the defaults file) — a
  structured shell-color object; ABSENCE = the token sheet owns the shell;
  'light'/'dark'/'system' are not lanes. THE MEASURED SPLIT: inside a scoped
  `.dark` the surface keeps the :root pole — ground oklch(0.9551 0 0), ink
  oklch(0 0 0), both UNCHANGED while the scope's own `--terminal` reads the
  dark pole (oklch(0.2 0 0)) — and the content is the wasm's ANSI, absolute
  under any theme. A terminal is deliberately theme-independent:
  typed-frozen by construction, ANSI-verbatim by contract.

## Structural changes (2 files, +313/−129)

- **+Overview** (3 paragraphs: the wasm anatomy + pty ownership; the typed
  degradation machine + sha256 supply chain; the axes story + kinship).
- **+#universal-props rebuild**: the measured 8-row table, receipts note, a
  NEW query() case (`size={query({ md: 18 }, 13)}` — md key = 48rem, caption
  cites the key), the 2-panel demo retained below.
- **+#api misfold fix** (above) with the EXTRA-lane arithmetic in the summary
  (meta 27 = 26 named + synthesized rest; hand table serves the 11 consumer
  rows).
- **+DocsSeeAlso** at `id="see-also"`; **+Overview** at id="overview".
- **DOM reorder to the archetype**: install / overview / workbench /
  degradation / density / law / usage / api / axes / accessibility /
  see-also — the api → axes → accessibility trio LAST; install carries
  id="install" (the hand supply-chain section kept — law-grade), workbench
  gains the data-region canvas pair.
- **toc rebuilt**: follows DOM exactly with chrome OUT (install + see-also
  excluded — the BOARD ruling); 9 entries, machine-checked ok:true.

## Incident during the task (disclosed)

Mid-edit, the integrator's commits (4cfde004/b4791f7f) landed on the shared
tree and my uncommitted +page.svelte edits were stomped back to HEAD (only the
cx predicate fix survived — applied after the clobber). All edits were
re-applied from context and re-verified write-then-verify; nothing of the
final state depends on the lost intermediate. The card-grid `+19` line diff
and `probe-bi-tmp.mjs` on the tree are marginalia's in-flight work — untouched.

## Gates (all green)

- Baseline BEFORE (11 files: ghostty-term, ghostty-vt, mouse-probe,
  osc-probe, title-prop, title-timing, defaults-w4-content,
  density-adoption-form-boolean, docs-ambient-vocabulary, docs-structure,
  props-table-meta-drift): **482/482**.
- AFTER: same 11 files **482/482** — including docs-ambient-vocabulary now
  fully GREEN (the 3 navigation-menu failures from my mid-task run cleared at
  quill's integration 4cfde004 — no attribution note needed).
- Page-scoped svelte-check: **PAGE CLEAN (0 mentions)**; fleet 1603 → 1600
  errors / 629 → 628 files (the rewrite removed the page's latent
  `filter(Boolean)` cx error via the banked predicate typing).
- `verify:tailwindless` — receipt, bound verbatim: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim
  (explicit-props design §16.2); drift either direction is red` (✓ GREEN,
  @utility freeze 0).
- `verify:docs` — ✓ all docs pages pass the skeleton lint (staged scope green).
- `verify:docs-universal` — **GREEN 110/110** (the universal marker stays on
  the api table's shared section).
- Post-rewrite DOM verify (probe /tmp/vellum-27-ghostty-verify.mjs): toc==DOM
  ok:true, 1×h1, install + see-also present, axes table serves all 8 rows, api
  contract table 11 rows (theme + density restored), universal fold + marker
  present, zero pageerrors (the 4 ERR_CONNECTION_CLOSED console entries during
  probing are the page's own deliberate invalid-wasmUrl degradation demos).

## Diff (mine)

- `apps/www/src/routes/docs/components/ghostty-term.html/+page.svelte` (+313/−129 content)
- `apps/www/src/routes/docs/components/ghostty-term.html/+page.ts` (toc)
- No family files touched. NO commits, NO push.

## Process

- Port 5242 empty before (rc=1) and after teardown (rc=1; vite 5293 + wrapper
  5259 killed by PID).
- Probes: /tmp/vellum-27-ghostty-probe.mjs (pre-edit receipts incl. the
  misfold), /tmp/vellum-27-ghostty-verify.mjs (post-edit).

## Open questions for reviewers

1. The universal directive STAYS on the api table (marker + generic reference
   section) with the EXTRA lane restoring the two family rows — the
   code-card precedent — but the generic theme row now sits two tables away
   from the axes table's SHADOWED row. Comfortable, or should the generic fold
   hide the theme row fleet-wide (a from-meta change, out of scope here)?
2. The axes `theme` row's type cell reads "SHADOWED — the shell-theme OBJECT,
   not the axis enum" instead of a union — the honest shape, but it breaks the
   table's type-voice pattern; reviewer call.
3. The Overview's kinship pair (terminal-card, code-card) is hand-picked;
   DocsSeeAlso stays data-driven — flag if the kinship sentence oversteps.
