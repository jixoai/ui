# Design: print-pipeline (r2)

研究基座：pagedjs-source-research.md；r1 评审 codex-plan-review-print-r1.md
六阻塞+接缝合同全闭合，裁决标 [r1-n]。

## 管线全景（prepareSnapshot 事务 [r1-1]）

```
触发（UI 打印入口：sim 开关 | 「直接打印」按钮；Ctrl+P = 原生回退路径，文档化降级，不入合同）
→ medium 派生 'sim' | 'print'（print 插件 filter 开门）
→ 不可变干预落 live：density→sm（resolveDensity 终值）、hue→钉缺省（hue adapter）
→ 动画冻结：document.getAnimations() → pause() → 等一帧 settle
→ 【DOM-commit 屏障】double-rAF + 断言 source 根 stamp 已落
   （data-density=sm 等 —— 断言失败 fail-loud，不静默出页）
→ readiness gate：document.fonts.ready + 全图 eager+decode()
   （lazy 属性先解除再等；超时预算带进度与取消）
→ 深克隆 source 根（[data-print-source]）
→ 克隆上变换（只染克隆）：动画暂停 style 注入 · pre→行 span
   （lineNumbers 配置）· 目录页 nav 注入 · id 保持
→ resume live 动画（源树已不再需要）
→ pagedjs preview(clone, [kernel-print.css, compiled @page css], renderTo)
→ 退出：filter 关门 → live contexts 响应式回弹（断言精确回 raw）
   → 幂等 cleanup → 克隆/产物销毁
```

## 根与并发合同 [r1-2]

- **source root**：docs layout 内容根 `[data-print-source]`（不可变
  selector）；**render root**：文档内独立 sibling `[data-print-output]`
  （已连接、空容器，每次运行前清空——绝不嵌进 source，二次 sim 不含
  旧 .pagedjs_pages）。
- **single-flight**：in-flight token；新请求取消旧运行（含 preview 中
  断与 cleanup）。
- **幂等 cleanup**：pages DOM、Polisher 注入 head 的 style（逐条记录
  句柄）、listeners —— success/failure/afterprint/sim-off 四路全清；
  失败后重试无残留。测试：连续 sim、sim→print、失败重试三场景。

## 同一产物语义 [r1-3]

artifacts 由管线模块持有；有效期 = (frozen snapshot hash + stylesheet
hash) 不变。sim 与「直接打印」复用同一完成产物；失效则以同一冻结
快照重建。验收以页数、目录页码、@page CSS hash 三元组比对两出口。

## 样式表 gate（可执行 [r1-4]）

- 三源头分离不变；新增 **AST 静态 gate**：kernel-print.css 零
  `@media not print`、零 `[data-jx-print-sim]`；sim-shell.css 永不出现在
  preview 参数（**runtime spy** 捕获真实 preview() 入参快照）。
- 白名单**正式迁转**：完整 selector/property 表 + 意图头写入
  kernel-print.css 顶部，css-architecture spec delta 同步登记
  （不再「保留迁移」措辞）。

## PrintPageConfig 受限语法 [r1-5]

结构化值 + 校验器，拒绝裸字符串拼接：

```ts
size: 'A4' | 'Letter' | { width: number; length: number; unit: 'mm'|'cm'|'in' }
margin: { top; right; bottom; left }（number + 同 unit 枚举）
marks: 'crop' | 'cross' | 'both' | undefined
header/footer: string-set 名 | 'counter(page)' | 'counter(pages)' 枚举位
```
parser 单测覆盖无效值拒绝（负数、未知单位、非法 enum）。

## 退役表 [r1-6]

| 旧件 | 归宿 |
| --- | --- |
| PagedDoc/Section/Figure/Aside/Ref/Block/Table/ToC/**PagedCode** | 删除（换行/行号语义迁克隆变换） |
| registry.svelte.ts / paged.css / print-projection.css | 删除；白名单表迁 kernel-print.css；print 投影规则迁 |
| medium.svelte.ts | 保留（context-plugin 接线） |
| verify-print.mjs | 重写：零 pagedjs 断言 → 懒加载 chunk 隔离断言（SSR/prerender 产物零 pagedjs）+ 管线冒烟 |
| /docs/paged.html 旧内容 | 重做为普通文档页 |

顺序法：**先改 gate 再删目录**；删后对 `lib/paged` 与 `Paged*` 做
零引用断言（源/barrel/import/manifest/route/tests/CSS 全扫）。

## web 不变的精确边界 [r1 证据纪律]

「docs **内容根**的正常流与页面自有样式不变」；layout 所有的打印
控件与输出 sibling 是**声明的增量**。不再宣称整页 byte-for-byte。

## 事实修正

proposal 中「paged.js 的 DOM 复制只在 sim」修正为：**应用先交脱离
live tree 的克隆；paged.js 只接触该克隆与页产物**（两出口同律）。
readiness（lazy 解除/超时预算/进度取消）为合同，非既成事实。
