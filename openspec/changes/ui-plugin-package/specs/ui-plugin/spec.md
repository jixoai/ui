# ui-plugin — spec delta (NEW)

## ADDED Requirements

### Requirement: the unified IconProvider interface

Every icon source SHALL implement the `IconProvider` interface,
returning structured `SvgAsset` objects (never raw CSS strings). The
serializer SHALL be the only code that converts SvgAsset → CSS custom
property values. Providers SHALL NOT perform file I/O (the vite
plugin reads files and passes loaded bytes/data to providers).

#### Scenario: a provider returns an icon for a slot

- GIVEN a provider with an icon for the 'calendar' slot
- WHEN `getIcon('calendar')` is called
- THEN an SvgAsset is returned with viewBox, nature, and source metadata

#### Scenario: a provider has no icon for a slot

- GIVEN a provider without an icon for the 'pipette' slot
- WHEN `getIcon('pipette')` is called
- THEN null is returned (the mixin/base/fallback chain continues)

### Requirement: font files are an SVG source, not a consumption mode

The `fontIconProvider` SHALL accept loaded font bytes (woff2/ttf/otf),
extract glyph outlines via opentype.js at build time, normalize to the
configured viewBox, and return SvgAsset objects with `nature: 'fill'`.
No @font-face, no font-family/content CSS, no runtime font loading.

#### Scenario: a woff2 font provides the calendar icon

- GIVEN a woff2 file with a calendar glyph at codepoint 0xe901
- WHEN fontIconProvider({ fontData, symbols: { calendar: 0xe901 } })
- THEN the calendar slot receives a fill-based SvgAsset in the target viewBox

#### Scenario: any font format works uniformly

- GIVEN equivalent glyphs in woff2, ttf, and otf files
- WHEN each is passed to fontIconProvider with the same codepoint mapping
- THEN the extracted SVG paths are equivalent (within font hinting tolerance)

### Requirement: the safety checker is configurable, default warn

The safety checker SHALL default to warning mode (log issues, don't
block the build). Error mode SHALL be opt-in. The checker SHALL be
replaceable by consumer configuration. The built-in checker SHALL NOT
use an aggressive element whitelist (false-positive prone).

#### Scenario: an oversized SVG in warn mode

- GIVEN safety config { mode: 'warn', maxBytes: 10240 }
- WHEN a 15KB SVG is loaded
- THEN a warning is logged but the build succeeds

#### Scenario: the same SVG in error mode

- GIVEN safety config { mode: 'error', maxBytes: 10240 }
- WHEN the same 15KB SVG is loaded
- THEN the build fails with a descriptive error

### Requirement: the vite plugin is the only injection path

The vite plugin SHALL generate a virtual CSS module containing the
icon custom properties. Consumers SHALL import it explicitly in their
CSS entry (`@import 'virtual:@jixoai/ui-plugin/icons'`). The plugin
SHALL NOT auto-inject alongside jixoai.css or any other stylesheet.

#### Scenario: explicit virtual import

- GIVEN a consumer's entry CSS with `@import 'virtual:@jixoai/ui-plugin/icons'`
- WHEN the build runs with a lucideIconProvider
- THEN the virtual module resolves with `--jx-icon-*` custom properties

#### Scenario: no plugin installed

- GIVEN a consumer WITHOUT the plugin
- WHEN the jx-html standard layer is used
- THEN the inline lucide fallback data URIs serve as defaults

### Requirement: the slot registry is versioned and extensible

Icon slots SHALL be defined in a typed registry with capability
metadata (consumer, technique, browser support). New slots SHALL be
added via versioned additions, never by breaking existing ones.

#### Scenario: a new slot joins the registry

- GIVEN the current slots: calendar/clock/chevron/pipette/clear
- WHEN a 'search' slot is added in a future version
- THEN existing providers continue to work (they return null for 'search')
- AND the standard layer's fallback for 'search' serves until a provider covers it
