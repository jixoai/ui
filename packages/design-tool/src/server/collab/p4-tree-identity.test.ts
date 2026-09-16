/**
 * p4-tree-identity.test.ts — lab probe p4-tree-identity port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p4-tree-identity.mjs` (one lab
 * script emitting both p4-tree-identity-loro and p4-tree-identity
 * envelopes; the port keeps the same two-envelope shape).
 * Port deviation (the only one): the lab's yjs arm (Y.Array<Y.Map> node
 * records + application-maintained move guards) is omitted (YJS_OMITTED);
 * its guard checklist survives as recorded evidence. All loro assertions
 * are identical to the lab.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish, YJS_OMITTED } from './lab-helpers.ts';

test('p4-tree-identity', () => {
  const loro = new LoroDoc();
  loro.setPeerId('501');
  const tree = loro.getTree('components');
  const root = tree.createNode();
  root.data.set('component', 'page');
  const childA = root.createNode();
  childA.data.set('id', 'component-a');
  const childB = root.createNode();
  childB.data.set('id', 'component-b');
  const nested = childA.createNode();
  nested.data.set('id', 'nested');
  loro.commit();
  const stableId = childA.id;
  childA.move(root, 1);
  assert.ok(
    tree.getNodeByID(stableId)?.data.get('id') === 'component-a',
    'Loro move must preserve node identity',
  );
  let cycleRejected = false;
  try {
    root.move(nested);
  } catch {
    cycleRejected = true;
  }
  assert.ok(cycleRejected, 'Loro must reject moving a node under its descendant');
  finish('p4-tree-identity-loro', { stableId, order: tree.toJSON(), cycleRejected });

  // lab yjs arm omitted (YJS_OMITTED): Y.Array<Y.Map> tree modelling with
  // application-maintained guards (node exists / self cycle / descendant
  // cycle asserts inside yMove, stable-id assert after move).
  const yIdentityGuardSteps = [
    'unique id registry',
    'parent exists check',
    'children order update on move',
    'cycle detection before move',
    'delete tombstone/reference policy',
  ];

  finish('p4-tree-identity', {
    loro: { native: 'LoroTree', stableId, cycleRejected, invariantsMaintainedByLibrary: ['node id', 'parent/child relation', 'cycle rejection', 'move ordering'] },
    yjs: {
      omitted: YJS_OMITTED,
      representation: 'Y.Array<Y.Map node records>',
      identityGuardSteps: yIdentityGuardSteps.length,
      guardChecklist: yIdentityGuardSteps,
    },
    conclusion: 'Yjs can model the tree, but stable identity and structural invariants are application obligations; Loro makes them container primitives.',
  });
});
