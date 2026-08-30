# Tasks: enhance-picker-feedback

File sets: date-picker / press-button / toast+skeleton are disjoint —
parallel-safe.

## 1. date-picker

- [ ] 1.1 `presets` lane (consumer-authored list, slot-driven),
      commit path identical to grid pick; keyboard reachable.
- [ ] 1.2 `showTime` (v1 SINGLE-mode only; range+time REJECTED with a
      type-level error): TimeStepper row under the grid, live commit,
      canonical `YYYY-MM-DDTHH:mm` (local wall-clock, no zone
      conversion), localized display via `Intl`. Test matrix: invalid
      datetime value handling; prebound datetime restores day AND
      time; picking a different day preserves time; changing time
      preserves day; `showTime={false}` keeps date-only behavior
      byte-identical (regression).
- [ ] 1.3 `isDisabled` predicate: cell paint (reuse outside-day
      not-allowed), arrow-walk skip, range-mode interaction rules
      (anchor can't start on a disabled day).
- [ ] 1.4 Demos: presets (today/7/30), datetime, disabled weekends;
      props table rows.

## 2. press-button

- [ ] 2.1 `loading` prop: spinner swap + hit lock; press law holds in
      the loading pose (verify:press extension).
- [ ] 2.2 success flash: `flash()` helper or `data-state` one-shot
      (check ✓ 1.2s) — pick ONE idiom, document.
- [ ] 2.3 Demo: async deploy button (loading → success → reset).

## 3. toast + skeleton

- [ ] 3.1 `store.api.promise(p, {...})` in toast-store.ts
      (framework-free), settle push, sticky on reject.
- [ ] 3.2 Demo: promise toast on a fake fetch; skeleton composition
      demo (card/list/table shells).

## Verification

- `npm run verify:all` green; verify:press covers the loading pose.
- Browser probes: preset click commits + closes; disabled weekend
  cells are uncommittable and skipped by arrows; async button runs
  loading → success; promise toast lands success and failure paths.
- Locale guard: datetime demo under `lang=zh-CN` renders localized
  display with ISO value intact.
