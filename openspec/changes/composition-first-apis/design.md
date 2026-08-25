# design — composition-first-apis

## Principles (research-grounded)

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
- Ordinal state props survive: shadcn-vue Stepper `v-model`, Dice UI
  Timeline `activeIndex` both prove `current`-style bindables are the
  composed-ecosystem norm. State ≠ structure.
- Svelte 5 mechanics: namespace barrels (`import * as Steps`),
  implicit `children` snippets, `child({ props })` for element
  replacement (shadcn-svelte Item/Sidebar docs). Registration families
  reuse the in-repo tabs context pattern (`Symbol.for('jx-…')`).
- Family files follow list-item/tabs precedent: one part per file +
  index.ts barrel exporting short names AND `Root` aliases.

## Per-component targets

### steps → Steps family (shadcn-vue Stepper shape, tabs mechanics)

```svelte
<Steps bind:current>                    <!-- ol; context; connector css -->
  <StepsItem onclick={() => go(0)}>     <!-- li; registers order; state
                                            done/current/todo derived;
                                            data-jx-step={state}; done +
                                            onclick ⇒ marker is a button -->
    <StepsItemTitle>connect</StepsItemTitle>
    <StepsItemDescription>link the repo</StepsItemDescription>
  </StepsItem>
  …
</Steps>
```

- Marker (number → ✓-when-done) stays INSIDE StepsItem: it is
  state-driven chrome, not content. Optional `marker?: Snippet`
  override for custom glyphs.
- `onstepclick` dies; per-item `onclick` (fires only from done state,
  the existing ruling). `current` bindable, index = registration order.

### timeline → Timeline family (Dice UI anatomy, slimmed)

```svelte
<Timeline>                              <!-- ol; spine css -->
  <TimelineItem pending>                <!-- li; data-jx-tl-pending -->
    <TimelineTime datetime="…">14:02</TimelineTime>
    <TimelineTitle>deploy</TimelineTitle>
    …free children = body…              <!-- keyed body(item,i) dies -->
  </TimelineItem>
</Timeline>
```

- Dot + spine stay built-in (structural chrome); pending paint via
  the data attribute (css layer law). Time/title are parts so the
  font-nav/mono paint stays system-owned.

### descriptions → dl grid + items composed

```svelte
<Descriptions columns={2} bordered>     <!-- dl grid; layout props stay -->
  <DescriptionsItem term="Owner">gaubee</DescriptionsItem>
  …children of Item = the dd value, any markup…
</Descriptions>
```

- `columns`/`bordered` are HOW-props → legal. `value: Snippet<[…]>`
  render-prop dies; rich cells are just children.

### breadcrumb → shadcn anatomy

```svelte
<Breadcrumb>                            <!-- nav -->
  <BreadcrumbList>                      <!-- ol -->
    <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbPage>leaf</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

- Decision — auto-collapse: the middle-crumbs ellipsis behavior moves
  into `BreadcrumbCollapse`, a part WRAPPING the collapsible middle
  items (still composed: caller opts in by nesting). No width-triggered
  magic in Root.
- BreadcrumbLink accepts `child({props})` for non-`<a>` renderers.

### pagination → shadcn parts + headless math

```svelte
<Pagination>
  <PaginationContent>                   <!-- ul -->
    <PaginationItem><PaginationPrevious {href} /></PaginationItem>
    {#each pageRange({ current, total }) as page}   <!-- lib helper -->
      <PaginationItem><PaginationLink {page} {href} isActive={…}>…</PaginationLink></PaginationItem>
    {/each}
    <PaginationItem><PaginationEllipsis /> / <PaginationNext {href} /></PaginationItem>
  </PaginationContent>
</Pagination>
```

- Computed UI answer: the page-window MATH becomes a pure exported
  helper (`pagination-range.ts` in the folder, tested); the LINKS
  become parts. shadcn parity, zero logic loss.

### anchor → scrollspy family

```svelte
<Anchor>                                <!-- nav; IntersectionObserver -->
  <AnchorItem href="#install">install</AnchorItem>   <!-- registers;
                                                          aria-current
                                                          when active -->
</Anchor>
```

### terminal-footer → columns composed

```svelte
<TerminalFooter>                        <!-- footer chrome: © row, grid -->
  <TerminalFooterColumn title="Product">
    <a href="/docs">docs</a> …free links…
  </TerminalFooterColumn>
  </TerminalFooterColumn>
</TerminalFooter>
```

### menubar / navigation-menu → dropdown-menu family shape

The repo ALREADY has the composed answer: dropdown-menu. Mirror it:

```svelte
<Menubar>                               <!-- bar; roving tabindex -->
  <MenubarItem>                         <!-- trigger = label children -->
    File
    <MenubarPanel>…free content, any markup…</MenubarPanel>
  </MenubarItem>
</Menubar>
```

- `panel: Snippet<[item]>` keyed render-prop dies — panel content is
  Panel children. navigation-menu identical (`NavMenuItem` +
  `NavMenuPanel`); the mega-panel GRID is authored by the consumer
  inside the panel (kills `hasPanel`, `navColumns`).
- Popover/ARIA machinery copies from dropdown-menu verbatim (and rides
  the surface-motion kernel per surface-kernel-adoption).

### command → cmdk-style family (biggest rebuild)

```svelte
<Command bind:open onselect={…}>        <!-- dialog shell; query state;
                                            filter ctx; kb nav -->
  <CommandInput placeholder="run…" />
  <CommandList>                          <!-- listbox; computes the
                                            visible set -->
    <CommandEmpty>nothing</CommandEmpty>
    <CommandGroup heading="git">
      <CommandItem keywords="status" onselect={…}>
        git status
        {#snippet hint()}<Kbd>⌘S</Kbd>{/snippet}   <!-- snippet, not
                                                        string glyph -->
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

- Items REGISTER `{label, keywords, group, disabled}` to context on
  mount; Root filters against query (default substring/fuzzy, custom
  `filter` prop stays — behavior domain). Zero-config filtering
  survives; structure escapes.

### toc → one composed form + auto-derive as behavior

```svelte
<Toc from="main" />                     <!-- auto: derives links from
                                            headings, renders THROUGH
                                            the same parts internally -->
<Toc>                                   <!-- manual: composed -->
  <TocLink href="#a">Setup
    <TocLink href="#a-1">deps</TocLink>
  </TocLink>
</Toc>
```

- `sections[{id,label,children[]}]` dies. Scrollspy/aria-current stays
  Root behavior. Nesting = nested TocLink children.

### hero-section → title/badges/copy opened

```svelte
<HeroSection eyebrow="jixoai ui"
             title="Ship <em>faster</em>"     <!-- children snippet; em
                                                  styled by the sheet -->
             badges={[…]}          →  DIES
             copyCommand="npx …">  →  stays as data + copy BUTTON part
  {#snippet badges()}<Badge>OKLCH</Badge>…{/snippet}
  {#snippet terminal()}<TerminalCard … />{/snippet}
{/HeroSection}
```

- `titleLead`+`titleAccent` merge into one `title` snippet (default
  keeps the split styling via `em`). Badges row = caller's Badge
  composition. Copy CTA stays a default part (command string is
  payload), overridable by a `copy` snippet.

### tour → targets stay data, card opens

```svelte
<Tour steps={[{ target: '#x' }, …]}>    <!-- targets = behavior domain
                                            (driver.js precedent) -->
  {#snippet card(api)}                  <!-- api: {index, total, next,
                                            prev, skip} -->
    <h3>…</h3> <p>…</p> <button onclick={api.next}>next</button>
  {#snippet}
</Tour>
```

- Default card (title/desc/counter/skip/prev/next) remains the
  built-in rendering when no snippet is passed; label props die.

### toggle-group → shadcn parity

```svelte
<ToggleGroup bind:value type="single|multiple">
  <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
</ToggleGroup>
```

### alert-dialog / popconfirm → action rows opened

- alert-dialog: `title`/`description` stay (semantic strings, antd
  flavor, the dialog IS one-shot), action row becomes an `actions`
  snippet with the current confirm/cancel Buttons as DEFAULT.
- popconfirm: same ruling on its panel row.

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
  Description/Separator + v-model — shadcn-vue.com/docs/components/
  stepper
- Dice UI Timeline: Timeline/Dot/Connector/Content/Title/Time +
  activeIndex data-status — diceui.com/docs/components/base/timeline
- shadcn-svelte: namespace barrels, implicit children snippets,
  child({props}) replacing asChild (Item/Sidebar docs) —
  shadcn-svelte.com/docs/components/{item,sidebar}.md
- Damian Ricobelli shadcn-stepper (defineStepper + compound parts,
  PR #318) — github.com/damianricobelli/shadcn-stepper
- Vercel Academy "Compound Components and Advanced Composition"
  (DataTable god-component anti-pattern);
  Fernando Rojo "Composition Is All You Need" (the what-vs-how
  diagnostic); TkDodo "Type-Safe Compound Components" (honest caveat:
  compound fits mostly-static content — our demos agree).
