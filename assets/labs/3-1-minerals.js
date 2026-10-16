/* 3.1 硬度 × 碱度二维图
   两个轴各管一件事：
     硬度 GH（Ca²⁺/Mg²⁺，以 CaCO₃ 计）——参与结合风味分子，是「萃取的手」
     碱度 KH（HCO₃⁻，以 CaCO₃ 计）——中和酸，是「酸质的缓冲垫」
   分区阈值（参考带，非标准）：GH 50/150，KH 25/75
   坐标：x = 70 + GH/250×520（0–250 ppm），y = 320 − KH/200×280（0–200 ppm，高碱度在上） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var X0 = 70, XW = 520, GH_MAX = 250, Y0 = 320, YH = 280, KH_MAX = 200;

  var ZONES = {
    '00':['软而尖：单薄，酸无遮拦','硬度太低，杯子单薄；碱度也低，酸没有缓冲，尖锐而不稳定。这是纯净水直接冲煮的典型结果。'],
    '01':['软而平衡：清淡但结构完整','杯子偏薄，但酸质有基本缓冲。提高硬度通常能增加厚度与甜感。'],
    '02':['软而钝：又薄又平','硬度不足让杯子单薄，过高的碱度又把仅有的酸抹平——杯子发空、发钝，常被误判为「豆子不好」。'],
    '10':['理想硬度，缓冲不足','厚度合适，但酸感缺少缓冲，可能显得尖锐、边缘毛糙。适度提高碱度会让酸变得圆润。'],
    '11':['参考区','硬度足以让杯子饱满，碱度足以让酸质圆润而不被抹平。多数冲煮的舒适区。'],
    '12':['理想硬度，缓冲过度','厚度没问题，但碱度把酸压得太狠，明亮度与层次感损失，可能出现粉笔般的干感。'],
    '20':['硬而尖：厚重，酸无遮拦','高硬度让杯子厚重，苦涩也更容易显出（常归因于萃取增强，机制有争议）；缺少缓冲时酸与涩同时突出。'],
    '21':['硬而饱满：厚重但容易过头','body 明显，但苦涩也更容易显出；同时设备结垢风险上升。'],
    '22':['硬而钝：厚、平、有水垢风险','高硬度叠加高碱度：杯子厚重却缺少明亮度，长期使用还会在设备内结垢。典型的高矿物质自来水。']
  };

  function compute(p){
    var gz = p.gh < 50 ? 0 : p.gh <= 150 ? 1 : 2;
    var kz = p.kh < 25 ? 0 : p.kh <= 75 ? 1 : 2;
    var z = ZONES['' + gz + kz];
    return {
      cx: X0 + p.gh / GH_MAX * XW,
      cy: Y0 - p.kh / KH_MAX * YH,
      ghText: p.gh.toFixed(0) + ' ppm',
      khText: p.kh.toFixed(0) + ' ppm',
      ratioText: p.kh > 0 ? (p.gh / p.kh).toFixed(2) : '—',
      zone: z[0], advice: z[1]
    };
  }

  function paint(s, doc){
    var dot = doc.getElementById('wdot');
    dot.setAttribute('cx', s.cx);
    dot.setAttribute('cy', s.cy);
    doc.getElementById('vGh').textContent      = s.ghText;
    doc.getElementById('vKh').textContent      = s.khText;
    doc.getElementById('ratioOut').textContent = s.ratioText;
    doc.getElementById('zoneOut').textContent  = s.zone;
    doc.getElementById('advOut').textContent   = s.advice;
  }

  return {
    id: '3-1',
    defaults: { gh: 68, kh: 40 },
    controls: ['gh','kh'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        advOut: { text: s.advice },
        wdot: { cx: s.cx, cy: s.cy },
        vGh: { text: s.ghText }, vKh: { text: s.khText },
        ratioOut: { text: s.ratioText }, zoneOut: { text: s.zone }
      };
    }
  };
});
