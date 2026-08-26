<!-- inline-code blueprint: the code-reference chip in prose context —
     the neutral tonal default and outline rung next to explicit
     languages (tokens arrive async, SSR paints the plain chip), with
     the auto-detect lane mixed in. -->
<script lang="ts">
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-4 p-10">
  <div class="flex flex-wrap items-center gap-3">
    <InlineCode>var(--jx-hit)</InlineCode>
    <InlineCode variant="outline">--jx-tonal</InlineCode>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <InlineCode lang="ts">const ink = tokens.length</InlineCode>
    <InlineCode lang="css">{'.jx-press { box-shadow: var(--jx-press-shadow) }'}</InlineCode>
    <InlineCode lang="bash">npm run build:site</InlineCode>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <InlineCode>detectInlineLang('npm i')</InlineCode>
    <InlineCode>{'{#snippet slotStart()}'}</InlineCode>
  </div>
</div>
