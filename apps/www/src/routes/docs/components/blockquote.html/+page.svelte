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
  import { usageFile } from '$lib/canvas-usage';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import blockquoteSource from '$lib/ui/blockquote/blockquote.svelte?raw';

  // The canvas same-source lane (typography-context-and-parts §7): the
  // usage sample composes from THIS PAGE's own canvas markup — the
  // SectionCard CodeBlock and each canvas's usage TreeFile feed from
  // the same extracted string (one source, two surfaces; the hand
  // template literal + `const close` dodge are gone).
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/blockquote.html/+page';

  const usage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('rungs'));
  const ruleUsage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('rule'));

  const iconUsage = `<Blockquote variant="tonal" class="jx-hue-warning" label="Warning" icon={warningGlyph}>
  The migration rewrites column names in place.
</Blockquote>`;

  // per-canvas arrays (the shared one drifted: both drawers showed the
  // rungs sample while the rule canvas rendered its own matrix)
  const rungsFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-usage.svelte', content: usage, kind: 'usage' },
  ];
  const ruleFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-rule-usage.svelte', content: ruleUsage, kind: 'usage' },
  ];

  // the icon-lane demo rides the SAME same-source lane as rungs/rule
  // (this page's own law — the hand literal + `const close` dodge stay
  // gone; this also fixes the sweep's `${close}` ReferenceError the
  // lawful way instead of resurrecting the retired dodge)
  const iconLaneUsage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('icon-lane'));
  const iconLaneFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-icon-usage.svelte', content: iconLaneUsage, kind: 'usage' },
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
        summary="The semantic body IS the native <blockquote>: cite renders the MDN attribution posture (footer > cite after the body), never an element swap. One surface, two postures — outline (own default), transparent ground with a left rule (own shadow-4, a 55%-lightened outline mix) and a 0.875em muted body, the classic GitHub/Tailwind quote; tonal, the alert recipe verbatim (12% tinted ground, 45% border, rounded box), the callout/Notion posture. The left rule is now its own channel (2026-09-07, typography-context-and-parts): rule (shadow|border, own shadow) × ruleSize (the literal 1|4|8 px ladder, own 4 — the R3 ruling: 1px 只适合 xs2 尺寸) — the inset standard (command-item's inset primary, the elevation grammar's WELL tier, kbd's engrave lineage) made a prop. Availability is FROZEN at two rungs: quote readability excludes fill AND ghost — ghost is interactive-chrome vocabulary (rest-transparent, hover-tonal) which a static quote misuses; the borderless manuscript indent is a future structural axis, never a paint rung. The body rides 0.875em of the ambient scale (the R3 ruling) — trio/prose rescaling survives, and the markdown default map mounts it with the box-owning block escape."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;blockquote&gt;</span>
          <span class="pill">outline · tonal (frozen)</span>
          <span class="pill">rule shadow|border × 1|4|8</span>
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
        id="rungs"
        title="blockquote"
        description="The two frozen rungs side by side, the hue injections the admonition posture rides, and the label + cite composition. outline keeps the muted body (the manuscript posture); tonal tints both label and body like the alert rows."
        sourceUrl={registrySourceUrl('blockquote')}
        files={rungsFiles}
        stage="fill"
      >
        <div class="flex w-full max-w-xl flex-col gap-4">
          <div class="grid gap-4 min-[640px]:grid-cols-2">
            <Blockquote>
              outline (own) — transparent ground, a soft 4px left rule at a lightened mix, 0.875em muted body: the classic quote.
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

    <div id="rule" data-region="blockquote-rule" data-family="blockquote-rule" data-reveal="">
      <ComponentCanvas
        id="rule"
        title="blockquote"
        description="The rule channel — shadow (own) × border, each at the literal 1|4|8 px ladder. The rule's color rides the rung's OWN border-color declaration (one hue source: a jx-hue-* retune moves ground, box and rule together); ONE shadow utility per root; outline in shadow mode emits no border at all; the paddings stay FIXED across channels and sizes — border consumes geometry, shadow doesn't (paint never moves geometry)."
        sourceUrl={registrySourceUrl('blockquote')}
        files={ruleFiles}
        stage="fill"
        scroll="grow"
      >
        <div class="flex w-full max-w-3xl flex-col gap-6">
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">outline — shadow (own) × border, 1 | 4 | 8</span>
            <div class="grid gap-4 min-[640px]:grid-cols-3">
              <Blockquote rule="shadow" ruleSize={1}>shadow-4 — the default: a 1px inset rule painted over geometry.</Blockquote>
              <Blockquote rule="shadow" ruleSize={4}>shadow-4 — the emphasis quote, still 0.875rem of pad.</Blockquote>
              <Blockquote rule="shadow" ruleSize={8}>shadow-8 — the pull quote; ps stays fixed, the paint widens.</Blockquote>
              <Blockquote rule="border" ruleSize={1}>border-1 — the classic geometry-consuming rule.</Blockquote>
              <Blockquote rule="border" ruleSize={4}>border-4 — consumes 3px more of the box.</Blockquote>
              <Blockquote rule="border" ruleSize={8}>border-8 — the widest structural edge.</Blockquote>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">the resolved default — 4 won the browser review; 1 stays the xs2-scale hairline</span>
            <div class="grid gap-4 min-[640px]:grid-cols-2">
              <Blockquote rule="shadow" ruleSize={1}>shadow-1: the hairline — fits xs2-scale contexts only.</Blockquote>
              <Blockquote rule="shadow" ruleSize={4}>shadow-4: the default manuscript bar every quote now ships.</Blockquote>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-muted-foreground text-[11px]">tonal — the box border stays; the shadow rule rides beside it</span>
            <div class="grid gap-4 min-[640px]:grid-cols-3">
              <Blockquote variant="tonal" rule="shadow" ruleSize={1}>tonal + shadow-1: a deliberate near-no-op — axis uniformity over special-casing.</Blockquote>
              <Blockquote variant="tonal" rule="shadow" ruleSize={4}>tonal + shadow-4: the rule starts to read through the tint.</Blockquote>
              <Blockquote variant="tonal" rule="shadow" ruleSize={8}>tonal + shadow-8: two edges, one hue source.</Blockquote>
            </div>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The inset standard cited: command-item's
              <code>shadow-[inset_2px_0_0_var(--primary)]</code>, the elevation grammar's WELL
              tier, kbd's <code>--shadow-engrave</code> lineage. The 1/4/8 ladder is the Owner's
              explicit enumeration — recorded as the ruling over a derived scale. Forced colors:
              shadow modes re-materialize as an Npx CanvasText border
              (<code>forced-colors:shadow-none</code> + width + color — the entity law's "edge is
              structure" generalized); border modes keep the rung's existing degradation. Hook:
              <code>data-jx-blockquote-rule="{'{rule}-{size}'}"</code>.
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
          <ComponentCanvas id="icon-lane" title="blockquote · icon lane" stage="fill" files={iconLaneFiles}>
            <div class="max-w-xl">
              {#snippet warningGlyph()}<span class="font-mono" aria-hidden="true">▲</span>{/snippet}
              <Blockquote variant="tonal" class="jx-hue-warning" label="Warning" icon={warningGlyph}>
                The migration rewrites column names in place — snapshot before upgrading.
              </Blockquote>
            </div>
          </ComponentCanvas>
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
          { name: 'data-jx-blockquote-rule', value: '{rule}-{size}', description: 'The rule channel hook (e.g. shadow-1, border-4) — tests and tooling read the channel without reverse-engineering utility soup.' },
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
        { name: 'variant', type: "'outline' | 'tonal'", default: "'outline' · ambient zone", description: 'Ladder prominence: outline paints a transparent ground with the soft 4px left rule (a lightened mix) and the 0.875em muted body; tonal paints the 12% tinted ground with the 45% border and tonal inks. Hue comes from token injection, not variant names. Omitted → the ambient paint zone (ButtonGroup / zone scope), else the frozen own.' },
        { name: 'rule', type: "'shadow' | 'border'", default: "'shadow' · Own default, not ambient", description: "The left rule's ink channel: shadow paints over geometry (the inset standard — command-item's inset primary, the WELL tier, kbd's engrave lineage); border consumes it. Outline in shadow mode emits NO border at all; tonal keeps its box border plus the shadow rule (tonal + shadow-1 is a deliberate near-no-op — axis uniformity). A literal slot the paint zone never moves." },
        { name: 'ruleSize', type: '1 | 4 | 8', default: '1 · Own default, not ambient', description: "The rule's literal px ladder — the Owner's explicit enumeration, recorded as the ruling over a derived scale. Paddings stay FIXED across sizes (paint never moves geometry)." },
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
