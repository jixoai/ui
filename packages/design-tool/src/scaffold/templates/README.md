# scaffold templates (provenance note)

This directory is the DATA SOURCE for `scaffoldWorkspace()`'s
prototype seeding — files here are copied verbatim into a host's
`design/` workspace on first run (only missing files, never
overwrites).

As of 2026-09-11 the welcome demo prototype
(`prototypes/welcome/**`: canvas.svelte + pages/hero.svelte +
components/press-states.svelte, built on `#jixoai/prototype-kit`)
is being delivered by the design-studio parallel workstream
(prototype-kit item, tasks T1/T2). It lands here at integration
time; until then the directory stays empty apart from this README
and a first run scaffolds only `design/studio.svelte`.

Deliverable shape (agreed contract, design.md §6.1):

    templates/prototypes/welcome/canvas.svelte
    templates/prototypes/welcome/pages/hero.svelte
    templates/prototypes/welcome/components/press-states.svelte
