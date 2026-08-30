<!--
  Docs page for popconfirm (2026-08-25, composition-first-apis).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. One ComponentCanvas: the default panel (title/description +
     confirm/cancel strings).
  3. Override section: the content/actions snippets replacing the
     title/description area and the action row.
  4. Usage CodeBlock shared with the canvas drawer.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Popconfirm from '$lib/ui/popconfirm/popconfirm.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import popconfirmSource from '$lib/ui/popconfirm/popconfirm.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'popconfirm');
  if (!entry) {
    throw new Error('catalog miss: "popconfirm" has no registry meta — fix registry.json');
  }

  let outcome = $state('');

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { outcome: '' };
  function resetCanvas(): void {
    outcome = canvasInitial.outcome;
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Popconfirm from '@ui/popconfirm.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<!-- default panel: title/description strings + confirm/cancel -->
<Popconfirm
  title="Delete this row?"
  description="The history goes with it."
  confirmLabel="Delete"
  onconfirm={del}
  oncancel={() => console.log('kept')}
>
  <PressButton>delete row</PressButton>
</Popconfirm>

<!-- opened panel: content/actions snippets replace the areas -->
<Popconfirm title="Merge this branch?" onconfirm={merge}>
  {#snippet content()}
    <p class="font-nav text-xs uppercase">merge this branch?</p>
    <p class="text-[12.5px] text-muted-foreground">3 commits, all checks green.</p>
  {/snippet}
  {#snippet actions()}
    <div class="flex justify-end gap-2">
      <button type="button" popovertarget>keep</button>
      <button type="button" onclick={merge}>merge</button>
    </div>
  {/snippet}
  <PressButton>merge branch</PressButton>
</Popconfirm>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/popconfirm/popconfirm.svelte', content: popconfirmSource },
    { name: 'src/lib/ui/popconfirm-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Popconfirm · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popconfirm: the LIGHT confirm bubble — children stay the trigger, the panel's content and action areas open to content/actions snippets with the current rendering as defaults. Light dismiss IS the cancel path; not an alertdialog."
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
      eyebrow="registry:ui · General"
      title="popconfirm — the light sure-bubble"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=dialog</span>
        <span class="pill">light dismiss = cancel</span>
        <span class="pill">focus → Cancel</span>
        <span class="pill">content / actions snippets</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="popconfirm"
      stage="center"
      description="The default panel: open it — focus lands on Cancel. Confirm runs the action; clicking outside or pressing Escape runs the cancel path instead. Either way the outcome surfaces below."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/popconfirm/popconfirm.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'outcome', value: outcome || '—' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <Popconfirm
          title="Delete this row?"
          description="The check history goes with it."
          confirmLabel="Delete"
          onconfirm={() => (outcome = 'deleted')}
          oncancel={() => (outcome = 'kept')}
        >
          <PressButton>delete row</PressButton>
        </Popconfirm>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the wrapper auto-wires the first button inside as the declarative popovertarget
            trigger and mirrors aria-expanded/aria-controls. confirmTone='primary' flips the loud
            path for positive confirmations. A throwing onconfirm still closes (try/finally).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="popconfirm-override" data-reveal="">
    <SectionCard
      family="popconfirm-override"
      headerRegion="popconfirm-override"
      eyebrow="composition"
      title="Opening the panel: content / actions"
      summary="The milder ruling (a compact confirm popover, not a page dialog — local-open principle): the trigger stays children, and the panel's two areas open to snippets. content replaces the title/description block (you own the semantics — wire your own aria ids); actions replaces the confirm/cancel row (close through the platform: a popovertarget button, light dismiss, or your own handler). The current rendering stays the default for both."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-4">
          <Popconfirm title="Merge this branch?" onconfirm={() => (outcome = 'merged')}>
            {#snippet content()}
              <p class="font-nav text-xs tracking-[0.08em] uppercase text-foreground">merge this branch?</p>
              <p class="text-[0.8125rem] leading-[1.5] text-muted-foreground">3 commits, all checks green — fast-forward is impossible.</p>
            {/snippet}
            {#snippet actions()}
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  popovertarget
                  data-jx-pc-btn=""
                  class="appearance-none px-3 py-[5px] border border-border bg-background text-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase cursor-pointer shadow-2xs"
                >
                  keep
                </button>
                <button
                  type="button"
                  data-jx-pc-btn=""
                  class="appearance-none px-3 py-[5px] border border-border bg-background text-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase cursor-pointer shadow-2xs"
                  onclick={() => (outcome = 'merged')}
                >
                  merge
                </button>
              </div>
            {/snippet}
            <PressButton>merge branch</PressButton>
          </Popconfirm>
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Confirmation variants" summary="Use destructive confirmation by default, or switch the confirm tone for positive actions."><div class="grid gap-4 sm:grid-cols-2"><div class="border border-border p-4"><Popconfirm title="Delete this row?"><PressButton>destructive</PressButton></Popconfirm></div><div class="border border-border p-4"><Popconfirm title="Merge this branch?" confirmTone="primary"><PressButton>primary</PressButton></Popconfirm></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The trigger stays in children; content and actions snippets are optional overrides."><CodeBlock code={usage} lang="svelte" meta="Popconfirm usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A compact dialog-like popover puts the safe cancel action first and treats every light dismissal as cancel."><A11yTable keys={[{ key: 'Tab', action: 'Move between Cancel and Confirm.' }, { key: 'Escape', action: 'Cancel and close the popover.' }]} aria={[{ name: 'role', value: 'dialog', description: 'Exposes the confirmation surface.' }, { name: 'aria-labelledby', value: '{id}-title', description: 'Names the default title content.' }, { name: 'aria-describedby', value: '{id}-desc', description: 'References the optional description.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Confirmation controls use the shared density rhythm plus a small panel gap."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><Popconfirm title="Confirm?" onconfirm={() => {}}><PressButton>action</PressButton></Popconfirm></DensityDemo><TokenTable tokens={[{ name: '--jx-pc-gap', default: '8px', source: 'component' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Popconfirm props separate the trigger, default copy, callbacks, placement, and snippet escape hatches."><PropsTable props={[{ name: 'title', type: 'string', required: true, description: 'Question shown by the default content.' }, { name: 'description', type: 'string', description: 'Supporting line in the default content.' }, { name: 'onconfirm', type: '() => void', description: 'Runs on confirm before close.' }, { name: 'oncancel', type: '() => void', description: 'Runs on any non-confirm dismissal.' }, { name: 'confirmTone', type: "'destructive' | 'primary'", default: "'destructive'", description: 'Confirm button paint.' }, { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Panel anchor placement.' }, { name: 'content', type: 'Snippet', description: 'Replaces the title and description area.' }, { name: 'actions', type: 'Snippet', description: 'Replaces the confirm and cancel row.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /></SectionCard></div>
</div>
