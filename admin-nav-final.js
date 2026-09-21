(()=>{ 
'use strict';

const $=id=>document.getElementById(id);

function setOpen(group,open){
  if(!group)return;
  group.classList.toggle('open',!!open);
  group.classList.toggle('is-open',!!open);
  const title=group.querySelector('.group-title');
  const sub=group.querySelector('.sub');
  if(title) title.setAttribute('aria-expanded',String(!!open));
  if(sub){
    sub.setAttribute('aria-hidden',String(!open));
    sub.style.setProperty('display',open?'block':'none','important');
    sub.style.setProperty('visibility',open?'visible':'hidden','important');
    sub.style.setProperty('opacity',open?'1':'0','important');
    sub.style.setProperty('height',open?'auto':'0','important');
    sub.style.setProperty('max-height',open?'none':'0','important');
    sub.style.setProperty('overflow',open?'visible':'hidden','important');
  }
}

function toggleGroup(group){
  if(!group)return false;
  const next=!group.classList.contains('open')&&!group.classList.contains('is-open');
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g===group?next:false));
  return false;
}

function navigate(page,button){
  if(!page)return false;
  const allowed=window.__adminAllowedPages;
  if(allowed instanceof Set && !allowed.has('*') && !allowed.has(page)){
    const n=$('notice');
    if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}
    return false;
  }
  const section=$(page);
  if(!section){
    console.warn('Admin navigation target not found:',page);
    return false;
  }
  document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
  section.classList.add('active');
  document.querySelectorAll('.nav [data-page]').forEach(x=>x.classList.toggle('active',x===button));
  const title=$('title');
  if(title) title.textContent=(button?.textContent||page).trim()||'پنل مدیریت';
  const group=button?.closest?.('.group');
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,!!group&&g===group));
  if(window.matchMedia?.('(max-width:700px)').matches) $('side')?.classList.remove('open');
  // The page already has its own data loader. Do not call window.load here:
  // window.load may refer to the browser's global load handler and caused
  // unrelated runtime behavior on some deployments.
  if(page==='consultants') $('consultants')?.scrollIntoView({block:'start'});
  return false;
}

window.toggleAdminGroup=toggleGroup;
window.adminNavTo=navigate;

function init(){
  const nav=document.querySelector('.nav');
  if(!nav)return;

  if(!document.getElementById('admin-nav-v3-style')){
    const s=document.createElement('style');
    s.id='admin-nav-v3-style';
    s.textContent=[
      '.nav .group>.sub{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;max-height:0!important;overflow:hidden!important}',
      '.nav .group.open>.sub,.nav .group.is-open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}',
      '.nav .group>.group-title{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none}',
      '.nav .sub button[data-page]{pointer-events:auto!important;touch-action:manipulation;position:relative;z-index:2}'
    ].join('');
    document.head.appendChild(s);
  }

  // Capture at the NAV level so no old inline handler or nested listener
  // can override the final behavior.
  if(nav.dataset.adminNavV3Bound!=='1'){
    nav.dataset.adminNavV3Bound='1';
    nav.addEventListener('click',event=>{
      const title=event.target.closest?.('.group-title');
      if(title && nav.contains(title)){
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleGroup(title.closest('.group'));
        return;
      }
      const button=event.target.closest?.('[data-page]');
      if(button && nav.contains(button)){
        event.preventDefault();
        event.stopImmediatePropagation();
        navigate(button.dataset.page,button);
      }
    },true);
  }

  nav.querySelectorAll('.group>.group-title').forEach(title=>{
    title.type='button';
    title.setAttribute('aria-haspopup','true');
    title.setAttribute('aria-expanded',String(title.closest('.group')?.classList.contains('open')||false));
  });
  nav.querySelectorAll('[data-page]').forEach(button=>button.type='button');

  const menu=$('menuBtn');
  if(menu && menu.dataset.adminNavV3Bound!=='1'){
    menu.dataset.adminNavV3Bound='1';
    menu.type='button';
    menu.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      $('side')?.classList.toggle('open');
    },true);
  }

  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g.classList.contains('open')||g.classList.contains('is-open')));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();