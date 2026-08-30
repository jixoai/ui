# Tasks: terminal-patterns

Pattern folders are mutually disjoint — parallel-safe per item;
registry.json edits ride the integrator's hands (shared file).
Depends on A (homepage), F (input reveal/slots), C (layout) — LAST
in the batch.

## 1. pattern-login

- [ ] 1.1 Folder: login card (`input` + `innerInlineStart` slot for
      user@host; password reveal is a HARD F1 prerequisite — no
      pattern-local show/hide fallback), 2FA variant (input-otp),
      bootstrap-command footer.
- [ ] 1.2 Docs: live demo ×2 variants; a11y notes (labels, error
      lanes); add command.

## 2. pattern-pricing

- [ ] 2.1 Folder: comparison table (table family, highlighted column),
      per-tier code-card install rows, recommended tier paint.
- [ ] 2.2 Docs: demo + composition notes.

## 3. pattern-hero-set

- [ ] 3.1 Terminal-window hero (terminal-card + lead type).
- [ ] 3.2 ASCII-art headline hero (pre + mono scale law).
- [ ] 3.3 Badge-marquee hero (CSS marquee; reduced-motion static).
- [ ] 3.4 Docs: three live demos, pick-guide copy.

## 4. pattern-faq + pattern-cta

- [ ] 4.1 FAQ: accordion family in man-page framing.
- [ ] 4.2 CTA: copy-command band + press-button; hover press physics
      verified.

## 4b. Direct atom closures (declared per pattern)

- pattern-login: `input`, `input-otp`, `press-button` (+ `jixoai-theme`,
  `icons`)
- pattern-pricing: `table`, `code-card`, `press-button`, `badge`
  (+ `jixoai-theme`, `icons`)
- pattern-hero-set: `hero-section`, `terminal-card`, `press-button`
  (+ `jixoai-theme`, `icons`)
- pattern-faq: `accordion` (+ `jixoai-theme`, `icons`)
- pattern-cta: `press-button`, `code-card` (+ `jixoai-theme`, `icons`)

`registryDependencies` MUST equal these lists; `verify:deps` compares
target-resolved imports to them.

## 5. Integration

- [ ] 5.1 registry.json entries (5 items) — integrator applies,
      `shadcn build`, mirror re-record with canonicalMain entries.
- [ ] 5.2 FIVE canonical docs routes `/docs/components/pattern-<name>.html`
      (unique meta.group/href, prerender entries, route-model + taxonomy
      counts) + `/docs/patterns.html` gallery linking them + homepage
      featured row + Docs-dropdown entry. [docs/nav owner: integrator]
- [ ] 5.3 verify:deps green against each pattern's DECLARED direct atom
      list; the A harness gains the five clean-install cases.

## Verification

- `npm run verify:all` green; add probe installs each pattern with
  its atom closure.
- Browser: all five patterns render both themes; login 2FA commits
  OTP; pricing highlight column reads in light mode; marquee static
  under reduced motion.
