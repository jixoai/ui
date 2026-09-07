<!--
  jixoai link (registry/files/ui/link/link.svelte).
  The typographic text link — the non-nav prose lane of the site link
  law, promoted from the markdown docs' doc-link demo (2026-09-07,
  markdown-coverage change §1.4) into a registry part so markdown
  links map to a uniformly managed component.

  Paint: carries the face B2 non-nav lane (jx-pure.css: primary text,
  4px underline offset, underline on hover) as its OWN utilities so it
  stands alone outside any face scope. Inside a jx-pure scope the
  values coincide — same property, same token — a deterministic no-op
  (the layer law keeps utilities above the components-layer face, and
  the face never declared a different value anyway). It does NOT
  escape the face (design §2: an inline escape would virally descope
  every descendant a prose link legitimately contains — code chips,
  nested marks, images). The forced-colors ink is the fleet convention
  (press-button's link rung): LinkText, the system link color.

  External detection: ANY absolute http(s) href is external —
  /^https?:\/\//i — no origin comparison, because window.location has
  no place in an SSR-safe registry component. External links carry
  the fleet convention pair target="_blank" rel="noreferrer" (doc-link
  and PressButton both ship bare noreferrer; modern browsers imply
  noopener from it).

  NO defaults file: the Defaults law covers families with public
  style props, and link declares none — paint is fixed, externalness
  derives from href (the heading/list precedent of components without
  a Defaults consumer).

  Component-owned semantics land AFTER the spread (the separator
  law): href/title and the external-contract pair are the component's
  contract, not overridable through rest props.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAnchorAttributes {
    /** the link target; an absolute http(s) href makes the link external */
    href: string;
    /** advisory title, passthrough to the native attribute */
    title?: string;
    /** the link label; omit for attribute-only anchors */
    children?: Snippet;
    class?: string;
  }

  let { href, title, children, class: className = '', ...rest }: Props = $props();

  // absolute http(s) opens externally; app routes keep same-tab default
  const external = $derived(/^https?:\/\//i.test(href));
</script>

<a
  {...rest}
  href={href}
  title={title}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-jx-link={external ? 'external' : 'internal'}
  class={cn(
    'text-primary [text-underline-offset:4px] hover:underline forced-colors:text-[LinkText]',
    className,
  )}
>
  {@render children?.()}
</a>
