# Proposal: design-studio r2 — 真模型定型、设计文件、元素级定位、落地管道

> 原始需求（Owner 走查反馈，2026-09-11）：r1 粗糙但回路成立；
> 接真实模型服务（glm-5.3-flash，本地 anthropic 兼容端点）；
> 四项新能力——设计文件保存/打开、原型落地项目代码与同步、
> 聊天精确到元素（画布选择器）、手动操作面板（元数据驱动的
> 属性面板 + ComponentTreeView + Layout 组件族）。Q1–Q4 裁决
> 见 design-studio/problems.md 各节"Owner 裁决"段。
> 工作方式延续 fast-remix。

## 已完成（本提案随附的实现）

**真模型接入（今天已闭环验证）**：
- `dsh --patch` 覆盖层（`src/dsh/design-provider.patch.yml` 模板，
  env 渲染：`JIXOAI_DESIGN_LLM_BASE_URL/MODEL`，默认 Owner 端点）
  + **隔离 DSH_HOME**（`design/.dsh-home`，关键发现：用户的
  settings.yaml 存储会在运行时覆盖 patch 的 config 行——隔离 home
  让 patch 成为唯一事实源，同时不污染用户的 dsh 会话历史）。
- 全回路证据：glm-5.3-flash 收指令 → 写 glm-probe 原型（自己引用
  wrapper 法则、按 kit 源码自验）→ 三面 200。

## r2 范围（按 Owner 四项，裁决已内化）

### A. 设计文件（保存/打开）

裁决内化：代码优先（Q3）——格式是**工作区代码的打包**，不是新
AST。候选格式（待拍板 ①）：

- **A1（推荐）registry-item 形状的 JSON**：`{name, version, meta,
  files:[{path, content}]}`——shadcn 生态成熟模式、本仓库原生
  习惯、天然表达多文件 bundle；`design save <proto>` 导出 /
  `design open <file>` 物化进 design/prototypes/。
- A2 纯 zip 容器（.jixoai-design.zip）：零格式设计，但无元数据
  槽位、无 diff 友好性。
- 行业参照：Penpot 开源格式（太重）、Figma（闭源二进制，仅作
  反例）；shadcn registry item 是最贴近"代码优先 + 生态成熟"的。

单文件粒度：一个原型一个设计文件（画布矩阵 + pages + components
完整自包含），工作区级打包后置。

### B. 落地与同步（promote pipeline）

最小闭环（r2）：单向晋升——原型 ref 文件复制进宿主 src，import
重写（`#jixoai/*` → 宿主别名），**来源清单**（provenance manifest，
记录 sha256 + 晋升时间）挂在 lock 侧；原型再改 → 比对哈希 →
"可更新"提示，一键重晋升（覆盖确认）。双向同步（项目→原型）不
做（待拍板 ② 确认单向够用）。

### C. 元素级定位（选择器 + ComponentTreeView v0）

- **选择模型**（本项的地基）：`selection = {frameId, 组件地址}`。
  组件地址的稳定性阶梯：frame id（稳）> jixoai 组件实例（经
  data 属性/元数据识别，较稳）> DOM 路径（脆，仅兜底）。
- 画布选择器：同源 iframe 直读 DOM，点击 → 就近组件边界解析 →
  高亮 + 选中；再点击深入（类似 devtools inspect）。
- ComponentTreeView v0：依赖 D 的元数据提取区分"我们的组件"，
  树形呈现 frame 内层级，树节点 = 精确选中（与选择器同一
  selection 状态）。
- chat 注入：输入框旁的"当前选中"chip，消息自动携带 selection
  上下文（Agent 收到即可精确定位到文件+组件）。

### D. 属性面板 + 元数据提取 + Layout 组件族（alpha 轨）

- **元数据提取**：复用 canvas-schema 的 component-metadata-gen
  先例（.meta.ts 两区制）。r2 需要"按需提取"模式：design server
  对宿主组件源码即时提取（今天它是 www 构建期的提交产物）。
- **属性面板**：schema → 控件——ComponentCanvas 的 schema 驱动
  dock 已有成熟机器（ItemGroup 行 + jsonSchema），移植到属性面板。
- **修饰注解**（icon/i18n-key per 属性）：待拍板 ③——注解宿主
  用 .meta.ts 的"手工注解区"（两区制本来就有，类型安全可经
  生成器校验）还是源码注释语法（Owner 原案）+ 配套 lint。倾向
  前者：注解不进源码、生成器可校验、无需新 lint 工具。
- **Layout 组件族**（Flex/Grid/Waterfall，属性标准化）：alpha
  轨（Q2 裁决）：`prototype-plugin` 包 + alpha 标签独立迭代，
  属性面板直接暴露其标准属性。稳定后收编标准库。

## 分期建议（待拍板 ④）

- **r2 = A + B + C**（文件/落地/定位——把"回路"升级为"工作流"）；
- **r3 = D**（元数据/属性面板/Layout 族——体量最大，且 alpha 轨
  独立迭代节奏）。
- 备选：r2 全上（周期约 ×2）。

## 明确不做（延续 r1 边界 + 裁决）

- JSON-AST 中间表示（Q3 裁决：代码优先）。
- 双向同步（r2 只单向晋升 + 漂移提示）。
- 住进 dsh webserver（Q1 裁决：seam 开放，MCP 化为移植路径）。
