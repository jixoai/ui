# verification — progressive-blur change

State: implemented + gated (2026-08-25). Code landed inside the
concurrent `d3819be` sweep (another session committed the shared tree
mid-flight); this record + the manifest repair are the follow-up
commits.

## Gates

| gate | result |
| --- | --- |
| apps/www vitest (26 files) | 349/349 GREEN — incl. the new navmenu click-toggle + hover-retired tests |
| gen-mirror-manifest + verify:mirror | GREEN — 87 items / 234 pairs (list-item canonicalMain override added after the concurrent sweep) |
| build:site (prerender + shadcn payloads + llms) | GREEN — public/r/progressive-blur.json emitted |
| build:blueprints | GREEN — static/blueprints/progressive-blur.svg committed |
| verify:surface | 47/47 GREEN |
| verify:press | 12/12 GREEN (preview :4173) |
| verify:trygrid | GREEN |

## Engine probes (ZCode built-in browser, Chromium, dev :5199)

- progressive-blur root: `position: sticky`, `top: 0px`, `z-index: 10`,
  height 0, `pointer-events: none`; 8 layers; layer0
  `backdrop-filter: blur(0.5px)` … layer7 `blur(64px)`; mask gradients
  present. reveal='scroll': layer opacities **0.00×8 at scrollTop 0**
  (resting rail clean) and **1.00×8 at scrollTop 823** (real wheel
  scroll).
- **Pin-line law (probed, 4-variant minimal page)**: Blink pins
  `sticky; top: 0` at the scroller's CONTENT-box top (border +
  padding-top) while scrolled content clips at the PADDING-box edge —
  a scroller's top padding leaves an un-blurred gap of exactly
  padding-top. Consequence applied: the docs rail's 1.25rem inset
  moved from the scroller (.jx-dsn) to the content (.jx-dsn-rail);
  band top now measures == scroller clip edge (delta 0).
- Component bug found & fixed by the same probes: the sticky root
  shipped WITHOUT its offset utility — `position: sticky` with
  `top: auto` is inert (root scrolled away with content). The
  edge-offset (`top-0`/`bottom-0`) is now load-bearing, documented in
  the component header.
- navigation-menu: jsdom suite covers the declarative popovertarget
  click-toggle through the platform-order polyfill (open/close/one-at-
  a-time, arrow walk, hover-retired). A real-engine click could not be
  re-driven in the built-in browser this session (its input synthesis
  wedged: clicks time out on actionability; synthetic keys perform no
  default actions — keyboard scrolling fails identically on control
  elements). The mechanism is the same declarative popovertarget the
  popover primitive and terminal-header dogfood in production.
- Visual pass: delegated to a vision subagent (screenshots of the
  docs demo cards + rail); report appended below when returned.

## Known limits

- `reveal='scroll'` degrades to NO effect on engines without scroll
  timelines (Safari < 26, older Firefox): the rail shows no blur band
  there rather than a wrongly-painted one. reveal='static' unaffected.
- The `%` height form of the Magic UI original is intentionally
  unsupported (definite lengths only) — the sticky h-0 root cannot
  resolve percentage heights.

## Visual pass (vision subagent, 2026-08-25) — PASS

Headless Chromium against the live dev server, screenshots read by a
vision analyzer and cross-checked against DOM geometry
(artifacts: /tmp/zcode-vision-review/):

- progressive-blur demo: LEFT card (top, reveal='scroll') shows NO
  blur band at rest; RIGHT card (bottom, static) shows a smooth
  progressive ramp — heavily diffused at the edge, clear upward; no
  hard rectangular cut, no band bleed, no z-fighting.
- The real docs rail: crisp title/filter at rest (layers opacity 0);
  scrolled to 300 — the top-edge progressive fade appears, strongest
  at the very edge, mid-ramp captured at opacity 0.79, confined to
  the rail bounds.
- navigation-menu: Enter on the demo trigger OPENED the panel on the
  real engine (aria-expanded true; 228×129 panel with three links on
  the dark terminal surface, thin border + hard offset shadow). The
  panel sat flush ABOVE the trigger — the primitive's position-try
  flip engaging correctly (the demo trigger row sits near the canvas
  bottom). No clipping, no overlay errors.
- Layout sanity: all three pages render clean; no error overlays.

Environment notes: the IAB browser bridge is not injected into
subagent sessions (`Browser is not available in subagent`), so the
subagent drove the repo's own playwright-core as the fallback; in that
clean instance none of the main-session IAB input quirks reproduced
(click/evaluate/scroll all behaved) — the earlier failures were the
IAB session's input synthesis, not the components. The main-session
proxy (127.0.0.1:17890) also explains the localhost 502s seen via
curl (bypass: --noproxy / [::1]).

## r2 (Owner feedback) + the Codex review loop (2026-08-25 evening)

The Owner reported the effect invisible and clarified the intended
design: a STICKY HEAD (title + filter pinned) with the list scrolling
under it through the progressive blur — r2 rebuilt the rail exactly so
(head z-10 over the band z-[5], inset inside the sticky box), and the
docs demo leads with that composition.

Codex review (herdr, gpt-5.6-terra, xhigh) — three rounds:

| round | score | blockers found | fixed in |
| --- | --- | --- | --- |
| r1 | 4.5/10 | Escape didn't close (preventDefault cancels the native close request); popover didn't ship surface-motion (clean-install chain broken); docs page flat-era paths | dab4c55 |
| r2 | 6.0/10 | progressive-blur missing @jixoai/utils (single-item install uncompilable); committed manifest carried the concurrent session's uncommitted hashes (clean-checkout gate red) | a304866 |
| r3 | **9.0/10 — accepted, zero blockers** | — (residual: 8-layer backdrop-filter cost = documented, blurLevels-configurable limit; popover immutable-id + handles-container warnings = pre-existing low-risk contracts) | — |

Round-2/r3 additions beyond the blockers: aria-controls on the mobile
expand toggle (stable id on the viewport), data-reveal→data-variant
rename (the docs entrance system's bare [data-reveal] selector was
driving a view()-timeline transform that pinned the band ~10px off the
clip edge — vision-review finding, band gap now 0), blurLevels < 2
normalization, :where() wrapping, and the verify-shadcn-add harness now
installs + compiles progressive-blur in the scratch consumer (the
regression gate for the install chain).

Vision review r2 (real Chromium + analyzer + DOM cross-checks): 10/10
after the attribute rename — head pinned byte-identically across
scrollTop 0→1417, entries diffuse progressively under it, pinned text
crisp, band within bounds, rest state clean; the reveal ramp measured
exactly linear (0 → 0.5 at 36px → 1.0 at 72px).
