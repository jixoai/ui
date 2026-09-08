<!--
  Docs page for the button-bar family (OpenSpec 2026-09-08-button-bar).

  docs-demo-standard skeleton: Intro → Install → live demo (canvas) →
  Usage (the ONE h2) → Examples (ability-named canvases: the joined
  boundary, explicit wins, the nested cluster) → Accessibility → API
  → Theming → See also. Every canvas carries a playground pane (the
  structure lint), and the demo copy never uses real headings (the
  data-doc-demo-content scope).
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
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonBar from '$lib/ui/button-bar/button-bar.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import buttonBarSource from '$lib/ui/button-bar/button-bar.svelte?raw';

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- the main playground: orientation + justify -----------------
  const canvasInitial = {
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    justify: 'end' as 'start' | 'center' | 'end' | 'between',
  };
  let orientation = $state(canvasInitial.orientation);
  let justify = $state(canvasInitial.justify);
  function resetCanvas(): void {
    orientation = canvasInitial.orientation;
    justify = canvasInitial.justify;
  }
  const usageLive = $derived(
    `<ButtonBar label="deployment actions" orientation="${orientation}" justify="${justify}">
  <PressButton>discard</PressButton>
  <ButtonGroup label="publish">
    <PressButton>draft</PressButton>
    <PressButton>publish</PressButton>
  </ButtonGroup>
</ButtonBar>`,
  );

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/button-bar/button-bar.svelte', content: buttonBarSource },
    { name: 'src/lib/ui/button-bar-usage.svelte', content: usageLive, kind: 'usage' },
  ];

  // ---- the ONE usage sample (drawer + body CodeBlock share it) ------
  const usage = `<script lang="ts">
  import ButtonBar from '@ui/button-bar/index';
  import ButtonGroup from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<ButtonBar label="deployment actions">
  <PressButton>discard</PressButton>
  <ButtonGroup label="publish">
    <PressButton>draft</PressButton>
    <PressButton>publish</PressButton>
  </ButtonGroup>
</ButtonBar>`;

  // the defaults demo: the lane's whole identity — members fall to
  // ghost + flat with zero per-button props
  const buttonBarDefaultsDemo = `<script lang="ts">
  import ButtonBar from '@ui/button-bar/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<!-- the lone buttons: outline bodies, convex shadows -->
<PressButton>standalone</PressButton>
<PressButton>standalone</PressButton>

<!-- the same buttons, no props changed, inside the lane -->
<ButtonBar label="lane actions" justify="start">
  <PressButton>ghost + flat by default</PressButton>
  <PressButton>no redundant borders</PressButton>
</ButtonBar>`;

  const defaultsFiles: TreeFile[] = [
    { name: 'button-bar-defaults-demo.svelte', content: buttonBarDefaultsDemo, kind: 'usage' },
  ];

  // the explicit-wins demo: the ladder stays reachable at every level
  const buttonBarExplicitDemo = `<script lang="ts">
  import ButtonBar from '@ui/button-bar/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<ButtonBar label="deploy" justify="end">
  <PressButton>cancel — ghost (the lane)</PressButton>
  <PressButton variant="fill">deploy — explicit fill</PressButton>
</ButtonBar>

<!-- the LANE itself can re-rung: every member without its own prop follows -->
<ButtonBar label="editing" variant="outline" justify="start">
  <PressButton>outline — the lane's rung</PressButton>
  <PressButton>outline too</PressButton>
</ButtonBar>`;

  const explicitFiles: TreeFile[] = [
    { name: 'button-bar-explicit-demo.svelte', content: buttonBarExplicitDemo, kind: 'usage' },
  ];

  // the nested-cluster demo: a joined button-group as ONE lane member
  const buttonBarClusterDemo = `<script lang="ts">
  import ButtonBar from '@ui/button-bar/index';
  import ButtonGroup from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<ButtonBar label="card actions">
  <PressButton>copy link</PressButton>
  <ButtonGroup label="publish">
    <PressButton>draft</PressButton>
    <PressButton>publish</PressButton>
  </ButtonGroup>
</ButtonBar>

<!-- the cluster inherits ghost (its ghost seam policy follows) and its
     root cluster shadow goes dark through the lane's flat texture -->`;

  const clusterFiles: TreeFile[] = [
    { name: 'button-bar-cluster-demo.svelte', content: buttonBarClusterDemo, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Button bar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai button-bar: a free-floating action lane — a single row/column flex container whose members (press-buttons, icon-buttons, joined button-groups) are independent and gap-separated. The lane DEFAULTS its subtree: ghost paint (no redundant borders) + the flat press texture (raised=false, the engrave inset) while explicit props at any level still win. The DialogFooter posture, generalized off the dialog."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="button-bar — the free-floating action lane"
        summary="One row or one column of INDEPENDENT actions. Where button-group joins its members edge-to-edge into one control (the -1px seam, the one cluster shadow, the overflow machines), a button bar keeps them apart — gap-separated, free-floating — and exists to DEFAULT the subtree: every member without its own props renders ghost (the quietest chrome rung — no border color, no redundant borders) on the flat texture (raised=false: no rest/hover shadow, the engrave-tier inset press), and a joined cluster inside rides the same defaults with its cluster shadow dark. The DialogFooter posture, generalized off the dialog: justify places the members (start / center / end — own default end, the inline-end-actions posture — or between, the left-note-right-actions footer shape), and the lane paints NOTHING of its own."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">single row / single column</span>
          <span class="pill">ghost + flat by default</span>
          <span class="pill">gap-separated members</span>
          <span class="pill">nested clusters welcome</span>
          <span class="pill">flex justify · start/center/end/between</span>
          <span class="pill">zero css · Svelte 5 runes</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <SectionCard
        family="install"
        headerRegion="install"
        eyebrow="install"
        title="Install"
        summary="One registry item — the lane and its Defaults contract ship together. The members come from press-button (and button-group when a joined cluster rides the lane)."
      >
        <CodeBlock code={`npx jixoai-ui add button-bar`} lang="sh" meta="install" />
      </SectionCard>
    </div>

    <div id="btnbar-demo" data-region="btnbar-demo" data-family="btnbar-demo" data-reveal="">
      <ComponentCanvas
        title="button-bar"
        description="A card-foot lane: a loose button and a joined cluster, end-packed — the playground flips orientation and justify; the usage file in the drawer tracks both. Every member renders ghost + flat with zero per-button props."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-bar/button-bar.svelte"
        files={canvasFiles}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'orientation', value: orientation },
          { label: 'justify', value: justify },
        ]}
        resolveFileContent={(file: TreeFile) =>
          file.name.endsWith('button-bar-usage.svelte') ? usageLive : file.content}
      >
        <div class="flex min-w-0 flex-col items-start gap-5">
          <div class="w-full max-w-[440px] rounded-xl border bg-card p-5 shadow-xs">
            <div class="flex flex-col gap-1 pb-4">
              <span class="text-[13px] font-medium">deployment preview</span>
              <span class="text-[12.5px] text-muted-foreground"
                >main · 2 commits ahead · checks passed</span
              >
            </div>
            <ButtonBar label="deployment actions" {orientation} {justify}>
              <PressButton>discard</PressButton>
              <ButtonGroup label="publish">
                <PressButton>draft</PressButton>
                <PressButton>publish</PressButton>
              </ButtonGroup>
            </ButtonBar>
          </div>
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
                  { value: 'between', label: 'between' },
                ]}
              />
            </PlayRow>
            <PlayHelp>
              the lane never wraps and never collapses — one row or one column, the overflow
              question stays with the scroll container. Vertical stretches its members
              full-width (the one-column action list).
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
      summary="Author the members in your tree — the lane owns the defaults, the placement and nothing else. Name the group; the platform owns the rest."
    >
      <CodeBlock code={usage} lang="svelte" meta="Button bar usage" />
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named demos — the lane's identity (the defaults), the escape hatches (explicit wins), and the joined-cluster member."
    >
      <p class="m-0 text-muted-foreground text-[13px] leading-6">
        The structural boundary first: button-group is the JOINED cluster (one control, collapsed
        seams, one shadow); button-bar is the FREE-FLOATING lane (independent members, gap,
        no shadow). Inside a lane, a joined cluster is simply ONE member.
      </p>
    </SectionCard>
  </div>

  <div id="btnbar-defaults" data-region="btnbar-defaults" data-family="btnbar-defaults" data-reveal="">
    <ComponentCanvas
      title="ghost + flat, by default"
      description="The lane's whole identity: the same bare PressButtons that render outline bodies with convex shadows outside, render ghost on the flat texture inside — no border color (the ghost rung keeps the 1px geometry, drops the ink), no rest/hover shadow, the engrave-tier inset on press. Zero per-button props."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-bar/button-bar.svelte"
      files={defaultsFiles}
      stage="fill"
      output={[{ label: 'default rung', value: 'ghost · flat' }]}
    >
      <div class="flex min-w-0 flex-col items-start gap-5">
        <div class="flex flex-col gap-3">
          <p class="m-0 font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">outside the lane</p>
          <div class="flex flex-wrap items-center gap-2.5">
            <PressButton>standalone</PressButton>
            <PressButton>standalone</PressButton>
          </div>
          <span class="text-muted-foreground text-[12.5px]">outline bodies, convex shadows — the frozen defaults.</span>
        </div>
        <div class="flex flex-col gap-3">
          <p class="m-0 font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">inside the lane</p>
          <ButtonBar label="lane actions" justify="start">
            <PressButton>ghost + flat by default</PressButton>
            <PressButton>no redundant borders</PressButton>
          </ButtonBar>
          <span class="text-muted-foreground text-[12.5px]">same buttons, no props changed — the lane provided both defaults.</span>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the lane provides the paint zone (own ghost) and the press texture zone (own flat)
            over the same context keys dialog feet and variant scopes already ride — explicit
            props at any level still win, and a lane with no members paints nothing at all.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="btnbar-explicit" data-region="btnbar-explicit" data-family="btnbar-explicit" data-reveal="">
    <ComponentCanvas
      title="explicit wins — at every level"
      description="The ladder stays reachable: a member's own variant/raised beats the lane (a fill primary beside ghost tertiaries is the classic foot), and the LANE itself can re-rung (variant='outline' — every member without its own prop follows). raised={true} restores the convex law the same way."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-bar/button-bar.svelte"
      files={explicitFiles}
      stage="fill"
      output={[{ label: 'resolution', value: 'explicit ?? lane ?? own' }]}
    >
      <div class="flex min-w-0 flex-col items-start gap-5">
        <div class="flex flex-col gap-3">
          <p class="m-0 font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">member-level escape</p>
          <ButtonBar label="deploy" justify="end">
            <PressButton>cancel — ghost (the lane)</PressButton>
            <PressButton variant="fill">deploy — explicit fill</PressButton>
          </ButtonBar>
        </div>
        <div class="flex flex-col gap-3">
          <p class="m-0 font-nav text-xs uppercase tracking-[0.2em] text-muted-foreground">lane-level re-rung</p>
          <ButtonBar label="editing" variant="outline" justify="start">
            <PressButton>outline — the lane's rung</PressButton>
            <PressButton>outline too</PressButton>
          </ButtonBar>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            link is not a zone value — a lane varianting to link is a compile error; the
            interaction exception keeps its only route through PressButton's own prop.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="btnbar-cluster" data-region="btnbar-cluster" data-family="btnbar-cluster" data-reveal="">
    <ComponentCanvas
      title="a joined cluster as one member"
      description="ButtonGroup inside the lane: the cluster inherits ghost (its ghost seam policy follows — the borderless row's 1px seams) and its root cluster shadow goes DARK through the lane's flat texture (one control, one shadow — and the lane casts none). The cluster keeps its own join law; the lane keeps its gap."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group.svelte"
      files={clusterFiles}
      stage="fill"
      output={[{ label: 'cluster shadow', value: 'dark (flat texture)' }]}
    >
      <div class="flex min-w-0 flex-col items-start gap-5">
        <ButtonBar label="card actions" justify="end">
          <PressButton>copy link</PressButton>
          <ButtonGroup label="publish">
            <PressButton>draft</PressButton>
            <PressButton>publish</PressButton>
          </ButtonGroup>
        </ButtonBar>
        <span class="text-muted-foreground text-[12.5px]"
          >gap between the loose button and the cluster; seams only inside the cluster — each
          structure keeps its own law.</span
        >
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            an explicit variant or raised on the cluster (or any of its buttons) still wins —
            the lane provides DEFAULTS, never laws.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="role=group named by label — a grouping of related actions over plain buttons; every member keeps its own tab stop. Never a toolbar unless you explicitly relabel it (and then you own the roving-tabindex contract)."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Each member keeps its own tab stop — the lane adds NO roving tabindex' },
          { key: 'Space / Enter', action: 'Activates the focused member (native)' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'The law. Override through the rest props only with an explicit labeled toolbar contract' },
          { name: 'aria-label', value: 'label', description: 'The lane accessible name — or aria-labelledby through the rest props; a nameless group is announced as nothing' },
          { name: 'no aria-pressed', value: 'law', description: 'No member carries a pressed state from the lane — that is toggle-group’s contract' },
          { name: 'data-jx-btnbar', value: 'orientation', description: 'The css-less semantic hook (tests and docs query the attribute; no css-defined selector shadows it)' },
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
      summary="One part: the lane owns the axis, the placement and the subtree defaults — the members own everything else."
    >
      <PropsTable
        props={[
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'The lane axis — one row or one column; carries the valued data-jx-btnbar hook.' },
          { name: 'justify', type: "'start' | 'center' | 'end' | 'between'", default: "'end'", description: 'Member placement on the main axis. Own default end — the inline-end-actions posture of the footers this lane generalizes; between is the left-note-right-actions footer shape.' },
          { name: 'label', type: 'string', default: '—', description: 'Accessible group name (aria-label); an explicit rest aria-label wins.' },
          { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost'", default: 'ambient zone ?? ghost', description: 'The LANE rung adopted by every member that passes none of its own (explicit always wins; no rung is minted — context selects). Omitted → the enclosing scope’s variant (inherit-then-provide), else the lane’s own ghost. link is not a zone value; fused is outside the button families’ ladder.' },
          { name: 'raised', type: 'boolean', default: 'ambient zone ?? false', description: 'The LANE physics default (own flat): members ride raised={false} — no rest/hover shadow, the engrave-tier inset press — and a nested button-group resolves its cluster shadow dark through the same key. raised={true} restores the convex law for members without their own prop; explicit props at any level still win.' },
          { name: 'density', type: 'Density', default: 'ambient scope', description: 'Density tier, provided to the subtree so the lane’s members adopt it: explicit ?? the ambient scope (no opinion stamps nothing).' },
          { name: 'role', type: 'string', default: "'group'", description: 'The group role — a labeled toolbar is the consumer’s explicit override.' },
          { name: 'class', type: 'string', default: "''", description: 'Merged into the root (cn()) — the gap and every layout utility are overridable here.' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'The lane members — press-buttons, icon-buttons, joined button-groups authored in your tree.', required: true },
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
      summary="The lane paints NOTHING of its own — zero css, all utilities — so the only tokens in play are the members' (ghost reads the ambient tonal on hover; flat presses through --shadow-engrave). The members ride the density ruler through the provided context."
    >
      <div class="flex flex-col gap-5">
        <DensityDemo>
          <ButtonBar label="density lane">
            <PressButton>one</PressButton>
            <PressButton>two</PressButton>
          </ButtonBar>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-tonal', default: 'theme', source: "ghost hover wash + hover ink (the members' paint)" },
            { name: '--shadow-engrave', default: 'theme', source: "the flat press pose (the members' physics)" },
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
      summary="The families around the lane."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/button-group.html">button-group — the JOINED cluster this lane hosts</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — the lane’s members</a>
        <a class="pill" href="/docs/components/dialog.html">dialog — DialogFooter, the posture this lane generalizes</a>
        <a class="pill" href="/docs/context-defaults.html">context &amp; defaults — the ambient economy</a>
      </div>
    </SectionCard>
  </div>
</div>
