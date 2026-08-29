# component-authoring — spec delta

## ADDED Requirements

### Requirement: native-controls governs every custom control (2026-08-29)

The Input component SHALL mount its custom controls by default for
every covered type — number (−/+ stepper in the prefix/suffix slot
positions, spin pseudos hidden under `.jx-number-shell`),
date/datetime-local/week/month/time (embedded Popover-API panels),
color (Swatches editor). The bare `native-controls` boolean attribute
SHALL opt any of them back into the platform control, with no
compatibility alias for the retired `native-picker` name. The picker
snippet stays the highest-priority override.

#### Scenario: a number field opts into the platform spinner

- GIVEN `<Input type="number" native-controls />`
- THEN no stepper buttons render, no spin-pseudo hiding applies, and
  the platform spinner + ↑/↓ native stepping serve

#### Scenario: the stepper pair owns its edge zones (Owner catch, 2026-08-29)

- GIVEN `<Input type="number" />` (custom stepper mounted)
- THEN the shell's `padding-inline` drops to 0 on each side a stepper
  button occupies at the first/last child position (the END-INSET
  OWNERSHIP law, `control-shell`: a self-insetting edge child — the
  clear button's precedent — replaces that side's padding; a slim
  text slot keeps it as its inset), and the buttons carry the clear
  button's full `--jx-hit` edge-lane geometry — glyph centered on
  BOTH axes in its zone, flush with the border
- WHERE the drop rides `:has(> .jx-input-prefix-icon-button:first-child)`
  / `:has(> .jx-input-suffix-icon-button:last-child)` in input.css —
  keyed to component-owned classes, immune to whatever the snippet
  slots render (a sibling selector cannot work: the padding lives on
  the parent shell)

#### Scenario: a week field commits an ISO week

- GIVEN `<Input type="week" />` with the embedded panel open
- WHEN a day inside 2026-08-24..30 is picked
- THEN the value commits as `2026-W35` and reopening anchors that
  week's Monday with the week painted as the range tint

### Requirement: the datetime panel owns the time part

The datetime-local panel SHALL carry a custom time stepper (HH/MM,
live commits into the value's time part, keyboard ↑/↓ + hold
acceleration + direct typing) beside the Calendar; a day pick
commits the date part WITHOUT closing the panel (light dismiss and
Escape close it).

#### Scenario: adjusting time after picking a day

- GIVEN a datetime-local panel open with value `2026-08-29T00:00`
- WHEN the user picks the next day, then steps the hour cell twice
- THEN the value reads `2026-08-30T02:00` and the panel is still open
