# Proposal: button-group-scroll-overflow — the third overflow mode rides a scroll run

## Why

ButtonGroup 本质是一个容器：joined 行会随成员数增长而溢出可用行内空间。
r13 已给出两种溢出策略（wrap 的测行换行、collapse 的 ⋯ 折叠收纳），但
容器家族还缺最直接的一种：**溢出可滚动**。Owner 2026-09-04：补齐第三种
变体，并让它携带 tabs 家族已沉淀的滚动特效契约（scroll-state 裁决、
per-member 边缘 ramp、veil 墨律、chevron 步进）。三种模式合为
`overflow: 'wrap' | 'collapse' | 'scroll'`（默认仍 'wrap'）。

## What Changes

- **`overflow='scroll'`（新）**：横向组的主轴变成一条 scroll run ——
  现有根元素即滚动器（tabs 的"the a11y scroll region and the DOM
  scroller are one element"法则：隐藏滚动条、smooth、proximity snap、
  scroll-padding 让焦点成员避开 veil 车道）。joined 行永不折行、永不
  收纳；seam/divider 机制原样在滚动内容里工作。纵组声明 scroll 时仅得
  到裸滚动器（overflow-y），特效与 chevron 是横向契约（tabs 同律）。
- **HOST/RUN 分层（仅 scroll 模式渲染 host）**：滚动器的子内容会跟着
  滚，所以 overlay 挂在不滚的 host 上 —— 一格 grid host
  （grid-area 1/1 + z-index，项目法则禁 position:absolute/sticky）
  叠放 run（基础层）、veil 层（z1）、chevron 按钮（z2）。非 scroll
  模式零结构变化（不渲染 host，现有 DOM 逐字节不变）。
- **scrollEffect（新 prop，typed builders，tabs-list 同约定）**：
  `slide()`（默认，translate+opacity）· `blur()` · `blurSlide()` 为
  per-member ramp —— 滚动处理器给每个成员 stamp `--jx-edge-start/end`
  （被裁剪比例），css calc 渐隐/位移；`shadow()` · `progressBlur()` 为
  veil 层 —— 前者是 separator 墨律的对比度幽灵带（backdrop contrast，
  减色不加黑），后者挂 ProgressiveBlur 阶梯。veil 的入场跟随
  `--jx-btngroup-progress`（前 15%/后 15% 滑入滑出）。
- **scroll-state 裁决（JS 单一真源）**：`data-jx-scroll-state`
  （none | start-closed | end-closed | open）stamp 在 run 上，chevron
  的存在性与 veil 的门控全部 key 在它上面；无裁决（无 JS/未注水）什么
  都不画。滚动监听 + ResizeObserver（run + 首尾成员）+ fonts.ready
  重 stamp。RTL 经 tabs 已证明的三引擎归一化（拷贝 4 个纯函数入
  button-group，注记来源法则；cross-family import 拉整组件不可取）。
- **chevron 步进按钮**：host 上的真实 DOM 按钮（在 run 外，a11y 树保
  持纯动作组），掩码字形，click = scrollBy 一页减双车道；闭合一侧永不
  画。
- **测量机的边界**：scroll 模式不跑 wrap/collapse 测量机（CSS 自然滚
  动，无需裁决），只跑 syncSeps（ghost 行的缝仍是真实 DOM）。
- registry：button-group 依赖 +`@jixoai/progressive-blur`
  （progressBlur veil）。

## Impact

- `apps/www/src/lib/ui/button-group/button-group.svelte` + `button-group.css`
  （+ registry/files 镜像、mirror manifest 再生成）
- `registry.json`（依赖边）、button-group 文档页（overflow 行更新 +
  scrollEffect 行 + 一个可玩特效的 demo canvas）
- 测试：button-group 家族 spec 扩展（结构/裁决/builder/无测量翻转）；
  tabs 不动（只读参考）
- 现有 wrap/collapse 行为零变化（overflow 默认值与两模式的机器原样）

## 范围外（记档不做）

- chevron 的自定义 glyph/位置 prop（tabs 的 var 间接可后续引入）
- 纵组的边缘特效与 veil（横向契约；纵向溢出仍归滚动容器事务）
- ~~把 tabs 的滚动机械抽取为共享 lib（等第三个消费者出现再沉淀）~~
  → 被 Owner 同日推翻，见下方追加

## Owner 追加（2026-09-04，验收轮「统一成一套」）

用户裁决：不是同步拷贝，而是统一成一套 utils —— 未来所有可滚动区域
都复用。交付物升级为共享 `@jixoai/scroll-run` registry item（盖章机 +
法则表 + ScrollChrome），tabs 与 button-group 双双改为消费方（tasks
8-9）；本 change 的 button-group 实现从「参考 tabs 自建」改读为
「第二个消费者」，原范围外条目作废。
