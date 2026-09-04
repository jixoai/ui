# Tasks

- [x] 1. button-group.svelte：`overflow='scroll'` 模式 —— host/run 分层、
      run 滚动器 stamp、scroll-state 裁决 + progress + per-member 边缘
      因子的滚动处理器（含 RTL 归一化纯函数）、syncSeps-only 路径
- [x] 2. scrollEffect typed builders（slide/blur/blurSlide/shadow/
      progressBlur，模块导出）+ host 内联旋钮 + veil 层与 chevron 按钮
- [x] 3. button-group.css：run 滚动契约、ramp 规则、veil 层（含 RTL
      物理性）、chevron 掩码与门控（:has + scroll-state）
- [x] 4. registry.json 依赖 +progressive-blur；双树镜像同步
- [x] 5. 测试：结构/裁决 stamp/builder 形状/scroll 模式不跑测量机/
      默认 wrap 不变
- [x] 6. 文档页：overflow 三模式行、scrollEffect 行、scroll demo
      canvas（playground 切特效）
- [x] 7. 门禁：vitest 定向 + 全量、verify:deps/mirror/meta、manifest
      再生成
- [x] 8. Owner 追加（2026-09-04 "统一成一套"，不是同步拷贝）：抽出共享
      `@jixoai/scroll-run` registry item —— scroll-run.svelte.ts（裁决/
      因子/progress 盖章机 + RTL 三引擎漏斗 + nudgeRun + 全部
      scrollEffect builders + mirrors 通道）、scroll-run.css（唯一法则
      表：run 契约、平方消费、frosted chip、veil 层、shadow 墨律、
      pre-hydration/reduced-motion 门）、scroll-chrome.svelte（veil 层 +
      双 chip 的 DOM 半）。tabs 与 button-group 双双改为消费方（家族
      sheet 只剩各自 tuning；tabs 保留 snap 与 inset·2/inset·6，
      indicator 走 mirrors 骑共享 `> *` ramp，家族本地 fade 规则删除）
- [x] 9. 统一收尾：registry.json 新 item + 双侧依赖边换轨（progressive-
      blur 边移至 scroll-run）、docs 页 /docs/components/scroll-run.html
      （raw contract 现场 demo + 五特效切换）、blueprint scene + SVG、
      taxonomy 快照 general 9→10、canonicalMain override、A3 语境捕获
      改 $derived.by 参数子树（blessed 形状）、component-authoring spec
      新增 scroll-run 统一 Requirement（三场景）
