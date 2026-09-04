# Tasks: context-plugin-v2

编排者（ZCode）保留：git 提交（**每波次一个全绿提交单元——波内不落中间
提交，提交前该波目标套件必须全绿** [S5]）、registry.json / site-only.mjs /
mirror manifest / 三份 spec / 指南页 / verify-all 等共享文件落盘、全量
门禁。子代理禁 commit/push、禁碰共享文件、禁全量 vitest（内存纪律）、必须
反馈困难与偏离。

## 1. 变更文档

- [x] 1.1 proposal.md / design.md / tasks.md / specs deltas（本目录）
- [x] 1.2 codex change 复核（gpt-5.6-terra / xhigh）READY 9.0/10
      （三轮：6.5 REVISE → 8.0 两残留 → 9.0 READY；报告
      /tmp/codex-cp2-review.md；对抗审查 r1 /tmp/cp2-adversarial-r1.md）

## 2. W1 — 内核 v2 与消费端（子代理；单一全绿提交单元：2.1–2.5 同批
      合入，波内不落中间提交）

- [x] 2.1 类型域重写：defBrand 品牌进 ContextDef 接口 / DefValue /
      defineContextDef / ReadOnlyContextDef / READ_ONLY；definePlugin 改
      def-target 签名（谎报 T 编译错误）；targets 恒等匹配贯穿
      applyChain/withPlugins/PluginScope.apply（def 参数统一
      ContextDef<string, unknown>）；UnknownPlugin.targets 重构；medium
      拒绝改结构条件 + READ_ONLY 双保险；PLUGIN_SCOPE_KEY 私有化（Symbol.for
      退役）
- [x] 2.2 medium 解耦：MediumState 移入内核；provideContextPlugins 增
      `medium` 注入项；内核删 `./medium.svelte` import；medium.svelte.ts
      re-export + MEDIUM_DEF 工厂化（注解一律工厂返回类型
      `ReadOnlyContextDef<…>`，禁止宽化 [S1]）；注入四处（**捕获一次
      形态**）：+layout.svelte（一行捕获 provideMedium 返回值）、
      print-doc.svelte（复用既有 medium 变量）、context-plugin-medium-host
      .svelte、hue-pin-host.svelte
- [x] 2.3 def 工厂化：HUE_DEF / HIGHLIGHT_DEF；print/context-plugin.ts 迁
      def-target 语法（targets: [DENSITY_DEF] / [HUE_DEF]，hooks 类型随
      def；density def 值类型为 Density | undefined，现有加宽入参声明统一）；
      code-card-backend.spec.ts:311 的 definePlugin 与
      code-card-backend-host.svelte 的 UnknownPlugin 类型迁移；**[S2]
      canonical def 全清单核对**——所有 target/withPlugins/applyChain 调用
      点（含 fixtures：onion-host、nested-host、density-matrix-host、
      medium-host、hue-pin-host、print-plugin.spec 本地 defs、code-card
      的 highlight 插件）一律 canonical import 或文件级共享常量，逐点
      报告，不许等 key 新建对象（恒等匹配下静默哑火）
- [x] 2.4 谓词退役的内核半边：getContextPlugins 删 try/catch（硬契约）；
      highlight getHighlightContext 第五处 catch 删除（www + registry 双树），
      code-card 无 provider 断言迁 host
- [x] 2.5 测试：context-plugin.spec.ts 迁移——8 处内联 def 字面量收敛为
      文件级共享 PROBE_DEF（defineContextDef 产物，恒等匹配前提）；两条
      medium 伪造 it（cast/spread）改用真 MEDIUM_DEF 触发 READ_ONLY；
      :350-352 窗口外 undefined 改无根 host；"无根纯恒等" it（:477-484）迁
      无根 host 保义；print-plugin.spec.ts 同步；新增
      test/context-plugin-types.spec-d.ts 负探针（谎报 hooks 类型 / targets
      指 ReadOnlyContextDef / 双 target / 内联 def 字面量，均编译错误）

## 3. W2 — 轴模块缝删除 + 三减法 + 测试迁移（子代理；与 W1 同为单一
      全绿提交单元：缝删除 + 三减法 + 全部测试迁移同批，拆开必中间红 [S5]）

- [x] 3.1 density.svelte.ts：删 PLUGIN_SCOPE_KEY/PluginScopeSeam/pluginScope
      整段；DENSITY_DEF 工厂化；直接 import 内核；resolveDensity 尾段改写
      （无 try/catch）
- [x] 3.2 paint.svelte.ts：删值域守卫与冻结 warn（A）；readAmbientVariant
      删 catch（C）；values 参数保留（门禁载体注释更新）
- [x] 3.3 defaults.svelte.ts：删 isLifecycleOutsideComponentError 与
      defineAxisSlot 重入 catch（C）；WeakSet 检查包 import.meta.env?.DEV（B）
- [x] 3.4 通用 fixture unit-resolve-host.svelte + 窗口外断言迁移（defaults-
      buttons / dialog / sheet / nav-providers / nav-clean / overlays / kbd-
      badge-chip / w4-content / form-families / density-context / density-
      adoption-menus）；删除型：谓词 describe、paint-axis 降级 its、A 的
      warn 断言与消音 mock；boom fixture 退役换真路径 throwing-plugin fixture
- [x] 3.5 树同步：多数 spec 双树（apps/www/test 与 registry/test 字节一
      致，cmp 验证后由编排者确认）；density-context / density-adoption-menus
      为单树无副本

## 4. W3 — registry 化 + 文档 + spec（子代理 + 编排者；scene 与 SVG 与
      registry.json/site-only/manifest 同一提交单元，docs+spec 可为第二
      个全绿提交单元 [S5]）

- [x] 4.1 scenes/context-plugin.svelte（零 import 静态图）+ build:blueprints
      产 SVG（编排者跑构建提交）
- [x] 4.2 指南页：pluginCode def-target 语法（含示例 import 块——
      DENSITY_DEF 来源写实）、"不是组件读路径"明示段、slot 表/guards
      措辞（D4）
- [x] 4.3 spec 落盘：新建 specs/context-plugin/spec.md（R1–R8）；MODIFIED
      component-authoring #2/#4/#5 + variant-grammar；MODIFIED registry
      two-tier ownership
- [x] 4.4 编排者：registry.json 新条目 + density 依赖边 + defaults 措辞；
      site-only.mjs 摘除内核行；manifest 重生成

## 5. 门禁与复核（编排者）

- [x] 5.1 verify:context / verify:mirror / verify-deps 全绿（density→
      context-plugin 传递边实测；defaults/paint 的直接依赖面 kernel-free；
      press-button 经 density 传递性携带内核——[B2] 诚实语义，不再断言
      "press-button 安装面不含内核"）
- [x] 5.2 blueprints 双向锁过；目标套件绿；全量 vitest 串行 1777/1781——
      三败逐一定责（main 进行中 foot-mode ×2、本地载荷过期已再生、prismjs
      预存环境债），无本 change 回归——明细见下方验收记录
- [x] 5.3 [S3] 生产路径零残留：registry/files 与 apps/www/src 源码对
      `isLifecycleOutsideComponentError`（定义与调用）、ambient-skip catch、
      `Symbol.for('jx-context-plugins')`、`PluginScopeSeam` 零命中；
      `lifecycle_outside_component` 字面量的合法保留 = 硬契约 throw 断言
      与契约叙述注释（合成 fixture 树除外，见验收记录枚举）；C 的删除面
      与 host 迁移在同一波次原子合入
- [x] 5.4 codex 实现复核（评分闭环）→ 迭代 → archive → push

## 验收记录（5.1–5.3 实测；impl-review S2 措辞精确化）

- 5.1：verify:context GREEN · verify:mirror GREEN（433 对）· verify:deps GREEN（density→@jixoai/context-plugin 边实测；账本 20+5 不变）。
- 5.2：全量 vitest 串行 1777 通过 / 3 失败（1781），三败逐一定责：2 × card-grid foot-mode = main HEAD 自身红态（测试已提交于 8765820、css 实现躺在主仓未提交工作区，另一 agent 进行中工作，与本 change 无关）；1 × registry-payload-parity = 本地 public/ 构建产物过期（根构建再生后单测转绿；public/ gitignored，无需提交）。typecheck 11/11 零类型错误。verify:shadcn-add workbench 案 2 败 = 预存环境债（prismjs@^1.30.0/microlighter npm 链 + consumer vite build Environment——上一 change 在未动过的 main 上证实同签名）。
- 5.3：生产路径零残留（registry/files 与 apps/www/src 的源码：无 isLifecycleOutsideComponentError 定义或调用、无 ambient-skip catch、无 PluginScopeSeam、无 Symbol.for('jx-context-plugins')）。错误码字面量 `lifecycle_outside_component` 的合法保留命中：硬契约 throw 断言（context-plugin.spec / defaults.spec 的 /lifecycle_outside_component/ 正则）与契约叙述注释（含 context-coverage 门禁的合成 fixture 树——其内嵌 defaults.svelte.ts 副本是自带谓词的合成变体，非真文件）。

## 实现复核记录（codex，/tmp/codex-cp2-impl-review.md）

- 8.6/10，零阻塞，4 应修（S1 highlight registry 文案/S2 本记录措辞/S3 spread 副本逃逸/S4 spec-d 文件头）——四项已于同批修复并以边界测试钉死 S3（marker-or-identity 拒绝）。
