# Proposal C — the CodeCanvas same-source extraction (R3-②)

Designer: subagent round 1. The Owner's pseudocode
(`<CodeCanvas id>` + `resolveRawCode("some-id")` in CodeFile
templates) is the requirement statement; this proposal reconciles it
with the repo's real machinery. See review for the attack round.

## §0 The drift, precisely
38 pages author `kind:'usage'` template literals in script while the
canvas children live in markup — nothing mechanical keeps them equal
(blockquote's TWO canvases share one usage string today; link's usage
shows three bare lines while the canvas renders two composed
paragraphs — the exact drift the Owner named).

## §1 Mechanism: per-page virtual module (a `canvas` feature of @jixoai/vite-plugin)
`virtual:jixoai-canvas/<route-rel>/+page` — the page imports
`canvasCode`; the plugin's resolveId maps to the page file, load()
parses with svelte/compiler `parse()` (AST, not regex), extracts each
`<ComponentCanvas id="x">` children slice, emits a pure-data JS
module (JSON.stringify + U+2028/29 escapes). Ruled OVER:
- (a) Svelte preprocessor injection — the escaping minefield comes
  home (injected constants live in .svelte source; the U+2028/perl
  correction-log class re-arms), sourcemap/diff noise, config-edit
  count identical to (b) minus the Owner's named vehicle.
- (c) ?raw self-import + runtime regex slice — no parser at runtime,
  whole-page raw rides the client bundle (15-30KB × 38 pages vs
  verify-budgets), no compile-time validation (silent drift, the
  anti-law).
Fits the Owner's named vehicle; the package owns every pattern
(virtual ids/\0, pure-data SSR-safe modules = ghostty, named errors,
the bridge keeping svelte-parser out of the entry graph). Costs:
both vite.config twins gain the option (byte-identical, gate 3.5);
vitest.config gains the plugin; svelte = optional peerDep.

## §2 API: extension, not new components
CodeCanvas/CodeTree/CodeFile REJECTED (the drawer's tree-pane shape
is the Owner-reverted shipped form; CodeFile duplicates TreeFile; and
the registry-mirror law forbids the canvas importing app machinery —
the map is consumed PAGE-side as plain strings). Surface:
```svelte
import { canvasCode } from 'virtual:jixoai-canvas/docs/components/blockquote.html/+page';
import { usageFile } from '$lib/canvas-usage';
const usage = usageFile({ Blockquote: '@ui/blockquote' }, canvasCode('rungs'));
// files: TreeFile[] carries { name:'src/lib/ui/…-usage.svelte', content: usage, kind:'usage' }
```
- `canvasCode(id)` (= the sketch's resolveRawCode; name follows the
  registrySourceUrl vocabulary — Owner may override): named-error on
  miss listing the page's real ids (prerender fails loudly).
- `usageFile(imports, body, {script?})`: builds the script header +
  body; `</script>` concatenation lives in a .ts module where the
  literal is harmless — the `const close` dodge dies on every
  migrated page; the script hole carries page-state consts (markdown
  pilot).
- ComponentCanvas: ZERO code changes — `id` already exists (aria
  override) and becomes the extraction key; migrating pages adding
  ids concurrently fixes blockquote's latent aria collision (two
  same-title canvases slug-collide today). resolveFileContent (live
  state) still overrides at render time — extraction composes the
  BASE. Drawer default-selection (usage kind) unchanged.

## §3 Extraction pipeline (pure core)
packages/vite-plugin/src/canvas/extract.ts — `(source) →
Record<id,string>` + canvasIds: parse → walk html for ComponentCanvas
elements → id must be static (missing = skip = unmigrated zero-cost;
duplicate = named error) → children source slice → strip ONLY
direct-child {#snippet} blocks (canvas protocol; nested snippets are
demo content, kept) → keep comments (pedagogy; byte-honesty) → dedent
min common indentation, trim outer blanks, nothing else → JSON emit
(+U+2028/29). Specifier grammar `virtual:jixoai-canvas/<rel>/+page` →
root-joined .svelte with path validation + named errors.
client.d.ts declares the module family (the icons chunk precedent).

## §4 Migration (machinery + 5 pilots, NOT the fleet)
Plugin (option default OFF, icons precedent) + config twins +
vitest.config + $lib/canvas-usage.ts; pilots: blockquote, link,
list, prose, markdown (per-canvas ids; split shared canvasFiles;
replace usage consts + close dodges; Usage SectionCard feeds from the
same composed const — one source two surfaces). Docs amendment on
component-canvas.html. Fleet sweep = follow-up change + a
verify-docs lint (no hand-authored usage on migrated pages).

## §5 Tests
Extraction unit spec (dedent/snippet-strip/comments/dup-error/skip/
multi/empty); plugin spec (resolveId/load/validation/round-trip/
addWatchFile HMR in a real dev server); the page drift gate
(canvas-same-source.spec.ts — every id ↔ every canvasCode call +
inline snapshots of each extracted block: human-reviewable drift
proof); rendered parity through the real virtual module + one
drawer-mount containing the composed usage.

## §6 Open questions
1. canvasCode vs resolveRawCode naming; the extension-over-new-
   components ruling confirm.
2. Honest extraction keeps layout wrappers + comments (longer usage
   files than today's distilled samples) — or an opt-out elide
   marker; recommendation: honest first.
3. Per-canvas opt-in policy (no id = no extraction), fleet lint only
   on migrated pages — confirm.
4. Auto-derived imports in the wrapper (identifier→@ui mapping) —
   follow-up, hand-authored wrapper per the sketch.
5. svelte optional peerDep on the published plugin vs www-private
   until a second consumer.
6. HMR invalidation needs a live dev probe — priced as a task.
7. ADJACENT FINDING: svelte.config.js twins already drifted
   (registry copy missing link/list/prose prerender entries; only
   vite.config is gate-enforced) — separate one-line fix + candidate
   gate-3.5 spirit extension.
