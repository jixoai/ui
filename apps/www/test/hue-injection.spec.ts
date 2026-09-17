// hue-injection utilities guards (hue-injection-utilities change):
// the intent layer is authored as @utility rules INSIDE the theme
// sheet — these locks keep the closed set honest against drift.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cn } from '../src/lib/utils';

const sheet = readFileSync(resolve(process.cwd(), 'src/lib/jixoai.css'), 'utf8');

const HUES = ['primary', 'neutral', 'error', 'success', 'warning', 'info'] as const;
// the var() target each intent name must inject (--jx-tonal slot)
const HUE_TARGET: Record<(typeof HUES)[number], string> = {
  primary: 'var(--primary)',
  neutral: 'var(--muted-foreground)',
  error: 'var(--error)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  info: 'var(--info)',
};

describe('hue-injection utilities', () => {
  it('the theme sheet carries every intent class of the closed set', () => {
    // tailwindless W4: the intent layer retired the @utility syntax —
    // plain utilities-tier classes now carry the same declarations
    for (const hue of HUES) {
      expect(sheet, `.jx-hue-${hue}`).toMatch(
        new RegExp(`\\.jx-hue-${hue} \\{ --jx-tonal: ${HUE_TARGET[hue].replace(/[()]/g, '\\$&')}; \\}`),
      );
    }
    expect(sheet).toContain(
      '.jx-pair-destructive {\n    --jx-fill: var(--destructive);\n    --jx-fill-ink: var(--destructive-foreground);\n  }',
    );
  });

  it('every injected var() target exists as a theme token', () => {
    const targets = [...HUES.map((h) => HUE_TARGET[h]), 'var(--destructive)', 'var(--destructive-foreground)'];
    for (const t of targets) {
      const name = t.slice('var('.length, -1); // e.g. '--primary'
      // light or dark block defines the token
      expect(sheet, `token ${name} defined`).toMatch(new RegExp(`^(\\s*)${name}:`, 'm'));
    }
  });

  it('action/status split holds by construction: no jx-hue-destructive', () => {
    // destructive is an ACTION hue — only the PAIR may carry it
    expect(sheet).not.toContain('.jx-hue-destructive {');
  });

  it('the intent jx-* class set is EXACTLY the closed set (no unlisted additions)', () => {
    const intent = [...sheet.matchAll(/^  \.(jx-hue-[a-z-]+|jx-pair-[a-z-]+) \{/gm)].map((m) => m[1]);
    expect(intent.sort()).toEqual(
      [
        'jx-hue-primary',
        'jx-hue-neutral',
        'jx-hue-error',
        'jx-hue-success',
        'jx-hue-warning',
        'jx-hue-info',
        'jx-pair-destructive',
        // (css-laws V3, 2026-08-28) the jx-html form-control family is
        // no longer @utility — flat generated rules in @layer
        // components between the css-laws markers. A guard for THAT
        // family lives in the css-laws package's own suite.
      ].sort(),
    );
  });

  it('cn() dedupes the pair group too (jx-pair vs jx-pair)', () => {
    expect(cn('jx-pair-destructive', 'text-xs', 'jx-hue-error')).toBe(
      'jx-pair-destructive text-xs jx-hue-error',
    );
    // same-class duplicates collapse
    expect(cn('jx-pair-destructive', 'jx-pair-destructive')).toBe('jx-pair-destructive');
  });

  it('cn() dedupes the intent layer (last-wins, like arbitrary properties)', () => {
    expect(cn('jx-hue-error', 'jx-hue-success')).toBe('jx-hue-success');
    expect(cn('jx-hue-error', 'jx-hue-error')).toBe('jx-hue-error');
    expect(cn('jx-hue-error', 'text-xs', 'jx-hue-neutral')).toBe('text-xs jx-hue-neutral');
  });
});

// migration locks (2026-08-27): the in-repo intent call sites ride the
// utilities. The arbitrary form survives only where a value sits
// outside the closed set (system-dialog-action's primary-pair escape
// hatch) or on slots with no utility layer (--jx-outline, --tok-*).
describe('hue-injection migration (in-repo call sites)', () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

  it.each([
    'src/lib/ui/system-dialog/system-dialog-action.svelte',
    '../../registry/files/ui/system-dialog/system-dialog-action.svelte',
  ])('%s ships the local destructive pair as jx-pair-destructive', (p) => {
    const src = read(p);
    // the PressButton era (floating-flesh-sweep): the pair rides as the
    // fill rung's local class injection — no local recipe exists
    expect(src).toContain("d.actionVariant === 'fill' ? 'jx-pair-destructive'");
    expect(src).not.toContain('[--jx-fill:var(--destructive)]');
    expect(src).not.toContain('[--jx-fill-ink:var(--destructive-foreground)]');
  });

  it.each([
    'src/lib/ui/inline-code/inline-code.svelte',
    '../../registry/files/ui/inline-code/inline-code.svelte',
  ])('%s ships the local neutral default as the tonal ATOM early slot (consumer-wins)', (p) => {
    const src = read(p);
    // tailwindless W1b: the neutral default rides the tonal ATOM's
    // '--jx-tonal' custom property (inline-code.stylex.ts) — the
    // consumer-wins contract unchanged: a consumer's arbitrary
    // [--jx-tonal:…] utility sorts after the atom tier and wins the
    // paint, the same resolution the cn dedupe used to deliver
    expect(src).toContain("VARIANT_ATOM[d.variant]");
    const atom = readFileSync(
      resolve(process.cwd(), p.replace(/inline-code\.svelte$/, 'inline-code.stylex.ts')),
      'utf8',
    );
    expect(atom).toContain("'--jx-tonal': 'var(--muted-foreground)'");
    expect(atom).toContain("backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)'");
    // the r2 blocker fix stays law: the utility form here would
    // outrank every consumer's arbitrary injection — never reintroduce
    expect(src).not.toContain("'jx-hue-neutral bg-[color-mix");
  });

  it('component sources teach the pair UTILITY, not the arbitrary destructive pair', () => {
    // r2 blocker: shipped headers presenting the retired arbitrary
    // pair would miss the structural pair law — the article's
    // deliberate escape-hatch demos are the only sanctioned spots
    const sources = [
      'src/lib/ui',
      '../../registry/files/ui',
      'src/lib/blueprints/scenes',
      'src/routes/docs/components',
    ].flatMap((dir) =>
      readdirSync(resolve(process.cwd(), dir), { recursive: true })
        .filter((f) => String(f).endsWith('.svelte') || String(f).endsWith('.ts'))
        .map((f) => resolve(process.cwd(), dir, String(f))),
    );
    const offenders = sources.filter(
      (f) =>
        !f.includes('variant-grammar.html') && // the article's escape-hatch demos
        /\[--jx-fill:var\(--destructive\)\]\s*\[--jx-fill-ink:var\(--destructive-foreground\)\]/.test(
          readFileSync(f, 'utf8'),
        ),
    );
    expect(offenders.map((f) => f.split('src/').pop() ?? f)).toEqual([]);
  });

  it('the feedback transients ride jx-hue-success', () => {
    const copyCommand = read('src/lib/copy-command.svelte');
    expect(copyCommand).toContain("'jx-hue-success'");
    expect(copyCommand).not.toContain('[--jx-tonal:var(--success)]');
    expect(read('src/lib/ui/hero-section/hero-section.svelte')).toContain("'jx-hue-success'");
  });

  it('the migrated mirror pairs stay byte-identical', () => {
    for (const rel of [
      'ui/system-dialog/system-dialog-action.svelte',
      'ui/inline-code/inline-code.svelte',
      'ui/hero-section/hero-section.svelte',
    ]) {
      expect(read(`src/lib/${rel}`), rel).toBe(read(`../../registry/files/${rel}`));
    }
  });
});
