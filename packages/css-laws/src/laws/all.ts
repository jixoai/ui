/**
 * laws/all.ts — the law registry (single wiring point for the
 * generator and the test suite). Order = emission order in the
 * sheets: composed families first, dependents after their bases.
 */
import type { ComponentLaw } from '../types';
import { inputLaw } from './input';
import { textareaLaw } from './textarea';
import { selectLaw } from './select';
import { checkboxLaw } from './checkbox';
import { radioLaw } from './radio';
import { switchLaw } from './switch';
import { rangeLaw } from './range';
import { colorLaw } from './color';
import { tgroupLaw } from './tgroup';
import { clearLaw } from './clear';
import { controlLaw } from './control';
import { controlShellLaw } from './control-shell';
import { controlLaneLaw } from './control-lane';

export const allLaws: readonly ComponentLaw[] = [
  // text-like family (input is the base; textarea/select compose it)
  inputLaw,
  textareaLaw,
  selectLaw,
  // selection family (checkbox is the base; radio composes it)
  checkboxLaw,
  radioLaw,
  switchLaw,
  // standalone native repaints
  rangeLaw,
  colorLaw,
  // subtree law (the joined segment row)
  tgroupLaw,
  // the clear affordance
  clearLaw,
  // the control postures (single-box + wrapper/lane pair)
  controlLaw,
  controlShellLaw,
  controlLaneLaw,
];
