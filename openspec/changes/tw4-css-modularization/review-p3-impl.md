# P3 implementation review — tw4-css-modularization

> Independent review, 2026-08-24. Scope: `89e7193...22b0ea3` (7 commits,
> 301 changed paths). This assessment is deliberately fixed to that range;
> current `HEAD` `087c757` is a later P4-docs commit and is excluded. The
> report relies on the scoped sources, historical scoped styles, generated
> manifest, and locally re-run gates.

## Verdict

**BLOCK — 5.5/10 implementation quality.**

The utility migration preserves a substantial amount of paint and the
source-to-mirror/build/test gates are healthy. However, four contract
breaches remain: five consumers route frozen Tier-2 classes through `cn()`,
`code-card` has an incomplete and duplicate registry closure, the documented
two-exception cascade law does not describe three implemented exceptions, and
the claimed screenshot evidence photographs 404 routes rather than the docs
components whose parity it purports to establish.

## Blocking findings

1. **Tier-2 Part A is routed through `cn()`.**
   The component-authoring delta prohibits routing Tier-2 classes through
   `cn()` ([component-authoring spec](specs/component-authoring/spec.md:21)).
   The frozen vocabulary explicitly includes `.jx-field`, `.jx-field-shell`,
   `.jx-input-lane`, `.jx-range`, and `.jx-color-field`
   ([jx-pure.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/theme/jx-pure.css:14)).
   Current violations are [input.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/input/input.svelte:175)
   (three calls), [textarea.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/textarea/textarea.svelte:122),
   [number-input.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/number-input/number-input.svelte:207),
   [range.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/range/range.svelte:225), and
   [color-picker.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/color-picker/color-picker.svelte:243).
   Fix by keeping each Part A class outside `cn()` (plain static class/string
   composition or class directives) while continuing to use `cn()` only for
   Tier-1-owned utility slots. Verify the five locations have no Part A class
   in a `cn(...)` argument, then re-run the Part A override probe.

2. **`code-card` cannot meet its clean-consumer registry contract.**
   It imports and uses `$lib/utils` ([code-card.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/code-card/code-card.svelte:39))
   without declaring `@jixoai/utils`; its registry dependencies only name
   theme and shiki ([registry.json](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry.json:629)).
   It also directly ships `@lib/shiki.ts` ([registry.json](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry.json:639))
   while depending on `@jixoai/shiki`. The manifest therefore records shiki
   as a second claim rather than a canonical owner. This violates the
   exactly-once P0.3 ruling ([tasks.md](tasks.md:73)) and the registry
   dependency contract ([registry spec](specs/registry/spec.md:34)).
   Fix by adding `@jixoai/utils`, removing code-card's direct `shiki.ts`
   `files[]` entry, retaining `@jixoai/shiki`, regenerating the manifest and
   payload, and extending `verify-shadcn-add.mjs` with a real clean
   `shadcn add @jixoai/code-card` fixture that asserts one `@lib/shiki.ts`,
   one `@lib/utils.ts`, and a passing consumer build.

3. **The carve-out implementation exceeds the normative law.**
   The CSS delta permits exactly the unlayered Tier-2 vocabulary and a
   zero-specificity, component-own state-machine carve-out
   ([css-architecture spec](specs/css-architecture/spec.md:60)).
   In contrast, [terminal-header.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/terminal-header/terminal-header.css:18)
   leaves the entire sheet unlayered, including static indicator and nav
   rules; its `.jx-pop.jx-subpanel` rule uses natural specificity at line 87.
   [tooltip.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/tooltip/tooltip.css:34)
   and [popover.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/popover/popover.css:42)
   likewise override the unlayered `jx-surface` law with natural specificity.
   Separately, `tour` and the static table-descendant rules omit the required
   `:where()` wrapping ([tour.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/tour/tour.css:15),
   [table.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/table/table.css:22));
   sheet's `[open]`/`.closing` animation states are also plain selectors in
   the components layer ([sheet.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/sheet/sheet.css:27)),
   contrary to their own stated state-machine rationale.

   Fix one of two ways: move ordinary static rules to `@layer components`
   behind `:where()`, retaining only state rules as the existing carve-out;
   or add a narrowly scoped, third **surface-kernel override** exception to
   the CSS delta. The latter must enumerate only the direct `jx-surface`
   overrides, require a reason and a consumer-override probe per case, and
   cannot justify the whole terminal-header sheet. Add browser probes for
   terminal-header, tooltip, and popover, not just the generic layer probe.

4. **The 0.5% screenshot result is invalid visual-parity evidence.** Route
   discovery names static output routes such as `/tokens.html` and
   `/components/<name>.html`, but the capture loop removes `.html` before
   navigation ([capture-baseline.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/capture-baseline.mjs:151)).
   A fresh Vite server returns 404 for `/tokens` and the component paths; a
   successful `page.goto()` does not imply a 200 response, so the script still
   captures and counts those error pages. The reported `69 routes, home-only
   CHANGED` result therefore does not demonstrate visual parity for the
   migrated component docs.

   The comparator has independent gate defects: it counts hot RGB channels
   while its comment calls them cells
   ([line 100](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/capture-baseline.mjs:100)),
   writes only a boolean status, and exits `0` for both `CHANGED` and missing
   screenshots ([line 132](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/capture-baseline.mjs:132)).
   Route discovery also produces 69 entries but only 67 unique PNGs because
   `/tokens.html` and `/blueprints.html` are each duplicated.

   Fix by navigating the correct `.html` route or using a status-checked
   fallback like [verify-folder-css.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-folder-css.mjs:40),
   requiring HTTP 200 and a page-specific marker before capture, deduplicating
   routes, recording per-route hot-pixel (or truthfully named hot-channel)
   ratios, and failing on missing or unexpected changes. Re-capture from the
   committed source, retain the metrics JSON, and permit only an explicit
   allowlist such as the intended `/` delta.

## Migration sample

| Component | Independent result |
| --- | --- |
| input | Slot, clear-button, and outer-spacing paint moved to utilities; only SVG/UA pseudo/state residue remains. Blocked by the Part A `cn()` calls above. |
| checkbox | Checkmark pseudo geometry is layered and state repaint is a narrow unlayered `:where()` carve-out; Part A scaffold is consumed unchanged. Paint mapping is faithful. |
| tour | Anchor-positioning/fallback geometry remains in the CSS file and static card paint moved to markup, but its component-layer selectors lack `:where()`. |
| sheet | Slide keyframes, backdrop, and reduced-motion behavior survived the move. The plain animation-state selectors do not follow the written zero-specificity state rule. |
| terminal-header | View-transition indicator, popover panel, and mega-panel geometry are retained, but an entire unlayered sheet is not a constrained carve-out. |
| table | Descendant and container-query behavior is retained; responsive/state rules are zero-specificity, while static `th`/`td` paint is not. |
| press-button | Effect loops, properties, cqw math, pseudo build, and reduced-motion kill retain their prior values; the layered static residue is consistently `:where()`. |
| toast | Card/tone/animation utility migration retains the prior values; only keyframes and the reduced-motion kill remain, appropriately scoped. |

Every sampled component imports its colocated CSS relatively where one is
needed, and all sampled sheets begin with the canonical ORDER LAW prologue.
The source and `apps/www` copies compare byte-for-byte; `jx-pure.css` itself
has no diff in this range. The prologue-before-intent-comment convention is
accepted: it resolves the literal conflict between "sheet opens with the
layer order" and "top intent comment" without changing CSS semantics.

## Registry and mirror

Positive checks: `jx-pure -> @jixoai/jixoai-theme`, `dialog ->
@jixoai/jixoai-theme` only, and the two font packages in the theme item's npm
`dependencies` are correct. `node scripts/gen-mirror-manifest.mjs --check`
is green. The `code-card` closure in blocker 2 is not covered by the existing
fixture: `verify-shadcn-add.mjs` currently tests only accordion and toast.

`section-card` uses token utilities while declaring no theme dependency, and
`icon-button` receives theme only transitively through tooltip. Both predate
this P3 range, so they are not counted as new migration blockers here; they
should be reconciled with the delta's "utility-authored UI items declare
theme uniformly" wording before P4 publishes the registry contract.

## Screenshot Oracle

The 0.5% tolerance may be a reasonable *triage hypothesis*: decoded pixel
data avoids PNG encoder noise, reduced-motion stabilizes rendering, and the
stored P3 comparison reports the homepage at 2.184% hot channels versus a
0.478% highest non-home result (67 unique image names; mean 0.350%). But the
input set is invalid: the script captured 404 pages for the static `.html`
docs routes. Those measurements cannot calibrate the tolerance for component
paint, and a fresh capture with the current script cannot repair that defect.

`verify-layer-law` and `verify-folder-css` remain valid browser probes because
they target an `.html` path directly or perform an explicit 404 fallback; they
do not establish screenshot parity. After route/status/marker validation is
implemented, the threshold must name its channel-level unit truthfully, emit
metrics, and fail outside its allowlist. Browser/Owner visual review remains
the final appearance acceptance.

## Legacy-item decisions

| Item | Decision |
| --- | --- |
| terminal-card IACVT `box-shadow` | **Accept as P3 parity debt, non-blocking.** The pre-range scoped rule already used `6px 6px 0 0 var(--shadow)`; P3 preserves the IACVT-none behavior. Correct separately with the color token (`--shadow-color`) rather than changing this migration. |
| `app.css` and `--brand-hue:330` | **Non-blocking correction required.** It is an initial fallback, not a live invariant: `hue-runtime.ts` writes `--brand-hue` at runtime. Amend the comment accordingly. |
| transfer `@container` | **Accept as pre-existing parity debt, non-blocking.** There is no query-container ancestor for the root, so the phones rule is dead. Record it as dead behavior; a later functional fix needs a wrapper/container boundary and a narrow-width probe. |
| terminal-header plain specificity | **Reject as implemented.** The subpanel's foreign-surface override may be technically necessary, but the whole unlayered sheet is not. Narrow it and add the normative exception/probe described in blocker 3. |
| tooltip/popover `jx-surface` overrides | **Accept need, reject undocumented form.** These are surface-kernel overrides, not the existing state-machine carve-out. Add the bounded third exception and consumer-override proof, or refactor them into compliant layered rules. |

## Re-run evidence

- `npm run build`: pass.
- `npm --prefix apps/www run test`: 24 files, 327 tests pass.
- `npm --prefix apps/www run build`: pass.
- `node scripts/gen-mirror-manifest.mjs --check`: pass.
- `node scripts/verify-layer-law.mjs 5200`: 8/8 pass.
- `node scripts/verify-folder-css.mjs 5200`: all checks pass.
- `openspec validate tw4-css-modularization --strict`: valid.

The Svelte/a11y diagnostics printed by test/build remain warnings; none is
used to waive the four blockers above.

## P3-r1 Re-review — `1f90bb9`

> Independent re-review, 2026-08-24. The remediation commit was assessed
> against its parent `087c757`, with the original P3 cutoff `22b0ea3` used
> for r0-to-r1 regression context. This section is based on current source,
> the generated manifest, and locally executed gates; it does not rely on
> the implementation self-report.

### Verdict

**BLOCK — 7.0/10 implementation quality (r0: 5.5/10, +1.5).**

The increase reflects real closure of B1 and B2, plus a sounder capture phase
for B4. The remaining B3 and B4 contract failures are release-blocking: the
claimed Sheet state-machine carve-out is still layerized, the newly normative
surface-kernel probes do not exist, and a screenshot comparison never fails
for a missing or unexpected image.

### Closed Findings

1. **B1 closed.** The five Part A consumers now retain their frozen classes
   outside `cn()`: input uses plain composition for range/color/shell
   ([input.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/input/input.svelte:175)),
   textarea does the same for its shell
   ([textarea.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/textarea/textarea.svelte:122)),
   and number-input keeps `jx-input-lane` on the left of the `cn()` result
   ([number-input.svelte](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/number-input/number-input.svelte:206)).
   Range and color-picker likewise use plain Part A composition. The manifest
   check confirms their mirrors remain byte-identical.

2. **B2 closed.** `code-card` now declares `@jixoai/utils`, has no direct
   `shiki.ts` file claim, and reaches the single canonical `@lib/shiki.ts`
   through `@jixoai/shiki` ([registry.json](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry.json:631)).
   `verify-shadcn-add.mjs` derives its staged payloads from `registry.json`
   ([verify-shadcn-add.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-shadcn-add.mjs:69))
   and the locally re-run clean-consumer fixture passed all code-card chain
   assertions plus its Vite build.

3. **B3 partial only.** `terminal-header.css` now has the intended three
   bands: static rules are layered and zero-specificity, state rules are
   unlayered and zero-specificity, and the sole enumerated subpanel override
   is naturally specific ([terminal-header.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/terminal-header/terminal-header.css:24)).
   The bounded third exception is also now written into the architecture
   delta. This does not close the sheet defect or satisfy its own probe law.

4. **B4 capture phase closed.** Capture now visits literal `.html` routes,
   requires HTTP 200 and main content, deduplicates route slugs, and returns
   nonzero when capture fails
   ([capture-baseline.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/capture-baseline.mjs:149)).
   These changes prevent the prior 404-shell capture failure, but do not make
   the comparison a failing gate.

### Blocking Findings

1. **B3: Sheet's stated unlayered state-machine carve-out is still inside
   `@layer components`.** [sheet.css](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/sheet/sheet.css:19)
   opens the layer and does not close it until line 90. Consequently the
   reduced-motion kill and every `[open]`/`.closing` rule remain layerized;
   the latter also use natural selectors such as `.jx-sheet-left[open]`
   ([line 40](/Users/kzf/Dev/GitHub/jixoai-labs/ui/registry/files/ui/sheet/sheet.css:40)),
   rather than the documented unlayered `:where(...)` state-machine form.
   A utilities-layer animation can still beat the exit/reduced-motion rule,
   precisely the failure this carve-out was meant to prevent.

   Fix by closing `@layer components` immediately after the static glyph
   rule, then placing the media kill and state selectors outside it and
   wrapping each selector in `:where(...)`. Add a computed-style browser
   probe that proves the state/reduced-motion rule beats the component's own
   animation utility while an unrelated consumer utility can still override
   static paint. Keep both registry and www mirrors identical.

2. **B3: the new SURFACE-KERNEL OVERRIDE requirement has no required
   consumer-override probes.** The delta requires every enumerated use to
   carry one, but [verify-layer-law.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-layer-law.mjs:36)
   tests only toc/scaffold, Part A, and global context. It contains no
   terminal-header, tooltip, or popover coverage. The exception is therefore
   described but not accepted by its prescribed executable evidence.

   Add browser probes for the terminal-header subpanel and both tooltip and
   popover surface overrides. Each must prove the foreign `jx-surface` law is
   overridden where required and that the documented consumer override still
   has its intended result. Make the probes part of a failing verification
   script, then re-run it on the consumer build.

3. **B4: comparison mode still accepts missing and unexpected visual
   changes.** [capture-baseline.mjs](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/capture-baseline.mjs:116)
   records `missing` and `CHANGED`, but always calls `process.exit(0)` at
   line 132. It also records status only, so neither a per-route hot-channel
   ratio nor an allowlist decision is reproducible. The capture-side nonzero
   exit does not protect the actual baseline comparison.

   Return the measured hot-channel count and ratio for every route, dedupe
   before reporting, and fail the compare process for missing images or any
   `CHANGED` route not in an explicit allowlist. A sanctioned change must be
   named in the invocation or committed report; all other changes must be
   nonzero. Retain 0.5% only as a clearly named triage threshold, with
   Owner/browser inspection still deciding appearance acceptance.

### Standards

One documented-standard breach remains: the Sheet state selectors are both
layerized and naturally specific despite the architecture law requiring an
unlayered zero-specificity state-machine carve-out. One judgement-call smell
also remains: `verify-shadcn-add.mjs` parses the same registry document twice
in its fallback expression. The latter is non-blocking.

### Spec

B1 and B2 meet their r0 repair requirements. B3 is still partial because the
Sheet carve-out has not been implemented and the new surface-kernel exception
lacks its mandatory probes. B4 is still partial because route capture is now
sounder, but comparison has no executable failure behavior for a missing or
unallowlisted visual delta.

### Verification Evidence

- `node scripts/gen-mirror-manifest.mjs --check`: green.
- `npm --prefix apps/www run test`: 24 files, 327 tests pass.
- `npm run build` and `npm --prefix apps/www run build`: pass.
- `node scripts/verify-shadcn-add.mjs`: all accordion, toast, and code-card
  clean-consumer assertions plus Vite build pass.
- `node scripts/verify-layer-law.mjs 5199` and
  `node scripts/verify-folder-css.mjs 5199`: pass, but neither covers the
  two B3 gaps above.
- `openspec validate tw4-css-modularization --strict`: valid.

### Non-blocking Note

`verify-shadcn-add.mjs` parses `registry.json` twice in its null-coalescing
expression ([line 72](/Users/kzf/Dev/GitHub/jixoai-labs/ui/scripts/verify-shadcn-add.mjs:72)).
Parse once before selecting `.items`; this has no observed behavioral impact.
