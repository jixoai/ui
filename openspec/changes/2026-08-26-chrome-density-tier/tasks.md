# Tasks

## Spec

- [x] proposal.md — root cause, the chrome scope contract, sweep scope

## Kernel

- [ ] `[data-jx-chrome]` scope in `apps/www/src/lib/jixoai.css` + byte-identical `registry/files/theme/jixoai.css`
- [ ] `verify-density-kernel.mjs`: probe-chrome row + chrome invariant set (hit == 2×icon, image == hit, pinned values, fall-through of unpinned aliases)

## Components

- [ ] TerminalHeader (www + registry mirrors): stamp `data-jx-chrome`; hamburger box/bars → hit/icon tokens; pill box drops `text-xs`
- [ ] HuePopover trigger: square law (`min-h/min-w` hit, no inset), icons → `--jx-icon`, delete local `height/width: 32px`
- [ ] Tailwind var-type sweep: `text-[length:var(--jx-text)]` (+`--jx-text-secondary`) in navigation-menu-link/trigger, popconfirm ×2, command-input/-empty/-item/-group — www + registry mirrors

## Gates

- [ ] `pnpm --filter www test` (vitest suite)
- [ ] `node scripts/gen-mirror-manifest.mjs --check`
- [ ] `node scripts/verify-density-kernel.mjs` (chrome row green)
- [ ] live probe: pills 32px, trigger 32×32, icon 16×16 uncrushed, single band in the bar

## Review

- [ ] Codex review round (score + blockers addressed)
