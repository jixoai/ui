/**
 * axis-controls — the page-side glue for schema-driven universal-axis
 * controls (explicit-props W4 4.1/4.2).
 *
 * The dock writes ONE record per axis into the canvas's bound
 * `values`: values[<axis>] is the enum row's mode/named lane ('auto',
 * a named step, or the 'number'/'query()' MODE steps),
 * values['<axis>:number'] the exact-number lane, and
 * values['<axis>:query'] the raw query() source. This module resolves
 * that record into the ONE typed lane a family prop takes — named
 * step verbatim, number verbatim, query() through parseQuerySource +
 * query() — with 'auto'/unset resolving to undefined (stamps
 * nothing, the ambient context flows).
 *
 * Site-side docs glue (beside schema2form, same layer); the canvas
 * KERNEL stays dependency-free, so this never joins the mirror.
 */
import { parseQuerySource, query } from '../universal-props-query.svelte';
import type { QueryResult } from '../universal-props.schema';
import type { ComponentMeta } from './ir';

/** the axis' named steps, straight from the meta's universal block */
export function axisStepsOf(meta: ComponentMeta, axis: string): readonly string[] | undefined {
  return meta.universal?.find((doc) => doc.axis === axis)?.namedSteps;
}

/**
 * Resolve one axis' control record into its lane value. The record is
 * validated against the meta's OWN enum before any value reaches the
 * typed return — the single internal cast is membership-checked
 * (runtime-safe by construction: the dock never writes off-enum, and
 * a hand-coerced record degrades to undefined, never to a bad lane).
 */
export function axisLaneOf<T extends string | number>(
  axis: string,
  steps: readonly string[] | undefined,
  values: Record<string, unknown> | undefined,
): T | QueryResult<T> | undefined {
  const mode = values?.[axis];
  if (mode === 'number') {
    const exact = values?.[`${axis}:number`];
    return typeof exact === 'number' ? (exact as T) : undefined;
  }
  if (mode === 'query()') {
    const source = values?.[`${axis}:query`];
    if (typeof source === 'string' && source.trim() !== '') {
      try {
        const parsed = parseQuerySource(source);
        const valid = Object.values(parsed.cases).every(
          (value) => typeof value === 'number' || steps?.includes(String(value)),
        );
        if (valid) return query(parsed.cases as Record<string, T>) as QueryResult<T>;
      } catch {
        return undefined; // the editor already flags the parse error
      }
    }
    return undefined;
  }
  if (typeof mode === 'string' && mode !== 'auto' && steps?.includes(mode)) {
    return mode as T;
  }
  return undefined;
}
