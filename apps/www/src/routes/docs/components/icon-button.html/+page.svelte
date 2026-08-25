<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import iconButtonSource from '$lib/ui/icon-button/icon-button.svelte?raw';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlaySelect, PlayHelp } from '$lib/playground';
  import { shimmer } from '$lib/ui/press-button/press-button.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the icon-only demo + the closing law, in page order. The
  // engine pairs these ids with the SectionCard data-family extents +
  // header data-region leaves rendered below.

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // the demo glyphs (stroke icons, lucide geometry, size-4 = 16px)
  const svgAttr =
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4"';
  const playGlyph = `<svg ${svgAttr}><path d="m6 3 14 9-14 9Z"/></svg>`;
  const copyGlyph = `<svg ${svgAttr}><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
  const externalGlyph = `<svg ${svgAttr}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>`;

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import IconButton from '@ui/icon-button.svelte';
  import { shimmer } from '@ui/press-button.svelte';
${close}

<!-- one label, two postures: text shows the label, iconOnly tips it -->`;
  const usageTail = `
<!-- iconOnly: text moves to the tooltip AND stays aria-label -->
<IconButton iconOnly text="copy command">
  {#snippet icon()}${copyGlyph}{/snippet}
</IconButton>

<!-- full press-button inheritance: paint variants + effect loops -->
<IconButton
  iconOnly
  variant="primary"
  effect={shimmer({ speed: 4000 })}
  text="open github"
  href="https://github.com/jixoai/ui"
  placement="bottom"
>
  {#snippet icon()}${externalGlyph}{/snippet}
</IconButton>`;
  const drivenNormal = `<IconButton text="deploy">
  {#snippet icon()}${playGlyph}{/snippet}
</IconButton>`;
  const usage = `${usageHead}
${drivenNormal}${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/icon-button.svelte', content: iconButtonSource },
    { name: 'src/lib/ui/icon-button-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + live usage (the controls carry their
  // own readout, so no echo rows)
  type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  type Posture = 'text' | 'icon-only';
  type Placement = 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
  const canvasInitial = {
    variant: 'outline' as Variant,
    posture: 'icon-only' as Posture,
    placement: 'bottom' as Placement,
  };
  let variant = $state(canvasInitial.variant);
  let posture = $state(canvasInitial.posture);
  let placement = $state(canvasInitial.placement);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
    posture = canvasInitial.posture;
    placement = canvasInitial.placement;
  }
  // kit option maps: the enum controls speak the typed unions directly
  const variantOptions: { value: Variant; label: string }[] = (
    ['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const
  ).map((value) => ({ value, label: value }));
  const postureOptions: { value: Posture; label: string }[] = [
    { value: 'text', label: 'text' },
    { value: 'icon-only', label: 'icon-only' },
  ];
  const placementOptions: { value: Placement; label: string }[] = [
    { value: 'top', label: 'top' },
    { value: 'bottom', label: 'bottom' },
    { value: 'top-start', label: 'top-start' },
    { value: 'top-end', label: 'top-end' },
    { value: 'bottom-start', label: 'bottom-start' },
    { value: 'bottom-end', label: 'bottom-end' },
  ];
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const iconOnly = $derived(posture === 'icon-only');
  // placement only exists in icon-only — the live sample carries it only then
  const usageLive = $derived(
    `${usageHead}
<IconButton${iconOnly ? ' iconOnly' : ''} variant=${q(variant)}${iconOnly ? ` placement=${q(placement)}` : ''} text="deploy">
  {#snippet icon()}${playGlyph}{/snippet}
</IconButton>${usageTail}`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Icon button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai icon-button component: an explicit icon + text contract in two postures — text (icon and label side by side) and icon-only (a square button where the label moves to the tooltip and stays the accessible name) — composed on press-button, inheriting every paint variant and effect loop."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content column in the DOM — desktop
       sticky right column, mobile the glass bar under the scaffold header
       (height 0, see toc.css); the content column reserves its clearance -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="icon-button — icon and text, one contract"
        summary="The button for actions that carry a glyph: an explicit two-part contract where icon is the glyph (always decorative) and text is the ONE label. The text posture renders icon + label side by side; iconOnly collapses to a square where the label does not disappear — it moves to the tooltip and stays the accessible name. The button itself IS a press-button (composition, not a copy): every paint variant, every effect loop, href anchoring and the press law pass through verbatim — same physics, same shadow tokens, same 42px band."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">text · icon-only</span>
          <span class="pill">inherits press-button verbatim</span>
          <span class="pill">variants + effects pass through</span>
          <span class="pill">aria-label never handwritten twice</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="icon-button"
        description="The icon+text button: the text posture renders icon and label together; iconOnly renders the square and tips the label. The playground drives the lower instance."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/icon-button.svelte"
        {files}
        stage="center"
        onreset={resetCanvas}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>text</span>
              <IconButton text="deploy">
                {#snippet icon()}{@html playGlyph}{/snippet}
              </IconButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>icon-only</span>
              <IconButton iconOnly text="copy command" placement="bottom">
                {#snippet icon()}{@html copyGlyph}{/snippet}
              </IconButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>icon-only anchor</span>
              <IconButton
                iconOnly
                text="open github"
                href="https://github.com/jixoai/ui"
                placement="bottom"
              >
                {#snippet icon()}{@html externalGlyph}{/snippet}
              </IconButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>inherited effect</span>
              <IconButton
                iconOnly
                variant="primary"
                effect={shimmer({ speed: 4000 })}
                text="deploy"
              >
                {#snippet icon()}{@html playGlyph}{/snippet}
              </IconButton>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <IconButton {variant} iconOnly={iconOnly} {placement} text="deploy">
              {#snippet icon()}{@html playGlyph}{/snippet}
            </IconButton>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="variant (paint)">
              <PlaySelect bind:value={variant} options={variantOptions} />
            </PlayRow>
            <PlayRow label="posture">
              <PlaySegmented bind:value={posture} options={postureOptions} />
            </PlayRow>
            <PlayRow label="placement (icon-only)">
              <PlaySelect bind:value={placement} options={placementOptions} />
            </PlayRow>
            <PlayHelp>
              hover an icon-only button and the tip opens immediately (no hover-intent delay);
              leaving either the button or the tip closes it after a 100ms grace — the close only
              fires once the pointer holds NEITHER surface. Keyboard focus opens it instantly and
              <code>Escape</code> closes it. The paint <code>variant</code> and every
              press-button capability (effects included) pass through — physics never change.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="icon-only" data-reveal="">
      <SectionCard
        family="icon-only"
        headerRegion="icon-only"
        eyebrow="demo"
        title="icon-only — the tooltip law"
        summary="In icon-only the text is never thrown away: the same string feeds the tooltip (the hover/focus hint on the popover laws) and the accessible name (aria-label), so the button says itself to pointer users, keyboard users and screen readers from ONE source. The glyph is decorative by construction — the component wraps it aria-hidden."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>hover / focus each one</span>
              <IconButton iconOnly text="copy command" placement="bottom">
                {#snippet icon()}{@html copyGlyph}{/snippet}
              </IconButton>
              <IconButton iconOnly text="open github" placement="bottom">
                {#snippet icon()}{@html externalGlyph}{/snippet}
              </IconButton>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="One label, a full button"
        summary="The contract is two props on purpose: icon carries the picture, text carries the meaning — and the button underneath is the real press-button, so nothing about a text button is missing here."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">text</code> is required and single-sourced: the text
              posture renders it beside the glyph, iconOnly turns it into the tooltip AND
              <code class="text-accent">aria-label</code> — never handwritten twice</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">icon</code> is always decorative: the component wraps
              the snippet <code class="text-accent">aria-hidden</code>, so the glyph can never
              become the accessible name</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>inheritance is composition: <code class="text-accent">variant</code> (paint),
              <code class="text-accent">effect</code> (shimmer / pulse / rainbow / ripple),
              <code class="text-accent">href</code> and <code class="text-accent">class</code>
              pass straight through to press-button — one button, one law</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the icon-only square rides the same 42px band as a text button
              (<code class="text-accent">size-10.5</code>) — rows stay level and the shadow
              tokens are identical by construction; <code class="text-accent">placement</code>
              picks the tip's side (top default) and the tip's pointer notch is ON by
              default (<code class="text-accent">arrow</code> opt-out), aimed at the anchor
              point the placement names</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">href</code> switches the element to an anchor; hrefs
              not starting with <code class="text-accent">/</code> open a new tab with
              <code class="text-accent">noreferrer</code> automatically</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
