/**
 * Shared markdown doc-shape assertions (test/helpers/markdown-doc-shape.ts,
 * markdown-streaming SSR parity): ONE assertion path, TWO runtimes —
 * the node-env SSR suite (renderToHtml → JSDOM) and the jsdom client
 * suite (mount) both run THIS on the same DOC fixture, so structural
 * parity between server frame and client frame is enforced by
 * construction, not by duplicated expectations.
 *
 * markdown-coverage (2026-09-07): the reading-content constructs ride
 * registry parts now — every remapped construct asserts BOTH the
 * valued hook AND the underlying native element (the components'
 * roots ARE the native elements; the hook is the component's stamp).
 */

import { expect } from 'vitest';

export const SSR_DOC = [
  '## Snapshot',
  '',
  'Static **doc** with `chip`, [link](https://example.com).',
  '',
  '- [x] done',
  '- [ ] open',
  '',
  '| A | B |',
  '| --- | ---: |',
  '| 1 | 2 |',
  '',
  '```ts',
  'const a = 1;',
  '```',
  '',
  '> quote',
].join('\n');

export function assertMarkdownDocShape(root: Element, { streaming }: { streaming: boolean }): void {
  // the full document shape, identical on both runtimes
  if (streaming) {
    expect(root.getAttribute('data-jx-markdown-streaming')).not.toBeNull();
    expect(root.querySelector('[data-jx-markdown-cursor]')).not.toBeNull();
  } else {
    expect(root.getAttribute('data-jx-markdown-streaming')).toBeNull();
    expect(root.querySelector('[data-jx-markdown-cursor]')).toBeNull();
  }
  expect(root.classList.contains('jx-pure')).toBe(true);
  // hook AND native root, per remapped construct (the first-party map)
  expect(root.querySelectorAll('h2').length).toBe(1);
  expect(root.querySelectorAll('h2[data-jx-heading="2"]').length).toBe(1);
  expect(root.querySelectorAll('p').length).toBeGreaterThanOrEqual(2);
  expect(root.querySelectorAll('p[data-jx-text="p"]').length).toBeGreaterThanOrEqual(2);
  expect(root.querySelectorAll('input[type="checkbox"]').length).toBe(2);
  expect(root.querySelectorAll('figure').length).toBe(2); // CodeCard + Table's frame
  expect(root.querySelectorAll('[data-kind="code"]').length).toBe(1);
  expect(root.querySelectorAll('[data-kind="table"]').length).toBe(1);
  expect(root.querySelectorAll('table td[data-label]').length).toBe(2);
  expect(root.querySelectorAll('blockquote').length).toBe(1);
  expect(root.querySelectorAll('blockquote[data-jx-blockquote="outline"]').length).toBe(1);
  // typography-context-and-parts §2: the rule channel stamps its
  // shadow-4 default on every markdown quote (both runtimes agree)
  expect(root.querySelectorAll('blockquote[data-jx-blockquote-rule="shadow-4"]').length).toBe(1);
  expect(root.querySelectorAll('ul[data-jx-list="ul"]').length).toBe(1);
  const anchor = root.querySelector('a');
  expect(anchor?.getAttribute('href')).toBe('https://example.com');
  expect(anchor?.getAttribute('data-jx-link')).toBe('external');
  // §3: the external suffix-icon lane paints synchronously on both
  // runtimes (inline-core glyph — SSR parity, no hydration flash)
  expect(anchor!.querySelector('[data-jx-link-icon] svg[data-jx-icon]')).not.toBeNull();
}
