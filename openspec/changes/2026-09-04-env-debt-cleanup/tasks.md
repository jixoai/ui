# Tasks: env-debt-cleanup

> r4（codex r3 复评消化）：owner 改 tableIndex 键（AST 调用点序，title 仅
> 注记）；负例 = 合成源码对纯函数 checker（期望矩阵永不变异）；版本断言
> build/add 双打印、互通按实际打印版本组合验收（r6 起废止预写死的版本矩阵）；进程清理
> try/finally + scratch 路径限定 pgrep；Purpose 冻结关键词锚点；**删除
> tasks 平行行表——matrix fixture 是唯一权威**（防第二份漂移源）。

## 1. 脚本修复（ZCode 统一落盘——共享文件，禁止子代理触碰）

- [ ] 1.1 `scripts/verify-shadcn-add.mjs`：依赖检查 `toBareName` 修名
  （design D1 代码块逐字落地）。
- [ ] 1.2 同文件 :415-424：五 alias 冻结表（`{components:'$lib',
  utils:'$lib/utils', ui:'$lib/ui', lib:'$lib', hooks:'$lib/hooks'}`）；
  模板 devDependencies `shadcn` 钉 `'4.19.0'`；**build 与 add 两处打印
  版本**（root 记录、template 断言 4.19.0）；五组断言（design D2：落盘
  alias 精确值 / tsconfig 微型 resolver / canonicalTargets 双推导 / 交付
  .ts 零裸说明符含失败输出 / REGISTRY_URL origin+pathname）；模板
  npm install 600s timeout + fail-loud；**server/子进程 try/finally +
  signal handler 收殓——异常一律经 throw/失败状态走 finally，`die()` 不得
  直接 `process.exit` 绕过收殓**；REGISTRY_URL 断言读**落盘
  components.json 里 CLI 实际消费的 registry pointer** 与实起 server 比对
  （非仅环境变量，防自证循环）；canonicalTargets 的 www 侧与消费者侧两套
  alias 推导保持独立输入。
- [ ] 1.3 `scripts/verify-all.mjs`：循环移除 `'verify:shadcn-add'` +
  :47 段注释口径（design D3）。
- [ ] 1.4 `scripts/verify-clean-consumer.mjs`：内嵌模板同步迁移同一 alias
  冻结表 + 4.19.0（不在 verify:all 链，消双契约漂移）。
- [ ] 1.5 验收：长命子进程 detached 建组 + `{pid,pgid}` 注册表 + finally
  按组 kill/wait（timeout/SIGINT/SIGTERM 各一合成失败 fixture 验证无残留）；
  跑前以 scratch 路径限定清理残留；双跑验收 = 每次明确 exit 0 且注册表
  PID 全部退出；**互通验收 = build/add 两处实际打印的版本组合下五案例
  双跑全绿**（root 实际版本以打印为准，不预写死）；verify:all 全链绿且
  shadcn-add 段恰一次。

## 2. 23 扫描页 + section-card 三态 marker 对齐（子代理波次）

**裁决与行表：见 `apps/www/test/fixtures/docs-ambient-vocabulary.matrix.json`
（任务 2.3 先行建立——唯一权威；route/batch/tableIndex/prop/occurrence/
bareDefault/marker/defaultsFile/slotExport/exactDescription——batch 枚举
{A,B} 且缺失即 RED；occurrence = 表内同名 prop 的 1-based ordinal，
tableIndex = 0-based AST 调用点，occurrence=0 的 fixture 须 schema RED）。**
波次子代理从 matrix 读取各自批次的行裁决执行，不自行推导。

规则要点（design D4/D5）：variant 行 default → `'<own>' · Own default,
not ambient`、description 不动；density 行 → `'ambient scope'` + 正典句；
四行 tail 迁移行按 matrix 的 exactDescription 逐字落（含剥离尾注）；
**禁改**：inline-code 的 variant 行、component-canvas、date-picker、
ghostty-term、table 全页；页面行内现值与 matrix 不符时以 matrix 为准并
报告标注。

- [ ] 2.1 **批次 A**（12 页）：alert-dialog、avatar、color-picker、dialog、
  dropdown-menu、file-input、float-button、form、hover-card、inline-code、
  kbd、language-switcher。
- [ ] 2.2 **批次 B**（11 页 + 1）：list-item、menubar、navigation-menu、
  separator、sheet、tags-input、theme-toggle、timeline、toast、tooltip、
  tour ＋ section-card（tone 行）。
- [ ] 2.3 drift 钉落地（ZCode，**先于 2.1/2.2**）：matrix fixture（含
  alert-dialog 双行 tableIndex 从真实 AST 冻结、toast/四行槽导出与
  exactDescription）+ `apps/www/test/docs-ambient-vocabulary.spec.ts`
  （svelte/compiler parse + typescript AST；纯函数 checker——正例跑真实
  页面、负例用合成源码串（variant 标 ambient zone / 两表互换）断言
  RED；deny 对象级；meta 六文件 exact-key；own↔defaults 双向锁；
  component-canvas page-owned 豁免；**matrix↔tasks 双射断言**（与 design
  D5 同字的两项：route→batch 页面级相等 + `route/tableIndex/prop/
  occurrence` 键 multiset 与非豁免候选行互为覆盖——候选集减
  component-canvas、inline-code#variant 禁改行与移出页；负例 = 删同
  route 一条 entry / 多一条 entry / A-B 页互换 / occurrence 重复均须独立
  RED）；**inline-code#variant 独立不变式**：其 default 含
  `'ambient zone'`（禁改正典态的保护不经过 matrix）；alert-dialog 两行
  tableIndex 冻结 2/3，实现首步以真实 AST 校验命中）；registry/test 放
  字节镜像（`cmp registry/test/
  docs-ambient-vocabulary.spec.ts apps/www/test/docs-ambient-vocabulary.spec.ts`
  等，不在 registry 侧执行）。
- [ ] 2.4 验收：drift spec 绿；docs-nav-filter / docs-structure /
  props-table-render 套件绿。

## 3. 六个 TBD Purpose 回填（子代理波次；基线 = living spec 全量）

- [ ] 3.1 批次 C：canvas-schema、docs-site、paged-docs、search-corpus。
- [ ] 3.2 批次 D：print-pipeline、ui-plugin-followup（`@jixoai/vite-plugin`；
  归档内旧包名不采信）。
- [ ] 3.3 验收：`openspec validate --specs --json` 六 id warning 消失 +
  15/15 保持 + **六个 Purpose 首段（lowercase 规范化）全部命中冻结
  token 集**：canvas-schema {canvas, schema, controls}；docs-site
  {skeleton, honest, parity}；paged-docs {paged, print projection}；
  print-pipeline {printconfig, structured, paged}；search-corpus
  {corpus, cjk, structured}；ui-plugin-followup {vite-plugin,
  isomorphism, build-time}——集合已冻结，实现阶段禁止修改。

## 4. 收尾（ZCode）

- [ ] 4.1 全量门禁（显式序列）：`node scripts/verify-shadcn-add.mjs`
  连续两次全绿（稳定性）→ `npm run verify:all` 一次（其中 shadcn-add
  段恰出现一次）——验收日志分别记录两类次数。
- [ ] 4.2 全量串行 vitest（1840 基线 + 新 drift spec）全绿。
- [ ] 4.3 STATUS.md + archive + commit + push + 合流 main。
