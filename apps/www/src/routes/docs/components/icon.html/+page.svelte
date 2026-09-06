<!--
  Docs page for the icon component (icon-component-pipeline, D2 — the
  catalog item meta.href /docs/components/icon.html lands here).
  Intents:
  1. Hero + canvas: the named-glyph renderer live — the playground
     drives one instance's name/size/strokeWidth.
  2. The type-safety law (IconName union — typo = compile error).
  3. The two render paths (inline sync core / lazy reserved box).
  4. Usage, a11y (decorative by contract), API.
  The library face's full story (config, tiers, budgets, the sentinel)
  lives on /docs/icons.html — this page links there, never duplicates.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Icon from '$lib/ui/icon';
  import { ICON_NAMES, type IconName } from '$lib/icon-set.gen';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp, PlayNumber, PlayRow, PlaySelect } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site
  // runs ($lib/ui/icon is the byte-mirror of registry/files/ui/icon).
  import iconSource from '$lib/ui/icon/icon.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Icon from '@ui/icon';
${close}

<!-- decorative by contract — the accessible name lives on the control -->
<button aria-label="close">
  <Icon name="x" />
</button>

<!-- size + stroke weight are props; class + attrs land on the root -->
<Icon name="chevronRight" size={13} />
<Icon name="folderOpen" size={20} strokeWidth={1.5} class="text-primary" />`;

  const typoLaw = '<Icon name="chevrinRight" />\n' +
    '       ~~~~~~~~~~~~~~~~ Type \'"chevrinRight"\' is not assignable to\n' +
    '       type \'IconName\' — the union is generated with the artifact,\n' +
    '       so a typo is a COMPILE error, never a shipped blank glyph.';

  const asyncPaths = `import { loadIcon, preloadIcons } from '$lib/icon-set.gen';

// inline-core names answer synchronously — SSR paints them in the
// server HTML, hydration matches, zero wiring owed. Names past the
// chunk budget ride loadIcon(): one cached dynamic import per chunk.
await loadIcon('fileVideo');                     // pull one lazy chunk
await preloadIcons(['folderOpen', 'fileAudio']); // warm a set ahead of a mount

// while pending — and after a rejected chunk — the component renders
// the FIXED reserved box (pending and rejected are the IDENTICAL span,
// so hydration never rewrites it and the layout never shifts):
//   <span data-jx-icon-pending aria-hidden="true"
//     style="display:inline-block;width:20px;height:20px"></span>
// a failed chunk warns once per chunk per session; the box stays.`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/icon/icon.svelte', content: iconSource },
    { name: 'src/lib/ui/icon-usage.svelte', content: usage, kind: 'usage' },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + the driven instance below
  const canvasInitial = {
    name: 'rotateCcw' as IconName,
    size: 20,
    strokeWidth: 2,
  };
  let name = $state<IconName>(canvasInitial.name);
  let size = $state(canvasInitial.size);
  let strokeWidth = $state(canvasInitial.strokeWidth);
  function resetCanvas(): void {
    name = canvasInitial.name;
    size = canvasInitial.size;
    strokeWidth = canvasInitial.strokeWidth;
  }
  // every name in the generated set is a legal option — the union IS
  // the list (a glyph added to the config appears here with zero edit)
  const nameOptions: { value: IconName; label: string }[] = ICON_NAMES.map(
    (value) => ({ value, label: value }),
  );
</script>

<svelte:head>
  <title>Icon · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Icon component: the named-glyph renderer over the generated icon set — <Icon name> takes the IconName union (a typo is a compile error), renders currentColor artwork at a prop-driven square size with stroke weight as a prop, and treats icons as decorative by contract (aria-hidden baked in). The inline core renders synchronously SSR-safe; names past the chunk budget ride loadIcon into a fixed reserved box with preloadIcons to warm them."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <!-- ToC rail: aside precedes the content column in the DOM — desktop
       sticky right column, mobile the glass bar under the scaffold header
       (height 0, see toc.css); the content column reserves its clearance -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="icon — a name, not a picture"
        summary="The glyph renderer every component shares. You hand it a NAME from the generated set — the IconName union closes at build time, so a misspelled glyph is a compile error, not a blank square in production. The component owns the whole &lt;svg&gt; root: viewBox from the icon data, the square size edge, currentColor painting by artwork nature (stroke artwork strokes, fill artwork fills), round caps and joins, aria-hidden. Sizing and stroke weight are props — never wrapper CSS fighting an inline svg."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">IconName union — typo = compile error</span>
          <span class="pill">size / strokeWidth props</span>
          <span class="pill">currentColor by artwork nature</span>
          <span class="pill">aria-hidden baked in</span>
          <span class="pill">inline core · SSR-safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="icon" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Import the component, hand it a name — the control around it carries the meaning."
      >
        <CodeBlock code={usage} lang="svelte" meta="Icon usage" />
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="icon"
        description="One name renders one glyph. The playground drives the lower instance; the upper rows are the default sizes, the stroke ladder, and currentColor theming."
        sourceUrl={registrySourceUrl('icon')}
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-end justify-center gap-x-10 gap-y-5">
            {#each [12, 16, 24, 32] as px (px)}
              <div class="flex flex-col items-center gap-2">
                <Icon name="eye" size={px} />
                <code class="text-muted-foreground font-mono text-[11px]">size={px}</code>
              </div>
            {/each}
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {#each [1.5, 2, 2.5] as sw (sw)}
              <div class="flex items-center gap-2.5">
                <Icon name="braces" size={20} strokeWidth={sw} />
                <code class="text-muted-foreground font-mono text-[11px]">sw={sw}</code>
              </div>
            {/each}
            <span class="text-primary flex items-center gap-2 text-[13px]">
              <Icon name="check" /> primary
            </span>
            <span class="text-muted-foreground flex items-center gap-2 text-[13px]">
              <Icon name="check" /> muted
            </span>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <Icon {name} {size} {strokeWidth} />
            <code class="text-muted-foreground font-mono text-[11.5px]">&lt;Icon name=&quot;{name}&quot; size={size} strokeWidth={strokeWidth} /&gt;</code>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="name">
              <PlaySelect bind:value={name} options={nameOptions} />
            </PlayRow>
            <PlayRow label="size">
              <PlayNumber bind:value={size} min={8} max={48} />
            </PlayRow>
            <PlayRow label="strokeWidth">
              <PlayNumber bind:value={strokeWidth} min={1} max={4} step={0.5} />
            </PlayRow>
            <PlayHelp>
              <code>name</code> takes any member of the generated
              <code>IconName</code> union ({ICON_NAMES.length} today — the list derives from the
              artifact, zero hand-maintained options). Numeric sizes px-coerce on the lazy pending
              box; string sizes pass through verbatim. <code>strokeWidth</code> is inert on
              fill-nature artwork.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="type-safety" data-reveal="">
      <SectionCard
        family="type-safety"
        headerRegion="type-safety"
        eyebrow="law"
        title="The name is a union, not a string"
        summary="IconName is generated together with the set: the union and the runtime data come from one artifact, so the compiler and the renderer can never disagree. A typo fails svelte-check at the exact prop — it never becomes a runtime blank, a silent fallback, or a shipped misspelling."
      >
        <div class="flex flex-col gap-5">
          <CodeBlock code={typoLaw} lang="text" meta="the type-safety law" />
          <p class="text-muted-foreground text-[13px] leading-6">
            The union, the iterable (<code class="text-accent">ICON_NAMES</code>) and the loaders
            (<code class="text-accent">getIcon</code> / <code class="text-accent">loadIcon</code> /
            <code class="text-accent">preloadIcons</code>) all ride the one generated module —
            <code class="text-accent">$lib/icon-set.gen</code>. Its config, budgets and install
            tiers live on the <a class="text-accent underline underline-offset-2" href="/docs/icons.html">icons page</a>.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="async-paths" data-reveal="">
      <SectionCard
        family="async-paths"
        headerRegion="async-paths"
        eyebrow="async semantics"
        title="Two paths, one box"
        summary="The default case is synchronous: the artifact's inline chunk answers getIcon() immediately, so server-side rendering paints the glyph and hydration matches with zero wiring. Lazy chunks exist only past the budget (or behind inlineFirstChunk: false) — their pending and rejected markup are the IDENTICAL reserved span, so hydration never rewrites the box and the layout never shifts."
      >
        <CodeBlock code={asyncPaths} lang="ts" meta="the two paths" />
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="accessibility" data-reveal="">
    <SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Decorative by contract" summary="Every glyph renders aria-hidden — an icon is never the accessible name. The meaning lives in the surrounding text or the control's aria-label.">
      <A11yTable
        keys={[]}
        aria={[
          { name: 'aria-hidden', value: '"true" (baked in)', description: 'The glyph is decoration; it never joins the accessibility tree and cannot become a name.' },
          { name: 'aria-label', value: 'consumer-owned', description: 'Icon-only controls name themselves (e.g. on the wrapping button) — the component offers no label prop on purpose.' },
          { name: 'data-jx-icon', value: 'on the root', description: 'Stable hook for consumer CSS that must target the rendered svg.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Three props and a verbatim spread — the component owns every other root attribute.">
      <PropsTable props={[
        { name: 'name', type: 'IconName', required: true, description: "The glyph's name in the generated set ($lib/icon-set.gen). The union closes at build time — a typo is a compile error." },
        { name: 'size', type: 'number | string', default: '16', description: 'The square edge: svg width/height. Numeric sizes px-coerce on the lazy pending box (16 → 16px — a bare number is invalid CSS); string sizes pass through verbatim (e.g. "1.25em").' },
        { name: 'strokeWidth', type: 'number | string', default: '2', description: 'Stroke weight — stroke artwork only; inert on fill-nature glyphs.' },
        { name: 'class', type: 'string', default: "''", description: 'Lands on the root <svg> verbatim (currentColor theming rides the text color utilities).' },
        { name: '...rest', type: 'SVGAttributes<SVGSVGElement>', default: 'spread', description: 'Every other attribute lands on the root; the component also owns xmlns, viewBox, fill/stroke by artwork nature, round caps/joins, aria-hidden and data-jx-icon.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="icon" />
  </div>
</div>
