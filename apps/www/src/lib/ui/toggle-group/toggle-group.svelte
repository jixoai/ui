<!--
  jixoai toggle group — the ROOT half, native-html edition
  (registry/files/ui/toggle-group/toggle-group.svelte).

  The joined segment row, NATIVE to the platform (native-contract-
  fusion, 2026-08-27): single mode rides label>input[type=radio]
  (name-scoped grouping: arrow-walk + ONE tab stop + native
  exclusivity), multiple rides label>input[type=checkbox] (native
  FormData repeated entries, DOM order). The paint law is the shared
  standard-layer `jx-html-tgroup` subtree utility (single-sourced
  in jixoai.css); this file owns ONLY the Svelte law.

  State: DOM `checked` is the uncontrolled truth; `value` (bindable)
  is a projection — DOM change updates it, external writes sync back,
  form.reset() re-syncs via the reset event (microtask, after the
  browser applies the default). The jx-form-field bridge is GONE:
  `name` participates natively (single REQUIRED — radio grouping is
  name-scoped; multiple optional opt-in). single does NOT support
  re-press clear (native radio semantics — an explicit none item is
  the pattern); `required` forwards to inputs in single mode only
  (at-least-one-of-many is the validation layer's job, not fake
  native semantics).

  Events: native forwarding (rest) and the value callback are
  SEPARATE — onchange from rest is invoked alongside the internal
  law, never instead of it (a spread cannot sever the value law).
  Keyboard/ARIA: role=radiogroup|group + the native input semantics;
  the old "arrow-walking is tabs' job" comment retired WITH the
  button implementation — native radio arrows walk the row.

  Composition-first (2026-08-25): the root owns state + the value
  law only — ToggleGroupItem parts render label+input pairs reading
  the group context; the caller's values ARE the identity.
-->
<script module lang="ts">
  /** the group's context surface: the value law's static frame */
  export interface ToggleGroupApi {
    readonly type: 'single' | 'multiple';
    /** the native form name — radio grouping is name-scoped */
    readonly name: string | undefined;
    /** group-level disable (native fieldset disable also applies) */
    readonly disabled: boolean;
    /** single mode: forward `required` to every input */
    readonly required: boolean;
    isActive(value: string): boolean;
  }

  /** context key — global symbol registry (independent registry items) */
  export const TOGGLE_GROUP_KEY = Symbol.for('jx-toggle-group');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
    /** form field name — REQUIRED for single (radio grouping), optional for multiple */
    name?: string;
    /** one value (single) or many (multiple) */
    type?: 'single' | 'multiple';
    /** active value(s); bindable (bind:value) for controlled use */
    value?: string | string[];
    disabled?: boolean;
    /** single mode only: native group-required forwards to every input */
    required?: boolean;
    density?: Density;
    'data-density'?: string;
    /** group landmark label — announced to assistive tech */
    label: string;
    class?: string;
    /** the value callback — fires whenever the projected value changes
     * (native change, external sync, form reset); native event
     * forwarding rides the spread props alongside, never instead */
    onValueChange?: (value: string | string[]) => void;
    /** native change forwarding — invoked ALONGSIDE the internal law */
    onchange?: (event: Event) => void;
    children: Snippet;
  }

  let {
    name,
    type = 'single',
    value = $bindable<string | string[]>([]),
    disabled = false,
    required = false,
    density,
    'data-density': _callerDensity,
    label,
    class: className = '',
    onValueChange,
    onchange,
    children,
    ...rest
  }: Props = $props();

  // init-time contract check, deliberately non-reactive (a mode/name
  // swap after mount cannot re-run it; the rendered inputs keep their
  // original grouping identity)
  // svelte-ignore state_referenced_locally
  if (type === 'single' && !name) {
    throw new Error(
      'jxoai toggle-group: single mode requires `name` — radio grouping and arrow-walking are name-scoped',
    );
  }

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  const activeValues = $derived(
    type === 'single'
      ? typeof value === 'string' && value !== ''
        ? [value]
        : []
      : Array.isArray(value)
        ? value
        : [],
  );

  setContext<ToggleGroupApi>(TOGGLE_GROUP_KEY, {
    get type() {
      return type;
    },
    get name() {
      return name;
    },
    get disabled() {
      return disabled;
    },
    get required() {
      return required && type === 'single';
    },
    isActive: (candidate) => activeValues.includes(candidate),
  });

  /** the projection target: read the uncontrolled truth off the DOM */
  function readDom(): string | string[] {
    const inputs = root?.querySelectorAll<HTMLInputElement>('label > input:checked') ?? [];
    const values = [...inputs].map((i) => i.value);
    return type === 'single' ? (values[0] ?? '') : values;
  }

  function project(next: string | string[]): void {
    value = next;
    onValueChange?.(next);
  }

  /** the internal law — bound AFTER the spread so it cannot be severed */
  function handleChange(event: Event): void {
    project(readDom());
    // native forwarding: the consumer's handler observes alongside
    onchange?.(event);
  }

  /** external value writes sync the DOM (diff-only: no blind loops) */
  $effect(() => {
    const inputs = root?.querySelectorAll<HTMLInputElement>('label > input');
    if (!inputs) return;
    for (const input of inputs) {
      const shouldBeChecked = activeValues.includes(input.value);
      if (input.checked !== shouldBeChecked) input.checked = shouldBeChecked;
    }
  });

  /** form.reset() restores initial checked natively (no change events
   * fire) — re-sync the projection once the browser has applied it */
  let root: HTMLDivElement | undefined = $state();
  $effect(() => {
    if (!root) return;
    const form = root.closest('form');
    form?.addEventListener('reset', onFormReset);
    return () => form?.removeEventListener('reset', onFormReset);
  });
  function onFormReset(): void {
    queueMicrotask(() => project(readDom()));
  }
</script>

<div
  bind:this={root}
  data-jx-tgroup
  data-density={resolvedDensity}
  class={cn('jx-tgroup', className)}
  {...rest}
  role={type === 'single' ? 'radiogroup' : 'group'}
  aria-label={label}
  onchange={handleChange}
>
  {@render children()}
</div>
