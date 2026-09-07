<!--
  jixoai text (registry/files/ui/text/text.svelte).
  <Text> renders <p> by default — the Chakra <Text>-is-a-paragraph
  precedent (2026-09-07, markdown-coverage change §1.5): the reading-
  content family the Owner designed. `mark` switches the element AND
  the paint; ONE vocabulary — the prop value, the sugar name, and the
  HTML element are the same word (mark="strong" ≡ <Strong> ≡
  <strong>).

  FACE-COMPOSING (design §2): no member escapes no-jx-pure. An inline
  escape descopes its whole subtree's face rules (the
  :not(.no-jx-pure *) arm), and emphasis legitimately nests — code
  chips inside strong, marks inside marks, links inside em. These
  components are semantic hooks + extension points over the face's
  own channels, not face replacements.

  Two members DELIBERATELY override face channels (design §1.5 —
  RECORDED settles, not accidents):
    strong  font-semibold (600) overrides the face B1 strong → 700 —
            the GitHub/Tailwind Typography emphasis weight
    mark    owns its highlight ground (a low-alpha primary tint, not
            the face's secondary-over-background mix) AND its
            0.05em/0.25em padding box — mirroring the face's mark box
            so standalone and in-face renderings agree
  All other members are additive on channels the face does not
  declare for their elements; sub/sup take NOTHING (the UA baseline
  shift is the law).

  NO font-size utilities anywhere (the ambient scale law): the family
  flows by inheritance — the typography trio's line-height
  un-short-circuit law keeps working because P never escapes the
  face. AMENDED (2026-09-08, the modifier kernel): absent = the
  inheritance flows untouched; an EXPLICIT modifier prop emits its
  utility — explicit beats ambient — and an explicit member lineHeight
  (a utilities-layer leading-[…] class) beats the prose scope's
  leading residue (the layer law's own posture, written down for the
  family). The six modifier props ride the SHARED kernel
  (lib/text-style.svelte.ts — Text and inline-code share the kernel,
  independent components, the Owner's ruling).

  The eight Raw sugars (p/strong/em/del/mark/ins/sub/sup) are
  re-exported from this file's module script — `import Text,
  { Strong } from './text.svelte'` works — and ride the barrel through
  `export *` (the learning-cost ruling: one vocabulary, two ergonomic
  forms, zero behavioral difference).
-->
<script module lang="ts">
  export { default as P } from './p.svelte';
  export { default as Strong } from './strong.svelte';
  export { default as Em } from './em.svelte';
  export { default as Del } from './del.svelte';
  export { default as Mark } from './mark.svelte';
  export { default as Ins } from './ins.svelte';
  export { default as Sub } from './sub.svelte';
  export { default as Sup } from './sup.svelte';
</script>
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { resolveTextStyle, type TextStyleProps } from '$lib/text-style.svelte';
  import { TextDefaults, type TextMark } from './text-defaults.svelte';

  interface Props extends HTMLAttributes<HTMLElement>, TextStyleProps {
    /** the element vocabulary — prop value = sugar name = HTML
     *  element; omitted → the literal slot's frozen own 'p' */
    mark?: TextMark;
  }

  let {
    mark,
    lineHeight,
    weight,
    italic,
    tracking,
    family,
    fontSize,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (the kbd resolution
  // path): explicit ?? frozen own 'p' — a literal slot never reads
  // context, an element choice is never zone-ambient
  const d = $derived(TextDefaults.resolve({ mark }));

  // the form map (design §1.5, verbatim) — element + own utilities
  // per mark; '' means the member owns nothing on any channel (the
  // semantic element alone IS the form)
  const forms = {
    p: { element: 'p', utilities: '' },
    strong: { element: 'strong', utilities: 'font-semibold' },
    em: { element: 'em', utilities: 'italic' },
    del: { element: 'del', utilities: 'line-through' },
    mark: {
      element: 'mark',
      // the recorded override: the ground is a low-alpha primary tint
      // (18% over transparent), the padding box mirrors the face's
      // 0.05em/0.25em, the corner is the fleet 2px settle; forced
      // colors drop to the Highlight system pair
      utilities:
        'bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] px-[0.25em] py-[0.05em] rounded-[2px] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
    ins: { element: 'ins', utilities: 'underline' },
    sub: { element: 'sub', utilities: '' },
    sup: { element: 'sup', utilities: '' },
  } as const;
</script>

<!-- the merge order: the form's own utilities, then the modifier
  kernel's classes, then the consumer class LAST — a modifier lands
  AFTER its form (weight='bold' beats strong's own 600), the consumer
  beats both (a not-italic class still wins); absent modifiers
  contribute NOTHING (the absent-ambient law) -->
<svelte:element
  this={forms[d.mark].element}
  {...rest}
  data-jx-text={d.mark}
  class={cn(
    forms[d.mark].utilities,
    resolveTextStyle({ lineHeight, weight, italic, tracking, family, fontSize }),
    className,
  )}
>
  {@render children?.()}
</svelte:element>
