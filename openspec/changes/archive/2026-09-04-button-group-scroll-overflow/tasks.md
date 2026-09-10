# Tasks

- [x] 1. button-group.svelte：`overflow='scroll'` 模式 —— host/run 分层、
      run 滚动器 stamp、scroll-state 裁决 + progress + per-member 边缘
      因子的滚动处理器（含 RTL 归一化纯函数）、syncSeps-only 路径
- [x] 2. scrollEffect typed builders（slide/blur/blurSlide/shadow/
      progressBlur，模块导出）+ host 内联旋钮 + veil 层与 chevron 按钮
- [x] 3. button-group.css：run 滚动契约、ramp 规则、veil 层（含 RTL
      物理性）、chevron 掩码与门控（:has + scroll-state）
- [x] 4. registry.json 依赖 +progressive-blur；双树镜像同步
- [x] 5. 测试：结构/裁决 stamp/builder 形状/scroll 模式不跑测量机/
      默认 wrap 不变
- [x] 6. 文档页：overflow 三模式行、scrollEffect 行、scroll demo
      canvas（playground 切特效）
- [x] 7. 门禁：vitest 定向 + 全量、verify:deps/mirror/meta、manifest
      再生成
- [x] 8. Owner 追加（2026-09-04 "统一成一套"，不是同步拷贝）：抽出共享
      `@jixoai/scroll-run` registry item —— scroll-run.svelte.ts（裁决/
      因子/progress 盖章机 + RTL 三引擎漏斗 + nudgeRun + 全部
      scrollEffect builders + mirrors 通道）、scroll-run.css（唯一法则
      表：run 契约、平方消费、frosted chip、veil 层、shadow 墨律、
      pre-hydration/reduced-motion 门）、scroll-chrome.svelte（veil 层 +
      双 chip 的 DOM 半）。tabs 与 button-group 双双改为消费方（家族
      sheet 只剩各自 tuning；tabs 保留 snap 与 inset·2/inset·6，
      indicator 走 mirrors 骑共享 `> *` ramp，家族本地 fade 规则删除）
- [x] 9. 统一收尾：registry.json 新 item + 双侧依赖边换轨（progressive-
      blur 边移至 scroll-run）、docs 页 /docs/components/scroll-run.html
      （raw contract 现场 demo + 五特效切换）、blueprint scene + SVG、
      taxonomy 快照 general 9→10、canonicalMain override、A3 语境捕获
      改 $derived.by 参数子树（blessed 形状）、component-authoring spec
      新增 scroll-run 统一 Requirement（三场景）
- [x] 10. Owner round 2（同日"完善 3 点 + 破坏性更新"）：(1) 垂直滚动 —— 机器按
      data-axis 沿块轴测量（scrollTop/offsetTop，块轴无 RTL 漏斗）、nudgeRun 块轴
      步进（scroll-padding-block 车道）、法则表垂直臂（chip 顶/底边 + up/down 字形
      默认、veil 入口沿块轴、shadow 带横置、ramp 块轴 translate）、button-group
      垂直 scroll 组获得完整 chrome；(2) 自定义 scroll-button —— ScrollChrome 的
      backwardContent/forwardContent snippet 渲染在 frosted chip 按钮内部（霜/门
      控/可聚焦按钮法保留，仅字形层退役 data-jx-scroll-chip-content），css var
      字形替换仍是轻量通道；(3) 内容不足则 chip 不出现 —— none 裁决门既有 +
      childList MutationObserver 跟随成员增删重盖裁决；(4) 破坏性合并
      slide()/blur()/blurSlide() → ramp({opacity?=true, blur?=true,
      translate?=true, distance, radius})，css 侧三个类型规则改为
      data-ramp-* 旗标门控（关闭的待遇完全不付出其属性），ScrollChrome 接管
      run 上的 data-scroll-effect/data-ramp-* 盖章（消费方不再手盖），chip 属性
      值 inline-start/end → start/end（逻辑边）
- [x] 11. Owner round 3（实机验收反馈 5 项）：(1) 四方向图标拆分 —— 字形从
      start/end 双变量（垂直 host :has 重指向）改为四个物理方向槽
      --jx-scroll-chevron-left/-right/-up/-down（每个可独立定制；轴+边+文页方向
      选槽，RTL 交换水平对，:has 重指向块整体退役）；(2) 垂直 chip 水平居中 ——
      根因：水平 per-edge 规则（justify-self: start/end）不限定轴，垂直 chip 沾
      内联角；垂直臂显式 justify-self: center 修复，位置可被消费方零特异性覆写；
      (3) 图标居中 —— chip 默认改 IN-BOARD（负 inset 外挂边距退役，chip 完全在
      host 内、贴其服务的边、交叉轴居中），字形 background-position center 保持；
      (4) ramp 幅值 chrome 接管 —— ScrollChrome 把 builder 的 distance/radius 盖
      成 run 内联 --jx-scroll-edge-slide/blur（关闭的 toggle 不设其 var，非 ramp
      清空；tabs/button-group 的手写 hostStyle 幅值退役），裸 ramp() 无消费方样
      式也真实模糊/位移（此前 0px 回退导致 ramp() 与 ramp({blur:false}) 无差）；
      (5) 自定义 chip 演示 —— 内容居中（display:grid + place-items:center）+ 逐
      轴 SVG 字形（垂直时 up/down 而非 «»），并抓到真 bug：垂直放置规则的 :has
      在 :where 外（0,2,0 特异性）压过内容规则 background-image:none → 垂直自
      定义 chip 双图标；整个复合选择器包进 :where() 修复（零特异性法则回归，
      源码序裁决）。规格：scroll-run.spec 20（四槽/居中/内板/幅值接管）、
      tabs-indicator 66、button-group-scroll 17 全绿；mirror 干净工作树校验 GREEN
- [x] 12. Owner round 4：scroll-button 可声明禁用 —— ScrollChrome 增加
      backwardDisabled/forwardDisabled（默认启用），语义分离：verdict 管"存在"
      （死方向永不渲染），disabled 管"可交互"（渲染但惰性：原生 disabled 属性
      不可点不可聚焦 + css :disabled 惰性臂 —— 半墨霜 oklab(1 0 0 / 0.4)、无
      抬升阴影、默认光标，进度淡入淡出 opacity 耦合保持）。demo 增加
      "chips disabled" 开关，API 表 + registry 描述 + spec 场景同步
- [x] 13. Owner round 5：(a) tabs 页实况 bug —— 水平 host 从 round 1 起漏盖
      .jx-scroll-host（tabs-trigger.css 注释声称"this host carries the class"
      但标记从未盖章），共享表全部 host 键控规则在 tabs 失效：chip 常显（无
      裁决门/无预水合门）、霜墨与字形变量未定义 → 只剩静态 backdrop-blur +
      box-shadow 的幽灵方块。修复：水平 host class 串补 jx-scroll-host；连带
      消除两处同元素声明冲突的顺序脆弱性 —— tabs 的两条调优（veil inset·6、
      snap 车道 inset·2）从 :where 升为挣得的 (0,1,0)（bundle 顺序不是法则
      载体；utilities 层仍压 components 层，消费方覆写不受影响）。实机：
      24 个 tabs host 全部带类，20 个放得下的 strip 裁决 none → chip 全隐，
      4 个溢出 strip 正常显示（墨 80% + 字形）；veil=inset·6、
      scroll-padding=24px 调优胜出。(b) demo 补"内容不足自动隐藏"演示 ——
      content: overflows/fits 开关（14/3 lanes），fits 时裁决 none、chip 全退
      （实机 0 chip），grow back 观察器重新武装（start-closed 复现）。tabs-
      indicator.spec 新增幽灵回归钉（host 类 + 两条调优特异性 source-pin）
- [x] 14. Owner round 6（验收反馈）：(a) 禁用信号太弱 —— 霜墨 0.8→0.4 在浅底
      上几乎不可辨且黑色字形纹丝不动（验收只见阴影消失）。重构：边 缘淡入公
      式收进 --jx-scroll-chip-fade 变量（start/end 各自公式，opacity 引用之），
      :disabled 臂对整颗 chip（霜+字形）乘 0.5 —— 实机 opacity 1→0.5、原生
      disabled、无抬升、默认光标。(b) 自定义演示"无效果" —— 首版自定义 SVG
      与默认字形同为 chevron 同尺寸同墨色，切换后视觉等价。演示改用 lucide
      ARROW（箭头+箭杆双 path，per-axis），与 chevron 一眼可辨；实机 svg 双
      path 落地、背景字形退役。tabs-indicator fade 断言迁移到 fade-var 结构
- [x] 15. Owner round 7（语义定案）："disable chips 应该是完全隐藏 chips" ——
      禁用从"渲染但惰性"（round 4/6 的原生 disabled + 减淡漆面）改为**条件渲
      染缺席**：{#if !backwardDisabled} 包裹按钮，禁用的 chip 无 DOM 节点、无
      漆面、无 a11y 条目；:disabled 惰性臂与 --jx-scroll-chip-fade 间接层整
      体退役（opacity 回直书公式）；verdict 仍是已渲染 chip 的自动门。
      specs：禁用测试改为 DOM 缺席断言 + :disabled 负向 source-pin；fade 断
      言回直式
- [x] 16. Owner round 9（验收反馈："vertical 下 progressBlur 看上去和 shadow 一样"）：
      原设计是垂直替换为 shadow 带（round 2 时 ProgressiveBlur 的 pin='grid'
      只有水平方言）。并行会话 d2259ca 为 docs-nav 给组件补齐了 block 边方言
      （position 'top'|'bottom'，尺寸走 height，grid 方言自带放置），scroll-run
      现在直接消费：veilIsLadder 不再排除垂直，两个 ProgressiveBlur 按
      data-axis 选 position（inline start/end ↔ block top/bottom），替换逻辑
      退役；法则表入场臂扩为选择器列表（start,top / end,bottom 沿块轴滑入）。
      实机：垂直 progressBlur = 梯子带（top/bottom、6 层模糊、遮罩朝上/下、
      全轨宽 500），shadow = contrast 带 —— 二者明确可辨；水平无回归（梯子
      start/end 18×35 遮罩朝左右）。途中抓到并修掉 demo API 行替换文本的未转
      义撇号（js_parse_error，整页 500）。specs：替换测试改为垂直梯子测试
      （.jx-pblur×2 + 0 shadow 带 + top/bottom 戳记 + 入场臂列表 pin），水
      平梯子测试加 position 戳记断言
- [x] 17. Owner round 10：chip 需要 hover 效果 —— "hover 上去背景更不透、阴影适
      当加强"，推翻 tabs 参考法的 "hover stays retired" 时代。host 变量族新增
      --jx-scroll-chevron-chip-hover: oklab(1 0 0 / 0.95)（换值不换名的同一法
      则），:hover 臂漆近不透霜墨 + 抬升阴影 1px 1px 2px/0.2 → 2px 2px 6px/0.3；
      transition 仅携 background-color + box-shadow（120ms ease-out）——滚动驱
      动的 opacity 淡入永不动画。specs：button-group chip 法则的正负钉翻转
      （存在性 + 变量 + 阴影 + transition 白名单），docs Theming 表补 hover 墨
      行，registry 描述同步
