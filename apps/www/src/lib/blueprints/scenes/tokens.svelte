<!-- tokens blueprint: the typed mirror of the theme sheet (stylex
     phase 0 P0.3) — the first REAL stylex atoms in the build
     pipeline: static longhand atoms against typed tokens (the
     authoring law), verbatim var() values cascading from the sheet.
     The swatch table is built from STATIC sx() calls only, so the
     compiled artifact carries zero runtime (the corpus pattern).
     (tailwindless BP-B 2026-09-16: the eyebrow's utilities join the
     batch's surface module — bpB.tokensEyebrow, composed by the
     canonical local cx.) -->
<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  // RELATIVE import — the babel plugin's module resolution rejects
  // $lib aliases (the ssg lesson, spike-report §3)
  import { tokens } from '../../tokens.stylex';
  import { bpB } from '../../surface/blueprints-b.stylex';

  // the canonical local joiner (the separator serialize law,
  // tailwindless BP-B 2026-09-16)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the
  // typed form — same helper as the research corpus carriers
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;

  // static atoms ONLY (the phase-0 authoring law): longhands, typed
  // token members — a typo'd key here fails the kernel typecheck
  // naming the key (the D1-12 surface)
  const s = stylex.create({
    board: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '14px',
      paddingBlock: '40px',
      paddingInline: '48px',
      fontFamily: tokens['--jx-font-sans'],
    },
    row: { display: 'flex', alignItems: 'flex-end', gap: '14px' },
    chip: { display: 'flex', flexDirection: 'column', gap: '6px' },
    swatch: {
      width: '72px',
      height: '44px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: tokens['--jx-border'],
      boxShadow: tokens['--jx-shadow-xs'],
    },
    key: { fontSize: '10px', color: tokens['--jx-foreground'] },
    mirror: { fontSize: '10px', color: tokens['--jx-muted-foreground'] },
    foot: { fontSize: '11px', color: tokens['--jx-muted-foreground'] },
  });

  // per-hue fill atoms — static, against the typed tokens
  const hue = stylex.create({
    primary: { backgroundColor: tokens['--jx-primary'] },
    success: { backgroundColor: tokens['--jx-success'] },
    warning: { backgroundColor: tokens['--jx-warning'] },
    error: { backgroundColor: tokens['--jx-error'] },
    info: { backgroundColor: tokens['--jx-info'] },
    accent: { backgroundColor: tokens['--jx-accent'] },
  });

  // the compiled table: every sx() call has STATIC arguments, so each
  // entry folds to a plain class string at build time — the each-loop
  // below only ever concatenates strings (zero runtime)
  const palette = [
    { name: 'primary', cls: sx(s.swatch, hue.primary), sheet: 'var(--primary)' },
    { name: 'success', cls: sx(s.swatch, hue.success), sheet: 'var(--success)' },
    { name: 'warning', cls: sx(s.swatch, hue.warning), sheet: 'var(--warning)' },
    { name: 'error', cls: sx(s.swatch, hue.error), sheet: 'var(--error)' },
    { name: 'info', cls: sx(s.swatch, hue.info), sheet: 'var(--info)' },
    { name: 'accent', cls: sx(s.swatch, hue.accent), sheet: 'var(--accent)' },
  ] as const;
</script>

<!-- tailwindless BP-B: the root's former `h-full w-full` class sat
     BEFORE the attrs spread, whose own class key overwrote it (the
     later spread wins) — dead paint, dropped rather than atomized -->
<div {...stylex.attrs(s.board)}>
  <div class={cx(bpB.tokensEyebrow)}>
    60 typed tokens · verbatim var() mirrors · the sheet stays the source
  </div>
  <div class={sx(s.row)}>
    {#each palette as p (p.name)}
      <div class={sx(s.chip)}>
        <div class={p.cls}></div>
        <span class={sx(s.key)}>{p.name}</span>
        <span class={sx(s.mirror)}>{p.sheet}</span>
      </div>
    {/each}
  </div>
  <div class={sx(s.foot)}>
    // tokens of the shape --jx-sheet-name — a typo'd key is a compile error naming the key
  </div>
</div>
