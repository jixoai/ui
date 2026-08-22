<!-- llms-txt blueprint: the AI export pass — the final dist on the left,
     one pass over it, and the declared outputs (llms.txt, llms-full.txt,
     per-page .md mirrors) landing back in the same tree. Rendered as the
     terminal diagram idiom; no live component (it is a build tool). -->
<div class="flex h-full w-full items-center justify-center p-8">
  <div
    class="flex w-full max-w-2xl flex-col gap-3 border border-[color:var(--border)] bg-[color:var(--card)] p-6 font-mono text-[13px] leading-6"
  >
    <div class="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
      <span class="font-bold uppercase tracking-widest text-[color:var(--primary)]">llms-txt</span>
      <span class="text-[11px] uppercase tracking-widest text-[color:var(--muted-foreground)]"
        >the AI export pass</span
      >
    </div>
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <pre class="text-[color:var(--muted-foreground)]">dist/
├── index.html
├── docs/*.html
└── en/ zh/</pre>
      <span class="text-[color:var(--primary)]">─▶</span>
      <pre>llms.txt        (index)
llms-full.txt   (capped)
*.md            (mirrors)</pre>
    </div>
    <div class="border-t border-[color:var(--border)] pt-3 text-[11px] text-[color:var(--muted-foreground)]">
      absolute URLs · declared outputs only · byte-deterministic
    </div>
  </div>
</div>
