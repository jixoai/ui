<!--
  jixoai markdown node mapper (registry/files/ui/markdown/markdown-node.svelte).

  2026-09-06 · markdown-streaming (original request: "2026-09-06 用户：
  推出 markdown 渲染组件，支持流式渲染，AST 映射内部组件").

  Orthogonal intents:
  1. override seam — components[node.type] wins FIRST and receives { node }
     raw: trusted application code (design §3.3), delegating children back
     through this same exported component.
  2. default ladder — the frozen AST → registry/native map (design §3):
     code_block → CodeCard, table → div[data-kind="table"] wrapping Table
     with generated thead/tbody (td[data-label] header text + per-column
     align), prose/inline families → native elements under the jx-pure
     face, BOTH checkbox variants → the same disabled native input,
     label/reference wrappers → nothing.
  3. security floor of the DEFAULT map — every html node renders as
     node.content literal text (interpolation escapes; zero {@html}),
     image src must survive sanitizeImageSrc or the img is omitted
     entirely, unknown node types degrade to extractText scalars with NO
     structural recursion.
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
  import { sanitizeImageSrc, type ParsedNode, type TableNode } from 'stream-markdown-parser';
  import CodeCard from '../code-card/code-card.svelte';
  import Table from '../table/table.svelte';
  import type { MarkdownComponents } from './parse';
  // explicit self-import: the recursion carrier (the file-name
  // self-reference form compiles to an unknown custom element here)
  import MarkdownNode from './markdown-node.svelte';

  interface Props {
    node: ParsedNode;
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

  /** h1–h6, clamped — the level comes straight off the parser token. */
  function headingTag(level: number): string {
    return `h${Math.min(Math.max(level, 1), 6)}`;
  }

  /** Column alignment from the delimiter row — the only cell style we mint. */
  function alignStyle(align: 'left' | 'right' | 'center' | undefined): string | undefined {
    return align ? `text-align:${align}` : undefined;
  }

  /** td[data-label] payload: the header cell's plain text (the stack law reads it). */
  function headerLabels(table: TableNode): string[] {
    return table.header.cells.map((cell) => extractText(cell.children));
  }
</script>

{#if Override}
  <Override {node} />
{:else if isNodeType(node, 'code_block')}
  <!-- class lands on the figure root: the same no-jx-pure reverse scope
       the table carrier mounts (the native-island precedent) — the
       face's pre rules (border/padding/margin-block) and its button
       law must never reach into CodeCard's own surface laws -->
  <CodeCard class="no-jx-pure" code={node.code} lang={node.language || 'text'} />
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
  <svelte:element this={headingTag(node.level)}>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </svelte:element>
{:else if isNodeType(node, 'paragraph') || isNodeType(node, 'inline')}
  <p>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </p>
{:else if isNodeType(node, 'list')}
  {#if node.ordered}
    <ol start={node.start ?? undefined}>
      {#each node.items as item, i (i)}<MarkdownNode node={item} {components} />{/each}
    </ol>
  {:else}
    <ul>
      {#each node.items as item, i (i)}<MarkdownNode node={item} {components} />{/each}
    </ul>
  {/if}
{:else if isNodeType(node, 'list_item')}
  <li>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </li>
{:else if isNodeType(node, 'blockquote')}
  <blockquote>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </blockquote>
{:else if isNodeType(node, 'thematic_break')}
  <hr />
{:else if isNodeType(node, 'strong')}
  <strong>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </strong>
{:else if isNodeType(node, 'emphasis')}
  <em>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </em>
{:else if isNodeType(node, 'strikethrough')}
  <del>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </del>
{:else if isNodeType(node, 'highlight')}
  <mark>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </mark>
{:else if isNodeType(node, 'insert')}
  <ins>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </ins>
{:else if isNodeType(node, 'subscript')}
  <sub>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </sub>
{:else if isNodeType(node, 'superscript')}
  <sup>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </sup>
{:else if isNodeType(node, 'inline_code')}
  <!-- the jx-pure chip: a native <code>, zero async per-span work while streaming -->
  <code>{node.code}</code>
{:else if isNodeType(node, 'link')}
  <!-- href already validateLink-passed at parse; unsafe schemes never reach here -->
  <a href={node.href} title={node.title ?? undefined}>
    {#each node.children as child, i (i)}<MarkdownNode node={child} {components} />{/each}
  </a>
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
  <!-- static presentation: BOTH parser variants map to the same disabled input -->
  <input type="checkbox" disabled checked={node.checked} />
{:else if isNodeType(node, 'label_open') || isNodeType(node, 'label_close')}
  <!-- plugin wrapper tokens render nothing -->
{:else if isNodeType(node, 'html_block') || isNodeType(node, 'html_inline')}
  {node.content}
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
