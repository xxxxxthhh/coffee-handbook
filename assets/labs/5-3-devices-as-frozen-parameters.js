/* 5.3 器具定位图：横轴「留给你的变量数量」，纵轴「萃取率上限的潜力」
   两个坐标都是定性排序（0–100 的相对刻度），用于表达取舍关系，不是测量值。
   坐标：x = 70 + 控制度/100×520，y = 320 − 潜力/100×280 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var X0 = 70, XW = 520, Y0 = 320, YH = 280;

  var DEVICES = [
    { key:'immersion', name:'全浸泡（法压类）', control:25, ceiling:45,
      locks:'流速被完全去掉——水与粉的接触时间由你按秒设定，与研磨度、粉床状态无关。',
      gives:'时间、粉水比、研磨度（研磨度在这里主要影响速度与细粉量，而不是接触时间）。',
      symptom:'常见症状是「浑浊、尾韵发涩」（细粉全部留在杯里）与「泡再久也偏薄」（平衡上限由粉水比锁定，见 5.1）。',
      where:'5.1 浸泡模型 · 1.1 溶解顺序' },
    { key:'hybrid', name:'浸泡后过滤（带阀滤杯）', control:30, ceiling:50,
      locks:'同样去掉流速，并额外用滤纸锁住细粉与部分油脂。',
      gives:'时间、粉水比、研磨度；开阀时机是其中仅有的与流动相关的变量。',
      symptom:'症状与全浸泡接近，但少了浑浊与涩；若开阀后排水极慢，说明研磨过细或细粉堵塞滤纸。',
      where:'5.1 浸泡模型 · 4.2 做对比实验的器具首选' },
    { key:'flat', name:'平底滤杯（渗滤）', control:65, ceiling:75,
      locks:'粉床形状被固定为较薄且均匀的一层，水位分布相对一致。',
      gives:'研磨度、注水节奏、水温、粉水比——但注水手法的影响被粉床形状部分吸收。',
      symptom:'容错较好；症状多为「整体偏淡」（粉层薄、接触时间短）或边缘绕流。',
      where:'5.1 渗滤模型 · 1.2 六大变量' },
    { key:'cone', name:'锥形滤杯（渗滤）', control:85, ceiling:85,
      locks:'几乎不锁——流速主要由粉床与你的注水共同决定。',
      gives:'研磨度、注水节奏与位置、水温、粉水比、搅动。控制维度最多。',
      symptom:'上限高、翻车也快：中心过萃与边缘绕流并存时，会同时出现苦涩与单薄（1.4 的同类问题）。',
      where:'5.1 渗滤模型 · 1.4 均匀度 · 1.2 六大变量' },
    { key:'pressure', name:'加压式（意式）', control:95, ceiling:95,
      locks:'把接触时间压缩到几十秒，并用压力接管流动——粉饼均匀度因此成为决定性变量。',
      gives:'研磨度、粉量、布粉与压粉、水温、压力曲线（若设备支持）。',
      symptom:'通道效应导致「又尖又苦」与流速忽快忽慢；平均萃取率读数会失去指导意义。',
      where:'1.4 压力下的萃取 · 2.3 排气窗口' }
  ];

  function compute(p){
    var i = 0;
    for(var k = 0; k < DEVICES.length; k++) if(DEVICES[k].key === p.device) i = k;
    var d = DEVICES[i];
    return {
      index: i, name: d.name, locks: d.locks, gives: d.gives,
      symptom: d.symptom, where: d.where,
      dots: DEVICES.map(function(x){
        return { cx: X0 + x.control / 100 * XW, cy: Y0 - x.ceiling / 100 * YH };
      })
    };
  }

  function paint(s, doc){
    for(var i = 0; i < 5; i++){
      var dot = doc.getElementById('d' + i);
      dot.setAttribute('r', i === s.index ? 11 : 7);
      dot.setAttribute('fill-opacity', i === s.index ? 1 : 0.3);
    }
    doc.getElementById('devName').textContent    = s.name;
    doc.getElementById('devLocks').textContent   = s.locks;
    doc.getElementById('devGives').textContent   = s.gives;
    doc.getElementById('devSymptom').textContent = s.symptom;
    doc.getElementById('devWhere').textContent   = s.where;
    doc.querySelectorAll('.picker button[data-device]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-device') === DEVICES[s.index].key);
    });
  }

  return {
    id: '5-3',
    defaults: { device: 'immersion' },
    compute: compute,
    paint: paint,
    init: function(doc, api){
      doc.querySelectorAll('.picker button[data-device]').forEach(function(b){
        b.addEventListener('click', function(){ api.set('device', b.getAttribute('data-device')); });
      });
    },
    expect: function(s){
      var out = {
        devSymptom: { text: s.symptom },
        devName: { text: s.name }, devLocks: { text: s.locks },
        devGives: { text: s.gives }, devWhere: { text: s.where },
        d0: { r: 11, 'fill-opacity': 1 },
        d3: { r: 7, 'fill-opacity': 0.3 }
      };
      s.dots.forEach(function(d, i){
        out['d' + i] = out['d' + i] || {};
        out['d' + i].cx = d.cx;
        out['d' + i].cy = d.cy;
      });
      return out;
    }
  };
});
