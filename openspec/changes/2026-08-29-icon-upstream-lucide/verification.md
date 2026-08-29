# Verification — icon upstream (lucide)

## Gates (post-migration, 2026-08-29)

| gate | result |
|---|---|
| packages/vite-plugin vitest | 158/158 (lucide provider output ≡ library data; zero-I/O; missing-install hint; geometry-consistency re-pinned) |
| packages/vite-plugin build (tsdown) | clean; `await import("lucide")` stays external (optional peer) |
| packages/css-laws vitest | 77/77 (byte fixtures, CircleAlert invalid-ink, calendar canonical order, slot markers) |
| `tsx packages/css-laws/src/build.ts` + `--check` | GREEN — 4 slots (utility/face/alias/icon-vocab 12644 B), mirrors synced |
| apps/www vitest | 717/717 (parity spec green — sheet URIs ⇄ icons.ts both lucide-canonical) |
| `shadcn build` (public/r payloads) | regenerated; payload-freshness test green |
| verify:icons (`gen-icons --check`) | fresh — 31 icons, zero pinned bodies |
| verify:laws / verify:mirror / verify:standards | GREEN (B2: every data URI is a `--jx-icon-*` def or slotted use) |
| verify:shadcn-add | ALL GREEN (consumer installs need NO lucide — registry stays dependency-free) |
| verify:budgets | 4/4 PASS — B-consumer-icons holds 253 B |
| verify:all | GREEN (full chain) |

## DOM-level visual oracle (worktree A/B, 2026-08-29)

Pixel A/B against the Aug-26 label was unusable (systemic ~1-2% noise on
all 85 routes from cross-session font/animation variance). Replaced with
a deterministic DOM oracle: every `<svg>` outerHTML inventoried per docs
route, pre-migration worktree (a257a1d) vs migrated tree.

- 85/85 routes differ; **every unique changed shape attributes to the
  migration** — no unexpected glyph:
  - theme-toggle sun/moon/monitor (85 routes, site header): the hand
    copies were an older lucide vintage — 0.472 canonical differs
    (moon redesigned upstream; monitor rect rx 0→2; sun split-path,
    render-identical)
  - docs-pager arrowLeft (78 routes): lucide child-order swap,
    render-identical (fill:none strokes don't occlude)
  - declared: copy (code-card/hero), fileCode (tree-view), upload
    variants (file-input/hero), file-input kind glyphs, languages,
    image placeholder, chevron wrappers (identical geometry, module
    attrs + CSS stroke-width overrides)
- invalid-ink → circle-alert rides CSS data-URIs (not DOM svgs);
  unit-pinned in css-laws tests.

## Intentional visual changes (final register)

1. copy → full lucide Copy (code-card, hero-section)
2. fileCode → lucide 0.472 redesign (tree-view)
3. invalid-ink → lucide CircleAlert sw 2.5 (form validation ink)
4. upload tray/file-input kind glyphs → lucide canonical
5. theme-toggle trio → 0.472 canonical (moon redesign is the visible
   one, site header)
6. calendar/arrowLeft order normalization — render-identical

## Concurrent-work note

The Owner's density/:where() stream (e7cf4b3, f122af5, 933cb3d) landed
interleaved with this change; shared-file hunks were separated by their
own commits — the icon commits carry only icon deltas on top. The
chip.spec.ts `--jx-hit` floor expectation was refreshed (stale since the
hit-floor rework) as a drive-by in the integration commit.
