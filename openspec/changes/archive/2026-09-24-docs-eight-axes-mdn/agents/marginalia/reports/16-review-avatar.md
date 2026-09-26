# Report 16 — avatar, REVIEW (2nd, marginalia)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/avatar.html/` (+page.ts; curation
`src/lib/ui/props-table/docs/avatar.docs.ts`; generated meta
`src/lib/meta/avatar.meta.ts`) · coder vellum (integrated e2412594) · law:
mdn-doc-style §5+§6, LAW #14, THEME-SPLIT frozen pole, §13 adoption,
same-source lane · reviewer #1: scribe — **IN FLIGHT at filing time;
independence law held: scribe's review was NOT read** (consolidation
deferred until it lands). Every verdict re-derived from source, raw SSR
bytes, or live probes on :5244.

## Verdict: NEEDS-WORK

**0 BLOCKER · 1 MAJOR · 1 MINOR · 0 NIT.** The theme frozen-pole story,
the supply-only negative-grep receipts, the geometry ladder, the bevel
law, the EXTRA arithmetic and the query() case all reproduce exactly —
but the size row's "fixed initials voice" claim is measurably false at
every explicit size, the page's own number-lane demo visibly clips its
initials because of it, and the deviations paragraph contradicts the
page's headline consumption claim.

## Findings

1. **MAJOR — "the initials voice stays the fixed control-label step
   (--jx-text-label-lg) at every size" is FALSE at every explicit size,
   and the number-lane demo visibly clips.** `+page.svelte:386` (size
   row) and repeated as the density row's premise (:393: "the initials
   voice is the fixed --jx-text-label-lg step"). Measured computed
   font-size of the served fallback spans: ambient (no explicit size)
   **12px** — the claim's one true case; but `small/sm` **14px**
   (--jx-size-small, universal-props.css:36), `medium/md` **16px**,
   `large/lg` **18px**, and the number lane the **box edge verbatim** —
   **48px** on the size={48} avatar, **28px** on size={28}. Mechanism:
   avatar.svelte:145 `carriers = stampCarriersForLanes(d)` stamps the §11
   size echo `font-size: var(--jx-size-effective, 1rem)` INLINE
   (defaults.svelte.ts:570-576, "§1: children size via em — ONE number
   moves a family"), and an inline declaration beats the stylex class's
   `fontSize: tokens['--jx-text-label-lg']` (avatar.stylex.ts). The echo
   is visible in the served bytes (`style="--jx-size-effective: 48px;
   font-size: var(--jx-size-effective, 1rem); --jx-avatar-md: 48px"`).
   **Visible defect**: the axes canvas's own number-lane panel renders
   "AL" at 48px font inside a 46px content box — scrollWidth 52 >
   clientWidth 46, CLIPPED — falsifying the head meta's "halved to one
   code point at icon size so it never overflows" on that lane. (The
   sm-halving claim itself IS true: "A"/"张" single code points at the
   24px boxes, avatar.svelte:219 `boxLane <= 24`.) Fix: reword both rows
   to the truth ("the initials ride the §11 size echo — the named steps'
   14/16/18px font ladder, the box edge on the number lane; the fixed
   12px label-lg step holds only on the ambient path") AND fix the demo
   or the family for the number-lane clip (a family-level question for
   quill/Owner: cap the echo at the voice step, or halve by measured
   width, not boxLane ≤ 24).
2. **MINOR — the deviations paragraph contradicts the page's headline.**
   `+page.svelte:439-443`: "…size · elevation · motion are the
   supply-only three with no reader in the tree…" — this labels SIZE
   supply-only one paragraph after the size row's "CONSUMED — the §13
   adoption: this prop IS the axis", the overview's "a size prop that is
   the universal size axis outright", and the axes summary's "The other
   six are supply-only" (six = density·shape·radius·color·elevation·
   motion, correctly listed in the SAME sentence's first clause). The
   intended carrier-level statement is true and worth keeping —
   `--jx-size-effective` has no DESCENDANT reader anywhere (the avatar
   only stamps it; its one reader is the stamp's own font-size echo on
   the same element), like the elevation/motion carriers — but as
   written the sentence says the page's headline axis is supply-only.
   Fix: one clarifying clause ("the size/elevation/motion CARRIERS have
   no reader in the tree — the §13 size adoption consumes the axis
   through the family prop, not the carrier").

## Verified-TRUE receipts

- **False density token rows deleted.** Old page (e2412594~1:313,
  #theming TokenTable) documented `--jx-icon` ('16 / 18 / 20 / 24px',
  source: 'density') and `--jx-inset` ('8 / 8 / 12 / 16px', source:
  'density') as avatar tokens — grep of ui/avatar/: **0 readers each**
  (documented falsehoods). Current page + curation: zero mentions ✓.
  The old page's REAL tokens survived (--jx-avatar-md in the size row's
  number-lane mechanism; --radius in the radius row's bevel compose).
- **Theme four-voices-frozen — measured byte-identical.** The four
  voices are aliased stylex tokens (tokens.stylex.ts: '--jx-card' =
  'var(--card)' et al., emitted at :root — the frozen pole), consumed by
  the frame/fallback atoms (avatar.stylex.ts: borderColor --jx-border,
  backgroundColor --jx-card/--jx-muted, color --jx-muted-foreground).
  Live: the axes dark-island pair (ambient vs theme="dark") reads
  border oklch(0 0 0), bg oklch(0.9551 0 0), ink oklch(0.3211 0 0),
  shadow none — **byte-identical across the pair**. `class:dark` lands
  on the root (avatar.svelte:253/269) and re-scopes nothing. ✓ the
  documented absence (W-next #1).
- **Numbers.** Box ladder 24/32/40 exact (sm/md/lg named AND legacy
  aliases — six roots measured); number lane 48 and 28 px verbatim (the
  `--jx-avatar-md: Npx` stamp + sizeMd's `var(--jx-avatar-md, 2rem)`
  atom); bevel **6/8/10px** at the 8px --radius baseline (0.75×/1×/1.25×,
  avatar.css); rounded AND squircle border-radius **50%** all three
  sizes; corner-shape aliases resolve (computed superellipse(0) on
  bevel); initials halve at sm ("A", "张" — one code point).
- **Supply stamps unmoved — exact per the rows' named scenarios.** md
  bevel corner 8px → stamped `--jx-radius-effective: 24px` → **8px
  unmoved**; cyan stamped → ink oklch(0.3211 0 0) **unmoved**;
  data-density="lg" + coefficient → box and ink unmoved; elevation →
  box-shadow none (no shadow property in the family css — grep). The
  negative-grep receipts re-derived: --jx-shape-effective /
  --jx-radius-effective / --jx-color-effective / --jx-elevation-effective
  / --jx-motion-effective / --jx-hit / --jx-icon / --jx-inset = **0
  readers** each in ui/avatar/ (the single --jx-size-effective hit is
  the carrier STAMP comment at avatar.svelte:87 — not a read).
- **EXTRA arithmetic 17−8=9.** Meta = **17** props (8 axis-named incl.
  size + 9 family: src, name, alt, variant, tooltip, class, onerror,
  style, rest); curation has no extra lane and **deliberately no `size`
  override** — the header documents the badge dead-text lesson ("an
  override for a filtered row is dead text").
- **query() two-generic, live both directions.** Served usage file:
  `query&lt;{ lg: number }, number&gt;({ lg: 48 }, 40)` ×1. Live viewport
  moves: 1280px (≥64rem) → box **48px**; 900px → **40px**; back → 48px.
- **Tier 2 justified.** Old page (e2412594~1, 334 lines): 0
  DocsInstall/DocsSeeAlso, dead ids (#theming, #types, #universal-props,
  #avatar-shapes, #avatar-base), hand props table. New page: full
  archetype, generated meta table, per-axis table, query case, install +
  see-also; usage copy, silhouettes matrix, a11y table (verbatim rows),
  initials algorithm and tooltip facts all survived.
- **toc 7/7** (overview, usage, silhouettes, fallback, props, axes,
  accessibility) ×1 each, order matches DOM; see-also OUT of the toc per
  the ruling while DocsSeeAlso renders (`add avatar` install command ×4,
  `data-doc-install` marker present).
- **Same-source lane green.** canvas-same-source solo: **75/75 PASS** —
  avatar blocks silhouettes/fallback/axes inline snapshots green
  (spec :387/414/451); the play-state lab stays a hand file with the
  rejection-class rationale documented TWICE (page :45-50 — page state,
  bind:value + shorthands, the chip FAQ precedent; spec :388-390).
  docs-structure solo: **12/12 PASS** (skeleton lint incl. this page).
- **test/ pins**: same-source ×3 blocks; docs-structure; docs-ambient
  expectedCarriers includes 'avatar'; defaults-w4-content, batch1.

## Probe-lesson banked

Inline beats class: a family that routes axis carriers through
`stampCarriersForLanes` carries the §11 `font-size` echo INLINE on its
root — any stylex/class "fixed voice" claim about that element is
falsified at every explicit lane (ambient is the only path where the
class wins). Read the stamp helper BEFORE crediting a "fixed step" row,
and measure the explicit lanes, not just ambient. Also: caption-locator
probes must anchor on the caption's TEXT PREFIX (a canvas description
paragraph containing the same word matched first and returned the wrong
panel's avatar).

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server started as a
  background task (log /tmp/marginalia-16-dev.log), killed by PID at the
  end with the lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-16-probe.mjs (axes roots, fallback section,
  silhouettes, theme pair + supply stamps), -qprobe.mjs (fixed locator:
  query flip 48↔40 both directions + the 48-clip measurement),
  -stamp.mjs (md-specific 24px-radius + cyan stamps). SSR:
  /tmp/marginalia-16-ssr.html (1,087,052 bytes). Old page:
  /tmp/marginalia-16-old-page.svelte. Gates: /tmp/marginalia-16-same-source.log
  (75/75), /tmp/marginalia-16-structure.log (12/12).
- Independence: scribe's 1st review unread at filing (in flight).
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.

## Consolidation after cross-reading scribe's 1st review (report 14)

- **The divergence, recorded for the archive**: scribe PASS, my
  NEEDS-WORK, same tree. What the 1st missed and why: its probes
  verified BOX SIZES (24/32/40, the number-lane seam, radius
  inertness) — the initials claim was checked only as the sm HALVING
  ("张伟 keeps 张", read off the fallback canvas), never as a font-size
  measurement at explicit lanes. The MAJOR lives exactly in the gap
  between those two readings: the halving is true, the "fixed voice"
  is not. Scribe's own theme/theme-pair and inertness probes were
  sound (its radius stamp first hit the sm specimen — same locator
  trap I hit in dropdown-menu — then corrected to md, matching my
  md-specific re-stamp).
- **Scribe's findings 1-3 are family-code svelte-check debt** (the
  onerror handler signature, the Object.entries guard, the
  non-reactive-capture warning at :146) — pre-existing per its
  provenance check (4a96996f, W3 batch B), correctly non-gating, and
  orthogonal to my page findings. The :146 warning is adjacent to my
  MAJOR's mechanism (provideUniversalLanes capture) but is a type/
  reactivity lint, not the rendering falsehood I measured.
- Agreements (independent reproduction on different ports): false
  token rows deleted, theme frozen pair, box ladder, number lane,
  radius/color/density inertness, EXTRA 17−8=9, query two-generic
  flip, tier 2, toc 7/7, PILOTS 75/75, play-state rejection class.
- **Net: my NEEDS-WORK stands** (the clip is now drift-ledger #7,
  family-level per the coordinator). Both reviews' probe lessons
  point the same way: box widths are not font sizes; measure the
  voice where the claim names a voice.
