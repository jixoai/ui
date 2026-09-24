# TASK 68 — CODE textarea.html (quill, 2026-09-22)

**Tier 2 (archetype rebuild).** The 428-line page had real content (the slot
system, the error law, a live playground) but violated the archetype: no
install/overview/see-also, the ToC scrambled (the demo listed AFTER api), no
measured axes rows (the universal section was one prose sentence), no query()
seat, and the theming section's density story unquantified. Two files changed,
both page-level: `+page.svelte` + `+page.ts`. NO commits, zero family edits.

## What changed

1. **Archetype rebuild**: hero → `#install` → `#overview` (3 law-notes) →
   `#live-demo` (the playground, promoted to the archetype anchor) →
   `#textarea-base` (W3C foundation — the old #demo) → `#types` → `#slots` →
   `#error-wiring` → `#usage` → `#theming` → `#api` → `#universal-props`
   (measured axes table + receipts + query() seat + specimens) →
   `#accessibility` (expanded) → `#see-also`. ToC == DOM **11/11**, chrome
   OUT, trio LAST (probe PASS).
2. **Measured axes table ×8** (rows below) with the receipts paragraph.
3. **query() seat**: `query({ md: 18 }, 13)` on the size lane (the field
   voice follows; the native element never sees a size attribute).
4. **EXTRA-lane BY NAME** — the verdicts the brief asked for, all measured:
   - **attribute-transparent, NOT rest-less** (the anti-progress): the native
     textarea attribute set rides the rest spread onto the real element.
   - forwarded BY NAME with a job: `maxlength` (drives the count readout,
     measured maxLength=10 read back), `rows` (declared default 4, verbatim),
     `oninput` (the family syncs, then forwards a caller handler).
   - forwarded verbatim: `spellcheck` (measured false), `wrap` (measured
     "hard"), `name`, and the rest of HTMLTextareaAttributes.
   - withheld: the `color` ATTRIBUTE (Omitted — the color AXIS is not), a
     caller `data-density` (captured by the axis stamp).
   - the size/color AXES are CONSUMED (§1 collision rule): size-stamped
     fields measured carrying NO size attribute on the native element.
5. **Announcement discipline measured**: the count readout counts CODE POINTS
   (🫠🫠 = 2, never two UTF-16 units), announces `N / maxLength` with
   `aria-live` OFF until 90% of the cap, flips to polite near it, and flips
   back (measured both directions); the error line is a static
   aria-describedby target — a `<p>` with NO live region, so validation reads
   on focus without typing chatter.
6. **THEME-SPLIT, the seven strata applied** — every claim named to its layer
   in the theme axis row: L1 page bridge (under prefers-dark --border flips
   oklch(0 0 0) → oklch(1 0 0) and a body-level field re-derives, measured),
   L2 host island (the canvas `data-theme="light"` stage re-pins light — the
   served demo does NOT re-derive, island beats page, measured), L3 component
   stamp (theme="dark" stamps class:dark on the field root — closest scope
   wins, source + attr receipt). The invalid signal stays monochrome at every
   stratum (dashed = shape, not hue).
7. **A stub inaccuracy corrected**: the old error section claimed "the one-hue
   law has no error red" — imprecise. The SHELL's invalid signal is the
   monochrome part (border-style dashed); the message line itself paints
   `var(--destructive)` (jx-pure :514, read). Reworded in both the section
   and the a11y table.
8. **KEYED-EACH/mounted-children**: the page's one conditional rides `{#if}`;
   the family renders slots via `{@render ...()}`; no keyed loops on this
   page. **LAW #19**: ToC == DOM 11/11, zero duplicate ids, zero dangling
   hashes.

## Measurements (probe receipts, served DOM at :5241 — 21/21 family + 5/5 chrome)

- **Shell law**: resize computed `vertical` (locked); radius 0; 1px solid
  border; hover lift measured as a 1px INSET shadow (rgba(0,0,0,0.28));
  focus-visible = 1px solid ring outline at offset −1px; `data-chrome="frame"`
  default; rows 4 default (height 78px measured); label[for] auto-wired.
- **Error contract**: aria-invalid="true" + aria-describedby resolving to the
  "! message" line + dashed shell (measured on the error-wiring field).
- **Count**: "5 / 10" law; code-point counting (🫠🫠 = 2); aria-live
  off → polite at ≥90% (9/10) → back to off (5/10); native maxlength=10 read
  back off the element.
- **Controlled/uncontrolled**: FormData captures the native value; reset
  clears (the unbound field's Svelte write-skip measured at the platform
  layer).
- **Slots**: inner rows rendered behind 1px hairlines; count readout lives in
  the end lane.
- **Density**: 2xs stamp → 10px voice / 60px height; lg → 15px / 90px — the
  ambient scope channels FLOW (density-REACTIVE, the anti-terminal-footer).
- **§1 collision**: size-stamped fields carry no size attribute on the native
  element (measured across the served stamped fields).
- **Theme strata**: L1 body-level field border oklch(0 0 0) → oklch(1 0 0)
  under page-dark; L2 canvas-island field unchanged (the island's
  data-theme="light" walked and named); L3 the component .dark stamp
  (source: `class:dark={d.theme === 'dark'}` on the field root).

## Family observations (receipted, not chased — zero family edits)

1. The count readout's aria-live flip point is `Math.ceil(maxLength * 0.9)` —
   at maxlength 10 that is 9/10 (measured polite at 9, off at 5). Fine at
   real caps; noted so no one reads the 90% as a rounding bug at tiny caps.
2. The family's `oninput` forwarding (`rest.oninput?.(event)` AFTER the sync)
   is the correct composition order — receipted as a positive pattern for the
   input family's review lane.

## Gates (repo root unless noted)

| Gate | Result |
|---|---|
| verify:tailwindless | GREEN — receipt VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check page-scoped | **0 diagnostics on textarea.html/+page.svelte and +page.ts**; family standing debt unchanged and untouched (11: the :182 8× `state_referenced_locally` warns + cx-typing errors) |
| docs-ambient-vocabulary solo (apps/www) | 284/284, exit 0 |
| Probe battery | chrome 5/5 + family 21/21 |
| Mirror law | `cmp` byte-identical registry/files/ui/textarea/ ⇄ apps/www/src/lib/ui/textarea/ (4/4 files — zero family edits) |
| SSR | page 200; h1 ×1; toc 11/11; universal marker ×1; dup ids 0; zero dangling hashes |

## Process evidence

- Port **5241**: `lsof` EMPTY before; dev server started for the session
  (vite PID 8549); after gates killed by PID; **port 5241 EMPTY after**.
- **NO commits, NO pushes.** Zero product-tree edits; family + registry
  mirrors byte-identical to HEAD.
- Sibling noise receipted, not chased: vellum's tour.html, marginalia's table
  review, scribe's separator review in flight; the mirror watcher logged a
  www → registry mirror of the page file itself (the docs-route mirror law —
  expected, page-level).
- One authoring error caught by the SSR canary (page 500): a `{...rest}`
  spread written as PROSE inside a markup attribute read as an expression —
  the same trap terminal-footer hit (task 67); reworded, 200 green. This is
  now a two-strike pattern: spread-as-prose needs rewording or escaping.
- Artifacts: /tmp/ta-probe.mjs, /tmp/ta-chrome.mjs, /tmp/ta-dev.log,
  /tmp/svelte-check-ta.txt.

## Open questions for the reviewers

1. The count readout's near-limit threshold (90%, ceil) is a magic constant
   in the family — worth a `countNear` promotion seam? Family-lane, INFO.
2. The api table lists 20 named props in the summary; the PropsTable renders
   the component-owned 12 (the axes fold into universal-props). If the fleet
   prefers the count to name only the rendered rows, the summary's arithmetic
   should follow — one line either way.
3. The `chrome` axis (ControlChrome context) is receipted in the api table
   but has no measured row of its own — it is a context lane, not one of the
   eight; if the fleet wants it inside the axes table as a ninth context row,
   that is a campaign-level decision.
