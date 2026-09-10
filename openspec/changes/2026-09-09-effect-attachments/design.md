# Design: the effect attachments migration (r2 — the group-review fold, 2026-09-09)

Round notes: r1 reviewed by the three-seat group — R1 (Svelte
semantics, 4/10: the core direct-attach premise was FALSE, proven by
source anchors + E2E on the resolved svelte), R2 (API/cross-doc,
7/10: four P1s — fictional retirement list, taxonomy arithmetic,
canary-vs-verbatim contradiction, missing MODIFIED delta), R3
(repo-feasibility, 6/10: two P0s — unsatisfiable canary scope and
the href-uniqueness lock; inventory miscounts). r2 folds ALL of it.
The verification scripts live at /tmp/attach-*.mjs (19/19) — Lane A
promotes them into the spec battery.

## 1. The Svelte facts (SOURCE-VERIFIED on the resolved svelte)

- `{@attach expr}` — the WHOLE expression is the attachment. The
  compiler emits `$.attach(node, () => fx(p))`; the runtime
  (`internal/client/dom/elements/attachments.js:12`) calls the
  expression's VALUE with `(element)` and honors a FUNCTION return
  as teardown. `Attachment<T> = (element: T) => void | (() => void)`
  (`types/index.d.ts:725`). **There is no update/destroy-object
  channel and no `{@attach fn(param)}` action-call form**: an
  action-shaped `(el, param) => {update, destroy}` written as
  `{@attach fn(param)}` crashes at mount (E2E3: TypeError).
- Identity re-mount: when the expression's reactive deps change and
  it yields a NEW function identity → old teardown + fresh mount;
  same identity → nothing. Deep mutation is TWO-SIDED (Lane A
  measured both halves): no channel deep-reads the param itself
  (unlike `use:`'s deep_read_state — the fromAction getter is
  reference-level), BUT the attachment BODY's own property reads on
  a `$state`-held fx register fine-grained deps, so deep mutation
  re-runs the attachment. The law for our demos: params FLOW
  ($derived/replace), never mutate.
- `fromAction(action, fn = noop)` (`svelte/attachments`, since 5.32):
  calls `action(element, fn())` once, `update(arg)` when the getter's
  value changes (reference-level), `destroy` on teardown — the
  bridge for action-shaped functions AND the fix for the repo's
  `{destroy}`-returning internal actions (E2E7: a naive syntax swap
  silently leaks them — attach only honors function teardowns).
- SSR: attachments are fully inert server-side (E2E5) — glass stays
  frost-first; the mount order equals the `use:` path (E2E4).
- Component tags accept `{@attach fx}` by auto-injecting an
  attachment-key prop — but it only lands if the child spreads
  props (else silently dropped). We do NOT use that: hosts forward
  via records (§3). Version polarity (Lane A measured): the
  RESOLVED svelte — the tracked apps/www lockfile tree the build
  and tests actually run on — is **5.56.9**; the 5.57.0 copy lives
  only in the gitignored pnpm store, and the attachments runtime +
  fromAction are byte-identical between the two (23/23 spike
  assertions green under BOTH). The spike and the compile smoke
  pin the RESOLVED version.

## 2. The attachment API (reshaped — r1's "zero rewrite" claim is dead)

```ts
// TRUE attachment factories — the public face. Param in, attachment out:
liquidGlass(fx: LiquidGlassEffect): Attachment<HTMLElement>;
//   = () => (element) => () => attachLiquidGlass(element, fx).destroy()
//   identity re-mount on fx change (cheap: destroy + rebuild — the maps
//   regenerate in single-digit ms); deep mutation follows the
//   two-sided §1 law — params flow, never mutate.

pressEffect(fx: PressEffect): Attachment<HTMLElement>;
//   self-listening (ruling): pointerdown/pointerup, keydown Enter/Space,
//   no-op while el.matches(':disabled, [aria-disabled="true"]');
//   reduced-motion gate inside; teardown cancels WAAPI + listeners.

// the KERNELS stay exported and unchanged (tests, direct use):
attachLiquidGlass(element, fx) => { update, destroy };   // glass, verbatim
// press kernels: see §2b — shimmer/pulse/rainbow are REWRITTEN
// (declarative CSS+template → imperative), ripple's runtime reused.

// the sweep wrapper for the repo's action-shaped internals:
fromAction(forceShowPopovers)        // no-param actions — fixes the
fromAction(riseIn, () => opts)       // {destroy}-leak (E2E7) and the
                                     // action-shaped bridge generally.
```

**2b. The press kernels — what "moves" really means (R3's feasibility
correction)**: today shimmer/pulse/rainbow have NO JS loops — the
component derives CSS vars/host classes/`data-jx-*-host` stamps +
static DOM layers; the keyframes live in press-button.css. The
attachment REWRITES them imperatively: on mount, build the layers
spans, stamp the vars/classes on the element, on fx change re-stamp
(identity remount); on teardown remove. The acceptance is the
EXISTING press-button.spec DOM/classname assertions passing against
the attachment path. Ripple reuses ripple.svelte.ts' WAAPI runtime
verbatim; its spawn seam MOVES from the component's click (with the
loading-lock ink suppression) to the attachment's self-listened
pointerdown/keydown — the Owner-ruled behavior delta, documented:
ink now fires on pointerdown, and the loading lock no longer
suppresses it (the attachment cannot see the host's loading state —
self-listening's price; if that hurts, hosts forward through their
own record wrapper instead — both paths documented on the page).

**Param discipline (§1 law)**: params flow, never mutate — the docs
guide shows `$derived` fx objects; the spec battery asserts
identity-remount (replace → destroy+mount) and asserts the
deep-mutation boundary's BOTH halves (§1's two-sided law).

## 3. The forwarding law (managed internal elements)

```svelte
<!-- tabs-list.svelte — the host marks the hook, applies the record -->
<div
  data-jx-tabs-ind
  data-jx-attach="indicator"
  ...
  {@attach attachments?.indicator}
>
```

- `attachments?: Partial<Record<Hook, Attachment>>` — record VALUES
  are true attachments: `attachments={{ indicator: liquidGlass(fx) }}`
  (fromAction is NOT needed for our effects — it stays the bridge
  for third-party actions and the internal sweep).
- **Hooks today**: press-button `'root'`, chip `'root'`,
  icon-button `'root'` (forwards into its inner PressButton's
  record), tabs `'indicator'` — every effect-capable host is the
  same shape: its interactive element is component-internal, the
  record is the consumer's only reach. Component tags do NOT take
  `{@attach}` directly (design §10 non-goal — the auto-key path
  requires prop spreads we do not mandate); `<PressButton
  attachments={{ root: pressEffect(shimmer()) }}>` is the composed
  form the demos teach.
- **The override chain at a marker**: a host's OWN default mount
  yields to the record — tabs' liquid indicator wires
  `{@attach attachments?.indicator ?? internalMount()}`. Lane B
  SPIKES `{@attach undefined}` first (expected: skipped, the `use:`
  parity) and pins it in the battery before wiring the chain.
- `data-jx-attach` is OPTIONAL, name-carrying, and the host's public
  contract; **two-channel orthogonality** stands: `data-jx-attach` =
  where effects mount (JS), `data-jx-effect` = what the law paints
  (CSS) — the tabs liquid indicator carries both, spec-pinned.
- Bidirectional spec assertion: marker↔record key, both directions.

## 4. The retirement (R2/R3-corrected — the REAL three)

| surface | fate |
| --- | --- |
| `PressButton` `effect?: PressEffect` | RETIRES (press-button.svelte:258) |
| `IconButton` `effect?: PressEffect` | RETIRES (icon-button.svelte:92 — forwards today) |
| `Chip` `effect?: PressEffect \| null` | RETIRES (chip.svelte:68) — the DEFAULT ripple dies with it (hosts carry zero effect knowledge, ruling 3); chip demos/ scenes that showed ink attach through the record |
| `use:` syntax | zero in the scanned surface (§6) — canary |
| `/docs/components/glass.html` | DELETED (§5) |

NOT in scope (R2/R3 homonym audit): toc (no effect prop — `$effect`
runes false-positives), toast (`ToastEffect` material stamp — a
DIFFERENT thing; its battery stays green, canary-guarded), tabs
(no forwarding; its glassFx/liquidFx derive internally), chart-line
(`vector-effect` SVG attribute). Lane B re-runs the rg audit as a
gate, not a belief.

## 5. `/docs/effects.html` — the effect home (R3-corrected wiring)

- Sections (skeleton-compliant): Intro → **Usage** (the attachment
  guide — the direct form, records, fromAction, the param-flow law)
  → Install (shows `npx jixoai-ui add glass` — real items; the
  skeleton's Install-literal check gets a page-kind branch for
   adopted non-component pages) → Examples, EFFECT-CENTRIC (Owner
   2026-09-10 「把一个个特效以及特效的参数展示出来」: glass — the
   two-layer playground + animated band, content carried, syntax
   rewritten; then FOUR per-effect press galleries #shimmer/
   #pulse/#rainbow/#ripple, each = one-line story + NEUTRAL plain
   hosts (no component chrome — no hard button coupling) + its own
   parameter dock + a live attach-form code sample; the initial
   press-button schema-canvas approach was REJECTED by the Owner
   and removed) → API (builders + attachments + hooks table) →
   migration note → See Also (scroll-run, out of family).
- Catalog: NEW `effects` group appended LAST in CATALOG_GROUPS
  (after feedback — the cross-cutting appendix; the non-ui
  engines/docs groups follow but the ui-filter drops them anyway).
  The UN-FOLD ruling (r3, mid-Lane-C correction): press-button
  joins the effects GROUP but KEEPS `/docs/components/
  press-button.html` — a group is a taxonomy lane, not a page; the
  earlier fold plan would have buried the component's async/zone/
  anchors/a11y docs under an effects anchor (a content loss beyond
  the Owner's ask). glass → `/docs/effects.html` (its route retires
  into the home). Taxonomy refreeze
  **general 15→13, effects:2** — measured current pin is
  general:15 (the glass re-freeze, 105 ui items); new shape
  `['general:13','terminal:4','layout:16','navigation:10',
  'layer:10','data-entry:19','data-display:24','feedback:5',
  'effects:2']`; the canonical-href-uniqueness lock STANDS STRICT
  (the un-fold means both effects residents own DISTINCT hrefs —
  no exemption needed; the battery adds the positive pin: glass →
  /docs/effects.html, press-button → /docs/components/
  press-button.html); docs-nav-filter's group-count pin 8→9;
  skeleton scope
  swaps `glass`→`effects` (walker root list extends to
  dist/docs/effects.html).
- Route retirement chain (R3-audited; r3 un-folded back to ONE
  page): `/docs/components/glass.html` retires into the effects
  home; press-button.html STAYS (its full component docs — async
  pose, zones, anchors, a11y — are the page's own; the effects
  page demos the family ON it, it does not absorb component
  documentation). Both svelte.config.js sides (effects.html
  prerender added; glass entry removed), registry.json meta ×2
  (group moves; glass's href swaps), the glass route dir, the
  gitignored local route mirrors; the prose/link audit covers the
  retired page's references (PAGE_STANDARDS, skills, availability
  rows, cross-page demos).

## 6. The migration inventory (R3's measured reality — 39 mounts + prose)

| category | real mounts | migration |
| --- | --- | --- |
| glass.html demos | 6 real markup mounts (liquidGlass 3 + appleMount 3; Lane A already flipped them; the earlier count of 7 included a CodeBlock PROSE sample — not a mount, Lane C's content rewrite) | DONE in Lane A — `{@attach liquidGlass(fx)}` + the page-local appleMount reshaped to factory form |
| tabs-list liquidMount | 1 ×2 mirrors | forwarding record (§3) |
| press-button / chip rippleRuntime | 2 ×2 mirrors | same-file `{@attach}` (ripple runtime reused) |
| accordion exclusiveGuard | 1 ×2 | `fromAction(exclusiveGuard)` |
| carousel collectSlides | 1 ×2 | `fromAction(collectSlides)` |
| scroll-virtual measureItem | 1 ×2 | `fromAction(measureItem)` |
| toast-viewport bindCard | 1 ×2 | `fromAction(bindCard)` |
| search-palette riseIn | 3 ×2 | `fromAction(riseIn, …)` |
| blueprint scenes forceShowPopovers | 12 (www-only) | `fromAction(forceShowPopovers)` |
| **total** | **38 real markup mounts** (the review-round 39 counted the glass page's prose sample) | |

Prose/sample rewrites (canary hygiene, Lane B/C): tabs.html ×4 prose,
glass.html samples, PAGE_STANDARDS.md ×6, skills design-tokens.md ×1,
registry.json prose ×2, verify-shadcn-add.mjs fixture ×1, the live
spec scenario (via the MODIFIED delta). Frozen archives are exempt
by scope, never edited.

## 7. Degradation & environment matrix

- SSR/no-JS: attachments inert server-side (E2E5); glass frost-first
  unchanged; press/ripple interaction-time only.
- `:disabled`/aria-disabled: pressEffect no-ops (pinned).
- reduced-motion: runtimes' internal gates + the glass law's gates.
- Param updates: identity remount (replace, don't mutate) — the
  documented law; fromAction's reference-level update for bridged
  actions.

## 8. Registry wiring

- glass item: exports reshape (the liquidGlass factory); files
  unchanged otherwise; meta moves (§5).
- press-button item: NEW `ui/press-button/press-effect-runtime.ts`
  (the imperative kernels + self-listening wrapper; mirrored); the
  `pressEffect` factory rides the item's index; effect prop out.
- tabs/chip/icon-button: files touched (record/hooks/prop out).
- No dependency-edge changes (chip/icon-button already depend on
  press-button; tabs on glass).

## 9. Gates & tests map

| gate/test | asserts |
| --- | --- |
| `effect-attachments.spec.ts` (+ mirror) | the two canaries — `use:[a-zA-Z]` zero over apps/www/src + registry/files (routes excluded, the glass-canary precedent; comments stripped; migration-prose exemption wording per the parent change's canary) and `effect={(shimmer\|pulse\|rainbow\|ripple` zero outside builders (toast's ToastEffect explicitly safe) — two-directional fixtures; forwarding bidirectional pins (tabs/chip/icon-button); pressEffect lifecycle (mount/teardown/:disabled no-op/reduced-motion); **R1's battery additions: identity-remount on replace, deep-mutation-does-not-rearm, the {destroy}-swap LEAK counter-example (E2E7 absorbed), fromAction update-on-reference** |
| compile smoke | compiles `{@attach liquidGlass(fx)}`, a record application, and a fromAction sweep site under the RESOLVED svelte (version pinned dynamically — the RESOLVED 5.56.9, per §1's polarity); SSR-inert assert |
| press-button/chip/icon-button specs | re-pinned to the attachment path (the DOM/classname equivalence acceptance) |
| docs-structure (re-pin) | general 15→13 + effects:2 + the href-uniqueness effects exemption + docs-nav 8→9 + prerender swap |
| glass battery | unchanged semantics (kernel untouched); the action-spec's mount assertions still cover attachLiquidGlass directly |
| mirror + registry gates | byte-identity incl. the new runtime file; metadata freshness |

## 10. Non-goals

- scroll-run in the family (motion domain — ruling stands).
- Backward compat (Owner-ruled out).
- Attaching onto component tags (auto-key path) — records instead.
- Deep-mutation reactivity for attachment params (Svelte's contract;
  documented as the param-flow law instead).

## 11. Risks

- Svelte version drift: the smoke pins the resolved version; the
  battery's semantic tests (identity-remount, leak counter-example)
  fail loudly on any behavior change.
- The press rewrite's DOM equivalence — held to the EXISTING spec
  assertions, not vibes.
- The loading-lock ink delta (§2b) — documented on the page; the
  record-wrapper escape hatch documented beside it.
- 39-mount sweep + prose hygiene — the canary is the net; per-site
  verification rides each lane's targeted specs.

## 12. The r4 Owner review amendments (2026-09-10, the effects-page walkthrough)

Six rulings from the Owner's review of `/docs/effects.html`:

1. **`attachments` prop RETIRES — the uniform syntax is `{@attach}`.**
   The record prop was this change's own invention (r2 §3) for
   reaching managed internal elements under the belief that
   component tags cannot take attachments. The Owner's remembered
   design — 「@attach + data-jx-attach（可选）」— is the law. SPIKE
   VERIFIED on the resolved svelte (/tmp/attach-comptag2.mjs,
   mount+teardown green): `{@attach fx}` on a COMPONENT TAG compiles
   to a `createAttachmentKey()` symbol prop; a child that spreads
   `...rest` onto an element forwards it — the runtime's
   `attribute_effect` symbol branch calls `attach` at that element.
   So: hosts DROP the `attachments` prop, spread `...rest` onto
   their `data-jx-attach`-marked root; consumers write
   `<PressButton {@attach pressEffect(shimmer())}>`. `data-jx-attach`
   stays as the OPTIONAL named mounting-point stamp (queryable,
   contract-naming), never the forwarding mechanism. tabs'
   indicator is the component's own material business (no consumer
   record path); icon-button chains its spread into press-button's.
2. **Install section**: the family page shows BOTH residents'
   adds (`npx jixoai-ui add glass` + `add press-button`); the
   skeleton gate's INSTALL_ITEM page-kind branch updated to the
   pair.
3. **shimmer REWORK** to the animation-svelte/magic reference
   (source fetched: SikandarJODD/svelte-animations
   src/lib/magicui/buttons/shimmer/ShimmerButton.svelte +
   tailwind keyframes): a conic sector
   `from calc(270deg - spread/2)` with `spin-around` DWELL
   keyframes (0%→15–35% hold 90deg →65–85% hold 270deg →360%,
   duration = speed×2, linear) inside an aspect-1 `100cqh`
   container-type:size square sweeping via `magicslide`
   (translate calc(100cqw - 100%), speed, ease-in-out, infinite
   ALTERNATE); a `cut`-thick backdrop reveal (`inset: var(--cut)`
   background layer at -z) leaves the rim where the spark shows;
   inset-shadow highlight overlay. Params: color, spread (deg),
   cut (em), speed (ms).
4. **pulse**: opacity fades DURING expansion (opacity tracks
   progress in the SAME keyframes — no sequential fade phase).
5. **rainbow REWORK** to the reference (RainbowButton.svelte +
   `rainbow` keyframes): layered backgrounds — solid inner fill +
   border-box gradient (`background-clip: padding-box, border-box,
   border-box`, 0.08rem transparent border) + the 5-color gradient
   at 200% size flowing `background-position 0%→200%` linear
   infinite; PLUS the under-glow (`::before` blurred gradient bar,
   bottom -20%, h/5, blur 0.8rem). Params: colors ×5, speed.
6. **ripple SVG engine** (「不要用 pos:abs」「用 svg 绘制」): the
   absolute-positioned DOM dots are replaced by an SVG overlay —
   per-spawn `<circle>` (bevel variant: a rounded-corner path) in a
   host-sized `viewBox` SVG; WAAPI animates scale (transform-box:
   fill-box) + opacity TOGETHER from the same progress; coordinates
   come from the viewBox, not per-dot top/left math (the
   misalignment source — border-box vs padding-box offset). The
   SVG layer itself rides the runtime's layer seat (one element,
   stable), pointer-events none.

The r5 amendments (Owner walkthrough 2026-09-10, lane G/H):

7. **Ring-mask paints (shimmer v3 + rainbow v2)**: transparent-host
   pollution (invite/subscribe) and rainbow's dead top border both
   rooted in painting the HOST's face — the fix is ONE layer span
   per effect: `border-radius: inherit` + `padding:
   var(--ring)` + `mask: linear-gradient(#000 0 0) padding-box,
   linear-gradient(#000 0 0); mask-composite: exclude` — paint
   exists ONLY in the ring band, the host's inline style is
   byte-identical through mount/teardown (pinned). shimmer: the
   conic spark rotates with the dwell cadence on a registered
   `--jx-shimmer-angle` — THE CARRIER LAW (measured): registered
   angle animated on the MASKED SPAN with `inherits: true`, the
   pseudo follows via `rotate:` — animating the conic's from-angle
   directly renders FROZEN in Chrome (compositor never repaints the
   masked composite); border-image was the Owner's hint but ignores
   border-radius (CSS law) — the mask is the radius-safe
   equivalent. The slide-square/backdrop-cut structure (the
   corner-jam source) is deleted. rainbow: a 10-stop wrap train
   (±40%..320%) shifted by registered `--jx-rainbow-shift`
   (0→200%) — the FULL ring flows (top included); the under-glow
   stays.
8. **ripple v2**: ink clipped to the host's computed silhouette
   (`<clipPath><rect rx=border-radius>`, per-instance ids), CSS-
   on-SVG keyframes (scale+opacity same progress, animationend/
   animationcancel settle — zero WAAPI), one `feGaussianBlur`
   filter per layer softens the ink (「用 svg 滤镜来改进动画」).
9. **CLI group aliases** (「npx jixoai-ui add effects / effects/
   glass」): `resolveAddNames` — `group/item` validates membership;
   a bare group id expands to its ui members in registry order
   (the expansion is logged; the lock records resolved names);
   item names take precedence; adopt/upgrade stay item-only. The
   effects page's Install teaches the family form.

Battery: the forwarding record tests re-pin to the native
component-tag mechanism (the spike's assertions promoted); kernel
behavior tests re-pin to the new recipes (dwell keyframes, sync
fade, svg ink). Pages: the effects Usage/galleries, press-button/
chip/icon-button pages and blueprints all teach the component-tag
form; Install shows the pair.

10. **The r6 IAB amendments (2026-09-10, the Owner's-engine round — all
    three findings REAL; diagnosed inside the ZCode in-app browser, not
    the Playwright pipeline)**: (a) the **perceptual floor law** — ring
    bands sized in em/rem resolved sub-pixel at 1x DPR (shimmer cut
    0.06em ≈ 0.78px, rainbow 0.08rem ≈ 1.28px): both rings now
    `max(value, 2px)`; (b) the **replaced-element sizing law** — an
    `<svg>` with `inset:0` alone resolves to its 300×150 intrinsic
    box (the ripple seat rode a misplaced default-sized svg): the
    sheet sizes `.jx-ripple-layer` with `width/height: 100%`;
    (c) the **anchor law** — the ripple path had LOST the host's
    positioned pose (`relative z-0`) since Lane A (every other kernel
    stamps it), so the absolute seat anchored to the page wrapper's
    transform ancestor: the ripple runtime stamps + strips the pose
    like its siblings. All three pinned in the battery (classList +
    css source-scans). Lesson recorded: verification must run in the
    CONSUMER'S engine — the retina-2x Playwright pipeline masked (a)
    and the ripple probe had clicked a shimmer host (wrong section),
    reading its arc as contained ink.

11. **The r7 final-chance ports (Owner 2026-09-10 「最后再给你一次机会：
    去参考别人的源代码」)**: shimmer and rainbow are now VERBATIM
    ports of the reference sources (SikandarJODD/svelte-animations
    ShimmerButton.svelte + RainbowButton.svelte) — the r5 ring-mask
    invention (mask-composite bands, registered-property carriers)
    is fully retired. shimmer: the reference's five layers (blurred
    size-container reveal > aspect-1 100cqh square on the ALTERNATE
    slide > -100%-inset conic sector on the DWELL spin; the backdrop
    cut re-paints the face inset by cut; the highlight sheen deepens
    on hover/active) with the reference's host contract (relative
    z-0 + overflow-hidden + the effect's own face — background is a
    param, default rgba(0,0,0,1); params: color #ffffff / spread
    90deg / cut 0.05em / speed 3000 / background). rainbow: the
    reference's three-layer background ON the host class (solid face
    + vertical fade + the flowing 5-color gradient; bg-clip
    padding-box/border-box/border-box over a transparent 0.08rem
    border; background-position 0→200% at bg-size 200%) + the
    under-glow bar; params gain face (#121213). Both paint through
    the CLASS channel — inline stays --vars only (pinned).
12. **ripple refinements (Owner 2026-09-10)**: (a) the clipPath is
    GONE — the layer rides `border-radius: inherit; overflow:
    hidden` (the host's own corners clip, free and exact); (b) `soft`
    param — the feGaussianBlur stdDeviation, DEFAULT 0 = no filter
    def at all (crisp ink; soft is a choice); (c) THE TARGET LAW —
    the pointer may land on any child (the ⌘ glyph): client coords
    minus the SEAT's rect (read per event), never event.offsetX/Y
    (which is relative to whichever node caught the pointer).
13. **The r8 restoration + the demo hold (Owner 2026-09-10 「固定成
    黑底…原始的 border-radius 都看不到…文字都看不到」, then 「你先别
    改了…我后续会给你一个可行的 DEMO」)**: the r7 reference ports
    painted the HOST's face/text/radius — that class of effect paint
    is unlawful here (THE HOST-UNTOUCHED LAW: an effect never paints
    the host's face, text color, border, or radius; the host keeps
    its own design language). shimmer/rainbow returned to the
    ring-mask walk, hardened by the r8 findings: the ring span rides
    z-index 0 (a negative layer vanishes behind an opaque host in
    Chromium's paint order), `padding: max(var(--cut), 2px)` (the
    1x-DPR sub-pixel floor), `border-radius/corner-shape: inherit`,
    color default currentColor. ripple carries the soft demo (dock
    default 1.5). Computed-state proof held in the Owner's engine:
    every ring z:0 / inherited radius / floor / dual mask; ripple
    layers overflow-hidden + live stdDeviation 1.5. STATUS: ripple
    and pulse stand accepted-in-place; shimmer/rainbow VISUAL
    calibration awaits the Owner's working demo — the ring machinery
    above is the carrier it will be re-tuned on, not a final look.
14. **The r9/r10 redesign — the border-band ring lands (Owner 2026-09-10,
    the settled design)**: 「核心的问题其实就是我一直在要求背景镂空。
    但是这个目前在 CSS 里面是无法做到的。所以我现在放弃这个要求，
    我们重新设计shimmer」 — the backdrop-cutout requirement is RETIRED
    (CSS cannot hollow an element's background); shimmer is rebuilt on
    the Owner's reference HTML (the Afif double-background): ONE ring
    span paints an opaque FILL clipped to the padding box over a
    rotating CONIC clipped to the border box — the conic is visible
    ONLY in the border band, which is the cutout the r5-r8 mask
    machinery used to fake, done with real border geometry instead.
    THE FORCED PAIR (the Owner's ruling): the ring's border-color is
    forced TRANSPARENT and border-image forced NONE — the band belongs
    to the conic, never to ink or slices. Params per the ruling:
    shine (the arc color, default #ffffff), shineWidth (the arc's
    angular width, default 30deg), speed (one full revolution, in ms,
    default 3000), and ringW (r10: number = px or any CSS length
    string, default 4px) — THE INSET LAW rides the same value twice:
    the ring's border-width AND its outward inset
    (calc(ring-w * -1)), because an absolutely positioned child
    anchors to the host's PADDING box (inset:0 would push the band
    into the face; pushed out, the band lands exactly ON the host's
    border band and the fill covers the face exactly). The spin is
    the reference's own uniform cadence (to 360deg on the registered
    angle, linear); the dwell holds retired with the mask. Inheritable
    beyond the params: --shimmer-fill (the face, default
    var(--background)), --shimmer-base (the ring's rest color,
    default currentColor), --shimmer-shine-start (280deg). Verification
    in the Owner's engine class (headful system Chrome, DPR 2): the
    arc walks the band (multi-phase frames bottom → left → top-right
    → bottom-left), faces flat, labels readable, silhouettes follow
    the hosts' own corner law. FINDINGS LEFT OPEN (not this round's
    scope): rainbow's r8 mask ring renders near-zero rim chroma in
    the same engine — the obvious successor is the same border-band
    port (fill + wrap-stop train, ringW twice) awaiting the Owner's
    word; the ripple walk-probe confirmed ink spawns (circle, soft
    filter live) — the CDP click-occlusion artifact in the phase
    walker is the instrument's, not the page's.
15. **The r11 host-channel rework (Owner 2026-09-11, four rulings)**:
    (a) 「直接改成在宿主元素上去做」 — the child layer AND the r10
    inset are GONE; the HOST itself carries the ring exactly like the
    reference css (border-width = ringW, the double background, the
    spin). The forced set now includes the PAINT channels
    (background-image/clip/origin/repeat, important by law): measured
    in the Owner's engine, a consumer's `background` SHORTHAND
    (unlayered, specificity) resets image+clip and beats the layered
    zero-specificity rule — while shimmer is mounted, the face/border
    channels are the effect's. (b) THE FILL CHANNEL: number =
    opaque 0xRRGGBB, null = transparent, default = the context's own
    base (opaque); solidFill(cssColor, base?) mints numbers by
    compositing any CSS color over the context base (light/dark true
    by construction) — hex/rgb parsed by regex (jsdom-safe), exotic
    forms through the canvas normalizer. (c) THE BORDER-AREA GATE:
    CSS.supports('background-clip','border-area') per mount (a
    function so tests stub both branches) — where the engine answers,
    --shimmer-clip becomes `padding-box, border-area` and a null fill
    is the TRUE CUTOUT (a transparent fill layer paints nothing; the
    host's backdrop shows through the face — the original 镂空 ask,
    finally real); where it does not, a null fill rides THE BLEND
    EMULATION: light context → white + mix-blend-mode darken, dark →
    black + lighten (stamped inline, restored on teardown). (d) the
    docs galleries all ride the glass animated band (the blend/cutout
    channels need something to blend against; the wrapper isolates so
    the blend composites against the band, never the page). Traps
    found and pinned: `fx.fill ?? default` swallows null's meaning
    (undefined is the ONLY default signal on this channel); var()
    substitution of the mixed clip list is legal (measured) — the
    real killer was the cascade, not the var. Engine-verified
    (Chrome 152, DPR 2): clip padding-box, border-area live; auto =
    opaque faces + 4px dark ring + walking arc; null = pixel-proven
    cutout (interior = adjacent band color) with ring/arc/labels
    intact; the transparent dock chip round-trips through the
    identity remount.
16. **The r12 parameter rulings (Owner 2026-09-11)**: (a) the fill
    DEFAULT follows the Context's dark/light — implemented as the
    COLOR-SCHEME SYSTEM COLOR `Canvas` (the site's theme bootstrap
    updates color-scheme on every toggle, so the face flips light →
    white / dark → black LIVE, no remount; measured trap on the way:
    this site's `--background` TOKEN reads dark even under the light
    theme — tokens lie, the rendered color-scheme does not);
    (b) `ringColor` — the ring's REST color joins the params, default
    `currentColor` (the ring inherits the host's own ink; stamps
    --shimmer-base); (c) `shine`'s default moves from #ffffff to
    `var(--primary)` (the pulse precedent). solidFill's base stays a
    resolved literal (blend math needs numbers): the page root's own
    background when opaque, else the scheme's white/black.
