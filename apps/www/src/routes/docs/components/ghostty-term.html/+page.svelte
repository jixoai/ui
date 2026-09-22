<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
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
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ── the API table's EXTRA lane (docs-eight-axes-mdn task 27) ──
  // density + theme authored rows carry axis NAMES whose family truth
  // differs from the generic universal vocabulary — the docs.extra lane
  // (same object references) exempts them from the universal fold.
  const apiDensityRow = {
    name: 'density',
    type: 'Density',
    default: "'default' · ambient scope",
    description:
      "Explicit density for the cell metric kernels (--jx-text cell font, --jx-line row pitch — measured 12/13/15px and 18/20/24px across sm/default/lg). Omitted → the ambient density scope, else the family own 'default' (the always-concrete cell math).",
  };
  const apiThemeRow = {
    name: 'theme',
    type: '{ background?, foreground?, … }',
    default: 'terminal tokens',
    description:
      'Shell overrides ONLY — the ABSENT-SLOT escape hatch (no theme = the jixoai token sheet owns every shell color, and the surface is typed-frozen: a scoped .dark moves nothing, measured). ANSI/256/truecolor CONTENT colors are never themed through this prop. The generic light/dark/system THEME AXIS is shadowed by this object — see the axes table.',
  };

  // ── the measured per-axis table (task 27) — every cell measured or
  // negative-grepped over ui/ghostty-term/ + vt-deps.ts ──
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'default' · ambient scope`,
      description:
        "CONSUMED — the cell-metric kernels ARE the density contract: the cell font rides --jx-text and the row pitch --jx-line, measured across the demo rungs (kernel ladder 12 / 13 / 15px text, 18 / 20 / 24px line at sm/default/lg; the rung stamps data-density on the family root). The family own 'default' is the always-concrete cell math — a terminal never renders unspecified. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE §11 ECHO — the stamp lands verbatim (measured root inline: --jx-size-effective: 13px; font-size: var(--jx-size-effective, 1rem); computed 13px / 18px at the demo lanes) and the cell math follows NOTHING of it: the canvas font is fontSize → --jx-text (density-governed) and the error face is the FIXED --jx-text-base voice (measured 13px at both size lanes — the nothing-follows proof). A div carries no size-like attribute (the native-wrapper §1 rule). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; no family css reads them (grep receipt: zero carrier reads in ui/ghostty-term/ + vt-deps.ts). The surface is square by the terminal law. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (grep receipt: no border-radius anywhere in the family css — the region root is the §3 concentric ANCHOR for composed chrome, the supply is the point). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-color-effective; zero readers (grep receipt). The shell ink/paper are the typed terminal tokens; the error prompt is --jx-primary; content colors are the wasm\u2019s ANSI/256/truecolor, verbatim. Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: 'SHADOWED — the shell-theme OBJECT, not the axis enum',
      default: 'terminal tokens (absent = the sheet owns the shell)',
      description:
        "THE SHADOWED SLOT (the §13 case this campaign named the ruling after): the family's theme prop is the ABSENT-SLOT escape hatch — a structured { background, foreground, selectionBackground, … } object; ABSENCE is the meaningful state (the token sheet owns every shell color). 'light'/'dark'/'system' are not lanes here. THE MEASURED SPLIT: every painted voice is a TYPED token (--jx-terminal, --jx-terminal-foreground, --jx-ring, --jx-primary) — under a scoped .dark the surface keeps the :root pole (measured: ground oklch(0.9551 0 0) and ink oklch(0 0 0) unchanged inside a dark scope while the scope's own --terminal reads the dark pole), and the CONTENT is the wasm's ANSI — absolute under any theme. A terminal is deliberately theme-independent: typed-frozen by construction, ANSI-verbatim by contract. No number lane, no enum lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-elevation-effective; zero readers in the family css (grep receipt: zero shadow declarations — the demo window\u2019s float shadow belongs to the PAGE chrome, --shadow-md on the demo shell, not the component). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-motion-effective; zero readers (grep receipt). The family declares no transitions; the cursor blink is the wasm\u2019s own state machine and painting is rAF-batched data flow, not choreography. Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare
  // (results infer); string lanes need both generics. md = 48rem
  // (the registered VIEWPORT_SCALE — cite the key, not a guess).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import GhosttyTerm from '@ui/ghostty-term';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px) applies; at 48rem+ the md case (18px)
     wins — the §11 echo the root stamps (the cell math follows the
     density kernels, not this stamp) -->
<GhosttyTerm rows={3} cols={40} size={query({ md: 18 }, 13)} wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" />`;

  const queryFiles: TreeFile[] = [
    { name: 'ghostty-term-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];
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

    <!-- ② install prerequisites (the archetype's install anchor — the one
         jixoai component with a supply-chain step) -->
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

    <!-- ③ overview (docs-eight-axes-mdn task 27, tier 2) -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The live terminal surface: a DPR-aware canvas grid painted by the real libghostty-vt wasm — the component owns paint and geometry, the consumer owns the pty, and the color boundary is deliberately one-sided."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            Nothing re-implements VT here: parsing, grid state and scrollback live inside
            libghostty-vt; the component adds the browser-shaped pieces — DPR-aware cell metrics
            derived from the density kernels, rAF-batched dirty-row repaints, and the input bridge.
            The pty is yours: <code class={cx(rt.inkPrimary)}>onData</code> carries terminal input
            out (encoded keys, gated pastes, wheel), and the bind:this
            <code class={cx(rt.inkPrimary)}>write()</code> feeds pty output back in — the page's
            demo is a loopback answering through exactly that seam, no hidden shell.
          </p>
          <p class={cx(rt.para)}>
            Degradation is a typed state machine: <code class={cx(rt.inkPrimary)}>data-state</code> goes
            loading → ready | error, a failed wasm load renders a polite
            <code class={cx(rt.inkPrimary)}>role="status"</code> face carrying the GhosttyVTError
            message, and the children slot hands the degraded face to the consumer. The supply
            chain is the install section's contract — the wasm never enters git or the bundle
            source; the vite plugin pins its sha256 and serves it through the
            <code class={cx(rt.inkPrimary)}>virtual:jixoai-ghostty</code> module.
          </p>
          <p class={cx(rt.para)}>
            The axes story is this family's signature: SEVEN of the eight axes take lanes —
            density consumed as the cell-metric kernels (the one live ladder), size the §11 echo,
            the rest stamp-and-supply — and the eighth is the §13 shadow case: the
            <code class={cx(rt.inkPrimary)}>theme</code> prop is the shell-color OBJECT (absent-slot
            escape hatch), never the light/dark/system enum. The surface is typed-frozen under
            scoped .dark by design and the content is ANSI verbatim — a terminal keeps its colors.
            Kinship: <code class={cx(rt.inkPrimary)}>terminal-card</code> (the chrome paint law this
            page's window borrows) and <code class={cx(rt.inkPrimary)}>code-card</code> (the readonly
            render-side sibling).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- ④ workbench: the live demo -->
    <div id="ghostty-term-workbench" data-region="ghostty-term-workbench" data-reveal="">
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

  <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Props from the GhosttyTerm Props interface; the bind:this surface mirrors a pty handle. Rest props spread onto the root. The generated meta carries 27 props (26 named + the synthesized rest) — the hand table serves the 11 consumer rows, with density and theme riding the EXTRA lane (reference identity): density because the family own 'default' is contract, theme because the generic light/dark/system enum is SHADOWED by the shell-object escape hatch — the carriers-bijection ruling, task 27."
      >
        <div class={cx(rt.col24)}>
          <PropsTable
            universal
            docs={{ extra: [apiDensityRow, apiThemeRow] }}
          props={[
              { name: 'cols', type: 'number', default: '—', description: 'Fixed grid columns; any explicit cols/rows (or auto={false}) switches out of auto sizing.' },
              { name: 'rows', type: 'number', default: '—', description: 'Fixed grid rows.' },
              { name: 'auto', type: 'boolean', default: 'true', description: 'Derive the grid from the container box (ResizeObserver).' },
              { name: 'fontSize', type: 'number', default: '--jx-text', description: 'Cell font size in px — must be finite positive; anything else warns once and falls back to the density token.' },
              { name: 'wasmUrl', type: 'string', default: 'virtual:jixoai-ghostty', description: 'wasm asset URL; the default resolves the vite plugin\u2019s virtual module (the install prerequisite).' },
              apiThemeRow,
              { name: 'onData', type: '(bytes: Uint8Array) => void', default: '—', description: 'Terminal INPUT out: encoded keys, gated pastes (bind:this write feeds OUTPUT in).' },
              { name: 'onResize', type: '(detail: { cols, rows }) => void', default: '—', description: 'Fires when the auto-mode grid derivation changes.' },
              apiDensityRow,
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

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on ghostty-term"
      summary="SEVEN of the eight axes take lanes — size · shape · radius · density · color · elevation · motion — and the eighth is the §13 shadow case that names the ruling: the family's own `theme` prop is the shell-color OBJECT (the absent-slot escape hatch), so the generic light/dark/system enum has no seat. Density is the one consumed ladder (the cell-metric kernels, measured 12/13/15px + 18/20/24px); size is the §11 echo with the fixed error voice as its nothing-follows proof; the shell is typed-frozen under scoped .dark by design — a terminal is deliberately theme-independent; everything else stamps-and-supplies. fontSize keeps its component-specific name (no collision, §13)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density kernel ladder, the size echo (with the fixed
          --jx-text-base error voice), and the typed-frozen split were measured
          on this page's served DOM (probe, task 27); the supply-only rows carry
          grep receipts over ui/ghostty-term/ and vt-deps.ts. The adoption is
          the census batch A row (explicit-props W3-A); the theme shadow is the
          §13 no-rename precedent (the absent-slot contract,
          ghostty-term-defaults.svelte.ts).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="ghostty-term · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <GhosttyTerm rows={3} cols={40} size={responsiveSize} wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the
                root stamp reads 13px; at 48rem and wider the md case wins —
                18px. The number lane goes bare (results infer); string lanes
                take both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
      <ComponentCanvas title="ghostty-term · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><GhosttyTerm rows={3} cols={40} size={13} density="small" wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" /></div>
        <div class={cx(rt.panel)}><GhosttyTerm rows={3} cols={40} size="large" radius="medium" wasmUrl="https://invalid.jixoai.test/ghostty-vt.wasm" /></div>
        </div>
      </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

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

    <!-- universal-props → the eight axes (task 27): the measured table.
         The theme row is the §13 shadow story; the rest measure or
         negative-grep. -->
    <!-- see-also -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="ghostty-term" />
    </div>
  </div>
</div>
