# ui-plugin-package — @jixoai/ui-plugin: the unified icon architecture

## Why

Owner ruling (2026-08-27): the jx-html standard layer's icons are
hardcoded inline data URIs. Consumers cannot customize the
calendar/clock/chevron/pipette/clear icons. The select chevron's CSS
gradients misalign. The date/time picker indicator rules were lost in
the V2 surgery (restored as stopgap in 5b896a5).

The solution: a general UI plugin package (`@jixoai/ui-plugin`) where
providers return structured SvgAsset objects; the serializer is the
only code that generates CSS; the vite plugin reads files and passes
SourceDescriptor data to providers. Font files (woff2/ttf/otf) are a
SOURCE for SVG extraction (opentype.js parses glyphs → SVG path →
normalized viewBox), not a separate consumption mode.

## What Changes

1. **NEW package `packages/ui-plugin/`** (`@jixoai/ui-plugin`):
   - `IconProvider` interface (slot → SvgAsset, structured)
   - `svgIconProvider` (reads .svg files via SourceDescriptor)
   - `lucideIconProvider` (embeds lucide SVG paths — the defaults)
   - `fontIconProvider` (extracts glyphs from woff2/ttf/otf as SVG)
   - `mixinIconProvider` (composes: base + per-slot overrides)
   - `jxUI()` vite plugin (virtual CSS module, HMR, asset handling)
   - `SafetyChecker` (configurable, default warning-only)

2. **Icon slot registry**: concrete SLOT_REGISTRY constant with
   per-consumer capability matrix (calendar/clock/chevron/pipette/clear)

3. **Standard layer integration**: the jx-html utilities reference
   `--jx-icon-{slot}` custom properties with inline lucide fallbacks

4. **Select chevron fix**: CSS gradients → SVG icon slot (alignment fix)

## Impact

- New monorepo sub-package; peer/optional deps on vite + opentype.js
- No breaking changes to existing components (plugin is optional)
