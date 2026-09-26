# TASK 87 — FIRST REVIEW form.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W4 at
  64a4f3e9, no CODE report — owner-checked I did not code it. No other form review
  exists; no concordance addendum applies. All findings derived from my own source
  reads + probes).
- **Target**: `apps/www/src/routes/docs/components/form.html/` (+page.svelte 324 lines,
  +page.ts authored toc 10) — the FAMILY HUB: three guide groups rendered from
  `hubGroups` data (all-types 8 members / select-textarea 3 / example-form 3 = the
  "14 canonical pages" pill, exact), the density-ladder demo, the NativeHTML base
  explainer, and the types/usage/accessibility/theming/api tail. The page's own header
  rules it out of the registry archetype: "NOT a registry item itself — no prev/next,
  no inventory membership."
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 1 NIT.**
- **Tier proposal: Tier 1 (minimal polish — one token-cell completion).** The
  eight-axes archetype (universal-props/axes table/own-elevation receipts) does not
  apply to a hub page by its own declaration; the hub's claims are few, and the ones
  it makes are measured true. The one owed digit is the NIT below.

## The NIT — the --jx-text row quotes four of the five served voices

TokenTable (:322 theming section): `--jx-text: "11 / 12 / 13 / 15px"`. The served
density ladder on this very page renders **five** voices: 2xs **10px**, xs 11px,
sm 12px, default 13px, lg 15px (probe B). The four quoted are xs→lg; the 2xs rung's
10px is real, served, and omitted. One-digit completion: `10 / 11 / 12 / 13 / 15px`.

## The dispatched instruments — all four applied

1. **The authored-toc vs DOM census**: the authored toc carries 10 entries; the served
   DOM resolves **all 10** — including the three LEGACY hub-group anchors
   (#all-types, #select-textarea, #example-form) which render through the
   `{#each hubGroups}` block with `id={group.id}` on the section (grep-invisible;
   the live census catches them: all three served). **No dead anchors, no unrailable
   guide sections** — the +page.ts comment's promise ("every historical deep link
   keeps resolving") is true on the served DOM. The density-ladder and the six tail
   sections complete the set. The dialog-class toc failure does not recur here.
2. **The painted-channel walk**: the hub makes no elevation/shadow/gradient claims —
   its paint claims ARE the density ladder, and those paint digit-exact (below). The
   walk found no unpainted receipts to flag.
3. **The focus contract**: the hub hosts no modal/popover surface of its own. The
   a11y table's claim ("Tab moves focus field to field in DOM order — native
   elements, native order") is the native contract; the ladder's five inputs carry
   wired `label[for]`↔`id` pairs (s15–s19, measured).
4. **playState typing + the gate**: no `playState` prop exists in this page's surface
   (grep receipt — the instrument reduces to the gate). **svelte-check: form.html
   carries 1 diagnostic** — :149 the Object.entries-undefined overload (the standing
   fleet class; no genuine page type error — recorded in gates, not counted).

## The measured claims — digit receipts

- **The density ladder**: five columns (2xs/xs/sm/default/lg), each `data-density` +
  `data-density-scope` stamped, a real Input and a `data-density-click-target` probe
  lane. Served: **voices 10 / 11 / 12 / 13 / 15px**, input heights 22 / 26 / 30 / 38 /
  46px, probe lanes **24 / 28 / 32 / 40 / 48px** (the --jx-hit scale) — the
  "measured 10px voice / 60px height at the 2xs stamp vs 15px / 90px at lg" projection
  arithmetic (rows × voice × 1.5) is this ladder's rows-1..4 analog and holds column
  by column.
- **The catalog grid**: 8 + 3 + 3 = **14 OverviewCards** (the hero pill "14 canonical
  pages", exact), hrefs are canonical routes — spot-fetched
  `/docs/components/input.html` → **200**.
- **The NativeHTML base**: the three-law explainer renders (native type passthrough /
  repaint-never-replace / label[for] + aria-describedby) with the install code block —
  the snippet's closing-script splice (source :35-37) renders clean.
- **The api table**: PropsTable **universal** (the hub's Input contract: type /
  density / label / id / error / clearable / the four snippets / value bindable).

## The dispatched instruments — applicability receipts

- **Reveal-CB census (W-next #19)**: the page hosts **no live fixed or
  anchor-positioned demo content** under [data-reveal] — the census found 7
  `position: fixed` elements, all **closed canvas-dock axis menus** (`.jx-menu`
  popovers at 0×0; the dock's seven axis menus — size/shape/radius/density/color/
  elevation/motion). Closed popovers at zero rect give the two-scroll check nothing
  to measure, and OPEN popover menus promote to the top layer where the reveal's
  identity-matrix transform cannot contain them — the W-next #19 hazard is
  structurally absent on this hub. Instrument N/A, receipted.
- **The corner/float-lane contest (W-next #21)**: no fixed-corner demo exists on the
  page (the census above); nothing to hit-test against the sections-nav/toc-rail
  lanes. Instrument N/A, receipted.
- **Fresh build before the docs gate (process note)**: verify:docs ran against the
  orchestrator's current dist (provenance 9138a701, per the dispatch). Result:
  **RED — 1 problem, seat = toast** ("Examples renders before Usage") — **sibling
  keyed noise** (scribe's toast is in flight), receipted and not chased; **form.html
  itself passes the skeleton lint**.

## Standard battery

- **SSR**: 893,981 bytes; h1 ×1; universal marker present (the hub's api table);
  0 undefined literals; zero `jxoai`.
- **Warm-reload (the strip-style refinement)**: raw consecutive fetches differ;
  **stripped of the dev-assembled style block they are byte-identical** — the
  dev-CSS module order artifact, consistent with dialog/float-button.
- **LAW #19**: 72 ids on the live DOM, zero duplicates (the legacy anchors unique,
  the ladder column ids s15–s19 unique).
- **Vocabulary-grep**: zero `jxoai` in page.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **form.html: 1 diagnostic** (:149, the standing Object.entries-undefined class — recorded, not chased) |
| verify:docs (orchestrator dist, 9138a701) | **RED — 1 problem, seat = toast** (the in-flight sibling's skeleton order), **form clean** — sibling noise receipted, not chased |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 13102; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- Instrument honesty: (1) my source-grep census of the sections missed the hub
  groups (dynamic `id={group.id}` — grep cannot see data-driven ids); the LIVE
  census is the receipt, and it flipped my initial dead-anchor suspicion into a
  clean 10/10; (2) the reveal-CB census's first read (7 fixed elements) looked like
  a finding — identification showed closed 0×0 dock menus; the N/A receipt is the
  honest form.
- Artifacts: /tmp/marginalia-87-probe{1,2}.mjs, /tmp/marginalia-87-ssr{1,2}.html,
  /tmp/marginalia-87-{dev,wrapper,listener,ambient,universal,scheck,docs}.*.

## Open questions

1. **The --jx-text row digit** (the NIT): one-cell completion; whether the row
   should also name 2xs=10px explicitly or the four named steps + "legacy 2xs 10px"
   convention — the fleet's call.
2. **toast's skeleton order** (the verify:docs red): scribe's in-flight page —
   the orchestrator already owns that thread; form is clean regardless.
