# T102 — FIRST REVIEW toggle-group.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 1 LOW / 1 NIT**. Tier proposal: **Tier 1**
(a 250-line page over a native-input family: the claims are platform-attributed —
radio/checkbox semantics, FormData, tab model — and nearly all verified by one census
plus one interaction pass; no virtualization, no recursion, no animation clock). Independence
law kept: findings formed from my own source reads (the 250-line page, toggle-group.svelte
272, item 115, the jixoai.css :2255-2305 paint law) and three probe passes on port 5244
BEFORE any report reading; no other toggle-group review exists. NO commits, NO pushes.
Zero family edits.

## Verified — the claim bank

**The selection contract — native to the bone, both modes.**
- **Roles census**: single groups carry `role="radiogroup"`, multiple `role="group"`,
  each with its `aria-label` (the a11y table's "radiogroup | group" row verbatim);
  14 hosts on the page, 10 radiogroups + 17 plain groups in SSR.
- **Native exclusivity + no-clear**: single at seed 'center' → click **right** → the
  echo flips to "single right"; **re-pressing the checked radio does NOT clear** —
  value stays "right" (the hero's "native exclusivity; re-press does NOT clear" claim,
  measured).
- **Multiple stacks and un-toggles**: click italic → `["bold","italic"]` (ordered
  press set); click bold → `["italic"]`. The echo footer follows every move ("multiple
  italic").
- **Native arrow-walk** (real keys): focusing the checked radio and pressing ArrowRight
  moves checked **center → right** with focus following — the platform's radio walk,
  not a JS walker.
- **The tab model — exactly as the a11y table splits it.** Single: Tab from before the
  group lands **on the checked radio** and the next Tab **exits the group** (one tab
  stop, the native radio behavior). Multiple: checkboxes are all tabbable — Tab walks
  bold → italic, and **Space toggles the focused checkbox** (`["bold","italic"]`
  after one Space). The page names the model (native, not a roving JS walker — the
  tree-view/radio differential noted).
- **FormData law**: every input carries the group's ONE name (`demo-align` /
  `demo-style` — single-mode name required is enforced by a mount-time throw at
  source :169-173); the readDom/getAll projection (`label > input:checked` in DOM
  order) is the source's one-entry-per-press law; the capability receipt taken from
  the shipped name+checked pairs (the demo groups sit in no form — capability claim,
  source-true).

**The bind:value projection.** DOM checked is the truth; the bound values (and the
canvas echo) followed every native click and the external sync effect (diff-only
write-back, source :234-241) plus the form-reset re-sync law (E-4 shape) are
source-receipted.

**Paint law digits — the TokenTable verified at the default rung.** min-block-size
**40px** (--jx-hit), padding-inline **12px** (--jx-inset), font-nav **13px/20px**
(--jx-text/--jx-line), uppercase + **1.3px tracking** (= 0.1em × 13), right hairline
separators with last-child 0, group radius 8px, shadow-2xs hard offset. Density
ladders ALL FOUR digit-exact: hit **28/32/40/48**, inset **8/8/12/16**, text
**11/12/13/15**, line **16/18/20/24** — the theming table's rows reproduce at every
rung (small 32px / large 48px seats measured in universal-props).

**Checked paint.** `label:has(input:checked)` → **primary ground + primary-foreground
ink** (computed both), hover leans only on non-disabled labels, focus-visible inset
ring via `:has(input:focus-visible)` — the single-sourced jx-html-tgroup law in
jixoai.css :2255-2305.

**T94 pseudo-class-pair audit — CLEAN, and worth stating precisely.** The family's
checked paint keys on `:has(input:checked)` — per-INPUT truth (radios: exactly one
per name group by native exclusivity; checkboxes: per input), so no group-state
pseudo leakage exists; the `:has(input:disabled)` guards are intentional; **no
`:indeterminate` pair exists in this family** (the T94 incident class lives in the
checkbox/radio element sheet, not here). No resting-state misfire is constructible
from these selectors.

**Sibling-differential (button-group #16).** Same-mechanism-different-wording
receipted: button-group's PROVIDER closure carried `--jx-inset`; toggle-group
consumes the same token as a density row (inset 8/8/12/16 measured at the rungs) —
one token, two family postures, consistent scale.

**Parity known-gap reconciliation.** The toggle pixel-shot's warn-only 40×20-vs-41×20
gap: this page quotes NO dimensions (the theming section is token-table only), so
nothing on the page collides with the known gap — nothing re-filed, nothing to
reconcile beyond this note.

**Structure/battery.** toc == DOM == rail **8/8 in order** (tgroup-demo wired AND
listed — no T98 orphan class); h1 ×1; duplicate ids 0; SSR ships the native inputs
with their checked states (21 radios, 5 checkboxes, checked in markup — the
uncontrolled truth in the byte-stream). **T94 density-clone check**: the theming seat
carries no headings and no ids. LAW #18: no each blocks on the page or family (the
items are authored parts).

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :113:28 —
   the cx overload (`Object.entries(style)` vs `{…} | undefined`), the NINTH page
   clone of the copied helper (popover :245, radio :112, range :153, scaffold-float
   :61, section-card :121, steps :211, timeline :80, tree-view :387, toggle-group
   :113). The per-page predicate closes it; the shared-util consolidation remains the
   real fix — flagged from T95 onward. Family standing warns (toggle-group.svelte
   :183 provideUniversalLanes trio) pre-existing, untouched.
2. **[LOW] The api table omits three interface members.** Rendered rows: name, type,
   value (bindable), label, disabled, density, onchange, children — but the Props
   interface also carries **`onValueChange`** (the value callback twin of onchange —
   the root fires BOTH, source :131/:133), **`required`** (single-mode required
   flag, :142/:209), and the **`chrome`** ControlChrome axis (the frame/bare posture,
   :119-122/:268 `data-chrome`). Same undercount class as T96's `pos` and T97's
   ontology props: the table is internally honest about its eight but a consumer
   cannot discover the value-callback twin or the chrome posture from the page.
3. **[NIT] `data-jx-tgroup` does double duty.** The ROOT carries it as the family
   hook, and each ToggleGroupItem label also renders a 1×1 empty div with the same
   attribute (the item-level marker) — any `[data-jx-tgroup]` census or css scope
   catches the empty markers too (my first probe did). Attribute hygiene: a
   `data-jx-tgroup-item` name (or emitting the marker only when needed) keeps the
   root hook unique.

**Receipt-only notes (not findings):** the antd Segmented mapping section is declared
SEMANTIC, not 1:1 paint (no sliding indicator, no strict single tab stop imitation) —
honest framing, nothing to falsify; `theme="dark"` universal seat carries the `.dark`
island class (measured); the hero's "jx-form-field bridge is gone" matches the source
(native name participation, the throw enforces single-name).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ d50bed31) | RED — sole FAILED seat = **toast** (the recorded red); toggle-group in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 1 ERROR (:113:28 cx overload)** (Finding 1); family warns (:183 trio) pre-existing, untouched |
| verify-native-parity | the family's toggle shot carries the KNOWN warn-only 40×20-vs-41×20 gap (warn, not fail); this page quotes no dimensions — nothing to reconcile |

## Process evidence

- Port **5244**: wrapper 80493 started for the session (/tmp/marginalia-102-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Toggle states returned via the canvas reset; no DOM state
  outlived a probe.
- Probe faults owned: (1) `tabIndex` PROPERTY reads 0 on every same-name radio — the
  property does not model the radio-group tab-order rule; the tab model was re-received
  with REAL Tab presses (enter at checked, exit next); (2) `#tgroup-demo
  [data-jx-tgroup]` matches the item-level 1×1 markers (Finding 3) — the interaction
  probes re-pointed at the input-bearing hosts; (3) the label-text Playwright locator
  missed the uppercase-transformed labels — DOM-path clicks on the real inputs took
  over (the native path, which is also the truer receipt).
- Artifacts: /tmp/marginalia-102-probe{1,2}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
