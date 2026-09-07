<!--
  jixoai markdown node mapper (registry/files/ui/markdown/markdown-node.svelte).

  2026-09-06 · markdown-streaming (original request: "2026-09-06 用户：
  推出 markdown 渲染组件，支持流式渲染，AST 映射内部组件");
  2026-09-07 · markdown-coverage — the first-party map (design §3):
  the reading-content constructs became registry parts, uniformly
  managed.

  Orthogonal intents:
  1. override seam — components[node.type] wins FIRST and receives { node }
     raw: trusted application code (design §3.3), delegating children back
     through this same exported component.
  2. default ladder — the frozen AST → registry-part map (design §3):
     code_block → CodeCard, table → div[data-kind="table"] wrapping Table
     with generated thead/tbody (td[data-label] header text + per-column
     align), blockquote → Blockquote (GitHub-alert detection first, §4),
     heading → Heading, list → List, paragraph/inline + the seven marks →
     the text family sugars, link → Link, inline_code → InlineCode
     (riding the component's lang="auto" default: detection is sync and
     zero-download, the highlight is an async in-place upgrade through
     the engine seam — SSR plain, zero layout shift), thematic_break →
     Separator — while list_item stays a native li, BOTH checkbox variants
     stay the same disabled native input (design §2.5: the bare-checkbox
     face IS the component-equivalent), the pure-text floor (text,
     hardbreak, emoji, dl, footnote bits) stays native, and
     label/reference wrappers render nothing. ESCAPE SCOPING (design §2):
     Blockquote/Heading/List/InlineCode/Separator mount no-jx-pure —
     box-owning surfaces whose face rules must stop double-painting them
     (Separator rides a neutral carrier div, the CodeCard m-0 precedent);
     P/marks/Link do NOT escape — inline escapes would virally descope
     the code chips, images and nested marks they legitimately contain.
  3. security floor of the DEFAULT map — whitelisted html nodes map
     onto the SAME components as their markdown spellings (the
     equivalence law, design §8: `some <b>text</b>` ≡ `some **text**`,
     details/summary → the native-details accordion); every tag
     outside the frozen table renders as node.content literal text
     (interpolation escapes; zero {@html}), image src must survive
     sanitizeImageSrc or the img is omitted entirely, unknown node
     types degrade to extractText scalars with NO structural
     recursion.
  4. recursion — children render through this component (explicit
     self-import, the recursion carrier); inner elements may swap freely
     while the keyed block item above stays mounted (the L1–L4 laws
     govern the ITEM, never the subtree).

  The UnknownNode catch-all ({ type: string }) survives TS literal
  narrowing, so every branch narrows through isNodeType (Extract drops
  the catch-all where the literal matches a known member).
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import {
    isUnsafeHtmlUrl,
    sanitizeImageSrc,
    type ParsedNode,
    type TableNode,
  } from 'stream-markdown-parser';
  import CodeCard from '../code-card/code-card.svelte';
  import Table from '../table/table.svelte';
  import Blockquote from '../blockquote/blockquote.svelte';
  import Heading from '../heading/heading.svelte';
  import List from '../list/list.svelte';
  import Link from '../link/link.svelte';
  import P from '../text/p.svelte';
  import Strong from '../text/strong.svelte';
  import Em from '../text/em.svelte';
  import Del from '../text/del.svelte';
  import Mark from '../text/mark.svelte';
  import Ins from '../text/ins.svelte';
  import Sub from '../text/sub.svelte';
  import Sup from '../text/sup.svelte';
  import InlineCode from '../inline-code/inline-code.svelte';
  import Checkbox from '../checkbox/checkbox.svelte';
  import Separator from '../separator/separator.svelte';
  import Kbd from '../kbd/kbd.svelte';
  import Accordion from '../accordion/accordion.svelte';
  import AccordionItem from '../accordion/accordion-item.svelte';
  import {
    detectBlockquoteAlert,
    detailsToAccordionItem,
    GITHUB_ALERTS,
    htmlAttrsToRecord,
    HTML_INLINE_TAG_TO_MARK,
    type AccordionGroupNode,
    type MarkdownComponents,
    type MarkdownNodeInput,
  } from './parse';
  // explicit self-import: the recursion carrier (the file-name
  // self-reference form compiles to an unknown custom element here)
  import MarkdownNode from './markdown-node.svelte';

  interface Props {
    node: MarkdownNodeInput;
    /** Per-node-type overrides — trusted application code (design §3.3). */
    components?: MarkdownComponents;
  }

  let { node, components }: Props = $props();

  // The override lookup is ONE documented cast at the trust boundary:
  // MarkdownComponents keys each type to Component<{ node: NodeOf<K> }>,
  // but at lookup time the node is the already-parsed ParsedNode — the
  // map is app-authored, so the app owns both sides of the contract.
  const overrides = $derived(
    components as unknown as Record<string, Component<{ node: ParsedNode }> | undefined> | undefined,
  );
  const Override = $derived(overrides?.[node.type]);

  /** Extract-based narrowing: drops the { type: string } catch-all member. */
  function isNodeType<K extends string>(candidate: ParsedNode, type: K): candidate is Extract<ParsedNode, { type: K }> {
    return candidate.type === type;
  }

  /** Scalar-only text extraction (labels, unknown-node fallback) — never renders structure. */
  function extractText(nodes: ParsedNode | readonly ParsedNode[] | undefined): string {
    if (nodes === undefined) return '';
    if (Array.isArray(nodes)) return nodes.map(extractText).join('');
    switch (nodes.type) {
      case 'text':
      case 'html_block':
      case 'html_inline':
      case 'math_inline':
      case 'math_block':
        return nodes.content;
      case 'inline_code':
      case 'code_block':
        return nodes.code;
      case 'emoji':
        return nodes.markup || nodes.raw;
      case 'image':
        return nodes.alt;
      default: {
        let text = '';
        if (nodes.code !== undefined) text += nodes.code;
        if ('children' in nodes && Array.isArray(nodes.children)) text += extractText(nodes.children);
        return text;
      }
    }
  }

  /** Column alignment from the delimiter row — the only cell style we mint. */
  function alignStyle(align: 'left' | 'right' | 'center' | undefined): string | undefined {
    return align ? `text-align:${align}` : undefined;
  }

  /** td[data-label] payload: the header cell's plain text (the stack law reads it). */
  function headerLabels(table: TableNode): string[] {
    return table.header.cells.map((cell) => extractText(cell.children));
  }

  // ---- the html equivalence lane (design §8) --------------------------------

  /** The synthetic accordion_group narrows through its own guard — the
   *  parser's union (with its { type: string } catch-all) cannot. */
  function isAccordionGroup(candidate: MarkdownNodeInput): candidate is AccordionGroupNode {
    return candidate.type === 'accordion_group';
  }

  /** The equivalence law's component map: the html tag's mark resolves
   *  to the SAME sugar the markdown spelling rides — `<b>` and `**`
   *  land in one Strong, indistinguishable. */
  const HTML_MARK_COMPONENTS = {
    strong: Strong,
    em: Em,
    del: Del,
    ins: Ins,
    mark: Mark,
    sub: Sub,
    sup: Sup,
  } as const;

  /** html_inline carries attrs at RUNTIME (probe-verified) while the
   *  package's .d.ts omits the field on the inline shape — ONE
   *  documented structural widening at the boundary, the same trust
   *  class as the override cast above. */
  function htmlInlineAttrs(node: Extract<ParsedNode, { type: 'html_inline' }>): Record<string, string> {
    return htmlAttrsToRecord(
      (node as typeof node & { attrs?: readonly (readonly [string, string])[] | null }).attrs,
    );
  }
</script>

{#if Override}
  <Override {node} />
{:else if isNodeType(node, 'code_block')}
  <!-- the neutral carrier div owns the RHYTHM (boxed chrome's own m-0
       utility would kill a root-level margin; the wrapper carries none,
       so the block stack lands on it). CodeCard keeps the no-jx-pure
       reverse scope (the native-island precedent): the face's pre rules
       and its button law never reach the card's own surface laws -->
  <div>
    <CodeCard class="no-jx-pure" code={node.code} lang={node.language || 'text'} />
  </div>
{:else if isNodeType(node, 'table')}
  {@const labels = headerLabels(node)}
  <!-- the harvest-marker carrier (design §3.4): a semantically neutral
       div around Table's <figure> — no layout paint of its own. The
       no-jx-pure class is the face's OWN reverse scope (the jx-pure
       docs page's native-island precedent): Table is a registry
       surface with its own table laws (horizontal hairlines, separate
       borders, its hover state machine), and the face's bare-table
       rules (1px full borders, collapsed borders, uppercase head)
       must never reach into them — visual-review fix 2026-09-07 -->
  <div data-kind="table" class="no-jx-pure">
    <Table>
      <thead>
        <tr>
          {#each node.header.cells as cell, i (i)}
            <th scope="col" style={alignStyle(cell.align)}>
              {#each cell.children as child, j (j)}<MarkdownNode node={child} {components} />{/each}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <!-- streaming mid-state: a row whose every cell is still empty is
             the parser's not-yet-typed shell — rendering it paints an
             empty box row that reads as breakage (the visual-review
             finding); it appears the moment any cell gains content -->
        {#each node.rows.filter((row) => row.cells.some((cell) => cell.children.length > 0)) as row, r (r)}
          <tr>
            {#each row.cells as cell, i (i)}
              <td data-label={labels[i]} style={alignStyle(cell.align)}>
                {#each cell.children as child, j (j)}<MarkdownNode node={child} {components} />{/each}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>
{:else if isNodeType(node, 'heading')}
  <!-- no-jx-pure (§2.1): Heading owns the em size ladder + the B1
       channels; the element-based rhythm selectors keep matching the
       native h* root with zero retargeting. level passes RAW — the
       component clamps once, the hook stamps the rendered truth -->
  <Heading level={node.level} class="no-jx-pure">
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Heading>
{:else if isNodeType(node, 'paragraph') || isNodeType(node, 'inline')}
  <!-- face-composing (§2.2): P never escapes — the p un-short-circuit
       law and the ambient preset leading keep flowing through it -->
  <P>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </P>
{:else if isNodeType(node, 'list')}
  <!-- no-jx-pure (§2.1): List owns the B8 channels; list_item recursion
       below stays a native li so the task-item DOM-shape laws in
       markdown.css keep matching. The AST list exposes ITEMS, not
       children — the iteration is the parser's own shape -->
  <List ordered={node.ordered} start={node.start ?? undefined} class="no-jx-pure">
    {#each node.items as item, i (i)}<MarkdownNode node={item} {components} />{/each}
  </List>
{:else if isNodeType(node, 'list_item')}
  <li>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </li>
{:else if isNodeType(node, 'blockquote')}
  {@const alert = detectBlockquoteAlert(node)}
  <!-- ONE Blockquote whose props flip (§4's streaming law): the GitHub
       alert face — tonal rung + label + the status hue the jx-hue-*
       site utility injects into --jx-tonal, children from the
       detector's marker-stripped clones (its immutability law) — and
       the plain quote are the SAME component instance with different
       props, so the marker completing mid-stream swaps the face IN
       PLACE: the blockquote DOM node survives (the keyed-item law
       plus the element law; an if/else branch switch would tear the
       node down and the test pins that) -->
  <Blockquote
    class={alert ? `no-jx-pure ${GITHUB_ALERTS[alert.kind].hueClass}` : 'no-jx-pure'}
    variant={alert ? 'tonal' : undefined}
    label={alert ? GITHUB_ALERTS[alert.kind].label : undefined}
  >
    {#each (alert ? alert.children : node.children) as child, i (i)}
      <MarkdownNode node={child} {components} />
    {/each}
  </Blockquote>
{:else if isNodeType(node, 'thematic_break')}
  <!-- the carrier div owns the RHYTHM (Separator's own m-0 utility
       would kill a root-level margin — the CodeCard law); the root
       escapes so the face's hr rules never double-paint it -->
  <div>
    <Separator class="no-jx-pure" />
  </div>
{:else if isNodeType(node, 'strong')}
  <Strong>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Strong>
{:else if isNodeType(node, 'emphasis')}
  <Em>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Em>
{:else if isNodeType(node, 'strikethrough')}
  <Del>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Del>
{:else if isNodeType(node, 'highlight')}
  <Mark>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Mark>
{:else if isNodeType(node, 'insert')}
  <Ins>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Ins>
{:else if isNodeType(node, 'subscript')}
  <Sub>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Sub>
{:else if isNodeType(node, 'superscript')}
  <Sup>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </Sup>
{:else if isNodeType(node, 'inline_code')}
  <!-- the chip escapes (§2.3: a chip's children are text — no
       face-styled descendants to descope); lang rides the component's
       auto default — detection is ours, sync, zero-download; the
       grammar highlight is the async in-place upgrade through the
       engine seam (SSR plain, zero layout shift, no per-span keyed
       work); consumers can still pin lang through the override seam -->
  <InlineCode class="no-jx-pure">{node.code}</InlineCode>
{:else if isNodeType(node, 'link')}
  <!-- face-composing (§2.2): a link's descendants stay face-scoped.
       href re-validates HERE (the §8.1 amendment): markdown-syntax
       links arrive validateLink-passed, but the parser's html-anchor
       pre-conversion bypasses it (probe-verified: <a
       href="javascript:…"> yields a link node with the unsafe href
       intact) — one defense line covers both syntaxes; unsafe hrefs
       render their text with no anchor at all. Link owns external
       detection (target/rel) itself -->
  {#if isUnsafeHtmlUrl(node.href)}
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  {:else}
    <Link href={node.href} title={node.title ?? undefined}>
      {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
    </Link>
  {/if}
{:else if isNodeType(node, 'image')}
  {@const src = sanitizeImageSrc(node.src)}
  {#if src}
    <img {src} alt={node.alt} title={node.title ?? undefined} loading="lazy" decoding="async" />
  {/if}
{:else if isNodeType(node, 'text')}
  {node.content}
{:else if isNodeType(node, 'hardbreak')}
  <br />
{:else if isNodeType(node, 'emoji')}
  {node.markup || node.raw}
{:else if isNodeType(node, 'checkbox_input') || isNodeType(node, 'checkbox')}
  <!-- static presentation: BOTH parser variants map to the same disabled
       BARE Checkbox (the 2026-09-08 Owner ruling 用真组件): the single
       input carries the component's paint class while staying a
       DIRECT child — the container-level DOM-shape laws (li:has(>
       input) marker suppression, the vertical-align alignment) keep
       matching, which the interactive wrapper's div>span>input shape
       defeats. The source text owns the state — the marker is
       disabled, presentation-only -->
  <Checkbox bare checked={node.checked} disabled />
{:else if isNodeType(node, 'label_open') || isNodeType(node, 'label_close')}
  <!-- plugin wrapper tokens render nothing -->
{:else if isAccordionGroup(node)}
  <!-- the merged consecutive-details run (design §8.3): ONE accordion
       group — the frame and seams the pile of bare <details> lacks.
       The root escapes the face so its own summary/details rules
       never fight the accordion's W3C-first paint; `<details open>`
       carries through to the item -->
  <Accordion class="no-jx-pure">
    {#each node.items as item, i (i)}
      <AccordionItem open={item.open}>
        {#snippet summary()}
          {#each item.summary as child, j (j)}<MarkdownNode node={child} {components} />{/each}
        {/snippet}
        {#each item.children as child, j (j)}<MarkdownNode node={child} {components} />{/each}
      </AccordionItem>
    {/each}
  </Accordion>
{:else if isNodeType(node, 'html_block')}
  <!-- the html equivalence law at BLOCK position (design §8.2): owned
       tags route to their markdown equivalents; everything else keeps
       the escaped-literal security floor -->
  {#if node.tag === 'hr'}
    <div>
      <Separator class="no-jx-pure" />
    </div>
  {:else if node.tag === 'details'}
    <!-- a details at NESTED position (inside an item body, a quote…) —
         the group merge only sees top-level runs, so this one frames
         itself as a group-of-one -->
    {@const item = detailsToAccordionItem(node)}
    <Accordion class="no-jx-pure">
      <AccordionItem open={item.open}>
        {#snippet summary()}
          {#each item.summary as child, j (j)}<MarkdownNode node={child} {components} />{/each}
        {/snippet}
        {#each item.children as child, j (j)}<MarkdownNode node={child} {components} />{/each}
      </AccordionItem>
    </Accordion>
  {:else}
    {node.content}
  {/if}
{:else if isNodeType(node, 'html_inline')}
  <!-- the html equivalence law at INLINE position: `some <b>text</b>`
       and `some **text**` render the SAME component — one Strong, one
       hook, indistinguishable. href re-validates here (the html path
       does not inherit markdown-it's validateLink); unknown tags stay
       escaped text -->
  {@const htmlTag = (node.tag ?? '').toLowerCase()}
  {@const htmlMark = HTML_INLINE_TAG_TO_MARK[htmlTag]}
  {#if htmlMark !== undefined}
    {@const MarkComponent = HTML_MARK_COMPONENTS[htmlMark]}
    <MarkComponent>
      {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
    </MarkComponent>
  {:else if htmlTag === 'code'}
    <InlineCode class="no-jx-pure">
      {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
    </InlineCode>
  {:else if htmlTag === 'kbd'}
    <Kbd>
      {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
    </Kbd>
  {:else if htmlTag === 'br'}
    <br />
  {:else if htmlTag === 'a'}
    {@const attrs = htmlInlineAttrs(node)}
    {#if attrs.href !== undefined && attrs.href !== '' && !isUnsafeHtmlUrl(attrs.href)}
      <Link href={attrs.href} title={attrs.title || undefined}>
        {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
      </Link>
    {:else}
      {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
    {/if}
  {:else if htmlTag === 'img'}
    {@const attrs = htmlInlineAttrs(node)}
    {@const src = sanitizeImageSrc(attrs.src ?? '')}
    {#if src}
      <img {src} alt={attrs.alt ?? ''} title={attrs.title || undefined} loading="lazy" decoding="async" />
    {/if}
  {:else}
    {node.content}
  {/if}
{:else if isNodeType(node, 'footnote_reference')}
  <sup>{node.id}</sup>
{:else if isNodeType(node, 'footnote')}
  <!-- inert degradation, no section semantics: the children render as plain blocks -->
  {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
{:else if isNodeType(node, 'footnote_anchor')}
  <!-- back-reference anchor: nothing to show without the section it points at -->
{:else if isNodeType(node, 'definition_list')}
  <dl>
    {#each node.items as item, i (i)}
      {#each item.term as term, j (j)}
        <dt><MarkdownNode node={term} {components} /></dt>
      {/each}
      {#each item.definition as definition, j (j)}
        <dd><MarkdownNode node={definition} {components} /></dd>
      {/each}
    {/each}
  </dl>
{:else if isNodeType(node, 'math_inline') || isNodeType(node, 'math_block')}
  {node.content}
{:else if isNodeType(node, 'reference')}
  <!-- link-reference marker: nothing -->
{:else}
  {extractText(node)}
{/if}
