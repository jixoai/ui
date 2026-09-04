# Verification: print-determinism

Owner 指令（2026-09-04）：打印时响应式查询仍在工作，窄屏与宽屏的打印预览
不一致。grilling 五问共识（Q1 改辖域 / Q2 真浏览器双尺寸逐字节差分 / Q3
软化禁入 / Q4 封禁兜底不阻断 / Q5 全局遍历零白名单 + 组件生命周期）。
验收于 2026-09-04 完成。

## 复现与修复轨迹（真浏览器取证）

1. **基线 RED**（scripts/probe-print-diff.mjs，accordion.html）：
   800×600 与 1600×1200 打印姿势产物 DIFFERENT —— Owner 报告复现。
   paged.html（无响应式内容的打印演示页）基线全同，证实泄漏载体是
   响应式内容本身。
2. **containment 探针 GREEN**：`.pagedjs_area` 挂
   `container: jx-print-viewport / inline-size` 不扰动分页。
3. **泄漏三层拆解**（逐层取证定位）：
   - 宽度媒体查询 → 通道改辖域（首版 24 条；`not all and (width >= X)`
     反转后 25 条全改辖域，fallback 0）
   - **视口单位声明**（根因最深的一层）：hero 流式字号
     `text-[clamp(1.58rem,2.55vw,2.7rem)]` 不经任何 query —— 通道扩展出
     声明级覆盖（vw→cqw 族，实测 36 条），原件不动、姿势内后序胜出
   - **freeze 捕获的 transition 戳**：density 干预引发的 CSS transition
     在途集合随源布局（窗口）变化 —— 沉降屏障（有界 600ms 等 transition
     跑完）使捕获台账恒为空，同视口三次自洽复跑验证非竞态
4. **playground vh cap**（min(36rem,70vh)）入 kernel-print whitelist
   （与 canvas-scroll 同族平铺）。
5. **差分 GREEN**：两视口页面盒序列 + 每页元素数/stamp 数 + hero 字号
   逐字节一致。

## 门禁

- **verify-print 35/35**（新增 2l 差分门禁：800×600 ≡ 1600×1200 逐字节，
  通道 report 规范化 durationMs 后比较；rescopeCount>0、fallback=0、
  unitOverrideCount>0、hero 字号在场断言）
- **jsdom 单元 7/7**（print-viewport.spec.ts：改辖域/layer 与 print 链
  保真/tw4 max- 反转/非宽度不动/height 族与 screen 型兜底告警/单位覆盖
  原件不动/disarm 零残留）。clamp 值 jsdom 的 cssstyle 不可解析，该场景
  由真浏览器差分覆盖（36 条中含 hero clamp）
- **全量 vitest**：见下方记录（print 系 32+7 全绿）
- verify:mirror GREEN（本轮改动面不在镜像集：print 基础设施与 paged 页
  均未镜像）
- 根 build exit 0；corpus 已收割 determinism 节（paged.html 文档面）

## 架构记录

- **生命周期修正**（Owner Q5 裁决的工程落点）：PrintDoc 包装层常驻每个
  docs 页，通道若跟它走会拖垮 web 面响应式 —— 绑定对象是其本意所指的
  **打印产物生命周期**：`stampActive(on)` 持有通道（六个调用点自动获得
  挂载/卸载对称；standby 预览=页面挂载态，天然激活）。
- **改辖域匹配 query 语法而非名字**：自定义断点/私有标准零成本兼容；
  tw4 的 max- 反型（`not all and (width>=X)`）做算子反转改辖域。
- **不可表达兜底**：height 族特征、screen 型宽度查询、不可反转的否定
  —— 封禁 + console.warn（选择器 + 原条件），绝不阻断打印手势。
- **跨域无 CORS 表**：枚举 + 告警（本站为零）。
- **iframe 否决**：八条理由入 design.md §2，永不再议。

## 验收入口

http://127.0.0.1:4174/docs/paged.html#determinism（AI-First 三段指引：
可用 / 不建议打印存活面 / 为什么）；任意组件页把窗口拉窄/拉宽分别开打印
预览，断页产物一致。
