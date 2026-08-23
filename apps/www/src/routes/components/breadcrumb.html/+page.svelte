<script lang="ts">
  import Breadcrumb from '$lib/ui/breadcrumb.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import breadcrumbSource from '$lib/ui/breadcrumb.svelte?raw';

  const close = '</' + 'script>';

  // ToC outline: the live demo band + the usage closing section, in page order.

  const usage = `<script lang="ts">
  import Breadcrumb from '@ui/breadcrumb.svelte';
${close}

<Breadcrumb crumbs={[
  { label: 'registry', href: '/' },
  { label: 'components', href: '/components.html' },
  { label: 'breadcrumb', href: '/components/breadcrumb.html' },
]} />

<!-- long trails: collapse the middle into a live ellipsis link -->
<Breadcrumb {crumbs} collapse={4} />`;

  const canvasUsage = `<Breadcrumb {crumbs} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/breadcrumb.svelte', content: breadcrumbSource },
    { name: 'src/lib/ui/breadcrumb-usage.svelte', content: canvasUsage },
  ];

  const crumbs = [
    { label: 'registry', href: '/' },
    { label: 'components', href: '/components.html' },
    { label: 'breadcrumb', href: '/components/breadcrumb.html' },
  ];
  const longCrumbs = Array.from({ length: 8 }, (_, i) => ({
    label: `page ${i + 1}`,
    href: `/components/breadcrumb.html?trail=${i + 1}`,
  }));
</script>

<svelte:head>
  <title>Breadcrumb · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai breadcrumb: a nav landmark over an ordered list of real links — aria-current on the last crumb, CSS chevrons as decoration, and a middle-collapse that keeps every page one click away."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="breadcrumb — the trail the platform already defines"
      summary="nav[aria-label] wrapping an ol of ordinary links: the entire semantics in three elements, no roles to maintain — the list's order IS the hierarchy. The last crumb carries aria-current=page; a CSS chevron separates items as pure decoration."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nav + ol + a</span>
        <span class="pill">aria-current</span>
        <span class="pill">collapse = live ellipsis link</span>
      </div>
    </SectionCard>
  </div>

  <div id="breadcrumb-demo" data-region="breadcrumb-demo" data-family="breadcrumb-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="breadcrumb"
      description="A three-crumb trail, and an eight-page trail with collapse=4 — the middle folds into an ellipsis that links to the first hidden page (never a dead span)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/breadcrumb.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-col items-start gap-5">
        <Breadcrumb {crumbs} />
        <Breadcrumb crumbs={longCrumbs} collapse={4} />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the current page stays a real link — deep links and reloads remain honest. Hover the
          ellipsis: it points at the first collapsed page, one click restores the path.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="breadcrumb-base" data-reveal="" use:reveal>
    <SectionCard
      family="breadcrumb-base"
      headerRegion="breadcrumb-base"
      eyebrow="NativeHTML 基座"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
