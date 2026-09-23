<!--
  jixoai SystemDialogDescription
  (registry/files/ui/system-dialog/system-dialog-description.svelte,
  2026-08-25).
  The alertdialog's required body line: a p carrying the deterministic
  id Content's aria-describedby points at.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { SYSTEM_DIALOG_KEY, type SystemDialogApi } from './system-dialog.svelte';
  import { sysdlgStyles } from './system-dialog.stylex';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  const api = getContext<SystemDialogApi>(SYSTEM_DIALOG_KEY);

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads
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
</script>

<p
  data-jx-sysdlg-desc=""
  class={cn(cx(sysdlgStyles.description), className)}
  {...rest}
  id="{api.uid}-desc"
>
  {@render children()}
</p>
