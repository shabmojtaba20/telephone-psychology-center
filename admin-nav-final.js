(()=>{ 
'use strict';
const $=id=>document.getElementById(id);

function setOpen(group,open){
  if(!group)return;
  group.classList.toggle('open',!!open);
  group.classList.toggle('is-open',!!open);
  const title=group.querySelector('.group-title'),sub=group.querySelector('.sub');
  if(title)title.setAttribute('aria-expanded',String(!!open));
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
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,g===group&&next));
  return false;
}
function navigate(page,button){
  if(!page)return false;
  const allowed=window.__adminAllowedPages;
  if(allowed instanceof Set&&!allowed.has('*')&&!allowed.has(page)){
    const n=$('notice');
    if(n){n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';n.className='notice err';n.style.display='block';}
    return false;
  }
  const section=$(page);
  if(!section)return false;
  document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
  section.classList.add('active');
  document.querySelectorAll('.nav [data-page]').forEach(x=>x.classList.toggle('active',x===button));
  const title=$('title');if(title)title.textContent=(button?.textContent||page).trim()||'پنل مدیریت';
  const group=button?.closest?.('.group');
  document.querySelectorAll('.nav .group').forEach(g=>setOpen(g,!!group&&g===group));
  try{history.replaceState(null,'','#'+encodeURIComponent(page))}catch(_){}
  if(page==='consultants'){
    $('consultants')?.scrollIntoView({block:'start'});
    if(typeof window.load==='function'){
      Promise.resolve(window.load()).then(()=>{
        if(typeof window.loadConsultants==='function')return window.loadConsultants();
      }).catch(e=>console.error('consultants navigation load failed',e));
    }else if(typeof window.loadConsultants==='function'){
      window.loadConsultants();
    }
  }
  if(window.matchMedia?.('(max-width:700px)').matches)$('side')?.classList.remove('open');
  return false;
}
window.toggleAdminGroup=toggleGroup;
window.adminNavTo=navigate;

function init(){
  const nav=document.querySelector('.nav');if(!nav)return;
  if(!document.getElementById('admin-nav-v8-style')){
    const s=document.createElement('style');s.id='admin-nav-v8-style';
    s.textContent='.nav .group>.sub{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;max-height:0!important;overflow:hidden!important}.nav .group.open>.sub,.nav .group.is-open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}.nav .group>.group-title{touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;cursor:pointer}.nav .sub button[data-page]{pointer-events:auto!important;touch-action:manipulation;position:relative;z-index:2}';
    document.head.appendChild(s);
  }
  nav.querySelectorAll('.group>.group-title').forEach(title=>{
    if(title.dataset.adminNavV7Bound==='1')return;
    title.dataset.adminNavV7Bound='1';title.type='button';title.setAttribute('aria-haspopup','true');
    title.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleGroup(title.closest('.group'));},false);
  });
  nav.querySelectorAll('.sub button[data-page]').forEach(button=>{
    if(button.dataset.adminNavV7Bound==='1')return;
    button.dataset.adminNavV7Bound='1';button.type='button';
    button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();navigate(button.dataset.page,button);},false);
  });
  const menu=$('menuBtn');
  if(menu&&!menu.dataset.adminNavV7Bound){
    menu.dataset.adminNavV7Bound='1';menu.type='button';
    menu.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();$('side')?.classList.toggle('open');},false);
  }
  const hash=decodeURIComponent(location.hash.replace(/^#/,''));
  if(hash&&$(hash)&&document.querySelector('.nav [data-page="'+hash+'"]'))navigate(hash,document.querySelector('.nav [data-page="'+hash+'"]'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();