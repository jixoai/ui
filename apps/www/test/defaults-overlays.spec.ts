/**
 * The W2 overlays/feedback Defaults migration RUNTIME lock
 * (context-defaults-economy task 3.2, 2026-09-03) — 16 families
 * (tooltip / popover / hover-card / alert / system-dialog /
 * popconfirm / command / spin / progress / skeleton / result /
 * empty / float-button / anchor / separator / toast) moved onto the
 * family Defaults contracts. Behavior is ZERO-change (the
 * pre-migration specs — batch3 OverlayHost, toast-v2, separator,
 * popover-gap — stay green untouched); this suite pins the NEW
 * resolution surface per the r11 wave contract:
 *   - the floating-surface literal slots: tooltip/popover/hover-card
 *     resolve own 'auto' on data-variant and NEVER move under a
 *     paint zone (absent from the frozen availability table — the
 *     kbd mode)
 *   - Alert is the W2 frozen-table family (outline/tonal, own
 *     outline): zone ambient wins over own, the explicit prop wins
 *     over ambient (a zone variant outside the family union is the
 *     unsupported external-surface case — D3-A retired the runtime
 *     values guard; the ambient domain is trusted)
 *   - system-dialog's TWO vocabularies: content's surface slot (own
 *     'auto') and the action's ladder slot (own 'fill', the
 *     destructive pair) resolve through the one family contract
 *   - the provider families (popconfirm/command): under a density
 *     provider the root's own stamp AND the sub-parts' re-stamps
 *     land the provider's tier; an explicit density beats the
 *     inherited one through the eager-capture lane (the r11
 *     derived_references_self law's behavioral pin)
 *   - the no-opinion density slots: bare resolves undefined → no
 *     stamp (fleet law); a provider's opinion stamps; the explicit
 *     prop beats the provider (result/empty/float-button)
 *   - toast: the store item IS the explicit lane — variant/material
 *     resolve `explicit ?? own` through the contract (pure literal
 *     slots; the v2 state machine untouched)
 *   - the declaration contracts (progress/skeleton density-only, zero
 *     vocabulary-hit; spin joined `size` at spin-ora-svg-lane C3 —
 *     the svg posture's square edge, open literal own 16): the
 *     in-window unit resolve (unit-resolve-host) carries the 惰性律
 *     face (context-plugin-v2 D3-C: the density slots' ambient lanes
 *     are window-bound)
 */
import { render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import Host from './fixtures/defaults-overlays-host.svelte';
import UnitResolveHost from './fixtures/unit-resolve-host.svelte';
import { AlertDefaults } from '../src/lib/ui/alert/alert-defaults.svelte';
import { SystemDialogDefaults } from '../src/lib/ui/system-dialog/system-dialog-defaults.svelte';
import { CommandDefaults } from '../src/lib/ui/command/command-defaults.svelte';
import { HoverCardDefaults } from '../src/lib/ui/hover-card/hover-card-defaults.svelte';
import { PopconfirmDefaults } from '../src/lib/ui/popconfirm/popconfirm-defaults.svelte';
import { PopoverDefaults } from '../src/lib/ui/popover/popover-defaults.svelte';
import { SeparatorDefaults } from '../src/lib/ui/separator/separator-defaults.svelte';
import { SkeletonDefaults } from '../src/lib/ui/skeleton/skeleton-defaults.svelte';
import { SpinDefaults } from '../src/lib/ui/spin/spin-defaults.svelte';
import { ProgressDefaults } from '../src/lib/ui/progress/progress-defaults.svelte';
import { TooltipDefaults } from '../src/lib/ui/tooltip/tooltip-defaults.svelte';
import { ToastDefaults } from '../src/lib/ui/toast/toast-defaults.svelte';

// the frozen-warn era retired with the D3-A values guard (the ghost
// zone region below documents the unsupported external surface)

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;

// =========================================================================
// 1 · bare — the declared owns, no-opinion density stays unstamped
// =========================================================================
describe('bare — no providers', () => {
  it("the floating-surface trio resolves its contract own: data-variant='auto'", () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('.jx-tip')!.getAttribute('data-variant')).toBe('auto');
    expect(bare.querySelector('.jx-pop')!.getAttribute('data-variant')).toBe('auto');
    expect(bare.querySelector('.jx-hover-card')!.getAttribute('data-variant')).toBe('auto');
  });

  it("Alert resolves the frozen own 'outline'; separator its literal own 'fused'", () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    expect(bare.querySelector('[data-jx-alert]')!.getAttribute('data-jx-alert')).toBe('outline');
    expect(bare.querySelector('[data-jx-separator]')!.getAttribute('data-jx-separator')).toBe('fused');
  });

  it('no-opinion density resolves undefined → nothing stamps (fleet law)', () => {
    const { container } = render(Host);
    const bare = byTestid(container, 'bare');
    for (const el of [
      bare.querySelector('[data-jx-alert]')!,
      bare.querySelector('[data-jx-separator]')!,
      bare.querySelector('[data-jx-empty]')!,
      bare.querySelector('[data-jx-result]')!,
      bare.querySelector('[data-jx-fab]')!,
    ]) {
      expect(el.getAttribute('data-density')).toBeNull();
    }
  });
});

// =========================================================================
// 2 · the zone — Alert (frozen table) goes ambient, the literal slots
//     never move, density rides its own axis
// =========================================================================
describe('zone + density providers', () => {
  it("the zone's 'tonal' moves Alert, never the literal-slot families", () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    const alerts = zone.querySelectorAll('[data-jx-alert]');
    expect(alerts[0].getAttribute('data-jx-alert')).toBe('tonal');
    // the explicit prop beats the zone
    expect(alerts[1].getAttribute('data-jx-alert')).toBe('outline');
    // literal slots never read the zone (absent from the frozen table)
    expect(zone.querySelector('.jx-tip')!.getAttribute('data-variant')).toBe('auto');
    expect(zone.querySelector('[data-jx-separator]')!.getAttribute('data-jx-separator')).toBe('fused');
  });

  it("the density provider's opinion stamps every consumer family", () => {
    const { container } = render(Host);
    const zone = byTestid(container, 'zone');
    // (W3-D5: alert joined the eight-axis surface — the ambient density
    // now FLOWS through the widened contract and stamps the banner
    // root, the fleet law live; the pre-W3 declaration-only posture
    // retired with the hole round)
    expect(zone.querySelector('[data-jx-alert]')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-empty]')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-result]')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-fab]')!.getAttribute('data-density')).toBe('sm');
    expect(zone.querySelector('[data-jx-anchor]')!.getAttribute('data-density')).toBe('sm');
    // the explicit prop beats the provider
    expect(zone.querySelector('[data-jx-result][data-density="lg"]')).not.toBeNull();
  });
});

// =========================================================================
// 3 · the provider families — inherit-then-provide under a provider
// =========================================================================
describe('popconfirm / command — inherit-then-provide', () => {
  it("the provider's tier lands on the popconfirm's own stamps and the panel", () => {
    const { container } = render(Host);
    const density = byTestid(container, 'density');
    const [inherited, explicit] = density.querySelectorAll('[data-jx-pc-anchor]');
    expect(inherited.getAttribute('data-density')).toBe('sm');
    // an explicit density beats the inherited one through the
    // eager-capture lane (the r11 law's behavioral pin)
    expect(explicit.getAttribute('data-density')).toBe('lg');
    // the panel carries the same resolution; variant is the own 'auto'
    const panels = density.querySelectorAll('.jx-pc');
    expect(panels[0].getAttribute('data-density')).toBe('sm');
    expect(panels[0].getAttribute('data-variant')).toBe('auto');
  });

  it('command stamps its dialog and re-stamps its list with the provider tier', () => {
    const { container } = render(Host);
    const density = byTestid(container, 'density');
    const dialog = density.querySelector('dialog.jx-command')!;
    expect(dialog.getAttribute('data-density')).toBe('sm');
    expect(dialog.getAttribute('data-variant')).toBe('auto');
    // the sub-part resolves through the SAME family contract
    const list = density.querySelector('[data-jx-command-list]')!;
    expect(list.getAttribute('data-density')).toBe('sm');
  });
});

// =========================================================================
// 4 · system-dialog — two variant vocabularies, one contract
// =========================================================================
describe('system-dialog — content surface + action ladder', () => {
  it("content's surface slot resolves own 'auto' on data-variant", () => {
    const { container } = render(Host);
    const adlg = byTestid(container, 'adlg');
    const panel = adlg.querySelector('[popover="manual"][role="alertdialog"]')!;
    expect(panel.getAttribute('data-variant')).toBe('auto');
  });

  it("the action's ladder slot resolves own 'fill' (destructive pair) and passes explicit through", () => {
    const { container } = render(Host);
    const adlg = byTestid(container, 'adlg');
    const actions = adlg.querySelectorAll('[data-jx-sysdlg-action]');
    expect(actions[0].getAttribute('data-jx-system-dialog-action')).toBe('fill');
    expect(actions[0].className).toContain('jx-pair-destructive');
    expect(actions[1].getAttribute('data-jx-system-dialog-action')).toBe('tonal');
  });
});

// =========================================================================
// 5 · 惰性律 — the in-window unit face (unit-resolve-host, rootless)
// =========================================================================
describe('in-window unit resolution — the own-defaults projection', () => {
  /** the in-window resolve carrier: compute runs inside the host's
   *  $derived (no provider, no plugin root — ambient lanes silent) */
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

  it('the floating-surface trio: own auto + own elevation levels (W3-C), axes silent-auto', () => {
    expect(resolveInWindow(() => TooltipDefaults.resolve({}))).toEqual({
      variant: 'auto',
      density: 'auto',
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      color: 'auto',
      theme: 'auto',
      elevation: 'level1',
      motion: 'auto',
    });
    expect(resolveInWindow(() => PopoverDefaults.resolve({}))).toMatchObject({
      variant: 'auto',
      elevation: 'level2',
    });
    expect(resolveInWindow(() => HoverCardDefaults.resolve({ variant: 'solid' }))).toMatchObject({
      variant: 'solid',
      elevation: 'level2',
    });
  });

  it('Alert: frozen own outline; system-dialog: the two-vocabulary split + the level3 own', () => {
    // W3-D5: the alert contract carries the eight-axis surface (the
    // silent window resolves 'auto' — the §0.1 no-opinion spelling)
    expect(resolveInWindow(() => AlertDefaults.resolve({}))).toEqual({
      variant: 'outline',
      density: 'auto',
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      color: 'auto',
      theme: 'auto',
      elevation: 'auto',
      motion: 'auto',
    });
    // tone rides the contract since c46d357b (the confirm rung's paint
    // family, own 'destructive') — re-recorded here when
    // spin-ora-svg-lane V1 re-ran this battery; W3-C adds the eight
    // axes with the alert's own elevation level3 (6dp — one rung under
    // the modal dialog)
    expect(resolveInWindow(() => SystemDialogDefaults.resolve({}))).toEqual({
      variant: 'auto',
      actionVariant: 'fill',
      tone: 'destructive',
      density: 'auto',
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      color: 'auto',
      theme: 'auto',
      elevation: 'level3',
      motion: 'auto',
    });
    expect(resolveInWindow(() => SystemDialogDefaults.resolve({ actionVariant: 'tonal' }))).toMatchObject({
      variant: 'auto',
      actionVariant: 'tonal',
      tone: 'destructive',
      elevation: 'level3',
    });
  });

  it('toast: a push IS the explicit lane — own outline/popover; the viewport axis surface (level3 own)', () => {
    expect(resolveInWindow(() => ToastDefaults.resolve({}))).toEqual({
      variant: 'outline',
      material: 'popover',
      density: 'auto',
      size: 'auto',
      shape: 'auto',
      radius: 'auto',
      color: 'auto',
      theme: 'auto',
      elevation: 'level3',
      motion: 'auto',
    });
    expect(resolveInWindow(() => ToastDefaults.resolve({ variant: 'tonal', material: 'glass' }))).toMatchObject({
      variant: 'tonal',
      material: 'glass',
      elevation: 'level3',
    });
  });

  it('the declaration contracts: spin carries the absent slots (size/interval/ghost), the rest stay density-only', () => {
    expect(
      resolveInWindow(() => [
        SpinDefaults.resolve({}),
        SpinDefaults.resolve({ size: 24 }),
        ProgressDefaults.resolve({}),
        SkeletonDefaults.resolve({}),
        SeparatorDefaults.resolve({}),
        PopconfirmDefaults.resolve({}),
        CommandDefaults.resolve({}),
      ]),
    ).toEqual([
      // spin review rounds (2026-09-12): the three absent slots — size
      // (absent rides the density ruler's var(--jx-icon)), interval and
      // linger (absent = the catalog step / the component's 'auto').
      // ABSENT IS the state: unset resolves undefined, explicit wins.
      // W3-B (explicit-props): the seven axis slots joined (density
      // rides the universal lane — silent 'auto' now); lingerType was
      // always the fourth absent slot
      {
        density: 'auto',
        size: undefined,
        interval: undefined,
        linger: undefined,
        lingerType: undefined,
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'auto',
        motion: 'auto',
      },
      {
        density: 'auto',
        size: 24,
        interval: undefined,
        linger: undefined,
        lingerType: undefined,
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'auto',
        motion: 'auto',
      },
      // progress W3-D2: the eight-axis surface joined the readout
      // family's contract — every axis silent-'auto' (the zero-hit
      // ruling stands: value/max/label are data semantics)
      {
        density: 'auto',
        size: 'auto',
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'auto',
        motion: 'auto',
      },
      // skeleton W3-D5 (the hole round): the placeholder's contract
      // gains the seven sibling axes — every axis silent-'auto' (the
      // component wiring landed with them; geometry stays the
      // consumer's, the axis surface never manufactures it)
      {
        density: 'auto',
        size: 'auto',
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'auto',
        motion: 'auto',
      },
      // separator W3-B: the eight-axis surface joined the ink-geometry
      // literal — every axis silent-'auto'
      {
        variant: 'fused',
        density: 'auto',
        size: 'auto',
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'auto',
        motion: 'auto',
      },
      // popconfirm W3-C: the eight axes joined the confirm bubble's
      // contract (own level2, the anchored menu rung)
      {
        variant: 'auto',
        density: 'auto',
        size: 'auto',
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'level2',
        motion: 'auto',
      },
      // W3-D1 (explicit-props, task 3.4): command's contract gained
      // the seven non-variant axis members — density rides the
      // bridged lane (silent 'auto'), elevation carries the modal's
      // OWN level4 (the batch C dialog law)
      {
        variant: 'auto',
        density: 'auto',
        size: 'auto',
        shape: 'auto',
        radius: 'auto',
        color: 'auto',
        theme: 'auto',
        elevation: 'level4',
        motion: 'auto',
      },
    ]);
  });
});
