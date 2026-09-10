<!--
  Effect-attachments contract harness (test/fixtures/effect-attach-host.svelte,
  effect-attachments Lane A, 2026-09-09; r4 2026-09-10 — the attachments
  RECORD retired, the component-tag form promoted). The compile smoke pins
  {@attach}'s emitted shape; this harness pins the MOUNTED channel laws the
  shape cannot prove — identity remount on fx replace, the deep-mutation
  boundary's two measured halves, the NATIVE component-tag mechanism (a
  Host spreading ...rest onto its marked button, armed through
  <SpreadHost {@attach …}> — the spike's exact shape), the fromAction
  bridge, and the {destroy}-leak counter-example — through the real
  compiled pipeline. Factories and actions arrive as PROPS (the spec owns
  the traces through their closures); every surface renders only when its
  props are present, so each law mounts in isolation.
-->
<script lang="ts">
  import { fromAction } from 'svelte/attachments';
  import type { Attachment } from 'svelte/attachments';
  import type { PressEffect, ShimmerEffect } from '../../src/lib/ui/press-button/press-button.svelte';
  import SpreadHost from './effect-attach-spread-host.svelte';

  let {
    factory = undefined,
    fx = undefined,
    surface = 'factory',
    bridged = undefined,
    bare = undefined,
    root = undefined,
    spreadAttach = undefined,
    chainInternal = undefined,
    chainInternalOn = true,
  }: {
    /** the attachment factory under test — (fx) => attachment */
    factory?: (fx: PressEffect) => Attachment<HTMLElement>;
    /** flows through PROPS: a rerender with a fresh object = the $derived
     *  replace path the docs teach (identity remount) */
    fx?: PressEffect;
    /** which factory surface mounts: 'factory' reads the flowing prop,
     *  'held' reads the internal $state — one law per render */
    surface?: 'factory' | 'held';
    /** the action-shaped bridge target (update/destroy handle) */
    bridged?: (
      element: HTMLElement,
      param: { n: number }
    ) => { update: (param: { n: number }) => void; destroy: () => void };
    /** the repo-convention counter-example: a {destroy}-returning action */
    bare?: (element: HTMLElement) => { destroy: () => void };
    /** the undefined-skip arm's DIRECT form: an ALWAYS-MOUNTED element
     *  whose whole attach expression is undefined when the prop is
     *  absent (the spike proved falsy values skip, the use: parity;
     *  rerender arms/disarms it) */
    root?: Attachment<HTMLElement>;
    /** the NATIVE component-tag arm (r4): forwarded onto SpreadHost's
     *  component TAG — <SpreadHost {@attach spreadAttach}> — proving
     *  the symbol-keyed prop lands through the child's rest spread at
     *  the marked button (absent → undefined → the skip arm) */
    spreadAttach?: Attachment<HTMLElement>;
    /** the INTERNAL material mount body (tabs 'indicator' — the
     *  component's OWN material business since r4, no consumer path) */
    chainInternal?: Attachment<HTMLElement>;
    /** the internal mount's own gate — false models a material flip
     *  (internalMount() returning undefined: teardown-only, no crash) */
    chainInternalOn?: boolean;
  } = $props();

  // the deep-mutation surface: fx held in $state — the ONE configuration
  // where a param channel could exist (use: deep-reads here; attachments
  // does not — the kernels' own property reads are the only fine-grained
  // reactivity). Capturing the INITIAL prop is the point of this surface;
  // the flowing surface above carries the replace path. Plus the
  // fromAction bridge's replaceable param.
  // svelte-ignore state_referenced_locally
  let held = $state(fx);
  let param = $state({ n: 1 });
</script>

{#if factory && fx}
  {#if surface === 'held'}
    <button
      data-held
      aria-label="attachment contract test: state-held surface"
      onclick={() => ((held as ShimmerEffect).speed = 9000)}
      {@attach factory(held)}
    ></button>
  {:else}
    <button
      data-factory
      aria-label="attachment contract test: flowing surface"
      {@attach factory(fx)}
    ></button>
  {/if}
{/if}
{#if bridged}
  <button
    data-flip
    aria-label="attachment contract test: fromAction bridge"
    onclick={() => (param = { n: 2 })}
    {@attach fromAction(bridged, () => param)}
  ></button>
{/if}
{#if bare}
  <div data-bare {@attach bare}></div>
{/if}
<!-- the lane-B surfaces are ALWAYS MOUNTED — the whole point is the
     undefined-valued expression riding a live element -->
<button data-root data-jx-attach="root" aria-label="attachment contract test: bare hook" {@attach root}></button>
<span
  data-chain
  data-jx-attach="indicator"
  aria-hidden="true"
  {@attach chainInternalOn ? chainInternal : undefined}
></span>
<!-- the r4 native arm, ALWAYS MOUNTED like its lane-B siblings: the
     attachment rides the COMPONENT TAG (undefined value = the skip
     arm, proven by probe); the child's rest spread carries the
     symbol-keyed prop to its marked button (the spike's exact shape —
     mountedAtSpread) -->
<SpreadHost {@attach spreadAttach}>deploy</SpreadHost>
