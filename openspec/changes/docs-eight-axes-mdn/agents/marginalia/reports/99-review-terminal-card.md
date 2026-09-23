# T99 — FIRST REVIEW terminal-card.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 1 LOW / 0 NIT**. Tier proposal: **Tier 2**
(a timing-state-machine page: the rhythm digits, the one-shot stillness, the reduced-
motion short-circuit and the bezel lock all needed live timeline + emulation receipts,
and the shadow digit turned a claim falsification). Independence law kept: findings
formed from my own source reads (the 239-line page, terminal-card.svelte 252, css,
defaults) and two probe passes on port 5244 BEFORE any report reading; no other
terminal-card review exists — no concordance addendum. NO commits, NO pushes. Zero
family edits.

## Verified — the claim bank (timeline + emulation receipts)

**The prerender/settled claim — receipted in raw HTML.** The SSR byte-stream carries
the FULL command text, all 11 `jx-out-shown` classes (every seat settled), 24
traffic-light dots (8 cards × 3), and the cursor — "prerendered and no-JS loads show
the settled terminal" is true before any JS.

**Reduced motion — instant settle.** A `reducedMotion: 'reduce'` context at
domcontentloaded + 350ms: typedLen full (32 incl. the $ prompt), **3/3 outputs shown**
— the component's early return (`if (reduce) return` before the first timer, source
:176-179) lands exactly as the law section states.

**The typing rhythm — anchored timeline digits.** Fresh Replay click as t0, 25ms
polling: **31 char events** (the full command), median inter-char **73ms** with
min 50 / max 147 — the authored `42ms + 0–40ms jitter` band (source :201) with
dev-mode timer overhead; typing span 2211ms/31 chars ≈ 71ms/char. **Outputs cadence**:
+214/+321/+453ms after the last char — the authored **140ms first gap, then 110ms
each** (deltas 107/132 within polling granularity). The law section's numbers are the
source's numbers, verbatim.

**One entrance, then stillness.** Settled card sampled twice, 2s apart:
`identicalAfter2s: true` — nothing loops. **The static cursor**: `animation: none`,
opacity constant — the no-blink law holds (the reference's blink was dropped
deliberately, per the law section).

**The bezel lock — TWO-READ with the tree injection.** `html.dark` injected on the
light page: the default card's ground **oklch(0.2 0 0) UNCHANGED** (dark-locked
regardless of the tree — own-before-ambient), while the `theme="light"` seat stays
**oklch(0.9551 0 0)** under its `jx-light` scoped class — the two shells read
independently of the page. The theme-axis/props split receipts at source too: the
shell lock is a literal slot with own 'dark' (defaults), **no themeAxisSlot exists**
(the unruled-collision law, the ghostty-term precedent named in the file) — the
page's "§13 rules no rename / axis forwards ambient, unadopted" paragraph matches the
contract name-for-name.

**Monospace typography digits.** Command: "JetBrains Mono Variable", **20px** (the
1.25rem sm seam active at 1440; 1.125rem below 40rem), weight **600**, letter-spacing
**−0.5px** (= −0.025em × 20px); outputs **13px** at `oklab(1 0 0 / 0.65)` — the
color-mix(--terminal-foreground 65%, transparent) formula computed.

**Chrome claims.** Three traffic-light dots `aria-hidden="true"` (red/yellow/green
grounds measured), barTitle text in the bar; cursor block `aria-hidden`.

**Density — "no density footprint" receipted.** All four DensityDemo rungs measure
IDENTICAL bezels (padding 20px, ground oklch(0.2 0 0), command 20px) — the fixed-
chrome claim in the terminal-footer paint-invariance form. (StepsTitle analog: the
seat carries no headings — no T97 clone class.)

**Speed pacing.** Slider set to 2× (real ArrowRight keys) + release → the {#key}
re-mount restarts the entrance (the "read on mount, re-mount to apply" mechanism
live); the 2× run settles well inside the 1× window (source: every delay ÷ pace,
clamp `Math.max(0.25, speed || 1)`).

**Structure/battery.** toc == DOM == rail **8/8 in order** (workbench and law BOTH
listed here — no orphan extent, the T98 class absent); h1 ×1; duplicate ids 0; SSR
strip-style byte-stable. **T94 audit**: the family's state selectors are the
`.jx-out`/`.jx-out-shown` pair + `:dir`/media — no `:checked`/`:indeterminate`-shaped
pair. **Sibling differential**: the dark lock is the terminal-header law carried over
(component header names it); the footer's per-chain alias question doesn't arise —
this card always wears its own scope class (`dark`/`jx-light` + the tokenScope var
group), so its ink resolves against its OWN island at every stratum (the card's
ground/ink two-read under html.dark doubled as the per-chain receipt).

## Findings

1. **[MINOR] The "6px hard offset shadow" claim is stale — the served shadow is 4px.**
   Measured computed `box-shadow: rgb(255,255,255) 4px 4px 0px 0px` on the bezel; the
   token chain resolves `var(--jx-elevation-shadow, var(--shadow))` and the site's
   `--shadow` is **4px 4px 0px 0px in both themes** (jx-pure.css :2350 dark, jixoai.css
   :112/:323 light). The 6px wording ships in the meta description, the hero summary,
   the TokenTable row, and the component/css header comments — a fleet of seats, one
   number. One reword (or a token bump if 6px was ever intended) aligns them.
2. **[LOW] The outputs each-block keys on the line STRING — duplicate lines are a
   latent key collision.** `{#each outputs as line, index (line)}` (source :247): two
   identical output strings share a key (Svelte duplicate-key warning + reconciler
   ambiguity). No served seat passes duplicates and the page claims nothing about
   uniqueness, so this is a latent hazard, not a served defect — the fleet's LAW #18
   composite-uniqueness note, keyed-by-content edition. A `line + ' ' + index`-style
   composite key closes it.

**Receipt-only notes (not findings):** the speed clamp (≥ 0.25) is enforced at source
and bounded by the range's min — no seat exercises the out-of-range path; the
`theme="system"` arm is source-receipted only (the shared watchTerminalScope watches
the OS preference live; no system seat on the page) — same unseated-claim class as
prior pages' opt-in arms, one seat away from complete.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ b41b9975) | RED — sole FAILED seat = **toast** (the recorded red); terminal-card in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 1 ERROR (:94:28 cx overload)** — the SIXTH page clone (see T95–T98); family warns (terminal-card.svelte :118 provideUniversalLanes trio) pre-existing, untouched |

## Process evidence

- Port **5244**: wrapper 29746 started for the session (/tmp/marginalia-99-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. The html.dark injection was removed in-probe; the speed
  slider returned to 1× by reset; no DOM state outlived a probe.
- Probe faults owned: my first timeline anchored at domcontentloaded — hydration's
  entrance restart landed ~6s later on the dev server, so the samples straddled two
  cycles (31-settled then typing-from-3). Re-anchored on the **Replay button click**
  (a deterministic t0) and re-measured clean; the "stillness" first read was mid-
  typing for the same reason. The typedLen counts include the `$` prompt glyph
  (32 = 31 chars + prompt) — normalized in the cadence math.
- Artifacts: /tmp/marginalia-99-probe{1,2}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
