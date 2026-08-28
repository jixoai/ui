/**
 * @jixoai/css-laws — public API
 */
export type {
  Declarations,
  PseudoBuild,
  StateRule,
  MediaRule,
  SupportsRule,
  ComponentLaw,
  LawCollection,
  SerializeOptions,
  SerializedCSS,
} from './types';

export { serializeLaw, serializeCollection } from './serializers/core';

export { checkboxLaw } from './laws/checkbox';
export { rangeLaw } from './laws/range';
