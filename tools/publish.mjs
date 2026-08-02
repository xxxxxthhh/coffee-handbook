/* 发布：把可公开的文件复制到 dist/。用法：node tools/publish.mjs
   采用「白名单」而不是「排除清单」——QUALITY.md 横切面清单要求 reference/ 等内部目录
   不随部署发布，白名单的默认行为是「没列出的一律不发」，比排除清单更难漏。 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTERS, APPENDICES } from './manifest.mjs';
import { runChecks } from './check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const FILES = [
  'index.html',
  ...APPENDICES.map(a => a.file),
  ...CHAPTERS.map(c => 'chapters/' + c.slug + '.html'),
  'assets/handbook.css',
  'assets/theme.js',
  'assets/quiz.js',
  'assets/lab-core.js',
  ...CHAPTERS.map(c => 'assets/labs/' + c.lab + '.js')
];

const findings = runChecks(ROOT);
if(findings.length){
  console.error(`✗ 门禁未通过（${findings.length} 个问题），已中止发布。先跑 node tools/check.mjs`);
  process.exit(1);
}

fs.rmSync(DIST, { recursive: true, force: true });
for(const rel of FILES){
  const src = path.join(ROOT, rel);
  if(!fs.existsSync(src)){ console.error('✗ 缺少文件：' + rel); process.exit(1); }
  const dst = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

console.log(`✓ 已发布 ${FILES.length} 个文件到 dist/`);
console.log('  未发布：reference/、tools/、*.md、.claude/');
