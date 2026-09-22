# settings-model-parity — tasks

- [x] T1 服务端目录：`model-catalog.ts`（pi-ai 数据解析锚点链 + 投影 +
      icons + 缓存 + typed UNAVAILABLE）；`provider-icons.generated.ts` 拷贝；
      API `GET catalog.json`（fixture 目录单测：投影形状/排序/排除/降级）
- [x] T2 dsh-test 增强：可选 `modelId`（清单核对）+ `apiKey`（直传探活，
      scrub 覆盖直传 key；不落盘不回显）+ 单测（fixture 服务器）
- [x] T3 客户端 lib `settings-panel-lib.ts`：nextRouteSlug/numberedSlugParts/
      routeDisplayLabel/avatarHue/hueAvatarColor/readableModelName/
      formatTokenCount/parseTokenShorthand/catalogModelCandidates（命名空间
      净化 + 当前 provider 置顶）/catalogModelDefaults（efforts clamp：
      内核词汇表 ∩ 目录 tiers − off，缺省 low/high/max）+ node:test 单测
- [x] T4 面板重写：去 dsh 文案；pick 画廊（搜索/卡片/Added ×N/点卡即建）；
      rail 头像 + 展示名；模型折叠卡（补全/预填/简写/逐模型测试/两步删除）。
      修复：token 字段受控 value 缺 oninput 导致 blur 提交读旧值；活动路由
      模型列表草稿感知（改名后 active model 重指，引用完整性门不再拒save）
- [x] T5 探针扩展（p-probe-settings.mjs 42/42）：catalog.json 可达、画廊
      点卡建路由（编号 slug + 预填模型）、id 补全预填、token 简写往返 +
      非法阻断、r4-2 P1-1 efforts 回归（卡片版）、两步删除、可见文案无 dsh
- [x] T6 电池 611/611 全绿（+18 新测试）+ build:studio + vision 风格自检
- [x] T7a Codex 复核 R1：6.8/10 NEEDS-WORK（五个 P1：自定义表单断层/index 键错绑/
      catalog decoder 不严/锚点链偏离/efforts 残留；+Spec-P1 key 聚焦缺失；交互式
      TUI 当日工具通道故障，改 codex exec 无头 + read-only 沙箱承接）
- [x] T7b R2 处置：nonce 键 + saved 双胞胎；asCatalogDoc 严格 decoder（恶形状
      整体拒收降级）；锚点链纯函数三段链（resolveFromCandidates 测试缝）；
      effortsTouched 换 id 重预填/离目录清空；自定义表单复用模型卡 + key 先落 +
      dsh-test ad-hoc 探针（未存路由 baseURL+api）；pending-key hint + 聚焦；
      请求代次门；clamp 单源化；added ✓；svelte-ignore。聚焦 23/23、探针 53/53、
      电池 615/616（唯一失败为 collab-host fs.watch 负载抖动，隔离复跑 20/20 绿）
- [x] T7c Codex 复核闭环：R1 6.8 → R2 7.7 → R3 条件性 8.6（达 ≥8.5 线）。
      R3 两会话命令通道先后劣化（当日环境故障，复核者自证 pwd 无回显后拒绝
      伪证），其未核验清单与本地已锁证据一一对应：formKey 随探针（鉴权网关
      57/57 探针实证）、保存后 dirty 退役（探针）、decoder dup/控制字符+链
      去重（单测 24/24）、slug 复用再聚焦（探针）、dsh 文案（R2 独立扫过 +
      探针）。R1/R2 均为全通道独立源码核验。按 Owner「别过度迭代」指令收口。
- [x] T7d R3 增量：卡 formKey 阶梯（formKey > 存 key > test-only）；save()
      重建 modelsSaved；decoder 拒 dup/控制字符；候选链保序去重；
      keyFocusDone 事件化复位；supportsReasoningEffort=false 提示；种子卡
      name '' 未触语义。电池 617/617、探针 57/57、聚焦 24/24、build 零警告
- [x] T8 提交推送（2f4f869d）+ 5199 重启 + 汇报（R1-R3 收口轮）
- [x] T9 Owner 走查 r5 重构（四项，2026-09-21）：
      ① 凭据简化为单 input-password，ECHO LAW——settingsView() 携带
      keys 原文回显（0600 落存 + refs 布局 + 测试道 scrub 不变）；
      blur/Enter 提交，空值 no-op；pending-key hint 保留；reveal 眼
      直接用 registry Input 内置 jx-input-reveal（vision 裁决轮删掉
      自加的第二个 eye IconButton——「input-password 带 eye」本就是
      原语自带）
      ② 模型卡 test/edit/remove 换 iconOnly IconButton（plugZap/
      pencil-chevronUp/trash2，稳定 aria-label 供探针与无障碍）
      ③④ 面板重构为 registry Tabs 双层布局：左侧 TabsList vertical
      分区导航（models/general + "mcp · plugins — soon" 注脚，为未来
      MCP/插件分区留位），models 分区内嵌 route tabs（头像 + amber
      点 + active Badge + "+ new route"）；general 为占位页。
      STUDIO_CHROME_ITEMS 补 tabs/icon-button
- [x] T9b vision 风格自检裁决轮（DOM 取证 + 修复）：vision 抓到
      ①双 eye ②卡三钮/导航图标 glyph 不渲染 ③settings 标题冗余。
      DOM 取证实锤根因：六个 lucide 名（boxes/settings2/chevronUp/
      pencil/plugZap/trash2）不在 canonical icon-set（studio 的 $lib
      别名直通已提交工件，build-studio 消费者配置是死路）——按消费
      者增长先例入三处 canonical 面（apps/www + registry vite 配置
      + gen-icon-set.mjs，字节等价），gen:icons 重生成 49 icons、
      www 副本同步、verify:icons fresh；删 sidenav 冗余标题。
      修复后 DOM 复证：导航/三钮 svg 真实渲染、凭据行唯一 eye、
      右缘对齐 1214；探针 59/59 复绿、build:studio 绿
- [x] T11 Owner 走查 r6（四项，2026-09-21）：
      ① Dialog 高度锁定——.dsh-dialog height:min(38rem,calc(100dvh-
      2rem))，CardBody 自带滚动环承内容（registry flex 链传导）
      ② 删 "mcp · plugins — soon" 注脚（markup + CSS + 注释清理）
      ③ registry TabsList 新增 indicatorEdge prop（'start'|'end'，默认
      'end' 零回归）：竖向 line 指示条/被动规则改逻辑边（geometry
      经 isRtl 裁决 + host border-s/border-e；顺带修正 RTL 下 'end'
      的物理侧）；studio 侧导航传 indicatorEdge="start"；www 镜像
      字节同步 + mirror-manifest 刷新 + verify:mirror GREEN + www
      tabs-indicator 套件 67/67
      ④ general 分区 theme 切换：studio-theme.ts（dark|light|system
      → html.dark 作用域 + localStorage，system 挂 matchMedia 监听）；
      两条入口（静态/dev）bootstrap 从硬编码 add('dark') 改为
      posture 解析（默认 dark 保持历史身份）；UI 用 ItemSegmented
      探针 65/65（新增指示条 x=0 / 注脚删除 / 高度不变 / light 摘
      html.dark / dark 恢复 / localStorage 落存）
- [x] T11a Owner 架构裁决（同日，r6 走查中段）：「data-jx-card-cell
      这里不该有 px；左侧导航栏不参与 DialogBody 的滚动，它是独立
      滚动的，右侧的面板也是独立滚动的」——撤掉 cell 上的
      height:100% 消费者尺寸声明，改为 zone（data-jx-card-body）的
      无尺寸 1fr 网格传导；.dsh-sidenav 与 .dsh-section 各自
      overflow-y:auto 独立滚动（导航列两节时休眠，为未来分区就绪）。
      探针 67/67 复绿（surface 高度锁定/导航钉住/滚动分离）
- [x] T11b Owner 补充指令（2026-09-22「你在 general 这里应该用
      list-item 组件」）：general 页从手写 dsh-block 换成 family 组合
      ——ItemGroup（default 模式：组框 + label="appearance" +
      integrated 控制铬）包 ItemSegmented theme 行；未来 mcp/plugins
      行作为兄弟行加入。探针 67/67 复绿（选择器收窄 dialog 作用域）
- [ ] T12 r6 提交推送 + 5199 重启 + 汇报（进行中）
