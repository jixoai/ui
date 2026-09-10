<!--
  The NATIVE component-tag attachment harness (effect-attachments r4,
  2026-09-10 — the /tmp/attach-comptag2.mjs spike promoted into the
  battery): a Host that spreads ...rest onto its marked button, the
  real hosts' exact shape (press-button/chip — icon-button chains the
  same spread one level deeper). The consumer arms it through the
  COMPONENT TAG — <SpreadHost {@attach fn}> — which compiles to a
  symbol-keyed prop ($.attachment()); the rest spread forwards it onto
  the button, where the runtime's attribute_effect branch mounts it.
  data-jx-attach="root" is the OPTIONAL named mounting-point stamp
  (queryable, contract-naming), never the forwarding mechanism.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLButtonElement> {
    children?: Snippet;
  }

  let { children, ...rest }: Props = $props();
</script>

<button {...rest} data-jx-attach="root" data-spread>{@render children?.()}</button>
