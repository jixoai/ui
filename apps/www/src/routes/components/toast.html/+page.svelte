<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import ToastViewport from '$lib/ui/toast-viewport.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { createToastStore } from '$lib/toast-store';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import toastViewportSource from '$lib/ui/toast-viewport.svelte?raw';
  import toastStoreSource from '$lib/toast-store?raw';

  const close = '</' + 'script>';

  // page-local store: the demo IS the app pattern (create + mount once)
  const toast = createToastStore();

  const usage = `<script lang="ts">
  import ToastViewport from '@ui/toast-viewport.svelte';
  import { createToastStore } from '@lib/toast-store';
${close}

// app state — created once, never a module singleton (SSR stays clean)
const toast = createToastStore();
let lastDeploy = $state('');
${close}

<ToastViewport store={toast} />              <!-- once, root layout -->

<PressButton onclick={() => {
  lastDeploy = '4f2a';
  toast.api.push({ title: 'Deployed', description: 'build 4f2a' });
}}>deploy</PressButton>

<PressButton onclick={() =>
  toast.api.push({ title: 'Build failed', tone: 'destructive', assertive: true, duration: 0 })
}>break it (sticky)</PressButton>`;

  const canvasUsage = `<ToastViewport store={toast} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/lib/toast-store.ts', content: toastStoreSource },
    { name: 'registry/files/ui/toast-viewport.svelte', content: toastViewportSource },
    { name: 'src/lib/ui/toast-usage.svelte', content: canvasUsage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Toast · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toast in two seams: a framework-free store (push/dismiss/subscribe, per-toast expiry with hover/focus pause) and a viewport mounted once — corner stack, per-item live regions, dismiss buttons."
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
      eyebrow="registry:ui + registry:lib"
      title="toast — two seams, no singleton"
      summary="The store owns state and lifecycle (created by YOUR app, never a module singleton — SSR requests never share state); the viewport owns presentation (fixed corner stack, max visible with older queued, per-item live regions — role=status polite / role=alert assertive, hover/focus pauses the countdown, duration 0 is sticky)."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">createToastStore()</span>
        <span class="pill">pause on hover/focus</span>
        <span class="pill">sticky (duration 0)</span>
        <span class="pill">status | alert</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="toast"
      description="Push a polite toast, a sticky assertive one, or a burst — hover a toast to freeze its countdown; the × dismisses. Older toasts queue past the visible four."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toast-viewport.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-wrap gap-3">
        <PressButton
          onclick={() => toast.api.push({ title: 'Deployed', description: `build ${(Math.random() * 0xffff).toString(16).slice(0, 4)}` })}>
          polite toast
        </PressButton>
        <PressButton
          onclick={() => toast.api.push({ title: 'Build failed', tone: 'destructive', assertive: true, duration: 0 })}>
          sticky · assertive
        </PressButton>
        <PressButton
          onclick={() => {
            for (let i = 0; i < 5; i++) {
              toast.api.push({ title: `queued ${i + 1}`, description: 'older ones wait their turn' });
            }
          }}>
          burst ×5
        </PressButton>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the store is deliberately DOM-free — anything (a worker, a server event bridge) can push
          through the api handle. The viewport is the only DOM half, mounted once.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the live viewport for this page's demos -->
  <ToastViewport store={toast} />

  <div id="toast-base" data-reveal="">
    <SectionCard family="toast-base" headerRegion="toast-base" eyebrow="两缝架构" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
