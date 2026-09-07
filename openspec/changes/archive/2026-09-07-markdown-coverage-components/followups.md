# followups — recorded, deliberately not this change

- **math wiring** (`math_inline`/`math_block` → the katex items):
  `enableMath` is a pinned parse axis; the katex/mermaid items landed
  and wait for that axis decision.
- **`:::` containers → alert**: `enableContainers` pinned; the GitHub
  `[!]` syntax covers the same need in the default map.
- **definition-list extraction**: `dl/dt/dd` stay on the pure-text
  floor; extract a `definition-list` item if prose demand appears.
- **the Image unlock**: markdown images stay sanitized native
  `<img>` until the image item grows an unknown-dims posture (a
  reserved aspect-ratio lane) satisfying its REQUIRED width/height
  no-CLS contract.
- **the blockquote indent posture**: the borderless manuscript
  indent is a future STRUCTURAL axis (never a paint rung — ghost is
  interactive-chrome vocabulary).
- **Checkbox for task items**: unlocked only by a bare-input render
  mode on the checkbox item (its div>span>input wrapper defeats the
  container-level `li:has(> input)` marker suppression today); until
  then the jx-pure bare-checkbox face owns the marker.
- **alert icons in the markdown label row**: the Blockquote `icon`
  snippet exists for app consumers; the default map ships the text
  label only (no @jixoai/icon edge on markdown).
- **html whitelist growth** (`u` beyond Ins, `<span>`, html-spelled
  tables/headings…): the table is spec-frozen — each addition is a
  spec change with its own equivalence test.
- **nested details across blank lines**: CommonMark's html_block
  rule fragments at blank lines (contiguous nesting works); a
  parse-side repair would belong to the parser's lane, not ours.
- **pre-existing upstream gate debt** (NOT this change's): verify-
  hook-law B1 fails on `jx-tk-` (print/freeze.svelte.ts) and
  `jx-dsn-` (docs-nav-filter.spec) on a clean origin/main checkout;
  verify:print/verify:km need CHROME_PATH on machines without the
  playwright cache (a CI-discovery followup in the script's own
  lane).
