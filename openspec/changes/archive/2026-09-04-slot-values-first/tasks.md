# Tasks: slot-values-first

编排者保留：git 提交（W1+W2 为单一全绿提交单元；W3 可为第二单元）、
registry.json / manifest / spec / 指南页 / 门禁 config 与脚本落盘、全量
门禁。子代理禁 commit/push、禁碰共享文件、禁全量 vitest、必须反馈困难
与偏离。

## 1. 变更文档

- [x] 1.1 proposal / design / tasks / spec delta（本目录）
- [x] 1.2 对抗自审（/tmp/svf-adversarial-r1.md）+ codex change 复核七轮 READY 9.0/10（/tmp/codex-svf-review.md；期间抓出 r3 修复脚本中途崩溃未落盘、toast own 行为回归 B3、探针引用不实等，全部闭合）

## 2. W1+W2 — 工具层与家族迁移（单一全绿提交单元）

- [x] 2.1 defaults.svelte.ts：OneOf（string|number|boolean 域）/defineLiteralSlot/
      defineOpenSlot（开放标量域，=never 强制）落地；literalSlot 删除；
      absentSlot/densitySlot 原形；defineAxisSlot 路由与品牌不变（双树）
- [x] 2.2 paint.svelte.ts：definePaintSlot(values, own) 落地；paintSlot
      删除；readAmbientVariant 语义不变（双树）
- [x] 2.3 37 个 *-defaults.svelte.ts：具名槽常量 + ReturnType 反查 +
      union 声明/载体删除；[B1] 布尔 2 → [false,true]、开放 3（sheet size/
      chart size/nav inset）→ defineOpenSlot；[S1] toast 两槽单源
      （TOAST_VARIANT_VALUES/TOAST_MATERIAL_VALUES，类型 typeof 反查，
      own outline/popover 钉现值）；press-button 别名唯一化（双树；registry/test 本地树跟随）
- [x] 2.4 门禁：verify-context-coverage.mjs A2 具名常量解析 + A4 第一
      参数 values/第二参数 own 提取 + 泛型断言面收缩（absentSlot/
      defineOpenSlot 保留）；[B2] component-metadata-gen.mjs 具名常量
      解析 + AMBIENT_OF_FACTORY 新词表；context-coverage.config.json
      词表；合成 fixture 树两份同步（root 反例换 absentSlot 缺参）
- [x] 2.5 spec-d 探针换防（default 越域/显式越域/paint 越域/导入元组
      default 越域——svf-import-consumer 形态）；spec-d 文件头负向 lane
      枚举同步；defaults.spec.ts 工厂名单测更新

## 3. W3 — spec / 文档 / 产物

- [x] 3.1 指南页 author 节全更新面（R4 逐项）：contract 样例、slot 表
      （含 defineOpenSlot 行）、清单第 1+2 条合并（meta 例外从句存活）、
      清单第 3 条收缩至 absentSlot/defineOpenSlot、toast 单源条措辞；
      blueprint scenes/defaults.svelte 的 paintSlot 文字同步
- [x] 3.2 component-authoring 四 requirement 措辞（delta 落 living spec）
- [x] 3.3 registry.json 描述措辞 + build 再生 payload；manifest 重生成

## 4. 门禁与复核

- [x] 4.1 verify:context / mirror / deps / **meta**（B2 验收门）绿；
      blueprints/docs 套件绿；props-table-meta-drift 快照对齐
- [x] 4.2 目标套件绿（含 props-table-meta-drift）；全量 vitest 串行；
      rg 零残留：literalSlot</paintSlot< 于 registry/files 与 apps/www/src
      源码零命中；指南页与 blueprint scene 旧工厂名文本零命中（R4
      stale-string 门）
- [x] 4.3 codex 实现复核（评分闭环）→ archive → push

## 验收记录（4.1–4.2 实测）

- 4.1：verify:context GREEN · verify:mirror GREEN（433 对）· verify:meta GREEN ·
  verify:deps GREEN【impl-review 勘误：单键法删除 ButtonGroupApi.variant 时移除了 button-group→
  press-button 的最后一个 import，dead 边自 889744d 起潜伏，svf 验收照抄了旧 GREEN 而未实测——
  已删边复跑 GREEN，此为记录修正】（zones in sync——B2 发射链验收载体）· blueprints/docs/payload/catalog 套件 31/31。
- 4.2：全量 vitest 串行 1776/1778——唯二失败 = card-grid foot-mode（main HEAD 自身红态：测试已提交、css 实现躺在主仓未提交工作区，另一 agent 进行中工作，与本 change 无关，cp2 验收时已定责同签名）；目标套件 156/156；typecheck 零类型错误；rg 门：literalSlot</paintSlot< 于 registry/files 与 apps/www/src 源码零命中，指南页与 blueprint scene 旧工厂名文本零命中。
- 实现波次：W1（工具层+门禁+meta 链+探针）与 W2a/W2b（37 家族×双树，47 槽）并行后合一提交 b4d6114（单一全绿单元）；W3（文档+spec 转录+payload）d4a0a33。W3a 发现 design 示例 kbd 二值与真文件三值不符——按 same-source 法则修正文档并恢复引言句。
