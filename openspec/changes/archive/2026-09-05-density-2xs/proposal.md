# Proposal: density-2xs — the fifth rung, an extreme-compactness standard for pro-tool operation surfaces

## Why

The density scale (design-language-kernel appendix A, 2026-08-26) has four
rungs (xs/sm/default/lg) aimed at general product UI. Professional software
with high-density operation areas — inspector panels, data grids, tool
palettes (IDE layers panels, Figma property panels) — needs to go FURTHER
down: smaller body text, tighter rows, an audience of professional
non-touch pointer users who trade comfort for information per viewport.
Owner 2026-09-05: add a FIFTH rung below xs, `2xs`, extending the t-shirt
ladder; the kernel's derivation grammar keeps holding equation-for-equation.

## What Changes

- **Kernel tokens (theme sheet, hand-authored block + both trees)**: the
  `:root` density block gains the full `--jx-density-*-2xs` set (text,
  leading, factors, floors, and every derived row: line, inline-gap,
  media-gutter, end-gap, stack-gap, inline-inset, content-gap, row-min,
  hit-min, media-icon, media-image, secondary-text, secondary-line).
  A new `[data-density='2xs']` scope block maps the inherited `--jx-*`
  aliases — and redeclares `--jx-hit-floor: calc(var(--jx-unit) * 6)`
  SCOPED (the one floor that is scoped, not global; see design §3).
- **Density context**: `Density` union gains `'2xs'` (both trees).
- **Adoption law (normative)**: `2xs` is OPT-IN ONLY for professional
  non-touch high-density operation surfaces; never for general
  marketing/docs UI; not the default anywhere; the canvas stage's
  comfortable/compact axis does NOT grow a 2xs stop. `xs` keeps its
  "dense non-touch metadata surfaces" role; `2xs` goes further
  (operation surfaces).
- **Verifier**: `scripts/verify-density-kernel.mjs` asserts the 2xs row
  in real Chromium (text 10 / line 14 / G=B 8 / S 4 / rowMin 24 / hit 24
  / icon 14 / image 28) — and REPAIRS the stale hit expectations for the
  four existing rungs (44/44/44 leftovers of the retired 11U clamp; the
  2026-08-29 ruling computes 28/32/40 and the sheet already says so).
- **Tests**: density-context covers 2xs resolution + scope stamping.
- **Enumerations**: every exhaustive density enumeration updated (demo
  component type union, tokens-page kernel table + live demo, blueprint
  scene, props-docs union text + its drift pins, docs component pages
  with hand-pinned rows). Parallel-session-owned files are exempt.
- **Acceptance demo**: `/docs/density-2xs.html` — the five-rung scale
  table rendered FROM live CSS vars (cannot rot), a pro-tool inspector
  scene at 2xs beside the same scene at default, the adoption-law note.

## Impact

- `registry/files/theme/jixoai.css` + `apps/www/src/lib/jixoai.css`
  (byte-identical pair, hand-authored kernel block + scope blocks)
- `registry/files/lib/density.svelte.ts` + mirror
- `scripts/verify-density-kernel.mjs`, `apps/www/test/density-context.spec.ts`
- `apps/www/src/routes/tokens.html/+page.svelte` (kernel table),
  `apps/www/src/lib/ui/density-demo/density-demo.svelte`,
  `apps/www/src/lib/blueprints/scenes/density.svelte`
- props-docs union text (`select.docs.ts`) + drift pins (both trees),
  docs component pages with pinned density rows (press-button BOTH
  trees; textarea/number-input/native-select/input-otp/form/chip www
  side — no registry mirror). `input.html` (both trees) is
  parallel-session-owned: its pinned row stays four-rung this change.
- `apps/www/src/lib/docs-route-model.ts` (nav line) + the new route
  `apps/www/src/routes/docs/density-2xs.html/`
- Migration: NONE — additive rung; no existing value, alias or scope
  changes. `mirror-manifest.json` regeneration is the orchestrator's
  (surgical, post-review).
