# Verification: registry-install-integrity

## Gate evidence (must all be green before archive)

1. `npm run verify:all` green — including the new `verify:deps` with
   its FOUR-FIXTURE matrix proven (dangling edge FAIL /
   undeclared target-resolved import FAIL / theme prerequisite PASS /
   dead non-prerequisite FAIL), ownership resolved through
   `registry.json` `files[].target`.
2. Dependency closure probe: zero dangling refs (baseline before fix:
   1, `hero-section -> @jixoai/reveal`).
3. Clean-install acceptance (the A harness, data-driven): for every
   registered case — fresh Vite consumer, install from generated
   `public/r/`, assert canonical target files, import the canonical
   entry, BUILD. The hero-section case additionally asserts
   `@jixoai/reveal` is NOT requested. A bare `npx shadcn add`
   resolution is diagnostic context only, never success proof.
4. Homepage: the featured projection drives the rows (every featured
   ID resolves exactly once; row count equals the FEATURED count);
   the heading renders the REGISTRY TOTAL, clearly labeled; the two
   numbers are never equated. No "reveal" row; grep finds no
   "add reveal" anywhere.
5. Build artifact probe: after `npm run build:site`, `public/CNAME`
   exists with `ui.jixoai.com`, and `public/r/registry.json` +
   `public/index.html` coexist.
6. Deploy smoke: `deploy.yml` smoke job defined; post-merge run green
   once the Owner re-attaches the domain (a DNS-lag failure must
   print the remediation hint by design).
## Baseline captures (2026-08-30, pre-fix)

- `/r/reveal.json` → 404 (dev), item absent from registry.json.
- `registry.json:500` — `hero-section.registryDependencies[0] ===
  "@jixoai/reveal"`.
- `https://ui.jixoai.com/*` → 404 (GitHub Pages "Site not found");
  `https://jixoai.github.io/ui/r/press-button.json` → 200;
  Pages API: `"cname": null`; no CNAME file in artifact.
- Homepage heading "Nine items, one grammar" over 12 hand-written rows.
