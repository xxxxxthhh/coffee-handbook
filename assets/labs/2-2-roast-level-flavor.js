/* 2.2 烘焙度如何搬动「宜人萃取率区间」
   示意模型：区间中心随烘焙度线性左移
     c(r) = 22 − 0.045·r        （r: 0 = 极浅，100 = 极深）
     区间 = [c − 1.8, c + 1.8]
   方向来自机制：烘焙越深，细胞结构越疏松、可溶物越易溶出，且苦味物质的积累更早到达阈值。
   斜率与半宽是为了表达「区间会移动」而取的示意值，不是标准。
   坐标：x = 70 + (EY − 14)/12 × 520（EY 14–26%），y = 40 + r/100 × 280（浅在上、深在下） */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var X0 = 70, XW = 520, EY0 = 14, EYR = 12, Y0 = 40, YH = 280;

  function px(ey){ return X0 + (ey - EY0) / EYR * XW; }
  function py(r){ return Y0 + r / 100 * YH; }
  function center(r){ return 22 - 0.045 * r; }

  function roastName(r){
    if(r < 25) return '浅烘';
    if(r < 45) return '中浅烘';
    if(r < 70) return '中深烘';
    return '深烘';
  }

  function compute(p){
    var c = center(p.r), lo = c - 1.8, hi = c + 1.8;
    var name = roastName(p.r);
    var zone, advice;
    if(p.ey < lo){
      zone = name + ' · 萃取偏低';
      advice = '相对这个烘焙度，萃取率还没到位：酸质突出、甜感与醇厚度都没展开。磨细一档或延长接触时间，把落点向右推到 ' + lo.toFixed(1) + '–' + hi.toFixed(1) + '%。';
    } else if(p.ey > hi){
      zone = name + ' · 萃取偏高';
      advice = '相对这个烘焙度，萃取率越过了苦味阈值：苦涩与干燥感抬头。磨粗一档或缩短时间，回到 ' + lo.toFixed(1) + '–' + hi.toFixed(1) + '%。';
    } else {
      zone = name + ' · 落在宜人区';
      advice = '这个烘焙度的宜人区间大约是 ' + lo.toFixed(1) + '–' + hi.toFixed(1) + '%，当前落点在区间内。换一支烘焙度不同的豆子时，这个区间会跟着移动。';
    }
    return {
      cx: px(p.ey), cy: py(p.r),
      loText: lo.toFixed(1) + '%', hiText: hi.toFixed(1) + '%',
      rText: p.r.toFixed(0) + ' / 100（' + name + '）',
      eyText: p.ey.toFixed(1) + '%',
      rangeText: lo.toFixed(1) + '–' + hi.toFixed(1) + '%',
      zone: zone, advice: advice
    };
  }

  function paint(s, doc){
    var dot = doc.getElementById('rdot');
    dot.setAttribute('cx', s.cx);
    dot.setAttribute('cy', s.cy);
    doc.getElementById('vRoast').textContent  = s.rText;
    doc.getElementById('vEy').textContent     = s.eyText;
    doc.getElementById('rangeOut').textContent = s.rangeText;
    doc.getElementById('zoneOut').textContent = s.zone;
    doc.getElementById('advOut').textContent  = s.advice;
  }

  return {
    id: '2-2',
    defaults: { r: 40, ey: 20 },
    controls: ['r','ey'],
    compute: compute,
    paint: paint,
    expect: function(s){
      return {
        rdot: { cx: s.cx, cy: s.cy },
        vRoast: { text: s.rText }, vEy: { text: s.eyText },
        rangeOut: { text: s.rangeText }, zoneOut: { text: s.zone }
      };
    }
  };
});
