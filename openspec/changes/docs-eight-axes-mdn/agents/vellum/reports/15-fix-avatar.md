# TASK 15 — FIX avatar (vellum, 2026-09-22; consolidated ledger: scribe PASS + marginalia NEEDS-WORK)

Docs-only fix on my avatar page (family untouched per the task law;
drift ledger #7 already carries the family-level clip entry). Every
number in marginalia's overturn was independently re-measured BEFORE
rewording — all reproduced exactly.

## Per-finding fixes

### 1. MAJOR (marginalia) — the initials voice is NOT fixed at every size
My pre-fix re-measurement (signature-gated per LAW #15; the initials
block IS the root — `data-jx-avatar-fallback` sits on the same span, no
child):
- ambient (no explicit lane): initials **12px** — the one true fixed
  case (the class token --jx-text-label-lg wins; no echo on the root)
- small/sm → **14px**, medium/md → **16px**, large/lg → **18px** (the
  §11 echo `--jx-size-effective: …; font-size: var(--jx-size-effective,
  1rem)` lands inline and beats the class token)
- number lane: **48px initials at size={48}** (28 at {28}); the 48
  CLIPS: scrollWidth **52** > clientWidth **46**; 28 clips mildly
  (30/26)
- mechanism verbatim on the root style attr: `--jx-size-effective:
  48px; font-size: var(--jx-size-effective, 1rem); --jx-avatar-md:
  48px`

Fixes applied (+ verified in SSR, HTTP 200):
- **size row reworded** to the measured truth: the initials voice
  FOLLOWS the size — fixed 12px label step at ambient only; the §11
  echo beats the class token at explicit lanes (14/16/18 measured; box
  edge verbatim on the number lane); the 48 clip named with its numbers
  and cited to drift ledger #7 (family-level; guidance: tooltip +
  larger box or halve the name yourself — do not fight the cascade).
- **density row reworded**: "the fixed --jx-text-label-lg step" now
  carries "AT AMBIENT ONLY — an explicit size lane replaces it through
  the §11 echo, see the size row".
- **number-lane panel caption** (the axes canvas): names the
  follow-the-edge behavior AND the clip (52/46, ledger #7).
- **hero summary**: "so it never overflows" → "so the badge never
  wraps" (the sm-halving truth; the overflow claim is gone from the
  page — remaining "never overflows" hit in SSR is site chrome, not
  this page).

### 2. MINOR (marginalia) — deviations paragraph contradiction
Rewrote the paragraph: the six supply-only lanes keep their
no-consumption claim (carriers have no descendant reader); size now
reads in TWO named places — the §13 adoption through the family prop
(the box vars the atoms read) and the §11 echo (the root's own
inline font-size) — while the carrier var --jx-size-effective itself
still has no descendant css reader. Ledger #7 referenced. The old
text's self-contradiction ("supply-only three" including size, one
paragraph after CONSUMED) is gone.

### 3. Scribe's PASS items — nothing owed (component-code pre-existing, drift #6).

## Collateral
- `test/canvas-same-source.spec.ts`: the avatar axes snapshot re-pinned
  (the number-lane caption is extracted canvas children) — diff is
  exactly the new caption sentence; full spec **75/75**.
- `+page.svelte` cx helper: applied the fleet type-predicate fix (the
  page's only svelte-check error, same debt class as the task-12/13/14
  pages) — avatar page now has **ZERO** svelte-check diagnostics; fleet
  1623 → **1622 errors**.

## Gates (all on the fixed tree)
- canvas-same-source solo: **75/75 PASS**
- svelte-check (fleet 2486 files): avatar page ZERO diagnostics; fleet
  **1622 errors / 1030 warnings**
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110 component pages render
  the shared universal section (110 markers)`
- verify:docs exit 0 — `✓ all docs pages pass the skeleton lint
  (staged scope green)`
- Ambient spec not re-run (284 baseline green at tasks 13/14; page-prose
  only changes here — no fixture, no carrier, no meta change).

## Process evidence
- Port 5242: lsof EMPTY before (rc=1); server wrapper 55434 → vite
  55465; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
  (The sibling's 5244 server from task 14 was already gone; the
  in-flight image.html sibling files in git status were never touched.)
- NO commits, NO push. My diff: avatar +page.svelte +
  canvas-same-source.spec.ts (snapshot re-pin) only.
- Probe: /tmp/vellum-15-avatar-probe.mjs + the DOM-structure dump and
  per-lane measurement scripts (inline); SSR snapshots
  /tmp/vellum-15-avatar-ssr{,2}.html; logs /tmp/vellum-15-avatar-*.log.
