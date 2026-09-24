# 29 — REVIEW combobox (2nd of 2; scribe — first fully-independent eyes)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: vellum's combobox page (her 1st review was a SELF-REVIEW under the strictest-independence exception — my bar: every claim re-derived from source + served DOM with fresh probes, no reliance on either prior report; vellum 24/28 read only after findings were formed). Medium (LAW #16): Chromium headless, 1440×1000; interactive claims via REAL Playwright keyboard/mouse events; dark-island via IN-PLACE wrap; media claim via `emulateMedia`.

## Per-claim verdicts (all six verified TRUE)

### 1. The two historically-self-fixed MAJORs — regression-clean

- **toc == DOM (machine check)**: the toc data's 10 entries (overview, usage, demo, multiple, rtl, types, accessibility, theming, universal-props, api) each resolve to a DOM section id in exactly that order (SSR href sequence vs `<div id=` sequence; the `jx-canvas-*` ids are engine anchor leaves, not toc entries — the +page.ts comment's documented policy).
- **Corrected axis judgments in place**: size row = "THE §11 ECHO, NOTHING FOLLOWS" (:77); color row = "SUPPLY-ONLY — stamps --jx-color-effective; zero readers" (:105). Five integrations since the fix — no regression.

### 2. FLOOR-ASYMMETRY as shell height — VERIFIED, both directions, digit-exact

DensityDemo's four rung scopes (`xs / sm / default / lg`):

| rung | label | input | gap | lane min-H | shell rendered |
|---|---|---|---|---|---|
| xs | 10px | 11px | 4px | 26px | **40px** (shrink dead) |
| sm | 11px | 12px | 4px | 30px | **40px** (dead) |
| default | 12px | 13px | 8px | 38px | **40px** (dead) |
| lg | 14px | 15px | 8px | 46px | **48px** (46 + 2×1px border — live) |

The shell's own floor is the FIXED `minHeight: 2.5rem` (stylex.ts:53) at every rung; grow is live at lg, shrink dead below 40 — the asymmetry measured in both directions.

### 3. ARIA end-to-end — VERIFIED with real trusted events

- **Focus opens**: real focus → `aria-expanded="true"`, `:popover-open`, full 4-row list with the committed row highlighted (`aria-activedescendant="s2-opt-0"`); `aria-controls === aria-owns === "s2-listbox"`; `role="listbox"` present.
- **Arrows rove, focus never leaves**: ArrowDown ×2 → activedescendant advances to `s2-opt-2` while `document.activeElement` is STILL the input.
- **Filter → 1 row**: typing `sigma` narrows to exactly `["@sigma/pty-ffi …"]`, first match auto-highlighted.
- **Enter commits + closes + flips**: `aria-expanded` → "false", input value `"@sigma/pty-ffi"`, popover closed, focus still the input.
- **multiple**: chips render (`node-pty`), listbox `aria-multiselectable="true"`, picked row `aria-selected="true"` carries the **check glyph** (`.jx-combobox-check`, painted `--primary`, L/C 0.6489/0.237, mask SVG applied, aria-hidden), chip remove × labelled "remove node-pty" and **removal works live** (1 → 0 chips).
- Probe-craft note: synthetic (untrusted) `KeyboardEvent`/`InputEvent` dispatches do NOT reach Svelte 5's delegated handlers — my first pass read expanded=false/no-filtering; real keyboard events verify the full chain. Interactive claims need the real input pipeline.

### 4. Two-time-bases demonstrator — VERIFIED (in-place island, one evaluate)

Wrapped the catalogue field's own cell IN PLACE with a `.dark` island (settled page):

| read | value | verdict |
|---|---|---|
| shell border | **`oklch(0 0 0)`** | TYPED pole frozen ✓ |
| shell ground | `oklch(1 0 0)` | typed, frozen ✓ |
| well shadow | **`rgba(255,255,255,0.12) inset`** | raw machine FLIPS (white-inset dark well) ✓ |
| raw `--terminal-foreground` | `oklch(1 0 0)` | flips ✓ |
| typed `--jx-terminal-foreground` | `oklch(0 0 0)` | frozen ✓ |
| raw `--terminal-hover` | white 14% over near-black | the machine's dark ground ✓ |
| typed `--jx-terminal-hover` | black 14% over near-white | "still mixes its light pole" ✓ |
| HOVERED row (real mouse) | bg `oklab(0.312 0 0)` + ink `oklch(1 0 0)` | the raw machine lands the dark ground ✓ |
| ACTIVE row | light-pole ground + `oklch(0 0 0)` ink | the typed pole paints it ✓ |

One listbox, two time-bases — the claim verbatim, same-token pair in one evaluate. The focus ring also observed flipping under the island (the focused shell's border → the dark `--ring`), matching the row's flip list.

### 5. The NIT I own — the THIRD time base: DISCHARGED WITH BOTH RECEIPTS

- **Source**: `combobox.stylex.ts:60` `colorScheme: 'light'` + `:64-65` `@media (prefers-color-scheme: dark) { colorScheme: 'dark' }` — keyed on the MEDIA, never the class.
- **Probe**: `emulateMedia({ colorScheme: 'dark' })` flips the shell's computed `colorScheme` **light → dark → light** with zero `.dark` class anywhere — the media channel isolated from the class channel (which P5 shows is ignored by colorScheme: inside the island it stayed "light").
- The TokenTable row ('colorScheme — light ↔ dark on prefers-color-scheme', structural) and the theme row's third-time-base sentence are both source- and probe-true.

### 6. 21 served rows by name — VERIFIED, no silent fold

SSR enumeration of the api section: **exactly 21 data rows across 2 tables** — 13 family (`options *`, `value (bind)`, `multiple`, `placeholder`, `label`, `name`, `error`, `id`, `allowCustom`, `showClear`, `disabled`, `variant`, `class`) + the 8 axis-named universal rows (`size, shape, radius, density, color, theme, elevation, motion`). All 8 axis rows serve in this page's table — no silent fold. Matches the api summary's arithmetic as dispatched.

## Findings (severity-tagged)

1. **[NONE]** MAJOR/MINOR on any dispatched claim — every measurement reproduces.
2. **[NOTE · probe craft, load-bearing]** Injected-island discipline (two artifacts produced two false contradictions before the truth landed):
   (a) the island must WRAP IN PLACE at the field's own position — a body-appended island severs the tokenScope/theme-class ancestry and the `--jx-*` chain goes guaranteed-invalid (reads: transparent bg, white fallback borders — which masquerade as a refutation of the frozen pole);
   (b) read only on a SETTLED page — one of my dumps ran mid-HMR-recompile with the stylex theme chunk unloaded and every `--jx-*` read returned empty. After (a)+(b), the claim reproduced exactly.
3. **[NOTE · ambient]** 2 failures, both **kbd-keyed** (`kbd table[0] density#1 → ambient scope`) — not combobox (its rows and meta checks all pass in the same run) and not the named siblings (popconfirm/ghostty-term/input-otp/file-input checks green). Flagged for the orchestrator: likely another teammate's kbd work in flight; not this page's debt.
4. **[NOTE · gates]** An accidental whole-suite run (empty glob expanded to all 187 files) returned 3211/3213 — the 2 failures (form-family undefined-node, search-corpus corpus===toc) are contention flakes: both pass solo and passed inside the full run. Zero real failures anywhere in the suite.

## Gates

| Gate | Result |
|---|---|
| Combobox-pinning family solos (form-expansion 26, composition-e 18, defaults-form-families 28, batch4b-components 13, props-table-meta-drift 34) | **119/119 green** |
| docs-ambient-vocabulary | **282/284** — the 2 failures kbd-keyed (finding 3); zero combobox-keyed |
| verify:docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **combobox.html: 0 diagnostics** (route dir clean) |
| (whole-suite, incidental) | 3211/3213 — the 2 reds contention flakes, green solo |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID after each probe cycle → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Siblings in flight untouched: quill's popconfirm files, vellum's input-otp files, marginalia's file-input review.
- Artifacts: `/tmp/scribe-29-probe{1..9}.mjs`, `/tmp/scribe-29-ssr.html`, `/tmp/scribe-29-check.txt`, `/tmp/scribe-29-dev*.log`.

## Verdict

**PASS** — combobox (2nd of 2; the first fully-independent review). Both self-fixed MAJORs hold five integrations later; the floor asymmetry is digit-exact in both directions; the ARIA chain is end-to-end green on real events; the two-time-bases demonstrator reproduces verbatim with the corrected island craft; the third time base is discharged with source + emulateMedia receipts; and the 21-row contract enumerates clean. marginalia holds reviewer duties per the queue; from my side the page is closure-ready.
