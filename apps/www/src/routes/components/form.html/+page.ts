// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the layout owns the toc in the scaffold's chrome
// snippet, SSR-rendered in its final grid cell.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'all-types', label: 'All native types' },
  { id: 'selectors', label: 'The selectors' },
  { id: 'select-split', label: 'The select split' },
  { id: 'combobox-tags', label: 'Combobox + TagsInput' },
  { id: 'number-input', label: 'Number input' },
  { id: 'file-input', label: 'File input' },
  { id: 'date-picker', label: 'Date picker' },
  { id: 'range-slider', label: 'Range slider' },
  { id: 'color-picker', label: 'Color picker' },
  { id: 'select-textarea', label: 'native-select + textarea' },
  { id: 'slots', label: 'Slot system' },
  { id: 'example-form', label: 'A full form' },
  { id: 'native-base', label: 'NativeHTML 基座' },
];

export const load = () => ({ toc });
