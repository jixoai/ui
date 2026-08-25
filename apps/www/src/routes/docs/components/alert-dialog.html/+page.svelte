<!--
  Docs page for the alert-dialog family (2026-08-25,
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
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import AlertDialog, {
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogActions,
    AlertDialogAction,
    AlertDialogCancel,
  } from '$lib/ui/alert-dialog/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertDialogSourceRaw from '$lib/ui/alert-dialog/alert-dialog.svelte?raw';
  import alertDialogContentRaw from '$lib/ui/alert-dialog/alert-dialog-content.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'alert-dialog');
  if (!entry) {
    throw new Error('catalog miss: "alert-dialog" has no registry meta — fix registry.json');
  }

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { deleted: false };
  let open = $state(false);
  let deleted = $state(canvasInitial.deleted);
  function resetCanvas(): void {
    deleted = canvasInitial.deleted;
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import AlertDialog, {
    AlertDialogTrigger, AlertDialogContent, AlertDialogTitle,
    AlertDialogDescription, AlertDialogActions, AlertDialogAction,
    AlertDialogCancel,
  } from '@ui/alert-dialog/index';
${close}

<AlertDialog bind:open onconfirm={() => (deleted = true)}>
  <AlertDialogTrigger>delete pipeline…</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete the pipeline?</AlertDialogTitle>
    <AlertDialogDescription>
      This removes 12 checks and their history. There is no undo.
    </AlertDialogDescription>
    <AlertDialogActions>
      <AlertDialogCancel>cancel</AlertDialogCancel>
      <AlertDialogAction>delete pipeline</AlertDialogAction>
    </AlertDialogActions>
  </AlertDialogContent>
</AlertDialog>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert-dialog/alert-dialog.svelte', content: alertDialogSourceRaw },
    { name: 'registry/files/ui/alert-dialog/alert-dialog-content.svelte', content: alertDialogContentRaw },
    { name: 'src/lib/ui/alert-dialog-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Alert dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert-dialog family: the destructive-decision surface composed — Root carries bind:open + the onconfirm seam, Content is the native showModal() dialog (focus trap, Escape=cancel, scroll lock), Title/Description wire the ARIA, Actions/Action/Cancel close the decision."
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
      title="alert dialog — the deliberate destructive"
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
      title="alert dialog"
      stage="center"
      description="Open it: focus lands on Cancel (Tab straight to Delete). Escape cancels through the native path. Confirm runs the root's onconfirm seam, then closes through the shared fade; the platform restores focus to the invoker."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/alert-dialog/alert-dialog.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'deleted', value: deleted ? 'yes' : 'no' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <AlertDialog bind:open onconfirm={() => (deleted = true)}>
          <AlertDialogTrigger class="jx-press appearance-none px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]">
            delete pipeline…
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>delete the pipeline?</AlertDialogTitle>
            <AlertDialogDescription>
              this removes 12 checks and their history. there is no undo.
            </AlertDialogDescription>
            <p class="text-[12.5px]">the checks being removed: lint, typecheck, size-budget, a11y-audit…</p>
            <AlertDialogActions>
              <AlertDialogCancel>cancel</AlertDialogCancel>
              <AlertDialogAction>delete pipeline</AlertDialogAction>
            </AlertDialogActions>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            title and description are PARTS now — the ARIA wiring is Content's job (deterministic
            derived ids), the words are yours where they render. Action's
            <code class="text-accent">tone="primary"</code> flips the loud path off for positive
            confirmations (e.g. 'save changes').
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="alert-dialog-parts" data-reveal="">
    <SectionCard
      family="alert-dialog-parts"
      headerRegion="alert-dialog-parts"
      eyebrow="composition"
      title="The parts and the divergences"
      summary="shadcn-shaped mapping on the native <dialog> law: Root is the state context only (bind:open + onconfirm); Trigger opens; Content carries the showModal machinery verbatim (focus trap, Escape=cancel, scroll lock, the 120ms fade); free children are the body; Actions is the bordered action row; Action confirms through the seam, Cancel is the safe default Content focuses on open."
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
