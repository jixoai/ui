# TASK 66 — FIRST REVIEW tags-input (scribe, 2026-09-24)

- **Reviewer**: scribe (1st of 2; independence law held — vellum's report 43 was opened
  only AFTER the findings below were fixed by my own source reads + live probes; the
  concordance addendum follows at the end)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/tags-input.html/`
  (+page.svelte 676 lines + +page.ts, 10-entry toc) over the tags-input family
  (svelte 613 / stylex 147 / css 167 / defaults 58 / barrel). Target paths clean in the
  working tree; the in-flight sibling set untouched.
- **Method**: source reads (page, component, defaults, the kernel-lane chain), headless
  Chromium over dev SSR :5243 with warm-reload discipline, a LIVE mutation census driven
  through the workbench's real input (Enter, duplicate submit, Backspace-on-empty,
  comma-paste — deltas against the bound set at every step), the combobox announcement
  battery, the density seat driven across 48rem with kernel-lane reads, a scoped-.dark
  island probe AT THE PAINT, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Every headline claim verified
  TRUE with digit receipts; the drift #13 flag confirmed latent exactly as billed.

## The headline claims — verified TRUE (my own instruments)

1. **LAW #18'S DOUBLE-WEIGHT PASS — VERIFIED LIVE.** The chips each keys the composite
   **`${tag.value}#${index}`** (source :495) — duplicate tag VALUES are structurally unable
   to collide. The mutation census driven on the workbench field (bound set [svelte, node],
   the canvas echo tracking every step):
   - **Enter +1**: typed rust + Enter → [svelte, node, rust];
   - **duplicate submit +0 with the flash**: committing "node" again → chip count
     unchanged, the **`jx-tags-flash` class on the EXISTING node chip** sampled inside the
     window and **gone after 450ms** (the 200ms authored flash ≤ the 300ms bound);
   - **Backspace-on-empty −1** → [svelte, node];
   - **paste `deno, bun` +2** → [svelte, node, deno, bun] (one commit per comma part).
   The page stayed **fully interactive through the whole sequence** (the input still
   opens the suggestion panel afterwards, aria-expanded true) with **zero console
   errors/warnings** — no hydration abort, the composite-key design holding under the
   worst case.
2. **THE COMBOBOX ANNOUNCEMENT CONTRACT — VERIFIED.** Typing 's': **aria-expanded true**,
   **aria-autocomplete="list"**, **aria-activedescendant="s2-sug-0" resolving to a REAL row
   id** in the `aria-owns`/`aria-controls` listbox (the rows also demonstrate the
   duplicates-off filter hiding present tags — typescript leads with svelte committed).
   ArrowDown moves the roving highlight to `s2-sug-1` (rust); **Enter commits the
   HIGHLIGHTED suggestion**. Chip × buttons announce **"remove svelte" / "remove node" /
   "remove rust"** (aria-labels, not textContent). The chip host is the shell's
   **role=listbox aria-orientation="horizontal"** with every chip **role="option"
   aria-selected="true"**.
3. **ERROR WIRING — VERIFIED.** The error instance: input **aria-invalid="true"** +
   **aria-describedby="s11-error"** → the id **exists** rendering the error text, and the
   dashed-shell state attribute is present.
4. **DENSITY CONSUMED — VERIFIED ACROSS 48REM, with the digit receipt.** The query seat:
   **data-density lg @1280 → sm @600** and the kernel lanes rescale — the computed
   `--jx-hit` equations resolve **48px (lg: 0.25rem × 12) → 32px (sm: 0.25rem × 8)** while
   the input's consumed min-height computes **46px → 30px** (the hit lane minus the 2px
   border pair). The row's "hit height flips 48px → 32px" is true of the LANE; the input
   box consumes hit − 2.
5. **THE ROOT-PINNED ALIAS — VERIFIED AT THE PAINT (my data point for the fleet
   adjudication).** Chip ground light **oklch(0.9551 0 0)**; under a scoped `.dark` island
   the scope's `--muted` **re-derived** to oklch(0.2178 0 0) while the **chip's own
   background HELD** 0.9551; at **root-level html.dark** the chip **flipped** to 0.2178;
   removing the class restored exactly. Element-level paint reads throughout — the
   var-vs-paint law applied (no html-level read stands in for the chip's paint).
6. **DRIFT #13 — CONFIRMED LATENT, AS BILLED.** The suggestion rows each keys
   **`(suggestion.value)` alone** (source :583) — a consumer-supplied duplicate suggestion
   value would mint duplicate keys and abort hydration (the LAW #18 class). Latent, not
   shipped-colliding: the page's catalog carries 9 unique values, duplicates-off filtering
   hides present ones, and the live run shows zero key collisions (LAW #19 + console
   clean). The chips each's composite key is the same one-word hardening, family file.
7. **STRUCTURE — VERIFIED.** toc **10 == +page.ts == DOM == SSR rail ×2 surfaces**
   (overview, live-demo, demo, rtl, types, usage, theming, api, universal-props,
   accessibility; install/see-also chrome OUT) — the demo/rtl ordering fix and
   universal-props addition both served. Payload 1,103,869 bytes; h1 ×1; universal marker
   ×1; 0 undefined/null literals.

## Standard battery

- **EXTRA-lane by name**: the api table serves all 10 rows (tags $bindable, suggestions,
  name — the form bridge's JSON array, placeholder, label, error, maxTags,
  allowDuplicates, disabled, variant own-auto) + the Tag shape (value/label/removable);
  the axes table serves its 8 measured rows.
- **THEME-SPLIT (six mechanisms + var-vs-paint)**: the consumed density lanes (measured),
  the §1 carrier/intercept boundary (source-documented), the root-pinned alias (measured
  at the paint), class:dark for composed descendants (source), the ambient scope channel
  (the ruler), zero effective-readers (the supply stays supply — grep receipt in the row).
- **Vocabulary-grep**: zero `jxoai` misspellings; family transitions only where the motion
  row claims them.
- **KEYED-EACH + mounted children**: chips composite-keyed (mutation census above);
  suggestion rows value-keyed (drift #13, latent); **LAW #19: 101 ids, zero duplicates**;
  zero console errors/warnings across every session.
- **Gates**: ambient solo **284/284 rc=0** (the separator :505 parse break from task 64's
  run has been fixed — the suite is green corpus-wide again) · docs-universal **110/110
  GREEN** · svelte-check **page 0 diagnostics** (family: the Object.entries overload, a
  `chrome` prop type error, and the fleet provideUniversalLanes warns — pre-existing,
  unchanged files).

## Findings (severity-tagged)

1. **[NONE]** — no MAJOR, no MINOR, no LOW, no NIT on any dispatched claim.
2. **[LEDGER — drift #13 confirmed, family file]** The suggestion rows' value-alone keys
   (source :583) stay the one-word hardening (`(suggestion.value)` → the composite form)
   for the family owner; latent on every shipped surface (all catalogs unique), exactly as
   billed.
3. **[RECEIPT PRECISION — no action]** The density row's "48px → 32px" is exact at the
   LANE (`--jx-hit` 48/32 via the rung equations); the input's computed min-height consumes
   46/30 (hit − 2px border pair). My probe receipts both numbers so the next auditor
   doesn't read the 2px as drift.

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 82740 + wrapper 82712**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** The island and root-dark classes
  were reverted in-probe (restored ground re-read); siblings' in-flight files untouched.
- Independence: vellum 43 opened only after the findings above were fixed; concordance
  follows.
- Instrument honesty: my first density read measured the SHELL rect (80px @lg — the shell
  wraps the chips area too, not the hit lane); re-read at the input element + the
  computed `--jx-hit`/min-height, which is the honest seat. The alias probe anchors on the
  chip element itself (paint), never a parent var read.
- Artifacts: /tmp/scribe-66-probe{1,2,3,4}.mjs, /tmp/scribe-66-ssr.html,
  /tmp/scribe-66-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 43)

My findings above were fixed before this section.

- **FULL CONCORDANCE — every overlapping receipt reproduced**: the composite chip keys and
  the four-route mutation census (+1 / +0-with-flash / −1 / +2, no hydration abort), the
  combobox contract (expanded/activedescendant-into-real-rows/autocomplete list/Enter
  commits the highlight/× "remove (label)"/the horizontal option listbox), the error
  wiring, the density flip lg↔sm across 48rem, the root-pinned alias (her --jx-muted HELD
  0.9551 under the island while --muted flipped to 0.2178; my chip-background paint read
  matches to the digit), the toc 10 == DOM == SSR, LAW #19 none, page 0 diagnostics,
  universal 110/110.
- **DRIFT #13 — her OQ1 and the dispatch's flag are the same finding, confirmed**: source
  :583 value-alone keys, latent (unique catalogs), the composite-key one-word hardening
  named for the family owner. Her OQ2 (no density own — the demo scope does the work) is
  consistent with my Defaults read (the no-opinion axis slot).
- **ADDITIONS (mine, not in report 43)**: the kernel-lane equation receipt (`--jx-hit`
  resolves 48/32 via 0.25rem×12/×8 inside the rung max() — with the input box's computed
  46/30 = hit − 2px border pair, so the next auditor doesn't read the 2px as drift); the
  duplicates-off filter receipt visible IN the combobox rows ('s' leads with typescript
  because svelte is already committed); the flash sampled inside AND after the window on
  the same run; the restored-ground read closing the alias probe; and the post-separator-
  fix ambient return to 284/284 corpus-wide.
