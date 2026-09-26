# Owner 验收呈报 — docs-eight-axes-mdn 战役收官（2026-09-24）

> 编排者呈 Owner 的验收材料汇总。Codex 终审结论见文末（返回后补录）。
> 提交链：战役起点 `59bf5e42` → 110/110 完成 `48053c4f` → 收官修复批 `3c1ca4c1`（本地 main，未推送）。

## 1. 战役总账

- **110/110 组件文档页**全部重写/审计至 MDN 风格八轴原型（hero → usage → demos → api → theming/a11y…），每页 tier 决策 + **双审签收（审者≠编者）** + measurement-first（页面声明须有实测回执）。
- 142 个任务、4 个常驻 vision 子代理（quill/vellum/scribe/marginalia）、253 commits / 945 files / +68k−6.5k。
- 台账：`BOARD.md`（看板）、`research/assignment.json`（110 页逐页关闭注记）、`research/family-comment-drift.md`（漂移+W-next+法则）、`agents/*/reports/`（全部报告）。

## 2. 收官序列实录

### 2.1 vision 走查（四路，143–146）

- 判读 16 个关键页：**14 页干净 PASS**；3 项发现全部落地修复（见 2.2）。
- 黑图防线执行到位：quill 8/8、vellum 131/133（6 张旗标逐一开读为真稀疏内容）、scribe 87/87、marginalia 43/43 非平凡。
- 走查副产物（方法层）：揭示系统是 scroll-driven 动画，截图须用 `prefers-reduced-motion` 逃生门（quill）；元素 rect 不随文字溢出增长，文本节点须用 Range rect（quill）；shell 内滚 fullPage 截图是视口伪装，须步进滚扫（vellum）。

### 2.2 420px 溢出歼灭战（走查发现 → 全量扫描 → 归零）

走查复现 form/timeline 后，编排者以程序化 scrollWidth 普查全部 110 页（.jx-shell-body @420，fresh-context + 渐进滚扫）：**17 页溢出 → 三轮修复 → 0/110**。四类根因：

1. **grid auto 轨道按 max-content 定宽**（grid760b / dpgGrid / tl-grid-3|matrix 无基线模板）→ 一律 `minmax(0,1fr)` 基线（宽断点媒体查询原样保留）。愈合 code-card/inline-code/timeline。
2. **A11yTable 裸表**（无 PropsTable 的 scroller idiom）→ 两张表各包 `overflow-x:auto` scroller（siteOnly 家族，无镜像）。愈合 carousel/combobox/file-input/number-input/press-button/range。
3. **DensityDemo 0% flex-basis**（wrap 已布防但永不触发，四个 rung 挤一行）→ basis 骑 50-unit 地板；scope box 加 `overflow-x:auto`（input-otp 的 lg rung 槽行内禀 ~900px，hit 地板不可缩，滚动是唯一诚实解）。
4. **不可断行的 slash/pipe 长复合词与 nowrap pill 滥用**（form 类型表、list 标记词汇表、system-dialog/list-item 的 registry.json 描述、DLD trace 串、alert/markdown×2/press-button 的 pill 文案）→ wbr / 加空格 / 缩短；chart 字形运行加 `max-width:100% + overflow-x:auto`（overflow 非 visible 同时清零自动最小宽，1fr 轨道得以收缩；孪生已同步）。
- 另：toast 的 playground dock（纯注释、零控件）遮两触发器 → 注释下移为正文段，dock 移除。

### 2.3 门禁（3c1ca4c1 上的回执）

| 门禁 | 结果 |
|---|---|
| apps/www build | rc=0，dist 110 页 |
| 420 溢出普查 | **0/110** |
| verify:docs | rc=0 |
| verify:docs-universal | 110/110 GREEN |
| verify:mirror | rc=0（chart.css + default-detector.ts 孪生同步后 manifest 再生） |
| verify:tailwindless | rc=0 |
| svelte-check | 本轮单次全量（Owner 规则）；触及文件零新增诊断 |

## 3. 漂移台账（16 条）— `research/family-comment-drift.md`

家族注释/代码债（战役中记录、按约定战役后清理批处理）：#1–#12 家族注释与实测矛盾（blockquote/accordion/alert/anchor/checkbox/avatar/button-group/image/color-picker/number-input/spin…）；#16 tabs-list 缺 import；#15 tour 半径 stamp 无读者；#14 spin hydration 警告；#13 tags-input 建议行 key；#12 scroll-area viewport id SSR 漂移（$props.id() 修法已记录）。

## 4. W-next（22 条）+ 法则 — 同台账

- **#1 语义墨水 :root 冻结 + #7 root-pinned alias（census 116 条 `: var(` 链）**→ 已升华为**别名-主题三层法则**（Tier 1 root dark 翻转 / Tier 2 岛屿免疫 / Tier 3 舞台钉住；判定单元是**链**不是元素；两读协议 = 元素 paint + html var）。
- #19 scroll-reveal 永久 containing block：fleet sweep 零命中；**opacity-only 答案 = YES**（transform 保持 none）；#3 TokenTable 死列（sourceLabel 臂已在战役内修复，description 臂确认开）；#5 PressButton claimed-prop 裁决（prop 通道为唯一支持路径，已双页教学）；#6 状态边框 atom 级联杀死（input-otp/number-input 已 unlayered carve-out 修复，模式裁决归 Owner）；#8 canvas-host 宽度原子丢失（sheet+system-dialog 双 repro）；#9 boot-splash spec 缺位；#10 table dense 视觉 no-op；#17 skip-link 焦点逃逸（RECOMMEND 方案带 A/B 回执）；#21 舞台/dock 命中重叠 + addendum（~1280 宽度 elementFromPoint 命中 dock div）；#22 native-parity 门禁五败（harness vs 设计时代碰撞）。
- **平台差异注**：top-layer 命中测试在 Chrome for Testing 与系统 Chrome 不一致（engine 级接缝，非家族缺陷）。
- **新法则（战役内沉淀）**：别名-主题三层法则、tailwindless feed 法则（类字符串 API 须著成真实规则——注释引用先例不算 feed）、site-layer 热键碰撞法则（⌘K 双开）、GENERATED-SHEET 法则（spec 修复须落在唯一声明源）、PlayRow ID 法则（$props.id()）。

## 5. Owner 决策清单（按台账序）

1. **skip-link tabindex**（W-next #17）：RECOMMEND `tabindex="-1"` + 程序聚焦 main#main（A/B 回执：两径落焦、Tab 序不变、布局字节同）。
2. **#19 opacity-only reveal**：系统性答案 YES（trade：失去 translateY 升起感）；是否为 reveal-hosting sections 换 opacity-only 变体。
3. **⌘K hotkey-drop**（热键碰撞法则）：command 演示是否去掉 `hotkey` 以免与站内搜索双开。
4. **unmapped fleet vs 全局门禁翻转**（website-scaffold 张力）：`2026-08-30-docs-demo-standard-global-gate` 翻转前，unmapped 页群是重排还是圈定 inScope。
5. **grid 组件包裹**（component-wrap 一例）；**dialog 演示重排**（toast canvas 下移已按骨架序落地，模式可循）。
6. **outline 迁移**：density 演示标题克隆 ×4/×5 进文档大纲——opt-out 或 accept-as-is。
7. **press-button tonal**：fill rung 标签墨恒黑（含 re-tinted dark fill）——第五声部，语义墨水重推导 (#1/#7 协议) 是系统性修。
8. **image meta 扩张对**：生成 meta 即破 carriers 钉扎——meta + carriers-set 扩张须成对落地。
9. **dock/stage 命中重叠**（#21 addendum）：lane-map 裁决（z 序还是保留车道）。
10. **table dense**：dense 在 sm 密度下视觉 no-op（gap==inset 8px）——设计裁决。
11. **tour radius / dialog elevation**：stamp 无读者（calc(10px*1) 落地无规则读取 / level 全链无阴影绘制）——接线或退役回执。
12. **native-parity 五败**（#22）：放宽断言（focus 色相容差、native root 允许原子类）还是回退家族样式。

## 6. 交接（下一轮队列已清空，Owner 项除外）

- cx-joiner fleet 合并（414 文件）——记录为 lull 任务，未在飞行中做（基线污染）。
- 文本拷贝合并（~595 份）同上。
- theme-toggle 升级、icon-button tooltip 再探针（inconclusive 项）。

## 7. Codex 终审（gpt-5.6-terra / xhigh，herdr 后台回调）

### R1（HEAD 3c1ca4c1）：**4.5/10 — NO-GO**（六维 a=2 b=4 c=4 d=7 e=7 f=4）

**B1 toggle 台账不实（成立，修复中）**：assignment.json 实为 done=109 + toggle todo/tier:null，BOARD 头部 "DONE(110)" 为假；toggle 页缺专属机制表/Install/SeeAlso/Usage 序。→ T147 已派（marginalia 主编 + scribe/vellum 双审），收口后台账归真（done=110, tier-null=0）。

**B2 MDN 原型系统性缺口（成立——本轮终审最大真实发现，呈 Owner 裁决）**：独立扫描 110 页：48 页无 axisRows/"The eight axes" 专属轴表标记；7 页无 query()；39 页无 DocsInstall；40 页无 DocsSeeAlso；verify:docs 的 152 条 backlog = 39 无 Install + 39 无 See Also + 70 Examples 先于 Usage。抽查 toggle/native-select/pattern-faq：仅通用 Universal Props 摘要。**spec 原文（specs/docs-site/spec.md）的 SHALL 是无条件逐页**（"Every page SHALL carry a per-axis table for the axes the family actually carries … and one real query() case"）——tier 管重构深度、不豁免八轴文档；战役的 Tier-1 执行实践与 spec 存在真实落差。**Owner 三选一**：
1. 补一轮 fleet 轴表/骨架战役（≈48 页专属轴表 + 39/40 Install/SeeAlso + 70 Usage 序——新战役规模）；
2. 修订 spec：per-axis 表降为 tier 条件性（Tier 1 以通用 PropsTable 轴节 + 机制行满足）；
3. 按设计归入 successor change `2026-08-30-docs-demo-standard-global-gate` 的 backlog（即原决策 #4 的张力——但那需要先把 spec 的 SHALL 改掉，否则门禁翻转即全红）。

**B3 svelte-check 超基线（部分成立，呈 Owner 基线裁决）**：1204 errors/487 files vs 简报所引 ~416（那只是 Object.entries 重载子类）。编排者分类（单次全量日志）：~458 家族类型债（可赋值性 241 / 缺失成员 192 / 收窄 25）+ ~740 广谱遗留（隐式 any 索引、类型转换、缺失名、fixture 放置…，散布 test 页面对象/route 页/家族文件）。战役立场（台账 process note）：414 文件 churn 会污染所有在飞评审基线，fleet 合并记为 lull 任务；触及文件零新增有逐任务 gate-zero 回执。**Owner 裁决**：批准当前分类基线（含修复路线图）还是先清零再收官。

**B4 css-laws 钉扎反向（成立，已修）**：radio.ts 的 T94 退役改了声明源，钉扎测试仍断言旧发射。→ `61d810ed`：测试改为断言所有形态不含 :indeterminate（理由随测试成文），**87/87 绿**。（GENERATED-SHEET 法则的测试臂补课。）

**d 维抓漏（已修）**：play-row 死 getContext import → `61d810ed`。pagination anchor 分支 cast、build 未独立重跑等 → 收官串行重建 + 全门禁重跑后随 R2 复审请求附回执。

**GO 条件（Codex R1 开出）**：toggle 闭环+台账修正；页面级 backlog 消除；全量类型检查达批准基线；css-laws 修复进 HEAD 并重跑；串行重建后重跑全门禁。其中 backlog 消除与类型基线两项依赖 Owner 上述裁决——**收官序列在此暂停，呈 Owner 决策后继续**。

### R2（HEAD 4684c960）：**未验证——不重新评分**（会话能力丧失）

Codex 复核 1h11m 后报告：其会话失去仓库读取/命令执行能力，无法核验 4684c960 / 61d810ed / 三份 toggle 回执 / 本文档，故拒绝对所述修复采信或重评分（"在可执行环境恢复前，R2 应维持未验证，不重新评分"）。其**有条件接受框架**（原文归纳）：

- B1/B4 **若**已进入 4684c960 且门禁实测通过 → 应从阻塞清单移除（编排者按：已由本仓库实测背书——css-laws 87/87（61d810ed）、最终 HEAD 串行重建 build/docs/universal 110/110/mirror/tailwindless 全 rc=0（4684c960））。
- B2/B3 作为 Owner-gated 终态**可接受，仅当**四条件成立：
  1. proposal / 活 spec 的 SHALL 未被暗中宣称为已满足 —— **满足**：本文档 §7-B2 原文记载"spec SHALL 与 Tier-1 执行存在真实落差"，无任何处宣称 SHALL 已全满足；
  2. 48/39/40/70 精确缺口与 1204 分类原样保留 —— **满足**：§7-B2/B3 原数在档；
  3. 明确的三选一决策、责任人、successor change 标识 —— **满足**：决策清单第 13 项（见下），successor = `2026-08-30-docs-demo-standard-global-gate`，责任人 = Owner（签署栏空置待署）；
  4. 战役终态标注为**"实现收官、契约例外待 Owner 决策"**而非无条件 docs-complete —— **满足**：见下方终态声明。

### 终态声明（per Codex R2 条件 4）

**docs-eight-axes-mdn 战役的实现收官成立**：110/110 页面经标准管线闭环（tier 决策 + 双审签收 + 门禁），台账名实相符，收官序列（走查→420 歼灭→终审→修复轨）完成。**契约例外待 Owner 决策**：活 spec 的"每页 SHALL 携带专属 per-axis 表 + query() 实例"在 48 页（含 7 页 query() 缺失、39/40 页 Install/SeeAlso、70 页 Usage 序）未达全满足——此落差不因收官而消失，处置权在 Owner（三选一，决策清单 #13）。在 Owner 签署前，本变更**不主张 docs-complete 的契约级达成**。

### 决策清单 #13（新增，承 B2/B3）

**MDN 契约缺口的处置**（责任人：Owner；successor：`2026-08-30-docs-demo-standard-global-gate`）：
- 选项 A：补一轮 fleet 轴表/骨架战役（≈48 页专属轴表 + 39/40 Install/SeeAlso + 70 Usage 序重排）；
- 选项 B：修订 spec（specs/docs-site 的 per-axis SHALL 降为 tier 条件性——Tier 1 以通用 PropsTable 轴节 + 机制行满足）；
- 选项 C：按设计归入 successor backlog（前提：先按选项 B 修订 SHALL，否则 successor 门禁全局翻转即全红）。
同场裁决：**#14 svelte-check 批准基线**（1204 项分类在档：~458 家族类型债 + ~740 广谱遗留；批准现基线 + 修复路线图，或先清零再谈下一个变更）。

### R3（新会话 codex-r3，窄域实跑核验）：**8.5/10 — CONDITIONAL GO（实现收官 / Owner-gated）**，较 R1 4.5 提升 +4.0

全部核验为独立实跑（非转述）：B1 通过（固定 HEAD `git show` + jq：done=110、tier_null=0；三份 T147 回介入树且为实质审签）；B4 通过（`pnpm -C packages/css-laws test` 实跑 87/87，T94 钉扎断言在 law.test.ts:301）；门禁通过（apps/www `npm run build` rc=0 ~23s；根 `npm run verify:docs` rc=0 staged green、无 `[backlog] toggle:` 项——149 项 out-of-scope WARN 被如实区分于零 backlog）；B2/B3 **可接受为 Owner-gated 终态，不可称无条件 docs-complete**（活 spec 的每页 SHALL 仍在 specs/docs-site/spec.md:5；验收材料的数字保留/三选一/successor/终态声明被逐项核对认可）。Codex 同时标注边界：R2 四条件与终态声明在本轮核验时是未提交工作树改动——**本提交即闭合该边界，终态声明进入 HEAD**。

**评分轨迹：R1 4.5 NO-GO → R2 未验证（能力丧失，有条件接受框架）→ R3 8.5 CONDITIONAL GO。**
