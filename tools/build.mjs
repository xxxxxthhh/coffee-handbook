/* 生成器：目录页、附录 A/B/C、章节导航链，全部从 manifest + 章节标记推导。
   用法：node tools/build.mjs        （写盘）
   check.mjs 会调用 generate() 重新生成到内存并与磁盘比对，防止「手改生成页」漂移。 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PARTS, CHAPTERS, APPENDICES, BOOK } from './manifest.mjs';
import { terms, diags, toolboxes, rebaseLinks } from './parse.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GEN = '<!-- 本文件由 tools/build.mjs 生成，请勿手改 -->';

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Noto+Sans+SC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

function page(title, body, depth){
  const up = depth ? '../' : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${GEN}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
${FONTS}
<link rel="stylesheet" href="${up}assets/handbook.css">
</head>
<body>
<button class="theme-toggle" type="button" aria-label="切换深色/浅色模式" title="切换深色/浅色模式">
  <span class="moon" aria-hidden="true">🌙</span><span class="sun" aria-hidden="true">☀️</span>
</button>

<div class="wrap">
${body}
</div>

<script src="${up}assets/theme.js"></script>
<script src="${up}assets/quiz.js"></script>
</body>
</html>
`;
}

function readChapters(root){
  return CHAPTERS.map(ch => {
    const file = path.join(root, 'chapters', ch.slug + '.html');
    return { ...ch, file, html: fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '' };
  });
}

/* ---------------- 目录页 ---------------- */
function buildIndex(chs){
  const parts = PARTS.map(p => {
    const rows = chs.filter(c => c.part === p.n).map(c => `      <li><a href="chapters/${c.slug}.html">
        <span class="num">${c.id}</span>
        <span class="tt">${c.zh}<span class="td">${c.blurb}</span></span>
        <span class="lab-flag">交互</span>
      </a></li>`).join('\n');
    return `    <section class="part">
      <div class="part-head">
        <span class="pn">Part ${p.n} · ${p.en}</span>
        <h2>${p.zh}</h2>
        <span class="pd">${p.blurb}</span>
      </div>
      <ul class="toc">
${rows}
      </ul>
    </section>`;
  }).join('\n');

  const appx = APPENDICES.map(a => `      <li><a href="${a.file}">
        <span class="num">${a.letter}</span>
        <span class="tt">${a.zh}<span class="td">${a.en}</span></span>
      </a></li>`).join('\n');

  const body = `<header class="book">
  <div class="dotrow" aria-hidden="true">
    <i class="s"></i><i></i><i class="a"></i><i class="a"></i><i></i><i class="b"></i><i></i><i class="a"></i><i></i><i class="s"></i>
  </div>
  <div class="kicker">Handbook Series · 通识线 第二本</div>
  <h1>${BOOK.en}<span class="zh">${BOOK.zh}</span></h1>
  <p class="lede">${BOOK.lede}</p>
  <div class="meta">
    <span>共 <b>${chs.length}</b> 章</span>
    <span>Part <b>${PARTS.length}</b> 个</span>
    <span>附录 <b>${APPENDICES.length}</b> 篇</span>
    <span>每章 <b>1</b> 个原生 JS 交互</span>
  </div>
</header>

<section>
  <div class="sec-tag"><span class="cell"></span><span class="lab">How to Read 怎么读</span></div>
  <p>每章按同一顺序展开：<b>先猜一次</b>（凭直觉选，不判对错）→ <b>核心概念</b>（机制推导）→ <b>交互实验</b>（拖动变量看风味走向）→ <b>真实案例</b>（来源可查）→ <b>章末自测</b>（答案默认折叠）。部分章节另有<b>工具层</b>侧栏，装会过期的器具与数值——正文的结论不依赖它。</p>
  <p>数值区间（金杯区间、水质区间、温度区间）在本书里一律是<b>参考坐标系</b>而非判卷标准：正文给方向和机制，具体数字进工具层并标注来源与日期。</p>
</section>

${parts}

    <section class="part">
      <div class="part-head">
        <span class="pn">Appendix</span>
        <h2>附录</h2>
        <span class="pd">速查页，由各章标记程序聚合</span>
      </div>
      <ul class="toc">
${appx}
      </ul>
    </section>`;

  return page(`${BOOK.zh} · ${BOOK.en}`, body, 0);
}

/* ---------------- 附录 A 术语表 ---------------- */
function buildGlossary(chs){
  const seen = new Map();
  chs.forEach(c => terms(c.html).forEach(t => {
    if(!seen.has(t.en)) seen.set(t.en, { ...t, ch: c });
    else if(t.def && !seen.get(t.en).def) seen.set(t.en, { ...t, ch: c });
  }));

  const items = [...seen.values()].sort((a, b) => a.en.toLowerCase().localeCompare(b.en.toLowerCase()));
  const rows = items.map(t => `  <li>
    <span class="en">${t.en}</span><span class="zh">${t.zh}</span>
    <span class="df">${t.def}</span>
    <span class="from">首次出现：<a href="chapters/${t.ch.slug}.html${t.section ? '#' + t.section : ''}">${t.ch.id} ${t.ch.zh}</a></span>
  </li>`).join('\n');

  const body = `<header class="book">
  <div class="kicker"><a href="index.html">← ${BOOK.zh}</a></div>
  <h1>Appendix A · Glossary<span class="zh">附录 A · 术语表</span></h1>
  <p class="lede">共 ${items.length} 条。中文解释取自术语首次出现的章节，点击可跳回原文语境。</p>
</header>

<section>
  <ul class="gl">
${rows}
  </ul>
</section>`;
  return page(`附录 A · 术语表 · ${BOOK.zh}`, body, 0);
}

/* ---------------- 附录 B 冲煮诊断卡 ---------------- */
function buildDiagnosis(chs){
  const rows = [];
  chs.forEach(c => diags(c.html).forEach(d => rows.push({ ...d, ch: c })));

  const trs = rows.map(d => `      <tr>
        <td><span class="sym">${d.symptom}</span></td>
        <td>${d.variable}</td>
        <td>${d.fix}</td>
        <td><a href="chapters/${d.ch.slug}.html">${d.ch.id}</a></td>
      </tr>`).join('\n');

  const body = `<header class="book">
  <div class="kicker"><a href="index.html">← ${BOOK.zh}</a></div>
  <h1>Appendix B · Diagnosis Card<span class="zh">附录 B · 冲煮诊断卡</span></h1>
  <p class="lede">共 ${rows.length} 条，全部由各章正文的 <code>data-diag</code> 标记聚合——改章节即改此页。建议打印后贴在磨豆机旁。</p>
</header>

<section>
  <p>用法：<b>先定位症状，再决定动哪个旋钮</b>。一次只动一个变量，动完记录落点（见 <a href="chapters/1-3-control-chart.html">1.3 冲煮控制图</a>）。表里的「调整方向」是方向不是配方——具体档位随豆子、器具、水质浮动。</p>
  <div class="tablebox">
    <table>
      <thead><tr><th>症状</th><th>最可能的变量</th><th>调整方向</th><th>章节</th></tr></thead>
      <tbody>
${trs}
      </tbody>
    </table>
  </div>
</section>`;
  return page(`附录 B · 冲煮诊断卡 · ${BOOK.zh}`, body, 0);
}

/* ---------------- 附录 C 器具与仪器速查 ---------------- */
function buildTooling(chs){
  const blocks = [];
  chs.forEach(c => toolboxes(c.html).forEach(t => blocks.push({ ...t, ch: c })));

  const secs = blocks.map(t => `  <div class="toolbox">
    <div class="toolbox-head">
      <span class="t"><a href="chapters/${t.ch.slug}.html#tools">${t.ch.id} ${t.ch.zh}</a> · ${t.title}</span>
      <span class="date">${t.date}</span>
    </div>
    <div class="toolbox-body">
${t.items.map(i => '      <p><b>' + i.label + '</b>' + rebaseLinks(i.text) + '</p>').join('\n')}
    </div>
  </div>`).join('\n');

  const body = `<header class="book">
  <div class="kicker"><a href="index.html">← ${BOOK.zh}</a></div>
  <h1>Appendix C · Tooling<span class="zh">附录 C · 器具与仪器速查</span></h1>
  <p class="lede">共 ${blocks.length} 个工具层区块，由各章 <code>.toolbox</code> 聚合。<b>这一页会过期</b>——每块自带日期戳，正文的结论不依赖本页任何内容。器具只讲类型与原理，出现的品牌名仅作示例，不构成推荐。</p>
</header>

<section>
${secs}
</section>`;
  return page(`附录 C · 器具与仪器速查 · ${BOOK.zh}`, body, 0);
}

/* ---------------- 章节导航链 ---------------- */
function navBlock(i, chs){
  const prev = i > 0 ? chs[i - 1] : null;
  const next = i < chs.length - 1 ? chs[i + 1] : null;
  const left = prev ? `<a href="${prev.slug}.html">← ${prev.id} ${prev.zh}</a>`
                    : `<a href="../index.html">← 全书目录</a>`;
  const right = next ? `<a href="${next.slug}.html">${next.id} ${next.zh} →</a>`
                     : `<a href="../glossary.html">附录 A 术语表 →</a>`;
  return `<!-- nav:auto -->\n<nav class="next">\n  ${left}\n  ${right}\n</nav>\n<!-- /nav:auto -->`;
}

/* ---------------- 汇总 ---------------- */
export function generate(root){
  const chs = readChapters(root);
  const out = new Map();
  out.set('index.html', buildIndex(chs));
  out.set('glossary.html', buildGlossary(chs));
  out.set('diagnosis.html', buildDiagnosis(chs));
  out.set('tooling.html', buildTooling(chs));

  chs.forEach((c, i) => {
    if(!c.html) return;
    const re = /<!-- nav:auto -->[\s\S]*?<!-- \/nav:auto -->/;
    if(!re.test(c.html)) return;              /* 缺 nav 标记由 check.mjs 报错 */
    out.set(path.join('chapters', c.slug + '.html'), c.html.replace(re, navBlock(i, chs)));
  });
  return out;
}

const isCLI = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if(isCLI){
  const out = generate(ROOT);
  let n = 0;
  for(const [rel, content] of out){
    const abs = path.join(ROOT, rel);
    const old = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if(old !== content){ fs.writeFileSync(abs, content); n++; console.log('written  ' + rel); }
  }
  console.log(n ? `\n${n} 个文件已更新` : '\n全部已是最新');
}
