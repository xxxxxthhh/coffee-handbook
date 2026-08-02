/* 0.3 变量耦合演示：只拖「研磨度」一个滑块，看三个下游量一起动。
   机制关系（示意模型，取相对指数，基准档 700 μm = 100）：
     比表面积 ∝ 1/d                      → sIdx = 100·(700/d)
     粉床渗透率 ∝ d²（Kozeny–Carman 近似），流速 ∝ 渗透率，接触时间 ∝ 1/d²
                                          → tIdx = 100·(700/d)²
     萃取速率 ∝ 比表面积，累积萃取 ≈ 饱和曲线
                                          → EY = 26·(1 − e^(−1.466·(700/d)³))
   1.466 由「基准档 EY = 20%」反解：26·(1−e^(−1.466)) = 20.0。
   这是耦合方向的示意，不是产量预测：实际手冲的注水速率也会限流，耦合比这里弱。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var BASE = 700, EY_MAX = 26, LAMBDA = 1.466, W = 420, SCALE = 250;

  function bar(idx){ return Math.min(idx, SCALE) / SCALE * W; }

  function compute(p){
    var r = BASE / p.d;
    var sIdx = 100 * r;
    var tIdx = 100 * r * r;
    var ey = EY_MAX * (1 - Math.exp(-LAMBDA * r * r * r));
    var verdict = p.d === BASE
      ? '基准档：三个下游量都定为 100。往两边拖，看它们如何一起动。'
      : '你在界面上只动了一个旋钮，实际同时改变了三个量——比表面积 ' + sIdx.toFixed(0) +
        '、接触时间 ' + tIdx.toFixed(0) + '、萃取率 ' + ey.toFixed(1) +
        '%。事后把杯子的变化归因给「研磨度」是对的，归因给其中任何一个机制都可能是错的。';
    return {
      sIdx: sIdx, tIdx: tIdx, ey: ey,
      wS: bar(sIdx), wT: bar(tIdx), wE: ey / EY_MAX * W,
      grindText: p.d + ' μm',
      sText: sIdx.toFixed(0), tText: tIdx.toFixed(0), eyText: ey.toFixed(1) + '%',
      verdict: verdict
    };
  }

  function paint(s, doc){
    doc.getElementById('barS').setAttribute('width', s.wS);
    doc.getElementById('barT').setAttribute('width', s.wT);
    doc.getElementById('barE').setAttribute('width', s.wE);
    doc.getElementById('vGrind').textContent  = s.grindText;
    doc.getElementById('sOut').textContent    = s.sText;
    doc.getElementById('tOut').textContent    = s.tText;
    doc.getElementById('eyOut').textContent   = s.eyText;
    doc.getElementById('verdictOut').textContent = s.verdict;
  }

  return {
    id: '0-3',
    defaults: { d: 700 },
    controls: ['d'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        verdictOut: { text: s.verdict },
        barS: { width: s.wS }, barT: { width: s.wT }, barE: { width: s.wE },
        vGrind: { text: s.grindText }, sOut: { text: s.sText },
        tOut: { text: s.tText }, eyOut: { text: s.eyText }
      };
    }
  };
});
