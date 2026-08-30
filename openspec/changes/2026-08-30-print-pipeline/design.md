# Design: print-pipeline (r2)

研究基座：pagedjs-source-research.md；r1 评审 codex-plan-review-print-r1.md
六阻塞+接缝合同全闭合，裁决标 [r1-n]。

## 管线全景（prepareSnapshot 事务 [r1-1]）

```
触发（UI 打印入口：sim 开关 | 「直接打印」按钮；Ctrl+P = 原生回退路径，文档化降级，不入合同）
→ 【预备媒介信号】sim 开关=盖 stamp；「直接打印」=同一入口先盖 stamp
   （medium 'sim' → print 插件 filter 开门）→ prepareSnapshot 完成后
   window.print()（realPrint 升级 medium 为 'print'，真 > sim）→
   afterprint → 摘 stamp → screen。beforeprint 仅作真实信号，永不
   担任异步准备入口。
→ 不可变干预落 live：density→sm（resolveDensity 终值）、hue→钉缺省（hue adapter）
→ 动画冻结（作用域协议）：只枚举 source 根 subtree
   （root.getAnimations({subtree:true})）；逐项记录
   {anim, wasRunning, currentTime}；仅 pause wasRunning 的项——
   事务前已 paused 的永不触碰、也永不恢复；restore token 幂等，
   只恢复本事务暂停的项
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
- **single-flight 与取消边界**：in-flight token 取消**准备阶段**（preview
  之前的任意步）；进入 preview 后的取消 = 移除 output 根 + 销毁产物句柄
  （best-effort，fixture 断言无残留）。renderTo 前置断言：output 根
  **非 display:none 且可测量**（offsetWidth > 0——paged.js 对零尺寸
  容器产出零尺寸页；打印专用态用离屏定位而非隐藏）。
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
