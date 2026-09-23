<!--
  jixoai input group — the ADDON part (registry/files/ui/input-group/
  input-group-addon.svelte, OpenSpec 2026-08-30-expand-form-family F2).

  One add-on lane beside the group's input: prefix (align
  "inline-start", the default) or suffix (align "inline-end"). The
  content is the consumer's composition — muted text ("https://"),
  an icon glyph (<Icon name="x" /> via $lib/ui/icon over the generated
  set),
  a PressButton ("search"), a NativeSelect (the unit picker) — the
  addon owns ONLY the lane: flex-none rhythm over the density tokens,
  muted secondary text paint, and its ONE hairline seam (the edge
  facing the input; painted in input-group.css from the valued
  data-jx-igroup-addon hook — the shell carries ONE border, each
  addon ONE seam, the lane stays chromeless: no double borders).

  Disabled propagation reads the group context: a root-level disable
  renders the addon `inert` — the platform's containment, so every
  interactive descendant (button, select, link) loses activation and
  focus at once — plus the muted opacity paint. Per-part disables
  inside the addon stay the consumer's.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { INPUT_GROUP_KEY, type InputGroupApi } from './input-group.svelte';
  import { inputGroupStyles } from './input-group.stylex';
  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');


  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** which lane the addon sits in — the seam faces the input:
        inline-start seams its inline-end, inline-end its inline-start */
    align?: 'inline-start' | 'inline-end';
    class?: string;
    children: Snippet;
  }

  let { align = 'inline-start', class: className = '', children, ...rest }: Props = $props();

  const group = getContext<InputGroupApi | undefined>(INPUT_GROUP_KEY);
  const groupDisabled = $derived(group?.disabled ?? false);
</script>

<div
  {...rest}
  data-jx-igroup-addon={align}
  inert={groupDisabled || undefined}
  class={cx(
    inputGroupStyles.addon,
    groupDisabled && inputGroupStyles.addonDisabled,
    className,
  )}
>
  {@render children()}
</div>
