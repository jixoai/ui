# Tasks: canvas-floor-lab

## 1. Registry canvas rework [integrator-coordinated mirror change]

- [ ] 1.1 Title demotion + `data-toc-skip` on root; Playground heading
      same treatment; DensityDemo retirement (toggle replaces it).
- [ ] 1.2 Stage toggles: `theme`/`density` bindable props -> stage
      `data-theme`/`data-density`; controls painted per the jx segmented
      law; reduced-motion static.
- [ ] 1.3 Drawer: ≤2 files -> tabs + one CodeCard; ≥3 -> tree (kept);
      files strictly from `?raw` imports; remove hand-pasted paths.
- [ ] 1.4 sourceUrl derivation: page loader passes the registry-path
      projection; header badge becomes copy-command + copy-page menu.
- [ ] 1.5 Mirror re-record + `verify:mirror` + `verify:surface` 47/47
      + baseline shots re-capture. [integrator]

## 2. Controls contract (site-side)

- [ ] 2.1 `$lib/playground`: consolidate Play* kit under a typed state
      object (page-owned, bindable); snippet-function code panel;
      reset; state projection row.
- [ ] 2.2 Lint: no literal `github.com` hrefs in docs pages (derivation
      only); no hand-pasted source (the `?raw` sweep from site-polish
      covers the 8 form pages here).

## 3. Page migration

- [ ] 3.1 Pilot: press-button, input, dialog, badge, chip (incl. the
      component-canvas page's own DensityDemo removal).
- [ ] 3.2 Remainder mechanical pass; the 8 form pages gain the floor.

## Verification

- `npm run verify:all` green (mirror/surface/hook-law/laws + docs
  lint with `data-doc-demo-content` scoping from site-polish).
- Outline probe: zero canvas headings in any docs ToC.
- Drawer probe: 2-file items render tabs, no tree; source links all
  resolve (script checks every derived URL).
- Lab probe: control change re-renders snippet from THE page function;
  reset restores defaults; state projection matches.
- Both themes × both densities screenshots per pilot page.
