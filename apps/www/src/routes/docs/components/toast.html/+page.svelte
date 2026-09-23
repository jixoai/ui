<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
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

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------

  // the variant ladder (types section), swept through a canvas: the
  // triggers stay live inside the stage — the viewport mounts once at
  // the page level and the cards portal into the float plane
  const toastTypesDemo = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
  import ToastViewport from '@ui/toast-viewport.svelte';
  import { createToastStore } from '@lib/toast-store';
${close}

// app state — created once, never a module singleton (SSR stays clean)
const toast = createToastStore();

<div class="grid gap-4 sm:grid-cols-3">
  <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Deployed', description: 'outline · polite' })}>outline</PressButton></div>
  <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Synced', description: 'tonal · brand tint · polite', variant: 'tonal' })}>tonal</PressButton></div>
  <div class="border border-border p-4"><PressButton onclick={() => toast.api.push({ title: 'Build failed', description: 'error status · assertive · sticky', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })}>error</PressButton></div>
</div>

<!-- once, root layout -->
<ToastViewport store={toast} />`;

  const toastTypesFiles: TreeFile[] = [
    { name: 'toast-types-demo.svelte', content: toastTypesDemo, kind: 'usage' },
  ];

  // the toast-v2 stack dialect (stacking section), swept through a canvas
  const toastStackDemo = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
  import ToastViewport from '@ui/toast-viewport.svelte';
  import { createToastStore } from '@lib/toast-store';
${close}

// app state — created once, never a module singleton (SSR stays clean)
const toast = createToastStore();

<div class="grid w-full gap-4 sm:grid-cols-2">
  <div class="border border-border p-4 grid gap-2"><PressButton onclick={() => { for (let i = 0; i < 3; i++) toast.api.push({ title: \`Sync step \${i + 1}\`, description: 'hover the stack — it expands to the full list', countdown: true, duration: 15000 }); }}>collapse → hover expand</PressButton><p class="text-sm text-muted-foreground">Three long clocks stack with depth; pointer enter expands (the gap-sum ladder), leave collapses — the force-expand prop pins the posture.</p></div>
  <div class="border border-border p-4 grid gap-2"><PressButton onclick={() => toast.api.push({ title: 'Draggable', description: 'drag me toward the right screen edge — or down' })}>swipe to dismiss</PressButton><p class="text-sm text-muted-foreground">A carry at or past 48px — or a flick above 0.11 px/ms — dismisses along an allowed axis; the cross axis carries at 0.2 friction. Defaults come from the slot (right-bottom → right + down, toward the nearest edges; the center takes none); a push names its own.</p></div>
  <div class="border border-border p-4 grid gap-2"><PressButton onclick={() => toast.api.push({ title: 'Switch tabs now', description: 'this clock freezes while the page is hidden', countdown: true, duration: 20000 })}>freezes when hidden</PressButton><p class="text-sm text-muted-foreground">Push, then switch tabs: pauseAll froze the running clocks; coming back resumes exactly the remaining time. Hover holds and the queued-never-seen stay untouched — three freeze sources never stomp each other.</p></div>
  <div class="border border-border p-4 grid gap-2"><PressButton onclick={() => toast.api.push({ title: 'Incident 4f2a', description: 'click the card for the full reading posture', countdown: true, duration: 15000, expandable: true })}>expandable → dialog</PressButton><p class="text-sm text-muted-foreground">Card and dialog share jx-toast-&lt;id&gt;: the platform morphs one into the other (a WAAPI rect-rise where VT is absent). The dialog is popover=auto — light dismiss collapses back; the clock stays paused while expanded.</p></div>
</div>

<!-- once, root layout -->
<ToastViewport store={toast} />`;

  const toastStackFiles: TreeFile[] = [
    { name: 'toast-stack-demo.svelte', content: toastStackDemo, kind: 'usage' },
  ];

  // ToC outline: pairs with the section ids below, in page order.

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((s): s is NonNullable<(typeof s)> => Boolean(s))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<ToastViewport store={store} theme="dark" density="large" elevation={6} pos="left-bottom" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/toast-universal.svelte', content: universalUsage },
  ];

  // the seats stores: each extra viewport is its OWN store+viewport pair
  // (two viewports never share a store — the visibility handshake would
  // fight over the reported slice); the seats land in the float plane at
  // their own nine-slot positions (left-bottom / left-top) so the three
  // stacks never overlap
  const univToast = createToastStore();
  const queryToast = createToastStore();

  // the ONE query() case: the density lane's responsive rung — the
  // engine resolves the lane and the carriers stamp the stack root
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import ToastViewport from '@ui/toast-viewport.svelte';
  import { createToastStore } from '@lib/toast-store';
  import { query } from '@lib/universal-props-query.svelte';
${close}

// app state — created once, never a module singleton (SSR stays clean)
const toast = createToastStore();

// the md key is the registered VIEWPORT scale (48rem): below it the
// small rung stamps, at 48rem+ large wins — data-density flips AND
// the kernel lanes rescale the card's type
const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

<ToastViewport store={toast} density={responsiveDensity} pos="left-top" />`;

  // ── the measured per-axis table (task 44) — every cell measured on
  // the served DOM (probe) or negative-grepped over ui/toast/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "OWN NO-OPINION, AMBIENT-CONSUMED — the card's type rhythm rides the kernel lanes (--jx-text on the description, the leading rung on the dialog panel, --jx-hit/--jx-inset on the panel actions); a named rung stamps data-density ON THE STACK ROOT (the scope portals with the stack — measured lg/sm seats), a number or query lane rides the --jx-density-coefficient carrier through the kernel calc chain. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY for the family's own paint — zero --jx-size-effective readers over ui/toast/ (grep receipt); the carrier's font-size lands on the stack root, so composed leading/trailing snippet content scales while the card's own type stays pinned to the label/text tokens. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero --jx-shape-effective readers (grep receipt); the card corner is the static --jx-radius token. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the concentric broadcast for the reading panel: zero --jx-radius-effective readers over ui/toast/ (grep receipt); the card corner is tokens --jx-radius, not the axis calc. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY axis — zero --jx-color-effective readers (grep receipt); the card's hue rides the CLASS SEAM instead (jx-hue-error retints --jx-tonal/--jx-outline through the variant ladder), per the API table. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE SPLIT INK SYSTEM (measured, probe): the card's ground and foreground ride --jx-popover/--jx-popover-foreground — :root-pinned aliases (shape #2, substitution at the declaring element), so a scoped island holds them and ROOT-level dark re-derives; the variant hue pair --jx-tonal/--jx-outline is RE-DECLARED per theme scope (the :root, .jx-light, .dark selector list — substitution re-runs against each scope's --primary/--border), and the elevation SURFACE rung re-derives too, so a dark island flips the card's ground while the popover aliases hold (the measured split). The carrier is the .dark CLASS, never a style var — the viewport stamps class:dark on the stack root: a self-carried dark island THROUGH the portal. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level3' · Own default, not ambient`,
      description:
        "OWN level3, CONSUMED — the snackbar rung: elevationSurfaceOf stamps --jx-elevation-shadow / --jx-elevation-surface / --jx-surface-solid-fill on the stack root, and the card reads the pair with the popover fallback (background: var(--jx-elevation-surface, var(--jx-popover)); the press shadow composes --jx-elevation-shadow). The number lane is exact dp snapped DOWN to the table rung. Measured: the level3 pair in the stack's inline style; level4 seat flips the rung.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE FAMILY OWNS THE MOTION, AXIS UNREAD — enter 200ms (jx-toast-in, --motion-200 nav ease), exit 180ms forwards, the 220ms EXIT_MS snapshot window a dismissed card paints before unmount (reduced motion removes IMMEDIATELY and skips the snapshot), pulse 1.6s / sweep 2.4s loops, and the countdown drain (linear forwards; .paused = play-state paused; RTL reverses direction) — every channel killed under prefers-reduced-motion (toast.css). Zero --jx-motion-effective readers (grep receipt). Number unit: coefficient.",
    },
  ];

</script>

<svelte:head>
  <title>Toast · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toast in two seams: a framework-free store (push/dismiss/subscribe, per-toast expiry with hover/focus pause) and a viewport mounted once — a GRID stack that adopts into the scaffold's float plane (it never floats itself; the fixed corner is the standalone fallback), per-item live regions, material × effect variants, and the countdown companion. toast-v2: the sonner-grade stack — collapsed depth with hover/touch expand, swipe-to-dismiss toward the corner's edges, every clock freezes while the page is hidden, and expandable toasts morph into a dialog through a view transition."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui + registry:lib"
      title="toast — two seams, no singleton"
      summary="The store owns state and lifecycle (created by YOUR app, never a module singleton — SSR requests never share state); the viewport owns presentation — a GRID stack that ADOPTS into the website-scaffold's float plane when one is present (the float-button law: it never floats itself; the fixed corner is the standalone fallback), max visible with older queued, per-item live regions — role=status polite / role=alert assertive, and the unified hold (hover/focus freezes BOTH clocks — the store timer and the countdown companion), duration 0 is sticky."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">createToastStore()</span>
        <span class="pill">adopts the float plane</span>
        <span class="pill">material: popover | glass</span>
        <span class="pill">effect: pulse | sweep</span>
        <span class="pill">countdown companion</span>
        <span class="pill">pause on hover/focus</span>
        <span class="pill">sticky (duration 0)</span>
        <span class="pill">status | alert</span>
        <span class="pill">collapse → hover expand</span>
        <span class="pill">swipe to dismiss</span>
        <span class="pill">freezes when hidden</span>
        <span class="pill">expandable → dialog (VT)</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="toast" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="Two seams: a DOM-free store whose per-toast clock answers to three orthogonal freeze sources, and a viewport that adopts the scaffold's float plane — the stack dialect, per-item live regions, and the self-carried axis carriers."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The store owns state and lifecycle; the viewport owns presentation. A push queues a card
          into a GRID stack where every card rides the SAME cell — depth is transform vars, never
          overlaid positions. The clock model: one expiry timer per toast with THREE orthogonal
          freeze sources — the hover/focus hold, the hidden-tab pauseAll, and the
          queued-never-seen visibility handshake — that never stomp each other; expiry arms at
          FIRST VISIBILITY, so a toast beyond maxVisible never expires unseen.
        </p>
        <p class={cx(rt.para)}>
          Announcements are per-item: every card is its OWN live region — role=status polite,
          role=alert when assertive — never one region announcing everything, and the +N queued
          chip is aria-hidden decoration. Delivery shape: the viewport is a SELF-CARRIED PORTAL —
          it adopts the scaffold's float plane (the jx-top-layer context), and because a trigger
          ancestor's CSS carriers never span a portal adoption, the viewport stamps its OWN
          carriers on the stack root (the density rung, the theme island, the elevation pair).
          Timed surfaces measured: the auto-dismiss window, the 220ms exit-snapshot frame
          (reduced motion removes immediately), the 200ms/180ms enter/exit pair, and the
          countdown drain with its paused play-state.
        </p>
        <p class={cx(rt.para)}>
          The keys: a monotonic per-store counter (id: number, nextId++) — duplicate keys
          structurally impossible, the LAW #18 worst case (a constant burst) hydration-safe by
          construction; the expandable dialog's shared-element name jx-toast-&lt;id&gt; inherits
          the uniqueness. The eight axes: elevation is OWN level3 and CONSUMED (the card's ground
          and press shadow read the level pair through the popover fallback), density is
          ambient-consumed through the kernel lanes, theme splits the card's ink system into a
          :root-frozen ground/foreground and a scope-re-derived hue pair, and
          size/shape/radius/color/motion carry the supply chain (zero effective readers, grep
          receipt). Kinship: <code class={cx(rt.inkPrimary)}>float-button</code> (the material
          and layers model the card rides), <code class={cx(rt.inkPrimary)}>system-dialog</code>
          (the modal interruption toast refuses — no scrim, the page stays reachable),
          <code class={cx(rt.inkPrimary)}>combobox</code> (the other per-item announcement law).
        </p>
      </div>
    </SectionCard>
  </div>


  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Create the store in app state (never a module singleton), mount the viewport once in the root layout, push from anywhere through the api handle."><CodeBlock code={usageCode} lang="svelte" meta="Toast usage" /></SectionCard></div>

  <!-- the live playground: moved below Usage — the skeleton's six slots
       keep their order (the first canvas byte must follow the Usage
       heading; the docs-lint contract, consolidated at scribe's T71) -->
  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="toast"
      stage="center"
      description="Push a polite toast, a sticky assertive one, or a burst — hover a toast to freeze its countdown, drag the front card toward an edge to swipe it away, click an expandable card to read it as a dialog; the × dismisses. Older toasts queue past the visible four, and the viewport says so with the +N queued tail chip."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toast/toast-viewport.svelte"
      files={canvasFiles}
    >
      <div class={cx(rt.wrap12)}>
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
        <PressButton
          onclick={() =>
            toast.api.push({
              title: 'Build report',
              description: 'click the card — it expands into a dialog through a view transition',
              countdown: true,
              duration: 12000,
              expandable: true,
            })}>
          expandable → dialog
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
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Toast variants" summary="The ladder drives border + ink over the floating popover ground; hue is injected through the class seam (a failed status injects --error — never the destructive action hue); assertive switches the live-region role; duration 0 is sticky.">
    <ComponentCanvas title="toast · variants" stage="fill" files={toastTypesFiles}>
      <div class={cx(rt.gridSm3)}>
        <div class={cx(rt.panel)}><PressButton onclick={() => toast.api.push({ title: 'Deployed', description: 'outline · polite' })}>outline</PressButton></div>
        <div class={cx(rt.panel)}><PressButton onclick={() => toast.api.push({ title: 'Synced', description: 'tonal · brand tint · polite', variant: 'tonal' })}>tonal</PressButton></div>
        <div class={cx(rt.panel)}><PressButton onclick={() => toast.api.push({ title: 'Build failed', description: 'error status · assertive · sticky', variant: 'tonal', class: 'jx-hue-error', assertive: true, duration: 0 })}>error</PressButton></div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>  <div id="stacking" data-reveal=""><SectionCard family="stacking" headerRegion="stacking" eyebrow="toast-v2" title="The stack: depth, swipe, the hidden page" summary="One grid cell holds every wrapper (grid-area 1/1) — the stack DIALECT, not overlaid positions. THE NINE SLOTS (R3): the float plane's stage cell takes nine physical positions — left-top … right-bottom via the pos prop; the DEFAULT is right-bottom (sonner's corner). THE GROWTH LAW: the pile grows AWAY from its slot's block edge — top slots descend into the content, every other slot climbs. Collapsed, each card sits one gap deeper and 5% smaller per depth; hover or touch expands to the full list while back boards keep the geometry and surrender only the ink (text-transparent — subtraction, never reflow). Swipe dismisses toward the stack's nearest screen edges; a hidden page freezes every clock — three orthogonal freeze sources, one timer; an expandable toast morphs into its reading posture through a view transition."><ComponentCanvas title="toast · stack" stage="fill" files={toastStackFiles}><div class={cx(rt.toGrid)}>
    <div class={cx(rt.panel, rt.grid, rt.gap8)}><PressButton onclick={() => { for (let i = 0; i < 3; i++) toast.api.push({ title: `Sync step ${i + 1}`, description: 'hover the stack — it expands to the full list', countdown: true, duration: 15000 }); }}>collapse → hover expand</PressButton><p class={cx(rt.textSm, rt.inkMuted)}>Three long clocks stack with depth; pointer enter expands (the gap-sum ladder), leave collapses — the force-expand prop pins the posture.</p></div>
    <div class={cx(rt.panel, rt.grid, rt.gap8)}><PressButton onclick={() => toast.api.push({ title: 'Draggable', description: 'drag me toward the right screen edge — or down' })}>swipe to dismiss</PressButton><p class={cx(rt.textSm, rt.inkMuted)}>A carry at or past 48px — or a flick above 0.11 px/ms — dismisses along an allowed axis; the cross axis carries at 0.2 friction. Defaults come from the slot (right-bottom → right + down, toward the nearest edges; the center takes none); a push names its own.</p></div>
    <div class={cx(rt.panel, rt.grid, rt.gap8)}><PressButton onclick={() => toast.api.push({ title: 'Switch tabs now', description: 'this clock freezes while the page is hidden', countdown: true, duration: 20000 })}>freezes when hidden</PressButton><p class={cx(rt.textSm, rt.inkMuted)}>Push, then switch tabs: pauseAll froze the running clocks; coming back resumes exactly the remaining time. Hover holds and the queued-never-seen stay untouched — three freeze sources never stomp each other.</p></div>
    <div class={cx(rt.panel, rt.grid, rt.gap8)}><PressButton onclick={() => toast.api.push({ title: 'Incident 4f2a', description: 'click the card for the full reading posture', countdown: true, duration: 15000, expandable: true })}>expandable → dialog</PressButton><p class={cx(rt.textSm, rt.inkMuted)}>Card and dialog share jx-toast-&lt;id&gt;: the platform morphs one into the other (a WAAPI rect-rise where VT is absent). The dialog is popover=auto — light dismiss collapses back; the clock stays paused while expanded.</p></div>
  </div></ComponentCanvas></SectionCard></div>

  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The stack is floating chrome — it ADOPTS the scaffold's float plane (the fixed corner is only the standalone fallback); the demo trigger follows the density scope while the card paints through theme colors and the tone law."><div class={cx(rt.flex, rt.col, rt.gap20)}><DensityDemo><PressButton onclick={() => toast.api.push({ title: 'Scoped trigger', description: 'the trigger rhythm follows the density scope' })}>push</PressButton></DensityDemo><TokenTable tokens={[{ name: '--popover / --popover-foreground', default: 'theme colors', source: 'color', description: 'Card surface and text.' }, { name: '--jx-tonal / --jx-outline', default: 'primary / border', source: 'color', description: 'Variant hue sources — the injection seam rides class utilities.' }, { name: 'jx-toast-in / jx-toast-out', default: '200ms / 180ms', source: 'component', description: 'Enter/exit keyframes; prefers-reduced-motion collapses both to none.' }, { name: 'EXIT_MS', default: '220ms', source: 'structural', description: 'Exit-snapshot window a dismissed toast paints before unmount; prefers-reduced-motion skips the snapshot entirely (immediate removal).' }, { name: 'maxVisible', default: '4', source: 'structural', description: 'Max toasts rendered at once; older ones stay queued behind the +N queued chip (expiry arms at first visibility — a viewport-owned push never arms before its card mounts; 0 renders none).' }, { name: 'store.setVisible', default: 'viewport-only', source: 'structural', description: 'The visibility handshake: the viewport reports the rendered id slice so queued toasts never expire unseen. Headless store consumers keep arm-at-push semantics.' }, { name: 'pos', default: 'right-bottom', source: 'structural', description: 'R3: the float slot\u2019s nine-grid position (left-top … right-bottom) — place-self per slot over the stage cell; the pile grows away from the slot\u2019s block edge.' }, { name: 'expand / gap', default: 'false / 8px', source: 'structural', description: 'toast-v2 stack posture: force the expanded list, or set the collapsed ladder\u2019s rung spacing.' }, { name: 'SWIPE_BY_FLOAT_POS', default: 'right-bottom: right, down', source: 'structural', description: 'R3: the nine-slot swipe vocabulary — corners take both nearest edges, edge slots take the one outward axis, the equidistant center takes none (the × and expiry own it); a push (or the viewport prop) names its own axes.' }, { name: '48px / 0.11 px·ms / 0.2', default: 'toast-swipe constants', source: 'structural', description: 'The swipe verdict: carry distance, flick velocity, cross-axis friction (judgeSwipe is a pure function — the math is testable, the gesture is wiring).' }, { name: 'store.pauseAll / resumeAll', default: 'page-visibility', source: 'structural', description: 'toast-v2: a hidden tab freezes EVERY clock and pushes land un-armed — a toast must not burn out unseen; resume restores exactly the remaining time, never stomping a hover hold or a queued toast.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The viewport is presentation-only; the store handle (api.push / api.dismiss / api.snapshot, subscribe, pause, resume) is the other seam."><div class={cx(rt.flex, rt.col, rt.gap32)}><!-- the viewport table renders from the GENERATED meta (one source, docs-demo-standard 4.2); the two store-api tables below document the STORE handle, not a component Props interface — legacy arrays until the store grows a meta --><PropsTable meta={toastViewportMeta} docs={TOAST_VIEWPORT_DOCS} /><PropsTable title="api.promise(task, messages) — messages: pending / success / error" props={[{ name: 'pending', type: 'string | Omit<ToastInit, \'id\'>', required: true, description: 'The in-flight notice — pushed at call time, sticky by default; replaced on settle.' }, { name: 'success', type: 'string | init | (value) => …', default: '—', description: 'On resolve: replaces the pending toast (polite, default expiry). Omitted → the pending toast is simply dismissed.' }, { name: 'error', type: 'string | init | (reason) => …', default: 'error shape', description: 'On rejection: tonal + jx-hue-error, assertive, sticky — a consumer object overrides field-by-field. Omitted → the default error shape still lands.' }]} /><PropsTable title="push(init) — ToastInit" props={[{ name: 'title', type: 'string', default: '—', description: 'Primary line, uppercase nav voice.', required: true }, { name: 'description', type: 'string', default: '—', description: 'Secondary muted line.' }, { name: 'variant', type: "'outline' | 'tonal'", default: "'outline' · Own default, not ambient", description: 'Ladder prominence: outline = plain notice over the material ground; tonal = 12% tinted ground + tonal ink. Own default, not ambient (toast is outside the paint zone’s frozen availability table).' }, { name: 'material', type: "'popover' | 'glass'", default: "'popover' · Own default, not ambient", description: 'The surface MATERIAL (float-button model): popover = solid ground; glass = the shared glass law sheet\'s frost (data-jx-effect stamp, tuned 12px / saturate 1 / popover 55%) — the entity-law restrained ground.' }, { name: 'effect', type: "'none' | 'pulse' | 'sweep'", default: "'none'", description: 'The effect LOOP: pulse = a breathing ring (attentive); sweep = a traveling light (live/in-flight).' }, { name: 'countdown', type: 'boolean', default: 'false', description: 'Render the countdown companion as the card\u2019s FLOOR — a full-width drain pinned to the bottom edge; the unified hold freezes both clocks. Sticky toasts get none.' }, { name: 'leading / trailing', type: 'Snippet', default: '—', description: 'The toast-grid lane slots: an icon leading, actions or a custom companion trailing.' }, { name: 'class', type: 'string', default: '—', description: 'Consumer classes — the hue-injection seam, e.g. jx-hue-error.' }, { name: 'duration', type: 'number', default: '5000', description: 'ms until auto-dismiss; 0 = sticky.' }, { name: 'assertive', type: 'boolean', default: 'false', description: 'The viewport announces this one as role=alert.' }, { name: 'expandable', type: 'boolean', default: 'false', description: 'toast-v2: clicking the card expands it into a dialog through a view transition (shared element name jx-toast-<id>; a WAAPI rect-rise where VT is absent). The clock stays paused while expanded; light dismiss collapses back.' }, { name: 'swipeDirections', type: "readonly SwipeDirection[]", default: 'SWIPE_BY_FLOAT_POS[slot]', description: 'toast-v2: the drag axes that may dismiss this toast (up/down/left/right). The default vocabulary comes from the stack\u2019s slot — right-bottom takes right + down (toward the nearest edges); the center takes none.' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on toast"
      summary="Elevation is OWN level3 and CONSUMED — the card's ground and press shadow read the level pair through the popover fallback (the snackbar rung); density is ambient-consumed through the kernel lanes with the rung scope stamped on the stack root; theme splits the card's ink system into a :root-frozen ground/foreground and a scope-re-derived hue pair — the carriers portal WITH the stack; size/shape/radius/color/motion carry the supply chain."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the PORTAL LAW (the viewport adopts the scaffold's float plane through the
          jx-top-layer context — a trigger ancestor's CSS carriers never span the adoption, so the
          viewport stamps its OWN carriers on the stack root: the density rung, the .dark class,
          the elevation pair, the coefficient), the announcement trio (every card its own live
          region — role=status polite / role=alert assertive, content present AT INSERT, the +N
          chip aria-hidden; queued cards are NOT in the accessibility tree until they render), the
          TRANSITION-FRAME battery (auto-dismiss windows measured with a MutationObserver
          page-clock instrument across multi-run ranges; the 220ms exit-snapshot frame measured,
          reduced-motion removal immediate; the hover hold and the hidden-tab pauseAll freeze the
          same clock), the queue law (burst ×5 → four visible + "+1 queued"; dismissing the front
          promotes the oldest queued card — FIFO order preserved, expiry arms at first
          visibility), the id landscape (a monotonic per-store counter — duplicate keys
          structurally impossible; expandable dialogs carry unique jx-toast-&lt;id&gt;
          shared-element names) and LAW #19 (duplicate ids NONE page-wide) were measured on this
          page's served DOM (probe, task 44). LAW #18 note: the each keys item.id — the counter
          makes the LAW #18 worst case (a constant burst) hydration-safe by construction. The
          query() seat below rides the md viewport key (48rem) on the density lane; the
          dark-island seat renders the measured theme split live.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20, rt.wFull)}>
          <ComponentCanvas title="toast · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}>
                <PressButton onclick={() => univToast.api.push({ title: 'Dark island · lg', description: 'theme=dark + density=large stamped on the stack root — the carriers portal with the stack', variant: 'tonal', countdown: true, duration: 15000 })}>push to the axis stack</PressButton>
                <p class={cx(rt.mt12, rt.note12, rt.inkMuted70)}>
                  The left-bottom stack carries theme="dark" density="large" elevation=6dp: its own
                  .dark island rides the portal — the card's ground re-derives in the island (the
                  level3 surface rung), the tonal hue re-derives (the selector-list
                  re-declaration), while the frozen popover aliases hold the root's values (the
                  measured split).
                </p>
              </div>
              <div class={cx(rt.panel)}>
                <PressButton onclick={() => queryToast.api.push({ title: 'Responsive density', description: 'resize across 48rem — the md key flips the rung stamp and the kernel lanes', countdown: true, duration: 15000 })}>push to the responsive stack</PressButton>
                <p class={cx(rt.mt12, rt.note12, rt.inkMuted70)}>
                  The left-top stack rides the query seat: below 48rem the small rung stamps
                  (data-density="sm"), at 48rem+ large wins ("lg") — and the card's kernel-lane
                  type rescales with it (the description is one var(--jx-text) reader).
                </p>
              </div>
            </div>
            <ToastViewport store={univToast} theme="dark" density="large" elevation={6} pos="left-bottom" />
            <ToastViewport store={queryToast} density={responsiveDensity} pos="left-top" />
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Every toast is its own live region — polite by default, assertive by opt-in — never one region announcing everything. Toasts beyond maxVisible stay queued and are NOT in the accessibility tree until they render; their expiry arms at first visibility, so a queued toast never expires unseen."><A11yTable keys={[{ key: 'Tab', action: 'Reach the dismiss button; hover or focus on a toast pauses its countdown' }]} aria={[{ name: 'role', value: 'status | alert', description: 'Per-item live region; assertive toasts announce as role=alert.' }, { name: 'role (stack)', value: 'group', description: 'The stack container — a named group (aria-label without a role is ignored on a generic div).' }, { name: 'aria-label (stack)', value: 'notifications', description: 'Names the stack group (adopted float plane or the fixed-corner fallback).' }, { name: 'aria-label (dismiss)', value: 'dismiss notification', description: 'Names each toast’s × button.' }, { name: 'role (expanded)', value: 'dialog', description: 'The expandable reading posture (toast-v2) — popover=auto, labeled by the toast title; light dismiss collapses back to the card (the toast survives).' }, { name: 'aria-hidden', value: 'true', description: 'The +N queued chip and the countdown gauge are decoration — a queued toast announces when it renders, not before.' }]} /></SectionCard></div>
  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="toast" />
  </div>
</div>
