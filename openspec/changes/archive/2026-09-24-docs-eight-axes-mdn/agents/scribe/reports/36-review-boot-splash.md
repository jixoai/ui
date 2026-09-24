# Task 36 — REVIEW boot-splash (1st of 2) · scribe · 2026-09-23

**Verdict: PASS.** Zero MAJOR. Every dispatched claim verified live on
the warm-reload discipline, multi-capture clocks (the progress
burst-pixel lesson applied to timing). Three LOW-class doc completions
ride closure; one W-next candidate (no family spec locks the
dead-replay fix); her three open questions adjudicated below. The meta
arithmetic is the campaign's first exact file-match (21 keys, verified).
Independence law kept: findings formed from my own source reads + probes
BEFORE opening her report 34.

**Reviewed**: `apps/www/src/routes/docs/components/boot-splash.html/`
(+page.svelte 529 lines, +page.ts, integrated at 6ab74431, zero drift) +
`apps/www/src/lib/ui/boot-splash/` (boot-splash.svelte 345, defaults,
index) + `apps/www/src/lib/meta/boot-splash.meta.ts`.

## The claims, re-derived

### 1. The dead-workbench fix — VERIFIED-TRUE end-to-end

Source: the workbench renders the instance unconditionally with
`bind:open={splashOpen}` (:309-315); the replay button flips the state;
`finish()` writes `open = false` (boot-splash.svelte :169-172). Live
(3 runs): click → layer mounts (63-154ms; run 1's 154 is first-click
warm) → covers → **unmounts at 779-844ms from click** (component-true
window ~700-723ms) → **the output chip reads `open: false`** — the
child's internal dismissal reached the parent's state. The dead-replay
defect (chip flips, nothing mounts) is dead, and the fix is now
measured, not just described.

### 2. The clock receipts — VERIFIED-TRUE (multi-capture, 8ms sampler ×3)

| mode | dispatch | my runs (multi) | structure |
|---|---|---|---|
| fonts (blur-out) | mount 150 → gone 797 | mount 63-154, gone 779-844 | 350 floor + 350 blur-out + small animationend latency (~10-25ms at my sampler) |
| manual hold | holds, no cap | **present at 4600ms with timeoutMs=4000** | uncapped — LIVE-PROVEN past the cap |
| manual dismiss→gone | 454 | ~489-537 after the click | 350 exit + latency |
| exit=none | 430 | gone 400-410 from click (~338-348 window) | the bare floor, no phase |
| fonts + reduced-motion | 531 | 394-443 from click (~331-347 window) | **floor kept, exit skipped** — the leaving class never appears |
| manual + reduced-motion | ~27ms | **0ms** (gone before the first rAF poll — sub-frame instant) | no floor, no phase |

Every structural decomposition holds; the absolute totals vary with
fonts.ready latency and sampler granularity — per her open question 3,
the multi-run numbers above are the tighter quote, and the page wisely
quotes NO absolute clock numbers (nothing to correct on-page).

### 3. Reduced-motion honesty — VERIFIED-TRUE (the split is real)

manual+RM is truly instant (0ms, sub-frame); fonts+RM keeps the floor
(~350 window, exit skipped). The page's exits/a11y wording ("skips the
animation") is accurate — but the motion row's phrasing over-generalizes
(finding 1).

### 4. Size echo — VERIFIED-TRUE

`size={18}` layer styleAttr **verbatim, joined with the duration
channel** (the merge law): `--jx-boot-splash-duration: 350ms;
--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem);`
— layer font-size **18px**, title **16px** (the 1rem REM tier holding
the root scale, NOT the layer's 18px — the caveat taught correctly),
desc **12px**.

### 5. Controlled theme pair (LAW #16) — VERIFIED-TRUE digit-exact

- Prop alone (`theme="dark"`, light host): bg **oklch(1 0 0)**, ink
  **oklch(0.2 0 0)** — and the layer's classList literally contains
  **`dark`**: the stamp lands, NO rule hears it (the head block's bridge
  is `.dark .jx-boot-splash-layer` — a DESCENDANT matcher).
- Ancestor `.dark` host (no prop): bg **oklch(0.145 0 0)**, ink
  **oklch(0.9551 0 0)** (title ink too), layer classList has no dark,
  parent `DIV.dark` — the grounds answer the HOST's vocabulary.
- The head block byte-verified in the served document (descendant
  bridge + prefers-color-scheme media + noscript). Extra receipt: the
  head block ships even while the workbench layer is closed —
  svelte:head is outside the `open` gate, so the zero-css vocabulary
  always rides the document.

### 6. Structure — VERIFIED-TRUE

h1 ×1 · universal marker ×1 · toc **9/9** served == +page.ts == DOM
order (overview, usage, boot-splash-workbench, zero-css, slots, exits,
api, axes, accessibility; install + see-also out) · zero literal
undefined/null text nodes · the zero-css law section carries the served
bytes · slots/exits teaching present · **api serves exactly the 11
family rows** · **meta arithmetic exact**: 22 raw capture keys − 1
container = **21 props** = 11 family + 8 ambient axes + style + rest —
"21 − 8 = 13 family seats (11 served + rest/style)" matches the file
key-for-key, the campaign's first bit-exact summary.

## Findings

1. **[LOW · rides closure]** The motion row's "prefers-reduced-motion
   kills the exit outright (measured: an instant unmount …)"
   over-generalizes: instant is the **manual+RM** path only; the
   **auto+RM** path keeps the 350ms floor (measured both). The exits/
   a11y wording ("skips the animation") is precise; the motion row
   should name which path is instant — one clause.
2. **[LOW · rides closure — open question 1: YES]** The manual-uncapped
   fact is taught in the workbench prose ("manual holds until you
   dismiss it") but the api rows don't say it: timeoutMs reads as a
   general "hard cap". Add the clause ("caps the fonts/load signals;
   manual is uncapped — your bind is the only exit"). Mechanism
   source-true (:202 returns before the cap arms) and now live-proven
   (present at 4600ms).
3. **[LOW · W-next candidate]** **No family spec exists** — boot-splash
   appears in test/ only via docs-structure's route list. The
   dead-workbench regression (the exact defect this page fixed) has no
   automated lock. A boot-splash.spec (replay → layer mounts → fonts
   auto-dismiss → chip false; manual uncapped past timeoutMs; the RM
   split; the theme pair) would lock the machine. Filed as a W-next
   candidate.
4. **[NIT · instrument]** The dispatch's absolute totals (797/454/531/
   430) vs mine (779-844/489-537/394-443/400-410): same structure,
   different absolutes — fonts.ready latency + sampler granularity.
   Per her own open question 3, quote multi-run numbers with the
   instrument named. Review-layer only; the page quotes no absolutes.

## Her three open questions — adjudicated

1. **Manual no-cap api row: YES** (finding 2) — source-true, live-proven
   past the cap, one clause completes the teaching.
2. **Instant-under-RM everywhere: NO for now** — the floor is the
   blink-flash guard FOR auto signals; manual has no blink risk (the
   consumer dismissed). The current split is principled; document it
   (finding 1) rather than change the family. Owner-grade if ever
   revisited.
3. **animationend latency quoted: CONCUR** — the latency component is
   real but small (~10-25ms at an 8ms sampler; her decomposition implied
   more); multi-capture with the instrument named is the law (the
   progress burst-pixel lesson, timing edition).

## Cross-check against marginalia's report 34 (read AFTER findings formed)

Full concordance: her mount/cover/unmount receipt, the bind-back chip,
the size echo (verbatim join with the duration channel), the theme pair
digits, the 11-row api + arithmetic, the toc 9, the SSR byte receipts
all reproduce under my independent probes. Two additions from my side:
the manual-uncapped LIVE proof (present at 4600ms past the 4s cap — her
report asserts "no timeout cap" from source; mine adds the behavioral
receipt), and the head-block-ships-while-closed detail (svelte:head
outside the open gate). Her probe-bug ledger note (closest('.dark')
matching self) is the same class my classList-direct read avoids. My
RM-fonts absolute (394-443) vs her 531: same structure, different
fonts.ready latency — the multi-run quote wins per her own open
question 3.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-structure solo (the boot-splash-adjacent structural suite; **no dedicated family spec exists** — finding 3) | **12/12**, exit 0 |
| docs-ambient-vocabulary solo | **283/284** — the 1 failure is **scroll-area-keyed sibling noise, attributed** (vellum's uncommitted scroll-area.html edit; the global deny sweep keys exactly `scroll-area.html: no 'inherited' default / retired sentences`; native-scroll-area passes; zero boot-splash keys. quill's sheet keys now PASS — her matrix re-pin is in the tree) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | boot-splash.html page: **0 diagnostics**; family diagnostics are the fleet-wide provideUniversalLanes warn class + 1 cx-union overload |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

## Closure

boot-splash passes review #1. My disposition: findings 1 and 2 ride
closure as one-clause wording completions; finding 3 (the family spec)
is a W-next candidate for the orchestrator; the adjudications above
stand. No page changes required beyond the two clauses.

No commits made. Report file:
`agents/scribe/reports/36-review-boot-splash.md`.
