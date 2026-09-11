# design-studio r2 问题清单（给 Owner 的第二轮讨论稿）

> 2026-09-11，r2 交付后。r1 清单见 design-studio/problems.md（四问已裁）。
> 本轮按影响排序；P0/P2 已修带 pin，此处只剩限界与议题。

## 1. vision 走查的留存限界（P1 级，如实记录未修）

- **P1-1 嵌套 frame 内层组件的 picker 触达**：studio 内三层 iframe
  里，画布页（第一层）的 kit 元素可点击选中；frame 文档（第二层）
  内的 badge/press-button **树里可见可选、高亮可达，但画布点击
  选择器拾取不到**（picker 注入链在嵌套层的激活条件未全通）。
  独立 frame 页（?pick=1）正常。修复面：picker.js 的跨层激活
  条件 + 树的 selection 上行——下轮小改。
- **P1-2 slot-derived props 的 schema 薄**：press-button 的 variant
  是 `ReturnType<typeof slot>`，超出提取内核的同文件 ceiling →
  面板该行退化为 edit-in-code（诚实降级，与 docs 站 meta.ts 完全
  一致）。真正的修法是提取内核支持跨文件类型解析（typescript
  program 级）——独立 change 量级，涉及 canvas-schema 内核。
- **P3 chip 序号语义**：修 P0 时已统一为全局印章序号空间
  （locateInStampSpace + kind 断言），chip/树/prop-edit 三处同源。

## 2. 结构性议题（下轮拍板）

- **agent turn 与面板写的并发模型**：v0 是"turn 进行中面板只读"。
  更细粒度（面板写锁文件级、agent 感知面板选中态做上下文）是
  体验升级项。
- **`design apply --agent` 未实现**：spec 已承诺（diff + notes 喂
  agent 出可审 patch），管道层留了位。下轮与 MCP 化（r1 Q1 裁决）
  一起做最顺——同一套"设计上下文喂 agent"机制。
- **嵌套设计仓的团队 remote 化**：r1 提议的自然延伸（git remote
  push/pull + release 同步），等真实协作需求出现再动。

## 3. 过程摩擦存档（反馈协议合流，供流程改进）

- **A/B/C 并行的三处环境缝**（r1 教训重演但都被契约文档兜住）：
  A 的 index.ts 语法错误曾短暂炸掉共享入口（B 建议：共享入口
  改动自带 import 冒烟——已记入简报模板认知）；`.svelte?query`
  子请求击穿 stamp 插件（B 修）；promotions.json 形状 A/C 两次
  演进（集成期编排者对齐，最终 PromotionFileStatus 单一权威）。
- **测试宿主盲区**：A 的 tmp 宿主测不到 `.dsh-home` 脏树（真车辆
  抓到）；layout 的 node smoke 测不到 CSSOM 语义（复核者抓到，
  建议已固化进独立工作流模板：jsdom 实挂进 pre-merge 必做）。
- **机器负载 180+**：四路并行时浏览器冷加载 9-20s，探针超时是
  环境时序非代码缺陷（B 报告）——重负载时段验收建议错峰。
- **子代理无法自派复核**（layout 代理发现）：fast-remix 的复核
  环节必须经编排者转发——已在两轮中形成惯例，值得写进 remix
  工作方式文档。
- **代理会话不可恢复**（layout 前任终止后 SendMessage 失败）：
  收尾代理接手模式有效，但"陈旧 git 锁清理"要进接手检查清单
  （收尾代理摩擦点）。

## 3.5 终审修正记录（2026-09-11，终审 7/10 的三处闭环）

- **B1（虚修自首）**：P2-2 的 null 删除首轮只过了纯内核 pin——
  resolver 的请求校验把 null（typeof 'object'）400 挡在门外，
  真实面板链路不可用。已修（校验放行 null）+ resolver 级集成
  测试钉死整链（prop-edit.test.ts "the B1 pin"）。教训入库：
  修复的 pin 必须穿过与真实调用方相同的层，纯内核绿 ≠ 链路绿。
- **B2（声明面 > 实现面）**：`apply --agent` spec SHALL + tasks
  勾选 + 实现为零三方矛盾。裁决：spec 改 deferred 注记（非
  SHALL）、tasks 改注移交——与 §2 的 MCP 化下轮计划一致。
- **D1（CLI 缺口）**：`design diff <A>..<B> --by-page/--export`
  与 `design log` 补齐（内核本在，命令面 30 行的事）。
  车辆实测：r1..r2 by-page 正确报 3 unchanged + 1 M，patch
  导出落盘。

## 4. 遗留门禁（合并前）

- registry/package.json 的 @jixoai/ui-design file: 边 lockfile
  再生（涉主检出 npm install，延续 r1 的 Owner 检查点安排）。
- `verify:shadcn-add` 镜像门禁未跑（网络重；r1 起延续）。
- prototype-kit 站点文档页（r1 遗留）。
- **新**：r2 的 spec 归档（design-studio change 与 design-studio-r2
  change 的归档 + living spec 落地）待 Owner 验收后执行。
