# ui-plugin-followup — spec delta (icon-channel-api)

## MODIFIED Requirements

### Requirement: face icon variables are layered for plugin override

The face's icon custom properties (--jx-icon-calendar, --jx-icon-clock)
SHALL be declared inside `@layer theme { :root { ... } }` so the
plugin's virtual CSS module (also @layer theme, later in import
order) can override them at equal specificity.

#### Scenario: a plugin-provided calendar icon takes effect

- GIVEN a consumer with the jxUI plugin and a custom calendar icon
- WHEN the site builds
- THEN the plugin's --jx-icon-calendar overrides the face's default
  (both in @layer theme, plugin imported later wins)


### Requirement: opentype.js stays external in the plugin build

The @jixoai/ui-vite-plugin build SHALL keep the dynamic
`import('opentype.js')` as an external dependency in dist — it is a
build-time-only tool (runs inside the vite plugin during
`vite build`/`vite dev`), never ships to the consumer's browser. The
plugin package's dist SHALL NOT bundle opentype.js code.

#### Scenario: a consumer without fontIconProvider installs the plugin

- GIVEN a consumer using only lucideIconProvider
- WHEN they install @jixoai/ui-vite-plugin
- THEN opentype.js is NOT downloaded (it's an optionalDependency,
  dynamically imported only by fontIconProvider)
