# T40 — separator.html (CODE, the eight-axes archetype)

**Tier: 2 — structural archetype rebuild.** The page predated the archetype (pre-firstpaint
structure, outline-era toc data with the WRONG order, no install/overview/see-also, no
measured axes, `source: 'ink engine'` rows outside TokenEntry's union, an unkeyed each). All
receipts measured fresh on the served DOM; one page file + its toc data touched. Zero
product-tree edits outside the page route.

## Delivery-shape taxonomy: SELF-STAMP (the trivial base case, now named)

Separator stamps everything on its OWN element: the §11 carriers + the caller style in one
`rootStyle` join on the hr/div itself, `data-jx-separator`/`data-orientation`/`data-density`
+ `class:dark` on the same node. No composed root (scroll-area), no observer indirection
(native-scroll-area) — the taxonomy's base case: **SELF-STAMP (own-element)**. A component
with no descendants still stamps: the broadcast (provideUniversalLanes + provideQueryAnchor)
is the point, not consumption.

## The watch-items, measured

**1. Zero-reader class — CONFIRMED (the stack structural class).** Vocabulary-grep over
`ui/separator/`: **zero** reads of any axis carrier (--jx-size/color/elevation/motion/radius/
shape-effective, density vars). The family reads exactly ONE token in ONE variant: solid's
`tokens['--jx-border']` ×2 in the atoms (the additive exception). Density is a MANAGED STAMP
(`data-density="sm"` measured under density="small") with no consumer — the ambient scope
channel keeps flowing for composed descendants.

**2. Omission transparency — census receipt.** A bare `<Separator />` renders the native hr
carrying exactly `class` + `data-jx-separator="fused"` + `data-orientation="horizontal"` —
NO density attr (densityRungOf('auto') stamps nothing), NO style attr (carriers resolve to
nothing), no role (hr is native). Vertical lands `role="separator"` + `aria-orientation=
"vertical"` AFTER the spread — component-owned, not overridable. The variant own is a
DECLARED OWN ('fused' via defineLiteralSlot — the defaults file's terminal literal slot,
never a paint rung).

**3. THEME-SPLIT, five-mechanism vocabulary — and a NEW frozen-ink mechanism shape.** Six of
seven variants are MECHANISM-FREE physics: the contrast ghost + masks read the BACKDROP, the
blend fade inverts by physics — theme-free everywhere, byte-identical backdrop-filter across
every dark injection. Solid rides the token layer, and the ride is SCOPED — THE FINDING:
`--jx-border: var(--border)` is declared at :root, and custom-property substitution happens
at computed-value time ON THE DECLARING ELEMENT, so the light value propagates PRE-RESOLVED:

- under a **scoped .dark island**: inherited `--border` flipped to oklch(1 0 0) while
  `--jx-border` HELD oklch(0 0 0) and solid's fill HELD oklch(0 0 0) — **FROZEN** (measured;
  a black line on a dark ground is exactly the failure mode the W-next #7 seam predicts);
- under **root-level dark** (html.dark — the site's shipping posture): the alias re-derives
  at :root → fill oklch(1 0 0) — **FLIPS** (measured; restored cleanly).

The W-next #7 instances so far were stylex defineVars pins; separator adds the second shape:
a **:root custom-property whose value embeds var() resolves once at :root** — same law,
different mechanism ("root-pinned values cannot re-derive mid-tree"). Flagging as a W-next #7
addition, not a new numbered instance (the ghost/fade/masks stay immune by having no token
mechanism at all).

**4. EXTRA-lane by name.** The api table names the four EXTRA props explicitly: orientation,
variant (the literal own — "Own default, not ambient"), class, **style** (added this task —
the #4 seam law: carriers first, caller style last, never clobbered), and ...rest (spread
onto the element; the component is not rest-less — separator DOES spread, unlike progress).

## The measured eight-axes rows (all on the served DOM or grep)

- **density** — MANAGED STAMP, ZERO-READER CLASS: rung stamped, nothing reads it.
- **size** — ROOT STAMP, ZERO-READER: --jx-size-effective stamped; the strip's 1px is
  engine-fixed; **the query() seat is the live receipt** — 18px at 1280 viewport → 13px at
  600 (the 48rem viewport key), measured on the element's own style attr.
- **shape / radius / elevation / motion** — SUPPLY-ONLY, zero readers (grep); static ink (no
  animation/transition authored anywhere in the family).
- **color** — ZERO-READ BY RULING (the ink law): six variants token-free, solid the one read.
- **theme** — THE MECHANISM SPLIT (above).

Additional pixel receipts: the variant ladder (blockSize 1px base / 2px dotted / 6px wavy;
backdrop-filter contrast(0.5) on ghost+masks, none on solid+fade; difference blend on fade
only; backgrounds transparent except solid's token fill). **Ghost auto-adaptivity, EXACT:**
strip pixel = 0.5·ground + 64 to the digit at BOTH ends — ground 218 → strip 173 (−45) on
light ground; ground 58 → strip 93 (+35) on dark ground — the sign flip is the
auto-adaptive proof, pixel-measured at two device scale factors (dsf 1 and 3, in-page canvas
decode).

## Instrument notes (own the faults, quote the survivors)

Three instrument faults caught and fixed before conclusions: (a) my first ghost profile read
the strip row with subpixel straddle (1px strip on a fractional raster line) — fixed with
deviceScaleFactor 3 + anchored device rows; (b) a probe selector matched the SCAFFOLD HEADER
button's --jx-size-effective stamp (always 13px) instead of my seat — fixed by scoping to
#universal-props, which also exposed that the ORIGINAL seat rode a shrink-wrapped canvas
stage (a 28px span chain) where the viewport key still engages but the strip is sub-measurable
— the seat now rides a full-width ground div; (c) page.screenshot clips are DOCUMENT-space
while getBoundingClientRect is viewport-space — two ramp runs sampled ~1000px above the
target (the "black rows" were the gallery's solid strip) until clips were anchored with
scrollY. The quoted ghost receipts survived all three fixes; nothing else was claimed.

## Structure (toc == DOM, LAW #18/#19)

- Order: hero (h1 ×1) → #install → #overview → #live-demo → #variants → #length-layout →
  #separator-base → #types → #usage → #theming → #api → #universal-props → #accessibility →
  #see-also. Flush trio last (api → the eight axes → accessibility); install/see-also chrome
  OUT. **toc: 11 entries, SSR rail == DOM == expected, chrome OUT** (previously: 8 entries,
  missing universal-props, wrong order).
- **LAW #19 id landscape: duplicate ids NONE page-wide.** **LAW #18**: the variants gallery
  each is now KEYED by variant name (was unkeyed) and mounts **7/7 distinct** — typed via
  `INK_GALLERY: readonly (readonly [SeparatorVariant, string])[]` (also kills the
  variant={v} string-widening error).
- TokenTable rebuilt to the union's vocabulary: ghost + masks + fade = `structural` (engine
  physics, no token), solid = `color` (the var(--border) read — the progress brand-fill
  precedent); the out-of-union `source: 'ink engine'` rows are GONE.

## Gates

- `verify:tailwindless` rc=0 — VERBATIM: `files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42`.
- `verify:docs` rc=0 · `verify:docs-universal` rc=0 (110/110).
- page-scoped svelte-check: **0 diagnostics on separator.html/+page.(svelte|ts)** (the two
  found mid-task — the Object.entries-adjacent variant widening + an implicitly-closed div —
  were mine, fixed; fleet rc=1 is the pre-existing debt the review already keyed).
- Ambient solos (apps/www): batch2-components + defaults-nav-clean + docs-structure +
  docs-nav-filter = **4 files, 62/62, exit 0**; separator family solo **9/9, exit 0**. The
  in-flight tree (keyed, not mine): quill's system-dialog pair + a sibling's table.html pair
  + the ambient vocabulary matrix — zero noise reproduced in my solos.

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → started via npm wrapper → listener PID 25168;
  after gates killed by PID; lsof AFTER: empty, rc=1. (A foreign vite wrapper on **5244**
  — another session — visible in the process table: NOT touched.)
- NO commits, NO pushes. Probe DOM injections (.dark island, class toggles) restored
  in-probe.
- Artifacts: /tmp/sep-probe.mjs, sep-probe2.mjs, sep-probe3.mjs, sep-diag{2..6}.mjs,
  sep-final.mjs, sep-ramp.mjs, sep-verify2.mjs, /tmp/g40-*.txt.

## Open questions

1. **W-next #7 addition**: the :root-var() alias freeze (separator solid) as the second
   mechanism shape of the frozen-ink seam — worth a line in the W-next doc; the fix shape
   for families that need mid-tree re-derivation: declare the alias INSIDE the theme block
   (or read var(--border) directly at use site).
2. The scaffold stamps ambient size lanes at odd rungs (header button 13px, toc 11px) —
   that's the broadcast WORKING, but a future ambient-rung census per docs region would make
   a nice fleet receipt.
3. My seats now ride plain full-width grounds instead of canvas stages (T38/T40 both
   fought shrink-wrap) — maybe the canvas needs a documented "full-bleed stage" posture so
   future seats don't re-derive this lesson.
