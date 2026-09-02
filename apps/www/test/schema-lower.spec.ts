/**
 * The lowering gates (canvas-schema-pipeline, 2026-08-30).
 *
 * toJSONSchema is the one hand that writes exports: per-kind keyword
 * lowering, `required` = exactly the props without defaults, `x-ui`
 * passthrough — and the leak law: the strings `kind` and `typeText`
 * appear nowhere in any serialized output (snippet/opaque surface under
 * `x-ui` as `control: "none"` + `sourceType`, documented and
 * panel-excluded, never silently dropped).
 *
 * The press-button fixture is the IR literal the extractor emits
 * (scripts/component-metadata-gen.mjs asserts the same shape in
 * --self-test); the first test also pins the COMMITTED generated meta
 * to it, so component edits that forget regeneration fail here too.
 */
import { describe, expect, it } from 'vitest';

import { meta as pressButtonMeta } from '$lib/meta/press-button.meta';
import { defineComponentMeta, withAnnotations, type ComponentMeta } from '$lib/schema/ir';
import { toJSONSchema } from '$lib/schema/lower';

const pressButtonFixture: ComponentMeta = defineComponentMeta({
  source: 'registry/files/ui/press-button/press-button.svelte',
  props: {
    density: { kind: 'opaque', typeText: 'Density' },
    variant: {
      kind: 'enum',
      values: ['fill', 'tonal', 'outline', 'ghost', 'link'],
    },
    effect: { kind: 'opaque', typeText: 'PressEffect' },
    href: { kind: 'string' },
    external: { kind: 'boolean' },
    loading: { kind: 'boolean', default: false },
    onclick: { kind: 'opaque', typeText: '() => void' },
    popovertarget: { kind: 'string' },
    type: { kind: 'enum', values: ['button', 'submit'], default: 'button' },
    ariaLabel: { kind: 'string' },
    square: { kind: 'boolean', default: false },
    class: { kind: 'string', default: '' },
    children: { kind: 'snippet', typeText: 'Snippet' },
  },
  hooks: [
    'data-jx-press-button',
    'data-jx-press-check',
    'data-jx-press-spin',
    'data-jx-press-state',
    'data-jx-pulse-host',
    'data-jx-ripple-host',
    'data-jx-shimmer-host',
  ],
});

describe('toJSONSchema (press-button fixture)', () => {
  it('the committed generated meta equals the extractor fixture', () => {
    // drift gate: change press-button.svelte without regenerating the
    // .meta.ts and this fails next to the --check gate
    expect(pressButtonMeta).toEqual(pressButtonFixture);
  });

  it('lowers to the canonical export object', () => {
    expect(toJSONSchema(pressButtonFixture)).toEqual({
      type: 'object',
      properties: {
        density: { 'x-ui': { control: 'none', sourceType: 'Density' } },
        variant: {
          enum: ['fill', 'tonal', 'outline', 'ghost', 'link'],
        },
        effect: { 'x-ui': { control: 'none', sourceType: 'PressEffect' } },
        href: { type: 'string' },
        external: { type: 'boolean' },
        loading: { type: 'boolean', default: false },
        onclick: { 'x-ui': { control: 'none', sourceType: '() => void' } },
        popovertarget: { type: 'string' },
        type: { enum: ['button', 'submit'], default: 'button' },
        ariaLabel: { type: 'string' },
        square: { type: 'boolean', default: false },
        class: { type: 'string', default: '' },
        children: { 'x-ui': { control: 'none', sourceType: 'Snippet' } },
      },
      required: ['density', 'variant', 'effect', 'href', 'external', 'onclick', 'popovertarget', 'ariaLabel', 'children'],
    });
  });

  it('required lists exactly the props without defaults', () => {
    const out = toJSONSchema(pressButtonFixture);
    // r13 truth: variant's default left the statically-extractable
    // zone (regenerated 2026-09-02) — it rides required now
    const withDefaults = ['loading', 'type', 'square', 'class'];
    expect(out.required).not.toContain(...withDefaults);
    for (const key of Object.keys(out.properties)) {
      if (!withDefaults.includes(key)) expect(out.required).toContain(key);
    }
  });

  it('leaks no internal vocabulary: neither "kind" nor "typeText" appears', () => {
    const serialized = JSON.stringify(toJSONSchema(pressButtonFixture));
    expect(serialized).not.toContain('kind');
    expect(serialized).not.toContain('typeText');
  });
});

describe('toJSONSchema (per-kind keywords)', () => {
  it('lowers numeric bounds and multipleOf, dropping non-finite values', () => {
    const out = toJSONSchema(
      defineComponentMeta({
        source: 'fixture',
        props: {
          depth: { kind: 'number', minimum: 0, maximum: 4, multipleOf: 2, default: 2 },
          bad: { kind: 'number', minimum: Number.NaN, maximum: Number.POSITIVE_INFINITY, multipleOf: 0 },
        },
      }),
    );
    expect(out.properties.depth).toEqual({
      type: 'number',
      minimum: 0,
      maximum: 4,
      multipleOf: 2,
      default: 2,
    });
    // NaN/Infinity/<=0 multipleOf never reach the export
    expect(out.properties.bad).toEqual({ type: 'number' });
    expect(out.required).toEqual(['bad']);
  });

  it('passes x-ui through and merges annotations at consume time', () => {
    const meta = defineComponentMeta({
      source: 'fixture',
      props: {
        variant: {
          kind: 'enum',
          values: ['a', 'b'],
          default: 'a',
          'x-ui': { label: 'the variant' },
        },
      },
    });
    const merged = withAnnotations(meta, {
      variant: { 'x-ui': { control: 'segmented', description: 'prominence rung' } },
    });
    expect(toJSONSchema(merged).properties.variant).toEqual({
      enum: ['a', 'b'],
      default: 'a',
      'x-ui': { label: 'the variant', control: 'segmented', description: 'prominence rung' },
    });
  });
});
