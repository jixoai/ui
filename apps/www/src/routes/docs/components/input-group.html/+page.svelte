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
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { PlayFields, PlayRow, PlayText, PlayToggle, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';

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
</script>

<svelte:head>
  <title>Input group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai input-group family: the joined field shell over the input's shared shell law — InputGroupAddon lanes (text, icon, button, select) compose beside a chromeless InputGroupInput under ONE 1px bezel, with 1px hairline seams (no double borders) and ONE disabled propagation rule (root disable ⇒ native disabled on the lane + inert addons)."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Entry"
        title="input-group — the joined field shell"
        summary="The Origin UI “Input with X” family over the input's shared shell law: addons compose BESIDE the field, not inside a private composite. One 1px var(--border) bezel carries the shell states (hover lift, inset focus ring, invalid dash); each addon owns exactly one hairline seam facing the lane; the InputGroupInput stays a chromeless Tier-2 control-lane — no double borders by construction. ONE disabled propagation rule: disable the root and the lane renders native disabled while every addon goes inert (the platform's containment — buttons, selects and links inside lose activation and focus at once)."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">composition parts</span>
          <span class="pill">1px hairline seams</span>
          <span class="pill">one disabled rule · inert</span>
          <span class="pill">Tier-2 control-lane</span>
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
        summary="One registry item — the group, the addon and the input parts ship together (the barrel exports all three)."
      >
        <CodeBlock code={`npx jixoai-ui add input-group`} lang="sh" meta="install" />
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
        <div class="flex w-full max-w-md flex-col items-start gap-3">
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
              disabling the group sends the lane native <code class="text-accent">disabled</code> and
              the addons <code class="text-accent">inert</code> — the check button loses activation
              and focus with them. One rule, no per-child chasing.
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
      <p class="m-0 text-muted-foreground text-[13px] leading-6">
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
      <div class="flex w-full max-w-md flex-col items-start gap-3">
        <InputGroup label="endpoint">
          <InputGroupAddon>
            <NativeSelect bind:value={protocol} class="text-[12.5px]" aria-label="protocol">
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
      <form class="flex w-full max-w-md flex-col items-start gap-3" onsubmit={deploy}>
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
            <code class="text-accent">name</code> rides the input part, so submission is the
            platform's: <code class="text-accent">FormData.get('preview')</code>. An untouched field
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

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three parts, one context: the root owns the disable propagation and the name; the addon owns a lane; the input owns the field."
    >
      <div class="flex flex-col gap-6">
        <PropsTable
          props={[
            { name: 'label', type: 'string', default: '—', description: 'Accessible group name (aria-label); an explicit rest aria-label wins.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'THE propagation rule: native disabled on the lane + inert on every addon.' },
            { name: 'density', type: 'Density', default: 'inherited', description: 'Density tier, provided to the subtree so addon children adopt it.' },
            { name: 'role', type: 'string', default: "'group'", description: 'The group landmark — override only when you own the semantics.' },
            { name: 'class', type: 'string', default: "''", description: 'Merged into the root shell (cn()).' },
            { name: 'children', type: 'Snippet', default: 'required', description: 'Addon + input parts, authored in your tree.', required: true },
            { name: '...rest', type: 'HTMLAttributes', default: '—', description: 'aria-labelledby, data-*, event handlers — land on the root verbatim.' },
          ]}
        />
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

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The shell, the addon lanes and the field all size from the shared density ruler; the seams read var(--border)."
    >
      <div class="flex flex-col gap-5">
        <DensityDemo>
          <InputGroup label="density">
            <InputGroupAddon>https://</InputGroupAddon>
            <InputGroupInput name="density-demo" placeholder="jixoai.com" />
          </InputGroup>
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
            { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--border', default: 'theme', source: 'seams + shell' },
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
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/input.html">input — the native field</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — addon actions</a>
        <a class="pill" href="/docs/components/native-select.html">native-select — addon pickers</a>
        <a class="pill" href="/docs/components/button-group.html">button-group — joined actions</a>
        <a class="pill" href="/docs/components/tags-input.html">tags-input — chips in one shell</a>
      </div>
    </SectionCard>
  </div>
</div>
