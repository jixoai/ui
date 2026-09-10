# Design: print-determinism

## 0. 决策日志（grilling 共识，2026-09-04）

| # | 决策 | 结论 |
|---|---|---|
| Q1 | 变换语义 | 改辖域（viewport width query → 容器查询），非封禁 |
| Q2 | 验收 | 真实浏览器双尺寸差分（800×600 vs 1600×1200）+ 逐字节严格；jsdom 静态断言为单元层 |
| Q3 | 视口单位 | 软化禁入：自家 2 处清扫；框架层面 = AI-First 文档指引，不硬禁 |
| Q4 | 兜底 | 不可表达 query → 封禁 + 大声日志，绝不阻断打印手势 |
| Q5 | 作用域/生命周期 | 全局遍历零白名单；跟 PrintDoc 组件生命周期走（挂载生效含 standby，卸载撤销） |

## 1. 不确定性来源的三层分解

1. **分页层**：paged.js 在活窗口宽度下断页，窗口状态烤进 DOM（断点位置、
   盖好的行内 stamp）。
2. **渲染层**：浏览器最终打印渲染按规范对纸宽求值（Chrome 遵循），但第 1
   层烤坏的状态不可逆；Firefox/Safari 行为各异。
3. **JS 测量层**：窗口派生 stamp（button-group wrap 盖章等）与视口单位
   声明（`vh/vw`）在分页测量时对窗口求值。

## 2. iframe 否决记录（永不再议的八个理由）

> 归档于此，供未来任何"要不要页宽固定宿主"的讨论引用。

1. **ambient 打印契约破裂**：用户 Cmd+P / 浏览器菜单打印的是顶层文档，
   没有任何 API 能把原生打印重定向到 iframe；只能劫持键盘 + 覆写
   `window.print` —— 违背管线"浏览器发起也能走通"的既定法则
   （verify-print 专测 ambient 路径）。
2. **全量样式搬运**：哈希产物表、运行时注入样式、adoptedStyleSheets、
   `@layer` 顺序全部要克隆进 frame；**`:root` 自定义属性不跨文档继承**，
   主题 token 体系得整套重声明。
3. **活 DOM 切断**：克隆冻结 JS 状态 —— 监听器、ResizeObserver stamp、
   Svelte 效果与 context、popover 态全部失联；`document.adoptNode` 搬得动
   节点搬不动生态。
4. **WebComponent 定义 per-document**：custom elements 必须在 frame 内
   重新注册（Owner 2026-09-04 提出，成立）。
5. **双管线开销**：第二个 paged.js 实例、字体重新加载（打印瞬间 FOUC
   风险）、内存 ×2。
6. **verify-print 全套 in-window pose 断言需要重写**，残留/退出法则要在
   frame 内重新证明。
7. **跨帧测量管线重架**：folio 回填、relocate 等都要在 frame 边界重新架桥。
8. **浏览器怪癖**：Safari iframe 打印历史怪癖；页边距与 iframe 盒的相互
   作用不可控。

（`iframe.contentWindow.print()` 本身可用，但方向反了 —— 问题是原生打印
无法指向 frame。）

## 3. 改辖域通道（print-viewport 模块）

### 3.1 遍历

- 入口：`document.styleSheets` + `document.adoptedStyleSheets` +
  `<style media="…">` / `<link media="…">` 元素形态。
- 递归进 `CSSLayerBlockRule` / `@supports` / 嵌套 groupings，**记录每条
  规则的 layer 路径**（合成时注回同名 layer，cascade 位置不变）。
- 跨域无 CORS 的表：rules 不可读 —— 枚举 + console 警告（白名单实践上
  皆为 @font-face 类，风险低）。

### 3.2 变换

- 匹配 `rule.media.mediaText` 中的宽度特征族：`min-width` / `max-width` /
  `width` / `min-device-width` / `max-device-width` / `device-width`
  （range 语法 `width>=…` 由 mediaText 统一形态承载）。
- 宽度特征 → `@container jx-print-viewport (…)`（值原样保留 —— 自定义
  断点、私有标准零成本兼容，匹配的是**语法**不是名字）。
- 非宽度特征（`hover` / `forced-colors` / …）：保留为外层 `@media` 复合
  （`@media (hover:hover) { @container jx-print-viewport (…) { … } }`）。
- 原件禁用：`media.appendMedium('not all')`（可逆，卸载时摘除）。
- 合成注入：运行时 `<style>`（记入残留登记表），同 layer 名包裹。
- **无法表达**（怪语法等）：封禁 + `console.warn`（选择器 + 原条件）+
  计数入 verify-print 输出。绝不 throw、绝不阻断打印。

### 3.3 容器挂载

- 页面内容盒（paged.js 页内容区，分页内容的最近共同祖先容器）挂
  `container: jx-print-viewport / inline-size`。
- **P1 探针先行**：`container-type: inline-size` 是否扰动 paged.js 分页
  （inline-size containment 理论安全 —— 页面区宽度本就纸驱动 —— 但必须
  实测钉死）。

### 3.4 生命周期（Q5：跟组件走）

- PrintDoc 挂载 → 通道生效（standby 预览态同激活：预览必须等于打印）。
- PrintDoc 卸载 → 摘除全部 `not all`、移除合成 `<style>`、解除容器 ——
  骑既有 dispose/零残留法则，verify-print 的残留断言直接扩展覆盖。

## 4. JS 派生 stamp（P3，审计驱动）

- 审计清单：button-group wrap 盖章、其它 ResizeObserver 派生 stamp。
- 预期：内容搬入页面区后容器宽度即纸宽，RO 重测本应自然确定化；**以差分
  门禁实测为准** —— 泄漏则按 freeze 模块冻结/重算，不预设方案。

## 5. 差分门禁（P4，验收定义）

- verify-print 扩展：真实 Chromium，同一文档分别在 800×600 与 1600×1200
  视口走完整打印姿势；断言页面盒序列（每页宽高）、内容 stamp、folio
  **逐字节一致**。
- jsdom 单元层：变换正确性静态断言（合成规则数、原件禁用、layer 保真、
  非宽度特征复合形态、卸载还原零残留）。

## 6. 视口单位（Q3：软化禁入）

- 自家清扫：component-canvas 的 `min(32rem, 60vh)` / `min(36rem, 70vh)`
  两处纵向 cap（打印存活面唯一真实库存）→ 确定性写法。
- 框架指引（不硬禁）：文档页"打印确定性最佳实践"节 —— ①单位仍可用
  ②不建议用于打印存活内容 ③为什么（分页测量对窗口求值、渲染对纸求值的
  错位）。进 corpus/llms.txt，AI 开发者按打印需求自行权衡（网页应用脚手架
  无打印需求，不受约束）。

## 7. 风险与开放项

- containment 探针失败（P1 红灯）→ 备选挂载点：pagebox 外层 sheet /
  pagedjs_area 的宿主链，逐一实测。
- 巨型样式表的遍历/改写性能：姿势建立是一次性成本（beforeprint 内完成），
  与 paged.js 分页成本同量级；实测计时入 P2 验收。
- 构造样式表（ConstructedStyleSheet）在 adoptedStyleSheets 内随遍历覆盖。
