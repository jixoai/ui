# icon-channel-api — channels as the public plugin surface + the package-name corrections

## Why

The preset + scanner lanes landed (2026-09-07-icon-library-presets /
-icon-prefix-compiler) and the docs site dogfoods them — but the
capability they expose is still INTERNAL: a consumer who wants their own
icon source still configures icons one by one. The Owner's direction
(2026-09-07, post-dogfood): the CHANNEL is the product — expose the
underlying custom-channel capability so ONE channel definition replaces
per-icon configuration, and rewrite every built-in lane (`lucide:`,
`md:`, `ph:`, `rx:`) on top of it, pluginized as independent import
entries of the same package: `@jixoai/ui-vite-plugin/icons/[lucide|md|…]`
— lucide enabled by default, everything else opt-in by import. And the
package names themselves are wrong: `@jixoai/vite-plugin` SHALL be
`@jixoai/ui-vite-plugin` (the Owner's stated name), and `@jixoai/css-laws`
gets the same correction (inferred `@jixoai/ui-css-laws` — flagged for
the Owner to veto in review).

## What Changes

1. **`defineIconChannel` — the public base** (sub-entry
   `…/icons/channel`): one call defines a channel — `{ id, prefix,
   peerPackage?, resolveFile(ref) }` — with validation (prefix grammar,
   id/prefix uniqueness). A channel is registered through
   `library.channels: IconChannel[]`; its prefix immediately works
   everywhere a built-in prefix does today: config `icons` refs, source
   scanning (`name="myco:logo"`), template union members, and the
   enabled-prefix laws.
2. **The built-ins rewrite onto the base and pluginize** (sub-entries
   `…/icons/md` `…/icons/ph` `…/icons/rx`): each exports its factory
   (`md({ weight, style, fill })`, `ph({ weight })`, `rx()`). `lucide`
   becomes a channel too (`…/icons/lucide` exports the instance) with
   one v1 asymmetry, documented: it resolves through the existing
   IconNode lane (`serializeLucideIcon`), not per-icon SVG files, so it
   stays default-registered (zero-import) and its `lucide:` refs become
   SCANNABLE like every other channel prefix.
3. **`library.presets` retires** (bold break, the icons.ts precedent):
   `library.channels` is the surface; the shipped shorthand strings die.
   Unreleased API (landed hours ago), no compat layer.
4. **Package renames**: `@jixoai/vite-plugin` → `@jixoai/ui-vite-plugin`
   and `@jixoai/css-laws` → `@jixoai/ui-css-laws` across every LIVING
   reference (configs, registry.json strings, scripts, docs pages,
   INSTALL blocks, consumer templates, lockfiles, self-references).
   Archived openspec docs stay untouched — they are records of their
   time.
5. **The dogfood migrates**: apps/www's config imports the md/ph/rx
   factories from their sub-entries; the docs page's gallery + prose
   move to channel vocabulary.

## Impact

- `packages/vite-plugin`: presets/ rewrite into channels/ + the new
  sub-entries + exports map (+ per-entry purity gates); config/resolve/
  scan/generate operate on channels uniformly (lucide included).
- `packages/css-laws` + root workspace: rename + consumers.
- Every `@jixoai/vite-plugin` import site (~70 files, ~15 of them
  archived-open spec docs that stay untouched).
- Gates: packaging (name + sub-entries), budgets re-record expectation
  (B-consumer-*), verify:shadcn-add consumer templates, mirror, the
  www suites, plugin suite (channel-rewritten preset tests).
- docs: icons page (channel API section, gallery wording), the INSTALL
  blocks, READMEs.
