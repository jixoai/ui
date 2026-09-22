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

  // The canvas same-source lane: each axes canvas's usage TreeFile
  // composes from THIS PAGE's own stage markup via resolveRawCode (one
  // source, two surfaces — the hand-mirrored literals are gone). The
  // FAQ canvas below stays a hand file: its stage carries the
  // playground's page state, the extractor's documented rejection
  // class (registry/density-2xs precedent).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/accordion.html/+page';

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

  // The live FAQ sample's drawer file: the stage carries playground
  // page-state ({exclusive}/{ghost} shorthand bindings — the extractor's
  // documented self-containment rejection class), so this drawer stays
  // a hand file, regenerated from the STAGE's own copy (three items, the
  // Badge summary, the bind:open item; page-only layout classes dropped).
  // The minimal install example is the Usage section's CodeBlock (the
  // `usage` const) — the two surfaces no longer trade places.
  const faqUsage = `<script lang="ts">
  import Accordion from '@ui/accordion.svelte';
  import AccordionItem from '@ui/accordion-item.svelte';
  import Badge from '@ui/badge.svelte';
  let warrantyOpen = $state(true);
${close}

<Accordion exclusive>
  <AccordionItem>
    {#snippet summary()}Shipping <Badge>48h</Badge>{/snippet}
    Orders leave the warehouse within 48 hours — tracking lands in your inbox the moment
    the label prints.
  </AccordionItem>
  <AccordionItem>
    {#snippet summary()}Returns{/snippet}
    30 days, no questions asked. The return label is prepaid; refunds post within two
    business days of arrival.
  </AccordionItem>
  <AccordionItem bind:open={warrantyOpen}>
    {#snippet summary()}Warranty{/snippet}
    Two years against defects. Repairs run through the same pipeline as returns — one form,
    either outcome.
  </AccordionItem>
</Accordion>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/accordion.svelte', content: accordionSource },
    { name: 'registry/files/ui/accordion-item.svelte', content: accordionItemSource },
    { name: 'src/lib/ui/accordion-faq.svelte', content: faqUsage },
  ];

  // the postures canvas: the drawer composes from the page's own stage
  // markup (one source, two surfaces)
  const posturesUsage = usageFile(
    { Accordion: '@ui/accordion.svelte', AccordionItem: '@ui/accordion-item.svelte' },
    resolveRawCode('postures'),
  );
  const posturesFiles: TreeFile[] = [
    { name: 'accordion-postures-demo.svelte', content: posturesUsage, kind: 'usage' },
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
        "Stamps --jx-size-effective plus an inline font-size on the group root (a px number). The inline stamp reaches only unstyled flow directly under the frame — the summary and body re-anchor on the density channels (var(--jx-text)), and Card/PressButton voices are token-anchored: no consumer in the tree reads the carrier (grep receipt; the kernel's own stamp emitter is the only other hit). Supply-only for the disclosure's anatomy (documented absence).",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "Stamps --jx-shape-effective and --jx-radius-factor-effective on the group root. The family CSS consumes neither — the corner geometry supplies real nested consumers (the concentric demo's Card corners itself through them: corner-shape: var(--jx-shape-effective, round) plus the factor in its radius calc).",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-radius-effective on the frame — the §3 concentric anchor (a px number). The frame's own corners keep the ambient var(--radius); a nested radius=\"auto\" consumer computes max(0px, radius − inset): 20 computes 6px under the Card's 0.875rem inset (the census D5 receipt).",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: `'auto'`,
      description:
        "The one axis the family paints. A named rung stamps the data-density scope (small/medium/large alias sm/default/lg; the five legacy rungs stay addressable), swapping var(--jx-text)/var(--jx-line) — summary and body text move (11 · 12 · 13 · 15px at xs/sm/default/lg). A number (a coefficient) stamps --jx-density-coefficient — inert on this family: the scope blocks substitute at their declaring element, so the coefficient alone repaints nothing; only a named rung's attr re-anchors --jx-text on the frame. The seam and summary paddings are ruler equations off --jx-unit (rem-fixed) and never scale.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "Stamps --jx-color-effective (a hue number is degrees in the oklch formula; a raw string passes through). The family's own ink stays on theme tokens (--foreground, hover --primary-text, focus --ring) — the hue supplies real nested consumers (a fill PressButton inside an item re-hues: --jx-fill/--jx-tonal resolve on var(--jx-color-effective, var(--primary))).",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "A PARTIAL re-theme on this family, measured (the theme-split law): the resolved dark step puts the .dark class on the frame (the §6 class bridge), which re-scopes the raw-token voices — the summary ink (--foreground, hover --primary-text), the focus ring (--ring), and the item seam (--border) flip to the dark profile — while the family's stylex voices stay at page-scope resolution (the card ground --jx-card, the frame border --jx-border, the body ink --jx-muted-foreground keep their light values): the semantic-ink re-scope gap (the drift ledger's W-next #1), documented per voice until the protocol pass. light and system ride tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-elevation-effective (a number is exact dp). The frame carries no shadow and no consumer in the tree reads the carrier (grep receipt: zero hits; the Card's shadow is the fixed token --jx-shadow-2xs and never reads the lane). Supply-only (documented absence).",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "Stamps --jx-motion-effective (a number is a coefficient). The disclosure animation keeps its fixed recipe (--motion-200 / --motion-ease-nav, killed under prefers-reduced-motion) and no family or fleet component reads the carrier (grep receipt: zero hits in lib/ui — the tree's only reader is the component-canvas demo page). Supply-only (documented absence).",
    },
  ];

  // the density canvas: the drawer composes from the page's own stage
  // markup — the explanatory comment lives IN the stage children so the
  // extraction (a byte-slice) carries it on both surfaces
  const densityUsage = usageFile(
    {
      Accordion: '@ui/accordion.svelte',
      AccordionItem: '@ui/accordion-item.svelte',
      DensityDemo: '@lib/ui/density-demo/density-demo.svelte',
    },
    resolveRawCode('density'),
  );
  const densityFiles: TreeFile[] = [
    { name: 'accordion-density-demo.svelte', content: densityUsage, kind: 'usage' },
  ];

  // the theme canvas: same-source drawer; the stage's caption names the
  // measured partial re-theme (the drift ledger's W-next #1) instead of
  // the false "re-themes in place"
  const themeUsage = usageFile(
    { Accordion: '@ui/accordion.svelte', AccordionItem: '@ui/accordion-item.svelte' },
    resolveRawCode('theme'),
  );
  const themeFiles: TreeFile[] = [
    { name: 'accordion-theme-demo.svelte', content: themeUsage, kind: 'usage' },
  ];

  // the concentric canvas (the census D5 receipt, live): same-source
  // drawer — the stage carries the full sentence incl. the in-flow note
  const concentricUsage = usageFile(
    {
      Accordion: '@ui/accordion.svelte',
      AccordionItem: '@ui/accordion-item.svelte',
      Card: '@ui/card.svelte',
    },
    resolveRawCode('concentric'),
  );
  const concentricFiles: TreeFile[] = [
    { name: 'accordion-concentric-demo.svelte', content: concentricUsage, kind: 'usage' },
  ];

  // the ONE query() case: media-key density — the compact rhythm below
  // the 40rem viewport, the default rhythm at ≥40rem. The call is INLINE
  // in the stage (the badge idiom): a page-level const would reference an
  // unbound identifier in the extraction (the F4 guard rejects exactly
  // that). BOTH generic args are the §6 typing law: with an explicit
  // type-argument list TS disables inference for the base parameter, so
  // the single-arg form pins B to undefined and ships a real
  // svelte-check error
  const queryUsage = usageFile(
    {
      Accordion: '@ui/accordion.svelte',
      AccordionItem: '@ui/accordion-item.svelte',
      '{ query }': '@lib/universal-props-query.svelte',
      'type { DensityLane }': '@lib/defaults.svelte',
    },
    resolveRawCode('query'),
  );
  const queryFiles: TreeFile[] = [
    { name: 'accordion-query-demo.svelte', content: queryUsage, kind: 'usage' },
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
    <ComponentCanvas id="postures" title="accordion · postures" stage="fill" files={posturesFiles}>
      <div class={cx(rt.gridMd3)}>
        <div class={cx(rt.panel)}>
          <!-- default — the framed group -->
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
          <!-- ghost — antd Collapse ghost paint, frameless -->
          <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>ghost</p>
          <Accordion ghost>
            <AccordionItem>
              {#snippet summary()}ghost{/snippet}
              antd Collapse ghost mapping — frameless, hairline separators only.
            </AccordionItem>
          </Accordion>
        </div>
        <div class={cx(rt.panel)}>
          <!-- bare item — without the group: a single styled details/summary -->
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
      summary="One Defaults contract resolved at the GROUP root (accordion.svelte's frame div); the items ride the supply chain. Native-details content is in flow — the frame's stamped carriers reach nested consumers through the plain cascade, no portal boundary. All eight lanes are carried, all no-own: every default is auto. The split, counted: density is the one full repainter; theme is a partial painter (the row names which voices flip and which stay); radius is anchor-only; shape and color supply real nested consumers; size, elevation, and motion are supply-only with no reader in the tree — recorded per axis instead of silently omitted. The fleet grammar lives on the universal-props concept page; this table is what each axis drives HERE."
    >
      <div class={cx(rt.col20)}>
        <PropsTable title="" props={axisRows} />
        <div class={cx(rt.mt20)}>
          <p class={cx(rt.body13)}>
            Deviations, cited: the five supply-only lanes (size · shape · color · elevation ·
            motion) — the family consumes none of their carriers, per the broadcast protocol
            (吃也供, supply-and-consume; the universal-props concept page owns the term) —
            and the anchor-only radius lane are recorded in
            <code class={cx(rt.inkAccent)}>migration-census.md</code>
            (openspec/changes/explicit-props/research, the W3-D5 rows) — so an explicit lane
            reaches the disclosure's nested content, not the disclosure chrome. density is the
            only full repainter; theme is a partial one — the raw-token voices flip (summary
            ink, focus ring, seam), the stylex voices stay (the W-next #1 gap, named per voice
            in the row above).
          </p>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="density" title="accordion · density" stage="fill" files={densityFiles}>
            <div class={cx(rt.col20, rt.wFull)}>
              <DensityDemo>
                <Accordion>
                  <AccordionItem>
                    {#snippet summary()}shipping{/snippet}
                    Orders leave the warehouse within 48h.
                  </AccordionItem>
                </Accordion>
              </DensityDemo>
              <!-- explicit rungs — the documented vocabulary (aliases of sm/lg) -->
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}>
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="large" — 15px summary</p>
                  <Accordion density="large">
                    <AccordionItem>
                      {#snippet summary()}large{/snippet}
                      The lg rung — 15px summary text.
                    </AccordionItem>
                  </Accordion>
                </div>
                <div class={cx(rt.panel)}>
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="small" — 12px summary</p>
                  <Accordion density="small">
                    <AccordionItem>
                      {#snippet summary()}small{/snippet}
                      The sm rung — 12px summary text.
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="theme"
            title="accordion · theme"
            description="A dark island, unretouched — a PARTIAL re-theme, measured: the raw-token voices re-scope (the summary ink is now white — the unreadable line IS the documented gap), while the family's stylex voices keep the light profile (card ground --jx-card, frame border --jx-border, body ink --jx-muted-foreground). The semantic-ink re-scope gap, the drift ledger's W-next #1 — documented per voice until the protocol pass."
            stage="fill"
            files={themeFiles}
          >
            <div class={cx(rt.wFull)}>
              <Accordion theme="dark">
                <AccordionItem>
                  {#snippet summary()}warranty{/snippet}
                  Two years against defects — the summary ink flips to the dark profile; the card
                  ground stays light.
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
          <ComponentCanvas
            id="concentric"
            title="accordion · concentric radius"
            stage="fill"
            files={concentricFiles}
          >
            <div class={cx(rt.wFull, rt.maxWXl)}>
              <Accordion radius={20}>
                <AccordionItem>
                  {#snippet summary()}concentric anchor{/snippet}
                  <Card radius="auto">
                    <div class={cx(rt.panel)}>the auto Card computes max(0px, 20px − its 0.875rem inset) = 6px — the radius var inherits the group root stamp through the plain cascade (native-details content is in flow; no portal boundary)</div>
                  </Card>
                </AccordionItem>
              </Accordion>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="query"
            title="accordion · query()"
            stage="fill"
            files={queryFiles}
          >
            <div class={cx(rt.wFull, rt.maxWXl)}>
              <Accordion density={query<{ sm: DensityLane }, DensityLane>({ sm: 'default' }, 'small')}>
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

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The component adds zero ARIA of its own — the browser maps details/summary to the disclosure pattern, open state included. Focus-visible draws a 1px inset outline (--ring); the disclosure animation is killed under prefers-reduced-motion; the summary snippet must not contain interactive elements — they fight the summary's own click/keyboard contract. The summary's hit height is density-invariant: 11px padding-block at default, sm, and lg alike (measured) — density moves the text, not the target."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus to the summary line' }, { key: 'Enter / Space', action: 'Toggles the focused item open/closed (native summary behavior)' }]} aria={[{ name: 'details / summary', value: 'native semantics', description: 'The platform exposes name, role, and open state; no ARIA attributes are added or needed.' }]} /></SectionCard></div>

  <div data-reveal="">
    <DocsSeeAlso name="accordion" />
  </div>
</div>
