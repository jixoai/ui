<!--
  Test host for the terminal-footer family contract (composition-first,
  2026-08-25): the footer chrome (ghost wordmark + © row) with composed
  columns — titled, untitled and free links authored by the consumer.
-->
<script lang="ts">
  import TerminalFooter from '../../src/lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '../../src/lib/ui/terminal-footer/terminal-footer-column.svelte';
</script>

<TerminalFooter ghost="JIXOAI" copyright="© 2026 jixoai · MIT">
  <TerminalFooterColumn title="project">
    <a href="https://github.com/jixoai/ui">GitHub</a>
    <a href="/r/registry.json">Registry JSON</a>
  </TerminalFooterColumn>
  <TerminalFooterColumn>
    <a href="/docs">docs</a>
  </TerminalFooterColumn>
</TerminalFooter>
