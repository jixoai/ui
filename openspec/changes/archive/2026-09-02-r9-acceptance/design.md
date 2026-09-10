# r9 design notes

## S1 dev 服务——为什么是中间件而不是 static/ 落文件

把 corpus.json 放进 apps/www/static/ 会让 SvelteKit 把一份**过期货**
发射进每次构建产物（build-site phase 7.5 再覆盖），两写者竞争且
静态树永远滞后。中间件（devRegistryFallback 同款）读端映射，构建
保持唯一写入者；未构建时诚实 404 + 一次性提示，语义清晰。

## S3 dialog 顶层渲染

`position:fixed` + z-index 是伪造层级；`showModal()` 进浏览器原生
top layer（无 z-index 竞争、原生 backdrop/Escape/焦点圈）。布局
（顶部 14vh 起、宽度 clamp）全部在 dialog 元素内部用 margin/宽度
控制。关闭语义：`close()` + 点击 dialog 自身（非冒泡到子元素）关
闭 + 焦点归还 opener。print 互操作：docs 布局的 `data-jx-print="hide"`
包裹法则不变。

## P2 表列 gutter——法则而非补丁

r7 的 `::before { display:inline-block }` 把号放进了**文本流**：折
行的 continuation 落回 pre 左缘（号下面），基线配对脆弱。真列语义：
`table/table-row/table-cell + 匿名 cell`，号列宽自适应（3ch 地板，
CHUNK 续块的兄弟对齐），折行恒在列右。行是天然分片单元；CHUNK
预分块仍是高卡断页面的稳健断层面（两层机制互补，不互斥）。
数字仍走 `attr(data-line)`（pagedjs Counters 会剥作者 counter 规
则——attr() 免疫，2026-08-31 先例不变）。

## P3 两形态后端接口

markup 型（shiki token spans / prism classed spans）输出进 DOM；
ranges 型（microlighter——CSS Custom Highlight API，零标记，主题
走 data-syntax-theme + ::highlight()）把 Highlight 注册进
CSS.highlights。接口以后端**自己画进给定 <code> 元素**为形
（`highlight(el, code, opts)`），两种形态在适配器内消化。默认值
走 context 内核（运行时值，无编译期参与），实例 prop 覆盖。
已知限制：freeze 克隆 DOM——ranges 不随行，打印下 microlighter
退化纯文本；markup 型不受影响。记录，不 hack 修补。
