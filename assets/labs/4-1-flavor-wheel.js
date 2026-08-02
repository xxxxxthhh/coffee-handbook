/* 4.1 简化风味轮：六个大类，点开看子类与参照样本
   几何：圆心 (160,160)，内径 55、外径 125，六等分，从 −90° 起顺时针每 60° 一块。
   扇形路径由本模块生成，页面里的静态 d 属性必须与之逐字一致（check.mjs 会比对）。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var CX = 160, CY = 160, R_IN = 55, R_OUT = 125;

  var CATS = [
    { key:'fruity', short:'果香', name:'果香 Fruity',
      subs:'浆果（草莓、蓝莓）· 核果（桃、杏）· 柑橘（柠檬、橙）· 热带（芒果、菠萝）· 干果（葡萄干、枣）',
      refs:'切开的新鲜水果本身就是参照样本。练法：泡一杯淡红茶，分别滴几滴柠檬汁与橙汁，记住两者「酸的形状」不同。',
      confuse:'最常与「发酵」混淆：熟透的果香与轻微过发酵只隔一线，区别在于后者常伴随酒精感或醋酸的刺激。' },
    { key:'floral', short:'花香', name:'花香 Floral',
      subs:'茉莉 · 玫瑰 · 洋甘菊 · 红茶般的花香 · 桂花',
      refs:'干花茶是最方便的参照：分别冲一杯茉莉花茶与洋甘菊茶，闻香时的差异比在咖啡里辨认容易得多。',
      confuse:'花香常被并入「果香」笼统描述。它更轻、更挥发，通常在杯子稍凉、香气释放后更清楚。' },
    { key:'sweet', short:'甜感', name:'甜感 Sweet',
      subs:'蜂蜜 · 红糖 · 香草 · 枫糖 · 整体的「甜印象」',
      refs:'在无糖的淡咖啡里分别加入极少量蜂蜜与红糖，记住两种甜的尾韵差异。注意目标不是学会加糖，而是把「甜」这个词锚定到具体样本上。',
      confuse:'咖啡里的甜多半是香气与低苦度共同给出的印象，而不是真的含大量糖（见 2.1 章）。所以「甜」经常在苦度下降时「凭空出现」。' },
    { key:'nutty', short:'坚果', name:'坚果与可可 Nutty / Cocoa',
      subs:'杏仁 · 花生 · 榛子 · 可可粉 · 黑巧克力',
      refs:'原味坚果与无糖可可粉。把可可粉的干香与黑巧克力的入口感分开记：前者是香气，后者带苦与油脂。',
      confuse:'与「烘焙类」相邻：坚果味偏干香，烘焙味偏焦。烘得越深，前者越容易滑向后者。' },
    { key:'roasted', short:'烘焙', name:'焦糖与烘焙 Roasted',
      subs:'焦糖 · 烤面包 · 烟熏 · 焦苦 · 麦芽',
      refs:'烤过头一分钟的吐司边缘，就是「焦」的标准样本。把它和焦糖（糖加热到浅褐）分开尝一次。',
      confuse:'深烘咖啡的这一类风味会盖过产地特征，容易被误读成「豆子品质」——其实是烘焙层的选择（见 2.2 章）。' },
    { key:'fermented', short:'发酵', name:'酸与发酵 Sour / Fermented',
      subs:'醋酸 · 酒精感 · 酸奶般的乳酸 · 过熟水果 · 药感',
      refs:'一小杯苹果醋兑水，记住醋酸的刺激；再尝一口原味酸奶，记住乳酸的圆润。两者都是「酸」，形状完全不同。',
      confuse:'与果香的边界最模糊，也最容易被当成缺陷或特色的分水岭。判断依据是它是否带来刺激感与持久的不适。' }
  ];

  function pt(ang, r){
    var a = ang * Math.PI / 180;
    return [(CX + r * Math.cos(a)).toFixed(1), (CY + r * Math.sin(a)).toFixed(1)];
  }

  function sectorPath(i){
    var a0 = -90 + i * 60, a1 = a0 + 60;
    var p1 = pt(a0, R_OUT), p2 = pt(a1, R_OUT), p3 = pt(a1, R_IN), p4 = pt(a0, R_IN);
    return 'M' + p1[0] + ',' + p1[1] +
           ' A' + R_OUT + ',' + R_OUT + ' 0 0 1 ' + p2[0] + ',' + p2[1] +
           ' L' + p3[0] + ',' + p3[1] +
           ' A' + R_IN + ',' + R_IN + ' 0 0 0 ' + p4[0] + ',' + p4[1] + ' Z';
  }

  function labelPos(i){ return pt(-90 + i * 60 + 30, (R_IN + R_OUT) / 2); }

  function compute(p){
    var i = 0;
    for(var k = 0; k < CATS.length; k++) if(CATS[k].key === p.cat) i = k;
    var c = CATS[i];
    return { index:i, name:c.name, subs:c.subs, refs:c.refs, confuse:c.confuse,
             paths: CATS.map(function(_, j){ return sectorPath(j); }),
             labels: CATS.map(function(_, j){ return labelPos(j); }) };
  }

  function paint(s, doc){
    for(var i = 0; i < 6; i++){
      doc.getElementById('sec' + i).setAttribute('fill-opacity', i === s.index ? 0.85 : 0.18);
    }
    doc.getElementById('catName').textContent    = s.name;
    doc.getElementById('catSubs').textContent    = s.subs;
    doc.getElementById('catRefs').textContent    = s.refs;
    doc.getElementById('catConfuse').textContent = s.confuse;
    doc.querySelectorAll('.picker button[data-cat]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-cat') === CATS[s.index].key);
    });
  }

  return {
    id: '4-1',
    defaults: { cat: 'fruity' },
    compute: compute,
    paint: paint,
    init: function(doc, api){
      doc.querySelectorAll('.picker button[data-cat]').forEach(function(b){
        b.addEventListener('click', function(){ api.set('cat', b.getAttribute('data-cat')); });
      });
      doc.querySelectorAll('path[data-cat]').forEach(function(p){
        p.addEventListener('click', function(){ api.set('cat', p.getAttribute('data-cat')); });
      });
    },
    expect: function(s){
      var out = {
        catName: { text: s.name }, catSubs: { text: s.subs }, catConfuse: { text: s.confuse },
        sec0: { 'fill-opacity': 0.85 }, sec3: { 'fill-opacity': 0.18 }
      };
      s.paths.forEach(function(d, i){ out['sec' + i] = out['sec' + i] || {}; out['sec' + i].d = d; });
      return out;
    }
  };
});
