# hue-injection-utilities — the intent layer for variant-grammar hue injection

## Why

Owner ruling (2026-08-27): the variant grammar's hue-injection seam —
`class="[--jx-tonal:var(--error)]"` — works everywhere but is verbose,
typo-fragile (a misspelled token silently dead-styles), and its
fill/fill-ink pair invariant ("always inject both") is enforced only
by documentation. Owner approved an intent-utility layer
(`jx-hue-error`-style) after the design consult recommended intent
names over mechanical slot×value aliases.

## What

- **TW4-native, no JS plugin**: the utilities are `@utility` rules
  authored INSIDE the theme sheet (jixoai.css, both roots) —
  installing the theme IS installing the plugin; registry consumers
  need zero JS setup. Emission probed byte-equal to the
  arbitrary-property form on TW 4.2.1 (`@tailwindcss/node`
  candidatesToCss); the set is closed (a typo emits nothing —
  compile-time miss, not silent dead CSS).
- **The closed set (action/status split by construction)**:
  `jx-hue-primary | neutral | error | success | warning | info`
  (each → `--jx-tonal: var(--<semantic>)`; neutral →
  `--muted-foreground`) + `jx-pair-destructive` (emits `--jx-fill`
  AND `--jx-fill-ink` together — the pair law made structural).
  There is deliberately NO `jx-hue-destructive`: destructive is an
  ACTION hue and may only ride the pair.
- **Canonical layering**: intent utilities are the canonical form
  for the curated semantic set; the arbitrary-property class remains
  the escape hatch for anything else. One form per slot in a class
  list (cross-form mixing is not dedupable — documented law).
- **cn() awareness (registry/files/lib/utils.ts, both roots)**:
  extendTailwindMerge classGroups register the closed set as dedupe
  groups — `cn('jx-hue-error', 'jx-hue-success')` → `jx-hue-success`,
  matching the arbitrary form's last-wins semantics.
- **Guards** (test/hue-injection.spec.ts, 12 tests): the @utility
  jx-* set is EXACTLY the closed set; every var() target exists as a
  theme token; no jx-hue-destructive ever appears; cn() dedupes hue
  and pair groups; the InlineCode early-slot law (arbitrary local
  default — consumers win from EITHER layer) is migration-locked on
  both roots.
- **Migration**: in-repo intent call sites adopt the utilities
  (alert-dialog-action's local default pair, copy-command /
  hero-section success feedback, docs pages' error/neutral/success
  injections, test assertions).
- **The article**: /docs/variant-grammar.html — the plugin AND the
  standard it serves (the ladder, the four tokens, action/status,
  pair law, the TW4 border-color sole-source law, forced-colors,
  both injection forms, migration guide).

## Verification highlights

Compiler probe (declaration-equivalence on the resolved version),
guard suite 12, full gates at the
wave's close (vitest / svelte-check baseline / manifest / payloads).
