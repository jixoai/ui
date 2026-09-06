# registry — delta

## ADDED Requirements

### Requirement: the CLI locks only verified installs

`jixoai-ui add`/`init` SHALL record an item in `jixoai-ui.lock` only
after EVERY one of the item's files exists on disk at its
alias-resolved install path. A missing file SHALL keep the item OUT of
the lock and print an explicit warning listing the missing paths with
the recovery guidance (move the conflicting file aside — e.g. a
hue-applied `jixoai.css` — and re-run the add). This closes the
locked-but-not-installed trap: a non-interactive shadcn run whose
overwrite confirmation hits EOF cancels its whole write phase while
the item would otherwise enter the lock, after which `upgrade` reports
the item as managed while nothing is on disk.

After the add phase the CLI SHALL detect shadcn's literal-directory
misplacement (`src/@lib/**`, `src/@ui/**`, `src/vite-plugins/**` —
alias and plain targets dropped as literal paths) and relocate each
dropped file to its alias-resolved (or project-root) path, reporting
every move, before lock verification runs. Item-name parsing SHALL
skip `--`-prefixed tokens (flags never become `@jixoai/--help` item
names; `--help`/`-h` print the usage).

#### Scenario: an overwrite-cancelled install is not locked

- GIVEN a consumer with an existing `src/lib/jixoai.css` and piped
  stdin, adding `jixoai-theme` whose write phase is cancelled by the
  overwrite prompt hitting EOF
- WHEN the CLI's lock step runs
- THEN `jixoai-ui.lock` does NOT gain the item
- AND the warning names the missing path(s) and the move-aside retry
  guidance

#### Scenario: misplaced alias files are relocated and locked

- GIVEN an add that dropped `@lib/scrollbar-measure.ts` at
  `src/@lib/scrollbar-measure.ts`
- WHEN the CLI's relocation pass runs
- THEN the file moves to the alias-resolved `src/lib/scrollbar-measure.ts`,
  the move is reported, the emptied literal directory is removed
- AND the item locks with its files verified on disk

#### Scenario: flags never masquerade as items

- GIVEN `jixoai-ui add --help`
- THEN the usage text prints and no `shadcn add @jixoai/--help` runs

### Requirement: registry docs speak the consumer import dialect

Registry item documentation (`registry.json` docs strings, item source
header comments, READMEs) SHALL show consumer-side imports in the
SvelteKit import dialect (`import '$lib/…'`) — the `@lib/…` /
`@ui/…` spellings are the registry TARGET alias space (components.json
placement vocabulary), not import specifiers a consumer can write.
Where a doc must name the install TARGET it may use the alias form,
clearly as placement, never inside an `import` statement.

#### Scenario: scrollbar-measure docs

- GIVEN the scrollbar-measure item's docs and file header
- WHEN a SvelteKit consumer copies the documented import
- THEN `import '$lib/scrollbar-measure';` compiles as written
