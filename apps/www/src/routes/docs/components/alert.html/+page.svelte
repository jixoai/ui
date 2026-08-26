<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Toc from '$lib/ui/toc/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertSource from '$lib/ui/alert/alert.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Alert from '@ui/alert.svelte';
${close}

<Alert title="Deployed">
  Build 4f2a shipped to production — 0 checks failed.
</Alert>

<Alert variant="tonal" title="Scheduled maintenance">
  The registry pauses syncs Sunday 02:00–02:30 UTC.
</Alert>

<Alert variant="tonal" class="jx-hue-error" assertive={true} title="Build failed">
  Exit 1 — the bundle exceeded the size budget by 12 KB.
</Alert>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/alert/alert.svelte', content: alertSource },
    { name: 'src/lib/ui/alert-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Alert · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai alert: an inline notice block with live-region semantics as a prop — role=status by default, role=alert when assertive. The variant ladder is the surface (outline plain, tonal tinted); hue is injection through the global tokens — brand tint by default, --error for failed statuses."
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
      title="alert — semantics you choose, not a guess"
      summary="An inline notice block: 1px border, hard offset shadow, and the variant ladder as its surface — outline (transparent ground, neutral border) for the plain notice, tonal (12% tinted ground) for emphasis. Live-region behavior is a prop — role=status (polite) by default, role=alert (assertive) when the news is an error. Hue is injection, not a variant: the tonal slot defaults to the brand hue; failed statuses inject --error (a status, never the destructive action hue)."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=status | role=alert</span>
        <span class="pill">outline · tonal</span>
        <span class="pill">icon snippet</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="alert"
      description="The variant pair with both live-region roles: outline neutral, tonal in the brand tint, tonal with the error-status injection. The icon snippet composes inline-start of the title — bring your own glyph."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/alert/alert.svelte"
      files={canvasFiles}
      stage="fill"
    >
      <div class="flex w-full max-w-xl flex-col gap-4">
        <Alert title="Deployed">Build 4f2a shipped to production — 0 checks failed.</Alert>
        <Alert variant="tonal" title="Scheduled maintenance">
          The registry pauses syncs Sunday 02:00–02:30 UTC.
        </Alert>
        <Alert variant="tonal" class="jx-hue-error" assertive={true} title="Build failed">
          Exit 1 — the bundle exceeded the size budget by 12 KB.
        </Alert>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            <code>assertive</code> swaps role=status for role=alert — pair it with
            the error injection (<code class="jx-hue-error">jx-hue-error</code>)
            for failures, where the announcement should be immediate. The body is
            optional; title-only notices are first-class.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="alert-base" data-reveal="">
    <SectionCard
      family="alert-base"
      headerRegion="alert-base"
      eyebrow="W3C foundation"
      title="The live-region split"
      summary="role=status announces politely (when the reader is idle); role=alert interrupts immediately. Choosing is the author's semantic decision — hardcoding either would be the guess this component refuses to make. Not the modal one: that surface is alert-dialog, a later registry item."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Alert variants" summary="Two ladder variants and two live-region roles; title and body are each optional. Hue is injected, never a variant name.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4"><Alert title="outline — polite">role=status, transparent ground, --jx-outline border. The plain notice.</Alert></div>
      <div class="border border-border p-4"><Alert variant="tonal" title="tonal — the brand tint">12% tinted ground, 45% border, tonal ink; --jx-tonal defaults to the brand hue.</Alert></div>
      <div class="border border-border p-4"><Alert variant="tonal" class="jx-hue-error" assertive={true} title="error status — assertive">role=alert, immediate announcement; failed statuses inject --error — destructive is an action hue, not a status.</Alert></div>
      <div class="border border-border p-4"><Alert>Body-only and title-only notices are first-class — no heading required.</Alert></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Choose the role deliberately: status for expected news, alert for errors; choose the surface by prominence — outline neutral, tonal emphasis — and inject the hue the intent needs."><CodeBlock code={usage} lang="svelte" meta="Alert usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The banner is itself the live region — screen readers announce it when it appears; no focus is taken."><A11yTable keys={[{ key: '—', action: 'Not focusable — an inline live region, not a control' }]} aria={[{ name: 'role', value: 'status | alert', description: 'status announces politely (default); alert interrupts immediately (assertive).' }, { name: 'data-jx-alert', value: 'variant', description: 'Hook attribute carrying the ladder variant (outline | tonal) for styling.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Utility-authored paint — the banner rhythm is fixed literals, so density scopes leave it unchanged; the grammar tokens are the hue seam."><div class="flex flex-col gap-5"><DensityDemo><Alert title="density sample">The 1px border, shadow-2xs, and 13px rhythm are fixed across scopes.</Alert></DensityDemo><TokenTable tokens={[{ name: '--jx-tonal', default: 'var(--primary)', source: 'color', description: 'Tonal ground/border/title hue source — inject per intent (error, success…).' }, { name: '--jx-outline', default: 'var(--border)', source: 'color', description: 'Outline border source.' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }, { name: 'border', default: '1px', source: 'structural' }, { name: 'shadow', default: 'shadow-2xs (hard offset)', source: 'structural' }, { name: 'title rhythm', default: '13px, fixed utility', source: 'structural' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Six props; variant sets the ladder surface (ground, border, title ink), assertive swaps the live-region role."><PropsTable props={[{ name: 'variant', type: "'outline' | 'tonal'", default: "'outline'", description: 'Ladder prominence: outline paints a transparent ground with the --jx-outline border; tonal paints the 12% tinted ground with the tonal title ink. Hue comes from token injection, not variant names.' }, { name: 'assertive', type: 'boolean', default: 'false', description: 'true → role=alert (immediate); false → role=status (polite).' }, { name: 'title', type: 'string', default: '—', description: 'One-line heading; omitted renders a bare body block.' }, { name: 'icon', type: 'Snippet', default: '—', description: 'Rendered inline-start of the title — bring your own glyph.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Body copy; omit for a title-only notice.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the banner element; intent utilities like jx-hue-error (or arbitrary token injections outside the closed set) land here.' }]} /></SectionCard></div>
</div>
