# Report 19 — avatar, RE-VERIFY (vellum's consolidated fix)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/avatar.html/` · coder vellum
(integrated 2c185457 "consolidated fix both findings" + a53703e2 "axes
snapshot re-pin"; diff vs my task-16 base e2412594 = 1 page file, +15/−8)
· reviewer: marginalia (authored the overturning 2nd review) · law: LAW
#14, §11 carrier echo, PROBE-READINESS. Every fix re-verified against the
SERVED tree on :5244; the task-16 verified-TRUEs re-run as regressions
with my own probes (the task-16 numbers are the benchmark).

## Verdict: PASS

All findings fixed as prescribed — the reworded rows state my measured
numbers exactly — the deviations paragraph now splits carrier-vs-adoption
truthfully, the overflow claims are zeroed, the page is svelte-check zero,
and every task-16 verified-TRUE reproduces. **avatar CLOSES as page #14.**

## Per-finding verdict table

| # | Finding | Fix claim | Verdict | Receipt |
|---|---|---|---|---|
| 1 | MAJOR — initials voice | size row reworded to follow-the-size; echo mechanism; clip numbers → ledger #7; density row "AT AMBIENT ONLY"; caption; overflow ×0 | **FIXED** | Served rows + live probes below; benchmark match on every number. |
| 2 | MINOR — deviations paragraph | six supply-only keep no-consumption; size reads in TWO named places; carrier var no descendant css reader; ledger #7 | **FIXED** | Served: "their CARRIERS have no descendant reader in the tree, and the leaf stamps them for consumer compositions alone. Size is the exception and reads in TWO places: the §13 adoption consumes the lane through the family prop (the box vars the atoms read), and the §11 echo stamps the root's own font-size inline — the carrier var itself (--jx-size-effective) has no descendant css reader." + "The number-lane initials clip is drift ledger #7". The six-lane no-consumption opening kept. Old garble ("size · elevation · motion are the supply-only three") **×0**. |
| — | Collateral — cx predicate | avatar page ZERO diagnostics (fleet 1623→1622) | **FIXED** | Page-scoped svelte-check (`npx svelte-check --workspace apps/www --output machine`, repo root): **0 diagnostics for avatar.html** (the typed `.filter((style): style is … => Boolean(style))` predicate landed, visible in the diff). The family file avatar.svelte keeps exactly its two PRE-EXISTING errors (:249 onerror handler signature, :191 Object.entries narrowing — scribe's task-14 findings, family-code, out of page scope, unchanged lines). Fleet total in my run = 1623 ERRORs — the shared tree moves this number with sibling in-flight work; the load-bearing page-scoped zero holds. |

### Finding 1 detail — every reworded number reproduces (live, current tree)

| claim in the reworded row | my task-16 benchmark | re-probe now |
|---|---|---|
| ambient = the one fixed case, 12px | 12px | fallback section: AL/GA/张伟 all **12px** ✓; axes ambient pair **12px** ✓ |
| small/sm 14px | 14px | **14px** ✓ |
| medium/md 16px | 16px | **16px** ✓ |
| large/lg 18px | 18px | **18px** ✓ |
| number lane = box edge verbatim | 48px / 28px | **48px / 28px** ✓ |
| 48 clip: scrollWidth 52 > clientWidth 46 | 52/46 | **52/46 CLIPPED** ✓ |
| 28 clips mildly 30/26 | (new) | **30/26 CLIPPED** ✓ |

Mechanism text served: "an explicit lane stamps the §11 echo (font-size:
var(--jx-size-effective, 1rem)) INLINE on the root, and inline beats the
class token" ✓ (the exact mechanism, defaults.svelte.ts:570-576 via
avatar.svelte:145). Density row now: "the fixed --jx-text-label-lg step AT
AMBIENT ONLY — an explicit size lane replaces it through the §11 echo, see
the size row" ✓. Number-lane caption served: "the initials follow the edge
too (the §11 inline echo beats the fixed label step), and 48 clips its two
letters (scrollWidth 52 > clientWidth 46 — drift ledger #7)" ✓ (also in
the axes canvas usage file — the a53703e2 snapshot re-pin; canvas solo
green). Overflow claims: "never overflows" ×0 in page prose (the one hit
in the served page is a routes-shell CSS comment, "Media never overflows
its lane" — not this page); hero now "so the badge never wraps"; head meta
rewritten ("halved initials at icon size, and the full name on a tooltip
by default"). "do not scale the block in app code" guidance included.

## Regression sweep (task-16 verified-TRUEs — all hold, same numbers)

- **Box ladder 24/32/40** (named + legacy, six roots) ✓.
- **Number lane 48/28** box edge verbatim ✓.
- **Bevel 6/8/10** at the 8px baseline; rounded/squircle **50%** ×3 ✓.
- **Theme four-voices-frozen**: ambient vs dark pair byte-identical
  (border oklch(0 0 0), bg oklch(0.9551 0 0), ink oklch(0.3211 0 0)) ✓.
- **EXTRA 17−8=9**: served family table 10 rows incl header = **9** ✓.
- **query 48↔40**: 1280px → 48, 900px → 40, back → 48 (two-generic
  caption-anchored locator) ✓.
- Sm halving ("A"/"张") ✓ unchanged.

## Gates (re-run this re-verify)

| gate | result | tail |
|---|---|---|
| canvas-same-source solo | exit 0 | **75/75 passed** — the axes snapshot re-pin (a53703e2) carries the new caption, inline snapshot green |
| page-scoped svelte-check | PASS at page scope | `npx svelte-check --workspace apps/www --output machine` → **0 avatar.html diagnostics**; family file = the 2 documented pre-existing errors only |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red` |
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-19-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Fix diffs read directly: `git diff e2412594..2c185457` (page) +
  a53703e2 (snapshot re-pin).
- Probes: /tmp/marginalia-19-probe.mjs (axes roots incl clip fractions,
  theme pair, fallback ambient, silhouettes, query flip). SSR:
  /tmp/marginalia-19-ssr.html (1,088,528 bytes). Gates:
  /tmp/marginalia-19-{canvas,scheck,univ,twl}.log.
- Byte-encoding note: "52 > 46" serves with a RAW `>` (the asymmetric
  entity encoding, task-12 lesson) — the `&gt;` form greps 0.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
