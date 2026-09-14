<script lang="ts">
  import CodeCard from '../ui/code-card/index.ts';

  const SAMPLE = `// hub.ts — the d3 payload sample (plain text; the highlight
// backend seam is trimmed to a null backend in this fixture — no
// highlight engine ships in ANY D3 configuration, disclosed in
// research/d3-consumer.md)
export function greet(name: string): string {
  return \`hello \${name}\`;
}`;
</script>

<h1 class="text-lg font-semibold mb-2">code-card — print + scroll hooks</h1>
<p class="text-muted-foreground mb-4 max-w-prose">
  The TW form: head/foot paint + copy control (press physics), veils, focus rings, print law.
</p>

<section data-cc-section="plain" class="mb-4">
  <h2 class="mb-2">plain sample (null backend, corpus floor)</h2>
  <CodeCard code={SAMPLE} lang="ts" filename="hub.ts" maxHeight="140px" />
</section>
