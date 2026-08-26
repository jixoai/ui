# Tasks

## Spec

- [x] proposal.md — root cause, the chrome scope contract, sweep scope

## Kernel

- [x] `[data-jx-chrome]` scope in `apps/www/src/lib/jixoai.css` + byte-identical `registry/files/theme/jixoai.css`
- [x] `verify-density-kernel.mjs`: probe-chrome row + chrome invariant set (hit == 2×icon, image == hit, pinned values, fall-through of unpinned aliases)

## Components

- [x] NavigationMenu stamping law: the root/trigger/panel stamp ONLY a density OPINION (explicit prop or inherited context) — with no opinion the subtree rides the ambient css scope, so the bezel's chrome band owns it (density-adoption-menus.spec.ts updated to the law)

- [x] TerminalHeader (www + registry mirrors): stamp `data-jx-chrome`; hamburger box/bars → hit/icon tokens; pill box drops `text-xs`
- [x] HuePopover trigger: square law (`min-h/min-w` hit, no inset), icons → `--jx-icon`, delete local `height/width: 32px`
- [x] Tailwind var-type sweep: `text-[length:var(--jx-text)]` (+`--jx-text-secondary`) in navigation-menu-link/trigger, popconfirm ×2, command-input/-empty/-item/-group — www + registry mirrors

## Gates

- [x] vitest suite — 508/508 (vitest suite)
- [x] mirror identity kept (both sides byte-identical); the --check classifier debt (4 unclassified site-only components) is PRE-EXISTING at HEAD — proven via stash, owned by the density-adoption session
- [x] `verify-density-kernel.mjs` — 72/72 (chrome row green)
- [x] live probe: pillBox 38 / pill 32px·12px / trigger 32px·12px / hue 32×32·16px icon / popover open+Escape / mobile burger 32 = hue 32 pills 32px, trigger 32×32, icon 16×16 uncrushed, single band in the bar

## Review

- [x] Codex review loop — r1 6.5 (scope width, manufactured context, logo) → r2 8.0 (reactive context P1) → r3 7.5 (registry mirror miss) → r4 **9.0, no remaining blockers**; every round's findings fixed and re-gated
- [x] r4 bonus: the manifest complete-drift law restored (4 site-only surfaces classified; 88 items / 297 pairs; --check GREEN for the first time since the density-adoption merge)
- [x] Walkthrough rounds (Owner live review): frame law · VT .html/D8 fixes · Tokens highlight · left-rail presence law — Codex loop 8.0 → 8.5 → **9.0, archivable**; residuals fixed each round (generation-scoped datasets, switcherFrame opt-out + docs, css layer prelude)
