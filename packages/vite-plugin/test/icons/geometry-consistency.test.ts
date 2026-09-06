/**
 * Geometry consistency gate (C4, ui-plugin-followup; migrated to
 * vite-plugin/icons with merge-alignment A1; repointed at the generated
 * icon-set artifact by the icon-component-pipeline change).
 *
 * Verifies the lucide single-source law: the provider's serialized
 * output must equal the `lucide` package's own IconNode children, and
 * the generated library artifact (registry/files/lib/icon-set.gen.ts)
 * must embed the same geometry in its `d` payloads. Both sides are
 * DERIVED from `lucide` — no hand-copied path literals in this file.
 *
 * The artifact is imported DIRECTLY (not read + regex'd): the default
 * config emits ZERO virtual chunk imports, so the module loads under
 * vitest as-is — a drifted or unparseable artifact fails the suite at
 * import time, the loud and correct signal (no skipIf escape hatch).
 */
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  Image,
  Languages,
  Link,
  Mail,
  Minus,
  Monitor,
  Moon,
  Palette,
  Phone,
  Pipette,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Type,
  Upload,
  X,
} from 'lucide';
import type { IconNode, IconNodeChild } from 'lucide';
import { describe, expect, it, vi } from 'vitest';
import { lucideIconProvider } from '../../src/icons/providers/lucide.js';
import type { IconSlot } from '../../src/icons/types.js';
// test/icons → four levels up is the repo root; the default artifact
// carries zero virtual imports, so it is safe to import directly
import { getIcon, ICON_NAMES, type IconName } from '../../../../registry/files/lib/icon-set.gen';

/** the provider's wrapper — byte-pinned; strip it to get the children */
const WRAPPER_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

/** slots shared between the provider face and the CSS sheet vocabulary */
const SHARED_SLOTS: readonly { slot: IconSlot; icon: IconNode }[] = [
  { slot: 'calendar', icon: Calendar },
  { slot: 'clock', icon: Clock },
  { slot: 'chevron', icon: ChevronDown },
  { slot: 'palette', icon: Palette },
  { slot: 'check', icon: Check },
  { slot: 'clear', icon: X },
];

/** the artifact's full built-in manifest (38 icons, GROUPS order) mapped
 *  to the lucide IconNode whose serialization each `d` payload must be */
const BUILTINS: Readonly<Record<IconName, IconNode>> = {
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  rotateCcw: RotateCcw,
  copy: Copy,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  x: X,
  externalLink: ExternalLink,
  check: Check,
  folder: Folder,
  folderOpen: FolderOpen,
  file: File,
  fileCode: FileCode,
  fileText: FileText,
  braces: Braces,
  palette: Palette,
  plus: Plus,
  minus: Minus,
  ellipsis: Ellipsis,
  calendar: Calendar,
  clock: Clock,
  pipette: Pipette,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  languages: Languages,
  image: Image,
  fileVideo: FileVideo,
  fileAudio: FileAudio,
  upload: Upload,
  chevronLeft: ChevronLeft,
  eye: Eye,
  eyeOff: EyeOff,
  search: Search,
  link: Link,
  phone: Phone,
  mail: Mail,
  type: Type,
};

/** the shared inner-SVG grammar: attrs in insertion order, self-closing,
 *  no separators — the exact serialization the artifact's `d` must carry */
function serializeChildren(children: readonly IconNodeChild[] | undefined): string {
  return (children ?? [])
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('');
      return `<${tag}${attributes}/>`;
    })
    .join('');
}

function makeContext() {
  return { ctx: { loadSource: vi.fn(), watchFile: vi.fn() } };
}

describe('geometry consistency gate (C4)', () => {
  it('provider output equals lucide IconNode children for every shared slot', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    for (const { slot, icon } of SHARED_SLOTS) {
      const svg = provider.getIcon(slot)!.svg;
      expect(svg.startsWith(WRAPPER_OPEN), `${slot} wrapper`).toBe(true);
      expect(svg.endsWith('</svg>'), `${slot} wrapper`).toBe(true);
      const children = svg.slice(WRAPPER_OPEN.length, -'</svg>'.length);
      expect(children, slot).toBe(serializeChildren(icon[2]));
    }
  });

  it('the artifact embeds lucide geometry for every built-in (d payload, byte-exact)', () => {
    expect(ICON_NAMES.length, 'the default set is the 38 built-ins').toBe(38);
    for (const name of ICON_NAMES) {
      const data = getIcon(name);
      expect(data, `${name} present in the artifact`).not.toBeNull();
      expect(data!.d, name).toBe(serializeChildren(BUILTINS[name]![2]));
    }
  });

  it('the artifact pins viewBox 0 0 24 24 and stroke nature for every built-in', () => {
    for (const name of ICON_NAMES) {
      const data = getIcon(name)!;
      expect(data.v, `${name} viewBox`).toBe('0 0 24 24');
      expect(data.n, `${name} nature`).toBe('stroke');
    }
  });

  it('viewBox is 0 0 24 24 across sources', async () => {
    const { ctx } = makeContext();
    const provider = await lucideIconProvider()(ctx);
    expect(provider.getIcon('chevron')!.svg).toContain('viewBox="0 0 24 24"');
    expect(getIcon('chevronDown')!.v).toBe('0 0 24 24');
  });
});
