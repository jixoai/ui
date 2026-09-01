<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as toastViewportMeta } from '$lib/meta/toast-viewport.meta';
  import { TOAST_VIEWPORT_DOCS } from '$lib/ui/props-table/docs/toast-viewport.docs';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import ToastViewport from '$lib/ui/toast/toast-viewport.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { createToastStore } from '$lib/toast-store';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import toastViewportSource from '$lib/ui/toast/toast-viewport.svelte?raw';
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
  toast.api.push({ title: 'Build failed', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })
}>break it (sticky)</PressButton>`;

  const canvasUsage = `<ToastViewport store={toast} />`;

  // the promise idiom (enhance-picker-feedback, 2026-08-30): a fake fetch
  // rides api.promise — pending now, settle replaces it; a rejection lands
  // the error shape (tonal + jx-hue-error, assertive, sticky)
  function fakeFetch(ok: boolean): Promise<string> {
    return new Promise((resolve, reject) =>
      setTimeout(
        () =>
          ok
            ? resolve(`build ${(Math.random() * 0xffff).toString(16).slice(0, 4)}`)
            : reject(new Error('registry unreachable')),
        900,
      ),
    );
  }

  // Material3 usage section — the two-seam app pattern, verbatim.
  const usageCode = usage;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/lib/toast-store.ts', content: toastStoreSource },
    { name: 'registry/files/ui/toast/toast-viewport.svelte', content: toastViewportSource },
    { name: 'src/lib/ui/toast-usage.svelte', content: canvasUsage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Toast · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toast in two seams: a framework-free store (push/dismiss/subscribe, per-toast expiry with hover/focus pause) and a viewport mounted once — a GRID stack that adopts into the scaffold's float plane (it never floats itself; the fixed corner is the standalone fallback), per-item live regions, material × effect variants, and the countdown companion."
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
      summary="The store owns state and lifecycle (created by YOUR app, never a module singleton — SSR requests never share state); the viewport owns presentation — a GRID stack that ADOPTS into the website-scaffold's float plane when one is present (the float-button law: it never floats itself; the fixed corner is the standalone fallback), max visible with older queued, per-item live regions — role=status polite / role=alert assertive, and the unified hold (hover/focus freezes BOTH clocks — the store timer and the countdown companion), duration 0 is sticky."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">createToastStore()</span>
        <span class="pill">adopts the float plane</span>
        <span class="pill">material: popover | glass</span>
        <span class="pill">effect: pulse | sweep</span>
        <span class="pill">countdown companion</span>
        <span class="pill">pause on hover/focus</span>
        <span class="pill">sticky (duration 0)</span>
        <span class="pill">status | alert</span>
      </div>
    </SectionCard>
  </div>

  <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
       ABOVE the demos — Intro → Install → Usage → Examples → API →
       See Also is the page law; the sections between stay page-local. -->
  <div data-reveal="">
    <DocsInstall name="toast" />
  </div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Create the store in app state (never a module singleton), mount the viewport once in the root layout, push from anywhere through the api handle."><CodeBlock code={usageCode} lang="svelte" meta="Toast usage" /></SectionCard></div>

  <div data-reveal="">
    <ComponentCanvas
      title="toast"
      stage="center"
      description="Push a polite toast, a sticky assertive one, or a burst — hover a toast to freeze its countdown; the × dismisses. Older toasts queue past the visible four, and the viewport says so with the +N queued tail chip."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toast/toast-viewport.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-wrap gap-3">
        <PressButton
          onclick={() => toast.api.push({ title: 'Deployed', description: `build ${(Math.random() * 0xffff).toString(16).slice(0, 4)}` })}>
          polite toast
        </PressButton>
        <PressButton
          onclick={() => toast.api.push({ title: 'Build failed', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })}>
          sticky · assertive
        </PressButton>
        <PressButton
          onclick={() => toast.api.push({ title: 'Syncing', description: 'glass ground · sweep light · 8s countdown', material: 'glass', effect: 'sweep', countdown: true, duration: 8000 })}>
          glass · sweep · countdown
        </PressButton>
        <PressButton
          onclick={() => toast.api.push({ title: 'Heads up', description: 'pulse ring — the attentive toast', effect: 'pulse', duration: 8000, countdown: true })}>
          pulse · countdown
        </PressButton>
        <PressButton
          onclick={() => {
            // site-polish F6: honest titles — four of these five ARE the
            // visible ones; the fifth shows as the viewport's +1 queued chip
            for (let i = 0; i < 5; i++) {
              toast.api.push({
                title: `Deployed #${i + 1}`,
                description: `build ${(Math.random() * 0xffff).toString(16).slice(0, 4)} is live`,
              });
            }
          }}>
          burst ×5
        </PressButton>
        <PressButton
          onclick={() =>
            toast.api.promise(fakeFetch(true), {
              pending: 'Deploying…',
              success: (v) => `Deployed ${v}`,
              error: 'Deploy failed',
            })}>
          promise → success
        </PressButton>
        <PressButton
          onclick={() =>
            toast.api.promise(fakeFetch(false), {
              pending: 'Deploying…',
              success: (v) => `Deployed ${v}`,
              error: (reason) => `Deploy failed: ${(reason as Error).message}`,
            })}>
          promise → failure
        </PressButton>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the store is deliberately DOM-free — anything (a worker, a server event bridge) can
            push through the api handle. The viewport is the only DOM half, mounted once.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the live viewport for this page's demos -->
  <ToastViewport store={toast} />

  
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Toast variants" summary="The ladder drives border + ink over the floating popover ground; hue is injected through the class seam (a failed status injects --error — never the destructive action hue); assertive switches the live-region role; duration 0 is sticky.">
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Deployed', description: 'outline · polite' })}>outline</PressButton></div>
      <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Synced', description: 'tonal · brand tint · polite', variant: 'tonal' })}>tonal</PressButton></div>
      <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Build failed', description: 'error status · assertive · sticky', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })}>error</PressButton></div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Every toast is its own live region — polite by default, assertive by opt-in — never one region announcing everything."><A11yTable keys={[{ key: 'Tab', action: 'Reach the dismiss button; hover or focus on a toast pauses its countdown' }]} aria={[{ name: 'role', value: 'status | alert', description: 'Per-item live region; assertive toasts announce as role=alert.' }, { name: 'aria-label (stack)', value: 'notifications', description: 'Names the fixed corner stack container.' }, { name: 'aria-label (dismiss)', value: 'dismiss notification', description: 'Names each toast’s × button.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The stack is fixed-position chrome; the composed trigger follows the density scope while the card paints through theme colors and the tone law."><div class="flex flex-col gap-5"><DensityDemo><PressButton onclick={() => toast.api.push({ title: 'Scoped trigger', description: 'the trigger rhythm follows the density scope' })}>push</PressButton></DensityDemo><TokenTable tokens={[{ name: '--popover / --popover-foreground', default: 'theme colors', source: 'color', description: 'Card surface and text.' }, { name: '--jx-tonal / --jx-outline', default: 'primary / border', source: 'color', description: 'Variant hue sources — the injection seam rides class utilities.' }, { name: 'jx-toast-in / jx-toast-out', default: '200ms / 180ms', source: 'component', description: 'Enter/exit keyframes; prefers-reduced-motion collapses both to none.' }, { name: 'EXIT_MS', default: '220ms', source: 'structural', description: 'Exit-snapshot window a dismissed toast paints before unmount.' }, { name: 'maxVisible', default: '4', source: 'structural', description: 'Max toasts rendered at once; older ones stay queued behind the +N queued chip.' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Trigger target through the composed control.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The viewport is presentation-only; the store handle (api.push / api.dismiss / api.snapshot, subscribe, pause, resume) is the other seam."><div class="flex flex-col gap-8"><!-- the viewport table renders from the GENERATED meta (one source, docs-demo-standard 4.2); the two store-api tables below document the STORE handle, not a component Props interface — legacy arrays until the store grows a meta --><PropsTable meta={toastViewportMeta} docs={TOAST_VIEWPORT_DOCS} /><PropsTable title="api.promise(task, messages) — messages: pending / success / error" props={[{ name: 'pending', type: 'string | Omit<ToastInit, \'id\'>', required: true, description: 'The in-flight notice — pushed at call time, sticky by default; replaced on settle.' }, { name: 'success', type: 'string | init | (value) => …', default: '—', description: 'On resolve: replaces the pending toast (polite, default expiry). Omitted → the pending toast is simply dismissed.' }, { name: 'error', type: 'string | init | (reason) => …', default: 'error shape', description: 'On rejection: tonal + jx-hue-error, assertive, sticky — a consumer object overrides field-by-field. Omitted → the default error shape still lands.' }]} /><PropsTable title="push(init) — ToastInit" props={[{ name: 'title', type: 'string', default: '—', description: 'Primary line, uppercase nav voice.', required: true }, { name: 'description', type: 'string', default: '—', description: 'Secondary muted line.' }, { name: 'variant', type: "'outline' | 'tonal'", default: "'outline'", description: 'Ladder prominence: outline = plain notice over the material ground; tonal = 12% tinted ground + tonal ink.' }, { name: 'material', type: "'popover' | 'glass'", default: "'popover'", description: 'The surface MATERIAL (float-button model): popover = solid ground; glass = backdrop-filter translucent — the entity-law restrained ground.' }, { name: 'effect', type: "'none' | 'pulse' | 'sweep'", default: "'none'", description: 'The effect LOOP: pulse = a breathing ring (attentive); sweep = a traveling light (live/in-flight).' }, { name: 'countdown', type: 'boolean', default: 'false', description: 'Render the countdown companion in the trailing lane — the duration drains; the unified hold freezes both clocks. Sticky toasts get none.' }, { name: 'leading / trailing', type: 'Snippet', default: '—', description: 'The toast-grid lane slots: an icon leading, actions or a custom companion trailing.' }, { name: 'class', type: 'string', default: '—', description: 'Consumer classes — the hue-injection seam, e.g. jx-hue-error.' }, { name: 'duration', type: 'number', default: '5000', description: 'ms until auto-dismiss; 0 = sticky.' }, { name: 'assertive', type: 'boolean', default: 'false', description: 'The viewport announces this one as role=alert.' }]} /></div></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="toast" />
  </div>
</div>
