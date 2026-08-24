<!--
  jixoai kbd (registry/files/ui/kbd/kbd.svelte).
  The keyboard-input glyph: a native <kbd> — the element whose entire
  meaning is "this is keyboard input" — with the jixoai chip paint
  (1px border, shadow-2xs lift, mono). restProps flow through, so
  title/data-* land verbatim; composition with <samp>, text, or an
  <a> (documented shortcut) is the consumer's call.

  Purposefully not: key-parsing, platform detection (⌘/Ctrl), or a
  <kbd> per key auto-split. Those are string-parsing opinions that
  belong to the caller; the element composes fine by hand:

    <kbd>⌘</kbd> + <kbd>K</kbd>

  tw4 (2026-08-24): utility-authored — the chip paint composes from
  token utilities (layer law: consumer utilities always win);
  `jx-kbd` stays as a semantic hook only, no css defines it.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<kbd
  class={cn(
    'jx-kbd inline-block px-1.5 border border-border rounded-none bg-muted shadow-2xs font-mono text-[0.75em] leading-[1.6] text-foreground whitespace-nowrap',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</kbd>
