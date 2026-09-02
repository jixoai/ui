<!--
  Docs page for the button-group family (OpenSpec
  2026-08-30-expand-form-family F2, 2026-08-30).

  docs-demo-standard skeleton: Intro → Install → live demo (canvas) →
  Usage (the ONE h2) → Examples (ability-named canvases, incl. the
  toggle-group BOUNDARY note) → Accessibility → API → See also.
  Every canvas carries a playground pane (the structure lint), and
  the demo copy never uses real headings (the data-doc-demo-content
  scope).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { icons } from '$lib/icons';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import buttonGroupSource from '$lib/ui/button-group/button-group.svelte?raw';
  import buttonGroupDividerSource from '$lib/ui/button-group/button-group-divider.svelte?raw';

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- live demo state (playground protocol: snapshots + reset) --------
  const canvasInitial = { orientation: 'horizontal' as 'horizontal' | 'vertical', justify: 'start' as 'start' | 'center' | 'end' };
  let orientation = $state(canvasInitial.orientation);
  let justify = $state(canvasInitial.justify);
  function resetCanvas(): void {
    orientation = canvasInitial.orientation;
    justify = canvasInitial.justify;
  }
  const usageLive = $derived(
    `<ButtonGroup label="export actions" orientation="${orientation}" justify="${justify}">
  <PressButton variant="outline">copy</PressButton>
  <PressButton variant="outline">move</PressButton>
  <ButtonGroupDivider />
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/button-group/button-group.svelte', content: buttonGroupSource },
    { name: 'registry/files/ui/button-group/button-group-divider.svelte', content: buttonGroupDividerSource },
    { name: 'src/lib/ui/button-group-usage.svelte', content: usageLive, kind: 'usage' },
  ];

  // ---- the ONE usage sample (drawer + body CodeBlock share it) ----------
  const usage = `<script lang="ts">
  import ButtonGroup, { ButtonGroupDivider } from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<ButtonGroup label="export actions">
  <PressButton variant="outline">copy</PressButton>
  <ButtonGroupDivider />
  <PressButton variant="outline">move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`;
</script>

<svelte:head>
  <title>Button group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai button-group: an orientation/justify container that joins press-buttons edge-to-edge over the hairline seam law — adjacent borders collapse into one 1px seam (never a double border), the ButtonGroupDivider replaces the seam between clusters. role=group by law (a named action grouping, NOT a toolbar); selection is toggle-group's law, not this component's."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="button-group — joined actions, one hairline"
        summary="The shadcn Button Group counterpart, native to this registry's laws: a layout container that joins press-buttons edge-to-edge. The group paints NO bezel of its own — adjacent children collapse their 1px borders into ONE hairline seam (a joined row of outline buttons reads as one control, never a 2px double border), and the ButtonGroupDivider replaces the seam wherever clusters need an explicit boundary. The buttons keep everything that makes them buttons: the variant ladder, the press physics, the density tier. ROLE LAW: the root is role=group — a named grouping of related actions, NOT a toolbar; and when the children express SELECTION (a pressed state, an active value), the component is wrong: segmented selection is toggle-group's law."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">orientation · justify</span>
          <span class="pill">1px hairline seams</span>
          <span class="pill">ButtonGroupDivider</span>
          <span class="pill">role=group law</span>
          <span class="pill">zero deps · Svelte 5 runes</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <SectionCard
        family="install"
        headerRegion="install"
        eyebrow="install"
        title="Install"
        summary="One registry item — the group and the divider ship together (the barrel exports both). Buttons come from press-button."
      >
        <CodeBlock code={`npx jixoai-ui add button-group`} lang="sh" meta="install" />
      </SectionCard>
    </div>

    <div id="btngroup-demo" data-region="btngroup-demo" data-family="btngroup-demo" data-reveal="">
      <ComponentCanvas
        title="button-group"
        description="Joined press-buttons with a divider between the clusters — the playground flips orientation and justify; the usage file in the drawer tracks both."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group.svelte"
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
        output={[
          { label: 'orientation', value: orientation },
          { label: 'justify', value: justify },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex min-w-0 flex-col items-start gap-5">
          <ButtonGroup label="export actions" {orientation} {justify}>
            <PressButton variant="outline">copy</PressButton>
            <PressButton variant="outline">move</PressButton>
            <ButtonGroupDivider />
            <PressButton variant="outline">delete</PressButton>
          </ButtonGroup>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="orientation">
              <PlaySegmented
                bind:value={orientation}
                options={[
                  { value: 'horizontal', label: 'horizontal' },
                  { value: 'vertical', label: 'vertical' },
                ]}
              />
            </PlayRow>
            <PlayRow label="justify">
              <PlaySegmented
                bind:value={justify}
                options={[
                  { value: 'start', label: 'start' },
                  { value: 'center', label: 'center' },
                  { value: 'end', label: 'end' },
                ]}
              />
            </PlayRow>
            <PlayHelp>
              every button keeps its own tab stop and press physics — the group only joins their
              edges. The divider is the seam between clusters, never a fifth border.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Author the buttons in your tree — the group owns the join, the divider owns explicit boundaries. Name the group; the platform owns the rest."
    >
      <CodeBlock code={usage} lang="svelte" meta="Button group usage" />
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named demos — one phrase, one capability — plus the recorded boundary against the selection family."
    >
      <p class="m-0 text-muted-foreground text-[13px] leading-6">
        Nested clusters first, then the boundary note — when the children express SELECTION, the
        law leaves this page for toggle-group.
      </p>
    </SectionCard>
  </div>

  <div id="btngroup-nesting" data-region="btngroup-nesting" data-family="btngroup-nesting" data-reveal="">
    <ComponentCanvas
      title="with nested clusters"
      description="A nested ButtonGroup is ONE child for the outer seam — the inner seams never leak outward; fill and outline rungs join on the same hairline."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group-divider.svelte"
      files={[
        { name: 'registry/files/ui/button-group/button-group-divider.svelte', content: buttonGroupDividerSource },
      ]}
      stage="center"
      output={[{ label: 'clusters', value: '2 · joined by a divider' }]}
    >
      <div class="flex min-w-0 flex-col items-start gap-5">
        <ButtonGroup label="editor actions">
          <PressButton variant="fill">save</PressButton>
          <ButtonGroupDivider />
          <ButtonGroup label="view switches">
            <PressButton variant="outline" square ariaLabel="undo">{@html icons.arrowLeft}</PressButton>
            <PressButton variant="outline" square ariaLabel="redo">{@html icons.arrowRight}</PressButton>
          </ButtonGroup>
          <PressButton variant="ghost">discard</PressButton>
        </ButtonGroup>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the seam rule is child-scoped: the nested group joins internally, and the outer
            collapse treats the whole cluster as one neighbor. Mixed rungs (fill / outline /
            ghost) share the hairline because every rung paints a 1px edge.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="btngroup-boundary" data-region="btngroup-boundary" data-family="btngroup-boundary" data-reveal="">
    <SectionCard
      family="btngroup-boundary"
      headerRegion="btngroup-boundary"
      eyebrow="boundary"
      title="the toggle-group boundary — selection is not this component"
      summary="A button group is ACTION-ONLY: press, effect, navigate — no pressed state, no active value, no form payload. The moment the children express SELECTION, the segmented-selection law applies and the component is toggle-group (native radios/checkboxes under one name — native exclusivity, arrow-walk, FormData). The two may look similar when joined; the difference is semantic, not paint: aria-pressed (or a pressed style) on these buttons is the recorded divergence trap."
    >
      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <div class="flex flex-col gap-3">
          <p class="font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">actions → button-group</p>
          <ButtonGroup label="export actions">
            <PressButton variant="outline">copy</PressButton>
            <PressButton variant="outline">move</PressButton>
            <PressButton variant="outline">delete</PressButton>
          </ButtonGroup>
          <span class="text-muted-foreground text-[12.5px]">each press performs; nothing stays active.</span>
        </div>
        <div class="flex flex-col gap-3">
          <p class="font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">selection → toggle-group</p>
          <CodeBlock
            code={`<ToggleGroup name="align" type="single" label="alignment">
  <ToggleGroupItem value="left">left</ToggleGroupItem>
  <ToggleGroupItem value="center">center</ToggleGroupItem>
</ToggleGroup>`}
            lang="svelte"
            meta="the selection law"
          />
          <span class="text-muted-foreground text-[12.5px]">one active value, submitted as a form field.</span>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="role=group named by label — a grouping of related actions over plain buttons; never a toolbar unless you explicitly relabel it (and then you own the roving-tabindex contract)."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Each button keeps its own tab stop — a group is NOT a roving-tabindex collection' },
          { key: 'Space / Enter', action: 'Activates the focused button (native)' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'The law. Override through the rest props only with an explicit labeled toolbar contract' },
          { name: 'aria-label', value: 'label', description: 'The group accessible name — or aria-labelledby through the rest props; a nameless group is announced as nothing' },
          { name: 'role="separator"', value: 'divider', description: 'ButtonGroupDivider announces the boundary between clusters; aria-orientation describes the LINE (vertical inside a horizontal flow)' },
          { name: 'no aria-pressed', value: 'law', description: 'No button carries a pressed state here — that is toggle-group’s contract' },
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
      summary="Two parts: the container owns orientation/justify and the seam; the divider owns explicit boundaries."
    >
      <PropsTable
        props={[
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'The join axis; carries the valued data-jx-btngroup hook.' },
          { name: 'justify', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Cluster placement on the main axis.' },
          { name: 'label', type: 'string', default: '—', description: 'Accessible group name (aria-label); an explicit rest aria-label wins.' },
          { name: 'separator', type: 'boolean', default: 'ghost ⇒ true', description: 'The seam policy: a 1px contrast-ghost separator in every collapsed seam slot. DEFAULT on when the group’s EFFECTIVE variant (own prop, else the inherited scope) is ghost — the borderless row has no other seam.' },
          { name: 'leadingSeam', type: 'boolean', default: 'false', description: 'The cluster’s opening bracket (r14-13): paint the seam in the leading slot too — the first button’s own flush ::before, never a sibling element a parent gap could detach. Only paints under an active seam policy (the dialog footer’s actions region is the canonical consumer).' },
          { name: 'density', type: 'Density', default: 'inherited', description: 'Density tier, provided to the subtree so joined buttons adopt it.' },
          { name: 'role', type: 'string', default: "'group'", description: 'The group role — a labeled toolbar is the consumer’s explicit override.' },
          { name: 'class', type: 'string', default: "''", description: 'Merged into the root (cn()).' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'The joined controls — authored in your tree.', required: true },
          { name: '...rest', type: 'HTMLAttributes', default: '—', description: 'aria-labelledby, data-*, handlers — land on the root verbatim.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The group paints nothing — the seams read var(--border) and the joined buttons ride the density ruler through the provided context."
    >
      <div class="flex flex-col gap-5">
        <DensityDemo>
          <ButtonGroup label="density">
            <PressButton variant="outline">one</PressButton>
            <PressButton variant="outline">two</PressButton>
            <ButtonGroupDivider />
            <PressButton variant="outline">three</PressButton>
          </ButtonGroup>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--border', default: 'theme', source: 'seams + divider' },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The families around the joined container."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/press-button.html">press-button — the joined buttons</a>
        <a class="pill" href="/docs/components/toggle-group.html">toggle-group — the SELECTION law</a>
        <a class="pill" href="/docs/components/toggle.html">toggle — one standalone pressed state</a>
        <a class="pill" href="/docs/components/input-group.html">input-group — the joined field shell</a>
      </div>
    </SectionCard>
  </div>
</div>
