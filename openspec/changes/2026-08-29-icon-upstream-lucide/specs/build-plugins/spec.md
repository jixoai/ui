# build-plugins — spec delta

## MODIFIED Requirements

### Requirement: the lucide provider imports the library

`lucideIconProvider` SHALL read slot geometry from the `lucide`
package (dynamic `import('lucide')` inside the async factory) and
serialize IconNode children through the stroke-artwork wrapper
(viewBox 0 0 24 24, fill none, stroke currentColor, sw 2, round
caps/joins, no width/height). Embedded hand-copied path literals
are REMOVED. `lucide` is an OPTIONAL peer dependency: consumers
who never configure the icons feature install nothing; a missing
install MUST fail loudly at factory time with the install hint.

#### Scenario: lucide is not installed

- GIVEN a consumer config with `icons: { provider: lucideIconProvider() }`
- WHEN the lucide package is absent from node_modules
- THEN the provider factory rejects with a message naming
  `npm i lucide` (build fails, no silent fallback)

#### Scenario: slot geometry matches the library

- GIVEN lucide@0.472.0 installed
- WHEN the provider serves the 'chevron' slot
- THEN the serialized children equal the lucide `ChevronDown`
  IconNode serialization, and the wrapper carries no width/height
  attributes (theme owns sizing)
