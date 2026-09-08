/**
 * glass-effect.spec.ts — the builder/law-sheet contract battery
 * (glass-effect design §2/§3/§10, 2026-09-08).
 *
 * Coverage:
 *  - the two-layer API's PHYSICAL layer: liquid() defaults, clamps
 *    (finite numbers clamp, never throw), TypeError on non-finite /
 *    mistyped input, surface enum validation; blur() frost defaults;
 *  - the SEMANTIC layer (§2's compile table, pinned by test):
 *    apple regular ≡ liquid() defaults deep-equal; clear's four deltas;
 *    identity | isEnabled:false → the FROST member (radius '2px',
 *    saturate 1.6 — zero lens cost); tint → color-mix 30%; shape and
 *    interactive land verbatim;
 *  - glassAttrs/glassVars: liquid NEVER carries the --jx-glass-filter
 *    pointer (the mount action's exclusive write); the interactive
 *    flag stamps the --jx-glass-interactive:1 var — literal name pinned;
 *  - the LAW SHEET pinned at source (jsdom computes no css): literal
 *    @layer, the unconditional frost base, the POINTER-ONLY @supports
 *    branch, cascade order (the branch FOLLOWS the frost block),
 *    the interactive motion block + its prefers-reduced-motion gate,
 *    the --jx-glass-solid-fill reduced-transparency ground, print, and
 *    NO forced-colors block (consumers own Canvas grounds);
 *  - the ONE-FORMULA boundary: `backdrop-filter: blur(` for glass paint
 *    exists ONLY in glass.css across the stamp-channel families — the
 *    consumer sheets carry zero raw formulas, surface acrylic stays the
 *    DECLARED exception and reads the tokenized --jx-glass-* family;
 *  - the MIGRATION CANARY: normalized regex jx-glass(?![-\w]) over
 *    apps/www/src/lib/** + registry/files/** (the gitignored
 *    registry/files/routes droppings excluded — the icon-migration
 *    precedent), comments stripped, self-tested both directions;
 *  - computed-equivalence migration parity: the law's fallback VALUES
 *    are the retired .jx-glass values verbatim (14px / 1.35 / 68%);
 *  - the tokens demo page: ZERO canary hits post-rebuild;
 *  - forced-colors consumer pins (tabs/toc/docs Canvas grounds exist;
 *    toast keeps its utility-class ground).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { blur, glassAttrs, glassVars, liquid } from '../src/lib/ui/glass/glass';

// ---------------------------------------------------------------------------
// The PHYSICAL layer — defaults, clamps, TypeErrors
// ---------------------------------------------------------------------------
describe('glass · liquid() — the physical layer', () => {
  it('defaults: kube\'s objective facts, every knob documented (deep-equal)', () => {
    expect(liquid()).toEqual({
      type: 'liquid-glass',
      surface: 'convex-squircle',
      bezel: 22,
      thickness: 30,
      scale: 55,
      blur: 0.2,
      specular: 0.2,
      rimSaturate: 4,
      radius: '2px',
      saturate: 1.6,
      fill: 'color-mix(in oklab, var(--background, Canvas) 68%, transparent)',
      brightness: 1,
      shape: null,
      interactive: false,
    });
  });

  it('finite numbers CLAMP into range — never throw (numeric discipline, §2)', () => {
    const fx = liquid({ bezel: 0, thickness: 9999, scale: -5, blur: 99, specular: 5, rimSaturate: 0.5, saturate: 42, brightness: -1 });
    expect(fx.bezel).toBe(4);
    expect(fx.thickness).toBe(160);
    expect(fx.scale).toBe(0);
    expect(fx.blur).toBe(4);
    expect(fx.specular).toBe(1);
    expect(fx.rimSaturate).toBe(1);
    expect(fx.saturate).toBe(3);
    expect(fx.brightness).toBe(0);
  });

  it('NaN / ±Infinity / non-numbers → TypeError at construction', () => {
    for (const bad of [NaN, Infinity, -Infinity, '3' as never, null as never]) {
      expect(() => liquid({ bezel: bad })).toThrow(TypeError);
      expect(() => liquid({ scale: bad })).toThrow(TypeError);
    }
    expect(() => liquid({ radius: 14 as never })).toThrow(TypeError);
    expect(() => liquid({ fill: '' })).toThrow(TypeError);
  });

  it('surface validates against the enum (all four pass; anything else throws)', () => {
    for (const surface of ['convex-circle', 'convex-squircle', 'concave', 'lip'] as const) {
      expect(liquid({ surface }).surface).toBe(surface);
    }
    expect(() => liquid({ surface: 'domed' as never })).toThrow(TypeError);
  });
});

describe('glass · blur() — the frost member', () => {
  it('defaults are the retired .jx-glass values verbatim (computed-equivalence, r1 P1-10)', () => {
    expect(blur()).toEqual({
      type: 'blur',
      radius: '14px',
      saturate: 1.35,
      fill: 'color-mix(in oklab, var(--background, Canvas) 68%, transparent)',
      brightness: 1,
    });
  });

  it('clamps + TypeError discipline mirrors the liquid layer', () => {
    expect(blur({ saturate: 99 }).saturate).toBe(3);
    expect(blur({ brightness: -9 }).brightness).toBe(0);
    expect(() => blur({ saturate: NaN })).toThrow(TypeError);
    expect(() => blur({ radius: '' })).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// The SEMANTIC layer — §2's compile table, pinned
// ---------------------------------------------------------------------------
describe('glass · liquid.apple() — the semantic compile table (§2)', () => {
  it('variant regular ≡ liquid() defaults (deep-equal — the physical facts verbatim)', () => {
    expect(liquid.apple({ variant: 'regular' })).toEqual(liquid());
    expect(liquid.apple()).toEqual(liquid()); // default variant
  });

  it('variant clear compiles to the four deltas; everything else stays the physical default', () => {
    const fx = liquid.apple({ variant: 'clear' });
    expect(fx.type).toBe('liquid-glass');
    expect(fx.blur).toBe(0);
    expect(fx.fill).toBe('color-mix(in oklab, var(--background, Canvas) 22%, transparent)');
    expect(fx.rimSaturate).toBe(2.5);
    expect(fx.specular).toBe(0.12);
    const base = liquid();
    expect(fx.surface).toBe(base.surface);
    expect(fx.bezel).toBe(base.bezel);
    expect(fx.thickness).toBe(base.thickness);
    expect(fx.scale).toBe(base.scale);
    expect(fx.radius).toBe(base.radius);
    expect(fx.saturate).toBe(base.saturate);
  });

  it('variant identity → the FROST member (Apple\'s no-op maps to the law\'s own degradation, zero lens cost)', () => {
    const fx = liquid.apple({ variant: 'identity' });
    expect(fx.type).toBe('blur');
    expect(fx).toEqual(blur({ radius: '2px', saturate: 1.6 }));
  });

  it('isEnabled: false behaves as identity', () => {
    expect(liquid.apple({ isEnabled: false })).toEqual(liquid.apple({ variant: 'identity' }));
  });

  it('identity keeps a tint as the translucent frost fill (30% mix, the tint standard)', () => {
    const fx = liquid.apple({ variant: 'identity', tint: 'oklch(0.7 0.1 250)' });
    expect(fx.type).toBe('blur');
    expect(fx.radius).toBe('2px');
    expect(fx.saturate).toBe(1.6);
    expect(fx.fill).toBe('color-mix(in oklab, oklch(0.7 0.1 250) 30%, transparent)');
  });

  it('tint compiles to fill = color-mix(in oklab, TINT 30%, transparent) — on regular AND clear', () => {
    for (const variant of ['regular', 'clear'] as const) {
      const fx = liquid.apple({ variant, tint: 'crimson' });
      expect(fx.type).toBe('liquid-glass');
      expect(fx.fill).toBe('color-mix(in oklab, crimson 30%, transparent)');
    }
  });

  it('interactive flags the effect (the var stamp is pinned below); shape lands verbatim', () => {
    expect(liquid.apple({ interactive: true }).interactive).toBe(true);
    expect(liquid.apple({ interactive: false }).interactive).toBe(false);
    expect(liquid.apple({ shape: 'capsule' }).shape).toBe('capsule');
    expect(liquid.apple({ shape: 7 }).shape).toBe(7);
    expect(liquid.apple().shape).toBe(null); // unset = the element's border-radius
  });
});

// ---------------------------------------------------------------------------
// The stamp helpers — attrs/vars mapping
// ---------------------------------------------------------------------------
describe('glass · glassAttrs / glassVars (the stamp channel)', () => {
  it('attrs stamp data-jx-effect with the member type + the vars style', () => {
    expect(glassAttrs(blur())).toEqual({
      'data-jx-effect': 'blur',
      style: glassVars(blur()),
    });
    expect(glassAttrs(liquid())['data-jx-effect']).toBe('liquid-glass');
  });

  it('vars carry the four tuning slots in the law sheet\'s own names', () => {
    const vars = glassVars(liquid({ radius: '3px', saturate: 1.7, fill: 'red', brightness: 1.1 }));
    expect(vars).toContain('--jx-glass-radius:3px');
    expect(vars).toContain('--jx-glass-saturate:1.7');
    expect(vars).toContain('--jx-glass-fill:red');
    expect(vars).toContain('--jx-glass-brightness:1.1');
  });

  it('liquid NEVER carries the --jx-glass-filter pointer — that is the mount action\'s exclusive write', () => {
    expect(glassVars(liquid())).not.toContain('--jx-glass-filter');
    expect(glassAttrs(liquid())['data-jx-effect']).toBe('liquid-glass');
  });

  it('the interactive flag stamps the --jx-glass-interactive:1 var — literal name pinned', () => {
    // the flag is SEMANTIC-ONLY: the physical factory exposes no knob for
    // it (§2) — Apple's .interactive() is the one door
    expect(glassVars(liquid.apple({ interactive: true }))).toContain('--jx-glass-interactive:1');
    expect(glassVars(liquid())).not.toContain('--jx-glass-interactive');
    expect(glassVars(liquid.apple())).not.toContain('--jx-glass-interactive');
    expect(glassVars(blur())).not.toContain('--jx-glass-interactive');
  });
});

// ---------------------------------------------------------------------------
// The law sheet — pinned at source
// ---------------------------------------------------------------------------
const glassCss = readFileSync(resolve(process.cwd(), 'src/lib/ui/glass/glass.css'), 'utf8');

describe('glass · the law sheet (glass.css, source-pinned)', () => {
  it('literal @layer wrapper — the scroll-run posture, zero-specificity :where()', () => {
    expect(glassCss).toContain('@layer theme, base, components, utilities;');
    expect(glassCss).toContain('@layer components {');
    expect(glassCss).toMatch(/:where\(\[data-jx-effect='blur'\],\s*\[data-jx-effect='liquid-glass'\]\)/);
  });

  it('the frost base is UNCONDITIONAL: fill + the blur/saturate/brightness chain, both engine lines', () => {
    const base = glassCss.match(
      /:where\(\[data-jx-effect='blur'\],\s*\[data-jx-effect='liquid-glass'\]\)\s*\{[^}]*\}/,
    )?.[0] ?? '';
    expect(base).toMatch(/background:\s*var\(--jx-glass-fill,\s*color-mix\(in oklab,\s*var\(--background,\s*Canvas\)\s*68%,\s*transparent\)\)/);
    expect(base).toMatch(/-webkit-backdrop-filter:\s*blur\(var\(--jx-glass-radius,\s*14px\)\)\s*saturate\(var\(--jx-glass-saturate,\s*1\.35\)\)\s*brightness\(var\(--jx-glass-brightness,\s*1\)\)/);
    expect(base).toMatch(/backdrop-filter:\s*blur\(var\(--jx-glass-radius,\s*14px\)\)/);
  });

  it('the lens branch is POINTER-ONLY: @supports + the var pointer, no css frost chain inside (the v3 lesson)', () => {
    const supports = glassCss.match(
      /@supports\s*\(backdrop-filter:\s*url\('#jx-glass-supports-probe'\)\)\s*\{[\s\S]*?\n\s*\}/,
    )?.[0] ?? '';
    expect(supports.length).toBeGreaterThan(0);
    expect(supports).toMatch(/:where\(\[data-jx-effect='liquid-glass'\]\)/);
    expect(supports).toMatch(/backdrop-filter:\s*var\(--jx-glass-filter,\s*saturate\(1\)\)/);
    expect(supports).toMatch(/-webkit-backdrop-filter:\s*var\(--jx-glass-filter,\s*saturate\(1\)\)/);
    // POINTER-ONLY: no blur() function may appear inside the branch —
    // chaining css frost under url() double-blurs
    expect(supports).not.toMatch(/blur\(/);
    // blur() never enters the branch: the selector is liquid-only
    expect(supports).not.toContain("data-jx-effect='blur'");
  });

  it('CASCADE LAW: the @supports block FOLLOWS the frost base — frost → lens, never unfiltered → lens', () => {
    const frostAt = glassCss.indexOf(":where([data-jx-effect='blur'], [data-jx-effect='liquid-glass'])");
    const lensAt = glassCss.indexOf("@supports (backdrop-filter: url('#jx-glass-supports-probe'))");
    expect(frostAt).toBeGreaterThan(-1);
    expect(lensAt).toBeGreaterThan(frostAt);
  });

  it('the interactive MOTION block: var-gated press scale/brighten (§3), reduced-motion kills it', () => {
    expect(glassCss).toMatch(
      /:where\(\[data-jx-effect='liquid-glass'\]\[style\*='--jx-glass-interactive:1'\]\)\s*\{[^}]*transition:\s*transform\s*\.18s/,
    );
    expect(glassCss).toMatch(/:active\s*\{[^}]*transform:\s*scale\(\.93\)/);
    expect(glassCss).toMatch(/:active\s*\{[^}]*filter:\s*brightness\(1\.25\)/);
    const rm = glassCss.slice(glassCss.indexOf('@media (prefers-reduced-motion'));
    expect(rm).toMatch(/transition:\s*none/);
    expect(rm).toMatch(/transform:\s*none/);
    expect(rm).toMatch(/filter:\s*none/);
  });

  it('reduced-transparency: the SOLID ground over the --jx-glass-solid-fill escape hatch, filters none', () => {
    const rt = glassCss.slice(glassCss.indexOf('@media (prefers-reduced-transparency'));
    expect(rt).toMatch(/background:\s*var\(--jx-glass-solid-fill,\s*var\(--background,\s*Canvas\)\)/);
    expect(rt).toMatch(/backdrop-filter:\s*none/);
  });

  it('print: the filters drop (both engines\' lines)', () => {
    const print = glassCss.slice(glassCss.indexOf('@media print'));
    expect(print).toMatch(/-webkit-backdrop-filter:\s*none/);
    expect(print).toMatch(/backdrop-filter:\s*none/);
  });

  it('NO forced-colors block BY DESIGN — the law never guesses system colors', () => {
    // the header comment DOCUMENTS the omission; the css body (comments
    // stripped) must carry no forced-colors media block at all
    expect(stripComments(glassCss)).not.toMatch(/forced-colors/);
  });
});

// ---------------------------------------------------------------------------
// The one-formula boundary
// ---------------------------------------------------------------------------
const consumerSheets = {
  'tabs-trigger.css': 'src/lib/ui/tabs/tabs-trigger.css',
  'toc.css': 'src/lib/ui/toc/toc.css',
  'toast-viewport.svelte': 'src/lib/ui/toast/toast-viewport.svelte',
  'docs-sections-nav.svelte': 'src/lib/ui/docs-sections-nav.svelte',
  'sim-shell.css': 'src/lib/print/sim-shell.css',
} as const;

describe('glass · the one-formula boundary', () => {
  it('the stamp-channel families carry ZERO raw glass formulas — glass.css is the only formula owner', () => {
    for (const [name, rel] of Object.entries(consumerSheets)) {
      const sheet = readFileSync(resolve(process.cwd(), rel), 'utf8');
      expect(sheet, name).not.toMatch(/backdrop-filter:\s*blur\(/);
    }
    // and glass.css really owns it (tested both ways)
    expect(glassCss).toMatch(/backdrop-filter:\s*blur\(var\(--jx-glass-radius,\s*14px\)\)/);
  });

  it('surface acrylic stays the DECLARED exception — VALUE-tokenized onto the --jx-glass-* family, pinned locally', () => {
    const theme = readFileSync(resolve(process.cwd(), 'src/lib/jixoai.css'), 'utf8');
    const acrylic = theme.match(
      /\.jx-surface\[data-variant='acrylic'\]\s+\.jx-surface-body,\s*\n\.jx-surface\[data-variant='auto'\]\s+\.jx-surface-body\s*\{[^}]*\}/,
    )?.[0] ?? '';
    expect(acrylic.length).toBeGreaterThan(0);
    expect(acrylic).toMatch(/--jx-glass-radius:\s*14px;/);
    expect(acrylic).toMatch(/--jx-glass-saturate:\s*1;/);
    expect(acrylic).toMatch(/--jx-glass-brightness:\s*2;/);
    expect(acrylic).toMatch(/backdrop-filter:\s*blur\(var\(--jx-glass-radius,\s*14px\)\)/);
  });
});

// ---------------------------------------------------------------------------
// The migration canary — .jx-glass is retired; the vars keep the prefix
// ---------------------------------------------------------------------------
/** strip /* *\/ and // comments (colon-guarded so https:// survives), plus svelte/html comments */
function stripComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

/** the normalized canary: a .jx-glass selector/class/attr usage, but NOT
 *  the --jx-glass-* var family, NOT the jx-glass-host svg class, NOT any
 *  longer token that merely starts with the prefix */
const CANARY = /jx-glass(?![\w-])/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|svelte|css|js|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}

describe('glass · the migration canary (self-tested fixture, both directions)', () => {
  it('self-test — the regex catches every retired usage shape', () => {
    for (const hit of [
      '.jx-glass {',
      'class="jx-glass"',
      ":is(.jx-glass, .panel)",
      'div.jx-glass:hover',
      "[class~='jx-glass']",
    ]) {
      expect(stripComments(hit).match(CANARY)).not.toBeNull();
    }
  });

  it('self-test — the regex ignores the var family, the host svg class, and longer tokens', () => {
    for (const miss of [
      '--jx-glass-radius: 2px;',
      '--jx-glass-filter: url(#id)',
      '--jx-glass-interactive:1',
      "class='jx-glass-host'",
      'jx-glassy',
      'data-jx-effect',
    ]) {
      expect(stripComments(miss).match(CANARY)).toBeNull();
    }
  });

  it('self-test — comments are stripped before matching (a commented literal is documentation, not usage)', () => {
    expect(stripComments('/* the retired .jx-glass block */\n.rule {}').match(CANARY)).toBeNull();
    expect(stripComments('// .jx-glass was here\n.rule {}').match(CANARY)).toBeNull();
    // but the SAME literal outside comments still fires
    expect(stripComments('/* note */ .jx-glass {}').match(CANARY)).not.toBeNull();
  });

  it('ZERO retired .jx-glass usage across apps/www/src/lib/** and registry/files/** (routes excluded)', () => {
    const wwwLib = resolve(process.cwd(), 'src/lib');
    const registryFiles = resolve(process.cwd(), '../../registry/files');
    const offenders: string[] = [];
    const registryRoutes = join(registryFiles, 'routes');
    for (const root of [wwwLib, registryFiles]) {
      for (const file of walk(root)) {
        // registry/files/routes is the gitignored dev-syncer mirror of the
        // www ROUTES (the icon-migration precedent) — the teaching copy on
        // the glass docs page lives there, out of the source canary's scope
        if (file.startsWith(registryRoutes)) continue;
        if (stripComments(readFileSync(file, 'utf8')).match(CANARY)) offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('the tokens demo page is REBUILT onto the stamp channel — zero canary hits in the page file', () => {
    const page = readFileSync(
      resolve(process.cwd(), 'src/routes/tokens.html/+page.svelte'),
      'utf8',
    );
    // the page may TALK about the --jx-glass-* vars (documentation), but
    // no retired .jx-glass usage survives the rebuild
    expect(stripComments(page).match(CANARY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Computed-equivalence migration parity — the law's fallback VALUES are
// the retired .jx-glass values verbatim (an element migrated off the
// class paints identically pre-hydration)
// ---------------------------------------------------------------------------
describe('glass · computed-equivalence (migration parity)', () => {
  it('the frost fallbacks read 14px / 1.35 / 68% — exactly the retired .jx-glass computed values', () => {
    expect(glassCss).toMatch(/--jx-glass-radius,\s*14px\)/);
    expect(glassCss).toMatch(/--jx-glass-saturate,\s*1\.35\)/);
    expect(glassCss).toMatch(/var\(--background,\s*Canvas\)\s*68%,\s*transparent\)/);
    // and the blur() builder defaults agree with the sheet's fallbacks —
    // builder and law can never drift apart
    const fx = blur();
    expect(`${fx.radius} / ${fx.saturate}`).toBe('14px / 1.35');
    expect(fx.fill).toBe('color-mix(in oklab, var(--background, Canvas) 68%, transparent)');
  });
});

// ---------------------------------------------------------------------------
// forced-colors consumer pins (design §3/§6 — the consumer map)
// ---------------------------------------------------------------------------
describe('glass · forced-colors consumer map', () => {
  it('tabs: the glass/liquid indicators carry their Canvas ground (geometry untouched)', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/lib/ui/tabs/tabs-trigger.css'), 'utf8');
    const fc = css.slice(css.indexOf('@media (forced-colors'));
    expect(fc).toMatch(/data-material=['"]glass/);
    expect(fc).toMatch(/background:\s*Canvas/);
  });

  it('toc: the mobile rail reads as a solid Canvas panel with a CanvasText edge', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/lib/ui/toc/toc.css'), 'utf8');
    const fc = css.slice(css.indexOf('@media (forced-colors'));
    expect(fc).toMatch(/background:\s*Canvas/);
    expect(fc).toMatch(/outline-color:\s*CanvasText/);
  });

  it('docs-sections-nav: the same Canvas panel + CanvasText edge law', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/docs-sections-nav.svelte'),
      'utf8',
    );
    const fc = src.slice(src.indexOf('@media (forced-colors'));
    expect(fc).toMatch(/background:\s*Canvas/);
    expect(fc).toMatch(/outline-color:\s*CanvasText/);
  });

  it('toast: keeps its precedent forced-colors:bg-[Canvas] utility on the glass ground', () => {
    const src = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/toast/toast-viewport.svelte'),
      'utf8',
    );
    const line = src.split('\n').find((l) => l.includes('--jx-glass-radius:12px')) ?? '';
    expect(line).not.toBe('');
    expect(line).toMatch(/forced-colors:bg-\[Canvas\]/);
  });
});
