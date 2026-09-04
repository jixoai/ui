# Proposal: env-debt-cleanup (C2)

## Why

context-defaults-economy 篇章合流 main（99ba595）后的遗留债盘点，四笔可动、一笔已完成：

1. **verify:shadcn-add 判例失败的两真因（自 2026-09-02 起常红，判例 4 次）**。
   复现取证（2026-09-04，scratch 实测 + CLI 源码级审查）推翻了"npm 链环境
   问题"的旧判词——prismjs@1.30.0 与 microlighter@2.1.0 在 npm 均存在，
   workbench 消费者的 package.json 里两个包**实际装上了**（裸名键 +
   node_modules 物理在场）。两处失败是：
   - **检查逻辑 bug**：`verify-shadcn-add.mjs:513-515` 对数组形态依赖按字面量
     （含 `@^1.30.0` 版本段）去 package.json **键**里找——npm 写入的键是
     裸名，该比较对任何带版本的数组条目恒假。
   - **模板 alias 触发 CLI 破坏性重写**：消费者模板 components.json 的
     `aliases.lib = "src/lib"` 使 shadcn CLI 把交付
     **.ts** 文件里的 `$lib/x` 重写为裸说明符 `src/lib/x`（`.svelte` 扩展名
     跳过重写）。plain vite/rolldown 解析不了裸 `src/lib/x` →
     `highlight/shiki.ts` 构建期 unresolved import。这是真实消费者也会踩的
     坑。修复（aliases 根 `$lib` → 重写 no-op）已经沙箱实验证实：落盘零
     `src/lib` 残留、vite build exit 0。**版本边界（r3）**：4.20.1 为取证
     版本（沙箱实验）；验收版本 = 模板钉死的 4.19.0（与 pnpm-lock 一致），
     门禁双跑即 4.19.0 的实证；根目录 `shadcn build`（payload 生成，npm
     package-lock 解析 4.18.0）是另一条命令路径、不在本 change 面——仓库
     双 lockfile 的版本分叉是预存状态，记录不扩面。
2. **verify-all 双跑 verify:shadcn-add**：npm-script 循环（verify-all.mjs:56）
   与收尾的 "real consumer proof" 步（:74）执行同一脚本两遍；且循环内的
   执行序（shadcn-add 在 budgets 前）本就与头部链序注释相悖——去重后
   实现与注释终于一致。
3. **23 扫描页 + section-card 的 PropsTable ambient 词汇债**（r2 口径：
   原调查 27 页经两轮审查复核——date-picker（meta 驱动已合规）、
   ghostty-term/table（own+marker 正典形）、component-canvas（page-owned
   bindable，`'comfortable'` 默认 + page-owned 描述已是正典，归档裁决
   "bindable/page-owned 永不 ambient"）四页零编辑移出）。剩余页面的
   density/variant 行不符合三态 marker 体系（`ambient zone` /
   `ambient scope` / `Own default, not ambient`）；四行 tone/material/size
   的 tail 落在 description 而非 default 字段。
4. **六个 main 侧归档 spec 的 Purpose 还是 TBD 占位**（canvas-schema、
   docs-site、paged-docs、print-pipeline、search-corpus、ui-plugin-followup）。
5. **已完成项（记录不做事）**：exemptions schema 校验——schema 文件 +
   双 `$schema` 指针 + A6 运行时 fail-closed 均在位，exemptions 为空列表，
   闭环成立。

## What Changes

- **D1** `verify-shadcn-add.mjs` 依赖检查修名：`toBareName`（scoped 安全）。
- **D2** 消费者模板（脚本内嵌 consumerFiles 表）五个 alias 根改 `$lib`
  （冻结全表）；模板 shadcn 钉精确 `4.19.0`（与 pnpm resolution 一致；npm package-lock 4.18 为预存另一命令路径）+ 版本断言
  + 四组脚本断言；已实证 no-op 重写 + 构建绿。
- **D3** verify-all 去重 + 段注释口径修正。
- **D4** 23 扫描页 + section-card 三态 marker 对齐（legacy 手写行的词汇
  对齐，非 IR 迁移）：variant 行（22 行，全 literalSlot 家族）补
  `'<own>' · Own default, not ambient`；density 行（2 行）落
  `'ambient scope'`；四行 tone/material/size 把 tail 挪入 default。
  **行裁决的唯一权威是 matrix fixture**（tasks 仅引用批次页名，不维护
  平行表）。
- **D5** drift 钉 `docs-ambient-vocabulary.spec.ts`：**单一机器源矩阵**
  （fixture JSON：route + batch + tableIndex + prop[occurrence] + exact default
  串 + slot 导出名；tableIndex = AST 调用点身份，owner 仅注记），每个
  occurrence 冻结 exact marker state——variant 行唯一合法
  `Own default, not ambient`，负例（合成源码写 ambient zone / 两表互换）
  必须红灯；meta 侧 ambient 字段检查；own↔defaults 双向锁；matrix 页集
  与 tasks 批次页集一致性断言。
- **D6** 六个 TBD Purpose 回填（六组 exact token 锚点已冻结于 design）。

## Not Doing

- registry.json code-card 的数组形态 dependencies（脚本明文允许）。
- list-item 页补 tone 行（契约在、文档行缺——记录观察，不扩面）。
- C1 slot-targeting 插件（等真实消费者）；main 侧地板 8 卷 change 的生死。
- 34 页无可标注行（density/variant/tone/material/size 行皆无）的页面。

## Impact

- scripts/verify-shadcn-add.mjs、scripts/verify-all.mjs（ZCode 统一落盘）；
  23 个组件文档页 + section-card 的 tone 行（子代理分批，文件互斥）；
  6 个 spec 的 Purpose 节；新增 1 个 drift spec + registry/test 字节镜像；
  `.openspec.yaml`（skip_specs，纯工具/文档 change 的先例形态）。
  无组件源码、无 registry 数据、无 spec 法则变更。
