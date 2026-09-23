<!--
  Docs page for the system-dialog family (docs-eight-axes-mdn task 34,
  MDN archetype; tier 2 优化重构 — the workbench, the system trio, the
  parts tables (rows byte-identical at new ordinals, matrix re-pinned)
  and the a11y table carried; the archetype gains overview/law + the
  measured eight-axes layer. Family untouched — the anchored alert on
  the popover base: self-carried promotion (the carriers stamp the
  popover panel), plus the imperative trio that mounts its own hosts.
-->
<script lang="ts">
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { alert, confirm, prompt } from '$lib/ui/system-dialog/index';
  import SystemDialog, {
    SystemDialogTrigger,
    SystemDialogContent,
    SystemDialogTitle,
    SystemDialogDescription,
    SystemDialogActions,
    SystemDialogAction,
    SystemDialogCancel,
  } from '$lib/ui/system-dialog/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import alertDialogSourceRaw from '$lib/ui/system-dialog/system-dialog.svelte?raw';
  import alertDialogContentRaw from '$lib/ui/system-dialog/system-dialog-content.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'system-dialog');
  if (!entry) {
    throw new Error('catalog miss: "system-dialog" has no registry meta — fix registry.json');
  }

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { deleted: false };
  let open = $state(false);
  let deleted = $state(canvasInitial.deleted);
  // the system trio's live readout (the section demo below)
  let systemResult = $state<string>('— not asked yet —');
  async function askConfirm(): Promise<void> {
    const ok = await confirm({ title: 'rotate the key?', description: 'minting a new key revokes the current one after 24 hours.' });
    systemResult = ok ? 'confirm → true (rotated)' : 'confirm → false (kept)';
  }
  async function askPrompt(): Promise<void> {
    const name = await prompt({ title: 'rename the workspace', inputLabel: 'name', initialValue: 'jixoai-labs/ui' });
    systemResult = name === null ? 'prompt → null (cancelled)' : `prompt → ${JSON.stringify(name)}`;
  }
  async function askAlert(): Promise<void> {
    await alert({ title: 'the key rotated', description: 'the old key stays valid for 24 more hours.' });
    systemResult = 'alert → acknowledged';
  }
  function resetCanvas(): void {
    deleted = canvasInitial.deleted;
  }

  const close = '</' + 'script>';

  const systemUsage = `import { alert, confirm, prompt } from '@ui/system-dialog/index';

await alert('the key rotated');
// → void (a single affirmative action)

const ok = await confirm('rotate the key?');
// → boolean (the action → true; Cancel/Escape → false)

const name = await prompt({ title: 'rename', inputLabel: 'name' });
// → string | null (Enter submits, Escape cancels → null)`;

  const usage = `<script lang="ts">
  import SystemDialog, {
    SystemDialogTrigger, SystemDialogContent, SystemDialogTitle,
    SystemDialogDescription, SystemDialogActions, SystemDialogAction,
    SystemDialogCancel,
  } from '@ui/system-dialog/index';
${close}

<SystemDialog bind:open onconfirm={() => (deleted = true)}>
  <SystemDialogTrigger>delete pipeline…</SystemDialogTrigger>
  <SystemDialogContent>
    <SystemDialogTitle>Delete the pipeline?</SystemDialogTitle>
    <SystemDialogDescription>
      This removes 12 checks and their history. There is no undo.
    </SystemDialogDescription>
    <SystemDialogActions>
      <SystemDialogCancel>cancel</SystemDialogCancel>
      <SystemDialogAction>delete pipeline</SystemDialogAction>
    </SystemDialogActions>
  </SystemDialogContent>
</SystemDialog>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/system-dialog/system-dialog.svelte', content: alertDialogSourceRaw },
    { name: 'registry/files/ui/system-dialog/system-dialog-content.svelte', content: alertDialogContentRaw },
    { name: 'src/lib/ui/system-dialog-usage.svelte', content: usage, kind: 'usage' },
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the law table: the anchored alert ----------------------------------
  const lawTable = [
    { posture: 'the parts contract', input: 'Root · Trigger · Content · Title · Description · Actions · Action · Cancel', renders: 'Root is the STATE CONTEXT only — bind:open + the onconfirm seam, rendered as a fragment (no element, no rest: consumer attributes have no landing). Title and Description are PARTS, never props — the ARIA wiring (labelledby/describedby over deterministic derived ids) is Content\u0027s job; an alert without words is caller error', announces: 'seven real elements over one invisible state holder' },
    { posture: 'alert gravity', input: 'popover="manual"', renders: 'NO light dismiss — an outside click must not silently answer a destructive question. Escape is the component\u0027s own cancel, SCOPED to the panel (the keydown lives on the popover: it cancels while focus is inside; a user who tabbed back to the page has left the question)', announces: 'measured: an outside click leaves the panel open' },
    { posture: 'the anchored rise', input: 'CSS Anchor Positioning', renders: 'the panel rises BESIDE the trigger that asked — anchor-name on the Trigger, position-anchor/area/try on the panel, symmetric margin so a flip finds the same gap, try-fallbacks flipping at the viewport edge, anchors-visible hiding it when the trigger scrolls away. pose="center" (the system trio) drops the chain for the UA\u0027s popover centering', announces: 'a question at its button, not a mode takeover' },
    { posture: 'the safe landing', input: 'focusLanding="cancel"', renders: 'focus lands on the CANCEL action on open (the APG safe-landing law — the destructive path must be a deliberate move), falling back to the action when no cancel exists; hiding the popover returns focus to the invoker — only when focus was ours; a REMOVED invoker deliberately leaves focus on the body (a dead panel must not steer it)', announces: 'the safe exit is one keypress away' },
    { posture: 'non-modal by design', input: 'Tab', renders: 'NO focus trap, no scroll lock — Tab is free: a user who tabs back to the page has left the question (the anchored alert is a popover-base surface, not a dialog() takeover). The top layer and ::backdrop scrim still come from the platform', announces: 'the page stays reachable; the question stays answered' },
    { posture: 'the confirm seam', input: 'SystemDialogAction', renders: 'the Action runs the Root\u0027s onconfirm, then the family\u0029s single animated close; the fill rung ships the DESTRUCTIVE pair injected (the loud path is opt-out). The imperative trio resolves EXACTLY ONCE — an action resolves its value, any close without one resolves the cancel value (false / null); never hangs', announces: 'one decision, one resolution' },
  ];

  // ---- the measured eight-axes layer ---------------------------------------
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, RUNG — the resolved lane stamps the §4 legacy rung on the panel (measured: density=\"small\" → data-density=\"sm\"). The parts resolve against the supply through Svelte CONTEXT, which follows the COMPONENT tree — never the top-layer promotion. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, VOICE — the §11 pair lands on the panel root (measured 18px computed on the size demo); the title's eyebrow voice and the description's 13px reading voice are the panel's own, the body text inherits the root. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "CONSUMED, PUBLISHED — corner-shape rides the §14 alias ladder on the panel, and the consumed corner is PUBLISHED as --jx-corner: the carved strip's end cells pair concentrically with the panel's curve instead of clipping past it (the corner-context law). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED, THE CONCENTRIC ANCHOR — an explicit lane stamps --jx-radius-effective on the promoted panel (self-carried across the top-layer promotion) and the consumed calc paints the silhouette AND publishes --jx-corner (measured 12px → both). 'auto' consumes against the panel's OWN ancestors. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — --jx-color-effective lands on the panel; the alert's ink is popover-foreground (the platform element paints nothing — the surface body owns fill), so the lane's work is the scope the parts read. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "BRIDGE — class:dark lands on the promoted panel (measured) and re-voices the surface body + scrim through the token scope. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'level3' · the family's declared own`,
      description:
        "OWN, level3 — the system alert's historic z-feel (6dp: one rung under the modal dialog — it rises BESIDE its trigger, not over the page). The §7 consumption pair stamps the shadow recipe + the paired ladder-rung surface on the panel (measured in the style attr). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLIED, READ BY THE KERNEL — the panel rides the shared WAAPI surface-motion kernel (--jx-p drives every formula; hidePopover fires IMMEDIATELY on the falling edge and the exit rides the kernel's discrete window). Reduced motion degades to the state alone. Number unit: coefficient.",
    },
  ];

  const axisTokens = [
    { name: '--jx-corner', default: 'the published corner', source: 'component' as const, description: 'The consumed radius PUBLISHED on the panel — flush inhabitants (the split strip\u0029s end cells) pair concentrically instead of clipping past the curve.' },
    { name: '--scrim', default: '::backdrop', source: 'color' as const, description: 'Alert-grade scrim — semi-transparent black (light) / white (dark), never a brand tint.' },
    { name: '--jx-p', default: 'the kernel timeline', source: 'structural' as const, description: 'The surface-motion progress driving open/close; the exit rides the discrete display window.' },
    { name: 'the split strip', default: 'flex over the group grid', source: 'component' as const, description: 'flex: 1 1 0 equalizes + fills the cells, min-width: max-content floors the label, justify-content centers it — the carved action band.' },
    { name: 'the viewport measure', default: 'min(24rem, 100vw − 2rem) — AUTHORED, NOT SERVED', source: 'structural' as const, description: 'The authored width cap. MEASURED DEFECT (W-next #8, second family repro): the served anchored panel computes 544.5px with max-width none — no rule in any served stylesheet sets the 24rem cap (the atom exists in the stylex source of record and never ships; a 1440px stretch form also observed). Mechanism-agnostic: the anchor is proven correct, the width loss is independent. Engines without the full anchored set take the authored viewport-center fallback (margin auto !important).' },
  ];

  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<SystemDialog bind:open onconfirm={run}>
  <SystemDialogTrigger>rotate keys…</SystemDialogTrigger>
  <SystemDialogContent elevation="level4">…</SystemDialogContent>
</SystemDialog>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/system-dialog-universal.svelte', content: universalUsage },
  ];
  let sd = $state(false);
</script>

<svelte:head>
  <title>System dialog · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai system-dialog family: the destructive-decision surface composed — Root carries bind:open + the onconfirm seam, Content is a popover=manual panel that rises beside its trigger (CSS Anchor Positioning, flips at the viewport edge, no light dismiss; Escape=cancel), Title/Description wire the ARIA, Actions/Action/Cancel close the decision."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · NativeHTML"
        title="system dialog — the deliberate destructive"
        summary={entry.summary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">role=alertdialog</span>
          <span class="pill">focus → cancel</span>
          <span class="pill">destructive by default</span>
          <span class="pill">7 composed parts</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="system-dialog" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="The destructive-decision surface, composed shadcn-shape on the popover base: Root carries the state, Trigger carries the anchor, Content is a manual popover that rises beside its trigger, and the Action parts close the decision through one seam."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            system-dialog is the family that takes
            <code>window.confirm</code> seriously. The composition is
            shadcn-shaped but the base is the popover engine: Content is a
            <code>popover="manual"</code> panel — top layer and ::backdrop
            scrim from the platform — that rises BESIDE the button which asked
            the question (CSS Anchor Positioning: the Trigger publishes the
            anchor-name, the panel resolves position-anchor/area/try, and the
            native try-fallbacks flip it at the viewport edge). Manual means
            alert gravity: no light dismiss — an outside click never silently
            answers a destructive question — and Escape is the component's own
            cancel, scoped to the panel. Title and Description are parts, not
            props: the ARIA wiring (role=alertdialog, labelledby/describedby
            over deterministic derived ids) is Content's job.
          </p>
          <p class={cx(rt.measurePara)}>
            The delivery shape is the fleet's self-carried portal (the
            carriers stamp the popover panel, which the platform promotes) —
            with two twists worth naming. The parts resolve their axes
            through Svelte CONTEXT, which follows the component tree, never
            the top-layer promotion. And the family has a SECOND face: the
            imperative trio — <code>alert()</code>,
            <code>confirm()</code>, <code>prompt()</code> — mounts its own
            hosts at viewport center (pose="center": a system question has no
            trigger to rise beside), resolves EXACTLY ONCE (an action
            resolves its value; any close without one resolves the cancel
            value), and unmounts after the exit window.
          </p>
          <p class={cx(rt.measurePara)}>
            The anchored rise, measured: the Trigger publishes the
            anchor-name and the panel resolves
            <code>position-anchor</code> with
            <code>position-area: block-end</code> — the panel opens BELOW the
            trigger, centered on it, with the <code>--jx-gap</code> breathing
            room (12px). Near a viewport edge the try chain (flip-block,
            flip-inline, and the combined flip) re-buckets the panel instead
            of clipping it, and <code>anchors-visible</code> hides it if the
            trigger scrolls away. The system trio's
            <code>pose="center"</code> drops the chain and lets the UA's own
            popover centering own the panel (measured dead-center). One
            measured defect rides the family ledger rather than this page's
            claims: the anchored panel's authored width cap
            (<code>min(24rem, 100vw − 2rem)</code>) does not reach the
            served panel (544.5px at max-width none; no served stylesheet
            rule sets the cap — W-next #8's second family repro,
            mechanism-agnostic: the anchor itself is proven correct).
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="system-dialog-demo" data-reveal="">
      <ComponentCanvas
        title="system dialog"
        stage="center"
        description="Open it: the alert rises BESIDE the button that asked — position-area: block-end, centered on the trigger with the --jx-gap breathing room (near a viewport edge the try-fallbacks flip it to the other side). Focus lands on Cancel (Tab straight to Delete). Escape cancels through the component's own handler — manual popover, no light dismiss on a destructive question. Confirm runs the root's onconfirm seam; hiding the popover restores focus to the invoker."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/system-dialog/system-dialog.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'deleted', value: deleted ? 'yes' : 'no' }]}
      >
        <div class={cx(rt.wrapRow16)}>
          <SystemDialog bind:open onconfirm={() => (deleted = true)}>
            <SystemDialogTrigger class={cx(rt.sdGhostBtn)}>
              delete pipeline…
            </SystemDialogTrigger>
            <SystemDialogContent>
              <SystemDialogTitle>delete the pipeline?</SystemDialogTitle>
              <SystemDialogDescription>
                this removes 12 checks and their history. there is no undo.
              </SystemDialogDescription>
              <p class={cx(rt.text125)}>the checks being removed: lint, typecheck, size-budget, a11y-audit…</p>
              <SystemDialogActions>
                <SystemDialogCancel>cancel</SystemDialogCancel>
                <SystemDialogAction>delete pipeline</SystemDialogAction>
              </SystemDialogActions>
            </SystemDialogContent>
          </SystemDialog>
          <SystemDialog>
            <SystemDialogTrigger class={cx(rt.sdGhostBtn)}>
              rename pipeline…
            </SystemDialogTrigger>
            <SystemDialogContent>
              <SystemDialogTitle>Rename the pipeline?</SystemDialogTitle>
              <SystemDialogDescription>
                The new slug applies to every check's history — references update with it.
              </SystemDialogDescription>
              <SystemDialogActions>
                <SystemDialogCancel>cancel</SystemDialogCancel>
                <SystemDialogAction variant="tonal">save changes</SystemDialogAction>
              </SystemDialogActions>
            </SystemDialogContent>
          </SystemDialog>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              title and description are PARTS now — the ARIA wiring is Content's job (deterministic
              derived ids), the words are yours where they render. Action paints through the variant
              grammar: bare is <code class={cx(rt.inkAccent)}>fill</code> with the destructive pair injected
              (the loud path is opt-out); <code class={cx(rt.inkAccent)}>variant="tonal"</code> reads as a
              brand-tinted positive confirm, or inject the brand pair on fill for a solid one.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="system" data-reveal="">
      <SectionCard family="system" headerRegion="system" eyebrow="system" title="System dialogs — alert · confirm · prompt" summary="The imperative trio carries window.alert / window.confirm / window.prompt on the family's one engine, with TWO deliberate postures: the composed family above ANCHORS beside its trigger (the question rises at the button that asked — near the page top when the trigger lives there), while the trio always rises at the exact VIEWPORT CENTER (pose=center: a system question has no trigger to anchor beside; the UA popover centering owns the geometry). The carved split strip centers its labels and never wraps while space suffices. Every call resolves exactly once — an action resolves its value, any close without one resolves the cancel value."><div class={cx(rt.col20)}><div class={cx(rt.flex, rt.wrap, rt.gap10)}><PressButton onclick={askAlert}>alert()</PressButton><PressButton onclick={askConfirm}>confirm()</PressButton><PressButton onclick={askPrompt}>prompt()</PressButton></div><p class={cx(rt.fontMono, rt.text125, rt.inkMuted)} data-testid="system-result">{systemResult}</p><CodeBlock code={systemUsage} lang="ts" meta="system trio" /></div></SectionCard>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The anchored alert"
        summary="Alert gravity on the popover base: no light dismiss, the safe landing, the non-modal page, one confirm seam with exactly-once resolution — measured, not asserted."
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
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="The surface paint and the confirm tone are the two variant axes; everything else is the fixed alertdialog contract.">
      <div class={cx(rt.sdGridMd3)}>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>Content variant</p>
          <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>variant="auto"</code> (default) picks acrylic unless the environment asks for reduced transparency; <code class={cx(rt.inkAccent)}>"solid"</code> and <code class={cx(rt.inkAccent)}>"acrylic"</code> force one.</p>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>Action variant</p>
          <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>variant="fill"</code> (default) ships with the destructive pair injected — the loud path is opt-OUT; <code class={cx(rt.inkAccent)}>"tonal"</code> is the brand-tinted positive confirm; <code class={cx(rt.inkAccent)}>"outline"</code> stays quiet.</p>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>Composed family</p>
          <p class={cx(rt.body13)}>Seven parts: Root (state context), Trigger, Content (the manual popover), Title, Description, Actions, Action, Cancel — each a real element, no slots.</p>
        </div>
      </div>
    </SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Root owns bind:open + the onconfirm seam; Title and Description are parts — an alert without words is not an alert."><CodeBlock code={usage} lang="svelte" meta="SystemDialog usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="APG alertdialog law on the popover base: focus lands on Cancel on open, Escape cancels through the component-owned handler (keydown lives on the panel — Escape cancels while focus is inside it; a user who tabbed back to the page has left the question), hiding the popover restores focus to the invoker (a removed invoker deliberately leaves focus on the body — focus is never steered into dead markup); Tab is free — the anchored alert is non-modal by the popover-engine ruling."><A11yTable keys={[{ key: 'Escape', action: 'Cancels — SCOPED to the panel: the keydown handler lives on the popover itself, so it fires while focus is inside the panel; the component-owned keydown is prevented and runs through the state close (manual popover — no light dismiss)' }, { key: 'Tab', action: 'Free — the anchored alert is non-modal (popover base: no focus trap); hiding the popover restores focus to the invoker, or to the body if the invoker was removed while open' }, { key: 'Enter / Space', action: 'Activates the focused button — Cancel (focused on open) or Action' }]} aria={[{ name: 'role', value: 'alertdialog', description: 'On Content (the popover panel div).' }, { name: 'aria-labelledby', value: '{uid}-title', description: 'Points at the deterministic id Title renders; derived from the root uid.' }, { name: 'aria-describedby', value: '{uid}-desc', description: 'Points at the deterministic id Description renders.' }, { name: 'aria-haspopup', value: 'dialog', description: 'On the Trigger button.' }, { name: 'aria-expanded', value: 'true/false', description: 'On the Trigger; mirrors the open state.' }]} /></SectionCard></div>

    <div id="parts" data-reveal="">
      <SectionCard family="parts" headerRegion="parts" eyebrow="api" title="API — the parts" summary="The family's parts, each with its own props; all button/element parts forward their native HTML attributes."><div class={cx(rt.col24)}><PropsTable universal title="SystemDialog (root)" props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Controlled open state (bind:open); the root renders no element.', bindable: true }, { name: 'onconfirm', type: '() => void', default: '—', description: 'The confirm seam: runs on SystemDialogAction, then the dialog closes.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The family parts.' }]} /><PropsTable title="SystemDialogTrigger" props={[{ name: 'child', type: 'Snippet<[{ props }]>', default: '—', description: 'Replacement-element escape: spread {...props} on your own button.' }, { name: 'children', type: 'Snippet', default: '—', description: 'Trigger label; spreads HTMLButtonAttributes.' }]} /><PropsTable title="SystemDialogContent" props={[{ name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint; auto falls back to solid under reduced transparency. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }, { name: 'pose', type: "'anchored' | 'center'", default: "'anchored'", description: 'The panel’s posture: anchored rides CSS Anchor Positioning against the trigger; center (the system trio) drops the anchor chain and lets the UA popover centering own the panel — the window.confirm posture.' }, { name: 'focusLanding', type: "'cancel' | 'none'", default: "'cancel'", description: 'Where focus lands on open: cancel (the APG safe-landing law, falling back to the action when no cancel exists) or none (the caller owns the landing — the prompt form focuses its input).' }, { name: 'children', type: 'Snippet', default: '—', description: 'Title, Description, free body, and the Actions row; spreads HTMLAttributes (a popover panel div).' }]} /><PropsTable title="SystemDialogAction / Cancel / Title / Description / Actions" props={[{ name: 'variant', type: "'fill' | 'tonal' | 'outline'", default: "'fill' · Own default, not ambient", description: 'Action only: the confirm paint on the ladder — fill ships with the destructive pair injected (the opt-out loud path); flip the injection to the brand pair or switch to tonal for positive confirmations. Own default, not ambient (the action ladder is outside the paint zone’s frozen availability table).' }, { name: 'children', type: 'Snippet', default: '—', description: 'Shared by all five parts; each spreads its native element attributes.' }, { name: 'id (Title/Description)', type: 'string', default: '{uid}-title / -desc', description: 'Deterministic derived ids Content’s aria wiring points at.' }]} /></div></SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on system-dialog"
        summary="Self-carried across the promotion: the carriers stamp the popover panel, the parts resolve through Svelte context (which follows the component tree, never the promotion), and the panel PUBLISHES its consumed corner so flush inhabitants pair concentrically. Owns: variant (auto), actionVariant (fill), tone (destructive), elevation (level3)."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="SystemDialog · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.wrap12)} data-probe="sysdlg-size">
                <PressButton onclick={() => (sd = true)}>level3 · default</PressButton>
              </div>
              <SystemDialog bind:open={sd} onconfirm={() => {}}>
                <SystemDialogTrigger>rotate keys…</SystemDialogTrigger>
                <SystemDialogContent density="small" theme="dark" radius={12}>
                  <SystemDialogTitle>Rotate every key?</SystemDialogTitle>
                  <SystemDialogDescription>All sessions re-authenticate. The own elevation is level3 — 6dp, one rung under the modal dialog.</SystemDialogDescription>
                  <SystemDialogActions>
                    <SystemDialogCancel>cancel</SystemDialogCancel>
                    <SystemDialogAction>rotate keys</SystemDialogAction>
                  </SystemDialogActions>
                </SystemDialogContent>
              </SystemDialog>
            </ComponentCanvas>
            <p class={cx(rt.bodyMuted, rt.mt16)}>
              The stamps land on the PROMOTED panel: the rung, the dark
              bridge, and the 12px consumed radius (published as --jx-corner
              for the strip's end cells) — while the own elevation level3
              rides the style attr even with no lane named.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsSeeAlso name="system-dialog" />
    </div>
  </div>
</div>
