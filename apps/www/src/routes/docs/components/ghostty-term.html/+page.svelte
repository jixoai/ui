<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import GhosttyTerm from '$lib/ui/ghostty-term/ghostty-term.svelte';
  import type { GhosttyTermHandle } from '$lib/ui/ghostty-term/ghostty-term.svelte';
  import ghosttyTermSource from '$lib/ui/ghostty-term/ghostty-term.svelte?raw';
  import vtDepsSource from '$lib/ui/ghostty-term/vt-deps.ts?raw';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect, PlaySegmented, PlayToggle } from '$lib/playground';
  // community monospace faces for the playground switcher (latin subsets
  // only load via unicode-range — the page pays for what it shows)
  import '@fontsource/fira-code/400.css';
  import '@fontsource/fira-code/700.css';
  import '@fontsource/cascadia-code/400.css';
  import '@fontsource/cascadia-code/700.css';
  import '@fontsource/ibm-plex-mono/400.css';
  import '@fontsource/ibm-plex-mono/700.css';
  import '@fontsource/source-code-pro/400.css';
  import '@fontsource/source-code-pro/700.css';

  // 模板字符串里的字面 script 闭合标签会终止本组件自身的 script 扫描 —— 拼接它
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import GhosttyTerm from '@ui/ghostty-term';
  import type { GhosttyTermHandle } from '@ui/ghostty-term';

  let term = $state<GhosttyTermHandle>();
  const enc = new TextEncoder();
${close}

<!-- the container derives the grid (ResizeObserver → cols/rows) -->
<div class="h-80">
  <GhosttyTerm
    bind:this={term}
    onData={(bytes) => ptyInput.write(bytes)}
  />
</div>

<!-- write() is the pty OUTPUT side: rendered bytes feed back in -->
<button onclick={() => term?.write(enc.encode('\\u001b[1mhello\\u001b[0m\\r\\n'))}>
  write
</button>`;

  const loop = `pty output ─▶ handle.write(bytes) ─▶ wasm vtWrite ─▶ dirty rows ─▶ canvas paint
keys/paste ─▶ keyEncode + paste gate ─▶ onData(bytes) ─▶ your pty`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/ghostty-term/ghostty-term.svelte', content: ghosttyTermSource },
    { name: 'registry/files/ui/ghostty-term/vt-deps.ts', content: vtDepsSource },
    { name: 'src/lib/ui/ghostty-term-usage/ghostty-term-usage.svelte', content: usage },
  ];

  const initCode = `# 1 — the jixoai base on a tailwind v4 + vite project
npx jixoai-ui init --hue 330`;

  const registryCode = `{
  "registries": {
    "@jixoai": "https://ui.jixoai.com/r/{name}.json"
  }
}`;

  const addCode = `# ghostty-term pulls its registry deps (ghostty-vt, color-utils) with it
npx jixoai-ui add ghostty-term`;

  const pluginCode = `# 2 — the wasm supply chain (the one component that needs it)
npm i -D @jixoai/vite-plugin`;

  const viteConfigCode = `import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [sveltekit(), tailwindcss(), ...jixoai()],
};`;

  const clientTypesCode = `/// <reference types="@jixoai/vite-plugin/client" />`;

  // playground state: the page owns the shell; reset re-mounts the
  // terminal ({#key}) so the wasm boot + welcome replay from zero.
  // NOTE (batch E): declaration order here is deliberate — hoisting the
  // $state block above the demo consts keeps this page's module graph on
  // the working side of a rolldown-vite SSR resolver quirk (see the
  // batch E report); do not reorder without a full rebuild.
  const canvasInitial = { history: 0 };
  let replay = $state(0);

  // cursor playground (owner request 2026-08-28): the toggle flips the
  // prop off entirely; style `follow` defers to the application's DECSCUSR
  // (the fake shell sets underline while you type); blink off pins steady.
  let cursorOn = $state(true);
  let cursorStyle = $state('follow');
  let cursorBlink = $state(true);
  let selectionOn = $state(true);
  // fontFamily playground: `default` rides the jxoai stack (JetBrains
  // Mono); the rest are @fontsource-loaded community faces
  let fontFamily = $state('default');

  // theme presets (owner request 2026-08-28: 2 dark + 2 light) + the
  // custom color knobs — every preset is JUST a param pack for the same
  // extension points; `jixoai` rides the token defaults (theme=undefined)
  let themePreset = $state('jixoai');
  let customBg = $state('');
  let customSel = $state('');
  const themePresets: Record<string, Record<string, string> | undefined> = {
    jixoai: undefined,
    snazzy: {
      background: '#282a36',
      foreground: '#eff0eb',
      cursor: '#ff79c6',
      selectionBackground: '#44475a',
      selectionForeground: '#f8f8f2',
    },
    paper: {
      background: '#ffffff',
      foreground: '#1f2328',
      cursor: '#0969da',
      selectionBackground: '#add6ff',
      selectionForeground: '#1f2328',
    },
    solarized: {
      background: '#fdf6e3',
      foreground: '#586e75',
      cursor: '#cb4b16',
      selectionBackground: '#eee8d5',
      selectionForeground: '#073642',
    },
  };
  const themeOptions = [
    { label: 'jxoai dark', value: 'jixoai' },
    { label: 'snazzy dark', value: 'snazzy' },
    { label: 'paper light', value: 'paper' },
    { label: 'solarized light', value: 'solarized' },
  ];
  const themeProp = $derived.by(() => {
    const base = themePresets[themePreset] ?? {};
    const merged = { ...base };
    if (customBg !== '') merged.background = customBg;
    if (customSel !== '') merged.selectionBackground = customSel;
    return Object.keys(merged).length === 0 ? undefined : merged;
  });
  const fontFamilyOptions = [
    { label: 'default', value: 'default' },
    { label: 'Fira Code', value: 'Fira Code' },
    { label: 'Cascadia Code', value: 'Cascadia Code' },
    { label: 'IBM Plex Mono', value: 'IBM Plex Mono' },
    { label: 'Source Code Pro', value: 'Source Code Pro' },
  ];
  const cursorStyleOptions = [
    { label: 'follow', value: 'follow' },
    { label: 'block', value: 'block' },
    { label: 'bar', value: 'bar' },
    { label: 'underline', value: 'underline' },
  ];
  const selectionProp = $derived(selectionOn);
  const cursorProp = $derived(
    !cursorOn
      ? (false as const)
      : {
          ...(cursorStyle === 'follow' ? {} : { style: cursorStyle as 'block' | 'bar' | 'underline' }),
          ...(cursorBlink ? {} : { blink: false }),
        },
  );
  let grid = $state({ cols: 0, rows: 0 });
  let input = $state('');
  let history = $state<string[]>([]);
  let histCursor = 0;
  let booted = false;

  let term = $state<GhosttyTermHandle | undefined>(undefined);
  function resetCanvas(): void {
    input = '';
    history = [];
    histCursor = 0;
    booted = false;
    grid = { cols: 0, rows: 0 };
    replay += 1;
  }

  // ---- the live demo: a page-local fake shell (zero-network pty) -------
  const enc = new TextEncoder();
  const PROMPT = '\u001b[1;38;5;141mjixoai\u001b[0m:\u001b[38;5;81m~\u001b[0m$ ';

  const colorMatrix = (): string => {
    const fg = [30, 31, 32, 33, 34, 35, 36, 37]
      .map((code) => `\u001b[${code}m ${code} \u001b[0m`)
      .join('');
    const bg = [40, 41, 42, 43, 44, 45, 46, 47]
      .map((code) => `\u001b[${code}m ${code} \u001b[0m`)
      .join('');
    const styles = [
      '\u001b[1mbold\u001b[0m',
      '\u001b[3mitalic\u001b[0m',
      '\u001b[4munderline\u001b[0m',
      '\u001b[7mreverse\u001b[0m',
    ].join('  ');
    return `fg ${fg}\r\nbg ${bg}\r\n${styles}`;
  };

  const HELP =
    '\u001b[38;5;153mhelp\u001b[0m      this list\r\n' +
    '\u001b[38;5;153mcolor\u001b[0m     repaint the color matrix\r\n' +
    '\u001b[38;5;153mclear\u001b[0m    erase the screen (Ctrl+L too)\r\n' +
    '\u001b[38;5;153mshowcase\u001b[0m  replay the boot showcase\r\n' +
    '\u001b[38;5;244m↑/↓ recall history · Backspace edits · Ctrl+C cancels\u001b[0m\r\n';

  const emit = (text: string): void => {
    term?.write(enc.encode(text));
  };

  // ---- the xtermjs-style auto showcase (owner request 2026-08-28) ------
  // typed banner + staged supply output + spinner + progress bar, then
  // the interactive shell takes over. Ctrl+C cancels mid-show; the
  // `showcase` command and the title-bar replay button rerun it.
  // reduced-motion collapses every delay to zero.
  const cx = {
    dim: (t: string) => `\u001b[38;5;244m${t}\u001b[0m`,
    blue: (t: string) => `\u001b[38;5;153m${t}\u001b[0m`,
    purple: (t: string) => `\u001b[1;38;5;141m${t}\u001b[0m`,
    cyan: (t: string) => `\u001b[38;5;81m${t}\u001b[0m`,
    green: (t: string) => `\u001b[38;5;114m${t}\u001b[0m`,
  };
  const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
  const reducedMotion = (): boolean =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beat = (): number => (reducedMotion() ? 0 : 1);

  /** bumps to cancel: any in-flight showcase dies at its next await. */
  let showcaseRun = 0;
  /** while true, onData only admits Ctrl+C (the cancel key). */
  let showcasing = false;

  const typeOut = async (text: string, run: number): Promise<void> => {
    if (reducedMotion()) {
      emit(text);
      return;
    }
    for (const ch of text) {
      if (run !== showcaseRun) return;
      emit(ch);
      await sleep(14 + Math.random() * 42);
    }
  };

  const runShowcase = async (): Promise<void> => {
    const run = ++showcaseRun;
    showcasing = true;
    const live = (): boolean => run === showcaseRun;
    const finish = (): void => {
      showcasing = false;
      emit(PROMPT);
    };

    emit(`${cx.purple('ghostty-term')} — the live terminal surface\r\n`);
    emit(`${cx.dim('real libghostty-vt wasm · rAF dirty-row canvas · zero DOM rows')}\r\n\r\n`);
    await sleep(350 * beat());
    if (!live()) return;

    emit(PROMPT);
    await typeOut('jixoai-ui add ghostty-term', run);
    if (!live()) return;
    emit('\r\n');
    await sleep(220 * beat());

    const stages = [
      ['pin', 'resolve ghostty.pin.json → tip'],
      ['hash', 'verify sha256 517821d6… · 981 KB'],
      ['emit', 'assets/ghostty-vt-517821d6.wasm'],
      ['vt', 'ghostty_type_json → 181 exports'],
    ] as const;
    for (const [tag, line] of stages) {
      if (!live()) return;
      emit(`  ${cx.dim('supply')} ${cx.cyan(tag.padEnd(5))}${cx.dim('·')} ${line}\r\n`);
      await sleep(150 * beat());
    }

    if (beat()) {
      const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      for (let i = 0; i < 14 && live(); i++) {
        emit(`\r  ${cx.cyan(frames[i % frames.length]!)} ${cx.dim('streaming ghostty-vt.wasm…')}`);
        await sleep(75);
      }
      if (!live()) return;
      emit('\r\u001b[2K');

      const width = 26;
      for (let pct = 0; pct <= 100 && live(); pct += 4) {
        const filled = Math.round((pct / 100) * width);
        emit(`\r  ${cx.cyan(`[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`)} ${String(pct).padStart(3)}%`);
        await sleep(55);
      }
      if (!live()) return;
      emit('\r\u001b[2K');
    }

    emit(`  ${cx.green('✓')} ghostty-term ready — ${cx.dim('pin + sha256 supply · wasm never in git')}\r\n\r\n`);

    // the xtermjs.org features-box homage — framed, keyword-colored
    const edge = cx.dim('│');
    emit(
      [
        ` ${cx.dim('┌ ── features ────────────────────────────────────────────┐')}`,
        `${edge}                                                                          ${edge}`,
        `${edge}  ${cx.green('\u001b[1mreal VT core\u001b[0m')}                        ${cx.cyan('\u001b[1mgrapheme-native\u001b[0m')}              ${edge}`,
        `${edge}  the actual libghostty-vt wasm       CJK 誊 · emoji 🫡 ❤️ cluster-     ${edge}`,
        `${edge}  parses every byte you write         broken by ghostty itself        ${edge}`,
        `${edge}                                                                          ${edge}`,
        `${edge}  ${cx.purple('\u001b[1mdensity kernel\u001b[0m')}                      ${cx.blue('\u001b[1mzero-dep supply\u001b[0m')}             ${edge}`,
        `${edge}  cells derive from --jx-text/--jx-line  pin + sha256, wasm never        ${edge}`,
        `${edge}                                         enters git or your bundle     ${edge}`,
        `${edge}                                                                          ${edge}`,
        ` ${cx.dim('└──────────────────────────────────────────────────────────────────┘')}`,
        '',
      ].join('\r\n'),
    );
    emit(`${colorMatrix()}\r\n`);
    emit(
      `${cx.dim('the shell is yours — ')}${cx.blue('help')}${cx.dim(' · ')}${cx.blue('color')}${cx.dim(' · ')}${cx.blue('showcase')}${cx.dim(' · Ctrl+C cancels')}\r\n\r\n`,
    );
    finish();
  };

  const onResize = (detail: { cols: number; rows: number }): void => {
    grid = detail;
    if (booted) return;
    booted = true;
    void runShowcase();
  };

  const recall = (dir: 1 | -1): void => {
    const next = histCursor - dir;
    if (next < 0 || next > history.length) return;
    histCursor = next;
    const value = history[next] ?? '';
    emit('\b \b'.repeat(input.length));
    input = value;
    emit(value);
  };

  const submit = (): void => {
    const command = input.trim();
    input = '';
    emit('\r\n');
    if (command === '') {
      emit(PROMPT);
      return;
    }
    history.push(command);
    histCursor = history.length;
    if (command === 'help') emit(HELP + PROMPT);
    else if (command === 'color') emit(`${colorMatrix()}\r\n${PROMPT}`);
    else if (command === 'clear') emit(`\u001b[2J\u001b[H${PROMPT}`);
    else if (command === 'showcase') {
      emit('\u001b[2J\u001b[H');
      void runShowcase();
    }
    else
      emit(
        `\u001b[38;5;203mcommand not found:\u001b[0m ${command} — try \u001b[38;5;153mhelp\u001b[0m\r\n${PROMPT}`,
      );
  };

  const onData = (bytes: Uint8Array): void => {
    let i = 0;
    while (i < bytes.length) {
      const b = bytes[i]!;
      if (showcasing) {
        // mid-showcase the keyboard belongs to the show: Ctrl+C cancels,
        // everything else waits for the interactive shell at the end
        if (b === 0x03) {
          showcaseRun += 1;
          showcasing = false;
          emit(`^C\r\n${PROMPT}`);
        }
        i += 1;
        continue;
      }
      if (b === 0x1b && i + 2 < bytes.length && (bytes[i + 1] === 0x5b || bytes[i + 1] === 0x4f)) {
        const key = bytes[i + 2]!;
        if (key === 0x41) recall(1);
        else if (key === 0x42) recall(-1);
        i += 3;
        continue;
      }
      if (b === 0x0d || b === 0x0a) {
        submit();
      } else if (b === 0x7f) {
        if (input.length > 0) {
          input = input.slice(0, -1);
          emit('\b \b');
        }
      } else if (b === 0x03) {
        input = '';
        histCursor = history.length;
        emit(`^C\r\n${PROMPT}`);
      } else if (b === 0x0c) {
        emit(`\u001b[2J\u001b[H${PROMPT}${input}`);
      } else if (b >= 0x20 && b <= 0x7e) {
        const glyph = String.fromCharCode(b);
        input += glyph;
        emit(glyph);
      }
      i += 1;
    }
  };

  // ---- secondary demos: one boot write each (first onResize = ready) --
  const bootWrite = (payload: string) => {
    let done = false;
    return (handle: GhosttyTermHandle | undefined): void => {
      if (done) return;
      done = true;
      handle?.write(enc.encode(payload));
    };
  };

  const ansiLine =
    '\u001b[1mbold\u001b[0m \u001b[3mitalic\u001b[0m \u001b[31mansi 31\u001b[0m \u001b[38;2;255;102;204mtruecolor\u001b[0m — ANSI stays verbatim\r\n';

  const densityLine = (scope: string): string =>
    `\u001b[1mdensity ${scope}\u001b[0m — font + cell derive from --jx-text / --jx-line\r\n\u001b[38;5;244mstatic boot line (no onData wired)\u001b[0m`;

  let dSm = $state<GhosttyTermHandle | undefined>(undefined);
  let dDefault = $state<GhosttyTermHandle | undefined>(undefined);
  let dLg = $state<GhosttyTermHandle | undefined>(undefined);
  const bootSm = bootWrite(densityLine('sm'));
  const bootDefault = bootWrite(densityLine('default'));
  const bootLg = bootWrite(densityLine('lg'));

  let tShell = $state<GhosttyTermHandle | undefined>(undefined);
  let tCustom = $state<GhosttyTermHandle | undefined>(undefined);
  const themeLine = `shell ink/paper ← --terminal tokens\r\n${ansiLine}`;
  const bootTShell = bootWrite(themeLine);
  const bootTCustom = bootWrite(`shell ink/paper ← theme prop override\r\n${ansiLine}`);

</script>

<svelte:head>
  <title>ghostty-term · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai ghostty-term component: the live terminal surface — a DPR-aware canvas grid painted by the real libghostty-vt wasm with rAF-batched dirty-row painting, density-derived cell metrics, auto or explicit cols/rows, the onData input bridge (keyEncode, paste gate, wheel scroll), and typed error degradation through the @jixoai/vite-plugin wasm supply chain."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- ① hero -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Terminal"
        title="ghostty-term — the live wasm terminal"
        summary="The brand's live terminal surface: a canvas grid rendered by the real libghostty-vt wasm, not a DOM reimplementation. The component owns painting and geometry — DPR-aware cells derived from the density tokens, rAF-batched dirty-row repaints — while the consumer owns the pty: onData carries terminal input out (keys, gated pastes, wheel) and the bind:this write() feeds pty output back in. Load failures degrade to a data-state machine with a terminal-styled fallback, or the consumer's own face through the children slot."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">real libghostty-vt wasm</span>
          <span class="pill">rAF dirty-row canvas painting</span>
          <span class="pill">density-derived cell metrics</span>
          <span class="pill">onData input bridge</span>
          <span class="pill">typed error degradation</span>
        </div>
      </SectionCard>
    </div>

    <!-- ② workbench: the live demo -->
    <div id="ghostty-term-workbench" data-reveal="">
      <ComponentCanvas
        title="ghostty-term"
        description="The live loopback: click the terminal and type — the fake shell on this page answers through onData/write with zero network. help · color · clear · ↑ history."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/ghostty-term/ghostty-term.svelte"
        {files}
        onreset={resetCanvas}
        output={[
          { label: 'grid', value: grid.cols > 0 ? `${grid.cols}×${grid.rows}` : '—' },
          { label: 'line', value: input || '—' },
          { label: 'history', value: String(history.length) },
        ]}
      >
        <!-- xtermjs-style window chrome: traffic bar (terminal-card paint
             law) + the terminal filling the remaining height (auto mode's
             fill-host contract) + a replay affordance in the bar -->
        <div
          class="border-border bg-terminal text-terminal-foreground flex h-[380px] w-full flex-col overflow-hidden border [box-shadow:6px_6px_0_0_var(--shadow)]"
        >
          <div
            class="text-terminal-foreground/55 flex items-center gap-1.5 border-b px-3.5 py-2 font-nav text-xs tracking-[0.1em]"
          >
            <span class="h-2 w-2 flex-none border border-current bg-[oklch(0.7_0.18_25)]" aria-hidden="true"></span>
            <span class="h-2 w-2 flex-none border border-current bg-[oklch(0.85_0.17_95)]" aria-hidden="true"></span>
            <span class="h-2 w-2 flex-none border border-current bg-[oklch(0.75_0.17_150)]" aria-hidden="true"></span>
            <span class="ml-2 truncate">
              jixoai — ghostty-term{grid.cols > 0 ? ` — ${grid.cols}×${grid.rows}` : ''}
            </span>
            <button
              type="button"
              class="ml-auto flex items-center transition-colors hover:text-terminal-foreground"
              onclick={resetCanvas}
              aria-label="replay the showcase"
              title="replay the showcase"
            >
              ↻
            </button>
          </div>
          <div class="relative min-h-0 flex-1">
            {#key replay}
              <GhosttyTerm
                bind:this={term}
                {onData}
                {onResize}
                cursor={cursorProp}
                selection={selectionProp}
                fontFamily={fontFamily === 'default' ? undefined : fontFamily}
                theme={themeProp}
              />
            {/key}
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="cursor">
              <PlayToggle bind:value={cursorOn} />
            </PlayRow>
            <PlayRow label="cursor style">
              <PlaySegmented bind:value={cursorStyle} options={cursorStyleOptions} />
            </PlayRow>
            <PlayRow label="cursor blink">
              <PlayToggle bind:value={cursorBlink} />
            </PlayRow>
            <PlayRow label="selection">
              <PlayToggle bind:value={selectionOn} />
            </PlayRow>
            <PlayRow label="font">
              <PlaySelect bind:value={fontFamily} options={fontFamilyOptions} />
            </PlayRow>
            <PlayRow label="theme">
              <PlaySegmented bind:value={themePreset} options={themeOptions} />
            </PlayRow>
            <PlayRow label="custom background">
              <input
                type="color"
                class="h-6 w-10 cursor-pointer border border-border bg-transparent"
                value={customBg === '' ? '#0d1117' : customBg}
                oninput={(e) => (customBg = e.currentTarget.value)}
                aria-label="custom background color"
              />
            </PlayRow>
            <PlayRow label="custom selection">
              <input
                type="color"
                class="h-6 w-10 cursor-pointer border border-border bg-transparent"
                value={customSel === '' ? '#44475a' : customSel}
                oninput={(e) => (customSel = e.currentTarget.value)}
                aria-label="custom selection color"
              />
            </PlayRow>
            <PlayHelp>
              click the terminal to focus it, then type — the canvas owns the keyboard surface
              (<code>Tab</code> reaches it like any control). Enter runs, Backspace edits,
              <code>↑</code> recalls, Ctrl+C cancels. reset re-mounts the wasm terminal and replays
              the boot showcase.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- install prerequisites -->
    <div id="install" data-reveal="">
      <SectionCard
        family="install"
        headerRegion="install"
        eyebrow="install"
        title="Install prerequisites"
        summary="The one jixoai component with a supply-chain step: the wasm never enters git or your bundle source — the vite plugin pins its sha256, resolves it (env → cache → verified download), and hands the URL over through the virtual:jixoai-ghostty module. Two steps on a tailwind v4 + vite project:"
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-3">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"
              >1 — the jixoai base (tw4)</span
            >
            <CodeBlock code={initCode} lang="bash" meta="terminal" />
            <CodeBlock code={registryCode} lang="json" meta="components.json" />
            <CodeBlock code={addCode} lang="bash" meta="terminal" />
          </div>
          <div class="flex flex-col gap-3">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"
              >2 — the vite plugin (wasm supply)</span
            >
            <CodeBlock code={pluginCode} lang="bash" meta="terminal" />
            <CodeBlock code={viteConfigCode} lang="ts" meta="vite.config.ts" />
            <CodeBlock code={clientTypesCode} lang="ts" meta="src/vite-env.d.ts" />
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- usage -->
    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Auto sizing fills the container; explicit cols/rows fixes the grid. The consumer owns the pty loop: onData out, write in."
      >
        <div class="flex flex-col gap-4">
          <CodeBlock code={usage} lang="svelte" meta="GhosttyTerm usage" />
          <CodeBlock code={loop} lang="text" meta="the pty loop" />
        </div>
      </SectionCard>
    </div>

    <!-- failure & degradation -->
    <div id="degradation" data-reveal="">
      <SectionCard
        family="degradation"
        headerRegion="degradation"
        eyebrow="demo"
        title="Failure & degradation"
        summary="Loading is a state machine — data-state goes loading → ready | error — and a failed wasm load never crashes the page. Without a slot, the default fallback face is a terminal-styled status line; with the children slot, the consumer owns the degraded face outright."
      >
        <div class="flex flex-wrap items-start gap-6">
          <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"
              >default fallback (no slot)</span
            >
            <div class="h-40">
              <GhosttyTerm wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" />
            </div>
            <span class="text-muted-foreground text-[12.5px]"
              >role="status" face — the typed GhosttyVTError message names the failure</span
            >
          </div>
          <div class="flex min-w-64 flex-1 flex-col gap-3 border border-border p-4">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]"
              >children slot (consumer face)</span
            >
            <div class="h-40">
              <GhosttyTerm wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm">
                <div
                  class="absolute inset-0 flex items-center justify-center p-4 font-mono text-[13px] leading-5 text-terminal-foreground"
                  role="status"
                >
                  <span class="text-primary mr-2" aria-hidden="true">$</span>
                  consumer fallback — this face is the children slot
                </div>
              </GhosttyTerm>
            </div>
            <span class="text-muted-foreground text-[12.5px]"
              >the slot also covers loading/ready as a plain overlay</span
            >
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- density & theming -->
    <div id="density" data-reveal="">
      <SectionCard
        family="density"
        headerRegion="density"
        eyebrow="demo"
        title="Density & theming"
        summary="Density rides the standard token kernels: --jx-text sets the cell font, --jx-line sets the row pitch — the same explicit density prop as every jixoai component. Theming is deliberately one-sided: the theme prop (and the --terminal tokens) restyle only the SHELL paper/ink; ANSI 8/256/truecolor content colors pass through the wasm verbatim."
      >
        <div class="flex flex-col gap-6">
          <div class="flex flex-wrap gap-4">
            <div class="min-w-64 flex-1">
              <span class="font-nav text-primary mb-2 block text-[11px] uppercase tracking-[0.24em]"
                >density prop — cell metrics follow</span
              >
              <div class="flex flex-col gap-3">
                <div class="h-32">
                  <GhosttyTerm density="sm" bind:this={dSm} onResize={() => bootSm(dSm)} />
                </div>
                <div class="h-32">
                  <GhosttyTerm bind:this={dDefault} onResize={() => bootDefault(dDefault)} />
                </div>
                <div class="h-32">
                  <GhosttyTerm density="lg" bind:this={dLg} onResize={() => bootLg(dLg)} />
                </div>
              </div>
            </div>
            <div class="min-w-64 flex-1">
              <span class="font-nav text-primary mb-2 block text-[11px] uppercase tracking-[0.24em]"
                >theme — shell only, ANSI verbatim</span
              >
              <div class="flex flex-col gap-3">
                <div class="h-[9.5rem]">
                  <GhosttyTerm bind:this={tShell} onResize={() => bootTShell(tShell)} />
                </div>
                <div class="h-[9.5rem]">
                  <GhosttyTerm
                    bind:this={tCustom}
                    onResize={() => bootTCustom(tCustom)}
                    theme={{ background: '#141019', foreground: '#f0e6ff' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- accessibility -->
    <div id="accessibility" data-reveal="">
      <SectionCard
        family="accessibility"
        headerRegion="accessibility"
        eyebrow="a11y"
        title="Accessibility"
        summary="The canvas is a raster — semantics live one level up on the focused root; failures announce politely through a live status face."
      >
        <A11yTable
          keys={[]}
          aria={[
            {
              name: 'tabindex="0"',
              value: 'root',
              description: 'The root div is the keyboard surface (keydown → keyEncode); the canvas itself is aria-hidden.',
            },
            {
              name: 'aria-label',
              value: 'terminal',
              description: 'Names the surface for assistive tech — pass your own through the rest props spread.',
            },
            {
              name: 'role="status"',
              value: 'error face',
              description: 'The default degradation fallback renders as a polite status line carrying the typed error message.',
            },
            {
              name: 'data-state',
              value: 'loading | ready | error',
              description: 'The load state machine exposed as an attribute — style or assert it without touching internals.',
            },
          ]}
        />
      </SectionCard>
    </div>

    <!-- api -->
    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Props from the GhosttyTerm Props interface; the bind:this surface mirrors a pty handle. Rest props spread onto the root."
      >
        <div class="flex flex-col gap-6">
          <PropsTable
            props={[
              { name: 'cols', type: 'number', default: '—', description: 'Fixed grid columns; any explicit cols/rows (or auto={false}) switches out of auto sizing.' },
              { name: 'rows', type: 'number', default: '—', description: 'Fixed grid rows.' },
              { name: 'auto', type: 'boolean', default: 'true', description: 'Derive the grid from the container box (ResizeObserver).' },
              { name: 'fontSize', type: 'number', default: '--jx-text', description: 'Cell font size in px — must be finite positive; anything else warns once and falls back to the density token.' },
              { name: 'wasmUrl', type: 'string', default: 'virtual:jixoai-ghostty', description: 'wasm asset URL; the default resolves the vite plugin\u2019s virtual module (the install prerequisite).' },
              { name: 'theme', type: '{ background?, foreground? }', default: 'terminal tokens', description: 'Shell overrides ONLY — ANSI/256/truecolor content colors are never themed through this prop.' },
              { name: 'onData', type: '(bytes: Uint8Array) => void', default: '—', description: 'Terminal INPUT out: encoded keys, gated pastes (bind:this write feeds OUTPUT in).' },
              { name: 'onResize', type: '(detail: { cols, rows }) => void', default: '—', description: 'Fires when the auto-mode grid derivation changes.' },
              { name: 'density', type: 'Density', default: 'inherited', description: 'Explicit density for the cell metric kernels.' },
              { name: 'class', type: 'string', default: "''", description: 'Merged onto the root through cn().' },
              { name: 'children', type: 'Snippet', default: '—', description: 'Overlay slot; when provided it also replaces the default error fallback face.' },
            ]}
          />
          <PropsTable
            title="Handle (bind:this)"
            props={[
              { name: 'write', type: '(bytes: Uint8Array) => void', description: 'Feed pty OUTPUT into the terminal — rAF-batched with in-flight writes.' },
              { name: 'reset', type: '() => void', description: 'Full reset (RIS) back to a pristine grid.' },
              { name: 'resizeTo', type: '(cols: number, rows: number) => void', description: 'Imperative grid resize; an auto-mode container change overrides it on the next derivation.' },
              { name: 'snapshot', type: '() => string', description: 'Base64 terminal snapshot for diagnostics/tests (V1: encode only).' },
            ]}
          />
        </div>
      </SectionCard>
    </div>

    <!-- law 收尾 -->
    <div id="ghostty-term-law" data-reveal="">
      <SectionCard
        family="ghostty-term-law"
        headerRegion="ghostty-term-law"
        eyebrow="law"
        title="The wasm is the terminal"
        summary="Nothing re-implements VT here. The platform gives parsing, grid state and scrollback inside libghostty-vt; this component adds exactly the browser-shaped pieces around it — DPR-aware painting, density-derived metrics, the input bridge, the degradation machine."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>painting is data, not decoration: rAF batches writes, only dirty rows repaint,
            a row cache serves full repaints (theme/font changes) — no loops, no blink</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the color boundary is one-sided by design: shell paper/ink resolve from jixoai
              tokens; content colors leave the wasm verbatim — theming never rewrites user
              output</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the pty is yours: onData out, write in — the component never guesses what a
              shell is (this page’s demo is a loopback, not hidden behavior)</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>V1 bounds, stated plainly: no cursor/selection paint (the frozen vt face exposes
              no cursor read), no hyperlink activation, viewport-only scroll, and a clamped wheel
              shift where the upstream render state under-reports dirty rows</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
