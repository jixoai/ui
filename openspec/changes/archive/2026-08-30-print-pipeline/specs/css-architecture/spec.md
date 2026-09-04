# css-architecture delta — the print whitelist formally migrates to the kernel stylesheet

## ADDED Requirements

### Requirement: the audited print whitelist lives in kernel-print.css

The unlayered print-projection whitelist SHALL migrate from the retired
print-projection.css into `lib/print/kernel-print.css` (the stylesheet
fed to the paged.js kernel), carrying the full named table (selector,
forced properties, overridden utility) and an intent header at the top
of the file. An AST gate SHALL hold: kernel-print.css contains zero
`@media not print` wrappers and zero `[data-jx-print-sim]` selectors;
the sim shell stylesheet SHALL never appear in the preview() inputs
(runtime-spy asserted).

#### Scenario: the gate holds against drift

- GIVEN kernel-print.css accidentally gains a sim selector
- WHEN the AST gate runs
- THEN it fails, naming the offending rule
