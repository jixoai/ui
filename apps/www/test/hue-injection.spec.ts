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
  it('the theme sheet carries every @utility of the closed set', () => {
    for (const hue of HUES) {
      expect(sheet, `@utility jx-hue-${hue}`).toMatch(
        new RegExp(`@utility jx-hue-${hue} \\{ --jx-tonal: ${HUE_TARGET[hue].replace(/[()]/g, '\\$&')}; \\}`),
      );
    }
    expect(sheet).toContain(
      '@utility jx-pair-destructive {\n  --jx-fill: var(--destructive);\n  --jx-fill-ink: var(--destructive-foreground);\n}',
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
    expect(sheet).not.toContain('@utility jx-hue-destructive');
  });

  it('the @utility jx-* set is EXACTLY the closed set (no unlisted additions)', () => {
    const declared = [...sheet.matchAll(/@utility (jx-[a-z-]+(?:-[a-z-]+)*)/g)].map((m) => m[1]);
    expect(declared.sort()).toEqual(
      [
        'jx-hue-primary',
        'jx-hue-neutral',
        'jx-hue-error',
        'jx-hue-success',
        'jx-hue-warning',
        'jx-hue-info',
        'jx-pair-destructive',
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
// outside the closed set (alert-dialog-action's primary-pair escape
// hatch) or on slots with no utility layer (--jx-outline, --tok-*).
describe('hue-injection migration (in-repo call sites)', () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

  it.each([
    'src/lib/ui/alert-dialog/alert-dialog-action.svelte',
    '../../registry/files/ui/alert-dialog/alert-dialog-action.svelte',
  ])('%s ships the local destructive pair as jx-pair-destructive', (p) => {
    const src = read(p);
    expect(src).toContain('jx-pair-destructive forced-colors:bg-[ButtonFace]');
    expect(src).not.toContain('[--jx-fill:var(--destructive)]');
    expect(src).not.toContain('[--jx-fill-ink:var(--destructive-foreground)]');
  });

  it.each([
    'src/lib/ui/inline-code/inline-code.svelte',
    '../../registry/files/ui/inline-code/inline-code.svelte',
  ])('%s ships the local neutral default as the ARBITRARY early slot (consumer-wins)', (p) => {
    const src = read(p);
    expect(src).toContain(
      "'[--jx-tonal:var(--muted-foreground)] bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]",
    );
    // the r2 blocker fix: the utility form here would outrank every
    // consumer's arbitrary injection — the early slot is the contract
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
      'ui/alert-dialog/alert-dialog-action.svelte',
      'ui/inline-code/inline-code.svelte',
      'ui/hero-section/hero-section.svelte',
    ]) {
      expect(read(`src/lib/${rel}`), rel).toBe(read(`../../registry/files/${rel}`));
    }
  });
});
