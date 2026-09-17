<!--
  jixoai hero section (registry/files/ui/hero-section/hero-section.svelte,
  2026-08-25).
  The Broadside hero, composed after the openspecui reference: large lead
  type with a primary-colored accent, badge row, a copy-command PRIMARY
  CTA (icon + command, copied feedback) plus a secondary outline slot,
  and an OPTIONAL second column (the terminal card) for the wide form.

  Container-responsive + cm measure (Owner ruling, 2026-09-01):
  - the SECTION is the named container (@container/jx-hero); the row
    form is a CONTAINER tier (≥64rem content), not a viewport one —
    an embedded hero answers its own box. Wide: two columns, the aside
    bottom-aligned; below the tier — or whenever `terminal` is absent —
    the single column stacks the aside BELOW, and a wide hero without
    an aside keeps the right side EMPTY (whitespace is the focus; the
    brand lead stays left).
  - the measure is CENTIMETRES, the ergonomic reading unit: the lead
    caps at 16cm, the title block at 22cm, the aside column tracks
    10.5–13cm. Line-length research (Bringhurst: 45–75 characters per
    line, ideal ≈66; Dyson & Haselgrove 2001; Bernard et al. 2002 —
    preference clusters at 45–70 CPL; ISO 9241-210 visual-angle
    guidance) converges on a 12–20cm single-column measure at desktop
    viewing distance: the hero reads as a BRAND STATEMENT at that
    measure, not as an article. CSS cm is the 96dpi reference unit
    (≈37.8px/cm) — the print-measure idiom, by intent; every cm cap
    rides min(100%, …) so narrow containers never overflow.

  Composition-first API (composition-first-apis, 2026-08-25) — content
  is authored, not configured:

    eyebrow: string          tracked label above the title (brand hue)
    title?: snippet         the h1 content — the em carries the accent
                             paint (component css :where() rule; plain
                             text also legal)
    summary: string         max-62ch lead paragraph
    badges?: snippet        the badge row content — compose Badge parts
                             (badges: string[] is dead)
    copyCommand?: string    the command on the primary CTA (clipboard
                             payload — value-domain data). SNIPPET-
                             CONDITIONAL (2026-09-06): required exactly
                             when the DEFAULT copy CTA renders — provide
                             a #copy snippet instead and the prop is
                             unused (and may be omitted)
    copyLabel?: string      aria affordance of the DEFAULT copy CTA
    copy?: snippet          replaces the default copy CTA wholesale
    terminal: snippet       the right-column demo (terminal-card)
    secondary?: snippet     extra outline CTAs after the copy button

  tw4 (2026-08-24) → tailwindless Wave 1 batch 3 (2026-09-17): the paint
  rides the family's stylex ATOMS (hero-section.stylex.ts) joined
  through cx() — the entrance cascade's channel/delay seam + the
  container/viewport tiers are atoms; the keyframes + the
  reduced-motion kill stay in hero-section.css (D1-exempt residue).
  composition-first keeps the title-em accent rule — caller-authored
  content, so a :where() components-layer descendant rule is the only
  route (consumer utilities still win by the layer law).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import Icon from '$lib/ui/icon';
  import { cn } from '$lib/utils';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { heroStyles } from './hero-section.stylex';
  import './hero-section.css';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    eyebrow: string;
    summary: string;
    /** the clipboard payload — the default CTA's label AND copy target.
     *  Snippet-conditional: required when the default CTA renders (no
     *  `copy` snippet); unused — and optional — when `copy` replaces it */
    copyCommand?: string;
    /** aria affordance for the default copy CTA ("copy" / localized) */
    copyLabel?: string;
    /** the h1 content; <em> inside carries the accent paint */
    title?: Snippet;
    /** the badge row content — compose Badge children */
    badges?: Snippet;
    /** replaces the default copy CTA */
    copy?: Snippet;
    /** the OPTIONAL second-column aside (usually terminal-card); absent
     *  → the wide form keeps the right side empty (whitespace focus) */
    terminal?: Snippet;
    secondary?: Snippet;
    class?: string;
  }

  let {
    eyebrow,
    summary,
    copyCommand = '',
    copyLabel = 'copy',
    title,
    badges,
    copy,
    terminal,
    secondary,
    class: className = '',
    ...rest
  }: Props = $props();

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        Object.entries(style).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

  // one cascade law: the entrance animation + its per-step delay (the
  // rise offset varies per step through --jx-hero-rise); the atom
  // carries the channel, the jx-hero-step hook keeps the css laws
  // (keyframes + the reduced-motion kill)
  const step = `jx-hero-step ${cx(heroStyles.step)}`;

  const copyCommandToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyCommand);
    } catch {
      const area = document.createElement('textarea');
      area.value = copyCommand;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copied = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 1400);
  };

  // destroy hygiene (F-9, 2026-09-02): a pending copied-reset timer
  // never outlives the hero
  $effect(() => () => clearTimeout(copyTimer));
</script>

<section
  class={cn(cx(heroStyles.shell), className)}
  {...rest}
>
  <!-- the container tier: ≥64rem CONTENT (the section is the container —
       an embedded hero answers its own box, not the viewport). The cm
       tracks are the ergonomic print-measure idiom; the aside drops
       below the tier -->
  <div
    class={cx(heroStyles.row)}
  >
    <div class={cx(heroStyles.lead)}>
      <p class="{step} {cx(heroStyles.eyebrow)}" style="--jx-hero-delay: 0ms">
        {eyebrow}
      </p>
      {#if title}
        <h1
          data-jx-hero-title=""
          class="{step} {cx(heroStyles.title)}"
          style="--jx-hero-delay: 60ms; --jx-hero-rise: 14px"
        >
          {@render title()}
        </h1>
      {/if}
      <p
        class="{step} {cx(heroStyles.summary)}"
        style="--jx-hero-delay: 120ms"
      >
        {summary}
      </p>
      {#if badges}
        <div
          class="{step} {cx(heroStyles.badges)}"
          style="--jx-hero-delay: 160ms"
        >
          {@render badges()}
        </div>
      {/if}
      <div class="{step} {cx(heroStyles.ctaRow)}" style="--jx-hero-delay: 200ms">
        {#if copy}
          {@render copy()}
        {:else}
          <PressButton
            variant={copied ? 'tonal' : 'fill'}
            class={copied ? 'jx-hue-success' : undefined}
            onclick={copyCommandToClipboard}
            ariaLabel={`${copied ? 'copied' : copyLabel} ${copyCommand}`}
          >
            {#if copied}
              <!-- Icon component glyphs (full lucide copy geometry — the
                   hand-simplified variant retired 2026-08-29); the copied
                   check rides a strokier strokeWidth prop -->
              <span class={cx(heroStyles.iconLane)}>
                <Icon name="check" strokeWidth={2.5} />
              </span>
            {:else}
              <span class={cx(heroStyles.iconLane)}>
                <Icon name="copy" />
              </span>
            {/if}
            <span>{copyCommand}</span>
          </PressButton>
        {/if}
        {#if secondary}
          {@render secondary()}
        {/if}
      </div>
    </div>
    {#if terminal}
      <div class="{step} {cx(heroStyles.aside)}" style="--jx-hero-delay: 260ms; --jx-hero-rise: 12px">
        {@render terminal()}
      </div>
    {/if}
  </div>
</section>
