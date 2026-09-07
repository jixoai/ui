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

<div class="grid gap-4 min-[980px]:grid-cols-2">
  <!-- input side -->
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-1.5">
      {#each EXAMPLES as example (example.id)}
        <button
          type="button"
          onclick={() => pick(example)}
          class="cursor-pointer rounded-sm border px-2 py-1 font-mono text-[11px] transition-colors {activeExample === example.id
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border text-muted-foreground hover:border-accent/60 hover:text-foreground'}"
        >
          {example.label}
        </button>
      {/each}
    </div>
    <label class="flex items-center gap-2 text-[12px] text-muted-foreground">
      <span class="font-nav shrink-0 uppercase tracking-[0.18em]">filename</span>
      <input
        value={filename}
        oninput={onFilenameInput}
        placeholder="(optional — feeds L1's tables verbatim)"
        spellcheck="false"
        class="w-full rounded-sm border border-border bg-background px-2 py-1.5 font-mono text-[12px] text-foreground outline-none focus:border-accent"
      />
    </label>
    <textarea
      value={code}
      oninput={onCodeInput}
      rows="12"
      spellcheck="false"
      class="w-full resize-y rounded-sm border border-border bg-background p-3 font-mono text-[12.5px] leading-5 text-foreground outline-none focus:border-accent"
    ></textarea>
    <p class="text-[12px] leading-5 text-muted-foreground">
      Detection is debounced 250 ms and re-runs the whole waterfall — no cache (design D6);
      the card below rides the REAL consumer path (lang=&quot;auto&quot; inside the wrapper),
      not a pre-computed verdict.
    </p>
  </div>

  <!-- verdict + log side -->
  <div class="flex flex-col gap-3">
    <div class="border border-border bg-muted/40 px-4 py-3">
      {#if verdict === 'pending'}
        <p class="font-mono text-[12.5px] text-muted-foreground">detecting…</p>
      {:else if verdict === 'error'}
        <p class="font-mono text-[12.5px] text-destructive">detector rejected — see console</p>
      {:else if verdict === null}
        <p class="font-mono text-[12.5px] text-muted-foreground">
          no opinion anywhere — the card stays plain text (the [detect:all] law)
        </p>
      {:else}
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="font-mono text-[15px] font-semibold text-foreground">{verdict.lang}</span>
          <span class="rounded-sm border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent">
            source: {verdict.source}
          </span>
          {#if verdict.confidence !== undefined}
            <span class="font-mono text-[11px] text-muted-foreground">
              confidence {verdict.confidence.toFixed(3)}
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="border border-border">
      <div class="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <span class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">waterfall log</span>
        <span class="font-mono text-[11px] text-muted-foreground">{traceLog.length} executed</span>
      </div>
      <ol class="divide-y divide-border">
        {#each rows as row (row.layer)}
          <li class="flex items-start gap-3 px-4 py-2.5">
            <span
              class="mt-0.5 w-24 shrink-0 font-mono text-[11px] {row.state === 'hit'
                ? 'text-accent'
                : row.state === 'miss'
                  ? 'text-foreground'
                  : 'text-muted-foreground/60'}"
            >
              {row.layer} {layerNames[row.layer]}
            </span>
            <span class="w-12 shrink-0 font-mono text-[11px] {row.state === 'hit' ? 'text-accent' : 'text-muted-foreground/60'}">
              {row.state === 'hit' ? '● hit' : row.state === 'miss' ? '○ miss' : row.state === 'skipped' ? '⤷ skip' : '—'}
            </span>
            <span class="min-w-0 flex-1 text-[12.5px] leading-5 {row.state === 'hit' || row.state === 'miss' ? 'text-foreground' : 'text-muted-foreground/60'}">
              {row.detail}
              {#if row.state === 'hit' || row.state === 'miss'}
                <span class="ml-1 font-mono text-[11px] text-muted-foreground/70">{row.ms.toFixed(1)}ms</span>
              {/if}
            </span>
          </li>
        {/each}
      </ol>
    </div>
  </div>

  <!-- the live paint: the real consumer path -->
  <div class="min-[980px]:col-span-2">
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
