# verification — 2026-09-03-card-surface

## gates

- vitest 全量 1648 用例（card.spec 18/18；全量两例已知负载瞬态
  print-pipeline/tabs-indicator 单独复跑 82/82 全绿）
- verify-print 32/32（两轮）
- mirror manifest GREEN（105 items / 373 file pairs，verify:mirror）
- docs skeleton lint 绿（staged scope；card.html 属 backlog 新路由）
- registry payload parity 绿（build:registry ×3 随源滚动重建）

## live measurements（built dist on 127.0.0.1:4173）

card.html 的 foot 模式网格（三卡，min=240px，3 列同 band）：

| 卡 | head 底 | 头线 top | body 高 | 脚线 top | foot 底 |
|---|---|---|---|---|---|
| usage | 3461.2 | 3460.2 | 172 | 3633.2 | 3693.2 |
| anatomy | 3461.2 | 3460.2 | 172 | 3633.2 | 3693.2 |
| the longer body | 3461.2 | 3460.2 | 172 | 3633.2 | 3693.2 |

头线整排对齐、body 等高（最长主导 1fr）、脚线/脚底整排对齐；
页面横向溢出 0。

## the two live-caught regressions (bisection evidence)

1. **body 塌零**：注入实验 A（zone 去 min-height）→ 129.3/108/172；
   C（min-height:0 + cell 全裸）→ 仍 5.3/0/0 ⇒ 元凶 = zone 的显式
   min-height:0；修后三卡 body 全 172。
2. **subgrid 行解算失效**：三卡各自 gridTemplateRows（68.8/71.5/39.5
   开头各行其是）+ 头线不齐；注入 `container-type: normal` 一行后
   headBottoms 三卡 3461.2 全对齐 ⇒ 元凶 = 根上的 @container；
   容器名下沉 foot zone 后不注入即对齐。

## r2 — the inline ruler (live, built dist on 127.0.0.1:4173)

dialog 页取证（打开演示弹窗实测）：footer 按钮 40px 高、
padding 0 12px、簇/foot/grid 全 0/0 且右缘 flush（−1=1px 边框）；
title 面 10px 14px；× 40×40 flush。⇒ 文字座位 py-2.5（18px 行盒
+20px ≈ 40px 簇带，与 head 面同一纵向律，零发明）。

card.html 全卡实测（9 卡）：

| 座位 | 实测 | 法则 |
|---|---|---|
| head 面 left | 15（1px 边框+14px 轨道） | 内容轴 BY TRACK |
| head 面 padding | 10px 0px | px 已退役（轨道供给） |
| start 文字座 left | 15 | 内容轴 |
| start 座 padding | 10px 0px | py-2.5 块律 |
| end 文字座 right | 15 | 跨到 card-inline-end |
| 簇 right | 1（贴 1px 边框） | span -1 骑缘 |
| body cell padding | 14px（=max(14−0,0)） | 全出血滚动环原样 |
| actions 插槽注入探针 | flush 1、43×40、标题面在其前 86px 止步 | 贴角 + 预留末端列 |

租户嵌套（card-grid foot 模式 band，三卡）：zones 列租用在
租来的 band 内照常解析（footZone display:grid、start 15、簇 1）；
in-grid `containerType: normal`（租约护栏生效）；sepHead 3460.2 /
sepFoot 3633.2 / 底边 3678.2 三卡完全对齐；横溢 0。

窄卡反转（220px 探针）：簇 row1 全幅（flush L/R 1/1，stretch
修正后）+ 文字座下方内容轴（inset 15）。

跨行共享取证：foot 簇 115px 把 head 行 line 4 推宽（rootCols
实读 [14px, 50.4px, 426.6px, 115px, 14px]）；命名对与整数 `2/4`
A/B 几何全同 ⇒ 线名租用正常，宽度来自轨道共享——end 文字座因此
必须终于 card-inline-end。

门禁：card 23 + card-grid 14 + docs-structure 12 + print-gate =
66/66 绿；站点构建 exit 0；镜像与 public/r payload 随源滚动重建。

## r3 — the band-height law (live, built dist on 127.0.0.1:4173)

修复 1 落地后全卡实测：

| foot 形态 | foot 高 | 按钮 | 文字座 |
|---|---|---|---|
| start 文字 + 簇（×4 卡） | **40** | 40 | 24（居中，delta 0） |
| 纯 end 文字（独立） | **24** | — | 24 |
| 纯 end 文字（grid 带内） | 40（共享带） | — | 24（居中） |

被拉伸的演示卡（外层 gap-4 网格等高）：富余 +16px 全部进 body
（92 vs 姊妹卡 76），head/foot 保持 39.5/24 精确；grid 内租用
照常（rootRows=subgrid，foot=40 共享带）。横溢 0。card.spec 23 +
card-grid 14 = 37/37 绿；构建 exit 0。

## r4 — the carved-cell law (live, built dist on 127.0.0.1:4173)

| 探针 | 带高 | 簇高 | 按钮高 | 上缘贴线 | 下缘贴底 |
|---|---|---|---|---|---|
| 常态（start 文字 + 簇） | 40 | 40 | 40/40 | 0 | 0 |
| 注入 64px 内容进 start | 88 | 88 | **88** | **0** | **0** |

按钮随带生长（min-h 是地板），按钮块上缘贴分隔线、下缘贴卡片底
边——"切出一块"在任何带高下成立，"挖出一块"的上下留白从结构上
不可能再出现。横溢 0；card.spec 23/23 绿；构建 exit 0；镜像与
payload 随源滚动重建。

## r5 — the real-DOM seams (live, built dist on 127.0.0.1:4173)

| 页面 | 组 DOM 形态 | leading | 注入 seam | 墨法 | 几何 |
|---|---|---|---|---|---|
| card 脚部簇 ×3 | [SEP, BUTTON, SEP, BUTTON] | 声明式首子（无 injected 章） | 1px×40 贯带 | contrast(0.5) | flush 接缝 |
| dialog 脚部簇（多按钮） | [SEP, BUTTON, SEP, BUTTON] | ✓ | ✓ | ✓ | ✓ |

按钮自身零伪元素（css 全表无 ::before，负断言锁定）；wrap 交错列位
实测（leading@1、成员@2/@4、seam@3）；差分同步 + 预检守卫下机器
收敛（无自激循环，页面稳定）；jsdom 26/26（含真 DOM 断言），
card+dialog+grid 71/71 绿；构建 exit 0；镜像与 payload 滚动重建。
