<!--
  jixoai spin (registry/files/ui/spin/spin.svelte,
  spin-ora-svg-lane C2, design §2-§4, 2026-09-11).

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
    /** the svg posture's square edge (text posture ignores it — icon parity) */
    size?: number | string;
    /** wrapping content = container posture with scrim + aria-busy */
    children?: Snippet;
    class?: string;
  }

  let {
    spinner = 'dots',
    label = 'loading',
    size,
    children,
    class: className = '',
  }: Props = $props();

  // the unified name lane, artifact FIRST (design §4)
  const svgData = $derived(isSpinName(spinner) ? getSpin(spinner) : null);

  // catalog second; both lanes miss (only via a cast) → dots frame 0
  const unknownName = $derived(svgData === null && !Object.hasOwn(SPINNER_CATALOG, spinner));
  const text = $derived(textOf(spinner));

  // the family's single read point — icon parity: explicit ?? own 16
  const resolvedSize = $derived(SpinDefaults.resolve({ size }).size);

  let frame = $state(0);
  let root: SVGSVGElement | undefined;

  $effect(() => {
    if (typeof window === 'undefined') return;

    // dep pins — spinner/posture change re-runs the whole engine
    // (cleanup + restart at the new interval, design §2)
    const svg = svgData !== null;
    const count = text.frames.length;
    const step = text.interval;
    if (unknownName) warnUnknownOnce(spinner);

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
    // change — under reduce the interval is torn down and SMIL freezes
    // (pauseAnimations); on un-reduce both restart
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
        frame = 0;
      } else if (id === undefined && !svg) {
        frame = 0;
        i = 0;
        // the callback writes `frame` from the local counter `i` — the
        // async write sits outside this effect's dependency capture by
        // construction (no re-subscribe on tick, design §2)
        id = setInterval(() => {
          i += 1;
          frame = i % count;
        }, step);
      }
    };

    onChange();
    mql?.addEventListener('change', onChange);

    return () => {
      if (id !== undefined) clearInterval(id);
      mql?.removeEventListener('change', onChange);
    };
  });
</script>

{#snippet svgGlyph(data: SpinData)}
  <!-- the component owns the svg root (design §3): viewBox from the
       artifact, the resolved square edge, nature-aware currentColor
       painting, aria-hidden — the payload `d` crosses through the
       {@html} sink verbatim -->
  <svg
    bind:this={root}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={data.v}
    width={resolvedSize}
    height={resolvedSize}
    fill={data.n === 'fill' ? 'currentColor' : 'none'}
    stroke={data.n === 'fill' ? 'none' : 'currentColor'}
    aria-hidden="true"
    data-jx-spin-svg=""
    class="text-primary"
  >{@html data.d}</svg>
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
        <span data-jx-spin-cursor="" class="font-mono text-[0.875rem] text-primary" aria-hidden="true">{text.frames[frame]}</span>
      {/if}
    </div>
    <div data-jx-spin-content="" class="[grid-area:1/1]" aria-hidden="false">
      {@render children()}
    </div>
    <div data-jx-spin-scrim="" class="[grid-area:1/1] bg-(--scrim)" aria-hidden="true"></div>
  </div>
{:else}
  <span data-jx-spin-inline="" class={cn('inline-flex items-center font-mono text-[0.8125rem] text-primary', className)} role="status" aria-label={label}>
    {#if svgData}
      {@render svgGlyph(svgData)}
    {:else}
      <span data-jx-spin-cursor="" aria-hidden="true">{text.frames[frame]}</span>
    {/if}
  </span>
{/if}
