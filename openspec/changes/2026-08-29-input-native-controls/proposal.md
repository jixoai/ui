# Proposal: native-controls — the Input owns every control type

## Why

The Input component's custom-control story was partial: only
date/datetime-local/color mounted embedded panels (`native-picker`
opted back out), `type="number"` kept the platform spinner, and the
datetime-local panel could not adjust TIME at all (the typed part was
regex-preserved but had no UI — Owner catch, 2026-08-29). week/month/
time had no coverage. Owner ruling: full coverage, one prop.

## What Changes

- **Rename**: `nativePicker` → `nativeControls` (bare boolean
  attribute philosophy unchanged; no compat layer). It now governs
  BOTH the number stepper suppression and the picker-popup opt-back-in.
- **type=number**: the text shell gains the `jx-number-shell` modifier
  — spin pseudos hidden (webkit display:none + Firefox
  appearance:textfield, shell-scoped) and a −/+ stepper pair rides the
  prefix/suffix slot positions (`.jx-input-prefix-icon-button` /
  `.jx-input-suffix-icon-button`, the data-jx-slot geometry +
  jx-html-clear hit-lane law). Stepper semantics ported from
  number-input: clamp/snap step precision, 300ms→100ms hold
  acceleration, disabled lockstep; native ↑/↓ keyboard stepping stays.
- **Full picker coverage** (EMBEDDED set: date, datetime-local, color,
  week, month, time):
  - datetime-local: Calendar + the new TimeStepper row (custom
    HH/MM steppers, live commits); day-pick no longer closes the panel
  - week: Calendar day-pick → ISO week commit (`YYYY-Www`), the picked
    week painted via the Calendar's range tint; value parsed back to
    its Monday for anchors
  - month: new MonthGrid fragment (year nav + 12 cells) commits
    `YYYY-MM`
  - time: the TimeStepper as a standalone panel, live commits
- **Prefix/suffix icons**: `innerInlineStart`/`innerInlineEnd` are
  ALREADY Snippet custom slots — confirmed, no upgrade needed; the
  stepper buttons reuse the same slot-lane technique.

## Layering (unchanged)

Tier-1 bare markup keeps the D3 ruling (platform stepper/popups, the
only zero-JS controls); every custom control here is component-layer.
css-laws and the theme sheets are NOT touched by this change.
