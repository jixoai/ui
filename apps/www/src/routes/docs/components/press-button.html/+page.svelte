<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import PressButton, { pulse, rainbow, ripple, shimmer, type PressEffect } from '$lib/ui/press-button/press-button.svelte';
  import pressButtonSource from '$lib/ui/press-button/press-button.svelte?raw';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { annotations, meta } from '$lib/meta/press-button.meta';
  import { withAnnotations, type ComponentMeta } from '$lib/schema/ir';
  import { toJSONSchema } from '$lib/schema/lower';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the anchors demo + the closing law, in page order. The
  // engine pairs these ids with the SectionCard data-family extents +
  // header data-region leaves rendered below.

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import PressButton, { shimmer, pulse, rainbow, ripple } from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover grows the shadow, active presses -->`;
  const usageTail = `
<PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="ghost">dismiss</PressButton>
<!-- destructive ACTION = fill + the destructive pair (statuses use --jx-error instead) -->
<PressButton variant="fill" class="jx-pair-destructive">delete</PressButton>
<PressButton variant="link">details</PressButton>
<!-- copied is not a variant: the transient success state is tonal + injection -->
<PressButton variant="tonal" class="jx-hue-success">copied</PressButton>

<!-- one opt-in effect loop per button — typed builders from the module script -->
<PressButton variant="fill" effect={shimmer()}>deploy</PressButton>
<PressButton variant="fill" effect={pulse({ variant: 'ring' })}>deploy</PressButton>
<PressButton variant="outline" effect={rainbow()}>upgrade</PressButton>
<PressButton variant="fill" effect={ripple({ duration: 800 })}>deploy</PressButton>

<!-- href renders an anchor instead; hrefs outside "/" open a new tab -->
<PressButton variant="fill" href="/docs.html">read the docs</PressButton>`;
  const usage = `${usageHead}
<PressButton variant="fill">deploy</PressButton>${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'src/lib/ui/press-button-usage.svelte', content: usage },
  ];

  // schema pipeline (canvas-schema-pipeline, 2026-08-30): the generated
  // meta is the structure source of truth; the effect enum lives
  // PAGE-SIDE (the builders are module functions, not prop values — the
  // enum speaks names, the onvalue seam maps them) and is swapped into
  // the meta before the one lowering. The pane rows, the bound values
  // and the exported schema all come from that same lowering.
  type Variant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
  type EffectName = 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectBuilders = {
    none: undefined,
    shimmer: () => shimmer(),
    pulse: () => pulse(),
    rainbow: () => rainbow(),
    ripple: () => ripple(),
  } as const;
  const effectNames: readonly EffectName[] = ['none', 'shimmer', 'pulse', 'rainbow', 'ripple'];
  const metaWithEffect: ComponentMeta = {
    ...meta,
    props: {
      ...meta.props,
      effect: { kind: 'enum', values: [...effectNames], default: 'none' },
    },
  };
  const schema = toJSONSchema(withAnnotations(metaWithEffect, annotations));

  // the page owns the initial values (bind:values); reset falls back to
  // the schema defaults (variant 'outline', effect 'none', loading off)
  type CanvasValues = { variant: Variant; effect: EffectName; loading: boolean };
  let canvasValues = $state<Record<string, unknown>>({ variant: 'fill', effect: 'none', loading: false });
  const v = $derived(canvasValues as CanvasValues);

  // the onvalue seam: schema drives the CONTROL, the page owns the
  // VALUE semantics — effect names map to typed builders here
  let effectValue: PressEffect | undefined = $state(undefined);
  function onCanvasValue(key: string, value: unknown): void {
    if (key === 'effect') {
      effectValue = value === 'none' ? undefined : effectBuilders[value as EffectName]();
    }
  }

  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`${usageHead}
<PressButton variant=${q(v.variant)}${v.effect === 'none' ? '' : ` effect={${v.effect}()}`}${v.loading ? ' loading' : ''}>deploy</PressButton>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- the async two-step demo (enhance-picker-feedback, 2026-08-30) ---
  // loading prop in; flash() on settle — the documented ONE idiom
  let deployState = $state<'idle' | 'loading'>('idle');

  // ---- the floor (canvas-floor-lab): page-owned stage state ---------------
  // theme/density are BINDABLES — the page owns them, the canvas only
  // projects data-theme/data-density onto the stage element (the spec's
  // composition-first law). Defaults = the documented rest pose.
  let stageTheme = $state<'light' | 'dark'>('light');
  let stageDensity = $state<'comfortable' | 'compact'>('comfortable');
  let deployEcho = $state('idle — press me');
  let deployBtn: { flash: (ms?: number) => void } | undefined;

  async function deploy(): Promise<void> {
    if (deployState === 'loading') return; // the lock itself, from the host side too
    deployState = 'loading';
    deployEcho = 'loading — presses and Enter/Space are no-ops';
    await new Promise((r) => setTimeout(r, 1400));
    deployState = 'idle';
    deployEcho = 'success flashed ✓ (one-shot, 1.2s), then rest';
    deployBtn?.flash();
  }

  // the href variant: while loading, navigation itself is blocked. The
  // task is driven by the tonal button (an anchor's onclick is not part
  // of the contract — anchors route activation to their href)
  let navLoading = $state(false);
  let navEcho = $state('idle — start the fake task, then try the anchor');
  function navTask(): void {
    if (navLoading) return;
    navLoading = true;
    navEcho = 'loading — the anchor\'s href navigation is blocked';
    setTimeout(() => {
      navLoading = false;
      navEcho = 'rest — the anchor navigates again';
    }, 2500);
  }
</script>

<svelte:head>
  <title>Press button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai press-button component: restrained press law — hover grows the shadow only (the body never moves), active presses the body 1px into the page while the shadow layer stays anchored — in five surfaces (the fill/tonal/outline/ghost ladder plus the link exception) with semantic color injected through tokens, plus four opt-in paint-only effect loops: shimmer, pulse, rainbow, ripple."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="press-button — one physics, the ladder, four effects"
        summary="The only button in the grammar, and the animation is deliberately quiet: hover never moves the body — the hard shadow alone grows from xs to sm; active presses the body one pixel into the page while the shadow stays exactly where it was. Variants are a prominence ladder, never a color decision: fill for the one action that matters, tonal for the supporting seat, outline for the rest (the default), ghost and link for the quiet seats — link is the grammar's one interaction exception. Semantic color is hue injection through the global tokens: destructive actions fill with the destructive pair, metadata tones down through --jx-tonal, the copied transient is tonal + success. One opt-in effect loop adds attention without breaking the restraint: shimmer (a spark walks the perimeter), pulse (sonar rings breathe outward), rainbow (a gradient flows around the border), ripple (ink expands from the press point) — typed builders with options, all frozen under reduced motion."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">hover: shadow only</span>
          <span class="pill">active: anchored press</span>
          <span class="pill">shimmer · pulse · rainbow · ripple</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="press-button"
        description="The press-law button: hover grows the shadow only (xs → sm, the body never moves); active presses the body +1px into the page while the shadow layer stays anchored. The playground rows render from the generated component schema (meta → toJSONSchema); reset returns the schema defaults."
        sourceUrl={registrySourceUrl('press-button')}
        install="press-button"
        {files}
        stage="center"
        bind:theme={stageTheme}
        bind:density={stageDensity}
        {schema}
        bind:values={canvasValues}
        onvalue={onCanvasValue}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>fill</span>
              <PressButton variant="fill">deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>tonal</span>
              <PressButton variant="tonal">invite</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>outline</span>
              <PressButton variant="outline">cancel</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ghost</span>
              <PressButton variant="ghost">dismiss</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>link</span>
              <PressButton variant="link">details</PressButton>
            </label>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 border-t border-border pt-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>destructive action</span>
              <PressButton
                variant="fill"
                class="jx-pair-destructive"
              >
                delete
              </PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>neutral tonal</span>
              <PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>success — copied</span>
              <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
            </label>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 border-t border-border pt-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>shimmer</span>
              <PressButton variant="fill" effect={shimmer()}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>pulse · ring</span>
              <PressButton variant="fill" effect={pulse({ variant: 'ring' })}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>rainbow</span>
              <PressButton variant="outline" effect={rainbow()}>upgrade</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>rainbow · fill</span>
              <PressButton variant="fill" effect={rainbow()}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ripple — press me</span>
              <PressButton variant="fill" effect={ripple({ duration: 800 })}>deploy</PressButton>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <PressButton variant={v.variant} effect={effectValue} loading={v.loading}>
              {v.variant}
            </PressButton>
          </div>
        </div>
      </ComponentCanvas>
    </div>

    <div id="anchors" data-reveal="">
      <SectionCard
        family="anchors"
        headerRegion="anchors"
        eyebrow="demo"
        title="Button or anchor"
        summary="href switches the element from button to anchor — internal hrefs navigate in place, anything else opens a new tab with noreferrer automatically. The label is a snippet, so icons compose inline with the component's own gap."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>internal → same tab</span>
              <PressButton variant="fill" href="/docs/components.html">overview</PressButton>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>external → new tab</span>
              <PressButton variant="outline" href="https://github.com/jixoai/ui">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  class="h-[13px] w-[13px]"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span>github</span>
              </PressButton>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>button → no navigation</span>
              <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="async" data-reveal="">
      <SectionCard
        family="async"
        headerRegion="async"
        eyebrow="demo"
        title="The async two-step"
        summary="loading is an ANCHOR CONTRACT: aria-disabled='true' (the button stays focusable — tab order unchanged, opaque to why it is inert), pointer AND keyboard activation suppressed (Enter/Space no-op), and for href anchors the navigation itself is blocked. The spinner glyph takes the leading lane and the press law holds unchanged — hover grows only the shadow, active still presses +1px. On settle, the one-shot flash() swaps the leading lane to a ✓ check for 1.2s, then the button rests."
      >
        <div class="flex flex-col gap-5">
          <div id="async-demo" class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>async deploy</span>
              <PressButton
                bind:this={deployBtn}
                variant="fill"
                loading={deployState === 'loading'}
                onclick={deploy}
              >
                deploy
              </PressButton>
            </div>
            <div id="async-anchor-demo" class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>loading anchor</span>
              <PressButton variant="tonal" onclick={navTask}>start fake task</PressButton>
              <PressButton variant="outline" href="/docs/components.html" loading={navLoading}>
                read the docs
              </PressButton>
            </div>
            <span class="text-muted-foreground text-[12.5px]" data-async-echo>{deployEcho}</span>
            <span class="text-muted-foreground text-[12.5px]">{navEcho}</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="Why the shadow is the affordance"
        summary="No fills-in-motion, no glows, no ripple. The one-hue grammar expresses state through elevation alone, so the button reads identically in light and dark themes and survives the hue runtime without a second rule."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">variant</code> selects only the ladder rung —
              <code class="text-accent">fill</code>,
              <code class="text-accent">tonal</code>,
              <code class="text-accent">outline</code>,
              <code class="text-accent">ghost</code>, plus
              <code class="text-accent">link</code>, the one interaction exception — the
              press law is the theme's shared <code class="text-accent">.jx-press</code> class, one
              source for every button in the grammar</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>semantic color is hue injection, never a variant: destructive actions carry
              <code class="text-accent">fill</code> +
              <code class="text-accent">jx-pair-destructive</code>
              (the pair utility — fill and ink in one class), metadata softens through
              <code class="text-accent">jx-hue-neutral</code>, and the
              copied transient is <code class="text-accent">tonal</code> +
              <code class="text-accent">jx-hue-success</code></span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the shadow is the body's own <code class="text-accent">box-shadow</code>: hover
              grows it (xs → sm) and nothing else; active slides the body +1px while the shadow's
              offsets counter-shrink 1px (the theme's
              <code class="text-accent">*-press</code> poses) — the shadow's paint never moves on
              screen, no pseudo layer involved</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">effect</code> accepts ONE typed builder exported from
              the component's module script —
              <code class="text-accent">shimmer()</code> (a conic spark walks the perimeter),
              <code class="text-accent">pulse()</code> (sonar rings from the body's silhouette,
              three variants), <code class="text-accent">rainbow()</code> (a gradient flows around
              the border, optional under-glow),
              <code class="text-accent">ripple()</code> (ink circles from the exact press point,
              center on keyboard activation) — every loop takes typed options
              (<code class="text-accent">speed</code>, <code class="text-accent">color</code>,
              <code class="text-accent">distance</code>, …), modeled on the animation-svelte
              reference</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">href</code> switches the element to an anchor;
              hrefs not starting with <code class="text-accent">/</code> open a new tab with
              <code class="text-accent">noreferrer</code> automatically</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">loading</code> is the async pose with an explicit anchor
              contract: <code class="text-accent">aria-disabled="true"</code> (focusable — tab order
              unchanged), pointer AND keyboard activation suppressed (Enter/Space no-op), and
              <code class="text-accent">href</code> navigation blocked; the spinner glyph takes the
              leading lane and the press law holds unchanged — pair with the one-shot
              <code class="text-accent">flash()</code> helper (bind:this) for the ✓ success flash</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the label is a snippet, so icons compose inline — spacing comes from the
              component's own <code class="text-accent">gap-2.5</code></span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>reduced motion ships inside the <code class="text-accent">.jx-press</code> law:
              <code class="text-accent">prefers-reduced-motion</code> drops every press transition
              to none</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="The variant ladder" summary="Choose the prominence rung first; semantic hue is injected separately through the grammar tokens. Every rung keeps the same hit target and press physics.">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {#each [
          ['fill', 'The one action'],
          ['tonal', 'Supporting seat'],
          ['outline', 'The rest (default)'],
          ['ghost', 'Quiet seat'],
          ['link', 'Inline navigation'],
        ] as item}
          <div class="border border-border/60 p-3">
            <PressButton variant={item[0] as 'fill' | 'tonal' | 'outline' | 'ghost' | 'link'}>{item[1]}</PressButton>
            <p class="mt-2 text-xs text-muted-foreground">{item[0]}</p>
          </div>
        {/each}
      </div>
      <div class="mt-6">
        <p class="font-nav mb-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          semantic injection recipes — hue, not a rung
        </p>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="border border-border/60 p-3">
            <PressButton
              variant="fill"
              class="jx-pair-destructive"
            >
              delete
            </PressButton>
            <p class="mt-2 text-xs text-muted-foreground">destructive ACTION<br />fill + the destructive pair</p>
          </div>
          <div class="border border-border/60 p-3">
            <PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
            <p class="mt-2 text-xs text-muted-foreground">neutral / meta<br />tonal + muted-foreground</p>
          </div>
          <div class="border border-border/60 p-3">
            <PressButton variant="tonal" class="jx-hue-success">copied</PressButton>
            <p class="mt-2 text-xs text-muted-foreground">success status<br />tonal + success</p>
          </div>
          <div class="border border-border/60 p-3">
            <PressButton variant="fill">deploy</PressButton>
            <p class="mt-2 text-xs text-muted-foreground">brand (default hue)<br />fill, no injection</p>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard eyebrow="usage" title="Compose a button" summary="Use the semantic variant and add one typed effect only when the action needs extra attention.">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Keyboard and semantics" summary="Native buttons and anchors retain their platform behavior; labels and focus rings remain part of the contract.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Move focus to the button or link' }, { key: 'Enter / Space', action: 'Activate a button' }, { key: 'Enter', action: 'Follow an href rendered as an anchor' }]}
        aria={[{ name: 'aria-label', value: 'optional', description: 'Names icon-only or otherwise unlabeled controls.' }, { name: 'aria-disabled', value: 'true while loading', description: 'The anchor contract: the element stays focusable (tab order unchanged) while pointer, keyboard, and href activation are suppressed.' }, { name: 'href', value: 'optional', description: 'Switches the root from button to anchor semantics.' }, { name: 'prefers-reduced-motion', value: 'supported', description: 'Disables press transitions and effect loops; freezes the loading spinner on its first frame.' }]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Density and tokens" summary="The button reads its geometry from the inherited density scale, so one scope change updates every instance together. The canvas's stage density toggle (comfortable / compact) is the live proof — it re-scopes only the stage; the DensityDemo four-copy hack is retired by it.">
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-[13px] leading-6">
          flip the stage toggle above to <code class="text-accent">compact</code> — the workbench
          canvas re-densifies its own stage (the density scope lands on the stage element only),
          never the docs chrome around it. Both theme seats work the same way.
        </p>
        <TokenTable tokens={[
          { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Minimum interactive height and width.' },
          { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Inline button padding.' },
          { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Spacing between composed label content.' },
          { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density', description: 'Button label size.' },
          { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density', description: 'Button label line height.' },
          { name: '--jx-press-shadow', default: 'var(--shadow-xs)', source: 'component', description: 'Resting elevation for the press law.' },
          { name: '--jx-press-shadow-hover', default: 'var(--shadow-sm)', source: 'component', description: 'Hover elevation.' },
          { name: '--jx-press-shadow-active', default: 'var(--shadow-sm-press)', source: 'component', description: 'Anchored active pose.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Import the family parts and compose them in markup — the full usage file, as the canvas above runs it."><CodeBlock code={usage} lang="svelte" meta="PressButton usage" /></SectionCard></div>
  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="The public contract is intentionally small: semantic paint, optional navigation, and one press effect builder.">
      <PropsTable props={[
        { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the surrounding density scope.' },
        { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost' | 'link'", default: "'outline'", description: 'Selects the ladder rung; link is the interaction exception. Semantic hue injects through --jx-fill/--jx-fill-ink, --jx-tonal, --jx-outline classes at the call site.' },
        { name: 'effect', type: 'PressEffect', default: '—', description: 'One shimmer, pulse, rainbow, or ripple builder.' },
        { name: 'href', type: 'string', default: '—', description: 'Renders an anchor and navigates to the target.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'The async pose: aria-disabled=true, pointer AND keyboard activation suppressed, href navigation blocked, spinner glyph in the leading lane. Press law holds unchanged. Pair with the one-shot flash() helper (bind:this) on settle.' },
        { name: 'external', type: 'boolean', default: 'auto', description: 'Opens non-internal hrefs in a new tab.' },
        { name: 'onclick', type: '() => void', default: '—', description: 'Runs for button activation.' },
        { name: 'type', type: "'button' | 'submit'", default: "'button'", description: 'Native button type.' },
        { name: 'ariaLabel', type: 'string', default: '—', description: 'Accessible name override for icon-only use.' },
        { name: 'square', type: 'boolean', default: 'false', description: 'Uses the square hit-target geometry.' },
        { name: 'children', type: 'Snippet', required: true, description: 'Button label and optional inline icon content.' },
      ]} />
    </SectionCard>
  </div>
</div>
