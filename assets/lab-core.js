/* ============================================================
   交互实验运行时（浏览器侧）
   各章 assets/labs/*.js 只写「纯计算 compute」+「绘制 paint」，
   滑块读值、预设按钮、打印前复位默认参数由这里统一处理。
   同一份 lab 模块在 Node 里被 tools/check.mjs require，
   用 compute(defaults) 独立重算，校验章节里写死的静态快照。
   ============================================================ */
window.Lab = (function(){

  function register(def){
    var doc = document;
    var custom = {};                     /* 非 input 控件（点击类）的内存状态 */
    Object.keys(def.defaults).forEach(function(k){ custom[k] = def.defaults[k]; });

    var controls = def.controls || [];

    function params(){
      var p = {};
      Object.keys(custom).forEach(function(k){ p[k] = custom[k]; });
      controls.forEach(function(id){
        var el = doc.getElementById(id);
        if(el) p[id] = parseFloat(el.value);
      });
      return p;
    }

    function update(){
      def.paint(def.compute(params()), doc);
    }

    function set(name, value){
      custom[name] = value;
      update();
    }

    function reset(){
      Object.keys(def.defaults).forEach(function(k){ custom[k] = def.defaults[k]; });
      controls.forEach(function(id){
        var el = doc.getElementById(id);
        if(el) el.value = def.defaults[id];
      });
      if(def.onReset) def.onReset(doc);
      update();
    }

    controls.forEach(function(id){
      var el = doc.getElementById(id);
      if(el) el.addEventListener('input', update);
    });

    /* 预设按钮：data-p="ratio=16.5,ey=20" */
    doc.querySelectorAll('.presets button[data-p]').forEach(function(b){
      b.addEventListener('click', function(){
        b.getAttribute('data-p').split(',').forEach(function(pair){
          var kv = pair.split('=');
          var name = kv[0].trim(), num = parseFloat(kv[1]);
          var value = isNaN(num) ? kv[1].trim() : num;   /* 点击类交互的预设可以是字符串 */
          var el = doc.getElementById(name);
          if(el) el.value = value; else custom[name] = value;
        });
        update();
      });
    });

    /* 打印导出：交互降级为默认参数的静态快照 */
    window.addEventListener('beforeprint', reset);

    var api = { set: set, update: update, reset: reset, params: params };
    if(def.init) def.init(doc, api);
    update();
    return api;
  }

  return { register: register };
})();
