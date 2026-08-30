# Verification: terminal-patterns

## Baseline (2026-08-30)

- No patterns area; the site demos components, never composed
  sections; homepage has no pattern entry point.

## Gate evidence

1. `npm run verify:all` green (5 new items; deps resolve — patterns
   compose existing atoms only; mirrors re-recorded).
2. ACCEPTANCE GATE: the A harness carries FIVE registered cases, one
   per pattern — fresh Vite consumer, install from generated
   `public/r/`, import the canonical entry, BUILD. Bare add-resolution
   is diagnostic context only, never success proof.
3. Browser matrix: each pattern × both themes renders correctly;
   login OTP flow commits; CTA copy-command copies; marquee is
   static under prefers-reduced-motion.
4. FIVE canonical docs routes `/docs/components/pattern-<name>.html`
   live (unique meta.group/href, prerender entries, docs-structure
   assertions); `/docs/patterns.html` exists ONLY as a gallery linking
   them; homepage featured row + Docs dropdown link the gallery.
5. Each pattern's direct atom closure is enumerated in its task
   section and matches its `registryDependencies` (verify:deps green
   against target-resolved imports).
