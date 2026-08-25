# Design Review: density-adoption

Date: 2026-08-26  
Review scope: proposal, design, tasks, and the four spec deltas, checked against the converged R2 contract at `.agents/documents/2026-08-26-density-adoption/codex-r2-response.md` and the living specs. No product implementation was reviewed.

## Evidence

- `openspec validate density-adoption --strict`: **PASS**.
- The documented baseline is coherent with the live checkout: manifest 297 pairs, kernel 61/61 (59 table + 2 scanner), ruler 18/18, matrix 37/37, suite 492/492, and jx-pure 65/65.
- Strict validation proves OpenSpec structure and retained scenarios within a named modified requirement. It does not prove that a `MODIFIED` heading has a living target, that prose outside a requirement does not contradict the change, or that a concurrent agent has an executable packet manifest.

## Blockers

1. **[P0] The claimed exact packet manifest is absent, so the concurrency and merge-stop contract cannot execute.**

   `design.md:3-7` calls itself self-contained; `design.md:117-120` defines
   `P(...)` as exact ownership; `design.md:148-178` then replaces all A-E
   packet lists with family ellipses and an external pointer to R2. `tasks.md:22-41`
   repeatedly calls those nonexistent lists “exact,” while the orchestrator at
   `tasks.md:42-45` must compare `git diff --name-only` against them. This is
   not enough for a packet-scoped agent: it cannot know, for example, which
   A families own CSS versus Svelte/index only, which exact docs route files
   are allowed, or whether a blueprint file belongs to the packet.

   The R2 pointer is not a valid execution dependency: it is outside the
   OpenSpec change and contradicts the design's self-contained claim.

   **Fix:** inline the R2 section 4 A-E lists verbatim in `design.md`, with
   full relative paths and extensions for source, mirror, tests, docs routes,
   and scenes. The alternative is one new, versioned
   `openspec/changes/density-adoption/packet-manifest.md`, referenced by a
   fixed heading from design and tasks; it must be the single exact input to
   the orchestrator's path check. No `...`, “its docs/scenes,” or external
   pointer may remain. K0/F/G need the same full path grammar, not abbreviated
   route pairs, if the manifest is meant to be mechanically checked.

2. **[P0] Two deltas claim to MODIFY requirements that do not exist, and the jx-pure delta discards most of its living contract.**

   `specs/design-tokens/spec.md:3-5` labels `the derived-scale law` as
   `MODIFIED`, but the living `design-tokens` spec has only OKLCH, structure,
   and degradation requirements. The derived-scale law was added to
   `css-architecture` by the archived kernel change, not to design-tokens.
   Its new exception-registry law also has no living target.

   `specs/jx-pure/spec.md:3-5` labels Part A as `MODIFIED`, but the living
   jx-pure spec has a narrative “Current contract,” not a `Requirement: Part
   A`; the same is true of Part B. If this text is applied as the post-change
   contract, it loses the unlayered Part A cascade, the Part B type allowlist,
   reverse `.no-jx-pure` scope, native-number/select decisions, full element
   face, Part C forced-colors/reduced-motion, Part D auto-dark generation,
   and the floating-surface/shadow-root boundaries. R2 preserves all of those
   laws (`codex-r2-response.md:294` and `:515-523`); the delta does not.

   **Fix:** use `ADDED Requirements` for genuinely new design-token laws (or
   first give the living spec a real target requirement). Convert the jx-pure
   living Current-contract material into explicit post-change requirements,
   preserving Parts A-D and Boundaries before applying the v2 changes. The
   resulting delta must state the v2 rename, unlayered Tier-2 cascade,
   `@layer components`/`:where(.jx-pure)` element face, reverse scope,
   degradation, auto-dark generator and priority rules, shadow-root adoption,
   and floating-surface boundary. A green structural validator is not an
   adequate substitute for a valid semantic target.

3. **[P0] The untouched living component and CSS requirements still forbid or describe the old world.**

   The change modifies both theme sheets, while the living placement law says
   `jixoai.css` and `jx-pure.css` are “consume-only, unchanged by this change”
   (`openspec/specs/css-architecture/spec.md:29-31`). The living layer law
   calls Tier-2 frozen and says Parts B-D are outside this change
   (`:69-70`, `:95-99`), and its scenario still names `.jx-input` (`:107-111`).
   The component Tier-system and styling requirements still enumerate old
   names and scenarios `.jx-input-lane` (`component-authoring/spec.md:21-33`,
   `:77-80`, `:114-120`). None of these requirements is modified in the
   change, despite F intentionally changing the class vocabulary and both
   sheets.

   **Fix:** add complete `MODIFIED` blocks, carrying every existing scenario,
   for:

   - `css-architecture` **placement law**: permit only this change’s K0/F
     owners to modify the canonical theme pair while retaining one-placement
     and import-order laws.
   - `css-architecture` **utilities/Tier-2 exception law**: retain the
     unlayered exception but point it to the v2 vocabulary and remove “outside
     this change / unchanged” wording.
   - `component-authoring` **Tier system** and **styling posture**: replace
     every old class example with v2, retain consume-only and no-`cn()` rules,
     and remove “frozen” only where the sanctioned v2 replacement is meant.
   - `component-authoring` **props discipline** and **shared ruler** as R2
     required: policy `density` vs identity `size`, plus optical/media/inset
     dispositions.

   Without these deltas, an implementation can either comply with the living
   spec or comply with density-adoption, but not both.

4. **[P1] Tasks omit full-suite barriers required by the design.**

   `design.md:250-254` requires full Vitest at the K0 and F barriers, then
   post-merge. `tasks.md:16-17` and `:21` name only focused tests at K0/F;
   the full suite appears only after A-E merge (`:42-45`). That allows broken
   K0 or F work to become the concurrency substrate, contrary to R2’s barrier
   purpose.

   **Fix:** make K0 and F task gates explicitly run the full `apps/www` test
   suite as well as their focused tests, plus their listed browser/parity
   checks. State that A-E cannot be dispatched until both barrier checklists
   are green. In G, replace “residuals fixed” with “verify K0 residual proofs
   remain green”; G has no authority to absorb packet repairs.

5. **[P1] The adoption verifier has no executable packet interface, even though every packet gate depends on one.**

   Design section 5 defines row fields and behavior (`design.md:186-206`) but
   not how `verify-density-adoption.mjs` selects A-E, starts/addresses the
   browser fixture, reports a row, or distinguishes static, browser, and
   resize failures. Tasks shorten this further to “registry packet A/B/C/D/E”
   (`tasks.md:24-41`). R2 required the concrete per-packet gate
   `verify-density-adoption.mjs --packet A`; that invocation and its contract
   were lost in transcription.

   **Fix:** define the CLI and lifecycle in design, for example
   `node scripts/verify-density-adoption.mjs --packet <A|B|C|D|E|all> [port]`,
   with exit conditions, default/explicit server behavior, a printed
   `family/selector/property` failure format, used-value normalization, and
   the exact registry row set selected by each packet. State whether K0
   creates all A-E rows before dispatch or a complete schema plus placeholder
   rows is forbidden. Packet tasks must invoke that exact command.

6. **[P1] The token-consumption rule makes K0’s retained list-item contract ambiguous and potentially impossible.**

   The component delta requires every density-owned declaration to use only
   `--jx-d-ctl-*` or a derivative (`component-authoring delta:34-40`), and
   the CSS delta permits private properties only as one-line ctl aliases
   (`css-architecture delta:10-15`). K0 simultaneously retains list-item
   obligations that need canonical ruler roles not present in the ctl list:
   secondary text/line, media image, and the required
   `--jx-d-icon-optical-inline` correction (`design.md:232-245`). The design
   never says whether K0 must derive replacement ctl values or may consume
   those established `--jx-d-*` ruler roles. The static gate can therefore
   reject a correct K0 implementation or drive a second, accidental scale.

   **Fix:** choose one closed rule and state it in design, registry, and both
   deltas: either extend the ctl interface with every required semantic role,
   or permit a named kernel-only allowlist of existing ruler aliases
   (`--jx-d-secondary-*`, `--jx-d-media-*`,
   `--jx-d-icon-optical-inline`) while ctl remains mandatory for control
   footprint geometry. The verifier must enforce the chosen route rather than
   treating every `--jx-d-*` use as a failure.

## Notes

1. The R2 decisions themselves are faithfully represented in proposal and
   design: sole policy `density`, inherited-over-fallback resolution, derived
   ctl aliases, breaking jx-pure names, K0/F/A-E/G sequence, used-value
   comparisons, and the three residual dispositions are all present.
2. The retained-scenario repair is correct for the two real modified
   css-architecture requirements and the existing component density
   requirement. It does not repair a delta whose named target does not exist,
   nor requirements left untouched elsewhere in the living spec.
3. The registry’s selector/property/exception model is the right depth. It
   needs its CLI and complete initial row ownership specified before it can be
   delegated as K0 infrastructure.
4. Proposal non-goals correctly protect terminal, press, scrollbar,
   surface-motion, stamped attributes, getter context, and registry dual-tree
   laws. Keep those words when repairing the deltas.

## Per-document quality

| document | quality | review |
|---|---:|---|
| `proposal.md` | 8.0/10 | Clear scope, breakage ruling, impact, and protected laws; it over-promises exact packet ownership that design does not supply. |
| `design.md` | 4.5/10 | Strong resolver, equations, residuals, and proof model; not self-contained because A-E ownership and verifier interface are incomplete. |
| `tasks.md` | 4.5/10 | Correct sequence but not executable: it references absent exact lists and misses required full-suite K0/F barriers. |
| `specs/design-tokens/spec.md` delta | 2.0/10 | Good desired content under invalid `MODIFIED` targets; must be ADDED or gain real living targets. |
| `specs/jx-pure/spec.md` delta | 1.5/10 | Correct rename direction, but it has no living requirement target and drops most of the componentless-face contract. |
| `specs/css-architecture/spec.md` delta | 4.0/10 | Derived-scale and ruler edits are sound; placement and frozen Tier-2/layer requirements remain contradictory. |
| `specs/component-authoring/spec.md` delta | 3.0/10 | Fallback and hit-lane intent are sound; opt-in/balance/ruler rules and v2 Tier-system/styling updates are missing or ambiguous. |

## Decision

**Score: 3.8/10. BLOCK K0 and F implementation.**

Repair blockers 1-3 first; they establish the executable ownership and the
post-change normative truth. Then repair blockers 4-6 so the barrier gates and
registry cannot be implemented by interpretation. Re-run strict validation
afterward, but treat it as a structural check only; this review must be updated
to ACCEPT before concurrent A-E work begins.

## Round 2

Review target: remediation commit `1461920` after `2464922`, against the
converged R2 contract and the four living specifications. `openspec validate
density-adoption --strict` passes. That proves delta structure, not that a
`MODIFIED` block retains every normative sentence and scenario it replaces.

### Former-blocker verdicts

1. **Resolved — exact packet ownership.** `packet-manifest.md:1-166` is now
   local to the change, gives the R2 packet surface with closed `P(...)`
   expansion, and calls itself the sole orchestrator input. `design.md:3-7,
   117-124` and `tasks.md:3-5` reference it. This is adequate for isolated
   packet work and mechanical overlap rejection.

2. **Partial — valid delta targets and jx-pure contract.** The design-tokens
   laws correctly became `ADDED`; the jx-pure delta correctly recovers the
   Part A unlayered cascade, Part B allowlist/reverse scope, degradation,
   generated auto-dark, and boundaries. However, it never expressly tells the
   Apply author to replace the living `## Current contract`, which still lists
   the old frozen names (`openspec/specs/jx-pure/spec.md:8-38`). The final
   living spec would otherwise contain competing old narrative and v2
   requirements. Add an explicit Apply instruction that replaces that narrative
   with these v2 requirements. Also fix the duplicated "stay Tier-2" at delta
   line 100 and "SHALL be scanned are scanned" in the token delta line 46.

3. **Not resolved — MODIFIED blocks still erase living requirements and
   scenarios. This is a P0 blocker.**

   - The css placement delta (`specs/css-architecture/spec.md:96-124`) drops
     living placement item 4: site-only-surface placement and the indivisible
     `app.css` Tailwind/import context (`openspec/specs/css-architecture/
     spec.md:31-38`). It also drops the living `component paint IS
     utility-able` and `css loads exactly once` scenarios (`:51-61`). Restore
     items 1-4 and all three original scenarios verbatim, changing only item
     3 for the sanctioned K0/F ownership; append the new packet-theme scenario
     instead of replacing scenarios.
   - The css derived-scale delta (`specs/css-architecture/spec.md:5-35`)
     drops inherited `--jx-d-*` consumption, the asserted four-density table
     content, the `mediaImage == 2 x line`/`hitMin >= 44px` proof, named
     structural exceptions, and the balance invariant `inset == seam` from
     living `css-architecture/spec.md:179-201`. The stamped-attribute delta
     (`:37-92`) also loses the explicit shared three/five-track and gap-track
     topology, missing-slot retention, allowed group-paint targets, and the
     grouped-path assertion from the living requirement (`:127-176`). Restore
     those laws verbatim, then add the ctl and effective-media additions.
   - The props delta (`specs/component-authoring/spec.md:80-99`) loses the
     living guarantee that controlled/uncontrolled value handling leaves
     `FormData/form.reset` untouched (`openspec/specs/component-authoring/
     spec.md:48-54`). Restore that clause.
   - The styling-posture delta (`specs/component-authoring/spec.md:101-137`)
     drops the documented canonical-entry install prerequisite, transition
     behavior for unmigrated Tier-1 components, the scoped-style boundary
     migration requirement, and both `consumer restyles a migrated component`
     and `unmigrated component (transitional)` scenarios (living `:63-120`).
     A twenty-family packet sweep is not proof that every Tier-1 component is
     migrated. Carry all of this content forward, updating only the v2 class
     references. The css layer-law rewrite similarly drops its bounded
     state-machine examples/rationale and the surface-kernel guardrails
     (foreign-law declaration, no whole-sheet unlayering, current enumerated
     uses; living `css-architecture:71-93`). Preserve them.
   - The living Item-family system still makes `size` a group policy and stamp
     state (`component-authoring/spec.md:157-203`), while `design.md:25` and
     `tasks.md:11-16` require that breaking removal. The delta does not modify
     that requirement or the related living density/shared-ruler obligations
     (`component-authoring/spec.md:389-437`) for inherited aliases, balance,
     media, and the optical token. Add complete `MODIFIED` Item-family,
     density-contract, and shared-ruler blocks: replace policy `size` with
     `density`, retain visual identity-size where permitted, and carry the
     R2/design section 7 residual dispositions into the living contract.

4. **Resolved — K0/F barriers and G authority.** `design.md:248-256` and
   `tasks.md:17-25` require the full `apps/www` suite at both barriers and
   block A-E dispatch until both pass. `tasks.md:50-53` correctly makes G
   verify residual proofs rather than absorb packet repairs.

5. **Resolved — verifier execution contract.** `design.md:212-228` supplies
   the packet CLI, static-before-browser phases, row-addressed failures,
   server behavior, used-value normalization, and complete A-E K0 rows. This
   is sufficient to assign packet gates independently.

6. **Not resolved — the closed token rule is contradictory. This is a P0
   blocker.** `design.md:237-244`, the design-token delta `:25-36`, and the
   styling-posture delta `:111-113` correctly allow named kernel ruler roles
   for their established semantic/media/optical purposes. But `design.md:
   85-88`, the css derived-scale delta `:10-15,30-35`, and the component
   density scenario `:34-40` still require ctl aliases only for every
   density-owned declaration/private alias. K0's required optical correction,
   media track, and secondary voice can therefore be either mandatory or
   rejected by the scanner. Replace every broad ctl-only rule with one closed
   formulation: `--jx-d-ctl-*` is mandatory for control-footprint geometry;
   direct consumption (and clearly defined private aliasing) of the named
   kernel roles is legal only for their established semantic purposes; every
   other `--jx-d-*` use fails. Make the static scanner enforce precisely that
   direct-versus-private-alias rule.

### New findings and cleanup

1. `design.md:152-154` still points to "r2 §4", and `tasks.md:26,30,35,38,42`
   call the authoritative input a "design-§4 list". Replace each with
   `packet-manifest.md`; the actual authority is correct but the prose should
   not reintroduce the external/transcribed source.
2. The remediation commit has two documentation-only `git diff --check`
   warnings: a trailing whitespace line in this review's existing Date header
   and a final blank line in `packet-manifest.md`. They do not change the
   execution contract, but should be removed with the remediation.

### Decision

**Score: 5.8/10. BLOCK K0 and F implementation.**

The manifest, gates, and verifier now make the wave operationally delegable.
Do not start K0/F while the delta application can silently erase living laws
and the scanner's token rule remains self-contradictory. Restore the omitted
normative material, unify the closed rule, explicitly supersede the jx-pure
narrative, then re-run strict validation and this review.

## Round 3

Review target: remediation commit `8cdd3df` after the Round 2 review. I
compared every matching `MODIFIED` requirement and its scenarios with the
living requirement, then checked the change-specific R2 contract, design, and
tasks. `openspec validate density-adoption --strict` passes and
`git show --check 8cdd3df` is clean.

### Former-blocker verdicts

1. **Resolved — packet ownership and source pointers.** The manifest remains
   the sole local ownership source; the design and tasks now point to it rather
   than R2/design transcriptions. Its declared `P(...)` grammar is unchanged
   and sufficient for the orchestrator's exact-list check.

2. **Resolved — delta targets and jx-pure replacement.** The design-tokens
   laws are `ADDED`, while the jx-pure delta now carries an explicit APPLY note
   replacing the living `Current contract`; Parts A-D and all boundaries remain
   present with v2 names and no aliases.

3. **Partial — living-block preservation is materially repaired, but four
   contract losses remain.** The placement law retains all four items and all
   original scenarios; the layer law retains its bounded carve-outs and
   probes; component Tier/props/styling, CSS topology, and Item prose/scenarios
   are now carried forward. The following still block the normative result:

   - The component delta no longer contains the R2 `hit-lane contract`
     requirement and its physical-wrapper scenario. The change's own design
     and task gates still require `ctl-hit` rectangles (`design.md:76-83,`
     `157-170`; `tasks.md:28-37`), and the R2 spec-delta outline names this
     requirement (`design.md:649-658`). Restore it to
     `specs/component-authoring/spec.md`; otherwise the K0/F implementation
     contract is split between design/tasks and the normative delta.
   - The density scenario still says `WHEN the group's size prop changes`
     (`specs/component-authoring/spec.md:136-141`), and the Item policy
     scenario still says `mode/size/layout/dividers`
     (`:239-245`). Both contradict the same delta's density-only law
     (`:125-127`), the explicit rename note (`:302-303`), and design/tasks'
     removal of policy `size` (`design.md:26-28`, `tasks.md:11-16`). Rename
     these scenario inputs to `density`; a note after the block cannot
     override a normative scenario.
   - The CSS derived-scale delta (`specs/css-architecture/spec.md:137-168`)
     drops the living requirement's explicit `Browser assertions SHALL
     compare USED values` law (`openspec/specs/css-architecture/spec.md:179-
     188`). Design §5's verifier rule is supporting detail, not a replacement
     for the requirement. Restore the used-value/serialization rule in this
     block.
   - The CSS stamped-attribute delta's grouped-media scenario only says
     "registered deltas" (`specs/css-architecture/spec.md:223-228`). Restore
     the normative source and posture: the media track comes from
     `--jx-d-media-image`, the row lane is line-derived, and the probes assert
     those values. The component shared-ruler scenario does not repair this
     separate CSS requirement.

4. **Resolved — K0/F barriers and dispatch ordering.** The full-suite gates at
   K0 and F still precede A-E dispatch, and G remains proof-only for residuals.

5. **Resolved — verifier contract.** The packet CLI, static/browser phases,
   row-addressed failures, used-value normalization, fixture-server behavior,
   and complete K0 registry rows remain explicit and consistent with tasks.

6. **Resolved — closed token rule.** Design §2/§5, the CSS derived-scale
   delta, both component rules, and the design-tokens allowlist now agree:
   ctl aliases are mandatory for control footprints, named kernel roles are
   legal only for established semantic roles, and the scanner rejects other
   uses. No former Round 2 contradiction remains.

### New findings

1. `design.md:618` still says the change carries `MODIFIED` requirements for
   jx-pure and design-tokens, although their actual deltas are `ADDED`. Update
   the spec-delta outline (including its Part C/APPLY wording) so the design
   cannot direct an agent to apply the wrong operation type.
2. The remaining density and Item `size` scenario text is not merely stale
   vocabulary: it is an executable trigger that can cause an agent to restore
   the prohibited policy prop. Treat it as a contract defect, not editorial
   cleanup.

### Decision

**Score: 7.1/10. BLOCK K0 and F implementation.**

The remediation closes the broad Round 2 failures and makes the documents
substantially delegable. Do not start K0/F until the hit-lane requirement is
restored, the two policy scenarios are renamed, and the used-value/media
posture clauses are explicit in their owning deltas; then update the stale
spec-delta outline and re-run this review.
