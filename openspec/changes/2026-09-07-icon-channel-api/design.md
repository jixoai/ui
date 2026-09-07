# design — icon-channel-api

## 0. The channel contract (the public base)

```ts
// @jixoai/ui-vite-plugin/icons/channel
export type IconChannelResolver =
  | { readonly kind: 'file'; readonly resolveFile(ref: string): string }  // ABSOLUTE svg path
  | { readonly kind: 'lucide' };  // THE built-in IconNode lane — the one reserved kind
export interface IconChannel {
  readonly id: string;             // /^[a-z][a-z0-9-]*$/, unique among registered
  readonly prefix: string;         // /^[a-z][a-z0-9]*$/, the ref namespace; 'lucide' reserved
  readonly peerPackage?: string;   // optional peer — named in install-hint errors
  readonly resolver: IconChannelResolver;
  readonly defaultsNote?: string;  // human-readable mapping note
}
export function defineIconChannel(spec: {
  readonly id: string; readonly prefix: string; readonly peerPackage?: string;
  readonly resolveFile(ref: string): string; readonly defaultsNote?: string;
}): IconChannel;  // ALWAYS builds a file-kind resolver — the lucide kind
                  // is constructed ONLY inside the plugin (…/icons/lucide
                  // exports the instance; defineIconChannel cannot forge it)
```

- Shape/grammar validation lives in `defineIconChannel`; SET-level
  uniqueness (id + prefix, the named-error law carried verbatim from
  the presets era) lives in `normalizeIconChannels` at config time —
  the one-argument factory cannot know the registered set (codex r1
  B1). The discriminated resolver ends the every-channel-has-
  resolveFile contradiction: file channels resolve through
  `ctx.loadSource`; the lucide kind routes to the existing
  `serializeLucideIcon` lane (resolve.ts discriminates on
  `resolver.kind`).
- Resolution ownership is UNCHANGED (frozen principle #4): the channel
  LOCATES (node resolution from the plugin's module context), the
  adapter READS through `ctx.loadSource` (mime law + watchFile HMR),
  and every resolved icon crosses the shared RAW safety → svgo →
  extract pipeline. A channel can therefore never smuggle unvetted
  bytes — custom channels get the same guarantees as built-ins for
  free.
- v1 channels are FILE-BACKED (`resolveFile` → .svg). Non-file
  resolution (package data à la lucide's IconNode) is the documented
  single built-in asymmetry; a resolver-object escape is future work.

## 1. The built-ins, rewritten as channels + sub-entries

```
@jixoai/ui-vite-plugin/icons/channel   — defineIconChannel + types (the base)
@jixoai/ui-vite-plugin/icons/lucide    — the default channel (an INSTANCE; zero-import)
@jixoai/ui-vite-plugin/icons/md        — md(options?) — material symbols
@jixoai/ui-vite-plugin/icons/ph        — ph(options?) — phosphor
@jixoai/ui-vite-plugin/icons/rx        — rx() — remixicon
```

- The four shipped channels are thin `defineIconChannel` calls — the
  presets/ directory dissolves into channels/ with per-channel modules
  that double as the sub-entry sources (tsdown entry per module; the
  exports map + per-entry dist purity gates extend packaging.test.ts).
- **lucide is a channel with one asymmetry**: `…/icons/lucide` exports
  the instance whose resolver is `{ kind: 'lucide' }` — routing to the
  EXISTING IconNode lane (`serializeLucideIcon`, the dynamic
  `import('lucide')`), never `resolveFile`. It is DEFAULT-REGISTERED:
  present in every library config without import (the Owner's "默认启用
  lucide"); `includeDefaults` keeps gating the 38-name manifest
  independently. Consequence: `lucide:` refs become SCANNABLE — a
  static `name="lucide:zap"` in consumer source packs through the
  channel exactly like `md:home` (uniformity; the per-icon-config pain
  the Owner cited dies for lucide too).
- **The manifest-collision law (codex r1 B2)**: a scanned `lucide:X`
  whose `X` is ALREADY packed (a built-in manifest name or a declared
  icon) does NOT pack a second payload — the generator emits an
  ALIASES row (`lucide:X` → `X`), so bytes stay single, every spelling
  resolves one payload, and iconCount counts canonicals. A scanned
  `lucide:X` with no packed `X` packs under the full `lucide:X` key
  (the dual-key coexistence precedent). Count/bytes/lookup behavior is
  test-locked both ways.
- `library.channels: IconChannel[]` REPLACES `library.presets` outright
  (bold break, unreleased API). Enabled prefixes = `lucide` ∪
  channels'. The config-face unknown-prefix error, the scanner's
  fail-safe skip, template-union emission, and the uniqueness laws all
  read from the one channel set — `lucide` stops being a special case
  in every one of those sites.

## 2. Package identity corrections

- `@jixoai/vite-plugin` → `@jixoai/ui-vite-plugin`;
  `@jixoai/css-laws` → `@jixoai/ui-css-laws` (inferred — Owner veto
  point). Mechanics: rename in both package.json files + every living
  import/reference (registry vite.config — keeping the dual-app
  byte-identity law with apps/www's, registry.json strings,
  scripts/verify-shadcn-add.mjs consumer templates + expectations,
  build-site/pin/client.d.ts self-references, docs pages + INSTALL
  blocks, READMEs, workspace links), then re-establish the file: links
  (the npm link-layer trap from the pipeline round), regen lockfile
  receipts, and update the packaging tests' name assertions. Archived
  openspec/changes/** references stay untouched — historical records.
- The dist layout is unchanged (relative imports); only the package
  NAME and the new sub-entries move.
- **Per-entry purity is NORMATIVE (codex r1 M4)**: the static module
  graph of `…/icons/channel`, `…/icons/md`, `…/icons/ph`, `…/icons/rx`
  SHALL NOT reach lucide, svgo, or opentype.js; `…/icons/lucide` SHALL
  NOT reach svgo or opentype.js. packaging.test.ts asserts each
  entry's graph (the umbrella precedent), plus each entry's exports,
  JS/d.ts outputs, and packed files.
- The css-laws rename is OWNER-CONFIRMED (2026-09-07):
  `@jixoai/ui-css-laws`, kept in THIS change by Owner ruling (the
  codex r1 split suggestion overruled); its generated-marker protocol
  (packages/css-laws/src/generate.ts embeds the package name in
  generated headers) MIGRATES with the rename and committed artifacts
  carrying old-name markers regenerate.

## 3. Dogfood + docs migration

- apps/www + registry vite.config.ts (byte-identical pair): import
  `md`/`ph`/`rx` from their sub-entries, `channels: [md(), ph(), rx()]`;
  the gen script mirrors the same config (the byte-equivalence law).
- The icons page: the preset table's rows re-key to the channel
  entries; a NEW "define your own channel" section with a real
  `defineIconChannel` example (a fictional `myco:` channel resolving
  from the consumer's own assets dir) + the sub-entry import table;
  the gallery's prose moves to channel vocabulary. The gen:icons
  numbers re-lock (43 → whatever the lucide-scan dogfood adds, if the
  docs page adopts a `lucide:` literal — decision: yes, one cell, so
  all three lanes — built-in, preset channel, custom channel story —
  are visible in one grid).

## 4. Out of scope

Non-file resolver channels; auto-registration side effects (channels
register only through config — no import-time magic); npm publishing
flow changes beyond the name; the css-laws PACKAGE's internals.
