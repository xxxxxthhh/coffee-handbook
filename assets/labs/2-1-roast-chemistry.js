/* 2.1 烘焙曲线上的下豆点
   豆温曲线（示意，单一升温路径）：T(t) = 235 − 145·e^(−t/220) °C
     t = 0 s   → 90 °C（回温点附近）
     一爆 196 °C → t ≈ 289 s；二爆 224 °C → t ≈ 567 s
   发展度 DTR = (下豆时间 − 一爆时间) ÷ 下豆时间
   风味走向（示意曲线，表达方向而非强度数值）：
     酸质 A = 100·e^(−(t−289)/260)，t < 289 时封顶 100
     甜感 S = 100·e^(−((t−430)/150)²)
     苦度 B = 100 ÷ (1 + e^(−(t−520)/60))
   坐标：x = 60 + t/660×560（t: 0–660 s），y = 300 − (T−80)/160×250（T: 80–240 °C） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var T_FC = 289, T_SC = 567, T_MAX = 660;
  var X0 = 60, XW = 560, Y0 = 300, YH = 250, TEMP0 = 80, TEMPR = 160;

  function temp(t){ return 235 - 145 * Math.exp(-t / 220); }
  function px(t){ return X0 + t / T_MAX * XW; }
  function py(T){ return Y0 - (T - TEMP0) / TEMPR * YH; }

  function curve(){
    var out = [];
    for(var t = 0; t <= T_MAX; t += 20) out.push(px(t).toFixed(1) + ',' + py(temp(t)).toFixed(1));
    return out.join(' ');
  }

  function stage(t){
    if(t < T_FC)       return ['一爆前下豆：夹生', '豆子内部的转化还没走完，杯中会出现生青、谷物与尖利的酸——这不是「浅烘的果酸」，是没烘熟。'];
    if(t < T_FC + 55)  return ['极浅烘：酸质主导', '发展度很低，酸类保留得最多，甜感与醇厚度都还没展开。这类豆子对萃取率的要求偏高（见 2.2）。'];
    if(t < T_FC + 145) return ['浅中烘：酸甜平衡', '美拉德产物已经积累，酸质仍在，甜感接近峰值——多数精品豆的常见落点。'];
    if(t < T_FC + 235) return ['中深烘：焦糖与坚果', '酸被进一步降解，焦糖化与美拉德产物主导，body 上升，苦感开始抬头。'];
    if(t < T_SC)       return ['深烘：苦甜主导', '酸质大量流失，苦味物质持续积累，风味从「产地特征」转向「烘焙特征」。'];
    return ['二爆之后：焦苦与烟熏', '细胞结构进一步破裂、油脂渗出到表面，烟熏与焦苦盖过其余风味，豆子也更易受氧化影响。'];
  }

  function compute(p){
    var t = p.drop;
    var T = temp(t);
    var dtr = (t - T_FC) / t * 100;
    var acid   = 100 * Math.exp(-Math.max(0, t - T_FC) / 260);
    var sweet  = 100 * Math.exp(-Math.pow((t - 430) / 150, 2));
    var bitter = 100 / (1 + Math.exp(-(t - 520) / 60));
    var st = stage(t);
    return {
      x: px(t), y: py(T),
      dropText: t + ' s（豆温 ' + T.toFixed(0) + ' °C）',
      dtrText: t > T_FC ? dtr.toFixed(1) + '%' : '未进入发展期',
      aText: acid.toFixed(0), sText: sweet.toFixed(0), bText: bitter.toFixed(0),
      zone: st[0], advice: st[1],
      curve: curve()
    };
  }

  function paint(s, doc){
    doc.getElementById('dropMark').setAttribute('x1', s.x);
    doc.getElementById('dropMark').setAttribute('x2', s.x);
    doc.getElementById('dropDot').setAttribute('cx', s.x);
    doc.getElementById('dropDot').setAttribute('cy', s.y);
    doc.getElementById('vDrop').textContent   = s.dropText;
    doc.getElementById('dtrOut').textContent  = s.dtrText;
    doc.getElementById('aOut').textContent    = s.aText;
    doc.getElementById('sOut').textContent    = s.sText;
    doc.getElementById('bOut').textContent    = s.bText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '2-1',
    defaults: { drop: 380 },
    controls: ['drop'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        roastCurve: { points: s.curve },
        dropMark: { x1: s.x, x2: s.x },
        dropDot: { cx: s.x, cy: s.y },
        vDrop: { text: s.dropText }, dtrOut: { text: s.dtrText },
        aOut: { text: s.aText }, sOut: { text: s.sText }, bOut: { text: s.bText },
        zoneOut: { text: s.zone }
      };
    }
  };
});
