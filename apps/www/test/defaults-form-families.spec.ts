/**
 * The form families' Defaults migration RUNTIME lock
 * (context-defaults-economy task 3.1 / W1, 2026-09-03) — nineteen
 * families moved onto their Defaults contracts. Behavior is
 * ZERO-change (the pre-migration specs form-components /
 * form-expansion / input-group / input-picker-bridge / range /
 * color-picker / date-picker-fragments / enhance-picker-feedback /
 * density-adoption-form-* stay green untouched); this suite pins the
 * NEW resolution surface per specs/component-authoring's Defaults
 * contract:
 *   - the contract surfaces: every family's slots are exactly the
 *     frozen key set, shallow-frozen; the in-window unit resolve
 *     (惰性律, unit-resolve-host — context-plugin-v2 D3-C: every
 *     family here carries a density slot, so the plain unit form is
 *     a hard-contract throw) lands the own-defaults projection —
 *     density axes resolve undefined (no manufactured opinion), the
 *     literal surface variants own 'auto'/'drop', descriptions'
 *     bordered owns false
 *   - the meta-protected four (select/combobox/date-picker — and
 *     checkbox on the density lane) keep their inline Props unions +
 *     inline defaults because their Props interface feeds the
 *     GENERATED meta chain (component-metadata-gen →
 *     props-table-meta-drift), whose ambient extension is the doc
 *     batch's 先破再立; the contract owns are the same values and the
 *     resolve round-trips every union literal
 *   - bare renders: no-opinion density stamps NOTHING (fleet law);
 *     file-input's literal variant owns 'drop'; descriptions' literal
 *     bordered owns false (the explicit prop paints the frame)
 *   - the density scope: a provider's 'sm' reaches every family's
 *     slot; the explicit prop beats the provider; the surface
 *     variants hold their owns (a density scope never moves them —
 *     they are separate axes)
 *   - the input-group PROVIDER lane (r11 eager-capture contract): a
 *     group under a parent provider inherits the tier and its addon
 *     child (a density consumer) ADOPTS it; the group's own prop
 *     shadows the parent; a standalone group stamps nothing; a parent
 *     flip re-resolves both lanes in the same render — rendering at
 *     all is the derived_references_self pin (the group's own
 *     provideDensity write must never shadow its eager capture)
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';
import Host from './fixtures/defaults-form-families-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';

import { InputDefaults } from '../src/lib/ui/input/input-defaults.svelte';
import { NativeSelectDefaults } from '../src/lib/ui/native-select/native-select-defaults.svelte';
import { SelectDefaults } from '../src/lib/ui/select/select-defaults.svelte';
import { CheckboxDefaults } from '../src/lib/ui/checkbox/checkbox-defaults.svelte';
import { RadioDefaults } from '../src/lib/ui/radio/radio-defaults.svelte';
import { RangeDefaults } from '../src/lib/ui/range/range-defaults.svelte';
import { TextareaDefaults } from '../src/lib/ui/textarea/textarea-defaults.svelte';
import { ComboboxDefaults } from '../src/lib/ui/combobox/combobox-defaults.svelte';
import { CascaderDefaults } from '../src/lib/ui/cascader/cascader-defaults.svelte';
import { DatePickerDefaults } from '../src/lib/ui/date-picker/date-picker-defaults.svelte';
import { InputGroupDefaults } from '../src/lib/ui/input-group/input-group-defaults.svelte';
import { InputOtpDefaults } from '../src/lib/ui/input-otp/input-otp-defaults.svelte';
import { NumberInputDefaults } from '../src/lib/ui/number-input/number-input-defaults.svelte';
import { TagsInputDefaults } from '../src/lib/ui/tags-input/tags-input-defaults.svelte';
import { FileInputDefaults } from '../src/lib/ui/file-input/file-input-defaults.svelte';
import { ColorPickerDefaults } from '../src/lib/ui/color-picker/color-picker-defaults.svelte';
import { ToggleDefaults } from '../src/lib/ui/toggle/toggle-defaults.svelte';
import { ToggleGroupDefaults } from '../src/lib/ui/toggle-group/toggle-group-defaults.svelte';
import { DescriptionsDefaults } from '../src/lib/ui/descriptions/descriptions-defaults.svelte';

import Descriptions from '../src/lib/ui/descriptions/descriptions.svelte';
import Select from '../src/lib/ui/select/select.svelte';

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;

/** the empty-snippet children every slot-bearing component accepts */
const children = (() => {}) as unknown as Snippet;

// =========================================================================
// 1 · the contract surfaces — auditable in one place, all nineteen
// =========================================================================
describe('the nineteen contract surfaces', () => {
  /** the in-window resolve carrier: compute runs inside the host's
   *  $derived (no provider, no plugin root — the density slots'
   *  ambient lanes stay silent instead of throwing; the retired
   *  plain unit form is the D3-C hard-contract throw) */
  const resolveInWindow = (compute: () => unknown): unknown => {
    const holder: { value?: unknown; error?: unknown } = {};
    render(UnitResolveHost, {
      props: {
        compute,
        onvalue: (value, error) => {
          holder.value = value;
          holder.error = error;
        },
      },
    });
    flushSync();
    expect(holder.error).toBeUndefined();
    return holder.value;
  };

  const densityOnly = {
    input: InputDefaults,
    'native-select': NativeSelectDefaults,
    checkbox: CheckboxDefaults,
    radio: RadioDefaults,
    range: RangeDefaults,
    textarea: TextareaDefaults,
    'input-group': InputGroupDefaults,
    'input-otp': InputOtpDefaults,
    'number-input': NumberInputDefaults,
    toggle: ToggleDefaults,
    'toggle-group': ToggleGroupDefaults,
  } as const;

  it.each(Object.entries(densityOnly))(
    '%s declares exactly { density }, shallow-frozen, no-opinion',
    (_name, defaults) => {
      expect(Object.isFrozen(defaults.slots)).toBe(true);
      expect(Object.keys(defaults.slots)).toEqual(['density']);
      expect(resolveInWindow(() => defaults.resolve({}))).toEqual({ density: undefined });
    },
  );

  it.each([
    ['select', SelectDefaults],
    ['combobox', ComboboxDefaults],
    ['date-picker', DatePickerDefaults],
    ['tags-input', TagsInputDefaults],
    ['color-picker', ColorPickerDefaults],
  ] as const)('%s declares { variant, density }, surface own ' + "'auto'", (_name, defaults) => {
    expect(Object.isFrozen(defaults.slots)).toBe(true);
    expect(Object.keys(defaults.slots).sort()).toEqual(['density', 'variant']);
    expect(resolveInWindow(() => defaults.resolve({}))).toEqual({ variant: 'auto', density: undefined });
    // the literal slot never reads context: every union literal passes through
    expect(resolveInWindow(() => defaults.resolve({ variant: 'solid' }))).toEqual({
      variant: 'solid',
      density: undefined,
    });
    expect(resolveInWindow(() => defaults.resolve({ variant: 'acrylic' }))).toEqual({
      variant: 'acrylic',
      density: undefined,
    });
  });

  it("file-input declares { variant, density }, presentation own 'drop'", () => {
    expect(Object.isFrozen(FileInputDefaults.slots)).toBe(true);
    expect(Object.keys(FileInputDefaults.slots).sort()).toEqual(['density', 'variant']);
    expect(resolveInWindow(() => FileInputDefaults.resolve({}))).toEqual({
      variant: 'drop',
      density: undefined,
    });
    expect(resolveInWindow(() => FileInputDefaults.resolve({ variant: 'button' }))).toEqual({
      variant: 'button',
      density: undefined,
    });
  });

  it('descriptions declares { bordered, density }, literal bordered owns false', () => {
    expect(Object.isFrozen(DescriptionsDefaults.slots)).toBe(true);
    expect(Object.keys(DescriptionsDefaults.slots).sort()).toEqual(['bordered', 'density']);
    expect(resolveInWindow(() => DescriptionsDefaults.resolve({}))).toEqual({
      bordered: false,
      density: undefined,
    });
    expect(resolveInWindow(() => DescriptionsDefaults.resolve({ bordered: true }))).toEqual({
      bordered: true,
      density: undefined,
    });
  });

  it('cascader (zero vocabulary hits) still declares its density-manageability', () => {
    expect(Object.isFrozen(CascaderDefaults.slots)).toBe(true);
    expect(Object.keys(CascaderDefaults.slots)).toEqual(['density']);
    expect(resolveInWindow(() => CascaderDefaults.resolve({}))).toEqual({ density: undefined });
  });
});

// =========================================================================
// 2 · bare — no providers: no opinion stamps nothing, the literal owns hold
// =========================================================================
describe('bare — no providers', () => {
  it('no-opinion density: NOTHING stamps data-density (fleet law)', () => {
    const { container } = render(Host);
    expect(byTestid(container, 'bare').querySelectorAll('[data-density]')).toHaveLength(0);
  });

  it("file-input's literal variant owns 'drop' (the drop zone renders, not the button trigger)", () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    // the native picker stays mounted (sr-only); the DROP zone is the
    // own-rendered trigger, the compact button trigger is not
    expect(bare.querySelector('input[data-jx-file-native][type="file"]')).not.toBeNull();
    expect(bare.querySelector('.jx-file-zone')).not.toBeNull();
    expect(bare.querySelector('.jx-file-trigger')).toBeNull();
  });

  it("descriptions' literal bordered owns false; the explicit prop paints the frame", () => {
    const { container } = render(Host);
    const dl = byTestid(container, 'bare').querySelector('dl');
    expect(dl!.hasAttribute('data-jx-desc-bordered')).toBe(false);

    const bordered = render(Descriptions, {
      props: {
        bordered: true,
        children,
      },
    });
    const frame = bordered.container.querySelector('dl')!;
    expect(frame.hasAttribute('data-jx-desc-bordered')).toBe(true);
    expect(frame.className).toContain('border');
  });
});

// =========================================================================
// 3 · the density scope — ambient wins over no-opinion, explicit wins over ambient
// =========================================================================
describe('a density provider reaches every family slot', () => {
  it("the provider's 'sm' stamps every family; exactly one explicit 'lg' beats it", () => {
    const { container } = render(Host);
    const scoped = byTestid(container, 'scoped');
    const stamps = [...scoped.querySelectorAll('[data-density]')].map((el) =>
      el.getAttribute('data-density'),
    );
    // the provider div itself stamps sm; every family went ambient
    expect(stamps.length).toBeGreaterThanOrEqual(15);
    expect(new Set(stamps)).toEqual(new Set(['sm', 'lg']));
    expect(stamps.filter((v) => v === 'lg')).toHaveLength(1);
  });

  it('the surface variants hold their owns under a density scope (separate axes)', () => {
    const { container } = render(Host);
    const scoped = byTestid(container, 'scoped');
    // the panel-bearing families stamp data-variant on their (closed) panels
    expect(scoped.querySelectorAll('[data-variant="auto"]').length).toBeGreaterThanOrEqual(2);
    expect(scoped.querySelector('[data-variant="solid"]')).not.toBeNull();
  });
});

// =========================================================================
// 4 · the input-group provider lane — r11 eager-capture contract
// =========================================================================
describe('input-group — inherit-then-provide', () => {
  it('a group under a parent provider inherits; the addon child ADOPTS the tier', () => {
    const { container } = render(Host);
    const groups = [...byTestid(container, 'group').querySelectorAll('[data-jx-igroup]')];
    const [inherits, shadows, standalone] = groups;

    // inherit: parent 'lg' flows through the group's own write
    expect(inherits.getAttribute('data-density')).toBe('lg');
    expect(inherits.querySelector('.jx-field')!.getAttribute('data-density')).toBe('lg');
    // shadow: the group's explicit prop beats the parent, children adopt it
    expect(shadows.getAttribute('data-density')).toBe('xs');
    expect(shadows.querySelector('.jx-field')!.getAttribute('data-density')).toBe('xs');
    // standalone: no parent, no prop — nothing stamps, the css scope flows
    expect(standalone.hasAttribute('data-density')).toBe(false);
    expect(standalone.querySelector('.jx-field')!.hasAttribute('data-density')).toBe(false);
  });

  it('a parent flip re-resolves the group AND its child in the same render (derived_references_self pin)', async () => {
    const { container, rerender } = render(Host, { props: { parentDensity: 'lg' } });
    const inherits = byTestid(container, 'group').querySelector('[data-jx-igroup]')!;
    expect(inherits.getAttribute('data-density')).toBe('lg');

    await rerender({ props: { parentDensity: 'xs' } });
    expect(inherits.getAttribute('data-density')).toBe('xs');
    expect(inherits.querySelector('.jx-field')!.getAttribute('data-density')).toBe('xs');
  });
});

// =========================================================================
// 5 · the meta-protected surfaces — component-level zero-change pins
// =========================================================================
describe('meta-protected families — the inline defaults stay, the contract lands the same values', () => {
  it('select: unset variant renders data-variant="auto"; explicit passes through', () => {
    const options = [{ value: 'a', label: 'A' }];
    const bare = render(Select, { props: { options } });
    expect(bare.container.querySelector('[data-variant]')!.getAttribute('data-variant')).toBe(
      'auto',
    );
    const solid = render(Select, { props: { options, variant: 'solid' } });
    expect(solid.container.querySelector('[data-variant]')!.getAttribute('data-variant')).toBe(
      'solid',
    );
  });

  it('descriptions-item derives the frame from the root context (family state untouched)', () => {
    const framed = render(Descriptions, {
      props: {
        bordered: true,
        children,
      },
    });
    expect(framed.container.querySelector('dl')!.className).toContain('bg-card');
  });
});
