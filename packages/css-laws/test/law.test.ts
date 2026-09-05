/**
 * law.test.ts v2 — REAL single-sourcing tests (Codex r1 review fix).
 *
 * The r1 tests verified the serializer against itself (same collect
 * path, selectors stripped) — a tautology that could not catch range
 * typos, selector corruption, scope leaks, or empty rules. These
 * tests parse the EMITTED CSS TEXT with an independent parser
 * (parse-css.ts, no shared code with the serializer) and compare
 * projections cross-format.
 */
import { describe, expect, it } from 'vitest';
import { serializeLaw, serializeCollection } from '../src/serializers/core';
import { composeLaw } from '../src/types';

import { inputLaw } from '../src/laws/input';
import { checkboxLaw } from '../src/laws/checkbox';
import { rangeLaw } from '../src/laws/range';
import { selectLaw } from '../src/laws/select';
import { radioLaw } from '../src/laws/radio';
import { controlLaw } from '../src/laws/control';
import { allLaws } from '../src/laws/all';
import { generateAll, COMPONENT_MOUNTS } from '../src/generate';
import { parseCSS, fingerprintMultiset, selectorParts } from './parse-css';

const laws = allLaws;

describe('dual-projection semantic equality (independent parser)', () => {
  for (const law of laws) {
    // laws without an elementSelector have NO face projection by
    // design (opt-in only: tgroup/clear/control family) — the face
    // comparison applies only where a face exists
    if (law.application.elementSelector) {
      it(`${law.name}: utility vs face fingerprints match`, () => {
        const utility = serializeLaw(law, { format: 'utility' }).css;
        const face = serializeLaw(law, { format: 'face' }).css;
        expect(fingerprintMultiset(face)).toEqual(fingerprintMultiset(utility));
      });
    } else {
      it(`${law.name}: no elementSelector → face output is EMPTY (opt-in only)`, () => {
        expect(serializeLaw(law, { format: 'face' }).css).toBe('');
      });
    }

    it(`${law.name}: alias projection shares the law's fingerprints`, () => {
      const utility = serializeLaw(law, { format: 'utility' }).css;
      const alias = serializeLaw(law, { format: 'alias' }).css;
      if (!alias) return; // laws without aliases emit nothing
      expect(fingerprintMultiset(alias)).toEqual(fingerprintMultiset(utility));
    });
  }
});

describe('face scope integrity (Codex: comma parts must not escape)', () => {
  it('every comma part of every scoped face selector carries the scope — INCLUDING inside @media/@supports', () => {
    for (const law of laws) {
      if (!law.application.scoped) continue;
      const face = serializeLaw(law, { format: 'face' }).css;
      for (const rule of parseCSS(face)) {
        // no preludes skip (Codex r2): inner selectors are built by
        // the same buildSelector — they must carry the scope too
        for (const part of selectorParts(rule.selector)) {
          expect(part.startsWith(':where(.jx-pure) '), `${law.name}: "${part}" escaped the scope`).toBe(true);
        }
      }
    }
  });

  it('a comma INSIDE elementSelector parts cannot escape (paren-aware split)', () => {
    const tricky: ComponentLaw = {
      ...inputLaw,
      application: {
        className: 'jx-html-test',
        elementSelector: "input:where(:not([type]), [type='text']):not(.no-jx-pure, .no-jx-pure *)",
        scoped: true,
      },
    };
    const face = serializeLaw(tricky, { format: 'face' }).css;
    for (const rule of parseCSS(face)) {
      for (const part of selectorParts(rule.selector)) {
        expect(part.startsWith(':where(.jx-pure) ')).toBe(true);
      }
    }
    // the :where(...) comma must survive INTACT (not split)
    expect(face).toContain("input:where(:not([type]), [type='text'])");
  });

  it('state commas expand with the anchor on every part', () => {
    const css = serializeLaw(checkboxLaw, { format: 'utility' }).css;
    expect(css).toContain('.jx-html-checkbox:checked, .jx-html-checkbox:indeterminate {');
  });
});

describe('no empty rules (Codex: empty declarations must be skipped)', () => {
  it('no rule block has zero declarations, in any projection', () => {
    const utilityAll = laws.map((l) => serializeLaw(l, { format: 'utility' }).css).join('\n');
    const faceAll = serializeCollection({ laws }, { format: 'face' });
    for (const css of [utilityAll, faceAll]) {
      for (const rule of parseCSS(css)) {
        expect(rule.declarations.length, `empty rule at "${rule.selector}"`).toBeGreaterThan(0);
      }
    }
  });
});

describe('custom-property hygiene', () => {
  it('no --j- typo (missing x) in any declaration value', () => {
    const scan = (law: ComponentLaw): string[] => {
      const css = [
        serializeLaw(law, { format: 'utility' }).css,
        serializeLaw(law, { format: 'face' }).css,
      ].join('\n');
      return [...css.matchAll(/var\(--j(?!x-)[a-z0-9-]*\)/g)].map((m) => m[0]);
    };
    for (const law of laws) {
      expect(scan(law), `${law.name} has --j- (missing x) references`).toEqual([]);
    }
  });
});

describe('law fidelity spot-checks (the r1 tests could not catch these)', () => {
  it('range: the geometry chain rides cqh', () => {
    const css = serializeLaw(rangeLaw, { format: 'utility' }).css;
    expect(css).toContain('--jx-range-thumb: 100cqh');
    expect(css).toContain('--jx-range-track: calc(100cqh / 2.5)');
    // the r1 typo (--j-range-thumb) must be gone
    expect(css).not.toContain('--j-range-thumb');
  });

  it('range: engine pseudos ride BARE (no @supports gate — source of truth)', () => {
    const css = serializeLaw(rangeLaw, { format: 'utility' }).css;
    expect(css).not.toContain('@supports');
    expect(css).toContain('::-webkit-slider-runnable-track');
    expect(css).toContain('::-moz-range-progress');
  });

  it('checkbox: the clip-path morphs are intact', () => {
    const css = serializeLaw(checkboxLaw, { format: 'utility' }).css;
    expect(css).toContain('polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%)');
    expect(css).toContain('polygon(10% 40%, 10% 60%, 45% 60%, 55% 60%, 90% 60%, 90% 40%)');
  });

  it('input: the 13-type allowlist face selector survives intact', () => {
    const face = serializeLaw(inputLaw, { format: 'face' }).css;
    const first = parseCSS(face)[0];
    expect(first.selector).toContain("[type='datetime-local']");
    expect(first.selector).toContain("[type='number']");
  });
});

describe('the well law (F-1 sweep, 2026-09-02)', () => {
  it('input: resting well; hover is intensity; focus never touches the shadow', () => {
    const css = serializeLaw(inputLaw, { format: 'utility' }).css;
    // resting: the base rule carries the well + the caret ink
    expect(css).toMatch(/\.jx-html-input \{[^}]*box-shadow: var\(--shadow-well\);/s);
    expect(css).toContain('caret-color: var(--primary)');
    // hover: same inset rung, deeper ink — the retired lift is gone
    expect(css).toContain('.jx-html-input:hover:not(:disabled) {\n  box-shadow: var(--shadow-well-hover);\n}');
    expect(css).not.toContain('shadow-2xs');
    // focus answers in border only — no shadow kill anywhere
    const focus = css.match(/\.jx-html-input:focus-visible \{[^}]*\}/s)?.[0] ?? '';
    expect(focus).toContain('border-color: var(--ring)');
    expect(focus).not.toContain('box-shadow');
    const disabled = css.match(/\.jx-html-input:disabled \{[^}]*\}/s)?.[0] ?? '';
    expect(disabled).not.toContain('box-shadow');
  });

  it('control: the same well law on the .jx-control twin', () => {
    const css = serializeLaw(controlLaw, { format: 'utility' }).css;
    expect(css).toMatch(/\.jx-html-control \{[^}]*box-shadow: var\(--shadow-well\);/s);
    expect(css).toContain('.jx-html-control:hover {\n  box-shadow: var(--shadow-well-hover);\n}');
    expect(css).not.toContain('shadow-2xs');
    const focus = css.match(/\.jx-html-control:focus-visible \{[^}]*\}/s)?.[0] ?? '';
    expect(focus).toContain('border-color: var(--ring)');
    expect(focus).not.toContain('box-shadow');
  });
});

describe('the component-mount projection (E-1, 2026-09-02)', () => {
  const RANGE_ANCHOR = '[data-jx-range]:not(.no-jx-pure, .no-jx-pure *)';

  it('range: every rule hangs off the component hook, opt-out included', () => {
    const css = serializeLaw(rangeLaw, { format: 'mount', mountAnchor: RANGE_ANCHOR }).css;
    expect(css).toBeTruthy();
    for (const rule of parseCSS(css)) {
      for (const part of selectorParts(rule.selector)) {
        expect(
          part.startsWith(RANGE_ANCHOR),
          `"${part}" escaped the component hook`,
        ).toBe(true);
      }
    }
    // the engine pseudos and the rtl mirror ride along
    expect(css).toContain('::-webkit-slider-thumb');
    expect(css).toContain(':dir(rtl)::-webkit-slider-thumb');
  });

  it('mount shares the law declaration fingerprints with the utility projection', () => {
    const mount = serializeLaw(rangeLaw, { format: 'mount', mountAnchor: RANGE_ANCHOR }).css;
    const utility = serializeLaw(rangeLaw, { format: 'utility' }).css;
    expect(fingerprintMultiset(mount)).toEqual(fingerprintMultiset(utility));
  });

  it('a mountAnchor-less law projects to NOTHING (anchorless, like the alias path)', () => {
    expect(serializeLaw(rangeLaw, { format: 'mount' }).css).toBe('');
  });

  it('generateAll: the mount sheet rides @layer components and is byte-stable', () => {
    const a = generateAll(allLaws);
    const b = generateAll(allLaws);
    for (const mount of COMPONENT_MOUNTS) {
      const sheet = a.mountSheets[mount.slot];
      expect(sheet, `slot ${mount.slot} missing`).toBeTruthy();
      expect(sheet).toBe(b.mountSheets[mount.slot]); // byte-stable
      expect(sheet.startsWith('@layer components {')).toBe(true);
      expect(sheet).toContain(`${mount.anchor} {`);
    }
    // every declared mount names a real law (the run() wiring contract)
    for (const mount of COMPONENT_MOUNTS) {
      expect(allLaws.some((l) => l.name === mount.law), `law "${mount.law}" not found`).toBe(true);
    }
  });
});

describe('range RTL fill mirror (E-2, 2026-09-02)', () => {
  it('the :dir(rtl) thumb rule reverses the physical x-offset', () => {
    const css = serializeLaw(rangeLaw, { format: 'utility' }).css;
    const rtl = css.match(/:dir\(rtl\)::-webkit-slider-thumb \{[^}]*\}/s)?.[0] ?? '';
    expect(rtl).toContain('calc(100cqw + var(--jx-range-thumb) / 2)');
    // the base fill still paints toward the physical left (LTR start)
    expect(css).toContain('calc(-100cqw - var(--jx-range-thumb) / 2)');
  });

  it('the mirror rides AFTER the base thumb rule (stable order at the default rung)', () => {
    const css = serializeLaw(rangeLaw, { format: 'utility' }).css;
    const base = css.indexOf('.jx-html-range::-webkit-slider-thumb');
    const rtl = css.indexOf('.jx-html-range:dir(rtl)::-webkit-slider-thumb');
    expect(base).toBeGreaterThan(-1);
    expect(rtl).toBeGreaterThan(base);
  });
});

describe('composeLaw — the retired @apply chain, in TS', () => {
  it('delta declarations win; base declarations carry', () => {
    const textarea = composeLaw(inputLaw, {
      name: 'textarea-test',
      base: {
        'min-height': 'var(--jx-textarea-min, 5rem)',
        height: 'auto',
        resize: 'vertical',
      },
      application: {
        className: 'jx-html-textarea-test',
        elementSelector: 'textarea:not(.no-jx-pure, .no-jx-pure *)',
        scoped: true,
      },
    });
    const css = serializeLaw(textarea, { format: 'utility' }).css;
    expect(css).toContain('resize: vertical');
    expect(css).toContain('min-height: var(--jx-textarea-min, 5rem)');
    // input's base carried through (the ruler's inset token, Owner 2026-09-05)
    expect(css).toContain('padding-inline: var(--jx-inset, 0.75rem)');
    // pseudo + media carried through
    expect(css).toContain('::placeholder');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});

describe('byte stability (idempotent generation)', () => {
  it('serializing twice yields identical bytes', () => {
    for (const law of laws) {
      const a = serializeLaw(law, { format: 'utility' }).css;
      const b = serializeLaw(law, { format: 'utility' }).css;
      expect(a).toBe(b);
    }
  });
});

describe('cascade order (Codex r2 P0 — source order decides equal specificity)', () => {
  it('select: the listbox override emits AFTER the @supports chevron gate', () => {
    const css = serializeLaw(selectLaw, { format: 'utility' }).css;
    const supportsIdx = css.indexOf('@supports not selector(::-moz-range-progress)');
    const listboxIdx = css.indexOf('background-image: none');
    expect(supportsIdx).toBeGreaterThan(-1);
    expect(listboxIdx).toBeGreaterThan(-1);
    expect(
      listboxIdx,
      'the listbox background-image: none must come after the @supports chevron block',
    ).toBeGreaterThan(supportsIdx);
  });

  it('select: the same order holds in EVERY projection (face, alias path n/a — no alias)', () => {
    for (const format of ['utility', 'face'] as const) {
      const css = serializeLaw(selectLaw, { format }).css;
      expect(
        css.indexOf('background-image: none'),
        `${format}: listbox override must trail the supports gate`,
      ).toBeGreaterThan(css.indexOf('@supports not selector(::-moz-range-progress)'));
    }
  });

  it('radio: the ::before kill survives the checkbox compose (content: none wins the base; the checked morph carries)', () => {
    const css = serializeLaw(radioLaw, { format: 'utility' }).css;
    // base ::before overridden to content:none by radio's delta
    expect(css).toMatch(/\.jx-html-radio::before \{[^}]*content: none/s);
    // the ::after dot + its checked scale carry intact
    expect(css).toContain('.jx-html-radio:checked::after');
    expect(css).toContain('transform: scale(1)');
    // checkbox's ::before morphs carry (dead paint under content:none —
    // exactly the V2 cascade; they must not silently disappear)
    expect(css).toContain('.jx-html-radio:checked::before');
    expect(css).toContain('.jx-html-radio:indeterminate::before');
  });
});

describe('nested order (Codex r3b hardening — order works on subtree/media/supports nodes too)', () => {
  it('media rules emit sorted by explicit order, not array position', () => {
    const law = {
      ...checkboxLaw,
      media: [
        {
          query: '(prefers-reduced-motion: reduce)',
          rules: [
            { selector: '', order: 2, declarations: { transition: 'none' } },
            { selector: '::before', order: 1, declarations: { transition: 'none' } },
          ],
        },
      ],
    } as typeof checkboxLaw;
    const css = serializeLaw(law, { format: 'utility' }).css;
    const inMedia = css.slice(css.indexOf('@media'));
    // order 1 (::before) emits before order 2 (base) inside the block
    expect(inMedia.indexOf('.jx-html-checkbox::before')).toBeGreaterThan(-1);
    expect(inMedia.indexOf('.jx-html-checkbox::before')).toBeLessThan(inMedia.indexOf('.jx-html-checkbox {'));
  });

  it('supports states emit sorted by explicit order', () => {
    const law = {
      ...rangeLaw,
      supports: [
        {
          condition: 'selector(::-webkit-slider-runnable-track)',
          states: [
            { selector: '::-webkit-slider-thumb', order: 1, declarations: { width: 'var(--jx-range-thumb)' } },
            { selector: '::-webkit-slider-runnable-track', order: 2, declarations: { height: 'var(--jx-range-track)' } },
          ],
        },
      ],
    } as typeof rangeLaw;
    const css = serializeLaw(law, { format: 'utility' }).css;
    const gate = css.slice(css.indexOf('@supports'));
    // match the RULE selectors — the @supports condition itself names
    // the track pseudo, so bare pseudo search would hit the condition
    expect(gate.indexOf('.jx-html-range::-webkit-slider-thumb')).toBeLessThan(
      gate.indexOf('.jx-html-range::-webkit-slider-runnable-track'),
    );
  });
});

describe('anchorless projections (a law with no aliases emits NOTHING in alias mode)', () => {
  it('input (no aliases): alias output is empty — no orphan rules, no orphan @media', () => {
    const alias = serializeLaw(inputLaw, { format: 'alias' }).css;
    expect(alias).toBe('');
  });

  it('every emitted rule has a non-empty selector in EVERY projection', () => {
    for (const law of laws) {
      for (const format of ['utility', 'face', 'alias'] as const) {
        const css = serializeLaw(law, { format }).css;
        for (const rule of parseCSS(css)) {
          expect(
            rule.selector.trim().length,
            `${law.name}/${format}: orphan rule "${JSON.stringify(rule.selector)}"`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});
