# Task 35 — REVIEW reference (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS.** Zero MAJOR. marginalia's MINOR (the unnumbered posture
that renders § 1.2) is CONFIRMED with the mechanism cited and a fix
direction picked (move, not reword); her stale-count LOW is confirmed in
substance with the census CORRECTED (the split is 5 ??-fallbacks + 6
resolved-in-SSR = 11 edge claims — her "0 resolved labels in SSR" is
wrong, and it's the interesting half); her spec-debt LOW is reproduced
verbatim. Both her adjudications concurred. Independence law kept:
findings formed from my own source reads + probes BEFORE opening her
report 37.

**Reviewed**: `apps/www/src/routes/docs/components/reference.html/`
(+page.svelte 425 lines, +page.ts 8-entry toc, integrated at 6ab74431,
zero drift) + `apps/www/src/lib/ui/reference/` (reference.svelte 196,
defaults, index — 3 files, no css, no atoms).

## The claims, re-derived

### 1. The inheritance pole, both contexts — VERIFIED-TRUE digit-exact

- Ambient: the anchor computes **13.5px inside the 13.5px text135
  context** with `style="` **absent at the byte level** (auto stamps
  nothing — `carriers` empty → `rootStyle` undefined), and its color
  equals the context's (oklch(0 0 0) both — the preflight
  `a { color: inherit }` chain).
- `size={18}`: **18px inside a 16px context** with the §11 stamp
  verbatim on the root: `--jx-size-effective: 18px; font-size:
  var(--jx-size-effective, 1rem)`.
- Grep + dir receipt: the family ships 3 files, NO css, NO atoms; the
  only fontSize hits are doc comments. The kbd contrast's other pole,
  as taught.

### 2. Density stamp-only — VERIFIED-TRUE

`density="small"` lands **data-density="sm"** on the root + the
`--jx-density-coefficient: 1` carrier; the anchor's voice stays the
context's **16px** (reads no kernel channel). The stamp's scope exists
for what the children hatch carries — exactly the page's row text.

### 3. Theme bridge-only, NOTHING-DECLARES — VERIFIED-TRUE

A real `.dark` class on the anchor root, then a `.dark` island on the
panel ancestor (restored after): computed color **oklch(0 0 0) in all
three states** — the island moved nothing. Mechanism attribution right:
the family ships no css, so the `class:dark` bridge has NO rule to
activate; the preflight chains from OUTSIDE any scope. Cascade-passive
by contract, measured.

### 4. The edge machine — VERIFIED-TRUE (after the warm-reload lesson)

Post-settle matrix (live demo): eq-r → anchor **"Eq (1.1)"**, 
sec-methods → anchor **"§ 1.1"**, sec-unnumbered → anchor **"§ 1.2"**
(the join — finding 1), eq-nope → **loud `<span>??(eq-nope)</span>`**
with href null + data-ref-to null (edge released); eq-never likewise in
the axes panel. **Both settle warns fired once per episode** (eq-nope,
eq-never — the not-dev-gated settle warn, source-true at
reference.svelte :173-183). The children hatch keeps the edge: 上式
carries to=eq-postures + href.

**Process receipt**: my first cold visit produced NO resolution, NO
degradation, NO warns — the app never hydrated while vite compiled. The
banked cold-server law has a new face: hydration-dependent machines need
the **warm reload** (first visit warms, second visit measures). Both
probe rounds below are warm-reload receipts.

### 5. The SSR/post-settle duality — VERIFIED-TRUE, census CORRECTED

Byte census of the served pass: **11 anchors carry
`href="#to" data-ref-to="to"`** — every one an edge claim for the
harvester. The FORM split: **5 in the `??(to)` fallback form** (eq-r,
sec-methods, sec-unnumbered, eq-nope, eq-never — targets that come
LATER in the pass) and **6 in RESOLVED-LABEL form** (`Eq (1.1)`:
eq-postures ×2, eq-ax-a/b/c/q — targets that register EARLIER in the
same pass; registration is synchronous at init, so a later reference's
$derived sees it even server-side). Zero loud spans in SSR. The
dispatched "5 prerendered edge claims" counted only the fallback half;
marginalia's 11 is the right TOTAL — but her "0 resolved labels in SSR —
the whole static pass is pre-settle" is wrong as an absolute: the pass
is pre-settle, not blind. The harvester contract holds for all 11
(byte-verified href + data-ref-to on each).

### 6. Standard chrome — VERIFIED-TRUE

h1 ×1 · universal marker ×1 · toc **8/8** served order==DOM (overview,
reference-demo, law, types, usage, api, axes, accessibility; install +
see-also out) · the rig resolves post-settle (the only ?? renderers are
the two deliberately-missing ids, loudly) · supply-only rows carry the
zero-reader receipts (no css surface exists).

## Findings

1. **[MINOR · CONFIRMED — fix direction: MOVE, rides closure]** The
   demo's third posture is named "unnumbered" but renders **"§ 1.2"**:
   an undeclared SectionCard inside the decimal domain JOINS it
   (SectionCard numbers by structure; `number === null` never happens
   inside a domain — reference.svelte :148's bare-title branch is
   family-true but unreachable here). My pick between her two options:
   **MOVE the target SectionCard (`id="sec-unnumbered"`) outside every
   domain** — the route registry resolves domain-less targets (the
   Section/Figure asymmetry), so the Reference inside the provider still
   resolves, now to the bare title "Notation" — and add the one-line
   join-rule note her optional-upgrade pattern already models ("an
   undeclared card inside the domain joins it; the bare-title fallback
   needs a domain-less target"). Rationale: the demo lane is NAMED for
   the fallback posture and the law table promises "the bare title";
   rewording would leave the page teaching the join under the
   fallback's name, and the join rule deserves its own sentence anyway.
2. **[LOW · CONFIRMED with the census corrected — rides closure]** The
   dispatched count is stale as an EDGE-CLAIM count: the served pass
   carries **11** claims, not 5 (marginalia's total right). But the form
   split is **5 ??-fallbacks + 6 resolved-in-SSR**, not 11 fallbacks /
   0 resolved — her mechanism sub-claim is corrected above. Recorded so
   the ledger holds the true shape: the harvester sees BOTH forms in
   real artifacts, which is arguably a better contract demonstration
   than either single number.
3. **[LOW · CONFIRMED — pre-existing]** `test/reference.spec.ts:65:27`
   reproduced verbatim: `Error: Parameter 'c' implicitly has an 'any'
   type` on the `warnsFor` filter callback. One-line type fix, family/
   spec lane.
4. **[INFO · ADJUDICATIONS CONCURRED]** (a) Bare-Figure page-honesty
   ACCEPTED — the positive definition + the loud production ?? feedback
   teach the trap; the optional one-sentence upgrade in the law/types
   section is worth taking. (b) The rest-less interface ACCEPTED as the
   declared exception — the pole DEPENDS on the anchor declaring
   nothing; the cost ledger (no aria-label/data-* forwarding) is real
   and flag-level; class forwarding first if a need emerges.

## Cross-check against marginalia's report 37 (read AFTER findings formed)

No divergence on the pole digits, density stamp, theme bridge, edge
machine, join specimen (her § 1.2 + SectionCard :236-254 cite
reproduced), spec debt (verbatim), or chrome. Two corrections, both
hers-to-me: the SSR census mechanism (11 = 5 fallback + 6 resolved, not
11 + 0 — the same-pass-earlier-registration detail her "0 resolved
labels" missed), and one process addition — the warm-reload lesson (her
probe craft note covers selector discipline; the hydration-facing trap
is the cold-server law's new face). Her probe-craft catch (the number-
badge span) mirrors my own first-pass `p:last-of-type` misgrab — same
class, both fixed by posture-exact selectors.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| reference.spec solo | **7/7**, exit 0 |
| figure-numbering solo | **13/13**, exit 0 |
| canvas-same-source solo | **92/92**, exit 0 |
| docs-ambient-vocabulary solo | **282/284** — the 2 failures are **sheet-keyed sibling noise, attributed** (quill's uncommitted sheet rework; the same `sheet\|0\|variant\|1` + bijection keys as task 34, re-attributed fresh: zero reference keys, `git log -S lawTable` still empty, the files still modified in the tree) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | reference.html page: **0 diagnostics**; the spec-debt error IS finding 3's receipt; family :115 warns are the fleet-wide provideUniversalLanes class |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

## Closure

reference passes review #2. My disposition: finding 1 rides closure as
the two-line move + the join-rule sentence (the lane served honestly,
the join taught once); finding 2 records the corrected census (no page
change needed — the page claims no count); finding 3 is the spec lane's
one-liner; the adjudications stand as accepted. No page changes required
beyond finding 1's move.

No commits made. Report file:
`agents/scribe/reports/35-review-reference.md`.
