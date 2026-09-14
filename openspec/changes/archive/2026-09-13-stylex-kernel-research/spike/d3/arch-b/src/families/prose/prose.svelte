<script lang="ts">
  // prose.svelte — the reading-region PROVIDER, StyleX re-authoring.
  // The two-channel law restated: JS resolves ONLY-SET knobs (absence
  // IS the state — an unset knob emits nothing, the ambient channel
  // keeps flowing); static enums land as StyleX classes, free-form
  // lengths ride the factory, var mirrors + presence attrs emit on
  // the host for the residue css's descendant lanes.
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import {
    proseStyles as s,
    type Family,
    type Ink,
    type Ground,
    type ProseAlign,
    type ProseWrap,
    type ProseHyphens,
  } from './prose.stylex';
  import './prose.css';

  interface Props {
    size?: string;
    leading?: number;
    family?: Family;
    ink?: Ink;
    gradient?: { from: string; to: string; angle?: number | string };
    ground?: Ground;
    align?: ProseAlign;
    indent?: string;
    initialLetter?: 2 | 3 | 4 | 5;
    wrap?: ProseWrap;
    hyphens?: ProseHyphens;
    children: import('svelte').Snippet;
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
  }: Props = $props();

  // the attrs bag: ONLY-SET knobs contribute (absence = nothing).
  // FACTORY styles MUST ride stylex.attrs' spread — a factory call
  // returns {class, style} where style carries the dynamic custom
  // property; taking .class alone DROPS the value (the sx helper's
  // documented trap).
  const hostAttrsX = $derived.by(() => {
    const args: unknown[] = [s.host];
    if (family === 'mono') args.push(s.familyMono);
    if (family === 'serif') args.push(s.familySerif);
    if (ink === 'muted') args.push(s.inkMuted);
    if (ink === 'primary') args.push(s.inkPrimary);
    if (ink === 'destructive') args.push(s.inkDestructive);
    if (ground !== undefined) {
      const g: Record<Ground, unknown> = {
        background: s.groundBackground,
        card: s.groundCard,
        popover: s.groundPopover,
        muted: s.groundMuted,
        secondary: s.groundSecondary,
        accent: s.groundAccent,
        transparent: s.groundTransparent,
      };
      args.push(g[ground]);
    }
    if (align === 'center') args.push(s.alignCenter);
    if (align === 'end') args.push(s.alignEnd);
    if (align === 'justify') args.push(s.alignJustify);
    if (wrap !== undefined) {
      const w: Record<ProseWrap, unknown> = {
        pretty: s.wrapPretty,
        balance: s.wrapBalance,
        stable: s.wrapStable,
      };
      args.push(w[wrap]);
    }
    if (hyphens !== undefined) {
      const h: Record<ProseHyphens, unknown> = {
        auto: s.hyphensAuto,
        none: s.hyphensNone,
        manual: s.hyphensManual,
      };
      args.push(h[hyphens]);
    }
    return stylex.attrs(...args);
  });

  // the var mirrors + presence attrs (the residue css's input channel)
  const hostStyle = $derived.by(() => {
    const decls: string[] = [];
    if (leading !== undefined) decls.push(`--jx-ty-leading: ${leading}`);
    if (indent !== undefined) decls.push(`--jx-ty-indent: ${indent}`);
    if (initialLetter !== undefined) decls.push(`--jx-ty-initial: ${initialLetter}`);
    if (gradient) {
      const angle =
        typeof gradient.angle === 'number' ? `${gradient.angle}deg` : (gradient.angle ?? '180deg');
      decls.push(
        `--jx-ty-gradient: linear-gradient(${angle}, ${gradient.from}, ${gradient.to})`,
        `--jx-ty-ink-solid: currentcolor`,
      );
    }
    return decls.length > 0 ? decls.join(';') : undefined;
  });
  const presenceAttrs = $derived.by(() => ({
    'data-jx-ty-leading': leading !== undefined ? '' : undefined,
    'data-jx-ty-indent': indent !== undefined ? '' : undefined,
    'data-jx-ty-initial': initialLetter !== undefined ? '' : undefined,
    'data-jx-ty-ink': gradient ? 'gradient' : undefined,
  }));

  // the merged style channel: the free-form size knob rides the
  // INLINE declaration lane (the source provider's own channel — its
  // bag.declarations emitted font-size exactly this way; the FACTORY
  // idiom is demonstrated on the icon family instead, where the babel
  // plugin's markup-level transform covers it), plus the residue-css
  // var mirrors — ONE attribute
  const mergedStyle = $derived.by(() => {
    const parts: string[] = [];
    if (size !== undefined) parts.push(`font-size:${size}`);
    if (hostStyle) parts.push(hostStyle);
    return parts.length > 0 ? parts.join(';') : undefined;
  });
</script>

<div {...hostAttrsX} {...presenceAttrs} data-jx-prose="" style={mergedStyle}>
  {@render children()}
</div>
