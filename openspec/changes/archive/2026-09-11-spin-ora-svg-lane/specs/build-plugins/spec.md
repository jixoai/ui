# build-plugins — spec delta (spin-ora-svg-lane)

## ADDED Requirements

### Requirement: the spinners library face resolves named svg spinners through plugin config

`jixoai({ spinners })` SHALL be the svg-animation spinner feature,
default OFF (`false`/`undefined` registers nothing); a bare `{}`
IS a legal configuration meaning the built-in manifest only. The
options SHALL be: `includeDefaults` (default true — the vendored
`blocks-wave` manifest, the magecdn MIT artwork carried verbatim in
the package), `spinners` (a record of kebab-name → SpinnerSource,
SpinnerSource being an inline `<svg>` string or `{ file }` with the
plugin owning ALL file I/O), `output` (default
`src/lib/spin-set.gen.ts`), and `write` (default `false` — the
single-writer law: in THIS repo the root `gen:spins` script is the
ONLY artifact writer; the vite adapter validates and resolves at
build start and WARNs on on-disk artifact drift but never writes
unless a consumer opts in — the adapter carries NO virtual module
surface: nothing imports a virtual id, the artifact has no lazy
tier and no CSS face, and the component imports the real generated
file).

#### Scenario: a bare configuration is legal

- GIVEN `jixoai({ spinners: {} })`
- WHEN the generator emits the artifact
- THEN the union is exactly `['blocks-wave']` and no named startup
  error fires (the icons ≥1-of-2 matrix does NOT apply — spinners
  have one face)

#### Scenario: a custom spinner joins the type union

- GIVEN `spinners: { spinners: { my-loader: { file: './l.svg' } } }`
- WHEN the generator emits
- THEN `SpinName` includes `'my-loader'` and `getSpin('my-loader')`
  answers synchronously, while `getSpin('myLoader')` is `undefined`

#### Scenario: a same-name entry overrides the built-in

- GIVEN `spinners: { spinners: { 'blocks-wave': customSvg } }`
- WHEN the generator packs
- THEN the name resolves to the custom artwork and no duplicate
  payload exists

### Requirement: spinner artwork is RAW-gated, svgo-free, and byte-faithful

Every spinner source SHALL cross the icons RAW safety checker
unchanged (scripts and on* handlers rejected) with SMIL animation
elements (`animate`, `animateTransform`, `set`) explicitly ALLOWED
— pinned by regression test. The lane SHALL run NO svgo pass: the
optimizer's `convertShapeToPath` rewrites `<rect>` to `<path>` and
silently kills `attributeName="x|y|width|height"` animate
targeting, so the artifact's payload SHALL be byte-faithful to the
safety-checked source (root extraction only: the artifact stores
`{ v, n, d }` — viewBox, artwork nature, children innerHTML — and
the component re-owns the `<svg>` root, the icon sink law).

#### Scenario: an unsafe spinner is rejected

- GIVEN a source containing `<script>` or an `onload` attribute
- WHEN resolution runs
- THEN a named safety rejection drops the spinner (warn) or fails
  the build (error mode) — it never reaches the artifact

#### Scenario: SMIL artwork passes untouched

- GIVEN the vendored blocks-wave source
- WHEN the artifact emits
- THEN every `<animate>` element survives verbatim (element count,
  attribute values, syncbase `begin` references byte-equal) and the
  payload round-trips against the vendored svg

#### Scenario: no optimizer runs on the lane

- GIVEN any legal spinner source
- WHEN the generator runs
- THEN no svgo plugin executes (no `convertShapeToPath`, no
  precision rewriting) — the payload equals the RAW input modulo
  root-attribute extraction
