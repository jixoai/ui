# T38 — scroll-area (styled sibling of native-scroll-area)

**Tier: 2 — structural archetype rebuild.** The page at HEAD was the fleet's outline-mode
dogfood (no `+page.ts`, a self-deriving `Toc outline=` rail, pre-archetype section soup).
Rebuilt to the MDN skeleton with the toc shipped as PAGE DATA, new install/overview/see-also,
a measured eight-axes section with a live query() seat, and the accessibility section moved
into the closing trio. The component, the kit, the native sibling's page and scroll-virtual's
page are untouched.

## Changes

- `apps/www/src/routes/docs/components/scroll-area.html/+page.svelte` (restructured)
  - Archetype order now: hero (h1 ×1) → #install (DocsInstall) → #overview → #live-demo →
    #capsule → #chrome-params → #platform-sibling → #the-kit → #virtual-scrolling →
    #toc-metadata → #types → #usage → #theming → #api → #universal-props → #accessibility →
    #see-also (SectionCard pills: native-scroll-area + scroll-virtual + DocsSeeAlso).
  - Overview teaches ONLY what this family ADDS beyond the platform sibling: the always
    hand-drawn capsule, the four testable pins, the thumb's own scrollbar contract, the
    chrome params — over the shared kit core. The siblings' own stories (observer-consumed
    scheme, capability sheet) stay in see-also links and the mid-page sibling cards, never
    re-told as ours (the kit-shaped sharing law).
  - #universal-props: the eight axes as measured rows (PropsTable) + one live query() seat.
  - Retired: the `Toc` import, the outline-mode aside rail, `pageOutline` (the data toc
    contract replaces the dogfood; the toc-metadata section documents the export honestly).
  - Type fixes: page-local `cx` got a filter type predicate (`Object.entries` overload error);
    `canvasUsage` initial snapshot now built by a plain function (kills the
    `state_referenced_locally` warning); theming TokenTable row `source: 'theme'` →
    `'component'` (the native sibling classifies the identical currentColor token-law row the
    same way; the union only allows density/color/component/structural).
- `apps/www/src/routes/docs/components/scroll-area.html/+page.ts` (NEW)
  - `toc` as page data, 14 sections in DOM order, chrome OUT (install/see-also), trio last.
- NOT touched: `scroll-area.svelte`/`scroll-area.css`/`scroll-area.stylex`,
  `scroll-area-kit/*`, `native-scroll-area.html/*`, `scroll-virtual.html/*`, quill's sheet
  files, scribe's reference review. Keyed noise in check output is attributed below.

## Measurements (probe receipts, served DOM at :5242, rebuilt page)

**Stamp topology (delivery-shape taxonomy): OWN REGION ROOT — composed root stamps.**
`scroll-area.svelte` resolves `ScrollAreaDefaults.resolve({ radius, density, … })` and stamps
the carriers + the thumb-corner literal in ONE joined `rootStyle` on the family's own region
div. The kit's hand-drawn adapter sits OUTSIDE the supply set (zero lane reads in
`scroll-area-kit/` — grep receipts over ui/scroll-area/ + scroll-area-kit/). This is the
same family shape as quill's composed-root finding, with the difference named: the composed
root lives inside THIS item, so no observer-consumed indirection — that posture belongs to
the native sibling's scheme observer alone. `resolveThemeScope` is consumed only by the
native sibling (grep-proven); the sharing law holds — the siblings share the core, never
each other's halves.

- **Thumb contract (digit-exact):** scroll to mid-travel → `data-verdict-y="open"`,
  thumb `aria-valuenow="50"`, `aria-orientation="vertical"`, `aria-controls` → the
  `jx-scroll-viewport-N` id (module counter, SSR-stable), thumb visible. Ratio 0.333 ==
  the kit's `client/scroll` fraction; position 0.50 == authored math (pure `thumbGeometry`).
- **Four pins timeline:** `data-thumb-live` on at ~1.1s while the region holds focus;
  removed by ~1.75s after blur; track opacity 1 → 0 completes (180ms fade after the ~700ms
  idle delay). The thumb itself never fades — the TRACK does. `prefers-reduced-motion`
  keeps the chrome statically visible.
- **Width tiers:** computed chrome 8 / 12 / 16px (thin/auto/wide), stamped `data-width`.
- **Radius:** ambient 0px (square-cut), configured 6px, `'full'` →
  `calc(infinity * 1px)`, engine-capped to a 3.35544e+07px capsule (PIXELS receipts).
- **Verdict vocabulary page-wide:** none / start-closed / open across the regions probed
  (21 regions); fitted content draws NO chrome (the none verdict gates the mount).
- **Frozen-ink seam (W-next #7 fifth-instance watch): NEGATIVE.** The capsule paints
  `currentColor` — INHERITANCE, not a pinned literal. A bare `.dark` on the region alone
  re-declares token VALUES without re-theming the chrome; the chrome moves when the stage
  re-themes text color. Not a frozen-ink instance; the precise edge is taught in theming.
- **The eight axes (all FORWARDERS):** density `small` → `data-density="sm"` +
  `--jx-density-coefficient: 1`; size number lane → `--jx-size-effective: 18px` + the
  `font-size: var(--jx-size-effective, 1rem)` echo (viewport + content inherit);
  shape/elevation/motion are zero-readers (carriers only, grep receipts); color+theme ride
  the currentColor token law. **Radius is THE OWNED NAME collision:** the chrome param owns
  the name for the THUMB ('full' is outside RadiusLane; §13 rules no rename — chip/badge
  shape precedent), while the px number lane double-stamps as the concentric ANCHOR:
  radius={20} on the region → descendant auto Card computes max(0px, 20px − 0.875rem).
  The axes record OMITS the radius slot deliberately.
- **query() seat:** `query({ md: 18 }, 13)` on the size lane — region font-size 18px at
  1280w, 13px at 600w (the 48rem md key), live across resize. The chrome params
  (radius/width/pad) are native CSS passthroughs and reject QueryResult — the
  lanes-vs-passthroughs boundary, typecheck-proven.
- **LAW #18:** all keyed eaches carry uniqueness-guaranteed keys (index/`note.id`);
  mounted-children probe: 60 capsule log lines, 12 + 16 types-demo items, query seat
  mounted — no `each_key_duplicate` abort.
- **duplicate-id assert:** NONE page-wide (16 unique `[data-reveal][id]`s).
- **toc == DOM:** SSR rail ships the 14 ids in exact DOM order (×2 = desktop + mobile
  rail); chrome OUT; `href="#main"` is the fleet skip-link and an `href="#id"` match in raw
  SSR census is text inside an inlined `?raw` code comment — neither is a rail entry.

## Gates (all from repo root unless noted)

- `verify:tailwindless` rc=0 — VERBATIM receipt: `files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42` (pin intact).
- `verify:docs` rc=0 — skeleton lint green.
- `verify:docs-universal` rc=0 — 110/110 pages render the shared universal section.
- page-scoped svelte-check: **0 diagnostics on +page.svelte** (post-fix machine run).
  Attributed HEAD noise, untouched: `scroll-area-kit/core.ts` 218:7 (1 error —
  `HTMLElement | null | undefined` into a `HTMLElement | null` local in
  `resolveThemeScope`), `ui/scroll-area/scroll-area.svelte` (7 warnings — the lane props
  referenced by `provideUniversalLanes` + the module-init `cx`), `ui/native-scroll-area`
  (1 error + 8 warnings), `native-scroll-area.html/+page.svelte` 61:68 (the sibling's own
  canvasUsage warning). One-word predicate fixes exist if you want a family-hygiene pass;
  they are not mine to churn.
- Ambient solo (apps/www): 4 files, **77/77** (scroll-area-family, scroll-area-kit,
  docs-structure, docs-nav-filter) — matches the pre-change baseline exactly.

## Teardown

- Vite started by npm wrapper; killed BOTH pids (wrapper 50979 + listener 51009);
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → empty, rc=1. Port 5242 free. No other processes
  started.

## Open questions

1. Family-file check noise (kit core.ts error, component warnings, native page warning) is
   all at HEAD — want a one-shot hygiene pass before the campaign closes, or leave for the
   fleet-wide check policy?
2. #live-demo has no h2 (bare ComponentCanvas) but rides the toc by the progress page
   precedent — should the archetype require an h2 on demo sections?
3. The theming row vocabulary question is settled by sibling precedent (`component`), but
   the 4-value source union means theme-adjacent rows can never say "theme" — fine today;
   flag only if a future row genuinely needs it.
4. The `.dark`-on-region edge (values re-declared, chrome unmoved) is taught in theming —
   if W-next #7 ever gains a themed-chrome family, this edge is where a frozen voice would
   first show.
