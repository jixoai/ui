<!--
  jixoai separator (registry/files/ui/separator.svelte).
  W3C-first: the horizontal separator IS <hr> — native semantics, native
  styling, zero ARIA. Only the vertical posture has no native element, so
  it takes the ARIA route: <div role="separator" aria-orientation>.

  orientation="horizontal" (default) renders <hr> — a thematic break
  between content sections (paragraphs, card blocks).
  orientation="vertical"   renders the ARIA div — a visual divider
  between inline peers (toolbar items, footer columns).

  1px var(--border) both ways; length is the consumer's job (the element
  is display:block horizontal / inline-block vertical — width/height via
  the class prop or the parent's layout).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLHRElement> {
    orientation?: 'horizontal' | 'vertical';
  }

  let { orientation = 'horizontal', class: className = '', ...rest }: Props = $props();
</script>

{#if orientation === 'vertical'}
  <div
    role="separator"
    aria-orientation="vertical"
    class="jx-separator-v {className}"
    {...(rest as HTMLAttributes<HTMLDivElement>)}
  ></div>
{:else}
  <hr class="jx-separator-h {className}" {...rest} />
{/if}

<style>
  .jx-separator-h {
    flex: none;
    border: 0;
    border-top: 1px solid var(--border);
    margin: 0;
  }
  .jx-separator-v {
    display: inline-block;
    align-self: stretch;
    flex: none;
    width: 1px;
    min-width: 1px;
    background: var(--border);
  }
</style>
