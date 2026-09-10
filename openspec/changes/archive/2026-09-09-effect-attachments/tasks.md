# Tasks

Order law: registry.json/metadata FIRST when touched, mirror files
next, manifest LAST. Lanes run SERIALLY (16GB discipline). Base
branch: `effect-attachments` (stacked on `glass-effect-blur-liquid`).

## Lane A — the attachment kernels + the spike (general-purpose agent)

1. **The compile spike FIRST** (design §1/§9 — the permanent smoke,
   born as the lane's gate): promote /tmp/attach-*.mjs (19/19) and
   extend — compile `{@attach liquidGlass(fx)}` (the FACTORY form),
   a forwarding record application, and `fromAction(helper, () =>
   param)` sweep sites under the RESOLVED svelte (pin the version
   dynamically — expect the RESOLVED 5.56.9, per design §1's
   polarity); prove factory attach, identity
   remount on param replace, deep-mutation no-re-arm, SSR inertness,
   and the two documented failure modes (bare `{destroy}`-returner
   leaks; action-shaped factory-call crashes). Output becomes
   `effect-attachments.spec.ts`'s compile-smoke body.
2. `registry/files/ui/press-button/press-effect-runtime.ts` (NEW,
   mirrored): the imperative kernels for shimmer/pulse/rainbow
   (today declarative CSS+template — REWRITTEN: on mount build the
   layer spans + stamp vars/host classes, on re-mount re-stamp, on
   teardown remove; DOM/classname-equivalent, held to the existing
   press-button.spec assertions) + ripple's WAAPI runtime carried
   from ripple.svelte.ts; the self-listening `pressEffect(fx)`
   attachment FACTORY (pointerdown/up, Enter/Space,
   `:disabled`/aria-disabled no-op, reduced-motion gate, cleanup
   cancels WAAPI + listeners); the builders
   (shimmer/pulse/rainbow/ripple) unchanged; index re-export.
3. glass: reshape the `liquidGlass` export into the attachment
   FACTORY `(fx) => (element) => cleanup` over the UNCHANGED
   `attachLiquidGlass` kernel (r1's "zero rewrite" claim is dead —
   the kernel stays, the wrapper's signature flips); mirror.
4. `effect-attachments.spec.ts` + registry/test mirror: the
   lifecycle pins (jsdom), `:disabled` no-op, reduced-motion,
   identity-remount + deep-mutation boundary, the leak
   counter-example, fromAction update-on-reference.

## Lane B — the migration sweep (general-purpose agent; strictly after A)

1. tabs (both sides): the indicator marker
   `data-jx-attach="indicator"` + `attachments?: Partial<Record<'indicator',
   Attachment>>` prop + the OVERRIDE chain
   `{@attach attachments?.indicator ?? internalMount()}` (the
   internal liquid material stays the component's own derive —
   glassFx/liquidFx; the record OVERRIDES it; the `?? undefined`
   arm rides the task-2 spike); liquidMount retires;
   tabs-indicator.spec re-pinned (record assertions + the
   two-channel pair on the liquid indicator).
2. press-button + chip + icon-button (both sides): `'root'` hooks
   + the `attachments` record prop (icon-button forwards into its
   inner PressButton's record); `effect?: PressEffect` props RETIRE
   everywhere; press-button's internal effect branches (effectClass/
   effectStyle/rippleRuntime wiring) DELETE — plain host; chip's
   DEFAULT ripple dies with its prop (zero effect knowledge);
   SPIKE `{@attach undefined}` (skipped, use:-parity) and pin it
   BEFORE wiring the override chains; component specs re-pinned
   (press-button/chip/icon-button + the record path); the three
   docs pages' demos flip in place (component-tag demos use the
   record form; plain-button demos use the leaf form) — Lane C
   relocates press-button's page content wholesale.
3. The mechanical sweep (design §6's MEASURED table — 38 total
   mounts, 32 remaining after Lane A's glass flips): accordion
   exclusiveGuard, carousel collectSlides, scroll-virtual
   measureItem, toast-viewport bindCard, search-palette riseIn ×3,
   the 12 blueprint scene forceShowPopovers — every `use:` becomes
   `{@attach fromAction(helper, () => param)}` (or bare
   `fromAction(helper)` for the no-param ones); both mirrors;
   per-site unmount-leak assertion per the R1 battery.
4. The canaries land in `effect-attachments.spec.ts`: `use:[a-zA-Z]`
   zero over apps/www/src + registry/files (comments stripped,
   migration-prose exemption); `effect={shimmer|pulse|rainbow|ripple`
   zero outside builders (toast's ToastEffect explicitly safe) —
   two-directional fixtures.

## Lane C — the effect home (vision agent; after A+B)

1. `/docs/effects.html`: the page per design §5 — skeleton sections
   Intro/Usage/Install/Examples/API/migration/See Also (Usage H2
   satisfies the global skeleton check; Install shows
   `npx jixoai-ui add glass` — the skeleton's Install-literal check
   gains the page-kind branch for adopted non-component pages);
   glass content CARRIED from the retiring route with syntax
   REWRITTEN to the factory form (band + playground live); press
   family demos on plain buttons.
2. Retire `/docs/components/glass.html` (ONLY glass — the r3
   un-fold: press-button KEEPS its component page and joins the
   effects GROUP; a group is a taxonomy lane, not a page): delete
   the glass route, swap the prerender entry (both svelte.config.js
   sides — effects.html in), glass meta → `effects` group at
   `/docs/effects.html`, press-button meta → `effects` group at its
   OWN page; `CatalogGroupId` union + group appended LAST in
   CATALOG_GROUPS; docs-structure snapshot refreeze
   (**general:15→13 + effects:2** per design §5's measured shape) +
   the href-uniqueness lock STAYS STRICT with the two-distinct-
   hrefs positive pin; docs-nav-filter pin 8→9; skeleton scope
   swaps `glass`→`effects`.
3. Internal-link + prose audit (design §6's cleanup list):
   PAGE_STANDARDS.md ×6, skills design-tokens.md, registry.json
   prose ×2, verify-shadcn-add.mjs fixture, tabs.html prose ×4 —
   re-point or re-word; the gitignored local route mirror.
4. Visual acceptance: the effects page in-browser (band animating,
   lens live, press attachments on plain buttons, forwarding record
   driving the tabs liquid demo); screenshots to
   `.agents/images/2026-09-09-effect-attachments/` (nonzero-pixel
   precheck before any vision judgment — the session law).

## Lane D — tests & gates (general-purpose agent; interleaves B/C)

1. Full re-pin sweep per design §9: glass battery selectors re-point
   to the effects page; consumers' specs; docs-structure;
   the compile smoke green.
2. verify:all chain (build once, serially; CHROME_PATH +
   JIXOAI_GHOSTTY_WASM_PATH as the established env) — including the
   extended skeleton gate and the refrozen taxonomy.
3. Full vitest `--maxWorkers=50%`; failures triaged to owning lanes.
4. `rg -n 'jxoai'` sweep; mirror cmp on every touched pair.

## Integration

1. `openspec validate --strict` green.
2. Subagent group review rounds (remix; no codex) until acceptance;
   friction log folded into skills/AGENTS.
3. Owner acceptance: the effects page walked in-browser.
4. Archive; commit per ~/.codex/git-committer.md (spec → impl
   lanes → archive, atomic); push `effect-attachments`.
