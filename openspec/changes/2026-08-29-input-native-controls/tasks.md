# tasks — input native-controls

## A. date-picker family fragments (batch A)

- [ ] A1: `calendar-math.ts` — `isoWeekOf(iso)` + `mondayOfIsoWeek(week)`
      pure ISO-8601 week math
- [ ] A2: `date-picker/time-stepper.svelte` — HH/MM stepper groups
      (−/+/↑↓/typing, hold acceleration, live commits)
- [ ] A3: `date-picker/month-grid.svelte` — year nav + 12 month cells,
      Calendar-law keyboard/disabled semantics

## B. Input component (batch B)

- [ ] B1: `nativePicker` → `nativeControls` rename (component + tests,
      no compat layer)
- [ ] B2: `jx-number-shell` — spin hiding + the −/+ prefix/suffix
      icon-button pair with number-input-grade stepper semantics
- [ ] B3: picker coverage — week (ISO commit + week tint), month
      (MonthGrid), time (TimeStepper panel), datetime-local
      (Calendar + TimeStepper, panel stays open on day-pick)
- [ ] B4: input.css — number-shell/stepper/time-stepper styles under
      the component-css layer law
- [ ] B5: tests — picker-bridge suite rewritten for coverage; new
      stepper/week/month/time specs

## C. docs (batch C)

- [ ] C1: input.html — native-picker → native-controls everywhere;
      new samples (number stepper + opt-out, week, month, time,
      datetime time row); props table
- [ ] C2: jx-pure.html — the Tier-1/component-layer split prose

## D. integration (ZCode)

- [ ] D1: registry.json — input deps += @jixoai/icons; date-picker
      item files += time-stepper/month-grid
- [ ] D2: mirrors + manifest + shadcn build payload freshness
- [ ] D3: full gates + dev-server walkthrough of the new panels
- [ ] D4: commits per batch with task-state updates
