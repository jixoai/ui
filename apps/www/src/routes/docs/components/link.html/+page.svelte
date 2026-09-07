<!--
  Docs page for link (markdown-coverage-components §1.4, Lane D). The
  typographic link: pattern-based external detection (ANY absolute
  http(s) href — no window.location in SSR), external pair landed after
  the spread (the separator law).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import linkSource from '$lib/ui/link/link.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { Link } from '@ui/link';
${close}

<!-- app route: same-tab default navigation -->
<Link href="/docs/components/markdown.html">the markdown page</Link>

<!-- absolute http(s): detected external — target=_blank + rel=noreferrer -->
<Link href="https://github.com/jixoai/ui">the repository</Link>

<!-- title rides through as the advisory attribute -->
<Link href="https://commonmark.org" title="the CommonMark spec">CommonMark</Link>`;

  const detectionUsage = `// the whole external contract, as source:
const external = /^https?:\\/\\//i.test(href);

<a
  href={href}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-jx-link={external ? 'external' : 'internal'}
/>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/link/link.svelte', content: linkSource },
    { name: 'src/lib/ui/link-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Link · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai link: the typographic link as a native anchor carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it stands alone outside any jx-pure scope. External detection is pattern-based (any absolute http(s) href): external links open a new tab with rel=noreferrer, app routes keep same-tab navigation."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="link — the typographic lane, standing alone"
        summary="A native <a> carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it works with no jx-pure scope in sight; inside one, the values coincide with the face's own channels (same property, same token, deterministic no-op). External detection is PATTERN-based, not origin-based: any absolute http(s) href is external — no window.location semantics dragged into SSR — and externals open a new tab with rel=noreferrer (the fleet convention; doc-link and PressButton both ship bare noreferrer, and modern browsers imply noopener from it). href, title and the external pair land AFTER the spread (the separator law): the contract is the component's, not overridable through rest props."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;a&gt;</span>
          <span class="pill">http(s) = external · new tab</span>
          <span class="pill">rel=noreferrer (noopener implied)</span>
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
        title="link"
        description="The two lanes: app routes keep same-tab default navigation (a route change, not a departure), absolute http(s) hrefs open in a new tab with rel=noreferrer. Same component, same ink, one pattern deciding the contract."
        sourceUrl={registrySourceUrl('link')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="flex w-full max-w-xl flex-col gap-3 text-[13.5px] leading-7">
          <p class="m-0">
            Same document, different lanes: read
            <Link href="/docs/components/markdown.html" title="the markdown page">the markdown page</Link>
            here, or leave for
            <Link href="https://github.com/jixoai/ui" title="the repository">the repository</Link>
            in a new tab.
          </p>
          <p class="m-0 text-muted-foreground">
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
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
      summary="Three props and a verbatim spread; href alone decides the external contract."
    >
      <PropsTable props={[
        { name: 'href', type: 'string', default: '—', description: 'The link target. An absolute http(s) href makes the link external: target=_blank + rel=noreferrer. App routes, anchors and non-http schemes keep default navigation.', required: true },
        { name: 'title', type: 'string', default: '—', description: 'Advisory title, passthrough to the native attribute.' },
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
