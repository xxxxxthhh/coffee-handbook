/* 程序化门禁。用法：node tools/check.mjs
   每条规则有稳定 rule id；tools/mutate.mjs 逐条注入违规，验证对应 rule 真的会红
   （QUALITY.md 第 3 条：没做过 mutation test 的门禁，其「0 错误」不作数）。 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, APPENDICES } from './manifest.mjs';
import { generate } from './build.mjs';
import { elById, selfClosingById, attrsOf, terms, diags, toolboxes, allHrefs, visibleText } from './parse.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const ABSOLUTE_WORDS = ['最可靠','完全无','一定会','唯一','永远','绝对','万能','必然','一劳永逸','任何情况下','所有人都','毫无疑问','百分之百'];
const HEALTH_WORDS   = ['摄入量','建议摄入','有益健康','对身体好','戒断','心悸','失眠','每日上限','保健'];
const BRANDS = ['Hario','V60','Chemex','AeroPress','Aeropress','Kalita','VST','DiFluid','Comandante','EK43','Fellow','Baratza','Breville','Marzocco','Kinu','1Zpresso','Third Wave Water','Melitta','Bialetti','Moccamaster','Timemore','Acaia','Atago','Ditting','Mahlkönig','Mahlkonig','Niche','Wilfa'];
const ALLOWED_HOSTS = ['fonts.googleapis.com','fonts.gstatic.com'];

export function runChecks(root){
  const out = [];
  const add = (rule, file, msg) => out.push({ rule, file, msg });
  const req = createRequire(path.join(root, 'tools', 'x.cjs'));

  const allowFile = path.join(root, 'tools', 'wording-allowlist.json');
  const allow = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, 'utf8')) : [];
  const allowed = (rule, file, phrase) =>
    allow.some(a => a.rule === rule && a.file === file && a.phrase === phrase);

  /* ---------- 1. 清单与文件双向一致 ---------- */
  const chDir = path.join(root, 'chapters');
  const onDisk = fs.existsSync(chDir) ? fs.readdirSync(chDir).filter(f => f.endsWith('.html')).sort() : [];
  const declared = CHAPTERS.map(c => c.slug + '.html').sort();
  declared.filter(f => !onDisk.includes(f)).forEach(f =>
    add('count/manifest-vs-files', 'chapters/' + f, 'manifest 声明了此章，但文件不存在'));
  onDisk.filter(f => !declared.includes(f)).forEach(f =>
    add('count/manifest-vs-files', 'chapters/' + f, '文件存在，但 manifest 未声明'));

  /* ---------- 2. 生成页未漂移 ---------- */
  for(const [rel, content] of generate(root)){
    const abs = path.join(root, rel);
    const disk = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if(disk !== content) add('build/stale-generated', rel, '与 tools/build.mjs 的推导结果不一致，请运行 node tools/build.mjs');
  }

  /* ---------- 收集全部待检页面 ---------- */
  const pages = [];
  for(const c of CHAPTERS){
    const rel = 'chapters/' + c.slug + '.html';
    const abs = path.join(root, rel);
    if(fs.existsSync(abs)) pages.push({ rel, abs, html: fs.readFileSync(abs, 'utf8'), ch: c });
  }
  for(const rel of ['index.html', ...APPENDICES.map(a => a.file)]){
    const abs = path.join(root, rel);
    if(fs.existsSync(abs)) pages.push({ rel, abs, html: fs.readFileSync(abs, 'utf8'), ch: null });
  }

  /* 站内 id 表，供锚点检查 */
  const ids = new Map();
  pages.forEach(p => ids.set(p.rel, new Set([...p.html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))));

  /* ---------- 3. 逐页检查 ---------- */
  for(const p of pages){
    const { rel, html, ch } = p;

    /* 3a. 章节五要素 */
    if(ch){
      ['guess','concept','lab','case','quiz'].forEach(s => {
        if(!html.includes(`<section id="${s}"`)) add('structure/section', rel, `缺少五要素区块 <section id="${s}">`);
      });
      const quizBlock = (html.match(/<div class="quiz">([\s\S]*?)<\/section>/) || [,''])[1];
      const qn = (quizBlock.match(/<details>/g) || []).length;
      if(qn < 3 || qn > 4) add('structure/quiz', rel, `quiz 题数 ${qn}，要求 3–4 题`);
      const qtypes = new Set([...quizBlock.matchAll(/<span class="qtype">([^<]+)<\/span>/g)].map(m => m[1]));
      if(qtypes.size < 2) add('structure/quiz', rel, `quiz 题型只有 ${qtypes.size} 种，要求混合题型`);
      const guessBlock = (html.match(/<div class="guess"[\s\S]*?<\/div>\s*<\/section>/) || [''])[0];
      if((guessBlock.match(/<button/g) || []).length < 2) add('structure/guess', rel, '先猜一次至少需要 2 个选项');
      if(!/<!-- nav:auto -->/.test(html)) add('structure/nav-marker', rel, '缺少 <!-- nav:auto --> 导航标记');

      /* 3b. 资源引用 */
      ['../assets/handbook.css','../assets/theme.js','../assets/quiz.js','../assets/lab-core.js',
       `../assets/labs/${ch.lab}.js`].forEach(a => {
        if(!html.includes(a)) add('head/assets', rel, `未引用共享资源 ${a}`);
      });
      if(!html.includes('class="theme-toggle"')) add('head/assets', rel, '缺少 dark mode 切换按钮');
      if(!html.includes('name="viewport"')) add('head/assets', rel, '缺少 viewport meta');

      /* 3c. 交互实验 */
      const presets = (html.match(/<button data-p="[^"]*"/g) || []).length;
      if(presets < 2 || presets > 3) add('lab/presets', rel, `预设按钮 ${presets} 个，要求 2–3 个`);
      const labDivs = html.match(/<div class="lab"[^>]*>/g) || [];
      if(labDivs.length === 0) add('lab/presets', rel, '缺少交互实验区块');
      labDivs.forEach(d => { if(!/data-print-note="/.test(d)) add('lab/print-note', rel, '交互实验缺少 data-print-note（打印降级说明）'); });

      /* 3d. 交互模块独立重算：Node 侧 compute(defaults) 必须等于页面写死的静态快照 */
      const labAbs = path.join(root, 'assets', 'labs', ch.lab + '.js');
      if(!fs.existsSync(labAbs)) add('lab/module', rel, `缺少交互模块 assets/labs/${ch.lab}.js`);
      else {
        let mod = null;
        try { mod = req(labAbs); } catch(e){ add('lab/module', rel, 'lab 模块无法在 Node 中加载：' + e.message); }
        if(mod){
          if(mod.id !== ch.id.replace('.','-')) add('lab/module', rel, `lab 模块 id "${mod.id}" 与章节 ${ch.id} 不符`);
          ['defaults','compute','paint','expect'].forEach(k => {
            if(!mod[k]) add('lab/module', rel, `lab 模块缺少导出 ${k}`);
          });
          if(mod.defaults && mod.compute && mod.expect){
            const state = mod.compute(mod.defaults);
            const exp = mod.expect(state);
            for(const [id, want] of Object.entries(exp)){
              const el = elById(html, id);
              const sc = selfClosingById(html, id);
              if(!el && !sc){ add('lab/snapshot', rel, `页面缺少 id="${id}" 元素`); continue; }
              if(want.text !== undefined){
                const got = (el ? el.inner : '').replace(/<[^>]+>/g, '').trim();
                if(got !== String(want.text))
                  add('lab/snapshot', rel, `#${id} 静态文本 "${got}" ≠ 默认参数重算结果 "${want.text}"`);
              }
              for(const [k, v] of Object.entries(want)){
                if(k === 'text') continue;
                const attrs = sc || (el && el.attrs) || {};
                const got = parseFloat(attrs[k]);
                if(!(Math.abs(got - v) < 0.2))
                  add('lab/snapshot', rel, `#${id} 的 ${k}="${attrs[k]}" ≠ 默认参数重算结果 ${Number(v).toFixed(2)}`);
              }
            }
            (mod.controls || []).forEach(id => {
              const a = selfClosingById(html, id);
              if(!a){ add('lab/control-default', rel, `缺少控件 id="${id}"`); return; }
              if(parseFloat(a.value) !== mod.defaults[id])
                add('lab/control-default', rel, `控件 #${id} value="${a.value}" ≠ 模块默认值 ${mod.defaults[id]}`);
              if(a.min !== undefined && a.max !== undefined){
                const d = mod.defaults[id];
                if(d < parseFloat(a.min) || d > parseFloat(a.max))
                  add('lab/control-default', rel, `控件 #${id} 默认值 ${d} 不在 [${a.min}, ${a.max}] 内`);
              }
            });
          }
        }
      }

      /* 3e. 案例来源 */
      const cases = (html.match(/<div class="case">/g) || []).length;
      const srcs  = (html.match(/<div class="src">/g) || []).length;
      if(cases === 0) add('case/source', rel, '缺少真实案例区块');
      if(srcs < cases) add('case/source', rel, `案例 ${cases} 个，来源行 ${srcs} 条——每个案例必须写来源`);
    }

    /* 3f. 工具层日期戳 */
    toolboxes(html).forEach(t => {
      if(!/^截至 \d{4}-\d{2}$/.test(t.date.trim()))
        add('tools/date-stamp', rel, `工具层日期戳格式错误："${t.date}"，要求「截至 YYYY-MM」`);
    });

    /* 3g. 色值与依赖红线 */
    const scrubbed = html.replace(/href="#[^"]*"/g, '').replace(/url\(#[^)]*\)/g, '');
    const hex = scrubbed.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(|hsla?\(/g);
    if(hex) add('style/hardcoded-color', rel, `出现写死色值 ${[...new Set(hex)].join(', ')}——一律走 CSS 变量`);
    [...html.matchAll(/\b(fill|stroke)="([^"]+)"/g)].forEach(m => {
      if(!/^(var\(|none|transparent|currentColor|url\()/.test(m[2]))
        add('style/hardcoded-color', rel, `SVG ${m[1]}="${m[2]}" 未走 CSS 变量`);
    });
    if(/localStorage|sessionStorage/.test(html)) add('deps/storage', rel, '禁止使用 localStorage/sessionStorage');
    [...html.matchAll(/(?:href|src)="https?:\/\/([^/"]+)/g)].forEach(m => {
      if(!ALLOWED_HOSTS.includes(m[1])) add('deps/external', rel, `外部依赖 ${m[1]}——除字体 CDN 外禁止`);
    });

    /* 3h. 写作红线：措辞、品牌、健康 */
    const text = visibleText(html);
    ABSOLUTE_WORDS.forEach(w => {
      if(text.includes(w) && !allowed('wording/absolute', rel, w))
        add('wording/absolute', rel, `绝对化措辞「${w}」——降级为有条件表述，或写入 tools/wording-allowlist.json 并说明理由`);
    });
    HEALTH_WORDS.forEach(w => {
      if(text.includes(w) && !allowed('redline/health', rel, w))
        add('redline/health', rel, `健康类措辞「${w}」——本书不给健康建议`);
    });
    const outsideToolbox = visibleText(html.replace(/<div class="toolbox">[\s\S]*?<\/div>\s*<\/section>/g, ' '));
    BRANDS.forEach(b => {
      if(outsideToolbox.includes(b) && !allowed('redline/brand', rel, b))
        add('redline/brand', rel, `品牌名「${b}」出现在工具层之外——正文只讲器具类型与原理`);
    });

    /* 3i. 链接可抵达 */
    allHrefs(html).forEach(h => {
      if(/^(https?:|mailto:|data:)/.test(h)) return;
      if(h.startsWith('reference/') || h.includes('/reference/'))
        add('link/reference-dir', rel, `链接指向内部目录 ${h}——reference/ 不随部署发布`);
      const [file, anchor] = h.split('#');
      const targetRel = file
        ? path.normalize(path.join(path.dirname(rel), file)).replace(/\\/g, '/')
        : rel;
      if(file && !fs.existsSync(path.join(root, targetRel))){
        add('link/dead', rel, `死链：${h}`);
        return;
      }
      if(anchor){
        const set = ids.get(targetRel);
        if(set && !set.has(anchor)) add('link/dead', rel, `锚点不存在：${h}`);
      }
    });
  }

  /* ---------- 3j. 交互模块里的可见文案同样受红线约束 ---------- */
  const labDir = path.join(root, 'assets', 'labs');
  if(fs.existsSync(labDir)){
    for(const f of fs.readdirSync(labDir).filter(f => f.endsWith('.js'))){
      const rel = 'assets/labs/' + f;
      const src = fs.readFileSync(path.join(labDir, f), 'utf8');
      ABSOLUTE_WORDS.forEach(w => {
        if(src.includes(w) && !allowed('wording/absolute', rel, w))
          add('wording/absolute', rel, `交互文案里的绝对化措辞「${w}」`);
      });
      HEALTH_WORDS.forEach(w => {
        if(src.includes(w) && !allowed('redline/health', rel, w))
          add('redline/health', rel, `交互文案里的健康类措辞「${w}」`);
      });
      BRANDS.forEach(b => {
        if(src.includes(b) && !allowed('redline/brand', rel, b))
          add('redline/brand', rel, `交互文案里的品牌名「${b}」——正文与交互只讲器具类型`);
      });
      const hex = src.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(|hsla?\(/g);
      if(hex) add('style/hardcoded-color', rel, `交互模块里写死色值 ${[...new Set(hex)].join(', ')}`);
      if(/localStorage|sessionStorage/.test(src)) add('deps/storage', rel, '禁止使用 localStorage/sessionStorage');
    }
  }

  /* ---------- 4. 术语定义唯一且在首次出现处 ---------- */
  const firstSeen = new Map(), defCount = new Map();
  for(const c of CHAPTERS){
    const p = pages.find(x => x.ch === c);
    if(!p) continue;
    terms(p.html).forEach(t => {
      if(!firstSeen.has(t.en)) firstSeen.set(t.en, p.rel);
      if(t.def){
        defCount.set(t.en, (defCount.get(t.en) || 0) + 1);
        if(firstSeen.get(t.en) !== p.rel)
          add('glossary/def-once', p.rel, `术语「${t.en}」的 data-def 不在首次出现的章节（首见于 ${firstSeen.get(t.en)}）`);
      }
    });
  }
  for(const [en, file] of firstSeen){
    const n = defCount.get(en) || 0;
    if(n !== 1) add('glossary/def-once', file, `术语「${en}」有 ${n} 处 data-def，要求恰好 1 处（写在首次出现处）`);
  }

  /* ---------- 5. 诊断卡标记格式 ---------- */
  for(const p of pages){
    if(!p.ch) continue;
    diags(p.html).forEach(d => {
      if(!d.symptom || !d.variable || !d.fix)
        add('diag/format', p.rel, `data-diag="${d.raw}" 格式应为「症状|最可能变量|调整方向」`);
    });
  }

  return out;
}

const isCLI = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if(isCLI){
  const root = path.resolve(HERE, '..');
  const findings = runChecks(root);
  if(!findings.length){ console.log('✓ 门禁通过：0 错误'); process.exit(0); }
  const byRule = new Map();
  findings.forEach(f => byRule.set(f.rule, (byRule.get(f.rule) || []).concat(f)));
  for(const [rule, list] of [...byRule].sort()){
    console.log(`\n● ${rule}  (${list.length})`);
    list.forEach(f => console.log(`   ${f.file}: ${f.msg}`));
  }
  console.log(`\n✗ 共 ${findings.length} 个问题`);
  process.exit(1);
}
