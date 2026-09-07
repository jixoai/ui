<!--
  jixoai prose (registry/files/ui/prose/prose.svelte,
  typography-context-and-parts Lane A, 2026-09-07).

  The reading region PROVIDER: <Prose size leading family ink gradient
  ground align indent initialLetter wrap hyphens> renders a
  div.jx-pure[data-jx-prose] host — NOT <Typography>: the word
  `typography` is markdown's live user-facing vocabulary
  (<Markdown typography="relaxed">); two concepts under one name is
  documentation debt forever (ruling A1).

  THE TWO-CHANNEL LAW (the density contract verbatim):
    JS  — this provider resolves the 11 knobs through ProseDefaults
          (every one an absentSlot — ABSENCE IS THE STATE, ruling A2;
          unset knobs emit NOTHING), applies the plugin chain AT THE
          PROVIDER (applyTypoScope — a print-medium plugin can strip
          gradient/ground before CSS sees them), and provides the
          scope through the typography lib's context pair (the F4
          probe passed both environments 2026-09-07 — vitest, both
          import paths, and the dev-server SSR pipeline — so the pair
          ships in the lib, density's posture; the payload is
          getter-endorsed, { get scope() }).
    CSS — the host carries ONLY-SET wrapper declarations for the
          inheritance-lane knobs + the --jx-ty-* var mirrors +
          PRESENCE hooks (data-jx-ty-leading/-indent/-initial,
          data-jx-ty-ink="gradient") — presence-gated because an
          ungated var(--jx-ty-leading, inherit) rule at (0,2,0) would
          fire always and break the face's p{1.6} for every non-prose
          region (F13). The element lanes live in prose.css, the
          scope-owned residue sheet.

  THE SOVEREIGNTY CONTRACT (design §1.3 — pure cascade, zero JS
  masking, zero markdown changes): size/leading paint ONLY through
  inheritance and presence-gated (0,2,0) rules that LOSE to the
  markdown sheet's §2a (0,2,1) inside [data-jx-markdown] — an outer
  <Prose size leading> can never fight <Markdown typography=…>;
  ink/flow knobs pass through (the trio owns scale only; links keep
  primary by the face B2 element rule — the recorded exception);
  chrome stays unaffected BY CASCADE (element-level declarations beat
  an inherited wrapper color — the orthogonality probe pins it);
  code/kbd stay mono under family (face B1 element rules). Absent
  knobs keep the AMBIENT channel flowing: a nested prose region
  inherits every knob it does not set (nearest setter wins, an unset
  knob is an opinion of no opinion).

  The gradient knob is FILL-ONLY (A7/F9/F12): the host never writes
  color: transparent — it emits the gradient parts as vars consumed
  by the residue sheet's [data-jx-ty-ink='gradient'] lane, keeps
  --jx-ty-ink a pure color token (Heading's var-fallback utility must
  never see an invalid-at-computed-value-time var), and ships
  --jx-ty-ink-solid for the plugin and print reads. NO glyph renders
  here — v1 prose carries no icon edge.

  Composition: children is the region's content; consumer class
  merges LAST (cn / tailwind-merge, the layer law's dedup face);
  consumer style lands after the emitted declarations (consumer wins
  on conflict); rest props pass through untouched.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import {
    applyTypoScope,
    provideTypography,
    resolveTypoStyle,
    type CssLength,
    type Family,
    type Gradient,
    type Ink,
    type InkToken,
    type InitialLetterStep,
    type ProseAlign,
    type ProseHyphens,
    type ProseWrap,
  } from '$lib/typography.svelte';
  import { ProseDefaults } from './prose-defaults.svelte';
  import './prose.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** the region's type size — inheritance ONLY (CssLength; markdown
     *  sovereignty is a cascade fact, not a JS mask) */
    size?: CssLength;
    /** P-only line-height (headings keep their 1.25); number */
    leading?: number;
    /** 'sans' | 'mono' | 'serif' → the theme --font-* tokens ('serif'
     *  needs the theme token — documented), or a raw font-family
     *  value; code/kbd keep their own mono law */
    family?: Family;
    /** 'default' | 'muted' | 'primary' | 'destructive' → the four
     *  foreground tokens, or a raw color; links keep primary (the
     *  face's recorded exception) */
    ink?: Ink;
    /** fill-only gradient lane: {from,to,angle?} composes a linear
     *  gradient (numeric angle → degrees, default 180deg), a raw
     *  string is a CSS image value verbatim; marks inside restore
     *  solid ink; print/forced-colors restore in the sheet */
    gradient?: Gradient;
    /** the region's ground token ('background'|'card'|'popover'|
     *  'muted'|'secondary'|'accent'|'transparent') or raw value;
     *  Mark's own highlight law untouched */
    ground?: InkToken;
    /** 'start' | 'center' | 'end' | 'justify' (justify pairs with
     *  hyphens — docs guidance) */
    align?: ProseAlign;
    /** P-only first-line indent (CssLength; '2em' = 中文稿纸惯例);
     *  suppressed on a drop-cap P; never on headings */
    indent?: CssLength;
    /** drop-cap depth 2–5; BOTH sheet arms ship (@supports
     *  initial-letter modern path + the float ::first-letter
     *  fallback — a browser-class-dependent drop cap reads as a bug);
     *  keeps printing on paper (the manuscript posture) */
    initialLetter?: InitialLetterStep;
    /** 'pretty' (prose) | 'balance' (heading scopes) | 'stable' */
    wrap?: ProseWrap;
    /** 'auto' (needs lang on the host or an ancestor — documented) |
     *  'none' | 'manual' */
    hyphens?: ProseHyphens;
    /** the region's content */
    children?: Snippet;
    class?: string;
  }

  let {
    size,
    leading,
    family,
    ink,
    gradient,
    ground,
    align,
    indent,
    initialLetter,
    wrap,
    hyphens,
    children,
    class: className = '',
    style,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (ruling A2): every
  // knob an absentSlot — an unset knob resolves undefined and emits
  // nothing; there is no own to fall back to
  const knobs = $derived(
    ProseDefaults.resolve({
      size,
      leading,
      family,
      ink,
      gradient,
      ground,
      align,
      indent,
      initialLetter,
      wrap,
      hyphens,
    }),
  );

  // the plugin chain AT THE PROVIDER: the whole bag through the
  // nearest plugin root (identity fast path when no plugin targets
  // the typography def); read inside the $derived so medium-gated
  // filters re-run when the medium flips
  const effective = $derived(applyTypoScope(knobs));

  // the context pair (F4-promoted lib posture): getter-endorsed, so
  // a provider flip re-derives future consumers in the same frame
  provideTypography(() => effective);

  // the emission bag — declarations (inheritance lane) + vars
  // (--jx-ty-* mirrors + the solid restore token) + attrs (presence
  // lane). PURE resolution, mounted here
  const bag = $derived(resolveTypoStyle(effective));

  // the style string: declarations then vars, consumer style LAST
  // (consumer wins on conflict — the layer law's spirit at the
  // inline seam); undefined when nothing is set (no empty attr)
  const hostStyle = $derived.by(() => {
    const parts: string[] = [
      ...Object.entries(bag.declarations),
      ...Object.entries(bag.vars),
    ].map(([prop, value]) => `${prop}:${value}`);
    if (style !== undefined) parts.push(style);
    return parts.length > 0 ? parts.join(';') : undefined;
  });
</script>

<div
  class={cn('jx-pure', className)}
  data-jx-prose
  style={hostStyle}
  {...bag.attrs}
  {...rest}
>
  {@render children?.()}
</div>
