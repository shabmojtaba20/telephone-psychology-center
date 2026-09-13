(function(){
  const path=location.pathname;
  if(path!=='/admin-professional.html' && path!=='/admin-professional') return;
  const css=`.integrated-tools{margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#fff}.integrated-tools-title{font-weight:700;margin-bottom:8px}.integrated-tools-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.integrated-tool{border:1px solid #e5e7eb;background:#f8fafc;border-radius:11px;padding:10px;text-align:right;cursor:pointer;color:#182033}.integrated-tool:hover{background:#eef2ff;border-color:#c7d2fe}@media(max-width:700px){.integrated-tools-grid{grid-template-columns:1fr}}`;
  function init(){
    if(document.getElementById('admin-panel-integration-style'))return;
    const s=document.createElement('style');s.id='admin-panel-integration-style';s.textContent=css;document.head.appendChild(s);
    const nav=document.querySelector('.nav');
    if(nav&&!document.getElementById('integrated-specialist-nav')){
      const group=document.createElement('div');group.id='integrated-specialist-nav';group.className='group open';
      group.innerHTML='<button class="group-title" type="button">🧩 پنل‌های تخصصی <span>⌄</span></button><div class="sub" style="display:block"><button type="button" data-integrated="finance">💰 مالی حرفه‌ای</button><button type="button" data-integrated="settlement">🧾 تسویه مشاوران</button><button type="button" data-integrated="consultant">👨‍⚕️ پنل حرفه‌ای مشاور</button><button type="button" data-integrated="audit">🛡️ حسابرسی مالی</button></div>';
      nav.appendChild(group);
      group.querySelectorAll('[data-integrated]').forEach(b=>b.onclick=()=>{
        const routes={finance:'/admin-v5.html',settlement:'/consultant-settlements.html',consultant:'/consultant-panel-professional.html',audit:'/finance-audit.html'};
        location.href=routes[b.dataset.integrated];
      });
    }
    const dash=document.getElementById('dashboard');
    if(dash&&!document.getElementById('integrated-tools')){
      const box=document.createElement('div');box.id='integrated-tools';box.className='integrated-tools';
      box.innerHTML='<div class="integrated-tools-title">🧩 دسترسی سریع پنل‌های تخصصی</div><div class="integrated-tools-grid"><button class="integrated-tool" data-go="/admin-v5.html">💰 مدیریت مالی و رسیدها</button><button class="integrated-tool" data-go="/consultant-settlements.html">🧾 تسویه و کارکرد مشاوران</button><button class="integrated-tool" data-go="/consultant-panel-professional.html">👨‍⚕️ پنل حرفه‌ای مشاوران</button><button class="integrated-tool" data-go="/finance-audit.html">🛡️ سوابق و حسابرسی مالی</button></div>';
      dash.appendChild(box);box.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>location.href=b.dataset.go);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
