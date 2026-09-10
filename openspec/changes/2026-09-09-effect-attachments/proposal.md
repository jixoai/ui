# Proposal: the effect attachments migration — `{@attach}` + `data-jx-attach`, one effect home

## Why

Owner rulings (2026-09-09, in discussion):

1. 「`@attach` + `data-jx-attach`（可选）应该是最通用的组合了吧」—
   Svelte 5.57 ships the attachments API as a first-class syntax (no
   experimental flag). Attachments are a DIFFERENT contract than
   actions, verified on the RESOLVED svelte — the tracked apps/www
   lockfile tree (5.56.9; the 5.57.0 pnpm-store copy is byte-identical
   in the attachments runtime + fromAction; source + E2E, 23/23
   assertions): the whole `{@attach expr}` expression IS the
   attachment, `(element) => cleanup-function`, identity-remount on
   param change, no update/destroy-object channel — action-shaped
   functions CRASH when attached directly, and the repo's
   `{destroy}`-returning internal actions silently LEAK under a
   naive syntax swap. So: our effect exports RESHAPE into true
   attachment FACTORIES (`liquidGlass(fx)`, `pressEffect(fx)` —
   param in, attachment out), `svelte/attachments`'
   `fromAction(action, () => param)` bridges the repo's
   action-shaped internals, and the repo's current **39 `use:`
   mounts** (measured; see design §6) move to `{@attach}` in the
   same change.
2. 「一个 change 就行，一步到位。破坏性变更不考虑向下兼容」— one
   change, no compat shims: every mount migrates, every component
   `effect` prop RETIRES in the same change.
3. 「scroll-run 不收」— the effects family is ELEMENT-LEVEL effects
   only (glass, press/ripple); the scroll axis stays the motion
   domain (Owner 2026-09-04「统一成一套」ruling stands).
4. 「同意」（附件自听）— attachments self-listen (pointer events,
   `:disabled`/aria state) with ZERO coupling to the host
   component's press state machine — the ripple.svelte.ts precedent
   promoted to law. Components keep state/aria/law; effects are
   element-level decorators.

Effects are not components (no wrapper component — a law sheet +
decorators). A dedicated **`/docs/effects.html`** page becomes their
home; glass's two-layer playground moves there and its component
route retires.

## Scope rulings (the four forks this change locks)

1. **两通道正交法**：`data-jx-attach="hook"`（挂载点印章 — the
   OPTIONAL named mounting-point stamp, queryable contract-naming)
   ≠ `data-jx-effect`（画法印章 — the CSS law channel, stamped by
   the effects themselves). An element may carry both (the tabs
   liquid indicator: tabs marks `data-jx-attach="indicator"`,
   liquidGlass stamps `data-jx-effect="liquid-glass"` on mount).
   The channels never merge.
2. **统一 `{@attach}`（r4 修正，Owner 2026-09-10）**：consumers
   `{@attach liquidGlass(fx)}` their own elements AND component
   hosts' roots — `<PressButton {@attach pressEffect(shimmer())}>`
   — through Svelte's NATIVE component-tag attachment forwarding
   (the createAttachmentKey symbol prop + the host's `...rest`
   spread; spike-verified mount+teardown on the resolved svelte).
   The r2 `attachments` record prop is RETIRED (this change's own
   over-design, corrected within the change); host components
   carry zero effect knowledge — an effect mount reaches them
   only through the same uniform syntax.
3. **附件自听**：attachments read pointer/keyboard/`:disabled`/
   aria themselves; host components carry zero effect knowledge.
4. **家族边界**：effects = element-level (glass blur/liquid, press
   shimmer/pulse/rainbow/ripple); scroll-run stays out (motion
   domain).

## What Changes

- **The attachment exports**: glass's `liquidGlass` RESHAPES from
  the action wrapper into a true attachment factory `(fx) =>
  Attachment` over the unchanged `attachLiquidGlass` kernel;
  press-button gains `pressEffect(fx: PressEffect)` — a
  self-listening attachment FACTORY. shimmer/pulse/rainbow have no
  JS loops today (declarative CSS+template) — they are REWRITTEN as
  imperative kernels behind the factory (DOM/classname-equivalent,
  held to the existing press-button spec assertions); ripple reuses
  its WAAPI runtime. The repo's action-shaped internals
  (exclusiveGuard, collectSlides, measureItem, bindCard, riseIn,
  forceShowPopovers — design §6's measured 39-mount table) migrate
  mechanically via `fromAction(...)` at their call sites.
- **The forwarding law**: hosts with managed effect surfaces —
  tabs-list (`'indicator'`), chip (`'root'`), icon-button
  (`'root'`) — accept `attachments?: Partial<Record<Hook,
  Attachment>>` and apply it at their `data-jx-attach="hook"`
  markers; hook names enter the API tables and the spec battery
  asserts the record↔marker pairing bidirectionally.
- **The retirement (breaking, no compat)**: `effect?: PressEffect`
  retires from press-button, icon-button, chip (the REAL
  forwarders, measured); consumers attach `pressEffect(...)` on the
  element they render (or via the host's forwarding record for
  managed elements). Homonym guards: toast's `ToastEffect` is a
  material stamp, NOT a press effect (untouched, canary-guarded);
  toc/tabs/chart-line audited and OUT (no effect prop / internal
  derives / SVG attribute).
- **The effect home**: NEW `/docs/effects.html` (top-level docs
   page, tokens-tier) — glass's two-layer playground + animated band
   moves in (content carried, syntax rewritten to the factory
   form); the press family demos move in;
   `/docs/components/glass.html` route retires (deleted; prerender
   entry, taxonomy, docs-nav, availability chain resync). The
   catalog gains an `effects` group (appended last; glass's meta
   moves to the effects home, press-button joins the GROUP on its
   own page — the un-fold ruling: a group is a taxonomy lane, not
   a page; taxonomy refreezes general 15→13 + effects:2; the
   href-uniqueness lock stands strict — design §5).
- **The canaries**: post-migration, `use:[a-zA-Z]` has ZERO hits
   over the scanned surface (apps/www/src + registry/files — routes
   excluded, the glass-canary precedent; comments stripped; the
   migration-prose exemption wording per the parent change's
   canary); `effect={shimmer|pulse|rainbow|ripple` has zero hits
   outside the builders' own files — both as spec battery
   source-scans with two-directional fixtures.
- **Tests**: glass's kernel battery keeps (attachLiquidGlass
  unchanged below the syntax); NEW attach-semantics specs pin the
  VERIFIED contract — identity-remount on param replace, deep
  mutation does NOT re-arm (the documented param-flow law),
  the `{destroy}`-swap LEAK counter-example (why fromAction is
  mandatory for action-shaped internals), fromAction's
  update-on-reference — plus the forwarding bidirectional pins, the
  pressEffect lifecycle (self-listening, `:disabled` no-op,
  reduced-motion), the two canaries, a compile smoke pinning the
  RESOLVED svelte version (5.56.9), and the re-pinned consumers.

## Impact

Registry items: glass (export reshapes + docs home), press-button
(prop retires, pressEffect factory + imperative kernels add),
tabs/chip/icon-button (forwarding records + data-jx-attach markers,
effect props out where present), accordion/carousel/scroll-virtual/
toast-viewport/search-palette + the 12 blueprint scenes (internal
`fromAction` sweep). Docs: one new top-level route, one route
retired, taxonomy/docs-nav/prerender/skeleton-scope wired for the
new page. No published-package surface changes beyond the governed
item files. Breaking for every consumer passing `effect={…}` to
the affected components and every `use:` consumer (Owner-ruled: no
compat).
