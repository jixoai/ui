# Tasks

## store 层

- [x] push 配置：`expandable?: boolean`、`swipeDirections?: readonly SwipeDirection[]`（`SWIPE_BY_POSITION` 按 place-self 语法键控：'start end' → ['right','up']——朝最近屏幕边，sonner getDefaultSwipeDirections 实证 2026-09-02）
- [x] `pauseAll()/resumeAll()` —— visibility 全局源（visHeld/visFrozenArmed/pageHidden），与 per-id held、setVisible 握手正交；隐藏时 push 不 arm；`setVisible(null)` 卸载路径兼容（visHeld 页面源优先）
- [x] 测试：visibility 四态（冻结/恢复/隐藏 push 不 arm/hover 正交/sticky 免疫）

## viewport 堆叠方言

- [x] `--jx-toast-i` 盖章（visible 内索引，最前=0）
- [x] 折叠 transform：translateY(±gap×i) + scale(1-0.05×i)；后板描述墨水扣留（text-transparent，几何保留）
- [x] **生长法则**（vision D-1 修复，2026-09-02）：栈背离锚定边生长——adopted 顶锚定下行（dir=+1、origin top、content-start、enter -8px）、standalone 底锚定上行（dir=-1、origin bottom、content-end、enter +8px）；展开列不再溢出视口顶
- [x] 展开态：量高（offsetHeight of newer）→ gap 阶梯和；`::after` 填隙桥（expanded hover keep）；hover/touch 触发；`expand` prop 恒展开（响应式 pin：`$derived(expand || hoverExpanded)`）
- [x] RM：过渡取消（瞬时换档）；swipe 拖拽保留、回弹取消
- [x] 测试：折叠数学、展开变量、展开触发/退出、queued 芯片共存、惰性 capture 契约（<3px 不捕获）

## swipe 手势

- [x] pointer 三段：`--jx-toast-swipe-x/y` 跟手、非允许轴摩擦 ×0.2、**惰性 capture**（>3px slop 才 setPointerCapture——pointerdown 即捕获会把合成 click 重定向到 wrapper、杀死 expandable 卡点击；无头实证 + 回归测试）
- [x] `judgeSwipe` 纯函数（≥48px 或 >0.11 px/ms，主轴判定）→ dismiss 管线；否则回弹（清变量 + 160ms transition 弹回）
- [x] `touch-action: none`（触摸拖动不滚页面）
- [x] 测试：判定函数全分支（含 dt=0）、跟手变量、dismiss 全管线、惰性 capture

## VT 展开 Dialog

- [x] `toast-dialog.svelte`：popover=auto 面板承载全量内容（title/desc/leading/trailing/countdown 续接 paused）
- [x] 挂载即 `showPopover()`（属性不自动开——light dismiss 语义依赖它；无头实证）；`pointer-events-auto` opt back in（浮层指针透明法则——否则整棵子树对 hit-test 不可见）
- [x] 卡 ↔ 面板 `view-transition-name: jx-toast-<id>` 共享，**双态唯一性契约**：开=卡在 OLD capture 后回调内释放 name；关=卡先重取 name、`finished.finally` 清（陈旧盖章 = Chromium duplicate 警告 + morph 降级）
- [x] WAAPI rect-rise 回退（无 VT 引擎）；展开期间 pause；Escape/collapse 轻关闭（toast 存活）、dismiss 按钮双路径
- [x] 测试：挂载/开合/轻关闭存活

## docs + 验证

- [x] toast.html：#stacking 章节（四演示）+ hero pills + a11y(theming)/API 表补行 + toc；registry.json + toast-dialog/toast-swipe 文件条目
- [x] vision 子代理视觉验证两轮（首轮抓 D-1 溢出→生长法则修复；复轮进行中）
- [ ] 对抗收敛轮（双攻击代理运行中：状态机镜头 + 手势/几何/RTL/docs 镜头）
- [ ] 镜像/manifest/payload/verify 门禁收尾 + 分域提交（全量 vitest 1402 绿，仅用户在途 code-card-backend 5 败非本域；manifest 已加 highlight/ stopgap 分类）
