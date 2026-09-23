# T46 — CODE transfer.html (vellum, last CODE page)

**Tier: B (archetype restructure + the LAW #18 double-weight battery).** The family (a
first-time no-own eight-axis surface, W3-D3) needed the MDN archetype and the shuttle battery:
union-key uniqueness, per-move-class mounted census, mutation diffs, search/disabled/bridge
receipts, and the theme strata named per claim.

## Structure (toc == DOM, LAW #19)

hero (h1 ×1) → #install (**hand SectionCard → DocsInstall**, chrome OUT) → **#overview (new)**
→ **#live-demo (was `#transfer-demo`)** → #usage → #examples → #transfer-one-way →
#transfer-select-all → #types → #theming → #api → #universal-props → **#accessibility (moved
last — trio closes the rail)** → #see-also (**hand card → DocsSeeAlso**, chrome OUT). **toc:
11 entries == DOM == SSR rail** (was: 11 outline-era entries with install/see-also IN the rail,
accessibility mid-rail, universal-props missing). div balance 0, h1 ×1, cards balanced.
**LAW #19: 74 ids page-wide, duplicates NONE (probe).** One code fix: the pre-existing cx
`.filter(Boolean)` union diagnostic (HEAD:214, surfaced by the insert) hardened with the type
predicate — 0 page diagnostics after.

New: #overview (three paragraphs — the three-fact state model, the union-key law, the axes/
strata), the measured `axisRows` 8-row table + receipts paragraph (including the pin-capture
receipt) in #universal-props, and a third seat (`theme="dark"`).

## LAW #18 — the page's spine (double weight, measured)

- **Union uniqueness by complement partition**: the two keyed each blocks (transfer.svelte:217,
  272 — both `(option.value)`) render complements of the same option set (source = not in
  value, target = in value). Probe on the served DOM: source keys [a, b, c] ∩ target keys
  [keep] = **empty** — a key is unique across the UNION of the two lists, not just per list.
- **No transit state**: a move is ONE atomic value assignment (`[...value, ...moving]` /
  `value.filter(...)` — the classic shuttle bug of a key in both lists mid-transit is
  structurally impossible; there is no moment the DOM holds a key twice).
- **Mounted-children census after every move class** (workbench transfer, real checkbox clicks
  + real mover clicks): initial [a,b,c | keep] → single move +1 → [b,c | α,keep] → batch +2 →
  [∅ ("no matches") | α,β,γ,keep] → return −3 → [α,β,γ | keep]. Mounted census matched the
  value list at every step; empty-state note rendered at the 0-row panel.
- **Mutation diffs**: +1 single / +2 batch / −3 return, selection cleared after each move
  (0 checked remaining measured). Legends = footers of truth: "source · 3/3 visible" →
  "0/0 visible" → …; the fieldset aria-labels track totals ("source · 3 total").

**Announcement discipline (measured)**: per-panel `aria-label` (fieldset) + visible legend
counts update on every move; search lanes named ("filter {panel}"); movers named
("move selected to {side}") and `disabled` at zero movable (measured [true, true] at rest).
The page's RECIPES add the `aria-live="polite"` readouts (rejected-removals, granted list) —
the component itself carries no live region; the native fieldset/checkbox semantics plus the
count labels are the in-component signal. Recipes compose the announcement seam exactly as the
a11y table documents.

**Other receipts**: search filter per panel (label substring, case-insensitive — "alp" →
visible [alpha], legend "1/3 visible"); disabled rows render, can't check (`disabledAttr:
true`), never cross (deno stayed put in the one-way seat); the jx-form-field bridge present
(`value="keep"` echoed, `multivalue` unset on the name-less demos — the name prop arms it).
**PressButton composition**: the movers are PLAIN buttons in the family (W-next #5's
claimed-prop rule not triggered — the recipe batch controls compose PressButton with direct
onclick wiring, no claimed props).

## THEME — the seven strata, named per claim

1. **stylex defineVars pins** — none in the family beyond the atom table's token reads.
2. **Root-pinned aliases (stratum #2)** — panels/rows/search paint through
   `--jx-card/--jx-border/--jx-foreground/--jx-background` (tokens.stylex :root declarations,
   substitution at the declaring element): frozen under a scoped island, re-deriving at
   root-level dark. MEASURED: under `html.dark`, `--jx-card` at :root flips 1.0 → 0.3211.
3. **Attribute/class-scoped re-declaration (stratum #3)** — the row hover lean rides
   `--muted`, the focus/mover leans `--ring/--primary` (base tokens the `.dark` scopes
   re-declare): an island flips the leans but holds the alias grounds. AND the page-level
   capture receipt: **every served transfer sits inside a component-canvas stage whose
   `data-theme="light"` pin holds `--card` at the light value for its subtree** (measured:
   `stageDataTheme: "light"`, `cardAtStage` 1.0) — under root-level dark the pinned panel
   HOLDS light while `:root` re-derives. The pin beats the root flip for the subtree.
4. **forced-colors** — absent from the family (grep 0).
5. **color-scheme** — absent (grep 0).
6. **Scope-channel variants / selector-list re-declaration** — not used by this family (no
   `:root, .jx-light, .dark` alias list here; the leans ride the base tokens instead).
7. **Var-vs-paint at the element** — the decisive lens this page: the same `--card` value reads
   0.3211 at :root and 1.0 at a pinned stage's panel in the SAME rendered state (measured) —
   the substitution point decides frozen-vs-flip.

The `theme="dark"` island seat: `class:dark` stamps the in-flow root (no portal — the island
covers BOTH panels, no severance like toast's hole), grounds hold light under a light root
(measured white under the island).

## Axes (the rest of the battery)

**density = the ONE consumed axis**: rows read `var(--jx-text)` (kernel lane,
coefficient-scaled) — the `density="small"` seat measures the row at **12px** vs ambient
**13px** with `data-density="sm"` on the root; legend/search chrome rides static label steps.
**size/shape/radius/color/elevation**: zero effective readers over ui/transfer/ (grep receipts
×5); panels keep the static `--jx-radius` corner and `--jx-shadow-2xs` chip. **motion**:
motionless by design — zero transition declarations (grep), hover/focus flips instant; zero
`--jx-motion-effective` readers.

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on transfer.html/+page.(svelte|ts)** after the cx
  hardening (fleet rc=1 = pre-existing debt elsewhere — untouched files).
- Ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0** (vitest teardown note; exit 0).

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 23809 + listener 23854 (/tmp/t46/*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**. (One false start: the server launcher ran
  from the repo root where vite isn't installed — the self-cd launcher pattern from T44
  applied; two stray PID files overwritten.)
- NO commits, NO pushes. Probe DOM injections (html.dark) restored in-probe; checkbox/mover
  interactions all real clicks.
- Sibling keyed noise: svelte-check fleet + gates cross-checked — the one transfer.html
  diagnostic was my page's pre-existing cx, fixed; quill's textarea.html, marginalia's table,
  scribe's separator untouched.

## Probe faults owned

1. **Node-scope leak (the recurring trap)** — a node-side selector const referenced inside
   `page.evaluate` threw ReferenceError; inlined into the evaluated string (T41/T42 lesson,
   still live).
2. **The root-dark "no flip" that wasn't a probe bug OR a family bug** — the first read showed
   the panel ground holding light under `html.dark` and both simpler explanations were wrong:
   the micro-probe split the token chain (— `--card` flips at :root, holds at the panel) and
   the second probe found the captor: the canvas stage's `data-theme="light"` pin. Three
   readings before the claim: token at root, token at panel, pin at the stage ancestor.
3. **A bogus post-write assert (again calibrated against string copies)** — fixed in the T45
   round for `<Tour`, re-tripped risk here; the final verify counts real markup only.

## Open questions / drift flags for the orchestrator

1. **No live region in the component**: moves change the fieldset counts but announce nothing
   live; the recipes bridge it with `aria-live="polite"` readouts. A `role="status"` on the
   legends (or an opt-in move announcement) is a candidate family hardening — flagged, not
   fixed (page task; the native checkbox semantics carry most of the weight).
2. **Consumer-duplicate options**: the union-uniqueness guarantee holds iff the CONSUMER's
   options have unique values — a duplicated option value would key-collide inside one list
   (LAW #18). The family cannot partition duplicates apart (same value = same side by
   definition); a dev-mode duplicate warning is the cheap hardening candidate. The page's demo
   data is unique (probe receipt).
3. **The canvas pin capture is page-shape, not family** — any demo inside a `data-theme`
   stage inherits the pin; if a future page wants to demo root-dark re-derivation LIVE, the
   seat must mount outside the stage (or the pin needs an opt-out). Recorded here so the next
   author doesn't re-derive the three-probe hunt.
