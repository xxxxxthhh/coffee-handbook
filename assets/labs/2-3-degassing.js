/* 2.3 养豆窗口：两条相反方向的曲线
   示意模型（一阶衰减，表达「此消彼长」而非预测某支豆子）：
     CO₂ 残留   C(d) = e^(−d/9)     —— 干扰萃取稳定性，越低越好
     香气保留   A(d) = e^(−d/25)    —— 随氧化流失，越高越好
   由两条阈值定义窗口：手冲需 C < 0.50 且 A > 0.55 → 约 6.2–15.0 天
                       意式需 C < 0.35 且 A > 0.50 → 约 9.5–17.3 天
   （意式对残余 CO₂ 更敏感：高压下气泡影响流速与萃取均匀度）
   阈值与时间常数为示意值；真实窗口随烘焙度、包装与储存条件浮动，见工具层。
   坐标：x = 60 + d/40×560（d: 0–40 天），y = 300 − v×250（v: 0–1） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var TAU_CO2 = 9, TAU_AROMA = 25, D_MAX = 40;
  var X0 = 60, XW = 560, Y0 = 300, YH = 250;
  var POUR = [6.2, 15.0], ESP = [9.5, 17.3];

  function px(d){ return X0 + d / D_MAX * XW; }
  function py(v){ return Y0 - v * YH; }
  function co2(d){ return Math.exp(-d / TAU_CO2); }
  function aroma(d){ return Math.exp(-d / TAU_AROMA); }

  function points(f){
    var out = [];
    for(var d = 0; d <= D_MAX; d += 2) out.push(px(d).toFixed(1) + ',' + py(f(d)).toFixed(1));
    return out.join(' ');
  }

  function verdict(d){
    if(d < POUR[0]) return ['排气期：还太新', 'CO₂ 大量残留：闷蒸时粉床剧烈膨胀、水与粉接触被气泡阻隔，流速与萃取率都不稳定。意式会出现大量 crema 与偏快的流速，杯子往往偏酸。想现在就喝，可以延长闷蒸并适当搅拌。'];
    if(d < ESP[0])  return ['手冲窗口已开', '排气降到干扰较小的水平，香气仍充足——滤泡类冲煮此时最稳定。意式还可以再等几天。'];
    if(d <= POUR[1]) return ['两种冲煮都在窗口内', 'CO₂ 已经退到低位，香气还没明显衰减。这是模型里最宽裕的一段，适合做参数对比实验：变量少，重现性好。'];
    if(d <= ESP[1]) return ['意式窗口后段', '滤泡冲煮的香气开始变钝，但意式仍在可用区间——高浓度下香气的损失相对不那么刺眼。'];
    return ['风味开始明显衰减', '氧化让香气与酸质流失，杯感转向纸板与木质。此时调参数收效有限：这是储存问题，不是冲煮问题。'];
  }

  function compute(p){
    var c = co2(p.d), a = aroma(p.d);
    var v = verdict(p.d);
    return {
      x: px(p.d), yc: py(c), ya: py(a),
      dayText: p.d + ' 天',
      cText: (c * 100).toFixed(0) + '%', aText: (a * 100).toFixed(0) + '%',
      zone: v[0], advice: v[1],
      pCo2: points(co2), pAroma: points(aroma)
    };
  }

  function paint(s, doc){
    doc.getElementById('dayMark').setAttribute('x1', s.x);
    doc.getElementById('dayMark').setAttribute('x2', s.x);
    doc.getElementById('dotC').setAttribute('cx', s.x);
    doc.getElementById('dotC').setAttribute('cy', s.yc);
    doc.getElementById('dotA').setAttribute('cx', s.x);
    doc.getElementById('dotA').setAttribute('cy', s.ya);
    doc.getElementById('vDay').textContent    = s.dayText;
    doc.getElementById('cOut').textContent    = s.cText;
    doc.getElementById('aOut').textContent    = s.aText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '2-3',
    defaults: { d: 10 },
    controls: ['d'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        curveCo2: { points: s.pCo2 }, curveAroma: { points: s.pAroma },
        dayMark: { x1: s.x, x2: s.x },
        dotC: { cx: s.x, cy: s.yc }, dotA: { cx: s.x, cy: s.ya },
        vDay: { text: s.dayText }, cOut: { text: s.cText }, aOut: { text: s.aText },
        zoneOut: { text: s.zone }
      };
    }
  };
});
