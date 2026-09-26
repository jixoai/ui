# TASK 24 — CODE combobox (vellum)

Tier decision: **Tier 2 (the full archetype)** — the family is a flagship composite (the
hardest ARIA contract in the fleet + the form-field bridge + multiple/showClear + the
popover orchestration), the page already carried seven sections of honest demos, and the
axes surface needed the measured table. Everything short of a PILOTS extraction.

## What shipped (2 files, +149/−20)

- `apps/www/src/routes/docs/components/combobox.html/+page.svelte` — rebuilt to the MDN
  archetype: hero (1×h1, headingLevel={1}) → DocsInstall → **new Overview** (commit paths /
  the measured ARIA contract / the theme split + kinship) → Usage → workbench canvas →
  catalogue demo → multiple+clear → RTL → Types → Accessibility → Theming (corrected token
  table) → **The eight axes** (measured per-axis table + the folded universal demo + a NEW
  query() seat) → API (arithmetic summary) → DocsSeeAlso. Kept every pre-existing id for
  deep links.
- `apps/www/src/routes/docs/components/combobox.html/+page.ts` — toc rebuilt: **order == DOM
  exactly** (the old toc listed `usage` after `types` while the DOM had it second, and omitted
  `multiple`; now 10 entries, all ten DOM ids, machine-checked okOrder: true).
- No family files touched. No commits, no push.

## Measurement-first receipts (probe: /tmp/vellum-24-cb-probe.mjs, -cb-query.mjs; JSON:
/tmp/vellum-24-cb-probe2.json)

**SSR bytes**: status 200 · 1,159,495 → 1,177,527 bytes · h1 count **1** · install + see-also
markers present · DOM id order now the archetype's.

**The ARIA contract, MEASURED (all green)** — focus opens the panel (`:popover-open` true,
`aria-expanded="true"`); `aria-controls === aria-owns` = `{id}-listbox`, role `listbox`;
listbox IS a DOM sibling (top-layer, `popover="auto"`); after ArrowDown + Enter,
`document.activeElement` is STILL the input (zero focus restitution, `aria-activedescendant`
syncs with `[data-jx-combobox-active]`); filter `bun` → 1 row, Enter commits display
"Bun.Terminal" and closes; multiple instance: 1 chip, `aria-multiselectable="true"`,
`.jx-combobox-check` present, chip × labelled "remove node-pty", bridge `aria-hidden="true"`.
Panel anchor style measured: `position-anchor: --jx-cbx-s9; position-area: bottom; --jx-p: 0`.

**Density — LIVE THROUGH FOUR CHANNELS + the floor asymmetry (measured across
DensityDemo's xs/sm/default/lg scopes)**:

| channel | xs | sm | default | lg |
|---|---|---|---|---|
| `.jx-label`/`.jx-error` (`--jx-text-secondary`) | 10px | 11px | 12px | 14px |
| input voice (`--jx-text` via jx-html-control-lane) | 11px | 12px | 13px | 15px |
| `.jx-field` gap (`--jx-stack`) | 4px | 4px | 8px | 8px |
| lane min-height (`--jx-hit` − 2px) | 26px | 30px | 38px | 46px |
| shell minHeight (stylex, FIXED) | 40px | 40px | 40px | 40px |

The asymmetry: shrink is dead below the fixed 2.5rem shell floor; grow is live at lg (the
46px lane outgrows it). The chips stay 1.5rem fixed. Under ambient scope boxes the family's
own `data-density` attr stays ABSENT (measured null — the tokens cascade from the ancestor
rung scope); an explicit lane stamps the field root (`query`-resolved `large` landed
`data-density="lg"` — the small→sm · medium→default · large→lg alias law).

**Size — the §11 echo, nothing follows**: stamp lands verbatim (`--jx-size-effective: 14px;
font-size: var(--jx-size-effective, 1rem)` measured on the root inline; computed 14px/18px)
and the input voice is the lane's `var(--jx-text)` (density-governed, overrides the
inheritance); shell floor is rem-of-page, paddings ride px channels, option voices token
steps — no em-of-parent anywhere.

**THEME-SPLIT — the page's same-token demonstrator**: wrapping the multiple-demo field in
`.dark` and re-reading computed styles: shell border FROZEN at the typed pole
(`oklch(0 0 0)` — the light border), well shadow FLIPPED (`rgba(255,255,255,0.12) inset` —
the dark well), panel ink flipped (`oklch(1 0 0)`), option ink flipped (raw color-mix, L
0.82). The demonstrator pair, measured in one read: under `.dark`,
`--terminal-hover` (raw) = mix of WHITE 14% over near-black while
`--jx-terminal-hover` (typed) still mixes BLACK 14% over near-white — the same sheet token,
two emission forms, two time-bases. In the listbox: the hover MACHINE lands the dark ground;
the active/selected grounds (typed `tokens['--jx-terminal-hover']`) stay at the light pole.
Plus the third time-base: the shell's `colorScheme` flips on `prefers-color-scheme` (media),
not the class. Emission census: 22 family-scoped rules; the typed pole emits at
`:root, .xbpgcew` (the stylex emission), the raw machines are the css residue.

**Supply-only rows (grep receipts over src/lib/ui/combobox/)**: zero reads of
`--jx-size-effective`/`--jx-shape*`/`--jx-radius*`/`--jx-color-effective`/`--jx-elev*`/
`--jx-motion*`/`--jx-density-coefficient` in the family — shape/radius/color/elevation rows
are supply-only; elevation's shadow is the F-1 well sweep (`var(--shadow-well)`), the
sheet's own machine. Motion: axis carrier unread, but the kernels are live
(`--motion-100/--motion-150` ease-out transitions, the reduced-motion kill, the WAAPI
`--jx-p` timeline).

**query() seat — NEW demo, two-viewport flip MEASURED**:
`density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' })}` — at 1440 (≥64rem):
field attr `lg`, input 15px, label 14px; at 900: attr null, input 13px, label 12px. Caption
states 64rem (the lg VIEWPORT_SCALE key), not 40rem.

**API arithmetic**: 22 meta rows − 8 ambient axes = 14 family rows; the synthesized `rest`
row hides behind the curation (`rest: { hide: true }`) — the spread is REAL here
(HTMLInputAttributes minus value/size/color ride to the native input) — 21 served; the
curation corrects value/multiple's generic degradation (drift-lock pinned).

## Corrections of false claims found on the old page

- Universal-props summary claimed "the family CONSUMES size and color" — FALSE on both
  (measured: size echo-only; color supply-only, zero carrier reads). Rewritten.
- Theming token table claimed `--jx-text: 11/12/13/15px` with no attribution of the OTHER
  channels, and `--jx-hit: 28/32/40/48px` implying the shell scales — the shell floor is
  FIXED 40px; the table now carries the four measured channels + the floor asymmetry + the
  three icon slots + `--jx-cbx-{id}` + `--jx-p` + colorScheme.
- toc order violated the order==DOM law (usage after types; multiple missing). Fixed.

## Popover-composition + cascader kinship (dispatch watch-items, resolved)

- The popover-family "deliberate duplicate" question: combobox does NOT compose
  popover.svelte — it re-adopts the ORCHESTRATION LAW natively (popover="auto" +
  showPopover/hidePopover + the :popover-open live-read race law) and genuinely shares the
  MOTION kernel (createSurfaceMotion, lib/surface-motion.ts). Documented as the select
  family's panel law, not a duplicate component; see-also stays data-driven
  (componentContext().related).
- Cascader kinship (registry): cascader is the ruled chain-of-native-selects route — the
  honest-path cousin where dependent choices need no typing; named in the Overview's
  kinship sentence next to select (composite sibling) and tags-input (chip law).

## Gates (all run in the main dir; NO commits, NO push)

- Affected specs solo BEFORE the edit: 7 files (form-components, form-expansion,
  props-table-meta-drift, defaults-form-families, batch4b-components, composition-e,
  docs-ambient-vocabulary) — **7 passed, 432/432**.
- Same 7 solo AFTER: **7 passed, 432/432**.
- Page-scoped svelte-check: **0 mentions of the combobox page** (fleet 1606 → 1604 errors /
  633 → 632 files — my rewrite REMOVED the old page's 2 latent cx errors via the banked
  filter-predicate typing; fleet baseline drifts with siblings' merges).
- `verify:tailwindless` — receipt, bound verbatim: `files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design
  §16.2); drift either direction is red`.
- `verify:docs` — ✓ all docs pages pass the skeleton lint (staged scope green).
- `verify:docs-universal` — **FAIL, SIBLING-ATTRIBUTED**: `native-scroll-area.html: marker
  missing (page count 110)` — pages 110 vs markers 109, the only missing marker is
  native-scroll-area, whose `+page.ts` is an UNTRACKED in-flight file of quill's
  (`?? .../native-scroll-area.html/+page.ts`, report 21-native-scroll-area.md in flight).
  My combobox page carries its marker (the 110 count includes it). Untouched per the
  sibling law.
- PILOTS: not extractable — the demo usage mirrors remain the recorded hand-authored
  follow-up (card-grid/code-card precedent); the workbench canvas keeps the `?raw`
  same-source drawer.

## Process

- Port 5242 empty before (rc=1) and AFTER teardown (rc=1); wrapper 94253 + vite child 94289
  both killed by PID (pids in /tmp/vellum-24-cb-pids.txt).
- Siblings' in-flight files untouched (git status shows only my two files modified by me;
  descriptions/+page.svelte and native-scroll-area are quill's/scribe's).
- Probe code in /tmp (vellum-24-cb-probe.mjs, vellum-24-cb-query.mjs + probe2.json).

## Verdict

**PASS** — Tier 2 delivered: archetype order + toc==DOM + measured eight-axis table with a
live query() seat; the hardest ARIA contract in the fleet measured end-to-end; the theme
split promoted to a measured same-token demonstrator (hover machine vs frozen
active/selected pole); three false/under-attributed claims corrected.
