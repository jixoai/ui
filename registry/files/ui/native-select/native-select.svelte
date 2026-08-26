<!--
  jixoai native-select (registry/files/ui/native-select.svelte).
  The SIMPLE-SCENARIO recommendation of the form family: form submission
  (a real name/value pair rides into FormData) and mobile (the platform's
  overlay picker beats any custom panel on touch). The native <select>
  stays fully native — the popup list, keyboard navigation, and type-ahead
  belong to the platform. The only paint is on the closed control:
  appearance-none strips the UA chrome and an absolutely-positioned inline
  SVG chevron (the same chevron path as language-switcher) stands in; the
  option popup keeps its native rendering (color-scheme follows the site
  theme). For a description-rich, fully styled listbox see select.svelte
  (the Popover-based sibling); reach for that one only when the native
  popup can't say what you need.

  Same semantics law as input.svelte: label[for] block (auto id via
  $props.id()), error string → aria-invalid + aria-describedby +
  "! message" line + dashed border, inset 1px focus-visible outline on
  the ring token, hover lifts one pixel. `value` is $bindable (bound ⇒
  controlled two-way, absent ⇒ uncontrolled native select). Options
  arrive as the children snippet (<option>/<optgroup>); everything
  else (name, disabled, required, multiple…) flows through restProps.

  multiple: a native multiple select is a LIST BOX, not a button — the
  chevron and its right gutter disappear (:has(select[multiple])) and the
  control takes listbox geometry: taller default (about three visible
  rows — the rows attribute still sizes it through restProps), tighter
  block padding around the option stack, and a default cursor. Set
  <NativeSelect multiple size={n}> to control exactly how many rows the
  platform shows.

  tw4 (2026-08-24): static paint (closed-control shell, chevron) is
  token utilities in the markup; the .jx-field/.jx-label/.jx-error
  scaffolding is CONSUMED from the jx-pure sheet's Part A. Only the
  state machine (hover lift, focus ring, disabled, invalid dash, the
  :has(select[multiple]) listbox posture, reduced-motion kill) remains
  in native-select.css (D1-exempt residue under the layer law).
-->
<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import './native-select.css';

  interface Props extends HTMLSelectAttributes {
    /** field label; renders label[for] above the control */
    label?: string;
    /** density policy: explicit, inherited, then default */
    density?: Density;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** $bindable; bound ⇒ controlled two-way, absent ⇒ uncontrolled */
    value?: HTMLSelectAttributes['value'];
    /** the <option> / <optgroup> list, authored by the caller */
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    label,
    density,
    'data-density': _callerDensity,
    id = autoId,
    error,
    value = $bindable(),
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);
  const outerDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, outerDensity));
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);
</script>

<div class="jx-field" data-density={resolvedDensity}>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span class="jx-select-wrap relative block w-full max-w-full">
    <select
      {id}
      bind:value
      class={cn(
        'jx-select w-full min-h-[var(--jx-d-ctl-hit)] py-[var(--jx-d-ctl-gap)] ps-[var(--jx-d-ctl-pad)] pe-[calc(var(--jx-d-ctl-pad)+var(--jx-d-ctl-icon))] appearance-none border border-border rounded-none bg-background text-foreground text-[length:var(--jx-d-ctl-text)] leading-[var(--jx-d-leading)] scheme-light dark:scheme-dark cursor-pointer transition-[box-shadow] duration-150 ease-out',
        className,
      )}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      {...rest}
    >
      {@render children()}
    </select>
    <svg
      class="jx-select-chevron absolute end-[var(--jx-d-ctl-pad)] top-1/2 -translate-y-1/2 w-[var(--jx-d-ctl-icon)] h-[var(--jx-d-ctl-icon)] pointer-events-none text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>
  {#if invalid}<p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>{/if}
</div>
