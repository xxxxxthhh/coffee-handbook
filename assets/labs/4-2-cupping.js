/* 4.2 杯测流程：每一步锁住的是哪个变量
   点击时间线上的节点看该步骤控制什么；预设演示「省掉这一步会怎样」。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var STEPS = [
    { key:'dose', name:'① 统一称粉与研磨',
      controls:'粉水比与研磨度——也就是萃取率的两个主要输入。',
      why:'如果每杯的粉重或研磨不同，杯与杯的差异里混进了冲煮差异，而你想比较的是豆子。' },
    { key:'pour', name:'② 注水后静置约 4 分钟',
      controls:'接触时间，以及「不干预」本身。',
      why:'这几分钟里不搅动、不过滤，所有杯子经历同一个过程。杯测刻意不用滤纸，就是为了把器具变量从比较中拿掉。' },
    { key:'break', name:'③ 破渣：统一时刻、统一手法',
      controls:'搅动量与香气释放的时刻。',
      why:'破渣会把表层的粉壳推开、释放一波挥发香气。若各杯破渣的时刻或力度不同，闻到的就不是同一个瞬间的香气。' },
    { key:'skim', name:'④ 撇去浮沫与漂浮物',
      controls:'杯间悬浮物的差异。',
      why:'漂浮的细粉与泡沫会带来额外的口感干扰，且各杯多少不一。撇掉它，让入口的液体状态一致。' },
    { key:'replicate', name:'⑤ 每个样品多杯重复',
      controls:'单杯的偶然差异。',
      why:'一颗缺陷豆、一杯没搅匀，都会让单杯给出误导性的结论。多杯重复让你区分「这支豆子的特征」与「这一杯的意外」。' },
    { key:'blind', name:'⑥ 编号盲评 + 按温度序列品尝',
      controls:'期望效应与温度效应——两个来自评价者自身的系统误差。',
      why:'知道价格、产地或烘焙商会改变评分；温度会改变甜与酸的相对强度。编号消除前者，固定的温度序列让后者对所有样品一视同仁。' }
  ];

  var SKIPS = {
    none:'',
    blind:'省掉盲评：你仍然会得到一份看起来很专业的评分表，但其中包含了「你知道哪杯是贵的」这一项信息。它的影响不是随机噪声，而是有方向的偏移——所有样品都会朝你的预期靠拢，于是这次杯测无法回答「它们到底有没有差别」。',
    replicate:'省掉重复杯：单杯里的偶然因素（一颗缺陷豆、一次搅拌不匀）会被当成豆子的特征记录下来。更糟的是你无从察觉——一个样品只有一杯时，异常和特征长得一模一样。',
    break:'省掉统一破渣：各杯在不同时刻被搅动，等于各杯的接触条件与香气释放窗口都不同。此时杯与杯的差异既包含豆子的差异，也包含你手上的差异，两者无法分离。'
  };

  function compute(p){
    var i = 0;
    for(var k = 0; k < STEPS.length; k++) if(STEPS[k].key === p.step) i = k;
    var s = STEPS[i];
    return { index:i, name:s.name, controls:s.controls, why:s.why, skip:SKIPS[p.skip] || '' };
  }

  function paint(s, doc){
    for(var i = 0; i < 6; i++){
      doc.getElementById('n' + i).setAttribute('fill-opacity', i === s.index ? 0.9 : 0.15);
    }
    doc.getElementById('stepName').textContent     = s.name;
    doc.getElementById('stepControls').textContent = s.controls;
    doc.getElementById('stepWhy').textContent      = s.why;
    var out = doc.getElementById('skipOut');
    out.textContent = s.skip;
    out.style.display = s.skip ? 'block' : 'none';
    doc.querySelectorAll('.picker button[data-step]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-step') === STEPS[s.index].key);
    });
  }

  return {
    id: '4-2',
    defaults: { step: 'dose', skip: 'none' },
    compute: compute,
    paint: paint,
    init: function(doc, api){
      doc.querySelectorAll('.picker button[data-step]').forEach(function(b){
        b.addEventListener('click', function(){ api.set('step', b.getAttribute('data-step')); });
      });
    },
    expect: function(s){
      return {
        skipOut: { text: s.skip },
        n0: { 'fill-opacity': 0.9 }, n1: { 'fill-opacity': 0.15 }, n5: { 'fill-opacity': 0.15 },
        stepName: { text: s.name }, stepControls: { text: s.controls }, stepWhy: { text: s.why }
      };
    }
  };
});
