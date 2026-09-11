<!--
  jixoai spin (registry/files/ui/spin/spin.svelte,
  spin-ora-svg-lane C2, design §2-§4, 2026-09-11;
  review round 2026-09-12: the density ruler, whitespace-pre,
  the ghost trail).

  The loading indicator, ora's voice: one `spinner` name lane over two
  corpora — the generated svg artifact ($lib/spin-set.gen, direct
  import the icon precedent) FIRST, the cli-spinners text catalog
  (./spin-catalog) second; an artifact spinner named like a text one
  OVERRIDES it (explicit config beats built-ins, the icons override
  law — design §4). Default 'dots' (ora's own; the old /—\| cycle
  remains as `line`). role=status + aria-label (polite by
  construction; loading is never an interruption).

  The frame engine (design §2) is ora's own mechanism — a $state frame
  index + $effect interval at the catalog's per-spinner interval. SSR
  renders frame 0 statically (the effect never runs server-side;
  hydration matches, no mismatch). prefers-reduced-motion is observed
  LIVE: the matchMedia change listener tears the interval down under
  reduce (frame rests on 0 — the retired CSS kill's static first-frame
  landing) and restarts it on un-reduce. The svg posture's SMIL clock
  freezes through the SAME listener (pauseAnimations/unpauseAnimations
  — design §3's first named channel; CSS-keyframed loaders ride
  spin.css's static kill, the second channel — never conflated).

  The glyph rides the density ruler (review R1/R4): text frames paint
  at var(--jx-text), the svg's DEFAULT square edge at var(--jx-icon)
  — one ruler, both postures, so density rungs size the whole
  indicator together and the two postures keep comparable boxes (the
  explicit `size` prop still pins the svg edge when given; the size
  slot is an absentSlot — absent IS the state, the ruler var fills
  it). Frame text renders whitespace-pre (review R3): catalog frames
  carry meaningful spaces (simpleDots' blank frame is three of them)
  — collapsing them makes the glyph box breathe frame-to-frame; pre
  keeps every frame of one spinner at its mono advance width.

  The two timings (review R6/R7): `ghost` is a fade-out duration in
  ms for the TEXT posture — each retiring frame stays visible in the
  cursor's own grid cell, fading out LINEARLY over the duration, so
  several frames coexist (the trail length emerges from ghost /
  interval). `interval` overrides the frame step (explicit prop >
  the Defaults slot > the spinner's catalog value) — the pair shapes
  the trail together, and BOTH ride the family's single Defaults
  contract, so a context (or the plugin mounting one) can set them
  ambiently. Ghosts never spawn under reduced motion and clear on
  freeze; SSR renders none (hydration matches).

  Two postures:
    bare (default)  <Spin label="loading checks" /> — inline glyph
    wrapping        <Spin label><content/></Spin> — the container gets
                    aria-busy, a scrim, and pointer-events blocking
                    (the ruling: never a visual mask with live hit
                    areas beneath — loading and disabled are different
                    states, and the overlay must own both pointers and
                    clearly-presented keyboard state)

  {@html} is an internal render detail, never a public API: its
  payload is exclusively the plugin-extracted `d` of the generated
  artifact (RAW-gated upstream, design §3) — nothing from props can
  reach the sink.
-->
<script module lang="ts">
  import { SPIN_NAMES, type SpinData, type SpinName } from '$lib/spin-set.gen';
  import { SPINNER_CATALOG, type TextSpinner, type TextSpinnerName } from './spin-catalog';

  // SPIN_NAMES widened to readonly string[] for the includes() probe —
  // the sanctioned boundary cast of the name lane: the prop arrives as
  // the OPEN union SpinName | TextSpinnerName, which .includes() cannot
  // take without it (design §4)
  const SPIN_NAME_KEYS: readonly string[] = SPIN_NAMES;

  function isSpinName(name: string): name is SpinName {
    return SPIN_NAME_KEYS.includes(name);
  }

  // text lane: the catalog hit, or the dots fallback when both lanes
  // miss (design §4 — loading feedback never disappears). Object.hasOwn
  // does not narrow Record keys, so the index rides the sanctioned
  // TextSpinnerName cast at this exact boundary.
  function textOf(name: string): TextSpinner {
    return Object.hasOwn(SPINNER_CATALOG, name)
      ? SPINNER_CATALOG[name as TextSpinnerName]
      : SPINNER_CATALOG.dots;
  }

  // unknown-name dev warn, one per name per session (the icon
  // warnedChunks precedent) — reachable only when the prop is cast
  // past the union; repeated mounts of the same name stay silent
  const warnedNames = new Set<string>();

  function warnUnknownOnce(name: string): void {
    if (warnedNames.has(name)) return;
    warnedNames.add(name);
    console.warn(
      `[jixoai/spin] unknown spinner '${name}' — rendering the 'dots' catalog fallback`,
    );
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import { getSpin } from '$lib/spin-set.gen';
  import { SpinDefaults } from './spin-defaults.svelte';
  import './spin.css';

  interface Props {
    /** the spinner's name — artifact svg lane first, text catalog second (design §4) */
    spinner?: SpinName | TextSpinnerName;
    /** announced to assistive tech ("loading checks") */
    label?: string;
    /** the svg posture's square edge — absent rides var(--jx-icon), the density ruler */
    size?: number | string;
    /** the frame step in ms — explicit prop > the Defaults slot (context/plugin injectable) > the spinner's catalog interval */
    interval?: number;
    /** text-posture ghost trail: each retiring frame's linear fade-out duration in ms — explicit > Defaults slot > off */
    ghost?: number;
    /** wrapping content = container posture with scrim + aria-busy */
    children?: Snippet;
    class?: string;
  }

  let {
    spinner = 'dots',
    label = 'loading',
    size,
    interval,
    ghost,
    children,
    class: className = '',
  }: Props = $props();

  // the unified name lane, artifact FIRST (design §4)
  const svgData = $derived(isSpinName(spinner) ? getSpin(spinner) : null);

  // catalog second; both lanes miss (only via a cast) → dots frame 0
  const unknownName = $derived(svgData === null && !Object.hasOwn(SPINNER_CATALOG, spinner));
  const text = $derived(textOf(spinner));

  // the family's single read point: the absentSlots — explicit props
  // (or a consumer's slot config) resolve; ABSENT resolves undefined
  // and the component falls back: size rides the density ruler's
  // --jx-icon (review R1), interval rides the spinner's catalog
  // value, ghost rides off. Both timings are context/plugin
  // injectable through the one Defaults contract (review R7)
  const resolved = $derived(
    SpinDefaults.resolve({
      size,
      // non-positive timings mean "absent" (the playground's 0 = catalog/off
      // convention) — a 0ms interval must never reach setInterval
      interval: interval !== undefined && interval > 0 ? interval : undefined,
      ghost: ghost !== undefined && ghost > 0 ? ghost : undefined,
    }),
  );

  // CSS lengths need a unit — numeric sizes px-coerce, strings verbatim
  const cssSize = $derived(
    typeof resolved.size === 'number' ? `${resolved.size}px` : resolved.size,
  );

  // the two timings shape the trail together (review R6/R7): the
  // frame step and the ghost fade-out
  const stepMs = $derived(resolved.interval ?? text.interval);
  const ghostMs = $derived(resolved.ghost !== undefined && resolved.ghost > 0 ? resolved.ghost : 0);
  const ghostStyle = $derived(ghostMs > 0 ? `--jx-ghost-ms: ${ghostMs}ms` : undefined);

  // one trail entry per retired frame, removed by its own timeout —
  // written only from the interval callback (outside dependency
  // capture, the frame-index law)
  interface GhostEntry {
    readonly id: number;
    readonly char: string;
  }
  let ghosts = $state<GhostEntry[]>([]);
  let ghostSeq = 0;

  let frame = $state(0);
  let root: SVGSVGElement | undefined;

  $effect(() => {
    if (typeof window === 'undefined') return;

    // dep pins — spinner/posture/ghost change re-runs the whole engine
    // (cleanup + restart at the new interval, design §2)
    const svg = svgData !== null;
    const count = text.frames.length;
    const step = stepMs;
    const trail = ghostMs;
    if (unknownName) warnUnknownOnce(spinner);
    ghosts = [];

    // per-entry removal timers — every one clears on teardown
    const pendingGhosts = new Set<ReturnType<typeof setTimeout>>();

    // the reduced-motion channel (design §2/§3): guarded the house way
    // (hue-runtime/surface-motion precedent — jsdom and other bare
    // environments carry no matchMedia; the un-observed default is
    // motion-on, the browser default)
    const mql =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    let id: ReturnType<typeof setInterval> | undefined;
    let i = 0;

    // LIVE semantics: applied immediately, re-applied on every media
    // change — under reduce the interval is torn down, lingering
    // ghosts clear, and SMIL freezes (pauseAnimations); on un-reduce
    // both restart
    const onChange = () => {
      const reduced = mql?.matches ?? false;
      if (mql && root) {
        if (reduced) root.pauseAnimations();
        else root.unpauseAnimations();
      }
      if (reduced) {
        if (id !== undefined) {
          clearInterval(id);
          id = undefined;
        }
        for (const t of pendingGhosts) clearTimeout(t);
        pendingGhosts.clear();
        ghosts = [];
        frame = 0;
      } else if (id === undefined && !svg) {
        frame = 0;
        i = 0;
        // the callback writes `frame`/`ghosts` from local state — the
        // async writes sit outside this effect's dependency capture by
        // construction (no re-subscribe on tick, design §2)
        id = setInterval(() => {
          if (trail > 0) {
            const gid = ghostSeq++;
            ghosts.push({ id: gid, char: text.frames[i % count] });
            const t = setTimeout(() => {
              ghosts = ghosts.filter((g) => g.id !== gid);
            }, trail);
            pendingGhosts.add(t);
          }
          i += 1;
          frame = i % count;
        }, step);
      }
    };

    onChange();
    mql?.addEventListener('change', onChange);

    return () => {
      if (id !== undefined) clearInterval(id);
      for (const t of pendingGhosts) clearTimeout(t);
      pendingGhosts.clear();
      mql?.removeEventListener('change', onChange);
    };
  });
</script>

{#snippet svgGlyph(data: SpinData)}
  <!-- the component owns the svg root (design §3): viewBox from the
       artifact, nature-aware currentColor painting, aria-hidden — the
       payload `d` crosses through the {@html} sink verbatim. The
       square edge: an explicit size lands as width/height attributes;
       ABSENT rides the density ruler through CSS (attrs cannot carry
       var() — presentation attributes are not CSS declarations) -->
  <svg
    bind:this={root}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={data.v}
    width={cssSize}
    height={cssSize}
    style={resolved.size === undefined ? 'width: var(--jx-icon); height: var(--jx-icon)' : undefined}
    fill={data.n === 'fill' ? 'currentColor' : 'none'}
    stroke={data.n === 'fill' ? 'none' : 'currentColor'}
    aria-hidden="true"
    data-jx-spin-svg=""
    class="text-primary"
  >{@html data.d}</svg>
{/snippet}

{#snippet textCursor()}
  <!-- the one-cell cursor (review R3/R6): every frame — current and
       ghost — occupies the SAME grid cell, whitespace-pre keeps each
       at its mono advance width, so the box never breathes. Ghosts
       render BEFORE the live frame (later grid children paint on
       top) and fade linearly over --jx-ghost-ms -->
  <span
    data-jx-spin-cursor=""
    class="relative inline-grid whitespace-pre font-mono text-[length:var(--jx-text)] text-primary"
    style={ghostStyle}
    aria-hidden="true"
  >
    {#each ghosts as g (g.id)}
      <span
        data-jx-spin-ghost=""
        class="pointer-events-none [grid-area:1/1] animate-[jx-spin-ghost_var(--jx-ghost-ms)_linear_forwards]"
      >{g.char}</span>
    {/each}
    <span data-jx-spin-frame="" class="[grid-area:1/1]">{text.frames[frame]}</span>
  </span>
{/snippet}

{#if children}
  <!-- container posture (CR-2, 2026-09-02): one-cell GRID stacking — the
       badge centers by place-self, the busy-scrim stretches — no
       position:absolute anywhere; the scrim is the --scrim family token
       (a modal dim, never the retired hand-mixed background tint).
       isolate (stacking-isolation, 2026-09-09): the badge's z-[1] is
       this wrap's private rung — the spin is demo-able anywhere -->
  <div data-jx-spin-wrap="" class={cn('grid isolate', className)} aria-busy="true">
    <div data-jx-spin-live="" class="z-[1] [grid-area:1/1] place-self-center px-3.5 py-2 border border-border bg-popover shadow" role="status" aria-label={label}>
      {#if svgData}
        {@render svgGlyph(svgData)}
      {:else}
        {@render textCursor()}
      {/if}
    </div>
    <div data-jx-spin-content="" class="[grid-area:1/1]" aria-hidden="false">
      {@render children()}
    </div>
    <div data-jx-spin-scrim="" class="[grid-area:1/1] bg-(--scrim)" aria-hidden="true"></div>
  </div>
{:else}
  <span data-jx-spin-inline="" class={cn('inline-flex items-center text-[length:var(--jx-text)] text-primary', className)} role="status" aria-label={label}>
    {#if svgData}
      {@render svgGlyph(svgData)}
    {:else}
      {@render textCursor()}
    {/if}
  </span>
{/if}
