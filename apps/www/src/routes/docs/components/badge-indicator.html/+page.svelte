<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import BadgeIndicator from '$lib/ui/badge-indicator/badge-indicator.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import badgeindicatorSource from '$lib/ui/badge-indicator/badge-indicator.svelte?raw';
  // stage markup via resolveRawCode (one source, two surfaces): the
  // axes canvas's drawer composes from the extracted stage itself.
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/badge-indicator.html/+page';

  const usage = `<!-- dot = presence without a number; label is the a11y name -->
<BadgeIndicator dot label="2 unread">
  <Avatar name="Grace" />
</BadgeIndicator>

<!-- count caps at 99+; zero hides honestly -->
<BadgeIndicator count={5}>
  <button type="button">inbox</button>
</BadgeIndicator>

<!-- standalone (no child) is an inline chip -->
<BadgeIndicator count={250} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/badge-indicator/badge-indicator.svelte', content: badgeindicatorSource },
    { name: 'src/lib/ui/badge-indicator-usage.svelte', content: usage },
  ];

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

  // ---- the presence state machine (measured + spec-pinned:
  // test/batch6-antd2-components.spec.ts :: BadgeIndicator) -----------
  const lawTable = [
    { posture: 'dot', input: 'dot + label', renders: 'the 10px primary dot', announces: `role="img" · label ?? 'new activity'` },
    { posture: 'count', input: 'count 1…overflow', renders: 'the 18px count chip', announces: 'the visible count text' },
    { posture: 'capped', input: 'count > overflow (99)', renders: `'99+' — the cap, never the true number`, announces: `'99+'` },
    { posture: 'honest zero', input: 'count={0}', renders: 'NOTHING — zero unread is no badge', announces: 'nothing (absence is the truth)' },
    { posture: 'opted zero', input: 'count={0} showZero', renders: `the chip reading '0'`, announces: `'0'` },
    { posture: 'standalone', input: 'no children', renders: 'the same chip inline (position:static)', announces: 'as its idiom dictates' },
  ];

  // ---- the universal props demo (explicit-props W3 batch B) ---------
  const universalUsage = `<!-- all no-own: the chip's paint is the fixed micro scale -->
<BadgeIndicator dot label="live" size={18} density="small" />
<BadgeIndicator count={120} size="large" radius="large" color="error" />

<!-- the one live wire: the WRAP re-tiers its tenant -->
<BadgeIndicator count={5} density="lg">
  <PressButton>inbox</PressButton>
</BadgeIndicator>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/badge-indicator-universal.svelte', content: universalUsage },
  ];

  // the eight per-axis rows (measured; probes 2026-09-22)
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ legacy spellings)`,
      default: `'auto'`,
      description:
        "BROADCAST-AND-SCOPE, INERT ON THE CHIP — the rung stamps data-density and the carriers broadcast, but the chip's geometry rides unit equations off --jx-unit (one :root declaration, never re-based): a stamped lg leaves the dot 10px and the count 18px (probe receipt). The live wire is the WRAP: an explicit rung is a real density scope for the tenant it carries — the kernel channels re-base inside it (--jx-text resolves to the lg composition), so a PressButton under a density=\"lg\" wrap measures 48px against 40px beside it. No query() seat: the chip consumes nothing and a responsive seat is a tenant composition recipe, not a family axis (the code-card judged-sound precedent, stated here per the same rule).",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE §11 ECHO, POSTURE-SPLIT — the stamp lands verbatim (--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem) on the root). RIDING A CHILD, the mirror lands on the wrap and nothing follows: the chip's own typed micro atom (--jx-text-micro, 10px) outranks inheritance (measured 10px under an 18px mirror). STANDALONE, the chip IS the root — the inline mirror beats the class atom (the merge law's inline-over-atom precedence, the avatar-echo class) and the micro text follows size (measured 18px). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-shape-effective/--jx-radius-factor-effective; zero shape reads in the family atoms (grep receipt). The silhouette is the radius law, not the axis. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the corner is tokens['--jx-radius'], the FROZEN theme radius (measured 8px, byte-identical under radius=\"large\"): --jx-radius-effective is stamped and unread. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the idioms OWN their hues: the dot paints --jx-primary, the count chip paints the destructive pair (--jx-destructive / --jx-destructive-foreground); --jx-color-effective is stamped and unread (grep receipt; a color=\"error\" chip stays destructive — measured). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "TYPED-FROZEN (the frozen-pole family): the class:dark bridge lands on the root and nothing reads it — every painted voice is a typed :root emission. Measured across the bridge: inside a .dark island the count chip keeps its black ground and white ink while the theme sheet's RAW --destructive flips to oklch(1 0 0) — the typed read freezes at the :root substitution, the raw read follows the tree. That contrast is the whole mechanism, one shadow token apart. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the overlay floats by position, not shadow: zero box-shadow in the family atoms (grep receipt); the hairline frame + the background border do the lifting. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — no transition, no kernel read in the family atoms (grep receipt): the indicator is static state, and appearance/disappearance is rendered truth, not choreography. Number unit: coefficient.',
    },
  ];

  // ---- the axes canvas: the drawer IS the extracted stage (one
  // source, two surfaces — the carousel precedent) --------------------
  const axesFiles: TreeFile[] = [
    {
      name: 'src/lib/ui/badge-indicator-axes.svelte',
      content: usageFile(
        { BadgeIndicator: '@ui/badge-indicator.svelte', PressButton: '@ui/press-button.svelte' },
        resolveRawCode('axes'),
      ),
      kind: 'usage',
    },
  ];
</script>

<svelte:head>
  <title>BadgeIndicator · jixoai-ui</title>
  <meta
    name="description"
    content="antd Badge's live half: the count/dot riding a corner of its child. dot is presence without a number; count caps at 99+; zero hides honestly unless showZero. Standalone is an inline chip; the wrap re-tiers its tenant."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="badge-indicator — the live count/dot overlay"
        summary="antd Badge's live half, split from the static chip (badge.svelte): the count/dot rides a corner of its child. dot is presence without a number — label carries the accessible name; count caps at 99+ and zero hides honestly unless showZero. Standalone (no child) is an inline chip; the wrap is a live density scope for whatever it carries."
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install badge-indicator">
          <TerminalCard
            barTitle="install — badge-indicator"
            command="npx jixoai-ui add badge-indicator"
            outputs={['https://ui.jixoai.com/r/badge-indicator.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">dot · count · standalone</span>
          <span class="pill">99+ overflow cap</span>
          <span class="pill">zero hides honestly</span>
          <span class="pill">the wrap re-tiers its tenant</span>
        </div>
      </SectionCard>
    </div>


    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A positional overlay with two deterministic idioms — and a wrap that scopes what it carries."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            badge-indicator is antd Badge's OTHER half: where <code>badge</code> is the static
            status chip, this family renders the live indicator riding a corner of its child (an
            avatar, an icon button, a tab). Two idioms, each one complete paint: the
            <code>dot</code> — a 10px primary presence box with no number — and the
            <code>count</code> — an 18px destructive number box capped by <code>overflow</code>
            (default 99+). With no child the same chip renders standalone, inline.
          </p>
          <p class={cx(rt.measurePara)}>
            Composition is the family's reason to exist, and it is REAL in the eight-axis sense:
            the wrapper is <code>position: relative</code> for the corner offsets AND a live
            density scope for its tenant — an explicit rung re-bases the kernel channels inside
            the wrap, so a button under a <code>density="lg"</code> indicator measures the lg
            tier. Kinship, named precisely: <code>badge</code> is the static chip,
            <code>chip</code> is the badge's activation twin (its body geometry verbatim) — and
            the three share only the micro-scale vocabulary, never imports (grep receipt:
            badge-indicator imports nothing from either).
          </p>
          <p class={cx(rt.measurePara)}>
            The chip's own paint is the fixed micro scale: dot 10px and count 18px are unit
            equations off the never-re-based <code>--jx-unit</code>, the text is the typed micro
            step, and the frame is the hairline over the background token. Every universal axis is
            no-own — stamped and broadcast, read by no family atom — and theme is the frozen pole
            measured: inside a dark island the count chip keeps its black ground while the theme
            sheet's raw destructive flips to white. The one voice that moves is the §11 carrier's
            own echo: standalone, the inline font-size mirror lands on the chip itself (the size
            row). Per-axis below.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="badge-indicator-demo" data-region="badge-indicator-demo" data-family="badge-indicator-demo" data-reveal="">
      <ComponentCanvas
        id="badge-indicator-demo"
        title="badge-indicator"
        description="Three postures plus the honest zero. The demo children are plain spans — anything with a corner carries the badge."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/badge-indicator/badge-indicator.svelte"
        files={canvasFiles}
        stage="center"
      >
        <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap32)}>
          <BadgeIndicator dot label="2 unread">
            <span class={cx(rt.biChild)}>GB</span>
          </BadgeIndicator>
          <BadgeIndicator count={5}>
            <span class={cx(rt.biChild)}>AL</span>
          </BadgeIndicator>
          <BadgeIndicator count={250} />
          <BadgeIndicator count={0} showZero />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the dot paints brand; counts paint destructive and cap at overflow. Standalone (no
              child) is an inline chip. count=0 renders NOTHING — zero unread is no badge —
              unless showZero opts into the visible zero.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="badge-indicator-law" data-reveal="">
      <SectionCard
        family="badge-indicator-law"
        headerRegion="badge-indicator-law"
        eyebrow="law"
        title="Presence rules"
        summary="The overlay is a positional wrapper, not a semantic one: the badge rides the child's corner as decoration, and the label/count text carries the meaning. Zero is the absence of news — it renders nothing unless showZero says otherwise."
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

  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Postures" summary="Three postures — dot, count, standalone — plus the honest zero and its opt-in.">
    <div class={cx(rt.gridSm2)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>dot — presence, no number</p>
        <BadgeIndicator dot label="2 unread"><span class={cx(rt.biChild)}>GB</span></BadgeIndicator>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>count — capped at 99+</p>
        <BadgeIndicator count={250}><span class={cx(rt.biChild)}>AL</span></BadgeIndicator>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>standalone chip</p>
        <BadgeIndicator count={5} />
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>showZero</p>
        <BadgeIndicator count={0} showZero />
      </div>
    </div>
  </SectionCard></div>

  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Anything with a corner carries the badge; omit children for the standalone chip."><CodeBlock code={usage} lang="svelte" meta="BadgeIndicator usage" /></SectionCard></div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Six documented props over the eight-lane surface — dot beats count, zero hides honestly; class forwards to the wrapper/standalone chip unseen."><PropsTable universal props={[{ name: 'dot', type: 'boolean', default: '—', description: 'The presence idiom — beats count when only presence matters.' }, { name: 'count', type: 'number', default: '—', description: 'The count idiom; hidden at 0 unless showZero.' }, { name: 'overflow', type: 'number', default: '99', description: 'Cap before "n+" — the chip never shows the true number past the cap.' }, { name: 'showZero', type: 'boolean', default: 'false', description: 'Render count=0 instead of hiding.' }, { name: 'children', type: 'Snippet', default: '—', description: 'What the indicator rides on; omitted = standalone chip. The wrap is a live density scope for the child.' }, { name: 'label', type: 'string', default: "'new activity'", description: "Accessible name for the dot (role=\"img\"); counts announce their visible text." }]} /></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on badge-indicator"
      summary="All no-own, census batch B — and the chip's paint hears almost none of it: dot 10px and count 18px are unit equations off the never-re-based --jx-unit, the text is the typed micro step, the hues are the idioms' own (primary / destructive). Density's one live wire is the WRAP, a real density scope for its tenant; size's one voice is the §11 mirror's inline echo on the standalone chip; theme is the frozen pole measured across the bridge — typed chip black while raw destructive flips white. shape / radius / color / elevation / motion stamp-and-supply to nothing (grep receipts)."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch B row (explicit-props W3 batch B /
          task 3.2 — openspec/changes/explicit-props/research/migration-census.md). No-rest note:
          the interface closes at class — there is no rest spread, so no synthesized rest row
          applies (the no-rest-spread check). The old page's token rows for --jx-icon and
          --jx-inset documented density channels this family has never read; they retire with the
          measured table.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={universalUsage} lang="svelte" meta="the eight axes on badge-indicator" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="badge-indicator · the wrap re-tiers its tenant; the chip hears nothing" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="wrap-default">
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density default — tenant 40px</p>
                <BadgeIndicator count={5} density="default">
                  <PressButton>inbox</PressButton>
                </BadgeIndicator>
              </div>
              <div class={cx(rt.panel)} data-probe="wrap-lg">
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density lg — tenant 48px, chip 18px</p>
                <BadgeIndicator count={5} density="lg">
                  <PressButton>inbox</PressButton>
                </BadgeIndicator>
              </div>
              <div class={cx(rt.panel)} data-probe="stamped-chip">
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>stamped lg on the chip — 18px stays</p>
                <BadgeIndicator count={5} density="lg" />
              </div>
              <div class={cx(rt.panel)} data-probe="size-echo">
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>size 18 standalone — the inline mirror outruns the micro atom</p>
                <BadgeIndicator count={5} size={18} />
              </div>
              <div class={cx(rt.panel)} data-probe="supply-only">
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>color error + radius large — the paint does not move</p>
                <BadgeIndicator count={8} radius="large" color="error" />
              </div>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <TokenTable
            tokens={[
              { name: 'dot box', default: '10px = --jx-unit × 2.5', source: 'structural', description: 'The presence dot — width, min-width and height in one unit equation.' },
              { name: 'count chip', default: '18px = --jx-unit × 4.5', source: 'structural', description: 'Min-width and height; padding-inline one more unit for wide counts.' },
              { name: 'corner offsets', default: '±6px = --jx-unit × 1.5', source: 'structural', description: 'top/right on the anchored chip; standalone drops them (position:static).' },
              { name: 'chip text', default: '--jx-text-micro (10px)', source: 'structural', description: 'The typed micro step over --jx-font-mono, unitless leading.' },
              { name: 'chip frame', default: '--jx-hairline + --jx-background', source: 'structural', description: 'The 1px border in the page ground color — the cut-out look.' },
              { name: 'chip corner', default: '--jx-radius (frozen)', source: 'structural', description: 'The theme radius constant; the effective carrier is stamped and unread.' },
              { name: '--jx-text / --jx-hit / --jx-inset', default: 'kernel rung channels', source: 'density', description: 'UNREAD by the chip — re-based INSIDE the wrap only; the tenant consumes them (the composition law).' },
            ]}
          />
        </div>
        <div class={cx(rt.mt20)}>
          <DensityDemo>
            <div class={cx(rt.rowC24)}>
              <BadgeIndicator dot label="2 unread"><span class={cx(rt.biChild)}>GB</span></BadgeIndicator>
              <BadgeIndicator count={12}><span class={cx(rt.biChild)}>AL</span></BadgeIndicator>
              <BadgeIndicator count={250} />
              <BadgeIndicator count={5} density="lg">
                <PressButton>inbox</PressButton>
              </BadgeIndicator>
            </div>
          </DensityDemo>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The overlay is decoration riding the child; the meaning lives in the label/count text. The indicator paints STATE, not events — liveness belongs to the host."><div class={cx(rt.col20)}><A11yTable keys={[{ key: '—', action: 'Not focusable — the wrapped child keeps its own interaction; the overlay is never a stop' }]} aria={[{ name: 'role', value: 'img', description: 'On the dot only — presence with no text content of its own.' }, { name: 'aria-label', value: 'label ?? \'new activity\' (dot) · the count text', description: 'The dot announces its label; a count chip announces its visible text ("99+" included).' }, { name: 'no aria-live', value: 'ruling', description: 'The indicator paints state, not events: a count change is silent by design. When the change itself matters, the HOST owns the live region — compose one around the child; the overlay stays decoration.' }, { name: 'honest zero', value: 'absence', description: 'count=0 renders nothing — zero unread announces nothing at all, which is the truth; showZero opts into announcing "0".' }]} /></div></SectionCard></div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="badge-indicator" />
  </div>
</div>
