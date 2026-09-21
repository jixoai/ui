<!--
  Docs page for link (markdown-coverage-components §1.4, Lane D). The
  typographic link: pattern-based external detection (ANY absolute
  http(s) href — no window.location in SSR), external pair landed after
  the spread (the separator law).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import { usageFile } from '$lib/canvas-usage';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import linkSource from '$lib/ui/link/link.svelte?raw';

  // The canvas same-source lane (typography-context-and-parts §7): the
  // usage sample composes from THIS PAGE's own canvas markup — one
  // source, two surfaces (the SectionCard CodeBlock + the drawer's
  // usage TreeFile). The hand template literal + `const close` dodge
  // (and the drifted, never-rendered iconUsage const) are gone.
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/link.html/+page';

  const usage = usageFile({ '{ Link }': '@ui/link' }, resolveRawCode('lanes'));
  const iconUsage = usageFile({ '{ Link }': '@ui/link' }, resolveRawCode('icon'));

  const detectionUsage = `// the whole external contract, as source:
const external = /^https?:\\/\\//i.test(href);

<a
  href={href}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-jx-link={external ? 'external' : 'internal'}
/>`;

  // per-canvas arrays (the shared one drifted: both drawers showed the
  // lanes sample while the icon canvas rendered its own tri-state rows)
  const lanesFiles: TreeFile[] = [
    { name: 'registry/files/ui/link/link.svelte', content: linkSource },
    { name: 'src/lib/ui/link-usage.svelte', content: usage, kind: 'usage' },
  ];
  const iconFiles: TreeFile[] = [
    { name: 'registry/files/ui/link/link.svelte', content: linkSource },
    { name: 'src/lib/ui/link-icon-usage.svelte', content: iconUsage, kind: 'usage' },
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
  // ---- the universal props demo (explicit-props W3-B) --------------------
  const universalUsage = `<!-- the eight-axis surface on the prose link -->
<Link href="/docs.html" size={14} density="small">px number</Link>
<Link href="/docs.html" size="large" radius="medium">named steps</Link>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/link-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Link · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai link: the typographic link as a native anchor carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it stands alone outside any jx-pure scope. External detection is pattern-based (any absolute http(s) href): external links open a new tab with rel=noreferrer, app routes keep same-tab navigation."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="link — the typographic lane, standing alone"
        summary="A native <a> carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it works with no jx-pure scope in sight; inside one, the values coincide with the face's own channels (same property, same token, deterministic no-op). External detection is PATTERN-based, not origin-based: any absolute http(s) href is external — no window.location semantics dragged into SSR — and externals open a new tab with rel=noreferrer (the fleet convention; doc-link and PressButton both ship bare noreferrer, and modern browsers imply noopener from it). href, title and the external pair land AFTER the spread (the separator law): the contract is the component's, not overridable through rest props."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;a&gt;</span>
          <span class="pill">http(s) = external · new tab</span>
          <span class="pill">rel=noreferrer (noopener implied)</span>
          <span class="pill">icon tri-state · undefined ≠ off</span>
          <span class="pill">app routes stay same-tab</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="link" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Hand it an href — that alone decides the external contract. Everything else is the advisory and attribute passthrough."
      >
        <CodeBlock code={usage} lang="svelte" meta="Link usage" />
      </SectionCard>
    </div>

    <div id="lanes" data-region="link-lanes" data-family="link-lanes" data-reveal="">
      <ComponentCanvas
        id="lanes"
        title="link"
        description="The two lanes: app routes keep same-tab default navigation (a route change, not a departure), absolute http(s) hrefs open in a new tab with rel=noreferrer. Same component, same ink, one pattern deciding the contract."
        sourceUrl={registrySourceUrl('link')}
        files={lanesFiles}
        stage="fill"
      >
        <div class={cx(rt.flex, rt.wFull, rt.maxWXl, rt.col, rt.gap12, rt.lkBody)}>
          <p class={cx(rt.m0)}>
            Same document, different lanes: read
            <Link href="/docs/components/markdown.html" title="the markdown page">the markdown page</Link>
            here, or leave for
            <Link href="https://github.com/jixoai/ui" title="the repository">the repository</Link>
            in a new tab.
          </p>
          <p class={cx(rt.m0, rt.inkMuted)}>
            Prose composition — the offset keeps the underline off the descenders:
            <Link href="https://commonmark.org" title="the CommonMark spec">CommonMark</Link>,
            <Link href="https://tailwindcss.com/docs/typography-plugin" title="the Typography plugin">Tailwind Typography</Link>,
            and quiet reference ink inside a muted paragraph.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              Detection is <code>/^https?:\/\//i</code> — a pure function of the href, so SSR and
              hydration agree with zero environment reads. The hook stamps the result:
              <code>data-jx-link="external" | "internal"</code>. The underline is hover-only; the
              4px offset is the face's own calibration.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="icon" data-region="link-icon" data-family="link-icon" data-reveal="">
      <ComponentCanvas
        id="icon"
        title="link"
        description="The suffix-icon lane — tri-state icon, the input semantic-glyph law verbatim: undefined is NOT off. Omitted paints the default externalLink glyph IFF external (an inline-core name answering getIcon synchronously — SSR paints it, hydration matches, no flash); null turns the lane OFF; a snippet renders custom content in the lane. Internal links never carry the lane at any setting."
        sourceUrl={registrySourceUrl('link')}
        files={iconFiles}
        stage="fill"
      >
        <div class={cx(rt.flex, rt.wFull, rt.maxWXl, rt.col, rt.gap12, rt.lkBody)}>
          {#snippet arrowGlyph()}<span aria-hidden="true" class={cx(rt.fontMono)}>→</span>{/snippet}
          <p class={cx(rt.m0)}>
            undefined (omitted) — the default glyph on an external:
            <Link href="https://github.com/jixoai/ui">the repository</Link>
          </p>
          <p class={cx(rt.m0)}>
            null — the lane explicitly off:
            <Link href="https://github.com/jixoai/ui" icon={null}>a quiet external</Link>
            (still target=_blank; only the glyph is gone)
          </p>
          <p class={cx(rt.m0)}>
            snippet — custom content in the lane:
            <Link href="https://github.com/jixoai/ui" icon={arrowGlyph}>leaving the document</Link>
          </p>
          <p class={cx(rt.m0, rt.inkMuted)}>
            internal — the lane never ships:
            <Link href="/docs/components/markdown.html">staying in the document</Link>
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The lane is a <code>data-jx-link-icon</code> span INSIDE the anchor after the
              children — <code>aria-hidden</code> (decorative: the target/rel pair already carries
              the semantics), em-sized (0.8em rides any ambient scale), with
              <code>ms-[0.2em]</code> owning the whole gap (no intervening text node — a stray
              space would stack a second font-dependent gap). registry edge: link depends on
              <code>@jixoai/icon</code> — import the component, never the generated set.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="detection" data-region="link-detection" data-family="link-detection" data-reveal="">
      <SectionCard
        family="detection"
        headerRegion="detection"
        eyebrow="law"
        title="Why pattern, not origin"
        summary="Origin comparison (href.origin !== window.location.origin) is the familiar heuristic — and it drags window.location into a server render, couples the component to the host it mounts in, and misfires on preview hosts and subpath deployments. The pattern reading is stricter by design: ANY absolute http(s) href is a departure from the document, which is exactly what the new-tab contract means. Relative routes, anchors and non-http schemes keep default navigation."
      >
        <CodeBlock code={detectionUsage} lang="ts" meta="the external contract" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Native anchor semantics; the accessible name is the link text (write the departure into the words, not a glyph)."
    >
      <A11yTable
        keys={[{ key: 'Enter', action: 'Activates the anchor — native behavior, untouched' }]}
        aria={[
          { name: 'a', value: 'native element', description: 'The platform announces the link role and its href; no extra ARIA.' },
          { name: 'target / rel', value: 'external pair', description: 'target=_blank + rel=noreferrer land only on detected externals; the implied noopener is the fleet convention.' },
          { name: 'data-jx-link', value: "'external' | 'internal'", description: 'Hook attribute naming which lane rendered — styling and tests read it without reverse-engineering the href.' },
          { name: 'data-jx-link-icon', value: 'aria-hidden lane', description: 'The suffix-icon span is decorative: the accessible name is the link text alone, and the target/rel pair — never a glyph — carries the departure semantics.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The 0.8em suffix glyph rescales with the size axis; the anchor root stamps the carriers."
    >
      <ComponentCanvas title="Link · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Link href="/docs.html" size={14} density="small">size 14 · density small</Link></div>
        <div class={cx(rt.panel)}><Link href="/docs.html" size="large" density="large">size large · density large</Link></div>
        <div class={cx(rt.panel)}><Link href="https://jixoai.com" size="medium" color="primary">external · primary</Link></div>
        <div class={cx(rt.panel)}><Link href="/docs.html" radius="medium">radius medium</Link></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
        summary="Four props and a verbatim spread; href alone decides the external contract, icon decides only the decorative suffix lane."
    >
      <PropsTable universal props={[
        { name: 'href', type: 'string', default: '—', description: 'The link target. An absolute http(s) href makes the link external: target=_blank + rel=noreferrer. App routes, anchors and non-http schemes keep default navigation.', required: true },
        { name: 'title', type: 'string', default: '—', description: 'Advisory title, passthrough to the native attribute.' },
        { name: 'icon', type: 'Snippet | null', default: 'undefined — glyph on externals', description: 'The suffix-icon lane, tri-state (undefined ≠ off): omitted paints the default externalLink glyph IFF external (inline-core, SSR-painted, no flash); null turns the lane off; a snippet renders custom content in the data-jx-link-icon span (aria-hidden, 0.8em). Internal links never carry the lane at any setting.' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The link label; omit for attribute-only anchors.' },
        { name: 'class', type: 'string', default: "''", description: 'Forwarded to the anchor; consumer classes land last.' },
        { name: '...rest', type: 'HTMLAnchorAttributes', default: 'spread', description: 'Every other attribute passes through to the native anchor — but href, title, target and rel are the component\'s contract and land after the spread (the separator law).' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="link" />
  </div>
</div>
