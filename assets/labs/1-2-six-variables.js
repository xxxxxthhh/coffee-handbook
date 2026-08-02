/* 1.2 六大变量翻转卡片：正面「往哪个方向拧」，背面「机制 + 副作用」。
   卡片背面文案由本模块提供，页面里的静态文本必须与之一致（check.mjs 逐条比对），
   避免正文改了、卡片还在教旧结论。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var BACKS = {
    grind:'机制：磨细同时放大比表面积、缩短颗粒内扩散路径、抬高粉床阻力（接触时间被动拉长）——三条路都推高萃取率，所以杠杆最大。副作用：细粉占比上升，过萃与不足同时发生，杯感发涩；过细还会堵塞粉床。',
    temp:'机制：温度提高反应与扩散的速率常数，单位时间溶出更多。副作用：在配平萃取率之后，它的直接感官效应比常识小得多（见 0.3 章案例）——温度的多数功劳其实是通过萃取率兑现的。',
    time:'机制：沿溶出曲线向右移动，让慢的那批物质跟上来。副作用：回报递减且成分偏斜——酸与甜早已进入平台，后段的增量以苦涩为主。',
    ratio:'机制：改变水量主要改变浓度（TDS 的分母）；同时更多新鲜水维持了更大的浓度梯度，对萃取率有二阶的提升。副作用：最容易和「萃取充分」混为一谈——它调的是音量，不是音色。',
    agit:'机制：搅动减薄颗粒表面的边界层，提高传质系数，让溶出更快也更均匀。副作用：过度搅动会让细粉迁移、粉床板结甚至塌陷，流速失控，反而制造不均匀萃取。',
    water:'机制：钙镁离子参与结合风味分子，提升萃取效率；碳酸氢根缓冲酸度，改变你尝到的酸的强度。副作用：碱度过高会让杯子平板、发钝；硬度过高在设备上结垢。详见 Part 3。'
  };

  var FOCUS = {
    none:'',
    sour:'这杯太酸（萃取不足）：先动研磨度——磨细一档，三条机制一起把萃取率推上去。其次是延长接触时间。水温与搅动是次一级的旋钮。别先加粉：粉水比只调音量，你会得到一杯更浓但同样酸的咖啡。',
    bitter:'这杯太苦：先磨粗一档，其次缩短接触时间，再考虑略降水温。同时检查均匀度——如果苦里带明显的涩与干，多半不是「平均萃取过头」，而是细粉过萃与粗粒不足并存（见 1.1 与 1.4）。',
    weak:'这杯太淡：先分辨是音量问题还是音色问题。若同时发酸，是萃取不足，先磨细；若风味结构平衡、只是薄，那是浓度问题，提高粉水比（多放粉或少加水）。这一步的判断工具是 1.3 的控制图。'
  };

  var ORDER = ['grind','temp','time','ratio','agit','water'];

  function compute(p){
    return { backs: BACKS, focus: FOCUS[p.focus] || '', focusKey: p.focus };
  }

  function paint(s, doc){
    ORDER.forEach(function(k){
      var el = doc.getElementById('cb-' + k);
      if(el) el.textContent = s.backs[k];
    });
    var out = doc.getElementById('focusOut');
    out.textContent = s.focus;
    out.style.display = s.focus ? 'block' : 'none';
    doc.querySelectorAll('.card').forEach(function(c){
      c.classList.toggle('hit', s.focusKey !== 'none' && c.getAttribute('data-hit') === s.focusKey);
    });
  }

  return {
    id: '1-2',
    defaults: { focus: 'none' },
    compute: compute,
    paint: paint,
    init: function(doc){
      doc.querySelectorAll('.card').forEach(function(c){
        c.addEventListener('click', function(){ c.classList.toggle('flipped'); });
      });
    },
    onReset: function(doc){
      doc.querySelectorAll('.card').forEach(function(c){ c.classList.remove('flipped'); });
    },
    expect: function(s){
      return {
        focusOut: { text: s.focus },
        'cb-grind': { text: s.backs.grind },
        'cb-temp':  { text: s.backs.temp },
        'cb-time':  { text: s.backs.time },
        'cb-ratio': { text: s.backs.ratio },
        'cb-agit':  { text: s.backs.agit },
        'cb-water': { text: s.backs.water }
      };
    }
  };
});
