# Visual Tokens（视觉令牌框架）

本文件定义 ars 生成图形的颜色与视觉角色契约。颜色 token 已填入默认方案（雾蓝燕麦，低饱和莫兰迪系，色相 ≤ 2），另有四套备选方案（豆绿陶土、灰紫烟粉、赭红陶橙、赭黄柠檬）见“预设配色方案”一节，可整体替换。非颜色 token（字号、间距、圆角、字重、字体栈）带有确定值，直接使用。

## 使用方式

生成的每个 SVG 文件在根元素内的首个 `<style>` 块中声明 token。独立 SVG 文件中 `:root` 即 `svg` 元素，token 统一定义在 `svg {}` 选择器上：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 H">
  <title>示例</title>
  <desc>示例描述</desc>
  <style>
    svg {
      /* ===== 默认方案：雾蓝燕麦（色相 1 灰蓝 + 色相 2 燕麦） ===== */
      --surface:            #F7F6F3;  /* 暖调近白 */
      --surface-muted:      #EFEDE8;
      --text:               #2E2C29;  /* 暖深灰 */
      --text-muted:         #75716A;
      --border:             #D9D5CD;

      --brand:              #5F7887;  /* 灰蓝，与 surface 对比 ≈4.9:1 */
      --brand-soft:         #EDF1F3;
      --brand-soft-strong:  #DCE4E8;
      --brand-text:         #35434C;
      --brand-on:           #FFFFFF;

      --chart-series-1:     #4A5F6C;  /* 灰蓝 700 深档 */
      --chart-series-2:     #ACBCC5;  /* 灰蓝 200 浅档 */
      --chart-series-3:     #78909D;  /* 灰蓝中间档 */
      --chart-series-4:     #A89A80;  /* 燕麦（第二色相，邻接暖色） */
      --chart-other:        #C4C1BB;  /* 低强调中性灰 */

      --accent:             #A48F77;  /* 燕麦 */
      --accent-soft:        #F2EDE4;
      --accent-text:        #5D5140;

      /* 语义色：功能色，受门禁限制，仅显式状态编码时使用 */
      --success:            #7C9473;  /* 灰调豆绿 */
      --warning:            #A79F7E;  /* 灰调赭石 */
      --danger:             #A17974;  /* 灰调砖红 */

      --radius: 8px;
      --radius-card: 12px;
      --radius-full: 999px;
      --spacer-4: 4px;
      --spacer-8: 8px;
      --spacer-12: 12px;
      --spacer-16: 16px;
      --spacer-20: 20px;
      --spacer-24: 24px;
      --font-sans: "SF Pro Text", "PingFang SC", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      --font-metric: "Inter", "SF Pro Text", "PingFang SC", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      --weight-regular: 400;
      --weight-medium: 500;
      --weight-strong: 600;
      --text-caption: 12px/18px;
      --text-body: 14px/20px;
      --text-title: 16px/24px;
      --text-code: 13px/20px;
    }
  </style>
  <!-- 图形内容，颜色一律 var(--token) -->
</svg>
```

SVG 内所有主题敏感属性（`fill`、`stroke`、文本颜色、图形系列色、连线色、标签色）必须引用 `var(...)`。除 token 定义处外，禁止在图形元素上使用硬编码颜色值。

颜色 token 已填入默认方案“雾蓝燕麦”。切换方案时，用预设配色方案一节中对应方案的整套值替换声明块中全部颜色 token；语义色三套方案共用一组，无需随方案更换。

## 颜色角色体系

### 中性（Neutral）

| Token | 用途 | 填写指引 |
|---|---|---|
| `--surface` | 卡片、面板、表格、节点的底色 | 极浅灰，接近白但可区分于画布背景 |
| `--surface-muted` | 嵌套区域、次级面板底色 | 比 surface 深一档的浅灰 |
| `--text` | 主文本 | 深灰至近黑，与 surface 对比度 ≥ 7:1 |
| `--text-muted` | 次级文本、轴标签、图例、连线默认色 | 中灰，与 surface 对比度 ≥ 4.5:1 |
| `--border` | 边框、分隔线、图表网格线 | 低透明度深色或浅灰 |

### 品牌焦点（Brand）

| Token | 用途 | 填写指引 |
|---|---|---|
| `--brand` | 全图唯一视觉焦点：关键路径、推荐项、核心模块、主数据系列 | 中饱和主色，与 surface 对比度 ≥ 4.5:1，与白底可读 |
| `--brand-soft` | 品牌节点底色、徽章底色；禁止用作大面积卡片面 | 主色加白到 90%~94% 亮度 |
| `--brand-soft-strong` | 需要更强的品牌底色强调时使用 | 主色加白到 85%~90% 亮度 |
| `--brand-text` | brand-soft 底上的文字 | 主色同色相压暗至深档 |
| `--brand-on` | brand 实底上的文字或图标 | 白色或近白 |

### 图表系列（Chart Series）

| Token | 用途 | 填写指引 |
|---|---|---|
| `--chart-series-1` | 第一同源数据系列；可与 brand 相同 | 主色同色相最深可读档 |
| `--chart-series-2` | 第二同源系列 | 与 series-1 拉开明显明度差（浅档） |
| `--chart-series-3` | 第三同源系列 | 介于两者之间的中间档 |
| `--chart-series-4` | 第四同源系列 | 主色邻接色相的中明度档 |
| `--chart-other` | 收敛后的"其他"类、长尾类 | 低强调中性灰 |

### 次强调（Accent）

| Token | 用途 | 填写指引 |
|---|---|---|
| `--accent` | 真正异质的第二类别（与同源对比含义不同） | 与 brand 色相距离明显的第二色 |
| `--accent-soft` | accent 节点底色 | accent 加白到 90% 亮度 |
| `--accent-text` | accent-soft 底上的文字 | accent 同色相压暗 |

### 语义（Semantic）

| Token | 用途 | 填写指引 |
|---|---|---|
| `--success` | 显式正向状态：完成、通过、健康 | 灰调绿系，低饱和 |
| `--warning` | 显式注意状态：风险中档、待定、成本 | 灰调赭石系，低饱和 |
| `--danger` | 显式失败状态：阻塞、失败、高风险 | 灰调砖红系，低饱和 |

语义色保持跨主题固定。语义色仅用于描边、图标、标签文字的强调，禁止用作大面积填充底色。

## 预设配色方案

五套方案均为低饱和莫兰迪调（brand/accent/series/语义色 HSL 饱和度 ≤ 35%；soft 浅底色为近白微染色；方案五的柠檬 accent 为唯一例外，允许较高饱和度与高明度，约 50%）。每套主视觉色相不超过两种（黑、白、灰不计；同色相不同明度视为一种）。切换方式：用所选方案的整套色值替换声明块中的颜色 token。语义色为功能色，五套共用一组（`#7C9473` / `#A79F7E` / `#A17974`），受语义色门禁限制，不计入方案色相数。

### 方案一：雾蓝燕麦（默认，已填入声明块）

灰蓝的冷静理性为焦点色，燕麦的温润为次强调。中性偏暖，适合绝大多数学术与知识类图形。

| Token | 色值 | Token | 色值 |
|---|---|---|---|
| `--surface` | `#F7F6F3` | `--chart-series-1` | `#4A5F6C` |
| `--surface-muted` | `#EFEDE8` | `--chart-series-2` | `#ACBCC5` |
| `--text` | `#2E2C29` | `--chart-series-3` | `#78909D` |
| `--text-muted` | `#75716A` | `--chart-series-4` | `#A89A80` |
| `--border` | `#D9D5CD` | `--chart-other` | `#C4C1BB` |
| `--brand` | `#5F7887` | `--accent` | `#A48F77` |
| `--brand-soft` | `#EDF1F3` | `--accent-soft` | `#F2EDE4` |
| `--brand-soft-strong` | `#DCE4E8` | `--accent-text` | `#5D5140` |
| `--brand-text` | `#35434C` | `--brand-on` | `#FFFFFF` |

- 色相：灰蓝（焦点与系列）+ 燕麦（次强调与第四系列）
- 适用场景：通用默认。流程图、架构图、数据图表、对比图；论文插图、技术文档、演示材料

### 方案二：豆绿陶土

灰豆绿的沉静为焦点色，陶土的暖拙为次强调。中性偏暖，带有自然与人文气息。

| Token | 色值 | Token | 色值 |
|---|---|---|---|
| `--surface` | `#F7F6F2` | `--chart-series-1` | `#516A57` |
| `--surface-muted` | `#EFEDE7` | `--chart-series-2` | `#A7BBA9` |
| `--text` | `#2E2D29` | `--chart-series-3` | `#7C957F` |
| `--text-muted` | `#74716A` | `--chart-series-4` | `#AD9389` |
| `--border` | `#D9D5CC` | `--chart-other` | `#C4C1BA` |
| `--brand` | `#66806B` | `--accent` | `#A68D7D` |
| `--brand-soft` | `#EEF2EE` | `--accent-soft` | `#F4EDE8` |
| `--brand-soft-strong` | `#DDE6DD` | `--accent-text` | `#5E4B3F` |
| `--brand-text` | `#37473A` | `--brand-on` | `#FFFFFF` |

- 色相：灰豆绿（焦点与系列）+ 陶土（次强调与第四系列）
- 适用场景：生命科学、认知科学、心理与哲学类内容；读书笔记、人文向演示；需要温和生长感意象的图形

### 方案三：灰紫烟粉

灰紫的理性深邃为焦点色，烟粉的含蓄为次强调。中性偏冷，气质安静克制。

| Token | 色值 | Token | 色值 |
|---|---|---|---|
| `--surface` | `#F7F6F7` | `--chart-series-1` | `#594F68` |
| `--surface-muted` | `#EFEEF0` | `--chart-series-2` | `#B0A8BC` |
| `--text` | `#2D2C2E` | `--chart-series-3` | `#847A93` |
| `--text-muted` | `#737073` | `--chart-series-4` | `#B08E94` |
| `--border` | `#D9D7DA` | `--chart-other` | `#C5C3C6` |
| `--brand` | `#6F6780` | `--accent` | `#A4878D` |
| `--brand-soft` | `#EFEDF2` | `--accent-soft` | `#F4EDEE` |
| `--brand-soft-strong` | `#E1DDE7` | `--accent-text` | `#5F4A4F` |
| `--brand-text` | `#403A4D` | `--brand-on` | `#FFFFFF` |

- 色相：灰紫（焦点与系列）+ 烟粉（次强调与第四系列）
- 适用场景：理论框架、概念结构；数学与物理学领域；逻辑学、分析哲学等

### 方案四：赭红陶橙

赭红的温厚为焦点色，陶橙的暖意为次强调。整体暖调，气质沉稳而有行动感。

| Token | 色值 | Token | 色值 |
|---|---|---|---|
| `--surface` | `#F6F4F3` | `--chart-series-1` | `#6C534B` |
| `--surface-muted` | `#EDE9E8` | `--chart-series-2` | `#C2B2AD` |
| `--text` | `#2E2B2A` | `--chart-series-3` | `#9E7F76` |
| `--text-muted` | `#736F6C` | `--chart-series-4` | `#B09D8D` |
| `--border` | `#DBD5D2` | `--chart-other` | `#C4C2C0` |
| `--brand` | `#87685E` | `--accent` | `#A18B78` |
| `--brand-soft` | `#F0ECEA` | `--accent-soft` | `#F0EDEA` |
| `--brand-soft-strong` | `#E6DEDB` | `--accent-text` | `#605143` |
| `--brand-text` | `#4B3A35` | `--brand-on` | `#FFFFFF` |

- 色相：赭红（焦点与系列）+ 陶橙（次强调与第四系列）
- 适用场景：工程流程；实践流程、实践操作；行动相关
- 注意：赭红与语义色 danger 色相相近，同图需要状态编码时为状态元素附加文字或图标，不依赖色相区分

### 方案五：赭黄柠檬

赭黄（芥末调）的书卷温润为焦点色，柠檬的清亮明快为次强调。暖调偏干燥，气质温厚；柠檬与赭黄同属黄域，靠明度与饱和度区分，柠檬 accent 是全套中唯一较高饱和度、高明度的点睛色（HSL 约 54° / 50% / 67%），保持小面积使用。

| Token | 色值 | Token | 色值 |
|---|---|---|---|
| `--surface` | `#F7F6F1` | `--chart-series-1` | `#726940` |
| `--surface-muted` | `#EFEEE8` | `--chart-series-2` | `#CFCBB4` |
| `--text` | `#2E2D28` | `--chart-series-3` | `#ABA26D` |
| `--text-muted` | `#73706B` | `--chart-series-4` | `#BDB475` |
| `--border` | `#DAD7CE` | `--chart-other` | `#C3C3C0` |
| `--brand` | `#94894B` | `--accent` | `#D5CC80` |
| `--brand-soft` | `#F4F2E9` | `--accent-soft` | `#F4F1E0` |
| `--brand-soft-strong` | `#EDEBDE` | `--accent-text` | `#6C6438` |
| `--brand-text` | `#565136` | `--brand-on` | `#FFFFFF` |

- 色相：赭黄（焦点与系列）+ 柠檬（次强调与第四系列）
- 适用场景：哲学、语言学；历史、地理；文学、社会科学内容；文献；人文向演示
- 注意：赭黄与语义色 warning 色相相近，同图需要状态编码时同样附加文字或图标区分

## 自建主题指引

从主色推导整套品牌色阶。以 600 档为主色 `--brand`：

| 色阶 | 推导方式 | 对应 token |
|---|---|---|
| 50 | 主色混白约 92% | `--brand-soft` |
| 100 | 主色混白约 86% | `--brand-soft-strong` |
| 200 | 主色混白约 70%，保留可辨色相 | series-2 候选 |
| 600 | 主色本体 | `--brand` |
| 700 | 主色压暗一档（同色相） | `--chart-series-1` |
| 900 | 主色压暗至深色档（同色相） | `--brand-text` |

图表系列取色逻辑：series-1 与 series-2 拉开明度两档以上；series-3 居中；series-4 允许取主色的邻接色相（色环 ±30°~60°）。四个系列并置时须两两可辨。

深色模式为可选扩展：若填写，另设一组 surface/text/border/brand 值，生成器在用户明确要求深色版本时使用。默认只维护浅色一套。

## 颜色用法规则

以下规则在 token 填写后由生成器强制执行：

- 颜色即含义：每次引入一种颜色即声明一种含义。无法在图例或标签中命名的颜色不得出现。
- 中性结构 + 唯一焦点：流程图、架构图、框架图的默认姿态为中性面 + 中性连线 + 一个品牌色焦点。多类别需要颜色时，先用 chart-series 阶梯，再用 accent。
- 语义色门禁：仅当任务显式要求状态、风险、健康编码，或数据字段本身即状态/风险变量时使用语义色。"成功""失败""阻塞"等词出现在普通流程或对比图中，不构成使用语义色的理由，此时保持中性、品牌或系列色。
- 系列上限：同源对比最多 4 个系列色 + 1 个 other。超出时收敛为 Top N + Other、拆分为小图或改用表格，禁止扩展为彩虹色。
- 灰色即低优先级：`--chart-other` 与中性色表达降权，不用于普通类别。
- 渐变门禁：渐变仅用于编码连续物理变量（温度、压力、浓度等），禁止用于类别区分与装饰。
- 颜色位置：颜色放在数据标记、描边、徽章、焦点路径上；卡片、面板、节点的底色保持中性。品牌描边配中性底，禁止品牌底配品牌描边，禁止彩色卡片底。
- 图内文本：brand-soft 底上用 brand-text，accent-soft 底上用 accent-text，语义软底上用 text。焦点数值可用 brand，其余文本用 text 或 text-muted。
- 复刻任务的取色规则见 `guides/image-replication.md`（默认忠实取原图颜色，指令切换到本框架）。

## 非颜色 Token

### 间距

| Token | 值 | 用途 |
|---|---|---|
| `--spacer-4` | 4px | 紧凑内部间隙 |
| `--spacer-8` | 8px | 密集控件间隙、图例行距 |
| `--spacer-12` | 12px | 徽章、紧凑面板内边距 |
| `--spacer-16` | 16px | 紧凑卡片内边距、网格间隙 |
| `--spacer-20` | 20px | 默认卡片内边距 |
| `--spacer-24` | 24px | 分组间隙 |

SVG 几何坐标（viewBox、节点位置、连线端点、数据驱动形状）使用字面数值；周边 UI 间隙、图例间距、内边距使用 spacer token。禁止发明 6px、10px、14px、18px、22px、28px 等中间值。

### 圆角

| Token | 值 | 用途 |
|---|---|---|
| `--radius` | 8px | 默认控件、标签、普通节点 |
| `--radius-card` | 12px | 卡片、大容器、图表面板 |
| `--radius-full` | 999px | 圆与胶囊 |

禁止中间值。SVG 节点圆角 `rx` 用 8，容器用 12，胶囊用高度的一半。

### 字体与字号

| Token | 值 | 用途 |
|---|---|---|
| `--font-sans` | 见声明块 | 默认文本与标题 |
| `--font-metric` | 见声明块 | 数值强调 |
| `--font-mono` | 见声明块 | 代码、ID、紧凑数值 |
| `--weight-regular` | 400 | 默认文本 |
| `--weight-medium` | 500 | 强调文本与小标题 |
| `--weight-strong` | 600 | 主要数值与关键标签 |
| `--text-caption` | 12px/18px | 图注、图例、轴标签、辅助说明 |
| `--text-body` | 14px/20px | 基准字号：正文、控件、普通标签 |
| `--text-title` | 16px/24px | 卡片标题、区块标题，全图字号上限 |
| `--text-code` | 13px/20px | 代码、ID、紧凑数值 |

字号使用规则：14px 为基准；小于基准仅用于图例、轴标签、图注；大于基准仅用于标题与唯一主数值。任何文本不得超过 16px。内容放不下时缩减内容、换行或拆分图形，禁止缩小字号硬塞。

### 图内信息层级

| 角色 | 字号与字重 | 颜色 |
|---|---|---|
| 卡片/节点标题 | medium × text-title | text |
| 副标题、元信息 | regular × text-caption | text-muted |
| 正文、行值 | regular × text-body | text |
| 行标签、图例 | regular × text-caption | text-muted |
| 紧凑数值、ID | medium × text-code | text |
| 唯一主数值 | strong × text-title | text 或 brand（焦点时） |
| 徽章、标签 | medium × text-caption | text-muted 或语义色 |

每张卡片至多一个 text-title 级数值。多个数值竞争时改为行、小条形或表格，禁止放大字号。
