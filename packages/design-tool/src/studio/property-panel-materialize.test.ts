/**
 * property-panel-materialize.test.ts — the panel's materialize wiring as
 * SOURCE LAWS (the chrome-items/panel-retired-chrome house style: node,
 * no DOM — rowsFor lives in the svelte module script, so the wiring is
 * pinned as facts about the panel source): the row classification rides
 * the /usage skipped evidence (bare bool materializable, expression
 * readonly), every control commits through the commitRow dispatcher
 * (materializable rows → client.materialize + reseed; ordinary rows →
 * the admit lane), and the seed flow is RE-ENTERABLE (seedClient is the
 * shared core of the initial seed and the post-materialize reseed).
 *
 * Original need: design-studio-acceptance-fixes task 3.6 (2026-09-16).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const panel = readFileSync(join(here, 'property-panel.svelte'), 'utf8');
const client = readFileSync(join(here, 'panel-collab.ts'), 'utf8');

test('the row classification rides the /usage skipped evidence — bare bool materializable, expressions readonly', () => {
  // the skipped payload flows: PanelUsageInfo.skipped → usageSkipped state → propValues
  assert.match(panel, /skipped: usageBody\.skipped \?\? \[\]/, 'fetchUsage adopts the skipped list');
  assert.match(panel, /let usageSkipped/, 'the skipped list is panel state');
  assert.match(panel, /const skippedByName = new Map\(usageSkipped\.map/, 'propValues classifies by skipped name');
  assert.match(panel, /why\.startsWith\('bare boolean attribute'\)/, 'the bare-bool why is the materializable marker');
  assert.match(panel, /materialize: 'bare-bool', value: true/, 'a bare boolean renders as a checked toggle');
  assert.match(panel, /materialize: 'absent', value: node\.default/, 'an absent schema prop materializes from the default');
  // absent materialization only when the TYPE survives the serialization law
  assert.match(panel, /why === undefined && kindOf\(node\) !== 'readonly'/, 'absent-but-opaque rows stay readonly');
  // the discriminated row: readonly ONLY when neither buffer nor materialize lane exists
  assert.match(
    panel,
    /dry\.materialize === undefined\s*\?\s*'readonly'/,
    'the readonly kind is reserved for rows with no materialize lane',
  );
});

test('every control commits through the commitRow dispatcher — materialize first, admit after', () => {
  // the dispatcher: materializable rows take the composite endpoint once
  assert.match(panel, /async function commitRow\(row: ControlRow, value: RowValue\)/);
  assert.match(panel, /await client\.materialize\(row\.prop, value as PropValue\)/, 'the first change rides /materialize');
  assert.match(panel, /if \(landed\) await reseedAfterMaterialize\(\);/, 'a landed materialization reseeds');
  assert.match(panel, /await commitProp\(row\.prop, value\);/, 'ordinary rows keep the admit lane');
  // all control lanes dispatch through it (toggle/select/stepper/segmented
  // in the template + the text row's Enter handler)
  const dispatches = panel.match(/void commitRow\(row, /g) ?? [];
  assert.equal(dispatches.length, 5, `expected the dispatcher on every control lane, found ${dispatches.length}`);
  assert.match(panel, /function onTextEnter\(row: ControlRow, event: KeyboardEvent\)[\s\S]{0,200}void commitRow\(row, event\.currentTarget\.value\)/, 'Enter on a text row dispatches too');
});

test('the seed flow is RE-ENTERABLE — seedClient is the shared core, the reseed keeps the live client', () => {
  assert.match(panel, /async function seedClient\(target: PanelCollabClient, current/, 'the extracted seed core');
  assert.match(panel, /usageSkipped = usage\.skipped \?\? \[\];\s*\n\s*await target\.seed\(usage\)/, 'the core seeds the buffer set AND the skipped evidence');
  assert.match(panel, /async function reseedAfterMaterialize\(\)/, 'the post-materialize reseed entry');
  assert.match(panel, /await seedClient\(client, current\);/, 'the reseed reuses the LIVE client (mirror already imported the update)');
  // the initial seed drives the same core — one lane, not a fork
  assert.match(panel, /await seedClient\(created, current\);/, 'the initial seed routes through the same core');
});

test('the readonly lane survives for expressions — "edit in code" stays honest', () => {
  assert.match(panel, /edit in code/, 'the readonly row keeps its label');
  assert.match(panel, /export type MaterializeLane = 'bare-bool' \| 'absent';/, 'the materialize vocabulary is exactly two lanes');
});

test('the client contract: materialize posts the composite body and imports the receipt', () => {
  assert.match(client, /async materialize\(prop: string, value: PropValue\): Promise<boolean>/, 'the client method');
  assert.match(client, /this\.#transport\.post\('materialize', \{/, 'the POST body rides the transport seam');
  assert.match(client, /file: info\.page,\s*\n\s*componentId: info\.componentId,\s*\n\s*prop,\s*\n\s*value,\s*\n\s*opId: `panel:\$\{this\.#sessionId\}:m\$\{this\.#seq\}`/, 'the opId keeps the #envelopeOf namespace');
  assert.match(client, /skipped\?: readonly \{ readonly name: string; readonly why: string \}\[\]/, 'PanelUsageInfo carries the skipped evidence');
});
