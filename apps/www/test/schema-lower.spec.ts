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
import { UNIVERSAL_AXES } from '$lib/universal-props.schema';

const pressButtonFixture: ComponentMeta = defineComponentMeta({
  source: 'registry/files/ui/press-button/press-button.svelte',
  props: {
    // re-pinned 2026-09-21 (explicit-props W4): the committed meta had
    // drifted ahead of this fixture through W3's batches — the family
    // gained the EIGHT axis lane props (batch B) and the `style`
    // passthrough; the universal block rides the shared artifact (the
    // §17 merge stamps UNIVERSAL_AXES — never re-typed by hand here)
    style: { kind: 'opaque', typeText: 'string | null' },
    density: { kind: 'opaque', typeText: 'DensityLane | QueryResult<DensityLane>', ambient: 'scope' },
    size: { kind: 'opaque', typeText: 'SizeLane | QueryResult<SizeLane>', ambient: 'scope' },
    shape: { kind: 'opaque', typeText: 'ShapeLane | QueryResult<ShapeLane>', ambient: 'scope' },
    radius: { kind: 'opaque', typeText: 'RadiusLane | QueryResult<RadiusLane>', ambient: 'scope' },
    color: { kind: 'opaque', typeText: 'ColorLane | QueryResult<ColorLane>', ambient: 'scope' },
    theme: { kind: 'opaque', typeText: 'ThemeLane | QueryResult<ThemeLane>', ambient: 'scope' },
    elevation: { kind: 'opaque', typeText: 'ElevationLane | QueryResult<ElevationLane>', ambient: 'scope' },
    motion: { kind: 'opaque', typeText: 'MotionLane | QueryResult<MotionLane>', ambient: 'scope' },
    // 4.3 (context-defaults-economy): the ambient field rides the
    // GENERATED zone from the family Defaults slot facts; variant's
    // Props type became the imported PressButtonVariant alias (task
    // 1.2), honestly opaque under the same-file ceiling
    variant: {
      kind: 'opaque',
      typeText: 'PressButtonVariant',
      ambient: 'zone',
    },
    // r4 (2026-09-10): the attachments record RETIRED — the component
    // tag is the mount ({@attach} compiles past the props ceiling, so
    // it owns no row here; the rest lane carries it at runtime)
    href: { kind: 'string' },
    external: { kind: 'boolean' },
    // the loading-anchor contract (disabled joins the typed props; the
    // quoted literal-typed aria rows are the explicit passthrough the
    // spread-order fix authored — re-pinned 2026-09-16 when the
    // committed meta had drifted ahead of this fixture)
    disabled: { kind: 'boolean', default: false },
    loading: { kind: 'boolean', default: false },
    onclick: { kind: 'opaque', typeText: '() => void' },
    popovertarget: { kind: 'string' },
    type: { kind: 'enum', values: ['button', 'submit'], default: 'button' },
    ariaLabel: { kind: 'string' },
    square: { kind: 'boolean', default: false },
    raised: { kind: 'boolean' },
    class: { kind: 'string', default: '' },
    children: { kind: 'snippet', typeText: 'Snippet' },
    "'aria-label'": { kind: 'opaque', typeText: 'unknown' },
    "'aria-disabled'": { kind: 'opaque', typeText: 'unknown' },
    rest: { kind: 'opaque', typeText: 'unknown (spread passthrough)' },
  },
  hooks: [
    // the effect-host stamps moved into the runtime with the branches;
    // data-jx-attach is the optional named mounting-point stamp (r4)
    'data-jx-attach',
    'data-jx-press-button',
    'data-jx-press-check',
    'data-jx-press-flat',
    'data-jx-press-spin',
    'data-jx-press-state',
  ],
  universal: UNIVERSAL_AXES,
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
        style: { 'x-ui': { control: 'none', sourceType: 'string | null' } },
        // the W4 4.1 universal consumption path: the axis-lane props
        // lower as the lane grammar (auto + named steps + the
        // number/query() mode steps), never as excluded opaques — and
        // never required (default 'auto')
        density: { type: 'string', enum: ['auto', 'small', 'medium', 'large', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'density', label: 'Density', description: 'spacing/leading scale over the kernel channels (§4)', unit: 'coefficient' } },
        size: { type: 'string', enum: ['auto', 'small', 'medium', 'large', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'size', label: 'Size', description: 'the base scale — root font-size; parts size in em', unit: 'px' } },
        shape: { type: 'string', enum: ['auto', 'round', 'scoop', 'bevel', 'notch', 'square', 'squircle', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'shape', label: 'Shape', description: 'corner geometry (CSS corner-shape; §14 degrade table)' } },
        radius: { type: 'string', enum: ['auto', 'small', 'medium', 'large', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'radius', label: 'Radius', description: 'corner size; auto = the concentric broadcast (§3)', unit: 'px' } },
        color: { type: 'string', enum: ['auto', 'primary', 'secondary', 'error', 'warn', 'success', 'info', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'color', label: 'Color', description: 'the hue axis of the fixed oklch primary system (§5)', unit: 'hue' } },
        theme: { type: 'string', enum: ['auto', 'light', 'dark', 'system', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'theme', label: 'Theme', description: 'light/dark profile; system = the JS-mutable global (§6)' } },
        elevation: { type: 'string', enum: ['auto', 'level-1', 'level0', 'level1', 'level2', 'level3', 'level4', 'level5', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'elevation', label: 'Elevation', description: 'official M3 levels over the surface ladder (§7)', unit: 'dp' } },
        motion: { type: 'string', enum: ['auto', 'reduced', 'subtle', 'normal', 'expressive', 'number', 'query()'], default: 'auto', 'x-ui': { control: 'axis-enum', axis: 'motion', label: 'Motion', description: 'intensity across the motion kernels (§8)', unit: 'coefficient' } },
        variant: { 'x-ui': { control: 'none', sourceType: 'PressButtonVariant' } },
        href: { type: 'string' },
        external: { type: 'boolean' },
        disabled: { type: 'boolean', default: false },
        loading: { type: 'boolean', default: false },
        onclick: { 'x-ui': { control: 'none', sourceType: '() => void' } },
        popovertarget: { type: 'string' },
        type: { enum: ['button', 'submit'], default: 'button' },
        ariaLabel: { type: 'string' },
        square: { type: 'boolean', default: false },
        raised: { type: 'boolean' },
        class: { type: 'string', default: '' },
        children: { 'x-ui': { control: 'none', sourceType: 'Snippet' } },
        // the quoted literal-typed props lower under their quoted key
        "'aria-label'": { 'x-ui': { control: 'none', sourceType: 'unknown' } },
        "'aria-disabled'": { 'x-ui': { control: 'none', sourceType: 'unknown' } },
        rest: { 'x-ui': { control: 'none', sourceType: 'unknown (spread passthrough)' } },
      },
      required: ['style', 'variant', 'href', 'external', 'onclick', 'popovertarget', 'ariaLabel', 'raised', 'children', "'aria-label'", "'aria-disabled'", 'rest'],
    });
  });

  it('required lists exactly the props without defaults', () => {
    const out = toJSONSchema(pressButtonFixture);
    // r13 truth: variant's default left the statically-extractable
    // zone (regenerated 2026-09-02) — it rides required now. raised
    // joined it 2026-09-04: the default is zone-scoped (context,
    // ButtonVariantScope raised) — no static default remains. The
    // eight AXIS lanes (W4 4.1) lower with default 'auto' — they
    // never ride required
    const withDefaults = ['density', 'size', 'shape', 'radius', 'color', 'theme', 'elevation', 'motion', 'disabled', 'loading', 'type', 'square', 'class'];
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
