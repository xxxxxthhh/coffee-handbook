/* 4.3 温度如何改写同一杯咖啡的读数
   示意模型（形状取自感官研究的定性结论，不是某项研究的拟合曲线）：
     甜感   S(T) = 100·e^(−((T−45)/30)²)      —— 温热时最强，过烫或变冷都下降
     苦感   B(T) = 100 ÷ (1 + e^(−(T−50)/15)) —— 随温度升高而增强
     酸感   A(T) = 70 − 0.1·(T−45)            —— 受温度影响最小，近乎平坦
     相对酸度 = A ÷ (S + B + A)               —— 「凉了更酸」的量化表达
   坐标：条形起点 x = 140，满幅 420 对应 100。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var X0 = 140, W = 420;

  function bar(v){ return Math.max(0, v) / 100 * W; }

  function stage(T){
    if(T > 75) return ['烫口：细节被压住', '高温下苦感占上风，甜感尚未到峰值，香气挥发得太快——此时下的判断往往偏严厉。刚出杯就急着评价，容易冤枉一支好豆子。'];
    if(T > 60) return ['偏热：结构清楚', '苦感开始回落，甜感上升，整体结构清晰。适合判断「厚度与平衡」。'];
    if(T > 45) return ['甜感峰值区', '甜感接近最强、苦感明显回落——同一杯咖啡在这个温度区间最讨喜。专业杯测要求跨温度评价，正是为了避免只取这一段的印象。'];
    if(T > 30) return ['接近室温：酸质凸显', '甜与苦都在下降，而酸几乎不动，于是酸在整体中的占比上升。缺陷（涩、发酵味、木质）也在这一段最容易暴露。'];
    return ['冷：酸与涩最突出', '甜感所剩无几，酸的占比达到最高，收敛感与干涩被放大。凉透的咖啡不适合用来判断豆子，适合用来发现缺陷。'];
  }

  function compute(p){
    var T = p.temp;
    var sweet  = 100 * Math.exp(-Math.pow((T - 45) / 30, 2));
    var bitter = 100 / (1 + Math.exp(-(T - 50) / 15));
    var sour   = 70 - 0.1 * (T - 45);
    var rel    = sour / (sweet + bitter + sour) * 100;
    var st = stage(T);
    return {
      wS: bar(sweet), wB: bar(bitter), wA: bar(sour),
      tempText: T + ' °C',
      sText: sweet.toFixed(0), bText: bitter.toFixed(0), aText: sour.toFixed(0),
      relText: rel.toFixed(0) + '%',
      zone: st[0], advice: st[1]
    };
  }

  function paint(s, doc){
    doc.getElementById('barS').setAttribute('width', s.wS);
    doc.getElementById('barB').setAttribute('width', s.wB);
    doc.getElementById('barA').setAttribute('width', s.wA);
    doc.getElementById('vTemp').textContent   = s.tempText;
    doc.getElementById('sOut').textContent    = s.sText;
    doc.getElementById('bOut').textContent    = s.bText;
    doc.getElementById('aOut').textContent    = s.aText;
    doc.getElementById('relOut').textContent  = s.relText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '4-3',
    defaults: { temp: 55 },
    controls: ['temp'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        advOut: { text: s.advice },
        barS: { width: s.wS }, barB: { width: s.wB }, barA: { width: s.wA },
        vTemp: { text: s.tempText }, sOut: { text: s.sText }, bOut: { text: s.bText },
        aOut: { text: s.aText }, relOut: { text: s.relText }, zoneOut: { text: s.zone }
      };
    }
  };
});
