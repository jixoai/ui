# component-authoring delta — async feedback and picker reach

## ADDED Requirements

### Requirement: the async action idiom

`press-button` SHALL own a `loading` pose with an explicit anchor
contract: `aria-disabled="true"` (focusable), pointer AND keyboard
activation suppressed (Enter/Space no-op), `href` navigation blocked,
tab order unchanged, spinner glyph in the leading lane — plus a
one-shot success flash idiom. `toast`'s store SHALL own
`api.promise(p, { pending, success, error })` — both framework-free,
no module side effects.

#### Scenario: a deploy button

- GIVEN the async button demo
- WHEN the promise is in flight
- THEN the button shows the spinner, ignores presses AND Enter/Space,
  and an `href` variant navigates nowhere; on settle it flashes
  success once, then returns to rest

#### Scenario: a rejected promise

- GIVEN `api.promise` with a rejecting task
- WHEN the task settles
- THEN the pushed toast is the error variant, assertive, sticky

### Requirement: date-picker presets, time, and disabled rules

- `presets` renders a quick-pick lane whose commit path is identical
  to a grid pick. The lane is the component's; the preset ENTRIES are
  the consumer's — the `{label, value}` payload array is a value-domain
  convenience only, and per-item CONTENT (rich labels) MUST ride the
  snippet escape (composition-first law).
- `showTime` (v1: single mode ONLY; range + time is rejected) defines
  the datetime state contract: canonical stored value
  `YYYY-MM-DDTHH:mm` local wall-clock (no zone conversion), localized
  display via `Intl`; the calendar mutates the date part, the
  TimeStepper mutates the time part, and each preserves the other;
  prebound datetimes restore day AND time.
- `isDisabled(date)` cells follow the outside-day law (visible,
  not-allowed) and are skipped by the keyboard walk.

#### Scenario: presets lane

- GIVEN the presets lane carries a `Last 7 days` entry
- WHEN the preset is activated
- THEN the range commits and the panel closes exactly as a grid pick

#### Scenario: a prebound datetime survives day navigation

- GIVEN `showTime` and value `2026-08-30T14:05`
- WHEN the consumer opens the panel and picks a different day
- THEN the committed value keeps `T14:05` and the panel closes
