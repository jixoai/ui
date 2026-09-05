<script lang="ts">
  // The 2xs acceptance page (2026-09-05-density-2xs). Three sections:
  // the five-rung scale table rendered FROM LIVE CSS VARS (the bars
  // consume the aliases directly; the numbers are measured used
  // values — the verifier's own technique — so this table cannot rot
  // when the kernel moves), the pro-tool scene at 2xs beside the same
  // scene at default (composed from real components, no fake
  // screenshots), and the adoption law. Same-source law: nothing on
  // this page hardcodes a kernel number in prose that the table
  // doesn't derive live.
  import { onMount } from 'svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import {
    Item,
    ItemGroup,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemEnd,
  } from '$lib/ui/list-item';
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Select, { type SelectOption } from '$lib/ui/select/select.svelte';

  const RUNGS = ['2xs', 'xs', 'sm', 'default', 'lg'] as const;
  type Rung = (typeof RUNGS)[number];
  type Axis =
    | 'text' | 'line' | 'gap' | 'stack' | 'inset'
    | 'row-min' | 'hit' | 'icon' | 'image' | 'text-secondary';
  const AXES: Axis[] = [
    'text', 'line', 'gap', 'stack', 'inset',
    'row-min', 'hit', 'icon', 'image', 'text-secondary',
  ];
  // the css var each axis reads INSIDE a rung scope (all lengths)
  const AXIS_VAR: Record<Axis, string> = {
    text: '--jx-text',
    line: '--jx-line',
    gap: '--jx-gap',
    stack: '--jx-stack',
    inset: '--jx-inset',
    'row-min': '--jx-row-min',
    hit: '--jx-hit',
    icon: '--jx-icon',
    image: '--jx-image',
    'text-secondary': '--jx-text-secondary',
  };
  const AXIS_HEAD: Record<Axis, string> = {
    text: 'T text',
    line: 'L line',
    gap: 'G gap',
    stack: 'S stack',
    inset: 'B inset',
    'row-min': 'row-min',
    hit: 'hit-min',
    icon: 'icon',
    image: 'image',
    'text-secondary': 'T sec',
  };
  const VERTICAL = new Set<Axis>(['line', 'row-min', 'hit']);

  // measured used values per rung — em dash until measured (the
  // honest-state law: never undefined on the page)
  let measured = $state<Partial<Record<Rung, Partial<Record<Axis, number>>>>>({});

  onMount(() => {
    const measure = () => {
      const px = (v: string) => parseFloat(v) || 0;
      const next: typeof measured = {};
      for (const r of RUNGS) {
        const scope = document.querySelector<HTMLElement>(`[data-scale-rung='${r}']`);
        if (!scope) continue;
        const one = (axis: Axis) => scope.querySelector<HTMLElement>(`[data-probe='${axis}']`)!;
        const cs = (el: HTMLElement) => getComputedStyle(el);
        next[r] = {
          text: px(cs(one('text')).fontSize),
          line: px(cs(one('line')).lineHeight),
          gap: px(cs(one('gap')).columnGap),
          stack: px(cs(one('stack')).rowGap),
          inset: px(cs(one('inset')).paddingInlineStart),
          'row-min': px(cs(one('row-min')).minHeight),
          hit: px(cs(one('hit')).minHeight),
          icon: px(cs(one('icon')).width),
          image: px(cs(one('image')).width),
          'text-secondary': px(cs(one('text-secondary')).fontSize),
        };
      }
      measured = next;
    };
    measure();
    // webfont metrics can shift used line boxes; re-read once settled
    if (document.fonts?.ready) void document.fonts.ready.then(measure);
  });

  // ---- the scene's data (shared by both density renderings) --------
  const blendOptions: SelectOption[] = [
    { value: 'normal', label: 'normal' },
    { value: 'multiply', label: 'multiply' },
    { value: 'screen', label: 'screen' },
    { value: 'overlay', label: 'overlay' },
  ];
  const fillOptions: SelectOption[] = [
    { value: 'solid', label: 'solid' },
    { value: 'gradient', label: 'gradient' },
    { value: 'none', label: 'none' },
  ];
  let blend = $state('multiply');
  let fill = $state('solid');

  const layers = [
    { name: 'inspector/shell', note: 'frame · 4 constraints', glyph: 'M4 4h16v16H4z', locked: true },
    { name: 'inspector/rows', note: 'list · virtualized', glyph: 'M4 6h16M4 12h16M4 18h16', locked: false },
    { name: 'scrim/hover', note: 'overlay · pass-through', glyph: 'M12 3l9 16H3z', locked: false },
    { name: 'palette/text', note: 'tokens · 12 refs', glyph: 'M12 4a8 8 0 100 16 8 8 0 000-16z', locked: true },
  ];

  // the toolbar glyphs ride 1em so the density scale carries them
  const tools = [
    { label: 'move up', d: 'M12 19V5M5 12l7-7 7 7' },
    { label: 'move down', d: 'M12 5v14M19 12l-7 7-7-7' },
    { label: 'duplicate', d: 'M9 9h10v10H9zM5 15V5h10' },
    { label: 'delete', d: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13' },
  ];

  const derivation = `T_2xs      = T_base − 3·U/4          → 10px  (the pro-tool body; 9px stays UNSHIPPED)
L_2xs      = T_2xs × 14/10           → 14px  (integer line, the xs precedent)
G_2xs      = U × 2                   → 8px   B_2xs = G_2xs  (THE balance invariant —
                                                      the inset cannot shrink without
                                                      hurting every control at once)
S_2xs      = U × 1                   → 4px
contentGap = max(U/2, S/2)           → 2px
rowMin     = max(L + 2·S, 6·U)       → max(22, 24) = 24px  (the floor side wins —
                                                      pinned AT WCAG 2.5.8 AA)
hitMin     = max(rowMin, hitFloor)   → 24px INSIDE the scope — the ONE scoped floor
                                     (--jx-hit-floor: 6U inside [data-density='2xs'];
                                      the :root guardrail stays 7U everywhere else)
icon = L → 14px · image = 2L → 28px · media gutter = G = 8px
secondary  = max(0.625rem, T − U/4)  → 10px — DEGENERATE: equals the primary size,
                                       the role distinction dies at its floor`;

  const stampCode = `<!-- the whole opt-in: ONE attribute on the operation-surface root -->
<section data-density="2xs">
  <!-- layers list, property rows, tool palettes — every child scales -->
</section>

<!-- component opinion: the same single prop as any rung -->
<ItemGroup density="2xs"><!-- … --></ItemGroup>`;
</script>

<svelte:head>
  <title>Density 2xs · jixoai-ui</title>
  <meta
    name="description"
    content="2xs — the fifth density rung: an extreme-compactness standard for professional non-touch operation surfaces (inspector panels, data grids, tool palettes). 10px body, 14px lines, 24px rows, the one scoped hit floor (24px = WCAG 2.5.8 AA) — every value an equation from the 4px ruler, opt-in only."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="design language · density kernel (2026-09-05)"
        title="2xs — the fifth rung: operation density for pro tools"
        summary="Below xs sits one more rung, and only one: 2xs trades comfort for information density where the audience is a professional non-touch pointer user — inspector panels, data grids, tool palettes (IDE layers panels, Figma property panels). Every number is still an equation from the ruler: text 10px, lines 14px, rows 24px, and the sheet's ONE scoped law — the hit floor redeclares at 6U (24px, the WCAG 2.5.8 AA minimum) inside the scope, because a 2xs subtree is by construction a non-touch surface. Opt-in only, never the default: this page is the rung's standard and its acceptance demo."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">5 rungs</span>
          <span class="pill">T 10px · L 14px</span>
          <span class="pill">rows 24px</span>
          <span class="pill">hit 24px = scoped 6U</span>
          <span class="pill">secondary degenerates</span>
          <span class="pill">opt-in only</span>
        </div>
      </SectionCard>
    </div>

    <!-- ── the scale: live vars, measured numbers ─────────────────── -->
    <div id="scale" data-reveal="">
      <SectionCard
        family="scale"
        headerRegion="scale"
        eyebrow="the scale"
        title="Five rungs, computed live — not copied"
        summary="Every bar below consumes its --jx-* alias directly inside each rung's own [data-density] scope, and the numbers are measured used values in this very page (the kernel gate's technique in real Chromium) — move the kernel and this table moves with it; it cannot rot. G stays 8px at 2xs on purpose: the xs optical floor holds one step further down (text needs its gutter, and B = G means the inset cannot shrink alone) — the compactness comes from text and block, not the inline axis."
      >
        <div class="overflow-x-auto">
          <div class="min-w-[64rem]">
            <div
              class="grid grid-cols-[5rem_repeat(10,minmax(0,1fr))] items-end gap-x-3 gap-y-1 border-b border-border pb-2 font-nav text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              <span>rung</span>
              {#each AXES as a (a)}<span>{AXIS_HEAD[a]}</span>{/each}
            </div>
            {#each RUNGS as r (r)}
              <div data-density={r} data-scale-rung={r}>
                <!-- the measurement cluster: used-value probes, invisible -->
                <div class="pointer-events-none absolute invisible" aria-hidden="true">
                  <span data-probe="text" class="text-[length:var(--jx-text)]"></span>
                  <span
                    data-probe="line"
                    class="text-[length:var(--jx-text)] leading-[var(--jx-line)]"
                  ></span>
                  <div data-probe="gap" class="flex gap-x-[var(--jx-gap)]"></div>
                  <div data-probe="stack" class="flex flex-col gap-y-[var(--jx-stack)]"></div>
                  <div data-probe="inset" class="ps-[var(--jx-inset)]"></div>
                  <div data-probe="row-min" class="min-h-[var(--jx-row-min)]"></div>
                  <div data-probe="hit" class="min-h-[var(--jx-hit)]"></div>
                  <div data-probe="icon" class="w-[var(--jx-icon)]"></div>
                  <div data-probe="image" class="w-[var(--jx-image)]"></div>
                  <span data-probe="text-secondary" class="text-[length:var(--jx-text-secondary)]"></span>
                </div>
                <div
                  class="grid grid-cols-[5rem_repeat(10,minmax(0,1fr))] items-center gap-x-3 gap-y-2 border-b border-border/50 py-2"
                >
                  <span class="font-nav text-[11px] uppercase tracking-[0.14em]">{r}</span>
                  {#each AXES as a (a)}
                    <div class="flex items-center gap-2 overflow-hidden">
                      <div
                        class="{VERTICAL.has(a) ? 'self-end' : ''} {a === 'row-min' || a === 'hit'
                          ? 'bg-primary/70'
                          : 'bg-primary/30'} {VERTICAL.has(a)
                          ? 'w-3'
                          : 'h-3'} shrink-0 rounded-[1px]"
                        style="{VERTICAL.has(a) ? 'height' : 'width'}: var({AXIS_VAR[a]})"
                      ></div>
                      <span class="min-w-0 truncate font-mono text-[11.5px] text-muted-foreground">
                        {measured[r]?.[a] !== undefined
                          ? `${Math.round((measured[r]?.[a] ?? 0) * 10) / 10}px`
                          : '—'}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
        <ul class="mt-4 flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2">
            <span class="text-primary" aria-hidden="true">&gt;</span>
            <span>2xs's hit-min (24px) is the ONE scoped floor: <code class="text-accent">--jx-hit-floor</code>
              redeclares at 6U inside <code class="text-accent">[data-density='2xs']</code>; every other rung and
              every unpinned read keep the :root 7U guardrail (28px)</span>
          </li>
          <li class="flex gap-2">
            <span class="text-primary" aria-hidden="true">&gt;</span>
            <span>2xs's secondary text is honestly degenerate — max(0.625rem, 9px) = 10px = the primary
              size; differentiate secondary roles by ink, never by size, below xs</span>
          </li>
        </ul>
      </SectionCard>
    </div>

    <!-- ── the scene: 2xs vs default, real components ─────────────── -->
    <div id="scene" data-reveal="">
      <SectionCard
        family="scene"
        headerRegion="scene"
        eyebrow="the scene"
        title="The same inspector at 2xs and at default"
        summary="A plausible pro-tool inspector — a layers list, property rows with selects, a tool strip — built from real registry components (the Item family, Select, PressButton, Badge, Kbd). Left: the whole panel inside a 2xs scope. Right: the identical scene at default density. Nothing per-size in any component's css; one attribute moves every row."
      >
        <div class="grid gap-6 xl:grid-cols-2">
          {#snippet scene(r: Rung, caption: string)}
            <figure class="min-w-0">
              <figcaption
                class="font-nav mb-[var(--jx-stack)] block text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em] text-muted-foreground"
              >
                {caption}
              </figcaption>
              <div
                data-density={r}
                class="border border-border bg-background p-[var(--jx-inset)]"
              >
                <!-- the tool strip: hit lanes land on the scoped floor -->
                <div class="mb-[var(--jx-stack)] flex items-center gap-[var(--jx-gap)]">
                  <span class="font-nav text-[length:var(--jx-text-secondary)] uppercase tracking-[0.14em]">
                    layers
                  </span>
                  <span class="ml-auto flex gap-[var(--jx-gap)]">
                    {#each tools as t (t.label)}
                      <PressButton aria-label={t.label} title={t.label}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="size-[1.15em]"
                          aria-hidden="true"
                        >
                          <path d={t.d} />
                        </svg>
                      </PressButton>
                    {/each}
                  </span>
                </div>
                <ItemGroup mode="plain">
                  {#each layers as layer (layer.name)}
                    <Item>
                      <ItemMedia variant="icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path d={layer.glyph} />
                        </svg>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{layer.name}</ItemTitle>
                        <ItemDescription>{layer.note}</ItemDescription>
                      </ItemContent>
                      <ItemEnd>
                        {#if layer.locked}<Badge>locked</Badge>{/if}
                        <Kbd>⌥{layers.indexOf(layer) + 1}</Kbd>
                      </ItemEnd>
                    </Item>
                  {/each}
                </ItemGroup>
                <!-- property rows: real selects at the scoped footprint -->
                <div class="mt-[var(--jx-stack)] grid gap-[var(--jx-stack)] min-[420px]:grid-cols-2">
                  <Select label="blend" bind:value={blend} options={blendOptions} />
                  <Select label="fill" bind:value={fill} options={fillOptions} />
                </div>
              </div>
            </figure>
          {/snippet}
          {@render scene('2xs', 'operation surface · data-density="2xs"')}
          {@render scene('default', 'the same scene · default')}
        </div>
        <ul class="mt-4 flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2">
            <span class="text-primary" aria-hidden="true">&gt;</span>
            <span>what to see at 2xs: 24px rows (down from 40), 10px body text, 14px icons, 28px images —
              and hit lanes that stop at 24px, the scoped floor, instead of re-inflating to the 28px
              guardrail</span>
          </li>
          <li class="flex gap-2">
            <span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the two selects share one bound state with this page — the scene is live, not a
              screenshot; toggle them</span>
          </li>
        </ul>
      </SectionCard>
    </div>

    <!-- ── the law ─────────────────────────────────────────────────── -->
    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The adoption law — opt-in operation surfaces only"
        summary="2xs is a scoped tool, not a product-wide mood. FOR: professional non-touch high-density operation surfaces — inspector panels, property rows, data grids, tool palettes, layers lists — where information density IS the feature and the pointer is precise. NEVER: general marketing or docs UI, prose surfaces, touch-first flows, auth or checkout. NOT the default anywhere: DEFAULT_DENSITY stays 'default', no family fallback becomes 2xs, the canvas stage's comfortable/compact axis keeps its two stops. xs keeps its own role (dense non-touch metadata surfaces); 2xs goes further (operation surfaces) — a product can run an xs nav rail beside a 2xs inspector."
      >
        <div class="flex flex-col gap-6">
          <CodeBlock code={derivation} lang="text" meta="the 2xs derivation (design §1)" />
          <CodeBlock code={stampCode} lang="svelte" meta="the opt-in" />
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2">
              <span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the scoped floor is the sheet's ONLY scoped floor — legal because stamping
                <code class="text-accent">data-density='2xs'</code> declares the modality (professional
                non-touch pointer), the same opt-in semantics the 2026-08-29 ruling established for the
                28px guardrail; 24px still satisfies WCAG 2.5.8 AA</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary" aria-hidden="true">&gt;</span>
              <span>9px body exists in the grammar (one more −U/4 step) and stays UNSHIPPED — going
                below 10px is a new ruling, not a parameter tweak</span>
            </li>
            <li class="flex gap-2">
              <span class="text-primary" aria-hidden="true">&gt;</span>
              <span>verified: the kernel gate asserts the whole 2xs row in real Chromium
                (<code class="text-accent">node scripts/verify-density-kernel.mjs</code>), and the
                context specs lock resolution + stamping — see the change
                <code class="text-accent">openspec/changes/2026-09-05-density-2xs</code></span>
            </li>
          </ul>
        </div>
      </SectionCard>
    </div>
  </div>
</div>
