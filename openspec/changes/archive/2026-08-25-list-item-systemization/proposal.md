# list-item-systemization — the Item family as a system (F7 coverage × shadcn composition)

> Owner request (2026-08-25): the shadcn-mirrored Item "fuses poorly
> with jixoai style" and shadcn's Item is a reference design, not a
> system. Study Framework7 (mobile-first, battle-tested list coverage)
> and land that coverage through shadcn-style slot composition +
> **auto-variant** — components switch chrome from context (standalone
> row carries its own border; inside a group, chrome transfers to the
> group). Design rounds: Codex r1 (v0 scored 5.5) → r2 converged 8.7
> (`.agents/documents/2026-08-25-list-item-systemization/`). Owner
> rulings: the five form-row adapters SHIP; chevron is the explicit
> `<ItemEnd><ItemChevron /></ItemEnd>` composition.

## What Changes

1. **Auto-variant policy seam** — ItemGroup provides a typed Svelte
   context policy (created once, reactive fields); Item stamps the
   pure-function resolution — `data-item-chrome/data-layout/
   data-size/data-selected` — on initial SSR AND on every relevant
   policy/prop update. CSS paints stamps only; group selectors are
   direct-child only.
2. **Roster 10 → 19 modules** — add `ItemEnd` (the one trailing lane:
   `ItemAfter` + `ItemActions` + `ItemChevron` live inside it, so the
   presence matrix keeps 4 bits), `ItemDivider` (replaces
   ItemSeparator), `ItemField` (settings-row scaffold: generated
   label/control/description/error IDs, typed `control` snippet), and
   five thin adapters `ItemToggle/ItemCheckbox/ItemRadio/ItemSelect/
   ItemInput` (ItemField + existing controls; reserved props sealed by
   compile-time Omit; native semantics/keyboard/form participation
   stay owned by the controls). DELETE: `ItemSeparator`, chevron
   inheritance (never existed yet), `--card` row fill, ad-hoc hover
   mixes. Groups become native `<section|div>` + `<ul>` with
   `mode=default|muted|plain`, boolean `inset`, `label`, and
   divider policy.
3. **Terminal restyle** — every surface rewires to the jixoai laws:
   standalone row = 1px `--border` + `--terminal-muted` + `--shadow-2xs`
   + bevel; group default = frame + 38% auto dividers + `--shadow-xs`;
   muted group = slab, no frame no dividers; plain = host-owned.
   Hover = `--terminal-hover`; selected = hover fill + `inset 2px 0 0
   var(--primary)` edge (menu-family divergence is principled);
   focus = inset 1px ring.
4. **Prelude bugfixes** (shipped defects found during investigation) —
   `ItemTitle`/`ItemDescription` drop `id`/ARIA (rest-forwarding added;
   today PlayRow's `aria-labelledby` points at no node across its
   current consumers), Item's stale-initial `class` capture,
   `icons.chevronRight`.
5. **Docs page rebuilt as proof surface** — 8 demo sections
   (standalone ladder, group modes, slot topology, media layout +
   narrow law, settings section with adapters, ItemField escape
   hatch, selection/links, accordion + checkbox-group recipes);
   PlayRow rebuilt on ItemField as the migration bridge.

## Impact

- `registry:ui/list-item` — 19 canonical files + css + barrel,
  byte-identical mirror at `apps/www/src/lib/ui/list-item/`;
  `registry.json` dependency list corrected to `@jixoai/toggle`,
  `@jixoai/checkbox`, `@jixoai/radio`, `@jixoai/native-select`,
  `@jixoai/input`, `@jixoai/icons`, `@jixoai/utils`,
  `@jixoai/jixoai-theme` (`separator` removed; install-closure proof
  via `scripts/verify-shadcn-add.mjs`); catalog text refresh.
- `$lib/icons` (+`chevronRight`), playground (`play-row.svelte` on
  ItemField; all current PlayRow consumers unchanged — inventory
  regenerated at execution time, counts drift under parallel work),
  list-item docs page + blueprint, `test/list-item.spec.ts` rewrite
  + browser geometry gate.
- **Out of v1** (docs recipes only): swipeout, sortable, virtual list
  (`scroll-virtual` exists), smart select, list index,
  pull-to-refresh, accordion morph.
