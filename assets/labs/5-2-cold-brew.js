/* 5.2 冷萃：温度不是「慢一点」，而是「按不同比例慢」
   Arrhenius 关系：k(T) = A·e^(−Ea/RT)，取相对于 93 °C 的比值
     k_rel(T) = e^( −Ea/R · (1/T − 1/T₀) )，T₀ = 366.15 K
   两类物质取不同的活化能（示意值，量级取自「大分子降解产物对温度更敏感」这一定性事实）：
     风味物质（酸、糖、小分子）Ea = 50 kJ/mol，93 °C 时的特征时间 τ₀ = 0.06 h
     苦涩物质（大分子与降解产物）Ea = 75 kJ/mol，τ₀ = 0.12 h
   溶出完成度：f = 1 − e^(−t/τ)，τ(T) = τ₀ / k_rel(T)
   坐标：x = 70 + T/100×540（0–100 °C），y = 300 − (log₁₀k + 4)/4.5×260（对数纵轴） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var R = 8.314, T0 = 366.15;
  var EA_F = 50000, EA_B = 75000, TAU_F = 0.06, TAU_B = 0.12;
  var X0 = 70, XW = 540, Y0 = 300, YH = 260;

  function kRel(T, Ea){ return Math.exp(-Ea / R * (1 / (T + 273.15) - 1 / T0)); }
  function px(T){ return X0 + T / 100 * XW; }
  function py(k){
    var y = Y0 - (Math.log(k) / Math.LN10 + 4) / 4.5 * YH;
    return Math.max(40, Math.min(Y0, y));
  }
  function points(Ea){
    var out = [];
    for(var T = 0; T <= 100; T += 5) out.push(px(T).toFixed(1) + ',' + py(kRel(T, Ea)).toFixed(1));
    return out.join(' ');
  }

  function verdict(T, ratio){
    if(T > 70) return ['热萃：快，但选择性差', '高温下两类物质都跑得快，苦涩物质与风味物质的差距被压缩——所以热萃必须靠精确控制时间来停在合适的位置。'];
    if(T > 45) return ['温萃：中间地带', '速率明显下降但选择性还没拉开多少，通常是最没有性价比的一段：既不快，也不够干净。'];
    if(T > 12) return ['室温冷萃：选择性开始显现', '风味物质仍能在十几个小时内溶出大半，苦涩物质却远远落后——这就是冷萃「顺口」的机制来源，不是因为酸被去掉了。'];
    return ['冷藏冷萃：最干净，也最慢', '两类物质都被大幅拖慢，但苦涩物质拖得更狠。杯子非常干净，代价是需要很长时间，且总萃取量偏低——容易偏薄。'];
  }

  function compute(p){
    var tH = p.t / 60;
    var kf = kRel(p.temp, EA_F), kb = kRel(p.temp, EA_B);
    var ff = 1 - Math.exp(-tH / (TAU_F / kf));
    var fb = 1 - Math.exp(-tH / (TAU_B / kb));
    var ratio = ff > 0 ? fb / ff : 0;
    var v = verdict(p.temp, ratio);
    return {
      cxF: px(p.temp), cyF: py(kf), cyB: py(kb),
      tempText: p.temp + ' °C',
      timeText: tH >= 1 ? tH.toFixed(1).replace(/\.0$/,'') + ' h（' + p.t + ' min）' : p.t + ' min',
      kfText: kf < 0.01 ? kf.toExponential(1) : kf.toFixed(3),
      kbText: kb < 0.01 ? kb.toExponential(1) : kb.toFixed(3),
      ffText: (ff * 100).toFixed(0) + '%', fbText: (fb * 100).toFixed(0) + '%',
      ratioText: ratio.toFixed(2),
      zone: v[0], advice: v[1],
      pF: points(EA_F), pB: points(EA_B)
    };
  }

  function paint(s, doc){
    doc.getElementById('tMark').setAttribute('x1', s.cxF);
    doc.getElementById('tMark').setAttribute('x2', s.cxF);
    doc.getElementById('dotF').setAttribute('cx', s.cxF);
    doc.getElementById('dotF').setAttribute('cy', s.cyF);
    doc.getElementById('dotB').setAttribute('cx', s.cxF);
    doc.getElementById('dotB').setAttribute('cy', s.cyB);
    doc.getElementById('vTemp').textContent  = s.tempText;
    doc.getElementById('vTime').textContent  = s.timeText;
    doc.getElementById('ffOut').textContent  = s.ffText;
    doc.getElementById('fbOut').textContent  = s.fbText;
    doc.getElementById('ratioOut').textContent = s.ratioText;
    doc.getElementById('kfOut').textContent  = s.kfText;
    doc.getElementById('kbOut').textContent  = s.kbText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '5-2',
    defaults: { temp: 20, t: 960 },
    controls: ['temp','t'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        kfOut: { text: s.kfText },
        kbOut: { text: s.kbText },
        advOut: { text: s.advice },
        curveF: { points: s.pF }, curveB: { points: s.pB },
        tMark: { x1: s.cxF, x2: s.cxF },
        dotF: { cx: s.cxF, cy: s.cyF }, dotB: { cx: s.cxF, cy: s.cyB },
        vTemp: { text: s.tempText }, vTime: { text: s.timeText },
        ffOut: { text: s.ffText }, fbOut: { text: s.fbText },
        ratioOut: { text: s.ratioText }, zoneOut: { text: s.zone }
      };
    }
  };
});
