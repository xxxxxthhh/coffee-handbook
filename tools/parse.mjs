/* 极小 HTML 取值工具：只服务于本仓库自己的标记约定，不是通用解析器。
   章节文件里的机读标记：
     <span class="term" data-term="EN" data-zh="中文" data-def="首次出现处才写定义">
     任意元素 data-diag="症状|最可能变量|调整方向"
     .toolbox 内 <p><b>条目</b>：说明</p> */

export function elById(html, id){
  const re = new RegExp('<([a-zA-Z]+)([^>]*\\bid="' + id + '"[^>]*)>([\\s\\S]*?)</\\1>');
  const m = html.match(re);
  if(!m) return null;
  return { tag: m[1], attrs: attrsOf(m[2]), inner: m[3] };
}

export function attrsOf(s){
  const out = {};
  const re = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while((m = re.exec(s))) out[m[1]] = m[2];
  return out;
}

/* 自闭合/无子节点元素（如 <circle id="dot" .../>）的属性 */
export function selfClosingById(html, id){
  const re = new RegExp('<([a-zA-Z]+)([^>]*\\bid="' + id + '"[^>]*?)/?>');
  const m = html.match(re);
  return m ? attrsOf(m[2]) : null;
}

function sectionAt(html, index){
  const re = /<section id="([^"]+)"/g;
  let m, cur = null;
  while((m = re.exec(html)) && m.index < index) cur = m[1];
  return cur;
}

export function terms(html){
  const out = [];
  const re = /<span class="term"([^>]*)>/g;
  let m;
  while((m = re.exec(html))){
    const a = attrsOf(m[1]);
    if(!a['data-term']) continue;
    out.push({
      en: a['data-term'],
      zh: a['data-zh'] || '',
      def: a['data-def'] || '',
      section: sectionAt(html, m.index)
    });
  }
  return out;
}

export function diags(html){
  const out = [];
  const re = /data-diag="([^"]+)"/g;
  let m;
  while((m = re.exec(html))){
    const p = m[1].split('|').map(s => s.trim());
    out.push({ symptom: p[0], variable: p[1] || '', fix: p[2] || '', raw: m[1] });
  }
  return out;
}

export function toolboxes(html){
  const out = [];
  const re = /<div class="toolbox">([\s\S]*?)<\/div>\s*<\/section>/g;
  let m;
  while((m = re.exec(html))){
    const block = m[1];
    const title = (block.match(/<span class="t">([\s\S]*?)<\/span>/) || [,''])[1];
    const date  = (block.match(/<span class="date">([\s\S]*?)<\/span>/) || [,''])[1];
    const items = [];
    const bodyM = block.match(/<div class="toolbox-body">([\s\S]*?)$/);
    if(bodyM){
      const ire = /<p><b>([\s\S]*?)<\/b>([\s\S]*?)<\/p>/g;
      let im;
      while((im = ire.exec(bodyM[1]))) items.push({ label: im[1], text: im[2] });
    }
    out.push({ title, date, items });
  }
  return out;
}

/* 把章节内的相对链接改写成从站点根出发（附录页在根目录） */
export function rebaseLinks(htmlFragment){
  return htmlFragment.replace(/href="([^"]+)"/g, (full, href) => {
    if(/^(https?:|#|mailto:)/.test(href)) return full;
    if(href.startsWith('../')) return 'href="' + href.slice(3) + '"';
    return 'href="chapters/' + href + '"';
  });
}

export function allHrefs(html){
  const out = [];
  const re = /(?:href|src)="([^"]+)"/g;
  let m;
  while((m = re.exec(html))) out.push(m[1]);
  return out;
}

/* 去掉 <script>/<style> 与全部标签，得到用于措辞检查的正文 */
export function visibleText(html){
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}
