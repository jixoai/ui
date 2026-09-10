/**
 * effect-attachments.spec.ts — the attachment channel's law battery
 * (effect-attachments design §1/§2/§9, Lane A, 2026-09-09; r4 2026-09-10
 * — the attachments RECORD retired, the component-tag form promoted).
 *
 * Three layers, one contract:
 *  - COMPILE SMOKE: svelte/compiler (the RESOLVED svelte — version pinned,
 *    drift fails loudly) emits `$.attach(node, () => <whole expression>)`
 *    for the factory form, the component-tag symbol prop
 *    (`[$.attachment()]: fx` — createAttachmentKey) whose child-side mount
 *    rides the rest spread's attribute_effect, and the fromAction sweep;
 *    the server output never calls the attachment (SSR inertness);
 *  - MOUNTED LAWS (the real {@attach} pipeline through the harness
 *    fixture): identity remount on fx replace, the deep-mutation
 *    boundary's TWO measured halves, the NATIVE component-tag mechanism
 *    (a Host spreading ...rest onto its marked button, armed through
 *    <Host {@attach fn}> — the /tmp/attach-comptag2.mjs spike's exact
 *    shape: mount at the spread element, skip on undefined, teardown on
 *    disarm/unmount), the fromAction bridge (update on reference change,
 *    destroy on teardown), the internal material mount (tabs' own
 *    business since r4), and the {destroy}-LEAK counter-example — a bare
 *    action-shaped mount whose object return is silently discarded;
 *  - FACTORY LIFECYCLE (jsdom, direct value(element) calls — the runtime's
 *    own contract): pressEffect mount stamps / teardown cleans (held to
 *    the press-button.spec DOM/classname assertions), the :disabled and
 *    aria-disabled no-ops (checked per event), the reduced-motion gate,
 *    ripple ink on pointerdown/keydown, and liquidGlass's mount/cleanup
 *    over the real kernel. The press recipes are the r5 re-ruled ring
 *    ports (design §12, 2026-09-10 Owner review round 2): shimmer and
 *    rainbow paint through ONE mask-banded ring span each — the host's
 *    background is NEVER read, resolved, or painted (the transparent-
 *    host pollution the Owner caught on invite/subscribe, deleted with
 *    its backdrop sniffing and host-face layering); pulse fades during
 *    expansion (r4, standing); ripple = the svg ink engine with a
 *    css-animated ink node (settle = animationend, zero WAAPI), a
 *    per-layer clipPath holding it to the host silhouette, and an
 *    feGaussianBlur soft edge — pinned by DOM assertions here plus the
 *    css source-scan laws (the sheet is the timing law).
 *  - THE UNDEFINED ARM + THE INTERNAL MATERIAL MOUNT (Lane B, 2026-09-09
 *    + r4 — the /tmp/attach-laneB.mjs spike, 10/10 under BOTH svelte
 *    copies, source-verified at attachments.js's `if (fn)` guard): an
 *    ALWAYS-MOUNTED element whose attach expression evaluates to
 *    undefined SKIPS the call (the use: parity) — the bare 'root' hook's
 *    whole safety, and the same arm the component-tag form rides when
 *    its value flips to undefined (probe-verified: skip, teardown, no
 *    crash). tabs' indicator is the component's OWN material business
 *    since r4: the internal mount arms/disarms with the material gate.
 *  - THE MIGRATION CANARIES: `use:` zero and builder-prop `effect={…}`
 *    zero over apps/www/src + registry/files (canary 1: routes excluded;
 *    stripped — the glass-canary precedent), each self-tested in BOTH
 *    directions before the scan.
 *
 * VERSION POLARITY (measured 2026-09-09, the Lane A spike — the
 * /tmp/attach-laneA.mjs pattern, 23/23 under BOTH copies): the RESOLVED
 * svelte under this package's toolchain is the npm tree pinned by the
 * TRACKED apps/www/package-lock.json — 5.56.9. Design r2's "resolved
 * 5.57.0" read pointed at the gitignored root pnpm store; the
 * attachments runtime and fromAction are byte-identical between the two,
 * so the pinned contract holds either way — but the PIN below is the
 * version that actually runs here.
 *
 * DEEP-MUTATION CORRECTION (same spike): design §1's "deep mutation is
 * NOT tracked" is true at the CHANNEL level (attach() never deep-reads
 * the param — unlike use:'s deep_read_state) but not in general: the
 * attachment body's own property reads on a $state-held fx register
 * fine-grained deps, so mutation re-runs the attachment (teardown +
 * remount). Both halves are pinned below; the param-flow law stands for
 * a stronger reason than the design stated.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { flushSync, tick } from 'svelte';
import { compile, VERSION } from 'svelte/compiler';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AttachHost from './fixtures/effect-attach-host.svelte';
import {
  pressEffect,
  applyShimmer,
  applyPulse,
  applyRainbow,
  solidFill,
} from '../src/lib/ui/press-button/press-effect-runtime';
import {
  pulse,
  rainbow,
  ripple,
  shimmer,
  type PressEffect,
} from '../src/lib/ui/press-button/press-button.svelte';
import { attachLiquidGlass, liquidGlass, liquid } from '../src/lib/ui/glass';

// ---------------------------------------------------------------------------
// Compile smoke — the resolved svelte, shape-pinned
// ---------------------------------------------------------------------------
const PINNED_SVELTE = '5.56.9';

describe('compile smoke — the resolved svelte emits the attachment channel', () => {
  it('pins the resolved svelte version (drift fails loudly)', () => {
    // the failure message is the whole point: it names what drifted and
    // where the re-verification procedure lives
    expect(
      VERSION,
      `resolved svelte ${VERSION} != pinned ${PINNED_SVELTE} — the lockfile moved; \
re-run the spike battery (the /tmp/attach-laneA.mjs pattern, 23 assertions) \
under the new copy before re-pinning`
    ).toBe(PINNED_SVELTE);
  });

  it('{@attach liquidGlass(fx)}: the WHOLE expression rides the thunk', () => {
    const code = compile(
      `<script>\n\tlet fx = $state({ speed: 1 });\n\tfunction liquidGlass(f) { return (el) => () => {}; }\n</script>\n\n<div {@attach liquidGlass(fx)}></div>`,
      { generate: 'client', name: 'SmokeFactory', dev: false }
    ).js.code;
    expect(code).toContain('$.attach(');
    // liquidGlass(fx) — the FACTORY call, never the action form liquidGlass(el, fx)
    expect(code).toMatch(/\$\.attach\([^,]+,\s*\(\)\s*=>\s*liquidGlass\(fx\)\)/);
  });

  it('the component-tag application: <Host {@attach fx}> → the symbol-keyed prop; the child spreads it onto its element', () => {
    // the r4 native mechanism (design §12 ruling 1, spike-verified): the
    // component tag compiles the attachment to a createAttachmentKey()
    // symbol-keyed PROP; the child's ...rest spread forwards it, and the
    // spread's attribute_effect mounts it at the element
    const app = compile(
      `<script>\n\timport Host from './Host.svelte';\n\tlet fx = $state(undefined);\n</script>\n\n<Host {@attach fx}>go</Host>`,
      { generate: 'client', name: 'SmokeTag', dev: false }
    ).js.code;
    expect(app).toMatch(/\[\$\.attachment\(\)\]:\s*fx/); // the symbol-keyed prop
    const host = compile(
      `<script>\n\tlet { children, ...rest } = $props();\n</script>\n\n<button {...rest} data-jx-attach="root">{@render children?.()}</button>`,
      { generate: 'client', name: 'SmokeSpread', dev: false }
    ).js.code;
    expect(host).toContain('$.rest_props('); // the symbol prop survives the destructure
    expect(host).toContain('$.attribute_effect('); // the spread's symbol branch mounts it
    expect(host).not.toContain('$.attach('); // never a direct mount on the child's own expression
  });

  it('the fromAction sweep site: {@attach fromAction(helper, () => param)}', () => {
    const code = compile(
      `<script>\n\timport { fromAction } from 'svelte/attachments';\n\tlet p = $state({ n: 1 });\n\tfunction helper(el, x) { return { update() {}, destroy() {} }; }\n</script>\n\n<div {@attach fromAction(helper, () => p)}></div>`,
      { generate: 'client', name: 'SmokeBridge', dev: false }
    ).js.code;
    expect(code).toContain('$.attach(');
    expect(code).toMatch(/fromAction\(helper,\s*\(\)\s*=>\s*p\)/);
  });

  it('SSR: the server output never invokes the attachment (fully inert)', () => {
    const code = compile(
      `<script>\n\tlet fx = $state({ speed: 1 });\n\tfunction liquidGlass(f) { throw new Error('RAN ON SERVER'); }\n</script>\n\n<div data-ssr {@attach liquidGlass(fx)}>label</div>`,
      { generate: 'server', name: 'SmokeSSR' }
    ).js.code;
    expect(code).not.toContain('attach(');
    // frost-first: the element itself still paints
    expect(code).toContain('data-ssr');
  });
});

// ---------------------------------------------------------------------------
// Mounted laws — the real {@attach} pipeline through the harness
// ---------------------------------------------------------------------------
describe('mounted channel laws (the real pipeline)', () => {
  // the surfaces are distinguishable by their data-* hooks — dataset
  // values are the attribute VALUE, so label through presence
  const surfaceOf = (element: HTMLElement): string =>
    element.dataset.held !== undefined ? 'held' : 'factory';

  it('fx REPLACE (the $derived path) = identity remount: old teardown, fresh mount', async () => {
    const trace: string[] = [];
    const factory = (fx: PressEffect) => (element: HTMLElement) => {
      trace.push(`mount:${surfaceOf(element)}:${fx.type}`);
      return () => trace.push('teardown');
    };
    const mounted = render(AttachHost, { props: { factory, fx: shimmer() } });
    expect(trace).toEqual(['mount:factory:shimmer']);
    await mounted.rerender({ factory, fx: pulse() });
    expect(trace).toEqual(['mount:factory:shimmer', 'teardown', 'mount:factory:pulse']);
    mounted.unmount();
  });

  it('deep mutation — NO CHANNEL: a factory that reads nothing stays inert (unlike use:)', async () => {
    const trace: string[] = [];
    const factory = (_fx: PressEffect) => (_element: HTMLElement) => {
      trace.push('mount');
      return () => trace.push('teardown');
    };
    const mounted = render(AttachHost, { props: { factory, fx: shimmer(), surface: 'held' } });
    mounted.container.querySelector<HTMLButtonElement>('[data-held]')!.click();
    await tick();
    expect(trace).toEqual(['mount']);
    mounted.unmount();
  });

  it('deep mutation — the kernels\' own reads re-arm (teardown + remount): why params must FLOW', async () => {
    const trace: string[] = [];
    const factory = (fx: PressEffect) => (_element: HTMLElement) => {
      // every real kernel reads its fx — that read is a fine-grained dep
      trace.push(`mount:speed=${(fx as { speed?: number }).speed ?? 'none'}`);
      return () => trace.push('teardown');
    };
    const mounted = render(AttachHost, { props: { factory, fx: shimmer({ speed: 3000 }), surface: 'held' } });
    mounted.container.querySelector<HTMLButtonElement>('[data-held]')!.click();
    await tick();
    expect(trace).toEqual(['mount:speed=3000', 'teardown', 'mount:speed=9000']);
    mounted.unmount();
  });

  it('the NATIVE component-tag form: <Host {@attach fn}> mounts at the SPREAD element; undefined SKIPS; disarm tears down; unmount never double-runs', async () => {
    // the spike's exact assertions promoted (/tmp/attach-comptag2.mjs,
    // mount+teardown green under both svelte copies): the symbol-keyed
    // prop lands through the child's rest spread at the MARKED button
    const trace: string[] = [];
    const fn = (element: HTMLElement): (() => void) => {
      trace.push(`tag-mount@${element.tagName}:${element.dataset.jxAttach}`);
      return () => trace.push('tag-teardown');
    };
    // absent — the undefined arm: the child MOUNTS, its stamp rides, nothing runs
    const disarmed = render(AttachHost, { props: {} });
    const bare = disarmed.container.querySelector<HTMLButtonElement>('[data-spread]')!;
    expect(bare).toBeTruthy();
    expect(bare.getAttribute('data-jx-attach')).toBe('root'); // the optional named stamp, armed or not
    expect(trace).toEqual([]);
    // armed — the mount lands on the child's SPREAD button (mountedAtSpread)
    await disarmed.rerender({ props: { spreadAttach: fn } });
    flushSync();
    expect(trace).toEqual(['tag-mount@BUTTON:root']);
    // disarm — teardown, no crash (the undefined arm rides the tag too)
    await disarmed.rerender({ props: { spreadAttach: undefined } });
    flushSync();
    expect(trace).toEqual(['tag-mount@BUTTON:root', 'tag-teardown']);
    disarmed.unmount();
    expect(trace).toEqual(['tag-mount@BUTTON:root', 'tag-teardown']); // nothing double-runs
  });

  it('fromAction bridge: action(el, fn()) once; update on REFERENCE change; destroy on teardown; never remounts', async () => {
    const trace: string[] = [];
    const bridged = (element: HTMLElement, param: { n: number }) => {
      trace.push(`action:el=${element.dataset.flip !== undefined}:n=${param.n}`);
      return {
        update: (p: { n: number }) => trace.push(`update:n=${p.n}`),
        destroy: () => trace.push('destroy'),
      };
    };
    const mounted = render(AttachHost, { props: { bridged } });
    mounted.container.querySelector<HTMLButtonElement>('[data-flip]')!.click();
    await tick();
    expect(trace[0]).toBe('action:el=true:n=1');
    expect(trace).toContain('update:n=2');
    expect(trace.filter((t) => t.startsWith('action:'))).toHaveLength(1); // no remount
    expect(trace).not.toContain('destroy'); // not on param change
    mounted.unmount();
    expect(trace).toContain('destroy'); // on teardown — the bridge honors it
  });

  it('the LEAK counter-example: a {destroy}-returning action attached BARE — body runs, destroy NEVER does', () => {
    const trace: string[] = [];
    const bare = (_element: HTMLElement) => {
      trace.push('bare-mount');
      return { destroy: () => trace.push('bare-destroy-RAN') };
    };
    const mounted = render(AttachHost, { props: { bare } });
    expect(trace).toEqual(['bare-mount']);
    mounted.unmount();
    // THE documented failure mode: {@attach} honors only FUNCTION returns —
    // the object return is silently discarded, destroy never runs. The fix
    // is fromAction(bare) (the test above proves its destroy runs)
    expect(trace).toEqual(['bare-mount']);
  });

  it('the UNDEFINED ARM (lane-B spike, pinned): an always-mounted element skips the call — arm mounts, disarm tears down', async () => {
    // the press-button/chip bare `{@attach root}` hook's whole
    // safety: falsy expression values are SKIPPED (attachments.js's
    // `if (fn)` guard — the use: parity), never called, never a crash
    const trace: string[] = [];
    const root = (_element: HTMLElement): (() => void) => {
      trace.push('root-mount');
      return () => trace.push('root-teardown');
    };
    const disarmed = render(AttachHost, { props: {} });
    const hook = disarmed.container.querySelector<HTMLElement>('[data-root]')!;
    expect(hook).toBeTruthy(); // the element MOUNTS with an undefined attach
    expect(hook.getAttribute('data-jx-attach')).toBe('root');
    expect(trace).toEqual([]); // nothing ran
    await disarmed.rerender({ props: { root } });
    flushSync();
    expect(disarmed.container.querySelector('[data-root]')).toBeTruthy();
    expect(trace).toEqual(['root-mount']);
    await disarmed.rerender({ props: { root: undefined } });
    flushSync();
    expect(trace).toEqual(['root-mount', 'root-teardown']); // disarm: teardown, no crash
    disarmed.unmount();
    expect(trace).toEqual(['root-mount', 'root-teardown']); // nothing double-runs
  });

  it('the INTERNAL material mount (tabs indicator, r4): material on → mounts; flip off → teardown only; flip back → fresh mount', async () => {
    // the override chain RETIRED with the record (design §12 ruling 1) —
    // the indicator's mount is the component's OWN material business:
    // {@attach internalMount()} directly, where a non-liquid material
    // derives null and rides the undefined arm
    const trace: string[] = [];
    const internal = (_element: HTMLElement): (() => void) => {
      trace.push('internal-mount');
      return () => trace.push('internal-teardown');
    };
    // flush + microtasks + flush after every rerender: the internal
    // mount's transitions ride the managed attach effect, whose inner
    // mount can land a flush later than tick() settles (the spike's
    // measured timing — the SETTLED state is the law, never the
    // interleaving frame)
    const settle = async (): Promise<void> => {
      flushSync();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      flushSync();
    };
    const mounted = render(AttachHost, { props: { chainInternal: internal } });
    await settle();
    expect(trace).toEqual(['internal-mount']); // the liquid material mounts its lens

    // a material flip away from liquid: internalMount() → null → teardown only, no crash
    await mounted.rerender({ props: { chainInternal: internal, chainInternalOn: false } });
    await settle();
    expect(trace).toEqual(['internal-mount', 'internal-teardown']);

    // flip back to liquid: a FRESH internal mount (identity remount)
    await mounted.rerender({ props: { chainInternal: internal, chainInternalOn: true } });
    await settle();
    expect(trace.join(',')).toBe('internal-mount,internal-teardown,internal-mount');
    mounted.unmount();
  });

  it('the same leak simulated at the call-contract level: value(element) runs, only a FUNCTION return is teardown', () => {
    // what the runtime does with the expression's value — pinned without
    // the pipeline so the contract reads in three lines
    const element = document.createElement('div');
    const actionShaped = (el: HTMLElement) => {
      expect(el).toBe(element);
      return { destroy: () => {} }; // the repo convention's object return
    };
    const objectReturn = actionShaped(element);
    expect(typeof objectReturn).not.toBe('function'); // NOT registered as teardown — leaked
    const functionReturn = ((el: HTMLElement) => {
      expect(el).toBe(element);
      return () => {};
    })(element);
    expect(typeof functionReturn).toBe('function'); // the only honored form
  });
});

// ---------------------------------------------------------------------------
// pressEffect — mount stamps, teardown cleans, the gesture surface
// ---------------------------------------------------------------------------
function host(): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  document.body.append(el);
  return el;
}
afterEach(() => {
  document.querySelectorAll('[data-jx-shimmer-host], [data-jx-pulse-host], [data-jx-ripple-host], .jx-ripple-layer').forEach((n) => n.remove());
});

describe('pressEffect · mount stamps + teardown cleans (the r5 ring recipes)', () => {
  it('shimmer: the HOST CHANNEL — the class + vars ride the host, no child layer; teardown removes all of it', () => {
    const el = host();
    const detach = pressEffect(shimmer({ shine: '#facc15', shineWidth: '45deg', speed: 4000, ringW: '0.25em' }))(el);
    expect(el.hasAttribute('data-jx-shimmer-host')).toBe(true);
    expect(el.classList.contains('jx-shimmer-host')).toBe(true);
    expect(el.getAttribute('style')).toContain('--shimmer-shine: #facc15');
    expect(el.getAttribute('style')).toContain('--shimmer-shine-width: 45deg');
    expect(el.getAttribute('style')).toContain('--shimmer-speed: 4000ms');
    expect(el.getAttribute('style')).toContain('--shimmer-ring-w: 0.25em');
    // r12: the default fill rides the COLOR-SCHEME system color
    // (light → white, dark → black, live with the Context toggle),
    // ring-color stamps its default, and the clip rides the engine's
    // answer — jsdom answers no border-area
    expect(el.getAttribute('style')).toContain('--shimmer-fill: Canvas');
    expect(el.getAttribute('style')).toContain('--shimmer-base: currentColor');
    expect(el.getAttribute('style')).toContain('--shimmer-clip: padding-box, border-box');
    // no child elements at all — the host itself is the ring
    expect(el.children.length).toBe(0);
    expect(el.style.mixBlendMode).toBe('');
    detach();
    expect(el.hasAttribute('data-jx-shimmer-host')).toBe(false);
    expect(el.classList.contains('jx-shimmer-host')).toBe(false);
    expect(el.getAttribute('style')).toBeNull();
  });

  it('shimmer: fill=null — the blend emulation where border-area is missing (white+darken in light, black+lighten in dark); the true cutout clip where it answers', () => {
    const el = host();
    const detach = pressEffect(shimmer({ fill: null }))(el);
    // jsdom: CSS.supports('background-clip','border-area') is false →
    // the fallback — an opaque white/black fill + the blend stamp
    expect(el.getAttribute('style')).toContain('--shimmer-clip: padding-box, border-box');
    expect(el.style.mixBlendMode === 'darken' || el.style.mixBlendMode === 'lighten').toBe(true);
    const fillVar = el.getAttribute('style')!.match(/--shimmer-fill: ([^;]+);/)!;
    expect(['rgb(255 255 255)', 'rgb(0 0 0)']).toContain(fillVar[1].trim());
    detach();
    expect(el.style.mixBlendMode).toBe('');
    expect(el.getAttribute('style')).toBeNull();

    // stub the engine's YES and the cutout branch answers: clip flips
    // to border-area, no blend stamp, the fill stays transparent-free
    // (jsdom ships no global CSS at all — the stub goes on globalThis)
    const g = globalThis as { CSS?: unknown };
    const realCSS = g.CSS;
    g.CSS = { supports: () => true };
    try {
      const el2 = host();
      const detach2 = pressEffect(shimmer({ fill: null }))(el2);
      expect(el2.getAttribute('style')).toContain('--shimmer-clip: padding-box, border-area');
      expect(el2.style.mixBlendMode).toBe('');
      detach2();
      expect(el2.getAttribute('style')).toBeNull();
    } finally {
      g.CSS = realCSS;
    }
  });

  it('shimmer: the face rides the SHEET channel — the inline style never carries paint (r11 ownership law)', () => {
    // the kernel ADDS custom properties (and, only for the blend
    // emulation, mix-blend-mode) — the consumer's own background,
    // border-radius, and text ride the whole cycle untouched
    const el = host();
    el.setAttribute('style', '--consumer-x: 1; background: var(--jx-fill); border-radius: 18px');
    const prior = el.getAttribute('style')!;
    const detach = pressEffect(shimmer())(el);
    const added = el
      .getAttribute('style')!
      .split(';')
      .map((d) => d.trim())
      .filter((d) => d && !prior.split(';').map((x) => x.trim()).includes(d));
    for (const decl of added) {
      expect(decl.startsWith('--'), `shimmer paints the host inline: ${decl}`).toBe(true);
    }
    expect(el.children.length).toBe(0);
    detach();
    expect(el.getAttribute('style')).toBe(prior);
  });

  it('solidFill — the fill channel’s minter: any CSS color over the context base, opaque by construction', () => {
    // an explicit base makes the mint deterministic
    expect(solidFill('#ff0000', '#000000')).toBe(0xff0000);
    // the half-red-over-blue composite: r=128, g=0, b=128 → 0x800080
    expect(solidFill('rgba(255, 0, 0, 0.5)', '#0000ff')).toBe(0x800080);
    // a fully transparent source resolves to the base itself
    expect(solidFill('rgba(0, 0, 0, 0)', '#123456')).toBe(0x123456);
    // context flavor: the default base parses (jsdom root bg or the
    // scheme fallback) and the result is always an int
    expect(Number.isInteger(solidFill('#ffffff'))).toBe(true);
  });

  it('pulse: the variant rides its own class; vars stamped and stripped', () => {
    const el = host();
    const detach = pressEffect(pulse({ variant: 'ring', duration: 900 }))(el);
    expect(el.hasAttribute('data-jx-pulse-host')).toBe(true);
    expect(el.getAttribute('style')).toContain('--pulse-duration: 900ms');
    expect(el.querySelector('.jx-pulse-layer.jx-pulse-ring')).toBeTruthy();
    detach();
    expect(el.hasAttribute('data-jx-pulse-host')).toBe(false);
    expect(el.querySelector('.jx-pulse-layer')).toBeNull();
    expect(el.getAttribute('style')).toBeNull();
  });

  it('rainbow: the ring walk — mask-banded ring + the under-glow; the host untouched', () => {
    const el = host();
    const detach = pressEffect(rainbow({ speed: 4000 }))(el);
    // r8: NO host class carries paint — the ring + glow spans are the
    // whole layer set; the host's own face/radius/text ride
    expect(el.classList.contains('jx-rainbow-host')).toBe(false);
    expect(el.getAttribute('style')).toContain('--rainbow-speed: 4000ms');
    expect(el.getAttribute('style')).toContain('--c1: hsl(0 100% 63%)');
    expect(el.getAttribute('style')).not.toContain('--jx-rainbow-face');
    expect(el.getAttribute('style')).not.toContain('background');
    expect(el.querySelectorAll(':scope > span')).toHaveLength(2);
    expect(el.querySelector('.jx-rainbow-ring')).toBeTruthy();
    const glow = el.querySelector('.jx-rainbow-glow');
    expect(glow).toBeTruthy();
    expect(glow!.getAttribute('style')).toBeNull();
    detach();
    expect(el.querySelector('.jx-rainbow-ring')).toBeNull();
    expect(el.querySelector('.jx-rainbow-glow')).toBeNull();
    expect(el.getAttribute('style')).toBeNull();
  });

  it('rainbow: the host inline style is BYTE-IDENTICAL through mount+teardown (paint rides the class)', () => {
    // r5's ownership law: the kernel rewrites ONLY the vars it owns
    // (stampVars/stripVars), so a consumer's prior style — background
    // included — rides the whole cycle verbatim; the r4 capture/restore
    // contract dies with the channels it guarded
    for (const prior of [null, '--consumer-x: 1', '--consumer-x: 1; background: var(--jx-fill)']) {
      const el = host();
      if (prior !== null) el.setAttribute('style', prior);
      const detach = pressEffect(rainbow())(el);
      if (prior !== null) {
        // the stamp APPENDS to the consumer's own declarations, never rewrites them
        expect(el.getAttribute('style')!.startsWith(prior)).toBe(true);
      }
      detach();
      expect(el.getAttribute('style')).toBe(prior);
      el.remove();
    }
  });

  it('the kernels stay directly callable (the attachLiquidGlass precedent)', () => {
    const el = host();
    const clean = applyShimmer(el, shimmer());
    expect(el.hasAttribute('data-jx-shimmer-host')).toBe(true);
    clean();
    expect(el.hasAttribute('data-jx-shimmer-host')).toBe(false);
    const cleanPulse = applyPulse(el, pulse());
    expect(el.hasAttribute('data-jx-pulse-host')).toBe(true);
    cleanPulse();
    const cleanRainbow = applyRainbow(el, rainbow());
    expect(el.querySelector('.jx-rainbow-ring')).toBeTruthy();
    cleanRainbow();
    expect(el.querySelector('.jx-rainbow-ring')).toBeNull();
  });

  it('consumer styles survive the stamp cycle (rewrite only what you own)', () => {
    const el = host();
    el.setAttribute('style', '--consumer-x: 1');
    const detach = pressEffect(pulse())(el);
    expect(el.getAttribute('style')).toContain('--consumer-x: 1');
    expect(el.getAttribute('style')).toContain('--pulse-duration: 2500ms');
    detach();
    expect(el.getAttribute('style')).toBe('--consumer-x: 1');
  });
});

describe('pressEffect · the self-listened gesture surface (ripple, the svg engine)', () => {
  /** the padding-box frame the svg seat fills (inset-0): jsdom computes
   *  no layout, so the geometry specs stub the client box directly —
   *  exactly the two numbers the spawn reads (never getBoundingClientRect) */
  function padBox(el: HTMLElement, width: number, height: number): void {
    Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
  }
  /** a pointerdown carrying CLIENT coordinates — the only honest
   * frame (THE TARGET LAW: the pointer may land on any child; the
   * seat's rect does the math, offsetX/Y is relative to whichever
   * node caught the event and is never read again) */
  function pointerAt(el: HTMLElement, clientX: number, clientY: number, target?: Node): void {
    const event = new PointerEvent('pointerdown', { bubbles: true, clientX, clientY });
    (target ?? el).dispatchEvent(event);
  }
  /** pin the svg seat's rect (jsdom computes no layout): the spawn reads
   *  it per event, so the stub may move BETWEEN spawns */
  function seatAt(layer: Element, left: number, top: number): void {
    Object.defineProperty(layer, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left, top, right: left + 300, bottom: top + 150, width: 300, height: 150, x: left, y: top, toJSON: () => ({}) }),
    });
  }

  it('THE COORDINATE PROOF + the target law — client coords minus the seat rect, whatever child caught the pointer', () => {
    const el = host();
    padBox(el, 200, 100);
    const detach = pressEffect(ripple({ duration: 350 }))(el);
    // the layer is ONE svg seat (viewBox-free: user units = CSS px)
    const layer = el.querySelector('.jx-ripple-layer')!;
    expect(layer.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.getAttribute('style')).toContain('--ripple-color: currentColor');
    expect(layer.getAttribute('style')).toContain('--ripple-duration: 350ms');
    // THE TARGET LAW (the ⌘-glyph catch, Owner 2026-09-10): dispatch on a
    // CHILD of the host — the ink must land at the seat-frame point of
    // the CLIENT coordinates, never the child's own box
    const glyph = document.createElement('span');
    glyph.textContent = '\u2318';
    el.append(glyph);
    seatAt(layer, 100, 50);
    pointerAt(el, 130, 90, glyph);
    const ink = layer.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink.tagName).toBe('circle');
    expect(ink.getAttribute('cx')).toBe('30'); // 130 - seat.left(100)
    expect(ink.getAttribute('cy')).toBe('40'); // 90 - seat.top(50)
    // r = max(clientWidth, clientHeight) / 2 — the padding-box size
    expect(ink.getAttribute('r')).toBe('100');
    expect(ink.getAttribute('style')).toBeNull(); // geometry IS the coordinates
    expect(ink.dataset.shape).toBe('round');
    // the seat MOVES (scroll) — the next spawn re-reads it, no stale frame
    seatAt(layer, 0, 0);
    pointerAt(el, 130, 90);
    expect(layer.querySelectorAll('.jx-ripple-ink')[1].getAttribute('cx')).toBe('130');
    // THE ANCHOR LAW (the IAB catch): the host carries the positioned
    // pose, the sheet sizes + clips the seat (inherit radius, hidden
    // overflow — the r6 clipPath chase is dead)
    expect(el.classList.contains('relative')).toBe(true);
    expect(el.classList.contains('z-0')).toBe(true);
    expect(layer.querySelector('defs')).toBeNull(); // soft defaults to 0: NO filter def
    expect(layer.querySelector('g')!.getAttribute('filter')).toBeNull();
    detach();
    expect(el.querySelector('.jx-ripple-layer')).toBeNull();
  });

  it('the soft param: 0 (default) ships NO filter; >0 rides ONE per-layer feGaussianBlur at that stdDeviation', () => {
    const a = host();
    const b = host();
    const detachA = pressEffect(ripple({ soft: 2.5 }))(a);
    const detachB = pressEffect(ripple({ soft: 3 }))(b);
    const fa = a.querySelector('.jx-ripple-layer defs filter')!;
    const fb = b.querySelector('.jx-ripple-layer defs filter')!;
    expect(fa.getAttribute('id')).toMatch(/^jx-ripple-\d+-soft$/);
    expect(fa.getAttribute('id')).not.toBe(fb.getAttribute('id')); // per-instance, never cross-referenced
    expect(fa.querySelector('feGaussianBlur')!.getAttribute('stdDeviation')).toBe('2.5');
    expect(a.querySelector('.jx-ripple-layer g')!.getAttribute('filter')).toContain(fa.getAttribute('id')!);
    detachA();
    detachB();
    expect(document.querySelector('defs filter[id^="jx-ripple-"]')).toBeNull(); // no id leaks
  });

  it('settle rides the platform events: animationend AND animationcancel each remove the ink', () => {
    // r5: the WAAPI engine is gone — the ink node's lifecycle is the css
    // timeline's own event pair (jsdom runs no css animations, so the
    // battery dispatches them the way a real engine fires them)
    const el = host();
    padBox(el, 200, 100);
    const detach = pressEffect(ripple({ duration: 600 }))(el);
    pointerAt(el, 10, 10);
    const layer = el.querySelector('.jx-ripple-layer')!;
    seatAt(layer, 0, 0);
    const ink = layer.querySelector('.jx-ripple-ink')!;
    ink.dispatchEvent(new Event('animationend'));
    expect(layer.querySelector('.jx-ripple-ink')).toBeNull();
    pointerAt(el, 10, 10);
    layer.querySelector('.jx-ripple-ink')!.dispatchEvent(new Event('animationcancel'));
    expect(layer.querySelector('.jx-ripple-ink')).toBeNull();
    detach();
  });

  it('keydown Enter/Space spawns CENTERED ink (the padding-box center)', () => {
    const el = host();
    padBox(el, 200, 100);
    const detach = pressEffect(ripple({ duration: 20 }))(el);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    let ink = el.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink.getAttribute('cx')).toBe('100'); // clientWidth / 2
    expect(ink.getAttribute('cy')).toBe('50'); // clientHeight / 2
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    ink = el.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink).toBeTruthy();
    // other keys never ink
    el.querySelector('.jx-ripple-layer')!.replaceChildren();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(el.querySelector('.jx-ripple-ink')).toBeNull();
    detach();
  });

  it('the disabled gate: :disabled and aria-disabled no-op, re-checked PER EVENT', () => {
    const el = host();
    const detach = pressEffect(ripple())(el);
    // :disabled blocks
    el.disabled = true;
    pointerAt(el, 1, 1);
    expect(el.querySelector('.jx-ripple-ink')).toBeNull();
    // aria-disabled blocks (the loading pose — never the disabled attr)
    el.disabled = false;
    el.setAttribute('aria-disabled', 'true');
    pointerAt(el, 1, 1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.querySelector('.jx-ripple-ink')).toBeNull();
    // flipping it back live re-arms — the gate reads per event, not at mount
    el.removeAttribute('aria-disabled');
    pointerAt(el, 1, 1);
    expect(el.querySelector('.jx-ripple-ink')).toBeTruthy();
    detach();
  });

  it('reduced motion: the ink never spawns (the anchored press answers the pointer)', () => {
    // jsdom (non-visual) ships no matchMedia at all — stub the global the
    // runtime's gate reads (the ripple.svelte.ts gate, verbatim)
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })
    );
    try {
      const el = host();
      const detach = pressEffect(ripple())(el);
      pointerAt(el, 1, 1);
      expect(el.querySelector('.jx-ripple-ink')).toBeNull();
      detach();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('teardown: listeners off, layer gone — later gestures spawn nothing', () => {
    const el = host();
    const detach = pressEffect(ripple())(el);
    detach();
    expect(el.querySelector('.jx-ripple-layer')).toBeNull();
    pointerAt(el, 1, 1);
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.querySelector('.jx-ripple-layer')).toBeNull();
  });

  it('bevel ink is the PATH diamond (the shape law\u2019s 50% chamfer), flat-marked where corner-shape is unsupported (jsdom)', () => {
    const el = host();
    padBox(el, 120, 60);
    const detach = pressEffect(ripple({ shape: 'bevel' }))(el);
    seatAt(el.querySelector('.jx-ripple-layer')!, 100, 50);
    pointerAt(el, 130, 70); // seat frame (30, 20)
    const ink = el.querySelector('.jx-ripple-ink')!;
    expect(ink.tagName).toBe('path');
    expect(ink.dataset.shape).toBe('bevel');
    // a square of side=max(w,h)=120 with corners chamfered to the
    // midpoints: the diamond both DOM branches of the retired engine drew
    expect(ink.getAttribute('d')).toBe('M -30 20 L 30 -40 L 90 20 L 30 80 Z');
    expect(ink.getAttribute('class')).toContain('jx-ripple-flat'); // the support marker
    detach();
  });
});

// ---------------------------------------------------------------------------
// The r5 recipe laws — press-button.css source-scan (the sheet is the
// law: jsdom computes no cascade, so the recipes' timing laws pin to
// their source the way the press-law seams already do)
// ---------------------------------------------------------------------------
describe('the r5 recipe laws (press-button.css)', () => {
  const css = readFileSync(resolve('src/lib/ui/press-button/press-button.css'), 'utf8');
  /** one @keyframes block's body, by name */
  const keyframes = (name: string): string => {
    const hit = css.match(new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n\\}`));
    expect(hit, `@keyframes ${name} missing from the sheet`).toBeTruthy();
    return hit![1];
  };

  it('shimmer: the host-channel law r11 — the border is the ring, the double background clips through --shimmer-clip, the spin is uniform', () => {
    // THE HOST CHANNEL: everything on the host, no child layer — the
    // border IS the ring's geometry, FORCED (width from ringW, solid,
    // transparent color, no image) so consumer border ink can never
    // cover the conic band (the Owner's 强制 pair, important by law)
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*border-width:\s*var\(--shimmer-ring-w, 4px\)\s*!important/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*border-style:\s*solid\s*!important/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*border-color:\s*transparent\s*!important/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*border-image:\s*none\s*!important/s);
    // THE DOUBLE BACKGROUND: the fill layer (padding-box) over the
    // conic (the clip VAR — border-area where the engine answers, the
    // Afif border-box pair elsewhere)
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*var\(--shimmer-fill,\s*transparent\)/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*var\(--shimmer-shine\)/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*var\(--shimmer-shine-width,\s*30deg\)/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*background-clip:\s*var\(--shimmer-clip,\s*padding-box,\s*border-box\)/s);
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*background-origin:\s*padding-box,\s*border-box/s);
    // THE SPIN: one uniform revolution on the registered angle —
    // the reference's own cadence
    expect(css).toMatch(/@property --jx-shimmer-angle\s*\{[^}]*syntax:\s*'<angle>'/s);
    expect(css).toMatch(/@property --jx-shimmer-angle\s*\{[^}]*inherits:\s*false/s);
    const spin = keyframes('jx-shimmer-spin');
    expect(spin).toContain('--jx-shimmer-angle: 360deg');
    expect(css).toMatch(/\.jx-shimmer-host\)\s*\{[^}]*animation:\s*jx-shimmer-spin var\(--shimmer-speed,\s*3000ms\)[^}]*linear/s);
    // the retired machinery is gone: no ring span, no inset, no mask,
    // no pseudo carrier, no cut/spread vars
    const bare = stripComments(css);
    expect(bare).not.toMatch(/\.jx-shimmer-ring/);
    for (const gone of ['--shimmer-cut', '--shimmer-spread', 'jx-shimmer-reveal', 'jx-shimmer-square', 'jx-shimmer-sector', 'jx-shimmer-backdrop', 'jx-shimmer-highlight', 'jx-shimmer-slide']) {
      expect(bare.includes(gone), `${gone} survived`).toBe(false);
    }
  });

  it('pulse: opacity tracks the spread at MATCHED percentages — one animation, no sequential fade phase', () => {
    for (const name of ['jx-pulse-slow', 'jx-pulse-ring', 'jx-pulse-ripple']) {
      const body = keyframes(name);
      // every percentage block carries BOTH channels (the fade rides the
      // expansion's own keyframes)
      const blocks = body
        .split('}')
        .map((b) => b.slice(b.indexOf('{') + 1))
        .filter((b) => b.trim().length > 0);
      expect(blocks.length, name).toBeGreaterThan(0);
      for (const block of blocks) {
        expect(block, `${name} fades without expanding`).toContain('box-shadow');
        expect(block, `${name} expands without fading`).toContain('opacity');
      }
      // the spread reaches the distance, the opacity reaches zero
      expect(body).toContain('var(--pulse-distance)');
      expect(body).toContain('opacity: 0');
    }
    // and NOTHING in the sheet fades alone (the sequential-fade shape the
    // ruling kills): every keyframes block carrying opacity carries its
    // expansion channel with it — box-shadow for the pulse rings,
    // transform for the r5 ripple ink
    for (const block of css.match(/@keyframes[^{]+\{[\s\S]*?\n\}/g) ?? []) {
      if (!block.includes('opacity')) continue;
      expect(block).toMatch(/box-shadow|transform/);
    }
  });

  it('rainbow: the ring law r8 — the wrap-stop train on the registered shift; NO host stack', () => {
    // the carrier pair: the ring + the glow share the shifted train
    expect(css).toMatch(/\.jx-rainbow-ring\),\s*:where\(\.jx-rainbow-glow\)\s*\{/s);
    expect(css).toMatch(/calc\(-40% \+ var\(--jx-rainbow-shift\)\)/);
    expect(css).toMatch(/calc\(320% \+ var\(--jx-rainbow-shift\)\)/);
    expect(css).toMatch(/@property --jx-rainbow-shift\s*\{[^}]*syntax:\s*'<percentage>'/s);
    expect(css).toMatch(/@property --jx-rainbow-shift\s*\{[^}]*initial-value:\s*0%/s);
    const flow = keyframes('jx-rainbow-flow');
    expect(flow).toContain('--jx-rainbow-shift: 200%');
    // the ring band: z:0, inherit radius, the floor, the mask
    expect(css).toMatch(/\.jx-rainbow-ring\)\s*\{[^}]*z-index:\s*0/s);
    expect(css).toMatch(/\.jx-rainbow-ring\)\s*\{[^}]*border-radius:\s*inherit/s);
    expect(css).toMatch(/\.jx-rainbow-ring\)\s*\{[^}]*padding:\s*max\(0\.08rem, 2px\)/s);
    expect(css).toMatch(/\.jx-rainbow-ring\)\s*\{[^}]*mask-composite:\s*exclude/s);
    // the glow: the blurred bar below, same flow
    expect(css).toMatch(/\.jx-rainbow-glow\)\s*\{[^}]*bottom:\s*-20%/s);
    expect(css).toMatch(/\.jx-rainbow-glow\)\s*\{[^}]*blur\(0\.8rem\)/s);
    // r8: no host rule — no background stack, no border, no face var
    const bare = stripComments(css);
    expect(bare).not.toMatch(/\.jx-rainbow-host\)/);
    expect(bare).not.toContain('--jx-rainbow-face');
    for (const gone of ['background-clip: padding-box, border-box, border-box', 'border: 0.08rem solid transparent']) {
      expect(bare.includes(gone), `${gone} survived`).toBe(false);
    }
  });

  it('ripple: the css timeline + geometry, never positioning', () => {
    // the ink node paints through the color var, scales from its own
    // fill box, and runs the sheet's timeline at the layer's duration var
    expect(css).toMatch(/\.jx-ripple-ink\)\s*\{[^}]*fill:\s*var\(--ripple-color\)/s);
    expect(css).toMatch(/\.jx-ripple-ink\)\s*\{[^}]*transform-box:\s*fill-box/s);
    expect(css).toMatch(/\.jx-ripple-ink\)\s*\{[^}]*transform-origin:\s*center/s);
    expect(css).toMatch(/\.jx-ripple-ink\)\s*\{[^}]*animation:\s*jx-ripple-ink var\(--ripple-duration/s);
    // scale 0→1 and opacity 1→0 in ONE keyframe set — the ink fades as
    // it expands, fill-mode both holding the settled frame until the
    // animationend settle removes the node
    const ink = keyframes('jx-ripple-ink');
    expect(ink).toContain('transform: scale(0)');
    expect(ink).toContain('transform: scale(1)');
    expect(ink).toContain('opacity: 1');
    expect(ink).toContain('opacity: 0');
    expect(css).toMatch(/\.jx-ripple-ink\)\s*\{[^}]*both/s);
    // the retired DOM dot rules are gone
    expect(css).not.toContain('.jx-ripple-dot');
    // and nothing in the ripple family positions ink by top/left — the
    // misalignment class the svg engine exists to kill
    for (const rule of css.match(/\.jx-ripple[^{]*\{[^}]*\}/g) ?? []) {
      expect(rule.match(/^\s*(top|left):/m), rule).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// liquidGlass — the factory over the real kernel (jsdom-safe, the
// liquid-glass-action.spec approach: rect mocked, canvas stubbed)
// ---------------------------------------------------------------------------
const RECT_420x56 = {
  width: 420,
  height: 56,
  top: 0,
  left: 0,
  right: 420,
  bottom: 56,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

describe('liquidGlass · the attachment factory', () => {
  it('fx in, attachment out: mount stamps + svg + pointer; the FUNCTION return tears it down', () => {
    const el = document.createElement('div');
    document.body.append(el);
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(RECT_420x56);
    const ctx = {
      createImageData: (w: number, h: number) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {},
    };
    const getCtx = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    const toURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,STUBBED');
    try {
      const detach = liquidGlass(liquid())(el);
      expect(typeof detach).toBe('function');
      expect(el.getAttribute('data-jx-effect')).toBe('liquid-glass');
      expect(document.body.querySelector('svg.jx-glass-host')).toBeTruthy();
      expect(el.style.getPropertyValue('--jx-glass-filter')).toMatch(/^url\('#jx-lg-/);
      detach();
      expect(document.body.querySelector('svg.jx-glass-host')).toBeNull();
      expect(el.style.getPropertyValue('--jx-glass-filter')).toBe('');
    } finally {
      getCtx.mockRestore();
      toURL.mockRestore();
      el.remove();
    }
  });

  it('the kernel export stays the action-shaped {update, destroy} — untouched', () => {
    // the framework-agnostic face did NOT move (tests + direct consumers)
    const handle = attachLiquidGlass(document.createElement('div'), liquid());
    expect(typeof handle.update).toBe('function');
    expect(typeof handle.destroy).toBe('function');
    handle.destroy();
  });
});

// ---------------------------------------------------------------------------
// The migration canaries (design §6/§9, Lane B) — the sweep's net. Both
// scan with comments STRIPPED. Routes split by canary (the terminal
// review's course-correction): CANARY 1 excludes routes on both sides
// (the glass-canary precedent: registry/files/routes is the gitignored
// dev-syncer mirror, and migration prose may NAME `use:` where it
// explains the move); CANARY 2 INCLUDES the www routes — its pattern
// is a live prop-mount shape, never prose-legal, and the review proved
// the exclusion was a hole a real leak lived in (the missed demo band).
// The builders' own module script (press-button.svelte, both mirrors)
// is canary 2's single legal home — the builders still live there.
// ---------------------------------------------------------------------------
/** strip /* *\/ and // comments (colon-guarded so https:// survives), plus svelte/html comments */
function stripComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

/** canary 1 — the retired directive: a `use:name` mount. \b guards the
 * English false positives (mouse:/cause: + letter); svelte's own form
 * always follows whitespace/quote, so the guard never misses a mount */
const CANARY_USE = /\buse:[a-zA-Z]/g;
/** canary 2 — the retired builder prop: `effect={shimmer(|pulse(|rainbow(|ripple(`
 * at a call site. ONLY the four builder names fire — toast's ToastEffect
 * material stamp (`data-effect=…`, `effect={item.effect}`) and every
 * other effect-named prop (scrollEffect) are homonyms, not mounts */
const CANARY_EFFECT_PROP = /effect=\{(?:shimmer|pulse|rainbow|ripple)\b/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|svelte|css|js|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}

/** the scanned surface (see block comment): includeRoutes=false serves
 * canary 1 (prose exemption); true serves canary 2 (live mounts — the
 * www routes ride along; registry/files/routes is the byte-identical
 * dev-syncer mirror of them, so it stays excluded on that side only) */
function scannedFiles(includeRoutes = false): string[] {
  const wwwSrc = resolve(process.cwd(), 'src');
  const registryFiles = resolve(process.cwd(), '../../registry/files');
  const out: string[] = [];
  for (const root of [wwwSrc, registryFiles]) {
    const routes = join(root, 'routes');
    for (const file of walk(root)) {
      if (!includeRoutes && file.startsWith(routes)) continue;
      if (includeRoutes && root === registryFiles && file.startsWith(routes)) continue;
      out.push(file);
    }
  }
  return out;
}

describe('the migration canaries (self-tested fixtures, both directions)', () => {
  it('self-test — canary 1 catches every retired use: shape (red direction)', () => {
    for (const hit of [
      '<div use:liquidMount={fx}>',
      '<button use:riseIn>',
      'use:collectSlides',
      '<span use:rippleRuntime.ink={{ key: 1 }}>',
      '<a use:measureItem={item}>',
    ]) {
      expect(stripComments(hit).match(CANARY_USE), hit).not.toBeNull();
    }
  });

  it('self-test — canary 1 ignores English false positives and the attachment form (green direction)', () => {
    for (const miss of [
      '// the mouse:report seam',
      '/* cause:the guard */',
      'const usage = 1; // usage: never a directive',
      '{@attach fromAction(riseIn)}',
      '{@attach pressEffect(shimmer())}',
    ]) {
      expect(stripComments(miss).match(CANARY_USE), miss).toBeNull();
    }
  });

  it('self-test — canary 2 catches only the four builder props (red), never the homonyms (green)', () => {
    for (const hit of [
      '<PressButton effect={shimmer()}>',
      '<Chip effect={ripple({ shape: "bevel" })}>',
      '<IconButton effect={pulse({ variant: "ring" })}>',
      'effect={rainbow()}',
    ]) {
      expect(stripComments(hit).match(CANARY_EFFECT_PROP), hit).not.toBeNull();
    }
    for (const miss of [
      'data-effect={item.effect}', // toast's ToastEffect material stamp
      'scrollEffect={ramp()}', // the tabs scroll-run builder
      'effect={item.effect}', // passthrough values, not builders
      'const pressEffect = 1; // effect={shimmer} only in comment',
      'attachments={{ root: pressEffect(shimmer()) }}', // the retired record (prose-only here; a comment-shaped false positive)
    ]) {
      expect(stripComments(miss).match(CANARY_EFFECT_PROP), miss).toBeNull();
    }
  });

  it('canary 1: ZERO `use:` mounts across apps/www/src + registry/files (routes excluded, comments stripped)', () => {
    const offenders: string[] = [];
    for (const file of scannedFiles()) {
      const src = stripComments(readFileSync(file, 'utf8'));
      CANARY_USE.lastIndex = 0;
      if (src.match(CANARY_USE)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('canary 2: ZERO builder-prop mounts (www ROUTES INCLUDED) outside the builders own module script (press-button.svelte, both mirrors)', () => {
    const buildersHome = /press-button[\\/]press-button\.svelte$/;
    const offenders: string[] = [];
    for (const file of scannedFiles(true)) {
      if (buildersHome.test(file)) continue; // the builders live here
      const src = stripComments(readFileSync(file, 'utf8'));
      CANARY_EFFECT_PROP.lastIndex = 0;
      if (src.match(CANARY_EFFECT_PROP)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});
