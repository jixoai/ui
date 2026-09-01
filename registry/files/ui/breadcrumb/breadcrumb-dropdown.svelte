<!--
  jixoai BreadcrumbDropdown (registry/files/ui/breadcrumb/breadcrumb-dropdown.svelte,
  2026-09-01).
  The sibling-jump step: one trail node that opens a menu of peer
  destinations and navigates on selection — the shadcn-ui
  BreadcrumbDropdown composition, closed into a data-shaped part
  (trail steps are {label, href} data by nature; the fold/collapse
  parts are nesting-shaped, this one is list-shaped). Click, or the
  menu's own keyboard contract (arrows/typeahead/Enter), opens the
  DropdownMenu popover; every entry is a REAL anchor — middle-click,
  reload and crawlers stay honest; the SPA router intercepts internal
  hrefs as usual.

  Composed on dropdown-menu (popover laws, menu keyboard, caret flip —
  the trigger snippet rides the root's .jx-menu-anchor wrapper, so the
  caret flip comes free). This part owns ONLY the breadcrumb paint of
  the trigger and the anchor items. As the menu's PARENT it never sees
  the family context — the raw items own their close path themselves
  (the dropdown-menu law for raw entries): dismiss the panel, return
  focus to the trail node, let the href navigate.

    <BreadcrumbItem>
      <BreadcrumbDropdown label="docs" current="/docs/components/tabs.html"
        items={[
          { label: 'tabs', href: '/docs/components/tabs.html' },
          { label: 'toast', href: '/docs/components/toast.html' },
        ]} />
    </BreadcrumbItem>

  The current entry carries aria-current="page" for assistive tech and
  the static you-are-here paint (breadcrumb.css). The menu root's
  keyboard walk owns the transient highlight and rewrites
  aria-current="true" as focus moves — the static page marker cedes to
  it while walking (documented trade, dropdown-menu law).
-->
<script lang="ts" module>
  /** a peer destination — a REAL link */
  export interface BreadcrumbDestination {
    label: string;
    href: string;
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils';
  import { icons } from '$lib/icons';
  import { resolveDensity, getDensityContext, type Density } from '$lib/density.svelte';
  import DropdownMenu from '../dropdown-menu/dropdown-menu.svelte';

  interface Props {
    /** the trail label on the trigger (the section this node stands for) */
    label: string;
    /** peer destinations offered in the menu */
    items: BreadcrumbDestination[];
    /** href of the current page among the items — aria-current + paint */
    current?: string;
    density?: Density;
    class?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let { label, items, current, density, class: className = '' }: Props = $props();

  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  let host = $state<HTMLSpanElement | null>(null);

  // raw menu items manage their own close path (dropdown-menu law —
  // this part is the menu's PARENT, so the family context never reaches
  // it): dismiss the popover with the platform, hand focus back to the
  // trail node, and let the anchor's own href do the navigating
  function handleNavigate(event: MouseEvent): void {
    (event.currentTarget as HTMLAnchorElement).closest('[popover]')?.hidePopover?.();
    host?.querySelector<HTMLButtonElement>(`button[popovertarget="${autoId}"]`)?.focus();
  }
</script>

<span bind:this={host} class="inline-flex">
  <DropdownMenu id={autoId} density={resolvedDensity} placement="bottom-start">
    {#snippet trigger()}
      <button
        type="button"
        popovertarget={autoId}
        aria-haspopup="menu"
        data-jx-breadcrumb-dropdown=""
        data-density={resolvedDensity}
        class={cn(
          'inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-muted-foreground transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2',
          className,
        )}
      >
        {label}
        <span class="jx-menu-caret flex-none inline-flex transition-transform duration-150 ease-out [&_svg]:h-[11px] [&_svg]:w-[11px] [&_svg]:stroke-[2.5]">
          {@html icons.chevronDown}
        </span>
      </button>
    {/snippet}
    {#each items as item (item.href)}
      <a
        role="menuitem"
        href={item.href}
        data-jx-breadcrumb-menu-item=""
        aria-current={item.href === current ? 'page' : undefined}
        class="jx-menu-item flex w-full box-border items-center text-left font-sans bg-transparent text-inherit transition-[background-color,color] duration-100 ease-out"
        onclick={handleNavigate}
      >{item.label}</a>
    {/each}
  </DropdownMenu>
</span>
