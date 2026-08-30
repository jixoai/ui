/**
 * Terminal patterns contract suite (test/terminal-patterns.spec.ts,
 * 2026-08-30, openspec/changes/2026-08-30-terminal-patterns).
 *
 * Patterns are composition-only items: the five folders compose the
 * atoms they declare (tasks 4b closure) and never re-implement atom
 * behavior. This suite locks both halves:
 *
 *   1. the DECLARED closure vs the actual cross-item imports — a
 *      local mirror of verify:deps semantics over the five pattern
 *      folders (registry.json itself is the integrator's shared file;
 *      the contract is pinned here from the tasks-4b tables so the
 *      gate has teeth in the same commit as the sources)
 *   2. the per-pattern behavior: login password reveal rides the
 *      INPUT's own toggle (NO pattern-local fallback — a hard F1
 *      prerequisite), the OTP second factor commits the joined code,
 *      pricing's recommended column keeps its opt-in paint hook, the
 *      three hero forms render, the FAQ accordion opens/closes under
 *      the exclusive guard, the CTA band copies its command.
 *
 * jsdom runs no layout or media queries: assertions read attributes,
 * semantics and source-level probes (the marquee reduced-motion law),
 * never geometry.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PatternLoginHost from './fixtures/pattern-login-host.svelte';
import PatternLoginOtpHost from './fixtures/pattern-login-otp-host.svelte';
import PatternPricingHost from './fixtures/pattern-pricing-host.svelte';
import PatternHeroHost from './fixtures/pattern-hero-host.svelte';
import PatternFaqHost from './fixtures/pattern-faq-host.svelte';
import PatternCtaHost from './fixtures/pattern-cta-host.svelte';

// docs routes compile-gate: importing the page modules compiles every
// svelte file (the CATALOG fail-loud check lives in the INSTANCE
// script — it fires at render time, after registry.json lands)
import * as patternLoginPage from '../src/routes/docs/components/pattern-login.html/+page.svelte';
import * as patternPricingPage from '../src/routes/docs/components/pattern-pricing.html/+page.svelte';
import * as patternHeroSetPage from '../src/routes/docs/components/pattern-hero-set.html/+page.svelte';
import * as patternFaqPage from '../src/routes/docs/components/pattern-faq.html/+page.svelte';
import * as patternCtaPage from '../src/routes/docs/components/pattern-cta.html/+page.svelte';
import * as patternsGallery from '../src/routes/patterns.html/+page.svelte';
import { load as loginLoad } from '../src/routes/docs/components/pattern-login.html/+page.ts';
import { load as faqLoad } from '../src/routes/docs/components/pattern-faq.html/+page.ts';

// barrel compile-gate (folder law): default = the canonical main,
// sub-components as named defaults
import * as loginBarrel from '../src/lib/ui/pattern-login/index.ts';
import * as pricingBarrel from '../src/lib/ui/pattern-pricing/index.ts';
import * as heroSetBarrel from '../src/lib/ui/pattern-hero-set/index.ts';
import * as faqBarrel from '../src/lib/ui/pattern-faq/index.ts';
import * as ctaBarrel from '../src/lib/ui/pattern-cta/index.ts';

// jsdom ships no clipboard (the copy path falls back) and no execCommand
document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand;

const writeText = vi.fn(() => Promise.resolve());
beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

// ---------------------------------------------------------------------------
// 1. the declared atom closure (tasks 4b) vs the actual imports
// ---------------------------------------------------------------------------
const here = dirname(fileURLToPath(import.meta.url));
const uiRoot = resolve(here, '../src/lib/ui');

/** tasks 4b: the DIRECT atom closure each pattern declares — the exact
 *  registryDependencies list the integrator applies to registry.json
 *  (`@jixoai/jixoai-theme` is the structured install prerequisite:
 *  declared, never imported — PASS by design in verify:deps) */
const DECLARED: Record<string, { deps: string[]; theme: true }> = {
  'pattern-login': { deps: ['input', 'input-otp', 'press-button', 'icons'], theme: true },
  'pattern-pricing': { deps: ['table', 'code-card', 'press-button', 'badge', 'icons'], theme: true },
  'pattern-hero-set': { deps: ['hero-section', 'terminal-card', 'press-button', 'icons'], theme: true },
  'pattern-faq': { deps: ['accordion', 'icons'], theme: true },
  'pattern-cta': { deps: ['press-button', 'code-card', 'icons'], theme: true },
};

/** cross-item owners reachable from a $lib import spec (folder law:
 * ui items map 1:1 to their folder; $lib/icons is the icons item) */
function ownerOfSpec(spec: string): string | null {
  if (spec === '$lib/icons') return 'icons';
  const ui = /^\$lib\/ui\/([^/]+)\//.exec(spec);
  return ui ? ui[1] : null;
}

function folderImports(item: string): { file: string; specs: string[] }[] {
  const dir = resolve(uiRoot, item);
  return readdirSync(dir)
    .filter((f) => /\.(svelte|ts|css)$/.test(f))
    .map((file) => {
      const content = readFileSync(resolve(dir, file), 'utf8');
      const specs = content.match(/['"]\$lib\/[^'"]+['"]/g)?.map((s) => s.slice(1, -1)) ?? [];
      return { file, specs };
    });
}

describe('terminal patterns — the declared atom closure', () => {
  for (const [item, { deps }] of Object.entries(DECLARED)) {
    it(`${item}: target-resolved imports equal the declared edges (no more, no less)`, () => {
      const imported = new Set<string>();
      for (const { specs } of folderImports(item)) {
        for (const spec of specs) {
          const owner = ownerOfSpec(spec);
          // same-folder + unowned $lib files (utils, density…) are
          // undeclared cross-item edges — they must not appear at all
          if (owner === null && spec.startsWith('$lib/')) {
            throw new Error(`${item} imports ${spec} — an item-owned lib file outside its declared closure`);
          }
          if (owner && owner !== item) imported.add(owner);
        }
      }
      expect([...imported].sort()).toEqual([...deps].sort());
    });
  }

  it('no pattern re-implements atom paint: the reveal toggle belongs to the input shell', () => {
    const login = readFileSync(resolve(uiRoot, 'pattern-login/pattern-login.svelte'), 'utf8');
    // the reveal toggle belongs to the input shell — a pattern-local
    // class of that name would be the forbidden fallback
    expect(login).not.toContain('jx-input-reveal');
    // and no pattern folder ships a component-owned class of another
    // item's css (the atom paint duplication trap)
    const atomClasses = ['jx-cursor', 'jx-press ', 'jx-out', 'jx-acc-summary'];
    for (const item of Object.keys(DECLARED)) {
      for (const { file, content } of folderImports(item).map((f) => ({
        file: f.file,
        content: readFileSync(resolve(uiRoot, item, f.file), 'utf8'),
      }))) {
        for (const cls of atomClasses) {
          expect(content, `${item}/${file} must not re-implement ${cls.trim()}`).not.toContain(cls);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 1b. the docs routes compile + the gallery is gallery-only
// ---------------------------------------------------------------------------
describe('terminal patterns — docs routes', () => {
  const pages = [
    ['pattern-login', patternLoginPage],
    ['pattern-pricing', patternPricingPage],
    ['pattern-hero-set', patternHeroSetPage],
    ['pattern-faq', patternFaqPage],
    ['pattern-cta', patternCtaPage],
    ['patterns gallery', patternsGallery],
  ] as const;

  it('every docs route module compiles (the five canonical pages + the gallery)', () => {
    for (const [name, mod] of pages) {
      void name;
      expect(mod).toBeTruthy();
    }
  });

  it('the barrels keep the folder-law shape (default + named sub-components)', () => {
    expect(loginBarrel.default).toBeTruthy();
    expect(loginBarrel.PatternLoginOtp).toBeTruthy();
    expect(heroSetBarrel.default).toBeTruthy();
    expect(heroSetBarrel.PatternHeroAscii).toBeTruthy();
    expect(heroSetBarrel.PatternHeroMarquee).toBeTruthy();
    expect(pricingBarrel.default).toBeTruthy();
    expect(faqBarrel.default).toBeTruthy();
    expect(ctaBarrel.default).toBeTruthy();
  });

  it('the canonical toc loads carry their section spines', () => {
    expect(loginLoad().toc.map((s) => s.id)).toEqual([
      'demo',
      'otp',
      'usage',
      'accessibility',
      'api',
    ]);
    expect(faqLoad().toc.map((s) => s.id)).toEqual(['demo', 'composition', 'usage', 'api']);
  });

  it('the gallery routes ONLY to the canonical pages (no docs body of its own)', () => {
    const gallery = readFileSync(
      resolve(uiRoot, '../../routes/patterns.html/+page.svelte'),
      'utf8',
    );
    // five canonical hrefs, derived from the catalog entry — no
    // hand-written pattern docs inside the gallery file
    for (const name of Object.keys(DECLARED)) {
      expect(gallery).toContain(`'${name}'`);
    }
    expect(gallery).toContain('card.href');
  });
});

// ---------------------------------------------------------------------------
// 2. pattern-login — the ssh card
// ---------------------------------------------------------------------------
describe('pattern-login', () => {
  it('renders the ssh echo line from the composed user@host', () => {
    const { container } = render(PatternLoginHost);
    const echo = container.querySelector('[data-jx-pattern-login-echo] p')!;
    expect(echo.textContent).toContain('$');
    expect(echo.textContent).toContain('ssh user@jixoai.dev'); // empty lane → 'user'
  });

  it('typing the user lane updates the echo live (bindable mirror)', async () => {
    const { container } = render(PatternLoginHost);
    const user = container.querySelector<HTMLInputElement>('input[name="user"]')!;
    await fireEvent.input(user, { target: { value: 'operator' } });
    expect(container.querySelector('[data-jx-pattern-login-echo] p')!.textContent).toContain(
      'ssh operator@jixoai.dev',
    );
  });

  it('carries the ssh glyphs in the innerInlineStart slots of user/host lanes', () => {
    const { container } = render(PatternLoginHost);
    const shells = [...container.querySelectorAll('.jx-html-control-shell')];
    expect(shells.length).toBeGreaterThanOrEqual(3);
    expect(shells[0].textContent).toContain('user@');
    expect(shells[1].textContent).toContain('--host=');
  });

  it('labels every lane (label[for] survives — the a11y lane law)', () => {
    const { container } = render(PatternLoginHost);
    for (const name of ['user', 'host', 'password']) {
      const input = container.querySelector(`input[name="${name}"]`)!;
      const label = container.querySelector(`label[for="${input.id}"]`);
      expect(label, `the ${name} lane keeps its label`).toBeTruthy();
    }
  });

  it('the passphrase reveal is the INPUT\'s own — no pattern-local fallback', async () => {
    const { container } = render(PatternLoginHost);
    const password = container.querySelector<HTMLInputElement>('input[name="password"]')!;
    const eye = container.querySelector<HTMLButtonElement>('.jx-input-reveal')!;

    // the eye belongs to the input shell, inside the pattern card
    expect(eye.closest('.jx-html-control-shell')).toBeTruthy();
    expect(eye.closest('[data-jx-pattern-login]')).toBeTruthy();
    // and it is the ONLY password-visibility control the card renders
    const toggles = [...container.querySelectorAll('button')].filter((b) =>
      /password/i.test(b.getAttribute('aria-label') ?? ''),
    );
    expect(toggles).toEqual([eye]);

    expect(password.getAttribute('type')).toBe('password');
    expect(eye.getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(eye);
    expect(password.getAttribute('type')).toBe('text');
    expect(eye.getAttribute('aria-pressed')).toBe('true');
    expect(eye.getAttribute('aria-label')).toBe('hide password');
    await fireEvent.click(eye);
    expect(password.getAttribute('type')).toBe('password');
  });

  it('submit fires onsignin once and never navigates (preventDefault)', async () => {
    const onsignin = vi.fn();
    const { container } = render(PatternLoginHost, { props: { onsignin } });
    const form = container.querySelector('form')!;
    await fireEvent.submit(form);
    expect(onsignin).toHaveBeenCalledTimes(1);
  });

  it('the bootstrap footer shows and copies the init command', async () => {
    const { container } = render(PatternLoginHost, {
      props: { command: 'npx jixoai-ui init --hue 210' },
    });
    const boot = container.querySelector('[data-jx-pattern-login-boot]')!;
    expect(boot.textContent).toContain('npx jixoai-ui init --hue 210');
    const copy = [...boot.querySelectorAll('button')][0];
    await fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith('npx jixoai-ui init --hue 210');
    expect(boot.textContent).toContain('copied');
  });
});

describe('pattern-login — the OTP second factor', () => {
  it('commits the joined code through the verify step', async () => {
    const onverify = vi.fn();
    const { container } = render(PatternLoginOtpHost, { props: { onverify } });
    const slots = [...container.querySelectorAll('[data-jx-otp-slots] input')];
    expect(slots.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      await fireEvent.input(slots[i], { target: { value: String(i + 1) } });
    }
    await fireEvent.submit(container.querySelector('form')!);
    expect(onverify).toHaveBeenCalledWith('123456');
  });

  it('renders the host echo and the man-style footer line', () => {
    const { container } = render(PatternLoginOtpHost, { props: { onverify: () => {} } });
    expect(container.querySelector('[data-jx-pattern-login-echo] p')!.textContent).toContain(
      'otp --verify --host jixoai.dev',
    );
    expect(container.querySelector('[data-jx-pattern-login-boot]')!.textContent).toContain(
      'incomplete codes submit empty',
    );
  });
});

// ---------------------------------------------------------------------------
// 3. pattern-pricing — the comparison section
// ---------------------------------------------------------------------------
describe('pattern-pricing', () => {
  it('rides the table family: consumer thead/tbody intact inside the figure frame', () => {
    const { container } = render(PatternPricingHost);
    const figure = container.querySelector('figure.jx-table')!;
    expect(figure).toBeTruthy();
    const table = figure.querySelector('table')!;
    expect(table.querySelectorAll('thead th').length).toBe(4);
    expect(table.querySelectorAll('tbody tr').length).toBe(3);
    expect(table.querySelector('caption')!.textContent).toContain('plans — feature matrix');
  });

  it('the recommended column keeps its opt-in paint hook (th AND td)', () => {
    const { container } = render(PatternPricingHost);
    expect(container.querySelector('thead th[data-jx-recommended]')).toBeTruthy();
    expect(container.querySelectorAll('tbody td[data-jx-recommended]').length).toBe(3);
  });

  it('one code-card per tier with its install command; the recommended tier is stamped', () => {
    const { container } = render(PatternPricingHost);
    const cards = [...container.querySelectorAll('[data-jx-pattern-pricing-tier]')];
    expect(cards.length).toBe(3);
    expect(cards[1].getAttribute('data-jx-pattern-pricing-tier')).toBe('recommended');
    const codes = cards.map((c) => c.querySelector('pre')!.textContent);
    expect(codes[0]).toContain('npx jixoai-ui add --tier solo');
    expect(codes[1]).toContain('npx jixoai-ui add --tier team');
    // the plan labels ride Badge (fill rung on the recommended tier)
    expect(cards[1].querySelector('[data-jx-badge="fill"]')!.textContent).toContain('team');
    expect(cards[0].querySelector('[data-jx-badge="outline"]')!.textContent).toContain('solo');
  });

  it('the tier copy control copies that tier\'s command', async () => {
    const { container } = render(PatternPricingHost);
    const card = container.querySelectorAll('[data-jx-pattern-pricing-tier]')[1];
    const copy = card.querySelector('button')!;
    await fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith('npx jixoai-ui add --tier team');
    expect(card.textContent).toContain('copied');
  });
});

// ---------------------------------------------------------------------------
// 4. pattern-hero-set — three forms of the same landing grammar
// ---------------------------------------------------------------------------
describe('pattern-hero-set', () => {
  it('the terminal form: hero lead + the prewired terminal-card column', () => {
    const { container } = render(PatternHeroHost, {
      props: { copyCommand: 'npx jixoai-ui init --hue 210' },
    });
    const form = container.querySelector('[data-hero-form="terminal"]')!;
    expect(form.querySelector('h1[data-jx-hero-title]')!.textContent).toContain(
      'Ship the registry into your repo.',
    );
    const terminal = form.querySelector('[data-jx-terminal]')!;
    expect(terminal).toBeTruthy();
    expect(terminal.textContent).toContain('quick-start — zsh'); // the bar title
  });

  it('the ascii form: the banner payload renders whitespace-preserved in a pre', () => {
    const { container } = render(PatternHeroHost);
    const art = container.querySelector('[data-hero-form="ascii"] pre[data-jx-hero-ascii-art]')!;
    expect(art).toBeTruthy();
    expect(art.textContent).toContain('_ _ _ ___');
    expect(art.textContent).toContain('GitHub-style banner');
  });

  it('the marquee form: the readable row plus the aria-hidden duplicate', () => {
    const { container } = render(PatternHeroHost);
    const strip = container.querySelector('[data-jx-hero-marquee-strip]')!;
    const rows = [...strip.querySelectorAll('ul')];
    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute('aria-hidden')).toBeNull();
    expect(rows[1].getAttribute('aria-hidden')).toBe('true');
    for (const token of ['oklch tokens', 'zero-dep atoms', 'svelte 5', 'press law']) {
      expect(rows[0].textContent).toContain(token);
      expect(rows[1].textContent).toContain(token);
    }
  });

  it('the marquee reduced-motion law: the animation dies and the duplicate folds away (source probe)', () => {
    const css = readFileSync(resolve(uiRoot, 'pattern-hero-set/pattern-hero-set.css'), 'utf8');
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion'));
    expect(reduced).toContain('animation: none');
    expect(reduced).toContain("ul[aria-hidden='true']");
    expect(reduced).toContain('display: none');
  });
});

// ---------------------------------------------------------------------------
// 5. pattern-faq — the man page
// ---------------------------------------------------------------------------
describe('pattern-faq', () => {
  it('renders the man head and the NAME leader row', () => {
    const { container } = render(PatternFaqHost);
    const head = container.querySelector('[data-jx-pattern-faq] > header')!;
    expect(head.textContent).toContain('jixoai-ui-faq');
    expect(head.textContent).toContain('(7)');
    const name = container.querySelector('[data-jx-pattern-faq-name]')!;
    expect(name.textContent).toContain('NAME');
    // the dotted leader is the pseudo-element: the box exists, empty
    expect(name.querySelector('.jx-man-leader')).toBeTruthy();
  });

  it('the questions ride native details/summary inside the accordion group', () => {
    const { container } = render(PatternFaqHost);
    const group = container.querySelector('.jx-accordion')!;
    const details = [...group.querySelectorAll('details')];
    expect(details.length).toBe(3);
    expect(details[0].querySelector('summary')!.textContent).toContain('what is a pattern?');
    expect(details.every((d) => !d.open)).toBe(true);
  });

  it('opens and closes; the exclusive guard closes the first when the second opens', () => {
    const { container } = render(PatternFaqHost);
    const [one, two] = [...container.querySelectorAll('.jx-accordion details')];

    // jsdom does not drive <details> toggling: set the state, then fire
    // the same ToggleEvent the browser would
    one.open = true;
    one.dispatchEvent(new ToggleEvent('toggle', { newState: 'open' }));
    expect(one.open).toBe(true);

    two.open = true;
    two.dispatchEvent(new ToggleEvent('toggle', { newState: 'open' }));
    expect(two.open).toBe(true);
    expect(one.open).toBe(false); // closed by the exclusive guard

    two.open = false;
    two.dispatchEvent(new ToggleEvent('toggle', { newState: 'closed' }));
    expect(two.open).toBe(false);
  });

  it('the SEE ALSO row renders the default line', () => {
    const { container } = render(PatternFaqHost);
    expect(container.querySelector('[data-jx-pattern-faq-see-also]')!.textContent).toContain(
      'jixoai-ui(1), patterns(7)',
    );
  });
});

// ---------------------------------------------------------------------------
// 6. pattern-cta — the shell-prompt band
// ---------------------------------------------------------------------------
describe('pattern-cta', () => {
  it('renders the heading and the command in a code-card', () => {
    const { container } = render(PatternCtaHost, {
      props: { command: 'npx jixoai-ui add pattern-cta press-button code-card' },
    });
    expect(container.querySelector('h2[data-jx-cta-title]')!.textContent).toContain(
      'ship it from your terminal',
    );
    const pre = container.querySelector('[data-jx-pattern-cta] pre')!;
    expect(pre.textContent).toContain('npx jixoai-ui add pattern-cta press-button code-card');
  });

  it('the card\'s own copy control is retired — the band owns ONE copy affordance', () => {
    const { container } = render(PatternCtaHost);
    expect(container.querySelector('.jx-code-card-copy')).toBeNull();
    const pressButtons = [...container.querySelectorAll('[data-jx-press-button]')];
    expect(pressButtons.length).toBe(1); // the copy CTA alone
  });

  it('copies the command and flips to the copied surface (press physics stays the button\'s)', async () => {
    const { container } = render(PatternCtaHost, {
      props: { command: 'npx jixoai-ui add pattern-cta' },
    });
    const cta = container.querySelector<HTMLButtonElement>('[data-jx-press-button="fill"]')!;
    await fireEvent.click(cta);
    expect(writeText).toHaveBeenCalledWith('npx jixoai-ui add pattern-cta');
    expect(cta.getAttribute('aria-label')).toContain('copied');
    expect(cta.textContent).toContain('copied');
  });
});
