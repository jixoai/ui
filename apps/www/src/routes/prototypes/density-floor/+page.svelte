<!--
  prototype: density hit-floor policy comparison (2026-08-29).
  Original request: "先用 prototype 做两个版本——一个基于媒体查询区分
  移动端/桌面端，一个不区分、该怎么小就怎么小。我看看效果。"

  Isolated prototype surface (prototype skill Hard Rule 1): a leaf
  route under its own +layout@ (app.css only, no site chrome).
  Nothing here imports into production code; the whole folder is
  deleted once the owner picks a policy. Control classes and tokens
  are the PRODUCTION sheets (jixoai.css + jx-pure.css) — only the
  --jx-density-hit-min-* aliases are re-scoped per variant container.

  Intent list:
  - variant A「触屏保底」: hit = max(row-min, floor); floor rides the
    DEVICE — pointer:coarse → 11U (44px), pointer:fine → 6U (24px,
    the WCAG 2.5.8 AA lane floor).
  - variant B「彻底跟字」: hit = row-min — no floor token exists; the
    developer's xs opt-in is honored on every device.
  - the「模拟手机」toggle is demo chrome ONLY (data-sim override);
    the promoted behavior rides the real media query un-marked.
-->
<script lang="ts">
  import { onMount, tick } from 'svelte';

  let current = $state(0);
  /** demo-only pointer simulation for variant A; '' = follow the device */
  let sim = $state<'' | 'coarse'>('');
  let hitReadout = $state<Record<string, string>>({});
  let ready = $state(false);

  let pickerEl: HTMLElement | undefined = $state();
  let highlightEl: HTMLElement | undefined = $state();
  let stageEl: HTMLElement | undefined = $state();
  let itemEls: HTMLElement[] = [];

  const SCOPES = [
    { key: 'xs', zh: '密集元数据' },
    { key: 'sm', zh: '紧凑' },
    { key: 'default', zh: '默认' },
    { key: 'lg', zh: '宽松' },
  ] as const;

  function moveHighlight() {
    const el = itemEls[current];
    if (!el || !highlightEl) return;
    highlightEl.style.width = `${el.offsetWidth}px`;
    highlightEl.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  function setActive(i: number) {
    if (i < 0 || i >= 2) return;
    current = i;
    const url = new URL(location);
    url.searchParams.set('v', String(i + 1));
    history.replaceState(null, '', url);
  }

  function onKeydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 2) setActive(num - 1);
    else if (e.key === 'ArrowRight') setActive((current + 1) % 2);
    else if (e.key === 'ArrowLeft') setActive((current - 1 + 2) % 2);
  }

  /** read the resolved --jx-hit + lane font-size per density scope */
  async function measure() {
    await tick();
    if (!stageEl) return;
    const next: Record<string, string> = {};
    for (const scope of stageEl.querySelectorAll<HTMLElement>('[data-density]')) {
      const shell = scope.querySelector<HTMLElement>('.jx-html-control-shell');
      const lane = scope.querySelector<HTMLElement>('.jx-html-control-lane');
      if (!shell || !lane) continue;
      const hit = Math.round(parseFloat(getComputedStyle(shell).minHeight));
      next[scope.dataset.density ?? ''] = `hit ${hit}px · ${getComputedStyle(lane).fontSize}`;
    }
    hitReadout = next;
  }

  // re-measure whenever the mounted variant (or the sim) changes
  $effect(() => {
    void current;
    void sim;
    void measure();
  });

  onMount(() => {
    const v = parseInt(new URLSearchParams(location.search).get('v') ?? '1', 10);
    if (v === 2) current = 1;
    moveHighlight();
    // the slide enables only after first paint, so load doesn't animate
    requestAnimationFrame(() => requestAnimationFrame(() => (ready = true)));
  });
</script>

<svelte:window onkeydown={onKeydown} onresize={moveHighlight} />

<header class="proto-head">
  <h1>density hit-floor · 两策略对比</h1>
  <p>
    input.html「Density and tokens」场景。控件类名与 token 全部来自生产镜像（jixoai.css + jx-pure.css）；
    两个版本只改一件事——<code>--jx-density-hit-min-*</code> 是否被 44px 地板钳制。快捷键 <code>1 / 2 / ←→</code>。
  </p>
</header>

<div class="stage jx-pure" bind:this={stageEl}>
  {#if current === 0}
    <div class="proto-a" data-sim={sim || undefined}>
      <div class="policy-strip">
        <span><b>hit = max(row-min, floor)</b></span>
        <span>floor：触屏 11U = 44px · 指针 6U = 24px（WCAG 2.5.8 AA）</span>
        <span>由 <code>@media (pointer: …)</code> 分流，同一份样式表</span>
        <span class="sim-toggle" role="group" aria-label="指针模拟">
          <button type="button" onclick={() => (sim = '')} data-on={sim === '' ? '' : undefined}>跟随设备</button>
          <button type="button" onclick={() => (sim = 'coarse')} data-on={sim === 'coarse' ? '' : undefined}>模拟手机</button>
        </span>
      </div>
      <div class="scope-grid">
        {#each SCOPES as s (s.key)}
          <section class="scope" data-density={s.key}>
            <header class="scope-head">
              <b>{s.key}</b><span>{s.zh}</span>
              <output>{hitReadout[s.key] ?? 'hit —'}</output>
            </header>
            <div class="jx-field">
              <label class="jx-label" for="pf-a-{s.key}-token">node token</label>
              <div class="jx-html-control-shell">
                <input class="jx-html-control-lane" id="pf-a-{s.key}-token" type="text" value="jxo_live_9f2c" />
              </div>
            </div>
            <label class="lane">
              <input class="jx-slider" type="range" min="0" max="100" value="40" aria-label="采样率" />
            </label>
          </section>
        {/each}
      </div>
      <p class="sim-note">「模拟手机」仅在本演示页覆盖 floor；推广后的真实行为由 pointer 媒体查询自动决定，无需开发者标记。</p>
    </div>
  {:else}
    <div class="proto-b">
      <div class="policy-strip">
        <span><b>hit = row-min</b></span>
        <span>无 floor token：28 / 32 / 40 / 48 随字号线性缩放</span>
        <span>手机（pointer: coarse）同样是这四个高度 —— 开发者选了 xs 就是真的小</span>
      </div>
      <div class="scope-grid">
        {#each SCOPES as s (s.key)}
          <section class="scope" data-density={s.key}>
            <header class="scope-head">
              <b>{s.key}</b><span>{s.zh}</span>
              <output>{hitReadout[s.key] ?? 'hit —'}</output>
            </header>
            <div class="jx-field">
              <label class="jx-label" for="pf-b-{s.key}-token">node token</label>
              <div class="jx-html-control-shell">
                <input class="jx-html-control-lane" id="pf-b-{s.key}-token" type="text" value="jxo_live_9f2c" />
              </div>
            </div>
            <label class="lane">
              <input class="jx-slider" type="range" min="0" max="100" value="40" aria-label="采样率" />
            </label>
          </section>
        {/each}
      </div>
      <p class="sim-note">本版本没有媒体查询，也没有 floor：所有设备、所有指针一律 row-min。</p>
    </div>
  {/if}
</div>

<footer class="proto-foot">
  一次性原型（src/routes/prototypes/density-floor/）——选定策略后即删除；控件几何与线上一致。
</footer>

<nav class="proto-picker" aria-label="Prototype variants" class:data-ready={ready} bind:this={pickerEl}>
  <span class="proto-picker-highlight" aria-hidden="true" bind:this={highlightEl}></span>
  <button
    class="proto-picker-item"
    data-active={current === 0 ? '' : undefined}
    aria-current={current === 0 ? 'true' : undefined}
    onclick={() => setActive(0)}
    bind:this={itemEls[0]}
  >触屏保底</button>
  <button
    class="proto-picker-item"
    data-active={current === 1 ? '' : undefined}
    aria-current={current === 1 ? 'true' : undefined}
    onclick={() => setActive(1)}
    bind:this={itemEls[1]}
  >彻底跟字</button>
</nav>

<style>
  /* ---------- harness chrome (NOT a contestant) ---------------------- */
  :global(html) {
    color-scheme: dark;
  }
  :global(body) {
    margin: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans, system-ui, sans-serif);
  }
  .proto-head {
    max-width: 78rem;
    margin: 0 auto 1.25rem;
    padding: 2rem clamp(1rem, 4vw, 3rem) 0;
  }
  .proto-head h1 {
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 0.35rem;
  }
  .proto-head p {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 13px;
  }
  .proto-head code,
  .policy-strip code {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 12px;
  }
  .policy-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    margin-bottom: 1.25rem;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 12px;
    color: var(--muted-foreground);
  }
  .policy-strip b {
    color: var(--foreground);
    font-weight: 600;
  }
  .sim-toggle {
    display: inline-flex;
    border: 1px solid var(--border);
    margin-left: auto;
  }
  .sim-toggle button {
    font: inherit;
    font-size: 11px;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .sim-toggle button[data-on] {
    background: var(--foreground);
    color: var(--background);
  }
  .stage {
    max-width: 78rem;
    margin: 0 auto;
    padding: 0 clamp(1rem, 4vw, 3rem) 7rem;
  }
  .scope-grid {
    display: grid;
    gap: var(--jx-gap, 0.75rem);
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  }
  .scope {
    border: 1px solid var(--border);
    padding: var(--jx-inset, 0.75rem);
    display: flex;
    flex-direction: column;
    gap: var(--jx-stack, 0.5rem);
  }
  .scope-head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .scope-head b {
    color: var(--foreground);
    font-size: 12px;
  }
  .scope-head output {
    margin-left: auto;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 11px;
    letter-spacing: 0;
    text-transform: none;
    border: 1px solid var(--border);
    padding: 1px 6px;
    color: var(--foreground);
    white-space: nowrap;
  }
  .lane {
    display: block;
  }
  .sim-note {
    font-size: 11px;
    color: var(--muted-foreground);
    margin: 0.75rem 0 0;
  }
  .proto-foot {
    max-width: 78rem;
    margin: -4.5rem auto 0;
    padding: 0 clamp(1rem, 4vw, 3rem) 2rem;
    font-size: 11px;
    color: var(--muted-foreground);
  }

  /* ---------- variant A: floor rides the pointer media query --------- */
  .proto-a {
    --jx-hit-floor: calc(var(--jx-unit) * 11); /* coarse / touch-first default */
    --jx-density-hit-min-xs: max(var(--jx-density-row-min-xs), var(--jx-hit-floor));
    --jx-density-hit-min-sm: max(var(--jx-density-row-min-sm), var(--jx-hit-floor));
    --jx-density-hit-min-default: max(var(--jx-density-row-min-default), var(--jx-hit-floor));
    --jx-density-hit-min-lg: max(var(--jx-density-row-min-lg), var(--jx-hit-floor));
  }
  @media (pointer: fine) {
    .proto-a {
      --jx-hit-floor: calc(var(--jx-unit) * 6); /* 24px · WCAG 2.5.8 AA */
    }
  }
  /* demo-only simulation hooks — chrome, not the promoted behavior */
  .proto-a[data-sim='coarse'] {
    --jx-hit-floor: calc(var(--jx-unit) * 11);
  }

  /* ---------- variant B: no floor token exists ----------------------- */
  .proto-b {
    --jx-density-hit-min-xs: var(--jx-density-row-min-xs);
    --jx-density-hit-min-sm: var(--jx-density-row-min-sm);
    --jx-density-hit-min-default: var(--jx-density-row-min-default);
    --jx-density-hit-min-lg: var(--jx-density-row-min-lg);
  }

  /* ---------- the picker (PICKER.md, verbatim) ----------------------- */
  .proto-picker {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border-radius: 999px;
    background: rgba(10, 10, 10, 0.82);
    -webkit-backdrop-filter: blur(12px) saturate(1.4);
    backdrop-filter: blur(12px) saturate(1.4);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.08) inset,
      0 8px 24px rgba(0, 0, 0, 0.24),
      0 2px 6px rgba(0, 0, 0, 0.12);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    user-select: none;
    -webkit-user-select: none;
  }
  .proto-picker-highlight {
    position: absolute;
    top: 4px;
    left: 0;
    height: 28px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    will-change: transform;
  }
  .proto-picker[data-ready] .proto-picker-highlight {
    transition:
      transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
      width 250ms cubic-bezier(0.23, 1, 0.32, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .proto-picker[data-ready] .proto-picker-highlight {
      transition: none;
    }
  }
  .proto-picker-item {
    position: relative;
    display: flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.55);
    font: inherit;
    cursor: pointer;
    transition: color 150ms ease-out;
  }
  .proto-picker-item:hover {
    color: rgba(255, 255, 255, 0.85);
  }
  .proto-picker-item:active {
    transform: scale(0.97);
  }
  .proto-picker-item:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }
  .proto-picker-item[data-active] {
    color: #fff;
  }
</style>
