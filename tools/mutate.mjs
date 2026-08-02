/* mutation test：对门禁本身的门禁。用法：node tools/mutate.mjs
   每行 = 一条「注入的违规 → 期望触发的 rule id」。
   只判断 exit code 非零是不够的——注入 A 却触发了 B 也会给出假绿灯，
   所以这里逐条断言「该 rule 出现在新增 findings 中」（QUALITY.md 第 3 条）。 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from './check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CH = 'chapters/1-3-control-chart.html';

const edit = (rel, from, to) => (tmp) => {
  const abs = path.join(tmp, rel);
  const s = fs.readFileSync(abs, 'utf8');
  if(!s.includes(from)) throw new Error(`mutation 目标文本未找到于 ${rel}: ${from.slice(0, 40)}`);
  fs.writeFileSync(abs, s.replace(from, to));
};

const MUTATIONS = [
  { name: '删掉真实案例区块的 section 标记', rule: 'structure/section',
    apply: edit(CH, '<section id="case">', '<section id="case-removed">') },

  { name: 'quiz 只剩 2 题', rule: 'structure/quiz',
    apply: (tmp) => {
      const abs = path.join(tmp, CH);
      let s = fs.readFileSync(abs, 'utf8');
      for(let i = 0; i < 2; i++) s = s.replace(/<details>[\s\S]*?<\/details>/, '');
      fs.writeFileSync(abs, s);
    } },

  { name: '先猜一次只剩 1 个选项', rule: 'structure/guess',
    apply: (tmp) => {
      const abs = path.join(tmp, CH);
      const s = fs.readFileSync(abs, 'utf8')
        .replace('<button data-g="rel">相关，但不是一回事</button>', '')
        .replace('<button data-g="no">完全无关的两码事</button>', '');
      fs.writeFileSync(abs, s);
    } },

  { name: '章节不引用 lab-core.js', rule: 'head/assets',
    apply: edit(CH, '<script src="../assets/lab-core.js"></script>', '') },

  { name: '预设按钮只剩 1 个', rule: 'lab/presets',
    apply: (tmp) => {
      const abs = path.join(tmp, CH);
      let s = fs.readFileSync(abs, 'utf8');
      s = s.replace(/<button data-p="ratio=17,ey=16">[^<]*<\/button>/, '')
           .replace(/<button data-p="ratio=13,ey=23">[^<]*<\/button>/, '');
      fs.writeFileSync(abs, s);
    } },

  { name: '交互实验缺打印降级说明', rule: 'lab/print-note',
    apply: edit(CH, ' data-print-note="', ' data-printnote="') },

  { name: '把落点改回样章那个错误坐标 cy=257.8', rule: 'lab/snapshot',
    apply: edit(CH, 'cy="229.9"', 'cy="257.8"') },

  { name: '滑块默认值与模块 defaults 不符', rule: 'lab/control-default',
    apply: edit(CH, 'id="ratio" min="12" max="20" step="0.5" value="16.5"',
                    'id="ratio" min="12" max="20" step="0.5" value="15"') },

  { name: '案例删掉来源行', rule: 'case/source',
    apply: edit(CH, '<div class="src">', '<div class="src-removed">') },

  { name: '工具层日期戳格式被改坏', rule: 'tools/date-stamp',
    apply: edit(CH, '截至 2026-08', '2026年8月') },

  { name: 'SVG 里写死色值', rule: 'style/hardcoded-color',
    apply: edit(CH, 'fill="var(--accent)" opacity="0.16"', 'fill="#B06A28" opacity="0.16"') },

  { name: '交互用了 localStorage', rule: 'deps/storage',
    apply: edit(CH, '<script src="../assets/theme.js"></script>',
                    '<script>localStorage.setItem("ey", 20)</script>') },

  { name: '引入外部 CDN', rule: 'deps/external',
    apply: edit(CH, '<script src="../assets/quiz.js"></script>',
                    '<script src="https://cdn.example.com/chart.js"></script>') },

  { name: '正文出现绝对化措辞', rule: 'wording/absolute',
    apply: edit(CH, '诊断先于调参', '这是唯一正确的诊断顺序') },

  { name: '正文给出摄入建议', rule: 'redline/health',
    apply: edit(CH, '诊断先于调参', '控制每日摄入量的前提下，诊断先于调参') },

  { name: '正文出现品牌名', rule: 'redline/brand',
    apply: edit(CH, '一杯手冲又淡又酸', '一杯 Hario 手冲又淡又酸') },

  { name: '章节交叉引用指向不存在的文件', rule: 'link/dead',
    apply: edit(CH, 'href="1-4-espresso-pressure.html"', 'href="1-4-espresso.html"') },

  { name: '页面链接进 reference/ 内部目录', rule: 'link/reference-dir',
    apply: edit(CH, '<div class="wrap">',
                    '<div class="wrap"><a href="../reference/chapter-1-3-control-chart-sample.html">样章</a>') },

  { name: '术语缺定义（术语表会漏条）', rule: 'glossary/def-once',
    apply: edit(CH, ' data-def="Total Dissolved Solids，杯中液体里咖啡物质所占的质量百分比。决定风味的「音量」——淡还是浓。"', '') },

  { name: '诊断卡标记字段缺失', rule: 'diag/format',
    apply: edit(CH, 'data-diag="又淡又酸|萃取率（研磨度/水温/时间）|磨细一档：落点同时右移、上移，一个动作修两个症状；别先加粉"',
                    'data-diag="又淡又酸"') },

  { name: '手改生成页（目录页）', rule: 'build/stale-generated',
    apply: edit('index.html', '<p class="lede">', '<p class="lede">手改的一句话。') },

  { name: 'chapters/ 里多出未登记的文件', rule: 'count/manifest-vs-files',
    apply: (tmp) => fs.writeFileSync(path.join(tmp, 'chapters', '9-9-stray.html'), '<html></html>') },

  { name: '章节缺少 nav:auto 标记（导航链不再被生成）', rule: 'structure/nav-marker',
    apply: edit(CH, '<!-- nav:auto -->', '<!-- nav -->') },

  { name: 'expect() 漏掉 paint() 会改写的诊断文案', rule: 'lab/expect-coverage',
    apply: edit('assets/labs/1-3-control-chart.js', '        zoneOut: { text: s.zone },\n', '') },

  { name: 'theme.js 不再在打印前强制浅色', rule: 'print/force-light',
    apply: edit('assets/theme.js', "window.addEventListener('beforeprint'", "window.addEventListener('noop'") },

  { name: '打印样式退回只写 html 选择器', rule: 'print/force-light',
    apply: edit('assets/handbook.css', 'html,\n  html[data-theme],\n  html:not([data-theme="light"]){', 'html{') },

  { name: '交互模块文件丢失', rule: 'lab/module',
    apply: (tmp) => fs.unlinkSync(path.join(tmp, 'assets', 'labs', '1-3-control-chart.js')) }
];

function snapshot(root){
  return new Set(runChecks(root).map(f => `${f.rule}|${f.file}|${f.msg}`));
}

const base = snapshot(ROOT);
let pass = 0, fail = 0;

for(const m of MUTATIONS){
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cofmut-'));
  fs.cpSync(ROOT, tmp, { recursive: true, filter: (src) => !src.includes('/.git') });
  let fired = [], err = null;
  try {
    m.apply(tmp);
    fired = runChecks(tmp).filter(f => !base.has(`${f.rule}|${f.file}|${f.msg}`));
  } catch(e){ err = e; }
  fs.rmSync(tmp, { recursive: true, force: true });

  const rules = new Set(fired.map(f => f.rule));
  if(err){ console.log(`✗ ${m.rule.padEnd(26)} ${m.name} —— mutation 无法应用：${err.message}`); fail++; }
  else if(rules.has(m.rule)){ console.log(`✓ ${m.rule.padEnd(26)} ${m.name}`); pass++; }
  else { console.log(`✗ ${m.rule.padEnd(26)} ${m.name} —— 未触发；实际新增：${[...rules].join(', ') || '（无）'}`); fail++; }
}

console.log(`\n${pass} 条通过，${fail} 条失败（共 ${MUTATIONS.length} 条规则）`);
process.exit(fail ? 1 : 0);
