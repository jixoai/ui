# variant-grammar — one fill/tonal/outline/ghost ladder + injectable hue

## Why

Owner ruling (2026-08-26): semantic-name variants (`primary` / `secondary` /
`destructive`) are retired across the whole library — replaced by a
systematic prominence ladder with hue supplied by injectable tokens.
The trigger was the Badge redesign (too tall, no slots), which grew into
a language-level decision covering Badge / InlineCode (new) / Chip (new) /
PressButton / Alert and every consumer (~82 call sites: 45 PressButton
semantic variants, 33 Alert/Badge tones, ~4 badge outline tones).

Owner directive: "No primary/destructive. Replace with fill (bg, default
TOKEN=primary, injectable), outline (border, default TOKEN=border), ghost
(bg+border, default TOKEN=primary; bg semi-transparent, border = the hue).
We use 'primary' in many places — migrate them. But settle a more
systematic, mature scheme with Codex first; my names may not be standard."

## What

- **Phase 0 freeze gate**: ZCode draft (`~/.agents… / .agents/documents/
  2026-08-26-variant-grammar/zcode-draft-r1.md`) reviewed by Codex
  (gpt-5.6-terra, xhigh) until convergence; the frozen grammar lands in
  `design.md` BEFORE any implementation. Known amendment candidates:
  the tinted variant's name (Owner said "ghost"; industry ghost =
  no-chrome, which PressButton's ghost already means — draft proposes
  **tonal** per Material 3), PressButton `secondary` mapping, Alert
  adoption depth, token scope (global vs per-component), fill ink token,
  InlineCode default variant, forced-colors degradation law.
- **The grammar (draft baseline; design.md is the frozen truth)**:
  variant = prominence ladder `fill | tonal | outline | ghost`
  (ghost on interactive components only); semantic color = hue
  injection through tokens (`--jx-fill` / `--jx-tonal` / `--jx-outline`
  naming per Phase 0), defaults `primary` / `primary` / `border` in
  jixoai.css `:root`, overridable per subtree/instance; paint consumed
  via arbitrary-value utilities (tw4 utility-authored law unchanged).
- **Badge redesign (breaking)**: kbd-law sizing (height from
  `--jx-line-secondary`, no block padding → 20px at default density),
  `slotStart`/`slotEnd` snippets with adaptive inline padding,
  `shape: square | pill`, 1px border always present (terminal law),
  default variant tonal (Owner-decided).
- **InlineCode (new registry component)**: `<code>` inheriting the badge
  frame, mono/normal-case, Shiki token highlighting via a new
  `highlightTokens` export (codeToTokens, css-variables theme,
  progressive SSR-safe enhancement), heuristic auto-detection over the
  13 registered grammars (Shiki has none built-in), `INLINE_LANGS` export.
- **Chip (new registry component)**: Badge visuals × PressButton powers
  (press law, effect builders, href/external, button/a duality) by
  composition; default effect `ripple()`; hit-lane compliance via
  `::after` expansion to `var(--jx-hit)`; ripple runtime extracted to
  `press-button/ripple.svelte.ts` (`createRipple()` factory,
  PressButton refactored with zero behavior change).
- **PressButton / Alert migration**: mapping tables per design.md; the
  one-brand-hue law (no blue "info") survives as the token default.

## Verification highlights

- To be filled at completion: contract tests (badge geometry/slots,
  chip effect default + hit lane, inline-code highlight tokens),
  density-adoption rows (chip → family C, inline-code → family E),
  mirror parity manifest, all gates (svelte-check / vitest /
  verify-density-kernel / verify-density-adoption / build:site),
  Codex milestone review loop with scoring.

## Codex

Phase 0 design-freeze review (this change's gate) + milestone
implementation review per the standard loop.
