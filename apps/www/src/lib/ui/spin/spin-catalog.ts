// GENERATED — do not edit (writer: scripts/curate-spin-catalog.mjs,
// data: cli-spinners@2.9.2 MIT — sindresorhus, ora's spinner corpus).
// spin-ora-svg-lane C1, 2026-09-11.
//
// Intents:
// 1. the frozen text corpus — frames and per-spinner intervals VERBATIM
//    from the corpus (never hand-transcribed; braille glyphs are
//    transcription traps); re-run the curator to reproduce these bytes.
// 2. pure data — zero imports; installs with the registry:ui spin family.
//
// Curation rule: every cli-spinners@2.9.2 entry whose frames carry no
// emoji-presentation characters (no codepoint ≥ U+1F000, no U+FE0F, no
// BMP Emoji_Presentation=Yes — the standard ranges embedded in the
// curator; a blanket 0x2600-0x27bf range is WRONG: ✶✸✹✺ dingbats and the
// ☰ trigrams are text presentation and stay), ≤ 30 frames, ≤ 10ch wide.
// Excluded by name: bouncingBar — its frames are [ ] bracket art, the
// wrapping decoration this change kills (Owner ruling #1).

export interface TextSpinner {
  readonly frames: readonly string[];
  readonly interval: number;
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
  | 'circle'
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
  'circle',
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
  },
  dots2: {
    frames: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
    interval: 80,
  },
  dots3: {
    frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
    interval: 80,
  },
  dots4: {
    frames: ["⠄", "⠆", "⠇", "⠋", "⠙", "⠸", "⠰", "⠠", "⠰", "⠸", "⠙", "⠋", "⠇", "⠆"],
    interval: 80,
  },
  dots5: {
    frames: ["⠋", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋"],
    interval: 80,
  },
  dots6: {
    frames: ["⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠴", "⠲", "⠒", "⠂", "⠂", "⠒", "⠚", "⠙", "⠉", "⠁"],
    interval: 80,
  },
  dots7: {
    frames: ["⠈", "⠉", "⠋", "⠓", "⠒", "⠐", "⠐", "⠒", "⠖", "⠦", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈"],
    interval: 80,
  },
  dots8: {
    frames: ["⠁", "⠁", "⠉", "⠙", "⠚", "⠒", "⠂", "⠂", "⠒", "⠲", "⠴", "⠤", "⠄", "⠄", "⠤", "⠠", "⠠", "⠤", "⠦", "⠖", "⠒", "⠐", "⠐", "⠒", "⠓", "⠋", "⠉", "⠈", "⠈"],
    interval: 80,
  },
  dots9: {
    frames: ["⢹", "⢺", "⢼", "⣸", "⣇", "⡧", "⡗", "⡏"],
    interval: 80,
  },
  dots10: {
    frames: ["⢄", "⢂", "⢁", "⡁", "⡈", "⡐", "⡠"],
    interval: 80,
  },
  dots11: {
    frames: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
    interval: 100,
  },
  dots13: {
    frames: ["⣼", "⣹", "⢻", "⠿", "⡟", "⣏", "⣧", "⣶"],
    interval: 80,
  },
  line: {
    frames: ["-", "\\", "|", "/"],
    interval: 130,
  },
  line2: {
    frames: ["⠂", "-", "–", "—", "–", "-"],
    interval: 100,
  },
  pipe: {
    frames: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"],
    interval: 100,
  },
  simpleDots: {
    frames: [".  ", ".. ", "...", "   "],
    interval: 400,
  },
  simpleDotsScrolling: {
    frames: [".  ", ".. ", "...", " ..", "  .", "   "],
    interval: 200,
  },
  star: {
    frames: ["✶", "✸", "✹", "✺", "✹", "✷"],
    interval: 70,
  },
  star2: {
    frames: ["+", "x", "*"],
    interval: 80,
  },
  flip: {
    frames: ["_", "_", "_", "-", "`", "`", "'", "´", "-", "_", "_", "_"],
    interval: 70,
  },
  hamburger: {
    frames: ["☱", "☲", "☴"],
    interval: 100,
  },
  growVertical: {
    frames: ["▁", "▃", "▄", "▅", "▆", "▇", "▆", "▅", "▄", "▃"],
    interval: 120,
  },
  growHorizontal: {
    frames: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"],
    interval: 120,
  },
  balloon: {
    frames: [" ", ".", "o", "O", "@", "*", " "],
    interval: 140,
  },
  balloon2: {
    frames: [".", "o", "O", "°", "O", "o", "."],
    interval: 120,
  },
  noise: {
    frames: ["▓", "▒", "░"],
    interval: 100,
  },
  bounce: {
    frames: ["⠁", "⠂", "⠄", "⠂"],
    interval: 120,
  },
  boxBounce: {
    frames: ["▖", "▘", "▝", "▗"],
    interval: 120,
  },
  boxBounce2: {
    frames: ["▌", "▀", "▐", "▄"],
    interval: 100,
  },
  triangle: {
    frames: ["◢", "◣", "◤", "◥"],
    interval: 50,
  },
  binary: {
    frames: ["010010", "001100", "100101", "111010", "111101", "010111", "101011", "111000", "110011", "110101"],
    interval: 80,
  },
  arc: {
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
    interval: 100,
  },
  circle: {
    frames: ["◡", "⊙", "◠"],
    interval: 120,
  },
  squareCorners: {
    frames: ["◰", "◳", "◲", "◱"],
    interval: 180,
  },
  circleQuarters: {
    frames: ["◴", "◷", "◶", "◵"],
    interval: 120,
  },
  circleHalves: {
    frames: ["◐", "◓", "◑", "◒"],
    interval: 50,
  },
  squish: {
    frames: ["╫", "╪"],
    interval: 100,
  },
  toggle: {
    frames: ["⊶", "⊷"],
    interval: 250,
  },
  toggle2: {
    frames: ["▫", "▪"],
    interval: 80,
  },
  toggle3: {
    frames: ["□", "■"],
    interval: 120,
  },
  toggle4: {
    frames: ["■", "□", "▪", "▫"],
    interval: 100,
  },
  toggle5: {
    frames: ["▮", "▯"],
    interval: 100,
  },
  toggle6: {
    frames: ["ဝ", "၀"],
    interval: 300,
  },
  toggle7: {
    frames: ["⦾", "⦿"],
    interval: 80,
  },
  toggle8: {
    frames: ["◍", "◌"],
    interval: 100,
  },
  toggle9: {
    frames: ["◉", "◎"],
    interval: 100,
  },
  toggle10: {
    frames: ["㊂", "㊀", "㊁"],
    interval: 100,
  },
  toggle11: {
    frames: ["⧇", "⧆"],
    interval: 50,
  },
  toggle12: {
    frames: ["☗", "☖"],
    interval: 120,
  },
  toggle13: {
    frames: ["=", "*", "-"],
    interval: 80,
  },
  arrow: {
    frames: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
    interval: 100,
  },
  arrow3: {
    frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
    interval: 120,
  },
  bouncingBall: {
    frames: ["( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)", "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )"],
    interval: 80,
  },
  pong: {
    frames: ["▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌", "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌", "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌", "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌", "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌", "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌", "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌", "▐ ⡀      ▌", "▐⠠       ▌"],
    interval: 80,
  },
  dqpb: {
    frames: ["d", "q", "p", "b"],
    interval: 100,
  },
  grenade: {
    frames: ["،  ", "′  ", " ´ ", " ‾ ", "  ⸌", "  ⸊", "  |", "  ⁎", "  ⁕", " ෴ ", "  ⁓", "   ", "   ", "   "],
    interval: 80,
  },
  point: {
    frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"],
    interval: 125,
  },
  layer: {
    frames: ["-", "=", "≡"],
    interval: 150,
  },
  betaWave: {
    frames: ["ρββββββ", "βρβββββ", "ββρββββ", "βββρβββ", "ββββρββ", "βββββρβ", "ββββββρ"],
    interval: 80,
  },
  aesthetic: {
    frames: ["▰▱▱▱▱▱▱", "▰▰▱▱▱▱▱", "▰▰▰▱▱▱▱", "▰▰▰▰▱▱▱", "▰▰▰▰▰▱▱", "▰▰▰▰▰▰▱", "▰▰▰▰▰▰▰", "▰▱▱▱▱▱▱"],
    interval: 80,
  },
};
