# Task 34 — CODE system-dialog (MDN archetype)

Verdict: **LANDED-READY (tier 2 优化重构) + ONE W-NEXT FAMILY DEFECT
RECEIPTED.** Archetype skeleton replaced the composition-era page; the
workbench, the system trio, the four parts tables (rows byte-identical at
re-pinned ordinals) and the a11y table carried; family untouched. Probe
**39/39 GREEN, stable across reruns** — including the defect-signature check.
Every gate green.

## Delivery-shape classification (the brief's ask)

system-dialog is a TWO-FACED family, and each face has its own shape:

1. **The composed family — SELF-CARRIED PORTAL, ANCHORED DIALECT.** Content
   is a popover="manual" panel; the §11 carriers stamp the PANEL (which the
   platform promotes to the top layer) — self-carried like popconfirm — but
   the dialect is ANCHORED: the Trigger publishes `anchor-name`, the panel
   resolves position-anchor/area/try, and the parts resolve their axes
   through Svelte CONTEXT, which follows the COMPONENT tree, never the
   top-layer promotion (measured: the stamps land on the promoted panel;
   context-sourced supplies still reach the parts).
2. **The imperative trio — IMPERATIVE MOUNT.** alert()/confirm()/prompt()
   mount private hosts on document.body (no declaration site at all), at
   pose="center" (the UA's popover centering owns the geometry — measured
   dead-center), resolve EXACTLY ONCE, unmount after the 500ms exit window.

This grows the taxonomy: promotion-away / self-carried portal / wrap-in-place
/ own-region-root (vellum) / **anchored-dialect self-carried (system-dialog)**
/ **imperative mount (the trio)**.

## W-NEXT DEFECT (finding #1 — the anchored rise is dead)

**The family's headline feature does not run in the live tree.**
system-dialog-content.svelte:156 builds the anchor style as a PLAIN string:

```
'position-anchor: --{api.uid}; position-area: block-end; …'
```

`{api.uid}` is not interpolated (missing `$` — the sheet's `--${anchorName}`
is the working pattern). `{}` are invalid ident characters, so the browser
drops the declaration entirely: computed position-anchor = `normal`, and the
panel stages at the TOP-LEFT CORNER (measured x=12, y=12) at fit-content
width (545px > the 384px atom cap — the width atom also reads absent on the
measured element). The css residue comment's "missing-m-auto bug class cannot
recur by construction" — it recurred as a missing-anchor by interpolation.
The trio is UNAFFECTED (pose=center → margin:auto → measured dead-center).

Probe asserts the defect signature (panelLeft 12, panelTop 12, width 545) so
the check documents today's truth and flips green-side when the one-character
fix (`--${api.uid}`) lands. The page carries an honest measured-defect note
in the overview pointing at the fix. Everything else measures true: the
decision mechanics, focus chain, resolution law, stamps.

## Measurements (probe 39/39; headless Chromium over dev SSR :5241)

- **Alert gravity**: outside click leaves the panel open (manual popover).
- **Safe landing**: focus lands on the Cancel action on open (APG), falls
  back to the action when no cancel exists (the alert posture's host).
- **Escape scoping**: with focus moved OUTSIDE the open panel, Escape does
  NOT cancel (the keydown lives on the panel); with focus inside, Escape
  cancels through the state and focus restores to the invoker — measured
  both sides.
- **Non-modal**: Tab eventually EXITS the panel (no trap — the popover-base
  ruling), in contrast with the dialog/sheet families' showModal trap.
- **Confirm seam**: the Action flips the onconfirm echo (deleted → yes) and
  focus restores to the invoker.
- **The trio**: mounts at pose=center (dead-center measured), confirm tone
  destructive fill injected by default, Cancel landing, exactly-once
  resolution — confirm→false via Cancel, confirm→true via Action, prompt
  Enter submits the initial value, prompt Escape → null.
- **Stamps**: density rung sm, dark bridge, radius 12px → --jx-radius-effective
  AND --jx-corner published (the corner-context law) on the promoted panel;
  the own elevation level3 rides the style attr with no lane named; auto
  stamps nothing (16px voice stays ambient).
- **Chrome**: h1 ×1, marker ×1 (root parts table), toc == DOM (9, ordered),
  zero duplicate-id twins (LAW #19 holding).

## What changed

- `+page.svelte`: archetype order — hero · install · **overview** (the two
  faces + the delivery shapes + the measured-defect note) · workbench
  (id="system-dialog-demo", carried) · **system trio** (carried, live
  readout) · **law** ("The anchored alert" — 6 postures) · types (carried) ·
  usage · **parts** (the FOUR part tables, rows byte-identical) · **axes**
  (8 lanes measured + 5-seam TokenTable + the level3 demo with probe stamps:
  density small + theme dark + radius 12) · accessibility · see-also. The
  marker moved to the ROOT parts table (with the universal appendix).
- `+page.ts`: ToC = overview / live demo / System trio / The anchored alert /
  Types / Usage / API (parts) / The eight axes / Accessibility.
- `test/fixtures/docs-ambient-vocabulary.matrix.json`: **matrix re-pin** —
  the two pinned variant rows shifted with the part tables (Content 2 → 3,
  Action 3 → 4) after the law table inserted at index 0; row content
  byte-identical; note documents the shift and the prior 页面四张表 note.
- Family files: **zero edits** (the anchor fix belongs to W-next/the family
  owner).

## Gate receipts

| Gate | Result |
| --- | --- |
| verify:tailwindless | GREEN — receipt bound verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs | GREEN — "all docs pages pass the skeleton lint (staged scope green)" |
| verify:docs-universal | GREEN — 110/110 (110 markers) |
| svelte-check (page-scoped) | **0 diagnostics** on both system-dialog.html files |
| docs-ambient-vocabulary solo | **284/284** (with the documented re-pin) |
| defaults-overlays + composition-props + carved-action-band solos | **13 + 5 + 10 — 312 total with ambient** |

## Open questions

1. **W-NEXT (family owner): the anchor seam fix** — one character:
   system-dialog-content.svelte:156 `'position-anchor: --{api.uid}; …'` →
   backtick template `` `position-anchor: --${api.uid}; …` ``. After it
   lands: flip my probe's defect-signature check to the adjacency
   assertion (ready in the probe history), and delete the overview's
   measured-defect note. The trio/center pose is unaffected either way.
2. **The width atom reads absent on the measured panel** (545px > the 384px
   cap, maxWidth none) — possibly the same canvas-host interaction as task
   31 (the demo panels live inside the canvas) or a consequence of the same
   broken style string; re-measure after the anchor fix and split the
   findings if it persists.
3. The old page's DensityDemo theming section folded into axes; if the
   fleet wants a density-scope demo per overlay page, that is a batch pass.
