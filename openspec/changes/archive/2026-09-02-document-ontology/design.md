# Design: document-ontology（设计轨）

零实现：本文是「点线面」组件本体的体裁普查 + 结构推导 + 收割合同。
各实施轮开档时引用对应节，specs delta 届时落。

证据基座：三件幸存组件（print-doc.svelte / section-card.svelte /
code-block.svelte→CodeCard）+ toc-outline.ts / toc-engine.ts /
freeze.svelte.ts 的 injectTocNav / pipeline 的 folio 回填 + 并行
change 2026-09-02-search-corpus（语料 schema v1）。体裁普查来源见
§1 末。

## 1. 体裁结构普查

普查问题即 Owner 之问：**假如你是创作者，你需要什么样的结构化表达？**

| 体裁 | 层级（宏观→微观） | 寻址单位 | 编号方案 | 注释形态 | 交叉引用 | 前件/后件 | 中西要点 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 漫画 | 卷→话（episode）→页→跨页 spread→格 panel→气泡/拟声 sfx | 话+页 | 第N卷·第N话；页码藏于画格边距 | 作者边注 omake、格内旁白 | 回闪、联动互相指涉 | 封面/目录/次回预告 | 阅读方向：日漫 RTL、西漫 LTR（早期镜像翻转会画错利手）；转场六型中 aspect-to-aspect 偏日漫 |
| 音乐 | 乐章 movement→段（A/B/C 字母，重现同字母）→小节 measure（barline 分隔） | 排练字母 rehearsal letter + 小节号 m.32 | 乐章号+小节号；段字母 A/B；双小节线=段界 | 术语/力度/指法标注；歌词平行行 | D.C./D.S. al coda 跳转、反复记号 | 标题页/乐器表/歌词页 | 谱 notation（音高+节奏+力度，全员可读）vs TAB（指位，缺节奏）双轨并存 |
| 字典 | 字部（字母/部首）→词头条目→词性块→分义 sense→书证 | 词头（字母序位置即地址） | 分义号 1/2/3；词头无编号 | 用法注/语域注/辨析注 | 见/参见 see also、对比 | 凡例/缩略语表/部首表→正文→附录 | 条目模型有标准：TEI P5「form+gramDef+def+senses」；POS 标签随同形词重复出现 |
| 小说 | 部/卷→章→场景→段 | 章号 | 章号；**前置件罗马页码 i,ii + 正文阿拉伯** | 脚注/尾注/译注 | 题词 epigraph 标出处；章内互文 | 半标题页→扉页→版权→献辞→目录→序→正文→附录→致谢/作者简介 | 章断=暂停点，场景断=章内位移（\*\*\*／空行），常表时间跳跃/视角切换 |
| 史书 | **三体=三种结构模式**：纪传体（人物维：本纪/世家/列传/书/表）·编年体（时间维：年月日）·纪事本末体（事件维：一事一篇，起因→结局完备） | 人名／年号+年／事件名 | 年号纪年↔公元双轨 | **注疏传统**（裴松之注式：注与正文平行，可超过正文量） | 「语见《XX》」互见 | 序/目录/校勘记 | 三体即结构选型：人物维 vs 时间维 vs 事件维；另有通史/断代、国别体、典制体等正交轴；现代叙事非虚构=三体混用 |
| 工科工具书 | 部→章→节→小节 | 节号/式号/图号/表号 | 十进制 3.2.1；**章域计数 Eq (4.5)/Fig 2-3/Table 6-1**；式号全篇连续 (1)(2)…（ASME 惯例，含附录） | 脚注；SI 单位框注 | §交叉引用+后置索引（倒排款目） | 目录/符号表/单位约定→正文→附录→索引→参考文献；教材变体+习题集 | 索引=收割派生的后件（terms/people/places 倒排） |

**横切件**（全体裁共享）：前言序（半标题→扉→版权→献→ToC→序，KDP/
Reedsy 正典）、注释三态（脚注=页底／尾注=章末书末／**边注**=Tufte：
「读者眼角余光即可判断值不值得读」，不强迫视线跳页底）、引用/书目、
图·表·式计数器、习题/问题集、colophon。

要点提炼（后续推导的输入）：

1. **每个体裁都有「结构模式选择」先于内容**——史书三体是显式证据，
   字典（排序键选型：字母 vs 部首）、工具书（编号深度选型）同理。
2. **寻址两轨**：逻辑编号（式 4.5、m.32、分义 2）与排序位置（字母序
   即地址）并存；页码（folio）永远是布局事实，晚于两者。
3. **注释是与正文平行的第二流**——史书注疏证明注可以比正文厚重；
   Tufte 边注证明注的版式是体裁级决策（三态）而非全局决策。
4. **跳转引用（D.S. al coda、see also、§3.2.1、互见）是显式结构**，
   不是装饰性链接——它们参与寻址体系。
5. **前置件页码罗马、正文页码阿拉伯**：编号方案本身就是文档级预设。

来源：[Wikipedia: Glossary of comics terminology](https://en.wikipedia.org/wiki/Glossary_of_comics_terminology)、
[McCloud 六型转场](https://thesequentialpress.wordpress.com/2012/01/19/transitions/)、
[manga RTL](https://www.animeascension.com/post/understanding-the-right-to-left-format-in-manga-and-how-to-start-reading)、
[Graphic Library: tankōbon/話](https://www.graphiclibrary.org/terminology.html)、
[Wikipedia: Rehearsal letter](https://en.wikipedia.org/wiki/Rehearsal_letter)、
[Wikipedia: Sonata form](https://en.wikipedia.org/wiki/Sonata_form)、
[tab vs notation](https://www.pickupmusic.com/blog/guitar-tab-vs-sheet-music-which-is-best-for-you)、
[TEI P5 §9 Dictionaries](https://www.tei-c.org/release/doc/tei-p5-doc/es/html/DI.html)、
[Macquarie: entry 结构](https://www.macquariedictionary.com.au/)、
[Kindlepreneur: parts of a book](https://kindlepreneur.com/parts-of-a-book/)、
[Reedsy: front/back matter](https://reedsy.com/blog/guide/parts-of-a-book/)、
[Helping Writers: scene vs chapter](https://www.helpingwritersbecomeauthors.com/5-questions-scenes-vs-chapters/)、
[人民网: 三体裁维度论](http://theory.people.com.cn/n/2015/0330/c40531-26768995.html)、
[澎湃: 纪事本末体源流](https://m.thepaper.cn/newsDetail_forward_31229097)、
[ASME: equation numbering](https://www.asme.org/publications-submissions/journals/information-for-authors/journal-guidelines/writing-a-research-paper)、
[NCEES FE handbook](https://www.ncees.org/exams/fe-exam/)、
[Tufte: sidenotes](https://www.edwardtufte.com/notebook/sidenotes-or-footnotes-or-what/)、
[Amazon KDP: matter 顺序](https://kdp.amazon.com/help/topic/GDDYZG2C7RVF5N9J)、
[Blurb: index](https://www.blurb.com/blog/book-terminology-dissected/)。

## 2. A. 线最小集（7 原语）

判定法：一个结构需求被 **≥2 体裁**共同需要才升原语；只有单体裁需要
的形状归该体裁的面预设或点字段。结果 7 个（任务区间 4–8 内）：

| # | 原语 | 语义 | 依据（≥2 体裁） | 今日 SectionCard 映射 |
| --- | --- | --- | --- | --- |
| 1 | 节 Section | 有题、可寻址、按层级嵌套的内容区 | 小说章／乐章／工具书 3.2.1／字典字部／漫画话／纪事本末篇 | SectionCard 本体：title/summary/eyebrow/headingLevel + data-family/data-region extents |
| 2 | 条 Entry | 以标签（词头/人名/术语）为地址的字段化记录 | 字典词头／百科条目／纪传体列传本纪／术语表款目／索引款目 | title=词头、eyebrow=词性域的雏形；缺分义结构、字段序、逐条寻址 |
| 3 | 列 Sequence | 同质单元有序流，**位置即语义** | 编年体时序／漫画格序／小节流／分义序列／习题集／式序列 | children slot 的 DOM 序（今日隐式成立）；缺「序语义」声明与排序键归一 |
| 4 | 浮 Float | 编号+图注+可被引用的浮动单元 | 工具书图/表/式/算法箱／教材插图／乐例／小说地图 | CodeCard 裸 figure+figcaption；缺计数器、章域编号、引用反链 |
| 5 | 注 Note | 锚在正文位点的注释，版式三态（边/脚/尾） | 史书注疏／工具书脚注／Tufte 边注／字典用法注／小说译注 | 无。退役 PagedAside 的处置法幸存为法则：宽=右浮边注，窄=沉降内联 |
| 6 | 引 Reference | 类型化交叉链接，显示编号自动解析 | 字典参见／工具书 §3.2.1·Eq(4.5)／史书互见／乐谱 D.S. al coda／书目 | 裸 anchor + 管线 ToC folio 回填（data-jx-folio，特例）；缺类型化与通用编号解析 |
| 7 | 断 Break | 声明式结构边界，**不入大纲** | 小说场景断／漫画页界·跨页界／双小节线／章前换页 | 打印侧 kernel-print.css 断行规则；缺 web 侧可声明动词 |

**最小集的非平凡验证——史书三体分解**：三种体裁结构模式恰好落在
三个不同原语上，删掉任何一个必有体裁失语：

```
纪传体     = 条（人）× 引（互见）× 节（本纪/列传 typed section）
编年体     = 列（时间轴）× 断（纪年界）× 注（注疏双流）
纪事本末体 = 节（一事一节，起讫完备）× 引（事件互见）
```

**部/卷（Division）不设独立原语**：它是层级 1 的节——Markdown 同律
（`#` 就是 `#`，深度只是数字）。若未来体裁要求「部」有独立语法
（如卷首集体题词位），再开档升格。

**与 Markdown 的对齐论证**：Markdown 以 6 个记号覆盖写作用户 80% 的
结构表达；本普查六体裁的全部结构需求被 7 原语闭合（§1 表逐列可溯）。
体裁差异**不进线**——交由面预设（§4）与点字段（§3）承载。这是
「像 Markdown 被发明」的具体含义：线只收公因数。

**合成法则**（三层职责的精确切分）：

```
面 preset（PrintDoc）＝ 页面语法 + 编号方案 + 前后件槽 + running heads
  └─ 线 primitive（SectionCard 词汇）＝ 地址 / 编号槽 / 锚 / 结构角色
       └─ 点 block（行业原子）＝ 行业语义字段（harvest 进 blocks.meta）

工具书一页 = 面(handbook) ⊃ 节(3.2) ⊃ 浮(式 4.5) ⊃ 点(math: latex 源)
编年体一页 = 面(chronicle:biannian) ⊃ 列(timeline) ⊃ 点(event: 日期/人物)
```

## 3. B. 点矩阵

每个行业一个标准表达原子（CodeBlock 之于 code 的同位物）+ 收割器
必须读得到的机器语义字段。**字段必须 DOM 可见**（结构化标记/data
属性落在最终 HTML 上——search-corpus 收割最终产物，JS-only 状态
不入合同）。

| 行业 | 点（表达原子） | 机器语义字段（blocks.meta 定型） | 状态 |
| --- | --- | --- | --- |
| code | CodeBlock/CodeCard | `code / lang / label(filename)` | 已有（corpus kind=code） |
| math | EquationBlock | `source(latex\|mathml) / notation / number(浮编号) / variables[] / refids[]` | 未来（R6 首发） |
| music | ScoreBlock | `source(abc\|musicxml) / clef / key / timeSig / tempo / measureRange / lyrics?` | 未来 |
| 漫画 | PanelStrip | `panels[]{image,order} / bubbles[]{speaker,kind} / sfx / direction(rtl\|ltr)` | 未来 |
| 字典·百科 | SenseBlock | `headword / pronunciation / pos / senses[]{n,gloss,examples[]} / etymology / xrefs[]` | 未来（结构归线之条，字段归点） |
| 史书·叙事 | EventBlock | `date(归一 ISO) / era(年号) / actors[] / place / sources[] / summary` | 未来 |
| 工具书 | TableBlock·AlgorithmBlock | `number / caption / unitConvention(SI) / columns[]{name,unit} / steps[]` | 未来 |
| 摄影 | PhotoBlock | `src / exif{camera,lens,focal,aperture,shutter,iso} / geo / takenAt / caption` | 未来 |
| 旅行 | WaypointBlock | `place / geo / window{arrive,depart} / route / cost / rating` | 未来 |
| 商业 | MetricBlock | `metric / period / unit / currency / series[] / source` | 未来 |
| 理化生 | ExperimentBlock | `reagents[] / apparatus[] / conditions{temp,pressure,…} / procedure[] / observations[] / safety` | 未来 |

推论：

1. **点不编号，线编号**——式 4.5 的编号属于浮（线），latex 源属于
   math（点）。收割时 number 落 block.number、源落 block.meta，
   两轨分离（§5 法则 2 的收割面投影）。
2. `blocks.kind` 开放枚举逐轮扩展（search-corpus 已立先例），每轮
   落一个 kind + 定型扁平字段 + 夹具，非 breaking。
3. 点的字段表就是搜索的 facet 面：字典可按 POS 过滤、编年体可按
   年代过滤、照片可按 exif 检索——**没有结构化表达就没有可收割的
   语义**，这是本体论对创作者与对机器的同一条利益。

## 4. C. 面预设

面 = PrintDoc 之上的 `preset` prop（今日 printOptions.config 语法的
同族扩展），驱动：@page 语法、ToC 页形态（条目来源与排序）、断页
动词、方向、栏数、前后件槽。各体裁组合规则：

| 体裁 | preset | 页面语法 | 编号方案 | running heads | 结构排序约束 | 前件/后件 |
| --- | --- | --- | --- | --- | --- | --- |
| 漫画 | `comic` | 固定比率页；跨页为断页单位；全出血；RTL 可预设 | 第N卷·第N话；画页藏页码 | 话题（非跨页页才出） | 话→页→格严格有序；阅读方向全文档统一 | 封面/目录/次回预告 |
| 乐谱 | `score` | 横向谱面；多声部行流；歌词行平行 | 乐章号+小节号+排练字母 | 乐章+速度记号 | 乐章→段→小节严格线性；跳转由线之引承载 | 标题页/乐器表 |
| 字典 | `dictionary` | 双/三栏紧排；词头悬挂缩进 | 分义号；词头无编号（**字母序即地址**） | 当页首末词头（拇指索引法则） | 字部严格线性；词头按排序键；字段固定序 音→性→义→例→源 | 凡例/缩略语表→正文→附录 |
| 小说 | `novel` | 章首页独立；场景断记号；章前题词位 | 章号；**前置件罗马页码+正文阿拉伯** | verso=书名 recto=章题（书卷惯例） | 部→章严格线性；场景断不入大纲 | 半标题→扉→版权→献→目录→序→正文→后件 |
| 史书 | `chronicle:jizhuan\|biannian\|benmo` | 三体=三个子预设；注疏双栏（注=平行流） | 年号↔公元双轨纪年 | 纪传=当前传主；编年=当前纪年 | 纪传=人物条集；**编年=时间轴严格线性**；本末=事件完备分节 | 序→目录（三体各形）→校勘记 |
| 工具书 | `handbook` | 版心紧凑；图表式浮置；SI 单位框注 | 十进制 3.2.1 + 章域计数 Eq(4.5)/Fig/Table | 当前节号+节题 | 部→章→节十进制严格树序 | 目录/符号表/单位约定→正文→附录→索引→参考文献 |

面法则：

- **预设不发明结构，只约束结构**——排序约束（ordering）是对线原语
  的校验器（如 dictionary 下条必须按排序键可排），不是新组件。
- **前后件是有序槽位**，能派生的自动派生（ToC 页今日管线已注入；
  索引/术语表=收割派生的后件——§1 横切件第 2 条的落地）。
- preset 落 doc 级收割字段（§5），即 search-corpus 已预留的
  `pages[].preset` 的取值域。

## 5. D. 收割合同 v1

一个 page-semantics 模型，三消费者（站内搜索 / llms.txt / 打印
ToC）同吃。三层字段：

```jsonc
document（面）
  preset: 'comic'|'score'|'dictionary'|'novel'|'chronicle:*'|'handbook'|null
  title / description
  numbering: { scheme: 'decimal'|'alpha'|'chronologic'|'none',
               folio: 'roman-front+arabic-body'|'arabic' }
  direction: 'ltr'|'rtl'
  frontMatter[] / backMatter[]: 有序槽位描述

section（线）
  id: string                 // 寻址法则 v2：自身 id → slug（去重仅计已发射 id；根布局统一盖章，与 deriveTocOutline 严格同律；search-corpus as-built）
  heading / level / summary  // toc-outline + injectTocNav 先例
  role: 'section'|'entry'|'sequence'|'float'|'note'|'ref'|'break'
  ordering: 'linear'|'alpha'|'timeline'|'tree'|null   // 面预设可约束
  extent: start/end          // 既有 extents 法则

block（点）
  kind: 开放枚举             // 'prose'|'code'|… 行业点逐轮扩展
  text                       // 块文本（截断上限沿 corpus 法则）
  <kind 定型扁平字段>        // as-built 先例（search-corpus v1）：code→
                             // lang,label 扁平直挂；R1+ 逐点扩展沿用扁平
                             // （§3 点矩阵即定型字段表；meta 包装仅在嵌套
                             // 结构确有必要时引入，须新一轮裁决）
  number?: string            // 浮编号（'式 4.5'）——打印 ToC 与搜索摘要共用
  refids[]: string           // 本块引用的 id（线之引的收割面）
  noteids[]: string          // 锚定的注（线之注的收割面）
```

五条法则（每条对照一个仓内先例）：

1. **DOM 序即语义序**。先例：toc-outline「DOM order is the outline
   order」；本合同把它从派生实现升格为线之列的语义承诺。
2. **编号是显示货币，显式 id 是稳定寻址**。先例：paged-doc-family
   裁决原话；pipeline 的 folio 回填是其运行实例（页码是布局完成后
   回填的静态事实）。推论：`number` 只收逻辑编号，永不收页码。
3. **寻址收敛，收割不重写产物**。先例（search-corpus as-built）：
   id 烘焙因水合风险弃用；v2 收割法则「自身 id → slug」与运行时
   盖章器严格同律（祖先步退役：根布局统一盖章后 slug 恒有活体
   目标；收割去重集不再计入 wrapper id——chip/press-button
   usage-2 死锚根因）。本合同扩展到编号：收割器读
   DOM 上的编号标记，不计算编号。
4. **字段必须 DOM 可见**。先例：search-corpus 收割最终产物 HTML；
   任何只活在 JS 状态里的字段（exif、measure 元数据）必须以结构化
   标记/data 属性落 DOM，否则不入合同。
5. **开放枚举不 breaking**。先例：corpus `blocks.kind` 开放枚举；
   `role` 与 `preset` 同理——逐轮扩展，旧语料永不重写。

三消费者对照：

| 消费者 | 吃合同哪些字段 | 今日先例 → 升级 |
| --- | --- | --- |
| 站内搜索（search-corpus） | document.preset、section 全字段、block.kind/text/meta | corpus v1（结构派生+启发式回退）→ R1 标记落地后启发式逐页退役 |
| llms.txt | section.heading/summary、block.text + kind 降级标签 | tokenizer/chrome 剥离先例；改接语料模型=已记录的回访条件，由本合同触发 |
| 打印 ToC/页眉 | section.id/heading/summary + numbering + preset 页面语法 | injectTocNav（h2 + `:scope > p` summary + id 上移）+ folio 回填 + string-set 页眉 → R5 preset 决定条目来源/排序/槽位 |

## 6. E. 今日已供 vs 升级增量

| 能力 | 今日已发射 | 升级增量（轮次） |
| --- | --- | --- |
| 节（线） | SectionCard：h1/h2+title/summary/eyebrow+data-family/region；toc-outline 派生 extents（levels/data-toc-skip/slug 回盖幂等） | R1：role+ordering 标记；R4：条/列定型 |
| code 点 | CodeCard figure+figcaption+data-lang；corpus kind=code {lang,label} | R6：行业点逐轮扩 kind+meta 定型 |
| 目录 | web=站点 ToC；print=管线注入目录页（h2+summary+id 上移+folio 回填+dot leader） | R5：preset 决定条目来源/排序/前后件槽 |
| 页面语法 | docs layout DEFAULT_PRINT_CONFIG（A4/string-set 页眉 docTitle·sectionTitle/页脚 X·Y）+ 页级 printConfig 覆盖 | R5：preset 词汇（direction/栏/断页动词/编号方案/前后件） |
| 注（线） | 无 | R3：Note 原语三态（宽=边注/窄=沉降——PagedAside 处置法转正）+ noteids 收割 |
| 浮（线） | CodeCard 裸 figure，无计数 | R2：Float 计数器（章域）+ number 收割 + 引反链 |
| 引（线） | 裸 anchor 链接 + folio 回填特例 | R2：类型化引 + 显示编号解析（§N/Eq(4.5) 回填） |
| 断（线） | 打印侧 kernel-print.css 规则 | R4：web 侧声明动词（场景断等），不入大纲 |
| 收割 | search-corpus v1：结构派生（heading 树/SectionCard 形状/figcaption）+ 未结构化页启发式回退 | R1：合同标记让回退逐页退役；§5 字段全量上线 |

## 7. 未来实施轮次（优先级排序，各自独立可发布）

| 轮 | 主题 | 交付 | 为何独立 | 门 |
| --- | --- | --- | --- | --- |
| R1 | 收割合同标记 | 线 role/ordering + 点 kind registry 的 data 标记语法；收割器消费标记；启发式回退逐页退役 | 纯增量；search-corpus 正在等（首个消费者）；无 UI 变更 | 夹具页结构派生保真（扩展 corpus 既有 spec） |
| R2 | 浮+引 | Float 章域计数器；Reference 编号解析与反链 | 工具书/教材页立即受益；退役 PagedRef 的未尽事宜 | 「编号=显示货币」法则测试（换序后编号重排、id 不动） |
| R3 | 注 | Note 原语：边/脚/尾三态 + 锚定法则 | 史书注疏/学术脚注独立成立 | 宽窄两态渲染探针 + noteids 收割 |
| R4 | 条+列+断 | Entry 字段化；Sequence 声明（排序键归一）；Break web 动词 | 字典/编年体解锁 | 字母部/时间轴排序约束门（面预设前置依赖） |
| R5 | 面 presets | PrintDoc preset prop：六体裁预设（页面语法/编号/方向/前后件/ToC 形态） | web 侧零风险；打印侧渐进（preset 缺依赖时优雅降级） | preset×管线探针；folio 方案（罗马前置件）断言 |
| R6 | 行业点 | MathBlock 首发（equation+notation+number）；music/photo/travel/business/理化生按行业路线图逐轮 | 每点独立 shippable；kind 扩展非 breaking | 每点：字段 DOM 可见性 + corpus meta 定型夹具 |

依赖边（不破坏独立性，只约束顺序收益）：R2→R5（handbook 预设的编号
方案吃 Float 计数）；R4→R5（chronicle/dictionary 预设吃条/列）；
R1 恒先行。

## 8. 开放问题（记录在案）

- **第 8 原语 Jump？** 乐谱 D.S. al coda 是控制流跳转而非引用——
  暂归引的子类型，等乐谱实施轮（R6·music）实证再裁决。
- **number 与 folio 的边界**：页码是布局事实，永不预收割（§5 法则
  2）；合同只承诺逻辑编号。
- **年号↔公元双轨**属 locale 知识：落点字段（EventBlock.era/date），
  不落面预设——预设不携带 i18n 负担。
- **小说是线富点贫的体裁**（普查发现：其点几乎全是 prose）——这本身
  是本体论的验证案例：小说的价值集中在 R5 面预设，几乎不需要新点。
