# Tasks: paged-doc-family

## 1. 内核（site-only，零依赖）[P]

- [x] 1.1 `lib/paged/doc.svelte`：flow/columns/page 注入（print 档写
      `<style>` @page 规则）、orphans/widows 全局投影、runningHeader
      可选（Chromium-only 注释）、engine 占位、section 注册 Context。
- [x] 1.2 `lib/paged/section.svelte`（break props + heading-keeper）、
      `figure.svelte`（counter）、`aside.svelte`（宽浮动/窄沉降）、
      `ref.svelte`（注册表回填 §N）、`toc.svelte`（章节号代位）、
      `table.svelte`、`code.svelte`（flow|shrink）、`index.ts` 纯 barrel。
- [x] 1.3 `lib/medium.svelte.ts`：三态纯派生 reducer + sim 戳订阅 +
      SSR 安全；`lib/paged/print-projection.css`（unlayered 白名单表 +
      @media not print 的 sim 投影副本 + parity 注释）。

## 2. markup 合同 + 探针 [P]

- [x] 2.1 props-table 包装层输出 `data-jx-props-table-scroll`；
      vitest source guard（禁手写 print 解绑替代）。
- [x] 2.2 `scripts/verify-print.mjs`（verify-press 同款 playwright-core
      模式，本地 wasm/env 无关）：print 媒介仿真下白名单 computed
      断言（display:flex/overflow:auto/max-block-size 三 utility 在场）、
      sim 排他、bundle 零 pagedjs 探针。
- [x] 2.3 vitest：编号注册表（嵌套/动态 section）、PagedRef 回填、
      aside 沉降类切换、reducer 三态全迁移（真 print/sim/退出恢复）。

## 3. 试点页（Owner 验收面）[P]

- [x] 3.1 `/docs/paged.html`：press-button 出版级页——meta/schema 复用、
      活体画布作 Figure 插图（data-jx-print="freeze"）、章节/边注/引用/
      目录全基元、打印按钮；docs 骨架合规（Install/Usage/Examples）。

## 4. 集成 [I]

- [x] 4.1 gen-mirror-manifest SITE_ONLY 前缀（lib/paged/、
      medium.svelte.ts）；prerender + route-model + taxonomy spec 同步。
- [x] 4.2 verify-all 挂载 verify-print；verify:all 全绿。
