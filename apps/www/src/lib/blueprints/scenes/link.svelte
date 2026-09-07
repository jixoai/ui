<!-- link blueprint: the two lanes — app route stays same-tab, the
     absolute http(s) href opens a new tab with rel=noreferrer. -->
<script lang="ts">
  import Link from '$lib/ui/link/link.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <div class="flex w-full max-w-[520px] flex-col gap-3 text-[14px] leading-7">
    <p class="m-0">
      Read <Link href="/docs/components/markdown.html">the markdown page</Link> in this tab, or
      leave for <Link href="https://github.com/jixoai/ui">the repository</Link> in a new one.
    </p>
    <p class="m-0 text-muted-foreground">
      The offset keeps the underline off the descenders —
      <Link href="https://commonmark.org">CommonMark</Link> inside muted prose.
    </p>
  </div>
  <div class="flex flex-wrap gap-2">
    <Badge>http(s) → target=_blank</Badge>
    <Badge>rel=noreferrer</Badge>
    <Badge>app routes same-tab</Badge>
  </div>
</div>
