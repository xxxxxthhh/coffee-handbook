/* dark mode 切换：默认跟随系统 prefers-color-scheme，点击后写入 html[data-theme] */
(function(){
  var btn = document.querySelector('.theme-toggle');
  if(!btn) return;
  function effective(){
    var t = document.documentElement.getAttribute('data-theme');
    if(t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  btn.addEventListener('click', function(){
    document.documentElement.setAttribute('data-theme', effective() === 'dark' ? 'light' : 'dark');
  });

  /* 打印强制浅色：CSS 的 @media print 已覆盖各种组合，这里再钉一次，
     避免依赖选择器特异性的细节（系统深色 + 未手动切换是最容易漏的情形）。 */
  var saved = null;
  window.addEventListener('beforeprint', function(){
    saved = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  window.addEventListener('afterprint', function(){
    if(saved === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', saved);
    saved = null;
  });
})();
