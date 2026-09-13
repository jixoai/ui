# r3 重构执行计划（design-studio r3）

> 执行顺序铁律：**P0 修流程断点（不动样式）→ P1 组件化重建 →
> P2 打磨**。P0 先行是为了避免「先重建再修断点」造成的面板双写
> 浪费；P0 不碰样式是为了不和 P1 的重建范围打架。

## 1. 信息架构（IA）：稳定三栏，消灭第四栏

### 现状问题

```
现状（r2）                              病灶
┌────┬──────────────┬────┐
│nav │   preview    │rail│            ① 选中组件 → 3栏跳4栏（.studio-with-panel）
│    │              │chat│               preview 每次点选都重排（ID1）
│tree│              │guide│            ② guide（低频速查）常驻 45% 高度
└────┴──────────────┴────┘             ③ tree max-height 45% 硬编码（ID10）
   ↑ selection 出现时弹出 16rem 第四栏    ④ 属性面板（高频枢纽）以出现/消失方式存在
```

### r3 IA：右检查器双区，左导航双区

```
┌──────────┬──────────────────────────┬───────────────┐
│ 左导航     │        舞台 stage         │  检查器        │
│──────────│                          │───────────────│
│ canvases  │                          │ 属性面板（常驻） │
│  + frames │   真实 iframe 画布        │  空态=动线引导  │
│──────────│   （宽度永不因选择变化）     │───────────────│
│ 组件树     │                          │ ┌────┬─────┐ │
│ （弹性区） │                          │ │chat│guide│ │ ← tab，chat 默认
│           │                          │ └────┴─────┘ │
└──────────┴──────────────────────────┴───────────────┘
     15rem                1fr                24rem（上下分区可拖）
```

裁决依据（prd 假设 H1，证据=布局跳变违反空间心智 + 二八法则）：

- **属性面板常驻右栏上区**：它是核心 loop 枢纽（MV1 载体）。
  未选中时不是空白——空态文案就是动线引导（「点击画布或树中的
  组件」），取代「弹出第四栏」的出现/消失模型。
- **chat 与 guide 合并为右栏下区 tab**：chat 是高频（agent 扩产）、
  guide 是低频速查（141 组件索引）——二八法则，低频收纳。tab 切换
  不丢 chat 状态（两 tab 都保持挂载，非活动侧 `hidden`）。
- **stage 宽度永远稳定**：grid 列在任何 selection 状态下不变，
  消灭 iframe 重排（ID1 的根治）。
- **树占左栏弹性区**：与 canvases 列表以 1px 分界（可拖 divider
  为 P2，先弹性 flex + min-height 兜底），去掉 45% 硬编码。
- 不设全局顶栏：品牌行留在左栏顶部（现状即可），不发明 chrome。

### 布局实现口径

grid 供给布局（仓库法则）：`.studio` 的 `grid-template-columns:
15rem 1fr 24rem` 三列固定，右栏内部再 `grid-template-rows` 分
属性面板区（自适应内容，min 40%）与 chat/guide 区。shell 保留的
自有 CSS 仅限**布局骨架 + studio 特有间距**；一切控件 chrome 归
组件（见 §2）。

## 2. dogfooding 重建：通路、契约与组件映射

### 2.1 双通路架构（对 issue #10 验收 2 的回答）

```
主通路（包内默认）：
  shell/面板源码直接 `import X from '#jixoai/<item>'`
  —— design server 别名表把 #jixoai/ → host.itemAliasBase
  （server/create.ts L326-331，probe 保证存在）
  ⇒ 包即 dogfooder；宿主实际安装的 jixoai-ui 版本即测试矩阵；
    组件改动经 HMR 直接在 studio 壳热更，打磨回路最短。

辅通路（宿主组合点，保留并强化）：
  design/studio.svelte（scaffold 生成、宿主可改）继续 wrap
  <DesignShell/>，可传 props 覆盖少数 chrome 口子（brand、面板
  头部装饰），可加宿主自己的外壳 chrome。
  ⇒ 布局契约 = shell 拥有 grid 结构与 slot 语义（布局是结构，
    不是视觉系统）；视觉契约 = #jixoai/* 组件。
```

为何主通路是「直接 import」而非「全量组件注入 props」：注入方案
要为几十个组件定义契约面，违背「不发明第三套 UI 系统」的成本边
界；而 `#jixoai/` 别名在 design server 内是**结构性存在**（r1
的解耦顾虑「包依赖宿主」已被该事实消解——耦合是经契约的耦合，
契约就是别名表 + 组件源）。r1「HOST DECOUPLING LAW」就此作废，
shell.svelte 顶部注释须改写。

### 2.2 组件映射表（重建的施工图）

| studio 面 | 现状（手写 CSS） | 重建（#jixoai/*） | 先例/备注 |
|---|---|---|---|
| 属性面板行 | .row/.seg/.stepper/.text-form | `list-item` 家族：`ItemGroup mode="plain" controlChrome="integrated" density="sm"` + ItemToggle/ItemSelect/ItemInput/ItemField(control snippet) | **dock 先例**：registry/files/ui/component-canvas/canvas-playground.svelte L447-559；openspec/specs/canvas-schema/spec.md dock 章 |
| 面板头/分区 | .panel-head | ItemGroup 头部惯例 + `separator` | |
| 面板 notice/lock | .panel-notice/.panel-lock | `alert`（可 dismiss）→ 修 ID5 | notice 消退语义随组件自带 |
| 组件树行 | .tree-row/.tree-children | `list-item` 行 + 嵌套缩进；**若家族无树形态 → 开反哺 issue（Q1），临时以嵌套 ItemGroup 过渡** | 树形 = ledger 预置候选 |
| 树/列表增删 | 无动效（DOM 硬闪） | 列表物理惯性动效（仓库法则） | P2 打磨位 |
| navigator 画布行 | .studio-canvas | list-item 行（selected 态用家族高亮） | |
| updates 徽标 | .studio-updates-badge | `badge`（warning 语义位） | |
| updates 详情 | .studio-updates-detail + 裸 pre | `card`/`descriptions` + diff 用 `code-card` | P1 后期/P2 |
| chat 输入+发送 | .chat-input | `input`（textarea 形态；缺则开 issue）+ `press-button`（loading 态=加载锁，修 ID2） | press-button 本身是 welcome 原型主角——同件双磨 |
| selection chip | .chat-chip + ×按钮 | `chip`（removable） | |
| guide 分组 | details/summary | `accordion`；搜索无结果 → `empty`（修 ID4） | |
| 面板/树空态 | 小字文案 | `empty`（带动作引导文案） | 空态即动线引导 |
| manifest 错误 | 死胡同文案 | `alert` + 重试 `press-button`（修 ID3） | error 态 recovery |
| loading 视觉 | "loading…" 文案 | 行级禁用 + 组件 loading 态；面板级用骨架/进度（8 态） | |

映射原则：**上表之外不新增手写控件**。studio 残留 `<style>` 只
允许：grid 骨架、面板间距、z 序（若有）——acceptance 门 3 可量化。

### 2.3 版本边界（风险 R1 的缓解）

- 导出 `STUDIO_CHROME_ITEMS: readonly string[]`（壳消费的 item
  清单，如 `['list-item','press-button','chip','badge','alert',
  'accordion','empty','input','card','separator']`）——它同时是
  **dogfooding 覆盖活清单**。
- probe 阶段（或 studio-entry 启动时）对照清单报缺件：缺 → 明确
  报错（「宿主 jixoai-ui 版本过旧，studio 需要 ≥X」），不静默挂。

## 3. 优先级与切片

```
P0 流程可用性（W 动线断点清零，不动样式）
  T0 轮询闪烁修复（#12）
  T1 断点修复包（ID3 ID4 ID5 ID6 ID7 + W3 引导文案）
  GATE-0 走查门预演：W0-W5 agent 自走查绿（浏览器+断言）
P1 dogfooding 重建（#10 #13 + #14 P1-1）
  T2 IA 重排（稳定三栏——纯结构，样式最小）
  T3 属性面板 ItemGroup 重建（dock 先例移植）
  T4 树 + 导航组件化
  T5 chat/guide 区组件化
  T6 picker 嵌套触达修复（#14 P1-1，可与 T2-T5 并行）
  GATE-1 走查门：W0-W9 全绿 + dogfooding 量化门
P2 打磨
  T7 面板 8 态补全 + focus/hover 密度细节 + updates 面板（code-card diff）
  T8 动效（树/列表物理惯性）、chat 持久化与 abort（开放问题 Q3）
```

首切片（tracer-bullet，与 prd §7 一致）：**T0 + W2-W4 纵向贯通**。

## 4. 子任务拆分（分发用）

> 标注：【V】= vision 子代理（视觉/前端）、【G】= general-purpose
> 子代理（后端/逻辑）。每个任务附验收锚点（对应 W 步/门）。

| 任务 | 内容 | 代理 | 依赖 | 验收锚点 |
|---|---|---|---|---|
| T0 闪烁修复 | §5 详案；含回归测试 | 【G】 | 无 | W2 断言③ |
| T1 断点修复包 | ID3（alert+重试）、ID4（empty）、ID5（notice 消退）、ID6（promotions 失败可见——区分「无漂移/加载失败」）、ID7（unresolved 提示强化 + W3「从树中选择」引导文案） | 【V】（ID3/4/5/7 涉及视觉文案与组件位）+【G】（ID6 数据态） | 无 | W3/W4/W8 断言 |
| T2 IA 重排 | 稳定三栏 + 右栏双区 + chat/guide tab（两 tab 保挂载）；删 `.studio-with-panel`；tree 弹性区 | 【G】结构 +【V】走查 | T0（避免面板双写） | W0 断言②、全程无跳变 |
| T3 面板重建 | §2.2 映射：ItemGroup 行家族 + 空态引导 + 锁定态视觉；保持 selection/effect 逻辑不动（T0 已修好） | 【V】 | T2 | W2/W4 + 门 3 |
| T4 树+导航重建 | list-item 树形（或 Q1 过渡）+ badge 徽标 + 空态 | 【V】 | T2 | W1/W3 + 门 3 |
| T5 chat/guide 重建 | input/press-button/chip/accordion/empty/tab 分区 | 【V】 | T2 | W0/W5 + 门 3 |
| T6 picker 嵌套 | picker.js 跨层激活链修复（#14 P1-1） | 【G】 | 无（可并行） | W3 画布路径可选断言 |
| T7 打磨 | 8 态补全（loading 锁视觉、focus）、updates 详情（code-card） | 【V】 | T3-T5 | W4/W8 观感 |
| T8 反哺维护 | grindstone ledger 维护 + issue 开立（§6） | 编排者 | 贯穿 | 门 5 |
| 走查门执行 | acceptance.md 全门跑一遍，产出证据表 | 【V】主导 +【G】断言脚本 | 全部 | 门 1-6 |

## 5. T0 详案：轮询闪烁（#12）的修复规格

根因链（读码确认，与 issue #12 一致）：

```
shell $effect 4s interval
  → refreshManifest(): manifest = await json()   ← 每轮新数组对象（identity churn 起点）
  → current / frameFiles ($derived.by) 重算       ← 新 map 对象
  → property-panel seed $effect 读 frameFiles[…]  ← 对象依赖！
  → effect 整体重跑：meta=null → "loading" 闪     ← 病灶
```

修复（两层都要做，互相独立成立）：

1. **源头等价性门禁（shell）**：manifest/promotions fetch 后做
   结构签名比对（name+path+frames[].id/ref 序列化；promotions 用
   file/proto/tag/drifted 序列化），签名不变则**不写 $state**——
   数据真的变了才换 identity。轮询保留（agent 写文件的刷新通道，
   W5 断言④依赖它），churn 删除。
2. **消费端依赖收窄（panel 契约）**：shell 不再传 `frameFiles`
   对象，改传 `selectionFile: string | null`（primitive，shell 侧
   derived）+ `frameLabel`；panel 的 seed effect 依赖只剩
   primitives（frameId/usageIndex/component/selectionFile）。
   —— r2 的 P2-1 修复已把 selection 键收窄为 primitives，这次把
   frameFiles 这最后一个对象依赖拆掉，同类问题一次清零。
3. **审计同型**：树（MutationObserver 防抖后 `records = [...]`
   每次新数组）与 updates 徽标派生对象按同一清单过一遍；凡「轮询/
   事件 → 新对象 → 下游 effect」的边，要么源头门禁要么消费收窄。

回归测试：选中后连续两轮 manifest 轮询（手动触发 fetch 或缩短
interval 注入），断言 panel seed effect 不重跑（计数器/spy）；
加 W2 断言③（10s 静置零闪烁）为 e2e 钉。

## 6. 对组件库的反哺机制（grindstone ledger）

```
重建/走查中发现组件不合适
  → 当场记录本文件 §6.1 ledger（组件/问题/证据/绕行方案）
  → 可绕行 → 绕行 + 开 GitHub issue（label: component-feedback，
    正文引 r3 + ledger 行）
  → 不可绕行 → 升级为 r3 子任务（阻塞对应 T*），并在 issue 标注
  → ledger 每周（或每轮走查后）由编排者回查 issue 状态
```

### 6.1 ledger（初始预置——重建前即已可见的候选）

| 组件 | 预置问题（待重建实证） | 状态 |
|---|---|---|
| list-item 家族 | 树形/可展开行形态是否存在；不存在则嵌套 ItemGroup 过渡（Q1，prd 开放问题） | 待 T4 实证 |
| input | textarea 形态与 autogrow（chat 输入需要） | 待 T5 实证 |
| press-button | loading 态语义（icon 位/文字替换）是否够「加载锁」表达（ID2） | 待 T5 实证 |
| badge | 语义位（warning/updates）与可交互徽标（badge as button） | 待 T4 实证 |
| alert | dismiss 消退与常驻两种模式 | 待 T1/T3 实证 |
| empty | 带 CTA 的空态（引导文案+动作） | 待 T3 实证 |

### 6.2 与 dogfooding 量化挂钩

STUDIO_CHROME_ITEMS（§2.3）+ ledger 覆盖的组件集，就是「studio
作为第一用户」的可审计足迹——acceptance 门 3/门 5 检查它们。

## 7. 已知缺陷在计划中的落位（对照表）

| 缺陷 | 落位 |
|---|---|
| #10 dogfooding | §2 全部（P1：T2-T5） |
| #11 走查动线 | walkthrough-flow.md + GATE-0/GATE-1（P0 预演 + P1 全绿） |
| #12 闪烁 | §5（P0：T0） |
| #13 面板样式 | §2.2 面板行 + T3/T7（P1 主体、P2 细节） |
| #14 P1-1 picker | T6（P1，与重建并行） |
| #14 P1-2 slot-derived | r3 非目标（独立 change，canvas-schema 内核）；走查 W4 如实展示退化 |
| prd ID1-ID10 | ID1→T2；ID2→T5/T7；ID3/4/5/7→T1；ID6→T1；ID8→P2（记 backlog）；ID9→T8 开放问题 Q3；ID10→T2 |
