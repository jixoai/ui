<!--
  Docs page for the system-dialog family (2026-08-25,
  composition-first-apis).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One ComponentCanvas: the full family composed — Trigger opens,
     Content carries the native dialog machinery, Title/Description
     wire the ARIA, Actions/Action/Cancel close the decision.
  3. Composition section: the parts + the recorded divergences.
  4. Usage CodeBlock shared with the canvas drawer.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { alert, confirm, prompt } from '$lib/ui/system-dialog/index';
  import SystemDialog, {
    SystemDialogTrigger,
    SystemDialogContent,
    SystemDialogTitle,
    SystemDialogDescription,
    SystemDialogActions,
    SystemDialogAction,
    SystemDialogCancel,
  } from '$lib/ui/system-dialog/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertDialogSourceRaw from '$lib/ui/system-dialog/system-dialog.svelte?raw';
  import alertDialogContentRaw from '$lib/ui/system-dialog/system-dialog-content.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'system-dialog');
  if (!entry) {
    throw new Error('catalog miss: "system-dialog" has no registry meta — fix registry.json');
  }

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { deleted: false };
  let open = $state(false);
  let deleted = $state(canvasInitial.deleted);
  // the system trio's live readout (the section demo below)
  let systemResult = $state<string>('— not asked yet —');
  async function askConfirm(): Promise<void> {
    const ok = await confirm({ title: 'rotate the key?', description: 'minting a new key revokes the current one after 24 hours.' });
    systemResult = ok ? 'confirm → true (rotated)' : 'confirm → false (kept)';
  }
  async function askPrompt(): Promise<void> {
    const name = await prompt({ title: 'rename the workspace', inputLabel: 'name', initialValue: 'jixoai-labs/ui' });
    systemResult = name === null ? 'prompt → null (cancelled)' : `prompt → ${JSON.stringify(name)}`;
  }
  async function askAlert(): Promise<void> {
    await alert({ title: 'the key rotated', description: 'the old key stays valid for 24 more hours.' });
    systemResult = 'alert → acknowledged';
  }
  function resetCanvas(): void {
    deleted = canvasInitial.deleted;
  }

  const close = '</' + 'script>';

  const systemUsage = `import { alert, confirm, prompt } from '@ui/system-dialog/index';

await alert('the key rotated');
// → void (a single affirmative action)

const ok = await confirm('rotate the key?');
// → boolean (the action → true; Cancel/Escape → false)

const name = await prompt({ title: 'rename', inputLabel: 'name' });
// → string | null (Enter submits, Escape cancels → null)`;

  const usage = `<script lang="ts">
  import SystemDialog, {
    SystemDialogTrigger, SystemDialogContent, SystemDialogTitle,
    SystemDialogDescription, SystemDialogActions, SystemDialogAction,
    SystemDialogCancel,
  } from '@ui/system-dialog/index';
${close}

<SystemDialog bind:open onconfirm={() => (deleted = true)}>
  <SystemDialogTrigger>delete pipeline…</SystemDialogTrigger>
  <SystemDialogContent>
    <SystemDialogTitle>Delete the pipeline?</SystemDialogTitle>
    <SystemDialogDescription>
      This removes 12 checks and their history. There is no undo.
    </SystemDialogDescription>
    <SystemDialogActions>
      <SystemDialogCancel>cancel</SystemDialogCancel>
      <SystemDialogAction>delete pipeline</SystemDialogAction>
    </SystemDialogActions>
  </SystemDialogContent>
</SystemDialog>

<!-- positive confirmation: the tonal action reads brand-tinted;
     a solid one injects the brand pair on fill instead:
     <SystemDialogAction variant="fill"
       class="[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]"> -->
<SystemDialog>
  <SystemDialogTrigger>rename pipeline…</SystemDialogTrigger>
  <SystemDialogContent>
    <SystemDialogTitle>Rename the pipeline?</SystemDialogTitle>
    <SystemDialogDescription>
      The new slug applies to every check's history.
    </SystemDialogDescription>
    <SystemDialogActions>
      <SystemDialogCancel>cancel</SystemDialogCancel>
      <SystemDialogAction variant="tonal">save changes</SystemDialogAction>
    </SystemDialogActions>
  </SystemDialogContent>
</SystemDialog>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/system-dialog/system-dialog.svelte', content: alertDialogSourceRaw },
    { name: 'registry/files/ui/system-dialog/system-dialog-content.svelte', content: alertDialogContentRaw },
    { name: 'src/lib/ui/system-dialog-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>System dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai system-dialog family: the destructive-decision surface composed — Root carries bind:open + the onconfirm seam, Content is a popover=manual panel that rises beside its trigger (CSS Anchor Positioning, flips at the viewport edge, no light dismiss; Escape=cancel), Title/Description wire the ARIA, Actions/Action/Cancel close the decision."
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
      title="system dialog — the deliberate destructive"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=alertdialog</span>
        <span class="pill">focus → cancel</span>
        <span class="pill">destructive by default</span>
        <span class="pill">7 composed parts</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="system dialog"
      stage="center"
      description="Open it: the alert rises BESIDE the button that asked (near a viewport edge the try-fallbacks flip it to the other side). Focus lands on Cancel (Tab straight to Delete). Escape cancels through the component's own handler — manual popover, no light dismiss on a destructive question. Confirm runs the root's onconfirm seam; hiding the popover restores focus to the invoker."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/system-dialog/system-dialog.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'deleted', value: deleted ? 'yes' : 'no' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <SystemDialog bind:open onconfirm={() => (deleted = true)}>
          <SystemDialogTrigger class="px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer">
            delete pipeline…
          </SystemDialogTrigger>
          <SystemDialogContent>
            <SystemDialogTitle>delete the pipeline?</SystemDialogTitle>
            <SystemDialogDescription>
              this removes 12 checks and their history. there is no undo.
            </SystemDialogDescription>
            <p class="text-[12.5px]">the checks being removed: lint, typecheck, size-budget, a11y-audit…</p>
            <SystemDialogActions>
              <SystemDialogCancel>cancel</SystemDialogCancel>
              <SystemDialogAction>delete pipeline</SystemDialogAction>
            </SystemDialogActions>
          </SystemDialogContent>
        </SystemDialog>
        <SystemDialog>
          <SystemDialogTrigger class="px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer">
            rename pipeline…
          </SystemDialogTrigger>
          <SystemDialogContent>
            <SystemDialogTitle>Rename the pipeline?</SystemDialogTitle>
            <SystemDialogDescription>
              The new slug applies to every check's history — references update with it.
            </SystemDialogDescription>
            <SystemDialogActions>
              <SystemDialogCancel>cancel</SystemDialogCancel>
              <SystemDialogAction variant="tonal">save changes</SystemDialogAction>
            </SystemDialogActions>
          </SystemDialogContent>
        </SystemDialog>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            title and description are PARTS now — the ARIA wiring is Content's job (deterministic
            derived ids), the words are yours where they render. Action paints through the variant
            grammar: bare is <code class="text-accent">fill</code> with the destructive pair injected
            (the loud path is opt-out); <code class="text-accent">variant="tonal"</code> reads as a
            brand-tinted positive confirm, or inject the brand pair on fill for a solid one.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="system-dialog-parts" data-reveal="">
    <SectionCard
      family="system-dialog-parts"
      headerRegion="system-dialog-parts"
      eyebrow="composition"
      title="The parts and the divergences"
      summary="shadcn-shaped mapping on the popover base (2026-09-01 rebuild): Root is the state context only (bind:open + onconfirm); Trigger opens AND carries the anchor-name the panel resolves against; Content is a popover=manual panel that rises beside the trigger (CSS Anchor Positioning; try-fallbacks flip at the viewport edge; anchors-visible hides it if the trigger scrolls away; manual = no light dismiss, Escape is the component's cancel, the 120ms fade rides the motion kernel); free children are the body; Actions is the bordered action row; Action confirms through the seam, Cancel is the safe default Content focuses on open. No focus trap, no scroll lock — a question at its button, not a mode takeover."
    >
      <div class="flex flex-col gap-5">
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>recorded divergence: no Overlay/Portal parts — the native dialog element IS the
              overlay and the top layer</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>recorded divergence: no Header part — header chrome is caller markup; Actions ≈
              shadcn's Footer, renamed for what it holds</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>Title/Description render the ids Content's aria-labelledby/aria-describedby
              point at — a Content without a Title is caller error (an alert without words is not
              an alert)</span></li>
        </ul>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="System dialog variants" summary="The surface paint and the confirm tone are the two variant axes; everything else is the fixed alertdialog contract.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Content variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">variant="auto"</code> (default) picks acrylic unless the environment asks for reduced transparency; <code class="text-accent">"solid"</code> and <code class="text-accent">"acrylic"</code> force one.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Action variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">variant="fill"</code> (default) ships with the destructive pair injected — the loud path is opt-OUT; <code class="text-accent">variant="tonal"</code> is the brand-tinted positive confirm, or inject the brand pair (<code class="text-accent">[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]</code>) on fill for a solid one; <code class="text-accent">variant="outline"</code> stays quiet.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Composed family</p>
        <p class="text-[13px] leading-6">Seven parts: Root (state context), Trigger, Content (the native dialog), Title, Description, Actions, Action, Cancel — each a real element, no slots.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="system" data-reveal=""><SectionCard family="system" headerRegion="system" eyebrow="system" title="System dialogs — alert · confirm · prompt" summary="The imperative trio carries window.alert / window.confirm / window.prompt on the family's one engine, with TWO deliberate postures: the composed family above ANCHORS beside its trigger (the question rises at the button that asked — near the page top when the trigger lives there), while the trio always rises at the exact VIEWPORT CENTER (pose=center: a system question has no trigger to anchor beside; the UA popover centering owns the geometry). The carved split strip centers its labels and never wraps while space suffices. Every call resolves exactly once — an action resolves its value, any close without one resolves the cancel value."><div class="flex flex-col gap-5"><div class="flex flex-wrap gap-2.5"><PressButton onclick={askAlert}>alert()</PressButton><PressButton onclick={askConfirm}>confirm()</PressButton><PressButton onclick={askPrompt}>prompt()</PressButton></div><p class="font-mono text-[12.5px] text-muted-foreground" data-testid="system-result">{systemResult}</p><CodeBlock code={systemUsage} lang="ts" meta="system trio" /></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Root owns bind:open + the onconfirm seam; Title and Description are parts — an alert without words is not an alert."><CodeBlock code={usage} lang="svelte" meta="SystemDialog usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="APG alertdialog law on the popover base: focus lands on Cancel on open, Escape cancels through the component-owned handler (keydown lives on the panel — Escape cancels while focus is inside it; a user who tabbed back to the page has left the question), hiding the popover restores focus to the invoker (a removed invoker deliberately leaves focus on the body — focus is never steered into dead markup); Tab is free — the anchored alert is non-modal by the popover-engine ruling."><A11yTable keys={[{ key: 'Escape', action: 'Cancels — SCOPED to the panel: the keydown handler lives on the popover itself, so it fires while focus is inside the panel; the component-owned keydown is prevented and runs through the state close (manual popover — no light dismiss)' }, { key: 'Tab', action: 'Free — the anchored alert is non-modal (popover base: no focus trap); hiding the popover restores focus to the invoker, or to the body if the invoker was removed while open' }, { key: 'Enter / Space', action: 'Activates the focused button — Cancel (focused on open) or Action' }]} aria={[{ name: 'role', value: 'alertdialog', description: 'On Content (the popover panel div).' }, { name: 'aria-labelledby', value: '{uid}-title', description: 'Points at the deterministic id Title renders; derived from the root uid.' }, { name: 'aria-describedby', value: '{uid}-desc', description: 'Points at the deterministic id Description renders.' }, { name: 'aria-haspopup', value: 'dialog', description: 'On the Trigger button.' }, { name: 'aria-expanded', value: 'true/false', description: 'On the Trigger; mirrors the open state.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The surface inherits density through the DOM tree; motion runs on one animated custom property."><div class="flex flex-col gap-5"><DensityDemo><SystemDialog><SystemDialogTrigger class="px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer">delete pipeline…</SystemDialogTrigger><SystemDialogContent><SystemDialogTitle>delete the pipeline?</SystemDialogTitle><SystemDialogDescription>density scopes resize the trigger rhythm; the surface inherits scope from its DOM position.</SystemDialogDescription><SystemDialogActions><SystemDialogCancel>cancel</SystemDialogCancel><SystemDialogAction>delete pipeline</SystemDialogAction></SystemDialogActions></SystemDialogContent></SystemDialog></DensityDemo><TokenTable tokens={[{ name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'The surface-motion progress driving open/close.' }, { name: '--scrim', default: 'semi-transparent black/white', source: 'color', description: '::backdrop scrim — never a brand tint.' }, { name: '--jx-surface-in-x/y', default: '0px / 6px', source: 'component', description: 'Surface entry offset (translate-in).' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: 'surface width', default: 'min(28rem, 100vw − 2rem)', source: 'structural' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The family's parts, each with its own props; all button/element parts forward their native HTML attributes."><div class="flex flex-col gap-6"><PropsTable title="SystemDialog (root)" props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Controlled open state (bind:open); the root renders no element.', bindable: true }, { name: 'onconfirm', type: '() => void', default: '—', description: 'The confirm seam: runs on SystemDialogAction, then the dialog closes.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The family parts.' }]} /><PropsTable title="SystemDialogTrigger" props={[{ name: 'child', type: 'Snippet<[{ props }]>', default: '—', description: 'Replacement-element escape: spread {...props} on your own button.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Trigger label; spreads HTMLButtonAttributes.' }]} /><PropsTable title="SystemDialogContent" props={[{ name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint; auto falls back to solid under reduced transparency. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }, { name: 'pose', type: "'anchored' | 'center'", default: "'anchored'", description: 'The panel’s posture: anchored rides CSS Anchor Positioning against the trigger; center (the system trio) drops the anchor chain and lets the UA popover centering own the panel — the window.confirm posture.' }, { name: 'focusLanding', type: "'cancel' | 'none'", default: "'cancel'", description: 'Where focus lands on open: cancel (the APG safe-landing law, falling back to the action when no cancel exists) or none (the caller owns the landing — the prompt form focuses its input).' }, { name: 'children', type: 'Snippet', default: '—', description: 'Title, Description, free body, and the Actions row; spreads HTMLAttributes (a popover panel div).' }]} /><PropsTable title="SystemDialogAction / Cancel / Title / Description / Actions" props={[{ name: 'variant', type: "'fill' | 'tonal' | 'outline'", default: "'fill' · Own default, not ambient", description: 'Action only: the confirm paint on the ladder — fill ships with the destructive pair injected (the opt-out loud path); flip the injection to the brand pair or switch to tonal for positive confirmations. Own default, not ambient (the action ladder is outside the paint zone’s frozen availability table).' }, { name: 'children', type: 'Snippet', default: '—', description: 'Shared by all five parts; each spreads its native element attributes.' }, { name: 'id (Title/Description)', type: 'string', default: '{uid}-title / -desc', description: 'Deterministic derived ids Content’s aria wiring points at.' }]} /></div></SectionCard></div>
</div>
