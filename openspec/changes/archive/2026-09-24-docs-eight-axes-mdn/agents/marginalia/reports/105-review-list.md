# T105 — list (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 2 MINOR / 2 LOW / 1 NIT — Tier 2 proposed**

Legacy class (explicit-props W4 at 64a4f3e9, no CODE report) — first audit,
derived from my own source reads + live probes; quill holds the 2nd. Page:
`apps/www/src/routes/docs/components/list.html/+page.svelte` (355 lines).
Family read in full: `list.svelte` (269), `list.css` (22), `list.stylex.ts`
(41), `list-defaults.svelte.ts` (42), `index.ts` (5); sibling surface checked
for the differential (`list-item/index.ts` exports, `jx-pure.css` B8 block).

Process: port 5244 mine (pre-check rc=1, served from apps/www, killed at end —
lsof post_rc=1, no orphans). Probe /tmp/marginalia-105-probe1.mjs (log -p1).
Dist 902ac733 for the lint gate. No fixes applied.

---

## 1. The claim bank verified TRUE with digits

**The marker vocabulary — all seven words render their exact computed
list-style-type** (probe1 MARKERS_MATRIX): disc, circle, square, none,
decimal, **lower-alpha** (alpha), **lower-roman** (roman) — the "lowercase
only" claim digit-true at the computed layer; the roman+start list carries
`start="4"` with lower-roman (the "iv, v — the native ol accounting" claim:
2 lis, platform-owned glyphs). The shapes canvas: ul→disc, nested inner
ul→disc at 24px pad ("rides the same channels… zero extra classes" TRUE —
nested=false/true receipt), ol→decimal with `start="4"` attribute present
(the ol-only passthrough TRUE).

**The structural indent.** padding-inline-start **24px** (ps-6 = 1.5rem =
`--jx-space-24`) on EVERY non-nav list — including `marker="none"` ("markers
gone, ps-6 stays" TRUE; "the indent is structural, not decorative" TRUE).

**Muted marker ink.** `li::marker` color **oklch(0.3211 0 0)** vs li ink
oklch(0 0 0) on every list — the B8 law's form (list.css :19-21, keyed on
`[data-jx-list]`, zero-specificity `:where()`). TRUE. (The ::marker computed
read worked here — unlike the T95/T104 pseudo liars.)

**No margins.** Computed marginBlock 0px/0px on the shapes roots — the
component ships no spacing (PlayHelp :155 "deliberately ships none" TRUE;
stylex table carries no margin keys).

**Nav wrapper purity.** Both nav wrappers carry EXACTLY
`["aria-label", "data-jx-list-nav"]` — no class, no style, no rest (the
spec-pinned contract :258-260 TRUE); the list inside carries the classes and
the `data-jx-list` hook. The lane split receipt: the in-scope bare anchor
paints black / no-underline (the B2 nav-link chrome) vs the standalone
Link part accent oklch(0.5635 0.2408 260.818) + underline — "bare anchors
inside a jx-pure scope get the face B2 chrome lane free" TRUE, and the
standalone-unstyled-by-design statement consistent.

**Root flip + hooks.** 13 rendered roots (3 shapes incl. the nested inner,
8 marker matrix, 2 nav), every hook matches its tag (`data-jx-list="ol"` on
ol, `"ul"` on ul); `data-density` unstamped everywhere (no-own — correct for
explicit-less instances).

**LAW #18.** No `{#each}` anywhere — the page and the component are static
markup + `{@render children}`. No keyed-each habitat to audit. LAW #19: no
DensityDemo (retired by design here — no import), no duplicate ids observed.

## 2. Findings

**MINOR-1 — the page's own nav demo contradicts the nav-defaults claim:
the B8 face law overrides the component's channels inside the demo's
jx-pure scope.** The claim, stated unconditionally three times (hero :93
"defaulting marker none + ps-0"; nav canvas :228; API :342): nav mode
defaults marker none + ps-0. The "On this page" demo (:234-240) — nav set,
NO explicit marker — is placed inside `<div class="jx-pure …">` (to run the
B2 anchor-lane claim), and there the face's restore law
(jx-pure.css :1877-1884: `:where(.jx-pure) ul:not(.no-jx-pure, …)
{ list-style: disc; padding-inline-start: 1.5rem }`, specificity (0,1,1)
over the atom classes' (0,1,0)) paints it **disc + 24px** — measured
(probe1 NAV_WRAPPERS[0]: listStyle "disc", listPad "24px"), while the
claimed default is none + ps-0. The control group proves the mechanism is
scope-local: the "Chapters" list (:244, outside the jx-pure div) honors
flush — listPad **0px** (its decimal is an explicit marker, so the *none
default* is never shown working anywhere on the page). The escape hatch
exists in the law's own not() chain — `.no-jx-pure` — but the component
neither stamps it nor documents the defeat. Fix shapes: stamp `no-jx-pure`
on the component's list root (the markdown map's own escape, source :58),
or scope the demo's two claims apart (B2 lane demo keeps the scope; the
marker/pad defaults demo moves out), or state the face-scope override in
the nav copy. T93 claim-vs-demo class.

**MINOR-2 — toc ships 6 entries for 8 DOM sections; `markers` and `nav`
are unreachable from the rail, and the rail order skips them.** Authored
+page.ts: usage, shapes, task-items, accessibility, universal-props, api.
DOM order: usage, shapes, **markers, nav**, task-items, accessibility,
universal-props, api. The rendered rail (probe1: 6 links, authored order)
never links the marker matrix or the nav-mode demo — two of the page's
three ComponentCanvas sections — and lists task-items 3rd while it is 5th
on the page. Same class as T104 MINOR-1 (input: capabilities/picker-bridge).
Fix shape: add the two ids, ordered to the DOM.

**LOW-1 — the API table's `...rest` row is false for the eight axis props,
and the axes are omitted as rows.** The rest row (:347): "Every other
attribute passes through to the native list element untouched." The eight
universal axes (source :130-152) do NOT pass through — they are
destructured, resolved through ListDefaults, and stamped as carriers +
`data-density` on the list root (:184-191, :239) — the universal-props
section itself says "the axes ride the LIST element" and the drawer usage
shows `<List size="medium">`. Yet no axis row exists in the table. T104
class (there with a false count; here the "Five props" count is defensible
for the domain props, so LOW). Fix shape: an eight-axis row (or the
standard pointer) + a rest-row caveat.

**LOW-2 — the cx-overload clone, 12th page instance, plus the component
twin.** +page.svelte :55-67 (svelte-check seat :63:28) and list.svelte
:95-107 (seat :103:28) — the identical joiner signature; both flagged.
svelte-check page errors: exactly 1. Fix shape: transfer's type-predicate;
the shared-util consolidation flag stands (now a dozen+ seats fleet-wide).

**NIT-1 — "five control adapters" (hero :93) is ambiguous against the
sibling's exports.** list-item/index.ts exports SEVEN control-ish adapters
(ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput,
ItemSegmented, ItemStepper); the classic five (toggle/checkbox/radio/
select/stepper) is defensible, but the count as written doesn't survive a
surface census. The sibling page (list-item) owns the precise taxonomy;
flagged here because the phrase lives in this hero. Same-mechanism-
different-wording across the pair starts from agreeing on the numbers.

## 3. Notes and scope

- The universal-props canvas contains **no live list** (probe1: 0
  `[data-jx-list]` under #universal-props; the stage is a text paragraph —
  the axis demo lives only in the drawer's usage file). The section claims
  a "FIRST-TIME contract, all no-own" — with nothing painted, there is
  nothing to falsify and nothing demonstrated; noted as the weakest
  universal section in the campaign rather than a finding (no live claim
  is made).
- T94 pseudo-pair audit: the family sheets carry no
  :checked/:indeterminate/:placeholder-shown pairs; the marker ink is a
  ::marker color law (list.css) and the face's B8 twin (:1885-1887) — both
  spec-clean.
- Sibling-differential: the disambiguation claim ("list-item is the
  antd/F7 settings-row system — ItemGroup frames, media/end lanes,
  five control adapters") matches the sibling's surface shape (ItemGroup,
  ItemMedia, ItemEnd + the adapter set; ItemEndFit/ItemEndInset contracts
  present in the exports) up to the NIT-1 count. The pair teaches the same
  seams twice with different words — the list page says "styles the list,
  never the row", the item family's comments say the row owns its lanes;
  no contradiction observed from this side.
- Dispatch's item-contract arm: the inset/fit/wrap throw-clause laws live
  in the list-item family (ItemEndInset: 'auto'|number|boolean,
  ItemEndFit: 'md'|'lg'|'full' — index.ts :12-13); the list page never
  touches them — nothing to reconcile on this page.

## 4. Probe-fault ownership (my artifacts, not the page's)

- The nav-default falsification was initially invisible to me because the
  two nav wrappers sit in different scopes; my first read plan had no
  jx-pure-scope control. The wrapper-2 pad-0px read is what turned the
  anomaly into a scoped cascade finding rather than a blanket component
  failure.
- The ::marker computed reads worked on the first try — no pixel-scan
  fallback needed (recorded as a working channel, contrast T95).

## 5. Gate record

- ambient solo: 284/284, rc=0 (known vite-teardown nuisance note).
- `npm run verify:docs-universal` → GREEN 110/110, rc=0.
- page-scoped svelte-check: page 1 error (:63 cx clone) + component 1
  (:103 twin) — reported, none self-fixed.
- `npm run verify:docs` (dist 902ac733) → rc=1, sole red `toast: skeleton:
  Examples renders before Usage` — pre-existing, seat-attributed away from
  list.
- Server killed: lsof :5244 empty (post_rc=1), no orphan processes.
