# design-language-kernel — design-contract review

Date: 2026-08-26

Review scope: the five change documents under
`openspec/changes/design-language-kernel/`, compared with the converged r2
contract in `.agents/documents/2026-08-26-design-kernel/codex-r2-response.md`,
the living specs, and
`.agents/documents/2026-08-26-design-kernel/subgrid-probe-evidence.md`.
This is a documentation/execution-contract review; no implementation files
were changed.

`openspec validate design-language-kernel --strict` passes. That validates the
OpenSpec shape, not the CSS arithmetic, packet ordering, or cross-document
consistency reviewed below.

## Verdict

**BLOCK implementation. Overall score: 4.8/10.**

The change captures the intended architecture and the wave boundary, but the
authoritative design currently contains two competing ruler implementations,
an arithmetic contradiction in the xs scale, and gates that cannot be run by
the packets that own them. P2-P6 should not start until blockers 1-5 are
resolved and the affected docs are revalidated together.

## Blockers

### 1. The authoritative ruler CSS is both internally invalid and contrary to the probe

`design.md:117-148` declares `content-end` as two columns and
`media-content-end` as three columns with `column-gap`, then assigns three-cell
and five-cell-like area concepts. The shown content-end template at
`design.md:145-147` has three cells (`media content end`), which cannot match
the declared two-column subgrid. The narrow snippet at `design.md:168-177`
repeats the same three-cell model. This leaves the implementer with invalid
area definitions or implicit tracks.

It also reverses the empirical contract. Probe 1 explicitly used
`[media] [gap] 1fr [gap] max-content` and reports “gutters-as-tracks” with
column-gap irrelevant (`subgrid-probe-evidence.md:3-15`). The r2 contract
therefore settled on three explicit tracks for `content-end` and five for
`media-content-end`, with `column-gap: 0`.

**Concrete fix:** replace `design.md:117-178` with one normative block:

```css
@supports (grid-template-columns: subgrid) {
  [data-slot='item-list'][data-ruler='content-end'] {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--jx-d-inline-gap) max-content;
    column-gap: 0;
  }
  [data-slot='item-list'][data-ruler='media-content-end'] {
    display: grid;
    grid-template-columns:
      var(--jx-d-media-image) var(--jx-d-inline-gap)
      minmax(0, 1fr) var(--jx-d-inline-gap) max-content;
    column-gap: 0;
  }
}
```

Then provide independent three-cell and five-cell wide/auto/never area
templates, including the media auto narrow form
`media . content . .` and `end end end end end`. Add a gate assertion for
three/five explicit tracks and zero implicit tracks. Do not leave the stale
two/three-column snippet beside the replacement.

### 2. The xs scale cannot satisfy its own table/equation

`design.md:28-30` requires `L_d = T_d * leading_d` and the table at
`design.md:20-25` requires xs `T=11px`, `L=16px`. The intended token block
described at `design.md:41-45` (and the r2 token block) uses
`leading-xs: 1`, which computes `L_xs=11px`, not 16px. The real-browser
table gate would fail before any component geometry is meaningful.

**Concrete fix:** make the xs leading declaration normative and derived:

```css
--jx-density-leading-xs: calc(16 / 11);
```

Keep `leading-sm: 1.5`, `leading-default: calc(20 / 13)`, and
`leading-lg: 1.6`, or explicitly choose a different xs line and update the
table, row floors, media sizes, and all gates as one change. The first option
preserves the approved 16px xs line.

### 3. The living presence-matrix law is not modified, so the deltas conflict

The current living `openspec/specs/css-architecture/spec.md` still requires
exhaustive media/end/header/footer templates with both columns and areas for
every combination. The new component delta at
`specs/component-authoring/spec.md:40-50` and design sections 3 and 6 retire
that matrix for grouped subgrid rows. Both requirements are active after this
change; an implementer cannot satisfy them simultaneously.

**Concrete fix:** add a `## MODIFIED Requirements` delta to
`specs/css-architecture/spec.md` (not only an added requirement):

- standalone and no-subgrid rows retain the exhaustive 16 wide + 8 narrow
  matrix;
- supported grouped subgrid rows use the explicit ItemGroup three/five-track
  ruler and fixed area templates instead of per-row presence enumeration;
- both paths must declare their tracks and areas explicitly, with a
  no-implicit-track scenario;
- the narrow grouped law changes areas only and never changes the shared
  ruler tracks.

Update the proposal/design wording to point at this modified requirement.

### 4. Packet gates are ordered after the packets that need them, and ownership is ambiguous

`tasks.md:19-33` makes P4a require `verify-density-kernel` and P4b require
`verify-item-ruler`, but `tasks.md:30-33` assigns creation of both scripts to
later P5. `design.md:267-270` repeats that ownership. P3 also owns the jsdom
context spec in `tasks.md:14-18`, while the packet table assigns “new spec
files” to P5. P4a and P4b both own the same `ui/list-item/**` globs, so their
“sole file ownership” is not actually disjoint. Finally, the registry edge is
P0-owned but appears as a P3 gate without a P0 checkpoint.

**Concrete fix:** choose and document one executable sequence. Recommended:

1. P0 publishes the manifest and applies the registry item/dependency edge.
2. P3 owns the exact `apps/www/test/density-context.spec.ts` file.
3. P5a owns and scaffolds both verify scripts plus named fixtures before P2-P4
   gates run; P5b performs the final Chromium acceptance after P4.
4. P4 owns the entire list-item pair for the migration (one packet), or split
   it into exact non-overlapping file lists rather than two identical globs.
5. P2/P3/P4 run their gates against the P5a interfaces; P5b reruns them after
   implementation.

If P5 must remain one packet, move all P2/P4 gate execution to P0 closeout
and state that P2/P4 perform only local source/type checks. Either choice is
valid; the current ordering is not.

### 5. The field-lane contract is weaker than the approved r2 law

`design.md:196-204` says the never lane has `flex-wrap: nowrap` and names
`--jx-d-hit-min`, but it does not make either a concrete selector or a SHALL
requirement. The component delta at `specs/component-authoring/spec.md:50-51`
only says “a 44px hit-min floor”. That is wrong for the approved table: `lg`
has a 48px hit minimum, while xs/sm/default resolve to 44px.

The design's grouped CSS at `design.md:117-155` also has no explicit
`[data-wrap='never'] { flex-wrap: nowrap; min-block-size: var(--jx-d-hit-min) }`
rule, so an agent can implement the prose and still leave the known defect
under-specified.

**Concrete fix:** make the requirement exact:

```css
[data-slot='item-end'] {
  display: flex;
  flex-wrap: wrap;
  min-block-size: var(--jx-d-hit-min);
}
[data-slot='item-end'][data-wrap='never'] {
  flex-wrap: nowrap;
}
```

Require `ItemField` to render `wrap="never"`, require content `min-width: 0`,
and include the explicit `data-content-wrap="truncate"` selector in the
design contract. State that the hit floor is the inherited density value, not
the literal 44px.

### 6. P2 cannot implement the authoritative token API from `design.md` alone

`design.md:41-65` abbreviates the “canonical sheet block” and only shows the
default mapping. It omits the exact declarations and aliases for
`content-gap`, `secondary-text`, `secondary-leading`, `secondary-line`, and
the optical correction that the balance section references. The vocabulary
line also omits some of those names. `tasks.md:9-13` nevertheless requires a
“full” vocabulary.

**Concrete fix:** copy the complete r2 token block into `design.md` (or add a
normative appendix), including all four derived declaration sets, all four
scope mappings, `--jx-d-content-gap`, secondary text/line aliases,
`--jx-d-media-gutter`, `--jx-d-end-gap`, and the bounded optical token. The
packet must not need to reopen r2 to decide names or formulas.

### 7. The grouped CSS omits the local cascade/loading conformance boundary

`design.md:117-155` presents selectors without the required
`@layer components` + `:where()` framing. The living
`openspec/specs/css-architecture/spec.md` requires that folder CSS open with
the canonical layer statement, be loaded from the component folder, and let
consumer utilities win. A packet agent can paste the authoritative block
unlayered and silently violate the existing law.

**Concrete fix:** state that the block is inserted into the existing
`item.css` under `@layer components`, every selector is `:where()`-wrapped,
the stylesheet remains the relative side-effect import, and no second global
import is added. Add this to P4's gate.

### 8. The scope-location wording contradicts the required mirror

The component delta at `specs/component-authoring/spec.md:10-13` and the CSS
delta at `specs/css-architecture/spec.md:10-11` say density scopes exist
“ONLY in the canonical theme sheet”, while `proposal.md:64-68` and
`design.md:41,74-76` require a byte-identical mirror at `apps/www/src/lib`.
The mirror necessarily contains the same scopes.

**Concrete fix:** replace the phrase with “only in the canonical theme sheet
and its byte-identical generated mirror; never in component CSS”. Keep the
source↔mirror parity gate.

## Evidence boundary

The docs should distinguish observed facts from future acceptance gates.
Probe 1 lists six positive hypotheses at
`subgrid-probe-evidence.md:7-15` (media alignment, end alignment, absent
media, derived token resolution, one container query, and explicit gutter
tracks). Probe 2 is explicitly labelled 7/7 and establishes two-level
alignment, absent-media retention, header span, mixed auto/never placement,
nested density inheritance, and a 40px derived media track
(`subgrid-probe-evidence.md:29-35`). It does not establish the checkbox
fixture, footer/divider implementation, SSR stamps, truncation, hit-min, or
the no-subgrid 33/33 fallback.

`design.md:235-256` mostly treats those as future verify-script assertions,
which is correct. `proposal.md:11-13` says the two probes are “7/7, 7/7”;
that count is not present in the evidence file (the first table has six listed
hypotheses). Change it to “the documented probe checks plus Probe 2’s 7/7” or
add a result line to the evidence. Do not present future gate targets as
already proven.

## Non-blocking notes

1. `design.md:208` calls the migration “type widened”; this is a breaking
   replacement of `ItemSize`, not a widening in the compatibility sense. Use
   “retyped from ItemSize to Density; breaking, no alias”.
2. `design.md:189` writes `Q = clamp(--jx-d-icon-optical-inline ?? 0px, ...)`,
   which is pseudocode rather than CSS. Use
   `clamp(var(--jx-d-icon-optical-inline, 0px), -U/2, U/2)` in the normative
   equation.
3. `tasks.md:6-8` makes review ACCEPT a prerequisite but does not name the
   review artifact path; point it at `review-design.md` and require the
   BLOCK/ACCEPT call to be green.
4. The P2 gate says “full suite green” before P4 has migrated existing
   `data-size` assertions. Either explicitly include test updates in P4a or
   defer the full-suite gate to P0 closeout.
5. The design says “content-end” rejects media but does not specify the
   runtime assertion mechanism. Name the dev assertion behavior (throw in
   development or stamp an invalid state and fail the fixture) so P4 does not
   invent one.

## Quality by document

| document | assessment | score |
|---|---|---:|
| `proposal.md` | Clear intent, scope, non-goals, and impact. The probe count is overstated and mirror wording is slightly inconsistent. | 7.5/10 |
| `design.md` | Broad coverage and useful equations, but the authoritative ruler block is a show-stopper, the xs arithmetic is inconsistent, and the token contract is abbreviated. | 4.0/10 |
| `tasks.md` | Good packet vocabulary and gate intent, but the dependency order and overlapping ownership make execution impossible as written. | 4.5/10 |
| `specs/component-authoring/spec.md` | Captures two-channel density, shared ruler, and the desired scenarios. The matrix exception and field hit-min details need stronger normative wording. | 7.0/10 |
| `specs/css-architecture/spec.md` | Correctly adds derivation and source-guard intent, but fails to modify the active exhaustive-matrix requirement and contradicts the mirror contract. | 5.0/10 |

## Required re-review gate

Before implementation starts, update the five change docs so that:

1. one exact 3/5-track ruler block is the only grouped CSS contract;
2. xs leading computes to the table's 16px line;
3. the living matrix requirement has an explicit grouped-subgrid exception;
4. packet ownership and gate order are disjoint and executable; and
5. ItemField/ItemEnd enforce the inherited hit-min and nowrap law.

Then rerun `openspec validate design-language-kernel --strict` and request a
fresh design review. Until that re-review is ACCEPT, implementation is
**BLOCKED**.

## Round 2

Date: 2026-08-26

The remediated change was reread from the working tree and validated with
`openspec validate design-language-kernel --strict` (passes). Appendix A now
contains the complete token declarations and mappings, Appendix B contains
the explicit 3/5-track rulers and all four narrow area variants, the modified
presence-matrix requirement is present, and the P0 → P5a → P2 → P3 → P4 →
P5b → P6 → P0 sequence is documented.

### Prior blocker verdicts

| prior blocker | verdict | verification |
|---:|---|---|
| 1. stale/invalid 2/3-column ruler | **PASS** | `design.md:438-607` is now the sole normative grouped CSS; it uses explicit 3/5 tracks, `column-gap: 0`, two subgrid levels, and four narrow templates. The track-count gate is named at `design.md:442` and `206-214`. |
| 2. xs leading arithmetic | **PASS** | `design.md:267` is `calc(16 / 11)` and `design.md:23` remains 11px text / 16px line. |
| 3. living matrix conflict | **PASS** | `specs/css-architecture/spec.md:31-84` has a MODIFIED stamped-attribute requirement with standalone/no-subgrid 16+8 retention and grouped explicit-ruler topology. |
| 4. packet ordering/ownership | **PARTIAL** | The sequence and P4 single-packet ownership are corrected (`design.md:223-249`, `tasks.md:10-33`), and P3 owns its context spec. A remaining test-file ownership gap is blocker R2-1 below. |
| 5. field lane under-specified | **PASS** | `design.md:141-169` and `Appendix B:539-551` require inherited `--jx-d-hit-min`, auto wrapping, never nowrap, and explicit truncation. The component delta says SHALL at `specs/component-authoring/spec.md:50-52`. |
| 6. abbreviated token API | **PASS** | Appendix A `design.md:255-436` supplies the full factor, leading, floor, secondary, optical, and four scope mappings. |
| 7. missing layer/loading boundary | **PASS** | `design.md:99-113` and `438-442` require existing `item.css`, `@layer components`, `:where()`, and no global import. |
| 8. canonical/mirror scope wording | **FAIL** | `specs/css-architecture/spec.md:10` is corrected, but `specs/component-authoring/spec.md:10-13` still says “ONLY the canonical theme sheet carries density scopes”. That contradicts the byte-identical mirror required by `proposal.md:66-68` and `design.md:44-47`. |

### New blockers

#### R2-1 — P4 has a focused-test gate but no ownership of the affected test files

`tasks.md:24-30` gives the single P4 packet a focused Vitest gate while its
owned files are only the two `ui/list-item/**` trees (`design.md:247`). The
existing list-item tests live outside that ownership boundary (at minimum
`apps/www/test/list-item.spec.ts` and `apps/www/test/list-item-field.spec.ts`),
and they necessarily need updates for the removed `data-size` authority,
`data-density` stamps, the new `ruler`, and `ItemField`'s `wrap="never"`.
P5 owns only the two verify scripts and their fixtures; P3 owns only
`density-context.spec.ts`. No packet may legally update those existing tests.

**Required fix:** either add the exact existing list-item test files and their
fixtures to P4's sole ownership row/task, or assign them to a named P5 test
subpacket and move the focused Vitest gate after that handoff. The chosen
owner must be stated in both `design.md:242-249` and `tasks.md:24-30`; do not
broaden an ownership glob implicitly.

#### R2-2 — the normative balance equation still contains invalid CSS syntax

`design.md:132` still states:

```text
Q = clamp(--jx-d-icon-optical-inline ?? 0px, −U/2, U/2)
```

`??` is neither CSS custom-property fallback syntax nor valid equation syntax
for the stated token contract. Appendix A correctly declares the optical
token, but the authoritative balance section can still cause an agent to
implement the wrong expression.

**Required fix:** replace it with the exact normative expression already used
by the r2 contract:

```text
Q = clamp(var(--jx-d-icon-optical-inline, 0px), -U/2, U/2)
```

Keep the CSS custom property declaration and the ±U/2 gate unchanged.

### Non-blocking Round 2 notes

1. `design.md:173` still calls the breaking `ItemSize` → `Density` migration
   “widened”. “Retyped; breaking, no alias” is more precise and avoids a
   compatibility inference.
2. P5a says “named fixtures” but does not list their paths. This is workable,
   though exact fixture paths would make the packet handoff more auditable.
3. `design.md:93-96` describes the content-end/media misuse as a dev-time
   assertion; the implementation mechanism (throw versus a stamped invalid
   state) remains intentionally open. Name it before P4 starts if the project
   wants deterministic failure semantics.
4. The proposal's “documented probe checks + Probe 2 at 7/7” wording is now
   evidence-safe. The docs continue to present footer/divider, checkbox,
   SSR/reactivity, truncation, and fallback checks as future gates rather than
   as already-established probe results.

### Round 2 quality assessment

| document | Round 2 assessment | score |
|---|---|---:|
| `proposal.md` | Scope and probe provenance are now accurate; mirror wording is clear through the impact section. | 8.8/10 |
| `design.md` | Appendix A/B and the executable sequence are substantially complete. The unowned focused tests and invalid Q expression remain. | 8.2/10 |
| `tasks.md` | Ordering is now executable and P4 is one packet, but its focused Vitest gate still lacks test-file ownership. | 8.0/10 |
| `specs/component-authoring/spec.md` | Topology and field SHALLs are strong; the canonical-only mirror wording is still contradictory. | 7.8/10 |
| `specs/css-architecture/spec.md` | The modified topology requirement and original scenarios now reconcile the living matrix law; mirror wording is corrected. | 9.0/10 |

**Round 2 score: 7.8/10. Call: BLOCK implementation start.**

Resolve R2-1, R2-2, and the one remaining prior blocker (#8), rerun strict
validation, then request the implementation-start review. Once those three
textual defects are closed, the contract is suitable for packet execution.

## Round 3

Date: 2026-08-26

`openspec validate design-language-kernel --strict` passes. The prior #8
mirror-scope correction is present at
`specs/component-authoring/spec.md:11-14`: scopes live only in the canonical
sheet **and its byte-identical generated mirror**, never component CSS.

R2-1 and R2-2 are **not** present in the actual working-tree documents:

1. `design.md:242-249` still assigns P4 only `ui/list-item/** (both trees)`.
   `tasks.md:24-30` likewise omits `apps/www/test/list-item.spec.ts`,
   `apps/www/test/list-item-field.spec.ts`,
   `apps/www/test/playground-bridge.spec.ts`, and their host fixtures. Those
   are the live focused surfaces (for example,
   `apps/www/test/list-item.spec.ts:75,191` imports the group/policy hosts;
   `list-item-field.spec.ts:11` imports the field host), so P4 still cannot
   legally update the assertions needed by its own focused-Vitest gate.
2. `design.md:132` still contains
   `Q = clamp(--jx-d-icon-optical-inline ?? 0px, -U/2, U/2)`, not the claimed
   CSS-valid `var()`/ruler-unit expression. The implementation-start contract
   remains ambiguous and incorrect at its sole normative balance equation.
3. `design.md:93-95` still says “a dev-time assertion + the ruler probe fail”
   but does not state the claimed auto-placement/negative-DOM mechanism. The
   Appendix B comment at `design.md:455` is not an enforcement contract or an
   asserted observable. This is a non-blocking clarification, but it was not
   remediated as claimed.

**Round 3 score: 8.0/10. Call: BLOCK implementation start.**

Correct the two unlanded blockers in the actual docs: add the exact existing
test files and three named host fixtures to P4 ownership/task duties, and
replace the Q equation with
`clamp(var(--jx-d-icon-optical-inline, 0px), calc(var(--jx-ruler-unit) / -2), calc(var(--jx-ruler-unit) / 2))`.
Then the remaining implementation-start concern is closed; the negative DOM
assertion wording should be made explicit in the same edit.

## Round 4

Date: 2026-08-26

The claimed fixes are now present in the actual change tree:

- `design.md:132` contains the CSS-valid ruler-unit expression
  `clamp(var(--jx-d-icon-optical-inline, 0px), calc(var(--jx-ruler-unit) / -2), calc(var(--jx-ruler-unit) / 2))`. The only older `??` strings are historical findings in this review record, not normative change-doc text; the change documents contain zero `?? 0px` hits.
- `design.md:251` and `tasks.md:28-32` give P4 ownership of the existing
  `list-item.spec.ts`, `list-item-field.spec.ts`, and
  `playground-bridge.spec.ts` surfaces plus `item-group-host.svelte`,
  `item-field-host.svelte`, and `item-policy-host.svelte`, with duties to
  update density stamps, ruler assertions, and the field lane.
- `design.md:93-100` now names deterministic misuse behavior: content-end has
  no `media` named area, a stray `ItemMedia` auto-places and visibly breaks,
  and `verify-item-ruler` carries the negative DOM assertion.
- `specs/component-authoring/spec.md:11-14` now correctly scopes density
  selectors to the canonical sheet and its byte-identical mirror, never
  component CSS.

`openspec validate design-language-kernel --strict` passes after these edits.
The previous Round 3 blockers are therefore **CLOSED**. The remaining path
shorthand in the P4 ownership row (`test/...` versus the task's explicit
`apps/www/test/...` context) is an auditable notation issue, not an ownership
ambiguity: the exact files and fixtures are named and the task and design
agree on the same surface.

**Round 4 score: 9.4/10. Call: ACCEPT implementation start.**

P0 may publish the packet manifest and let P5a scaffold the probes. Automated
gates remain necessary, and Owner visual acceptance remains the final product
acceptance; this call only clears the documentation contract to begin the
packet-scoped implementation sequence.
