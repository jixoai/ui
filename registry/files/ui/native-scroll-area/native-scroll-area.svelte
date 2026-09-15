<!--
  jixoai native-scroll-area
  (registry/files/ui/native-scroll-area/native-scroll-area.svelte,
  2026-09-15 — visual-quality-iteration W4, the scroll-area family
  split). The PLATFORM sibling: zero drawn chrome — the platform
  scrollbar under the site's scrollbar-token law (the theme's global
  currentColor chain paints it; this component never touches
  scrollbar-color) with the native best practices packaged as
  CAPABILITY STYLES from the kit (scroll-area-kit/native-capability.css
  + the core's theme-scope resolution):
    - scrollbar-gutter: stable both-edges on vertical-capable axes
      (overflow arriving never shifts layout);
    - color-scheme follows the STAGE SCOPE, not just the OS — the W1
      lesson applied to the platform bar: the nearest theme scope
      ([data-theme], .dark, .jx-light — self included) resolves and
      re-resolves live (a scope observer on the ancestor chain
      watching class AND data-theme mutations);
    - scrollbar-width tiers auto | thin | none (the theme's thin law
      is the default);
    - overscroll-behavior containment.

  NO custom scrollbar ARIA mounts anywhere inside — no drawn thumb
  exists, and the platform scrollbar IS the accessibility contract
  (role="scrollbar" on a nonexistent thumb would be a violation, not a
  feature — the Gate-1 r1 ruling; probe-asserted absent). The region
  keeps the WAI scrollable-region pattern (role=region + name +
  tabindex) exactly like the family: keyboard, PageUp/Home, snap and
  chaining stay platform behavior.

  Boundary: scroll-run (the linear strip edge system) is a DIFFERENT
  shared system; the mermaid zoom-pan viewport keeps its recorded
  exemption. getViewport() feeds the family's ToC pairing unchanged.

  API contract（克制原则）: orientation / scrollbarWidth / label /
  class / style / onscroll + restProps 透传到滚动口 + children.
  Instance exports (bind:this): getViewport() / scrollTo(). 仅此而已。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { resolveThemeScope } from '$lib/scroll-area-kit/core';
  import '$lib/scroll-area-kit/native-capability.css';
  import './native-scroll-area.css';

  export type ScrollOrientation = 'vertical' | 'horizontal' | 'both';
  export type ScrollbarWidthTier = 'auto' | 'thin' | 'none';
  export type ViewportScrollEvent = HTMLElementEventMap['scroll'] & {
    currentTarget: EventTarget & HTMLDivElement;
  };

  interface Props {
    /** which axes scroll: overflow-y/x mapping (default vertical) */
    orientation?: ScrollOrientation;
    /** the scrollbar-width tier (default thin — the theme's global
     *  scrollbar law; `auto` restores the platform-wide bar, `none`
     *  hides it entirely — the content still scrolls) */
    scrollbarWidth?: ScrollbarWidthTier;
    /** a11y name for the scrollable region */
    label?: string;
    class?: string;
    style?: string;
    onscroll?: (event: ViewportScrollEvent) => void;
    children: Snippet;
  }

  let {
    orientation = 'vertical',
    scrollbarWidth = 'thin',
    label = 'scrollable content',
    class: className = '',
    style,
    onscroll,
    children,
    ...restProps
  }: Props = $props();

  let viewportEl = $state<HTMLDivElement | null>(null);

  /** the stage scope the bar follows: 'light' | 'dark' | undefined
   * (undefined = unscoped — the OS scheme answers, the honest
   * fallback; NO data-scheme attribute, the UA default stands) */
  let scheme = $state<'light' | 'dark' | undefined>(undefined);

  export function getViewport(): HTMLDivElement | null {
    return viewportEl;
  }

  /** thin passthrough to the native scrollport */
  export function scrollTo(options?: ScrollToOptions): void {
    viewportEl?.scrollTo(options);
  }

  const handleScroll = (event: ViewportScrollEvent): void => {
    onscroll?.(event);
  };

  // theme-scope alignment (the core's resolver + the W1 observer
  // shape): class flips AND data-theme flips on the viewport's
  // ancestor chain re-resolve the scheme live, no re-mount
  $effect(() => {
    const vp = viewportEl;
    if (!vp || typeof MutationObserver === 'undefined') return;
    const apply = () => {
      scheme = resolveThemeScope(vp) ?? undefined;
    };
    apply();
    const chain: Element[] = [];
    for (let node: Element | null = vp; node; node = node.parentElement) chain.push(node);
    const mo = new MutationObserver(apply);
    for (const node of chain) mo.observe(node, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => mo.disconnect();
  });

  // orientation → the scrollport's overflow law (deterministic branch)
  const orientationUtilities = {
    vertical: 'overflow-x-hidden overflow-y-auto',
    horizontal: 'overflow-x-auto overflow-y-hidden',
    both: 'overflow-x-auto overflow-y-auto',
  } as const;
</script>

<div class="jx-native-scroll-area relative" data-orientation={orientation}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (the WAI scrollable-
       region pattern: role=region + name + tabindex makes it a keyboard
       scroll surface — and the ONLY a11y surface here: the platform
       scrollbar is the accessibility contract, nothing custom mounts
       inside this box) -->
  <div
    class={cn('jx-native-scroll jx-native-scroll-viewport', orientationUtilities[orientation], className)}
    data-orientation={orientation}
    data-width={scrollbarWidth === 'thin' ? undefined : scrollbarWidth}
    data-scheme={scheme}
    role="region"
    aria-label={label}
    tabindex="0"
    bind:this={viewportEl}
    onscroll={handleScroll}
    {style}
    {...restProps}
  >
    <div data-jx-scroll-content class="h-full">
      {@render children()}
    </div>
  </div>
</div>
