(function(){
  'use strict';
  const URL='/education-dashboard/';
  const PERMISSION='education.manage';
  async function waitForAccess(){
    for(let i=0;i<20;i++){
      if(window.__adminPermissions instanceof Set) return window.__adminPermissions.has('*')||window.__adminPermissions.has(PERMISSION);
      await new Promise(r=>setTimeout(r,100));
    }
    return false;
  }
  async function init(){
    const nav=document.querySelector('.nav');
    if(!nav) return;
    try{
      const allowed=await waitForAccess();
      if(!allowed) return;
      if(nav.querySelector('[data-education-dashboard-link]')) return;
      const group=document.createElement('div');
      group.className='group';
      group.setAttribute('data-education-dashboard-link','1');
      group.innerHTML='<button class="group-title" type="button">🎓 آموزش <span>⌄</span></button><div class="sub"><button type="button" data-education-dashboard>📊 داشبورد مدیریت آموزش</button><button type="button" data-education-public>🌐 صفحه آموزش و کارگاه‌ها</button></div>';
      const title=group.querySelector('.group-title');
      const sub=group.querySelector('.sub');
      title.addEventListener('click',()=>{sub.classList.toggle('open');group.classList.toggle('open');});
      group.querySelector('[data-education-dashboard]').addEventListener('click',()=>{window.location.href=URL;});
      group.querySelector('[data-education-public]').addEventListener('click',()=>{window.location.href='/education.html';});
      nav.insertBefore(group,nav.firstElementChild||null);
    }catch(e){console.warn('Education dashboard navigation unavailable',e);}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
