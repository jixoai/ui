# Tasks: design-studio r2

> r2 修订（吸收复核 7/10）：印章 usage-site 化、base 内联快照化、
> 竞态仲裁与 day-1 spike 前置、路径锚定 itemAliasBase、canvas-schema
> 词表 delta 补齐、dsh overlay 追溯条注记。

- [ ] T0d **day-1 spike（前置）**：手工改原型 prop 字面量 → 目击
       frame iframe HMR 不整页 reload（H2 承重墙；失败则 §4 改
       frame 定向刷新并记问题清单）
- [ ] T0 印章变换：usage-site 注入插件（data-jx-component/
       data-jx-instance，文档序静态编号）+ 同遍历产出 usage→AST
       prop 位置映射（面板复用）+ 无 rest-spread 组件降级矩阵
       + VD3 生产无痕断言
- [ ] T1 版本与发布（r2.1 git release 模型）：design init/save
      （wip commit）/release（annotated tag + notes + --export 工件）
      /log/diff --by-page（tag 间按页面分组，可导出 patch）/open
      （工件物化）
- [ ] T2 晋升管道（git 引擎版）：promote（复制/重写/tag+sha 钉定，
      无内联快照；重复拒绝 + --force diff）+ status（git diff
      name-status + tag notes + 统一 diff，theirs 过重写管道）
- [ ] T3 变更合并：git merge-file 三方 apply（干净/冲突/ours 删除
      跳过/CAS 校验）+ `apply --agent`（diff+notes 喂设计 agent
      出可审 patch）（VP2/VP3）
- [ ] T4 选择模型 + 画布选择器：studio selection 状态
      （frameId/usageIndex/iterationIndex?）+ frame picker 注入
      （点击→最近印章祖先→高亮）+ {#each} 共享标注（VC1 前半/
      VC1e）
- [ ] T5 ComponentTreeView：frame 印章树 → studio 树面板，与
      picker 共享 selection（VC1 后半）
- [ ] T6 chat 注入：选中 chip + 消息携带 selection + Agent 端
      定位提示词段（VC2）
- [ ] T7 元数据按需提取：meta-gen 内核服务化（api/meta/<item>，
      锚定 itemAliasBase，typescript 直接依赖）+ 注解区校验 +
      canvas-schema x-ui 词表扩展（icon/i18n，delta 见
      specs/canvas-schema）（VD2/VD2h + 未知键）
- [ ] T8 属性面板：schema → 控件 → AST prop 字面量重写（CAS 写
      仲裁 + agent turn 只读态）→ HMR；不可表示 prop 只读
      （VD1/VD1e）
- [~] T9 Layout 族 alpha → **移交独立标准工作流**（worktree
      ui-prototype-layout，layout-family-alpha change 走
      main——Owner 协作模型裁决，见 working-agreement.md）；本
      分支保留 guide 的 alpha 徽章渲染，VL1 真组件场景待 rebase
      后集成阶段补
- [ ] T10 CLI 面：design save/open/promote/status/apply 子命令
- [ ] T11 studio UI 集成：selection chip / 树面板 / 属性面板 /
      updates-available 徽标（spec：studio surfaces drift）
- [ ] V 系列全验（design.md §8；VC1 脚本断言 + vision 双轨）
      + VZ vision 三轮目击制走查
- [ ] T12 openspec 收尾：spec 定稿（含两处实测修订——"variant
      flips" 场景改为 schema-enum 泛指 + edit-in-code 降级场景
      实化：press-button 的 variant 是 slot-derived opaque，字面量
      编辑路径已实证但分段控件无 enum 可依）、validate --strict、
      r2 问题清单（含 H6 宿主注解边界 + C 报告的摩擦复核）
