/* 3.2 母液配水计算器（化学换算真实可核对）
   母液 A：4 g 七水硫酸镁 MgSO₄·7H₂O（M = 246.47 g/mol）溶于 1 L 水
     4 ÷ 246.47 × 1000 = 16.229 mmol/L Mg²⁺
     以 CaCO₃ 计（M = 100.09 g/mol）：16.229 × 100.09 = 1624.3 ppm 硬度
   母液 B：4 g 碳酸氢钠 NaHCO₃（M = 84.007 g/mol）溶于 1 L 水
     4 ÷ 84.007 × 1000 = 47.615 mmol/L HCO₃⁻
     碱度以 CaCO₃ 计（1 mmol ≙ 50.04 mg CaCO₃）：47.615 × 50.04 = 2382.7 ppm
   取 a mL 母液 A + b mL 母液 B 加入 1 L 零矿物质水：
     GH = 1624.3 × a/1000，KH = 2382.7 × b/1000
   图上坐标与 3.1 章共用同一套映射：x = 70 + GH/250×520，y = 320 − KH/200×280 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var GH_STOCK = 4 / 246.47 * 1000 * 100.09;
  var KH_STOCK = 4 / 84.007 * 1000 * 50.04;
  var X0 = 70, XW = 520, GH_MAX = 250, Y0 = 320, YH = 280, KH_MAX = 200;

  function axisLabel(v, lo, hi){ return v < lo ? '偏低' : v > hi ? '偏高' : '参考带内'; }

  function advise(gh, kh){
    var g = axisLabel(gh, 50, 150), k = axisLabel(kh, 25, 75);
    if(g === '参考带内' && k === '参考带内')
      return '两个轴都在参考带内。把这组配比记下来当基准水，以后调豆子、调参数时它就是不动的那个变量。';
    if(g === '偏低' && k === '偏低')
      return '接近零矿物质：酸无缓冲，杯子会薄而尖。两种母液都要加——先补硬度，再用碱度把酸修圆。';
    if(g === '偏低')
      return '硬度不够：杯子偏薄。增加母液 A（硫酸镁），碱度先别动。';
    if(k === '偏高')
      return '碱度过高：酸质会被抹平，杯子发闷发钝。减少母液 B（碳酸氢钠）——这是自配水最容易加多的一项。';
    if(k === '偏低')
      return '碱度偏低：酸感直接而尖锐，容易不稳定。少量增加母液 B，一次 2–3 mL 地试。';
    return '硬度偏高：厚度上来了，但苦涩也更容易显出（常归因于萃取增强，机制有争议）。减少母液 A，或用零矿物质水稀释。';
  }

  function compute(p){
    var gh = GH_STOCK * p.a / 1000;
    var kh = KH_STOCK * p.b / 1000;
    return {
      cx: X0 + Math.min(gh, GH_MAX) / GH_MAX * XW,
      cy: Y0 - Math.min(kh, KH_MAX) / KH_MAX * YH,
      aText: p.a + ' mL', bText: p.b + ' mL',
      ghText: gh.toFixed(1) + ' ppm', khText: kh.toFixed(1) + ' ppm',
      ghState: axisLabel(gh, 50, 150), khState: axisLabel(kh, 25, 75),
      advice: advise(gh, kh)
    };
  }

  function paint(s, doc){
    var dot = doc.getElementById('rdot');
    dot.setAttribute('cx', s.cx);
    dot.setAttribute('cy', s.cy);
    doc.getElementById('vA').textContent    = s.aText;
    doc.getElementById('vB').textContent    = s.bText;
    doc.getElementById('ghOut').textContent = s.ghText;
    doc.getElementById('khOut').textContent = s.khText;
    doc.getElementById('stateOut').textContent = '硬度' + s.ghState + ' · 碱度' + s.khState;
    doc.getElementById('advOut').textContent   = s.advice;
  }

  return {
    id: '3-2',
    defaults: { a: 42, b: 17 },
    controls: ['a','b'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        advOut: { text: s.advice },
        rdot: { cx: s.cx, cy: s.cy },
        vA: { text: s.aText }, vB: { text: s.bText },
        ghOut: { text: s.ghText }, khOut: { text: s.khText },
        stateOut: { text: '硬度' + s.ghState + ' · 碱度' + s.khState }
      };
    }
  };
});
