# 34 — CODE boot-splash (tier 2 优化重构)

Date: 2026-09-23 · marginalia · port 5244 · NO commits
Files (mine, uncommitted):
- `apps/www/src/routes/docs/components/boot-splash.html/+page.svelte` (rewritten, 327 → ~520 lines)
- `apps/www/src/routes/docs/components/boot-splash.html/+page.ts` (toc 7 → 9, order==DOM)

NOT mine (untouched): the family (`src/lib/ui/boot-splash/*`), scribe's input-otp review,
vellum's menubar files, quill's kbd review.

---

## Tier decision: tier 2 优化重构 (optimization refactor of a content-rich skeleton)

Gap analysis of the pre-rewrite page (the 2026-09-19 FOUC-round page, 327 lines):

- What it HAD (the tier-1 floor was already cleared): hero + DocsInstall + Usage + a live
  workbench canvas + the zero-css law section + slots + exits + a11y + api (11 correct hand
  rows) + DocsSeeAlso. Content was strong.
- What it LACKED (why not tier 1): no Overview section; no measured axes layer (the eight-axis
  story lived in a single "Universal props" canvas with no per-axis receipts); no theming
  receipts (a bare "None — by law" table); no id anchors on install/see-also; toc (7 entries)
  diverged from DOM order; the archetype order (api → axes → accessibility) was violated
  (a11y/theming/universal sat BEFORE api).
- The defect that forces more than shuffling (why not pure tier 1): **the workbench replay was
  DEAD** — the canvas rendered no `<BootSplash>` instance at all, and the shown wire was
  one-way `open={splashOpen}`. Clicking "replay the splash" flipped the state chip to
  `open: true` with zero layer elements mounting (probed pre-rewrite: chip true, layer count 0).
- Why not tier 3: the family files are sound and fully measured (my probes 1–8 banked the
  family receipts); the page's bones (workbench/law/slots/exits/api rows) survive into the
  rewrite. No family surgery needed.

## The rewrite

1. **Archetype order, toc == DOM**: hero → install (`id="install"`) → overview (NEW) → usage →
   workbench → zero-css → slots → exits → api → axes (NEW, replaces theming + universal-props,
   both folded in) → accessibility → see-also (`id="see-also"`). Served toc anchor order:
   overview, usage, boot-splash-workbench, zero-css, slots, exits, api, axes, accessibility —
   exactly the 9 toc entries; chrome (install/see-also) out.
2. **Workbench fixed**: a rendered `<BootSplash bind:open={splashOpen} {exit} {revealOn} …>`
   instance (rendered unconditionally — the component renders nothing while closed, so the
   leaving phase survives the manual dismiss). The drawer code shows `bind:open`. Verified
   end-to-end (probe 1): click → mount (150ms) → cover (light grounds, pointer-events none,
   `--jx-boot-splash-duration: 350ms`, role=status, aria-label your-app, no exit class) →
   unmount at 797ms ≈ 350ms floor + 350ms blur exit + animationend latency → **the output chip
   reads `open false`** (bind-back proven — the dead-replay defect is dead).
3. **Overview (NEW)**: the FOUC problem (~20 render-blocking links; the dev lane's css rides a
   JS fetcher), the zero-css answer, the dismissal economy (revealOn/timeoutMs/minMs/durationMs),
   pointer-events-none, and the axes preview.
4. **Axes section (NEW)**: the measured per-axis table (8 rows, below), the live axes canvas,
   and the TokenTable (theming folded in: `--jx-boot-splash-duration` component-owned; grounds/
   mark/text-tiers structural; kernel channels unread).
5. **API**: 11 rows kept; summary gains the meta arithmetic (21 meta props − 8 axes = 13 family
   seats = 11 served + rest/style by convention); the `open` row now names the dead-replay trap
   ("BIND it — a one-way open={state} wire is the dead-replay trap").
6. **+/page.ts**: 9 entries, order==DOM (above).

## Measurements (probe9b, /tmp/marginalia-34-probe9.mjs, exit=0; Chrome headless, 1440×1000)

| # | Probe | Receipt |
|---|---|---|
| 1 | workbench fonts replay | mount 150ms; cover→gone **797ms** (350 floor + 350 blur-out + animationend latency); covering state: bg oklch(1 0 0), ink oklch(0.2 0 0), pointer-events none, duration var 350ms, role=status, aria-label your-app; chip bind-back `open false` |
| 2 | workbench manual | holds at 1200ms (past the floor); dismiss→gone **454ms** (the exit vocabulary rides the manual flip) |
| 3 | size echo | style attr verbatim: `--jx-boot-splash-duration: 350ms; --jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`; layer fs **18px**; title **16px** (1rem, root 16 — the rem tier holds); desc **12px** (0.75rem) |
| 4 | theme, controlled pair | prop alone (theme="dark", no host class): bg **oklch(1 0 0)** / ink **oklch(0.2 0 0)** — the prop's class:dark lands on the layer (ownDarkClass true) and NO rule hears it; host bridge (ancestor `.dark`, no prop): bg **oklch(0.145 0 0)** / ink **oklch(0.9551 0 0)**. LAW #16 named: the grounds answer the HOST's vocabulary; a pre-paint head block cannot hear props |
| 5 | reduced motion (fonts path) | replay→gone **531ms** ≈ floor + instant finish() — the exit is skipped (animated path: 797ms); the ~27ms instant unmount (family probe, v1) is the manual+reduced path |
| 6 | exit=none | replay→gone **430ms** ≈ floor only, no leaving phase |

Page-side probe bug worth ledgering: `el.closest('.dark')` matches the ELEMENT ITSELF — the
theme prop's own `dark` class made the prop-alone instance report `underAncestorDark: true`
until the check moved to the parent chain. Same family as the positional-anchor law: attribute
probes must name which element in the chain they mean.

## Structure receipt (SSR bytes, post-rewrite)

h1 ×1; section ids in DOM order install → overview → usage → boot-splash-workbench → zero-css
→ slots → exits → api → axes → accessibility → see-also; served toc anchors exactly the 9
entries (chrome out); `data-doc-install` 1, `data-doc-see-also` 1,
`data-jx-props-table-universal` 1, `data-doc-props-table` 4; head style block + noscript +
SMIL `animateTransform` served (the zero-css law at byte level); zero literal
undefined/null text nodes.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt bound verbatim: `files=2 identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6} forms=42` (exit 0).
- `verify:docs` — ✓ exit 0, "all docs pages pass the skeleton lint (staged scope green)";
  boot-splash not flagged (it is out of the staged scope file, but the rewrite keeps the staged
  six-section contract anyway).
- `verify:docs-universal` — ✓ GREEN **110/110**.
- ambient solo (`vitest run test/docs-ambient-vocabulary.spec.ts`) — ✓ **284/284**, exit 0
  (the trailing "close timed out" is the known post-success hang); boot-splash appears only in
  the carriers set at :355 — **zero matrix keys, no re-pin needed**.
- svelte-check (full-tree run, boot-splash filter): my `+page.svelte`/`+page.ts` contribute
  **ZERO diagnostics**. The family file carries 8 pre-existing `state_referenced_locally`
  WARNINGS at :151 (the `provideUniversalLanes({...})` call — the fleet-wide pattern, not an
  error) + 1 warning in `src/lib/blueprints/scenes/boot-splash.svelte:22`. Fleet total moved
  1592 → 1593 errors between my two runs with no boot-splash delta — sibling churn.

## Environment discipline

- Port 5244: server + `npm run dev` wrapper killed by PID (5608/5578, `kill` then `kill -9`
  sweep); `lsof` empty before authoring and `port after: []` after.
- NO commits, NO push. No matrix fixture change (write-then-verify not triggered — no table
  moved keyed rows; boot-splash has none).
