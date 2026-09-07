# ADDED Requirement: the canvas same-source law (the extraction machinery)

The docs canvases' shown code IS the canvas's real markup. The
`canvasPlugin()` (a standalone export of `@jixoai/vite-plugin`) maps
the per-page virtual module `virtual:jixoai-canvas/<route>/+page`:
resolveId validates the page (importer-derived, realpath-canonical)
and returns the `\0` virtual id; load() parses the page with
svelte/compiler (AST, never regex) and emits a PURE-DATA module —
`canvasIds` + `resolveRawCode(id)` (the Owner's own name) with
named miss-errors listing the page's real ids. The extractor: static
`id` attrs (missing = skip, zero cost; duplicate = named error), the
children source slice with ONLY direct-child canvas-protocol
snippets stripped (nested snippets are demo content, kept), comments
kept, min-common dedent + outer-blank trim and NOTHING else
(byte-honest; no elide marker — that would be a drift hole), and a
SELF-CONTAINMENT guard (every snippet/render reference in the slice
must resolve within it, else a named build error). Escaping is
STRUCTURALLY eliminated: the map lives in a plain ESM module
(JSON.stringify + U+2028/29) — `</script>` terminates nothing; the
hand-dodge `const close` pattern dies on migrated pages. Pages
compose wrappers via `$lib/canvas-usage.ts` `usageFile(imports,
body, {script?})`. `ComponentCanvas` takes ZERO code changes — its
existing `id` (aria override) becomes the extraction key (fixing
same-title aria collisions in passing). Consumption is PAGE-side
(the registry-mirror law forbids the canvas importing app
machinery). The bridge keeps svelte/compiler out of the entry chunk;
`svelte` is optional-peer + devDep + tsdown-external (the symlink
resolution law — peer-alone never resolves). A drift gate spec pins
every id ↔ every call + inline snapshots of each extracted block
(human-reviewable); markdown.html stays opted out (the stretch
ruling — its state-bearing demos await identifier lifting). The
fleet sweep (33 more pages + the no-hand-usage lint on migrated
pages) is a recorded follow-up.

#### Scenario: edit the demo, the code follows

- WHEN a pilot canvas's child markup changes (dev HMR or build)
- THEN the drawer's usage file, the Usage CodeBlock, and the stage
  flip together — three surfaces, one source, zero staleness

#### Scenario: a broken extraction fails loudly

- WHEN a slice references a page-level snippet or an id misses
- THEN a named build error names the page and its real ids — never a
  silently-wrong copy-paste sample
