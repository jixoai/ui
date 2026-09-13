# PRD: design-studio r3 — 走通流程 + dogfooding 重建

> 原始需求输入：Owner 走查反馈 2026-09-12（四条硬结论，issue
> #10–#14 全文）。r3 的产品目标只有两个：**Owner 能一口气走完
> 一个完整设计循环**；**studio 壳用 jixoai-ui 组件重建，重建
> 过程即组件库的打磨过程**。其余一切让位。

## 0. 一句话问题陈述

为 jixoai-ui 的维护者（首先是我们自己），在「原型 → 真实组件 →
宿主代码」的设计迭代中，没有一处能把**看、改、生成、留版、晋升、
收敛**做成一条闭环动线——现状 studio 流程断裂（Owner 无法完成
一次循环）、轮询闪烁、面板样式不合格，且它自身不用 jixoai-ui
构建，失去了「第一用户」的打磨位。现状替代方案：浏览器手开原型
页 + 手改源码 + 手 copy 文件进宿主（r2 之前的原始工作方式）。

## 1. 用户与价值主张

```
U0 组件库维护者（Owner/我们）     ← r3 的验收对象
U1 宿主项目开发者（jixoai-ui 消费者，在自己项目里 `jixoai-ui design`）
U2 社区贡献者（shadcn add 生态，远期）
```

- U0 的场景：设计/打磨一个组件族 → 需要真实视口矩阵、属性微调、
  agent 扩产变体、把定稿原型晋升回组件库周边代码。
- U1 的场景：项目里起 studio，用项目实际安装的 jixoai-ui 版本
  做原型，promote 进 `src/lib/design/`。
- **studio 是 jixoai-ui 的最苛刻消费者**（dogfooding 法则）：
  属性面板 = schema 驱动表单的最重用例；树 = list-item 家族的
  深嵌套用例；chat = input/chip/流式渲染用例。重建即打磨。

## 2. 核心循环与 moment of value

```
 浏览器 studio                          终端 CLI                studio 反馈
┌─────────────────────────┐   ┌──────────────────────┐   ┌─────────────┐
│ 浏览 ─ 选中 ─ 属性微调   │   │ save   （wip 留痕）   │   │             │
│        │                │→  │ release（tag+意图）   │→  │ updates 徽标│
│        └─ agent 扩产 ───┤   │ promote（进宿主 src） │   │ （status 漂移│
│           （写真文件）   │   │ status / apply（收敛）│   │   ≤4s 可见） │
└─────────────────────────┘   └──────────────────────┘   └─────────────┘
```

三个 moment of value（每个都必须在 Owner 走查中被亲身体到）：

- **MV1（30 秒）**：点选画布组件 → 面板出现 → 改一个 prop →
  画布 HMR 即变。用户此刻理解「面板改的是源码，不是玩具预览」。
- **MV2（几分钟）**：带着选中问 agent → agent 写真实文件 →
  navigator 出现新原型。理解「agent 是共同设计者」。
- **MV3（一次完整迭代）**：promote 后宿主改造、设计再变 →
  updates 徽标 → apply 三方合并尊重开发者改动。理解「设计稿和
  代码不再分家」。

**v0 裁决（r3 维持，记入 Non-goals 的反面）**：save/release/
promote/apply 的**写路径保持在 CLI**（git 是权威引擎，studio 内
按钮会造出第二套写路径——并发仲裁刚在 prop-edit 踩过 CAS 坑）。
studio 对管道是**读面 + 状态面**（徽标、changelog、diff、复制
命令）。r3 不做 studio 内管道按钮；做不做留给 r4 用真实使用数据
裁决（开放问题 Q2）。

## 3. 证据与假设

| 论断 | 等级 | 来源 |
|---|---|---|
| Owner 无法完成一次完整流程 | 一手（原话） | issue #11 |
| 面板每 ~4s 闪 loading | 一手（原话）+ 代码定位 | issue #12；shell.svelte L168-176 轮询 → frameFiles derived 对象 → panel effect 对象依赖 |
| 面板基本样式不合格 | 一手（原话） | issue #13 |
| dogfooding 是法则（推翻 r1 解耦决策） | 一手（裁决） | issue #10 |
| `#jixoai/<item>` 别名在 studio 壳可用 | 代码事实 | server/create.ts L326-331（`#jixoai/` → host.itemAliasBase；probe 保证存在） |
| 嵌套 frame 内画布点击拾取不可达 | 一手（r2 走查） | issue #14 P1-1；树路径可达为最低可用 |
| slot-derived props 面板退化 | 一手（r2 走查） | issue #14 P1-2 |
| **假设 H1**：稳定三栏 + 右栏上下分区优于「选中弹出第四栏」 | 假设（PM 判断，依据：布局跳变违反空间心智；置信度中高） | 最小验证：rebuild-plan T2 完成后 vision 走查 + Owner 30 秒试用 |
| **假设 H2**：走查失败主因是「断点+无引导」而非「CLI 切换终端」 | 假设（PM 判断，依据：Owner 是开发者、终端无门槛；置信度中） | 最小验证：r3 走查门通过后请 Owner 重走，若仍在 W6-W9 迷路则 r4 做流程 rail |

## 4. 目标与非目标

### 目标（r3 全部）

1. **G1 流程可用**：walkthrough-flow.md 的 W0–W9 十步全绿
   （含诚实降级路径），Owner 可一口气走完。
2. **G2 dogfooding 重建**：studio 壳五文件（shell/property-panel/
   component-tree/chat-panel/guide-panel）的 chrome 全部换成
   jixoai-ui 组件（经 `#jixoai/` 别名），消灭手写控件 CSS。
3. **G3 反哺闭环**：重建中发现的组件缺陷 → grindstone ledger
   → GitHub issue（component-feedback），有真实产出。
4. **G4 闪烁清零**：选中静置 ≥10s（≥2 个轮询周期）面板零
   loading 闪烁。

### 非目标（r3 明确不做）

- studio 内 save/release/promote/apply 按钮（§2 裁决）。
- slot-derived props 的跨文件类型解析（#14 P1-2——独立 change，
  触及 canvas-schema 内核）。
- chat 会话持久化 / agent turn 中断（abort）UI（记开放问题）。
- 协作、云端设计文件（r2 已裁永久排除）。

## 5. 当前实现 vs 产品意图的差距分析

| # | 意图 | 现状 | 差距定级 |
|---|---|---|---|
| 1 | 点选即改、改即所见 | 面板 4s 闪烁（#12）；布局在选中瞬间三栏跳四栏（shell L212/326-336 `studio-with-panel`）——画布宽度突变 | **断**（P0） |
| 2 | 嵌套视口里一切可选 | frame 文档内元素画布点击拾取不到（#14 P1-1），树可达 | 退化（P1） |
| 3 | 面板=设计语言的名片 | 手写 CSS：行式布局无分组节奏、无 loading 锁视觉、notice 无消退、focus 态缺失（#13 + 独立发现） | **断**（P1 重建解） |
| 4 | studio 是组件库第一用户 | r1「HOST DECOUPLING LAW」使壳零 host import（shell.svelte 顶部注释）——被 Owner 推翻（#10） | **断**（P1 重建解） |
| 5 | agent 是共同设计者 | 回路已证（dsh+glm live-loop）；但 turn 中无进度结构、无中断手段，chat 刷新即失忆 | 部分（P2） |
| 6 | 管道状态在 studio 可见 | updates 徽标已接 promotions.json；但 promotions 失败静默吞掉（无漂移≠endpoint 挂了无从分辨）；diff 是裸 `<pre>` | 部分（P1/P2） |
| 7 | 走查可按文档执行 | 动线从未被定义成文档（issue #11 的根因之一） | **断**（本文档族解决） |

### 独立发现（简报未列，读码/走读所得）

- **ID1 布局跳变**：`.studio-with-panel` 选中时 grid 15rem→15+16rem，
  iframe 每次点选都重排——「面板样式没做好」体感的放大器。
- **ID2 send 按钮态混乱**：streaming 时按钮文字换 "…"，无
  spinner、无 cancel；8 态不完整（chat-panel L258）。
- **ID3 manifestError 死胡同**：错误只显示一行字，无重试入口
  （shell L218-220）——error 态缺 recovery。
- **ID4 guide 无结果空态缺失**：搜索无匹配时区域直接空白。
- **ID5 notice 不消退**：面板 notice（409/non-representable）
  无自动消失也无手动关闭，一直挂到下次选中。
- **ID6 promotions 失败与无漂移不可分辨**（见差距 6）。
- **ID7 frame file unresolved 提示弱**：`frame.ref` 缺失的面板
  只读，仅一行小字解释，用户不知道原因和出路。
- **ID8 studio 壳层无全局 Escape**：Escape 只在 frame 内 picker
  生效（picker.js L116）；焦点在 studio 侧时面板只能靠 chip × 清。
- **ID9 chat sessionId 每次挂载随机、messages 内存态**：刷新
  丢全部对话（P2）。
- **ID10 tree max-height:45% 硬编码**：与 navigator 抢高度，
  深树溢出不可调（P1 重建范围）。

## 6. 度量

- **北极星**：Owner 走查一次通过率（W0–W9 十步中无需 Agent
  介入修复的步数 / 10）。r2 实测≈不可测（动线未定义）；r3 目标 10/10。
- **护栏 1**：dogfooding 深度——studio/*.svelte 的 `#jixoai/`
  import 数 ≥8 且 chrome 手写 CSS 行数较 r2 基线（663 行，见
  acceptance.md 门 3）降 ≥60%。
- **护栏 2**：design-tool 包测试全绿（r2 基线 105/105 + r3 新增
  回归），不因重建回退。
- 采样方式：走查门记录表（acceptance.md 附格式）+ `rg` 脚本断言。

## 7. 优先级与切片

```
P0 流程可用性   闪烁修复(#12) + 动线断点清零 + W0-W9 自走查绿
P1 dogfooding   稳定三栏 IA + 面板/树/导航/chat 组件化(#10 #13) + picker 嵌套(#14 P1-1)
P2 打磨         updates 面板深化、chat 持久/中断、动效、样式细节
```

首切片（tracer-bullet）：**T0 闪烁修复 + W2-W4（选中→改属性）**
这条最薄纵向路径——它同时压着 #12（最大的干扰源）和 MV1（第一个
moment of value）。走通它再横向铺开。

## 8. 风险与开放问题

- **R1 版本漂移**：壳直接消费 `#jixoai/*` 后，宿主装旧版组件缺
  件 → 壳挂。缓解：STUDIO_CHROME_ITEMS 清单 + probe 报缺件
  （rebuild-plan §2.3）。
- **R2 重建期间回归**：P0 修复与 P1 重建都动 studio 文件。缓解：
  P0 只修断点不动样式、P1 按面板逐个重建、每步跑 W 动线探针。
- **Q1** list-item 家族若无树形展开形态——临时用嵌套 ItemGroup
  + 开反哺 issue，还是 r3 顺手做 tree item？（倾向前者，见
  rebuild-plan §4 ledger 预置位）
- **Q2** 管道写路径是否进 studio（r4，等 r3 走查数据）。
- **Q3** chat 持久化的存储位（design repo? localStorage?）——r4。
