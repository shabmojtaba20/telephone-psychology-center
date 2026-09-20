(()=>{
'use strict';

if(window.__adminNavFinalBoot)return;
window.__adminNavFinalBoot=true;

const $=id=>document.getElementById(id);

function ensureStyle(){
  const id='admin-nav-final-style';
  if(document.getElementById(id))return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
    .nav .group{position:relative}
    .nav .group>.sub{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;overflow:hidden!important}
    .nav .group.is-open>.sub{display:block!important;visibility:visible!important;opacity:1!important;height:auto!important;max-height:none!important;overflow:visible!important}
    .nav .group>.group-title{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .nav .sub button[data-page]{pointer-events:auto!important;touch-action:manipulation}
  `;
  document.head.appendChild(s);
}

function setOpen(group,open){
  if(!group)return;
  group.classList.toggle('open',open);
  group.classList.toggle('is-open',open);
  const title=group.querySelector(':scope>.group-title');
  const sub=group.querySelector(':scope>.sub');
  if(title){
    title.setAttribute('aria-expanded',open?'true':'false');
    title.setAttribute('type','button');
  }
  if(sub){
    sub.setAttribute('aria-hidden',open?'false':'true');
    sub.style.setProperty('display',open?'block':'none','important');
    sub.style.setProperty('visibility',open?'visible':'hidden','important');
    sub.style.setProperty('opacity',open?'1':'0','important');
    sub.style.setProperty('height',open?'auto':'0','important');
  }
}

function switchPage(btn){
  const page=btn?.dataset?.page;
  if(!page)return;

  const allowed=window.__adminAllowedPages;
  if(allowed instanceof Set && !allowed.has('*') && !allowed.has(page)){
    const n=$('notice');
    if(n){
      n.textContent='این بخش برای نقش فعلی شما مجاز نیست.';
      n.className='notice err';
      n.style.display='block';
    }
    return;
  }

  const section=$(page);
  if(!section)return;

  document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
  section.classList.add('active');
  document.querySelectorAll('.nav [data-page]').forEach(x=>x.classList.toggle('active',x===btn));

  const title=$('title');
  if(title)title.textContent=(btn.textContent||'').trim()||'پنل مدیریت';

  const group=btn.closest('.group');
  document.querySelectorAll('.nav .group').forEach(g=>{ if(g!==group)setOpen(g,false); });
  if(group)setOpen(group,true);

  const side=$('side');
  if(side && window.matchMedia && window.matchMedia('(max-width:700px)').matches)side.classList.remove('open');

  if(typeof window.load==='function'){
    try{window.load();}catch(e){console.error('Admin page refresh failed',e);}
  }
}

function replaceControl(old){
  const clone=old.cloneNode(true);
  old.replaceWith(clone);
  return clone;
}

function init(){
  ensureStyle();

  // Final delegated handler: survives other scripts that replace menu buttons.
  if(!window.__adminNavDelegated){
    window.__adminNavDelegated=true;
    document.addEventListener('click',e=>{
      const title=e.target.closest?.('.nav .group>.group-title');
      if(title){
        const group=title.parentElement;
        if(group?.classList.contains('group')){
          e.preventDefault();
          e.stopPropagation();
          setOpen(group,!group.classList.contains('is-open'));
          return;
        }
      }
      const pageBtn=e.target.closest?.('.nav [data-page]');
      if(pageBtn){
        e.preventDefault();
        e.stopPropagation();
        switchPage(pageBtn);
      }
    },true);
  }

  document.querySelectorAll('.nav .group').forEach(group=>{
    const oldTitle=group.querySelector(':scope>.group-title');
    if(!oldTitle)return;
    const title=replaceControl(oldTitle);
    title.setAttribute('type','button');
    title.setAttribute('aria-haspopup','true');
    const initial=group.classList.contains('open')||group.classList.contains('is-open');
    setOpen(group,initial);
    title.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      setOpen(group,!group.classList.contains('is-open'));
    });
  });

  document.querySelectorAll('.nav [data-page]').forEach(oldBtn=>{
    const btn=replaceControl(oldBtn);
    btn.setAttribute('type','button');
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      switchPage(btn);
    });
  });

  const oldMenu=$('menuBtn');
  if(oldMenu){
    const menu=replaceControl(oldMenu);
    menu.setAttribute('type','button');
    menu.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const side=$('side');
      if(side)side.classList.toggle('open');
    });
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();