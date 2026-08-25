<!--
  Docs page for the list-item family (2026-08-25).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: the required-slot composition (ItemContent +
     ItemActions on an outline Item).
  3. Section demos: media forms, group + separators + link rows
     (incl. the narrow-container actions wrap), header/footer full
     rows, the variant × size ladder.
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

  // ladder data (typed unions — the family ships no exported prop types)
  const variantLadder: { id: 'default' | 'outline' | 'muted'; label: string }[] = [
    { id: 'default', label: 'default' },
    { id: 'outline', label: 'outline' },
    { id: 'muted', label: 'muted' },
  ];
  const sizeLadder: { id: 'default' | 'sm' | 'xs'; label: string }[] = [
    { id: 'default', label: 'default' },
    { id: 'sm', label: 'sm' },
    { id: 'xs', label: 'xs' },
  ];

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

<!-- ItemContent is the required slot; media/actions/header/footer are
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

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>List item · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai list-item family: a GRID row with a :has()-driven presence matrix — media / content / actions in the main row, header / footer as optional full rows, actions dropping to their own row inside narrow groups. ItemContent is the required slot; the root is <a> when href is given."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="list-item — slots compose the row"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">grid + :has() presence matrix</span>
          <span class="pill">ItemContent required</span>
          <span class="pill">href → &lt;a&gt;</span>
          <span class="pill">default / outline / muted × sm / xs</span>
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

    <div id="media-forms" data-reveal="">
      <SectionCard
        family="media-forms"
        headerRegion="media-forms"
        eyebrow="demo"
        title="Media: icon, avatar, image"
        summary="ItemMedia is the leading slot in three forms: variant=icon pins any inline svg to 16px (the $lib/icons set fits as-is); the default variant is an avatar host — drop the registry Avatar in, its own size geometry applies; variant=image renders the img for you from src at a fixed square (2.5rem, 2rem under sm/xs items). A description self-starts the media — the optical alignment rule."
      >
        <div class="flex w-full max-w-lg flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">{@html icons.folder}</ItemMedia>
            <ItemContent>
              <ItemTitle>registry folder</ItemTitle>
              <ItemDescription>12 components · updated today</ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="outline">
            <ItemMedia>
              <Avatar name="Ada Lovelace" tooltip={false} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Ada Lovelace</ItemTitle>
              <ItemDescription>maintainer · 3 commits today</ItemDescription>
            </ItemContent>
          </Item>
          <Item variant="outline">
            <ItemMedia variant="image" src="/blueprints/press-button.svg" alt="press-button blueprint" />
            <ItemContent>
              <ItemTitle>press-button</ItemTitle>
              <ItemDescription>the physical press law · blueprint</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      </SectionCard>
    </div>

    <div id="group-list" data-reveal="">
      <SectionCard
        family="group-list"
        headerRegion="group-list"
        eyebrow="demo"
        title="Group, separators & link rows"
        summary="ItemGroup owns the surface: a native frame around a <ul> list, with mode (default · muted · plain), optional label, and the divider policy — auto hairlines between adjacent rows, full-strength ItemDivider for explicit boundaries. data-dividers lives on the list itself, the adjacency owner. Items with href render an anchor that carries its own hover law; chevrons are the explicit ItemChevron leaf."
      >
        <div class="flex w-full flex-col gap-6">
          <div class="max-w-lg">
            <ItemGroup>
              <Item href="/docs/components/press-button.html">
                <ItemMedia variant="icon">{@html icons.palette}</ItemMedia>
                <ItemContent>
                  <ItemTitle>press-button</ItemTitle>
                  <ItemDescription>registry:ui · the physical press law</ItemDescription>
                </ItemContent>
                <ItemEnd><ItemChevron /></ItemEnd>
              </Item>
              <ItemDivider />
              <Item href="/docs/components/avatar.html">
                <ItemMedia>
                  <Avatar name="Ada Lovelace" size="sm" tooltip={false} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>avatar</ItemTitle>
                  <ItemDescription>registry:ui · native img with initials fallback</ItemDescription>
                </ItemContent>
                <ItemEnd><ItemChevron /></ItemEnd>
              </Item>
              <ItemDivider />
              <Item>
                <ItemMedia variant="icon">{@html icons.fileCode}</ItemMedia>
                <ItemContent>
                  <ItemTitle>code-card</ItemTitle>
                  <ItemDescription>registry:ui · highlight + copy workbench</ItemDescription>
                </ItemContent>
                <ItemEnd>
                  <ItemActions>
                    <IconButton iconOnly text="Copy source" class="size-7!">
                      {#snippet icon()}{@html icons.check}{/snippet}
                    </IconButton>
                  </ItemActions>
                </ItemEnd>
              </Item>
            </ItemGroup>
          </div>
          <div class="flex max-w-lg flex-col gap-1.5">
            <span class="text-muted-foreground text-[11px]">
              narrow group (container ≤ 30rem): actions drop to their own row
            </span>
            <div class="max-w-[19rem]">
              <ItemGroup mode="plain" dividers="auto">
                <Item href="/docs/components/separator.html">
                  <ItemMedia variant="icon">{@html icons.fileText}</ItemMedia>
                  <ItemContent>
                    <ItemTitle>separator</ItemTitle>
                    <ItemDescription>registry:ui · the hr, W3C-first</ItemDescription>
                  </ItemContent>
                  <ItemEnd><ItemChevron /></ItemEnd>
                </Item>
              </ItemGroup>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="header-footer" data-reveal="">
      <SectionCard
        family="header-footer"
        headerRegion="header-footer"
        eyebrow="demo"
        title="Header & footer full rows"
        summary="ItemHeader and ItemFooter are optional full-row slots above and below the main row — labels, meta strips, check runs. Their presence rewrites the grid template exactly like the main-row slots do; both render as space-between flex strips, so paired spans land on the row's edges."
      >
        <div class="flex w-full max-w-lg flex-col gap-2">
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
          <Item variant="outline">
            <ItemHeader>
              <span class="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">
                label row
              </span>
            </ItemHeader>
            <ItemContent>
              <ItemTitle>header-only form</ItemTitle>
              <ItemDescription>the footer track simply never mints</ItemDescription>
            </ItemContent>
          </Item>
        </div>
      </SectionCard>
    </div>

    <div id="variant-size-matrix" data-reveal="">
      <SectionCard
        family="variant-size-matrix"
        headerRegion="variant-size-matrix"
        eyebrow="demo"
        title="Variant × size matrix"
        summary="Paint × density, geometry-neutral by construction: variant changes only surface (auto resolves from the group — standalone it carries its own frame; default stays transparent; outline frames; muted fills), size changes only padding, gaps and type scale. Bevel rides --radius and no combination ever touches the template."
      >
        <div class="grid w-full gap-6 md:grid-cols-3">
          {#each variantLadder as variant (variant.id)}
            <div class="flex flex-col gap-2">
              <span class="text-muted-foreground text-[11px] uppercase tracking-[0.14em]">
                {variant.label}
              </span>
              {#each sizeLadder as size (size.id)}
                <Item variant={variant.id} size={size.id}>
                  <ItemContent>
                    <ItemTitle>{variant.label} · {size.label}</ItemTitle>
                    <ItemDescription>density {size.label}</ItemDescription>
                  </ItemContent>
                </Item>
              {/each}
            </div>
          {/each}
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="law"
        title="Usage"
        summary="The composition contract in one sample: import the family from the registry barrel (@ui/list-item/index — per-part targets exist per file), render ItemContent always, add the optional slots your row needs. Interactive behavior never lives on the row itself — link it with href or push controls into ItemActions."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>
