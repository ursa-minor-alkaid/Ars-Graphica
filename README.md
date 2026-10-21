<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/ursa-minor-alkaid/Ars-Graphica@main/ars-graphica-icon.svg" alt="Ars Graphica icon" width="120">
</p>

<h1 align="center"><i>Ars Graphica</i><br>Precision SVG Figure Generation</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.2.0-blue" alt="version">
  <img src="https://img.shields.io/badge/update-2026.10.06-green" alt="update">
</p>

<p align="center">
  <a href="README.zh-CN.md">中文</a>
</p>

Takes a text description or an image and outputs a standalone static SVG file, using text constraints to keep text placement precise, elements aligned, and arrow directions correct; **it resolves the arbitrary misalignment of fine details that occurs in SVG flowcharts**.

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/ursa-minor-alkaid/Ars-Graphica@main/ars-graphica-specimen.svg" alt="Ars Graphica specimen plate: workflow, figure types, and five color palettes" width="820">
</p>

## What It Does

The skill accepts two kinds of input, text descriptions and images, and always produces a standalone static SVG file, spending its specification budget on drawing precision.

- **Text description → SVG** (`references/text-to-figure.md`): parses the description and determines the figure type (process, sequence, data, mechanism, comparison, architecture), then structures it according to the composition rules of that type; asks first when required data is missing, and never fabricates data
- **Image → SVG replication** (`references/image-replication.md`): rebuilds the figure after a four-step analysis of layout detection, element inventory, color extraction, and proportion measurement; layout, text, connectors, and colors must match the original, with only typeface and minor ornamentation permitted to be normalized
- **SVG → high-resolution PNG** (`scripts/export-png.mjs`): rasterizes an SVG to 3× PNG on demand, ready to embed directly in documents, papers, and presentations

---

## Usage

### Installation

- Upload `ars-graphica.zip` to the skill upload/install interface of the Agent client
- Or send `ars-graphica.zip` directly to the model and let it install the skill in the client

### Activation

Enter `/ars`, or issue an explicit drawing or replication instruction. An explicit command is the intent; the skill makes no "is this worth visualizing" judgment and performs no scenario routing.

### Exporting PNG

Use `scripts/export-png.mjs` when a bitmap is needed from an SVG artifact. The script renders in headless mode through the local Chrome / Edge and introduces no npm dependencies.

```bash
node scripts/export-png.mjs figure.svg
node scripts/export-png.mjs figure.svg figure@300dpi.png --dpi=300
node scripts/export-png.mjs figure.svg --width=1950
node scripts/export-png.mjs figure.svg --transparent
```

- Default 3×: a 960-wide canvas outputs 2880 px in width, about 443 ppi at a 6.5 in print width
- Choose one of `--scale` / `--dpi` / `--width` / `--height`; `--dpi` is converted against 96 CSS DPI
- White background by default; `--transparent` outputs a transparent background
- Without an output path, the PNG is written next to the SVG under the same name
- Environment: Node 22+, Chrome or Edge installed locally; use `--browser=<path>` when the browser is in a non-default location

---

## Output

### SVG Artifact

- The artifact is a complete standalone `.svg` file (UTF-8), written to the given path, or to the current working directory when unspecified
- Default canvas width is 960, with height computed from the content; explicit dimensions take precedence; the file contains `<title>` and `<desc>`
- Colors always use `var(--token)`, with token declarations in the `svg {}` selector of the first `<style>` block
- Purely static output: no `<script>`, no event attributes, no CDN references, no external libraries, no HTML page shell

### Color Schemes

To switch, replace the color tokens in the token declaration block with the full set of values from the chosen scheme; semantic colors are shared across all five schemes.

| Scheme                     | Hue composition                     | Use case                                                                                                                     |
| -------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Mist Blue Oat (default)    | Grey-blue focus + oat secondary     | General default: flowcharts, architecture diagrams, data charts; paper figures, technical documentation                       |
| Pea Green Terracotta       | Grey pea-green focus + terracotta secondary | Life sciences, medicine, cognitive science                                                                            |
| Cool Violet Smoke Pink     | Cool violet focus + smoke pink secondary | Theoretical frameworks, conceptual structures; mathematics and physics; logic, analytic philosophy and similar          |
| Warm Sand Scarlet Orange   | Scarlet orange focus + warm sand secondary | Engineering workflows; practical procedures and operations; action-related content                                   |
| Ochre Lemon                | Ochre focus + lemon secondary       | Philosophy, linguistics; history, geography; literature and social science content; documents; humanities-oriented presentations |

Image replication samples the original colors faithfully by default; the instruction "use my palette" switches to the token framework according to the role mapping table.
