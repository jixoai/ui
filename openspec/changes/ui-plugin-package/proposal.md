# ui-plugin-package — @jixoai/ui-plugin: the unified icon architecture

## Why

Owner ruling (2026-08-27): the jx-html standard layer's icons are
hardcoded inline data URIs. Consumers cannot customize the
calendar/clock/chevron/pipette/clear icons. The select chevron's CSS
gradients misalign. The date/time picker indicator rules were lost in
the V2 surgery (restored as stopgap in 5b896a5).

The solution: a general UI plugin package (`@jixoai/ui-plugin`) with a
unified SVG icon architecture — ALL icon providers (file-based SVG,
lucide, font-extracted) output the same `url("data:image/svg+xml,...")`
custom properties. One mode, zero exceptions. Font files (woff2/ttf/otf)
are a SOURCE for SVG extraction (opentype.js parses glyphs → SVG path →
normalized viewBox), not a separate consumption mode.

## What Changes

1. **NEW package `packages/ui-plugin/`** (`@jixoai/ui-plugin`):
   - `IconProvider` interface (slot → SVG data URI, no mode field)
   - `svgIconProvider` (reads .svg files from a directory)
   - `lucideIconProvider` (embeds lucide SVG paths — the defaults)
   - `fontIconProvider` (extracts glyphs from woff2/ttf/otf as SVG)
   - `mixinIconProvider` (composes: base + per-slot overrides)
   - `jxUI()` vite plugin (virtual CSS module, HMR, asset handling)
   - `SafetyChecker` (configurable, default warning-only)

2. **Icon slot registry**: calendar / clock / chevron / pipette / clear
   (extensible via versioned slot additions)

3. **Standard layer integration**: the jx-html utilities reference
   `--jx-icon-{slot}` custom properties with inline lucide fallbacks

4. **Select chevron fix**: CSS gradients → SVG icon slot (alignment fix)

## Impact

- New monorepo sub-package; peer/optional deps on vite
- No breaking changes to existing components (plugin is optional;
  without it, inline lucide fallbacks serve)
- The standard layer's jx-html-input/select gain configurable icon slots
