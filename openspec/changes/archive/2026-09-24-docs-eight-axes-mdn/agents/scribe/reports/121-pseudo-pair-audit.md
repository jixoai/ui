# TASK 121 — the pseudo-class-pair SPEC audit (checkbox/toggle class, fleet-wide)

**Verdict: ONE VIOLATION SEAT (a surviving pair, not a new pattern) — everything else
SPEC-TRUE.** Of the audited pseudo-pairs across all 85 ui family sheets, both theme sheets,
and their registry twins, exactly one seat fails the T94 law: **jx-pure.css still carries
the radio `:indeterminate` pair that task 94 (e3a9c0db) killed in jixoai.css** — the dash
`::before` arm (:1503) and the solid-ground composite `:checked, :indeterminate` (:1530).
It is the canonical violation VERBATIM, surviving in the sheet's GENERATED lane. No fixes
applied (per contract); fix shape below. Source-read audit only — no server, no build, and
**svelte-check not run at all** (zero TS seats; the one-run rule honored trivially).

## The violation (filed, not fixed)

**SEAT: `apps/www/src/lib/jx-pure.css` :1503-1507 and :1530-1534 (registry twin
`registry/files/theme/jx-pure.css` byte-identical — both copies).**

- :1503 `input[type='radio']…:indeterminate::before` — paints the horizontal DASH glyph
  (the checkbox's mixed morph) on a radio.
- :1530 `input[type='radio']…:checked, input[type='radio']…:indeterminate` — paints
  `background/border: var(--primary)` — a SOLID BRAND BLOB on every radio of every
  all-unchecked group.

**Reasoning (why violation, not divergence-by-design):** jixoai.css :2004-2011 carries the
T94 spec-true comment over the SAME seat's absence: "radio :indeterminate deliberately
UNSTYLED (radio 1st review, task 94): per the HTML spec a radio matches :indeterminate
whenever NO member of its name-group is checked — a RESTING group, not a selection state.
The checkbox-derived pair above painted every all-unchecked group as solid brand blobs
(measured on both universal seats). Checkbox keeps its authored tri-state; radios have no
authored indeterminate." The jx-pure arms are those killed arms verbatim, with no
divergence note. The platform DOES match radios at rest — so the rules FIRE on every
resting group served under `.jx-pure` (shipped: `app.css:25 @import './lib/jx-pure.css'`;
radio.svelte references the sheet) — live defect surface, not dead code.

**Why the arms survived (root cause, receipted):** jx-pure.css's own header declares its
form-control laws are GENERATED projections of `packages/css-laws/src/laws` ("Regenerate
after editing laws: npx tsx packages/css-laws/src/build.ts"). The radio LAW is clean:
`packages/css-laws/src/laws/radio.ts` authors `:checked` states only — `git log -S
":indeterminate" -- packages/css-laws/src/laws/radio.ts` returns NOTHING (the string never
existed in the law's history). The T94 fix (e3a9c0db) landed in jixoai.css's face-authored
section and never reached the generated sheet's radio section: the arms are stale/orphan
generation residue. **Fix shape for the Owner: regenerate (`npx tsx
packages/css-laws/src/build.ts`), do NOT hand-edit the generated sheet — then diff.** If
the regenerated radio section still carries the arms, the laws capture missed a
face-authored residue and the source needs the one-line reconciliation before regenerating.
Mirror both copies (www + registry — currently byte-identical to each other). Caveat for
consolidation: because the sheet is generated and stale HERE, the regeneration diff may
surface drift beyond radio — enumerate it rather than cherry-pick.

## Census and adjudication (every audited seat)

Theme sheets (jixoai.css = the site face; jx-pure.css = the generated .jx-pure face):

| family · seat | pseudo | subject | verdict | reasoning |
|---|---|---|---|---|
| jixoai.css :1900 | `:checked::before` | `input[type=checkbox].jx-html-checkbox` | SPEC-TRUE | the platform checked state; the authored check glyph |
| jixoai.css :1905 | `:indeterminate::before` | same checkbox | SPEC-TRUE | the AUTHORed tri-state (the family's own mixed arm; T94 leaves checkbox legit) |
| jixoai.css :1911 | `:hover:not(:checked):not(:disabled)` | same | SPEC-TRUE | real hover, gated by real states |
| jixoai.css :1915 | `:checked, :indeterminate` | same | SPEC-TRUE | both arms real checkbox states |
| jixoai.css :1974/:1992/:1996/:2000/:2025 | `:checked` (dot, hover, ground, hole) | `input[type=radio].jx-html-radio` | SPEC-TRUE | the platform checked state |
| jixoai.css :2004 | `:indeterminate` | radio | **SPEC-TRUE BY REMOVAL** | the T94 spec-true comment; unstyled deliberately |
| jixoai.css :2073-2082 | `:checked` | `input[type=checkbox][role=switch]` | SPEC-TRUE | real state on the switch input |
| jixoai.css :2294-2299 | `label:has(input:checked)` (+ hover arm) | the group label | SPEC-TRUE | :has() surfaces the input's REAL state; L3 |
| jx-pure.css :228-233 | `label:has(input:checked)` (+ hover) | group label | SPEC-TRUE | same idiom, generated lane |
| jx-pure.css :1424/:1429/:1435/:1439 | `:checked`/`:indeterminate` pair | `.jx-pure` checkbox | SPEC-TRUE | authored tri-state, generated faithfully |
| **jx-pure.css :1503** | **`:indeterminate::before`** | **`.jx-pure` radio** | **VIOLATION** | the T94-killed dash arm, stale generation |
| **jx-pure.css :1530** | **`:checked, :indeterminate`** | **`.jx-pure` radio** | **VIOLATION** | the T94-killed blob composite, stale generation |
| jx-pure.css :1498/:1522/:1526/:1549 | `:checked` | .jx-pure radio | SPEC-TRUE | platform state |
| jx-pure.css :1597/:1602 | `:checked` | .jx-pure switch | SPEC-TRUE | real state; no switch :indeterminate anywhere (correct — switches author none) |
| jx-pure.css :1984/:1994 | `:indeterminate` | `<progress>` | SPEC-TRUE | the ONE non-input subject where the platform itself describes the state (progress without value is indeterminate) — L4 |
| jx-pure.css :2159 | `[aria-invalid='true']:indeterminate` | .jx-pure checkbox | SPEC-TRUE | two real states composed |

ui family sheets (85 sheets censused; only two carry audited state pseudo-classes):

| family · seat | pseudo | subject | verdict | reasoning |
|---|---|---|---|---|
| tree-view.css :101/:104/:135 | `:checked` (+`:hover:not(:checked)`) | `.jx-tree-check` = a REAL `<input type="checkbox">` (tree-view-multiselect.svelte :214) | SPEC-TRUE | platform state; the third state rides the AUTHORED `[data-mixed]` attribute (set at :225) — a clean dual-channel: platform :checked for on, authored attr for mixed, no pseudo borrowing |
| input.css :337 | `:has(> .jx-html-control-lane:not(:placeholder-shown))` | the floating-label shell → native input | SPEC-TRUE | :placeholder-shown IS the input's real empty state; the component SEEDS `placeholder=" "` so the state expresses honestly (the sheet's own words) — the audit's model seat |
| input.css :406/:409 | `:hover` / `:has(:focus)` | the bare-chrome shell | SPEC-TRUE | own hover; :has(:focus) surfaces a descendant's real focus |

Cross-element hover/focus PAIRS (pseudo on A, paint on B — the audit's hover-with-paint
class): all SPEC-TRUE — every subject genuinely occupies the state and paints its own
descendants, the normal cascade idiom:
`docs-pager.css:123` (a:hover .label) · `table.css:71-72,173` (tr:hover th/td, first-child)
· `tree-view.css:29,65` (row:hover .typeicon/.suffix) · `tree-view.css:81`
(li:focus-visible > row). All remaining :hover/:focus hits across the 85 sheets are
SELF-paints (subject paints itself) — trivially spec-true, fleet note, not tabled.

`:placeholder-shown` on non-input subjects: **ZERO hits** anywhere (ui sheets + theme
sheets + twins). The radio-class pattern (state pseudo on GROUP containers): the fleet's
group lane uses `:has(input:checked)` exclusively — spec-clean per L3; the only offender
is the jx-pure radio pair above.

## Clean-family list

Families whose sheets carry NONE of the audited state pseudo-classes (the expected clean
families hold): checkbox, toggle, toggle-group (no state pseudo in any sheet — their paint
is stylex/utilities), radio (jixoai face — post-T94 clean), progress, range, select,
native-select, plus every sheet with only self-paint hover/focus: a11y-table, accordion,
alert, avatar, badge, blockquote, breadcrumb, button-group, card, card-grid, carousel,
cascader, chart, chip, code-card, color-picker, combobox, command, component-canvas,
date-picker, descriptions, dialog, dropdown-menu, file-input, float-button, ghostty-term,
glass, hero-section, hover-card, inline-code, input-group, input-otp, language-switcher,
list, list-item, markdown, math-block, menubar, mermaid, native-scroll-area,
navigation-menu, number-input, pagination, pattern-cta, pattern-faq, pattern-hero-set,
pattern-login, pattern-pricing, popconfirm, popover, press-button, progressive-blur,
props-table, prose, scroll-area, scroll-run, section-card, separator, sheet, skeleton,
spin, steps, system-dialog, table, tabs, tags-input, terminal-card, terminal-footer,
terminal-header, timeline, toast, toc, tooltip, tour, transfer, website-scaffold.
Theme-sheet twins: jixoai.css www==registry byte-identical (T94 comment in both);
jx-pure.css www==registry byte-identical (the violation in both — one regeneration fixes
both mirrors).

## Laws (for the ledger)

1. **THE T94 LAW, verbatim**: the pseudo-class must describe the element's real state, not
   borrow its specificity. A radio's resting group is not a selection state; a checkbox's
   tri-state is.
2. **The generated-sheet law (new, this audit)**: generated sheets inherit their source's
   spec-cleanliness — a spec fix is not landed until the single declaration source carries
   it AND the projection is regenerated. A fix landed only in a face-authored sheet leaves
   the stale projection serving the violation forever (jx-pure's radio arms survived T94 —
   e3a9c0db — by exactly this gap).
3. **The :has() owner law**: a state surfaced through `:has()` is judged by the state's
   OWNER element, not the painted one — `label:has(input:checked)` and the floating label's
   `:not(:placeholder-shown)` describe real input states; the group-lane idiom is
   spec-clean fleet-wide.
4. **The platform-subject law**: a state pseudo on a non-input subject is clean iff the
   platform itself defines the pairing — `<progress>:indeterminate` is the fleet's one
   positive; `:placeholder-shown` on non-inputs is zero-hit.

## Process

- Source-read audit: greps (census + per-seat reads) over `apps/www/src/lib/ui/**/*.css`
  (85 sheets), `apps/www/src/lib/{jixoai,jx-pure}.css`, `registry/files/theme/*.css` twins,
  `packages/css-laws/src/laws/*.ts`. No server started, no build run, no port touched.
- **svelte-check: not run** (no TS seats in scope; the Owner's one-run-per-task rule met
  trivially — no saved output needed this round).
- One tooling note: my first census grep used `rg -rn` and hit the -r=--replace trap
  (my third banked instance) — re-run with `rg -n` before any conclusion was drawn.
- NO fixes, NO commits, NO staged files. Artifacts: this report; greps reproducible from
  the cited commands.
