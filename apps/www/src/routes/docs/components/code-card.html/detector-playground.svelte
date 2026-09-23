<script
  lang="ts"
  module
>
  import type { DetectResult } from '$lib/highlight/lang-detector';
  import type { DetectTraceEvent } from '$lib/highlight/default-detector';

  /** the input side of an example chip */
  interface DetectExample {
    id: string;
    label: string;
    filename: string;
    code: string;
  }

  /** one rendered waterfall row (event-backed, or inferred skipped/absent) */
  interface TraceRow {
    layer: 'L1' | 'L2' | 'L3' | 'L4';
    state: 'hit' | 'miss' | 'skipped' | 'absent';
    detail: string;
    ms: number;
  }
</script>

<script lang="ts">
  import CodeCard from '$lib/ui/code-card';
  import HighlightDetectDefault from '$lib/ui/highlight-detect-default';
  import { AUTO_LANG, defaultLangDetector } from '$lib/highlight/default-detector';
  import { rt } from '$lib/surface/routes.stylex';

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  /**
   * The detection lab (site-only, 2026-09-07): type code (or pick an
   * example, or name a file) and the TRACED DLD runs live — one log row
   * per executed layer with its verdict, reason, and wall time; layers
   * after the hit render as skipped (they never ran — the short-circuit
   * is the log's negative space). The card below paints through the
   * REAL consumer path: lang={AUTO_LANG} inside the wrapper, its own
   * waterfall run — the lab never feeds the card a pre-computed lang.
   */

  const EXAMPLES: DetectExample[] = [
    {
      id: 'filename',
      label: 'L1 · main.ts',
      filename: 'main.ts',
      code: `import { detect } from '@jixoai/highlight-lang-detector';\nconst answer = detect('main.ts'); // the extension table answers here`,
    },
    {
      id: 'shebang',
      label: 'L2 · shebang',
      filename: '',
      code: `#!/usr/bin/env python3\nimport pathlib, sys\nfor p in sorted(pathlib.Path(sys.argv[1]).glob('*.md')):\n    print(p.read_text()[:80])`,
    },
    {
      id: 'structure',
      label: 'L3 · JSON',
      filename: '',
      code: `{\n  "lane": "L3",\n  "why": "no filename, no shebang — the body's shape answers",\n  "probes": ["svg", "xml", "json", "yaml", "toml", "ini"]\n}`,
    },
    {
      id: 'markdown-guard',
      label: 'L3 guard · fenced rust',
      filename: '',
      code: `# Build notes\n\nThe markdown guard keeps this page OUT of L3 (markdown never becomes xml):\n\n\`\`\`rust\nfn main() {\n    let samples = vec![1, 2, 3];\n    println!("{:?}", samples.iter().sum::<u32>());\n}\n\`\`\`\n\nStatistics below take over.`,
    },
    {
      id: 'statistical',
      label: 'L4 · shell',
      filename: '',
      code: `set -euo pipefail\n# no filename, no shebang, no structural shape — the wasm answers:\n# betlang's calibrated top label is Shell, the authority table maps it\n# to bash, and the card paints it with whatever engine is selected\nnpx jixoai-ui add @jixoai/highlight-lang-detector`,
    },
    {
      id: 'prose',
      label: '∅ · plain prose',
      filename: '',
      code: `just words about nothing in particular,\nno table, no bang, no shape, and not enough signal\nfor the statistics to commit — every layer says no opinion`,
    },
  ];

  let activeExample = $state('statistical');
  let code = $state(EXAMPLES[4].code);
  let filename = $state(EXAMPLES[4].filename);
  let verdict = $state<DetectResult | null | 'pending' | 'error'>(null);
  let traceLog = $state<DetectTraceEvent[]>([]);

  function pick(example: DetectExample): void {
    activeExample = example.id;
    code = example.code;
    filename = example.filename;
  }

  function onCodeInput(event: Event & { currentTarget: HTMLTextAreaElement }): void {
    code = event.currentTarget.value;
    activeExample = '';
  }

  function onFilenameInput(event: Event & { currentTarget: HTMLInputElement }): void {
    filename = event.currentTarget.value;
    activeExample = '';
  }

  // the traced detector — same waterfall the card below rides, plus
  // one advisory event per executed layer
  const labDetector = defaultLangDetector({
    onTrace: (event) => {
      traceLog = [...traceLog, event];
    },
  });

  // debounced live detection (client only — $effect never runs SSR-side,
  // the prerendered page carries the initial static state)
  let runToken = 0;
  $effect(() => {
    const body = code;
    const name = filename;
    const mine = ++runToken;
    const timer = setTimeout(() => {
      traceLog = [];
      verdict = 'pending';
      labDetector
        .detect({ code: body, filename: name === '' ? undefined : name })
        .then((result) => {
          if (mine !== runToken) return;
          verdict = result;
        })
        .catch(() => {
          if (mine !== runToken) return;
          verdict = 'error';
        });
    }, 250);
    return () => clearTimeout(timer);
  });

  // the rendered rows: events as they came, then skipped below the hit,
  // L1 absent when no filename was given
  const rows = $derived.by(() => {
    const seen = new Map(traceLog.map((e) => [e.layer, e]));
    const out: TraceRow[] = [];
    let hitSeen = false;
    for (const layer of ['L1', 'L2', 'L3', 'L4'] as const) {
      const event = seen.get(layer);
      if (event !== undefined) {
        out.push({ layer, state: event.outcome, detail: event.detail, ms: event.ms });
        if (event.outcome === 'hit') hitSeen = true;
      } else if (layer === 'L1' && filename === '') {
        out.push({ layer, state: 'absent', detail: 'no filename given — the table never consulted', ms: 0 });
      } else if (hitSeen) {
        out.push({ layer, state: 'skipped', detail: 'short-circuited — zero bytes loaded', ms: 0 });
      }
    }
    return out;
  });

  const layerNames: Record<TraceRow['layer'], string> = {
    L1: 'filename',
    L2: 'shebang',
    L3: 'structure',
    L4: 'statistical',
  };
</script>

<div class={cx(rt.dpgGrid)}>
  <!-- input side -->
  <div class={cx(rt.col12)}>
    <div class={cx(rt.flex, rt.wrap, rt.itemsCenter, rt.gap6)}>
      {#each EXAMPLES as example (example.id)}
        <button
          type="button"
          onclick={() => pick(example)}
          class={cx(rt.cursorPointer, rt.radius0, rt.frameW, rt.px8, rt.py4, rt.fontMono, rt.text11, rt.transitionColors, activeExample === example.id ? rt.dpgBtnOn : rt.dpgBtnOff)}
        >
          {example.label}
        </button>
      {/each}
    </div>
    <label class={cx(rt.rowC8, rt.text12, rt.inkMuted)}>
      <span class={cx(rt.fontNav, rt.shrink0, rt.upper, rt.track18)}>filename</span>
      <input
        value={filename}
        oninput={onFilenameInput}
        placeholder="(optional — feeds L1's tables verbatim)"
        spellcheck="false"
        class={cx(rt.wFull, rt.radius0, rt.frame, rt.bgBackground, rt.px8, rt.py6, rt.fontMono, rt.text12, rt.inkFg, rt.dpgFieldFocus)}
      />
    </label>
    <textarea
      value={code}
      oninput={onCodeInput}
      rows="12"
      spellcheck="false"
      class={cx(rt.wFull, rt.dpgResizeY, rt.radius0, rt.frame, rt.bgBackground, rt.p12, rt.fontMono, rt.text125, rt.lead5, rt.inkFg, rt.dpgFieldFocus)}
    ></textarea>
    <p class={cx(rt.text12, rt.lead5, rt.inkMuted)}>
      Detection is debounced 250 ms and re-runs the whole waterfall — no cache (design D6);
      the card below rides the REAL consumer path (lang=&quot;auto&quot; inside the wrapper),
      not a pre-computed verdict.
    </p>
  </div>

  <!-- verdict + log side -->
  <div class={cx(rt.col12)}>
    <div class={cx(rt.frame, rt.bgMuted40, rt.px16, rt.py12)}>
      {#if verdict === 'pending'}
        <p class={cx(rt.fontMono, rt.text125, rt.inkMuted)}>detecting…</p>
      {:else if verdict === 'error'}
        <p class={cx(rt.fontMono, rt.text125, rt.dpgInkDestructive)}>detector rejected — see console</p>
      {:else if verdict === null}
        <p class={cx(rt.fontMono, rt.text125, rt.inkMuted)}>
          no opinion anywhere — the card stays plain text (the [detect:all] law)
        </p>
      {:else}
        <div class={cx(rt.flex, rt.wrap, rt.itemsBaseline, rt.gapX12, rt.gapY4)}>
          <span class={cx(rt.fontMono, rt.text15, rt.semibold, rt.inkFg)}>{verdict.lang}</span>
          <span class={cx(rt.dpgChip, rt.radius0, rt.px6, rt.py2, rt.fontMono, rt.text11, rt.inkAccent)}>
            source: {verdict.source}
          </span>
          {#if verdict.confidence !== undefined}
            <span class={cx(rt.fontMono, rt.text11, rt.inkMuted)}>
              confidence {verdict.confidence.toFixed(3)}
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <div class={cx(rt.frame)}>
      <div class={cx(rt.flex, rt.itemsCenter, rt.justifyBetween, rt.bBorder, rt.bgMuted40, rt.px16, rt.py8)}>
        <span class={cx(rt.eyebrow, rt.inkMuted)}>waterfall log</span>
        <span class={cx(rt.fontMono, rt.text11, rt.inkMuted)}>{traceLog.length} executed</span>
      </div>
      <ol>
        {#each rows as row, i (row.layer)}
          <li class={cx(rt.flex, rt.itemsStart, rt.gap12, rt.px16, rt.py10, i > 0 ? rt.tBorder : undefined)}>
            <span
              class={cx(rt.dpgMt2, rt.dpgW96, rt.shrink0, rt.fontMono, rt.text11, row.state === 'hit'
                ? rt.inkAccent
                : row.state === 'miss'
                  ? rt.inkFg
                  : rt.inkMuted60)}
            >
              {row.layer} {layerNames[row.layer]}
            </span>
            <span class={cx(rt.dpgW48, rt.shrink0, rt.fontMono, rt.text11, row.state === 'hit' ? rt.inkAccent : rt.inkMuted60)}>
              {row.state === 'hit' ? '● hit' : row.state === 'miss' ? '○ miss' : row.state === 'skipped' ? '⤷ skip' : '—'}
            </span>
            <span class={cx(rt.minW0, rt.grow, rt.text125, rt.lead5, row.state === 'hit' || row.state === 'miss' ? rt.inkFg : rt.inkMuted60)}>
              {row.detail}
              {#if row.state === 'hit' || row.state === 'miss'}
                <span class={cx(rt.ml4, rt.fontMono, rt.text11, rt.inkMuted70)}>{row.ms.toFixed(1)}ms</span>
              {/if}
            </span>
          </li>
        {/each}
      </ol>
    </div>
  </div>

  <!-- the live paint: the real consumer path -->
  <div class={cx(rt.dpgSpan2)}>
    <HighlightDetectDefault>
      <CodeCard
        lang={AUTO_LANG}
        filename={filename}
        code={code}
        copyable={false}
        maxHeight="14rem"
      />
    </HighlightDetectDefault>
  </div>
</div>
