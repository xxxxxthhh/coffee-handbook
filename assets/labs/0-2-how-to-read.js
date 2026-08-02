/* 0.2 五要素导览 + 阅读路径选择器 */
(function(root, factory){
  var def = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = def;
  else root.Lab.register(def);
})(typeof self !== 'undefined' ? self : this, function(){

  var ELEMENTS = [
    { key:'guess', name:'① 先猜一次 Guess First',
      role:'在读到答案之前，先逼出一个属于你自己的预测。',
      why:'预测失败会给随后的正确答案一个落点：你不只是记住了结论，还记住了它和你原来的想法差在哪。',
      form:'几个按钮，点了只记录不判对错——本书不打分。' },
    { key:'concept', name:'② 核心概念 Core Concept',
      role:'把机制推导出来，并指名日常语言在哪里把两个概念揉成了一个。',
      why:'放在预测之后，你的误差才有地方安放；先给定义再让人猜，猜的就只是记忆。',
      form:'公式块 + 术语标注（英文原文 + 中文解释，收进附录 A）。' },
    { key:'lab', name:'③ 交互实验 Interactive Lab',
      role:'把机制变成可操作的因果：你动一个变量，看它把结果推向哪边。',
      why:'紧跟概念，是为了避免「读懂了但不会用」——手上的因果比纸上的公式记得久。',
      form:'原生 JS，2–3 个有叙事意义的预设；打印时降级为默认参数的静态快照。' },
    { key:'case', name:'④ 真实案例 Case Study',
      role:'把机制钉在真实的研究或事件上，同时暴露它的边界：谁做的、什么年代、样本是谁。',
      why:'放在理解机制之后，你才看得懂案例在争论什么，而不是把结论抄走。',
      form:'案例块底部有来源行；存在修订史的结论会呈现演变脉络，而不是写成定论。' },
    { key:'quiz', name:'⑤ 章末自测 Quiz',
      role:'检索练习：自己把答案调出来，比重读一遍有效。',
      why:'放在最后，也是给你一个「学没学会」的自查点——尤其是计算题。',
      form:'3–4 题混合题型，答案默认折叠，展开后含完整推导。' }
  ];

  var GOALS = {
    none:'',
    fix:'路径 A · 我这杯不好喝，现在就想修：附录 B 冲煮诊断卡 → 按症状查到变量 → 回到 1.3 用控制图确认落点 → 再按症状进 1.1（酸苦顺序）、1.2（六个变量）、2.2（烘焙度）或 3.1（水）。整条路径大约 40 分钟。',
    system:'路径 B · 我想系统学一遍：按顺序读。Part 1 是地基（萃取的坐标系），Part 2 与 Part 3 的作用是把「烘焙度」和「水」翻译成萃取语言，Part 4 校准你这台测量仪器，Part 5 回到器具——那时你会发现器具只是被固化的参数组合。',
    play:'路径 C · 我只想玩交互：每章都有一个。建议顺序是 1.3 冲煮控制图（全书信息量最大）→ 1.1 溶解曲线 → 5.1 渗滤与浸泡的模型对比 → 3.1 水的二维图 → 1.4 通道效应。玩完再回头读正文，会快很多。'
  };

  function compute(p){
    var i = 0;
    for(var k = 0; k < ELEMENTS.length; k++) if(ELEMENTS[k].key === p.element) i = k;
    var E = ELEMENTS[i];
    return { index:i, name:E.name, role:E.role, why:E.why, form:E.form, path:GOALS[p.goal] || '' };
  }

  function paint(s, doc){
    for(var i = 0; i < 5; i++){
      doc.getElementById('e' + i).setAttribute('fill-opacity', i === s.index ? 0.9 : 0.12);
    }
    doc.getElementById('elName').textContent = s.name;
    doc.getElementById('elRole').textContent = s.role;
    doc.getElementById('elWhy').textContent  = s.why;
    doc.getElementById('elForm').textContent = s.form;
    var out = doc.getElementById('pathOut');
    out.textContent = s.path;
    out.style.display = s.path ? 'block' : 'none';
    doc.querySelectorAll('.picker button[data-el]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-el') === ELEMENTS[s.index].key);
    });
  }

  return {
    id: '0-2',
    defaults: { element: 'guess', goal: 'none' },
    compute: compute,
    paint: paint,
    init: function(doc, api){
      doc.querySelectorAll('.picker button[data-el]').forEach(function(b){
        b.addEventListener('click', function(){ api.set('element', b.getAttribute('data-el')); });
      });
    },
    expect: function(s){
      return {
        e0: { 'fill-opacity': 0.9 }, e1: { 'fill-opacity': 0.12 }, e4: { 'fill-opacity': 0.12 },
        elName: { text: s.name }, elRole: { text: s.role }, elForm: { text: s.form }
      };
    }
  };
});
