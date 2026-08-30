# Verification: enhance-picker-feedback

## Baseline (2026-08-30)

- date-picker: single/range/min-max/required/locale live; no presets,
  no time, no disabled predicate. press-button: no loading pose.
  toast: manual push only.

## Gate evidence

1. `npm run verify:all` green (incl. verify:press loading-pose
   extension; mirrors re-recorded).
2. Browser probes (dev, real browser):
   - presets lane commits + closes; keyboard reachable.
   - datetime: canonical `YYYY-MM-DDTHH:mm` commit, localized display;
     invalid input handled per contract; prebound datetime restores
     day AND time; day-pick preserves time; time change preserves day;
     range+time rejected at authoring (type error);
     `showTime={false}` regression identical to today's output.
   - disabled weekend: click no-op + not-allowed paint; arrow walk
     skips; range anchor refuses a disabled start.
   - async button: loading lock → success flash → reset.
   - promise toast: success and rejection paths push correct toasts.
3. Docs pages (date-picker, press-button, toast, skeleton) reach the
   docs-demo-standard skeleton; add-commands unchanged and resolvable.
