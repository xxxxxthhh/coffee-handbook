/* 5.1 渗滤 vs 浸泡：两种萃取模型的差别在「上限」而不在「速度」
   浸泡（immersion）：溶质浓度趋近平衡，驱动力随时间衰减，上限由粉水比决定
     EY_上限(r) = 28 × r/(r+6)      r = 粉水比（1:r）
     EY(t) = EY_上限 × (1 − e^(−0.55t))    t 单位：分钟
   渗滤（percolation）：新鲜水持续替换，浓度梯度被维持，上限不受粉水比束缚
     EY(t) = 26 × (1 − e^(−0.50t))
   两条曲线的形状取自 Moroney 等对两类系统的建模结论（浸泡受平衡限制、渗滤受接触时间限制），
   常数为示意标定：1:15、3 分钟时渗滤 ≈ 20%，与常见手冲落点相当。
   坐标：x = 70 + t/8×540（0–8 min），y = 320 − EY/28×280（0–28%） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var X0 = 70, XW = 540, T_MAX = 8, Y0 = 320, YH = 280, EY_MAX = 28;
  var PERC_MAX = 26, K_IM = 0.55, K_PE = 0.50;

  function px(t){ return X0 + t / T_MAX * XW; }
  function py(ey){ return Y0 - ey / EY_MAX * YH; }
  function imMax(r){ return 28 * r / (r + 6); }
  function imEy(r, t){ return imMax(r) * (1 - Math.exp(-K_IM * t)); }
  function peEy(t){ return PERC_MAX * (1 - Math.exp(-K_PE * t)); }

  function points(f){
    var out = [];
    for(var t = 0; t <= T_MAX; t += 0.25) out.push(px(t).toFixed(1) + ',' + py(f(t)).toFixed(1));
    return out.join(' ');
  }

  function compute(p){
    var im = imEy(p.r, p.t), pe = peEy(p.t), gap = pe - im;
    var note;
    if(p.t < 1.5) note = '前 90 秒两条曲线几乎重合：这一段谁都受限于传质速度，粉水比还来不及起作用。';
    else if(gap > 3) note = '差距拉开了。浸泡已经逼近它的平衡上限 ' + imMax(p.r).toFixed(1) + '%，再等下去收益很小；渗滤仍在爬升，因为新鲜水一直在维持浓度梯度。';
    else if(gap > 1) note = '渗滤开始领先。浸泡的上限由粉水比锁定（当前 ' + imMax(p.r).toFixed(1) + '%），提高粉水比可以把这个天花板抬高。';
    else note = '两者接近。在这个粉水比与时间下，浸泡的平衡上限还没有成为瓶颈。';
    return {
      xNow: px(p.t), yIm: py(im), yPe: py(pe),
      timeText: p.t.toFixed(2).replace(/0$/,'').replace(/\.$/,'') + ' min',
      ratioText: '1 : ' + p.r.toFixed(0),
      imText: im.toFixed(1) + '%', peText: pe.toFixed(1) + '%',
      gapText: gap.toFixed(1) + ' 个百分点',
      capText: imMax(p.r).toFixed(1) + '%',
      note: note,
      pIm: points(function(t){ return imEy(p.r, t); }),
      pPe: points(peEy)
    };
  }

  function paint(s, doc){
    doc.getElementById('curveIm').setAttribute('points', s.pIm);
    doc.getElementById('curvePe').setAttribute('points', s.pPe);
    doc.getElementById('tmark').setAttribute('x1', s.xNow);
    doc.getElementById('tmark').setAttribute('x2', s.xNow);
    doc.getElementById('dotIm').setAttribute('cx', s.xNow);
    doc.getElementById('dotIm').setAttribute('cy', s.yIm);
    doc.getElementById('dotPe').setAttribute('cx', s.xNow);
    doc.getElementById('dotPe').setAttribute('cy', s.yPe);
    doc.getElementById('vTime').textContent  = s.timeText;
    doc.getElementById('vRatio').textContent = s.ratioText;
    doc.getElementById('imOut').textContent  = s.imText;
    doc.getElementById('peOut').textContent  = s.peText;
    doc.getElementById('gapOut').textContent = s.gapText;
    doc.getElementById('capOut').textContent = s.capText;
    doc.getElementById('noteOut').textContent = s.note;
  }

  return {
    id: '5-1',
    defaults: { r: 15, t: 3 },
    controls: ['r','t'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        noteOut: { text: s.note },
        curveIm: { points: s.pIm }, curvePe: { points: s.pPe },
        tmark: { x1: s.xNow, x2: s.xNow },
        dotIm: { cx: s.xNow, cy: s.yIm }, dotPe: { cx: s.xNow, cy: s.yPe },
        vTime: { text: s.timeText }, vRatio: { text: s.ratioText },
        imOut: { text: s.imText }, peOut: { text: s.peText },
        gapOut: { text: s.gapText }, capOut: { text: s.capText }
      };
    }
  };
});
