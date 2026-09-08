# Proposal: input / color-shell stacking isolation (the deferred class-(a) tails)

The stacking-isolation round (2026-09-09) swept seven owners and
DEFERRED exactly four z-ladder points into Part A territory (archive
design.md "The sweep" table's closing note): the input
picker-overlay / floating-label shells and the `.jx-color-shell`
swatch/pipette pair. This change clears them under the isolation
clause — no law amendment, pure compliance.

## The four sites (each + the www mirror)

1. `registry/files/ui/input/input.css` — `button.jx-picker-overlay`
   (z1 absolute, the UA-activation surrogate over the lane): its
   ladder parent is the control shell; the shell isolates when it
   carries an overlay (`:has(.jx-picker-overlay)` — the file's own
   :has idiom).
2. same file — `.jx-floating-label` (z1 absolute bracket): the
   `.jx-html-control-shell.jx-floating` host (already the positioned
   root) gains `isolation: isolate`.
3. `registry/files/theme/jx-pure.css` `.jx-color-shell` — the shell
   carries `container-type: size`, which the clause measured as NOT
   establishing a stacking context ("container-type does NOT
   establish a stacking context — a @container-carrying host still
   leaks"); the shell's whole internal ladder (swatch z1 relative,
   pipette ::after z2, the picker overlay when custom) roots with ONE
   `isolation: isolate` on the shell rule.
4. `packages/css-laws/src/icon-vocab.ts` `paletteMaskRules()` — the
   generated pipette rule's z2 gains the ladder annotation in the TS
   source (the slot is GENERATED; hand edits would break verify:laws),
   then the slot regenerates through the css-laws build.

## Spec delta

jx-pure Part A gains the isolation amendment (the clause applied to
the Part A vocabulary's own ladder hosts) + a probe-able scenario.

## Verification

- `npm run verify:laws` (slot regeneration matches the TS source).
- Browser probe (the stacking-isolation probe's style): computed
  `isolation: isolate` on the three hosts across the input /
  color-picker docs demos; no visual regression on the input faces.
