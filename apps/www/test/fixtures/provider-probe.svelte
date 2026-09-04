<!--
  The provider probe (document-ontology R2 batch 0.3): reads the
  contexts INSIDE the provider tree (context binds to component
  init, not snippet render position) and exposes both registry
  instances on globalThis for teardown/route-switch assertions
  (fixture-scoped plumbing — never a component API).
-->
<script lang="ts">
  import {
    domainRegistryFromContext,
    targetRegistryFromContext,
  } from '../../src/lib/ui/figure/numbering.svelte';

  let { register = undefined }: { register?: string } = $props();

  const targets = targetRegistryFromContext();
  const domains = domainRegistryFromContext();

  const g = globalThis as Record<string, unknown>;
  g.__probeTargets = targets;
  g.__probeDomains = domains;

  if (register && targets) {
    let n = 1;
    targets.registerTarget({
      id: register,
      kind: 'section',
      number: () => String(n),
      title: () => `probe-${register}`,
    });
  }
</script>

<span
  data-has-contexts={String(Boolean(targets && domains))}
  data-rev={domains?.documentRevision ?? -1}
></span>
