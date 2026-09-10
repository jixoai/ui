# Tasks: design studio

- [ ] T0 monorepo 探针：alias 表（$lib/组件源/app.css/tailwind content
      根）+ 合成配置的插件集验证（含 ui-vite-plugin icons）——产物是
      可测试的探测函数
- [ ] T1 prototype-kit 三件套（声明式 frame：iframe src 构建 + grid
      容器 + 嵌套上下文 + id 锚点 + 无 design server 提示态）——含
      vitest+jsdom 单测
- [ ] T1b registry item 打包：registry.json 新条目（prototype-kit）+
      verify:shadcn-add 门禁过
- [ ] T2 demo 原型 welcome（pages/hero ×3 viewport + components/
      press-states 状态矩阵，theme 双主题），纯声明 canvas.svelte
- [ ] T3 @jixoai/ui-design 包骨架 + createDesignViteServer（T0 探测、
      三表面路由、frame-entry/canvas 虚拟模块、manifest 端点、源码
      分发 package.json + registry file: 依赖边）
- [ ] T4 studio shell 默认实现（navigator + preview grid + chat panel
      + guide，不 import 宿主组件，槽位留狗粮口）+ design/studio.svelte
      scaffold 幂等逻辑
- [ ] T5 DesignAgent seam + SSE 传输 + EchoAgent 剧本（demo 原型完整
      对话流落盘）+ `--agent none` 只读态
- [ ] T6 knowledge pack 快照（构建期生成、随包提交、四层 systemPrompt
      + componentIndex）
- [ ] T7 cli/bin/design.mjs 命令面（参数、scaffold、编排、createRequire
      解析、浏览器打开；jixoai-ui.mjs 不动）
- [ ] T8 dsh 冒烟（best effort）：DshAgent 最小回路；cordis 前端替换
      仅做可行性笔记；失败面如实记录
- [ ] V1–V7 验证（design.md §8；V7 隔离断言挂 verify 脚本族；V5 由
      vision 子代理真实浏览器走查，交付前自走查纪律）
- [ ] T9 openspec 收尾：两份新 spec 按 living 格式定稿，validate
      --strict 过；问题清单（给 Owner 的讨论稿）落
      openspec/changes/design-studio/problems.md
