<!-- universal-props blueprint: the explicit-props kernel's own face —
     the var() indirection law made visible. Three lanes mirror the
     generated ladder (universal-props.css, W2 2.1/2.2): the SIZE
     ladder (one number moves a family — children size in em), the
     RADIUS ladder with the @supports squircle ×2 factor (scoop/bevel/
     notch degrade to square), and the COLOR name-resolution lane
     (alias var → theme token, warn spelling the --warning lane).
     Static stylex atoms only (the corpus pattern — zero runtime).
     (W5-r2, 2026-09-21: closes the coverage hole this change's own
     registry item opened — the catalog gained universal-props in W3
     with the SVG but the scene never landed.) -->
<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  // RELATIVE import — the babel plugin's module resolution rejects
  // $lib aliases (the ssg lesson, spike-report §3)
  import { tokens } from '../../tokens.stylex';

  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;

  const s = stylex.create({
    board: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '14px',
      paddingBlock: '40px',
      paddingInline: '48px',
      fontFamily: tokens['--jx-font-mono'],
    },
    lane: { display: 'flex', alignItems: 'flex-end', gap: '14px' },
    chip: { display: 'flex', flexDirection: 'column', gap: '6px' },
    key: { fontSize: '10px', color: tokens['--jx-foreground'] },
    mirror: { fontSize: '10px', color: tokens['--jx-muted-foreground'] },
    foot: { fontSize: '11px', color: tokens['--jx-muted-foreground'] },
  });

  // size ladder: 14/16/18px roots — children size in em
  const size = stylex.create({
    small: { width: '56px', height: '28px', fontSize: 'var(--jx-size-small)' },
    medium: { width: '64px', height: '32px', fontSize: 'var(--jx-size-medium)' },
    large: { width: '72px', height: '36px', fontSize: 'var(--jx-size-large)' },
  });

  // radius ladder: the squircle rides the ×2 factor var (degrades to 1)
  const radius = stylex.create({
    small: {
      width: '56px',
      height: '40px',
      borderRadius: 'calc(var(--jx-radius-small) * var(--jx-radius-factor-squircle, 1))',
    },
    medium: {
      width: '64px',
      height: '44px',
      borderRadius: 'calc(var(--jx-radius-medium) * var(--jx-radius-factor-squircle, 2))',
    },
    large: {
      width: '72px',
      height: '48px',
      borderRadius: 'calc(var(--jx-radius-large) * var(--jx-radius-factor-squircle, 2))',
    },
  });

  // color lane: the alias var indirection (name → theme token)
  const color = stylex.create({
    primary: { backgroundColor: 'var(--jx-color-primary)' },
    secondary: { backgroundColor: 'var(--jx-color-secondary)' },
    error: { backgroundColor: 'var(--jx-color-error)' },
    warn: { backgroundColor: 'var(--jx-color-warn)' },
    success: { backgroundColor: 'var(--jx-color-success)' },
    info: { backgroundColor: 'var(--jx-color-info)' },
  });

  const sizes = [
    { name: 'small', cls: sx(size.small) },
    { name: 'medium', cls: sx(size.medium) },
    { name: 'large', cls: sx(size.large) },
  ] as const;
  const radii = [
    { name: '6px', cls: sx(radius.small) },
    { name: '8px', cls: sx(radius.medium) },
    { name: '10px', cls: sx(radius.large) },
  ] as const;
  const colors = [
    { name: 'primary', cls: sx(color.primary) },
    { name: 'secondary', cls: sx(color.secondary) },
    { name: 'error', cls: sx(color.error) },
    { name: 'warn', cls: sx(color.warn) },
    { name: 'success', cls: sx(color.success) },
    { name: 'info', cls: sx(color.info) },
  ] as const;
</script>

<div class={sx(s.board)}>
  <div class={sx(s.lane)}>
    {#each sizes as step (step.name)}
      <div class={sx(s.chip)}>
        <div class={step.cls} />
        <div class={sx(s.key)}>--jx-size-{step.name}</div>
        <div class={sx(s.mirror)}>font-size root</div>
      </div>
    {/each}
  </div>
  <div class={sx(s.lane)}>
    {#each radii as step (step.name)}
      <div class={sx(s.chip)}>
        <div
          class={step.cls}
          style="background: color-mix(in oklab, var(--jx-color-info) 18%, transparent);
            border: 1px solid var(--jx-border)"
        />
        <div class={sx(s.key)}>{step.name} × factor</div>
        <div class={sx(s.mirror)}>squircle ×2 · degrade 1</div>
      </div>
    {/each}
  </div>
  <div class={sx(s.lane)}>
    {#each colors as step (step.name)}
      <div class={sx(s.chip)}>
        <div class={step.cls} style="width: 40px; height: 28px" />
        <div class={sx(s.key)}>{step.name}</div>
        <div class={sx(s.mirror)}>→ theme token</div>
      </div>
    {/each}
  </div>
  <div class={sx(s.foot)}>defaults stamp var(--jx-&lt;axis&gt;-&lt;alias&gt;) — a remap overrides the var, zero runtime resolver</div>
</div>
