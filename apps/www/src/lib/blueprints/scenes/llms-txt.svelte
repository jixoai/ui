<!-- llms-txt blueprint: the AI export pass — the final dist on the left,
     one pass over it, and the declared outputs (llms.txt, llms-full.txt,
     per-page .md mirrors) landing back in the same tree. Rendered as the
     terminal diagram idiom; no live component (it is a build tool). -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack align="center" justify="center" class={cx(bpA.llmsTxtStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.llmsTxtPanel)} }>
    <Stack align="center" justify="between" class={cx(bpA.llmsTxtHead)} }>
      <span class={cx(bpA.llmsTxtTitle)}>llms-txt</span>
      <span class={cx(bpA.llmsTxtSub)}
        >the AI export pass</span
      >
    </Stack>
    <div class={cx(bpA.llmsTxtGrid)}>
      <pre class={cx(bpA.llmsTxtInputPre)}>dist/
├── index.html
├── docs/*.html
└── en/ zh/</pre>
      <span class={cx(bpA.llmsTxtArrow)}>─▶</span>
      <pre>llms.txt        (index)
llms-full.txt   (capped)
*.md            (mirrors)</pre>
    </div>
    <div class={cx(bpA.llmsTxtFoot)}>
      absolute URLs · declared outputs only · byte-deterministic
    </div>
  </Stack>
</Stack>
