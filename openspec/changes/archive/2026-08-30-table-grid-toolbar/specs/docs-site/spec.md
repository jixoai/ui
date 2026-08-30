# docs-site delta — enterprise surfaces ship composition recipes

## ADDED Requirements

### Requirement: enterprise data surfaces are demo-complete

The table / transfer / tour / descriptions / statistic docs pages
SHALL each carry ability-named composition recipes covering their
market-standard forms (table: sort, filter, pagination, row
selection, row actions, column visibility, sticky header, and one
composed toolbar example; transfer: oneWay; tour: non-modal +
placement; descriptions: vertical + responsive + extra; statistic:
countdown). A discovered missing atom API SHALL be recorded in the
change's `followups.md` rather than worked around silently.

#### Scenario: composing the tasks-table demo

- WHEN the composed toolbar demo is authored
- THEN it uses only public component behavior and every interactive
  part is keyboard-reachable
