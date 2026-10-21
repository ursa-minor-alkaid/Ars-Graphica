#!/usr/bin/env node
/**
 * SVG → 高清 PNG
 *
 * 使用本机已安装的 Chrome / Edge 无头模式渲染，与浏览器预览一致：
 * CSS 变量、系统字体、marker 箭头、渐变均由 Blink 原样栅格化。
 *
 * 用法:
 *   node scripts/export-png.mjs <input.svg> [output.png] [选项]
 *
 * 选项:
 *   --scale=<n>      像素倍率，默认 3
 *   --dpi=<n>        按 96 CSS DPI 换算倍率（300 → 3.125×）
 *   --width=<px>     指定输出像素宽（按比例推倍率）
 *   --height=<px>    指定输出像素高（按比例推倍率）
 *   --transparent    背景透明（SVG 自身无底色时生效）
 *   --browser=<path> 指定 Chrome / Edge 可执行文件
 *   -h, --help       显示帮助
 */

import { existsSync, statSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_SCALE = 3;
const SCREENSHOT_TIMEOUT_MS = 30_000;

const HELP = `SVG → 高清 PNG

用法:
  node scripts/export-png.mjs <input.svg> [output.png] [选项]

选项:
  --scale=<n>      像素倍率，默认 ${DEFAULT_SCALE}
  --dpi=<n>        按 96 CSS DPI 换算倍率（300 → 3.125×）
  --width=<px>     指定输出像素宽（按比例推倍率）
  --height=<px>    指定输出像素高（按比例推倍率）
  --transparent    背景透明（SVG 自身无底色时生效）
  --browser=<path> 指定 Chrome / Edge 可执行文件
  -h, --help       显示帮助

示例:
  node scripts/export-png.mjs figure.svg
  node scripts/export-png.mjs figure.svg out/figure@300dpi.png --dpi=300
  node scripts/export-png.mjs figure.svg --width=1950 --transparent
`;

function fail(message) {
  console.error(`错误: ${message}`);
  process.exit(1);
}

function parseCli(argv) {
  const options = {
    scale: null,
    dpi: null,
    width: null,
    height: null,
    transparent: false,
    browser: process.env.ARS_BROWSER || null,
    help: false,
  };
  const positionals = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (token === '-h' || token === '--help') {
      options.help = true;
      continue;
    }
    if (token === '--transparent') {
      options.transparent = true;
      continue;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const eq = token.indexOf('=');
    const key = eq === -1 ? token.slice(2) : token.slice(2, eq);
    const value = eq === -1 ? argv[++i] : token.slice(eq + 1);

    if (!['scale', 'dpi', 'width', 'height', 'browser'].includes(key)) {
      fail(`未知选项 --${key}`);
    }
    if (value === undefined || value === '') {
      fail(`--${key} 缺少取值`);
    }
    options[key] = value;
  }

  for (const key of ['scale', 'dpi', 'width', 'height']) {
    if (options[key] === null) continue;
    const value = Number(options[key]);
    if (!Number.isFinite(value) || value <= 0) {
      fail(`--${key} 必须是正数`);
    }
    options[key] = value;
  }

  const sizeOptions = ['scale', 'dpi', 'width', 'height'].filter((key) => options[key] !== null);
  if (sizeOptions.length > 1) {
    fail('--scale / --dpi / --width / --height 只能指定一个');
  }

  return { options, positionals };
}

function findBrowser(explicit) {
  if (explicit) {
    const candidate = explicit.replace(/^["']|["']$/g, '');
    if (!existsSync(candidate)) fail(`找不到浏览器: ${candidate}`);
    return candidate;
  }

  const candidates = [];
  if (process.platform === 'win32') {
    const roots = [
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);
    for (const root of roots) {
      candidates.push(path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
      candidates.push(path.join(root, 'Chromium', 'Application', 'chrome.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
    if (process.env.HOME) {
      candidates.push(path.join(process.env.HOME, 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome'));
    }
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
      '/snap/bin/chromium',
    );
  }

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    fail('未找到 Chrome / Edge，可用 --browser=<path> 指定可执行文件');
  }
  return found;
}

const UNIT_TO_PX = new Map([
  ['', 1],
  ['px', 1],
  ['pt', 96 / 72],
  ['pc', 16],
  ['in', 96],
  ['cm', 96 / 2.54],
  ['mm', 96 / 25.4],
  ['q', 96 / 101.6],
]);

function toPx(raw) {
  if (!raw) return null;
  const match = /^\s*(-?[\d.]+)\s*([a-z%]*)\s*$/i.exec(raw);
  if (!match) return null;
  const value = Number(match[1]);
  const factor = UNIT_TO_PX.get(match[2].toLowerCase());
  if (!Number.isFinite(value) || value <= 0 || factor === undefined) return null;
  return value * factor;
}

function readSvgSize(source) {
  const tag = source.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) fail('未找到 <svg> 根元素');

  const getAttribute = (name) => {
    const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
    return match ? (match[2] ?? match[3]) : null;
  };

  let width = toPx(getAttribute('width'));
  let height = toPx(getAttribute('height'));

  const viewBox = getAttribute('viewBox');
  if ((!width || !height) && viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width ||= parts[2];
      height ||= parts[3];
    }
  }

  if (!width || !height) {
    fail('无法确定 SVG 尺寸：缺少有效的 width/height 或 viewBox');
  }
  return { width, height };
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.subarray(1, 4).toString('ascii') !== 'PNG') {
    fail('浏览器输出不是有效的 PNG');
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function runBrowser(browser, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-4000);
    });

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('浏览器截图超时'));
    }, SCREENSHOT_TIMEOUT_MS);

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`浏览器退出码 ${code}${stderr.trim() ? `\n${stderr.trim()}` : ''}`));
        return;
      }
      resolve();
    });
  });
}

async function cleanupProfile(directory) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await rm(directory, { recursive: true, force: true });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

async function main() {
  const { options, positionals } = parseCli(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(HELP);
    return;
  }
  if (positionals.length === 0) {
    process.stderr.write(HELP);
    process.exit(1);
  }
  if (positionals.length > 2) {
    fail('参数过多，最多为 <input.svg> [output.png]');
  }

  const inputPath = path.resolve(positionals[0]);
  if (!existsSync(inputPath) || !statSync(inputPath).isFile()) {
    fail(`输入文件不存在: ${inputPath}`);
  }

  let outputPath = positionals[1]
    ? path.resolve(positionals[1])
    : path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}.png`);

  if (existsSync(outputPath) && statSync(outputPath).isDirectory()) {
    outputPath = path.join(outputPath, `${path.basename(inputPath, path.extname(inputPath))}.png`);
  } else if (!path.extname(outputPath)) {
    outputPath += '.png';
  }
  await mkdir(path.dirname(outputPath), { recursive: true });

  const source = await readFile(inputPath, 'utf8');
  const svgSize = readSvgSize(source);

  let scale = DEFAULT_SCALE;
  let basis = `默认 ${DEFAULT_SCALE}×`;
  if (options.scale !== null) {
    scale = options.scale;
    basis = `--scale=${options.scale}`;
  } else if (options.dpi !== null) {
    scale = options.dpi / 96;
    basis = `--dpi=${options.dpi}`;
  } else if (options.width !== null) {
    scale = options.width / svgSize.width;
    basis = `--width=${options.width}`;
  } else if (options.height !== null) {
    scale = options.height / svgSize.height;
    basis = `--height=${options.height}`;
  }

  const pixelWidth = Math.max(1, Math.round(svgSize.width * scale));
  const pixelHeight = Math.max(1, Math.round(svgSize.height * scale));

  const browser = findBrowser(options.browser);
  const profileDir = await mkdtemp(path.join(tmpdir(), 'ars-png-'));
  const svgUrl = pathToFileURL(inputPath).href;

  // 用显式尺寸的 <img> 承载 SVG，避免独立 SVG 文档在小视口下按视口比例重排
  const wrapperPath = path.join(profileDir, 'render.html');
  const wrapperHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; }
body { background: ${options.transparent ? 'transparent' : '#FFFFFF'}; }
img { display: block; width: ${svgSize.width}px; height: ${svgSize.height}px; }
</style>
</head>
<body><img src="${escapeAttribute(svgUrl)}" alt=""></body>
</html>
`;
  await writeFile(wrapperPath, wrapperHtml, 'utf8');

  // 先渲染到同目录临时文件，成功后再替换目标，避免失败时破坏已有 PNG
  const shotPath = path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath)}.${process.pid}.tmp.png`,
  );
  await rm(shotPath, { force: true });

  const browserArgs = [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-crash-reporter',
    '--run-all-compositor-stages-before-draw',
    `--user-data-dir=${profileDir}`,
    `--force-device-scale-factor=${scale}`,
    `--window-size=${Math.round(svgSize.width)},${Math.round(svgSize.height)}`,
    `--screenshot=${shotPath}`,
  ];
  if (options.transparent) {
    browserArgs.push('--default-background-color=00000000');
  }
  browserArgs.push(pathToFileURL(wrapperPath).href);

  try {
    await runBrowser(browser, browserArgs);
  } finally {
    await cleanupProfile(profileDir);
  }

  if (!existsSync(shotPath) || statSync(shotPath).size === 0) {
    await rm(shotPath, { force: true });
    fail('浏览器未生成 PNG，请检查 SVG 是否可正常打开');
  }
  await rm(outputPath, { force: true });
  await rename(shotPath, outputPath);

  const png = pngDimensions(await readFile(outputPath));
  if (png.width !== pixelWidth || png.height !== pixelHeight) {
    console.warn(`注意: 实际输出 ${png.width}×${png.height}，与计算值 ${pixelWidth}×${pixelHeight} 不一致（像素取整导致）`);
  }

  console.log(`输入  ${inputPath}`);
  console.log(`画布  ${round(svgSize.width)}×${round(svgSize.height)} CSS px`);
  console.log(`输出  ${outputPath}`);
  console.log(`像素  ${png.width}×${png.height} px`);
  console.log(`倍率  ${round(scale, 4)}×（${basis}；按 96 DPI 基准等效 ${round(scale * 96, 1)} DPI）`);
}

main().catch((error) => {
  console.error(`错误: ${error.message}`);
  process.exit(1);
});
