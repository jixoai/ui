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

#### Scenario: hovering a day previews its whole week (Owner follow-up, 2026-08-29)

- GIVEN a week panel open (`weekHover`)
- WHEN the pointer enters any day cell
- THEN all 7 days of that day's Monday-first week highlight with the
  range tint — inclusive of both ends and of out-month cells (the
  week is 7 days whatever month the cells belong to; the anchor cell
  keeps its fill); leaving the calendar drops the preview
- AND the PICKED week paints all 7 days too: the range end is the
  EXCLUSIVE next Monday (Tue–Sun tint strictly inside), Monday keeps
  the anchor fill — Sunday was bare under the old Sunday edge

### Requirement: the time stepper owns the hour format (Owner follow-up, 2026-08-29)

The TimeStepper SHALL end with one text-icon button cycling the hour
input scale 24h → AM → PM (default 24h; the glyph IS the current
mode). The mode is input-scale state only — committed values stay
24h "HH:MM" always. On 24h → AM/PM, hours > 12 drop by twelve (0 and
12 pass through untouched); on PM → 24h the hour climbs back by
twelve (`(h % 12) + 12` keeps 12 PM at noon's 12); AM → PM flips the
meridiem only. In AM/PM the hour cell steps and validates on the
1–12 ring (12 → 1). A mode crossing that changes no number commits
nothing; an empty value flips the mode without seeding one.

#### Scenario: 14:05 cycles the full ring

- GIVEN a TimeStepper at `14:05` (24h mode)
- WHEN the mode button is pressed three times (AM, PM, 24h)
- THEN the commits are `["02:05", "14:05"]` — the >12 drop, the
  meridiem flip (no number change, no commit), and the +12 climb
  that round-trips the ring

#### Scenario: noon passes every scale silently

- GIVEN a TimeStepper at `12:00`
- THEN every crossing (24h → AM → PM → 24h) commits nothing —
  12 AM, 12 PM and 12:00 share the number 12

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
