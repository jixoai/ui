<!--
  jixoai spin (registry/files/ui/spin/spin.svelte,
  spin-ora-svg-lane C2, design §2-§4, 2026-09-11;
  review rounds 2026-09-12: the density ruler, whitespace-pre, the
  linger trail; round 4: the CSS flat engine + hand-tuned pairs).

  The loading indicator, ora's voice: one `spinner` name lane over two
  corpora — the generated svg artifact ($lib/spin-set.gen, direct
  import the icon precedent) FIRST, the cli-spinners text catalog
  (./spin-catalog) second; an artifact spinner named like a text one
  OVERRIDES it (explicit config beats built-ins, the icons override
  law — design §4). Default 'dots' (ora's own; the old /—\| cycle
  remains as `line`). role=status + aria-label (polite by
  construction; loading is never an interruption).

  THE CSS FLAT ENGINE (review round 4, the Owner ruling): every frame
  of the spinner renders ONCE, flat, as its own grid cell span — no
  element add/remove, no JS animation loop, no JS clock of any kind
  for the text lane. JS only FILLS the animation parameters: one
  shared keyframes rule per unique (frames × interval × linger) set
  (injected once into a single <style data-jx-spin-frames>, idempotent
  by name), and per-frame CSS vars (--kf name, --dur cycle, --d the
  NEGATIVE delay phasing each frame into its slot — negative so the
  timeline is already mid-cycle at mount: the browser never waits a
  beat). The CSS engine animates opacity through the slot shape:
  hold 1 across the frame's duty window, fade LINEARLY to 0 across
  the linger tail, rest at 0 — the trail IS the animation. Being pure
  CSS it is silk-smooth, rides the compositor, AND shows up in the
  DevTools Animations panel (scrub/pause/replay work). Reduced motion
  is a static @media kill (animation: none) landing on the base
  rules' face: frame 0 alone — LIVE media semantics, zero JS.

  The timing pairs (round 4): 'auto' is NOT a formula — every
  catalog name carries HAND-TUNED interval/linger (the Owner's five:
  dots 80/160, dots2 120/0, pipe 120/120, line 160/0, simpleDots
  160/160; the rest family-curation — see spin-catalog.ts). Both
  props take number | 'auto' (default 'auto' = the tuned pair):
  explicit prop > the Defaults slot (context/plugin injectable) >
  the catalog. Non-positive interval falls back to 'auto'.

  The glyph rides the density ruler (review R1/R4): text frames paint
  var(--jx-text), the svg's DEFAULT square edge at var(--jx-icon)
  through CSS (presentation attributes cannot carry var(); an
  explicit `size` or slot config pins concrete attributes). Frame
  text renders whitespace-pre inside the one-cell grid — every frame
  holds the cell at the widest frame's advance width (simpleDots'
  blank frame included), so the box never breathes.

  The svg posture keeps its OWN engine (the SMIL document inside the
  artwork): reduced motion freezes it through the component's one
  remaining $effect (pauseAnimations/unpauseAnimations on the live
  matchMedia listener — design §3's first named channel;
  CSS-keyframed svg loaders ride spin.css's static kill, the second
  channel — never conflated). Every instance's SMIL ids are
  NAMESPACED at render (round 8) — see scopeSvgIds below — retiring
  the round-1 lockstep/dangling compromise: instances are fully
  independent timelines.

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

  /** the opacity animation mode (review round 5) — see frameKeyframes */
  type LingerType = 'end' | 'start' | 'both';

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

  // ── per-instance SMIL id namespacing (review round 8) ─────────────
  // Loaders with syncbase chains (begin="spinner_X.end+0.2s",
  // begin="root.begin+0.1s") resolve those ids ACROSS THE WHOLE
  // DOCUMENT — with two instances of the same name on the page (the
  // docs page carries several statics + the driven one), a freshly
  // inserted instance's chain resolves onto the FIRST instance's
  // timeline, whose begin instants are long past; Chrome frequently
  // never activates such late-attached dependents → the switched-to
  // loader freezes (removal + re-insertion re-resolves and sometimes
  // lands on a live timeline — the "switch to text and back fixes it"
  // ritual the Owner observed; blocks-wave, worst: the most statics).
  // Scoping every id (and its .begin/.end / url(#..) / href(#..)
  // references) per instance makes each syncbase graph SELF-CONTAINED:
  // no cross-instance resolution, no dangling when the first instance
  // unmounts, no lockstep — the round-1 compromise retires. The
  // transform is deterministic literal surgery over RAW-gated payload
  // (no scripts ever), artifact bytes untouched.
  let svgInstanceSeq = 0;

  function scopeSvgIds(html: string, suffix: string): string {
    const ids = [...new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!))];
    if (ids.length === 0) return html;
    // longest first — an id that is a prefix of another must not
    // partially rewrite it
    let out = html;
    for (const id of ids.sort((a, b) => b.length - a.length)) {
      out = out
        .replaceAll(` id="${id}"`, ` id="${id}${suffix}"`)
        .replaceAll(`${id}.begin`, `${id}${suffix}.begin`)
        .replaceAll(`${id}.end`, `${id}${suffix}.end`)
        .replaceAll(`url(#${id})`, `url(#${id}${suffix})`)
        .replaceAll(`href="#${id}"`, `href="#${id}${suffix}"`);
    }
    return out;
  }

  // ── the injected keyframes registry (review round 4) ─────────────
  // ONE <style data-jx-spin-frames> in <head> accumulates every unique
  // parameter set's rule, keyed by its own name — idempotent, shared by
  // every instance, bounded by the distinct (frames × interval ×
  // linger) sets actually rendered. Client-only (SSR renders the vars;
  // the keyframes arrive with hydration — before then the base rules
  // show frame 0 alone, so first paint is correct too).
  const injectedKeyframes = new Set<string>();

  function ensureFrameKeyframes(name: string, css: string): void {
    if (typeof document === 'undefined' || injectedKeyframes.has(name)) return;
    injectedKeyframes.add(name);
    let style = document.head.querySelector<HTMLStyleElement>('style[data-jx-spin-frames]');
    if (style === null) {
      style = document.createElement('style');
      style.dataset.jxSpinFrames = '';
      document.head.append(style);
    }
    style.textContent += css;
  }

  /** clamp + trim a keyframe percentage (0..100, no trailing zeros) */
  const pct = (ratio: number): string =>
    Math.min(Math.max(ratio * 100, 0), 100).toFixed(3).replace(/\.?0+$/, '');

  /**
   * The shared slot-shape keyframes for one parameter set, in the
   * lingerType shape the tuning asks for (round 5; rounds 6-7 polish):
   *   'end'   (default) — solid through the duty window, fade LINEARLY
   *           out across the linger tail after the handoff
   *   'start' — THE PRE-SLOT ENTRY (round 7, the Owner's correction):
   *           the fade-in occupies the TAIL of the PREVIOUS frame's
   *           window and COMPLETES exactly at the handoff — the frame
   *           ARRIVES solid at the instant the previous frame exits
   *           (perfect接续: nothing dims, nothing overlaps past the
   *           boundary), holds solid through its slot, then hides
   *           discretely. The entry ride sits in the cycle's last
   *           segment [pre, 100%] — with the negative delay phasing
   *           that lands precisely in the preceding frame's window.
   *   'both'  — fade in, hold, fade out (the breathing entry+exit)
   * THE SOLID-FRAME LAW (round 6, 'both'): the in-slot entry fade
   * never eats the whole slot — when linger ≥ interval it collapses to
   * interval/2 so the frame lands solid (the naive shape peaked for a
   * single instant; growVertical sampled 89-95). Tuned pairs with
   * linger < interval are untouched (toggle3's 500/1000 keeps its
   * exact shape).
   * linger 0 collapses every type to the discrete blink: hold 1
   * through duty, then steps(1, start) jumps to 0 — two stops at the
   * SAME percentage MERGE in CSS keyframes (the later block wins), so
   * a zero-length fade segment silently becomes a whole-duty-window
   * linear fade; the discrete jump is a timing function ON the duty
   * stop. Per-frame phasing is the negative delay (--d), so EVERY
   * frame animates the SAME rule — only the delay differs.
   */
  function frameKeyframes(
    count: number,
    stepMs: number,
    lingerMs: number,
    type: LingerType,
  ): string {
    const name = `jx-spin-f${count}-i${stepMs}-l${lingerMs}-${type}`;
    const cycle = count * stepMs;
    const duty = pct(stepMs / cycle);
    const tail = pct((stepMs + lingerMs) / cycle);
    // 'both': the solid-frame law — entry fade ≤ interval/2 whenever it
    // would otherwise consume the whole slot (linger ≥ interval)
    const bothHead = pct((lingerMs < stepMs ? lingerMs : stepMs / 2) / cycle);
    // 'start': the pre-slot entry — one full slot max (the previous
    // frame's window), halved for two-frame spinners so the stops stay
    // strictly ordered (pre > duty always)
    const startEntryMs = Math.min(lingerMs, count > 2 ? stepMs : stepMs / 2);
    const startPre = pct((cycle - startEntryMs) / cycle);
    const body =
      lingerMs <= 0
        ? `0%{opacity:1}${duty}%{opacity:1;animation-timing-function:steps(1,start)}100%{opacity:0}`
        : type === 'start'
          ? `0%{opacity:1}${duty}%{opacity:1;animation-timing-function:steps(1,start)}${startPre}%{opacity:0}100%{opacity:1}`
          : type === 'both'
            ? `0%{opacity:0}${bothHead}%{opacity:1}${duty}%{opacity:1}${tail}%{opacity:0}100%{opacity:0}`
            : `0%{opacity:1}${duty}%{opacity:1}${tail}%{opacity:0}100%{opacity:0}`;
    ensureFrameKeyframes(name, `@keyframes ${name}{${body}}`);
    return name;
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
    /** the frame step in ms — 'auto' (default) = the catalog's tuned pair; explicit > Defaults slot > tuned */
    interval?: number | 'auto';
    /** frame linger ms — 'auto' (default) = the catalog's tuned pair; 0 = hide at the handoff; explicit > Defaults slot > tuned */
    linger?: number | 'auto';
    /** the opacity animation mode — 'auto' (default) = the catalog's tuned type; 'end' fades out, 'start' fades in, 'both' breathes */
    lingerType?: LingerType | 'auto';
    /** wrapping content = container posture with scrim + aria-busy */
    children?: Snippet;
    class?: string;
  }

  let {
    spinner = 'dots',
    label = 'loading',
    size,
    interval,
    linger,
    lingerType,
    children,
    class: className = '',
  }: Props = $props();

  // the unified name lane, artifact FIRST (design §4)
  const svgData = $derived(isSpinName(spinner) ? getSpin(spinner) : null);

  // this instance's SMIL id namespace (round 8): stable for the mount,
  // unique across every instance the page ever renders
  const smilSuffix = `-jx${svgInstanceSeq++}`;
  const scopedPayload = $derived(svgData === null ? '' : scopeSvgIds(svgData.d, smilSuffix));

  // catalog second; both lanes miss (only via a cast) → dots frame 0
  const unknownName = $derived(svgData === null && !Object.hasOwn(SPINNER_CATALOG, spinner));
  const text = $derived(textOf(spinner));
  if (unknownName) warnUnknownOnce(spinner);

  // the family's single read point: the absentSlots — explicit props
  // (or a consumer's slot config) resolve; ABSENT resolves undefined
  // and the component falls back: size rides the density ruler's
  // --jx-icon (review R1), the timings ride the catalog's tuned pair
  // ('auto' and non-positive numbers both mean absent here; linger
  // carries 0 through — it is the explicit "no residue" setting)
  const resolved = $derived(
    SpinDefaults.resolve({
      size,
      interval: interval !== undefined && interval !== 'auto' && interval > 0 ? interval : undefined,
      linger:
        linger === 0 ? 0 : linger !== undefined && linger !== 'auto' && linger > 0 ? linger : undefined,
      lingerType: lingerType !== undefined && lingerType !== 'auto' ? lingerType : undefined,
    }),
  );

  // CSS lengths need a unit — numeric sizes px-coerce, strings verbatim
  const cssSize = $derived(
    typeof resolved.size === 'number' ? `${resolved.size}px` : resolved.size,
  );

  // the resolved timing triple: explicit > slot > the catalog's tuning
  const stepMs = $derived(resolved.interval ?? text.interval);
  const lingerMs = $derived(resolved.linger ?? text.linger);
  const lingerKind = $derived(resolved.lingerType ?? text.lingerType ?? 'end');

  // the CSS engine's parameter fill (review round 4): the shared
  // keyframes name + each frame's cycle and negative phase delay.
  // Runs during render (client) — the injector is idempotent and
  // SSR-guarded; the vars are inert until the keyframes exist.
  const cycleMs = $derived(text.frames.length * stepMs);
  const kfName = $derived(
    text.frames.length > 1
      ? frameKeyframes(text.frames.length, stepMs, lingerMs, lingerKind)
      : '',
  );
  const frameStyle = (i: number): string =>
    `--kf: ${kfName}; --dur: ${cycleMs}ms; --d: ${-((text.frames.length - i) * stepMs)}ms`;

  // the svg posture's reduced-motion channel (design §3, the FIRST
  // named channel): SMIL freezes through the LIVE matchMedia listener
  // — the text lane needs nothing here (its kill is static CSS)
  let root: SVGSVGElement | undefined;

  $effect(() => {
    if (typeof window === 'undefined' || svgData === null) return;
    // the ACTIVATION KICKS (round 10) — dynamic-insertion only
    // (readyState 'complete': post-load switches; hydration-time
    // claimed SSR nodes run from parse and are never touched — the
    // round-6 snap-back cannot recur). Two measured rescues:
    //   1. CSS reprocess: Chrome parses <style> sheets inside
    //      innerHTML-inserted SVGs INCOMPLETELY (lab: the rule's
    //      selector lands with an EMPTY body, animationName none —
    //      the whole cog/square/wifi CSS-animated family frozen);
    //      re-assigning textContent once forces the reprocess.
    //   2. the SMIL clock anchor: setCurrentTime(0) on the fresh node
    //      (nothing running yet — no phase to lose) activates the
    //      late-attached dependents (13 lab-rescued loaders).
    if (document.readyState === 'complete' && root) {
      for (const st of root.querySelectorAll('style')) st.textContent = st.textContent;
      if (typeof root.setCurrentTime === 'function') root.setCurrentTime(0);
    }
    const mql =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const onChange = (): void => {
      if (!mql || !root) return;
      if (mql.matches) root.pauseAnimations();
      else root.unpauseAnimations();
    };
    onChange();
    mql?.addEventListener('change', onChange);
    return () => {
      mql?.removeEventListener('change', onChange);
      root = undefined;
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
  >{@html scopedPayload}</svg>
{/snippet}

{#snippet textCursor()}
  <!-- the flat CSS engine (review round 4): every frame rendered ONCE
       in its own cell, phased by a negative animation delay; the base
       rules rest all-but-frame-0 at opacity 0 (the no-JS/static
       face), the injected keyframes + per-frame vars drive the cycle.
       The cell holds the widest frame's advance width (whitespace-pre) -->
  <span
    data-jx-spin-cursor=""
    class="relative inline-grid whitespace-pre font-mono text-[length:var(--jx-text)] text-primary"
    style={text.font !== undefined ? `font-family: ${text.font}` : undefined}
    aria-hidden="true"
  >
    {#each text.frames as f, i (i)}
      <span data-jx-spin-frame="" class="jx-spin-frame" style={frameStyle(i)}>{f}</span>
    {/each}
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
        <!-- {#key} forces a FRESH <svg> element on every svg→svg switch
             (round 9): swapping {@html} payload INSIDE a persistent svg
             leaves Chrome's SMIL activation dead (measured 1/12 in the
             lab vs 12/12 for fresh insertion — the Owner's freeze; the
             text→svg detour worked because the branch swap built a new
             element). Keying on the data object: spinner changes
             rebuild, prop changes don't. -->
        {#key svgData}
          {@render svgGlyph(svgData)}
        {/key}
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
      {#key svgData}
        {@render svgGlyph(svgData)}
      {/key}
    {:else}
      {@render textCursor()}
    {/if}
  </span>
{/if}
