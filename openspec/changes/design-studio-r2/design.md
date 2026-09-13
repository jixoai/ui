# Design: design-studio r2

> r2 修订（2026-09-11）：吸收 super-thinker 复核（7/10）的 B1–B3
> 阻塞与 H1–H6 风险。印章改判 usage-site 注入；实例地址引入
> usage/iteration 双轴；补竞态仲裁与 day-1 HMR spike；路径锚定
> 统一走 host.itemAliasBase。
> **r2.1（同日 Owner 裁决）**：管道层存储全面 git 化（release 模型
> 取代内联快照与 JSON 版本库；见 §1/§2 重写与 working-agreement.md
> 的通用组件独立工作流）。

## 0. 意图清单（本文件）

1. 设计文件格式 v1（registry-item 形状 JSON + 版本 + changelog）。
2. 晋升与变更通知：来源清单（内联 base 快照）+ three-way apply
   （Owner Q2 澄清后的正解——通知"改了什么"并协助合并，不是
   自动双向同步）。
3. 元素定位的机制内核：dev-only **usage-site 印章注入**。
4. 属性面板的代码优先编辑路径：面板改的是原型源码（AST 定位 +
   magic-string 重写 + CAS 写仲裁），不是运行时 props 注入。
5. 元数据按需提取与 meta.ts 注解区（Owner 裁决 ③；vehicle 侧
   边界如实标注）。
6. Layout 组件族 alpha 轨（Owner 裁决 ②）。

原始需求输入：Owner 走查反馈 2026-09-11 + 四项拍板（同日）。

## 1. 版本与发布（git release 模型，Owner 2026-09-11）

**design/ 是一个嵌套 git 仓库**（design/.git；宿主 repo 零污染，
design/ 整体 gitignore 不变）。GitHub release 管理模型的映射：

```
design init          幂等建仓 + 初始 commit（首次运行自动）
design save [-n]     wip commit（设计进展自动留痕，无版本语义）
design release [name] [-n notes]
                     版本 checkpoint = annotated tag（开发者主动打）
                     notes 即 release notes（缺省取最近 agent turn 摘要）
                     可选 --export 出 design/files/<name>.jixoai-design.json
                     （tag 时点的 registry-item 形状快照——跨项目共享
                      工件；git 才是版本库，JSON 只是发布产物）
design log / design diff <tagA>..<tagB>
                     release 历史 / tag 间 diff（可导出 patch）
```

- tag 语义即 GitHub release：`design diff v1..v2 --by-page` 按页面
  分组报"哪些没变/哪些变了"（git diff --name-status 的包装）。
- AI 升级路径：`design apply --agent` 把 diff + release notes 喂给
  设计 agent 做语义升级（机械合并之外的选项，见 §2）。
- 嵌套仓库是可否决的工程选择（备选：design/ 进宿主 repo 历史）；
  好处是宿主零污染 + 设计历史独立 remote 化（团队共享自然延伸）。

## 2. 晋升与变更通知（promote pipeline，git 引擎版）

```
design promote <proto> [--select <ref...>] [--to <dir>]
  1. 复制 pages/components 文件 → 宿主 src（默认 src/lib/design/<proto>/）
  2. import 重写：#jixoai/<item> → 宿主别名（probe 产出；纯函数
     rewriteSpecifiers）
  3. 来源清单 design/.promotions.json：
     { file, proto, ref, tag, commitSha, promotedAt }
     （base 内容不再内联——git 对象库就是快照库）
```

**变更通知与 apply（Owner Q2 的答案，git 特性直供）**：

```
design status   → git diff --name-status <promoted-tag>..HEAD 按原型分组
                  + release notes（tag annotation，意图摘要）
                  + per-file 统一 diff（git diff，theirs 过重写管道）
design apply    → git merge-file 三方合并：
                  base  = git show <tag>:<proto>/<file> 过重写管道
                  ours  = 项目当前文件（开发者改造）
                  theirs = HEAD 版本过重写管道
                  干净 hunk 自动合并；git 风格冲突标记 + 指名报告；
                  ours 已删除跳过并列名；写回前 CAS 校验 ours 未漂移。
design apply --agent → 机械合并之外：diff + notes 交设计 agent
                  对冲突/语义性变更（prop 改名、结构调整）做
                  agent 介导升级（产出 patch 供人审）。
```

- 依据：git 的 release/compare/merge-file 是这套形状的原生引擎
  （Owner 方向）；jxoai-ui.lock sha256 惯例仍是来源清单先例；
  **diff3 npm 依赖取消**（r2.1），git 成为工作流硬依赖。
- studio 侧收口不变：updates-available 徽标（status API 同形状）。

## 3. 元素定位：dev-only usage-site 印章注入

机制（r2 修订，复核 B1）：**design server 变换使用方模块**——
一切经 `host.itemAliasBase` 解析到 jixoai 组件的源文件（原型
pages/components、以及任何宿主模块），在**第 n 个 jixoai 组件
用法标签**上注入静态印章属性：

```
vite transform（仅 design server，匹配 usage 模块）
  design/prototypes/**/*.svelte 及宿主消费 jixoai 组件的模块
    第 n 个 <PressButton ...> 用法 → 注入 data-jx-component="press-button"
                                             data-jx-instance="<n>"
  （n = 文档序静态编号；同一遍历产出 {file, usageIndex} → AST
    prop 位置映射，供 §4 面板复用——一次遍历两用）
```

- 印章经组件的 `{...rest}` spread 落到根元素（press-button 实证：
  双条件根都有 spread）。**前提如实声明**：无单根 rest-spread 的
  jixoai 组件 → 无印章 → 不可选中不可见（降级矩阵的一行，不是
  隐式失败）。第三方/原生元素同理不可见——**树 = 印章树**（r1
  草稿的"第三方树可见"承诺裁掉）。
- dev-only：生产构建永不经过 design server（VD3 断言）。
- HMR 稳定性是构造性的：同一源码 → 同一静态编号（transform
  确定性），不是运行时计数。
- **实例地址（复核 B3）**：`{file, usageIndex, iterationIndex?}`。
  `{#each}` 内的用法渲染 N 实例共享 usageIndex——面板编辑作用于
  用法点并如实标注"N instances share this usage"；selection 的
  DOM 侧高亮可以定位到具体 iteration（运行时），但**编辑语义
  永远落在用法点**。
- PrototypeKit frame 元素已有 `data-jx-prototype-frame`，
  frame ↔ 组件两级定位齐全。
- 选择模型：`selection = { frameId, usageIndex, iterationIndex? }`。
  画布选择器（studio 注入 picker，同源直读，点击 → 最近印章
  祖先 → 高亮）与 ComponentTreeView（frame 印章树）共享同一
  selection；chat 输入框旁 chip 携带 selection 上下文。

## 4. 属性面板：代码优先的编辑路径 + 写仲裁

裁决（Q3 推论）：**面板编辑的是原型源码**。

```
选中 usage → 组件 schema（§5）→ 控件（x-ui 惯例，ItemGroup 行）
  → 用户改值 → 源码重写：
      AST 定位该用法点的 prop 字面量（§3 的位置映射）
      magic-string 替换（无字面量则插入）
      CAS 写仲裁（复核 H1）：
        读时记内容 hash → 写前复读校验；不一致 = 期间有外部写入
        （agent/编辑器）→ 按地址重定位重试一次 → 仍失败则放弃
        并提示（绝不盲写）
      → HMR 生效
```

- **agent turn 进行中面板禁写**（H1 的 UX 规则）：chat streaming
  期间属性面板进入只读态，turn 结束恢复。
- 不可表示的 prop（绑定/非常量）→ 只读 + "edit in code"提示。
- 循环用法：面板标注共享（§3），编辑改用法点。

## 5. 元数据按需提取 + meta.ts 注解区

- **按需提取**：`GET /__design__/api/meta/<item>.json`，提取
  kernel 来自 component-metadata-gen（TS-AST 的 $props 类型解析）。
  路径锚定 `host.itemAliasBase`（probe 产出；vehicle =
  registry/files/ui，宿主 = 安装位）——不复用 gen 脚本对
  apps/www 的路径硬依赖（复核 H3）。
- **依赖裁决（H4）**：design-tool 直接依赖 typescript（dev 工具
  承重，接受体积；提取器仅服务端进程加载）。
- **注解区**（Owner 裁决 ③）：.meta.ts 两区制注解区，词表 = x-ui
  既有键 + 新增 `x-ui.icon` / `x-ui.i18n`。**词表扩展是
  canvas-schema 的 MODIFIED 范围**（r2 携带其 delta：docs 面板与
  studio 面板两处消费口径不分叉）；生成器校验注解键值。
- **vehicle 边界（H6）**：.meta.ts 今天只存在于 apps/www 文档车道
  ——r2 的注解能力是 vehicle 侧事实；宿主注解随 item 分发是
  后续 registry 变更（问题清单记档）。宿主提取出的 schema 无
  注解 = 面板无图标/i18n 修饰，其余能力不受影响。

## 6. Layout 组件族（alpha 轨）

- `@jixoai/ui-prototype-plugin`（新包，alpha）：Flex / Grid /
  Waterfall，属性标准化（Flex: direction/wrap/align/justify/gap…
  Grid: cols/rows/areas/gap… Waterfall: columns/gap/strategy）。
- registry item 同步登记，meta 打 `alpha: true`；shadcn add 可装
  （社区元能力贡献面）。三组件**必须单根 + rest spread**（§3
  印章前提的家族内自证）。
- 属性面板对标准属性即时微调（§4 路径）。

## 7. v0 明确不做

- 双向自动同步（apply 是显式命令，永不自动跑）。
- 设计文件的云端/协作；历史版本快照（§1/§2 裁决）。
- 印章进生产；无 rest-spread 组件与第三方元素的印章/树可见
  （降级矩阵如实声明，不做 DOM-walk 补树）。
- 宿主侧注解分发（vehicle 边界，H6）。

## 8. 验证计划

- **V0d（day-1 spike，复核 H2 前置）**：手工改原型一个 prop 字面量
  → 目击 frame iframe 内 HMR 不整页 reload（r1 未验缝，现在是
  §4 承重墙——spike 失败则 §4 改走 frame 定向刷新并记问题）。
- VA1 save/open 往返逐字节还原；VA2 版本/changelog 纪律。
- VP1 promote（重写正确 + 来源清单）；VP2 apply 干净合并；
  VP3 apply 冲突标记 + 指名 + ours 删除跳过。
- VC1 选择器+树（脚本断言：印章 DOM 存在且序号正确 + vision
  双轨目击）；VC1e each 块退化（共享标注）；VC2 chat 注入定位。
- VD1 面板编辑源码 + HMR；VD1e CAS 仲裁（模拟外部写竞态）；
  VD2 注解区图标（vehicle）；VD2h 宿主无注解诚实降级；VD3
  生产无印章。
- VL1 Layout alpha 渲染 + 面板微调；VL1a alpha 标记。
- VZ 全链路 vision 三轮目击制（延续 r1）。
