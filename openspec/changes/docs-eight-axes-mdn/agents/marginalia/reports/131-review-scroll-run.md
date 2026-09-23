# T131 — FIRST REVIEW scroll-run (marginalia, 2026-09-24)

- **Target**: `apps/www/src/routes/docs/components/scroll-run.html/` (page 438 + ts 17)
  over the family: scroll-run.svelte.ts 405 (the machine), scroll-chrome.svelte 302,
  scroll-run.css 398, stylex 41, defaults 46, barrel 27. **Registry twins: all 6 files
  cmp-identical.** Vintage: HEAD 2b06c0d5; fresh build this batch (dist 02:33).
- **VERDICT: PASS — 0 MAJOR / 2 MINOR / 0 LOW / 1 NIT. Tier 2 proposed.**

## Verified TRUE with digits (my own instruments)

1. **The verdict machine** — the demo run stamps `data-jx-scroll-state`:
   **start-closed** at load (max 487, progress "0"), **end-closed** at scrollLeft 479
   (= max, progress "1"), back to **start-closed**, and **none** under content:fits —
   the four-state verdict live. The host `--jx-scroll-progress` tracked 0 → 1 with the
   travel.
2. **The tabindex=0 verdict stamp** (c6ba1f1f, quill's T107 receipt) — measured through
   the full cycle: tabindex **"0"** while scrollable, **REMOVED** at the none verdict,
   re-stamped **"0"** when the lanes grew back (the childList observer re-verdicting).
   WCAG 2.1.1 keyboard reachability rides the verdict exactly as the source claims
   (scroll-run.svelte.ts :233-234).
3. **The squared edge factors** — at scroll 0 the clipped tail members carry
   `--jx-edge-end: 1.000` and compute **opacity 0** (fully melted); the first member
   carries NO factor (the stamp removes non-positive values — "rest is the natural
   self by arithmetic"); at the end the factors flip sides (first member edge-start
   1.000, last cleaned).
4. **The nudge** — the forward chip advanced the run by **479 = the full remaining
   max** (clientWidth minus lanes, clamped at the end).
5. **Declared absence vs verdict gating** (the two mechanisms, both measured):
   chips-disabled removed the chip buttons from the DOM entirely (the labelled-button
   census drops "Scroll back"/"Scroll on"); content:fits kept the nodes but the
   verdict+css unpainted them (`anyChip` false) — matches the source split
   ({#if !disabled} at scroll-chrome :279/:291 vs the :243-250 :has() gates).
6. **Custom chips** — the snippet lane rendered an svg inside the "Scroll back" chip
   (the glyph retires, content centers). **Axis flip** — data-axis=vertical re-stamped
   the verdict (start-closed on the block axis). **Universal seat** — the fragment
   dialect: the uni run carries its own verdict + tabindex="0"; the context lanes
   stamp through (data-density sm in the seat set).
7. **LAW #19**: 38 ids, zero duplicates. **SSR receipt** — the prerendered HTML ships
   no verdict attribute (`data-jx-scroll-state="…"`: zero attribute matches) and the
   chip paint is gated by the :250 no-verdict gate (see NIT for the DOM nuance).

## Findings

1. **[MINOR — the chips are shipped `tabindex="-1"` while the page teaches them
   focusable, twice.]** scroll-chrome.svelte :282/:294 hardcode `tabindex="-1"` on
   both chips; the page's a11y table says "Each chevron chip is a **real focusable
   button**" and the srun-law paragraph "the two chevron chips as **real focusable
   buttons** wired to nudgeRun". Measured: the buttons never join the Tab order.
   Keyboard users are NOT stranded (the run itself is tabindex 0 — the machine's own
   law), but the a11y table's contract row is false as written. Fix shape: either the
   component drops the -1 (if the shortcut was meant to be reachable) or the two page
   seats reword to the truth ("pointer shortcuts; keyboard travel rides the run").
2. **[MINOR — six page type seats vs the batch's expected 0.]** The family is clean
   (0 Errors — the 22e0d1b3 closure held), but scroll-run.html/+page.svelte carries 6:
   :102:3 the self-admitted `effect` rune-shadow quirk (the page's own comment :144-145
   documents it); :286/:301 the `i === 3 && rt.inkPrimary` conditional hands `false`
   into a cx that doesn't admit it (the exact fleet cx-debt class closed everywhere
   else at 2b06c0d5 — this page predates the hardened predicate); :314/:315 the
   arrLeft/arrUp snippet pair fails the Snippet<[]> unify (version-skew shape);
   :109:7 the {@attach} binding's undefined-vs-null. No runtime impact (the probe
   drove the page end-to-end), but the typed-seats gate posture is 0.
3. **[NIT — "pre-hydration the strip is naked — no chips" is paint-true, DOM-false.]**
   The prerendered HTML SHIPS the two chip buttons (aria-labels present in the dist
   bytes); the :250 no-verdict gate (:has(> [data-jx-scroll-run]:not([data-jx-scroll-
   state]))) unpaints them and display:none keeps them out of the a11y tree, so every
   user-visible claim holds — but "no chips" is literally false at the DOM layer. One
   clause ("no chips paint") closes it.

## Standard battery

SSR duality ✓ (payload served, h1 ×1); THEME-SPLIT n/a (no theme claims); the
EXTRA lanes driven (the meta-generated API tables, the builders table, the a11y
table); vocabulary clean; LAW #18 n/a (the chips each key a string, the workbench
cells are static); page 6 type seats (MINOR-2), family 0 errors + 9 fleet-noise
warns.

## Tier proposal

**Tier 2 holds as proposed** — the archetype is the fleet's heaviest behavioral
system and every runtime claim measured TRUE; both minors are one-seat closures (a
reword and the typed predicate) that consolidation can land directly.

## Probe-fault ownership

1. The canvas dock (`[data-jx-canvas-dock]`) intercepted pointer events over the
   demo at 1280×900 — three locator clicks burned before I routed the drives through
   the DOM click path (the same events the pointer fires; the nudge receipt stands).
2. My vertical-axis `max` read used scrollWidth/clientWidth (the INLINE axis) on a
   vertical run — read 0; the machine's own stamped verdict (start-closed) is the
   truth I should have quoted. My chip-glyph read probed ::before on the button; the
   glyph law paints elsewhere. Both misreads owned; neither shaped a finding.
3. The first nudge attempt also fought the run's smooth scroll-behavior — fixed by
   forcing `scroll-behavior: auto` before assignments (the machine's own RTL-probe
   trick, scroll-run.svelte.ts :93).

## Gate record

- svelte-check (ONE run, saved /tmp/marginalia-131-sc.log): page **6 errors**
  (MINOR-2), family **0 errors** + 9 fleet-noise warns.
- Fresh build this batch: rc=0 (dist 02:33 ≥ 2b06c0d5); **verify:docs rc=0**; docs-
  universal **110/110** rc=0.
- Process: port 5244 mine, killed (lsof rc=1 empty); NO commits/pushes/fixes; all
  toggles reverted by navigation (fresh contexts per stage). Artifacts:
  /tmp/marginalia-131-scrollrun.mjs, /tmp/m131-diag.mjs,
  /tmp/marginalia-131-{sc,build,build2,docs,univ,dev}.log.
