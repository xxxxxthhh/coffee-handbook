/* 1.3 冲煮控制图：粉水比 × 萃取率 → 落点 + 九宫格诊断
   坐标映射与正文公式一致：TDS = EY ÷ 粉水比
   x: EY 14→26 映射到 70→610   (cx = 70 + (EY-14)*45)
   y: TDS 0.8→1.8 映射到 370→30 (cy = 30 + (1.8-TDS)*340) */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var ZONES = {
    '00':['萃取不足 · 偏淡：又淡又酸','磨细一档（首选：一个动作同时修两个症状），或提高水温/延长时间。'],
    '01':['萃取不足 · 浓度适中：酸感突出','浓度没问题，别动粉量——磨细或提高水温，把落点向右推。'],
    '02':['萃取不足 · 偏浓：浓但发酸','典型的意式区困境：保持粉水比，磨细/延长接触时间，只推萃取率。'],
    '10':['萃取理想 · 偏淡：平衡但寡淡','音色是对的——提高粉水比（多放粉），别动研磨，只推音量。'],
    '11':['金杯区','音量和音色都在甜蜜点。记下这组参数——以及你用的豆子和水。'],
    '12':['萃取理想 · 偏浓：平衡但厚重','风味结构好——降低粉水比，或成杯后少量 bypass 加水稀释。'],
    '20':['过萃 · 偏淡：萃取过度的淡咖啡','少见组合（大水量长时间）。磨粗降萃取率，同时提高粉水比。'],
    '21':['过萃 · 浓度适中：苦涩抬头','磨粗一档或降低水温，把落点向左拉回金杯区。'],
    '22':['过萃 · 偏浓：又浓又苦','磨粗、缩短时间、或降低粉水比——先动研磨，一次只动一个。']
  };

  function compute(p){
    var tds = p.ey / p.ratio;
    var cx  = 70 + (p.ey - 14) * 45;
    var cy  = Math.max(30, Math.min(370, 30 + (1.8 - tds) * 340));
    var ez  = p.ey < 18 ? 0 : p.ey <= 22 ? 1 : 2;
    var tz  = tds < 1.15 ? 0 : tds <= 1.45 ? 1 : 2;
    var z   = ZONES['' + ez + tz];
    return {
      cx: cx, cy: cy,
      ratioText: '1 : ' + p.ratio.toFixed(1).replace(/\.0$/,''),
      eyText: p.ey.toFixed(1) + '%',
      tdsText: tds.toFixed(2) + '%',
      zone: z[0], advice: z[1]
    };
  }

  function paint(s, doc){
    var dot = doc.getElementById('dot');
    dot.setAttribute('cx', s.cx);
    dot.setAttribute('cy', s.cy);
    doc.getElementById('vRatio').textContent = s.ratioText;
    doc.getElementById('vEy').textContent    = s.eyText;
    doc.getElementById('tdsOut').textContent = s.tdsText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '1-3',
    defaults: { ratio: 16.5, ey: 20 },
    controls: ['ratio','ey'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        dot:     { cx: s.cx, cy: s.cy },
        vRatio:  { text: s.ratioText },
        vEy:     { text: s.eyText },
        tdsOut:  { text: s.tdsText },
        zoneOut: { text: s.zone },
        advOut:  { text: s.advice }
      };
    }
  };
});
