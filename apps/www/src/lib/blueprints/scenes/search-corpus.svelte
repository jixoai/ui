<!-- search-corpus blueprint: the structured harvest — the final dist's
     semantic markers (heading tree, SectionCard shapes, figcaption) on
     the left, one pass keyed on STRUCTURE not guesses, and the
     engine-neutral corpus landing for any client engine (minisearch
     first) to compile. Terminal diagram idiom; no live component (it
     is a build tool). -->
<div class="flex h-full w-full items-center justify-center p-8">
  <div
    class="flex w-full max-w-2xl flex-col gap-3 border border-[color:var(--border)] bg-[color:var(--card)] p-6 font-mono text-[13px] leading-6"
  >
    <div class="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
      <span class="font-bold uppercase tracking-widest text-[color:var(--primary)]">search-corpus</span>
      <span class="text-[11px] uppercase tracking-widest text-[color:var(--muted-foreground)]"
        >structure, not guesses</span
      >
    </div>
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <pre class="text-[color:var(--muted-foreground)]">dist/*.html
├── h2/h3 (the tree law)
├── §eyebrow/title/summary
└── figure/figcaption</pre>
      <span class="text-[color:var(--primary)]">─▶</span>
      <pre>/search/corpus.json
  pages[] sections[] blocks[]
  kind: prose|code|table
  preset: null (点线面 ready)</pre>
    </div>
    <div class="border-t border-[color:var(--border)] pt-3 text-[11px] text-[color:var(--muted-foreground)]">
      engine-pluggable (minisearch ▸ fuse ▸ …) · Intl.Segmenter CJK · byte-deterministic
    </div>
  </div>
</div>
