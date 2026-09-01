<!--
  jixoai toast viewport (registry/files/ui/toast/toast-viewport.svelte;
  material/effect rebuild, 2026-09-01).
  The presentation half of the toast pair: mount ONCE in the root
  layout with the store your app created —

    const toast = createToastStore();
    <ToastViewport store={toast} />
    …anywhere: toast.api.push({ title: 'Deployed' })

  THE VIEWPORT DOES NOT FLOAT ITSELF (Owner ruling, 2026-09-01 — the
  float-button law): when a website-scaffold is present, the stack
  ADOPTS into its top layer's float plane through the SAME jx-top-layer
  context contract (via ScaffoldFloat — one adoption mechanism); the
  stack then flows inside the plane (end-corner alignment, zero fixed
  positioning). Without a scaffold (registry standalone), the legacy
  fixed corner remains the fallback.

  THE STACK IS A GRID (2026-09-01): rows auto-stack — no column
  tricks; every toast is a row of the plane's own grid. Each TOAST is
  itself a grid with LANES: leading | body | trailing | dismiss — the
  store's leading/trailing snippets compose into them (an icon, an
  action row, the countdown companion), the built-in countdown flag
  mounts ToastCountdown in the trailing lane.

  MATERIAL × EFFECT (float-button's model): material picks the GROUND
  (popover solid, default | glass — backdrop-filter translucent, the
  entity law's restrained ground); variant stays the prominence ladder
  independently; effect picks the LOOP (none | pulse — breathing ring |
  sweep — a traveling light, the live signal).

  The viewport owns what the store deliberately does not: the max
  VISIBLE count (older toasts stay queued), live-region semantics per
  item (role=status polite, role=alert when assertive — never one live
  region announcing everything), the dismiss button, and the unified
  HOLD (pointer enter / focus freezes BOTH clocks — the store's expiry
  timer and the countdown companion's drain — leave/cross-out resumes).

  Exit frames: a dismissed toast's SNAPSHOT survives in a leaving map
  until the exit animation window passes (animationend or the sweeper)
  — the store already dropped the item, but the pixels finish their
  sentence. prefers-reduced-motion collapses every animation to none.
-->
<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { ToastStore, ToastItem } from '$lib/toast-store';
  import { cn } from '$lib/utils';
  import ScaffoldFloat from '$lib/ui/scaffold-float/scaffold-float.svelte';
  import type { TopLayerApi } from '$lib/ui/website-scaffold/website-scaffold.svelte';
  import ToastCountdown from './toast-countdown.svelte';
  import './toast.css';

  interface Props {
    /** the app-created store (createToastStore()) */
    store: ToastStore;
    /** max toasts rendered at once; older ones stay queued (default 4) */
    maxVisible?: number;
    /** extra classes on the stack */
    class?: string;
  }

  let { store, maxVisible = 4, class: className = '' }: Props = $props();

  // the float plane contract — present inside a website-scaffold,
  // undefined in a standalone registry mount (the fixed fallback)
  const topLevel = getContext<TopLayerApi | undefined>('jx-top-layer');

  let items = $state<ToastItem[]>([]);
  /** dismissed snapshots still painting their exit frame, by id */
  let leavingItems = $state<ToastItem[]>([]);
  /** the unified hold: the id currently frozen (hover/focus) */
  let heldId = $state<number | null>(null);
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

  // the unified hold — one freeze for both clocks
  function hold(id: number): void {
    heldId = id;
    store.pause(id);
  }
  function release(id: number): void {
    if (heldId === id) heldId = null;
    store.resume(id);
  }

  // variant grammar: the ladder drives border + ink; MATERIAL picks the
  // ground independently (popover solid default; glass = the backdrop-
  // filter translucent — the entity law's restrained ground). Tonal
  // tints 12% OVER the ground; the §6 forced-colors degradations ride
  // every rung.
  const variantBorder = {
    outline:
      'border-[color:var(--jx-outline)] forced-colors:border-[CanvasText]',
    tonal: 'border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] forced-colors:border-[CanvasText]',
  } as const;
  const materialGround = {
    popover: 'bg-popover forced-colors:bg-[Canvas]',
    glass: 'bg-[color-mix(in_oklab,var(--popover)_55%,transparent)] backdrop-blur-md forced-colors:bg-[Canvas]',
  } as const;
  const tonalGround = 'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,var(--popover))]';
  const titleInk = {
    outline: 'text-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const descInk = {
    outline: 'text-muted-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const itemVariant = (item: ToastItem) => item.variant ?? 'outline';
  const itemMaterial = (item: ToastItem) => item.material ?? 'popover';
</script>

<!-- THE STACK — one snippet, two homes: adopted into the scaffold's
     float plane (flow inside the overlay grid; the end-corner is the
     grid's own alignment), or the legacy fixed corner when standalone -->
{#snippet stack()}
  <div
    data-jx-toasts=""
    class={cn(
      'grid gap-2 justify-items-stretch pointer-events-none',
      topLevel
        ? 'h-full w-auto justify-self-end align-content-end p-4'
        : 'fixed right-4 bottom-4 z-[90] w-[min(22rem,calc(100vw-2rem))]',
      className,
    )}
    aria-label="notifications"
  >
    {#each renders as item (item.id)}
      {@const leaving = leavingItems.some((l) => l.id === item.id)}
      {@const variant = itemVariant(item)}
      {@const material = itemMaterial(item)}
      <div
        data-jx-toast={variant}
        data-material={material}
        data-effect={item.effect && item.effect !== 'none' ? item.effect : undefined}
        class={cn(
          `jx-toast grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-2.5 box-border px-3.5 py-3 border text-popover-foreground shadow rounded pointer-events-auto animate-[jx-toast-in_200ms_cubic-bezier(0.22,1,0.36,1)]`,
          material === 'glass' ? materialGround.glass : variant === 'tonal' ? tonalGround : materialGround.popover,
          variantBorder[variant],
          leaving && 'jx-toast-leaving animate-[jx-toast-out_180ms_ease-in_forwards]',
          item.class,
        )}
        role={item.assertive ? 'alert' : 'status'}
        onpointerenter={() => hold(item.id)}
        onpointerleave={() => release(item.id)}
        onfocusin={() => hold(item.id)}
        onfocusout={(e) => {
          // focus crossing WITHIN the toast must not resume the countdown
          if (!e.currentTarget.contains(e.relatedTarget)) release(item.id);
        }}
      >
        {#if item.leading}
          <div data-jx-toast-leading="" class="flex-none self-start pt-0.5">{@render item.leading()}</div>
        {/if}
        <div data-jx-toast-body="" class="grid min-w-0 gap-1">
          <p data-jx-toast-title="" class={cn('font-nav text-xs tracking-[0.1em] uppercase', titleInk[variant])}>{item.title}</p>
          {#if item.description}
            <p data-jx-toast-desc="" class={cn('text-[0.8125rem] leading-[1.5]', descInk[variant])}>{item.description}</p>
          {/if}
        </div>
        {#if item.trailing || (item.countdown && (item.duration ?? 5000) > 0)}
          <div data-jx-toast-trailing="" class="flex flex-none items-center gap-2.5 self-stretch">
            {#if item.trailing}{@render item.trailing()}{/if}
            {#if item.countdown && (item.duration ?? 5000) > 0}
              <ToastCountdown duration={item.duration ?? 5000} paused={heldId === item.id} />
            {/if}
          </div>
        {/if}
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
        class="justify-self-end box-border px-2.5 py-1 border rounded bg-popover text-popover-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase text-muted-foreground forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]"
        aria-hidden="true"
      >
        +{queuedCount} queued
      </div>
    {/if}
  </div>
{/snippet}

{#if topLevel}
  <!-- the float plane owns the viewport — no fixed positioning anywhere -->
  <ScaffoldFloat area="float">{@render stack()}</ScaffoldFloat>
{:else}
  {@render stack()}
{/if}
