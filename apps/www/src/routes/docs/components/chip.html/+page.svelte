<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import {
    pulse,
    rainbow,
    ripple,
    shimmer,
    type PressEffect,
  } from '$lib/ui/press-button/press-button.svelte';
  import chipSource from '$lib/ui/chip/chip.svelte?raw';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySelect, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: anchors + slots + the hit-lane ruling, then the house
  // template sections, in page order. The engine pairs these ids with
  // the SectionCard data-family extents + header data-region leaves.

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import Chip from '@ui/chip/chip.svelte';
  import { shimmer, ripple } from '@ui/press-button/press-button.svelte';
${close}

<!-- the grammar ladder: prominence, never semantic hue -->`;
  const usageTail = `
<Chip variant="fill">deploy</Chip>
<Chip>filters</Chip><!-- tonal default + the default ripple ink -->
<Chip variant="outline">cancel</Chip>
<Chip variant="ghost">dismiss</Chip>

<!-- hue is injected into the global slots, never named as a variant -->
<Chip variant="tonal" class="[--jx-tonal:var(--success)]">passing</Chip>
<Chip variant="fill" class="[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]">clear</Chip>

<!-- one opt-in effect loop per chip — null disables the default ripple -->
<Chip variant="fill" effect={shimmer()}>upgrade</Chip>
<Chip effect={ripple({ shape: 'bevel', duration: 800 })}>filter</Chip>
<Chip effect={null}>still</Chip>

<!-- href renders an anchor; hrefs outside "/" open a new tab -->
<Chip variant="outline" href="/docs.html">read the docs</Chip>

<!-- slotStart / slotEnd lanes keep svg at the label scale -->
<Chip shape="pill">
  {#snippet slotStart()}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" /></svg>
  {/snippet}
  filters
</Chip>`;
  const usage = `${usageHead}
<Chip variant="tonal">filter</Chip>${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/chip/chip.svelte', content: chipSource },
    { name: 'src/lib/ui/chip-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + live usage. The effect select speaks
  // 'default' (the ripple() defaults via undefined) and 'none' (null).
  type Variant = 'fill' | 'tonal' | 'outline' | 'ghost';
  type Shape = 'square' | 'pill';
  type EffectName = 'default' | 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectFor = (name: EffectName): PressEffect | null | undefined =>
    name === 'default' ? undefined : name === 'none' ? null : { shimmer, pulse, rainbow, ripple }[name]();
  const canvasInitial = {
    variant: 'tonal' as Variant,
    shape: 'square' as Shape,
    effect: 'default' as EffectName,
  };
  // the anchors demo's toggle chip flips its own label through onclick
  let following = $state(false);
  let variant = $state(canvasInitial.variant);
  let shape = $state(canvasInitial.shape);
  let effect = $state(canvasInitial.effect);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
    shape = canvasInitial.shape;
    effect = canvasInitial.effect;
  }
  // kit option maps: the enum controls speak the typed unions directly
  const variantOptions: { value: Variant; label: string }[] = [
    { value: 'fill', label: 'fill' },
    { value: 'tonal', label: 'tonal' },
    { value: 'outline', label: 'outline' },
    { value: 'ghost', label: 'ghost' },
  ];
  const shapeOptions: { value: Shape; label: string }[] = [
    { value: 'square', label: 'square' },
    { value: 'pill', label: 'pill' },
  ];
  const effectOptions: { value: EffectName; label: string }[] = [
    { value: 'default', label: 'default — ripple()' },
    { value: 'none', label: 'none — null' },
    { value: 'shimmer', label: 'shimmer' },
    { value: 'pulse', label: 'pulse' },
    { value: 'rainbow', label: 'rainbow' },
    { value: 'ripple', label: 'ripple' },
  ];
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  // $derived reads the live $state; deriving the expression keeps it
  // reactive instead of capturing effect's initial value
  const effectExpr = $derived(
    effect === 'default' ? '' : effect === 'none' ? ' effect={null}' : ` effect={${effect}()}`
  );
  const usageLive = $derived(`${usageHead}
<Chip variant=${q(variant)} shape=${q(shape)}${effectExpr}>filter</Chip>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Chip · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai chip: the variant grammar's compact activation — badge micro-label voice on the control-scale hit lane (~44px at default density), the four-step ladder (fill / tonal / outline / ghost) consumed as global tokens, button or anchor root, slotStart/slotEnd lanes, and the press-button effect loops with ripple as the default ink."
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
        title="chip — the grammar's compact activation"
        summary="The chip is what a filter, a toggle, or an inline nav target looks like in this language: the badge's font-nav uppercase micro-label voice, but control-scale — the root box sits on the hit lane (min-block-size var(--jx-hit), ~44px at default density), so every chip is a real finger target, not a 20px badge. The paint is the frozen variant ladder consumed as global tokens — fill for the one active filter, tonal for the resting set, outline for structure, ghost for the quiet seats — and semantic hue is always injected ([--jx-tonal:var(--success)]), never named. Press physics are the theme's shared .jx-press law, and the press-button effect loops pass through with ripple as the default: press a chip and ink expands from your pointer."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">hit lane · var(--jx-hit)</span>
          <span class="pill">fill · tonal · outline · ghost</span>
          <span class="pill">default ripple ink</span>
          <span class="pill">button or anchor</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="chip"
        description="The grammar ladder on the hit lane. The top row is the four variants; the second row shows the default ripple ink (press one), the bevel-silhouette ripple, and the shimmer loop; the bottom instance is driven by the playground."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/chip/chip.svelte"
        {files}
        stage="center"
        onreset={resetCanvas}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>fill</span>
              <Chip variant="fill">deploy</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>tonal</span>
              <Chip variant="tonal">filters</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>outline</span>
              <Chip variant="outline">cancel</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ghost</span>
              <Chip variant="ghost">dismiss</Chip>
            </label>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 border-t border-border pt-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>default ripple — press me</span>
              <Chip>filter</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ripple · bevel</span>
              <Chip effect={ripple({ shape: 'bevel', duration: 800 })}>filter</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>shimmer</span>
              <Chip variant="fill" effect={shimmer()}>upgrade</Chip>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>pill</span>
              <Chip shape="pill">tagged</Chip>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <Chip {variant} {shape} effect={effectFor(effect)}>filter</Chip>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="variant">
              <PlaySelect bind:value={variant} options={variantOptions} />
            </PlayRow>
            <PlayRow label="shape">
              <PlaySelect bind:value={shape} options={shapeOptions} />
            </PlayRow>
            <PlayRow label="effect">
              <PlaySelect bind:value={effect} options={effectOptions} />
            </PlayRow>
            <PlayHelp>
              the ladder changes paint only — <code>fill</code> is the solid ground
              + same-hue border, <code>tonal</code> the 12%/45% tint recipe,
              <code>outline</code> the structural border with an 8% hover overlay,
              <code>ghost</code> transparent at rest with the tonal hover. Every
              variant rides the same <code>.jx-press</code> physics and the same
              <code>min-block-size: var(--jx-hit)</code> lane.
              <code>effect</code> defaults to <code>ripple()</code> — press-point
              ink from the shared press-button runtime; <code>null</code> disables
              every loop, and the other builders pass through unchanged. Reduced
              motion freezes the ink; the anchored press still answers.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="anchors" data-reveal="">
      <SectionCard
        family="anchors"
        headerRegion="anchors"
        eyebrow="demo"
        title="Button or anchor"
        summary="href switches the root from button to anchor — internal hrefs navigate in place, anything else opens a new tab with noreferrer automatically. A chip without href is a real button: the onclick demo toggles its own label."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>internal → same tab</span>
              <Chip variant="outline" href="/docs/components.html">overview</Chip>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>external → new tab</span>
              <Chip
                variant="outline"
                href="https://github.com/jixoai/ui"
              >
                {#snippet slotEnd()}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                {/snippet}
                <span>github</span>
              </Chip>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>button → onclick</span>
              <Chip variant="tonal" onclick={() => (following = !following)}>{following ? 'following' : 'follow'}</Chip>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="slots" data-reveal="">
      <SectionCard
        family="slots"
        headerRegion="slots"
        eyebrow="demo"
        title="slotStart and slotEnd lanes"
        summary="Two optional snippet lanes wrap their content in data-icon spans and pin composed svg to the label scale (var(--jx-text-secondary)) — icons never outgrow the micro-label voice, and spacing comes from the root's half-gap."
      >
        <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
            <span>start lane</span>
            <Chip shape="pill">
              {#snippet slotStart()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
                </svg>
              {/snippet}
              filters
            </Chip>
          </div>
          <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
            <span>both lanes</span>
            <Chip variant="outline" shape="pill">
              {#snippet slotStart()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m12 2 2.4 7.6H22l-6 4.4 2.2 7-6.2-4.6L5.8 21 8 14 2 9.6h7.6L12 2z" />
                </svg>
              {/snippet}
              starred
              {#snippet slotEnd()}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              {/snippet}
            </Chip>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="hit-lane" data-reveal="">
      <SectionCard
        family="hit-lane"
        headerRegion="hit-lane"
        eyebrow="law"
        title="The hit lane is the real box"
        summary="Chips are control-scale: the root itself carries min-block-size var(--jx-hit) — about 44px at default density — so the physical activation rectangle is the visible chip, not a pseudo-element stretched around a 20px label."
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-end gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex flex-col gap-2 text-xs">
              <Chip variant="tonal">control-scale</Chip>
              <span>root ≥ var(--jx-hit) · 44px</span>
            </div>
            <div class="text-muted-foreground flex flex-col gap-2 text-xs">
              <Badge>display-scale</Badge>
              <span>badge · sub-lane height</span>
            </div>
          </div>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the hit-lane law (component-authoring spec): every interactive
              control exposes a physical activation rectangle at
              <code class="text-accent">min-block-size: var(--jx-hit)</code> — the variant-grammar
              design froze the chip as control-scale (~44px at default density), explicitly
              rejecting pseudo-element lane expansion: chip nature lives in paint and
              typography, but the target is the real box</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>a badge is the display-scale sibling — sub-lane height, no hit
              contract; when the element activates something, it is a chip, not a badge</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>forced colors degrade explicitly (design §6): fill becomes
              ButtonFace/ButtonText, tonal/outline become Canvas/CanvasText with the
              color-mix tints dropped, ghost rests transparent and takes ButtonFace on
              hover — and the 2px Highlight focus ring is never removed</span></li>
          </ul>
        </div>
      </SectionCard>
    </div>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="Variant ladder" summary="Prominence, never semantic hue — every variant keeps the same hit lane, border weight and press physics.">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {#each [
          ['fill', 'Solid ground'],
          ['tonal', 'Tinted rest — the default'],
          ['outline', 'Structural border'],
          ['ghost', 'Quiet seat'],
        ] as item}
          <div class="border border-border/60 p-3">
            <Chip variant={item[0] as 'fill' | 'tonal' | 'outline' | 'ghost'}>{item[1]}</Chip>
            <p class="mt-2 text-xs text-muted-foreground">{item[0]}</p>
          </div>
        {/each}
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard eyebrow="usage" title="Compose a chip" summary="Pick the ladder step, inject hue through the global slots when the intent is semantic, and pass one press-button effect builder — or null for stillness.">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Keyboard and semantics" summary="Native buttons and anchors retain their platform behavior; the hit lane is the real box, and motion degrades under both reduced-motion and forced-colors.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Move focus to the chip or link' }, { key: 'Enter / Space', action: 'Activate a button chip' }, { key: 'Enter', action: 'Follow an href rendered as an anchor' }]}
        aria={[{ name: 'aria-label', value: 'optional', description: 'Names icon-only or otherwise unlabeled chips.' }, { name: 'href', value: 'optional', description: 'Switches the root from button to anchor semantics.' }, { name: 'prefers-reduced-motion', value: 'supported', description: 'Skips the ripple ink; the anchored press still answers.' }, { name: 'forced-colors', value: 'supported', description: 'Explicit system-color degradation; the 2px Highlight focus ring survives.' }]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Density and tokens" summary="Geometry rides the inherited density scale; color rides the four global grammar slots — inject a hue anywhere above a chip and every slot consumer inside retunes.">
      <div class="flex flex-col gap-5">
        <DensityDemo scopes={['xs', 'sm', 'default', 'lg']}>
          <Chip variant="tonal">filter</Chip>
        </DensityDemo>
        <div class="flex flex-wrap items-center gap-3">
          <Chip class="[--jx-tonal:var(--success)]">passing</Chip>
          <Chip class="[--jx-tonal:var(--warning)]">degraded</Chip>
          <Chip class="[--jx-tonal:var(--muted-foreground)]">metadata</Chip>
          <Chip
            variant="fill"
            class="[--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]"
          >
            clear
          </Chip>
        </div>
        <TokenTable tokens={[
          { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density', description: 'Minimum block size of the root — the physical activation rectangle.' },
          { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Inline chip padding.' },
          { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density', description: 'Spacing base — lanes run at half-gap.' },
          { name: '--jx-text-secondary', default: 'density scale', source: 'density', description: 'Micro-label size; also the composed svg size.' },
          { name: '--jx-line-secondary', default: 'density scale', source: 'density', description: 'Micro-label line height.' },
          { name: '--jx-fill', default: 'var(--primary)', source: 'color', description: 'Fill ground + same-hue border (fill variant).' },
          { name: '--jx-fill-ink', default: 'var(--primary-foreground)', source: 'color', description: 'Ink on fill — always injected together with --jx-fill.' },
          { name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/text hue; ghost hover derives from it.' },
          { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="The public contract: the ladder, the silhouette, one optional effect, navigation, and two snippet lanes around the required children.">
      <PropsTable props={[
        { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the surrounding density scope.' },
        { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost'", default: "'tonal'", description: 'Selects the grammar ladder step.' },
        { name: 'shape', type: "'square' | 'pill'", default: "'square'", description: 'Square keeps the site radius; pill rounds fully.' },
        { name: 'effect', type: 'PressEffect | null', default: 'ripple()', description: 'One press-button effect builder; undefined resolves to the ripple() defaults, null disables every loop.' },
        { name: 'href', type: 'string', default: 'undefined', description: 'Renders an anchor and navigates to the target.' },
        { name: 'external', type: 'boolean', default: 'auto', description: 'Opens non-internal hrefs in a new tab.' },
        { name: 'onclick', type: '() => void', default: 'undefined', description: 'Runs for button activation (and through the ripple runtime when ink is on).' },
        { name: 'type', type: "'button' | 'submit'", default: "'button'", description: 'Native button type.' },
        { name: 'ariaLabel', type: 'string', default: 'undefined', description: 'Accessible name override for icon-only use.' },
        { name: 'class', type: 'string', default: "''", description: 'Appended to the composed classes; hue injection rides here ([--jx-tonal:var(--error)]).' },
        { name: 'slotStart', type: 'Snippet', default: 'undefined', description: 'Leading lane — svg pinned to var(--jx-text-secondary).' },
        { name: 'slotEnd', type: 'Snippet', default: 'undefined', description: 'Trailing lane — svg pinned to var(--jx-text-secondary).' },
        { name: 'children', type: 'Snippet', required: true, description: 'Chip label content.' },
      ]} />
    </SectionCard>
  </div>
</div>
