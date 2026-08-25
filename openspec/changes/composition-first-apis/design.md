# design — composition-first-apis

## Principles (research-grounded, r2 after Codex cross-validation)

```
consumer tree = structure    component context = state + behavior
─────────────────────────────────────────────────────────────────
LEGAL props                   ILLEGAL props
value/state (bindable)        items[] that renders <li> rows
behavior (activation)         config trees (nested children[])
variant/size enums            string→glyph (hint: '⌘P')
payload IS the value domain   keyed render-prop as the ONLY
  (options, targets, code,      content path (Snippet<[item,i]>)
   virtualized rows) — with
   snippet escapes for content
```

- The diagnostic (Fernando Rojo, "Composition Is All You Need"): when
  a prop changes WHAT renders rather than HOW, it must become a child
  component. `variant`/`orientation` change HOW — legal. `badges[]`,
  `steps[]` change WHAT — banned.
- Ecosystem granularity is the bar (Codex r1 C-verdicts): steps
  matches shadcn-vue Stepper part-for-part, timeline matches Dice UI
  anatomy, menubar/navigation-menu/alert-dialog match shadcn part
  granularity. No slimming below the ecosystem reference.

### The family context contract (Codex P0-4 closure — THE law)

```
1. Context carries STATE + BEHAVIOR (query, current, open-id,
   close-and-restore) — NEVER membership ORDER.
2. Ordinal state compares EXPLICIT per-item values (`step`, `value`
   props — shadcn-vue Stepper law). Registration order is never
   load-bearing: keyed {#each} reorders, conditional inserts and
   deletions cannot corrupt state.
3. Walking/filtering is DOM-DELEGATED where possible: keyboard walks
   query `[role=…]` scoped to the NEAREST container (closest()), so
   nested families never leak into each other's walks.
4. Metadata that cannot be read from the DOM (command match text)
   self-matches: each ITEM computes its own visibility against
   context state; groups/empty-states ride CSS :has(). No central
   ordered registry exists anywhere.
5. What must register (imperative handles for glide/show/hide)
   registers at component INIT (sync, SSR-executed) under a
   FAMILY-DEFINED stable derived key — panel families use
   `${itemId}-panel` (see the ID/handle protocol; NEVER the
   registrant's own $props.id()) — and unregisters onDestroy.
   onMount is never the only registration path (it does not run on
   the server).
6. Every part inherits the standing props discipline: `class` merges
   through cn() into the part's root element, `...rest` flows through
   verbatim, SSR output is semantically complete without hydration.
```

### Barrel law (Codex P1-1 closure)

Follow the tabs barrel precedent exactly — NO Root aliases: `export
{ default } from '<main>.svelte'` when a canonical main exists (Steps,
Timeline, Command, Menubar…), sub-parts as `export { default as
StepsItem }`, `export *` carries module types. list-item-style named
barrels when the group IS the root. index.ts is a pure barrel.

### The child({ props }) contract (Codex P1-2 closure, r3)

Interactive parts that render an element offer:

```ts
// per part, the CONCRETE element kind — never a bare union:
child?: Snippet<[{ props: HTMLAnchorAttributes & { class: string } }]>;   // link parts
child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;   // button parts
```

- Typed with the part's ONE concrete element kind from
  `svelte/elements` — no `any`, no `HTMLAttributes<T>` generic, no
  anchor|button unions (`&` binds tighter than `|`; a union would
  under-constrain the class). Where an element kind can switch
  (StepsIndicator span↔button), child() is offered ONLY on the
  interactive (button) form.
- Merge law (spread semantics are exact, not automatic): the part
  computes `props.class = cn(componentClasses)`; the consumer writes
  `{...props}` and appends own classes explicitly —
  `class={cn(props.class, 'own')}` — so consumer utilities win by
  the layer law (identical to plain `class` on any component).
  Consumer event handlers REPLACE part handlers (Svelte spread
  order — the consumer who overrides a handler owns its
  consequences); consumers overriding `role`/`aria-*` own the
  breakage — the semantics-preservation clause stands as the
  contract.
- The replacement element MUST preserve the part's role/semantics.
- Offered on: BreadcrumbLink, PaginationLink/Previous/Next,
  AnchorItem, TocLink, MenubarMenuItem, NavigationMenuItem (link
  form), StepsIndicator. Interactive parts only — never layout parts.

### Default-parts law (closure)

Families are EXPLICIT-PARTS (shadcn-vue/Dice law): an Item renders
ONLY what the consumer authors — no auto-inserted Indicator/Title/
Dot. The zero-config convenience lives in the docs demos' usage
snippets, not in the component. Two chrome exceptions ride CSS in the
family's `<item>.css` under the STANDING css-architecture law
(`@layer components` + `:where()` lowering — consumer utilities keep
winning):
`:where([data-jx-step-item]:last-child) [data-jx-step-separator]` and
`:where([data-jx-tl-item]:last-child) [data-jx-tl-connector]`
self-hide (REAL DOM hooks — component names never appear in the
DOM). Dot's hollow pending paint derives from the Item's
`data-jx-tl-pending` attribute (attribute paint, not part logic).

### Ordinal semantics (duplicate/gap ruling)

Ordinals are caller truth; paint is pure comparison (`step` vs
`current`), so there is nothing to corrupt and nothing to error on:
DUPLICATE ordinals paint every matching item as current;
GAPS mean no item equals `current` (nothing paints current, items
with `step < current` still paint done). Fixture table: `[0,1,2]`
normal · `[0,2]` with current=1 → done/inert(no current) ·
`[1,1]` with current=1 → both current. Comparison cannot lie.

### ID/handle protocol precision (final)

- The Item's id (explicit prop, else `$props.id()` — which MUST be a
  top-level initializer, tabs precedent) is IMMUTABLE after mount;
  changing it is caller error (dev-mode console warn). This is the
  default for EVERY family Item, NavigationMenuItem included
  (explicit id optional, generated id otherwise).
- ONE key space (r6 ruling): the PANEL is the only registrant — it
  registers under the DERIVED panel id `${item.id}-panel`, with:

```ts
interface PanelHandles { show(source?: HTMLElement): void; hide(): void }
interface FamilyContext {
  register(panelId: string, handles: PanelHandles): void;
  unregister(panelId: string): void;
  // state getters per family (openId, tabStop, …)
}
```

- Duplicate-id and sanitized-anchor-name collision detection
  (`foo/bar` vs `foo?bar` both → `foo-bar`) therefore cover every
  id that MATTERS: a collision is observable exactly when two
  panels register under one key or one anchorName — first
  registration wins (deterministic in production; later registrants
  are ignored and their handles never fire; dev-mode console
  error). Two panel-less Items sharing an id own no registry entry
  and no anchor usage — invisible and harmless.
- `anchorName` = `--jx-<family>-<sanitized-id>` (chars outside
  `[a-zA-Z0-9-]` collapse to `-`; collision detection above).
- The context object is instance-scoped — NEVER module state.
- `aria-controls` is the DETERMINISTIC derived id (`${id}-panel`) —
  the trigger renders it whether or not the panel currently exists;
  a trigger without any panel ever rendered is caller error. The
  wire never depends on render order.
- Panel-absent conditional rendering: the panel's handles unregister
  onDestroy; no ghost handle survives.

### Command selectors

- Item id: `$props.id()` (stable, top-level initializer).
- Visibility: the `hidden` ATTRIBUTE; walk/anchor selectors use
  `[role=option]:not([hidden]):not([aria-disabled='true'])` —
  disabled items render but never enter the activation path (the
  standing contract).
- Group self-hide: `[data-jx-command-group]:not(:has([role=option]:not([hidden])))`
  { display: none }; empty state: the list's
  `:not(:has([role=option]:not([hidden])))` reveals the
  `[data-jx-command-empty]` block.
- No-`:has()` fallback (@supports negative): groups and empty state
  stay visible (degraded-but-legal; the filter itself still works) —
  recorded, not engineered around.
- The predicate may only answer inclusion; a fixture asserts authored
  order is byte-stable under any custom predicate.

## The 17 redesigned items (canonical list — proposal/tasks/registry agree)

steps, timeline, descriptions, breadcrumb, pagination, anchor,
terminal-footer, menubar, navigation-menu, toggle-group, toc,
hero-section, tour, alert-dialog, popconfirm, command,
terminal-header.

## Per-component targets

### steps → Steps family (shadcn-vue Stepper anatomy, explicit ordinals)

```svelte
<Steps bind:current>                        <!-- ol; context; 0-based -->
  <StepsItem step={0} onclick={() => go(0)}><!-- li; state =
                                                 step</=/></> current;
                                                 data-jx-step={state} -->
    <StepsIndicator />                      <!-- number → ✓ when done;
                                                 THE button when
                                                 onclick + done (a11y:
                                                 the button is the
                                                 interactive element,
                                                 never the li) -->
    <StepsTitle>connect</StepsTitle>
    <StepsDescription>link the repo</StepsDescription>
    <StepsSeparator />                      <!-- self-hides on the
                                                 last item via
                                                 component css
                                                 :last-child -->
  </StepsItem>
</Steps>
```

- `step` is a REQUIRED explicit ordinal (shadcn-vue `:step` law) —
  state derives from `step` vs `current` alone; zero registration.
- `onclick` on the Item fires only from the done state and renders
  the Indicator as `<button>` (the current component's no-dead-
  affordance ruling, kept verbatim). No handler ⇒ inert span.
- Deliberate divergence from shadcn-vue, recorded: NO StepsTrigger
  part — the repo ruling is future steps are INERT (not-yet-reached
  places are not controls), so the interactive element is the done
  Indicator itself; an all-steps Trigger would violate the ruling.
  child() is offered on the Indicator's interactive form only.
- Explicit-parts law: Indicator/Title/Description/Separator are
  authored, never auto-inserted — the demos carry the canonical
  usage snippets.

### timeline → Timeline family (FULL Dice UI anatomy)

```svelte
<Timeline>                                  <!-- ol -->
  <TimelineItem pending>                    <!-- li; data-jx-tl-pending
                                                 (hollow dot + muted
                                                 title paint) -->
    <TimelineDot />                         <!-- the marker -->
    <TimelineConnector />                   <!-- the spine segment -->
    <TimelineContent>
      <TimelineTime datetime="…">14:02</TimelineTime>
      <TimelineTitle>deploy</TimelineTitle>
      …free children = body…
    </TimelineContent>
  </TimelineItem>
</Timeline>
```

- State model (Codex P0-3 closure): NO activeIndex — a timeline is a
  chronology display, not a stepper; the in-flight semantic is the
  item-level `pending` flag (the existing component's only state).
  The Dice UI activeIndex precedent is cited for STEPS only. The
  keyed `body(item, i)` snippet dies — body is plain children.
- Dot/Connector/Content/Title/Time are separate authored parts (Dice
  anatomy, Codex r1 verdict: the slimmed version was
  below-ecosystem). Explicit-parts law applies; Connector self-hides
  on `:last-child` (component css); Dot's hollow pending paint reads
  the Item's `data-jx-tl-pending` attribute.

### descriptions → dl grid + items composed

```svelte
<Descriptions columns={2} bordered>         <!-- dl grid; HOW-props -->
  <DescriptionsItem term="Owner">gaubee</DescriptionsItem>
</Descriptions>
```

- Rich cells are just children of the Item. `value: Snippet<[…]>`
  render-prop dies.

### breadcrumb → shadcn anatomy

```svelte
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbPage>leaf</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

- Auto-collapse becomes `BreadcrumbCollapse`, a part WRAPPING the
  collapsible middle items (caller opts in by nesting; no width
  magic in Root). BreadcrumbEllipsis for manual gaps.
- BreadcrumbLink offers `child({ props })`.

### pagination → shadcn parts + headless math (P0-2 closure)

- TODAY the component is fully closed (computes AND renders every
  link — the audit finding). THE TARGET kills that: the page-window
  math becomes an exported pure helper (`pagination-range.ts` in the
  folder, unit-tested), the links become parts:

```svelte
<Pagination>
  <PaginationContent>
    <PaginationItem><PaginationPrevious {href} /></PaginationItem>
    {#each pageRange({ current, total }) as page (page)}
      {#if page === 'ellipsis-start' || page === 'ellipsis-end'}
        <PaginationItem><PaginationEllipsis /></PaginationItem>
      {:else}
        <PaginationItem><PaginationLink page={page} {href} isActive={page === current}>{page}</PaginationLink></PaginationItem>
      {/if}
    {/each}
    <PaginationItem><PaginationNext {href} /></PaginationItem>
  </PaginationContent>
</Pagination>
```

- The helper returns page numbers interleaved with the two ellipsis
  TOKENS (`'ellipsis-start' | 'ellipsis-end'`) — consumers branch on
  the tokens (the r2 example rendered tokens as links; fixed r4).
  Signature is frozen:
  `pageRange(opts: { current: number; total: number; siblings?: number }): (number | 'ellipsis-start' | 'ellipsis-end')[]`.
  Link/Previous/Next offer child().

### anchor → scrollspy family (DOM-delegated)

```svelte
<Anchor>                                    <!-- nav; observer over the
                                                 document sections -->
  <AnchorItem href="#install">install</AnchorItem>
</Anchor>
```

- Root observes `#id` targets derived from ITS OWN DOM (queries
  child `a[href^="#"]` — DOM delegation, no registration), sets
  aria-current on the active item. AnchorItem offers child().

### terminal-footer → columns composed

```svelte
<TerminalFooter>                            <!-- footer chrome: © row -->
  <TerminalFooterColumn title="Product">
    <a href="/docs">docs</a>
  </TerminalFooterColumn>
</TerminalFooter>
```

### menubar → full part granularity (Radix/shadcn shape; Codex P0-5 + r3 ID protocol)

```svelte
<Menubar label="main">                      <!-- bar; roving tabindex;
                                                 glide; dismissal -->
  <MenubarItem id="file">                   <!-- the pairing unit =
                                                 Radix Menubar.Menu:
                                                 li + slot span with
                                                 anchor-name; owns the
                                                 ONE id -->
    <MenubarTrigger>File</MenubarTrigger>   <!-- button; children=label;
                                                 reads Item context -->
    <MenubarPanel>                          <!-- popover=manual panel;
                                                 children = content;
                                                 self-renders (top
                                                 layer makes DOM
                                                 position irrelevant) -->
      <MenubarMenuItem href="/open">Open…</MenubarMenuItem>
      <hr />
      <MenubarMenuItem onselect={…}>Close</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>
```

- **ID derivation protocol (r3, P0-2 closure):** the ITEM owns the
  single id — its own `$props.id()` (or an explicit `id` prop); Item
  context exposes `{ id, anchorName }`; Trigger derives
  `id={`${id}-trigger`}` + `aria-controls={`${id}-panel`}`; Panel
  derives `id={`${id}-panel`}` and registers its imperative handles
  under the PANEL id at init. The bar's walker resolves a trigger →
  panel through `aria-controls` — the derived id is always stable
  (see the ID/handle protocol; the wire never depends on render
  order).
  Radix mapping: Menubar↔Root, MenubarItem↔Menu, Trigger/Panel/
  MenuItem↔Trigger/Content/Item. NOT in scope (recorded, matching
  the repo's dropdown-menu norm): Radix's CheckboxItem/RadioItem/
  Sub/Label extension parts — submenu depth composes via nested
  dropdown-menu, which the scoping law now guarantees.
- ALL current behavior survives verbatim: ←/→ glide, ↓/Enter/↑ open,
  Home/End, panel menu contract, per-panel motion kernels,
  popover=manual own-dismissal.
- Nested-walker scoping (contract clause 3): panel walks match only
  entries whose `closest('[role=menu]')` is THIS panel. The same
  latent bug exists in dropdown-menu today; Batch C carries a
  drive-by fix.
- MenubarMenuItem = close-on-select item part (context
  closeAndRestore). Separators stay plain `<hr>` (W3C element law).

### navigation-menu → full part granularity on the Popover primitive

```svelte
<NavigationMenu label="site">               <!-- nav; arrow walk -->
  <NavigationMenuItem>                      <!-- wraps the Popover
                                                 primitive: trigger +
                                                 panel children -->
    <NavigationMenuTrigger>Product</NavigationMenuTrigger>
    <NavigationMenuPanel>                   <!-- consumer authors the
                                                 mega-grid INSIDE -->
      <NavigationMenuLink href="/x" active>…</NavigationMenuLink>
      …any markup…
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuLink href="/docs">docs</NavigationMenuLink><!-- bare -->
</NavigationMenu>
```

- Keeps riding the Popover primitive (declarative popovertarget,
  one-at-a-time, light dismiss, surface motion). Bare links compose
  directly. `hasPanel`/`navColumns`/keyed `panel(item)` die. Trigger
  vs link paint states (current/open) follow the existing order law.
  ID derivation follows the menubar protocol (Item owns the id,
  Trigger/Panel derive).
- Deliberate divergences from Radix (documented): no Viewport part —
  Radix's shared floating container is a portal implementation
  detail; per-panel CSS anchoring on native popover replaces it. No
  Indicator part — the active-trigger marker is paint (data attr +
  utilities), not structure.

### command → cmdk family, SELF-MATCHING items (no registry; P0-4 + P1-4 closure)

```svelte
<Command bind:open>                         <!-- dialog shell; query
                                                 state via context;
                                                 kb nav; hotkey; IME;
                                                 motion — verbatim -->
  <CommandInput placeholder="run…" />
  <CommandList>                             <!-- role=listbox -->
    <CommandEmpty>nothing matched</CommandEmpty>
    <CommandGroup heading="git">            <!-- group via nesting
                                                 context; hides itself
                                                 via CSS :has when all
                                                 its items are hidden -->
      <CommandItem label="git status" keywords="gs"
                   onselect={…} disabled={false}>
        git status                          <!-- children = rendered
                                                 content; label =
                                                 REQUIRED match text +
                                                 accessible name
                                                 (aria-label) -->
        {#snippet hint()}<Kbd>⌘S</Kbd>{/snippet}
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

- **Self-match law (contract clause 4):** each CommandItem computes
  its own visibility from context state — and the filter CONTRACT is
  a predicate, replacing the old array-sorting signature outright
  (no compat layer):

```ts
/** inclusion predicate — may only answer visible/hidden, never reorder */
match?: (item: { label: string; keywords?: string }, query: string) => boolean;
```

  Default match is a pure BOOLEAN inclusion predicate — the
  disjunction of text relations (label equals · label startsWith ·
  any label token startsWith · label includes · keywords includes);
  the old ranking ORDER is meaningless under the new contract and
  dies with it. NO central registry, NO order dependence; SSR
  renders every item visible; keyed reorders are inert.
- **Ordering law (cmdk):** filtering HIDES, never reorders — the
  authored tree order is the keyboard-walk order. The current
  rank-and-reorder semantics die with the closed API.
- Keyboard walk = DOM query over
  `[role=option]:not([hidden]):not([aria-disabled='true'])` inside
  the listbox (activedescendant ids = $props.id(), stable; disabled
  items never enter the walk, never become activedescendant, never
  fire onselect on Enter). Group
  headings: CommandGroup nesting context only (no `group` string on
  items); empty groups self-hide via CSS; CommandEmpty shows via the
  list's `:has()` inverse — all CSS, zero JS order logic.
- Selection: per-item `onselect` (cmdk law) + Root `closeOnSelect`
  default. `hint` is a snippet (kbd glyph is content).

### toc → one composed form + auto-derive as behavior (P1-5 + r3 P0-1 closure)

```svelte
<Toc outline={{ root: 'main' }} />          <!-- auto: derives from
                                                 headings (current
                                                 TocOutlineConfig
                                                 contract, kept);
                                                 renders THROUGH the
                                                 same parts; SSR
                                                 renders the rail
                                                 shell, links on
                                                 hydrate -->
<Toc>                                       <!-- manual: a legal list
                                                 tree — List/Item/
                                                 Link, NEVER nested
                                                 anchors -->
  <TocList>
    <TocItem>
      <TocLink href="#a">Setup</TocLink>
      <TocList>
        <TocItem><TocLink href="#a-1">deps</TocLink></TocItem>
      </TocList>
    </TocItem>
  </TocList>
</Toc>
```

- The r2 nested-TocLink sketch generated `<a><a>` — illegal; the r3
  anatomy splits structure (TocList ul / TocItem li) from the link
  (TocLink a), matching native nav-tree semantics.
- **SSR ruling (r4, the P0 closure):** outline mode is a DECLARED
  exception to the SSR-complete clause — the outline is a runtime DOM
  scan (headings do not exist at render time on the server), so it
  renders the rail shell server-side and derives links on hydrate
  (the current component's exact behavior). The manual composed tree
  and every other family remain SSR-complete. The exception is
  scoped in the spec delta: it applies to DOM-derived AUTO modes
  only, and the first paint still carries the nav landmark + shell.
- Prop stays `outline: TocOutlineConfig` (r2's string sketch was a
  typo against the current contract). `sections[...]` dies.
  Scrollspy + aria-current stay Root behavior. TocLink offers
  child().

### hero-section → title/badges/copy opened (P1-5 closure)

```svelte
<HeroSection eyebrow="jixoai ui" copyCommand="npx …">
  {#snippet title()}Ship <em>faster</em>{/snippet}   <!-- REAL named
                                                 snippet (the string-
                                                 with-HTML sketch was
                                                 invalid); default
                                                 keeps the split-em
                                                 styling on em -->
  {#snippet badges()}<Badge>OKLCH</Badge>…{/snippet}
  {#snippet terminal()}<TerminalCard … />{/snippet}
</HeroSection>
```

- `titleLead`+`titleAccent` merge into the `title` snippet;
  `badges: string[]` dies (caller composes Badge children); the copy
  CTA stays a default part (command string = payload) overridable by
  a `copy` snippet; `summary` stays a string (plain-text prop, HOW-
  free).

### tour → targets stay data, card opens (P1-5 closure)

```svelte
<Tour steps={[{ target: '#x', title: 'Connect', description: '…' }, …]}>
  {#snippet card(api)}                      <!-- api: {index, total,
                                                 step (the current
                                                 step object — its
                                                 title/description
                                                 are yours to render
                                                 or ignore), next,
                                                 prev, skip} -->
    <h3>{api.step.title}</h3><button onclick={api.next}>next</button>
  {/snippet}
</Tour>
```

- `steps[].target` is behavior-domain data (driver.js precedent).
  `title`/`description` are METADATA consumed by the DEFAULT card
  rendering — the spec's value-domain-with-escape scenario: the
  default card is the zero-config convenience, the `card` snippet is
  the structural path (it receives the current step's metadata —
  r3: the r2 api omitted it). Label props die.

### toggle-group → shadcn parity

```svelte
<ToggleGroup bind:value type="single|multiple">
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
</ToggleGroup>
```

### alert-dialog → shadcn-shaped composition (precise mapping, divergences recorded)

```svelte
<AlertDialog>                               <!-- state context only -->
  <AlertDialogTrigger>delete repo</AlertDialogTrigger>
  <AlertDialogContent>                      <!-- the dialog element;
                                                 focus trap, Escape=
                                                 cancel, scroll lock
                                                 verbatim -->
    <AlertDialogTitle>delete repo?</AlertDialogTitle>
    <AlertDialogDescription>this cannot be undone</AlertDialogDescription>
    <p>…free body…</p>
    <AlertDialogActions>
      <AlertDialogCancel>cancel</AlertDialogCancel>
      <AlertDialogAction>delete</AlertDialogAction>
    </AlertDialogActions>
  </AlertDialogContent>
</AlertDialog>
```

- shadcn-shaped mapping: Root/Trigger/Content/Title/Description/
  Actions(≈Footer)/Action/Cancel. Recorded divergences (native
  `<dialog>` law, not Radix portals): no Overlay/Portal/Header parts
  — the dialog element IS the overlay; Header is caller markup.
  `bind:open` + `onconfirm` stay on Root as the controlled seam.
  Action/Cancel keep their focus/restore contracts (cancel = safe
  default).
- popconfirm keeps the milder ruling: trigger = children, panel
  opens via `actions`/`content` snippets with the current default
  rendering (it is a compact confirm popover, not a page dialog —
  local-open principle).

### terminal-header → decomposed onto the menubar/nav machinery

```svelte
<TerminalHeader brand="…" domain="…" subtitle="…">
  {#snippet logo()}…{/snippet}
  {#snippet switcher()}…{/snippet}
  <NavigationMenu label="primary">           <!-- the ROOT — Items
                                                 need its context -->
    <NavigationMenuItem>
      <NavigationMenuTrigger>Product</NavigationMenuTrigger>
      <NavigationMenuPanel>…mega grid…</NavigationMenuPanel>
    </NavigationMenuItem>
  </NavigationMenu>
  <TerminalHeaderThemeActions />             <!-- the pair toggle -->
</TerminalHeader>
```

- The three-level config tree dies: the header chrome (bar, brand
  block, mobile drawer shell) stays a component; the NAVIGATION
  becomes composed NavigationMenu parts (Batch F rides Batch C's
  machinery). The docs-site header migrates as the first consumer.

## Declared exceptions (NOT redesigned here)

- **Option-domain controls** (select, combobox, cascader, tags-input,
  transfer, toast, language-switcher): the item IS the value domain —
  antd-shaped, not a structure violation — but none offer `.Item`
  composition for rich rows. Follow-up change
  `option-domain-composition` (bits-ui-style `.Item` families).
- **tree-view**: value-domain recursion with genuine per-node snippet
  surface (prefix/suffix/label + resolvers). Documented as legal
  value-domain API.
- **terminal-card / code-card / component-canvas / scroll-virtual**:
  content-by-value payload (code strings, Shiki output, TanStack
  virtualizer contract). The payload is data, not UI structure.

## Sources (research round)

- shadcn/ui docs — philosophy ("Open Code", "Composition: every
  component uses a common, composable interface"), Pagination,
  Breadcrumb, Empty, Field, Table, Sidebar, Carousel (all composed,
  zero data-array props): ui.shadcn.com/docs
- shadcn-vue Stepper (Reka UI): StepperItem/Trigger/Indicator/Title/
  Description/Separator + v-model + REQUIRED :step —
  shadcn-vue.com/docs/components/stepper
- Dice UI Timeline: Timeline/Dot/Connector/Content/Title/Time —
  diceui.com/docs/components/base/timeline
- shadcn-svelte: namespace barrels, implicit children snippets,
  child({props}) replacing asChild (Item/Sidebar docs) —
  shadcn-svelte.com/docs/components/{item,sidebar}.md
- Damian Ricobelli shadcn-stepper (defineStepper + compound parts,
  PR #318) — github.com/damianricobelli/shadcn-stepper
- Vercel Academy "Compound Components and Advanced Composition";
  Fernando Rojo "Composition Is All You Need" (the what-vs-how
  diagnostic); TkDodo "Type-Safe Compound Components".
- Codex design-review r1 (2026-08-25, gpt-5.6-terra xhigh): 4.5/10 —
  direction 8/10, protocol gaps closed in this r2 (context contract,
  explicit ordinals, self-match, ownership, granularity).
