<!--
  jixoai kbd (registry/files/ui/kbd.svelte).
  The keyboard-input glyph: a native <kbd> — the element whose entire
  meaning is "this is keyboard input" — with the jixoai chip paint
  (1px border, shadow-2xs lift, mono). restProps flow through, so
  title/data-* land verbatim; composition with <samp>, text, or an
  <a> (documented shortcut) is the consumer's call.

  Purposefully not: key-parsing, platform detection (⌘/Ctrl), or a
  <kbd> per key auto-split. Those are string-parsing opinions that
  belong to the caller; the element composes fine by hand:

    <kbd>⌘</kbd> + <kbd>K</kbd>
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLElement> {}

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<kbd class="jx-kbd {className}" {...rest}>
  {@render children?.()}
</kbd>

<style>
  .jx-kbd {
    display: inline-block;
    box-sizing: border-box;
    padding: 0 0.375rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--muted);
    box-shadow: var(--shadow-2xs);
    font-family: var(--font-mono);
    font-size: 0.75em;
    line-height: 1.6;
    color: var(--foreground);
    white-space: nowrap;
  }
</style>
