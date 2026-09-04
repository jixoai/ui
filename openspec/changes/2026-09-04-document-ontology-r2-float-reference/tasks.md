# Tasks: document-ontology R2 — 浮+引

批次依赖：0（接口先行，ZCode 整合者落盘——共享文件纪律）→ 1 →
2/3（可并行，消费批次 0 的冻结接口）→ 4 依赖 1+2+3；5 依赖 2+3
的发射面（可与 4 并行）；6 收尾。fixture 清单（host 模式）：
numbering-host、figure-host、reference-host、reorder-host（keyed
each）、harvest-page。

## 0. 接口先行（依赖：无；ui/figure/ 由 ZCode 统一落盘，子代理不得触碰）

- [ ] 0.1 域 context key 模块（figure 家族持有并 module 导出，
      PRESS_TEXTURE_KEY 同律）+ 文档级目标注册表接口（Symbol.for
      key、注册项 {id, kind, number, title}——number 为 getter/
      派生值引用，**禁止注册时快照**）+ kind→显示词映射表导出
      （Figure 与 Reference 共享单源）
- [ ] 0.2 冻结面：上述模块的导出签名定稿（批次 1/2/3 按此并行，
      不得各自修改）

## 1. Section 编号树（依赖：0）

- [ ] 1.1 numbering context 机件（design §1.1 唯一许可实现）：域根
      响应式注册表 + MutationObserver revision 信号 +
      compareDocumentPosition 序数派生；**注册顺序永不赋序**；
      SSR 退化实例化序 + 水合首帧一致（mismatch 即失败）；CSR-only
      首帧可短暂无编号（settle 后一致，记档立场）
- [ ] 1.2 `floatScope` kind 轴配置（默认全 chapter；document 连续
      例外；仅域级可声明；脱离 numbering = dev warn 后忽略）
- [ ] 1.3 现状门（**基线先行**）：实现前落 fixture 的 section-card
      输出快照；实现后断言——不在域子树内的节 outerHTML 逐字节
      全等 + 无 `data-number` + 无编号文本节点
- [ ] 1.4 `data-number` 发射（R1 车道语法族；编号双落 DOM 文本 +
      attr，禁 CSS counter——pagedjs 劫持实证见 design §1.1c）；
      **Section 挂载注册进文档注册表**（0.1 接口：id/kind/number/
      title= title prop）
- [ ] 1.5 多根并列域矩阵项：兄弟章节各声明根域，章序数按文档序
      递增（design §5）

## 2. Figure 家族（新 ui/figure/ 组件层；依赖：0、1 的域 context）

- [ ] 2.1 组件：kind 四值 + 图注槽（英文默认显示词，消费 0.1 映射
      表）+ 计数渲染 + `citedIn` 手动标注（头注释含反链缺口说明、
      静态串腐化风险、回归条件）；裸用（无域）不编号 + dev warn；
      **Figure 挂载注册进文档注册表**（0.1 接口）
- [ ] 2.2 收割发射：`data-jx-figure`/`data-number`/`data-cited-in`
      （JSON 数组）
- [ ] 2.3 测试：计数矩阵（kind×scope×域嵌套，含嵌套域遮蔽、
      document 混合态、多根并列）+ citedIn 渲染/发射 + 裸用行为
- [ ] 2.4 镜像 + registry 登记（registryDependencies 声明被
      section-card 引用）+ manifest + catalog 接线

## 3. Reference 家族（新 ui/reference/；依赖：0——消费既有注册表）

- [ ] 3.1 组件：`to` 寻址（**消费 0.1 冻结的文档注册表，不自建**）
      + 目标自述解析（figure 按kind / 编号节 §N / 无编号标题——
      无连接词 / 缺失 id 响亮回退）+ children 逃生门 + 前向引用
      水合跟随（「尚未注册」≠「不存在」，warn 仅 settle 后触发；
      **settle 口径 = 水合完成 + 双 rAF 后目标仍缺席**）
- [ ] 3.2 `data-ref-to` 发射（**缺失目标不发射**——死锚禁令）
- [ ] 3.3 测试：解析矩阵五态（equation/section/无编号/缺失 id/
      前向引用 SSR 形态 `??(to)`→水合跟随）+ 逃生门 + 回退断言
      （`vi.spyOn(console,'warn')` 按 settle 口径调用一次含目标
      id + `??(to)` 在场 + 不抛错 + 无 data-ref-to）
- [ ] 3.4 镜像 + registry 登记（meta.group/href；**registryDependencies
      声明 reference → figure**——显示词映射与注册表 key 均来自
      figure）+ manifest + catalog 接线（与 2.4 同律）

## 4. 交叉门（依赖：1+2+3）

- [ ] 4.1 「编号=显示货币」法则门（figure 与 section 双夹具）：
      **keyed `{#each}` 数组换序驱动**（items.reverse()，实例保留
      仅移 DOM）；禁止静态标签换位弱夹具。断言：换序后编号重排、
      id 不动、**所有 Reference 显示值跟随新号**（引用跟随法则的
      门——注册项 number 非快照的可断言证明）
- [ ] 4.2 打印探针：冻结捕获编号 ≡ live DOM 编号（含前引后浮
      用例）；无重编号、无 print 侧特判
- [ ] 4.3 docs 页（figure/reference 各一）+ 全量门禁（vitest/
      mirror/payload parity）

## 5. 收割消费（依赖：2+3 的发射面；可与 4 并行）

- [ ] 5.1 search-corpus.mjs 消费：data-number/data-ref-to/
      data-jx-figure/data-cited-in → block.number/block.refids[]/
      block.citedIn/section number；**number 投影到被包块**（figure
      包裹层不单独成块）；**tag-shape fallback 前显式排除
      `data-jx-figure` 包裹层**（裸 pre 直接子元素的误判边角）；
      行内 Reference 的 refids 挂最近块根，块级裸 Reference 不丢
- [ ] 5.2 corpus schema 加性扩展（旧语料不重写；无可投影子块的
      Figure 不投影 number——记档）+ 语料 sha 稳定门禁基线重生成
      + search-corpus.spec 夹具

## 6. 收尾

- [ ] 6.1 specs delta 措辞对齐（component-authoring + search-corpus
      两份 delta 已随 change 开档，实施后校准 scenario 细节）；
      **归档时以 MODIFIED 回写主 spec 的 auto-mode 例外句**（扩为
      含 figure counters 与 reference resolution 的认领清单）
- [ ] 6.2 verification 记录 + 归档准备
