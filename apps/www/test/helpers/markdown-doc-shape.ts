/**
 * Shared markdown doc-shape assertions (test/helpers/markdown-doc-shape.ts,
 * markdown-streaming SSR parity): ONE assertion path, TWO runtimes —
 * the node-env SSR suite (renderToHtml → JSDOM) and the jsdom client
 * suite (mount) both run THIS on the same DOC fixture, so structural
 * parity between server frame and client frame is enforced by
 * construction, not by duplicated expectations.
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
  expect(root.querySelectorAll('h2').length).toBe(1);
  expect(root.querySelectorAll('p').length).toBeGreaterThanOrEqual(2);
  expect(root.querySelectorAll('input[type="checkbox"]').length).toBe(2);
  expect(root.querySelectorAll('figure').length).toBe(2); // CodeCard + Table's frame
  expect(root.querySelectorAll('[data-kind="code"]').length).toBe(1);
  expect(root.querySelectorAll('[data-kind="table"]').length).toBe(1);
  expect(root.querySelectorAll('table td[data-label]').length).toBe(2);
  expect(root.querySelectorAll('blockquote').length).toBe(1);
  const anchor = root.querySelector('a');
  expect(anchor?.getAttribute('href')).toBe('https://example.com');
}
