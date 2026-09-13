# Owner 走查动线规格（design-studio r3）

> 本文是「打磨好了」的定义（issue #11 的交付物）。从
> `jixoai-ui design` 启动到走完一个完整设计循环，共 **10 步
> （W0–W9）**。每步四栏：用户动作 / 期望界面反应 / 验收断言
> （可脚本化）/ 当前状态（r2 实测：通 / 退化 / 断 + issue）。
> **验收规则：任何一步红，禁止向 Owner 发走查邀请。**

## 0. 走查环境（所有 W 步共用）

```
隔离实例：独立 worktree + 独立 HOME（.dsh-home）——绝不污染 Owner 会话
启动命令：jixoai-ui design --agent dsh --no-open --port <p>
入口 URL：http://localhost:<p>/__design__/
探针     ：同源 iframe DOM 直读 + fs/git 断言 + 网络面板
```

## W0 启动：命令 → 画布落地

| | |
|---|---|
| **动作** | 终端执行启动命令 → 打开入口 URL |
| **期望** | 左栏品牌行 + navigator 列出 prototypes，`welcome` 自动选中；中央 iframe 渲染 welcome 画布（真实组件）；左栏下部组件树显示印章组件；右栏 chat 显示 agent 型号（dsh · glm）；无布局跳动 |
| **断言** | ① `GET /__design__/api/manifest.json` → 200 且含 `welcome`；② `iframe[src*="welcome"]` 存在且 `data-ready`（load 完成）；③ 树 DOM 含 ≥1 个 `.tree-row`；④ console 零 error |
| **状态** | 通（r2 V5 修复：manifest 首选 welcome） |

## W1 浏览：切换画布 / 帧锚点

| | |
|---|---|
| **动作** | 点击左栏另一个 canvas 名；再点当前 canvas 下的某个 frame 名 |
| **期望** | iframe src 切换（frame 追加 `#<frameId>`）；树按新画布重建；先前 selection 清除（它属于旧画布）；无 loading 闪烁 |
| **断言** | ① 点击后 `iframe.src` 匹配 `prototypes/<name>`（frame 时含 `#`）；② 树在 MutationObserver 防抖（150ms）后反映新 DOM；③ selection 派生 UI（面板/chip）消失 |
| **状态** | 通 |

## W2 选中（画布路径，canvas 文档层）

| | |
|---|---|
| **动作** | 在画布（第一层）里直接点击一个印章组件（如 hero 页的按钮） |
| **期望** | 三处同步：属性面板出现且列出该组件 schema 行；树中对应行高亮；chat 输入区上方出现 selection chip（`<component> #<n> · canvas`）。**静置不动，面板不闪、不重载**（#12 的验收点） |
| **断言** | ① `window.__jixoaiDesignSelect` 被调后面板 DOM 含 `selection.component` 文本；② chip DOM 存在；③ **静置 10s（≥2 轮询周期），`meta` 面板 DOM 不出现 loading 文案、不闪（#12 回归断言）** |
| **状态** | 断 → **P0**（闪烁 #12） |

## W3 选中（嵌套 frame 路径——诚实降级动线）

| | |
|---|---|
| **动作** | 点击 frame 文档（第二层 iframe）内部的组件（badge/press-button）→ **预期拾取不到（已知 #14 P1-1）**；随即从树中展开该 frame 组，点击目标节点 |
| **期望** | 树路径可达：面板/chip/高亮三同步同 W2；面板如实显示该 usage；若 frame 无 `ref` 文件解析，面板显示可理解的只读解释（ID7 强化后） |
| **断言** | ① 树节点点击后 selection.component === 目标；② 面板行渲染；③ frame 内元素高亮（`__jixoaiDesignHighlight` 到达） |
| **状态** | 画布路径退化（#14 P1-1 → P1）；树路径通。**走查按树路径完成本步即算绿**；画布路径断点必须在面板上有引导文案（「从树中选择」）才算完整 |

## W4 改属性：四类控件 → 源码落盘 → HMR

前置：welcome 原型含至少 toggle / segmented / text 三类行
（stepper 有则一并验；不足的类别在 W4 前由走查脚本补一个用法）。

| | |
|---|---|
| **动作** | W4a 翻转一个 toggle（如 raised）；W4b 切一个 segmented（如 variant）；W4c text 行输入新文案回车；W4d stepper 步进（如有） |
| **期望** | 每次提交：按钮即时进入 loading 锁（禁点）→ 成功后画布 HMR 生效（或 fallback frame 定向 reload）→ 源码文件包含新字面量。toggle 关闭「原本未写」的 prop 时源码**删除**该属性而非写 `={false}`（P2-2 语义）。失败时 notice 明确且可消退（ID5） |
| **断言** | ① 每次 `POST /__design__/api/prop-edit` → `{ok:true}`；② fs 读 `design/prototypes/<name>/**` 含新字面量（toggle-absent 场景：prop 键不存在）；③ 提交期间触发控件 `disabled`（加载状态锁）；④ 面板在整个 W4 期间无 loading 闪烁（meta 不重新拉取） |
| **状态** | 链路通（r2 B1 pin 后），**断在三处**：loading 锁视觉缺失（#13）、slot-derived 行退化为 edit-in-code（#14 P1-2，r3 非目标，走查时如实展示即可）、notice 不消退（ID5 → P0） |

## W5 agent 对话（带选中上下文）

| | |
|---|---|
| **动作** | 保持 W4 的选中（chip 在），chat 输入「把这个按钮再做一个 destructive 风格的变体页面」→ 回车发送 |
| **期望** | 发送按钮进入 loading 锁；消息流出现 user 块 + agent 流式 text/tool/file 块；**agent turn 期间属性面板整体只读（有可见的锁定提示）**；turn 结束（done 事件）面板解锁；若 agent 新建了原型，navigator 在 ≤4s 内出现新条目（轮询使命正面案例） |
| **断言** | ① `POST /__design__/api/chat` 的 body 首行含 `[selected: <component> #<n> @<frame>]` 前缀（selectionMessageBody 契约）；② SSE 事件序列含 ≥1 text 且终态 done（或 error——error 也是有效终态，须可见渲染）；③ streaming 期间面板控件 `disabled`，done 后恢复；④ agent 产物文件存在于 `design/prototypes/`（fs 断言），manifest 含新条目 |
| **状态** | 回路通（dsh+glm live-loop 已证）；面板锁定提示弱（#13 范围） |

## W6 留版：save + release（终端）

| | |
|---|---|
| **动作** | 终端：`jixoai-ui design save` → `jixoai-ui design release v1 -n "hero destructive pass"` |
| **期望** | save 输出 wip commit 摘要；release 输出 tag 名；均无 error。studio 侧本步无 UI 变化（v0 裁决：管道写路径在 CLI——prd §2） |
| **断言** | ① `git -C design log -1` 有新 wip commit；② `git -C design tag` 含 `v1` 且为 annotated（`%` 含 notes）；③ 两条命令 exit 0 |
| **状态** | 通（PR #9 e2e 已证） |

## W7 晋升：promote 进宿主（终端）

| | |
|---|---|
| **动作** | 终端：`jixoai-ui design promote <proto>` |
| **期望** | 输出晋升文件清单；宿主出现 `src/lib/design/<proto>/`；`#jixoai/` import 已重写为宿主别名；`design/.promotions.json` 记录来源（file/proto/tag/sha） |
| **断言** | ① fs：晋升目录存在且 .svelte 文件中 `rg '#jixoai/'` 为 0 命中（已重写）；② promotions.json 含本 proto 记录且 `tag === v1`；③ exit 0 |
| **状态** | 通（VP1 已证） |

## W8 漂移：设计再变 → 徽标亮起（双面）

| | |
|---|---|
| **动作** | 回到 studio，再改一个属性（产生设计文件新变更，领先于已晋升的 v1 tag）→ 观察左栏 |
| **期望** | 该 canvas 行在 ≤4s（一个轮询周期）内出现 `updates` 徽标；点开显示 per-file 漂移 + changelog 意图 + diff；提示 `jixoai-ui design apply` 命令。终端 `jixoai-ui design status` 输出与徽标同形 |
| **断言** | ① `GET /__design__/api/promotions.json` 返回 `drifted:true` 条目；② 徽标 DOM 出现在该 canvas 行；③ 展开区含 changelog note（release notes 语义）与 diff 文本；④ `design status`（终端）报告同一 file 为 drifted |
| **状态** | 通（T11 已接）；**弱在**：promotions 失败与无漂移不可分辨（ID6 → P0）、diff 裸 pre 无可读性（P1 面板重建范围） |

## W9 收敛：宿主改造 + apply（终步）

| | |
|---|---|
| **动作** | 手动编辑宿主已晋升文件（模拟开发者数据绑定改造）→ 终端 `jixoai-ui design apply` |
| **期望** | 干净 hunk 自动合并；输出指名报告（合并/跳过/冲突三类，ours 删除的列名跳过）；若构造冲突，文件内 git 风格冲突标记 + 报告指名，**永不静默覆盖开发者改动**。合并成功后回 studio：updates 徽标在下一轮询周期消失（收敛可见） |
| **断言** | ① apply 输出含 per-file 结果且与预期矩阵一致；② fs：干净合并文件含双方改动；③ 构造冲突分支：文件含 `<<<<<<<` 标记且报告指名该文件；④ 收敛后 promotions.json `drifted:false`，徽标 DOM 消失 |
| **状态** | 通（VP2/VP3 已证）；「徽标消失」作为收敛反馈是本动线给 Owner 的收尾确认，r3 首次纳入断言 |

## 附：动线依赖的修复清零表（r3 实现的靶子）

| W 步 | 断点/弱项 | 修复归属 |
|---|---|---|
| W2 | 闪烁（#12） | P0-T0（rebuild-plan） |
| W3 | 画布拾取断的引导文案缺失（ID7 同源） | P0-T1 |
| W4 | loading 锁视觉、notice 消退（ID5） | P0-T1 + P1-T7 |
| W6–W8 | promotions 失败可见性（ID6） | P0-T1 |
| 全程 | 布局跳变（ID1） | P1-T2 |
| 全程 | manifestError 死胡同（ID3）、guide 空态（ID4） | P0-T1 |
