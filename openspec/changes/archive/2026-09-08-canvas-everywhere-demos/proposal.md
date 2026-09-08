# Proposal: the canvas everywhere — every docs demo renders through it (canvas-everywhere-demos)

## Why

Owner ruling (2026-09-08, the dock reform's second half): once the
canvas is slim (a light code-card-shaped card — header + stage +
floating dock + code bar), wrapping a demo costs almost nothing
("通常就多一个底部栏"). Today most docs demos are effect-only
showcases inside SectionCards with NO source lane: 443 ComponentCanvas
instances vs 1580 SectionCard instances across 114 pages — the reader
cannot see the code behind most of what they see.

## What Changes

- Every live component DEMO region on docs pages renders through
  ComponentCanvas: the demo markup becomes the canvas `children`
  (stage), the drawer carries a usage file with the demo's authored
  source (usage strings authored at sweep time; the same-source
  `resolveRawCode` migration of those strings is the standing
  follow-up, out of scope here).
- Prose sections, API/a11y tables, install sections, and other
  non-demo SectionCards stay untouched — the sweep targets regions
  whose content is a rendered component showcase.
- Swept canvases take minimal honest props: title (the demo's name),
  no install/source where none applies, files=[one usage file].
- Executed in page batches by parallel agents after the
  canvas-playground-dock change lands (this change builds on its
  slimmed canvas + unified dock chrome).

## Impact

~100+ pages, several hundred demo regions; vision snapshot regen at
scale; docs-structure counts unchanged (no new pages); the canvas
same-source suite untouched (swept canvases use plain files, not the
virtual channel).
