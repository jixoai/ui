/*
 * The guide page's same-source drift check (slot-values-first
 * impl-review B1, 2026-09-04): the author section's contract sample
 * quotes the REAL kbd family file trimmed to the load-bearing lines —
 * this test pins the load-bearing line (the values tuple IS the
 * union's source) verbatim against the shipped file, so a family edit
 * that drifts the docs sample fails here instead of lying quietly.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const guide = readFileSync(
  resolve(process.cwd(), 'src/routes/docs/context-defaults.html/+page.svelte'),
  'utf8',
);
const kbdDefaults = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/kbd/kbd-defaults.svelte.ts'),
  'utf8',
);

test('the guide contract sample quotes the kbd values line verbatim', () => {
  // the shipped file's slot declaration — the one line the page
  // promises is verbatim (same-source law, trimmed quote)
  const shipped = kbdDefaults.match(/^export const kbdVariantSlot = .*$/m)?.[0];
  expect(shipped).toBeDefined();
  // the page embeds it inside a template literal
  expect(guide).toContain(shipped!);
});

test('the guide speaks the values-first factories only (no retired calls)', () => {
  expect(guide).not.toMatch(/literalSlot<|paintSlot</);
  expect(guide).toContain('defineLiteralSlot');
  expect(guide).toContain('defineOpenSlot');
  expect(guide).toContain('definePaintSlot');
});
