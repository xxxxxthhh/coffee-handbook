/* 0.1 风味责任链：点击四层中的一层，看它决定什么、锁死什么、留给下游什么。
   无量化断言——这一层不发明「贡献百分比」，只讲各层的职责边界。 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var LAYERS = [
    { key:'variety', name:'① 品种与产地',
      decides:'生豆里「有没有」某一类风味前体：芳香物前体、糖与有机酸的构成、豆体密度。',
      locks:'这一杯的风味天花板。下游三层都在这套素材里操作。',
      leaves:'素材本身——后三层能保留多少、糟蹋多少。',
      where:'本书不展开（属于农业与遗传学），只作为定位使用。' },
    { key:'process', name:'② 处理法',
      decides:'果实脱除与干燥期间的发酵路径，带来酸的种类与酯类香气的差异（日晒 / 水洗 / 蜜处理等）。',
      locks:'生豆到手时的风味构成与含水率。',
      leaves:'烘焙可用的素材清单。',
      where:'本书不展开，只在需要区分「豆子本来如此」与「你冲坏了」时引用。' },
    { key:'roast', name:'③ 烘焙',
      decides:'把前体变成实际的香气分子（美拉德反应与焦糖化），同时改变豆子的物理结构——孔隙、脆度、可溶物的可及性。',
      locks:'酸质与苦甜的大致配比，以及这支豆子「好喝的萃取率区间」落在哪。',
      leaves:'冲煮能够触及的范围。',
      where:'Part 2 展开。' },
    { key:'brew', name:'④ 冲煮',
      decides:'已经存在的物质里，溶出多少、按什么先后比例进入杯子。',
      locks:'这一杯在控制图上的落点。',
      leaves:'你的杯子——以及你舌头上的读数（Part 4 讲这台仪器的误差）。',
      where:'Part 1、Part 3、Part 5 展开，是本书的主战场。' }
  ];

  var CHAINS = {
    none:'',
    berry:'莓果味的责任链：前体在 ① ② 层写好 → ③ 烘焙决定它被保留还是被焦糖与烟熏盖掉 → ④ 冲煮决定它是否被溶出到合适比例。结论：冲煮救不回一支本来就没有它的豆子，但能轻易埋掉一支有它的豆子。',
    caramel:'焦糖与苦甜的责任链：主要由 ③ 烘焙层的美拉德反应与焦糖化产物贡献 → ④ 冲煮只能决定溶出多少（过萃会把苦涩一起放大）。想要更多甜感，先问烘焙度，再问萃取率。',
    twocups:'两个人用同一支豆子冲出两杯不同的咖啡：① ② ③ 层的输入相同，差异全部产生在 ④ 冲煮层（以及 Part 4 的感官读数误差）。这正是本书把冲煮放在最前面的原因——它是你每天真正会伸手去动的那一层。'
  };

  function compute(p){
    var i = 0;
    for(var k = 0; k < LAYERS.length; k++) if(LAYERS[k].key === p.layer) i = k;
    var L = LAYERS[i];
    return {
      index: i, name: L.name, decides: L.decides, locks: L.locks,
      leaves: L.leaves, where: L.where, chain: CHAINS[p.question] || ''
    };
  }

  function paint(s, doc){
    for(var i = 0; i < 4; i++){
      doc.getElementById('l' + i).setAttribute('fill-opacity', i === s.index ? 0.9 : 0.12);
    }
    doc.getElementById('layerName').textContent   = s.name;
    doc.getElementById('layerDecides').textContent = s.decides;
    doc.getElementById('layerLocks').textContent   = s.locks;
    doc.getElementById('layerLeaves').textContent  = s.leaves;
    doc.getElementById('layerWhere').textContent   = s.where;
    var chain = doc.getElementById('chainOut');
    chain.textContent = s.chain;
    chain.style.display = s.chain ? 'block' : 'none';
    doc.querySelectorAll('.picker button[data-layer]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-layer') === LAYERS[s.index].key);
    });
  }

  return {
    id: '0-1',
    defaults: { layer: 'variety', question: 'none' },
    compute: compute,
    paint: paint,
    init: function(doc, api){
      doc.querySelectorAll('.picker button[data-layer]').forEach(function(b){
        b.addEventListener('click', function(){ api.set('layer', b.getAttribute('data-layer')); });
      });
    },
    expect: function(s){
      return {
        layerLocks: { text: s.locks },
        layerLeaves: { text: s.leaves },
        chainOut: { text: s.chain },
        l0: { 'fill-opacity': 0.9 }, l1: { 'fill-opacity': 0.12 },
        l2: { 'fill-opacity': 0.12 }, l3: { 'fill-opacity': 0.12 },
        layerName: { text: s.name },
        layerDecides: { text: s.decides },
        layerWhere: { text: s.where }
      };
    }
  };
});
