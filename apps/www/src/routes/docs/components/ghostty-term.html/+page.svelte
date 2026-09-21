<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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

  // ---- the universal props demo (explicit-props W3-A) --------------------
  const universalUsage = `<!-- ghostty-term: 7 of the 8 axes — 'theme' stays the family's own
     shell-theme OBJECT (background/foreground/…), never the axis enum;
     fontSize keeps its component-specific name (no collision) -->
<GhosttyTerm rows={3} cols={40} size={13} density="small" />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/ghostty-term-universal.svelte', content: universalUsage },
  ];

  const files: TreeFile[] = [
    { name: 'registry/files/ui/ghostty-term/ghostty-term.svelte', content: ghosttyTermSource },
    { name: 'registry/files/ui/ghostty-term/vt-deps.ts', content: vtDepsSource },
    { name: 'src/lib/ui/ghostty-term-usage/ghostty-term-usage.svelte', content: usage },
  ];

  // ---- canvas-everywhere sweep (2026-09-08): usage mirrors for the
  // degradation + density SectionCard demos below — hand-authored to
  // match each stage's markup minus the page-local boot machinery
  // (same-source migration is the recorded follow-up).
  const ghosttyDegradationDemo = `<script lang="ts">
  import GhosttyTerm from '@ui/ghostty-term';
${close}

<!-- a failed wasm load never crashes the page: without a slot the
     default fallback face is a terminal-styled status line -->
<div class="h-40">
  <GhosttyTerm wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" />
</div>

<!-- with the children slot, the consumer owns the degraded face outright -->
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
</div>`;

  const ghosttyDensityDemo = `<script lang="ts">
  import GhosttyTerm from '@ui/ghostty-term';
${close}

<!-- the density prop: --jx-text sets the cell font, --jx-line the pitch -->
<div class="h-32"><GhosttyTerm density="sm" /></div>
<div class="h-32"><GhosttyTerm /></div>
<div class="h-32"><GhosttyTerm density="lg" /></div>

<!-- theme restyles only the SHELL paper/ink; ANSI passes verbatim -->
<div class="h-[9.5rem]"><GhosttyTerm /></div>
<div class="h-[9.5rem]">
  <GhosttyTerm theme={{ background: '#141019', foreground: '#f0e6ff' }} />
</div>`;

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
npm i -D @jixoai/ui-vite-plugin`;

  const viteConfigCode = `import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/ui-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [sveltekit(), tailwindcss(), ...jixoai()],
};`;

  const clientTypesCode = `/// <reference types="@jixoai/ui-vite-plugin/client" />`;

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
  // mouse-reporting routing (terminal-input-p0 design D3): off forces the
  // LOCAL behavior (selection/scroll) even under active tracking; on lets a
  // tracking-enabled pty own the mouse — Shift always bypasses either way
  let mouseOn = $state(true);
  // fontFamily playground: `default` rides the jixoai stack (JetBrains
  // Mono); the rest are @fontsource-loaded community faces
  let fontFamily = $state('default');

  // theme presets (owner request 2026-08-28: 2 dark + 2 light) + the
  // custom color knobs — every preset is JUST a param pack for the same
  // extension points. `jixoai` pins BOTH dark shell colors explicitly:
  // --terminal-foreground follows the SITE's light/dark mode, so a
  // bg-pinned-dark preset riding the token rendered black ink on black
  // paper under a light site (2026-09-04).
  let themePreset = $state('jixoai');
  let customBg = $state('#161616');
  let customSel = $state('#3a3f4b');
  // switching presets RESEEDS the custom pickers with the preset's own
  // bg/selection colors (owner request 2026-08-28: the pickers follow the
  // theme, tweaking one then overrides just that knob). jixoai's pair is
  // the dark-mode --terminal tokens in sRGB (#161616 / #ffffff); its
  // selection default is classic inverse, so the picker seeds a matching
  // muted paper.
  $effect(() => {
    const preset = themePresets[themePreset];
    customBg = preset.background;
    customSel = preset.selectionBackground ?? '#3a3f4b';
  });
  const themePresets: Record<string, Record<string, string>> = {
    jixoai: {
      background: '#161616',
      foreground: '#ffffff',
    },
    snazzy: {
      background: '#282a36',
      foreground: '#eff0eb',
      cursor: '#ff79c6',
      selectionBackground: '#44475a',
    },
    paper: {
      background: '#ffffff',
      foreground: '#1f2328',
      cursor: '#0969da',
      selectionBackground: '#add6ff',
    },
    solarized: {
      background: '#fdf6e3',
      foreground: '#586e75',
      cursor: '#cb4b16',
      selectionBackground: '#eee8d5',
    },
  };
  const themeOptions = [
    { label: 'jixoai dark', value: 'jixoai' },
    { label: 'snazzy dark', value: 'snazzy' },
    { label: 'paper light', value: 'paper' },
    { label: 'solarized light', value: 'solarized' },
  ];
  const themeProp = $derived.by(() => {
    const preset = themePresets[themePreset];
    // customs are preset-seeded and user-tweaked — they ARE the bg/selection
    return {
      ...preset,
      background: customBg,
      selectionBackground: customSel,
    };
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
  // window-chrome title (terminal-input-p0 design D4): the fake pty sets it
  // via OSC 0 right before its prompt; onTitleChange mirrors it into the bar
  let termTitle = $state('');
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
    termTitle = '';
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
    '\u001b[38;5;244mthe shell titles the window (OSC 0) · Shift bypasses mouse reporting\u001b[0m\r\n' +
    '\u001b[38;5;244m↑/↓ recall history · Backspace edits · Ctrl+C cancels\u001b[0m\r\n';

  const emit = (text: string): void => {
    term?.write(enc.encode(text));
  };

  // ---- the xtermjs-style auto showcase (owner request 2026-08-28) ------
  // typed banner + staged supply output + spinner + progress bar, then
  // the interactive shell takes over. Ctrl+C cancels mid-show; the
  // `showcase` command and the title-bar replay button rerun it.
  // reduced-motion collapses every delay to zero.
  const ink = {
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
      // the fake pty names itself ONCE, right before handing over the
      // prompt: the OSC 0 sequence rides the same write stream and
      // onTitleChange mirrors it into the window chrome (design D4)
      emit('\u001b]0;interactive shell\u0007');
      emit(PROMPT);
    };

    emit(`${ink.purple('ghostty-term')} — the live terminal surface\r\n`);
    emit(`${ink.dim('real libghostty-vt wasm · rAF dirty-row canvas · zero DOM rows')}\r\n\r\n`);
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
      emit(`  ${ink.dim('supply')} ${ink.cyan(tag.padEnd(5))}${ink.dim('·')} ${line}\r\n`);
      await sleep(150 * beat());
    }

    if (beat()) {
      const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      for (let i = 0; i < 14 && live(); i++) {
        emit(`\r  ${ink.cyan(frames[i % frames.length]!)} ${ink.dim('streaming ghostty-vt.wasm…')}`);
        await sleep(75);
      }
      if (!live()) return;
      emit('\r\u001b[2K');

      const width = 26;
      for (let pct = 0; pct <= 100 && live(); pct += 4) {
        const filled = Math.round((pct / 100) * width);
        emit(`\r  ${ink.cyan(`[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`)} ${String(pct).padStart(3)}%`);
        await sleep(55);
      }
      if (!live()) return;
      emit('\r\u001b[2K');
    }

    emit(`  ${ink.green('✓')} ghostty-term ready — ${ink.dim('pin + sha256 supply · wasm never in git')}\r\n\r\n`);

    // the xtermjs.org features-box homage — framed, keyword-colored
    const edge = ink.dim('│');
    emit(
      [
        ` ${ink.dim('┌ ── features ────────────────────────────────────────────┐')}`,
        `${edge}                                                                          ${edge}`,
        `${edge}  ${ink.green('\u001b[1mreal VT core\u001b[0m')}                        ${ink.cyan('\u001b[1mgrapheme-native\u001b[0m')}              ${edge}`,
        `${edge}  the actual libghostty-vt wasm       CJK 誊 · emoji 🫡 ❤️ cluster-     ${edge}`,
        `${edge}  parses every byte you write         broken by ghostty itself        ${edge}`,
        `${edge}                                                                          ${edge}`,
        `${edge}  ${ink.purple('\u001b[1mdensity kernel\u001b[0m')}                      ${ink.blue('\u001b[1mzero-dep supply\u001b[0m')}             ${edge}`,
        `${edge}  cells derive from --jx-text/--jx-line  pin + sha256, wasm never        ${edge}`,
        `${edge}                                         enters git or your bundle     ${edge}`,
        `${edge}                                                                          ${edge}`,
        ` ${ink.dim('└──────────────────────────────────────────────────────────────────┘')}`,
        '',
      ].join('\r\n'),
    );
    emit(`${colorMatrix()}\r\n`);
    emit(
      `${ink.dim('the shell is yours — ')}${ink.blue('help')}${ink.dim(' · ')}${ink.blue('color')}${ink.dim(' · ')}${ink.blue('showcase')}${ink.dim(' · Ctrl+C cancels')}\r\n\r\n`,
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Ghostty term · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai ghostty-term component: the live terminal surface — a DPR-aware canvas grid painted by the real libghostty-vt wasm with rAF-batched dirty-row painting, density-derived cell metrics, auto or explicit cols/rows, the onData input bridge (keyEncode, paste gate, IME composition, mouse reporting, OSC 52 clipboard), and typed error degradation through the @jixoai/ui-vite-plugin wasm supply chain."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <!-- ① hero -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Terminal"
        title="ghostty-term — the live wasm terminal"
        summary="The brand's live terminal surface: a canvas grid rendered by the real libghostty-vt wasm, not a DOM reimplementation. The component owns painting and geometry — DPR-aware cells derived from the density tokens, rAF-batched dirty-row repaints — while the consumer owns the pty: onData carries terminal input out (keys, gated pastes, wheel) and the bind:this write() feeds pty output back in. Load failures degrade to a data-state machine with a terminal-styled fallback, or the consumer's own face through the children slot."
      >
        <div class={cx(rt.wrap12)}>
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
             fill-host contract) + a replay affordance in the bar. The
             window floats on the shadow-md utility (--shadow-md, the
             elevation grammar's float tier — F-7 2026-09-02: the old
             6px arbitrary variant was hardcoded geometry OFF the tokens,
             and var(--shadow) is a shadow LIST not a color, so the
             declaration actually computed to none) -->
        <div
          class={cx(rt.ghDemoShell)}
        >
          <div
            class={cx(rt.rowC6, rt.inkTermFg55, rt.bBorderW, rt.px14, rt.py8, rt.fontNav, rt.text12, rt.track10)}
          >
            <span class={cx(rt.ghDotRed)} aria-hidden="true"></span>
            <span class={cx(rt.ghDotYellow)} aria-hidden="true"></span>
            <span class={cx(rt.ghDotGreen)} aria-hidden="true"></span>
            <span class={cx(rt.ml8, rt.truncate)}>
              {termTitle || 'jixoai — ghostty-term'}{grid.cols > 0 ? ` — ${grid.cols}×${grid.rows}` : ''}
            </span>
            <button
              type="button"
              class={cx(rt.ghTitleBtn)}
              onclick={resetCanvas}
              aria-label="replay the showcase"
              title="replay the showcase"
            >
              ↻
            </button>
          </div>
          <div class={cx(rt.relative, rt.minH0, rt.grow)}>
            {#key replay}
              <GhosttyTerm
                bind:this={term}
                {onData}
                {onResize}
                cursor={cursorProp}
                selection={selectionProp}
                mouse={mouseOn}
                onTitleChange={(t: string) => (termTitle = t)}
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
            <PlayRow label="mouse reporting">
              <PlayToggle bind:value={mouseOn} />
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
                class={cx(rt.ghBtn)}
                value={customBg}
                oninput={(e) => (customBg = e.currentTarget.value)}
                aria-label="custom background color"
              />
            </PlayRow>
            <PlayRow label="custom selection">
              <input
                type="color"
                class={cx(rt.ghBtn)}
                value={customSel}
                oninput={(e) => (customSel = e.currentTarget.value)}
                aria-label="custom selection color"
              />
            </PlayRow>
            <PlayHelp>
              click the terminal to focus it, then type — the canvas owns the keyboard surface
              (<code>Tab</code> reaches it like any control). Enter runs, Backspace edits,
              <code>↑</code> recalls, Ctrl+C cancels. reset re-mounts the wasm terminal and replays
              the boot showcase. OSC 52 clipboard: a pty may <em>write</em> the clipboard (1 MiB
              decoded cap by default) but <em>reads are denied</em> until clipboardReadFrom opts in
              — the xterm security model.
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
        <div class={cx(rt.col20)}>
          <div class={cx(rt.col12)}>
            <span class={cx(rt.eyebrowPrimary)}
              >1 — the jixoai base (tw4)</span
            >
            <CodeBlock code={initCode} lang="bash" meta="terminal" />
            <CodeBlock code={registryCode} lang="json" meta="components.json" />
            <CodeBlock code={addCode} lang="bash" meta="terminal" />
          </div>
          <div class={cx(rt.col12)}>
            <span class={cx(rt.eyebrowPrimary)}
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
        <div class={cx(rt.col16)}>
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
        <ComponentCanvas
          title="ghostty-term · degradation"
          stage="fill"
          files={[{ name: 'ghostty-term-degradation-demo.svelte', content: ghosttyDegradationDemo, kind: 'usage' }]}
        >
          <div class={cx(rt.wrapStart24)}>
            <div class={cx(rt.col12, rt.panel, rt.minW64, rt.grow)}>
              <span class={cx(rt.eyebrowPrimary)}
                >default fallback (no slot)</span
              >
              <div class={cx(rt.ghStage40)}>
                <GhosttyTerm wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" />
              </div>
              <span class={cx(rt.noteSmall)}
                >role="status" face — the typed GhosttyVTError message names the failure</span
              >
            </div>
            <div class={cx(rt.col12, rt.panel, rt.minW64, rt.grow)}>
              <span class={cx(rt.eyebrowPrimary)}
                >children slot (consumer face)</span
              >
              <div class={cx(rt.ghStage40)}>
                <GhosttyTerm wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm">
                  <div
                    class={cx(rt.absolute, rt.inset0, rt.flex, rt.itemsCenter, rt.justifyCenter, rt.p16, rt.fontMono, rt.text13, rt.lead5, rt.inkTermFg)}
                    role="status"
                  >
                    <span class={cx(rt.inkPrimary, rt.mr8)} aria-hidden="true">$</span>
                    consumer fallback — this face is the children slot
                  </div>
                </GhosttyTerm>
              </div>
              <span class={cx(rt.noteSmall)}
                >the slot also covers loading/ready as a plain overlay</span
              >
            </div>
          </div>
        </ComponentCanvas>
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
        <div class={cx(rt.col24)}>
          <ComponentCanvas
            title="ghostty-term · density"
            stage="fill"
            files={[{ name: 'ghostty-term-density-demo.svelte', content: ghosttyDensityDemo, kind: 'usage' }]}
          >
            <div class={cx(rt.wrap16)}>
              <div class={cx(rt.minW64, rt.grow)}>
                <span class={cx(rt.eyebrowPrimary, rt.mb8, rt.block)}
                  >density prop — cell metrics follow</span
                >
                <div class={cx(rt.col12)}>
                  <div class={cx(rt.ghStage32)}>
                    <GhosttyTerm density="sm" bind:this={dSm} onResize={() => bootSm(dSm)} />
                  </div>
                  <div class={cx(rt.ghStage32)}>
                    <GhosttyTerm bind:this={dDefault} onResize={() => bootDefault(dDefault)} />
                  </div>
                  <div class={cx(rt.ghStage32)}>
                    <GhosttyTerm density="lg" bind:this={dLg} onResize={() => bootLg(dLg)} />
                  </div>
                </div>
              </div>
              <div class={cx(rt.minW64, rt.grow)}>
                <span class={cx(rt.eyebrowPrimary, rt.mb8, rt.block)}
                  >theme — shell only, ANSI verbatim</span
                >
                <div class={cx(rt.col12)}>
                  <div class={cx(rt.ghStage152)}>
                    <GhosttyTerm bind:this={tShell} onResize={() => bootTShell(tShell)} />
                  </div>
                  <div class={cx(rt.ghStage152)}>
                    <GhosttyTerm
                      bind:this={tCustom}
                      onResize={() => bootTCustom(tCustom)}
                      theme={{ background: '#141019', foreground: '#f0e6ff' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ComponentCanvas>
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
    <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The universal axis surface (explicit-props) — SEVEN of the eight axes here: size · shape · radius · density · color · elevation · motion take named steps, auto (inherit; stamps nothing), exact numbers, or query(). The theme axis is SHADOWED by the family's own `theme` prop (the terminal shell-theme OBJECT — background/foreground/…), and fontSize keeps its component-specific name (no collision, §13)."
    >
      <ComponentCanvas title="ghostty-term · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><GhosttyTerm rows={3} cols={40} size={13} density="small" wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" /></div>
        <div class={cx(rt.panel)}><GhosttyTerm rows={3} cols={40} size="large" radius="medium" wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" /></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Props from the GhosttyTerm Props interface; the bind:this surface mirrors a pty handle. Rest props spread onto the root."
      >
        <div class={cx(rt.col24)}>
          <PropsTable
            universal
          props={[
              { name: 'cols', type: 'number', default: '—', description: 'Fixed grid columns; any explicit cols/rows (or auto={false}) switches out of auto sizing.' },
              { name: 'rows', type: 'number', default: '—', description: 'Fixed grid rows.' },
              { name: 'auto', type: 'boolean', default: 'true', description: 'Derive the grid from the container box (ResizeObserver).' },
              { name: 'fontSize', type: 'number', default: '--jx-text', description: 'Cell font size in px — must be finite positive; anything else warns once and falls back to the density token.' },
              { name: 'wasmUrl', type: 'string', default: 'virtual:jixoai-ghostty', description: 'wasm asset URL; the default resolves the vite plugin\u2019s virtual module (the install prerequisite).' },
              { name: 'theme', type: '{ background?, foreground? }', default: 'terminal tokens', description: 'Shell overrides ONLY — ANSI/256/truecolor content colors are never themed through this prop.' },
              { name: 'onData', type: '(bytes: Uint8Array) => void', default: '—', description: 'Terminal INPUT out: encoded keys, gated pastes (bind:this write feeds OUTPUT in).' },
              { name: 'onResize', type: '(detail: { cols, rows }) => void', default: '—', description: 'Fires when the auto-mode grid derivation changes.' },
              { name: 'density', type: 'Density', default: "'default' · ambient scope", description: 'Explicit density for the cell metric kernels. Omitted → the ambient density scope, else the family own \'default\' (the always-concrete cell math).' },
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
        <ul class={cx(rt.col8, rt.body13)}>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>painting is data, not decoration: rAF batches writes, only dirty rows repaint,
            a row cache serves full repaints (theme/font changes) — no loops, no blink</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the color boundary is one-sided by design: shell paper/ink resolve from jixoai
              tokens; content colors leave the wasm verbatim — theming never rewrites user
              output</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>the pty is yours: onData out, write in — the component never guesses what a
              shell is (this page’s demo is a loopback, not hidden behavior)</span></li>
          <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>V1 bounds, stated plainly: no cursor/selection paint (the frozen vt face exposes
              no cursor read), no hyperlink activation, viewport-only scroll, and a clamped wheel
              shift where the upstream render state under-reports dirty rows</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
