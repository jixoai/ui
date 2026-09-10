# Tasks: design studio

- [x] T0 monorepo 探针：alias 表（$lib/组件源/app.css/tailwind content
      根）+ 合成配置的插件集验证（含 ui-vite-plugin icons）——产物是
      可测试的探测函数
- [x] T1 prototype-kit 三件套（声明式 frame：iframe src 构建 + grid
      容器 + 嵌套上下文 + id 锚点 + 无 design server 提示态）——含
      vitest+jsdom 单测（21/21；套件迁至 packages/design-tool/test/kit
      ——registry/test/ 是 gitignored 车道）
- [x] T1b registry item 打包：registry.json 新条目（prototype-kit，
      137/136）+ 字段自检（verify:shadcn-add 网络重门禁遗留——见
      problems.md §6）
- [x] T2 demo 原型 welcome（hero ×3 viewport ×2 theme 六页框 + 嵌套
      四态组件框，纯声明 canvas.svelte，`#jixoai/*` 说明符）
- [x] T3 @jixoai/ui-design 包骨架 + createDesignViteServer（T0 探测、
      三表面路由、frame/canvas/stable 入口、manifest 端点、源码分发
      package.json + registry file: 依赖边）
- [x] T4 studio shell 默认实现（navigator + preview + chat + guide，
      svelte5 runes，不 import 宿主组件）+ design/studio.svelte
      scaffold 幂等逻辑（测试 3/3）
- [x] T5 DesignAgent seam + SSE 传输 + EchoAgent 剧本（echo-demo 完整
      对话流落盘，4/4）+ `--agent none` 只读态
- [x] T6 knowledge pack 快照（构建期生成、已提交 snapshot.json、
      四层 systemPrompt + componentIndex，3/3）
- [x] T7 cli/bin/design.mjs 命令面（参数、scaffold、编排、createRequire
      双路径解析、浏览器打开；jixoai-ui.mjs 仅 +13 行分发）
- [x] T8 dsh 冒烟：DshAgent headless 逐回合适配（knowledge 前导 +
      树差分 file 事件 + 镜像安装提示 + preflight）；全回路真实跑通
      （dsh 写 dsh-probe 原型 → manifest/frame/canvas 三面 200）；
      cordis 前端替换可行性笔记（dsh-probe.md，未实施——Owner 议题）
- [x] V1 scaffold 幂等（B 冒烟 + 专用测试）；V2 frame/canvas 模块图
      HMR（HTTP 层验证；浏览器内交互 HMR 留 V5）；V3 主题 frame
      （dark 类落 frame 文档根，三面验证）；V4 Echo 回路（SSE 事件
      序列 + 落盘 + manifest 即时更新）；V6 dsh 冒烟；V7 隔离断言
      （无生产 import 边）
- [x] V5 CLI 端到端浏览器走查（vision 子代理，playwright-core +
      headless Chrome 真实驱动；三轮：初查抓 2 阻塞 → 复验抓
      host-标记缝 → 终验全 PASS，截图 .zcode/v5/）
- [ ] T9 openspec 收尾：两份新 spec 按 living 格式定稿，validate
      --strict 过；problems.md 问题清单定稿（含子代理摩擦点合流）
