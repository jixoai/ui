# composition-first-apis — structure leaves the props, composition owns the tree

> Owner request (2026-08-25): `steps={[{ title: 'connect' }, …]}` is the
> wrong shape. Expose the underlying parts; developers compose with
> snippets/slots. Attribute-declared UI is only for strictly confined
> cases. The registry has drifted from the shadcn philosophy — audit
> everything, fix it as a breaking change, no back-compat.

## What Changes

1. **A new law in component-authoring** (spec delta attached):
   repeated/nested UI structure is authored in the CONSUMER's tree as
   family parts. Data-array props that own markup (`items`/`steps`/
   `sections`/`crumbs`/`links`/`nodes` → renders `<li>` rows), keyed
   render-props as the only content path (`Snippet<[item, index]>`),
   string→glyph mappings (`hint: '⌘P'`), and config trees with nested
   `children[]` are BANNED for structure. State props (`current`,
   bindable), behavior props (`activation`, `orientation`), variant
   enums, and value/behavior-domain data (select options, tour
   targets, virtualized rows) remain legal — the latter only with
   snippet escapes for content.

2. **17 components redesigned to compound families** (design.md has
   every target API + the canonical list: steps, timeline,
   descriptions, breadcrumb, pagination, anchor, terminal-footer,
   menubar, navigation-menu, toggle-group, toc, hero-section, tour,
   alert-dialog, popconfirm, command, terminal-header). Audit
   verdicts across all 75 registered items:

```
PROP-DRIVEN (structure locked behind data)   → redesigned here
  terminal-header   3-level config tree: items[].children[Group[].items[]]
  command           whole palette behind items[{id,label,group,hint}]
  tour              step card behind steps[{target,title,description}]
  menubar           bar behind items[] + panel(item) render-prop ONLY
  navigation-menu   same shape as menubar
  toc               rail behind sections[{id,label,children[]}]
  steps             marker/✓/text behind steps[{title,description?}]
  timeline          dots/text behind items[] + body(item,i) escape
  descriptions      dl behind items[{term,value}] + value(item,i) escape
  hero-section      headline split/badge row/copy CTA prop-owned
  anchor            links behind items[{href,label}]
  breadcrumb        trail behind crumbs[{label,href}]
  terminal-footer   columns behind links[{label,href}]
  pagination        TODAY fully closed (computes AND renders every
                    link — the audit finding); target kills that: the
                    window math becomes a pure helper, links compose
  toggle-group      buttons behind options[{value,label}]
HYBRID (mild)                                 → opened here
  alert-dialog / popconfirm  string-locked content + action rows
DECLARED EXCEPTIONS (documented, not touched)
  select/combobox/cascader/tags-input/transfer/toast/language-switcher
    option-DOMAIN controls (item IS the value) → follow-up change
  tree-view      value-domain recursion + real snippet surface already
  terminal-card / code-card / component-canvas / scroll-virtual
    content-by-value payload (code strings, virtualizer contract)
```

3. **Ecosystem alignment** (research round, design.md sources): the
   official shadcn families never take item arrays (Pagination,
   Breadcrumb, Carousel, Empty, Field, Table, Sidebar — all composed).
   shadcn-vue's Stepper and Dice UI's Timeline are the reference
   anatomy for steps/timeline. Our targets match them with two
   RECORDED divergences (design.md): steps ships no Trigger part
   (the repo's future-steps-inert ruling — the done Indicator is
   the interactive element) and timeline ships no activeIndex
   (chronology display; pending is item-level). shadcn-svelte's
   Svelte 5 translation rules apply: namespace barrels, implicit
   children snippets, `child({props})` replacing asChild.

## Impact

- registry/files/ui/{17 components} + mirrors at apps/www/src/lib/ui
  + their docs demos (apps/www/src/routes/docs/components/*.html) +
  affected tests. terminal-header is consumed by the docs site header
  itself — site chrome migrates with it. dropdown-menu gains a
  drive-by nested-walker scoping fix (same latent bug the menubar
  redesign closes).
- registry.json: new family files per item — integrator-only edits
  (subagents report, never touch shared manifests).
- BREAKING: every redesigned component's props contract is replaced
  outright. No deprecation shims (owner ruling: no back-compat).
- New spec requirement makes the posture auditable going forward.

## Verification

`pnpm build` (payload parity), `pnpm verify:mirror`,
`pnpm --dir apps/www exec vitest run`,
`node scripts/verify-hook-law.mjs`, plus the composition-law probe
(new `scripts/verify-composition-law.mjs`, structured allowlist —
see verification.md). Dev-server walkthrough of the 17 demo pages.
Execution per the orchestration law: 6 parallel
subagent batches on non-overlapping file sets, ZCode integrates +
gates + commits per batch, Codex review round at the milestone
(Herdr, async).
