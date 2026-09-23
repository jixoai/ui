# T93 — FIRST REVIEW popover.html (marginalia)

**Verdict: NEEDS-WORK** — **2 MAJOR / 4 MINOR / 2 LOW / 1 NIT**. Tier proposal: **Tier 2**
(dense load-bearing family claims — anchor geometry digits, top-layer contract, elevation
quartet, variant painting — the dialog/float-button profile). Independence law kept: every
finding below was formed from my own source reads (the 643-line page, popover.svelte 438,
popover.css/stylex/defaults, meta, defaults.svelte.ts, jx-pure.css level table) and four
probe passes on port 5244 BEFORE reading any other report; no other popover review exists,
so no concordance addendum applies. NO commits, NO pushes. Zero family edits.

## Verified — the claim bank that HOLDS (all probed, all digit receipts)

**Anchor geometry — digit-exact at every pose.** Two-read form on real opens (settled
750ms+): declared `anchor-name: --jx-pop-<sanitized-id>` on the wrapper, computed
`position-anchor` resolving back to it on the panel, settled rect vs trigger rect.

- **bottom-end default, gap 0 (the r22 flush law)**: `dyBottom 0 / dRight 0` — panel hugs
  the trigger, right edges END-aligned. `position-area` computes `span-left bottom` from
  the authored `bottom span-left` — the measured span-semantics law (source :279-298:
  `span-left` END-aligns) live on every static seat.
- **gap semantics (margin law, source :136-146)**: range set to 8 by real ArrowRight keys →
  side mode inline `--jx-pop-gap: 8px 0 0 0` → `dyBottom 8 / dRight 0` (facing side only,
  inline edges stay flush); uniform mode `--jx-pop-gap: 8px` → `dyBottom 8 / dRight −8`
  (the alignment edge insets too). Exactly the page's PlayHelp arithmetic.
- **the nine-grid (try-grid)**: master `center` cell all-on ⇄ all-off (aria-pressed ×9
  flip, both directions); from all-off, lighting `top` → `['top']`, and the open measures
  **`dyTop 0` (flush above) / `cxDelta 0` (anchor-center)** with `position-try` collapsed
  to `--jx-try-top`. "The MOST RECENTLY lit cell is the initial position" — reproduced.
  Default all-on keeps `--jx-try-bottom-end` first in the computed fallback list (9
  candidates injected at runtime, all nine `@position-try` rules verified in the head).
- **the open-time lock law** receipted incidentally: an open fired mid-reveal (probe's
  auto-scroll race) locked a try-fallback pose (`dyBottom −163 / dRight +148`) — the
  documented "the side is chosen ONCE, at open; an OPEN panel never re-evaluates"
  (component header, page r23/r25 comments) behaving exactly as written. Probe-induced;
  clean opens reproduce 0/0 every time.

**Top-layer contract — the browser-native claims hold.** Real clicks/keys only:

- `aria-expanded` false → true on click, → false on Escape (the toggle seam mirroring);
  **focus returns to the trigger** (activeElement === trigger after Escape); **Enter
  opens** from the focused trigger.
- **one auto popover at a time**: opening demo-card closed the open demo-menu (measured).
- **light dismiss click-outside**: real mouse click at (40,500) closes (measured closed).
- **top layer**: elementFromPoint at the open panel's center hits panel content; and the
  platform LIFO receipt — with a `showModal()` dialog open (injected platform probe),
  the popover opened AFTER paints above it (hit-in-panel true). The base section's
  "renders above sticky headers, transforms, and open dialogs" holds for the
  opened-after direction.
- **`::backdrop` transparent** (the base bullet): computed `rgba(0, 0, 0, 0)` on the open
  panel; popover.css :72-74 authored `background: transparent`.
- **Tab is untrapped and the a11y table does NOT over-claim**: "Moves through the panel
  body content while open" — Tab walk measured Rename → Copy → Duplicate → Archive →
  Delete → then OUT to the page (CodeBlock, next trigger). Non-modal by design, no trap
  claim anywhere; W-next #17 (focus-containment) n/a — correctly absent.

**Caret flip**: closed transform `none` → open `matrix(-1, 0, 0, -1, 0, 0)` = rotate
180° via `:where(.jx-pop-anchor:has(+ .jx-pop:popover-open)) .jx-pop-caret` (the page's
`:has(+ :popover-open)` wording, popover.css :94), transition 0.15s.

**Wrap-IN-PLACE (the island arm)**: parent chain identical at rest and open (16 deep,
head `#canvas-pop → stage → …`) — the panel is never body-appended, tokenScope survives
the promotion; the stage pin (`data-theme` + `.jx-light`/`.dark`, canvas :660-681)
continues to govern the panel's paint. No severance receipts anywhere.

**The elevation quartet PAINTS digit-exact** (the universal-props stage, light pin):

| seat | inline eff | body box-shadow (computed) | surface (computed) |
|---|---|---|---|
| univ-default | 3 | `rgba(0,0,0,.3) 0 1px 2px 0, rgba(0,0,0,.15) 0 2px 6px 2px` = level2 recipe | oklch(0.96 0 0 / .72) = container-low |
| univ-l3 | 6 | `0 1px 3px 0, 0 4px 8px 3px` = level3 | 0.94 = container |
| univ-dp (8) | 8 | `0 2px 3px 0, 0 6px 10px 4px` = **level4** | 0.92 = container-high |
| univ-concave | −1 | `inset 1px 1px 0 0 rgba(0,0,0,.12)` = the level-1 duet | 1.0 = concave |

  "8dp IS level4" is stamped (`elevationLevelKeyOf`: `lane < 12 → level4`) AND painted;
  the default "level2 (3dp, M3's menu rung)" + "surface-container-low rung" pair holds
  (jx-pure.css :2406-2409). The WAAPI rest pose verified on the same opens: veil
  `oklch(1 0 0 / 0.32)`, `--jx-p 1`, `.jx-rest` set. (Probe fault owned: my first F
  pass read box-shadow off the `[data-jx-pop-shadow]` VEIL div — none — because the M3
  recipe rides `[data-jx-pop-body]`'s `box-shadow: var(--jx-elevation-shadow)` while
  the veil is the translated alpha layer; the recipe carrier is the body, jixoai.css
  :955-963.)

**Variant painting**: `solid` → body backdrop-filter `none`; `auto`(acrylic) →
`blur(14px) saturate(1) brightness(2)`; `data-variant` stamps the panel both ways.

**API "Ten props plus the bind:this imperative handle"**: the rendered table is exactly
`id*, triggerLabel, placement, variant, tryFallbacks, gap, trigger, panelClass,
onToggle, children*` + `bind:this`, then the 8 ambient axis rows (the fold convention).
Verdict: 10 ✓.

**TokenTable rows**: scroll ring computed `padding 12px 14px / inline 14px / 72vh /
stable both-edges` (`--jx-pop-pad / -inline`, `--jx-scrollbar-thin` lane, stylex scroll
atom); `--jx-pop-gap: 0px` inline at rest on all seats; the four `--jx-surface-*`
vectors present inline.

## Findings

1. **[MAJOR] Duplicate id `density-pop` ×4 — the theming seat is broken on 3 of 4 rungs
   and violates LAW #19.** DensityDemo clones the seat into its four rung scopes, so the
   served DOM carries FOUR `<div id="density-pop">` panels + four wrappers all declaring
   `--jx-pop-density-pop` (id census: 1 duplicate pair, `density-pop` ×4; every other id
   clean; zero dangling hashes). Native resolution takes the FIRST instance: clicking
   rung-2's trigger opened **rung 1's** panel (`openIdx 0`, panel anchored 372.8px from
   the clicked trigger), the clicked trigger's `aria-expanded` stayed **false** while
   rung-1's flipped **true** — a wrong panel, wrong anchoring, and a lying aria state on
   the xs/sm/lg seats. The component is innocent (distinct ids everywhere else; the
   anchor-name sanitizer is per-id); the page must give the DensityDemo seat a per-rung
   id (or DensityDemo must clone with id-rewriting).
2. **[MAJOR] The zero-script headline identity is false — four seats, and the page's own
   a11y table contradicts the hero.** Hero summary: "The component ships no JavaScript at
   all — open this page's view source and check." Pill: "0 lines of JS." Base bullet:
   "zero-script component — markup and styles only, no state, no effects." Meta
   description: "in a zero-script component." The served component carries ~170 lines of
   script: `open = $state`, the toggle seam (`onPanelToggle` — which the SAME page's
   a11y table correctly credits: aria-expanded "mirrored live from :popover-open by the
   toggle seam"), the WAAPI surface-motion kernel, defaults resolution, the imperative
   handle. The component's own header (2026-08-20 seam fix) scopes the zero claim to
   "the default trigger path runs zero listeners and zero positioning script" — the
   page still teaches the unsscoped v1 story, and the page INVITES the check that fails
   (view-source and the same-source drawer both show the script). Reword the hero/pill/
   bullet/meta to the scoped truth (declarative open/close, zero positioning script,
   one toggle seam for aria).
3. **[MINOR] The strategy panel teaches shipped machinery as future.** Base section:
   "placement v1 — authored centering: inset-area: center with an inset + margin
   fallback" and "extension: anchored placement … a future `placement` prop." Anchoring
   shipped 2026-08-21 (component header, Owner ruling) and `placement` is a live prop
   demoed two sections up (the canvas playground + "placement — nine positions" +
   theming). Meta tail "Anchored placement is the named extension direction" is the same
   staleness. (The `popover="manual"` future bullet is fine — still unshipped, :398
   hardcodes `popover="auto"`.)
4. **[MINOR] ToC order ≠ DOM order.** Authored (+page.ts): popover-menu, popover-card,
   popover-base, types, **usage**, accessibility, theming, universal-props, api. Served
   DOM: **usage FIRST** (the demo-standard skeleton's "Install then Usage sit ABOVE the
   demos — the page law", page comment :292-294), then menu/card/base/types, then the
   trio. All 9 resolve, zero dangling — presence is clean, the ORDER is stale. The rail
   should follow the skeleton law the page itself cites.
5. **[MINOR] The theming summary's density claim does not reproduce — the seat is
   density-flat.** "The trigger rhythm follows the scope": trigger measured height 43px,
   voice 14px, pad 10px/10px, `--jx-unit` 0.25rem — IDENTICAL across all four rungs
   (xs/sm/default/lg). The wrapper's `--jx-hit` correctly re-derives (28/32/40/48
   arithmetic visible in computed max()), but nothing in the seat consumes it; panel pad
   is the constant `12px 14px`; the panels carry no `data-density` stamp
   (`densityRungOf` resolves no lane). The half "the panel pad rides --jx-pop-pad
   tokens" is token-true but equally constant. The terminal-footer MINOR-1 class: one
   honest rewording (or a seat that actually varies) fixes it.
6. **[MINOR] Page-scoped svelte-check is red — 1 ERROR + 1 WARN on +page.svelte.**
   :245:28 ERROR — the cx overload (`Object.entries(style)` rejects `{…} | undefined`;
   `filter(Boolean)` doesn't narrow — transfer.html's type-predicate precedent is the
   fix); :229:57 WARN — `state_referenced_locally` on `canvasUsageLive` captured into
   `canvasFiles` (benign by design: `resolveCanvasUsage` swaps the live usage at render,
   but nothing on the page says so). The gate-to-0 fails on the page itself; both fixes
   are mechanical. Fleet debt elsewhere (1549/1028) untouched and not charged here.
7. **[LOW] "Focus loss closes" does not reproduce on the served engine.** Base bullet:
   "light dismiss: outside click or focus loss closes." Measured on current Chrome: Tab
   OUT of the open panel (7 presses, +700ms settle) leaves it OPEN (focus gone, panel
   up); outside click and Escape close. Chromium doesn't implement focus-loss light
   dismiss (known interop gap; APG doesn't require Tab-out close). Platform-attributed
   claim, so the fix is a reword, not behavior.
8. **[LOW] The playground's self-reopen claim doesn't reproduce.** PlayHelp: "a live
   panel reopens itself on toggle." Master-toggling WHILE open: panel measured closed at
   every poll (80/250/600/1400ms), zero console/page errors — the rAF `showPopover()`
   silently no-ops during the hide window (source :187-194). The toggle's placement
   change applies from the NEXT open; the help sentence overstates the live behavior
   (the r27 note's own "judged by :popover-open" guard passes, the reopen still loses).
9. **[NIT] The nine @position-try candidates are runtime-only.** Raw SSR ships zero
   `@position-try` rules (processors strip them — the page's own comment explains the
   onMount injection); so a no-JS/first-paint visitor of the CANVAS seat references
   idents that don't exist yet and can't try-flip. The eight static seats ride
   popover.css's always-shipped `flip-block, flip-inline` series and are unaffected.
   Playground-scoped nuance; recorded so nobody "fixes" it back into the pipeline.

## Battery

- **SSR duality + warm-reload**: two raw fetches, `<style data-sveltekit>` stripped —
  byte-stable; the wiring ships in SSR (`popover="auto"` ×8 panels, `position-anchor`
  inline, `aria-expanded="false"`, `popovertarget` pairs), `inset-area`+`position-area`
  both present (legacy alias), try-grid absent (NIT 9).
- **LAW #18**: one `{#each}` on the page (`TRY_CELLS`, keyed `cell.id`, 9 unique cells
  measured); none in the family. **LAW #19**: one duplicate cluster = Finding 1.
- **Zero-reader greps ×0** over ui/popover + the page route (getComputedStyle /
  matchMedia / offsetWidth / clientWidth) — the "measured live against the anchor"
  direction vectors live in the declared surface-motion kernel seam, not the family.
  Vocabulary-effective greps (`--jx-{size,shape,radius,density,motion}-effective` as
  family-side READS) ×0.
- **Sibling differential**: hue-popover (site header) imports the registry component
  verbatim (source :15); FAB menu + combobox run the same position-anchor machinery
  (T86 receipts) — same-mechanism-different-wording bank, no new deltas.

## Gates

| Gate | Result |
|---|---|
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| docs-ambient-vocabulary solo (apps/www, `test/` spec) | GREEN — 284/284, exit 0 (known vite-teardown nuisance note) |
| svelte-check page-scoped | **RED — 1 ERROR (:245) + 1 WARN (:229) on popover.html/+page.svelte** (Finding 6); fleet debt elsewhere pre-existing, untouched |
| verify:docs (dist @ 4c054233) | RED — **sole seat = toast** ("Examples renders before Usage", the recorded red); popover absent from the failure list |
| Mirror law | no family edits — no mirror check charged |

## Process evidence

- Port **5244**: listener 10003 (wrapper 9971) started before the probe session; after
  gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY after**; no orphan
  probe browsers (system-Chrome launches, all closed).
- NO commits, NO pushes. The injected dialog probe was removed in-probe; try-grid state
  restored via master switch; no DOM mutations outlived a probe.
- Probe faults owned, all fixed pre-verdict: (1) first F pass read box-shadow off the
  veil div instead of the body — the recipe carrier is the body; (2) the E try-grid pass
  misread the master switch ("all ⇄ none", not a cell toggle) and called the
  bottom-end result a failure — re-derived from toggleTry and re-run correctly; (3) the
  dirty-A open fired mid-reveal and locked a try fallback — probe-induced, clean opens
  after scroll+settle measure 0/0; (4) locator quoting self-inflicted by shell one-
  liners — moved the repair to Edit-tool semantics (the standing perl/quoting rule).
- Artifacts: /tmp/marginalia-93-probe{1..4}.mjs, -probe2.log, -ambient.log, -docs.log,
  -sc-full.txt, -wrapper.txt, -listener.txt.
