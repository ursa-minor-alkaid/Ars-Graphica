---
name: ars-graphica
description: "ArsGraphica precision figure generation. Turn a text description or an image into a standalone static SVG file with exact text anchoring, aligned elements, and correctly oriented arrows. Use for drawing diagrams, charts, and replicating figures from images. Not for websites, apps, reports, or dashboards."
description_zh: "ArsGraphica 精准图形生成。把文字描述或图片转换为独立静态 SVG 文件，保证文字定位精确、元素对齐、箭头方向正确。用于绘制各类图形与复刻图片。不用于网页、应用、报告或看板。"
user-invocable: true
disable-model-invocation: false
---

# ars — ArsGraphica 精准图形生成

## 定位

激活即工作。显式命令 `/ars`、明确的绘制或复刻指令即用户意图，不做"是否值得可视化"的判断，不做场景路由。

输入两类：

- 文字描述 → 按 `guides/text-to-figure.md` 生成图形
- 图片 → 按 `guides/image-replication.md` 复刻图形

两条工作流共同的前置规范：`guides/precision-svg.md`（强制）。该文件定义坐标计划、文本度量、锚点、对齐、箭头与防重叠门禁，是"文字不偏、元素不歪、箭头不斜"的保证，任何绘制任务在输出前必须逐项通过其第 7 节自检清单。

## 文件地图

`{{SKILL_DIR}}` 为本 `SKILL.md` 所在目录。

```
{{SKILL_DIR}}/
├── SKILL.md                    ← 入口（本文件）
├── README.md                   ← 面向使用者的说明：构成、配色框架、与原版差异
├── tokens/
│   └── visual-tokens.md        ← 视觉 token 框架（颜色值留空待填 + 非颜色 token 定值）
├── guides/
│   ├── precision-svg.md        ← 精确绘制规范（所有任务强制前置）
│   ├── text-to-figure.md       ← 工作流一：文字描述 → 图形
│   └── image-replication.md    ← 工作流二：图片 → 复刻图形
└── examples/                   ← 三个静态 SVG 示例（起手骨架参考）
    ├── flowchart-basic/
    ├── chart-bar-line/
    └── architecture-container/
```

读取顺序：确定任务类型 → 读对应工作流文件 → 读 `guides/precision-svg.md` → 需要 token 细节或起手骨架时读 `tokens/visual-tokens.md` 与对应 `examples/<id>/`。

## 输出契约

产物为完整独立的 `.svg` 文件（UTF-8），写入用户指定路径；未指定时写入当前工作目录。

文件结构：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 H">
  <title>图形标题</title>
  <desc>一句话内容描述</desc>
  <style>
    svg { /* token 声明，见 tokens/visual-tokens.md */ }
    /* 组件样式，颜色一律 var(--token) */
  </style>
  <!-- 图形内容 -->
</svg>
```

硬性规则：

- 独立 SVG 文件：根元素 `<svg xmlns="http://www.w3.org/2000/svg">` + `viewBox`，默认宽 960，高度按内容计算，用户指定尺寸时从其规定
- 每个文件含 `<title>` 与 `<desc>` 无障碍描述
- token 定义放在首个 `<style>` 块的 `svg {}` 选择器上
- 静态输出：禁止 `<script>`、事件属性、CDN 引用、外部库（含 Chart.js）、HTML 页面壳
- 颜色一律 `var(--token)`；复刻任务按 image-replication.md 的取色规则执行
- 文件命名：用户指定名，或按内容语义命名（如 `login-flow.svg`、`q3-revenue.svg`）

## 颜色契约

- token 颜色已填入默认方案“雾蓝燕麦”（低饱和莫兰迪系），备选方案（豆绿陶土、灰紫烟粉、赭红陶橙、赭黄橄榄）见 `tokens/visual-tokens.md` 预设配色方案一节，生成图形直接消费当前 token 值
- 图片复刻默认忠实取原图颜色；用户指令"用我的配色/用 token 配色"时按 image-replication.md 第 4 节映射到 token 框架
- 原图判定为手绘时，强制执行 image-replication.md 第 3 节净线结构复刻：忽略手写体与线条歪斜抖动，输出达到科研期刊配图水准

## 工作流程

1. 判定输入类型（文字描述 / 图片）
2. 输入清晰度检查：图片模糊或文字描述含糊到无法确定图形结构与内容时，先向用户确认，并搜索网络查找同类图形作参考，再继续；信息基本可辨时直接继续
3. 读对应工作流文件，完成需求解析或视觉解析
4. 按 precision-svg.md 完成坐标计划
5. 写出 SVG 文件
6. 执行 precision-svg.md 第 7 节自检清单，不通过则修正后再输出
7. 回复中报告：文件路径、图形类型或复刻模式、焦点或规范化处理说明

## 输出前最终核对

1. precision-svg 自检清单十项全部通过
2. 文件可直接在浏览器打开且渲染无错
3. 无文本溢出节点、无元素重叠、无箭头压框
4. 颜色符合所用模式（token / 占位 / 忠实取色）
5. 回复包含文件路径与必要的模式说明
