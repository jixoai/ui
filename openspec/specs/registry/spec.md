# registry — the shadcn distribution capability (living spec)

## Purpose

What the jixoai-ui registry distributes and how: item authoring under registry/files/**, the registry.json index, the shadcn build pipeline into public/r/*.json, and the @jixoai consumer contract.

> Capability owner: `registry.json` (the index) + `registry/files/**`
> (the item sources) + `shadcn build` (the distributables pipeline).
> The registry is the source of truth; `apps/www` only browses it.

## Current contract (state: 2026-09-06, consumer-feedback-fixes install-integrity + docs dialect)

## Requirements

### Requirement: single-source item authoring

Every distributable artifact SHALL originate in `registry/files/**`; nothing
hand-edits `public/r/*.json`. `registry.json` is the machine index and
stays in lockstep with the file tree.

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/foo.svelte` (the
  folder-per-item law — one directory per item under
  `registry/files/ui/<name>/`, the tw4-css-modularization form; the
  flat `registry/files/ui/foo.svelte` path this scenario historically
  taught was pre-tw4) and declared
  as an item (`type: registry:ui`, files `[{path, target}]`) in
  `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync spec)

### Requirement: item file contracts

An item SHALL declare one or more files, each `{path, target, type}`.
Targets use the consumer alias space (`@ui/...`, `@lib/...` per
components.json). The folder law applies to `registry:ui` items'
COMPONENT-LOCAL files only: one directory per item under
`registry/files/ui/<name>/` containing the item's canonical main
component file, its sub-components (ALL multi-file items fold in —
accordion (2), dropdown-menu, tabs (4), … enumerated by script, not
example), a pure-barrel `index.ts` (default re-export of the canonical
main + named sub-component re-exports + stable public types ONLY — no
logic, no defaults, no auto-exported private `Props`; snippet/context
imports stay folder-relative and are never promoted to public API),
and the item's colocated css when the css-architecture law requires
one. The canonical main is machine-resolved by ONE normative source:
the committed `apps/www/mirror-manifest.json` carries, per
`registry:ui` item, exactly one `canonicalMain` (+ its consumer
target) — same-name `.svelte` entries are script-derivable defaults,
non-identical ones (toast → `toast-viewport.svelte`) MUST be
explicit; the manifest check FAILS on missing, duplicate,
non-item-local, or files[]-inconsistent entries, and the P1
index/target generator reads ONLY that field. `registry:lib`,
`registry:theme`, and `registry:file` items KEEP their canonical roots
and targets (`registry/files/lib/**` → `@lib/...`,
`registry/files/theme/**` → `@lib/...`). A UI item referencing a
SHARED lib file (e.g. `code-card` → `lib/shiki.ts`, `toast` →
`lib/toast-store.ts`, `ghostty-term` → `lib/ghostty-vt.ts`) keeps
that file at its canonical `@lib` target — decided per-file by the
P0.3 migration mapping table (canonical owner, consumer target,
move-vs-dependency) — so shared-library install contracts do not
silently change. Inter-item dependencies use `registryDependencies`;
npm package dependencies use the item `dependencies` field (precedent:
shiki, @tanstack/svelte-virtual). Component (`registry:ui`) items
carry a documented install prerequisite: Tailwind v4 PLUS the jixoai
token sheet wired into the consumer's single CSS entry — the canonical
consumer entry setup order is `@import 'tailwindcss'` → jixoai theme
import → (optional) jx-pure import; utility-authored UI items SHALL
declare `@jixoai/jixoai-theme` in `registryDependencies` uniformly so
the token sheet arrives with the component, and the setup doc +
`scripts/check-tw4-prereq.mjs` detection (scoped to `registry:ui`
consumers, failure message names the missing requirement) enforce the
entry wiring. Items whose runtime needs a build-time-resolved binary
asset (the wasm-asset prerequisite, 2026-08-28: `ghostty-term` →
`ghostty-vt.wasm`) SHALL NOT ship the binary through the registry
payload; the item documents the `@jixoai/vite-plugin` wiring as an
install prerequisite of equal rank to the tw4 law (per the
build-plugins spec), and the asset URL reaches the component through
that plugin's virtual module (`virtual:jixoai-ghostty`), never
through a hand-placed file. The install chain of a wasm-consuming
item is frozen the same way as every dependency edge: `ghostty-term`
declares `registryDependencies = ["@jixoai/ghostty-vt",
"@jixoai/jixoai-theme", "@jixoai/utils", "@jixoai/color-utils",
"@jixoai/density"]` (density joined the frozen set in the impl
review: the component imports `$lib/density.svelte` for
resolveDensity/stamps, the list-item precedent),
and the `ghostty-vt` and `color-utils` lib items declare zero npm
`dependencies` (the bindings use only global web platform APIs); a
real `shadcn add` probe asserts the chain lands all dependencies with
no binary payload. A new `color-utils` lib item (engines group,
canonical `@lib/color-utils.ts`) gives the previously unreferenced
`registry/files/lib/color-utils.ts` an owning item AND repairs the
pre-existing break where `color-picker`'s registry source imports
`$lib/color-utils` that no item shipped — `color-picker` gains
`@jixoai/color-utils` in its `registryDependencies`, and the shadcn
add probe covers BOTH `ghostty-term` and `color-picker` installs.
The `jixoai-theme` item's own npm
dependency closure MUST be declared: its css imports
`@fontsource-variable/jetbrains-mono` + `@fontsource/share-tech-mono`,
so both MUST be in the item's `dependencies` (clean consumers resolve
the theme css; today the packages exist only in apps/www). Theme/
lib/engine items stay framework-free — a lib item that binds a wasm
ABI (`ghostty-vt`) stays framework-free by taking its wasm source as
an explicit `loadGhosttyVT({ url | bytes })` argument instead of
importing the virtual module (the virtual-module contract belongs to
the ui item layer). Consumer installability of the folder shape MUST
be proven by real `shadcn add` probes before migration (P0.2: the
multi-file accordion + toast — toast covers the non-identical-main
AND item-shipped canonical `@lib` file paths; code-card's npm/registry
dependency chain is asserted in the P0.3 mapping + P1 full gate), not
inferred from `shadcn build` output.

#### Scenario: consumer installs an item needing a wasm asset

- GIVEN a consumer with the `@jixoai` namespace and
  `jixoaiGhostty()` wired in vite
- WHEN `npx shadcn add @jixoai/ghostty-term` runs
- THEN the component folder and the shared `@lib/ghostty-vt.ts` land
  at their canonical targets (all five frozen registryDependencies —
  `@jixoai/ghostty-vt`, `@jixoai/jixoai-theme`, `@jixoai/utils`,
  `@jixoai/color-utils`, `@jixoai/density` — arrive with it) with NO
  binary payload in the registry JSON, and the component resolves the
  wasm at runtime through the plugin's virtual module

#### Scenario: the color-utils item repairs color-picker's install

- GIVEN a consumer fixture with color-picker's OTHER runtime
  prerequisites already present (its under-declared import graph —
  input, native-select, press-button, surface-motion, density — is a
  PRE-EXISTING condition, out of this change's scope and flagged as
  input for a follow-up registry dependency-audit change)
- WHEN `npx shadcn add @jixoai/color-picker` runs after this change
- THEN `@jixoai/color-utils` arrives via its new registryDependencies
  entry and the installed component resolves that import — the
  color-utils half of the clean-install break is repaired and locked
  by the shadcn add probe

#### Scenario: wasm prerequisite missing is named, not mysterious

- GIVEN a consumer who installed `ghostty-term` but did NOT wire the
  vite plugin
- WHEN their build runs
- THEN the failure path is documented on the item's docs page (the
  install-prerequisite section names `@jixoai/vite-plugin` and the
  one-line fix), mirroring the tw4-prerequisite law

#### Scenario: consumer installs a multi-file item

- GIVEN a multi-file item (accordion: group + item + barrel + css)
- WHEN it is installed via `shadcn add`
- THEN every file lands inside its folder target — the flat-sibling
  era's name-mangling is gone; this scenario name carries that history

#### Scenario: consumer installs a folder-shaped item

- GIVEN a consumer with `@jixoai` namespace configured
- WHEN `npx shadcn add @jixoai/accordion` runs
- THEN every file lands under the resolved alias target directory and
  `import ... from '$lib/ui/accordion'` works via the shipped index
  (proven by the P0.2 fixture)

#### Scenario: consumer installs an item with a shared lib file

- GIVEN `toast` (non-identical main `toast-viewport.svelte` +
  `@lib/toast-store.ts`)
- WHEN `shadcn add @jixoai/toast` runs
- THEN the UI folder lands under `$lib/ui/toast/**` with the index
  default export pointing at the manifest's `canonicalMain`
  (`toast-viewport.svelte`), AND the shared file lands at its
  canonical `@lib` target, without duplication or clobbering (proven
  by the second P0.2 fixture)

#### Scenario: consumer entry setup resolves utilities

- GIVEN a clean consumer whose single CSS entry follows the canonical
  order (`@import 'tailwindcss'` → jixoai theme → optional jx-pure)
- WHEN a utility-authored UI item is installed (theme arrives via its
  `registryDependencies`)
- THEN `dark:*`, `border-border`, `bg-background` and the component's
  utilities all resolve in the compiled output (proven by the P3a
  clean-consumer fixture)

#### Scenario: payload stability, layout breakage honesty

- WHEN the layout moves to folders
- THEN `/r/<name>.json` payload names and the consumer namespace stay
  unchanged, AND the change documents that installed file paths and
  import paths break (deliberate v1 layout break in the pre-adoption
  window)

#### Scenario: npm dependency needed by an item

- GIVEN the `utils` item needs clsx + tailwind-merge
- WHEN the item is declared
- THEN they are listed in the item's npm `dependencies` field, and
  depending items reference `@jixoai/utils` via
  `registryDependencies`

### Requirement: distributables pipeline

`scripts/build-site.mjs` SHALL orchestrate, in load-bearing order: build
apps/www → empty `public/` → copy site dist → `shadcn build` (emits
`public/r/*.json`) → assert both artifacts → generate AI-facing exports
(llms.txt / llms-full.txt / per-page .md) from the FINAL `public/`.
Generation happens at exactly one point (never inside the vite build).

#### Scenario: full site build

- WHEN `pnpm build` executes
- THEN `public/` is directly deployable (GitHub Pages) with both the
  site pages and `/r/<name>.json` registry payloads coexisting

### Requirement: consumer contract

Consumers SHALL register the namespace
`"@jixoai": "https://ui.jixoai.com/r/{name}.json"` in components.json;
Svelte 5 is first-class and theme/lib/engine items stay framework-free.

#### Scenario: namespace registration

- GIVEN a components.json with the @jixoai namespace
- WHEN items are added via shadcn
- THEN Svelte 5 consumers receive them first-class; theme/lib/engine
  items stay framework-free

Consumers register the namespace
`"@jixoai": "https://ui.jixoai.com/r/{name}.json"` in components.json.
Svelte 5 is first-class (all jixoai sites are SvelteKit); the engine and
theme items are framework-free so non-Svelte consumers can still install
`jixoai-theme` / `toc-engine` / `jx-pure`.

### Requirement: catalog groups are the display taxonomy

registry.json `meta.group` values SHALL form the single display
taxonomy mirrored by `apps/www` `CATALOG_GROUPS` (label + description
per id, antd-style functional naming), and the docs navigation
derives from it automatically. The `terminal` group (2026-08-28) is
the brand's native-surface family: `ghostty-term` (live terminal
canvas), plus `terminal-card`, `terminal-header`, `terminal-footer`
migrated in from `data-display` / `layout`. Item hrefs and payload
names do NOT change on group migration — a group move is a
`meta.group` field edit plus the CATALOG_GROUPS mirror row, nothing
else.

#### Scenario: adding the terminal group

- GIVEN ghostty-term authored under `registry/files/ui/ghostty-term/`
- WHEN the item is declared with `meta.group: "terminal"` and
  `CATALOG_GROUPS` gains the row after `general`
- THEN the docs nav, the components index grouping, and per-group
  counts regenerate without manual page edits, and the three
  terminal-* items appear under the same group with unchanged hrefs

#### Scenario: group snapshot stays truthful

- GIVEN the frozen docs-structure test snapshot counts groups and
  items
- WHEN a group is added or items migrate groups
- THEN the snapshot is updated in the same change and the
  reading-chain coverage test still covers every ui item

### Requirement: the icons lib item is generated from lucide

The `@jixoai/icons` registry item SHALL RETIRE (this change). Its
successor is the generated artifact `@jixoai/icon-set`
(`registry/files/lib/icon-set.gen.ts`, mirrored byte-identically to
`apps/www/src/lib/icon-set.gen.ts`): the emitted output of the
plugin's `generateIconLibraryArtifacts()` driven by the root
`gen:icons` script (canonical write) and gated by `verify:icons`
(`--check` fails on staleness). The public interface SHALL be:
`IconName` (the name union — consumer custom names join via plugin
config), `ICON_NAMES`, `IconData` (`{ v, n, d }`), `getIcon` (sync
peek), `loadIcon` (cached promise over lazy virtual chunks),
`preloadIcons`. The item SHALL declare NO npm dependency — registry
consumers stay lucide-free. The install contract has two tiers,
both probe-enforced (`verify-shadcn-add`): the DEFAULT tier ships
the default-config artifact (inline core; lazy-chunk count per the
CURRENT generator output, owned by the acceptance test) which
builds standalone with no plugin and no virtual imports; the OVERFLOW tier (big libraries, `inlineFirstChunk:
false`) is a DOCUMENTED plugin prerequisite — the item docs carry
the `jixoai({ icons: { library } })` wiring recipe (the ghostty-term
precedent), a forced-overflow clean-consumer probe builds a real
vite project with the plugin wired and asserts the lazy chunks emit
and load, and an unwired overflow build fails with a NAMED error
pointing at the plugin option (never a silent unresolved import).
The old `{@html}` string-bag interface (`lib/icons.ts`) SHALL be
REMOVED with no compat layer.

#### Scenario: the generated module is stale

- GIVEN the plugin's default manifest, the svgo preset, or a source
  svg changes
- WHEN `verify:icons` runs against an un-regenerated icon-set.gen.ts
- THEN the gate FAILS listing the file as stale

#### Scenario: a consumer adds the icons item

- GIVEN `shadcn add @jixoai/icon-set`
- WHEN the item lands in the consumer project
- THEN it imports nothing beyond itself and virtual chunk ids (zero
  npm deps), and every built-in name renders geometry identical to
  lucide@0.472.0 modulo the pinned no-op svgo pass

#### Scenario: an overflow consumer without the plugin fails by name

- GIVEN the vite plugin present but no `jixoai({ icons: { library }
  })` wiring, and an artifact importing
  `virtual:jixoai-icons/chunk/*`
- WHEN the consumer's build runs
- THEN the plugin's resolver fails the build with the fixed named
  error pointing at the plugin option (never vite's silent generic
  unresolved-import message); the same consumer wired per the item
  docs builds and loads the lazy chunks (the forced-overflow probe
  asserts the exact message both ways)

#### Scenario: the retired interface is gone

- GIVEN a consumer importing `{ icons }` from `$lib/icons`
- WHEN the migration has landed
- THEN the module does not exist (compile error) — the consumption
  path is `<Icon name=… />` from `@jixoai/icon` or the artifact's
  typed functions

### Requirement: registryDependencies mirror actual imports

Dependency truth is OWNERSHIP-RESOLVED through `registry.json`
`files[].target` (raw alias matching is not the test): every declared
`@jixoai/*` edge SHALL name an existing item; every cross-item import
of an owned file SHALL have a declared edge; a declared-but-unimported
edge SHALL fail UNLESS it is a structured install prerequisite — the
theme sheet is the canonical case (every registry:ui item declares
`@jixoai/jixoai-theme` without importing it). `verify:deps` enforces
all three with the four-case fixture matrix (dangling FAIL /
undeclared cross-item import FAIL / theme prerequisite PASS / dead
non-prerequisite FAIL). The icon-family edges migrate with the
icon-component-pipeline change: component importers declare
`@jixoai/icon`; artifact-level importers declare `@jixoai/icon-set`;
the `@jixoai/icons` name RETIRES (a zero-hit sweep over
registry.json/scripts/apps/registry/packages closes the migration —
dangling edges cannot be baselined).

#### Scenario: a dangling registry dependency

- GIVEN any item whose `registryDependencies` lists `@jixoai/foo`
- WHEN `registry.json` has no item named `foo`
- THEN `npm run verify:deps` fails naming the offender and the missing
  target

#### Scenario: an undeclared cross-item import

- GIVEN an item whose owned files import a file owned by another item
  (target-resolved, e.g. `$lib/toc-engine`)
- WHEN the item's `registryDependencies` does not list the
  corresponding `@jixoai/*` item
- THEN `npm run verify:deps` fails naming the file and the undeclared
  dependency

#### Scenario: an item's declared icon dep is unused

- GIVEN an item whose files never import `$lib/ui/icon` or
  `$lib/icon-set.gen`
- WHEN registry.json still lists `@jixoai/icon` or `@jixoai/icon-set`
  for it
- THEN the registry surface check flags the dead dependency
  (unchanged — now enforced by `verify:deps`)

#### Scenario: the theme install prerequisite

- GIVEN a registry:ui item that declares `@jixoai/jixoai-theme`
  without importing it
- WHEN `verify:deps` runs
- THEN the declaration PASSes as the structured install prerequisite

### Requirement: the defaults tooling and axis modules have two-tier registry ownership

SHARED tier: `lib/defaults.svelte.ts` (the composition tool:
`defineComponentDefaults` / `defineLiteralSlot` / `defineOpenSlot` /
`absentSlot` / the slot brand), the axis modules (`lib/paint.svelte.ts`
with `PAINT_ZONE_KEY`, `providePaintZone`, `getPaintZone`, and
`definePaintSlot`), AND the context-plugin kernel
(`lib/context-plugin.svelte.ts` — a registry:lib item since
context-plugin-v2, the first runes-carrying lib item) SHALL be
registry:lib items (the density/entity precedent, rooted at
`registry/files/lib/**`), byte-mirrored to `apps/www/src/lib/`,
listed in the mirror manifest, carrying zero imports of anything
under `registry/files/ui/**` (the lib→ui reverse dependency is
gate-forbidden). The kernel imports NOTHING beyond `svelte` and
same-tree lib modules (env vocabulary owned in-kernel, providers
injected); the density item imports the kernel directly (the `Symbol.for`
structural seam is RETIRED — the plugin scope key is a
module-private symbol); defaults and paint remain kernel-free. (`locale.svelte.ts` already carries `$state` in
this tree — the runes-carrying kernel item extends an existing
shape, not a new one.) FAMILY tier: each `*-defaults.svelte.ts`
lives INSIDE its family folder as a member file of that
registry:ui item (mirrored pair, installed with the item).
registryDependencies SHALL reflect the real importers of the shared
tier (the gen-icons manifest precedent): the press-button,
icon-button, and button-group items gain their defaults files in
`files` and the two lib items in `registryDependencies`; the
density item gains `@jixoai/context-plugin`.

#### Scenario: a fresh consumer installs a component with ambient props

- GIVEN a registry consumer installs the press-button item
- WHEN the registry resolves its files and dependencies
- THEN the shared-tier defaults tool and paint axis module arrive
  as DIRECT registry dependencies, the kernel arrives TRANSITIVELY
  through the density item (press-button declares density for
  `densitySlot`; density declares the kernel) — the direct
  dependency faces of defaults and paint stay kernel-free, and
  every density consumer carries an installable plugin economy

#### Scenario: a fresh consumer installs the plugin economy

- GIVEN a registry consumer installs the density item
- WHEN the registry resolves its dependencies
- THEN the context-plugin kernel arrives as a registry:lib item
  and `definePlugin` products are installable outside the site

#### Scenario: the mirror gate

- GIVEN any defaults, axis, or kernel file edited on either side
- WHEN `verify:mirror` runs
- THEN the pair matches or the gate fails

#### Scenario: a family defaults file installs with its item

- GIVEN `@ui/press-button/press-button-defaults.svelte.ts` exists
- WHEN the item is installed
- THEN the defaults file arrives with it (same item payload, no
  separate registry entry)

### Requirement: the homepage consumes a validated featured projection

The homepage catalog SHALL render from a featured projection exported
by `catalog.ts` — an explicit item-ID list validated against the
derived catalog (unknown or duplicate IDs throw at build time). The
registry-total count SHALL render from the catalog and be labeled as
the registry total; the featured row count is a separate curated
number and the two SHALL NOT be equated.

#### Scenario: the count never drifts

- WHEN an item lands in or leaves `registry.json`
- THEN the labeled registry total reflects the catalog on the next
  page build with no hand edits

#### Scenario: a featured row outlives its item

- WHEN an item is deleted while still referenced by the featured ID
  list
- THEN the projection validation fails the build naming the ghost ID

### Requirement: the published artifact carries its custom domain

`build-site.mjs` SHALL emit a `CNAME` file (`ui.jixoai.com`) into
`public/` so every deploy re-attaches the custom domain to the Pages
artifact, and `deploy.yml` SHALL smoke-test the deployed domain
(`/`, `/r/registry.json`, `/r/press-button.json` — all HTTP 200)
after publish.

#### Scenario: a fresh checkout deploys

- GIVEN a clean clone on a fresh Pages target
- WHEN `build-site.mjs` runs and `deploy.yml` publishes
- THEN the artifact contains `CNAME` and the smoke job verifies
  `https://ui.jixoai.com/r/registry.json` returns 200

### Requirement: the CLI locks only verified installs

`jixoai-ui add`/`init` SHALL record an item in `jixoai-ui.lock` only
after EVERY one of the item's files exists on disk at its
alias-resolved install path (consumer-feedback-fixes, 2026-09-06). A
missing file SHALL keep the item OUT of the lock and print an explicit
warning listing the missing paths with the recovery guidance (move the
conflicting file aside — e.g. a hue-applied `jixoai.css` — and re-run
the add). This closes the locked-but-not-installed trap: a
non-interactive shadcn run whose overwrite confirmation hits EOF
cancels its whole write phase while the item would otherwise enter the
lock, after which `upgrade` reports the item as managed while nothing
is on disk.

After the add phase the CLI SHALL detect shadcn's literal-directory
misplacement (`src/@lib/**`, `src/@ui/**`, `src/vite-plugins/**` —
alias and plain targets dropped as literal paths) and relocate each
dropped file to its alias-resolved (or project-root) path, reporting
every move, before lock verification runs. Item-name parsing SHALL
skip `--`-prefixed tokens (flags never become `@jixoai/--help` item
names; `--help`/`-h` print the usage).

#### Scenario: an overwrite-cancelled install is not locked

- GIVEN a consumer with an existing `src/lib/jixoai.css` and piped
  stdin, adding `jixoai-theme` whose write phase is cancelled by the
  overwrite prompt hitting EOF
- WHEN the CLI's lock step runs
- THEN `jixoai-ui.lock` does NOT gain the item
- AND the warning names the missing path(s) and the move-aside retry
  guidance

#### Scenario: misplaced alias files are relocated and locked

- GIVEN an add that dropped `@lib/scrollbar-measure.ts` at
  `src/@lib/scrollbar-measure.ts`
- WHEN the CLI's relocation pass runs
- THEN the file moves to the alias-resolved `src/lib/scrollbar-measure.ts`,
  the move is reported, the emptied literal directory is removed
- AND the item locks with its files verified on disk

#### Scenario: flags never masquerade as items

- GIVEN `jixoai-ui add --help`
- THEN the usage text prints and no `shadcn add @jixoai/--help` runs

### Requirement: registry docs speak the consumer import dialect

Registry item documentation (`registry.json` docs strings, item source
header comments, READMEs) SHALL show consumer-side imports in the
SvelteKit import dialect (`import '$lib/…'`) — the `@lib/…` /
`@ui/…` spellings are the registry TARGET alias space (components.json
placement vocabulary), not import specifiers a consumer can write
(consumer-feedback-fixes, 2026-09-06). Where a doc must name the
install TARGET it may use the alias form, clearly as placement, never
inside an `import` statement.

#### Scenario: scrollbar-measure docs

- GIVEN the scrollbar-measure item's docs and file header
- WHEN a SvelteKit consumer copies the documented import
- THEN `import '$lib/scrollbar-measure';` compiles as written

### Requirement: engine items carry their out-of-the-box contract

An item backed by a rendering engine SHALL be installable with ZERO
manual wiring beyond the standard `jixoai-ui add`: the engine npm
packages (`katex`, `mermaid`) are declared in the item's
`dependencies` (shadcn installs them), and every asset the engine
needs rides the package itself — KaTeX's fonts arrive via the
`katex/dist/katex.min.css` import inside the lib file, resolved by the
consumer's bundler; mermaid needs no assets at all. No vite plugin, no
font directory, no manual CSS link is ever a prerequisite for these
items. The theming contract is the registry's own: surfaces bind the
`--tok-*`/semantic tokens and `currentColor` so the one-hue law and
light/dark inversion hold with no per-site diagram/math configuration.

#### Scenario: a consumer installs math with working fonts

- GIVEN a fresh SvelteKit consumer that runs `npx jixoai-ui add math-block`
- THEN `katex` lands in the consumer's package.json, the installed
  files import `$lib/katex`, and the rendered formulas paint in
  KaTeX's fonts with no additional wiring
- AND the verify:all shadcn-add consumer probe exercises exactly this
  path against the built payloads

#### Scenario: the theme follows the consumer's hue

- GIVEN a consumer initialized with `jixoai-ui init --hue 165`
- WHEN math and diagram surfaces render
- THEN error paint, diagram fills and strokes derive from the
  consumer's own token values — no engine-specific theme file exists
  to configure

### Requirement: syntax-standard naming for engine-backed surfaces

A ui item whose content syntax is an open STANDARD (LaTeX math) SHALL
carry a function name (`math-block`, `math-inline`) — the engine is an
implementation detail swappable behind the lib seam (`@jixoai/katex`);
a ui item whose syntax is proprietary to its engine SHALL carry the
engine's name (`mermaid`). The engine integrations themselves live as
lib items named for the engine (`katex`, `mermaid-engine` — the
`toc`/`toc-engine` precedent), so a future engine swap re-points one
lib item while the user-facing surface names survive.

#### Scenario: the naming audit holds

- GIVEN the registry index
- THEN `math-block` and `math-inline` exist as ui items with no engine
  name in the item name, `mermaid` exists as a ui item named exactly
  after its engine, and `katex` / `mermaid-engine` exist as lib items
  that the surfaces depend on via `@jixoai/*` edges

### Requirement: the engine matrix owns its dependency shape

The highlight engine items (per the highlight-engines spec) extend the
item file contracts with a matrix-specific dependency law: a UI item
whose capability is engine-backed (`code-card`) SHALL declare exactly its
DEFAULT engine in the closure (npm `shiki` via `@jixoai/highlight-shiki`
+ `@jixoai/highlight` core) — engine breadth is the CONSUMER's opt-in,
one `highlight-*` item per engine, never the item author's bundling
decision. This supersedes the earlier judgment where `code-card`
declared all three engines' npm packages (2026-09-02 → 2026-09-06,
breaking).

#### Scenario: the dependency closure gate

- **WHEN** verify:deps resolves `code-card`
- **THEN** its transitive npm set contains `shiki` and no other
  highlighting engine; the `highlight` core item contributes zero npm
  dependencies

### Requirement: wasm-capable items have two binary channels,
payload excluded

This requirement EXTENDS AND SUPERSEDES the single-channel sentence of
`item file contracts` (the wasm-asset prerequisite paragraph: "the
item documents the `@jixoai/vite-plugin` wiring as an install
prerequisite of equal rank to the tw4 law") — that build-plugin-only
channel becomes channel 1 of exactly two; the archive step SHALL merge
this amendment into the living spec's wording. Items whose runtime
needs a binary asset declare ONE of:

1. **build-plugin channel** (ghostty-term precedent): a pinned
   release artifact documented as `@jixoai/vite-plugin` wiring — for
   assets with no reliable npm distribution;
2. **npm-asset channel** (tree-sitter precedent, 2026-09-06): the
   binary ships inside declared npm packages and reaches the runtime
   through an explicit loader seam (browser: bundler-emitted HTTP
   asset URLs; Node: real bytes) — the lockfile is the supply chain,
   no pin manifest, no registry payload.

In both channels the registry payload itself NEVER carries a binary.

#### Scenario: tree-sitter rides the npm-asset channel

- **WHEN** `highlight-tree-sitter` is installed
- **THEN** its wasm binaries arrive exclusively through the
  `web-tree-sitter` / `tree-sitter-*` npm packages; no pin manifest
  exists for them and no `.wasm` enters the registry payload or git

### Requirement: the Icon component item renders type-safe named icons

The `@jixoai/icon` registry item (`registry/files/ui/icon/`) SHALL
provide a Svelte 5 component with props `name: IconName` (required,
type-safe — unknown names are compile errors), `size` (default 16),
`strokeWidth` (default 2), plus `class`/rest spread onto the `<svg>`
root. The component SHALL own the root element: viewBox from the
icon data, `width/height={size}`, currentColor painting by artwork
nature (stroke nature: `stroke="currentColor" fill="none"`; fill
nature the inverse), `stroke-width={strokeWidth}`, round caps/joins,
`aria-hidden="true"`, `data-jx-icon`; children render from the
icon's `d` payload (`{@html}` demoted from public API to an internal
render detail). The sync path (`getIcon` hit) SHALL render directly
in SSR; the lazy path SHALL render a size-reserved empty box pending
the chunk import and warn once on rejection. The item declares
`@jixoai/icon-set` + `@jixoai/jixoai-theme` in registryDependencies
(actual imports + the uniform theme prerequisite).

#### Scenario: an unknown name is a compile error

- GIVEN `<Icon name="chevronright" />` (typo) in a consumer
- WHEN svelte-check runs
- THEN the name fails against the `IconName` union

#### Scenario: SSR paints the core set with zero wiring

- GIVEN a server-rendered page using built-in names (inline core)
- WHEN the HTML is rendered
- THEN the icons' `<svg data-jx-icon>` markup is present in the
  server response (no hydration pop-in)

#### Scenario: per-instance overrides replace descendant-class hacks

- GIVEN `<Icon name="x" size={13} strokeWidth={2.5} />`
- WHEN it renders
- THEN the svg root carries width=height=13 and stroke-width=2.5 —
  no `[&_svg]:*` wrapper classes needed
