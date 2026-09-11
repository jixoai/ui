# Design: design-studio r2

## 0. 意图清单（本文件）

1. 设计文件格式 v1（registry-item 形状 JSON + 版本 + changelog）。
2. 晋升与变更通知：来源清单 + three-way apply（Owner Q2 澄清后的
   正解——通知"改了什么"并协助合并，不是自动双向同步）。
3. 元素定位的机制内核：dev-only 组件印章变换（data-jx-component）。
4. 属性面板的代码优先编辑路径：面板改的是原型源码（AST 定位 +
   magic-string 重写），不是运行时 props 注入。
5. 元数据按需提取与 meta.ts 注解区（Owner 裁决 ③）。
6. Layout 组件族 alpha 轨（Owner 裁决 ②）。

原始需求输入：Owner 走查反馈 2026-09-11 + 四项拍板（同日）。

## 1. 设计文件 v1

```
<name>.jixoai-design.json
{
  "$schema": "https://ui.jixoai.com/r/design-file.schema.json",
  "name": "checkout-flow",
  "type": "jixoai:design",
  "version": 3,
  "meta": { "created": "...", "viewports": [390,768,1280], ... },
  "changes": [
    { "version": 3, "at": "...", "note": "CTA 移入 hero；press-button 换 tonal rung" },
    ...
  ],
  "files": [ { "path": "canvas.svelte", "content": "..." }, ... ]
}
```

- `design save <proto> [-n "note"]`：diff 上次版本，有变化则
  version++ 落 changelog（note 缺省由最近一次 agent turn 摘要填充）。
  存放：`design/files/<name>.jixoai-design.json`。
- `design open <file>`：物化到 `design/prototypes/<name>/`（幂等，
  冲突时拒绝并指名）。版本号回写 workspace 索引。
- changelog 是 Agent 意图摘要的沉淀位（AI 原生红利：diff 之外的
  "为什么改"），也是 §2 变更报告的素材。

## 2. 晋升与变更通知（promote pipeline）

```
design promote <proto> [--select <ref...>] [--to <dir>]
  1. 复制 pages/components 文件 → 宿主 src（默认 src/lib/design/<proto>/）
  2. import 重写：#jixoai/<item> → 宿主别名（probe 产出）
  3. 来源清单落盘 design/.promotions.json：
     { file, proto, ref, baseSha256, designVersion, promotedAt }
```

**变更通知与 apply（Owner Q2 的答案）**：项目开发者拿到晋升代码后
自行改造（数据绑定等）。设计稿再改时：

```
design status   → 漂移报告：哪些晋升文件的设计版本已落后
                  + changelog（意图摘要）+ per-file 统一 diff（base→new）
design apply    → three-way merge：
                  base = 晋升时的设计内容（design file 里按版本可取）
                  ours = 项目当前文件（含开发者改造）
                  theirs = 新设计版本
                  干净 hunk 自动合并；冲突处插标记 + 指名报告；
                  不静默覆盖任何开发者的改动。
```

- 依据：git 的 three-way 模型是这个问题形状（base + 两条分叉线）
  的已证答案；本仓库 jixoai-ui.lock 的 sha256 惯例是来源清单的
  先例；diff3 算法用 `diff3` npm 包（纯 JS，加一个直接依赖）。
- 边界：apply 只处理"晋升过的文件"；开发者新建的关联文件不碰。
  base 内容取自设计文件的版本历史 → 设计文件必须保留历史版本
  的 files（save 时全量快照，接受体积换确定性）。

## 3. 元素定位：dev-only 组件印章变换

机制（本设计的关键裁决）：**design server 在变换 jixoai 组件源码时
给组件根元素盖 dev-only 印章**：

```
vite transform（仅 design server）
  registry/files/ui/<item>/<item>.svelte
    → 根元素追加 data-jx-component="<item>" data-jx-instance="<n>"
```

- 这是 canvasPlugin 源码变换先例的同族手法；dev-only（生产构建
  永不经过 design server，零泄漏）。
- 收益：选择器/TreeView/属性面板获得**精确的组件边界与身份**，
  不依赖脆弱的 class 启发式或 Svelte 内部标记。
- 嵌套实例用 instance 序号区分；印章属性进 DOM 但不影响布局。
- PrototypeKit 的 frame 元素本身也盖 `data-jx-prototype-frame`
  （r1 已有），frame ↔ 组件两级定位齐全。

**选择模型**：`selection = { frameId, instanceId }`（稳定地址）。
- 画布选择器：frame 文档内监听点击（studio 注入 picker 模块，
  同源直读），命中最近印章祖先 → 高亮 → 上报 studio。
- ComponentTreeView：frame 文档的印章树（depth-first）→ studio
  左侧树面板；树节点点击 = 选中 = 与选择器同一 selection 状态。
- chat 注入：输入框旁"当前选中"chip（frame + 组件名 + instance），
  发消息自动携带；Agent 收到即可定位文件 + 组件实例。

## 4. 属性面板：代码优先的编辑路径

裁决（Q3 代码优先的直接推论）：**面板编辑的是原型源码，不是运行时
props 注入**。

```
选中实例 → 组件 schema（§5 按需提取）
  → 面板渲染控件（ItemGroup 行，canvas-schema 的 x-ui 控件惯例）
  → 用户改控件值
  → design server 源码重写：
      svelte AST 定位该组件实例的 prop 字面量
      magic-string 替换（无字面量则插入）
      → HMR 生效（frame 即时更新）
```

- 未保存态 = 源码已改（代码即状态，无影子 model）。
- 不可表示的 prop（绑定表达式/非常量）→ 面板该行只读 + 提示
  "改代码"（诚实降级，canvas-schema 的 onvalue 先例语义）。
- 实例定位：印章 instance 序号 ↔ AST 内的第 n 个同名组件用法
  （同一变换管线可同时产出 DOM 印章与 AST 位置映射——提取器
  一次遍历两用）。

## 5. 元数据按需提取 + meta.ts 注解区

- **按需提取**：component-metadata-gen（构建期提交产物）的能力
  移植为 design server 的按需服务：`GET /__design__/api/meta/
  <item>.json` → 该组件的 jsonSchema（IR → jsonSchema 降维，
  canvas-schema 既有内核）。提取器源从根 scripts/ 收编或参数化
  引用（实现时按 scripts/component-metadata-gen.mjs 的形状定）。
- **注解区**（Owner 裁决 ③）：属性修饰（icon/i18n-key/分组/顺序）
  走 .meta.ts 两区制的手工注解区，注解词表 = x-ui 通道既有键 +
  少量新增（`x-ui.icon`、`x-ui.i18n`）。生成器校验注解键值
  （类型安全在生成器侧，不写新 lint 工具）。
- 属性面板与 guide 共用同一 schema 源。

## 6. Layout 组件族（alpha 轨）

- `prototype-plugin`（新包，`@jixoai/ui-prototype-plugin`，alpha）：
  Flex / Grid / Waterfall 三个布局组件，属性标准化
  （Flex: direction/wrap/align/justify/gap/...；Grid: cols/rows/
  areas/gap/...；Waterfall: columns/gap/strategy）。
- registry item 同步登记，meta 打 `alpha: true` 标记；shadcn add
  可装（社区可用，Q2 裁决的元能力贡献面）。
- 属性面板对 layout 组件的标准属性即时微调（§4 路径天然支持）。
- 收编标准库 = 后续 change（alpha 稳定后）。

## 7. v0 明确不做

- 双向自动同步（apply 是协助合并的显式命令，永不自动跑）。
- 设计文件的云端/协作（本地文件即全部）。
- 印章进生产（dev-only 变换，生产零痕迹）。
- 非 jixoai 组件（第三方/原生元素）的 schema 面板（树里可见、
  无属性面板，诚实降级）。

## 8. 验证计划

- VA1 save/open 往返：save → 删原型目录 → open → 文件逐字节还原。
- VA2 版本与 changelog：两次修改两次 save → version/changelog 正确。
- VP1 promote：ref 文件落宿主别名路径，import 重写正确。
- VP2 apply 干净合并：base+ours+theirs 三方，干净 hunk 自动进。
- VP3 apply 冲突：冲突标记 + 指名报告，ours 内容不丢。
- VC1 选择器：点击 frame 内按钮 → selection chip 显示
  press-button#2；TreeView 节点同步。
- VC2 chat 注入：带 selection 发消息 → 回复引用正确实例。
- VD1 面板编辑：改 variant → 源码 prop 字面量变化 → frame HMR。
- VD2 注解区：meta.ts 注 x-ui.icon → 面板行出图标。
- VD3 印章 dev-only：正常 vite build 产物无 data-jx-component。
- VL1 Layout alpha：三组件渲染 + 属性面板微调。
- VZ 全链路走查（vision，真实浏览器，三轮目击制延续 r1）。
