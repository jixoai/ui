<!--
  accordion — component doc page (docs-eight-axes-mdn round 1,
  marginalia). MDN archetype order: H1 → overview → live example →
  props → the eight axes on THIS family (per-axis table + grouped
  examples + one query() case) → accessibility → see also.
  Original intent (2026-09-22): the Owner-directed doc-page refactor —
  tier 2 over the W3-era page (same real information, archetype order,
  honest per-axis story).
-->
<script lang="ts">
  import Accordion from '$lib/ui/accordion/accordion.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import AccordionItem from '$lib/ui/accordion/accordion-item.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import accordionSource from '$lib/ui/accordion/accordion.svelte?raw';
  import accordionItemSource from '$lib/ui/accordion/accordion-item.svelte?raw';

  // ---- playground state (P1): the page owns the snapshot ----
  const canvasInitial = { exclusive: true, ghost: false, thirdOpen: true };
  let exclusive = $state(canvasInitial.exclusive);
  let ghost = $state(canvasInitial.ghost);
  let thirdOpen = $state(canvasInitial.thirdOpen);
  function resetCanvas(): void {
    exclusive = canvasInitial.exclusive;
    ghost = canvasInitial.ghost;
    thirdOpen = canvasInitial.thirdOpen;
  }

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
${close}

<Accordion exclusive>
  <AccordionItem>
    {#snippet summary()}Shipping{/snippet}
    Orders leave the warehouse within 48h.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Returns{/snippet}
    30 days, no questions — the label is prepaid.
  </AccordionItem>
</Accordion>

<!-- bare item = a one-off disclosure -->
<AccordionItem bind:open>
  {#snippet summary()}Details{/snippet}
  Anything at all.
</AccordionItem>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/accordion.svelte', content: accordionSource },
    { name: 'registry/files/ui/accordion-item.svelte', content: accordionItemSource },
    { name: 'src/lib/ui/accordion-usage.svelte', content: usage },
  ];

  // the postures matrix: the three ways to render — framed group, ghost
  // paint, bare one-off item (hand-authored mirror of the stage markup;
  // the same-source migration is the recorded follow-up)
  const posturesDemo = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
${close}

<!-- default — the framed group -->
<Accordion>
  <AccordionItem>
    {#snippet summary()}framed{/snippet}
    One collapsed 1px border around the set.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}seams{/snippet}
    1px seams between items, not double borders.
  </AccordionItem>
</Accordion>

<!-- ghost — antd Collapse ghost paint, frameless -->
<Accordion ghost>
  <AccordionItem>
    {#snippet summary()}ghost{/snippet}
    antd Collapse ghost mapping — frameless, hairline separators only.
  </AccordionItem>
</Accordion>

<!-- bare item — without the group: a single styled details/summary -->
<AccordionItem>
  {#snippet summary()}one-off disclosure{/snippet}
  Without the group: a single styled details/summary.
</AccordionItem>`;

  const posturesFiles: TreeFile[] = [
    { name: 'accordion-postures-demo.svelte', content: posturesDemo, kind: 'usage' },
  ];

  // ---- the eight axes on THIS family -------------------------------------
  // Mechanism names are the family's real stamps/consumption: the
  // carriers come from stampCarriersForLanes (defaults.svelte.ts) at the
  // group root; the consumption facts come from the family CSS
  // (accordion.stylex.ts / accordion.css / accordion-item.css). Deviations
  // are cited to migration-census.md (explicit-props research, D5 rows).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-size-effective plus the frame\'s font-size on the group root (a px number). This family paints no size of its own — the summary and body read the density channels (var(--jx-text)) — so the carrier broadcasts in flow: a Card or PressButton inside an item body at auto sizes in em off it.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'Stamps --jx-shape-effective and --jx-radius-factor-effective on the group root. The family CSS consumes neither — corner geometry broadcasts to nested consumers (the concentric demo\'s Card corners itself through them).',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-radius-effective on the frame — the §3 concentric anchor (a px number). The frame\'s own corners keep the ambient var(--radius); a nested radius="auto" consumer computes max(0px, radius − inset): 20 computes 6px under the Card\'s 0.875rem inset (the census D5 receipt).',
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'The one axis the family paints. A named rung stamps the data-density scope (small/medium/large alias sm/default/lg; the five legacy rungs stay addressable), swapping var(--jx-text)/var(--jx-line) — summary and body text move (11 · 12 · 13 · 15px at xs/sm/default/lg). A number (a coefficient) stamps --jx-density-coefficient. The seam and summary paddings are ruler equations off --jx-unit (rem-fixed) and never scale.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'Stamps --jx-color-effective (a hue number is degrees in the oklch formula; a raw string passes through). The family\'s own ink stays on theme tokens (--foreground, hover --primary-text, focus --ring) — the hue broadcasts to nested consumers (a fill PressButton inside an item re-hues).',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'Consumed on the family: the resolved dark step puts the .dark class on the frame (the §6 class bridge) and the whole disclosure re-themes in place. light and system ride tree inheritance.',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-elevation-effective (a number is exact dp). The frame carries no shadow — the level broadcasts to nested consumers (a Card at level2 lifts inside the item body).',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'Stamps --jx-motion-effective (a number is a coefficient). The disclosure animation keeps its fixed recipe (--motion-200 / --motion-ease-nav, killed under prefers-reduced-motion) — intensity broadcasts to nested consumers.',
    },
  ];

  // the density example: the rung row (four scopes side by side) plus the
  // explicit named lane — the snippet below mirrors this markup exactly
  const densityDemo = `<DensityDemo>
  <Accordion>
    <AccordionItem>
      {#snippet summary()}shipping{/snippet}
      Orders leave the warehouse within 48h.
    </AccordionItem>
  </Accordion>
</DensityDemo>

<!-- explicit rungs — the documented vocabulary (aliases of sm/lg) -->
<Accordion density="large">
  <AccordionItem>
    {#snippet summary()}large{/snippet}
    The lg rung — 15px summary text.
  </AccordionItem>
</Accordion>
<Accordion density="small">
  <AccordionItem>
    {#snippet summary()}small{/snippet}
    The sm rung — 12px summary text.
  </AccordionItem>
</Accordion>`;

  const densityFiles: TreeFile[] = [
    { name: 'accordion-density-demo.svelte', content: densityDemo, kind: 'usage' },
  ];

  // the theme example: dark bridges onto the frame as the .dark class —
  // the whole disclosure re-themes in place
  const themeDemo = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
${close}

<Accordion theme="dark">
  <AccordionItem>
    {#snippet summary()}warranty{/snippet}
    Two years against defects — the frame re-themes in place.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}returns{/snippet}
    30 days, no questions asked.
  </AccordionItem>
</Accordion>`;

  const themeFiles: TreeFile[] = [
    { name: 'accordion-theme-demo.svelte', content: themeDemo, kind: 'usage' },
  ];

  // the concentric example (the census D5 receipt, live): the frame
  // supplies --jx-radius-effective: 20px; the nested auto Card computes
  // max(0px, 20px − 14px inset) = 6px through the §3 expression
  const concentricDemo = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
  import Card from '@ui/card.svelte';
${close}

<Accordion radius={20}>
  <AccordionItem>
    {#snippet summary()}concentric anchor{/snippet}
    <Card radius="auto">
      the auto Card computes max(0px, 20px − its 0.875rem inset) = 6px —
      the radius var inherits the group root stamp through the plain
      cascade (native-details content is in flow; no portal boundary).
    </Card>
  </AccordionItem>
</Accordion>`;

  const concentricFiles: TreeFile[] = [
    { name: 'accordion-concentric-demo.svelte', content: concentricDemo, kind: 'usage' },
  ];

  // the ONE query() case: media-key density — the compact rhythm below
  // the 40rem viewport, the default rhythm at ≥40rem. The generic pins
  // the case values to DensityLane (the object literal alone would
  // infer QueryResult<string> — the concept page's typing note)
  const viewportDensity = query<{ sm: DensityLane }>({ sm: 'default' }, 'small');

  const queryDemo = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
  import { query } from '$lib/universal-props-query.svelte';
${close}

<Accordion density={query({ sm: 'default' }, 'small')}>
  <AccordionItem>
    {#snippet summary()}shipping{/snippet}
    The compact rhythm below the 40rem viewport — the default rhythm above.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}returns{/snippet}
    30 days, no questions asked.
  </AccordionItem>
</Accordion>`;

  const queryFiles: TreeFile[] = [
    { name: 'accordion-query-demo.svelte', content: queryDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Accordion · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai accordion: details/summary, no framework — native toggle, keyboard, and SSR state. The group adds the frame, the seams, and opt-in exclusive behavior; the eight style axes resolve once at the group root and ride the in-flow supply chain."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="accordion — details/summary, no framework"
      summary="The platform already ships the accordion: <details>/<summary> carries the toggle, the disclosure state, the keyboard contract, and open-in-SSR — nothing to hydrate, no ARIA to maintain. The group adds the 1px frame, the seams, and opt-in exclusive behavior; the eight style axes resolve once at the group root."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">native details/summary</span>
        <span class="pill">SSR-stable open state</span>
        <span class="pill">capture-phase exclusive guard</span>
        <span class="pill">height:auto animation</span>
        <span class="pill">eight axes at the group root</span>
      </div>
    </SectionCard>
  </div>

  <div id="accordion-base" data-reveal="">
    <SectionCard
      family="accordion-base"
      headerRegion="accordion-base"
      eyebrow="overview"
      title="What the platform gives, what we add"
      summary="Everything behavioral is the browser's — toggle, keyboard, disclosure semantics, SSR state. The component owns only the frame, the seam, the chevron, the exclusive opt-in, and a progressive height:auto animation (interpolate-size + ::details-content) that degrades to a native snap everywhere else."
    >
      <div class={cx(rt.grid760b)}>
        <div class={cx(rt.acTint)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>platform-native, free</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>toggle + disclosure semantics on <code class={cx(rt.inkAccent)}>details/summary</code></span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>keyboard: Enter/Space on the summary — the browser's own</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>SSR ships the open state in the HTML — no hydration flash</span></li>
          </ul>
        </div>
        <div class={cx(rt.acTint)}>
          <h3 class={cx(rt.fontNav, rt.mb12, rt.text13, rt.trackTight)}>jixoai additions</h3>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>collapsed frame: one 1px border, 1px seams between items</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>exclusive</code> — capture-phase guard closes siblings; works on any details children</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span><code class={cx(rt.inkAccent)}>bind:open</code> per item — manual state participates in the same guard</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>chevron rotation + height:auto animation, reduced-motion aware</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsInstall name="accordion" />
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Wrap items in the group for the collapsed frame and opt-in exclusive mode; use a bare item for a one-off disclosure."
    >
      <CodeBlock code={usage} lang="svelte" meta="Accordion usage" />
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="accordion"
      description="A three-item FAQ. Flip the exclusive toggle in the playground — opening one item then closes its siblings, through one capture-phase listener; the third item also demonstrates bind:open surviving the guard."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/accordion.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
    >
      <div class={cx(rt.wFull, rt.maxWXl)}>
        <Accordion {exclusive} {ghost}>
          <AccordionItem>
            {#snippet summary()}Shipping <Badge class={cx(rt.ml4)}>48h</Badge>{/snippet}
            Orders leave the warehouse within 48 hours — tracking lands in your inbox the moment
            the label prints.
          </AccordionItem>
          <AccordionItem>
            {#snippet summary()}Returns{/snippet}
            30 days, no questions asked. The return label is prepaid; refunds post within two
            business days of arrival.
          </AccordionItem>
          <AccordionItem bind:open={thirdOpen}>
            {#snippet summary()}Warranty{/snippet}
            Two years against defects. Repairs run through the same pipeline as returns — one form,
            either outcome.
          </AccordionItem>
        </Accordion>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="exclusive">
            <PlayToggle bind:value={exclusive} />
          </PlayRow>
          <PlayRow label="ghost (antd Collapse)">
            <PlayToggle bind:value={ghost} />
          </PlayRow>
          <PlayRow label="warranty item open (bind)">
            <PlayToggle bind:value={thirdOpen} />
          </PlayRow>
          <PlayHelp>
            exclusive mode is one capture-phase <code>toggle</code> listener on the group — it
            governs even raw <code>&lt;details&gt;</code> you drop in, no registration handshake.
            The summary is a snippet: badges and glyphs compose.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="postures" title="Postures" summary="The group frame, the ghost paint, and the bare one-off disclosure — all the same native details/summary underneath.">
    <ComponentCanvas title="accordion · postures" stage="fill" files={posturesFiles}>
      <div class={cx(rt.gridMd3)}>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>default — framed</p>
          <Accordion>
            <AccordionItem>
              {#snippet summary()}framed{/snippet}
              One collapsed 1px border around the set.
            </AccordionItem>
            <AccordionItem>
              {#snippet summary()}seams{/snippet}
              1px seams between items, not double borders.
            </AccordionItem>
          </Accordion>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>ghost</p>
          <Accordion ghost>
            <AccordionItem>
              {#snippet summary()}ghost{/snippet}
              antd Collapse ghost mapping — frameless, hairline separators only.
            </AccordionItem>
          </Accordion>
        </div>
        <div class={cx(rt.panel)}>
          <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>bare item</p>
          <AccordionItem>
            {#snippet summary()}one-off disclosure{/snippet}
            Without the group: a single styled details/summary.
          </AccordionItem>
        </div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="props" title="Props" summary="Two halves: the group owns the frame and the exclusive guard; the item is a styled details/summary with a snippet summary."><div class={cx(rt.col24)}><PropsTable universal title="Accordion (group)" props={[{ name: 'exclusive', type: 'boolean', default: 'false', description: 'Radio behavior: opening one direct child closes its siblings via a capture-phase toggle listener.' }, { name: 'ghost', type: 'boolean', default: 'false', description: "antd Collapse ghost paint — frameless, hairline separators only." }, { name: 'children', type: 'Snippet', default: '—', description: 'AccordionItem (or raw details) children.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the group container.' }]} /><PropsTable title="AccordionItem" props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Disclosure state; bindable (bind:open) for controlled use.', bindable: true }, { name: 'summary', type: 'Snippet', default: '—', description: 'The summary line — plain text or a composed snippet (no interactive elements).' }, { name: 'children', type: 'Snippet', default: '—', description: 'The expanded body.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the details element.' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on the accordion"
      summary="One Defaults contract resolved at the GROUP root (accordion.svelte's frame div); the items ride the supply chain. Native-details content is in flow — the frame's stamped carriers reach nested consumers through the plain cascade, no portal boundary. All eight lanes are carried, all no-own: every default is auto. The fleet grammar lives on the universal-props concept page; this table is what each axis drives HERE."
    >
      <div class={cx(rt.col20)}>
        <PropsTable title="" props={axisRows} />
        <div class={cx(rt.mt20)}>
          <p class={cx(rt.body13)}>
            Deviations, cited: the five broadcast-only lanes (size · shape · color · elevation ·
            motion) and the anchor-only radius lane are recorded in
            <code class={cx(rt.inkAccent)}>migration-census.md</code>
            (openspec/changes/explicit-props/research, the W3-D5 rows) — the family paints no
            carrier consumption of its own, so an explicit lane reaches the disclosure's nested
            content, not the disclosure chrome. density and theme are the only lanes that repaint
            the accordion itself.
          </p>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="accordion · density" stage="fill" files={densityFiles}>
            <div class={cx(rt.col20, rt.wFull)}>
              <DensityDemo>
                <Accordion>
                  <AccordionItem>
                    {#snippet summary()}shipping{/snippet}
                    Orders leave the warehouse within 48h.
                  </AccordionItem>
                </Accordion>
              </DensityDemo>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}>
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="large" — 15px summary</p>
                  <Accordion density="large">
                    <AccordionItem>
                      {#snippet summary()}large{/snippet}
                      The lg rung: T_base + 2px.
                    </AccordionItem>
                  </Accordion>
                </div>
                <div class={cx(rt.panel)}>
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="small" — 12px summary</p>
                  <Accordion density="small">
                    <AccordionItem>
                      {#snippet summary()}small{/snippet}
                      The sm rung: T_base − 1px.
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="accordion · theme" stage="fill" files={themeFiles}>
            <div class={cx(rt.wFull)}>
              <Accordion theme="dark">
                <AccordionItem>
                  {#snippet summary()}warranty{/snippet}
                  Two years against defects — the frame re-themes in place.
                </AccordionItem>
                <AccordionItem>
                  {#snippet summary()}returns{/snippet}
                  30 days, no questions asked.
                </AccordionItem>
              </Accordion>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="accordion · concentric radius" stage="fill" files={concentricFiles}>
            <div class={cx(rt.wFull, rt.maxWXl)}>
              <Accordion radius={20}>
                <AccordionItem>
                  {#snippet summary()}concentric anchor{/snippet}
                  <Card radius="auto">
                    <div class={cx(rt.panel)}>the auto Card computes max(0px, 20px − its 0.875rem inset) = 6px — the radius var inherits the group root stamp</div>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="accordion · query()" stage="fill" files={queryFiles}>
            <div class={cx(rt.wFull, rt.maxWXl)}>
              <Accordion density={viewportDensity}>
                <AccordionItem>
                  {#snippet summary()}shipping{/snippet}
                  The compact rhythm below the 40rem viewport — the default rhythm above. Resize
                  the window and watch the summary step.
                </AccordionItem>
                <AccordionItem>
                  {#snippet summary()}returns{/snippet}
                  30 days, no questions asked.
                </AccordionItem>
              </Accordion>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The component adds zero ARIA of its own — the browser maps details/summary to the disclosure pattern, open state included. Focus-visible draws a 1px inset outline (--ring); the disclosure animation is killed under prefers-reduced-motion; the summary snippet must not contain interactive elements — they fight the summary's own click/keyboard contract."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus to the summary line' }, { key: 'Enter / Space', action: 'Toggles the focused item open/closed (native summary behavior)' }]} aria={[{ name: 'details / summary', value: 'native semantics', description: 'The platform exposes name, role, and open state; no ARIA attributes are added or needed.' }]} /></SectionCard></div>

  <div data-reveal="">
    <DocsSeeAlso name="accordion" />
  </div>
</div>
