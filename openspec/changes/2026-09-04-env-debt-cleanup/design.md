# Design: env-debt-cleanup

> r1（子代理对抗审查）：B1 三态 marker 裁决、B2 date-picker meta 页移出、
> F1 ghostty-term/table 移出、F2-F4 drift 精确化。
> r2（codex change review 5.5→修订）：B0 `.openspec.yaml` skip_specs 落地
> （validate true）；B1 五项 alias 全表冻结 + 脚本断言；B2 模板 shadcn 钉
> 精确 4.19.0（pnpm resolution 口径）+ 版本打印断言 + 双跑稳定验收；
> B3/B6 component-canvas 冻结为 page-owned（**零编辑**，出清单进豁免）；
> B4/B5 drift 改冻结期望表（marker 只认 default 字段；解析方案 r3 起为
> 编译器 AST，更早的解析描述不再属于契约）；S1 计数
> 24+1→23+1；S2 对象级 deny；S3 legacy 静态兼容措辞；S4 四行 description
> 规则冻结；S5 Purpose 以 living spec 为基线 + JSON 断言验收；S6 镜像
> 边界；S7 meta 精确键 + 六文件枚举；S8 own↔defaults 双向锁。

## D1 — 依赖检查修名（verify-shadcn-add.mjs）

```js
// after (scoped-safe): strip the version spec from array-form entries
const bare = (d) => (d.startsWith('@') ? d.split('@', 2).join('@') : d.split('@')[0]);
const wanted = testCase.items.flatMap((name) => depNames(byName.get(name).dependencies)).map(bare);
```

- 自测四形态（codex 建议 1）：unscoped 带版本 / scoped 带版本 / 裸名 /
  object 键——以 verify-deps.mjs `--self-test` 的先例形态附在脚本内联
  断言或 spec 内 it 块（实现取 spec 内，脚本保持无依赖）。

## D2 — 消费者模板：五项 alias 全表 + 版本钉死（已实证，B1/B2 冻结）

**冻结表**（verify-shadcn-add.mjs :415-424 consumerFiles 内联模板，逐字）：

```js
aliases: { components: '$lib', utils: '$lib/utils', ui: '$lib/ui', lib: '$lib', hooks: '$lib/hooks' },
```

- **版本钉死（B2/r3-B3 闭合）**：模板 devDependencies 的 `shadcn: '4.19.0'`
  精确版；harness 在 **build 与 add 两处打印实际执行的 `--version`**
  （template 侧断言 === 4.19.0；root 侧记录实际值——当前 worktree 的
  node_modules 为 pnpm 安装的 4.19.0，npm package-lock 独立安装时会解析
  4.18.0，双 lock 分叉为预存状态不在本 change 收敛）。**互通验收 = 打印
  出的 (root 版本 × 4.19.0) 组合下五案例双跑全绿**；验收记录两处版本
  打印——版本组合以实际打印为准，不预写死任何版本矩阵名。
- **脚本内断言（B1 + S5 具体化）**：(a) 落盘消费者 components.json 五
  alias 精确等于冻结表；(b) tsconfig 解析 = 以模板 `tsconfig.json` 的
  baseUrl+paths 实做微型 resolver（`$lib`→`./src/lib` 前缀映射的三行
  等价物），断言 `$lib`/`$lib/*` 解析落 `src/lib` 子目录；(c)
  `canonicalTargets` 双重断言——既有 www components.json 推导（:163-175）
  之外，再按消费者 alias 表推导一遍并断言两者命中同一组物理路径；
  (d) 交付 `.ts`/`.svelte.ts` 的 `$lib[/suffix]` import 零 `src/lib` 裸
  说明符残留（失败输出具体文件与 import）；(e) REGISTRY_URL 同源 =
  `new URL()` 解析后 origin+pathname 与 harness 实起服务精确相等。
- **安装有界 + 进程组收殓（S7 + r5-S3）**：长命子进程（registry
  server、模板 npm install）一律 `spawn(..., { detached: true })` 建组并
  登记注册表 `{pid, pgid}`；`spawnSync` 仅限无子孙的短命命令（版本打印
  等）；npm install 的超时以代码级计时触发**按组 kill**（`process.kill
  (-pgid)`）后 wait，fail-loud 输出退出码与 stderr 尾部；主流程
  try/finally + SIGINT/SIGTERM handler 对注册表**按组 kill+wait**，异常
  退出同样收殓。为 timeout / SIGINT / SIGTERM 各留一个合成失败 fixture
  验证无残留。双跑验收 = 每次明确 exit 0 且注册表 PID 全部退出
  （scratch 路径限定 pgrep 仅作补充）。
- **同类脚本对齐（S6）**：`scripts/verify-clean-consumer.mjs` 的内嵌模板
  同步迁移到同一 alias 冻结表 + 4.19.0（它不在 verify:all 链，仅消除
  双契约漂移，不新增 gate）。
- 机制记录（实证存档）：CLI 重写生成端 `Cl` 按 `aliases[o]` 拼 specifier，
  前置条件 = import 前缀匹配 + 目标在本次交付 files 集；`.svelte` 跳过
  （ext 白名单 ts/tsx/js/jsx）；`m === p` 短路使 `$lib` 根成为 no-op。
  解析端走消费者 tsconfig paths（模板已有 `$lib` 映射，tsconfig 不动）。

## D3 — verify-all 去重

`verify-all.mjs:56` 循环数组移除 `'verify:shadcn-add'`；:74-79 收尾步为
唯一执行点（现状实现序与头部链序注释本就不一致，移除后一致，头部注释
不改）；:47 段注释枚举口径同步（10→9）。验收断言：verify-all 输出中
shadcn-add 案例块只出现一次。

## D4 — 三态 marker 词汇对齐（legacy 静态兼容层，S3 措辞）

**边界声明**：22 个涉事页走手写 `props` 数组（legacy 渲染路径，
props-table-render.spec 钉 "renders unchanged"）；`AMBIENT_MARKER`
（props-table.svelte:12-18）只在 meta/IR `ambient` 字段路径生效。本
change 做的是**词汇对齐**——手写行的 Default cell 写成 meta 驱动行的
正典渲染形 `'<own>' · <marker>`，不是把行迁去 IR（那是另一个 change
的量级）。D5 锁 Default cell 文本。

**行级裁决（冻结，无施工时二选一）**：

- **variant 22 行 / 21 页**（全 literalSlot 家族，B4 冻结为唯一合法
  marker）：default 补 `'<own>' · Own default, not ambient`；description
  不动。
- **density 2 行**：form（替换 `'inherited'` 旧值旧句）、inline-code（补
  default 字段）→ `'ambient scope'` + 正典 description 句。
- **tone/material/size 4 行**（avatar size 'md'、section-card tone
  'default'、sheet size '24rem'、toast material 'popover'）：default 补
  `'<own>' · Own default, not ambient`；description **冻结规则（S4）**：
  删除 description 中与 marker 重复的尾注短语（如 "Own default, not
  ambient (...)" / "literal slot — own ..." 的 tail 部分），其余语义句
  逐字保留；D5 断言此四行 description 不再含 marker 词。
- **component-canvas（B3/B6 冻结）**：density 行现值
  `default: "'comfortable'"` + "page-owned bindable" 描述**已是正典**
  （page-owned bindable 永不 ambient——归档裁决 :392-396；组件
  component-canvas.svelte:345-350 默认 comfortable）。**零编辑**；D5
  豁免表钉 `component-canvas#density → page-owned, no marker`。
- **inline-code 的 variant 行是 definePaintSlot + ambient zone 正典
  （codex 建议 4）——本 change 只动其 density 行，variant 行禁改。**

**23 扫描页 + section-card**（r2 计数）：alert-dialog(2v)、avatar(v+size)、
color-picker(v)、dialog(v)、dropdown-menu(v)、file-input(v)、float-button(v)、
form(d)、hover-card(v)、inline-code(d)、kbd(v)、language-switcher(v)、
list-item(v)、menubar(v)、navigation-menu(v)、separator(v)、sheet(v+size)、
tags-input(v)、theme-toggle(v)、timeline(v)、toast(v+material)、tooltip(v)、
tour(v) ＋ section-card(tone)。

## D5 — drift 钉 docs-ambient-vocabulary.spec.ts（r3：单一机器源 + owner 绑定）

**单一机器源（B2 闭合）**：`apps/www/test/fixtures/docs-ambient-vocabulary.matrix.json`
是期望表的**唯一权威**——tasks 的行表由它派生（fixture 先行，文档引用）。
每条 entry：

```jsonc
{ "route": "alert-dialog", "batch": "A", "tableIndex": 2, "prop": "variant",
  "occurrence": 1, "bareDefault": "auto", "marker": "own",
  "defaultsFile": "registry/files/ui/alert-dialog/alert-dialog-defaults.svelte.ts",
  "slotExport": "alertDialogSurfaceVariantSlot",
  "exactDescription": null, /* 仅四行 tail 迁移行携带 exact 串 */
  "note": "页面共四张 PropsTable（root=0/Trigger=1/Content=2/Action=3）；本行属 Content 表——owner 仅注记，不参与匹配" }
```

schema 校验：`tableIndex` 为必填且唯一表身份字段（**route 内**唯一——
每页首表恒为 0，不要求全局唯一；取值为 **0-based** AST 调用点序号）；
`occurrence` 为表内同名 prop 的 **1-based** ordinal（occurrence=0 的
fixture 须 schema RED）；`batch` ∈ {A, B} 必填（页面级批次归属）；fixture 断言拒绝**未知结构化字段**、拒绝缺失 `tableIndex`/
`batch`、拒绝结构化的 `owner`/`title` 匹配字段（owner/title 语义只允许
出现在 `note` 文本）。"两行/两张表"仅指涉事 variant 表——页面还有
其它表存在是常态。

- **owner 绑定（B3 + r3-B1 闭合）**：matrix 存 **`tableIndex`**（svelte
  AST 里 PropsTable 调用点的 0 基序号——页面源码的稳定可观测身份；
  SectionCard/PropsTable 的 title 仅作文档注记不参与匹配）。alert-dialog
  双行的 tableIndex **冻结为 2（Content → alertDialogSurfaceVariantSlot）
  与 3（Action → alertDialogActionVariantSlot）**——实现首步即以真实
  AST 校验这两个值命中，再做表内匹配。**负例**：交换 alert-dialog 两张
  涉事表 / 把 variant 行移入另一张表 → RED（index 键的行落
  错表）。槽导出名冻结映射：occ.1 → `alertDialogSurfaceVariantSlot`、
  occ.2 → `alertDialogActionVariantSlot`；toast#variant →
  `toastVariantSlot`、toast#material → `toastMaterialSlot`。断言三方一致：
  页面 default 字面、matrix bareDefault、`*-defaults.svelte.ts` 槽工厂
  own 实参（含 `TOAST_*_VALUES` 常量引用与多行调用形态）。

**解析器（B5/建议 2 闭合）**：不手写正则、不做自造文本切分——用仓库既有
编译器栈：`svelte/compiler` 的 `parse()` 定位页面里每个 `PropsTable` 调用
点与其 `props={...}` 属性表达式源码段，再以 `typescript` AST
（`ts.createSourceFile` 包裹为 `const x = <表达式>`）解析对象字面量数组，
按属性提取 name/default/description。转义引号、嵌套数组、模板字符串由
AST 天然处理；TokenTable（`source:` 字段形态）在 AST 层按组件名区分，
不误伤。多 PropsTable 页按调用点顺序建立 owner 序。

**冻结断言**：每条 matrix entry 在其 tableIndex 表内**恰好一次**；marker
（= `own` → `'<own>' · Own default, not ambient`、`scope` →
`'ambient scope'`）必须位于 default 字段值内；description/TokenTable 不计。
**负例独立性（r3-B2 闭合）**：行检查器实现为纯函数
`checkPage(sourceText, matrixEntry) → findings`——正例跑真实页面；负例用
**测试内合成源码串**（如 variant default 写成 `'auto' · ambient zone` 的
合成页面、两张表互换的 alert-dialog 合成源码），断言 checker 对其返回
非空 findings。期望矩阵本身永不被变异作被测输入——无自证循环。

**四行 tail 迁移的 exact description（S4 闭合，已取证现行原文）**：

- avatar#size：default → `'md' · Own default, not ambient`；description →
  `sm 24px · md 32px · lg 40px.`（剥 "Defaults: literal slot — own 'md',
  ambient when an axis opens."）
- section-card#tone：default → `'default' · Own default, not ambient`；
  description → `Everyday bordered section or inner-page hero head.`
- sheet#size：default → `'24rem' · Own default, not ambient`；description →
  `Drawer extent along the docked axis (CSS length).`
- toast#material：default → `'popover' · Own default, not ambient`；
  description → `The surface MATERIAL (float-button model): popover =
  solid ground; glass = backdrop-filter translucent — the entity-law
  restrained ground.`

**全局 deny（对象级）**：任何 density 行 default === `'inherited'`；
density 行 description 含 `Overrides inherited density` /
`Overrides the inherited density scope`。

**meta 侧（S7）**：扫描 `apps/www/src/lib/meta/*.meta.ts` 的 `props` 条目，
仅 exact key `'density'`/`'variant'` 断言 `ambient` 字段 ∈ {zone, scope,
own}；命中文件枚举冻结六件（checkbox、combobox、date-picker、popover、
press-button、select），toast-viewport/card-grid 无轴行不要求。

**own↔defaults 双向锁（S8）**：见 owner 绑定段的三方一致断言。

**matrix↔tasks 双射断言（r5-B2 + r6-B2 闭合）**：spec 解析 tasks.md
批次 A/B，断言：(a) **批次归属页面级相等**——每 route 在批次清单中
出现的页 == matrix 该 route 的 `batch` 值（页面在清单中恰出现一次）；
(b) **行级覆盖 = 键 multiset 一一对应**——`route/tableIndex/prop/
occurrence` 键 multiset 与 checker 对目标页枚举出的**非豁免候选行**
（density/variant/tone/material/size 的 PropsTable 行，减去
component-canvas 豁免、**inline-code#variant 禁改行**与移出页）恰好
互为覆盖：matrix 删一行 → 候选行
未被覆盖即 RED；matrix 多一行 → 无候选行对应即 RED；重复 occurrence →
multiset 不匹配即 RED。（不比较"matrix 行数 vs 清单页出现次数"——
一页多行是常态，该比较不可满足。）测试内负例：删同 route 一条
entry、A/B 两页互换、occurrence 重复，均须 RED。**inline-code#variant
独立不变式**：其 default 须含 `'ambient zone'`（禁改正典态的保护走
专属断言、不经过 matrix——既保双射可满足又锁住该行不被误改）。

**镜像边界（S6）**：registry/test 放字节镜像（cmp 校验），执行只在
apps/www。

## D6 — 六个 TBD Purpose 回填（S5 收紧）

**语义基线 = living spec 现正文全量**（归档 proposal 仅作来源证据）。
六项最小锚点：canvas-schema→Canvas 控件 schema 化；docs-site→文档骨架/
诚实状态；paged-docs→无页 web 流→print 投影；print-pipeline→确定性打印
（含 paper-theme/determinism 吸收面）；search-corpus→结构化/CJK 检索
语料；ui-plugin-followup→`@jixoai/vite-plugin` 构建期 parity（归档
proposal 里的 `@jixoai/ui-plugin` 旧名不采信）。
**验收（S5 + 语义锚点冻结）**：`openspec validate --specs --json` 解析
JSON——六个目标 spec id 的 overview placeholder warning 全部消失且 15/15
保持；**另断言语义锚点——六组 exact token set 就此冻结**（2026-09-04 取自
living spec 正文实词，实现阶段**禁止修改**；规范化 = 目标段与 token 均
lowercase 后子串匹配）：

- canvas-schema → {canvas, schema, controls}
- docs-site → {skeleton, honest, parity}
- paged-docs → {paged, print projection}
- print-pipeline → {printconfig, structured, paged}
- search-corpus → {corpus, cjk, structured}
- ui-plugin-followup → {vite-plugin, isomorphism, build-time}

每组须**全部命中** Purpose 首段（规范化后）；缺一即 RED。不以 exit
code / `--strict` 为门禁（无关 spec 的 RFC2119 warning 不拦路）。

## 已完成项的证据（不做事）

exemptions schema 校验（schema + 双 $schema 指针 + A6 fail-closed，
exemptions 空列表闭环）。

## 门禁与验收

- `node scripts/verify-shadcn-add.mjs` 五案例全绿，**连跑两次**（B2 稳定
  性；跑前清理残留 npm/verify-shadcn-add 进程——codex 建议 5）。
- verify:all 全链绿、shadcn-add 段恰一次。
- `openspec validate 2026-09-04-env-debt-cleanup --json` valid:true；
  `--specs --json` 六 warning 消失 + 15/15。
- docs-ambient-vocabulary.spec.ts 绿（含冻结表 / deny / meta / 双向锁 /
  豁免五组断言）；docs-nav-filter / docs-structure / props-table-render 绿。
- 全量串行 vitest（1840 基线 + 新 spec）全绿。
