/* 1.4 通道效应：平均萃取率如何同时掩盖过萃与萃取不足
   模型（两区简化，示意用）：把粉饼分成「通道区」（占粉重 vc = 20%）与「其余区」。
   不均匀度 u 决定水的分配：通过通道区的水量占比 fc = 0.2 + 0.6u（u = 0 时水按粉重比例均分）。
   局部粉水比 r_i = 水量占比 ÷ 粉重占比；局部萃取率按饱和曲线
     EY_i = 26 × (1 − e^(−1.466 · r_i))
   λ = 1.466 由「r = 1（完全均匀）时 EY = 20%」标定。
   平均萃取率按粉重加权：EY = vc·EY_通道 + (1−vc)·EY_其余。
   坐标：EY 0–26% 映射到 x = 120 → 600（宽 480）。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var VC = 0.2, EY_MAX = 26, LAMBDA = 1.466, X0 = 120, XW = 480;

  function ey(r){ return EY_MAX * (1 - Math.exp(-LAMBDA * r)); }
  function bar(v){ return v / EY_MAX * XW; }

  function verdict(spread, avg){
    if(spread < 2) return ['粉饼均匀', '水在整个粉饼上大致均分，局部萃取率接近平均值——此时「平均萃取率 ' + avg.toFixed(1) + '%」这个数字是可信的。'];
    if(spread < 6) return ['轻微通道', '开始出现分化：一部分粉已经过萃，另一部分还没跟上。杯子里会同时出现尖酸和粗糙的苦，而平均值看起来仍然正常。'];
    return ['明显通道', '水从局部夺路而逃：通道区严重过萃，其余粉饼萃取不足。平均萃取率被拉低到像「萃取不足」，但你尝到的苦涩来自过萃的那 20%——加粗研磨或延长时间都救不了它，要先修粉饼。'];
  }

  function compute(p){
    var fc = 0.2 + 0.6 * p.u;
    var rc = fc / VC, rr = (1 - fc) / (1 - VC);
    var eyc = ey(rc), eyr = ey(rr);
    var avg = VC * eyc + (1 - VC) * eyr;
    var spread = eyc - eyr;
    var v = verdict(spread, avg);
    return {
      wC: bar(eyc), wR: bar(eyr), xAvg: X0 + bar(avg),
      wFlowC: fc * XW, xFlowR: X0 + fc * XW, wFlowR: (1 - fc) * XW,
      uText: (p.u * 100).toFixed(0) + '%',
      cText: eyc.toFixed(1) + '%', rText: eyr.toFixed(1) + '%',
      avgText: avg.toFixed(1) + '%', spreadText: spread.toFixed(1) + ' 个百分点',
      flowText: (fc * 100).toFixed(0) + '%',
      zone: v[0], advice: v[1]
    };
  }

  function paint(s, doc){
    doc.getElementById('barC').setAttribute('width', s.wC);
    doc.getElementById('barR').setAttribute('width', s.wR);
    doc.getElementById('avgMark').setAttribute('x1', s.xAvg);
    doc.getElementById('avgMark').setAttribute('x2', s.xAvg);
    doc.getElementById('flowC').setAttribute('width', s.wFlowC);
    doc.getElementById('flowR').setAttribute('x', s.xFlowR);
    doc.getElementById('flowR').setAttribute('width', s.wFlowR);
    doc.getElementById('vU').textContent      = s.uText;
    doc.getElementById('cOut').textContent    = s.cText;
    doc.getElementById('rOut').textContent    = s.rText;
    doc.getElementById('avgOut').textContent  = s.avgText;
    doc.getElementById('spreadOut').textContent = s.spreadText;
    doc.getElementById('flowOut').textContent = s.flowText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '1-4',
    defaults: { u: 0.15 },
    controls: ['u'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        barC: { width: s.wC }, barR: { width: s.wR },
        avgMark: { x1: s.xAvg, x2: s.xAvg },
        flowC: { width: s.wFlowC }, flowR: { x: s.xFlowR, width: s.wFlowR },
        vU: { text: s.uText }, cOut: { text: s.cText }, rOut: { text: s.rText },
        avgOut: { text: s.avgText }, spreadOut: { text: s.spreadText },
        flowOut: { text: s.flowText }, zoneOut: { text: s.zone }
      };
    }
  };
});
