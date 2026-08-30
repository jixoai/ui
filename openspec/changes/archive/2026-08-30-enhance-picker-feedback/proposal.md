# Proposal: enhance-picker-feedback — picker reach and the async-feedback era

## Why

Research (2026-08-30) puts presets/range/datetime at the top of the
date-picker market baseline (reui ships them as separate registry
items; antd ships both panel and trigger forms). The 2026-08-30
walkthrough correction: jixoai's date-picker ALREADY ships single +
range + min/max + required + locale display — the genuine gaps are
presets, datetime composing, and disabled-date rules. On the feedback
side, the market's most-copied patterns are the async two-step
action (loading → success) and the promise toast — jixoai has the
pieces (spin, toast, press-button) but no wired idiom.

## What Changes

- **date-picker presets**: `presets` slot/prop renders a quick-pick
  lane in the panel (today / last 7 / last 30 as demo content — the
  list is consumer-authored, the lane is the component's); picking a
  preset commits exactly like a grid pick.
- **date-picker datetime** (`showTime`, v1 SINGLE-mode only — range +
  time is explicitly rejected in v1): a parse/format contract defines
  the value state — accepted input is `YYYY-MM-DD` (date-only
  behavior unchanged when `showTime=false`) or
  `YYYY-MM-DDTHH:mm` (local wall-clock, no zone conversion; canonical
  stored value, localized display per `Intl`); the calendar grid
  consumes the DATE part, the TimeStepper row mutates only the TIME
  part, and picking a different day PRESERVES the time (and changing
  time preserves the day). Prebound datetime values select their day
  and restore their time.
- **date-picker disabled dates**: `isDisabled(date)` predicate —
  disabled cells keep the outside-day law (visible, not-allowed,
  uncommittable) and are skipped by the arrow walk.
- **press-button async idiom**: `loading` prop with a defined ANCHOR
  CONTRACT — loading sets `aria-disabled="true"` (element stays
  focusable, opaque to why), suppresses pointer AND keyboard
  activation (Enter/Space no-op while loading), keeps tab order, and
  the spinner glyph takes the leading-slot lane; for `href` anchors,
  loading also blocks navigation. Success flash = one-shot
  `data-state="success"` check (1.2s), then rest.
- **toast promise idiom**: `store.api.promise(p, { pending, success,
  error })` — pushes on settle; the demo wires a fake fetch.
- Demos: date-picker presets/datetime/disabled demos; async button
  demo; promise-toast demo; skeleton composition demo (card/list/
  table skeletons) — feedback family to the docs-demo-standard
  skeleton.

## Layering

- `registry/files/ui/date-picker/**`, `registry/files/ui/press-button/**`
  (+ its effect/press css), `registry/files/ui/toast/toast-store.ts`
  (the promise helper is store-side, framework-free).
- Mirrors re-record; docs pages: date-picker, press-button, toast,
  skeleton.

## Risks

- press-button `loading` touches THE most-consumed component — the
  press law (hover grows shadow only; active presses +1px) must hold
  in the loading pose; `verify:press` extended with the loading pose.
- datetime value format must NOT leak into the single-mode ISO
  contract (documented format switch per `showTime`).
