<script lang="ts">
  import Alert from '$lib/ui/alert.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertSource from '$lib/ui/alert.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Alert from '@ui/alert.svelte';
${close}

<Alert title="Deployed">
  Build 4f2a shipped to production — 0 checks failed.
</Alert>

<Alert tone="primary" title="Scheduled maintenance">
  The registry pauses syncs Sunday 02:00–02:30 UTC.
</Alert>

<Alert tone="destructive" assertive={true} title="Build failed">
  Exit 1 — the bundle exceeded the size budget by 12 KB.
</Alert>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert.svelte', content: alertSource },
    { name: 'src/lib/ui/alert-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Alert · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert: an inline notice block with live-region semantics as a prop — role=status by default, role=alert when assertive. Tones inside the one-brand-hue law: neutral, info (the brand voice), destructive."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="alert — semantics you choose, not a guess"
      summary="An inline notice block: 1px border, hard offset shadow-xs, tone accent on the border and title. Live-region behavior is a prop — role=status (polite) by default, role=alert (assertive) when the news is an error. Tones stay inside the one-brand-hue law: there is no blue info in this language; the brand hue IS the emphasis voice."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=status | role=alert</span>
        <span class="pill">default · primary · destructive</span>
        <span class="pill">icon snippet</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="alert"
      description="Three tones and both live-region roles. The icon snippet composes inline-start of the title — bring your own glyph."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/alert.svelte"
      files={canvasFiles}
    >
      <div class="flex w-full max-w-xl flex-col gap-4">
        <Alert title="Deployed">Build 4f2a shipped to production — 0 checks failed.</Alert>
        <Alert tone="primary" title="Scheduled maintenance">
          The registry pauses syncs Sunday 02:00–02:30 UTC.
        </Alert>
        <Alert tone="destructive" assertive={true} title="Build failed">
          Exit 1 — the bundle exceeded the size budget by 12 KB.
        </Alert>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          <code class="text-accent">assertive</code> swaps role=status for role=alert — pair it with
          the destructive tone for errors, where the announcement should be immediate. The body is
          optional; title-only notices are first-class.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      headerRegion="alert-base"
      eyebrow="NativeHTML 基座"
      title="The live-region split"
      summary="role=status announces politely (when the reader is idle); role=alert interrupts immediately. Choosing is the author's semantic decision — hardcoding either would be the guess this component refuses to make. Not the modal one: that surface is alert-dialog, a later registry item."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>
