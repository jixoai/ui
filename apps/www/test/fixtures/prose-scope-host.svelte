<!--
  prose-scope-host — the Lane A spec's DOM fixture
  (typography-context-and-parts, 2026-09-07). One mount, every probe
  region: bare (no knobs), all-knobs, gradient + marks, nested
  outer/inner (nearest-wins), ink + heading, chrome orthogonality
  (Chip beside P), markdown sovereignty (Prose wrapping Markdown),
  serif region + code, and the context reader (getTypographyScope from
  a child window — the promoted lib pair's read face).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Prose from '../../src/lib/ui/prose/prose.svelte';
  import P from '../../src/lib/ui/text/p.svelte';
  import Strong from '../../src/lib/ui/text/strong.svelte';
  import Mark from '../../src/lib/ui/text/mark.svelte';
  import Heading from '../../src/lib/ui/heading/heading.svelte';
  import Chip from '../../src/lib/ui/chip/chip.svelte';
  import Markdown from '../../src/lib/ui/markdown/markdown.svelte';
  import ScopeReader from './prose-scope-reader.svelte';

  let {
    outerLeading = 1.8,
    innerInk = 'muted',
    children,
  }: {
    outerLeading?: number;
    innerInk?: string;
    children?: Snippet;
  } = $props();
</script>

<section data-testid="regions">
  <!-- bare: every knob absent — no style, no attrs, no vars -->
  <div data-testid="bare-wrap"><Prose>{@render children?.()}</Prose></div>

  <!-- all eleven knobs set at once -->
  <div data-testid="full-wrap">
    <Prose
      size="1.125rem"
      leading={1.9}
      family="serif"
      ink="primary"
      gradient={{ from: 'var(--primary)', to: 'var(--info)', angle: 90 }}
      ground="muted"
      align="justify"
      indent="2em"
      initialLetter={3}
      wrap="pretty"
      hyphens="auto"
    >
      <P>full region</P>
    </Prose>
  </div>

  <!-- gradient + the mark restore payload -->
  <div data-testid="gradient-wrap">
    <Prose gradient={{ from: 'oklch(0.7 0.2 330)', to: 'oklch(0.4 0.2 260)' }}>
      <P>gradient body <Strong>solid strong</Strong> <Mark>mark</Mark></P>
    </Prose>
  </div>

  <!-- nested: nearest setter wins per knob; absent knobs keep the
       ambient channel flowing (outer size/leading, inner ink) -->
  <div data-testid="nested-wrap">
    <Prose size="16px" leading={outerLeading}>
      <Prose ink={innerInk}>
        <P>nested body</P>
        <ScopeReader testid="reader-inner" />
      </Prose>
      <ScopeReader testid="reader-outer-mid" />
    </Prose>
    <ScopeReader testid="reader-outer-after" />
  </div>

  <!-- ink + heading consumption + the consumer override face -->
  <div data-testid="heading-wrap">
    <Prose ink="muted">
      <Heading level={2}>scoped heading</Heading>
      <Heading level={3} class="text-primary">consumer override</Heading>
    </Prose>
    <Heading level={2}>unscoped heading</Heading>
  </div>

  <!-- chrome orthogonality: a Chip beside a P inside a muted region -->
  <div data-testid="chip-wrap">
    <Prose ink="muted">
      <P>muted body</P>
      <Chip>chip in region</Chip>
    </Prose>
  </div>

  <!-- the sovereignty probe: Prose size+leading wrapping Markdown
       typography=relaxed (the trio must keep its own scale) -->
  <div data-testid="sovereignty-wrap">
    <Prose size="20px" leading={1.4}>
      <Markdown source="para one" typography="relaxed" />
    </Prose>
  </div>

  <!-- serif region + code: the family knob flows by inheritance, the
       face's code element rule keeps mono -->
  <div data-testid="serif-wrap">
    <Prose family="serif">
      <P>serif body <code>const mono = true;</code></P>
    </Prose>
  </div>

  <!-- indent: the hook is P-only, never a heading channel -->
  <div data-testid="indent-wrap">
    <Prose indent="2em">
      <P>indented body</P>
      <Heading level={4}>not indented</Heading>
    </Prose>
  </div>
</section>
