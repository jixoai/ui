# migration inventory — variant-grammar (2026-08-26, pre-implementation)

Working reference for subagent briefs; final mapping tables land in
design.md after the Phase 0 freeze.

## PressButton semantic variants — 45 sites, 14 files

`variant="primary"` ×~38, `variant="secondary"` ×4, `variant="destructive"` ×3.
Notables: multi-line props (dialog.html:285, icon-button.html:47/189),
IconButton pass-through (icon-button.html ×3 — variant forwards to
PressButton), press-button.html carries both demo + usage-string copies
(~20 sites), component-canvas.html inside template literals + TokenTable
blocks, tokens.html:203, checkbox/toggle/native-select sign-up submits,
blueprints/scenes ×8 files.

Files:
- lib/ui/press-button/press-button.svelte:21 (doc comment)
- lib/blueprints/scenes/{component-canvas,dialog,empty,form-field,press-button,result,sheet}.svelte
- routes/docs/components/{checkbox,component-canvas,dialog,icon-button,native-select,press-button,toggle}.html
- routes/tokens.html/+page.svelte

## Alert / alert-dialog tones — ~15 sites, 4 files

- lib/blueprints/scenes/alert.svelte:7,9
- routes/docs/components/alert.html:26,30,81,84,118,119 (+ tone-law prose)
- lib/ui/alert-dialog/alert-dialog-action.svelte — OWN tone prop
  `'destructive' | 'primary'` (default destructive), data-tone hook,
  destructive/primary paint split
- routes/docs/components/alert-dialog.html (tone demos)

## Badge tones — ~19 sites, 8 files

- lib/blueprints/scenes/{badge,descriptions,shiki,form-field,recipes,component-canvas,section-card}.svelte
  (tone="primary" ×7, tone="destructive" ×2, tone="outline" ×1)
- routes/docs/components/badge.html (~12: demo strings + usage blocks +
  tone-law prose at 118-130)
- routes/docs/components/{accordion,tabs,dropdown-menu,hero-section,badge-indicator,descriptions}.html
  (bare Badge or tone usages — verify per file during batch A)

## Notes for mapping execution

- Multi-line props (dialog.html:285, icon-button.html) need careful
  targeted edits, not sed.
- Template-literal usage strings (press-button.html, component-canvas.html,
  badge.html) contain the SAME markup twice (demo + copyable source) —
  both must migrate or the docs lie.
- tone-law prose in alert.html/badge.html comments ("Four tones…",
  "one-brand-hue law") gets rewritten to the frozen grammar's terms.
- IconButton forwards `variant` to PressButton — its call sites migrate
  with the same mapping, no component change needed (unless Phase 0
  changes the variant union, which it will: update icon-button's prop
  type pass-through accordingly).
