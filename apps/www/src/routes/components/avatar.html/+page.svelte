<script lang="ts">
  import Avatar from '$lib/ui/avatar.svelte';
  import Checkbox from '$lib/ui/checkbox.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import avatarSource from '$lib/ui/avatar.svelte?raw';

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
  const tocSections = [
    { id: 'avatar-shapes', label: 'Three silhouettes' },
    { id: 'avatar-base', label: 'NativeHTML base' },
  ];

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

<Avatar src="/favicon.png" name=${q(name)} variant=${q(variant)} size="lg" />
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
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
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

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="avatar"
      description="The left avatar loads a real image; the right one has no source and shows the initials fallback derived live from the playground's name field. Every instance re-corners with the silhouette pick — and at sm the fallback halves to one code point. Hover (or focus) an avatar: the full name rides the default tooltip."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/avatar.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[
        { label: 'name', value: name || '—' },
        { label: 'variant', value: variant },
      ]}
      resolveFileContent={resolveCanvasUsage}
    >
      <div class="flex flex-wrap items-center gap-5">
        <Avatar src="/favicon.png" {name} {variant} size="lg" {tooltip} />
        <Avatar {name} {variant} size="lg" {tooltip} />
        <div class="flex items-center gap-2">
          <Avatar src="/favicon.png" {name} {variant} size="sm" {tooltip} />
          <Avatar {name} {variant} size="sm" {tooltip} />
        </div>
      </div>
      {#snippet playground()}
        <Input label="name" placeholder="Ada Lovelace" bind:value={name} />
        <NativeSelect label="variant" bind:value={variant}>
          <option value="bevel">bevel — the radius law</option>
          <option value="rounded">rounded — circle</option>
          <option value="squircle">squircle — superellipse</option>
        </NativeSelect>
        <Checkbox label="tooltip (full name on hover)" bind:checked={tooltip} />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the initials algorithm: one word → its first two code points (CJK-safe); several words →
          first letters of the first and last; sm keeps only the first. alt defaults to the name —
          pass <code class="text-accent">alt=""</code> for decorative avatars beside a visible name.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="avatar-shapes" data-reveal="" use:reveal>
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

  <div id="avatar-base" data-reveal="" use:reveal>
    <SectionCard
      family="avatar-base"
      headerRegion="avatar-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives, what we add"
      summary="The img element carries loading, decoding, intrinsic sizing, and alt semantics. The one thing it lacks is a failure posture — that is the whole component: an onerror swap to an initials block, and nothing else."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
