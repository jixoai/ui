<!--
  jixoai toast viewport (registry/files/ui/toast/toast-viewport.svelte).
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

  Exit frames: a dismissed toast's SNAPSHOT survives in a leaving map
  until the exit animation window passes (animationend or the sweeper)
  — the store already dropped the item, but the pixels finish their
  sentence. prefers-reduced-motion collapses both animations to none.

  tw4 (2026-08-24): utility-authored — the corner stack, the toast
  card, tone voices (conditional utilities per tone prop), and the
  enter/exit animations (arbitrary-value animate utilities; the
  leaving swap rides cn()'s tail so tailwind-merge resolves the
  conflict) live in the markup; ONLY the two keyframes and the
  reduced-motion kill stay in toast.css (D1-exempt residue — keyframes
  are not utilities, and the kill overrides the animate utility, so it
  rides the unlayered :where carve-out).
-->
<script lang="ts">
  import type { ToastStore, ToastItem } from '$lib/toast-store';
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import './toast.css';

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
  /** dismissed snapshots still painting their exit frame, by id */
  let leavingItems = $state<ToastItem[]>([]);
  /** exit-window timers — all cleared when the viewport unmounts */
  const exitTimers = new Set<ReturnType<typeof setTimeout>>();

  const EXIT_MS = 220; // 180ms animation + a frame of margin

  onMount(() => {
    const unsubscribe = store.subscribe((next) => {
      // adopt dismissals as exit snapshots BEFORE swapping the queue
      const gone = items.filter((prev) => !next.some((n) => n.id === prev.id));
      leavingItems = [...leavingItems, ...gone];
      items = next;
      if (gone.length > 0) {
        const timer = setTimeout(() => {
          exitTimers.delete(timer);
          leavingItems = leavingItems.filter(
            (leaving) => !gone.some((g) => g.id === leaving.id),
          );
        }, EXIT_MS);
        exitTimers.add(timer);
      }
    });
    return () => {
      unsubscribe();
      for (const timer of exitTimers) clearTimeout(timer);
      exitTimers.clear();
    };
  });

  const visible = $derived(items.slice(-maxVisible));
  const renders = $derived([...visible.filter((v) => !leavingItems.some((l) => l.id === v.id)), ...leavingItems]);
  // queue honesty (site-polish F6): the store may hold more toasts than
  // the viewport renders — a tail chip says so instead of the stack
  // silently hiding them. Pure paint: no behavior, no timers.
  const queuedCount = $derived(Math.max(0, items.length - maxVisible));

  // variant grammar (variant-grammar change): the ladder drives border
  // + ink over the FLOATING surface law (bg-popover stays — toasts
  // float over content like their popover siblings; the §1 recipes'
  // transparent ground is the in-flow surface law). Tonal tints its
  // 12% OVER the popover ground (color-mix base swap), and title +
  // description consume the variant ink (the alert r2 ruling: an
  // error toast must not paint a red title over gray body). Each rung
  // carries its §6 forced-colors degradation.
  const variantPaint = {
    outline:
      'bg-popover border-[color:var(--jx-outline)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
    tonal: 'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,var(--popover))] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
  } as const;
  const titleInk = {
    outline: 'text-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const descInk = {
    outline: 'text-muted-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const itemVariant = (item: ToastItem) => item.variant ?? 'outline';
</script>

<div data-jx-toasts="" class={cn('fixed right-4 bottom-4 z-[90] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))] pointer-events-none', className)} aria-label="notifications">
  {#each renders as item (item.id)}
    {@const leaving = leavingItems.some((l) => l.id === item.id)}
    {@const variant = itemVariant(item)}
    <div
      data-jx-toast={variant}
      class={cn(
        `jx-toast flex items-start gap-2.5 box-border px-3.5 py-3 border text-popover-foreground shadow rounded pointer-events-auto animate-[jx-toast-in_200ms_cubic-bezier(0.22,1,0.36,1)]`,
        variantPaint[variant],
        leaving && 'jx-toast-leaving animate-[jx-toast-out_180ms_ease-in_forwards]',
        item.class,
      )}
      role={item.assertive ? 'alert' : 'status'}
      onpointerenter={() => store.pause(item.id)}
      onpointerleave={() => store.resume(item.id)}
      onfocusin={() => store.pause(item.id)}
      onfocusout={(e) => {
        // focus crossing WITHIN the toast must not resume the countdown
        if (!e.currentTarget.contains(e.relatedTarget)) store.resume(item.id);
      }}
    >
      <div data-jx-toast-body="" class="flex flex-1 flex-col gap-1 min-w-0">
        <p data-jx-toast-title="" class={cn('font-nav text-xs tracking-[0.1em] uppercase', titleInk[variant])}>{item.title}</p>
        {#if item.description}
          <p data-jx-toast-desc="" class={cn('text-[0.8125rem] leading-[1.5]', descInk[variant])}>{item.description}</p>
        {/if}
      </div>
      <button
        type="button"
        data-jx-toast-dismiss=""
        class="flex-none appearance-none inline-flex items-center justify-center size-5 -mt-0.5 -mr-1 border-0 bg-transparent text-muted-foreground text-base leading-none cursor-pointer hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px] forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:[outline-color:Highlight] forced-colors:text-[ButtonText]"
        aria-label="dismiss notification"
        onclick={() => store.api.dismiss(item.id)}
      >
        ×
      </button>
    </div>
  {/each}
  {#if queuedCount > 0}
    <div
      data-jx-toast-queued={queuedCount}
      class="self-end box-border px-2.5 py-1 border rounded bg-popover text-popover-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase text-muted-foreground forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]"
      aria-hidden="true"
    >
      +{queuedCount} queued
    </div>
  {/if}
</div>
