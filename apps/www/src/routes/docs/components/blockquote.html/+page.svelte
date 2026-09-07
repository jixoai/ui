<!--
  Docs page for blockquote (markdown-coverage-components §1.1, Lane D).
  The reading-content quote/admonition surface on the alert-shaped
  two-rung ladder; the frozen-availability chain's newest row (outline/
  tonal, own outline) is demonstrated here and cited in the ladder
  section prose.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Blockquote from '$lib/ui/blockquote/blockquote.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import blockquoteSource from '$lib/ui/blockquote/blockquote.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Blockquote from '@ui/blockquote';
${close}

<!-- outline (own): the classic left-rule quote -->
<Blockquote>
  Simplicity is a great virtue but it requires hard work to achieve it.
</Blockquote>

<!-- tonal: the callout/Notion posture; hue rides injection -->
<Blockquote variant="tonal" class="jx-hue-info" label="Note">
  The streaming prefix never remounts while chunks arrive.
</Blockquote>

<!-- attribution lands as footer > cite (the MDN posture) -->
<Blockquote cite="Edsger W. Dijkstra">
  The question of whether machines can think is about as relevant as
  the question of whether submarines can swim.
</Blockquote>`;

  const iconUsage = `<Blockquote variant="tonal" class="jx-hue-warning" label="Warning" icon={warningGlyph}>
  The migration rewrites column names in place.
</Blockquote>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Blockquote · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai blockquote: the reading-content quote/admonition surface on the alert-shaped two-rung ladder — outline (own) the classic left-rule quote with muted body, tonal the alert recipe verbatim for the callout posture. Availability is frozen at two rungs: quote readability excludes fill and ghost (ghost is interactive-chrome vocabulary a static quote misuses). label, icon and cite compose over the rung; hue rides injection; the markdown map's GitHub alerts land here."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="blockquote — the quote, on the banner's ladder"
        summary="The semantic body IS the native <blockquote>: cite renders the MDN attribution posture (footer > cite after the body), never an element swap. One surface, two postures — outline (own default), transparent ground with a 1px left rule and muted body, the classic GitHub/Tailwind quote; tonal, the alert recipe verbatim (12% tinted ground, 45% border, rounded box), the callout/Notion posture. Availability is FROZEN at two rungs: quote readability excludes fill AND ghost — ghost is interactive-chrome vocabulary (rest-transparent, hover-tonal) which a static quote misuses; the borderless manuscript indent is a future structural axis, never a paint rung. The root stamps no font-size — the ambient scale flows by inheritance, and the markdown default map mounts it with the box-owning block escape."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;blockquote&gt;</span>
          <span class="pill">outline · tonal (frozen)</span>
          <span class="pill">label / icon / cite</span>
          <span class="pill">GitHub alerts land here</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="blockquote" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Import the component, choose the posture by prominence — outline for the plain quote, tonal for the admonition — and compose label, icon and cite over whichever rung you land on. Hue is injection, never a variant name."
      >
        <CodeBlock code={usage} lang="svelte" meta="Blockquote usage" />
      </SectionCard>
    </div>

    <div id="rungs" data-region="blockquote-rungs" data-family="blockquote-rungs" data-reveal="">
      <ComponentCanvas
        title="blockquote"
        description="The two frozen rungs side by side, the hue injections the admonition posture rides, and the label + cite composition. outline keeps the muted body (the manuscript posture); tonal tints both label and body like the alert rows."
        sourceUrl={registrySourceUrl('blockquote')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="flex w-full max-w-xl flex-col gap-4">
          <div class="grid gap-4 min-[640px]:grid-cols-2">
            <Blockquote>
              outline (own) — transparent ground, 1px left rule, muted body: the classic quote.
            </Blockquote>
            <Blockquote variant="tonal">
              tonal — the alert recipe verbatim: 12% tinted ground, 45% border, rounded box.
            </Blockquote>
          </div>
          <div class="grid gap-4 min-[640px]:grid-cols-2">
            <Blockquote variant="tonal" class="jx-hue-info" label="Note">
              The streaming prefix never remounts while chunks arrive.
            </Blockquote>
            <Blockquote variant="tonal" class="jx-hue-warning" label="Warning">
              The migration rewrites column names in place.
            </Blockquote>
          </div>
          <Blockquote label="Edsger W. Dijkstra" cite="EWD 648, 1978">
            The purpose of abstracting is not to be vague, but to create a new semantic level in
            which one can be absolutely precise.
          </Blockquote>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              Availability is frozen at <code>outline | tonal</code> — the alert-shaped row. fill
              buries long-form copy; ghost is interactive-chrome vocabulary a static quote misuses.
              Hue rides the <code>jx-hue-*</code> intent utilities on <code>class</code> (the tonal
              rung consumes them); <code>label</code> renders the alert title-row form and
              <code>cite</code> lands as <code>footer &gt; cite</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="composition" data-region="blockquote-composition" data-family="blockquote-composition" data-reveal="">
      <SectionCard
        family="composition"
        headerRegion="composition"
        eyebrow="demo"
        title="The icon lane — bring your own glyph"
        summary="icon is a snippet rendered inline-start of the label, exactly the alert precedent: the component ships no glyph vocabulary, so lucide marks, inline svgs and plain text all land the same way. The label row is the surface's one fixed chrome size (0.8125rem nav caps); the body inherits the ambient scale."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={iconUsage} lang="svelte" meta="the icon snippet" />
          <div class="max-w-xl">
            {#snippet warningGlyph()}<span class="font-mono" aria-hidden="true">▲</span>{/snippet}
            <Blockquote variant="tonal" class="jx-hue-warning" label="Warning" icon={warningGlyph}>
              The migration rewrites column names in place — snapshot before upgrading.
            </Blockquote>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The native blockquote element announces quoted prose for free; the cite footer is real attribution markup, not decoration."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — static reading content, not a control' }]}
        aria={[
          { name: 'blockquote', value: 'native element', description: 'Quoted prose semantics from the platform; no extra ARIA.' },
          { name: 'footer > cite', value: 'native elements', description: 'The MDN attribution posture — the cite marks the source title, announced with the quote.' },
          { name: 'data-jx-blockquote', value: 'variant', description: 'Hook attribute carrying the ladder variant (outline | tonal) for styling.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Six props; variant sets the frozen two-rung surface, label/icon/cite compose over it."
    >
      <PropsTable props={[
        { name: 'variant', type: "'outline' | 'tonal'", default: "'outline' · ambient zone", description: 'Ladder prominence: outline paints a transparent ground with the 1px left rule and muted body; tonal paints the 12% tinted ground with the 45% border and tonal inks. Hue comes from token injection, not variant names. Omitted → the ambient paint zone (ButtonGroup / zone scope), else the frozen own.' },
        { name: 'label', type: 'string', default: '—', description: 'One-line uppercase heading in the alert title-row form; omitted renders a bare body block.' },
        { name: 'icon', type: 'Snippet', default: '—', description: 'Rendered inline-start of the label — bring your own glyph.' },
        { name: 'cite', type: 'string', default: '—', description: 'Attribution, rendered as <footer><cite> after the body (the MDN posture) — not the native cite attribute.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'Body copy; the ambient font-size flows by inheritance.' },
        { name: 'class', type: 'string', default: "''", description: 'Forwarded to the root blockquote; intent utilities like jx-hue-info (or arbitrary token injections outside the closed set) land here.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="blockquote" />
  </div>
</div>
