# Tasks: design-studio r2

- [ ] T0 印章变换：design server 的 dev-only 组件印章插件
      （data-jx-component/instance；AST 位置映射同程产出，供 §4
      面板定位复用）+ VD3 生产无痕断言
- [ ] T1 设计文件：save/open 命令 + 版本/changelog 纪律 +
      .jixoai-design.json schema（VA1/VA2）
- [ ] T2 晋升管道：promote（复制/重写/来源清单）+ status
      （漂移 + changelog + 统一 diff）（VP1）
- [ ] T3 变更合并：diff3 three-way apply（干净/冲突两路 +
      报告）+ `diff3` 依赖引入（VP2/VP3）
- [ ] T4 选择模型 + 画布选择器：studio selection 状态 + frame
      picker 注入（点击→印章祖先→高亮→chip）（VC1 前半）
- [ ] T5 ComponentTreeView：frame 印章树 → studio 树面板，与
      picker 共享 selection（VC1 后半）
- [ ] T6 chat 注入：选中 chip + 消息携带 selection 上下文 +
      Agent 端定位提示词段（VC2）
- [ ] T7 元数据按需提取：meta-gen 内核服务化（api/meta/<item>）
      + 注解区校验（icon/i18n 词表）（VD2 + 未知键场景）
- [ ] T8 属性面板：schema → 控件 → AST prop 字面量重写 → HMR；
      不可表示 prop 只读降级（VD1）
- [ ] T9 Layout 族 alpha：@jixoai/ui-prototype-plugin 新包
      （Flex/Grid/Waterfall）+ registry alpha 条目 + guide 轨标
      （VL1 + alpha 标记）
- [ ] T10 CLI 面：design save/open/promote/status/apply 子命令
      （cli/bin/design.mjs 扩展，保持单意图模块化）
- [ ] T11 studio UI：selection chip / 树面板 / 属性面板 /
      updates-available 徽标集成
- [ ] V 系列全验 + VZ vision 三轮目击制走查（真实浏览器）
- [ ] T12 openspec 收尾：spec 定稿、validate --strict、r2 问题
      清单（摩擦合流）
