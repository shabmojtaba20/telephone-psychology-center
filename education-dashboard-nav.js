(function(){
  'use strict';
  const URL='/education-dashboard.html';
  async function init(){
    const nav=document.querySelector('.nav');
    if(!nav) return;
    try{
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
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));
  else setTimeout(init,250);
})();
