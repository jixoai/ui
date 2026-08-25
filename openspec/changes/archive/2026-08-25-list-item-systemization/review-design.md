# Review — list-item-systemization design round

**Decision: BLOCK — not yet an implementation-ready execution contract.**

This review covers the five requested change files, the converged r2 artifact,
the two Owner rulings, the current list-item source and registry entry, both
living specs, and recent archived-change verification conventions. This is an
implementation-preparation review only; no product implementation was assessed
or changed. `openspec validate list-item-systemization --strict` passes, which
confirms the change shape but not the behavioral gaps below.

## Evidence baseline

- The Owner rulings are faithfully carried into the change: all five adapters
  ship, and chevron is authored only as
  `<ItemEnd><ItemChevron /></ItemEnd>`; it is not inherited
  ([proposal.md](proposal.md):10-12,
  [design.md](design.md):70-76).
- The current family is still the ten-file, boolean-context implementation:
  `ItemGroup` is a `div[role=list]`, each grouped row itself has
  `role=listitem`, and `ItemSeparator` is a direct group child
  ([item-group.svelte](../../../apps/www/src/lib/ui/list-item/item-group.svelte):20-26,
  [item.svelte](../../../apps/www/src/lib/ui/list-item/item.svelte):37-46,
  [item-separator.svelte](../../../apps/www/src/lib/ui/list-item/item-separator.svelte):14-19).
  The canonical registry and app mirror are currently byte-identical; the
  registry still lists the ten old files and only `separator`
  ([registry.json](../../../registry.json):83-151).
- The r2 artifact provides exact props, generated-ID and selector contracts
  ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):194-345,
  [codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):369-509).
  The change currently designates that private artifact as the holder of the
  full prop and selector inventories ([design.md](design.md):3-7).
- Recent accepted registry work treats `shadcn build`, app build, and mirror
  parity as insufficient on their own: it also uses a real local-registry
  `shadcn add` consumer plus a consumer Vite build
  ([tw4 verification](../../archive/2026-08-25-tw4-css-modularization/verification.md):12-19,
  [verify-shadcn-add.mjs](../../../scripts/verify-shadcn-add.mjs):210-271).

## Blockers

1. **The policy resolution time model contradicts itself, so prop updates have no defined result.**

   `proposal.md` and `design.md` say Item resolves context "at init" and is
   SSR-stable ([proposal.md](proposal.md):16-19,
   [design.md](design.md):53-58). But the implementation law requires a
   stable context object with `$state` fields when group props can change after
   mount ([design.md](design.md):122-125), and r2's precedence algorithm is a
   derived calculation, not a one-time snapshot
   ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):318-345).
   An implementer can therefore legally freeze descendants at first render or
   make them react, producing different `data-item-chrome`, size, layout, and
   divider output.

   **Fix:** state one law in design and the component-authoring delta: the
   context identity is created once, its policy fields are reactive, and every
   descendant re-resolves on relevant Item/ItemGroup prop changes; SSR merely
   requires that the initial resolved stamps are deterministic before
   hydration. Add server-render assertions for initial stamps, client rerender
   assertions for group `mode`/`size`/`layout`/`dividers` changes, and a nested
   group shadowing case. If snapshots are intended instead, remove the `$state`
   instruction and explicitly make post-mount group changes unsupported.

2. **`data-dividers` has two incompatible attribute owners and the divider law cannot be implemented unambiguously.**

   The design's stamp table puts `data-dividers` on ItemGroup
   ([design.md](design.md):48-51). The r2 stamped-attribute table does the
   same and gives the inner `<ul>` only `data-slot=item-list`
   ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):303-316).
   Its required CSS selector instead reads
   `[data-slot='item-list'][data-dividers='auto'] > ...`
   ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):404-408).
   The CSS delta and task only say "direct-child" and "selector inventory",
   so neither resolves the conflict.

   **Fix:** choose and document one DOM owner. Recommended: resolve the group
   policy in ItemGroup but stamp `data-dividers` only on its inner
   `<ul data-slot=item-list>`, because it owns row adjacency; keep group
   `data-mode`, `data-inset`, `data-size`, and `data-layout` on the frame.
   Update the anatomy, stamp table, selector inventory, and delta together.
   Add assertions for default/muted/plain resolution: default auto-on, muted
   forced none even when `auto` was supplied, plain default-none with explicit
   auto opt-in, and an explicit divider always remaining available.

3. **The OpenSpec delta is not self-contained for the public Item contract.**

   The change deliberately outsources the public prop tables and selector
   inventory to `.agents/documents/.../codex-r2-response.md`
   ([design.md](design.md):3-7). The component-authoring delta then reduces a
   nineteen-module public family to one prose paragraph and four scenarios
   ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):5-56).
   It does not normatively specify the resolved attribute values/absence rule,
   `ItemGroup` defaults and label DOM, `ItemEnd` `align`/`wrap`, `ItemAfter`
   tone, ItemField's full context, rest-attribute precedence, or the native
   `section|div > ul > li > a|div` contract. Those are material breaking-v1
   APIs, not implementation notes. The living component spec also requires
   arbitrary HTML/ARIA rest attributes to reach the native root
   ([../../specs/component-authoring/spec.md](../../specs/component-authoring/spec.md):48-59),
   so their ownership must be explicit.

   **Fix:** make `design.md` the authoritative public contract by copying the
   necessary r2 tables: shared unions/defaults, every structural module,
   `ItemFieldContext`, per-adapter public/bindable props, and component-owned
   attributes. Add focused SHALLs and GIVEN/WHEN/THEN scenarios to the
   component delta for grouped/un-grouped native list DOM, labeled section,
   nested-group shadowing, component-owned stamp replacement, ItemChevron
   `aria-hidden`/no inheritance, visual-only selection, and the item root
   behavior. Keep the artifact as provenance, not a second normative source.

4. **The ItemField/adapter accessibility and forwarding contract is both under-specified and internally inconsistent.**

   The design says adapters Omit `aria-*` wholesale
   ([design.md](design.md):75-76), whereas r2 reserves only generated
   `aria-labelledby` and `aria-describedby` alongside concrete control props
   ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):64-70,
   [codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):279-297).
   A blanket ban conflicts with the living rest-forwarding law and leaves
   ordinary attributes such as `aria-controls` or `aria-label` unresolved.
   It also does not say how the current controls' own wrapper/label/error
   props are suppressed. Today Toggle wraps its input in a label
   ([toggle.svelte](../../../apps/www/src/lib/ui/toggle/toggle.svelte):76-94),
   while Checkbox, Radio, NativeSelect, and Input each own their own
   label/error plumbing ([checkbox.svelte](../../../apps/www/src/lib/ui/checkbox/checkbox.svelte):38-104,
   [native-select.svelte](../../../apps/www/src/lib/ui/native-select/native-select.svelte):44-105).
   The lone delta scenario covers only `ItemToggle` in `labelMode="for"`; no
   requirement or task gate proves `labelMode="text"`, description/error
   order, generated IDs, or the promised per-control forwarding.

   **Fix:** replace `aria-*` with five explicit `Reserved*Props` sets. At
   minimum centralize `id`, `aria-labelledby`, and `aria-describedby`; reserve
   each control's duplicate `label`/`error`/`labelSide`/outer-label APIs and
   `children` only where ItemField owns that snippet. State whether prop types
   are exported from the five controls or derived via `ComponentProps`, and
   require no `any` or cast bypass. Add delta scenarios and task gates for both
   label modes: `for` renders `label[id][for=controlId]` and no
   `aria-labelledby`; `text` renders a span and supplies `aria-labelledby`.
   In both modes assert deterministic suffix IDs, description-then-error
   `aria-describedby`, error-to-`aria-invalid`, disabled/bindable forwarding,
   and native element identity for all five adapters. Include radio same-name
   arrow behavior and select option-snippet forwarding in the browser smoke.

5. **The exhaustive presence-matrix promise lacks an exhaustive, reproducible acceptance gate.**

   The design and CSS delta require all 16 media/end/header/footer wide
   combinations to declare both grid columns and areas
   ([design.md](design.md):28-31,
   [specs/css-architecture/spec.md](specs/css-architecture/spec.md):13-18).
   This is the r2 ghost-track safeguard. Tasks only say a generic source guard
   plus a browser gate for "computed areas wide+narrow"
   ([tasks.md](tasks.md):17-19,
   [tasks.md](tasks.md):40-45); they neither enumerate the 16 wide cases nor
   the end-present narrow cases, nor pin the `wrap="never"` exception. A
   single demo can pass while one selector branch leaves an implicit track.

   **Fix:** add a checked fixture matrix and name it in task 6: browser tests
   must iterate all 16 wide bit combinations and every narrow combination with
   an end lane, asserting both computed `grid-template-columns` and
   `grid-template-areas`; then assert `ItemEnd wrap="never"` does not move
   lanes. Keep a source-level count/selector guard as a complement, not a
   substitute. The CSS delta should name the narrow `30rem` condition and the
   no-implicit-track assertion in a GIVEN/WHEN/THEN scenario.

6. **Registry work has no install-closure proof despite adding direct imports to five controls, icons, utils, and theme.**

   The proposal only says that dependencies will be corrected
   ([proposal.md](proposal.md):52-58), and task 7 stops at registry validation,
   mirror verification, and site build ([tasks.md](tasks.md):46-50). That does
   not exercise the published payload or a consumer alias. The current entry
   still has only the obsolete `separator` dependency
   ([registry.json](../../../registry.json):149-151). The new family directly
   imports Toggle, Checkbox, Radio, NativeSelect, Input, `icons`, and `cn`; an
   app build can pass from its monorepo source while `shadcn add` produces an
   uncompilable consumer.

   **Fix:** name the exact intended `registryDependencies` in design/task:
   `@jixoai/toggle`, `@jixoai/checkbox`, `@jixoai/radio`,
   `@jixoai/native-select`, `@jixoai/input`, `@jixoai/icons`,
   `@jixoai/utils`, and `@jixoai/jixoai-theme`, with `separator` removed.
   Extend `scripts/verify-shadcn-add.mjs` (or a focused equivalent) to publish
   the actual list-item payload to a local registry, run
   `shadcn add @jixoai/list-item` in a clean Svelte consumer, import the barrel
   and an adapter, and pass a Vite build. Assert all nineteen files arrive at
   their canonical targets, `ItemSeparator` does not, and the dependency graph
   resolves exactly once.

## Non-blocking notes

1. The two Owner decisions are not merely implied; they are written correctly
   in proposal, design, and tasks. Do not reintroduce an implicit chevron or
   defer the five adapters during remediation.
2. The overall work order is sound: prelude defects, core policy/DOM, fields,
   PlayRow dogfood, docs, tests, registry, review. It matches r2's migration
   sequence and keeps product work out of this planning round.
3. Refresh the stale PlayRow metric. The current tree contains 51 `<PlayRow>`
   usages in 30 Svelte files (`rg -o '<PlayRow\\b' apps/www/src --glob '*.svelte'`),
   not the stated 47 across 31. Prefer "all current PlayRow consumers" plus a
   generated inventory over embedding a count that can drift during parallel
   work.
4. Define the ItemDivider content decision while copying the public tables.
   R2 says it can receive an optional visible boundary label, but also says it
   is `role="presentation"` and hidden from the accessibility tree
   ([codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):234-236,
   [codex-r2-response.md](../../../.agents/documents/2026-08-25-list-item-systemization/codex-r2-response.md):486-487).
   Prefer a decorative, childless ItemDivider for v1; otherwise define a real
   labeled/semantic boundary instead of hiding authored text.
5. Replace the unexplained `build:site 7/7` phrase with the exact command and
   observable expected result. Archive conventions name the command and its
   distinct proof rather than using a moving count.

## Execution-contract assessment

The change has a strong product spine: it respects both Owner rulings, retains
the r2 four-bit end-lane decision, uses a native-list destination, preserves
the terminal surface hierarchy, and keeps out-of-v1 behavior explicitly out of
scope. The proposal and design are unusually clear about visual intent.

It is not ready to hand to an implementer without re-litigating behavior. The
normative deltas collapse too many public/a11y decisions into prose, the design
points to a private artifact for APIs required at implementation time, and the
task gates do not yet prove the two highest-risk contracts: the full matrix and
consumer installation. The required fixes are documentation and acceptance
work; they do not change either Owner ruling or require product implementation.

## Score

**5.0 / 10 — Block.** Design intent and scope discipline merit a high partial
score, but an execution contract must define one outcome for reactive policy,
DOM stamps, public props, form ownership, all matrix combinations, and
published installation. Six concrete omissions or contradictions still permit
materially different implementations to claim compliance. Resolve them, rerun
strict validation, and request a new design review before Apply.

## Round 2

**Verdict: the six original blockers are substantially remediated, but this
round remains BLOCKED by two new normative contradictions and one public-API
omission.** I verified the updated proposal, design, tasks, both deltas, the
previous review, and the current repository baseline. `openspec validate
list-item-systemization --strict` still passes; that validates structure, not
these execution semantics.

### Original blocker resolution

| # | Resolution | Verification |
|---|---|---|
| 1 | **Resolved in design/spec/tasks; stale in proposal.** | `design.md` §2 now gives one reactive law: context identity once, `$state` policy, pure-function re-resolution, SSR initial stamps ([design.md](design.md):52-77). The component delta has post-mount and nested-shadowing scenarios ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):45-53), and task 2 names server, rerender, and shadowing gates ([tasks.md](tasks.md):24-31). However, proposal still says Item “resolves it at init” ([proposal.md](proposal.md):16-19); see new finding N1. |
| 2 | **Resolved.** | The anatomy explicitly places `data-dividers` only on the inner `<ul>` ([design.md](design.md):18-30, 48-50); the resolution table and selector use that owner ([design.md](design.md):52-85); the delta SHALL and task matrix cover default auto, muted forced-none-even-when-auto, plain opt-in, and explicit dividers ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):15-16, 55-63; [tasks.md](tasks.md):19-31). |
| 3 | **Mostly resolved; one API omission remains.** | `design.md` is now explicitly authoritative and contains unions, structural modules, ItemField/context, adapter rules, paint, CSS blocks, and registry closure ([design.md](design.md):3-12, 87-254). The delta now carries native DOM, labels, nested policy, stamp ownership, chevron, link purity, and selection scenarios ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):5-100). The structural table nevertheless omits the existing `ItemMedia` `src` and `alt` props ([design.md](design.md):111; current [item-media.svelte](../../../apps/www/src/lib/ui/list-item/item-media.svelte):11-20); see N3. |
| 4 | **Resolved at contract level.** | The blanket `aria-*` wording is replaced by centralized `id`/`aria-labelledby`/`aria-describedby` reservations plus per-control duplicate label/error/labelSide reservations ([design.md](design.md):150-172; [specs/component-authoring/spec.md](specs/component-authoring/spec.md):20-31). ComponentProps/Omit, no-any/no-cast, both label modes, generated IDs, ARIA chains, invalid state, disabled/bindable forwarding, radio arrows, and select options are all named in task 3 ([tasks.md](tasks.md):32-47). Implementation must still prove the current Radio/Input public props; design correctly marks that as an implementation-time check ([design.md](design.md):168-172). |
| 5 | **Resolved.** | The CSS delta has the 16-combination computed-columns-and-areas scenario and the 30rem `wrap="auto"`/`wrap="never"` behavior ([specs/css-architecture/spec.md](specs/css-architecture/spec.md):27-38). Task 6 explicitly requires all 16 wide combinations, every narrow end-present combination, both computed properties, and the no-split exception ([tasks.md](tasks.md):62-72). |
| 6 | **Resolved at planning-contract level.** | Design §7 names all eight registry dependencies, removes `separator`, and specifies a local-registry clean consumer importing both barrel and adapter, Vite build, nineteen targets, no separator file, and exactly-once dependency resolution ([design.md](design.md):231-244). Task 7 repeats the same install-closure proof and names the exact `build:site` command plus its self-checks ([tasks.md](tasks.md):73-84). This is appropriately a future implementation gate; the current repository registry remains the old baseline, as expected before Apply. |

### New findings

1. **N1 — proposal still contradicts the adopted reactive time model (P1).**

   `proposal.md:16-19` still states that Item “resolves it at init”, while
   `design.md:69-75`, the delta, and task 2 now require reactive re-resolution
   after relevant policy changes. An implementer reading the proposal as the
   change summary can still implement a mount-time snapshot. This is a direct
   internal-consistency failure, not merely wording polish.

   **Concrete fix:** change proposal item 1 to say that the typed context is
   created once, policy fields are reactive, and Item stamps the pure-function
   result on initial SSR and on subsequent relevant updates. Retain “SSR-stable”
   for the initial render only. Re-run strict validation.

2. **N2 — `ItemGroup.dividers` has an impossible default/omission contract (P1).**

   `design.md:106` declares `dividers: ItemDividers — 'auto'`, but also says
   plain groups default to `none` unless `auto` is explicitly supplied. The
   resolution law at `design.md:59-61` and task 2 at `tasks.md:29-31` require
   distinguishing omitted from explicit `auto`. A normal Svelte default
   (`dividers = 'auto'`) erases that distinction, so both compliant
   implementations cannot exist: one will make plain groups auto-divide by
   default, the other will silently ignore explicit `auto`.

   **Concrete fix:** define the public prop as optional/undefined at the raw
   boundary (`dividers?: ItemDividers`), then specify the pure resolution:
   `muted -> none`; `plain -> dividers ?? none`; `default -> dividers ?? auto`.
   If the public type must expose a default value, document a separate raw
   presence bit and its SSR/client behavior. Add an SSR and client rerender
   scenario distinguishing `<ItemGroup mode="plain">` from
   `<ItemGroup mode="plain" dividers="auto">`.

3. **N3 — the supposedly complete structural public table drops existing `ItemMedia` image props (P2).**

   `design.md:111` lists `ItemMedia` as only `variant`, `class`, and
   `children`, but the current component exposes `src` and `alt` and renders
   them for `variant="image"` ([item-media.svelte](../../../apps/www/src/lib/ui/list-item/item-media.svelte):11-27).
   The proposal promises media layout coverage ([proposal.md](proposal.md):44-47)
   and the design calls itself the complete public contract
   ([design.md](design.md):3-6), so the omission leaves an implementer unsure
   whether image support is retained or intentionally deleted.

   **Concrete fix:** add `src?: string` and `alt?: string` (including their
   image-variant behavior and rest-attribute forwarding) to the ItemMedia
   table and add one docs/test scenario. If deletion is intended, state it as
   an explicit breaking-v1 removal in proposal, design, delta, and task 2.

### Non-blocking follow-up

- The PlayRow count was removed from the impact statement and replaced by
  regenerated-inventory wording, and the ItemDivider was correctly made
  childless/decorative. The old “across 31 pages” diagnostic remains in the
  prelude sentence at `proposal.md:40-43`; it is now incidental rather than a
  migration gate, but should be changed to “current consumers” or generated
  evidence when the proposal is touched.
- `tasks.md:82-84` now names `pnpm build:site` and its embedded self-checks,
  which matches the repository script (`node scripts/build-site.mjs`) and the
  archive convention.

### Round-2 score

**7.5 / 10 — Block pending N1/N2/N3.** The original six blockers now have
verifiable design/spec/task coverage, and the change is materially closer to a
real execution contract. The remaining score is held below approval because
N1 lets the top-level proposal contradict the time law, N2 permits two
different divider behaviors from the same API, and N3 leaves a currently
supported public prop outside the claimed authoritative table. Fix those three,
then this change should be ready for a final design-round acceptance review.

## Round 3

**Verdict: ACCEPT — the three Round-2 findings are resolved and the change may
proceed to implementation.** I verified the updated proposal, design, tasks,
both deltas, and the current `ItemMedia` implementation. `openspec validate
list-item-systemization --strict` and `git diff --check` pass. The repository
implementation and registry remain the pre-Apply baseline; the install and
browser checks below are implementation gates, not claims that they have
already run.

### Round-2 finding resolution

| Finding | Resolution | Verification |
|---|---|---|
| N1 | **Resolved.** | Proposal item 1 now says the context is created once with reactive fields and that pure-function stamps are emitted on initial SSR and every relevant policy/prop update ([proposal.md](proposal.md):16-21). Design §2 gives the same single law and explicitly rejects a mount-time snapshot ([design.md](design.md):71-79). The component delta and task 2 retain the post-mount rerender and nested-shadowing gates ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):45-53; [tasks.md](tasks.md):24-31). The stale “at init” wording is gone from the updated change files. |
| N2 | **Resolved.** | Design §2 makes `dividers` raw-optional with no Svelte/language default and defines `muted → none`, `plain → dividers ?? none`, and `default → dividers ?? auto` ([design.md](design.md):52-69). The public table repeats the omission distinction ([design.md](design.md):103-114), while the delta distinguishes `<ItemGroup mode="plain">` from `dividers="auto"` in SSR and after rerender ([specs/component-authoring/spec.md](specs/component-authoring/spec.md):55-68). Task 2 carries the same matrix, including muted forced-none-even-when-auto ([tasks.md](tasks.md):24-32). |
| N3 | **Resolved.** | Design §3 retains `ItemMedia` `src` and `alt`, states that the image variant renders `<img>`, and keeps the existing default alt ([design.md](design.md):103-114). The current source still exposes and renders those props ([item-media.svelte](../../../apps/www/src/lib/ui/list-item/item-media.svelte):11-27). Task 6 now requires an image-variant assertion for `<img src alt>` and explicitly says `src/alt` stay public ([tasks.md](tasks.md):63-71). |

### Remaining issues

No remaining blockers were found. One cosmetic documentation note remains:
`design.md:113` writes `src: string — undefined` and `alt: string — ''` in
prose-table notation rather than TypeScript optional syntax. The surrounding
text and implementation make the intended optional/default behavior clear, so
this is non-blocking; an implementation pass may normalize it to
`src?: string` and `alt?: string`.

### Final score and call

**9.2 / 10 — ACCEPT.** The original six blockers and the three Round-2
findings now have aligned proposal/design/spec/task contracts. The remaining
0.8 points reflect implementation risk rather than unresolved design: the
required browser matrix, native-control adapter smoke, mirror parity, and
clean-consumer install closure still need to produce evidence during Apply.
Proceed to implementation under the named gates; do not treat this acceptance
as evidence that those future gates have already passed.
