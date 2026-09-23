<!--
  Docs page for popconfirm (docs-eight-axes-mdn task 24, MDN archetype;
  tier 2 优化重构 — the skeleton carried the composition-first sections
  verbatim; the archetype gains install/overview/law/axes/see-also and
  folds theming + universal-props into the measured axes layer).
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
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
  // stage markup via resolveRawCode (one source, two surfaces): the axes
  // canvas's drawer composes from the extracted stage itself (the
  // carousel/badge-indicator precedent — every canvas gets its own usage
  // file or id + resolveRawCode).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/popconfirm.html/+page';

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

<!-- default panel: title/description strings + confirm/cancel. An
     explicit id + PressButton's own popovertarget prop wire the
     declarative trigger (the auto-wire is the plain-button path) -->
<Popconfirm
  id="pc-demo"
  title="Delete this row?"
  description="The history goes with it."
  confirmLabel="Delete"
  onconfirm={del}
  oncancel={() => console.log('kept')}
>
  <PressButton popovertarget="pc-demo">delete row</PressButton>
</Popconfirm>

<!-- opened panel: content/actions snippets replace the areas. An
     explicit id lets the authored actions close through the platform —
     popovertarget wires the keep button to the panel itself -->
<Popconfirm id="merge-pc" title="Merge this branch?" onconfirm={merge}>
  {#snippet content()}
    <p class="font-nav text-xs uppercase">merge this branch?</p>
    <p class="text-[12.5px] text-muted-foreground">3 commits, all checks green.</p>
  {/snippet}
  {#snippet actions()}
    <div class="flex justify-end gap-2">
      <button type="button" popovertarget="merge-pc">keep</button>
      <button type="button" onclick={merge}>merge</button>
    </div>
  {/snippet}
  <PressButton popovertarget="merge-pc">merge branch</PressButton>
</Popconfirm>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/popconfirm/popconfirm.svelte', content: popconfirmSource },
    { name: 'src/lib/ui/popconfirm-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ---- the confirmation state machine (measured + spec-pinned:
  // batch5-antd-components + composition-d) ------------------------------
  const lawTable = [
    { posture: 'open', input: 'trigger click (declarative popovertarget)', renders: 'the anchored bubble — placement with flip fallbacks', announces: 'role="dialog" named by the title' },
    { posture: 'confirm', input: 'the confirm button', renders: 'onconfirm runs, then the panel closes (try/finally — a throwing handler still closes)', announces: 'the outcome is the caller\u0027s' },
    { posture: 'cancel', input: 'light dismiss · Escape · the cancel button', renders: 'oncancel runs — ANY dismissal that is not confirm is a cancel', announces: 'nothing was destroyed' },
    { posture: 'focus', input: 'open', renders: 'focus lands on CANCEL (the safe action — the system-dialog law in its light form)', announces: 'the destructive path is never focus-trapped' },
    { posture: 'override', input: 'content / actions snippets', renders: 'the caller owns the area AND the semantics — aria-labelledby drops (wire your own ids)', announces: 'whatever the caller authors' },
  ];

  // ---- the tones/postures demo ------------------------------------------
  const popconfirmTypesDemo = `<script lang="ts">
  import Popconfirm from '@ui/popconfirm.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="border border-border p-4"><Popconfirm id="pc-tone-destructive" title="Delete this row?"><PressButton popovertarget="pc-tone-destructive">destructive</PressButton></Popconfirm></div>
  <div class="border border-border p-4"><Popconfirm id="pc-tone-primary" title="Merge this branch?" confirmTone="primary"><PressButton popovertarget="pc-tone-primary">primary</PressButton></Popconfirm></div>
</div>`;

  const popconfirmTypesFiles: TreeFile[] = [
    { name: 'popconfirm-types-demo.svelte', content: popconfirmTypesDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law + the cx
  // predicate: the type guard zeroes the standing svelte-check
  // diagnostic — plain strings pass through whole; stylex objects
  // contribute their string members ($$css dropped)).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the axes section: per-axis rows + probe-tagged demos --------------
  // Grep receipts: zero --jx-color-effective / --jx-motion-effective /
  // --jx-size-effective / --jx-elevation-effective ATOM reads in the
  // family (the button's --jx-shadow-xs is a token, not the §7 carrier);
  // the family imports its OWN popconfirm.css — never popover.css — and
  // the PORTAL LAW (W3-C) applies: the anchor span and the promoted
  // panel are SIBLINGS with no common carrier root, so the carriers +
  // the §3/§7 consumption stamps land on the PANEL itself (the promoted
  // root is self-carried) — NOT the promotion-away channel (navigation-
  // menu's root-stamps-.jx-pop-reads pattern; nav-menu borrowed
  // popover.css, this family's own sheet reads the same law).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY for the content — the §11 stamp lands on the PANEL (the portal law: the promoted root is self-carried), but every voice on the panel declares its own type (the title's --text-label-lg, the body's --jx-text-base, the buttons' --jx-text) and beats inheritance by declaration. The one reached surface: the panel's own anonymous flow. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED, SELF-CARRIED — the family's own sheet reads the carrier: popconfirm.css declares corner-shape: var(--jx-shape-effective, round) on .jx-pc, and the panel stamps the carrier in its own style (the portal law). No promotion-away needed — the stamped element IS the read element's root.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED, SELF-CARRIED — the panel always stamps --jx-radius-consumed (explicit: radius-effective × the §14 factor; auto: the §3 concentric calc against the panel's OWN ancestors) and .jx-pc's border-radius reads exactly that var (popconfirm.css, the same law verbatim as popover.css). Measured: the ambient page resolves the concentric calc to the square 0px; radius='large' on the component and the OPEN panel's computed radius jumps to the large rung. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED THROUGH THE KERNEL LANES, PROVIDED DOWN — the family is a density PROVIDER (inherit-then-provide, the button-group r11 lane): an explicit rung stamps data-density on BOTH the anchor span and the panel and re-bases the kernel channels inside each — the panel's title/body/buttons read var(--jx-hit/--jx-gap/--jx-inset/--jx-stack/--jx-text/--jx-line) (raw var() strings: substitution at the consuming element), and the TRIGGER tenant re-tiers with the anchor (a PressButton under a density='lg' anchor measures 48px against 40px beside it — measured). No opinion → no attribute anywhere (the density-adoption fleet law pins this family). Number unit: coefficient — carrier-stamped, declaration-scope-frozen for the lanes (the badge-indicator law).",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective on the panel; zero atom reads (grep receipt). The bubble's hues are idiomatic: the destructive confirm by default, primary on opt-in (confirmTone), the title/body ink the theme token law. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE SPLIT (per-voice, measured): the class:dark bridge lands on the PANEL and the SURFACE flips — .jx-surface's fill chain reads the level-table rung then the RAW --popover, both re-declared under .dark, so the bubble re-schemes with the promotion intact (the panel is the dark scope; its content inherits it). The ATOM voices freeze — title/body/buttons read the typed --jx-foreground/--jx-muted-foreground/--jx-destructive/--jx-primary aliases, computed once at :root. Measured: the acrylic surface drops from oklch(0.96 / 72%) to oklch(0.185 / 77%) while the title ink holds its light black — the frozen pole, one promotion from the badge-indicator's all-frozen chip; the difference is the surface's raw reads.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level2' · Own default, not ambient`,
      description:
        "CONSUMED, SELF-CARRIED — the family's OWN (level2, 3dp: the anchored menu rung) resolves even when the prop is auto, and the §7 pair + solid-fill bridge stamp ON THE PANEL; .jx-surface's fill chain reads the rung first (var(--jx-elevation-surface, var(--jx-surface-solid-fill, var(--popover)))). Measured: level2 vs elevation='level3' changes the OPEN panel's surface fill. The shadow layer rides the same pair (the kernel animates it in lockstep). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; zero atom reads (grep receipt). The real motion is the shared WAAPI surface-motion kernel (the toggle seam drives the --jx-p timeline; the live panel↔anchor axis measures every open) with its own prefers-reduced-motion guard — LAW #14's measured consequence: end states only settle past the kernel's duration, so probes await before asserting. Number unit: coefficient.",
    },
  ];

  const axesUsage = `<Popconfirm title="Delete this row?" radius="large">…</Popconfirm>
<Popconfirm title="Publish?" elevation="level3">…</Popconfirm>

<!-- theme: the split — the SURFACE re-schemes (raw --popover reads under
     the panel's own .dark), the ink freezes (typed aliases at :root) -->
<Popconfirm title="Sure?" theme="dark">…</Popconfirm>`;
  const axesFiles: TreeFile[] = [
    {
      name: 'src/lib/ui/popconfirm-axes.svelte',
      content: usageFile(
        { Popconfirm: '@ui/popconfirm.svelte', PressButton: '@ui/press-button.svelte' },
        resolveRawCode('axes'),
      ),
      kind: 'usage',
    },
  ];

  // the ONE query() case: a responsive density rung on the provider lane
  // (md = 48rem, the registered VIEWPORT_SCALE — cite the key). String
  // lanes carry the literal guard on BOTH args (the widening law).
  const responsiveDensity = query({ md: 'lg' as const }, 'sm' as const);

  const queryUsage = `<script lang="ts">
  import Popconfirm from '@ui/popconfirm.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the bubble rides the ambient scope stamped 'sm'; from
     md up the provider states its own lg opinion (both the anchor and
     the panel stamp it; the trigger tenant re-tiers with the anchor) -->
<Popconfirm id="pc-query" title="Delete this row?" density={query({ md: 'lg' }, 'sm')}>
  <PressButton popovertarget="pc-query">delete row</PressButton>
</Popconfirm>`;

  const queryFiles: TreeFile[] = [
    { name: 'popconfirm-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // the kernel channels + the family seams (mixed TokenTable — the
  // density rows are the panel content's raw var() reads, the seams the
  // family's own)
  const axisTokens = [
    { name: '--jx-hit / --jx-line', default: 'density scale ([data-density] scopes)', source: 'density' as const, description: 'The buttons\u0027 min hit size and leading — raw var() reads: substitution at the consuming element, re-based inside the panel\u0027s own rung scope and the anchor\u0027s.' },
    { name: '--jx-gap / --jx-inset / --jx-stack', default: 'density scale', source: 'density' as const, description: 'The panel\u0027s inner column rhythm (surface-body gap + inline/block padding) and the buttons\u0029 inline padding — the provider rung re-bases all three.' },
    { name: '--jx-text / --jx-text-base', default: 'kernel channels', source: 'density' as const, description: 'The buttons\u0029 type and the description\u0029s 13px body — the title steps OUTSIDE the kernel (--text-label-lg, the promoted 12px label).' },
    { name: '--jx-pc-gap', default: '8px', source: 'component' as const, description: 'The anchored gap — the panel\u0029s margin against the trigger (position-area honors it; the flip fallbacks keep it per-flip).' },
    { name: '--track-10 / --leading-15', default: '0.1em / 1.5 (promotion seams, reported)', source: 'structural' as const, description: 'The buttons\u0029 tracking and the description\u0029s leading — no sheet steps exist yet; the var() seams carry the values with fallbacks.' },
    { name: '--jx-shadow-xs', default: 'theme token', source: 'structural' as const, description: 'The BUTTONS\u0029 resting shadow — a token, not the §7 carrier; the bubble\u0029s own elevation rides the surface ladder (level2 own).' },
  ];
</script>

<svelte:head>
  <title>Popconfirm · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popconfirm: the LIGHT confirm bubble — children stay the trigger, the panel's content and action areas open to content/actions snippets with the current rendering as defaults. Light dismiss IS the cancel path; not an alertdialog."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="popconfirm — the light sure-bubble"
        summary={entry.summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">role=dialog</span>
          <span class="pill">light dismiss = cancel</span>
          <span class="pill">focus → Cancel</span>
          <span class="pill">content / actions snippets</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="popconfirm" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="The quick “sure?” that deletes a row without ceremony — a popover=auto panel on the popover laws, never an alertdialog."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            popconfirm is antd's highest-frequency unique gift, per the antd batch-1 ruling:
            the LIGHT confirm bubble for risky-but-reversible actions. The modal weight stays
            with system-dialog; this is a <code>popover="auto"</code> panel carrying
            <code>role="dialog"</code> — light dismiss, Escape, one-at-a-time and the top layer
            are the platform's, CSS anchor positioning places it
            (<code>position-area</code> from the <code>placement</code> prop with
            flip-block/flip-inline try-fallbacks and <code>anchors-visible</code> hiding), and
            the shared WAAPI surface-motion kernel animates entry/exit. The platform element
            paints nothing — the theme's jx-surface owns fill, border and blur; the shadow is a
            real DOM child the kernel animates in lockstep.
          </p>
          <p class={cx(rt.measurePara)}>
            The DOM is TWO SIBLINGS, and that is the family's deepest law: the trigger
            wrapper (an anchor-name span — compose any focusable control; the first button
            auto-wires as the declarative <code>popovertarget</code> trigger with
            aria-expanded/aria-controls mirrored) and the promoted panel. No common carrier
            root exists, so the PORTAL LAW applies: the §11 carriers and the radius/elevation
            consumption stamps land on the PANEL itself — the promoted root is self-carried
            (navigation-menu stamps its bar and lets .jx-pop read through inheritance; this
            family owns its sheet and reads its own stamps). The anchor span is a live
            density scope for the trigger tenant; the panel is one for its own content —
            the family is a density PROVIDER (inherit-then-provide).
          </p>
          <p class={cx(rt.measurePara)}>
            Semantics are the product: light dismiss IS the cancel path — any dismissal that
            is not the confirm button runs <code>oncancel</code>; confirm runs
            <code>onconfirm</code> then closes (try/finally — a throwing handler still
            closes); focus lands on CANCEL on open, the safe action. Composition-first (the
            MILDER ruling): the panel's two areas open to <code>content</code> /
            <code>actions</code> snippets with the current rendering as defaults — an override
            owns the semantics (aria-labelledby drops; wire your own ids). Per-axis below; the
            shared grammar lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="popconfirm-demo" data-region="popconfirm-demo" data-family="popconfirm-demo" data-reveal="">
      <ComponentCanvas
        id="popconfirm-demo"
        title="popconfirm"
        stage="center"
        description="The default panel: open it — focus lands on Cancel. Confirm runs the action; clicking outside or pressing Escape runs the cancel path instead. Either way the outcome surfaces below."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/popconfirm/popconfirm.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'outcome', value: outcome || '—' }]}
      >
        <div class={cx(rt.wrapRow16)}>
          <Popconfirm
            id="pc-demo"
            title="Delete this row?"
            description="The check history goes with it."
            confirmLabel="Delete"
            onconfirm={() => (outcome = 'deleted')}
            oncancel={() => (outcome = 'kept')}
          >
            <PressButton popovertarget="pc-demo">delete row</PressButton>
          </Popconfirm>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the wrapper auto-wires the first PLAIN button inside as the declarative popovertarget
              trigger and mirrors aria-expanded/aria-controls; a component trigger that claims its own
              popovertarget prop (PressButton) takes the EXPLICIT wire — give the Popconfirm an id and
              pass the prop through. confirmTone='primary' flips the loud path for positive
              confirmations. A throwing onconfirm still closes (try/finally).
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
        <div class={cx(rt.col20)}>
          <div class={cx(rt.wrapRow16)}>
            <Popconfirm id="merge-pc" title="Merge this branch?" onconfirm={() => (outcome = 'merged')}>
              {#snippet content()}
                <p class={cx(rt.fontNav, rt.text12, rt.pcTrack08, rt.upper, rt.inkFg)}>merge this branch?</p>
                <p class={cx(rt.text13, rt.pcLead15, rt.inkMuted)}>3 commits, all checks green — fast-forward is impossible.</p>
              {/snippet}
              {#snippet actions()}
                <div class={cx(rt.pcRowEnd)}>
                  <button
                    type="button"
                    popovertarget="merge-pc"
                    data-jx-pc-btn=""
                    class={cx(rt.pcBtn)}
                  >
                    keep
                  </button>
                  <button
                    type="button"
                    data-jx-pc-btn=""
                    class={cx(rt.pcBtn)}
                    onclick={() => (outcome = 'merged')}
                  >
                    merge
                  </button>
                </div>
              {/snippet}
              <PressButton popovertarget="merge-pc">merge branch</PressButton>
            </Popconfirm>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The confirmation state machine"
        summary="Confirm is the only path that runs onconfirm; everything else — light dismiss, Escape, the cancel button — is the cancel path. The panel closes through the platform in every case."
      >
        <div class={cx(rt.col20)}>
          <PropsTable
            props={lawTable.map((row) => ({
              name: row.posture,
              type: row.input,
              default: row.renders,
              description: `announces: ${row.announces}`,
            }))}
            title=""
          />
          <div class={cx(rt.mt20)}>
            <CodeBlock code={usage} lang="svelte" meta="usage" />
          </div>
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Confirmation variants" summary="Use destructive confirmation by default, or switch the confirm tone for positive actions."><ComponentCanvas title="popconfirm · variants" stage="fill" files={popconfirmTypesFiles}><div class={cx(rt.gridSm2)}><div class={cx(rt.panel)}><Popconfirm id="pc-tone-destructive" title="Delete this row?"><PressButton popovertarget="pc-tone-destructive">destructive</PressButton></Popconfirm></div><div class={cx(rt.panel)}><Popconfirm id="pc-tone-primary" title="Merge this branch?" confirmTone="primary"><PressButton popovertarget="pc-tone-primary">primary</PressButton></Popconfirm></div></div></ComponentCanvas></SectionCard></div>

    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The trigger stays in children; content and actions snippets are optional overrides."><CodeBlock code={usage} lang="svelte" meta="Popconfirm usage" /></SectionCard></div>

    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Popconfirm props separate the trigger, default copy, callbacks, placement, and snippet escape hatches. The anchor span carries rest passthrough (the trigger lane's host); the panel's popover/id wiring is load-bearing family law."
      >
        <PropsTable
          universal
          props={[
            { name: 'title', type: 'string', required: true, description: 'The question — one line, past-tense verb. DEFAULT rendering only (a content snippet replaces it).' },
            { name: 'description', type: 'string', default: '—', description: 'Optional supporting line — DEFAULT rendering only.' },
            { name: 'onconfirm', type: '() => void', default: '—', description: 'Runs on confirm before close — try/finally: a throwing handler still closes.' },
            { name: 'oncancel', type: '() => void', default: '—', description: 'Runs on ANY non-confirm dismissal — light dismiss and Escape included.' },
            { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'DEFAULT rendering only.' },
            { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'DEFAULT rendering only — also the open-focus target.' },
            { name: 'confirmTone', type: "'destructive' | 'primary'", default: "'destructive'", description: 'The loud path is the default; primary is the opt-in for positive confirmations.' },
            { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'position-area from the anchor — flip-block/flip-inline fallbacks keep the panel visible; anchors-visible hides it when the anchor leaves.' },
            { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'The floating-surface paint (.jx-surface variants: solid, the 72%-alpha blur acrylic, auto = acrylic unless reduced transparency). Literal slot — own \u0027auto\u0027, the dialog/sheet exemplar\u0027s twin.' },
            { name: 'id', type: 'string', default: '$props.id()', description: 'The panel id the declarative wire points at; derives the title/desc aria ids.' },
            { name: 'content', type: 'Snippet', default: '—', description: 'Replaces the title/description area — the caller owns the semantics (aria-labelledby drops; wire your own ids).' },
            { name: 'actions', type: 'Snippet', default: '—', description: 'Replaces the confirm/cancel row — close through the platform (a popovertarget button, light dismiss) or your own handler.' },
            { name: 'children', type: 'Snippet', required: true, default: '—', description: 'The trigger — any focusable control; the first button auto-wires as the declarative popovertarget trigger.' },
            { name: 'class / rest', type: 'string / HTMLAttributes', default: "''", description: 'The anchor span\u0027s lane — class joins the anchor atoms; rest spreads onto the wrapper (the trigger lane\u0027s host). The PANEL carries the family wiring and takes no spread.' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on popconfirm"
        summary="Resolved through PopconfirmDefaults (the single audited contract: variant's literal own 'auto' + elevation's own level2 over the eight universal slots). The PORTAL LAW: the anchor span and the promoted panel are siblings, so the carriers and the radius/elevation consumption stamps land on the PANEL itself — the promoted root is self-carried; the family's OWN sheet reads them (never popover.css). Density is the provider lane: the rung re-bases the panel's kernel channels AND re-tiers the trigger tenant through the anchor scope."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.note12, rt.inkMuted70)}>
            Reading the table: Property is the axis, Type is the real carrier or consumption it
            drives on THIS family, Default is the lane default — the named steps, number unit, and
            consumption are in each description.
          </p>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas id="axes" title="popconfirm · the measured axes" files={axesFiles} stage="fill">
              <div class={cx(rt.gridSm2, rt.wFull)}>
                <div class={cx(rt.panel)} data-probe="pc-ambient">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>ambient — level2 own, concentric radius</p>
                  <Popconfirm id="pc-ax-ambient" title="Delete this row?" description="The history goes with it.">
                    <PressButton popovertarget="pc-ax-ambient">delete</PressButton>
                  </Popconfirm>
                </div>
                <div class={cx(rt.panel)} data-probe="pc-radius">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>radius="large" — self-carried consumption</p>
                  <Popconfirm id="pc-ax-radius" title="Delete this row?" radius="large">
                    <PressButton popovertarget="pc-ax-radius">delete</PressButton>
                  </Popconfirm>
                </div>
                <div class={cx(rt.panel)} data-probe="pc-elev">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>elevation="level3" — the surface rung moves</p>
                  <Popconfirm id="pc-ax-elev" title="Publish now?" confirmTone="primary" elevation="level3">
                    <PressButton popovertarget="pc-ax-elev">publish</PressButton>
                  </Popconfirm>
                </div>
                <div class={cx(rt.panel)} data-probe="pc-dark">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>theme="dark" — the surface flips, the ink freezes</p>
                  <Popconfirm id="pc-ax-dark" title="Sure?" theme="dark">
                    <PressButton popovertarget="pc-ax-dark">delete</PressButton>
                  </Popconfirm>
                </div>
                <div class={cx(rt.panel)} data-probe="pc-density">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="lg" — the provider re-tiers trigger and panel</p>
                  <Popconfirm id="pc-ax-density" title="Delete this row?" density="lg">
                    <PressButton popovertarget="pc-ax-density">delete</PressButton>
                  </Popconfirm>
                </div>
                <div class={cx(rt.panel)} data-probe="pc-placement">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>placement="bottom" — position-area + flip fallbacks</p>
                  <Popconfirm id="pc-ax-placement" title="Delete this row?" placement="bottom">
                    <PressButton popovertarget="pc-ax-placement">delete</PressButton>
                  </Popconfirm>
                </div>
              </div>
            </ComponentCanvas>
          </div>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
            <ComponentCanvas title="popconfirm · query()" files={queryFiles}>
              <div data-probe="pc-query">
                <Popconfirm id="pc-ax-query" title="Delete this row?" density={responsiveDensity}>
                  <PressButton popovertarget="pc-ax-query">delete row</PressButton>
                </Popconfirm>
              </div>
            </ComponentCanvas>
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
        summary="A compact dialog-like popover puts the safe cancel action first and treats every light dismissal as cancel; a content override owns its own semantics."
      >
        <A11yTable
          keys={[
            { key: 'Tab', action: 'Move between Cancel and Confirm (the two-button row in the default rendering)' },
            { key: 'Escape', action: 'Cancel and close — the native light-dismiss path, wired to oncancel' },
            { key: 'open', action: 'Focus lands on CANCEL (the safe action — the system-dialog law in its light form); the destructive path is never the landing spot' },
          ]}
          aria={[
            { name: 'role', value: 'dialog', description: 'The confirmation surface — a light dialog on a popover=auto platform layer, never an alertdialog' },
            { name: 'aria-labelledby', value: '{id}-title', description: 'Names the default title content; DROPS when a content snippet renders (the caller wires their own ids)' },
            { name: 'aria-describedby', value: '{id}-desc', description: 'References the optional description — default rendering only' },
            { name: 'aria-expanded / aria-controls', value: 'mirrored on the trigger', description: 'The wrapper auto-wires the first button as the declarative popovertarget trigger and mirrors the live state every run' },
            { name: 'no aria-live', value: 'ruling', description: 'The outcome is the CALLER\u0027S event — onconfirm/oncancel are handlers, not announcements; compose a live region around your own flow when the change must be spoken' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="popconfirm" />
    </div>
  </div>
</div>
