/* guess-first 组件 + quiz 折叠的打印展开。状态一律内存变量，不写入任何存储。 */
(function(){
  /* 先猜一次：只记录选择，不判对错 */
  document.querySelectorAll('.guess').forEach(function(box){
    var btns = box.querySelectorAll('button');
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        btns.forEach(function(x){ x.classList.remove('picked'); });
        b.classList.add('picked');
        box.classList.add('answered');
      });
    });
  });

  /* 打印时展开全部 quiz 答案，打印后恢复原状 */
  var reopened = [];
  window.addEventListener('beforeprint', function(){
    reopened = [];
    document.querySelectorAll('.quiz details:not([open])').forEach(function(d){
      d.open = true;
      reopened.push(d);
    });
  });
  window.addEventListener('afterprint', function(){
    reopened.forEach(function(d){ d.open = false; });
    reopened = [];
  });
})();
