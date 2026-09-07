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

  The suffix-icon lane (2026-09-07, typography-context-and-parts §3):
  the tri-state `icon` prop is the input semantic-glyph law verbatim —
  the only shape expressing "no opinion" ≠ "off": undefined → the
  DEFAULT glyph shown IFF external (<Icon name="externalLink">, an
  inline-core name answering getIcon() synchronously — SSR paints it,
  hydration matches, no flash); null → the lane explicitly OFF (the
  属性开关); a snippet → custom content in the lane. Fleet precedents:
  +layout.svelte's ext() snippet, component-canvas (the doc-link ↗
  text glyph was a pre-pipeline demo shim). The lane is a
  data-jx-link-icon span INSIDE the anchor after the children,
  aria-hidden (decorative — the target/rel pair already carries the
  semantics), em-sized (0.8em rides any ambient scale, the
  no-font-size kinship). `data-jx-link` unchanged. registry: link
  gains the @jixoai/icon edge (the edge ownership rule: import the
  component, never the generated set).

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
  import Icon from '../icon/icon.svelte';

  interface Props extends HTMLAnchorAttributes {
    /** the link target; an absolute http(s) href makes the link external */
    href: string;
    /** advisory title, passthrough to the native attribute */
    title?: string;
    /** the external suffix-icon lane, tri-state: undefined → the
     *  default externalLink glyph shown IFF external; null → the lane
     *  OFF; a snippet → custom glyph content */
    icon?: Snippet | null;
    /** the link label; omit for attribute-only anchors */
    children?: Snippet;
    class?: string;
  }

  let { href, title, icon, children, class: className = '', ...rest }: Props = $props();

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
  <!-- the lane rides directly after the children with NO intervening
       text node (the label-row adjacency discipline): the lane's own
       ms-[0.2em] owns the whole gap — a stray space would stack a
       font-dependent second gap on top of it -->
  {@render children?.()}{#if external && icon !== null}<span data-jx-link-icon aria-hidden="true" class="ms-[0.2em] inline-flex flex-none align-[-0.125em]">{#if icon}{@render icon()}{:else}<Icon name="externalLink" size="0.8em" />{/if}</span>{/if}
</a>
