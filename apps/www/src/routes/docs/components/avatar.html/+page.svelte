<script lang="ts">
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySelect, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import avatarSource from '$lib/ui/avatar/avatar.svelte?raw';

  // ---- live playground state ----
  type Variant = 'bevel' | 'rounded' | 'squircle';
  const canvasInitial = { name: 'Ada Lovelace', variant: 'bevel' as Variant, tooltip: true };
  let name = $state(canvasInitial.name);
  let variant = $state(canvasInitial.variant);
  let tooltip = $state(canvasInitial.tooltip);
  function resetCanvas(): void {
    name = canvasInitial.name;
    variant = canvasInitial.variant;
    tooltip = canvasInitial.tooltip;
  }

  // ToC outline: pairs with the section ids below, in page order.

  // the three silhouettes, one deterministic fallback each — no network
  const silhouettes: { variant: Variant; law: string }[] = [
    { variant: 'bevel', law: 'corner-shape: bevel + var(--radius) × size (6·8·10px)' },
    { variant: 'rounded', law: 'corner-shape: round + border-radius: 50%' },
    { variant: 'squircle', law: 'corner-shape: squircle + border-radius: 50%' },
  ];

  const close = '</' + 'script>';

  // base sample: the NativeHTML contract (img + fallback), no extras
  const usage = `<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/team/ada.png" name="Ada Lovelace" />
<Avatar name="张伟" />            <!-- initials fallback: 张伟 -->
<Avatar name="Gaubee" size="lg" />`;

  // silhouettes sample: variant re-corners, tooltip opts out where the
  // name already sits visible beside the avatar
  const shapesUsage = `<Avatar name="Ada Lovelace" variant="rounded" />
<Avatar name="Ada Lovelace" variant="squircle" size="lg" />
<Avatar name="Ada Lovelace" variant="bevel" tooltip={false} />`;

  // live usage tracks the playground's name/variant/tooltip; q() keeps
  // free text a legal string literal (quotes, apostrophes, newlines all
  // safe). tooltip stays implicit while on — the default reads cleaner.
  const q = (value: string): string => JSON.stringify(value);
  const canvasUsageLive = $derived(`<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/icon.svg" name=${q(name)} variant=${q(variant)} size="lg" />
<Avatar name=${q(name)} variant=${q(variant)} size="lg"${tooltip ? '' : ' tooltip={false}'} />`);
  const resolveCanvasUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? canvasUsageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/avatar.svelte', content: avatarSource },
    { name: 'src/lib/ui/avatar-usage.svelte', content: canvasUsageLive },
  ];
</script>

<svelte:head>
  <title>Avatar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai avatar: a native <img> — lazy, async-decoded, intrinsic dimensions — with a code-point-wise initials fallback for failed or missing sources. Three silhouettes (bevel, rounded, squircle), halved initials at icon size, and the full name on a tooltip by default."
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
      eyebrow="registry:ui · NativeHTML"
      title="avatar — an img, honestly"
      summary="The avatar IS an <img>: lazy, async-decoded, intrinsic width/height so layout never shifts. When the source fails or is absent, it swaps to an initials block derived code-point-wise from the name — CJK-safe (张伟 stays 张伟), halved to one code point at icon size so it never overflows. Three silhouettes ride one geometry: the bevel radius law (default), a true circle, and the squircle superellipse. Hover any avatar and the full name comes back on a tooltip — on by default, tooltip={false} opts out."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">bevel · rounded · squircle</span>
        <span class="pill">sm halves the initials</span>
        <span class="pill">name tooltip on by default</span>
        <span class="pill">CJK-safe initials</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="avatar"
      stage="center"
      description="The left avatar loads a real image; the right one has no source and shows the initials fallback derived live from the playground's name field. Every instance re-corners with the silhouette pick — and at sm the fallback halves to one code point. Hover (or focus) an avatar: the full name rides the default tooltip."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/avatar.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[
        { label: 'name', value: name || '—' },
        { label: 'variant', value: variant },
      ]}
      resolveFileContent={resolveCanvasUsage}
    >
      <div class="flex flex-wrap items-center gap-5">
        <Avatar src="/icon.svg" {name} {variant} size="lg" {tooltip} />
        <Avatar {name} {variant} size="lg" {tooltip} />
        <div class="flex items-center gap-2">
          <Avatar src="/icon.svg" {name} {variant} size="sm" {tooltip} />
          <Avatar {name} {variant} size="sm" {tooltip} />
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <Input label="name" placeholder="Ada Lovelace" bind:value={name} />
          <PlayRow label="variant">
            <PlaySelect
              bind:value={variant}
              options={[
                { value: 'bevel', label: 'bevel — the radius law' },
                { value: 'rounded', label: 'rounded — circle' },
                { value: 'squircle', label: 'squircle — superellipse' },
              ]}
            />
          </PlayRow>
          <PlayRow label="tooltip" hint="full name on hover">
            <PlayToggle bind:value={tooltip} />
          </PlayRow>
          <PlayHelp>
            the initials algorithm: one word → its first two code points (CJK-safe); several words
            → first letters of the first and last; sm keeps only the first. alt defaults to the
            name — pass <code>alt=""</code> for decorative avatars beside a visible name.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="avatar-shapes" data-reveal="">
    <SectionCard
      family="avatar-shapes"
      headerRegion="avatar-shapes"
      eyebrow="corner-shape law"
      title="One geometry, three corners"
      summary="The silhouette is one CSS decision layered on the same box: bevel keeps the jixoai radius law with var(--radius) riding the md baseline and scaled by the same proportion at sm and lg (6 / 8 / 10px — 0 where corner-shape is unsupported, the brutalist square), rounded states corner-shape: round with a 50% radius for a true circle, and squircle states corner-shape: squircle with the same 50% for the superellipse — engines without corner-shape simply round it back to the circle. Nothing degrades ugly."
    >
      <div class="flex flex-col gap-4">
        {#each silhouettes as { variant: v, law } (v)}
          <div class="flex flex-wrap items-center gap-4">
            <Avatar name="张伟" variant={v} size="lg" alt="" />
            <Avatar name="JX AoI" variant={v} size="md" alt="" />
            <Avatar name="JX AoI" variant={v} size="sm" alt="" />
            <code class="text-accent text-[11.5px] leading-5">{law}</code>
          </div>
        {/each}
      </div>
      <CodeBlock code={shapesUsage} lang="svelte" meta="silhouettes" />
    </SectionCard>
  </div>

  <div id="avatar-base" data-reveal="">
    <SectionCard
      family="avatar-base"
      headerRegion="avatar-base"
      eyebrow="W3C foundation"
      title="What the platform gives, what we add"
      summary="The img element carries loading, decoding, intrinsic sizing, and alt semantics. The one thing it lacks is a failure posture — that is the whole component: an onerror swap to an initials block, and nothing else."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Avatar variants" summary="Three silhouettes on one geometry, three fixed sizes, and a deterministic initials fallback.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">silhouettes</p>
        <div class="flex items-center gap-3">
          <Avatar name="张伟" variant="bevel" alt="" />
          <Avatar name="JX AoI" variant="rounded" alt="" />
          <Avatar name="JX AoI" variant="squircle" alt="" />
        </div>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">sizes — sm 24 · md 32 · lg 40</p>
        <div class="flex items-center gap-3">
          <Avatar name="JX AoI" size="sm" alt="" />
          <Avatar name="JX AoI" size="md" alt="" />
          <Avatar name="JX AoI" size="lg" alt="" />
        </div>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">initials fallback</p>
        <div class="flex items-center gap-3">
          <Avatar name="Ada Lovelace" alt="" />
          <Avatar name="Gaubee" alt="" />
          <Avatar name="张伟" size="sm" alt="" />
        </div>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">image + tooltip</p>
        <div class="flex items-center gap-3">
          <Avatar src="/icon.svg" name="JX AoI" size="lg" />
          <span class="text-[12.5px] text-muted-foreground">hover or focus — the full name rides the default tooltip</span>
        </div>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give it a name; the image is optional — the fallback covers failed or missing sources."><CodeBlock code={usage} lang="svelte" meta="Avatar usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The avatar is content: alt defaults to the name, and the fallback block keeps the same label with role=img."><A11yTable keys={[{ key: '—', action: 'Not interactive — an image; the name tooltip also opens on focus' }]} aria={[{ name: 'alt', value: 'name (default)', description: 'The avatar is content; pass alt="" for decorative avatars beside a visible name.' }, { name: 'role', value: 'img', description: 'On the initials fallback block (omitted when decorative).' }, { name: 'aria-label', value: 'name', description: 'On the fallback block, keeping the label identical to the img path.' }, { name: 'aria-hidden', value: 'true', description: 'On the fallback block when alt="" marks it decorative.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Sizes are fixed geometry (24/32/40), not density-driven; the bevel radius rides the theme --radius scale."><div class="flex flex-col gap-5"><DensityDemo><div class="flex items-center gap-3"><Avatar name="JX AoI" size="sm" alt="" /><Avatar name="JX AoI" alt="" /><Avatar name="JX AoI" size="lg" alt="" /></div></DensityDemo><TokenTable tokens={[{ name: '--jx-avatar-md', default: '2rem (32px)', source: 'component', description: 'Context-owned md box — a list-item media host can inject its derived square.' }, { name: '--radius', default: '8px baseline', source: 'structural', description: 'Bevel cut at md; sm/lg ride 0.75×/1.25× of it (6/8/10px).' }, { name: 'size', default: '24 / 32 / 40px', source: 'structural' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend the native img attributes (except alt, which defaults to name)."><PropsTable props={[{ name: 'src', type: 'string', default: '—', description: 'Image URL; empty or failed loads swap to the initials fallback.' }, { name: 'name', type: 'string', default: '—', description: 'The person — fuels alt text, the initials fallback, and the tooltip.', required: true }, { name: 'alt', type: 'string', default: 'name', description: 'Pass "" explicitly for a decorative avatar.' }, { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm 24px · md 32px · lg 40px.' }, { name: 'variant', type: "'bevel' | 'rounded' | 'squircle'", default: "'bevel'", description: 'The silhouette: the radius law, a true circle, or the superellipse.' }, { name: 'tooltip', type: 'boolean', default: 'true', description: 'The full name rides a tooltip (hover + focus); false opts out.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the img / fallback block.' }]} /></SectionCard></div>
</div>
