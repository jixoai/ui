<!--
  jixoai boot splash (registry/files/ui/boot-splash/boot-splash.svelte,
  the FOUC round, 2026-09-19 — Owner design).
 
  THE PROBLEM IT MASKS: styles arrive asynchronously — the built head
  carries ~20 render-blocking stylesheet links (a waterfall on slow
  networks), and the dev lane's stylex css rides a JS fetcher module
  (a guaranteed bare flash). Whatever the cause, the first paint can
  be wrong; the splash covers that window with a layer whose styles
  CANNOT be late.
 
  ZERO-CSS-FILE LAW (the design's core): every style this component
  needs rides the HTML itself —
    - element styles live in INLINE style attributes (layout, z,
      type), and
    - the sheet-level vocabulary (light/dark grounds via
      prefers-color-scheme, the exit keyframes, the reduced-motion
      and noscript escapes) rides a <style> block inside
      <svelte:head> — Svelte SSR renders head content INLINE into the
      document, so it arrives with the HTML, never as an async chunk.
  The component imports NO css, NO atoms, NO tokens (the prototype
  family's posture, by the same law: any external stylesheet would
  reintroduce the very race this layer exists to hide).
 
  THE SLOTS (Owner spec): logo · loading (default: a hardcoded SMIL
  SVG spinner — zero css dependency by construction; compose a
  spin-pack loader here, its svg carries its own inline styles) ·
  title · subtitle · description (progress or time-consuming copy).
 
  EXIT (Owner spec): 'opacity-out' | 'blur-out' | 'none' — keyframes
  live in the same head block; the animationend hands control back
  (open flips false; the layer unmounts). prefers-reduced-motion
  skips the animation. <noscript> hides the layer (no-JS never
  traps the page behind a splash).
 
  REVEAL SIGNAL: revealOn='fonts' (document.fonts.ready — the last
  layout-shifting resource class) | 'load' (the window load event) |
  'manual' (bind:open is yours). A timeoutMs cap (default 4s) is the
  belt: a hung font CDN never holds the page hostage; a minimum
  display floor avoids the blink-flash of an instant dismissal.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type ExitKind = 'opacity-out' | 'blur-out' | 'none';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the brand mark (LOGO slot) */
    logo?: Snippet;
    /** the loading animation slot (default: hardcoded SMIL spinner) */
    loading?: Snippet;
    /** the primary line */
    title?: string;
    /** the secondary line */
    subtitle?: string;
    /** running copy — progress, or time-consuming text (Owner spec) */
    description?: string;
    /** the exit animation (default opacity-out) */
    exit?: ExitKind;
    /** when the layer dismisses itself (default 'fonts'); 'manual' = bind:open */
    revealOn?: 'fonts' | 'load' | 'manual';
    /** the hard cap — a hung resource never holds the page (ms) */
    timeoutMs?: number;
    /** the minimum display floor — avoids the instant-dismiss blink (ms) */
    minMs?: number;
    /** the exit animation length (ms) */
    durationMs?: number;
    /** the dismissal state (bindable; manual mode's control surface) */
    open?: boolean;
  }

  let {
    logo,
    loading,
    title,
    subtitle,
    description,
    exit = 'opacity-out',
    revealOn = 'fonts',
    timeoutMs = 4000,
    minMs = 350,
    durationMs = 350,
    open = $bindable(true),
    ...rest
  }: Props = $props();

  // the exit phase: '' while covering, the keyframe class while
  // leaving — animationend completes the dismissal
  let leaving = $state(false);
  let mountedAt = 0;

  const finish = () => {
    leaving = false;
    open = false;
  };

  const onExitEnd = (event: Event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.jxSplash === 'layer') finish();
  };

  // manual mode's exit lane: bind:open flipping false runs the SAME
  // exit vocabulary the auto flow rides (the layer stays mounted while
  // leaving, animationend unmounts) — exit='none' and reduced-motion
  // need no phase, the render gate below unmounts instantly
  let prevOpen = open;
  $effect(() => {
    const was = prevOpen;
    prevOpen = open;
    // enter the leaving phase ONLY when an animation will actually run
    // (exit='none'/reduced-motion never fires animationend — the render
    // gate would hold the layer forever)
    if (
      was &&
      !open &&
      revealOn === 'manual' &&
      exit !== 'none' &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      leaving = true;
  });

  $effect(() => {
    if (!open) return;
    mountedAt = performance.now();
    if (revealOn === 'manual') return;

    let done = false;
    let cap: ReturnType<typeof setTimeout> | undefined;
    const dismiss = () => {
      if (done) return;
      done = true;
      clearTimeout(cap);
      // honor the display floor, then run the exit
      const elapsed = performance.now() - mountedAt;
      const wait = Math.max(0, minMs - elapsed);
      setTimeout(() => {
        if (exit === 'none' || matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
        else leaving = true; // the keyframe end finishes
      }, wait);
    };

    if (revealOn === 'fonts' && document.fonts?.ready instanceof Promise) {
      document.fonts.ready.then(dismiss, dismiss);
    } else if (revealOn === 'load') {
      if (document.readyState === 'complete') dismiss();
      else addEventListener('load', dismiss, { once: true });
    } else {
      dismiss();
    }
    // the belt: never hold longer than timeoutMs
    cap = setTimeout(dismiss, timeoutMs);
    return () => {
      done = true;
      clearTimeout(cap);
    };
  });
</script>

<svelte:head>
  <style data-jx-boot-splash="">
    .jx-boot-splash-layer {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      /* the grounds are HARDCODED pairs — the token sheet may not
         have arrived yet; both schemes carry their own ink */
      background: oklch(1 0 0);
      color: oklch(0.2 0 0);
      /* the mask is VISUAL-ONLY: it never eats input — a fast click
         during the boot window passes through to the (unstyled but
         functional) page beneath (the km gate's dock-flip click was
         the receipt: a full-viewport z-max layer intercepts REAL
         coordinate clicks, Playwright's included) */
      pointer-events: none;
      font-family: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
      text-align: center;
    }
    @media (prefers-color-scheme: dark) {
      .jx-boot-splash-layer {
        background: oklch(0.145 0 0);
        color: oklch(0.9551 0 0);
      }
    }
    .jx-boot-splash-title { font-size: 1rem; letter-spacing: 0.08em; }
    .jx-boot-splash-subtitle { font-size: 0.8125rem; opacity: 0.72; letter-spacing: 0.04em; }
    .jx-boot-splash-desc { font-size: 0.75rem; opacity: 0.55; }
    /* the exit vocabulary (Owner spec) */
    @keyframes jx-boot-splash-opacity-out { to { opacity: 0; } }
    @keyframes jx-boot-splash-blur-out {
      to { opacity: 0; filter: blur(14px); }
    }
    .jx-boot-splash-exit-opacity { animation: jx-boot-splash-opacity-out var(--jx-boot-splash-duration, 350ms) ease-out forwards; }
    .jx-boot-splash-exit-blur { animation: jx-boot-splash-blur-out var(--jx-boot-splash-duration, 350ms) ease-out forwards; }
    @media (prefers-reduced-motion: reduce) {
      .jx-boot-splash-exit-opacity, .jx-boot-splash-exit-blur { animation: none; }
    }
  </style>
  <noscript>
    <style data-jx-boot-splash-noscript="">.jx-boot-splash-layer { display: none !important; }</style>
  </noscript>
</svelte:head>

{#if open || leaving}
  <div
    data-jx-splash="layer"
    class="jx-boot-splash-layer"
    class:jx-boot-splash-exit-opacity={leaving && exit === 'opacity-out'}
    class:jx-boot-splash-exit-blur={leaving && exit === 'blur-out'}
    style="--jx-boot-splash-duration: {durationMs}ms"
    role="status"
    aria-label={title ?? 'loading'}
    onanimationend={onExitEnd}
    {...rest}
  >
    {#if logo}
      {@render logo()}
    {/if}
    {#if loading}
      {@render loading()}
    {:else}
      <!-- the default: a hardcoded SMIL arc spinner — animateTransform
           rides the SVG itself, zero css dependency by construction -->
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-opacity="0.2" stroke-width="2.5"></circle>
        <path d="M 14 4 A 10 10 0 0 1 24 14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 14 14" to="360 14 14" dur="0.9s" repeatCount="indefinite"></animateTransform>
        </path>
      </svg>
    {/if}
    {#if title}<div class="jx-boot-splash-title">{title}</div>{/if}
    {#if subtitle}<div class="jx-boot-splash-subtitle">{subtitle}</div>{/if}
    {#if description}<div class="jx-boot-splash-desc">{description}</div>{/if}
  </div>
{/if}
