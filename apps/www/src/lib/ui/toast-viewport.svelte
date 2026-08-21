<!--
  jixoai toast viewport (registry/files/ui/toast-viewport.svelte).
  The presentation half of the toast pair: mount ONCE in the root
  layout with the store your app created —

    const toast = createToastStore();
    <ToastViewport store={toast} />
    …anywhere: toast.api.push({ title: 'Deployed' })

  The viewport owns what the store deliberately does not: the fixed
  corner stack (bottom-right, terminal surface with hard offset
  shadow), the max VISIBLE count (older toasts stay queued, they just
  stop rendering), live-region semantics per item (role=status polite,
  role=alert when the toast is assertive — never one live region
  announcing everything), the dismiss button, and hover/focus pause
  (pointer enter freezes that toast's countdown, leave resumes it).

  Entry/exit: @starting-style pop-in; exit rides a data-leaving frame
  before the store actually drops the item. prefers-reduced-motion
  collapses both to none.
-->
<script lang="ts">
  import type { ToastStore, ToastItem } from '$lib/toast-store';
  import { onMount } from 'svelte';

  interface Props {
    /** the app-created store (createToastStore()) */
    store: ToastStore;
    /** max toasts rendered at once; older ones stay queued (default 4) */
    maxVisible?: number;
    /** extra classes on the corner stack */
    class?: string;
  }

  let { store, maxVisible = 4, class: className = '' }: Props = $props();

  let items = $state<ToastItem[]>([]);
  /** ids rendering their exit frame — removed by the store a frame later */
  const leaving = new Set<number>();

  onMount(() => {
    const unsubscribe = store.subscribe((next) => {
      for (const item of items) {
        if (!next.some((n) => n.id === item.id)) leaving.add(item.id);
      }
      items = next;
      // let the exit animation paint one frame, then release the id
      requestAnimationFrame(() => {
        for (const id of [...leaving]) {
          if (!items.some((item) => item.id === id)) leaving.delete(id);
        }
      });
    });
    // exit frames need a real removal pass after the animation window
    const sweeper = setInterval(() => leaving.clear(), 400);
    return () => {
      unsubscribe();
      clearInterval(sweeper);
    };
  });

  const visible = $derived(items.slice(-maxVisible));
  const renders = $derived(
    [
      ...visible,
      ...items.filter(
        (item) => leaving.has(item.id) && !visible.some((v) => v.id === item.id),
      ),
    ].slice(-maxVisible * 2),
  );
</script>

<div class="jx-toasts {className}" aria-label="notifications">
  {#each renders as item (item.id)}
    <div
      class="jx-toast jx-toast-{item.tone ?? 'default'}"
      class:jx-toast-leaving={leaving.has(item.id)}
      role={item.assertive ? 'alert' : 'status'}
      onpointerenter={() => store.pause(item.id)}
      onpointerleave={() => store.resume(item.id)}
      onfocusin={() => store.pause(item.id)}
      onfocusout={() => store.resume(item.id)}
    >
      <div class="jx-toast-body">
        <p class="jx-toast-title">{item.title}</p>
        {#if item.description}
          <p class="jx-toast-desc">{item.description}</p>
        {/if}
      </div>
      <button
        type="button"
        class="jx-toast-dismiss"
        aria-label="dismiss notification"
        onclick={() => store.api.dismiss(item.id)}
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .jx-toasts {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 90;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: min(22rem, calc(100vw - 2rem));
    pointer-events: none; /* the corner itself never blocks the page */
  }

  .jx-toast {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    box-sizing: border-box;
    padding: 0.75rem 0.875rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    pointer-events: auto;
    animation: jx-toast-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-toast-leaving {
    animation: jx-toast-out 180ms ease-in forwards;
  }
  @keyframes jx-toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
  @keyframes jx-toast-out {
    to {
      opacity: 0;
      transform: translateX(12px);
    }
  }

  .jx-toast-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .jx-toast-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-toast-desc {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }

  .jx-toast-primary {
    border-color: var(--primary);
  }
  .jx-toast-primary .jx-toast-title {
    color: var(--primary);
  }
  .jx-toast-destructive {
    border-color: var(--destructive);
  }
  .jx-toast-destructive .jx-toast-title {
    color: var(--destructive);
  }

  .jx-toast-dismiss {
    flex: none;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin: -0.125rem -0.25rem 0 0;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  .jx-toast-dismiss:hover {
    color: var(--foreground);
  }
  .jx-toast-dismiss:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-toast,
    .jx-toast-leaving {
      animation: none;
    }
  }
</style>
