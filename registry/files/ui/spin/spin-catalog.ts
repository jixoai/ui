// GENERATED — do not edit (writer: scripts/curate-spin-catalog.mjs,
// data: cli-spinners@2.9.2 MIT — sindresorhus, ora's spinner corpus).
// spin-ora-svg-lane C1, 2026-09-11; timing pairs review round 4, 2026-09-12.
//
// Intents:
// 1. the frozen text corpus — frames VERBATIM from the corpus (never
//    hand-transcribed; braille glyphs are transcription traps); re-run
//    the curator to reproduce these bytes.
// 2. pure data — zero imports; installs with the registry:ui spin family.
//
// Curation rule: every cli-spinners@2.9.2 entry whose frames carry no
// emoji-presentation characters (no codepoint ≥ U+1F000, no U+FE0F, no
// BMP Emoji_Presentation=Yes — the standard ranges embedded in the
// curator; a blanket 0x2600-0x27bf range is WRONG: ✶✸✹✺ dingbats and the
// ☰ trigrams are text presentation and stay), ≤ 30 frames, ≤ 10ch wide.
// Excluded by name: bouncingBar — its frames are [ ] bracket art, the
// wrapping decoration this change kills (Owner ruling #1); circle — Owner
// removal (round 5).

// The timing pairs are HAND-TUNED (review round 4): interval/linger
// in ms — the five Owner pairs (dots 80/160, dots2 120/0, pipe
// 120/120, line 160/0, simpleDots 160/160) verbatim, the rest
// family-curation. interval 'auto' / linger 'auto' on <Spin>
// resolve THESE values; explicit numbers override.
export interface TextSpinner {
  readonly frames: readonly string[];
  readonly interval: number;
  readonly linger: number;
  /** the opacity animation mode — 'end' (default): fade-out tail;
   *  'start': fade-in entry, discrete exit; 'both': fade-in + fade-out */
  readonly lingerType?: 'end' | 'start' | 'both';
  /** per-spinner font override (arc: 'math' — its six glyphs only sit
   *  a true circle in math fonts) */
  readonly font?: string;
}

export type TextSpinnerName =
  | 'dots'
  | 'dots2'
  | 'dots3'
  | 'dots4'
  | 'dots5'
  | 'dots6'
  | 'dots7'
  | 'dots8'
  | 'dots9'
  | 'dots10'
  | 'dots11'
  | 'dots13'
  | 'line'
  | 'line2'
  | 'pipe'
  | 'simpleDots'
  | 'simpleDotsScrolling'
  | 'star'
  | 'star2'
  | 'flip'
  | 'hamburger'
  | 'growVertical'
  | 'growHorizontal'
  | 'balloon'
  | 'balloon2'
  | 'noise'
  | 'bounce'
  | 'boxBounce'
  | 'boxBounce2'
  | 'triangle'
  | 'binary'
  | 'arc'
  | 'squareCorners'
  | 'circleQuarters'
  | 'circleHalves'
  | 'squish'
  | 'toggle'
  | 'toggle2'
  | 'toggle3'
  | 'toggle4'
  | 'toggle5'
  | 'toggle6'
  | 'toggle7'
  | 'toggle8'
  | 'toggle9'
  | 'toggle10'
  | 'toggle11'
  | 'toggle12'
  | 'toggle13'
  | 'arrow'
  | 'arrow3'
  | 'bouncingBall'
  | 'pong'
  | 'dqpb'
  | 'grenade'
  | 'point'
  | 'layer'
  | 'betaWave'
  | 'aesthetic'
  ;

export const TEXT_SPINNER_NAMES: readonly TextSpinnerName[] = [
  'dots',
  'dots2',
  'dots3',
  'dots4',
  'dots5',
  'dots6',
  'dots7',
  'dots8',
  'dots9',
  'dots10',
  'dots11',
  'dots13',
  'line',
  'line2',
  'pipe',
  'simpleDots',
  'simpleDotsScrolling',
  'star',
  'star2',
  'flip',
  'hamburger',
  'growVertical',
  'growHorizontal',
  'balloon',
  'balloon2',
  'noise',
  'bounce',
  'boxBounce',
  'boxBounce2',
  'triangle',
  'binary',
  'arc',
  'squareCorners',
  'circleQuarters',
  'circleHalves',
  'squish',
  'toggle',
  'toggle2',
  'toggle3',
  'toggle4',
  'toggle5',
  'toggle6',
  'toggle7',
  'toggle8',
  'toggle9',
  'toggle10',
  'toggle11',
  'toggle12',
  'toggle13',
  'arrow',
  'arrow3',
  'bouncingBall',
  'pong',
  'dqpb',
  'grenade',
  'point',
  'layer',
  'betaWave',
  'aesthetic',
];

export const SPINNER_CATALOG: Readonly<Record<TextSpinnerName, TextSpinner>> = {
  dots: {
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80,
    linger: 160,
  },
  dots2: {
    frames: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
    interval: 120,
    linger: 0,
  },
  dots3: {
    frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
    interval: 80,
    linger: 160,
  },
  dots4: {
    frames: ["⠄", "⠆", "⠇", "⠋", "⠙", "⠸", "⠰", "⠠", "⠰", "⠸", "⠙", "⠋", "⠇", "⠆"],
    interval: 80,
    linger: 160,
  },
  dots5: {
    frames: ["⠋", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋"],
    interval: 80,
    linger: 160,
  },
  dots6: {
    frames: ["⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠴", "⠲", "⠒", "⠂", "⠂", "⠒", "⠚", "⠙", "⠉", "⠁"],
    interval: 80,
    linger: 160,
  },
  dots7: {
    frames: ["⠈", "⠉", "⠋", "⠓", "⠒", "⠐", "⠐", "⠒", "⠖", "⠦", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈"],
    interval: 80,
    linger: 160,
  },
  dots8: {
    frames: ["⠁", "⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈", "⠈"],
    interval: 80,
    linger: 160,
  },
  dots9: {
    frames: ["⢹", "⢺", "⢼", "⣸", "⣇", "⡧", "⡗", "⡏"],
    interval: 80,
    linger: 160,
  },
  dots10: {
    frames: ["⢄", "⢂", "⢁", "⡁", "⡈", "⡐", "⡠"],
    interval: 80,
    linger: 160,
  },
  dots11: {
    frames: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
    interval: 100,
    linger: 160,
  },
  dots13: {
    frames: ["⣼", "⣹", "⢻", "⠿", "⡟", "⣏", "⣧", "⣶"],
    interval: 80,
    linger: 160,
  },
  line: {
    frames: ["-", "\\", "|", "/"],
    interval: 160,
    linger: 0,
  },
  line2: {
    frames: ["⠂", "-", "–", "—", "–", "-"],
    interval: 120,
    linger: 0,
  },
  pipe: {
    frames: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"],
    interval: 120,
    linger: 120,
  },
  simpleDots: {
    frames: ["·  ", "·· ", "···", "   "],
    interval: 160,
    linger: 160,
    lingerType: 'start',
  },
  simpleDotsScrolling: {
    frames: [".  ", ".. ", "...", " ..", "  .", "   "],
    interval: 160,
    linger: 160,
  },
  star: {
    frames: ["✶", "✸", "✹", "✺", "✹", "✷"],
    interval: 160,
    linger: 80,
  },
  star2: {
    frames: ["+", "x", "*"],
    interval: 120,
    linger: 0,
  },
  flip: {
    frames: ["_", "_", "_", "-", "`", "`", "'", "´", "-", "_", "_", "_"],
    interval: 120,
    linger: 0,
  },
  hamburger: {
    frames: ["☱", "☲", "☴"],
    interval: 120,
    linger: 0,
  },
  growVertical: {
    frames: ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"],
    interval: 120,
    linger: 120,
    lingerType: 'both',
  },
  growHorizontal: {
    frames: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"],
    interval: 120,
    linger: 120,
  },
  balloon: {
    frames: [" ", ".", "o", "O", "@", "*", " "],
    interval: 120,
    linger: 120,
  },
  balloon2: {
    frames: [".", "o", "O", "°", "O", "o", "."],
    interval: 120,
    linger: 120,
  },
  noise: {
    frames: ["▓", "▒", "░"],
    interval: 120,
    linger: 120,
  },
  bounce: {
    frames: ["⠁", "⠂", "⠄", "⠂"],
    interval: 160,
    linger: 20,
  },
  boxBounce: {
    frames: ["▖", "▘", "▝", "▗"],
    interval: 120,
    linger: 120,
  },
  boxBounce2: {
    frames: ["▌", "▀", "▐", "▄"],
    interval: 120,
    linger: 120,
  },
  triangle: {
    frames: ["◢", "◣", "◤", "◥"],
    interval: 120,
    linger: 0,
  },
  binary: {
    frames: ["010010", "001100", "100101", "111010", "111101", "010111", "101011", "111000", "110011", "110101"],
    interval: 120,
    linger: 0,
  },
  arc: {
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
    interval: 120,
    linger: 120,
    lingerType: 'both',
    font: 'math',
  },
  squareCorners: {
    frames: ["◰", "◳", "◲", "◱"],
    interval: 160,
    linger: 160,
  },
  circleQuarters: {
    frames: ["◴", "◷", "◶", "◵"],
    interval: 120,
    linger: 120,
  },
  circleHalves: {
    frames: ["◐", "◓", "◑", "◒"],
    interval: 120,
    linger: 120,
  },
  squish: {
    frames: ["╫", "╪"],
    interval: 120,
    linger: 0,
  },
  toggle: {
    frames: ["⊶", "⊷"],
    interval: 240,
    linger: 0,
  },
  toggle2: {
    frames: ["▫", "▪"],
    interval: 120,
    linger: 0,
  },
  toggle3: {
    frames: ["□", "■"],
    interval: 1000,
    linger: 500,
    lingerType: 'both',
  },
  toggle4: {
    frames: ["■", "□", "▪", "▫"],
    interval: 120,
    linger: 0,
  },
  toggle5: {
    frames: ["▮", "▯"],
    interval: 120,
    linger: 0,
  },
  toggle6: {
    frames: ["ဝ", "၀"],
    interval: 240,
    linger: 0,
  },
  toggle7: {
    frames: ["⦾", "⦿"],
    interval: 120,
    linger: 0,
  },
  toggle8: {
    frames: ["◍", "◌"],
    interval: 120,
    linger: 0,
  },
  toggle9: {
    frames: ["◉", "◎"],
    interval: 120,
    linger: 0,
  },
  toggle10: {
    frames: ["㊂", "㊀", "㊁"],
    interval: 120,
    linger: 0,
  },
  toggle11: {
    frames: ["⧇", "⧆"],
    interval: 120,
    linger: 0,
  },
  toggle12: {
    frames: ["☗", "☖"],
    interval: 120,
    linger: 0,
  },
  toggle13: {
    frames: ["=", "*", "-"],
    interval: 120,
    linger: 0,
  },
  arrow: {
    frames: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
    interval: 120,
    linger: 0,
  },
  arrow3: {
    frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
    interval: 120,
    linger: 120,
  },
  bouncingBall: {
    frames: ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)", "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )"],
    interval: 160,
    linger: 0,
  },
  pong: {
    frames: ["▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌", "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌", "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌", "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌", "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌", "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌", "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌", "▐ ⡀      ▌", "▐⠠       ▌"],
    interval: 160,
    linger: 0,
  },
  dqpb: {
    frames: ["d", "q", "p", "b"],
    interval: 120,
    linger: 120,
  },
  grenade: {
    frames: ["،  ", "′  ", " ´ ", " ‾ ", "  ⸌", "  ⸊", "  |", "  ⁎", "  ⁕", " ෴ ", "  ⁓", "   ", "   ", "   "],
    interval: 120,
    linger: 0,
  },
  point: {
    frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"],
    interval: 160,
    linger: 160,
  },
  layer: {
    frames: ["-", "=", "≡"],
    interval: 120,
    linger: 120,
  },
  betaWave: {
    frames: ["ρββββββ", "βρβββββ", "ββρββββ", "βββρβββ", "ββββρββ", "βββββρβ", "ββββββρ"],
    interval: 120,
    linger: 0,
  },
  aesthetic: {
    frames: ["▰▱▱▱▱▱▱", "▰▰▱▱▱▱▱", "▰▰▰▱▱▱▱", "▰▰▰▰▱▱▱", "▰▰▰▰▰▱▱", "▰▰▰▰▰▰▱", "▰▰▰▰▰▰▰", "▰▱▱▱▱▱▱"],
    interval: 120,
    linger: 120,
  },
};
