# Report 18 — dropdown-menu, RE-VERIFY (quill's consolidated fix)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/dropdown-menu.html/` · coder quill
(integrated 3a2fb138, "consolidated fix all 4 findings"; diff vs my task-15
base 304e4064 = 1 file, +15/−7) · reviewer: marginalia (authored the
overturning 2nd review) · law: LAW #14, PROBE-READINESS, emission-form,
shape-agnostic import grep (banked from the root cause). Every fix
re-verified against the SERVED tree on :5244 with my own probes; the
task-15 verified-TRUEs re-run as regressions.

## Verdict: PASS

All four findings fixed as prescribed; the themeSplitTokens reorder reads
as claimed; zero regressions on the original verified-TRUEs. **dropdown-menu
CLOSES as page #13.**

## Per-finding verdict table

| # | Finding | Fix claim | Verdict | Receipt |
|---|---|---|---|---|
| 1 | MAJOR — composer sentence | three real composers + import-grep tag + sibling quotes | **FIXED** | Served copy: "three real composers (import-grep receipt)" ×1 with breadcrumb-dropdown.svelte / button-group.svelte / canvas-playground.svelte ×1 each; sibling quotes ×1 each. Old FALSE sentence **×0** (three distinctive fragments, all 0). My own shape-agnostic grep (alias `$lib/ui/dropdown-menu/` AND relative `../dropdown-menu/` forms, production tree): **three-and-only-three** — breadcrumb-dropdown.svelte:52 (relative — the root-cause miss), button-group.svelte:253 (+item :254), canvas-playground.svelte:185 (+item :186). Both sibling quotes are REAL: menubar.svelte:17 "duplicated deliberately" (+ :18 "registry items stay independent, no hidden coupling"); navigation-menu.svelte:6 "an independent thin coordinator" + :27 "actions belong to dropdown-menu" — the page's compressed quotations are faithful. |
| 2 | MINOR — fill attribution | unconditional level2 ladder chain + fallback-only --popover + 0.185-vs-0.3211 discriminator; --border seam kept | **FIXED** | Theme row now: "the bezel FILL, though not through --popover: the own level2 stamp is unconditional … (--jx-elevation-level2-surface → --surface-container-low: light oklch(0.96), dark oklch(0.185); --popover is only the stamp-less fallback — the discriminator is the dark fill 0.185, not --popover's 0.3211)"; elevation row adds "The stamp is UNCONDITIONAL". Live dark island: fill **oklch(0.185 0 0)** while the SAME panel's raw `--popover` = **oklch(0.3211 0 0)** — the discriminator measured on one panel. Seam half kept ("bezel SEAM (--border)") — measured oklch(1 0 0) in dark (flips) ✓. |
| 3 | MINOR — shadow flip | themeSplitTokens row "FLIPS: black → white recipes" + theme-row clause | **FIXED** | New row served ×1 ("FLIPS: black → white recipes", description cites "measured rgba(255,255,255,0.16) on the dark island"); theme row clause "the elevation shadow recipes re-declare under .dark as WHITE (hsl(0 0% 100% / .16))". Live dark island body child: **rgba(255, 255, 255, 0.16) 0px 1px 2px 0px, rgba(255, 255, 255, 0.08) 0px 2px 6px 2px** — the white recipes probed on the current tree. |
| 4 | NIT — e-own caption | "level2 · own — inspect the panel's --jx-elevation-effective: 3" | **FIXED** | Caption served ×1 verbatim; the named value probed live on the panel: `--jx-elevation-effective` = **3** — curl-checkable as promised. |

**themeSplitTokens reorder — as claimed.** SSR row order (absolute byte
positions within the table): level2-surface → level2/4-shadow →
--popover/--border (seam) → --popover-foreground (ink) → --ring →
--destructive pair → frozen chrome (--jx-background/…) → --jx-destructive →
press seams — exactly "surface-fill via ladder · shadows black→white ·
popover/border seam · ink · ring · destructive · frozen chrome ×2 · press
seams".

## Regression on the task-15 verified-TRUEs (all hold)

- **Density 32/48**: viewport moves 1280 → 600 → 1280 on the responsive
  canvas: trigger AND item min-block 32px / 48px / 32px (LAW #14 settles).
- **Radius dual-form**: explicit radius-medium panel consumed
  `calc(8px * 1)` → **8px**; auto panels consumed the §3 concentric
  `calc(max(0px, calc(0px - 0px)) * 1)` → **0px** honestly.
- **Elevation three legs**: level2·own eff **3** / surface oklch(0.96) /
  recipe `0 1px 2px, 0 2px 6px 2px`; level4 (anchor --jx-menu-axes-e-l4)
  eff **8** / oklch(0.92) / `0 2px 3px, 0 6px 10px 4px`. Anchor-name
  targeting (the task-15 lesson) — no label-text clicks.
- **Theme-split twin**: dark panel `--popover` oklch(0.3211) flipped vs
  `--jx-popover` oklch(1 0 0) frozen — still true.
- **EXTRA 16−8+0=8**: meta unchanged (16 props), served family table 9
  rows incl header = **8** family rows ✓.

## Gates (re-run this re-verify)

| gate | result | tail |
|---|---|---|
| docs-ambient-vocabulary solo | exit 0 | **284/284 passed** (6.0s) |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| `verify:docs` | exit 0 | `✓ all docs pages pass the skeleton lint (staged scope green)` |

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-18-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Fix diff read directly: `git diff 304e4064..3a2fb138` on the route (+15/−7).
- Probes: /tmp/marginalia-18-probe.mjs (anchor-resolved e-own/l4 + density
  flip), -probe2.mjs (dark island --jx-menu-axes-t-dark + radius medium —
  the dark anchor is `-t-dark`, not `-theme-dark`; anchor-name inventory
  pulled from SSR first this time). SSR: /tmp/marginalia-18-ssr.html
  (1,003,777 bytes). Gates: /tmp/marginalia-18-{ambient,docs,univ,twl}.log.
- Grep-method note: my first shape-agnostic sweep used a `grep -v
  "dropdown-menu/"` filter that self-excluded every hit (the import
  STRING contains the pattern); the dir-scoped re-run produced the
  three-and-only-three receipt. Filter patterns must never name the
  sought string's own substrings.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
