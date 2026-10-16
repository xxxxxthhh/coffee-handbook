/* 1.1 溶解顺序：时间轴上三类风味物质的累积曲线
   模型（示意，用于表达「顺序」而非预测产量）：每一类物质的累积溶出按一阶饱和
     f_i(t) = 1 − e^(−t/τ_i)
   时间常数取自「小分子有机酸最快、糖与美拉德产物居中、大分子苦涩物质最慢」这一定性事实：
     τ_酸 = 45 s，τ_甜 = 110 s，τ_苦 = 260 s
   萃取率按三类的加权和给出：EY = 27.2 × (0.30·f_酸 + 0.45·f_甜 + 0.25·f_苦)
   27.2 由「默认 150 s 落在 20% 附近」标定。坐标映射：
     x = 70 + t/360×540      （t: 0–360 s）
     y = 330 − f×300         （f: 0–1） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var TAU = { acid: 45, sweet: 110, bitter: 260 };
  var W = { acid: 0.30, sweet: 0.45, bitter: 0.25 };
  var EY_MAX = 27.2, T_MAX = 360;

  var X0 = 70, XW = 540, Y0 = 330, YH = 300;
  function px(t){ return X0 + t / T_MAX * XW; }
  function py(f){ return Y0 - f * YH; }
  function frac(tau, t){ return 1 - Math.exp(-t / tau); }

  /* 三条曲线的静态几何：页面里写死的 points 属性由这里推导，check.mjs 会逐字符比对 */
  function points(tau){
    var out = [];
    for(var t = 0; t <= T_MAX; t += 10) out.push(px(t).toFixed(1) + ',' + py(frac(tau, t)).toFixed(1));
    return out.join(' ');
  }

  function label(ey, fa, fb){
    if(ey < 15)  return ['尖酸、单薄', '只有跑得最快的有机酸进了杯子，糖与美拉德产物还在粉里。'];
    if(ey < 18)  return ['酸亮，甜感不足', '酸已经出齐，甜感刚过半——再等一会儿，或提高传质效率。'];
    if(ey <= 22) return ['平衡', '酸出齐、甜过大半、苦味物质刚露头，三者比例正好。'];
    return ['苦涩抬头', '甜感的增量已经很小，继续下去主要是在增加苦涩物质的比例。'];
  }

  function compute(p){
    var t = p.t;
    var fa = frac(TAU.acid, t), fs = frac(TAU.sweet, t), fb = frac(TAU.bitter, t);
    var ey = EY_MAX * (W.acid * fa + W.sweet * fs + W.bitter * fb);
    var lab = label(ey, fa, fb);
    return {
      x: px(t), ya: py(fa), ys: py(fs), yb: py(fb),
      timeText: (t / 60).toFixed(1).replace(/\.0$/, '') + ' min（' + t + ' s）',
      aText: (fa * 100).toFixed(0) + '%', sText: (fs * 100).toFixed(0) + '%', bText: (fb * 100).toFixed(0) + '%',
      eyText: ey.toFixed(1) + '%',
      zone: lab[0], advice: lab[1],
      pAcid: points(TAU.acid), pSweet: points(TAU.sweet), pBitter: points(TAU.bitter)
    };
  }

  function paint(s, doc){
    doc.getElementById('tmark').setAttribute('x1', s.x);
    doc.getElementById('tmark').setAttribute('x2', s.x);
    [['dotA', s.ya], ['dotS', s.ys], ['dotB', s.yb]].forEach(function(d){
      doc.getElementById(d[0]).setAttribute('cx', s.x);
      doc.getElementById(d[0]).setAttribute('cy', d[1]);
    });
    doc.getElementById('vTime').textContent = s.timeText;
    doc.getElementById('aOut').textContent  = s.aText;
    doc.getElementById('sOut').textContent  = s.sText;
    doc.getElementById('bOut').textContent  = s.bText;
    doc.getElementById('eyOut').textContent = s.eyText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '1-1',
    defaults: { t: 150 },
    controls: ['t'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        advOut: { text: s.advice },
        tmark: { x1: s.x, x2: s.x },
        dotA: { cx: s.x, cy: s.ya }, dotS: { cx: s.x, cy: s.ys }, dotB: { cx: s.x, cy: s.yb },
        curveAcid: { points: s.pAcid }, curveSweet: { points: s.pSweet }, curveBitter: { points: s.pBitter },
        vTime: { text: s.timeText }, aOut: { text: s.aText }, sOut: { text: s.sText },
        bOut: { text: s.bText }, eyOut: { text: s.eyText }, zoneOut: { text: s.zone }
      };
    }
  };
});
