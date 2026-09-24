# T73 — SECOND REVIEW boot-splash.html (vellum)

**Verdict: PASS.** All independent re-derivations landed, both closure clauses from 80720a6a
verify on my own instruments, and no new blocker surfaced. Two review-lane notes (both
non-blocking, filed below). Independence law honored: this section was written from my own
source reads (boot-splash.svelte 345L, the page 529L, the meta IR) and live probes BEFORE
opening marginalia's 34 or scribe's 36; the cross-check follows as an addendum.

## Re-derived surface (my own probes, 5242, chrome)

**The dead-replay fix, end-to-end.** "replay the splash" (fonts signal, blur-out): layer
mounts, holds the 350ms floor, runs the exit, unmounts — my rAF census caught lifetime
≈700ms (350 floor + 350 exit; my 642ms read started late-relative to the mount, consistent
with scribe's 779–844ms window), and the canvas chip reads **open=false** after the child's
internal dismissal — bind:open is one source of truth; the child's write-back reaches the
page state. The dead-replay trap (one-way `open={state}`, no instance rendered) is dead.

**MANUAL is uncapped.** `revealOn="manual"` with the DEFAULT `timeoutMs=4000`: the layer is
**present at 4600ms** — the cap never armed (source: the cap's setTimeout lives inside the
auto-flow guard, boot-splash.svelte:202/228; live: past 4s). The dismiss button flips
`open=false` → the exit runs → unmount at **345ms** (≈durationMs) → chip `open=false`.

**exit=none ≈ the bare floor.** Auto (fonts) + `exit="none"`: lifetime **338ms** ≈ minMs 350
(±rAF) — the floor elapses, the layer unmounts with no exit phase.

**The RM split — closure clause 1 VERIFIED, both paths.**
- MANUAL + RM: dismiss → unmount in **0ms** (the effect's reduced-motion guard skips the
  leaving phase; the render gate unmounts instantly) — instant-under-RM is the manual path
  only.
- AUTO + RM: lifetime **326ms** ≈ the 350ms floor — the floor survives RM (the blink-flash
  guard), only the exit phase dies. Both paths measured under `prefers-reduced-motion: reduce`.

**timeoutMs row — closure clause 2 VERIFIED.** The cap arms only on the auto signals (fonts/
load — a hung font CDN never holds the page); manual returns from the effect before the cap
line; bind:open is manual's only exit. Live-proven past the 4s default cap.

**The rest of the verified surface (re-derived):**
- **Size echo (layer 18 / title 16 / desc 12)**: the size-18 seat's layer carries the inline
  mirror (`--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`) — layer
  font-size 18px measured — while the rem-pinned tiers hold the root scale (title 1rem =
  16px, desc 0.75rem = 12px). The echo with the rem caveat, digit-exact.
- **LAW #16 theme pair, digit-exact, both directions**: prop-alone (`theme="dark"`, no host
  class) — the layer's classList literally CONTAINS `dark` yet paints LIGHT
  (oklch(1 0 0)/oklch(0.2 0 0)): the head block's bridge selectors (`.dark
  .jx-boot-splash-layer`) match an ANCESTOR, and the prop's class lands on the layer itself —
  the descendant-only bridge can't hear it. Ancestor `.dark` host with no prop — grounds flip
  digit-exact to oklch(0.145 0 0) / oklch(0.9551 0 0). And the third voice:
  `prefers-color-scheme: dark` (emulated) flips the same pair — the media query path.
- **Meta arithmetic bit-exact at the IR**: boot-splash.meta.ts declares **21 props** =
  13 family seats + 8 ambient axes (21 − 8 = 13); the API section serves 11 rows + rest +
  style = 13. Exact.
- **Head block ships while the layer is closed**: `style[data-jx-boot-splash]` present in the
  parsed DOM with zero page instances open; the noscript escape verified in the RAW HTML
  (the served bytes carry `<noscript><style data-jx-boot-splash-noscript>` — inside a JS-on
  browser's DOM it stays unparsed text inside the noscript element, which is precisely the
  delivery mechanism).
- **In-flight paint**: z-index 2147483647, position fixed, pointer-events none, role=status,
  aria-label = the title, inline `--jx-boot-splash-duration: 350ms` — all measured on a live
  layer.
- **LAW #18 one-liner**: no keyed list — the family renders a single layer; no each block
  exists (grep). **LAW #19 one-liner**: 49 ids page-wide, duplicates NONE.

## Review-note (non-blocking)

1. **The site dogfoods the component — and it shifts probe timing.** The scaffold host
   (`jx-shell-host`) SSR-ships its own splash (aria "jixoai-ui") which self-dismisses within
   ~1s of load. A reviewer probing "layers at load" catches or misses it depending on how fast
   the first evaluate runs — my first pass read one layer and my second read zero before I
   identified the captor. Worth one line in the page or family docs ("this site's own boot
   runs the component — early probes will meet it"), purely to save the next reviewer the
   half-hour.
2. **The axes-stage demo seats mount three manual BootSplashes simultaneously bound** — all
   closed at rest, correct — but the dismissal buttons are bare `dismiss` pills (three identical
   labels on one stage). Cosmetic only; the bindings are unambiguous in code.

## Gates

- ambient solo (apps/www, `npx vitest run` three files): batch2-components + docs-structure +
  docs-nav-filter = **3 files, 56/56, exit 0**.
- `verify:docs-universal` rc=0 (**110/110**).
- page-scoped svelte-check: **0 diagnostics on boot-splash.html/+page.(svelte|ts)** (fleet
  rc=1 = pre-existing debt elsewhere — untouched files; sibling noise receipted: quill's toc,
  scribe's toast, marginalia's tags-input are in-flight and not mine to chase).

## Process evidence

- Port **5242**: lsof empty BEFORE (rc=1) → wrapper 35152 + listener 35198 (/tmp/t73/*.pid);
  killed BOTH by PID; lsof AFTER: empty, **rc=1**.
- NO commits, NO pushes. Emulations (reduced-motion, color-scheme) reset in-probe; the raw
  HTML was fetched read-only for the noscript/SSR receipts.

---

## Cross-check (the reports were opened only after the verdict above was written)

- **Concordance with scribe's 36 (full)**: every entry in the verified-surface table
  reproduces under my probes — the fonts-replay window (his 779–844ms from click, my ~700ms
  component-true lifetime with a late t0), manual dismiss ≈350ms exit (his 489–537 from
  click), exit=none ≈ the bare floor (my 338 sits inside his 338–348 window), the RM split
  (my 0ms manual / 326ms auto-floor vs his 0ms / 394–443), the size echo with the identical
  verbatim inline join, the LAW #16 pair digit-exact both directions, the head-while-closed
  receipt (his "svelte:head outside the open gate" framing), and the meta arithmetic 21
  (he reached it as 22 raw capture keys − 1 container; I counted 21 keys directly in the
  generated IR — same number, independent route).
- **Concordance with marginalia's 34 (full)**: her rewrite description matches the
  integrated file I read (the dead-replay fix paragraph in the page header, the bind:open
  workbench wire, the axes section folding theming + universal-props, the api summary's
  arithmetic); her probe receipts (797/454/531/430) agree structurally with mine and with
  scribe's multi-run framing — absolute totals vary with fonts.ready latency and sampler
  granularity, exactly her open question 3's law. Her probe-bug ledger note
  (`closest('.dark')` matching the element itself) is the same family as my own instruments'
  scope traps (the transfer round's workbenchSel leak; this round's nav/aside toc scoping).
- **Additions from my pass (not in either prior report)**:
  1. The scaffold-dogfood receipt — the SITE's own boot splash (aria "jixoai-ui") SSR-ships
     inside `jx-shell-host` and self-dismisses within ~1s of load; a "layers at load" probe
     catches or misses it depending on evaluate timing (my two passes disagreed before I
     identified the captor). One line of docs would save the next reviewer the hunt.
  2. The noscript raw-bytes vs parsed-DOM distinction — the noscript escape verified in the
     SERVED HTML; in a JS-on browser's DOM it stays unparsed text inside the noscript
     element, which is the delivery mechanism, not an absence (my first DOM-only check was a
     false negative on exactly this).
  3. The `prefers-color-scheme: dark` voice measured behaviorally (emulated scheme flips the
     grounds to the same digit-exact pair) — scribe verified the media query in bytes; mine
     adds the live flip.
  4. The toc rail renders its 9 anchors TWICE (desktop + mobile bar modes) — dedup required
     before comparing toc == DOM (an instrument note for the next rail audit).
- **Conflicts**: none.
- **Scribe's finding 3** (the family-spec absence) stands as W-next #9 per the dispatch —
  ledger item, not a page blocker; my review adds no new blocker.
