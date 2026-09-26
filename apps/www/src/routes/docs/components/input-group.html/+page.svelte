<!--
  Docs page for the input-group family (OpenSpec
  2026-08-30-expand-form-family F2, 2026-08-30).

  docs-demo-standard skeleton: Intro → Install → live demo (canvas) →
  Usage (the ONE h2) → Examples (ability-named canvases) →
  Accessibility → API → Theming → See also. Every canvas carries a
  playground pane (the structure lint), and the demo copy never uses
  real headings (the data-doc-demo-content scope).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { PlayFields, PlayRow, PlayText, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
  import { meta as inputGroupMeta } from '$lib/meta/input-group.meta';
  import { INPUT_GROUP_DOCS } from '$lib/ui/props-table/docs/input-group.docs';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inputGroupSource from '$lib/ui/input-group/input-group.svelte?raw';
  import inputGroupAddonSource from '$lib/ui/input-group/input-group-addon.svelte?raw';
  import inputGroupInputSource from '$lib/ui/input-group/input-group-input.svelte?raw';

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- live demo state (playground protocol: snapshots + reset) --------
  const canvasInitial = { site: '', prefix: 'https://', locked: false };
  let site = $state(canvasInitial.site);
  let prefix = $state(canvasInitial.prefix);
  let locked = $state(canvasInitial.locked);
  function resetCanvas(): void {
    site = canvasInitial.site;
    prefix = canvasInitial.prefix;
    locked = canvasInitial.locked;
  }
  const usageLive = $derived(
    `<InputGroup label="repository url"${locked ? ' disabled' : ''}>
  <InputGroupAddon>${prefix || 'https://'}</InputGroupAddon>
  <InputGroupInput name="site" bind:value={site} placeholder="jixoai.com" />
  <InputGroupAddon align="inline-end">
    <PressButton variant="tonal">check</PressButton>
  </InputGroupAddon>
</InputGroup>`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- density: CONSUMED + PROVIDED — the shell atoms read the
     rung-re-based channels, and the resolved tier is provided to the
     subtree (the r11 inherit-then-provide contract) -->
<InputGroup label="endpoint" density="lg">
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput name="host" placeholder="status.jixoai.com" />
</InputGroup>

<!-- theme: the emission-form split — the addon seams, focus ring,
     disabled border and well shadow (raw css reads) flip under a
     dark island; the ground and base bezel (defineVars aliases,
     resolved at the stylex :root scope) hold the page profile -->
<InputGroup label="endpoint" theme="dark">
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput name="host" placeholder="status.jixoai.com" />
</InputGroup>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/input-group-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the shell's rhythm —
  // the base (large) applies below the 48rem viewport; at 48rem+ the
  // md case wins and the shell compacts. The string lane needs both
  // generics (the campaign's typing law).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import { InputGroup, InputGroupAddon, InputGroupInput } from '@ui/input-group/index';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<InputGroup label="responsive group" density={query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'large')}>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput name="host" placeholder="status.jixoai.com" />
</InputGroup>`;

  const queryFiles: TreeFile[] = [{ name: 'input-group-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5). Grep receipts: zero -effective
  // readers in ui/input-group/ (the supply rows); the density row names
  // the family's own atom reads. The W3-era "consumes size and color"
  // claim is corrected here: that was the §1 forwarding rule, not
  // consumption.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-size-effective; no family css reads it (grep receipt: zero readers in ui/input-group/ — the W3-era 'consumes size' claim was the §1 forwarding rule mistaken for consumption). The shell sizes from the density channels, not the size axis; the stamp supplies composed addon children. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero corner-shape declarations — the shell's corner comes from the consumed Tier-2 control-lane vocabulary, not the axis). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers — no concentric chain lives in the shell). Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'ambient scope'`,
      description:
        "CONSUMED + PROVIDED — the composer's lane. The named rung stamps data-density on the root and the scope re-bases the channels the shell atoms read: --jx-hit (the lane's min height), --jx-inset (the addon lane's padding; the input part is chromeless), --jx-text (type), --jx-gap (the addon gap) — measured below. AND the resolved tier is PROVIDED to the subtree: inherit-then-provide (the r11 eager-capture contract, spec-pinned) — addon children adopt the group's opinion. Number/query lanes carry no legacy rung (the coefficient rides the carriers). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers — the W3-era 'consumes color' claim was the §1 forwarding rule). The shell's state voices are the raw theme tokens (--ring focus, --muted disabled); hue that paints comes from the theme or the jx-hue-* injection. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE MIXED POLE — the split follows the emission form (measured below). FLIP (raw css reads in the state machines): the addon seams (--border), the focus ring tint + outline (--ring), the disabled border (--muted), and the well shadow pair (--shadow-well / --shadow-well-hover). FROZEN (stylex defineVars aliases, resolved at the :root scope): the shell ground (--jx-background), the base bezel (--jx-border on --jx-hairline) and the addon ink (--jx-muted-foreground) — one bezel, two regimes on either side. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero readers). The shell's rest/hover shadow is the input family's WELL tier recipe (--shadow-well pair) — a fixed recipe, not the §7 consumption pair. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The shell's transition reads the kernel presets verbatim (--motion-150 / --motion-ease-out) with the prefers-reduced-motion kill (input-group.css) — the axis has no family-local kernel to step. Number unit: coefficient.",
    },
  ];

  // the consumption channels + the fixed/raw voices (mixed TokenTable:
  // the density rows carry the density source; the rest are structural)
  const axisTokens = [
    { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' as const, description: 'The lane\'s min-block-size — the shell breathes with the rung.' },
    { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' as const, description: 'The addon lane\'s inline padding — the input part stays chromeless.' },
    { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' as const, description: 'The shell\'s type voice.' },
    { name: '--jx-gap', default: 'rung gap', source: 'density' as const, description: 'The addon-to-field gap.' },
    { name: '--shadow-well / -hover', default: 'the input family\'s well tier', source: 'structural' as const, description: 'The shell\'s rest/hover shadow — raw css reads that flip per theme; a fixed recipe, not the §7 elevation pair.' },
    { name: '--ring / --muted', default: 'raw theme tokens', source: 'structural' as const, description: 'The focus tint + outline and the disabled border — the css state machines\' raw voices (flip under .dark).' },
    { name: '--border seams', default: 'raw theme token', source: 'structural' as const, description: 'One hairline per addon, facing the lane — flips under .dark while the stylex base bezel freezes.' },
    { name: '--jx-background / --jx-border / --jx-muted-foreground', default: 'defineVars aliases (frozen)', source: 'structural' as const, description: 'The shell ground, base bezel and addon ink — resolved at the stylex :root scope, so a scoped .dark cannot re-substitute them.' },
    { name: '--jx-hairline', default: '1px', source: 'structural' as const, description: 'The bezel weight (typed token).' },
  ];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/input-group/input-group.svelte', content: inputGroupSource },
    { name: 'registry/files/ui/input-group/input-group-addon.svelte', content: inputGroupAddonSource },
    { name: 'registry/files/ui/input-group/input-group-input.svelte', content: inputGroupInputSource },
    { name: 'src/lib/ui/input-group-usage.svelte', content: usageLive, kind: 'usage' },
  ];

  // ---- example: the select add-on ---------------------------------------
  let protocol = $state('https://');
  let host = $state('status');

  // ---- example: the submitted form --------------------------------------
  const formInitial = { preview: '' };
  let preview = $state(formInitial.preview);
  let submitted = $state('');
  let submittedEmpty = $state(false);
  function resetFormDemo(): void {
    preview = formInitial.preview;
    submitted = '';
    submittedEmpty = false;
  }
  function deploy(event: SubmitEvent): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const value = String(data.get('preview') ?? '');
    submitted = value;
    // the honest empty submit: an untouched field commits '' — FormData
    // carries the entry, the UI just reports it truthfully
    submittedEmpty = value === '';
  }

  // ---- the ONE usage sample (drawer + body CodeBlock share it) ----------
  const usage = `<script lang="ts">
  import { InputGroup, InputGroupAddon, InputGroupInput } from '@ui/input-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<InputGroup label="repository url">
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput name="site" bind:value placeholder="jixoai.com" />
  <InputGroupAddon align="inline-end">
    <PressButton variant="tonal">check</PressButton>
  </InputGroupAddon>
</InputGroup>`;
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(
        (style): style is string | { readonly [key: string]: string | object } =>
          Boolean(style),
      )
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Input group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai input-group family: the joined field shell over the input's shared shell law — InputGroupAddon lanes (text, icon, button, select) compose beside a chromeless InputGroupInput under ONE 1px bezel, with 1px hairline seams (no double borders) and ONE disabled propagation rule (root disable ⇒ native disabled on the lane + inert addons)."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Entry"
        title="input-group — the joined field shell"
        summary="The Origin UI “Input with X” family over the input's shared shell law: addons compose BESIDE the field, not inside a private composite. One 1px var(--border) bezel carries the shell states (hover lift, inset focus ring, invalid dash); each addon owns exactly one hairline seam facing the lane; the InputGroupInput stays a chromeless Tier-2 control-lane — no double borders by construction. ONE disabled propagation rule: disable the root and the lane renders native disabled while every addon goes inert (the platform's containment — buttons, selects and links inside lose activation and focus at once)."
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install input-group">
          <TerminalCard
            barTitle="install — input-group"
            command="npx jixoai-ui add input-group"
            outputs={['https://ui.jixoai.com/r/input-group.json', 'the group, addon and input parts — one item']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">composition parts</span>
          <span class="pill">1px hairline seams</span>
          <span class="pill">one disabled rule · inert</span>
          <span class="pill">Tier-2 control-lane</span>
          <span class="pill">zero deps · Svelte 5 runes</span>
        </div>
      </SectionCard>
    </div>

    
    <!-- overview (docs-eight-axes-mdn task 17, tier 2: the skeleton was
         complete; this section + the measured per-axis table replace the
         W3-era universal summary whose "consumes size and color" claim
         the greps disproved) -->
    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="Composition parts over the input's shared shell law: addons compose BESIDE the field, the group owns the one bezel and the name, and ONE disabled rule propagates."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Three parts compose the joined field: <code>InputGroupAddon</code> lanes (text, an
            icon glyph, a PressButton, a whole NativeSelect) beside a chromeless
            <code>InputGroupInput</code> — the real <code>&lt;input&gt;</code>, keep-alive for
            typing, parsing, FormData and <code>label[for]</code>. The group root owns ONE 1px
            bezel carrying the input family's shell states (the well shadow, hover intensity,
            the inset focus ring, the invalid dash), each addon owns exactly one hairline seam
            facing the lane, and the input stays chromeless — no double borders by construction.
          </p>
          <p class={cx(rt.measurePara)}>
            Two contracts are pinned by the family spec. The name: the root is a
            <code>role=group</code> landmark named by <code>label</code> (an explicit rest
            aria-label wins; aria-labelledby flows through). Disabled: ONE propagation rule —
            disabling the root renders the lane native-disabled while every addon goes inert
            (the platform's containment), and the input's own <code>disabled</code> stays
            per-part beside it. The house value law is avatar-plain: bound ⇒ controlled, absent
            ⇒ purely uncontrolled; FormData and form.reset() keep native behavior.
          </p>
          <p class={cx(rt.measurePara)}>
            The eight axes resolve on the group root as a composer: density is the one CONSUMED
            axis (the shell atoms read the rung-re-based channels) AND the provider — the
            resolved tier is inherit-then-provide to the subtree (the r11 eager-capture
            contract, spec-pinned), so addon children adopt it. The other seven stamp-and-supply
            (grep receipt: zero effective-carrier readers in ui/input-group/ — the W3-era
            "consumes size and color" was the §1 collision rule mistaken for consumption).
            Theme splits by emission form: the css state machines read raw tokens and flip
            under a dark island; the stylex base freezes. Per-axis below; the shared grammar
            lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="igroup-demo" data-region="igroup-demo" data-family="igroup-demo" data-reveal="">
      <ComponentCanvas
        title="input-group"
        description="Text prefix, live value, action suffix — the playground flips the group disable and edits the prefix; the usage file in the drawer tracks both."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-group/input-group.svelte"
        files={canvasFiles}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'value', value: site || '—' },
          { label: 'disabled', value: locked ? 'true' : 'false' },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(rt.col12, rt.itemsStart, rt.wFull, rt.maxWMd)}>
          <InputGroup label="repository url" disabled={locked}>
            <InputGroupAddon>{prefix || 'https://'}</InputGroupAddon>
            <InputGroupInput name="site" bind:value={site} placeholder="jixoai.com" />
            <InputGroupAddon align="inline-end">
              <PressButton variant="tonal">check</PressButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="disabled">
              <PlayToggle bind:value={locked} />
            </PlayRow>
            <PlayRow label="prefix">
              <PlayText bind:value={prefix} placeholder="https://" />
            </PlayRow>
            <PlayHelp>
              disabling the group sends the lane native <code class={cx(rt.inkAccent)}>disabled</code> and
              the addons <code class={cx(rt.inkAccent)}>inert</code> — the check button loses activation
              and focus with them. One rule, no per-child chasing.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Compose the group from parts: addons for the lanes, the input part for the field. The group root owns the name; the input owns the form participation."
    >
      <CodeBlock code={usage} lang="svelte" meta="Input group usage" />
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named demos — one phrase, one capability. Every demo is live; open the code drawer for the exact composition."
    >
      <p class={cx(rt.m0, rt.bodyMuted)}>
        The demos below live on their own canvases — a select add-on, then the submitted-form
        contract. The disabled propagation rule plays in the live demo up top.
      </p>
    </SectionCard>
  </div>

  <div id="igroup-select" data-region="igroup-select" data-family="igroup-select" data-reveal="">
    <ComponentCanvas
      title="with a select add-on"
      description="A NativeSelect rides the start addon — the protocol picker — while the field keeps the host. Addons carry any control; the seam stays one hairline."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-group/input-group-addon.svelte"
      files={[
        { name: 'registry/files/ui/input-group/input-group-addon.svelte', content: inputGroupAddonSource },
      ]}
      stage="fill"
      output={[
        { label: 'protocol', value: protocol },
        { label: 'host', value: host || '—' },
      ]}
    >
      <div class={cx(rt.col12, rt.itemsStart, rt.wFull, rt.maxWMd)}>
        <InputGroup label="endpoint">
          <InputGroupAddon>
            <NativeSelect bind:value={protocol} class={cx(rt.text125)} aria-label="protocol">
              <option value="https://">https://</option>
              <option value="http://">http://</option>
            </NativeSelect>
          </InputGroupAddon>
          <InputGroupInput name="host" bind:value={host} placeholder="status.jixoai.com" />
        </InputGroup>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the addon lane is the consumer's composition — text, an icon glyph, a button, or a
            whole select. Disabled on the root would inert the select with everything else.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="igroup-form" data-region="igroup-form" data-family="igroup-form" data-reveal="">
    <ComponentCanvas
      title="in a submitted form"
      description="The input part is a real native field: give it a name and FormData carries it. Submit empty to see the honest empty commit."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-group/input-group-input.svelte"
      files={[
        { name: 'registry/files/ui/input-group/input-group-input.svelte', content: inputGroupInputSource },
      ]}
      stage="fill"
      onreset={resetFormDemo}
      output={[{ label: 'submitted preview', value: submitted === '' ? (submittedEmpty ? '(empty)' : '—') : submitted }]}
    >
      <form class={cx(rt.col12, rt.itemsStart, rt.wFull, rt.maxWMd)} onsubmit={deploy}>
        <InputGroup label="deploy preview url">
          <InputGroupAddon>https://</InputGroupAddon>
          <InputGroupInput name="preview" bind:value={preview} placeholder="preview-2026" />
          <InputGroupAddon align="inline-end">.jixoai.app</InputGroupAddon>
        </InputGroup>
        <PressButton type="submit" variant="fill">deploy</PressButton>
      </form>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            <code class={cx(rt.inkAccent)}>name</code> rides the input part, so submission is the
            platform's: <code class={cx(rt.inkAccent)}>FormData.get('preview')</code>. An untouched field
            commits the empty string — no invented value, no omitted entry.
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
      summary="The root is a named group landmark; the field keeps its native semantics; disabled containment is the platform's inert — not a theater of aria-disabled."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Focus the field lane; addons keep their own stops (a button or select inside is a real control)' },
          { key: 'Disabled root', action: 'The lane is native-disabled; every addon goes inert — no focus, no activation, nothing announced as active' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'The root landmark — override with an explicit role through the rest props only when you own the semantics' },
          { name: 'aria-label', value: 'label', description: 'The group accessible name — or pass aria-labelledby through the rest props; a nameless group is announced as nothing' },
          { name: 'input', value: 'native', description: 'The real <input> keeps typing, parsing, FormData and label[for] wiring' },
          { name: 'inert', value: 'platform', description: 'Group disable contains the addons natively — descendants lose activation AND focus at once' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on input-group"
      summary="A composer's surface (census batch A, the input family's shared shell law): density is the one CONSUMED axis — the shell atoms read the rung-re-based channels — and simultaneously the PROVIDER (inherit-then-provide to the subtree, the r11 eager-capture contract). The other seven stamp-and-supply with zero family readers (grep receipt; the W3-era 'consumes size and color' claim was the §1 collision rule mistaken for consumption — corrected here). Theme splits by emission form: the css state machines' raw tokens flip under a dark island while the stylex base freezes. The carriers stamp the group root, greppable in the raw SSR."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch A row (the input family —
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule:
          the native input never receives size or color ATTRIBUTES — that forwarding rule was
          the W3 summary's whole truth; axis CONSUMPTION is a css-read question, and the greps
          answer it: zero readers. The provider lane is pinned by
          test/defaults-form-families.spec.ts (the r11 eager-capture contract).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on input-group" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="input-group · the consumed lane and the emission-form split" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="ig-density-default">
                <span class={cx(rt.note11)}>density auto — the ambient rung</span>
                <InputGroup label="density default">
                  <InputGroupAddon>https://</InputGroupAddon>
                  <InputGroupInput name="ig-den-default" placeholder="jixoai.com" />
                </InputGroup>
              </div>
              <div class={cx(rt.panel)} data-probe="ig-density-lg">
                <span class={cx(rt.note11)}>density="lg" — the shell breathes (hit, inset, text, gap)</span>
                <InputGroup label="density lg" density="lg">
                  <InputGroupAddon>https://</InputGroupAddon>
                  <InputGroupInput name="ig-den-lg" placeholder="jixoai.com" />
                </InputGroup>
              </div>
              <div class={cx(rt.panel)} data-probe="ig-theme-light">
                <span class={cx(rt.note11)}>light — the ambient profile</span>
                <InputGroup label="light group">
                  <InputGroupAddon>https://</InputGroupAddon>
                  <InputGroupInput name="ig-th-light" placeholder="jixoai.com" />
                </InputGroup>
              </div>
              <div class={cx(rt.panel)} data-probe="ig-theme-dark">
                <span class={cx(rt.note11)}>theme="dark" — the state machines and seams flip; the stylex base freezes</span>
                <InputGroup label="dark group" theme="dark">
                  <InputGroupAddon>https://</InputGroupAddon>
                  <InputGroupInput name="ig-th-dark" placeholder="jixoai.com" />
                </InputGroup>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The density pair is the consumed lane, measured: the lg rung's scope re-bases
              --jx-hit/--jx-inset/--jx-text/--jx-gap and the shell atoms read them — the group
              grows in height, padding and type. The theme pair is the emission-form split,
              measured: the addon SEAM and the well shadow (raw css reads) follow the island
              while the shell's base bezel and ground (defineVars aliases resolved at the stylex
              :root scope) hold the page profile — the same substitution-site law heading's lead
              and image's panel proved, now on both sides of one bezel.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="input-group · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <InputGroup label="responsive group" density={responsiveDensity}>
                <InputGroupAddon>https://</InputGroupAddon>
                <InputGroupInput name="ig-query" placeholder="jixoai.com" />
              </InputGroup>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the large rung, the
                touch-size shell; at 48rem and wider the md case wins and the group compacts.
                The string lane takes both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={axisTokens} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three parts, one context: the root owns the disable propagation and the name; the addon owns a lane; the input owns the field. The table renders 17 meta entries − 2 citation duplicates = 15 unique − 8 axis-named = 7 family rows + the synthesized rest (with data-density as a family row — the legacy attribute escape hatch) = 8 served rows."
    >
      <div class={cx(rt.col24)}>
        <PropsTable meta={inputGroupMeta} docs={INPUT_GROUP_DOCS} />
        <PropsTable
          props={[
            { name: 'align (InputGroupAddon)', type: "'inline-start' | 'inline-end'", default: "'inline-start'", description: 'Which lane the addon sits in; the hairline seam always faces the input.' },
            { name: 'children (InputGroupAddon)', type: 'Snippet', default: 'required', description: 'Text, an icon glyph, a PressButton, a NativeSelect — your composition.', required: true },
            { name: 'value (InputGroupInput)', type: 'string | number', default: '—', description: 'Bound ⇒ controlled, absent ⇒ purely uncontrolled (FormData / form.reset untouched).', bindable: true },
            { name: 'disabled (InputGroupInput)', type: 'boolean', default: 'false', description: 'Per-part lane disable — addons keep working beside it.' },
            { name: '...rest (InputGroupInput)', type: 'HTMLInputAttributes', default: '—', description: 'name, placeholder, type, required — every native input attribute.' },
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
      summary="The family around the joined shell."
    >
      <div class={cx(rt.wrap12)}>
        <a class="pill" href="/docs/components/input.html">input — the native field</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — addon actions</a>
        <a class="pill" href="/docs/components/native-select.html">native-select — addon pickers</a>
        <a class="pill" href="/docs/components/button-group.html">button-group — joined actions</a>
        <a class="pill" href="/docs/components/tags-input.html">tags-input — chips in one shell</a>
      </div>
    </SectionCard>
  </div>
</div>
