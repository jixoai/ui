# Verification — input native-controls

## Gates (2026-08-29)

| gate | result |
|---|---|
| date-picker-fragments.spec.ts (new) | 21/21 — ISO week math edges (2027-01-01→2026-W53, 2026-W01→2025-12-29, 2025-W53→undefined), TimeStepper wrap/hold/typing, MonthGrid nav/disabled |
| input-picker-bridge.spec.ts (rewritten) | 22/22 — nativeControls rename, number stepper (empty→2 steps→"2", clamp/snap, disabled gate), week ISO commit + tint anchor, month commit, time live commit, datetime day-pick keeps panel + preserves time part, picker-snippet priority |
| number-stepper + picker regression suite | 30/30 (pre-existing suite unchanged-green) |
| apps/www vitest (full) | 752/752 |
| verify:laws / verify:mirror / verify:standards / verify:icons | GREEN — mirrors byte-identical (93 items, 310 pairs), css-laws untouched by design |
| `shadcn build` payload freshness | GREEN — public/r regenerated (gitignored payloads, freshness test green) |
| verify:shadcn-add | ALL GREEN — consumer install pulls the two new date-picker fragments via the item files list |
| verify:all | GREEN (full chain) |

## Dev-server walkthrough (Chrome, 2026-08-29)

Every new interaction exercised on `/docs/components/input.html`:

- **number stepper**: empty field, two plus-taps → `"2"`; −/＋ buttons flank
  the lane, spin pseudos gone under `.jx-number-shell`
- **week**: panel opens Calendar, day-pick commits `2026-W34`, the picked
  week carries the range tint (anchor = mondayOfIsoWeek, end = +6d)
- **month**: MonthGrid panel, year nav + 4×3 lattice, pick → `2026-08`
- **time**: standalone TimeStepper panel, 2 hour-steps → `02:00`
  (wrap 23→0), minute group independent
- **datetime-local**: panel stays OPEN after day-pick (the original
  complaint — time was unreachable), minute-step then commits
  `2026-08-20T00:01` — date part + time part composed, not clobbered

Visual sanity confirmed on screenshots: week panel (Calendar, tinted
week), datetime panel (Calendar + `− 00 + : − 01 +` row, day-20 anchor
paint, today ring, no overlap/clipping), number shell (−/＋ icons,
value centered).

## Layering invariants held

- Tier-1 bare markup untouched — platform steppers/panels remain on
  zero-JS markup (D3); all custom controls live in the registry
  component layer only (jx-pure.html prose now pins this)
- `native-controls` is a bare boolean attribute (presence = platform
  controls), same philosophy as the old `native-picker`, no compat
  alias shipped
- css-laws untouched (no new law files; picker fragments reuse the
  `jx-date-nav-btn` sheet classes — zero new CSS debt outside
  input.css's component layer)
- Firefox note documented: week/month degrade to text there, so the
  custom panel is the only control available in that engine
