<!--
  Docs page for the list-item family (openspec
  list-item-systemization task 5 — the eight-section proof surface).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One ComponentCanvas: the base composition (the end lane).
  3. Proof sections: standalone ladder (auto-variant), group modes,
     slot topology, media layout + the narrow container law, the
     settings section (five adapters), the ItemField escape hatch,
     selection & links, recipes (accordion + checkbox group).
  4. Usage CodeBlock: the copyable composition sample (the canvas
     drawer shares the same string).
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { icons } from '$lib/icons';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
  import {
    Item,
    ItemGroup,
    ItemDivider,
    ItemEnd,
    ItemAfter,
    ItemChevron,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    ItemHeader,
    ItemFooter,
    ItemField,
    ItemToggle,
    ItemCheckbox,
    ItemRadio,
    ItemSelect,
    ItemInput,
  } from '$lib/ui/list-item/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import itemSource from '$lib/ui/list-item/item.svelte?raw';
  import itemCssSource from '$lib/ui/list-item/item.css?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'list-item');
  if (!entry) {
    throw new Error('catalog miss: "list-item" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemEnd,
    ItemActions,
  } from '@ui/list-item/index';
  import IconButton from '@ui/icon-button/icon-button.svelte';
  import { icons } from '@lib/icons';
${close}

<!-- ItemContent is the required slot; media/end/header/footer are
     presence-optional — their existence rewrites the grid template. -->
<Item variant="outline">
  <ItemContent>
    <ItemTitle>Deploy #482</ItemTitle>
    <ItemDescription>main · 4f2a1c · 2 minutes ago</ItemDescription>
  </ItemContent>
  <ItemEnd>
    <ItemActions>
      <IconButton iconOnly text="Rerun deploy">
        {#snippet icon()}{@html icons.check}{/snippet}
      </IconButton>
    </ItemActions>
  </ItemEnd>
</Item>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/list-item/item.svelte', content: itemSource },
    { name: 'registry/files/ui/list-item/item.css', content: itemCssSource },
    { name: 'src/lib/ui/list-item-usage.svelte', content: usage, kind: 'usage' },
  ];

  // settings-section state (the adapters prove binding/disabled/error live)
  let autoplay = $state(true);
  let telemetry = $state(false);
  let density = $state('default');
  let projectName = $state('');

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>List item · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai list-item family: a GRID row with a :has()-driven presence matrix and AUTO-VARIANT chrome — standalone rows carry their own terminal surface, groups own the frame. Native ul/li groups, the ItemEnd trailing lane (after · actions · chevron), ItemField + five settings-row adapters, divider policy, media layout and the 30rem container wrap."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="list-item — the row, as a system"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">auto-variant chrome</span>
          <span class="pill">native ul/li groups</span>
          <span class="pill">ItemEnd trailing lane</span>
          <span class="pill">ItemField + 5 adapters</span>
          <span class="pill">grid + :has() presence matrix</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="list-item"
        description="The base composition: ItemContent (title + description) and the ItemEnd lane on an outline Item. Every other slot is optional — the grid template rewrites itself around what exists."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/list-item/item.svelte"
        files={canvasFiles}
        stage="fill"
      >
        <div class="w-full max-w-lg">
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>Deploy #482</ItemTitle>
              <ItemDescription>main · 4f2a1c · 2 minutes ago</ItemDescription>
            </ItemContent>
            <ItemEnd>
              <ItemActions>
                <IconButton iconOnly text="Rerun deploy" class="size-7!">
                  {#snippet icon()}{@html icons.check}{/snippet}
                </IconButton>
                <IconButton iconOnly text="More actions" class="size-7!">
                  {#snippet icon()}{@html icons.ellipsis}{/snippet}
                </IconButton>
              </ItemActions>
            </ItemEnd>
          </Item>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              zero layout props on purpose: <code class="text-accent">variant</code> and
              <code class="text-accent">size</code> are geometry-neutral paint, structure comes
              from which slots you render, and the narrow-group wrap is a container query —
              never a breakpoint prop.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- 1 ─ standalone ladder -->
    <div id="standalone-ladder" data-reveal="">
      <SectionCard
        family="standalone-ladder"
        headerRegion="standalone-ladder"
        eyebrow="proof"
        title="Standalone ladder"
        summary="variant=auto (the default) resolves FROM CONTEXT: outside any group the row carries its own surface — 1px border + terminal-muted fill + the 2xs hard shadow + bevel. Explicit variants stay escape hatches: default paints nothing, outline frames, muted fills. data-item-chrome on the root always tells you what resolved — inspect it."
      >
        <div class="grid w-full gap-6 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">auto · surface</span>
            <Item>
              <ItemContent>
                <ItemTitle>the auto row</ItemTitle>
                <ItemDescription>data-item-chrome="surface"</ItemDescription>
              </ItemContent>
              <ItemEnd><ItemAfter>own frame</ItemAfter></ItemEnd>
            </Item>
            {#each ['default', 'outline', 'muted'] as const as v (v)}
              <Item variant={v}>
                <ItemContent>
                  <ItemTitle>variant="{v}"</ItemTitle>
                  <ItemDescription>explicit — always wins over context</ItemDescription>
                </ItemContent>
              </Item>
            {/each}
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">density</span>
            {#each ['default', 'sm', 'xs'] as const as s (s)}
              <Item size={s}>
                <ItemContent>
                  <ItemTitle>size="{s}"</ItemTitle>
                  <ItemDescription>padding, gaps and type scale — never geometry</ItemDescription>
                </ItemContent>
              </Item>
            {/each}
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 2 ─ group modes -->
    <div id="group-modes" data-reveal="">
      <SectionCard
        family="group-modes"
        headerRegion="group-modes"
        eyebrow="proof"
        title="Group modes"
        summary="The group owns the surface: mode=default frames the list (1px border + xs shadow) with auto hairlines between adjacent rows (38% mix — a long stack never becomes a wall of full-black bars); mode=muted is one terminal-muted slab (dividers forced off); mode=plain paints nothing — the host surface owns it — and opts into hairlines explicitly. inset adds fixed 0.75rem inline margins. label renders a real section + aria-labelledby. Inside, auto rows yield their chrome — explicit variant rows remain the documented escape hatch, not the default."
      >
        <div class="grid w-full gap-6 lg:grid-cols-2">
          <div class="flex flex-col gap-4">
            <ItemGroup label="registry" ruler="media-content-end" class="max-w-lg">
              <Item href="#group-modes">
                <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
                <ItemContent>
                  <ItemTitle>press-button</ItemTitle>
                  <ItemDescription>default mode · labeled section · auto hairlines</ItemDescription>
                </ItemContent>
                <ItemEnd><ItemChevron /></ItemEnd>
              </Item>
              <ItemDivider />
              <Item>
                <ItemContent>
                  <ItemTitle>with an explicit divider</ItemTitle>
                  <ItemDescription>full-strength — one source per edge, structurally exclusive</ItemDescription>
                </ItemContent>
                <ItemEnd><ItemAfter>12:04</ItemAfter></ItemEnd>
              </Item>
              <Item href="#group-modes">
                <ItemContent>
                  <ItemTitle>code-card</ItemTitle>
                  <ItemDescription>registry:ui · highlight + copy workbench</ItemDescription>
                </ItemContent>
                <ItemEnd><ItemChevron /></ItemEnd>
              </Item>
            </ItemGroup>
            <ItemGroup mode="muted" label="strong relations" class="max-w-lg">
              <Item>
                <ItemContent>
                  <ItemTitle>muted slab</ItemTitle>
                  <ItemDescription>terminal-muted fill · no frame · no dividers, ever</ItemDescription>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>rows read as one surface</ItemTitle>
                </ItemContent>
                <ItemEnd><ItemAfter>2</ItemAfter></ItemEnd>
              </Item>
            </ItemGroup>
          </div>
          <div class="flex flex-col gap-4">
            <ItemGroup mode="plain" dividers="auto" label="host-owned (plain)" class="max-w-lg">
              <Item>
                <ItemContent>
                  <ItemTitle>plain group</ItemTitle>
                  <ItemDescription>nothing painted — this page is the surface; hairlines opted in</ItemDescription>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>for menus, panels, terminals</ItemTitle>
                </ItemContent>
                <ItemEnd><ItemChevron /></ItemEnd>
              </Item>
            </ItemGroup>
            <ItemGroup mode="default" inset label="inset" class="max-w-lg">
              <Item>
                <ItemContent>
                  <ItemTitle>inset group</ItemTitle>
                  <ItemDescription>fixed 0.75rem inline margins — boolean, no responsive enum</ItemDescription>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>same paint as default</ItemTitle>
                </ItemContent>
                <ItemEnd><ItemAfter>fixed geometry</ItemAfter></ItemEnd>
              </Item>
            </ItemGroup>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 3 ─ slot topology -->
    <div id="slot-topology" data-reveal="">
      <SectionCard
        family="slot-topology"
        headerRegion="slot-topology"
        eyebrow="proof"
        title="Slot topology"
        summary="Four top-level presence bits — media · end · header · footer — rewrite the template; everything trailing lives INSIDE ItemEnd: ItemAfter (non-interactive metadata) flows before ItemActions (controls) before ItemChevron (the decorative glyph). ItemMedia is icon / avatar-host / image (src+alt render the img). Header and footer are optional full rows. Link rows never contain interactive descendants — the last row shows where actions belong."
      >
        <div class="flex w-full max-w-lg flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
            <ItemContent>
              <ItemTitle>registry folder</ItemTitle>
              <ItemDescription>12 components · updated today</ItemDescription>
            </ItemContent>
            <ItemEnd>
              <ItemAfter tone="default">3 open</ItemAfter>
              <ItemActions><span class="text-[10px] opacity-60">edit</span></ItemActions>
            </ItemEnd>
          </Item>
          <Item variant="outline">
            <ItemMedia>
              <Avatar name="Ada Lovelace" tooltip={false} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Ada Lovelace</ItemTitle>
              <ItemDescription>maintainer · 3 commits today</ItemDescription>
            </ItemContent>
            <ItemEnd><ItemAfter>12:04</ItemAfter></ItemEnd>
          </Item>
          <Item variant="outline">
            <ItemMedia variant="image" src="/blueprints/press-button.svg" alt="press-button blueprint" />
            <ItemContent>
              <ItemTitle>press-button</ItemTitle>
              <ItemDescription>the physical press law · blueprint</ItemDescription>
            </ItemContent>
            <ItemEnd><ItemChevron /></ItemEnd>
          </Item>
          <Item variant="outline">
            <ItemHeader>
              <span class="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">
                pull request #2182
              </span>
              <span class="pill">open</span>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>feat: the presence matrix</ItemTitle>
              <ItemDescription>@gaubee wants to merge 3 commits into main</ItemDescription>
            </ItemContent>
            <ItemEnd>
              <ItemActions>
                <IconButton iconOnly text="Close pull request" class="size-7!">
                  {#snippet icon()}{@html icons.x}{/snippet}
                </IconButton>
              </ItemActions>
            </ItemEnd>
            <ItemFooter>
              <span class="text-muted-foreground text-[11px]">3 checks passed · 2 files changed</span>
              <span class="text-muted-foreground text-[11px]">updated 14 minutes ago</span>
            </ItemFooter>
          </Item>
        </div>
      </SectionCard>
    </div>

    <!-- 4 ─ media layout & narrow law -->
    <div id="media-narrow" data-reveal="">
      <SectionCard
        family="media-narrow"
        headerRegion="media-narrow"
        eyebrow="proof"
        title="Media layout & the narrow law"
        summary="layout=media (inherited from the group) switches custom properties only — a larger media square (3rem), wider gutters, top-aligned media; never a new presence bit. The narrow law: the group's ul IS the container; at ≤30rem the end lane drops to its own full row — a container query, not a viewport breakpoint. ItemEnd wrap=never keeps the lane on the main row."
      >
        <div class="flex w-full flex-col gap-6">
          <ItemGroup layout="media" ruler="media-content-end" mode="plain" dividers="auto" class="max-w-lg">
            <Item>
              <ItemMedia>
                <Avatar name="Grace Hopper" size="sm" tooltip={false} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>media layout rows</ItemTitle>
                <ItemDescription>media self-starts, content gap loosens — the custom-property switch</ItemDescription>
              </ItemContent>
              <ItemEnd><ItemAfter>compiler</ItemAfter></ItemEnd>
            </Item>
            <Item>
              <ItemMedia>
                <Avatar name="Alan Kay" size="sm" tooltip={false} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>works for feeds and threads</ItemTitle>
                <ItemDescription>the same four presence bits, a calmer rhythm</ItemDescription>
              </ItemContent>
              <ItemEnd><ItemAfter>dynabook</ItemAfter></ItemEnd>
            </Item>
          </ItemGroup>
          <div class="flex max-w-lg flex-col gap-1.5">
            <span class="text-muted-foreground text-[11px]">
              narrow group (container ≤ 30rem): the end lane takes its own row
            </span>
            <div class="max-w-[19rem]">
              <ItemGroup mode="plain" dividers="auto" ruler="media-content-end">
                <Item href="#media-narrow">
                  <ItemMedia variant="icon">{@html icons.fileText}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>separator</ItemTitle>
                    <ItemDescription>registry:ui · the hr, W3C-first</ItemDescription>
                  </ItemContent>
                  <ItemEnd><ItemChevron /></ItemEnd>
                </Item>
                <Item>
                  <ItemContent>
                    <ItemTitle>wrap=never row</ItemTitle>
                    <ItemDescription>the lane refuses to split</ItemDescription>
                  </ItemContent>
                  <ItemEnd wrap="never"><ItemAfter>12:04:33</ItemAfter></ItemEnd>
                </Item>
              </ItemGroup>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- 4b ─ the density ladder (the 尺规 scale) -->
    <div id="density-ladder" data-reveal="">
      <SectionCard
        family="density-ladder"
        headerRegion="density-ladder"
        eyebrow="proof"
        title="The density ladder"
        summary="Four densities, every number an equation from the 4px ruler: text 11/12/13/15px on lines 16/18/20/24px, rows 28/32/40/48px, media = one line (icon) or two (image), the outer inset ALWAYS equals the media seam (B=G). Density resolves from context: the group provides, rows inherit, an explicit size overrides — and the whole cascade is one data-density stamp plus inherited --jx-d-* variables, zero per-size branches in component css."
      >
        <div class="flex w-full max-w-lg flex-col gap-4">
          {#each [['lg', 'the lg row · 15px text · 24px line · 48px'], ['default', 'the default row · 13px · 20px · 40px'], ['sm', 'the sm row · 12px · 18px · 32px'], ['xs', 'the xs row · 11px · 16px · 28px']] as const as [d, note] (d)}
            <div>
              <span class="text-muted-foreground mb-1 block text-[11px] uppercase tracking-[0.14em]">{d}</span>
              <ItemGroup mode="plain" dividers="auto" size={d}>
                <Item>
                  <ItemContent>
                    <ItemTitle>{note}</ItemTitle>
                  </ItemContent>
                  <ItemEnd><ItemAfter>hit 44px</ItemAfter></ItemEnd>
                </Item>
              </ItemGroup>
            </div>
          {/each}
        </div>
      </SectionCard>
    </div>

    <!-- 5 ─ settings section (adapters) -->
    <div id="settings-section" data-reveal="">
      <SectionCard
        family="settings-section"
        headerRegion="settings-section"
        eyebrow="proof"
        title="Settings section (adapters)"
        summary="The five thin adapters are the settings page as one-liners: ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput. Each is ItemField + the existing control — the control keeps every native behavior (keyboard, form participation, bindable state); the adapter only wires ids and suppresses the control's duplicate label plumbing. label[for] makes click-row-to-activate free; description and error chain into aria-describedby; error flips aria-invalid. The live state below is bound — flip anything."
      >
        <div class="max-w-lg">
          <ItemGroup label="workspace">
            <ItemToggle
              label="Fast builds"
              description="skip typechecking during watch"
              bind:checked={autoplay}
            />
            <ItemCheckbox label="Telemetry" error="requires the beta flag" bind:checked={telemetry} />
            <ItemRadio name="channel" value="stable" label="Stable channel" description="tagged releases" checked />
            <ItemRadio name="channel" value="canary" label="Canary channel" disabled />
            <ItemSelect label="Density" bind:value={density}>
              <option value="default">default</option>
              <option value="sm">sm</option>
              <option value="xs">xs</option>
            </ItemSelect>
            <ItemInput label="Project name" description="lowercase, dashes" bind:value={projectName} />
          </ItemGroup>
          <p class="text-muted-foreground mt-3 text-[11px] uppercase tracking-[0.14em]">
            bound: {autoplay ? 'fast on' : 'fast off'} · {telemetry ? 'telemetry on' : 'telemetry off'} ·
            {density} · "{projectName}"
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- 6 ─ ItemField escape hatch -->
    <div id="item-field-escape" data-reveal="">
      <SectionCard
        family="item-field-escape"
        headerRegion="item-field-escape"
        eyebrow="proof"
        title="ItemField escape hatch"
        summary="Any control the adapters don't cover composes through ItemField's typed control snippet: it receives the full wiring context (controlId, labelId, descriptionId, errorId, describedBy). labelMode=for (default) associates a labelable element natively — click-to-activate, zero row handlers; labelMode=text is for non-labelable controls — the span label plus aria-labelledby is the naming source. The row is never a synthetic button and never nests a second label element."
      >
        <div class="max-w-lg">
          <ItemGroup mode="plain" dividers="auto">
            <ItemField id="xf-labelable" label="Custom slider" description="for-mode on a labelable input">
              {#snippet control(f)}
                <input type="range" id={f.controlId} aria-describedby={f.describedBy} />
              {/snippet}
            </ItemField>
            <ItemField
              id="xf-custom"
              label="Non-labelable control"
              description="text-mode: aria-labelledby names it"
              labelMode="text"
            >
              {#snippet control(f)}
                <div
                  class="inline-flex items-center gap-2 border border-border px-2 py-1 text-[0.75rem]"
                  role="status"
                  aria-labelledby={f.labelId}
                >
                  custom
                </div>
              {/snippet}
            </ItemField>
          </ItemGroup>
        </div>
      </SectionCard>
    </div>

    <!-- 7 ─ selection & links -->
    <div id="selection-links" data-reveal="">
      <SectionCard
        family="selection-links"
        headerRegion="selection-links"
        eyebrow="proof"
        title="Selection & links"
        summary="selected is VISUAL ONLY — terminal-hover fill plus the inset 2px primary edge (menu-family keeps its own bezel law; the divergence is documented, not accidental). No aria-selected is ever emitted: navigation adds aria-current itself through attribute forwarding; composite widgets own their selection semantics. Link rows are anchors with native keyboard behavior; rows with actions are NOT links."
      >
        <div class="max-w-lg">
          <ItemGroup label="navigation">
            <Item href="#selection-links" aria-current="page" selected>
              <ItemContent>
                <ItemTitle>current page</ItemTitle>
                <ItemDescription>selected + consumer-authored aria-current="page"</ItemDescription>
              </ItemContent>
              <ItemEnd><ItemAfter>/docs/components/list-item</ItemAfter></ItemEnd>
            </Item>
            <Item href="#selection-links">
              <ItemContent>
                <ItemTitle>sibling route</ItemTitle>
                <ItemDescription>hover paints terminal-hover — color only, the press law</ItemDescription>
              </ItemContent>
              <ItemEnd><ItemChevron /></ItemEnd>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>actions row (not a link)</ItemTitle>
                <ItemDescription>interactive descendants belong outside anchors</ItemDescription>
              </ItemContent>
              <ItemEnd>
                <ItemActions>
                  <IconButton iconOnly text="Retry" class="size-7!">
                    {#snippet icon()}{@html icons.rotateCcw}{/snippet}
                  </IconButton>
                </ItemActions>
              </ItemEnd>
            </Item>
          </ItemGroup>
        </div>
      </SectionCard>
    </div>

    <!-- 8 ─ recipes -->
    <div id="recipes" data-reveal="">
      <SectionCard
        family="recipes"
        headerRegion="recipes"
        eyebrow="proof"
        title="Recipes"
        summary="Two compositions the family deliberately does NOT own: the accordion row composes the W3C-first Accordion (<details>/<summary> — native toggle, native SSR state, keyboard owned by the platform); the checkbox group is ItemGroup + ItemCheckbox with one shared form name. Swipeout, sortable, virtual lists, smart select stay out of v1 by design — scroll-virtual already exists for the data-engine side."
      >
        <div class="grid w-full gap-6 lg:grid-cols-2">
          <div class="max-w-lg">
            <Accordion>
              <AccordionItem>
                {#snippet summary()}
                  <span class="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span>expandable row (accordion recipe)</span>
                    <span class="text-[10px] opacity-60">details/summary</span>
                  </span>
                {/snippet}
                <p>
                  The accordion family owns disclosure; the row inside is a plain Item
                  composition. Open state survives SSR — no JS hydration required.
                </p>
              </AccordionItem>
              <AccordionItem>
                {#snippet summary()}
                  <span>a second row</span>
                {/snippet}
                <p>Each summary is its own details element — the group only adds the visual law.</p>
              </AccordionItem>
            </Accordion>
          </div>
          <div class="max-w-lg">
            <ItemGroup mode="plain" dividers="auto" label="checkbox group (one form name)">
              {#each ['build', 'lint', 'test'] as const as step (step)}
                <ItemCheckbox name="pipeline" value={step} label={step} />
              {/each}
            </ItemGroup>
            <p class="text-muted-foreground mt-3 text-[11px] uppercase tracking-[0.14em]">
              native same-form participation
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="law"
        title="Usage"
        summary="The composition contract in one sample: import the family from the registry barrel (@ui/list-item/index — per-part targets exist per file), render ItemContent always, add the optional slots your row needs. Interactive behavior never lives on the row itself — link it with href or push controls into ItemEnd; settings rows take the adapters."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>
