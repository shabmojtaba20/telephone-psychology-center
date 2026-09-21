(()=>{ 
'use strict';

const $=id=>document.getElementById(id);

function setOpen(group,open){
  if(!group)return;
  group.classList.toggle('open',!!open);
  group.classList.toggle('is-open',!!open);
  const title=group.querySelector(':scope>.group-title');
  const sub=group.querySelector(':scope>.sub');
  if(title) title.setAttribute('aria-expanded',String(!!open));
  if(sub){
    sub.setAttribute('aria-hidden',String(!open));
    sub.style.display=open?'block':'none';
    sub.style.visibility=open?'visible':'hidden';
    sub.style.opacity=open?'1':'0';
    sub.style.height=open?'auto':'0';
    sub.style.overflow=open?'visible':'hidden';
  }
}

window.toggleAdminGroup=function(groupOrTitle){
  const group=groupOrTitle?.classList?.contains('group')
    ? groupOrTitle
    : groupOrTitle?.closest?.('.group');
  if(!group)return false;
  const open=!group.classList.contains('is-open')&&!group.classList.contains('open');
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g===group?open:false));
  return false;
};

window.adminNavTo=function(page,button){
  if(!page)return false;
  const allowed=window.__adminAllowedPages;
  if(allowed instanceof Set && !allowed.has('*') && !allowed.has(page)){
    const n=$('notice');
    if(n){
      n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';
      n.className='notice err';
      n.style.display='block';
    }
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
  const current=button?.closest?.('.group');
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,current?g===current:false));
  if(window.matchMedia?.('(max-width:700px)').matches) $('side')?.classList.remove('open');
  if(typeof window.load==='function'){
    try{ window.load(); }catch(e){ console.error('Admin page refresh failed:',e); }
  }
  return false;
};

function init(){
  const nav=document.querySelector('.nav');
  if(!nav)return;

  if(!document.getElementById('admin-nav-final-style')){
    const s=document.createElement('style');
    s.id='admin-nav-final-style';
    s.textContent=
      '.nav .group>.sub{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;overflow:hidden!important}' +
      '.nav .group.is-open>.sub,.nav .group.open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}' +
      '.nav .group>.group-title{touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
      '.nav .sub button[data-page]{pointer-events:auto!important;touch-action:manipulation;position:relative;z-index:1}';
    document.head.appendChild(s);
  }

  nav.querySelectorAll('.group>.group-title').forEach(title=>{
    title.type='button';
    title.setAttribute('aria-haspopup','true');
    if(title.dataset.adminNavBound==='1')return;
    title.dataset.adminNavBound='1';
    title.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      return window.toggleAdminGroup(title);
    };
  });

  nav.querySelectorAll('[data-page]').forEach(button=>{
    button.type='button';
    if(button.dataset.adminNavBound==='1')return;
    button.dataset.adminNavBound='1';
    button.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      return window.adminNavTo(button.dataset.page,button);
    };
  });

  const menu=$('menuBtn');
  if(menu && menu.dataset.adminNavBound!=='1'){
    menu.dataset.adminNavBound='1';
    menu.type='button';
    menu.onclick=e=>{
      e.preventDefault();
      e.stopPropagation();
      $('side')?.classList.toggle('open');
      return false;
    };
  }

  document.querySelectorAll('.nav .group').forEach(g=>{
    setOpen(g,g.classList.contains('open')||g.classList.contains('is-open'));
  });
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();