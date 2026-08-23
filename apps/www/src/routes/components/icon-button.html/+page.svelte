<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import IconButton from '$lib/ui/icon-button.svelte';
  import iconButtonSource from '$lib/ui/icon-button.svelte?raw';
  import SectionCard from '$lib/ui/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

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
${close}

<!-- one label, two postures: normal shows the text, icon-only tips it -->`;
  const usageTail = `
<!-- icon-only: text moves to the tooltip AND stays aria-label -->
<IconButton variant="icon-only" text="copy command">
  {#snippet icon()}${copyGlyph}{/snippet}
</IconButton>

<!-- href renders an anchor; hrefs outside "/" open a new tab -->
<IconButton
  variant="icon-only"
  text="open github"
  href="https://github.com/jixoai/ui"
  placement="bottom"
>
  {#snippet icon()}${externalGlyph}{/snippet}
</IconButton>`;
  const drivenNormal = `<IconButton variant="normal" text="deploy">
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
  // calls back — snapshot + reset + echo projection + live usage
  type Variant = 'normal' | 'icon-only';
  type Placement = 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
  const canvasInitial = { variant: 'icon-only' as Variant, placement: 'bottom' as Placement };
  let variant = $state(canvasInitial.variant);
  let placement = $state(canvasInitial.placement);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
    placement = canvasInitial.placement;
  }
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  // placement only exists in icon-only — the live sample carries it only then
  const usageLive = $derived(
    `${usageHead}
<IconButton variant=${q(variant)}${variant === 'icon-only' ? ` placement=${q(placement)}` : ''} text="deploy">
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
    content="The jixoai icon-button component: an explicit icon + text contract in two variants — normal (icon and text side by side) and icon-only (a square button where the text moves to the tooltip and stays the accessible name)."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content column in the DOM — desktop
       sticky right column, mobile the glass bar under the scaffold header
       (height 0, see toc.css); the content column reserves its clearance -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="icon-button — icon and text, one contract"
        summary="The button for actions that carry a glyph: an explicit two-part contract where icon is the glyph (always decorative) and text is the ONE label. normal shows icon + text side by side; icon-only collapses to a square button where the text does not disappear — it moves to the tooltip and stays the accessible name. Press law (.jx-press) verbatim: hover grows the shadow only, active presses on an anchored shadow."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">normal · icon-only</span>
          <span class="pill">icon-only → text becomes the tooltip</span>
          <span class="pill">aria-label never handwritten twice</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="icon-button"
        description="The icon+text button: normal renders icon and text together; icon-only renders the square and tips the text. The playground drives the lower instance; the echo line tracks variant and placement."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/icon-button.svelte"
        {files}
        onreset={resetCanvas}
        echo={[
          { label: 'variant', value: variant },
          { label: 'placement', value: variant === 'icon-only' ? placement : '—' },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>normal</span>
              <IconButton text="deploy">
                {#snippet icon()}{@html playGlyph}{/snippet}
              </IconButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>icon-only</span>
              <IconButton variant="icon-only" text="copy command" placement="bottom">
                {#snippet icon()}{@html copyGlyph}{/snippet}
              </IconButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>icon-only anchor</span>
              <IconButton
                variant="icon-only"
                text="open github"
                href="https://github.com/jixoai/ui"
                placement="bottom"
              >
                {#snippet icon()}{@html externalGlyph}{/snippet}
              </IconButton>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <IconButton {variant} {placement} text="deploy">
              {#snippet icon()}{@html playGlyph}{/snippet}
            </IconButton>
          </div>
        </div>
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <NativeSelect
                label="variant"
                value={variant}
                onchange={(event) => {
                  variant = event.currentTarget.value as Variant;
                }}
              >
                <option value="normal">normal</option>
                <option value="icon-only">icon-only</option>
              </NativeSelect>
            </div>
            <div class="jx-play-field">
              <NativeSelect
                label="placement (icon-only)"
                value={placement}
                onchange={(event) => {
                  placement = event.currentTarget.value as Placement;
                }}
              >
                <option value="top">top</option>
                <option value="bottom">bottom</option>
                <option value="top-start">top-start</option>
                <option value="top-end">top-end</option>
                <option value="bottom-start">bottom-start</option>
                <option value="bottom-end">bottom-end</option>
              </NativeSelect>
            </div>
            <p class="jx-play-help">
              hover an icon-only button ~400ms (hover intent) and the text arrives as a tooltip;
              keyboard focus opens it instantly and <code class="text-accent">Escape</code> closes
              it. <code class="text-accent">variant</code> never changes the physics — every
              surface lifts on hover and presses on active the press-button way.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="icon-only" data-reveal="" use:reveal>
      <SectionCard
        family="icon-only"
        headerRegion="icon-only"
        eyebrow="demo"
        title="icon-only — the tooltip law"
        summary="In icon-only the text is never thrown away: the same string feeds the tooltip (hover-intent hint on the popover laws) and the accessible name (aria-label), so the button says itself to pointer users, keyboard users and screen readers from ONE source. The glyph is decorative by construction — the component wraps it aria-hidden."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>hover / focus each one</span>
              <IconButton variant="icon-only" text="copy command" placement="bottom">
                {#snippet icon()}{@html copyGlyph}{/snippet}
              </IconButton>
              <IconButton variant="icon-only" text="open github" placement="bottom">
                {#snippet icon()}{@html externalGlyph}{/snippet}
              </IconButton>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="law" data-reveal="" use:reveal>
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="One label, two postures"
        summary="The contract is two props on purpose: icon carries the picture, text carries the meaning, and no variant ever needs the label written twice."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">text</code> is required and single-sourced: normal
              renders it beside the glyph, icon-only turns it into the tooltip AND
              <code class="text-accent">aria-label</code> — never handwritten twice</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">icon</code> is always decorative: the component wraps
              the snippet <code class="text-accent">aria-hidden</code>, so the glyph can never
              become the accessible name</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the icon-only tooltip is a hint, not a control: non-interactive by the tooltip
              contract — actionable content belongs in a popover</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">size-9</code> square in icon-only keeps toolbar rows
              level with text buttons; <code class="text-accent">placement</code> picks the tip's
              side (top default)</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">href</code> switches the element to an anchor; hrefs
              not starting with <code class="text-accent">/</code> open a new tab with
              <code class="text-accent">noreferrer</code> automatically</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
