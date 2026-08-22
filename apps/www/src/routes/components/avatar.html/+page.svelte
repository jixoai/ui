<script lang="ts">
  import Avatar from '$lib/ui/avatar.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import avatarSource from '$lib/ui/avatar.svelte?raw';

  // ---- live playground state ----
  const canvasInitial = { name: 'Ada Lovelace' };
  let name = $state(canvasInitial.name);
  function resetCanvas(): void {
    name = canvasInitial.name;
  }

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'avatar-base', label: 'NativeHTML base' }];

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/team/ada.png" name="Ada Lovelace" />
<Avatar name="张伟" />            <!-- initials fallback: 张伟 -->
<Avatar name="Gaubee" size="lg" />`;

  // live usage tracks the playground's name; q() keeps free text a legal
  // string literal (quotes, apostrophes, newlines all safe)
  const q = (value: string): string => JSON.stringify(value);
  const canvasUsageLive = $derived(`<script lang="ts">
  import Avatar from '@ui/avatar.svelte';
${close}

<Avatar src="/favicon.png" name=${q(name)} size="lg" />
<Avatar name=${q(name)} size="lg" />`);
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
    content="The jixoai avatar: a native <img> — lazy, async-decoded, intrinsic dimensions — with a code-point-wise initials fallback for failed or missing sources. Radius-0 brutalist square."
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
      summary="The avatar IS an <img>: lazy, async-decoded, intrinsic width/height so layout never shifts. When the source fails or is absent, it swaps to an initials block derived code-point-wise from the name — CJK-safe (张伟 stays 张伟), Latin names take first and last initials. The radius-0 law makes it a brutalist square."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">lazy + async decode</span>
        <span class="pill">intrinsic dimensions</span>
        <span class="pill">CJK-safe initials</span>
        <span class="pill">alt defaults to name</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="avatar"
      description="The left avatar loads a real image; the right one has no source and shows the initials fallback derived live from the playground's name field."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/avatar.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'name', value: name || '—' }]}
      resolveFileContent={resolveCanvasUsage}
    >
      <div class="flex flex-wrap items-center gap-5">
        <Avatar src="/favicon.png" {name} size="lg" />
        <Avatar {name} size="lg" />
        <div class="flex items-center gap-2">
          <Avatar src="/favicon.png" {name} size="sm" />
          <Avatar {name} size="sm" />
        </div>
      </div>
      {#snippet playground()}
        <Input label="name" placeholder="Ada Lovelace" bind:value={name} />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the initials algorithm: one word → its first two code points (CJK-safe); several words →
          first letters of the first and last. alt defaults to the name — pass
          <code class="text-accent">alt=""</code> for decorative avatars beside a visible name.
        </p>
      {/snippet}
    </ComponentCanvas>
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
