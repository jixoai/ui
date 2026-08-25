<script lang="ts">
  import AlertDialog from '$lib/ui/alert-dialog/alert-dialog.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertDialogSource from '$lib/ui/alert-dialog/alert-dialog.svelte?raw';

  const close = '</' + 'script>';

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { deleted: false };
  let open = $state(false);
  let deleted = $state(canvasInitial.deleted);
  function resetCanvas(): void {
    deleted = canvasInitial.deleted;
  }

  // ToC outline: pairs with the section ids below, in page order.

  const usage = `<script lang="ts">
  import AlertDialog from '@ui/alert-dialog.svelte';
${close}

<PressButton onclick={() => (open = true)}>Delete pipeline…</PressButton>
<AlertDialog
  bind:open
  title="Delete the pipeline?"
  description="This removes 12 checks and their history. There is no undo."
  confirmLabel="Delete pipeline"
  onconfirm={() => (deleted = true)}
/>`;

  const canvasUsage = `<AlertDialog bind:open title="Delete the pipeline?"
  description="This removes 12 checks and their history. There is no undo."
  confirmLabel="Delete pipeline" onconfirm={del} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert-dialog.svelte', content: alertDialogSource },
    { name: 'src/lib/ui/alert-dialog-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Alert dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert dialog: the destructive-decision surface on the dialog laws — role=alertdialog with required labelled title and described body, focus on the safe action, destructive confirm paint by default."
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
      summary="dialog.svelte's laws (showModal, Escape, generation-token close) plus the alertdialog contract: role=alertdialog with REQUIRED aria-labelledby/describedby — an alert without words is not an alert. Focus lands on CANCEL on open: the destructive path is a deliberate move, never the landing spot. Confirm paint is destructive by default — the loud path is opt-OUT."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=alertdialog</span>
        <span class="pill">focus → cancel</span>
        <span class="pill">destructive by default</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="alert dialog"
      stage="center"
      description="Open it: focus lands on Cancel (Tab straight to Delete). Escape cancels through the native path; the × shares it. Confirm runs your callback, then closes through the same fade."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/alert-dialog.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'deleted', value: deleted ? 'yes' : 'no' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <PressButton onclick={() => (open = true)}>Delete pipeline…</PressButton>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            title and description are REQUIRED props — the ARIA wiring is the component's job, the
            words are yours. confirmTone='primary' flips the loud path off for positive
            confirmations (e.g. 'Save changes').
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <AlertDialog
    bind:open
    title="Delete the pipeline?"
    description="This removes 12 checks and their history. There is no undo."
    confirmLabel="Delete pipeline"
    onconfirm={() => (deleted = true)}
  >
    <p class="text-[12.5px]">The checks being removed: lint, typecheck, size-budget, a11y-audit…</p>
  </AlertDialog>

  <div id="alert-dialog-base" data-reveal="">
    <SectionCard family="alert-dialog-base" headerRegion="alert-dialog-base" eyebrow="NativeHTML 基座" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
