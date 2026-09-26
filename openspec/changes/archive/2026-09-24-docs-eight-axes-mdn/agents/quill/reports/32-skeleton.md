# Task 32 — CODE skeleton (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构)** — archetype skeleton replaced the
skeleton page; workbench, composition shells, types cells and api rows
carried; family untouched. Probe **26/26 GREEN, stable across reruns**; every
gate green.

## Tier decision + gap analysis

**Tier 2 优化重构.** The old page carried three strong demos (the loading-card
workbench, the card/list/table composition shells, the geometry types cells)
plus a hand-written 2-row api table — but no install/overview/law/axes/
see-also, a stale 6-entry ToC (skeleton-base section, theming), and zero
measured claims about the pulse, the freeze, or the W3-D5 carrier merge. Tier 1
cannot add the missing layers; tier 3 would discard the best demo set in the
window. Tier 2 carries all three demos, adds the archetype, and measures.

## What changed

- `apps/www/src/routes/docs/components/skeleton.html/+page.svelte`: hero ·
  **install** · **overview** (the async-feedback pair; scenery contract; the
  two holding laws) · workbench (id="skeleton-demo") · **composition shells**
  (carried verbatim, id="shells") · **law** ("The scenery contract" — 6
  postures: the scenery split, the geometry, the pulse, the freeze, the merge
  law, the paint) · types · usage · api (2 rows + universal appendix) ·
  **axes** (8 lanes, all no-own, measured + 5-seam TokenTable + 3 probe-tagged
  demo panels) · accessibility · **see-also**. h1 ×1, marker ×1. The old
  skeleton-base section folded into law + accessibility; theming folded into
  axes.
- `+page.ts`: ToC = overview / live demo / Composition shells / The scenery
  contract / Postures / Usage / API / The eight axes / Accessibility
  (install + see-also chrome OUT).
- **Demo-panel fix (latent old-page bug)**: the old universal-props panels
  rendered blocks with dead utility strings (`class="h-4 w-2/3"` — no
  producer exists in the tailwindless tree), so the demo blocks staged at
  zero height. Re-hosted on the family's real atoms (rt.skBar/skW32/skSize10).
- Family files: **zero edits**. No matrix re-pin owed (skeleton has zero
  matrix rows — the zero-vocabulary family).

## Measurements (probe 26/26; headless Chromium over dev SSR :5241)

1. **The pulse in pixels**: rAF-sampled opacity of a live block — 120 samples
   over 2s oscillating exactly between oMin 0.45 and oMax 1 (the keyframe
   trough), computed animation `jx-skeleton-pulse 1.4s infinite`; full cycle
   inside the trace. NOT a shimmer sweep — brightness only.
2. **The freeze**: under prefers-reduced-motion, animationName → `none` and
   two opacity samples 350ms apart are identical (pixel-still, a=1, b=1).
3. **The merge law (W3-D5)**: with `radius={12}` + consumer
   `style="border-radius: 3px"`, the style attribute carries BOTH
   (`--jx-radius-effective: 12px; …; border-radius: 3px`) and the visible
   corner computes 3px — carrier and consumer declarations co-exist in one
   channel, and the consumer wins the painted property.
4. **The never-manufactures law**: `size={18}` stamps the 18px voice
   (computed font-size 18px, --jx-size-effective: 18px) while the block's box
   stays exactly the class geometry (skBar = 128×12, size-10 = 40×40).
5. **Stamps**: density="small" → data-density="sm" (§4 rung); theme="dark" →
   the dark bridge; named lanes stamp alias vars (--jx-size-medium /
   --jx-radius-large); auto stamps nothing (data-density null on the ambient
   workbench).
6. **Anatomy**: aria-hidden true on every block; muted ground
   (oklch 0.9551 0 0) + inset 1px hairline ring; geometry purely from class.
7. **Chrome**: h1 ×1, marker ×1, toc == DOM (9, ordered), install/see-also
   shipped OUT of toc, only extra hash = skip-link, **duplicate-id audit:
   zero twins — LAW #19 WRAPPER-TWIN guard confirmed live in this tree**
   (sheet measured 6 twins pre-guard; skeleton measures none post-guard).

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both skeleton.html files (re-run after the demo-panel fix) |
| docs-ambient-vocabulary solo | **284/284** — no vellum noise surfaced (her scroll-area edit does not touch this suite's candidates; nothing to chase) |
| batch1-components solo | **27/27** (includes the Skeleton aria-hidden/geometry pin) |

## Sibling discipline

Zero touches outside my three files (+page.svelte, +page.ts, this report).
Vellum's scroll-area.html uncommitted edit is in the working tree — untouched,
and none of my gates read it. Dev server killed by PID + wrapper;
`lsof :5241` EMPTY before AND after.

## Open questions

1. **The dead-utility demo pattern may not be unique to this page**: any page
   whose demo panels hand-write utility-looking strings (`h-4 w-2/3`,
   `size-10`) rather than family atoms stages zero-height blocks in the
   tailless tree — my probe caught it only because the geometry assertion
   read 527×0. A corpus sweep for rendered `class="h-*|w-*|size-*"` literals
   on docs pages would name the full set; say the word and I'll run it as a
   follow-up task.
2. The pulse's motion literals (1.4s ease-in-out) remain reported MISSING
   --motion-1400/--motion-ease-in-out in skeleton.css — serial promotion is
   the family's own recorded follow-up; the page documents the literals as
   the source of record.
