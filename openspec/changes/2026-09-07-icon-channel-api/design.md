# design — icon-channel-api

## 0. The channel contract (the public base)

```ts
// @jixoai/ui-vite-plugin/icons/channel
export interface IconChannel {
  readonly id: string;             // unique among registered channels
  readonly prefix: string;         // the ref namespace: 'md' | 'myco' | …
  readonly peerPackage?: string;   // optional peer — named in install-hint errors
  readonly resolveFile(ref: string): string;  // ABSOLUTE svg path (node-resolved)
  readonly defaultsNote?: string;  // human-readable mapping note
}
export function defineIconChannel(spec: IconChannelSpec): IconChannel;
```

- `defineIconChannel` validates: prefix grammar `/^[a-z][a-z0-9]*$/`
  (never `lucide` — reserved), id + prefix uniqueness against the
  registered set (the named-error law carried over verbatim from the
  presets era), `resolveFile` is a function.
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
  the instance `{ id: 'lucide', prefix: 'lucide', … }` whose resolution
  rides the EXISTING IconNode lane (`serializeLucideIcon`, the dynamic
  `import('lucide')`) — not `resolveFile`. It is DEFAULT-REGISTERED:
  present in every library config without import (the Owner's "默认启用
  lucide"); `includeDefaults` keeps gating the 38-name manifest
  independently. Consequence: `lucide:` refs become SCANNABLE — a
  static `name="lucide:zap"` in consumer source packs through the
  channel exactly like `md:home` (uniformity; the per-icon-config pain
  the Owner cited dies for lucide too).
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
